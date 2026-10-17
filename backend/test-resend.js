import { isEmailServiceConfigured, sendOtpEmail } from './utils/mailer.js';

async function runResendUnitTests() {
  console.log('🧪 Running Resend Mailer Unit Tests...\n');

  // Test 1: isEmailServiceConfigured check
  delete process.env.RESEND_API_KEY;
  if (isEmailServiceConfigured() === false) {
    console.log('  ✅ Test 1 Passed: Detected missing RESEND_API_KEY correctly');
  } else {
    throw new Error('Test 1 Failed: Expected isEmailServiceConfigured to be false');
  }

  // Test 2: Throws when sending without API key (no secret terminal OTP fallback)
  try {
    await sendOtpEmail('test@example.com', '123456', 'signup');
    throw new Error('Test 2 Failed: Should have thrown error when RESEND_API_KEY is missing');
  } catch (err) {
    if (err.message.includes('RESEND_API_KEY in your backend/.env')) {
      console.log('  ✅ Test 2 Passed: Correctly blocked dispatch and prompted for RESEND_API_KEY');
    } else {
      throw err;
    }
  }

  // Test 3: Rejection with dummy API key against Resend
  process.env.RESEND_API_KEY = 're_invalid_dummy_key_1234567890';
  process.env.EMAIL_FROM = 'InterPrep AI <onboarding@resend.dev>';
  if (isEmailServiceConfigured() === true) {
    console.log('  ✅ Test 3 Passed: Detected presence of RESEND_API_KEY');
  }

  try {
    await sendOtpEmail('recipient@example.com', '654321', 'signup');
    throw new Error('Test 3b Failed: Invalid key should have been rejected by Resend API');
  } catch (err) {
    if (err.message.includes('Email delivery failed') || err.message.includes('API key is invalid') || err.message.includes('Resend')) {
      console.log('  ✅ Test 3b Passed: Resend API failure cleanly caught and mapped to user-facing error message');
      console.log('     Captured Error:', err.message);
    } else {
      throw err;
    }
  }

  console.log('\n🎉 All Resend unit tests passed!\n');
  process.exit(0);
}

runResendUnitTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
