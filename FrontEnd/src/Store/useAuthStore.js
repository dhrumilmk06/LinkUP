import { create } from "zustand";

export const useAuthStore = create((set) => ({
    authUser: { name: "DK", _id: "123", age: 25 },
    isLoggedIn: false,
    isLoding: false,

    login: () => {
        console.log("We just Logged in");
        set({ isLoggedIn: true, isLoding: true });
    },
}));