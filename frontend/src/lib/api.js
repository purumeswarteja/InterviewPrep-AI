const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const TOKEN_KEY = "interview_prep_token";

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {})
    },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: payload.error || payload.message || "Request failed", status: response.status, ...payload };
  }
  return payload;
};

const signup = async (email, password, full_name) => {
  const data = await request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name })
  });
  if (!data.error && data.token) {
    setToken(data.token);
    if (data.user?.id) {
      localStorage.setItem(`user_pw_${data.user.id}`, password);
    }
    if (data.user?.email) {
      localStorage.setItem(`user_pw_${data.user.email.toLowerCase()}`, password);
    }
    sessionStorage.setItem('current_user_pw', password);
  }
  return data;
};

const login = async (email, password) => {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  if (!data.error && data.token) {
    setToken(data.token);
    if (data.user?.id) {
      localStorage.setItem(`user_pw_${data.user.id}`, password);
    }
    if (data.user?.email) {
      localStorage.setItem(`user_pw_${data.user.email.toLowerCase()}`, password);
    }
    sessionStorage.setItem('current_user_pw', password);
  }
  return data;
};

const verifyOtp = async (email, otp, password = null) => {
  const data = await request("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp })
  });
  if (!data.error && data.token) {
    setToken(data.token);
    if (password) {
      if (data.user?.id) {
        localStorage.setItem(`user_pw_${data.user.id}`, password);
      }
      if (data.user?.email) {
        localStorage.setItem(`user_pw_${data.user.email.toLowerCase()}`, password);
      }
      sessionStorage.setItem('current_user_pw', password);
    }
  }
  return data;
};

const resendOtp = async (email) => {
  return request("/api/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email })
  });
};

const requestEmailChange = async (newEmail) => {
  return request("/api/auth/change-email/request", {
    method: "POST",
    body: JSON.stringify({ newEmail })
  });
};

const verifyEmailChange = async (otp) => {
  const data = await request("/api/auth/change-email/verify", {
    method: "POST",
    body: JSON.stringify({ otp })
  });
  if (!data.error && data.token) {
    setToken(data.token);
  }
  return data;
};

const resendEmailChangeOtp = async () => {
  return request("/api/auth/change-email/resend", {
    method: "POST"
  });
};

const requestPasswordChange = async () => {
  return request("/api/auth/change-password/request", {
    method: "POST"
  });
};

const verifyPasswordOtp = async (otp) => {
  return request("/api/auth/change-password/verify-otp", {
    method: "POST",
    body: JSON.stringify({ otp })
  });
};

const setNewPasswordAfterVerify = async (resetToken, newPassword) => {
  return request("/api/auth/change-password/set-new", {
    method: "POST",
    body: JSON.stringify({ resetToken, newPassword })
  });
};

const verifyPasswordChange = async (otp, newPassword) => {
  return request("/api/auth/change-password/verify", {
    method: "POST",
    body: JSON.stringify({ otp, newPassword })
  });
};

const resendPasswordChangeOtp = async () => {
  return request("/api/auth/change-password/resend", {
    method: "POST"
  });
};

const fetchCurrent = async () => {
  return request("/api/auth/me");
};

const updateProfile = async (body) => {
  return request("/api/profile", {
    method: "PUT",
    body: JSON.stringify(body)
  });
};

const getSessions = async () => {
  return request("/api/sessions");
};

const createSession = async (payload) => {
  return request("/api/sessions", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

const deleteSession = async (id) => {
  return request(`/api/sessions/${id}`, {
    method: "DELETE"
  });
};

const createResumeAnalysis = async (payload) => {
  return request("/api/resume-analyses", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

const getAnalytics = async () => {
  return getSessions();
};

const passwordReset = async (email) => {
  return request("/api/password-reset", {
    method: "POST",
    body: JSON.stringify({ email })
  });
};

const forgotPasswordRequest = async (email) => {
  return request("/api/auth/forgot-password/request", {
    method: "POST",
    body: JSON.stringify({ email })
  });
};

const forgotPasswordResend = async (email) => {
  return request("/api/auth/forgot-password/resend", {
    method: "POST",
    body: JSON.stringify({ email })
  });
};

const forgotPasswordVerifyOtp = async (email, otp) => {
  return request("/api/auth/forgot-password/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp })
  });
};

const forgotPasswordReset = async (email, resetToken, newPassword) => {
  const data = await request("/api/auth/forgot-password/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, resetToken, newPassword })
  });
  if (!data.error && data.token) {
    setToken(data.token);
    if (data.user?.email) {
      localStorage.setItem(`user_pw_${data.user.email.toLowerCase()}`, newPassword);
    }
    if (data.user?.id) {
      localStorage.setItem(`user_pw_${data.user.id}`, newPassword);
    }
    sessionStorage.setItem('current_user_pw', newPassword);
  }
  return data;
};

const requestDeleteAccount = async () => {
  return request("/api/auth/delete-account/request", {
    method: "POST"
  });
};

const resendDeleteAccountOtp = async () => {
  return request("/api/auth/delete-account/resend", {
    method: "POST"
  });
};

const confirmDeleteAccount = async (otp) => {
  return request("/api/auth/delete-account/confirm", {
    method: "POST",
    body: JSON.stringify({ otp })
  });
};

const deleteAccount = async (otp) => {
  if (otp) {
    return confirmDeleteAccount(otp);
  }
  return request("/api/auth/delete-account", {
    method: "DELETE"
  });
};

const logout = () => {
  setToken(null);
  sessionStorage.removeItem('current_user_pw');
};

const analyzeResumeWithAI = async (payload) => {
  return request("/api/ai/analyze-resume", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

const optimizeResumeWithAI = async (payload) => {
  return request("/api/ai/optimize-resume", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

const evaluateInterviewWithAI = async (payload) => {
  return request("/api/ai/evaluate-interview", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

const generateNextQuestion = async (payload) => {
  return request("/api/ai/generate-next-question", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

const generateHRQuestion = async (payload) => {
  return request("/api/ai/generate-hr-question", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

const generateAptitudeQuestions = async (payload) => {
  return request("/api/ai/generate-aptitude-questions", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

const generateReasoningQuestions = async (payload) => {
  return request("/api/ai/generate-reasoning-questions", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const api = {
  signup,
  login,
  verifyOtp,
  resendOtp,
  requestEmailChange,
  verifyEmailChange,
  resendEmailChangeOtp,
  requestPasswordChange,
  verifyPasswordOtp,
  setNewPasswordAfterVerify,
  verifyPasswordChange,
  resendPasswordChangeOtp,
  fetchCurrent,
  updateProfile,
  getSessions,
  createSession,
  deleteSession,
  createResumeAnalysis,
  analyzeResumeWithAI,
  optimizeResumeWithAI,
  evaluateInterviewWithAI,
  generateNextQuestion,
  generateHRQuestion,
  generateAptitudeQuestions,
  generateReasoningQuestions,
  getAnalytics,
  passwordReset,
  forgotPasswordRequest,
  forgotPasswordResend,
  forgotPasswordVerifyOtp,
  forgotPasswordReset,
  requestDeleteAccount,
  resendDeleteAccountOtp,
  confirmDeleteAccount,
  deleteAccount,
  logout,
  getToken,
  setToken
};

