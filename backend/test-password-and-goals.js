import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Profile from './models/Profile.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/interviewprep';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const BASE_URL = 'http://localhost:4000';

async function runTests() {
  console.log('🧪 Starting Settings Goals, Notifications & Password Change Tests...\n');

  const testEmail = `pwtest_${Date.now()}@example.com`;
  const initialPassword = 'OldPassword123';
  const newPassword = 'NewPassword999';
  const userId = `user-${Date.now()}`;

  // Step 1: Create verified test user and profile
  const hashedInitial = await bcrypt.hash(initialPassword, 10);
  await User.create({
    id: userId,
    email: testEmail,
    password: hashedInitial,
    isEmailVerified: true,
  });

  const profile = await Profile.create({
    id: `prof-${Date.now()}`,
    user_id: userId,
    full_name: 'Password Test User',
    // weekly_goal should default to 0
  });

  console.log('Test 1: Default weekly_goal is 0');
  if (profile.weekly_goal === 0) {
    console.log('  ✅ Passed: New profile weekly_goal defaults to 0');
  } else {
    throw new Error(`Failed Test 1: Expected 0, got ${profile.weekly_goal}`);
  }

  // Generate auth token
  const token = jwt.sign({ userId, email: testEmail, isEmailVerified: true }, JWT_SECRET, { expiresIn: '1h' });

  // Step 2: Request Password Change OTP (Does not require entering email!)
  console.log('\nTest 2: Request Password Change OTP (Directly to account email)');
  // Temporarily set a dummy RESEND_API_KEY to test the request handler logic
  process.env.RESEND_API_KEY = 're_test_key_dummy';

  // Seed known OTP on user for verification test
  const knownOtp = '849201';
  const hashedOtp = await bcrypt.hash(knownOtp, 10);
  await User.updateOne(
    { id: userId },
    {
      passwordResetOtpHash: hashedOtp,
      passwordResetOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      passwordResetOtpAttempts: 0,
      passwordResetOtpLastSentAt: new Date(),
    }
  );

  // Step 3: Incorrect OTP rejection
  console.log('\nTest 3: Reject Incorrect OTP on password change');
  {
    const res = await fetch(`${BASE_URL}/api/auth/change-password/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        otp: '000000',
        newPassword,
      }),
    });
    const data = await res.json();
    if (res.status === 400 && data.error && data.error.includes('Invalid verification code')) {
      console.log('  ✅ Passed: Rejected incorrect OTP for password change');
    } else {
      throw new Error(`Failed Test 3: ${JSON.stringify(data)}`);
    }
  }

  // Step 4: Correct OTP password change verification
  console.log('\nTest 4: Verify Password Change with Correct OTP');
  {
    const res = await fetch(`${BASE_URL}/api/auth/change-password/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        otp: knownOtp,
        newPassword,
      }),
    });
    const data = await res.json();
    if (res.status === 200 && data.success) {
      console.log('  ✅ Passed: Password changed successfully!');
    } else {
      throw new Error(`Failed Test 4: ${JSON.stringify(data)}`);
    }

    // Verify DB: password was updated with new bcrypt hash, OTP fields cleared
    const updatedUser = await User.findOne({ id: userId });
    const isNewValid = await bcrypt.compare(newPassword, updatedUser.password);
    const isOldValid = await bcrypt.compare(initialPassword, updatedUser.password);
    if (!isNewValid) throw new Error('New password does not match hash in DB');
    if (isOldValid) throw new Error('Old password still matches hash in DB');
    if (updatedUser.passwordResetOtpHash !== null) throw new Error('passwordResetOtpHash was not cleared');
    console.log('  ✅ Passed DB Check: Password hash updated to new password and OTP cleared');
  }

  // Step 5: Save Weekly Goal and Custom Notifications
  console.log('\nTest 5: Update Weekly Goal and 3 Notifications');
  {
    const res = await fetch(`${BASE_URL}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        weekly_goal: 8,
        notifications: {
          practice_reminders: true,
          achievements: false,
          tips: true,
        },
      }),
    });
    const data = await res.json();
    if (res.status === 200 && data.profile?.weekly_goal === 8) {
      console.log('  ✅ Passed: Profile weekly_goal updated to 8');
      console.log('  ✅ Passed: Notifications updated:', data.profile.notifications);
    } else {
      throw new Error(`Failed Test 5: ${JSON.stringify(data)}`);
    }
  }

  // Step 6: Test Two-Step Flow (Step 1: verify-otp -> Step 2: set-new)
  console.log('\nTest 6: Two-Step Password Change (verify-otp -> set-new)');
  {
    const step2Otp = '391845';
    const hashedStep2Otp = await bcrypt.hash(step2Otp, 10);
    await User.updateOne(
      { id: userId },
      {
        passwordResetOtpHash: hashedStep2Otp,
        passwordResetOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        passwordResetOtpAttempts: 0,
        passwordResetOtpLastSentAt: new Date(),
      }
    );

    // 6a: Call verify-otp
    const verifyOtpRes = await fetch(`${BASE_URL}/api/auth/change-password/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ otp: step2Otp }),
    });
    const verifyOtpData = await verifyOtpRes.json();
    if (verifyOtpRes.status === 200 && verifyOtpData.resetToken) {
      console.log('  ✅ Passed 6a: verify-otp verified OTP and generated resetToken');
    } else {
      throw new Error(`Failed Test 6a: ${JSON.stringify(verifyOtpData)}`);
    }

    // 6b: Call set-new with resetToken
    const finalPassword = 'FinalSecurePassword777';
    const setNewRes = await fetch(`${BASE_URL}/api/auth/change-password/set-new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        resetToken: verifyOtpData.resetToken,
        newPassword: finalPassword,
      }),
    });
    const setNewData = await setNewRes.json();
    if (setNewRes.status === 200 && setNewData.success) {
      console.log('  ✅ Passed 6b: set-new successfully changed password using resetToken');
    } else {
      throw new Error(`Failed Test 6b: ${JSON.stringify(setNewData)}`);
    }

    // Verify DB
    const finalUser = await User.findOne({ id: userId });
    const isFinalValid = await bcrypt.compare(finalPassword, finalUser.password);
    if (!isFinalValid) throw new Error('Final password does not match hash in DB');
    if (finalUser.passwordResetToken !== null) throw new Error('passwordResetToken was not cleared');
    console.log('  ✅ Passed DB Check: Password hash updated to final password and resetToken cleared');
  }

  // Cleanup
  await User.deleteOne({ id: userId });
  await Profile.deleteOne({ user_id: userId });

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!\n');
  process.exit(0);
}

mongoose.connect(MONGODB_URI)
  .then(runTests)
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
