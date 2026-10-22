import React, { useState, useEffect } from "react";
import {
  Shield,
  Target,
  LogOut,
  Save,
  Trash2,
  AlertTriangle,
  Mail,
  Edit3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Lock,
  KeyRound,
  Clock,
  Award,
  Lightbulb,
  Check,
  Palette,
  Sun,
  Moon
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { api } from "../../lib/api";
import { Card, Button } from "../../components/ui";
import { cn } from "../../lib/utils";

const passwordRules = [
  { id: 'len', label: 'At least 6 characters', test: (p) => p.length >= 6 },
  { id: 'upper', label: 'At least one uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'num', label: 'At least one number', test: (p) => /[0-9]/.test(p) },
];

export default function SettingsPage() {
  const {
    user,
    profile,
    signOut,
    requestDeleteAccount,
    resendDeleteAccountOtp,
    confirmDeleteAccount,
    deleteAccount,
    requestEmailChange,
    verifyEmailChange,
    resendEmailChangeOtp,
    requestPasswordChange,
    verifyPasswordOtp,
    setNewPasswordAfterVerify,
    verifyPasswordChange,
    resendPasswordChangeOtp,
    refreshProfile
  } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // 1. Weekly Goal (Default 0, no monthly goal)
  const [weeklyGoal, setWeeklyGoal] = useState(profile?.weekly_goal ?? 0);
  const [savingGoal, setSavingGoal] = useState(false);

  useEffect(() => {
    if (profile && profile.weekly_goal !== undefined) {
      setWeeklyGoal(profile.weekly_goal);
    }
  }, [profile]);

  // 2. Notifications (Only 3 required items)
  const [notifications, setNotifications] = useState({
    practice_reminders: profile?.notifications?.practice_reminders ?? true,
    achievements: profile?.notifications?.achievements ?? true,
    tips: profile?.notifications?.tips ?? true
  });

  useEffect(() => {
    if (profile?.notifications) {
      setNotifications({
        practice_reminders: profile.notifications.practice_reminders ?? true,
        achievements: profile.notifications.achievements ?? true,
        tips: profile.notifications.tips ?? true
      });
    }
  }, [profile]);

  // Account deletion modal & OTP state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteRequesting, setDeleteRequesting] = useState(false);
  const [deleteOtp, setDeleteOtp] = useState(["", "", "", "", "", ""]);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteCountdown, setDeleteCountdown] = useState(60);
  const [deleteCanResend, setDeleteCanResend] = useState(false);

  // Email change modal & OTP state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailStep, setEmailStep] = useState("input"); // 'input' | 'verify'
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailCountdown, setEmailCountdown] = useState(60);
  const [emailCanResend, setEmailCanResend] = useState(false);

  // Password change modal & OTP state (Directly sends to user.email)
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwStep, setPwStep] = useState("verify"); // 'verify' | 'set_password'
  const [pwResetToken, setPwResetToken] = useState("");
  const [pwRequesting, setPwRequesting] = useState(false);
  const [pwOtp, setPwOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwCountdown, setPwCountdown] = useState(60);
  const [pwCanResend, setPwCanResend] = useState(false);

  // Email resend countdown timer
  useEffect(() => {
    let timer;
    if (showEmailModal && emailStep === "verify" && emailCountdown > 0) {
      setEmailCanResend(false);
      timer = setInterval(() => {
        setEmailCountdown((prev) => {
          if (prev <= 1) {
            setEmailCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (emailCountdown === 0) {
      setEmailCanResend(true);
    }
    return () => clearInterval(timer);
  }, [showEmailModal, emailStep, emailCountdown]);

  // Password OTP resend countdown timer
  useEffect(() => {
    let timer;
    if (showPwModal && pwCountdown > 0) {
      setPwCanResend(false);
      timer = setInterval(() => {
        setPwCountdown((prev) => {
          if (prev <= 1) {
            setPwCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (pwCountdown === 0) {
      setPwCanResend(true);
    }
    return () => clearInterval(timer);
  }, [showPwModal, pwCountdown]);

  // Account delete OTP resend countdown timer
  useEffect(() => {
    let timer;
    if (showDeleteModal && deleteCountdown > 0) {
      setDeleteCanResend(false);
      timer = setInterval(() => {
        setDeleteCountdown((prev) => {
          if (prev <= 1) {
            setDeleteCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (deleteCountdown === 0) {
      setDeleteCanResend(true);
    }
    return () => clearInterval(timer);
  }, [showDeleteModal, deleteCountdown]);

  const handleSaveGoals = async () => {
    setSavingGoal(true);
    const response = await api.updateProfile({ weekly_goal: weeklyGoal });
    setSavingGoal(false);
    if (response.error) toast.error("Failed to save goal.");
    else {
      toast.success("Weekly goal updated!");
      await refreshProfile();
    }
  };

  const handleToggleNotification = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    const response = await api.updateProfile({ notifications: updated });
    if (response.error) {
      toast.error("Failed to update notification setting.");
    } else {
      toast.success("Notification preferences updated!");
      await refreshProfile();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // ─── Account Deletion Handlers with OTP ─────────────────────────────────────
  const handleOpenDeleteModal = async () => {
    setDeleteRequesting(true);
    setDeleteError("");
    try {
      const res = await requestDeleteAccount();
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message || `Confirmation code sent to ${user?.email}`);
        setDeleteOtp(["", "", "", "", "", ""]);
        setDeleteCountdown(60);
        setShowDeleteModal(true);
      }
    } catch (err) {
      toast.error("Failed to request deletion code. Please try again.");
    } finally {
      setDeleteRequesting(false);
    }
  };

  const handleConfirmDeleteAccount = async (e) => {
    if (e) e.preventDefault();
    setDeleteError("");
    const code = deleteOtp.join("");
    if (code.length !== 6) {
      setDeleteError("Please enter all 6 digits of the verification code.");
      return;
    }

    setDeleting(true);
    try {
      const response = await confirmDeleteAccount(code);
      if (response?.error) {
        setDeleteError(response.error);
        toast.error(response.error);
      } else {
        toast.success("Account permanently deleted.");
        setShowDeleteModal(false);
        navigate("/");
      }
    } catch (err) {
      setDeleteError("An error occurred while deleting account.");
    } finally {
      setDeleting(false);
    }
  };

  const handleResendDeleteOtp = async () => {
    if (!deleteCanResend || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await resendDeleteAccountOtp();
      if (res?.error) {
        setDeleteError(res.error);
        toast.error(res.error);
      } else {
        toast.success("A fresh deletion code has been sent!");
        setDeleteCountdown(60);
        setDeleteOtp(["", "", "", "", "", ""]);
      }
    } catch (err) {
      toast.error("Failed to resend code.");
    } finally {
      setDeleting(false);
    }
  };

  // ─── Email Change Handlers ──────────────────────────────────────────────────
  const handleOpenEmailModal = () => {
    setNewEmail("");
    setEmailOtp(["", "", "", "", "", ""]);
    setEmailStep("input");
    setEmailError("");
    setEmailCountdown(60);
    setShowEmailModal(true);
  };

  const handleRequestEmailChange = async (e) => {
    e.preventDefault();
    setEmailError("");
    if (!newEmail || !newEmail.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    if (newEmail.trim().toLowerCase() === user?.email?.toLowerCase()) {
      setEmailError("New email cannot be the same as your current email.");
      return;
    }

    setEmailLoading(true);
    try {
      const res = await requestEmailChange(newEmail.trim());
      if (res?.error) {
        setEmailError(res.error);
        toast.error(res.error);
      } else {
        toast.success(res.message || "Verification code sent to your new email.");
        setEmailStep("verify");
        setEmailCountdown(60);
      }
    } catch (err) {
      setEmailError("Failed to send verification code. Please check your connection.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailChange = async (e) => {
    e.preventDefault();
    setEmailError("");
    const code = emailOtp.join("");
    if (code.length !== 6) {
      setEmailError("Please enter all 6 digits of the verification code.");
      return;
    }

    setEmailLoading(true);
    try {
      const res = await verifyEmailChange(code);
      if (res?.error) {
        setEmailError(res.error);
        toast.error(res.error);
      } else {
        toast.success(res.message || "Email address updated successfully!");
        setShowEmailModal(false);
        await refreshProfile();
      }
    } catch (err) {
      setEmailError("Failed to verify code. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleResendEmailChangeOtp = async () => {
    if (!emailCanResend || emailLoading) return;
    setEmailLoading(true);
    setEmailError("");
    try {
      const res = await resendEmailChangeOtp();
      if (res?.error) {
        setEmailError(res.error);
        toast.error(res.error);
      } else {
        toast.success("New verification code sent!");
        setEmailCountdown(60);
        setEmailOtp(["", "", "", "", "", ""]);
      }
    } catch (err) {
      toast.error("Failed to resend code.");
    } finally {
      setEmailLoading(false);
    }
  };

  // ─── Password Change Handlers (Directly to User Email) ──────────────────────
  const handleOpenPasswordModal = async () => {
    setPwRequesting(true);
    setPwError("");
    try {
      const res = await requestPasswordChange();
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message || `Verification code sent to ${user?.email}`);
        setPwOtp(["", "", "", "", "", ""]);
        setPwStep("verify");
        setPwResetToken("");
        setNewPassword("");
        setConfirmPassword("");
        setPwCountdown(60);
        setShowPwModal(true);
      }
    } catch (err) {
      toast.error("Failed to request password change. Please try again.");
    } finally {
      setPwRequesting(false);
    }
  };

  // Step 1: Verify OTP code first
  const handleVerifyPasswordOtp = async (e) => {
    e.preventDefault();
    setPwError("");
    const code = pwOtp.join("");
    if (code.length !== 6) {
      setPwError("Please enter all 6 digits of the verification code.");
      return;
    }

    setPwLoading(true);
    try {
      const res = await verifyPasswordOtp(code);
      if (res?.error) {
        setPwError(res.error);
        toast.error(res.error);
      } else {
        toast.success(res.message || "Code verified! Now enter your new password.");
        setPwResetToken(res.resetToken);
        setPwStep("set_password");
        setPwError("");
      }
    } catch (err) {
      setPwError("Failed to verify code. Please check your connection.");
    } finally {
      setPwLoading(false);
    }
  };

  // Step 2: Set New Password after verification
  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setPwError("");

    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters long.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPwError("New password must contain at least one uppercase letter.");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPwError("New password must contain at least one number.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match. Please re-enter.");
      return;
    }

    setPwLoading(true);
    try {
      const res = await setNewPasswordAfterVerify(pwResetToken, newPassword);
      if (res?.error) {
        setPwError(res.error);
        toast.error(res.error);
      } else {
        toast.success(res.message || "Password updated successfully!");
        setShowPwModal(false);
        setPwStep("verify");
        setPwResetToken("");
        setNewPassword("");
        setConfirmPassword("");
        setPwOtp(["", "", "", "", "", ""]);
      }
    } catch (err) {
      setPwError("Failed to update password. Please check your connection.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleResendPasswordOtp = async () => {
    if (!pwCanResend || pwLoading) return;
    setPwLoading(true);
    setPwError("");
    try {
      const res = await resendPasswordChangeOtp();
      if (res?.error) {
        setPwError(res.error);
        toast.error(res.error);
      } else {
        toast.success("A fresh verification code has been sent!");
        setPwCountdown(60);
        setPwOtp(["", "", "", "", "", ""]);
      }
    } catch (err) {
      toast.error("Failed to resend code.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleDigitChange = (digitsArray, setDigitsArray, errorSetter, idPrefix, index, value) => {
    errorSetter("");
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      const next = [...digitsArray];
      next[index] = "";
      setDigitsArray(next);
      return;
    }
    const char = clean.slice(-1);
    const next = [...digitsArray];
    next[index] = char;
    setDigitsArray(next);

    if (index < 5) {
      const nextInput = document.getElementById(`${idPrefix}-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleDigitKeyDown = (digitsArray, idPrefix, index, e) => {
    if (e.key === "Backspace" && !digitsArray[index] && index > 0) {
      const prevInput = document.getElementById(`${idPrefix}-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleDigitPaste = (setDigitsArray, errorSetter, e) => {
    e.preventDefault();
    errorSetter("");
    const pasted = e.clipboardData.getData("text").trim().replace(/\D/g, "");
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < 6; i++) {
      if (i < pasted.length) next[i] = pasted[i];
    }
    setDigitsArray(next);
  };

  // ─── 3 Required Notification Items ──────────────────────────────────────────
  const notificationItems = [
    {
      key: "practice_reminders",
      label: "Practice Reminders",
      desc: "Remind users to practice mock interviews, aptitude, or reasoning when they haven't practised for a while.",
      icon: Clock,
      color: "text-brand-600 bg-brand-50"
    },
    {
      key: "achievements",
      label: "Achievements",
      desc: "Notify users when they reach a practice streak, complete a milestone, or earn a new achievement.",
      icon: Award,
      color: "text-amber-600 bg-amber-50"
    },
    {
      key: "tips",
      label: "Personalized Preparation Tips",
      desc: "Send occasional suggestions based on weak skills, low interview scores, or topics the user should practise more.",
      icon: Lightbulb,
      color: "text-sky-600 bg-sky-50"
    }
  ];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-6 relative">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink-950">Settings</h1>
        <p className="text-ink-500 mt-1">Manage your account, preferences, and weekly goals.</p>
      </div>

      {/* ─── Appearance Card (Light Mode / Dark Mode) ────────────────────── */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-semibold text-lg text-ink-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-brand-500" />
            <span>Appearance</span>
          </h2>
          <span className="text-xs px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-medium">
            {theme === "dark" ? "Dark Mode Active" : "Light Mode Active"}
          </span>
        </div>
        <p className="text-sm text-ink-500 mb-5">
          Choose how Interview Prep AI looks on your device.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Light Mode Option */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              if (theme !== "light") {
                setTheme("light");
                toast.success("Theme switched to Light mode");
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setTheme("light");
                toast.success("Theme switched to Light mode");
              }
            }}
            className={cn(
              "relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group",
              theme === "light"
                ? "border-brand-500 bg-brand-50/40 shadow-sm ring-2 ring-brand-500/20"
                : "border-ink-100 hover:border-ink-300 hover:bg-ink-50/50"
            )}
          >
            <div>
              {/* Mini mockup illustration */}
              <div className="w-full h-24 rounded-xl border border-gray-200 !bg-[#ffffff] p-2.5 mb-3 flex flex-col gap-1.5 shadow-sm overflow-hidden pointer-events-none">
                <div className="flex items-center justify-between pb-1.5 border-b !border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full !bg-violet-500" />
                    <div className="w-12 h-2 rounded !bg-gray-200" />
                  </div>
                  <div className="w-4 h-4 rounded-full !bg-amber-100 flex items-center justify-center">
                    <Sun className="w-2.5 h-2.5 !text-amber-600" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5 flex-1">
                  <div className="rounded !bg-violet-50 border !border-violet-100" />
                  <div className="rounded !bg-sky-50 border !border-sky-100" />
                  <div className="rounded !bg-amber-50 border !border-amber-100" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg !bg-amber-100 !text-amber-600 flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">Light mode</p>
                    <p className="text-xs text-ink-500">Bright, clean, and crisp</p>
                  </div>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    theme === "light"
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-ink-300"
                  )}
                >
                  {theme === "light" && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </div>
          </div>

          {/* Dark Mode Option */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              if (theme !== "dark") {
                setTheme("dark");
                toast.success("Theme switched to Dark mode");
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setTheme("dark");
                toast.success("Theme switched to Dark mode");
              }
            }}
            className={cn(
              "relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group",
              theme === "dark"
                ? "border-brand-500 bg-brand-950/20 shadow-sm ring-2 ring-brand-500/20"
                : "border-ink-100 hover:border-ink-300 hover:bg-ink-50/50"
            )}
          >
            <div>
              {/* Mini mockup illustration */}
              <div className="w-full h-24 rounded-xl border !border-gray-800 !bg-[#0f131f] p-2.5 mb-3 flex flex-col gap-1.5 shadow-sm overflow-hidden pointer-events-none">
                <div className="flex items-center justify-between pb-1.5 border-b !border-gray-800/80">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full !bg-violet-400" />
                    <div className="w-12 h-2 rounded !bg-gray-700" />
                  </div>
                  <div className="w-4 h-4 rounded-full !bg-indigo-950/80 flex items-center justify-center">
                    <Moon className="w-2.5 h-2.5 !text-indigo-400" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5 flex-1">
                  <div className="rounded !bg-violet-950/40 border !border-violet-800/40" />
                  <div className="rounded !bg-sky-950/40 border !border-sky-800/40" />
                  <div className="rounded !bg-amber-950/40 border !border-amber-800/40" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">Dark mode</p>
                    <p className="text-xs text-ink-500">Gentle on eyes in low light</p>
                  </div>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    theme === "dark"
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-ink-300"
                  )}
                >
                  {theme === "dark" && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ─── Interview Goals Card (Weekly only, default 0) ────────────────── */}
      <Card>
        <h2 className="font-display font-semibold text-lg text-ink-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-brand-500" />
          <span>Interview Goals</span>
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-ink-700">Weekly Goal</label>
              <span className="text-sm text-brand-600 font-semibold">
                {weeklyGoal === 0 ? "0 sessions (Not set)" : `${weeklyGoal} session${weeklyGoal === 1 ? "" : "s"}`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(Number(e.target.value))}
              className="w-full accent-brand-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-ink-400 mt-1">
              <span>0 (No goal)</span>
              <span>5</span>
              <span>10</span>
              <span>15</span>
              <span>20 sessions / week</span>
            </div>
          </div>
        </div>
        <Button onClick={handleSaveGoals} disabled={savingGoal} className="mt-4">
          <Save className="w-4 h-4 mr-1.5" />
          <span>{savingGoal ? "Saving…" : "Save Goal"}</span>
        </Button>
      </Card>

      {/* ─── Notifications Card (Only the 3 specific items) ─────────────── */}
      <Card>
        <h2 className="font-display font-semibold text-lg text-ink-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-500" />
          <span>Notifications</span>
        </h2>
        <div className="space-y-3">
          {notificationItems.map((t) => {
            const Icon = t.icon;
            const isEnabled = Boolean(notifications[t.key]);
            return (
              <div key={t.key} className="flex items-start justify-between p-3.5 rounded-xl border border-ink-100 gap-3">
                <div className="flex items-start gap-3">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5", t.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{t.label}</p>
                    <p className="text-xs text-ink-500 leading-relaxed mt-0.5">{t.desc}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification(t.key)}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 mt-1",
                    isEnabled ? "bg-brand-500" : "bg-ink-200"
                  )}
                  title={`Toggle ${t.label}`}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-5 h-5 rounded-full !bg-white transition-transform shadow-sm",
                      isEnabled ? "translate-x-5" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ─── Account Card (Email & Password with OTP Change) ─────────────── */}
      <Card>
        <h2 className="font-display font-semibold text-lg text-ink-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent-500" />
          <span>Account</span>
        </h2>
        <div className="space-y-3">
          {/* Email Address with Change Option */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-ink-100 gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink-900">Email Address</p>
              <p className="text-xs text-ink-500 font-mono truncate">{user?.email}</p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1 text-xs text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-full font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                <span>Verified</span>
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenEmailModal}
                className="text-xs px-2.5 py-1 rounded-lg border-ink-200 hover:border-brand-500 hover:text-brand-600 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" />
                <span>Change Email</span>
              </Button>
            </div>
          </div>

          {/* Password with OTP Change Option (Direct to Account Email) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-ink-100 gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-900 mb-0.5">Password</p>
              <p className="text-xs font-mono text-ink-500">
                ••••••••••
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenPasswordModal}
              disabled={pwRequesting}
              className="text-xs px-2.5 py-1 rounded-lg border-ink-200 hover:border-brand-500 hover:text-brand-600 transition shrink-0 self-start sm:self-auto cursor-pointer"
            >
              {pwRequesting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
              ) : (
                <KeyRound className="w-3.5 h-3.5 mr-1" />
              )}
              <span>{pwRequesting ? "Sending OTP…" : "Change Password"}</span>
            </Button>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </Card>

      {/* ─── Danger Zone ─────────────────────────────────────────────────── */}
      <Card className="border-red-200 bg-red-50/30">
        <h2 className="font-display font-semibold text-lg text-red-600 mb-2 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          <span>Danger Zone</span>
        </h2>
        <p className="text-sm text-ink-500 mb-4">
          Permanently delete your account and all associated data. This action is irreversible. A verification code will be sent to your account email to confirm.
        </p>
        <Button
          variant="danger"
          onClick={handleOpenDeleteModal}
          disabled={deleteRequesting}
        >
          {deleteRequesting ? (
            <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 mr-1.5" />
          )}
          <span>{deleteRequesting ? "Sending Code…" : "Delete Account"}</span>
        </Button>
      </Card>

      {/* ─── Password Change Modal with Two-Step Verification ─────── */}
      {showPwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-5 animate-scale-in relative">
            <button
              type="button"
              onClick={() => !pwLoading && setShowPwModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Step 1: Verification Only */}
            {pwStep === "verify" && (
              <>
                {/* Modal Header */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-display text-gray-900">Verify Your Identity</h3>
                    <p className="text-xs text-gray-500">
                      We sent a verification code to your account email:
                    </p>
                  </div>
                </div>

                {/* Account email pill */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-violet-50/70 border border-violet-100 text-xs text-violet-900">
                  <Mail className="w-4 h-4 text-violet-600 shrink-0" />
                  <span className="font-medium font-mono truncate">{user?.email}</span>
                </div>

                {pwError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{pwError}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyPasswordOtp} className="space-y-4">
                  {/* 6 Digit OTP */}
                  <div>
                    <label className="block text-center text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                      Enter 6-Digit Code
                    </label>
                    <div className="flex items-center justify-center gap-2" onPaste={(e) => handleDigitPaste(setPwOtp, setPwError, e)}>
                      {pwOtp.map((d, idx) => (
                        <input
                          key={idx}
                          id={`pw-otp-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={d}
                          onChange={(e) => handleDigitChange(pwOtp, setPwOtp, setPwError, "pw-otp", idx, e.target.value)}
                          onKeyDown={(e) => handleDigitKeyDown(pwOtp, "pw-otp", idx, e)}
                          disabled={pwLoading}
                          className={`w-10 h-12 text-center text-lg font-bold rounded-xl border transition-all outline-none font-mono ${
                            d
                              ? "border-violet-500 bg-violet-50/40 text-violet-950 ring-2 ring-violet-100"
                              : "border-gray-200 bg-white text-gray-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend OTP button */}
                  <div className="text-center">
                    {pwCanResend ? (
                      <button
                        type="button"
                        onClick={handleResendPasswordOtp}
                        disabled={pwLoading}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 hover:underline cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Resend Code</span>
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">
                        Resend code in <span className="font-mono font-semibold text-gray-600">{pwCountdown}s</span>
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPwModal(false)}
                      disabled={pwLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={pwLoading || pwOtp.join("").length !== 6}
                      className="bg-violet-600 hover:bg-violet-700 text-white"
                    >
                      {pwLoading ? "Verifying…" : "Verify Code"}
                    </Button>
                  </div>
                </form>
              </>
            )}

            {/* Step 2: Enter New Password Only (Appears after verification succeeds) */}
            {pwStep === "set_password" && (
              <>
                {/* Modal Header */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-display text-gray-900">Set New Password</h3>
                    <p className="text-xs text-gray-500">
                      Identity verified. Create a new strong password below.
                    </p>
                  </div>
                </div>

                {/* Verified badge */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-violet-50 border border-violet-200 text-xs font-semibold text-violet-800">
                  <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0" />
                  <span>Email verified: <span className="font-mono font-bold">{user?.email}</span></span>
                </div>

                {pwError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{pwError}</span>
                  </div>
                )}

                <form onSubmit={handleSetNewPassword} className="space-y-4">
                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      autoFocus
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm text-gray-900 transition"
                    />

                    {/* Password rule hints */}
                    <div className="mt-2 space-y-1">
                      {passwordRules.map((rule) => {
                        const passed = rule.test(newPassword);
                        return (
                          <div key={rule.id} className={cn("flex items-center gap-1.5 text-[11px] font-medium", passed ? "text-violet-600" : "text-gray-400")}>
                            <Check className={cn("w-3 h-3 shrink-0", passed ? "text-violet-600" : "text-gray-300")} />
                            <span>{rule.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm text-gray-900 transition"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPwModal(false)}
                      disabled={pwLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={pwLoading || !newPassword || !confirmPassword}
                      className="bg-violet-600 hover:bg-violet-700 text-white"
                    >
                      {pwLoading ? "Updating…" : "Update Password"}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Email Change Modal with OTP Verification ────────────────────── */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-5 animate-scale-up relative">
            <button
              type="button"
              onClick={() => !emailLoading && setShowEmailModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {emailStep === "input" ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-display text-gray-900">Update Email Address</h3>
                    <p className="text-xs text-gray-500">A verification code will be sent to the new address.</p>
                  </div>
                </div>

                {emailError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{emailError}</span>
                  </div>
                )}

                <form onSubmit={handleRequestEmailChange} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Current Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email address"
                      required
                      autoFocus
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm text-gray-900 transition"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEmailModal(false)}
                      disabled={emailLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={emailLoading || !newEmail}
                      className="bg-violet-600 hover:bg-violet-700 text-white"
                    >
                      {emailLoading ? "Sending Code…" : "Send Verification Code"}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-display text-gray-900">Verify New Email</h3>
                    <p className="text-xs text-gray-500">
                      Code sent to <span className="font-semibold text-gray-700">{newEmail}</span>
                    </p>
                  </div>
                </div>

                {emailError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{emailError}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyEmailChange} className="space-y-4">
                  <div>
                    <label className="block text-center text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                      Enter 6-Digit Code
                    </label>
                    <div className="flex items-center justify-center gap-2" onPaste={(e) => handleDigitPaste(setEmailOtp, setEmailError, e)}>
                      {emailOtp.map((d, idx) => (
                        <input
                          key={idx}
                          id={`email-otp-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={d}
                          onChange={(e) => handleDigitChange(emailOtp, setEmailOtp, setEmailError, "email-otp", idx, e.target.value)}
                          onKeyDown={(e) => handleDigitKeyDown(emailOtp, "email-otp", idx, e)}
                          disabled={emailLoading}
                          className={`w-10 h-12 text-center text-lg font-bold rounded-xl border transition-all outline-none font-mono ${
                            d
                              ? "border-violet-500 bg-violet-50/40 text-violet-950 ring-2 ring-violet-100"
                              : "border-gray-200 bg-white text-gray-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    {emailCanResend ? (
                      <button
                        type="button"
                        onClick={handleResendEmailChangeOtp}
                        disabled={emailLoading}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 hover:underline cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Resend Code</span>
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">
                        Resend code in <span className="font-mono font-semibold text-gray-600">{emailCountdown}s</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setEmailStep("input")}
                      disabled={emailLoading}
                      className="text-xs text-gray-500 hover:text-gray-700 font-semibold cursor-pointer"
                    >
                      ← Change email
                    </button>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowEmailModal(false)}
                        disabled={emailLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={emailLoading || emailOtp.join("").length !== 6}
                        className="bg-violet-600 hover:bg-violet-700 text-white"
                      >
                        {emailLoading ? "Verifying…" : "Confirm & Update"}
                      </Button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Delete Account Modal with OTP Verification ───────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-red-100 space-y-5 animate-scale-up relative">
            <button
              type="button"
              onClick={() => !deleting && setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-11 h-11 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-gray-900">Delete Account</h3>
                <p className="text-xs text-red-600 font-medium">Verification code required to confirm</p>
              </div>
            </div>

            {/* Warning banner */}
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-900 leading-relaxed flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>
                All your mock interviews, resume analyses, scores, and profile data will be permanently wiped. This action cannot be reversed.
              </span>
            </div>

            {/* Email destination badge */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50/60 border border-red-100 text-xs text-red-900">
              <Mail className="w-4 h-4 text-red-600 shrink-0" />
              <span>Code sent to: <strong className="font-mono">{user?.email}</strong></span>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmDeleteAccount} className="space-y-4">
              {/* 6 Digit OTP */}
              <div>
                <label className="block text-center text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                  Enter 6-Digit Code
                </label>
                <div className="flex items-center justify-center gap-2" onPaste={(e) => handleDigitPaste(setDeleteOtp, setDeleteError, e)}>
                  {deleteOtp.map((d, idx) => (
                    <input
                      key={idx}
                      id={`delete-otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleDigitChange(deleteOtp, setDeleteOtp, setDeleteError, "delete-otp", idx, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(deleteOtp, "delete-otp", idx, e)}
                      disabled={deleting}
                      className={`w-10 h-12 text-center text-lg font-bold rounded-xl border transition-all outline-none font-mono ${
                        d
                          ? "border-red-500 bg-red-50/40 text-red-950 ring-2 ring-red-100"
                          : "border-gray-200 bg-white text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Resend OTP button */}
              <div className="text-center">
                {deleteCanResend ? (
                  <button
                    type="button"
                    onClick={handleResendDeleteOtp}
                    disabled={deleting}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend Code</span>
                  </button>
                ) : (
                  <span className="text-xs text-gray-400">
                    Resend code in <span className="font-mono font-semibold text-gray-600">{deleteCountdown}s</span>
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => !deleting && setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  disabled={deleting || deleteOtp.join("").length !== 6}
                >
                  {deleting ? "Deleting Account…" : "Permanently Delete Account"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
