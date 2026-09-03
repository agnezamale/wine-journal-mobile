import { useEffect, useState } from "react";
import type {Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({data: {session: currentSession}}) => {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            setLoading(false);
        });
        const { data: {subscription}} = supabase.auth.onAuthStateChange(
            (_event, nextSession) => {
                setSession(nextSession);
                setUser(nextSession?.user ?? null);
                setLoading(false);
            },
        );

        return () => subscription.unsubscribe();
    }, []);

    const signIn = (email: string, password: string) => 
        supabase.auth.signInWithPassword({email, password});

    const signUp = (email: string, password: string, username: string) =>
        supabase.auth.signUp({
            email,
            password,
            options:{
                data: {username: username.trim()},
            },
        });

    const signOut = () => supabase.auth.signOut();

    return {user, session, loading, signIn, signUp, signOut};
}