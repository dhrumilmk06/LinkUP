import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";


export const useChatStore = create((set, get) => ({
    allContacts: [],
    chats: [],
    messages: [],
    activeTab: "chats",
    selectedUser: null,
    isUserLoading: false,
    isMessageLoading: false,
    isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

    // edit message state
    editingMessage: null,
    setEditingMessage: (message) => set({ editingMessage: message }),


    toggleSound: () => {
        localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
        set({ isSoundEnabled: !get().isSoundEnabled })
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedUser: (selectedUser) => set({ selectedUser }),

    getAllConatacts: async () => {
        set({ isUserLoading: true });
        try {
            const res = await axiosInstance.get('/message/contacts')
            set({ allContacts: res.data })
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            set({ isUserLoading: false })
        }
    },

    getMyChatPartners: async () => {
        set({ isUserLoading: true });
        try {
            const res = await axiosInstance.get('/message/chats')
            set({ chats: res.data })
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            set({ isUserLoading: false })
        }
    },

    getMessagesByUserId: async (userId) => {

        set({ isMessageLoading: true });

        try {
            const res = await axiosInstance.get(`/message/${userId}`);
            set({ messages: res.data })
        } catch (error) {
            toast.error(error.response?.data?.message || "Somthing Went Wrong");
        } finally {
            set({ isMessageLoading: false });
        }
    },

    sendMessage: async ({ text, image }) => {
        const { selectedUser, messages, editingMessage } = get();
        const { authUser } = useAuthStore.getState();
        const tempId = Date.now();

        if (!selectedUser || !authUser) {
            console.error("SendMessage Error: Missing user or authUser", { selectedUser, authUser });
            return;
        }

        if (!selectedUser) return;
        if (!text?.trim() && !image) return;

        // prevent send message on editing message
        if (editingMessage) {
            get().editMessage(editingMessage._id, text);
            set({ editingMessage: null });
            return;
        }

        const optimisticMessage = {
            _id: tempId,
            senderId: authUser._id,
            receiverId: selectedUser._id,
            text: text,
            image: image,
            createdAt: new Date().toISOString(),
            isOptimistic: true,
        };

        set({ messages: [...messages, optimisticMessage] });

        try {
            const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, { text, image });
            set((state) => ({
                messages: state.messages.map((msg) => (msg._id === tempId ? res.data : msg)),
            }));
        } catch (error) {
            set((state) => ({
                messages: state.messages.filter((msg) => msg._id !== tempId),
            }));
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    },

    deleteMessage: async (messageId) => {
        const { messages } = get();
        // Optimistic update
        set({ messages: messages.filter((msg) => msg._id !== messageId) });

        try {
            await axiosInstance.delete(`/message/delete/${messageId}`);
            toast.success("Message deleted successfully");
        } catch (error) {
            toast.error("Failed to delete message");
            // Revert changes if needed, or re-fetch messages
            set({ messages });
        }
    },

    editMessage: async (messageId, newText) => {
        const { messages } = get();
        // Optimistic update
        const originalMessages = [...messages];
        set({
            messages: messages.map((msg) =>
                msg._id === messageId ? { ...msg, text: newText, edited: true } : msg
            ),
        });

        try {
            const res = await axiosInstance.put(`/message/update/${messageId}`, {
                text: newText,
            });
            // Update with actual server response
            set({
                messages: get().messages.map((msg) =>
                    msg._id === messageId ? res.data : msg
                ),
            });
            toast.success("Message updated successfully");
        } catch (error) {
            toast.error("Failed to update message");
            set({ messages: originalMessages });
        }
    },

    subscribeToMessages: () => {
        const { selectedUser, isSoundEnabled } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {

            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;

            const currentMessages = get().messages;
            set({ messages: [...currentMessages, newMessage] })

            if (isSoundEnabled) {
                const notificationSound = new Audio("/sounds/notification.mp3");

                notificationSound.currentTime = 0; // reset to start
                notificationSound.play().catch((e) => console.log("Audio play failed:", e));
            }

        });

        socket.on("messageDeleted", ({ messageId }) => {
            set({ messages: get().messages.filter((msg) => msg._id !== messageId) });
        });

        socket.on("messageUpdated", (updatedMessage) => {
            const { selectedUser } = get();
            // Check if the update belongs to current chat conversation
            const isRelatedMessage =
                updatedMessage.senderId === selectedUser._id ||
                updatedMessage.receiverId === selectedUser._id;

            if (isRelatedMessage) {
                set({
                    messages: get().messages.map((msg) =>
                        msg._id === updatedMessage._id ? updatedMessage : msg
                    ),
                });
            }
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
        socket.off("messageDeleted");
        socket.off("messageUpdated");
    },
}))