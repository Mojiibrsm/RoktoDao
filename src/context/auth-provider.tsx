
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Donor } from '@/lib/types';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const donorRef = doc(db, 'donors', currentUser.uid);
        const docSnap = await getDoc(donorRef);
        if (docSnap.exists()) {
          const donorData = { id: docSnap.id, ...docSnap.data() } as Donor;
          setDonorProfile(donorData);
          setIsAdmin(!!donorData.isAdmin);
        } else {
          setDonorProfile(null);
          setIsAdmin(false);
        }
      } else {
        setDonorProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOutUser = async () => {
    await signOut(auth);
  };

  const value = { user, donorProfile, setDonorProfile, loading, signOutUser, isAdmin };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

    