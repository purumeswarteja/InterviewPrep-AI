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

  // Print OTP to terminal so local developers can verify without waiting for email delivery
  console.log(`🔐 [AUTH OTP] (${type}) Verification Code for ${toEmail}: ${otp}`);

  try {
    const resend = getResendClient();
    // Resend sandbox (onboarding@resend.dev) requires test/mock emails to use delivered@resend.dev
    const isMockDomain = toEmail.endsWith('@example.com') || toEmail.endsWith('@test.com') || toEmail.endsWith('.invalid');
    const recipient = isMockDomain ? 'delivered@resend.dev' : toEmail;

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [recipient],
      subject,
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      console.error(`❌ Resend API returned an error for ${toEmail}:`, error.message || error);
      // In local development, if Resend sandbox restricts to account owner's email, allow dev flow to proceed
      if (error.message?.includes('You can only send testing emails to your own email address')) {
        console.warn(`⚠️ [Resend Sandbox Restriction]: To send to external emails, verify a custom domain at resend.com/domains.`);
        console.warn(`💡 Development fallback: OTP for ${toEmail} is [${otp}].`);
        return { success: true, messageId: `dev-sandbox-${Date.now()}`, isSandboxFallback: true };
      }
      throw new Error(error.message || 'Failed to dispatch email through Resend.');
    }

    if (!data?.id) {
      throw new Error('Resend did not return a message confirmation ID.');
    }

    console.log(`📧 OTP email successfully dispatched via Resend to ${toEmail} [ID: ${data.id}]`);
    return { success: true, messageId: data.id };
  } catch (err) {
    if (err.message?.includes('You can only send testing emails to your own email address')) {
      console.warn(`⚠️ [Resend Sandbox Restriction]: To send to external emails, verify a custom domain at resend.com/domains.`);
      console.warn(`💡 Development fallback: OTP for ${toEmail} is [${otp}].`);
      return { success: true, messageId: `dev-sandbox-${Date.now()}`, isSandboxFallback: true };
    }
    console.error(`❌ Resend Delivery Error (${toEmail}):`, err.message);
    throw new Error(`Email delivery failed: ${err.message}`);
  }
};

/**
 * Send Weekly Goal Reached Email Notification
 */
export const sendWeeklyGoalReachedEmail = async (toEmail, { name = 'there', weeklyGoal = 5, completedSessions = 5 } = {}) => {
  const fromAddress = process.env.EMAIL_FROM || process.env.RESEND_FROM || 'InterPrep AI <onboarding@resend.dev>';
  const subject = '🎯 Goal Achieved! You hit your weekly interview practice goal!';
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f7f9; margin: 0; padding: 24px; color: #1f2333; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #eceef2; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #0c8f63 0%, #06a5f1 100%); padding: 32px 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; }
        .header p { color: #e6fcf5; margin: 6px 0 0; font-size: 14px; }
        .content { padding: 36px 32px; }
        .greeting { font-size: 20px; font-weight: 700; color: #0c0f1a; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #5d6880; margin-bottom: 24px; }
        .stat-card { background: #eefcf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
        .stat-number { font-size: 32px; font-weight: 800; color: #0c8f63; }
        .stat-label { font-size: 13px; font-weight: 600; color: #047857; margin-top: 4px; }
        .footer { padding: 20px 32px; background: #f6f7f9; border-top: 1px solid #eceef2; text-align: center; font-size: 12px; color: #7e899e; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 Goal Crushed!</h1>
          <p>InterPrep AI Weekly Milestone</p>
        </div>
        <div class="content">
          <div class="greeting">Way to go, ${name}! 🎉</div>
          <div class="text">
            Congratulations! You have successfully completed <strong>${completedSessions} interview sessions</strong> this week, officially hitting your target of <strong>${weeklyGoal}</strong> sessions!
          </div>
          <div class="stat-card">
            <div class="stat-number">${completedSessions} / ${weeklyGoal}</div>
            <div class="stat-label">Weekly Practice Goal Completed 🚀</div>
          </div>
          <div class="text">
            Consistent mock interviews and active recall are the highest-leverage ways to ace technical and behavioral rounds. Keep up the phenomenal work!
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} InterPrep AI.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const resend = getResendClient();
    if (!resend) return { skipped: true, reason: 'Email service not configured' };
    const isMockDomain = toEmail.endsWith('@example.com') || toEmail.endsWith('@test.com') || toEmail.endsWith('.invalid');
    const recipient = isMockDomain ? 'delivered@resend.dev' : toEmail;
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [recipient],
      subject,
      html: htmlContent,
      text: `Congratulations ${name}! You reached your weekly interview goal of ${weeklyGoal} sessions!`,
    });
    if (error) {
      console.warn('Resend goal email warning:', error.message || error);
      return { success: false, error: error.message };
    }
    console.log(`📧 Weekly goal notification sent to ${toEmail} [ID: ${data?.id}]`);
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.warn(`Resend goal email error (${toEmail}):`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send Daily Practice Reminder & Tips Email Notification
 */
export const sendDailyPracticeReminderEmail = async (toEmail, { name = 'there', tip = null } = {}) => {
  const fromAddress = process.env.EMAIL_FROM || process.env.RESEND_FROM || 'InterPrep AI <onboarding@resend.dev>';
  const defaultTips = [
    {
      title: "Use the STAR Method for Behavioral Questions",
      content: "Structure stories using Situation, Task, Action, and Result. Dedicate 70% of your time to your personal Action and the measurable Result!"
    },
    {
      title: "Think Out Loud in Technical Rounds",
      content: "Interviewers want to see your problem-solving process. Communicate your edge cases, trade-offs, and thoughts before jumping straight into code."
    },
    {
      title: "The 90-Second 'Tell Me About Yourself'",
      content: "Use Present-Past-Future: current role/focus, 1-2 major standout achievements, and why this exact opportunity is your next step."
    },
    {
      title: "Always Clarify Assumptions First",
      content: "Before solving a system design or algorithmic challenge, clarify data bounds, scale, and expected constraints."
    }
  ];

  const selectedTip = tip || defaultTips[Math.floor(Math.random() * defaultTips.length)];
  const subject = `💡 Daily Interview Practice Reminder + Tip: ${selectedTip.title}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f7f9; margin: 0; padding: 24px; color: #1f2333; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #eceef2; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #1f2333 0%, #323748 100%); padding: 32px 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
        .header p { color: #cbd5e1; margin: 6px 0 0; font-size: 13px; }
        .content { padding: 36px 32px; }
        .greeting { font-size: 18px; font-weight: 700; color: #0c0f1a; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #5d6880; margin-bottom: 24px; }
        .tip-box { background: #eff9ff; border-left: 4px solid #0084d1; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; }
        .tip-title { font-size: 14px; font-weight: 700; color: #072f4a; margin-bottom: 6px; }
        .tip-body { font-size: 13px; line-height: 1.5; color: #3a5369; margin: 0; }
        .footer { padding: 20px 32px; background: #f6f7f9; border-top: 1px solid #eceef2; text-align: center; font-size: 12px; color: #7e899e; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚡ Daily Practice Reminder</h1>
          <p>Keep your interview skills sharp</p>
        </div>
        <div class="content">
          <div class="greeting">Hey ${name}! 👋</div>
          <div class="text">
            We noticed you haven't practiced today yet. Taking just 5–10 minutes for an AI mock interview or aptitude exercise keeps your streak alive and builds confidence!
          </div>
          <div class="tip-box">
            <div class="tip-title">💡 Today's Interview Tip: ${selectedTip.title}</div>
            <p class="tip-body">${selectedTip.content}</p>
          </div>
          <div class="text">
            Log in today to keep your daily streak going and ace your upcoming interviews!
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} InterPrep AI.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const resend = getResendClient();
    if (!resend) return { skipped: true, reason: 'Email service not configured' };
    const isMockDomain = toEmail.endsWith('@example.com') || toEmail.endsWith('@test.com') || toEmail.endsWith('.invalid');
    const recipient = isMockDomain ? 'delivered@resend.dev' : toEmail;
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [recipient],
      subject,
      html: htmlContent,
      text: `Hey ${name}!\n\nJust a quick reminder to practice today.\n\nTip: ${selectedTip.title}\n${selectedTip.content}\n\nLog in today to continue your practice!`,
    });
    if (error) {
      console.warn('Resend reminder email warning:', error.message || error);
      return { success: false, error: error.message };
    }
    console.log(`📧 Daily practice reminder sent to ${toEmail} [ID: ${data?.id}]`);
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.warn(`Resend reminder email error (${toEmail}):`, err.message);
    return { success: false, error: err.message };
  }
};
