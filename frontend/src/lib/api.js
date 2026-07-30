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
    sessionStorage.setItem('current_user_pw', password);
  }
  return data;
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

const deleteAccount = async () => {
  return request("/api/auth/delete-account", {
    method: "DELETE"
  });
};

const logout = () => {
  setToken(null);
  sessionStorage.removeItem('current_user_pw');
};

export const api = {
  signup,
  login,
  fetchCurrent,
  updateProfile,
  getSessions,
  createSession,
  deleteSession,
  createResumeAnalysis,
  getAnalytics,
  passwordReset,
  deleteAccount,
  logout,
  getToken,
  setToken
};
