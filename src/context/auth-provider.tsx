
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import type { Donor } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  donorProfile: Donor | null;
  setDonorProfile: React.Dispatch<React.SetStateAction<Donor | null>>;
  isAdmin: boolean;
  loading: boolean;
  signOutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [donorProfile, setDonorProfile] = useState<Donor | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDonorProfile = async (currentUser: User) => {
    try {
      const { data: donorData, error } = await supabase
        .from('donors')
        .select('*')
        .eq('uid', currentUser.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // Ignore "row not found" error
        throw error;
      }
      
      if (donorData) {
        setDonorProfile(donorData as Donor);
        setIsAdmin(!!donorData.isAdmin);
      } else {
         console.log(`No donor profile found for UID: ${currentUser.id}.`);
         setDonorProfile(null);
         setIsAdmin(false);
      }
    } catch (e) {
      console.error("Error fetching donor profile:", e);
      setDonorProfile(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        await fetchDonorProfile(session.user);
      }
      setLoading(false);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchDonorProfile(currentUser);
        } else {
          setDonorProfile(null);
          setIsAdmin(false);
        }
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            if (currentUser) {
                 await fetchDonorProfile(currentUser);
            }
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);


  const signOutUser = async () => {
    await supabase.auth.signOut();
    // State will be cleared by onAuthStateChanged listener
    router.push('/login');
  };

  const value = { user, donorProfile, setDonorProfile, loading, signOutUser, isAdmin };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
