import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const fetchProfile = useCallback(async (userId) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
        setProfile(data);
    }, []);
    const refreshProfile = useCallback(async () => {
        if (user)
            await fetchProfile(user.id);
    }, [user, fetchProfile]);
    useEffect(() => {
        let mounted = true;
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted)
                return;
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id).finally(() => mounted && setLoading(false));
            }
            else {
                setLoading(false);
            }
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            (async () => {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id);
                }
                else {
                    setProfile(null);
                }
                setLoading(false);
            })();
        });
        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);
    const signUp = async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
        });
        if (!error && data.user) {
            await supabase.from('profiles').insert({
                user_id: data.user.id,
                full_name: fullName,
            });
        }
        return { error };
    };
    const signIn = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };
    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
    };
    return (_jsx(AuthContext.Provider, { value: { session, user, profile, loading, signUp, signIn, signOut, refreshProfile }, children: children }));
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
