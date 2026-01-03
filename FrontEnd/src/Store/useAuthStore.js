import { create } from "zustand";
import { axiosInstance } from '../lib/axios.js';
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false ,
    isLoggingUp: false ,

    checkAuth: async() => {
        try {
          const res = await axiosInstance.get('/auth/check');
          set({authUser: res.data});
        } catch (error) {
            console.log("Error in authCheck", error);
            set({authUser: null});
        }finally{
            set({isCheckingAuth: false})
        }
    },

    signup: async (data) => {
        set({isSigningUp : true})
        try {
          const res = await axiosInstance.post('/auth/signup', data);
          set({authUser : res.data});

          toast.success("Account Created Successfully!");
        } catch (error) {
            console.error('Signup error:', error);
            const message = error?.response?.data?.message || error?.message || 'Signup failed';
            toast.error(message);
        }finally{
            set({ isSigningUp: false})
        }
    },

    login: async (data) => {
        set({isLoggingUp : true})
        try {
          const res = await axiosInstance.post('/auth/login', data);
          set({authUser : res.data});

          toast.success("Login Successfully");
        } catch (error) {
            console.error('Signup error:', error);
            const message = error?.response?.data?.message || error?.message || 'Login failed';
            toast.error(message);
        }finally{
            set({ isLoggingUp: false})
        }
    },

    logout: async (data) => {
        set({isLoggingUp : true})
        try {
          await axiosInstance.post('/auth/logout');
          set({authUser : null});

          toast.success("Logged out Successfully");
        } catch (error) {
            console.error('Logout out:', error);
            const message = error?.response?.data?.message || error?.message || 'Logout failed';
            toast.error(message);
        } finally {
            set({ isLoggingUp: false })
        }
    }
}));