
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useTranslation } from 'react-i18next';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.user_metadata?.language) {
        i18n.changeLanguage(session.user.user_metadata.language);
      }
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user?.user_metadata?.language) {
          i18n.changeLanguage(session.user.user_metadata.language);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [i18n]);

  const signUp = async (email, password, language) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          preferred_language: language,
        },
        emailRedirectTo: `${window.location.origin}/`, 
      },
    });
    if (!error && data.user) {
        await supabase
        .from('profiles')
        .insert([{ id: data.user.id, preferred_language: language, email: data.user.email }]);
    }
    return { user: data.user, session: data.session, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { user: data.user, session: data.session, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const sendPasswordResetEmail = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    return { data, error };
  };

  const updateUserPassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    return { data, error };
  };
  
  const updateUserLanguage = async (language) => {
    if (!user) return { error: { message: "User not authenticated" }};
    const { data, error } = await supabase.auth.updateUser({
        data: { preferred_language: language }
    });

    if (!error && data.user) {
        // Also update in your 'profiles' table if you have one
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ preferred_language: language })
            .eq('id', user.id);
        if (profileError) return { data: null, error: profileError };
        
        i18n.changeLanguage(language); // Change language in i18next
        setUser(data.user); // Update local user state
    }
    return { data, error };
  };

  const value = {
    session,
    user,
    signUp,
    signIn,
    signOut,
    sendPasswordResetEmail,
    updateUserPassword,
    updateUserLanguage,
    loading,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
  