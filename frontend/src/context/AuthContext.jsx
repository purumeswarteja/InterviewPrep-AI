import { jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
const AuthContext = createContext(void 0);
function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchCurrent = useCallback(async () => {
    const data = await api.fetchCurrent();
    if (!data.error && data.user) {
      setUser(data.user);
      setProfile(data.profile || null);
      setSession(data.user);
    } else {
      setUser(null);
      setProfile(null);
      setSession(null);
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
      await fetchCurrent();
    }
    return data;
  };
  const signIn = async (email, password) => {
    const data = await api.login(email, password);
    if (!data.error) {
      await fetchCurrent();
    }
    return data;
  };
  const signOut = async () => {
    api.logout();
    setUser(null);
    setProfile(null);
    setSession(null);
  };
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value: { session, user, profile, loading, signUp, signIn, signOut, refreshProfile }, children });
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
