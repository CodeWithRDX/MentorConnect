import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Helper: set auth cookie ───────────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = user.generateToken();

  const cookieOptions = {
    expires: new Date(Date.now() + (process.env.COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: {
        _id: user._id,
        id:  user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
        bio:    user.bio,
        phone:  user.phone,
        socialLinks: user.socialLinks,
        preferences: user.preferences,
        mentorProfile: user.mentorProfile,
        oauthProviders: (user.oauthProviders || []).map(p => ({ provider: p.provider })),
      },
      token,
    },
  });
};

/**
 * @desc    Google OAuth — sign in or sign up
 * @route   POST /api/auth/oauth/google
 * @access  Public
 *
 * Accepts two flows:
 *  1. ID token flow  — { credential: <google id token> }      (from @react-oauth/google GoogleLogin button)
 *  2. Access token flow — { credential: <access_token>, _googleUserInfo: { sub, email, name, picture } }
 *     (from @react-oauth/google useGoogleLogin hook)
 */
export const googleOAuth = async (req, res, next) => {
  try {
    const { credential, role, _googleUserInfo } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' });
    }

    let googleId, email, name, picture, email_verified;

    // ── Flow 1: ID token (from GoogleLogin button component) ─────────────────
    if (!_googleUserInfo) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken:  credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        ({ sub: googleId, email, name, picture, email_verified } = payload);
      } catch {
        return res.status(401).json({ success: false, message: 'Invalid Google token' });
      }
    }

    // ── Flow 2: Access token + user info (from useGoogleLogin hook) ──────────
    if (_googleUserInfo) {
      // Verify the access token by fetching userinfo from Google
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${credential}` },
        });
        if (!userInfoRes.ok) throw new Error('Failed to verify access token');
        const userInfo = await userInfoRes.json();
        googleId       = userInfo.sub;
        email          = userInfo.email;
        name           = userInfo.name;
        picture        = userInfo.picture;
        email_verified = userInfo.email_verified;
      } catch {
        return res.status(401).json({ success: false, message: 'Failed to verify Google access token' });
      }
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'Could not retrieve email from Google account' });
    }

    // ── Find or create user ──────────────────────────────────────────────────
    let user = await User.findOne({
      'oauthProviders.provider': 'google',
      'oauthProviders.providerId': googleId,
    }).populate('mentorProfile');

    if (!user) {
      // Try finding by email to link an existing account
      user = await User.findOne({ email: email.toLowerCase() }).populate('mentorProfile');

      if (user) {
        // Link Google OAuth to existing account
        const alreadyLinked = (user.oauthProviders || []).some(p => p.provider === 'google');
        if (!alreadyLinked) {
          user.oauthProviders = user.oauthProviders || [];
          user.oauthProviders.push({ provider: 'google', providerId: googleId, email });
        }
        if (!user.avatar && picture) user.avatar = picture;
        if (!user.isEmailVerified && email_verified) user.isEmailVerified = true;
      } else {
        // Create new user account
        const requestedRole = role && ['mentee', 'mentor'].includes(role) ? role : 'mentee';

        user = await User.create({
          name:    name || email.split('@')[0],
          email:   email.toLowerCase(),
          role:    requestedRole,
          avatar:  picture || '',
          isEmailVerified: email_verified || false,
          oauthProviders: [{ provider: 'google', providerId: googleId, email }],
        });
      }
    }

    // Update login tracking
    user.lastLoginAt = new Date();
    user.loginCount  = (user.loginCount || 0) + 1;
    await user.save({ validateBeforeSave: false });

    // Admins cannot log in via user OAuth portal
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts must log in via the admin portal.',
      });
    }

    sendTokenResponse(user, 200, res, 'Google sign-in successful');
  } catch (error) {
    next(error);
  }
};
