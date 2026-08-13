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
    if (!data.error) {
      localStorage.setItem(`user_pw_${email.toLowerCase()}`, password);
      setUserPassword(password);
      await fetchCurrent();
    }
    return data;
  };

  const signIn = async (email, password) => {
    const data = await api.login(email, password);
    if (!data.error) {
      localStorage.setItem(`user_pw_${email.toLowerCase()}`, password);
      setUserPassword(password);
      await fetchCurrent();
    }
    return data;
  };

  const signOut = async () => {
    api.logout();
    setUser(null);
    setProfile(null);
    setSession(null);
    setUserPassword('');
  };

  const deleteAccount = async () => {
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

  return /* @__PURE__ */ jsx(AuthContext.Provider, { value: { session, user, profile, userPassword, loading, signUp, signIn, signOut, deleteAccount, refreshProfile }, children });
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
