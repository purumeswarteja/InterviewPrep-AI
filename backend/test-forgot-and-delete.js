import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Profile from './models/Profile.js';
import InterviewSession from './models/InterviewSession.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/interviewprep';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const BASE_URL = 'http://localhost:4000';

async function runTests() {
  console.log('🧪 Starting Forgot Password & Account Deletion OTP Tests...\n');

  const testEmail = `recovery_${Date.now()}@example.com`;
  const initialPassword = 'InitialPassword123';
  const newPassword = 'BrandNewPassword888';
  const userId = `user-rec-${Date.now()}`;

  // Step 1: Create test user
  const hashedPassword = await bcrypt.hash(initialPassword, 10);
  await User.create({
    id: userId,
    email: testEmail,
    password: hashedPassword,
    isEmailVerified: true,
  });

  await Profile.create({
    id: `prof-${Date.now()}`,
    user_id: userId,
    full_name: 'Recovery Test User',
  });

  await InterviewSession.create({
    id: `sess-${Date.now()}`,
    user_id: userId,
    type: 'mock',
    topic: 'Testing',
  });

  const token = jwt.sign({ userId, email: testEmail, isEmailVerified: true }, JWT_SECRET, { expiresIn: '1h' });

  // ─── Test Suite A: Forgot Password (Unauthenticated) ─────────────────────────
  console.log('Test A1: Reject forgot password request for nonexistent email');
  {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent_random_12345@example.com' }),
    });
    const data = await res.json();
    if (res.status === 404 && data.error && data.error.includes('No account found')) {
      console.log('  ✅ Passed A1: Nonexistent email returned 404 error');
    } else {
      throw new Error(`Failed Test A1: ${JSON.stringify(data)}`);
    }
  }

  console.log('\nTest A2: Request forgot password OTP for existing user');
  {
    // Seed known OTP for deterministic test
    const knownForgotOtp = '758192';
    const hashedOtp = await bcrypt.hash(knownForgotOtp, 10);
    await User.updateOne(
      { email: testEmail },
      {
        passwordResetOtpHash: hashedOtp,
        passwordResetOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        passwordResetOtpAttempts: 0,
        passwordResetOtpLastSentAt: new Date(),
      }
    );

    // Test A3: Reject incorrect OTP
    console.log('\nTest A3: Reject incorrect OTP for forgot password');
    const wrongRes = await fetch(`${BASE_URL}/api/auth/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: '000000' }),
    });
    const wrongData = await wrongRes.json();
    if (wrongRes.status === 400 && wrongData.error && wrongData.error.includes('Invalid verification code')) {
      console.log('  ✅ Passed A3: Incorrect OTP rejected properly');
    } else {
      throw new Error(`Failed Test A3: ${JSON.stringify(wrongData)}`);
    }

    // Test A4: Verify correct OTP
    console.log('\nTest A4: Verify correct OTP and receive resetToken');
    const verifyRes = await fetch(`${BASE_URL}/api/auth/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: knownForgotOtp }),
    });
    const verifyData = await verifyRes.json();
    if (verifyRes.status === 200 && verifyData.resetToken) {
      console.log('  ✅ Passed A4: Correct OTP verified, resetToken issued');
    } else {
      throw new Error(`Failed Test A4: ${JSON.stringify(verifyData)}`);
    }

    // Test A5: Reset password with resetToken
    console.log('\nTest A5: Reset password with resetToken and newPassword');
    const resetRes = await fetch(`${BASE_URL}/api/auth/forgot-password/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        resetToken: verifyData.resetToken,
        newPassword,
      }),
    });
    const resetData = await resetRes.json();
    if (resetRes.status === 200 && resetData.success && resetData.token && resetData.user) {
      console.log('  ✅ Passed A5: Password reset successfully and direct auth token issued!');
    } else {
      throw new Error(`Failed Test A5: ${JSON.stringify(resetData)}`);
    }

    // Test A6: Sign in with the new password
    console.log('\nTest A6: Sign in with newly reset password');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: newPassword }),
    });
    const loginData = await loginRes.json();
    if (loginRes.status === 200 && loginData.token) {
      console.log('  ✅ Passed A6: User successfully signed in with new password!');
    } else {
      throw new Error(`Failed Test A6: ${JSON.stringify(loginData)}`);
    }
  }

  // ─── Test Suite B: Account Deletion with OTP (Authenticated) ─────────────────
  console.log('\nTest B1: Account Deletion OTP Verification');
  {
    const deleteOtp = '641928';
    const hashedDeleteOtp = await bcrypt.hash(deleteOtp, 10);
    await User.updateOne(
      { id: userId },
      {
        deleteAccountOtpHash: hashedDeleteOtp,
        deleteAccountOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        deleteAccountOtpAttempts: 0,
        deleteAccountOtpLastSentAt: new Date(),
      }
    );

    // Reject wrong deletion code
    console.log('\nTest B2: Reject wrong account deletion code');
    const wrongDeleteRes = await fetch(`${BASE_URL}/api/auth/delete-account/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ otp: '111111' }),
    });
    const wrongDeleteData = await wrongDeleteRes.json();
    if (wrongDeleteRes.status === 400 && wrongDeleteData.error && wrongDeleteData.error.includes('Invalid verification code')) {
      console.log('  ✅ Passed B2: Incorrect deletion code rejected');
    } else {
      throw new Error(`Failed Test B2: ${JSON.stringify(wrongDeleteData)}`);
    }

    // Confirm deletion with correct code
    console.log('\nTest B3: Confirm permanent deletion with correct code');
    const confirmDeleteRes = await fetch(`${BASE_URL}/api/auth/delete-account/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ otp: deleteOtp }),
    });
    const confirmDeleteData = await confirmDeleteRes.json();
    if (confirmDeleteRes.status === 200 && confirmDeleteData.success) {
      console.log('  ✅ Passed B3: Account deletion confirmed successfully');
    } else {
      throw new Error(`Failed Test B3: ${JSON.stringify(confirmDeleteData)}`);
    }

    // Verify all records deleted from MongoDB
    const remainingUser = await User.findOne({ id: userId });
    const remainingProfile = await Profile.findOne({ user_id: userId });
    const remainingSessions = await InterviewSession.find({ user_id: userId });

    if (remainingUser !== null) throw new Error('User record was not deleted');
    if (remainingProfile !== null) throw new Error('Profile record was not deleted');
    if (remainingSessions.length !== 0) throw new Error('Session records were not deleted');

    console.log('  ✅ Passed DB Verification: User, profile, and session records wiped completely');
  }

  console.log('\n🎉 ALL FORGOT PASSWORD & DELETION OTP TESTS PASSED!\n');
  process.exit(0);
}

mongoose.connect(MONGODB_URI)
  .then(runTests)
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
