import { create } from 'zustand';

const STORAGE_KEY = 'family-node-auth';

const loadAuthState = () => {
  if (typeof window === 'undefined') {
    return { user: null, token: null };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { user: null, token: null };
  } catch (error) {
    console.error('Auth store load error:', error);
    return { user: null, token: null };
  }
};

const saveAuthState = (state) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: state.user, token: state.token }));
  } catch (error) {
    console.error('Auth store save error:', error);
  }
};

const initialState = loadAuthState();

const useAuthStore = create((set) => ({
  user: initialState.user,
  token: initialState.token,
  setAuth: (user, token) => {
    saveAuthState({ user, token });
    set({ user, token });
  },
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ user: null, token: null });
  },
}));

export default useAuthStore;

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved)?.token : null;
  } catch (error) {
    console.error('Auth token read error:', error);
    return null;
  }
};
