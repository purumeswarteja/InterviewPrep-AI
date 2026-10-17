import { Resend } from 'resend';

let resendClient = null;

/**
 * Check if Resend email delivery is configured
 */
export const isEmailServiceConfigured = () => {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim());
};

/**
 * Get or initialize the Resend SDK client
 */
export const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
};

/**
 * Send OTP Verification Email using the Resend SDK
 * @param {string} toEmail - Recipient email
 * @param {string} otp - 6-digit numeric string
 * @param {'signup' | 'login' | 'change_email'} type - Verification purpose
 * @returns {Promise<{ success: boolean, messageId: string }>}
 */
export const sendOtpEmail = async (toEmail, otp, type = 'signup') => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error('❌ Resend Error: RESEND_API_KEY is missing in backend/.env');
    throw new Error('Email delivery is not configured. Please set RESEND_API_KEY in your backend/.env file.');
  }

  // Read EMAIL_FROM from environment, defaulting to standard Resend onboarding domain if unset
  const fromAddress = process.env.EMAIL_FROM || process.env.RESEND_FROM || 'InterPrep AI <onboarding@resend.dev>';

  let subject = 'Verify your email - InterPrep AI';
  let title = 'Verify Your Email Address';
  let description = 'Thank you for signing up for InterPrep AI. Use the verification code below to activate your account and begin your AI interview practice.';

  if (type === 'login') {
    subject = 'Email Verification Required - InterPrep AI';
    title = 'Verify Your Account to Log In';
    description = 'Your account requires email verification before accessing your interview workspace. Enter this verification code to complete sign in.';
  } else if (type === 'change_email') {
    subject = 'Verify Your New Email - InterPrep AI';
    title = 'Confirm New Email Address';
    description = 'You requested to update your email address on InterPrep AI. Enter this verification code to confirm and update your account email.';
  } else if (type === 'change_password') {
    subject = 'Password Reset Code - InterPrep AI';
    title = 'Change Account Password';
    description = 'You requested to change your password for InterPrep AI. Enter the verification code below to securely update your account password.';
  } else if (type === 'delete_account') {
    subject = 'Account Deletion Verification Code - InterPrep AI';
    title = 'Confirm Permanent Account Deletion';
    description = 'You requested to permanently delete your InterPrep AI account. Enter the verification code below to confirm deletion. WARNING: This action is irreversible.';
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f7f9; margin: 0; padding: 24px; color: #1f2333; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #eceef2; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #0c8f63 0%, #0d5b44 100%); padding: 32px 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { color: #d6f8e9; margin: 6px 0 0; font-size: 13px; font-weight: 500; }
        .content { padding: 36px 32px; }
        .greeting { font-size: 18px; font-weight: 600; color: #0c0f1a; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #5d6880; margin-bottom: 28px; }
        .code-box { background: #eefcf5; border: 2px dashed #3ccd93; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 28px; }
        .code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0c7253; display: inline-block; }
        .notice { font-size: 12px; color: #7e899e; text-align: center; margin-top: 8px; }
        .security-note { background: #f6f7f9; border-radius: 8px; padding: 12px 16px; font-size: 12px; color: #5d6880; line-height: 1.5; margin-top: 24px; }
        .footer { padding: 20px 32px; background: #f6f7f9; border-top: 1px solid #eceef2; text-align: center; font-size: 12px; color: #7e899e; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>InterPrep AI</h1>
          <p>Next-Gen AI Interview Coaching &amp; Preparation</p>
        </div>
        <div class="content">
          <div class="greeting">${title}</div>
          <div class="text">${description}</div>
          <div class="code-box">
            <div class="code">${otp}</div>
            <div class="notice">This code expires in 10 minutes.</div>
          </div>
          <div class="security-note">
            <strong>Security Notice:</strong> Never share this code with anyone. InterPrep AI support will never ask for your verification code. If you did not initiate this request, you can safely ignore this email.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} InterPrep AI. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `${title}\n\n${description}\n\nYour Verification Code: ${otp}\n(This code expires in 10 minutes)\n\nSecurity Notice: If you did not request this, please ignore this email.`;

  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [toEmail],
      subject,
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      console.error(`❌ Resend API returned an error for ${toEmail}:`, error.message || error);
      throw new Error(error.message || 'Failed to dispatch email through Resend.');
    }

    if (!data?.id) {
      throw new Error('Resend did not return a message confirmation ID.');
    }

    console.log(`📧 OTP email successfully dispatched via Resend to ${toEmail} [ID: ${data.id}]`);
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error(`❌ Resend Delivery Error (${toEmail}):`, err.message);
    throw new Error(`Email delivery failed: ${err.message}`);
  }
};
