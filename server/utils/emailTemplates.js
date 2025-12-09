export const emailVerificationTemplate = (name, token) => {
  const url = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Welcome to MentorConnect, ${name}!</h2>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <a href="${url}" class="button">Verify Email</a>
          <p>Or copy and paste this link into your browser:</p>
          <p>${url}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      </body>
    </html>
  `;
};

export const passwordResetTemplate = (name, token) => {
  const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <a href="${url}" class="button">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p>${url}</p>
          <p>This link will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      </body>
    </html>
  `;
};

