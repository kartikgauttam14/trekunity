import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/index.js';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            isLoading: false,

            setUser: (user, accessToken) => {
                if (accessToken) localStorage.setItem('access_token', accessToken);
                set({ user, accessToken });
            },

            login: async (credentials) => {
                set({ isLoading: true });
                try {
                    const res = await authApi.login(credentials);
                    const { user, accessToken } = res.data;
                    localStorage.setItem('access_token', accessToken);
                    set({ user, accessToken, isLoading: false });
                    return { success: true };
                } catch (err) {
                    set({ isLoading: false });
                    return { success: false, message: err.response?.data?.message || 'Login failed.' };
                }
            },

            register: async (data) => {
                set({ isLoading: true });
                try {
                    const res = await authApi.register(data);
                    const { user, accessToken } = res.data;
                    localStorage.setItem('access_token', accessToken);
                    set({ user, accessToken, isLoading: false });
                    return { success: true };
                } catch (err) {
                    set({ isLoading: false });
                    return { success: false, message: err.response?.data?.message || 'Registration failed.' };
                }
            },

            logout: async () => {
                try { await authApi.logout(); } catch { }
                localStorage.removeItem('access_token');
                set({ user: null, accessToken: null });
            },

            fetchMe: async () => {
                const token = localStorage.getItem('access_token');
                if (!token) return;
                try {
                    const res = await authApi.me();
                    set({ user: res.data.user });
                } catch {
                    localStorage.removeItem('access_token');
                    set({ user: null, accessToken: null });
                }
            },

            isAuthenticated: () => !!get().user,
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
        }
    )
);
