import { useEffect, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { User } from '../types';

function mapUser(authUser: SupabaseUser): User {
  return {
    uid: authUser.id,
    displayName: authUser.user_metadata.full_name || authUser.user_metadata.name || null,
    email: authUser.email ?? null,
    photoURL: authUser.user_metadata.avatar_url || null,
    emailVerified: Boolean(authUser.email_confirmed_at),
    pendingEmail: authUser.new_email ?? null,
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapUser(session.user) : null);
      setLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    const redirectTo = `${window.location.origin}${window.location.pathname}${window.location.search}`;
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    if (error) throw error;
  };

  const signInAnonymously = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.auth.signInAnonymously({ options: { data: { origen: 'publicar_auto' } } });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return { user, loading, signInWithGoogle, signInAnonymously, signOut, isCloudAuthAvailable: isSupabaseConfigured };
}
