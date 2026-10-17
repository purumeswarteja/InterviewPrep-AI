import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Profile from './models/Profile.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/interviewprep';
const BASE_URL = 'http://localhost:4000';

async function runTests() {
  console.log('🧪 Starting Comprehensive Email Verification & OTP Test Suite...\n');

  // Test 1: Signup Validation
  console.log('Test 1: Signup Input Validation (Missing fields & weak password)');
  {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad-email', password: '123', full_name: '' })
    });
    const data = await res.json();
    if (res.status === 400 && data.error) {
      console.log('  ✅ Passed: Rejected invalid signup inputs:', data.error);
    } else {
      throw new Error(`Failed Test 1: ${JSON.stringify(data)}`);
    }
  }

  // Test 2: Successful Signup with OTP generation
  const testEmail = `test_otp_${Date.now()}@example.com`;
  const testPassword = 'Password123';
  const testName = 'Test Candidate';

  console.log(`\nTest 2: Successful Signup for ${testEmail}`);
  {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword, full_name: testName })
    });
    const data = await res.json();
    if (res.status === 200 && data.requiresVerification && !data.token) {
      console.log('  ✅ Passed: Account created in unverified state, OTP dispatched');
    } else {
      throw new Error(`Failed Test 2: ${JSON.stringify(data)}`);
    }

    // Inspect MongoDB to verify OTP is NEVER stored in plain text
    const dbUser = await User.findOne({ email: testEmail });
    if (!dbUser) throw new Error('User not found in DB');
    if (dbUser.isEmailVerified !== false) throw new Error('isEmailVerified should be false');
    if (!dbUser.otpHash || dbUser.otpHash.length < 20) throw new Error('otpHash should be a hashed string');
    if (dbUser.otpHash.length === 6) throw new Error('SECURITY VIOLATION: OTP stored in plain text!');
    console.log('  ✅ Passed DB Check: OTP is securely hashed with bcrypt (length: ' + dbUser.otpHash.length + ')');
    console.log('  ✅ Passed DB Check: isEmailVerified is correctly false');
  }

  // Test 3: Login before verification must be blocked
  console.log('\nTest 3: Attempting Login with Unverified Account');
  {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const data = await res.json();
    if (res.status === 403 && data.requiresVerification && !data.token) {
      console.log('  ✅ Passed: Login blocked with 403 and requiresVerification: true');
    } else {
      throw new Error(`Failed Test 3: ${JSON.stringify(data)}`);
    }
  }

  // Test 4: Incorrect OTP rejection
  console.log('\nTest 4: Submitting Incorrect OTP');
  {
    const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: '000000' })
    });
    const data = await res.json();
    if (res.status === 400 && data.error && data.remainingAttempts !== undefined) {
      console.log(`  ✅ Passed: Rejected incorrect OTP. (${data.error})`);
    } else {
      throw new Error(`Failed Test 4: ${JSON.stringify(data)}`);
    }
  }

  // Test 5: Resend OTP cooldown enforcement (requesting immediately should return 429)
  console.log('\nTest 5: Resend OTP Cooldown (60s limit)');
  {
    const res = await fetch(`${BASE_URL}/api/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const data = await res.json();
    if (res.status === 429 && data.secondsRemaining > 0) {
      console.log(`  ✅ Passed: Rate-limited with 429 (${data.secondsRemaining}s cooldown remaining)`);
    } else {
      throw new Error(`Failed Test 5: ${JSON.stringify(data)}`);
    }
  }

  // Test 6: Expired OTP rejection
  console.log('\nTest 6: Expired OTP rejection');
  {
    // Force expiry in DB
    await User.updateOne({ email: testEmail }, { otpExpiresAt: new Date(Date.now() - 1000) });
    const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: '123456' })
    });
    const data = await res.json();
    if (res.status === 400 && data.expired) {
      console.log('  ✅ Passed: Expired OTP rejected with expired: true');
    } else {
      throw new Error(`Failed Test 6: ${JSON.stringify(data)}`);
    }
  }

  // Test 7: Successful OTP verification with valid code
  console.log('\nTest 7: Successful OTP Verification');
  let authToken = null;
  {
    // Set a known OTP and verify hash comparison
    const knownOtp = '742918';
    const hashedKnown = await bcrypt.hash(knownOtp, 10);
    await User.updateOne(
      { email: testEmail },
      {
        otpHash: hashedKnown,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        otpAttempts: 0
      }
    );

    const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: knownOtp })
    });
    const data = await res.json();
    if (res.status === 200 && data.token && data.user?.isEmailVerified === true) {
      authToken = data.token;
      console.log('  ✅ Passed: Successfully verified! JWT issued, isEmailVerified: true');
    } else {
      throw new Error(`Failed Test 7: ${JSON.stringify(data)}`);
    }

    // Verify DB state after verification
    const dbUser = await User.findOne({ email: testEmail });
    if (dbUser.isEmailVerified !== true) throw new Error('isEmailVerified should be true');
    if (dbUser.otpHash !== null) throw new Error('otpHash should be cleared after verification');
    console.log('  ✅ Passed DB Check: otpHash cleared and isEmailVerified marked true in MongoDB');
  }

  // Test 8: Login with newly verified account
  console.log('\nTest 8: Login with Verified Account');
  {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const data = await res.json();
    if (res.status === 200 && data.token && data.user?.isEmailVerified === true) {
      console.log('  ✅ Passed: Verified user successfully logged in with active JWT');
    } else {
      throw new Error(`Failed Test 8: ${JSON.stringify(data)}`);
    }
  }

  // Test 9: Duplicate email prevention for verified account
  console.log('\nTest 9: Duplicate Signup Prevention for Verified User');
  {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword, full_name: 'Imposter' })
    });
    const data = await res.json();
    if (res.status === 400 && data.error && data.error.includes('already registered')) {
      console.log('  ✅ Passed: Duplicate signup blocked:', data.error);
    } else {
      throw new Error(`Failed Test 9: ${JSON.stringify(data)}`);
    }
  }

  // Test 10: Change Email Flow with OTP
  console.log('\nTest 10: Change Email Flow with OTP Verification');
  {
    const newEmailTarget = `updated_${Date.now()}@example.com`;

    // Step A: Request email change
    const reqRes = await fetch(`${BASE_URL}/api/auth/change-email/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ newEmail: newEmailTarget })
    });
    const reqData = await reqRes.json();
    if (reqRes.status !== 200 || !reqData.success) {
      throw new Error(`Failed email change request: ${JSON.stringify(reqData)}`);
    }
    console.log(`  ✅ Passed: Email change requested for ${newEmailTarget}`);

    // Check DB has pendingEmail and pendingEmailOtpHash
    const userPending = await User.findOne({ email: testEmail });
    if (userPending.pendingEmail !== newEmailTarget) throw new Error('pendingEmail mismatch');
    if (!userPending.pendingEmailOtpHash) throw new Error('pendingEmailOtpHash missing');
    console.log('  ✅ Passed DB Check: pendingEmail stored and pending OTP securely hashed');

    // Step B: Set known OTP and verify
    const knownEmailChangeOtp = '583192';
    userPending.pendingEmailOtpHash = await bcrypt.hash(knownEmailChangeOtp, 10);
    userPending.pendingEmailOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await userPending.save();

    const verifyRes = await fetch(`${BASE_URL}/api/auth/change-email/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ otp: knownEmailChangeOtp })
    });
    const verifyData = await verifyRes.json();
    if (verifyRes.status === 200 && verifyData.user?.email === newEmailTarget) {
      console.log(`  ✅ Passed: Email successfully changed to ${newEmailTarget}`);
    } else {
      throw new Error(`Failed email change verify: ${JSON.stringify(verifyData)}`);
    }

    // Verify DB state
    const userUpdated = await User.findOne({ email: newEmailTarget });
    if (!userUpdated) throw new Error('User not found under new email');
    if (userUpdated.pendingEmail !== null) throw new Error('pendingEmail was not cleared');
    console.log('  ✅ Passed DB Check: Email updated and pending fields cleared');
  }

  // Test 11: Existing Users Safety Check
  console.log('\nTest 11: Existing Accounts Safety Check');
  {
    // Find an existing user or create a simulated legacy user with undefined isEmailVerified
    const legacyEmail = `legacy_${Date.now()}@example.com`;
    const hashed = await bcrypt.hash('LegacyPassword1', 10);
    await User.create({
      id: `legacy-${Date.now()}`,
      email: legacyEmail,
      password: hashed,
      // isEmailVerified intentionally omitted to simulate legacy DB record
    });

    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: legacyEmail, password: 'LegacyPassword1' })
    });
    const data = await res.json();
    if (res.status === 403 && data.requiresVerification === true) {
      console.log('  ✅ Passed: Legacy account safely detected as unverified and prompted to verify');
    } else {
      throw new Error(`Failed legacy user test: ${JSON.stringify(data)}`);
    }

    // Clean up test users
    await User.deleteMany({ email: { $in: [testEmail, legacyEmail] } });
  }

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! Everything is secure and functioning correctly.\n');
  process.exit(0);
}

// Connect to DB and run
mongoose.connect(MONGODB_URI)
  .then(runTests)
  .catch((err) => {
    console.error('Test suite error:', err);
    process.exit(1);
  });
