import { jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
const AuthContext = createContext(void 0);
function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userPassword, setUserPassword] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCurrent = useCallback(async () => {
    const data = await api.fetchCurrent();
    if (!data.error && data.user) {
      setUser(data.user);
      setProfile(data.profile || null);
      setSession(data.user);
      const stored = (data.user.email && localStorage.getItem(`user_pw_${data.user.email.toLowerCase()}`)) ||
                     (data.user.id && localStorage.getItem(`user_pw_${data.user.id}`)) ||
                     sessionStorage.getItem('current_user_pw');
      if (stored) setUserPassword(stored);
    } else {
      setUser(null);
      setProfile(null);
      setSession(null);
      setUserPassword('');
      api.logout();
    }
    return data;
  }, []);

  const refreshProfile = useCallback(async () => {
    const data = await fetchCurrent();
    return data;
  }, [fetchCurrent]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await fetchCurrent();
      if (mounted) {
        setLoading(false);
      }
      return data;
    })();
    return () => {
      mounted = false;
    };
  }, [fetchCurrent]);

  const signUp = async (email, password, fullName) => {
    const data = await api.signup(email, password, fullName);
    if (!data.error && data.token) {
      localStorage.setItem(`user_pw_${email.toLowerCase()}`, password);
      setUserPassword(password);
      await fetchCurrent();
    }
    return data;
  };

  const signIn = async (email, password) => {
    const data = await api.login(email, password);
    if (!data.error && data.token) {
      localStorage.setItem(`user_pw_${email.toLowerCase()}`, password);
      setUserPassword(password);
      await fetchCurrent();
    }
    return data;
  };

  const verifyOtp = async (email, otp, password = null) => {
    const data = await api.verifyOtp(email, otp, password);
    if (!data.error && data.token) {
      if (password) {
        localStorage.setItem(`user_pw_${email.toLowerCase()}`, password);
        setUserPassword(password);
      }
      await fetchCurrent();
    }
    return data;
  };

  const resendOtp = async (email) => {
    return await api.resendOtp(email);
  };

  const requestEmailChange = async (newEmail) => {
    return await api.requestEmailChange(newEmail);
  };

  const verifyEmailChange = async (otp) => {
    const data = await api.verifyEmailChange(otp);
    if (!data.error) {
      await fetchCurrent();
    }
    return data;
  };

  const resendEmailChangeOtp = async () => {
    return await api.resendEmailChangeOtp();
  };

  const requestPasswordChange = async () => {
    return await api.requestPasswordChange();
  };

  const verifyPasswordOtp = async (otp) => {
    return await api.verifyPasswordOtp(otp);
  };

  const setNewPasswordAfterVerify = async (resetToken, newPassword) => {
    const data = await api.setNewPasswordAfterVerify(resetToken, newPassword);
    if (!data.error) {
      if (user?.email) {
        localStorage.setItem(`user_pw_${user.email.toLowerCase()}`, newPassword);
      }
      if (user?.id) {
        localStorage.setItem(`user_pw_${user.id}`, newPassword);
      }
      sessionStorage.setItem('current_user_pw', newPassword);
      setUserPassword(newPassword);
    }
    return data;
  };

  const resetForgotPassword = async (email, resetToken, newPassword) => {
    const data = await api.forgotPasswordReset(email, resetToken, newPassword);
    if (!data.error && data.token) {
      localStorage.setItem(`user_pw_${email.toLowerCase()}`, newPassword);
      sessionStorage.setItem('current_user_pw', newPassword);
      setUserPassword(newPassword);
      await fetchCurrent();
    }
    return data;
  };

  const verifyPasswordChange = async (otp, newPassword) => {
    const data = await api.verifyPasswordChange(otp, newPassword);
    if (!data.error) {
      if (user?.email) {
        localStorage.setItem(`user_pw_${user.email.toLowerCase()}`, newPassword);
      }
      if (user?.id) {
        localStorage.setItem(`user_pw_${user.id}`, newPassword);
      }
      sessionStorage.setItem('current_user_pw', newPassword);
      setUserPassword(newPassword);
    }
    return data;
  };

  const resendPasswordChangeOtp = async () => {
    return await api.resendPasswordChangeOtp();
  };

  const signOut = async () => {
    api.logout();
    setUser(null);
    setProfile(null);
    setSession(null);
    setUserPassword('');
  };

  const requestDeleteAccount = async () => {
    return await api.requestDeleteAccount();
  };

  const resendDeleteAccountOtp = async () => {
    return await api.resendDeleteAccountOtp();
  };

  const confirmDeleteAccount = async (otp) => {
    const data = await api.confirmDeleteAccount(otp);
    if (!data.error) {
      api.logout();
      setUser(null);
      setProfile(null);
      setSession(null);
      setUserPassword('');
    }
    return data;
  };

  const deleteAccount = async (otp) => {
    if (otp) {
      return await confirmDeleteAccount(otp);
    }
    const data = await api.deleteAccount();
    if (!data.error) {
      api.logout();
      setUser(null);
      setProfile(null);
      setSession(null);
      setUserPassword('');
    }
    return data;
  };

  return /* @__PURE__ */ jsx(AuthContext.Provider, {
    value: {
      session,
      user,
      profile,
      userPassword,
      loading,
      signUp,
      signIn,
      verifyOtp,
      resendOtp,
      requestEmailChange,
      verifyEmailChange,
      resendEmailChangeOtp,
      requestPasswordChange,
      verifyPasswordOtp,
      setNewPasswordAfterVerify,
      resetForgotPassword,
      verifyPasswordChange,
      resendPasswordChangeOtp,
      signOut,
      requestDeleteAccount,
      resendDeleteAccountOtp,
      confirmDeleteAccount,
      deleteAccount,
      refreshProfile,
    },
    children,
  });
}
function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
export {
  AuthProvider,
  useAuth
};
