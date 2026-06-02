'use client';
import { create } from 'zustand';
import { User } from 'firebase/auth';
import type { UserModel } from '@/types';

interface AuthState {
  firebaseUser: User | null;
  userDoc: UserModel | null;
  loading: boolean;
  setFirebaseUser: (user: User | null) => void;
  setUserDoc: (doc: UserModel | null) => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  userDoc: null,
  loading: true,
  setFirebaseUser: (user) => set({ firebaseUser: user }),
  setUserDoc: (doc) => set({ userDoc: doc }),
  setLoading: (v) => set({ loading: v }),
}));
