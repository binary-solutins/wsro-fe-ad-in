import { atom } from 'jotai';
import type { AuthState } from '../types';

export const authAtom = atom<AuthState>({
  token: null,
  user: null,
  isAuthenticated: false,
});