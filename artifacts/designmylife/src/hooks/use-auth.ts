import { create } from "zustand";

interface AuthState {
  token: string | null;
  user: any | null;
  setAuth: (token: string, user: any) => void;
  logout: () => void;
}

const getStoredToken = () => {
  try {
    return localStorage.getItem("dml_token");
  } catch (err) {
    return null;
  }
};

export const useAuth = create<AuthState>((set) => ({
  token: getStoredToken(),
  user: null,
  setAuth: (token, user) => {
    localStorage.setItem("dml_token", token);
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem("dml_token");
    set({ token: null, user: null });
  },
}));
