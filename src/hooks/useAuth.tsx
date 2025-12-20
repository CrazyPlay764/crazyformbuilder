import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  checkDisplayNameAvailable: (displayName: string) => Promise<boolean>;
  deleteAccount: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!error && data) {
      setProfile(data);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkDisplayNameAvailable = async (displayName: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc('is_display_name_taken', { name: displayName });
    if (error) {
      console.error('Error checking display name:', error);
      return false; // Assume taken on error to be safe
    }
    return !data; // Return true if NOT taken
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    // Check if display name is already taken
    const isAvailable = await checkDisplayNameAvailable(displayName);
    if (!isAvailable) {
      return { error: new Error('This name is already taken. Please choose a different name.') };
    }

    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl }
    });
    
    if (!error && data.user) {
      // Create profile with display name
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          email: email,
          display_name: displayName
        });
      
      if (profileError) {
        console.error('Failed to create profile:', profileError);
        // If profile creation fails due to unique constraint, show friendly error
        if (profileError.message?.includes('duplicate') || profileError.code === '23505') {
          return { error: new Error('This name is already taken. Please choose a different name.') };
        }
      } else {
        setProfile({
          id: '',
          user_id: data.user.id,
          email: email,
          display_name: displayName
        });
      }
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateDisplayName = async (displayName: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    // Check if display name is already taken (by someone else)
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .maybeSingle();
    
    // Only check availability if the name is different from current
    if (currentProfile?.display_name?.toLowerCase() !== displayName.toLowerCase()) {
      const isAvailable = await checkDisplayNameAvailable(displayName);
      if (!isAvailable) {
        return { error: new Error('This name is already taken. Please choose a different name.') };
      }
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('user_id', user.id);
    
    if (!error) {
      setProfile(prev => prev ? { ...prev, display_name: displayName } : null);
    }
    
    return { error };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth?mode=reset`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  const deleteAccount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { error: new Error('Not authenticated') };
      }

      const response = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) {
        return { error: new Error(response.error.message || 'Failed to delete account') };
      }

      // Sign out after successful deletion
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Failed to delete account') };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signOut, updateDisplayName, resetPassword, updatePassword, checkDisplayNameAvailable, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
