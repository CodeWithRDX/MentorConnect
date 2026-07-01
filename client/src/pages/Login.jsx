import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from '../components/ui/toaster';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import api from '../utils/api';

const Login = ({ title, subtitle }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading,  setLoading]  = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const redirectByRole = (userData) => {
    if (userData?.role === 'admin' || userData?.role === 'sub_admin') {
      navigate('/admin/dashboard');
    } else if (userData?.role === 'mentor') {
      navigate('/mentor/dashboard');
    } else {
      navigate('/mentee/dashboard');
    }
  };

  // ── Email / Password Login ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user: userData } = await login(formData.email, formData.password);
      toast('Login successful!', 'success');
      redirectByRole(userData);
    } catch (error) {
      toast(error.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth Login ──────────────────────────────────────────────────────
  const handleGoogleSuccess = async (tokenResponse) => {
    setGLoading(true);
    try {
      // Exchange access token for user info, then send to backend
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const userInfo = await userInfoRes.json();

      // Call loginWithGoogle from AuthContext to sync context state
      const { user: userData } = await loginWithGoogle(tokenResponse.access_token, null, userInfo);

      toast('Signed in with Google!', 'success');
      redirectByRole(userData);
    } catch (error) {
      toast(error.response?.data?.message || 'Google sign-in failed', 'error');
    } finally {
      setGLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError:   () => toast('Google sign-in was cancelled or failed', 'error'),
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gradient-to-b from-blue-50 to-white dark:from-neutral-900 dark:to-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl font-bold text-foreground mb-6">
                {title || <>Welcome Back to<br />MentorConnect</>}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {subtitle || "Sign in to your account and connect with expert mentors. Get personalized guidance tailored to your entrepreneurial journey."}
              </p>

              {/* Login Form Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-card text-card-foreground rounded-2xl shadow-xl p-8 border border-border"
              >
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                    <Input
                      id="email" name="email" type="email"
                      placeholder="you@example.com"
                      value={formData.email} onChange={handleChange}
                      required className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                    <Input
                      id="password" name="password" type="password"
                      placeholder="••••••••"
                      value={formData.password} onChange={handleChange}
                      required className="h-12 text-base"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="w-full h-12 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</>
                    ) : (
                      <>Sign In <ArrowRight className="h-5 w-5" /></>
                    )}
                  </button>

                  {/* ── Divider ── */}
                  <div className="relative flex items-center gap-3 py-1">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground font-medium">OR</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* ── Google OAuth Button ── */}
                  <button
                    type="button"
                    onClick={() => googleLogin()}
                    disabled={gLoading}
                    className="w-full h-12 flex items-center justify-center gap-3 border border-border rounded-lg bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition font-semibold text-sm text-foreground shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {gLoading ? (
                      <span className="w-5 h-5 border-2 border-neutral-300 border-t-blue-600 rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                    Continue with Google
                  </button>

                  <div className="text-center text-sm text-muted-foreground pt-1">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                      Sign up now
                    </Link>
                  </div>
                </form>
              </motion.div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl h-96">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&h=500&fit=crop"
                  alt="Mentorship session"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-card border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Active Mentors' },
              { value: '10,000+', label: 'Entrepreneurs' },
              { value: '50,000+', label: 'Sessions Completed' },
              { value: '95%', label: 'Satisfaction Rate' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
