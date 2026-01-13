import { create } from "zustand";
import { axiosInstance } from '../lib/axios.js';
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingUp: false,
    socket: null,
    onlineUsers: [],

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get('/auth/check');
            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            console.log("Error in authCheck", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false })
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true })
        try {
            const res = await axiosInstance.post('/auth/signup', data);
            set({ authUser: res.data });

            toast.success("Account Created Successfully!");

            get().connectSocket();
        } catch (error) {
            console.error('Signup error:', error);
            const message = error?.response?.data?.message || error?.message || 'Signup failed';
            toast.error(message);
        } finally {
            set({ isSigningUp: false })
        }
    },

    login: async (data) => {
        set({ isLoggingUp: true })
        try {
            const res = await axiosInstance.post('/auth/login', data);
            set({ authUser: res.data });

            get().connectSocket();

            toast.success("Login Successfully");
        } catch (error) {
            console.error('Signup error:', error);
            const message = error?.response?.data?.message || error?.message || 'Login failed';
            toast.error(message);
        } finally {
            set({ isLoggingUp: false })
        }
    },

    logout: async (data) => {
        set({ isLoggingUp: true })
        try {
            await axiosInstance.post('/auth/logout');
            set({ authUser: null });

            toast.success("Logged out Successfully");

            get().disconnectSocket();
        } catch (error) {
            console.error('Logout out:', error);
            const message = error?.response?.data?.message || error?.message || 'Logout failed';
            toast.error(message);
        } finally {
            set({ isLoggingUp: false })
        }
    },

    updateProfile: async (data) => {
        try {
            const res = await axiosInstance.put('/auth/update-profile', data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("Error in update profile:", error);
            toast.error(error.response.data.message);
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            withCredentials: true,// this ensures cookies are sent with the connection
        });

        socket.connect();

        set({ socket });

        // listen for online users event
        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds })
        })
    },

    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    },

}));