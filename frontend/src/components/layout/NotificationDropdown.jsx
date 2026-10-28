import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Trash2,
  Check,
  X,
  Flame,
  Brain,
  FileText,
  Award,
  Puzzle,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn, timeAgo } from "../../lib/utils";

const getDefaultNotifications = (profile) => [
  {
    id: "notif-streak",
    title: "Daily Practice Streak Active 🔥",
    message: `You're maintaining a great momentum! Complete today's session to keep your streak going.`,
    time: "15m ago",
    timestamp: Date.now() - 15 * 60 * 1000,
    read: false,
    category: "streak",
    link: "/app/aptitude",
    actionLabel: "Practice Now"
  },
  {
    id: "notif-interview",
    title: "AI Mock Interview Feedback Ready 🤖",
    message: "Your AI evaluation for the recent interview session is ready. Check out the scoring and feedback.",
    time: "1h ago",
    timestamp: Date.now() - 60 * 60 * 1000,
    read: false,
    category: "interview",
    link: "/app/history",
    actionLabel: "View Feedback"
  },
  {
    id: "notif-resume",
    title: "Resume ATS Score Optimization 📄",
    message: "Tip: Adding 3 more domain keywords from your target role can boost your resume score above 85%.",
    time: "3h ago",
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    read: false,
    category: "resume",
    link: "/app/resume-analyzer",
    actionLabel: "Optimize Resume"
  },
  {
    id: "notif-goal",
    title: "Weekly Goal Milestone 🎯",
    message: `You've completed 3 of ${profile?.weekly_goal || 5} sessions this week. Keep up the great work!`,
    time: "1d ago",
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    read: true,
    category: "goal",
    link: "/app/analytics",
    actionLabel: "View Analytics"
  },
  {
    id: "notif-quiz",
    title: "New Logical Reasoning Set Available 🧩",
    message: "Challenge yourself with new analytical and pattern recognition problems added today.",
    time: "2d ago",
    timestamp: Date.now() - 48 * 60 * 60 * 1000,
    read: true,
    category: "quiz",
    link: "/app/reasoning",
    actionLabel: "Solve Now"
  }
];

const categoryConfig = {
  streak: {
    icon: Flame,
    color: "text-amber-500",
    bg: "bg-amber-500/10 dark:bg-amber-500/20"
  },
  interview: {
    icon: Brain,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20"
  },
  resume: {
    icon: FileText,
    color: "text-sky-500",
    bg: "bg-sky-500/10 dark:bg-sky-500/20"
  },
  goal: {
    icon: Award,
    color: "text-purple-500",
    bg: "bg-purple-500/10 dark:bg-purple-500/20"
  },
  quiz: {
    icon: Puzzle,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20"
  }
};

export default function NotificationDropdown() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread'
  const containerRef = useRef(null);

  const storageKey = `user_notifications_${user?.id || "guest"}`;

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return getDefaultNotifications(profile);
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    } catch (e) {
      console.warn("Failed to persist notifications:", e);
    }
  }, [notifications, storageKey]);

  // Push a daily practice reminder once a day if not already pushed today
  useEffect(() => {
    if (!user) return;
    const todayStr = new Date().toISOString().slice(0, 10);
    const dailyReminderId = `notif-daily-reminder-${todayStr}`;

    setNotifications((prev) => {
      const alreadyHasToday = prev.some((n) => n.id === dailyReminderId);
      if (alreadyHasToday) return prev;

      const streak = profile?.streak_count || 0;
      const todayReminder = {
        id: dailyReminderId,
        title: "Daily Practice Reminder 🎯",
        message: streak > 0
          ? `You have a ${streak}-day streak going! Take 5–10 minutes to complete today's practice session.`
          : "Keep your interview readiness high! Complete a quick mock interview or aptitude exercise today.",
        time: "Just now",
        timestamp: Date.now(),
        read: false,
        category: "streak",
        link: "/app/aptitude",
        actionLabel: "Practice Now"
      };

      // If browser desktop notification permission is granted, also trigger native notification
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(todayReminder.title, {
            body: todayReminder.message,
            icon: "/favicon.svg",
          });
        } catch (err) {
          console.warn("Desktop notification trigger failed:", err);
        }
      }

      return [todayReminder, ...prev];
    });
  }, [user, profile?.streak_count]);

  // Click outside and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id, e) => {
    e?.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = (e) => {
    e?.stopPropagation();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = (e) => {
    e?.stopPropagation();
    setNotifications([]);
  };

  const handleDeleteItem = (id, e) => {
    e?.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationClick = (item) => {
    // Mark as read
    if (!item.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
    }
    setIsOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const displayedNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-lg transition-colors cursor-pointer",
          isOpen
            ? "bg-ink-100 dark:bg-ink-800 text-brand-600 dark:text-brand-400"
            : "hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-600 dark:text-ink-300"
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <>
            {/* Pulsing indicator */}
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-500" />
            </span>
          </>
        )}
      </button>

      {/* Dropdown Box */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] card-surface overflow-hidden shadow-2xl z-50 animate-fade-down border border-ink-200 dark:border-ink-800"
          style={{ maxHeight: "calc(100vh - 100px)" }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-ink-100 dark:border-ink-800 flex items-center justify-between bg-ink-50/50 dark:bg-ink-900/50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-ink-900 dark:text-ink-100">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium px-2 py-1 rounded hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark as read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear all</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar (All vs Unread) */}
          {notifications.length > 0 && (
            <div className="px-3 py-1.5 border-b border-ink-100 dark:border-ink-800 flex items-center gap-2 text-xs bg-white dark:bg-ink-950">
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer",
                  filter === "all"
                    ? "bg-ink-100 dark:bg-ink-800 text-ink-900 dark:text-white"
                    : "text-ink-500 hover:text-ink-800 dark:hover:text-ink-200"
                )}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={cn(
                  "px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer",
                  filter === "unread"
                    ? "bg-ink-100 dark:bg-ink-800 text-ink-900 dark:text-white"
                    : "text-ink-500 hover:text-ink-800 dark:hover:text-ink-200"
                )}
              >
                Unread ({unreadCount})
              </button>
            </div>
          )}

          {/* Notification List */}
          <div className="overflow-y-auto max-h-[380px] divide-y divide-ink-100 dark:divide-ink-800 scrollbar-thin">
            {displayedNotifications.length > 0 ? (
              displayedNotifications.map((item) => {
                const cfg = categoryConfig[item.category] || categoryConfig.interview;
                const IconComponent = cfg.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={cn(
                      "p-3.5 flex items-start gap-3 transition-colors cursor-pointer group relative",
                      !item.read
                        ? "bg-brand-50/40 dark:bg-brand-950/20 hover:bg-brand-50/80 dark:hover:bg-brand-950/40"
                        : "bg-transparent hover:bg-ink-50 dark:hover:bg-ink-900/40"
                    )}
                  >
                    {/* Category Icon */}
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105",
                        cfg.bg,
                        cfg.color
                      )}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5">
                        {!item.read && (
                          <span
                            className="w-2 h-2 rounded-full bg-accent-500 flex-shrink-0"
                            title="Unread"
                          />
                        )}
                        <h4
                          className={cn(
                            "text-xs font-semibold truncate leading-snug",
                            !item.read
                              ? "text-ink-900 dark:text-white font-bold"
                              : "text-ink-700 dark:text-ink-300 font-medium"
                          )}
                        >
                          {item.title}
                        </h4>
                      </div>

                      <p className="text-xs text-ink-600 dark:text-ink-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] text-ink-400 dark:text-ink-500">
                          {item.timestamp ? timeAgo(new Date(item.timestamp).toISOString()) : item.time}
                        </span>

                        {item.link && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 group-hover:underline">
                            {item.actionLabel || "View"}
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick action buttons on hover / right edge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!item.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(item.id, e)}
                          className="p-1 rounded-md text-ink-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
                          title="Mark as read"
                          aria-label="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        className="p-1 rounded-md text-ink-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
                        title="Delete notification"
                        aria-label="Delete notification"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Empty State */
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-ink-100 dark:bg-ink-800 flex items-center justify-center mb-3">
                  <CheckCheck className="w-6 h-6 text-brand-500" />
                </div>
                <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                  {filter === "unread"
                    ? "No unread notifications"
                    : "You're all caught up!"}
                </p>
                <p className="text-xs text-ink-500 dark:text-ink-400 mt-1 max-w-[220px]">
                  {filter === "unread"
                    ? "All your notifications have been marked as read."
                    : "No new notifications right now. Check back later for practice reminders and updates."}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-ink-100 dark:border-ink-800 bg-ink-50/50 dark:bg-ink-900/50 flex items-center justify-between text-xs text-ink-500 dark:text-ink-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                Practice alerts & tips
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="font-medium text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
