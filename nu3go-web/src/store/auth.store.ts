import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, AuthTokens } from "@/types";
import api from "@/lib/api";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User) => void;
    fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, _get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            setUser: (user) => set({ user, isAuthenticated: true }),

            login: async (email, password) => {
                set({ isLoading: true });
                try {
                    const response = await api.post<AuthTokens>("/auth/login", {
                        email,
                        password,
                    });

                    const tokens = (response as unknown as { data: AuthTokens }).data;
                    localStorage.setItem("nu3go_access_token", tokens.accessToken);
                    localStorage.setItem("nu3go_refresh_token", tokens.refreshToken);

                    // Fetch user profile after login
                    const userRes = await api.get<User>("/auth/me");
                    const user = (userRes as unknown as { data: User }).data;

                    set({ user, isAuthenticated: true, isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await api.post("/auth/logout");
                } catch {
                    // Silently fail
                } finally {
                    localStorage.removeItem("nu3go_access_token");
                    localStorage.removeItem("nu3go_refresh_token");
                    set({ user: null, isAuthenticated: false });
                }
            },

            fetchMe: async () => {
                set({ isLoading: true });
                try {
                    const res = await api.get<User>("/auth/me");
                    const user = (res as unknown as { data: User }).data;
                    set({ user, isAuthenticated: true, isLoading: false });
                } catch {
                    set({ isLoading: false, isAuthenticated: false });
                }
            },
        }),
        {
            name: "nu3go-auth",
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);
