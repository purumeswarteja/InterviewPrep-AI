import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Profile from './models/Profile.js';
import { sendDailyPracticeReminderEmail } from './utils/mailer.js';

dotenv.config();

// Silence console output ONLY when SILENT_TERMINAL is active or --silent passed
if (process.env.SILENT_TERMINAL === 'true' || process.argv.includes('--silent')) {
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.debug = () => {};
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interviewprep';

/**
 * Standalone Daily Practice Reminder Cron
 * Can be run independently of the web application server
 * (e.g. via crontab, systemd timer, or scheduled runner)
 */
export async function sendDailyReminders({ force = false } = {}) {
  const todayStr = new Date().toISOString().slice(0, 10);
  console.log(`[Daily Reminder Cron] Running practice reminder check for date: ${todayStr} (force=${force})`);

  let sentCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  const profiles = await Profile.find({});

  for (const p of profiles) {
    if (!p.user_id) continue;

    // 1. Inactivity streak check
    if (p.last_active_date) {
      const dToday = new Date(todayStr);
      const dLast = new Date(p.last_active_date);
      const diffDays = Math.round((dToday.getTime() - dLast.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 1 && p.streak_count > 0) {
        p.streak_count = 0;
        await p.save();
      }
    }

    // 2. Daily Practice Reminder Email
    const wantsReminders = p.notifications?.practice_reminders !== false;
    const notLoggedInToday = p.last_active_date !== todayStr;
    const notSentToday = p.last_daily_reminder_date !== todayStr;

    if (wantsReminders && (notLoggedInToday || force) && (notSentToday || force)) {
      const user = await User.findOne({ id: p.user_id });
      if (user && user.email && user.isEmailVerified) {
        try {
          console.log(`[Daily Reminder Cron] Sending reminder email to: ${user.email} (${p.full_name || 'User'})`);
          const result = await sendDailyPracticeReminderEmail(user.email, {
            name: p.full_name || 'there',
          });

          if (result && result.success !== false) {
            p.last_daily_reminder_date = todayStr;
            await p.save();
            sentCount++;
          } else {
            console.warn(`[Daily Reminder Cron] Failed to send to ${user.email}:`, result?.error || result?.reason);
            errorCount++;
          }
        } catch (e) {
          console.error(`[Daily Reminder Cron] Error dispatching email to ${user.email}:`, e.message);
          errorCount++;
        }
      } else {
        skippedCount++;
      }
    } else {
      skippedCount++;
    }
  }

  const summary = {
    date: todayStr,
    totalProfiles: profiles.length,
    sent: sentCount,
    skipped: skippedCount,
    errors: errorCount,
  };

  console.log('[Daily Reminder Cron] Completed check:', summary);
  return summary;
}

// If executed directly from command line (e.g., node cron-reminders.js)
if (process.argv[1] && process.argv[1].endsWith('cron-reminders.js')) {
  mongoose
    .connect(MONGODB_URI)
    .then(async () => {
      console.log('Connected to MongoDB for daily reminder cron.');
      const force = process.argv.includes('--force');
      await sendDailyReminders({ force });
      await mongoose.disconnect();
      console.log('Daily reminder cron finished. Exiting.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to run daily reminder cron:', err);
      process.exit(1);
    });
}
