import React, { useEffect, useRef } from 'react'
import { useChatStore } from '../store/useChatStore.js'
import { useAuthStore } from '../store/useAuthStore.js'
import ChatHeader from './ChatHeader'
import NoChatHistoryPlaceholder from './NoChatHistoryPlaceholder'
import MessagesLoadingSkeleton from './MessagesLoadingSkeleton'
import MessageInput from './MessageInput';
import { Edit, Trash } from "lucide-react";

const ChatContainer = () => {

  const { selectedUser, messages, getMessagesByUserId, isMessageLoading, subscribeToMessages, unsubscribeFromMessages, deleteMessage,
    setEditingMessage, subscribeToTypingEvents, unsubscribeFromTypingEvents, typingUsers } = useChatStore();

  const isTyping = typingUsers.includes(selectedUser?._id);
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null)

  useEffect(() => {
    // if (selectedUser && selectedUser._id) {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();
    subscribeToTypingEvents();

    //cleanup function
    return () => {
      // clean up
      unsubscribeFromMessages();
      unsubscribeFromTypingEvents();
      setEditingMessage(null); // reset editingMessage when leaving chat
    };
  }, [
    selectedUser,
    getMessagesByUserId,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToTypingEvents,
    unsubscribeFromTypingEvents,
    setEditingMessage,
  ]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages])



  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden">
      {/* BACKGROUND PATTERN */}
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      <ChatHeader />
      <div className='flex-1 px-6 overflow-y-auto py-8 relative z-10'>
        {messages.length > 0 && !isMessageLoading ? (
          <div className='max-w-3xl mx-auto space-y-6'>
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${String(msg.senderId) === String(authUser?._id) ? "chat-end" : "chat-start"}`}>

                <div
                  className={`chat-bubble relative group shadow-md flex flex-col gap-1 ${String(msg.senderId) === String(authUser?._id) ? "bg-gradient-to-b from-cyan-500 to-cyan-600 text-white rounded-2xl rounded-tr-none" : "bg-slate-800 text-slate-200 rounded-2xl rounded-tl-none"}`}>

                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Shared"
                      className="rounded-lg h-48 object-cover"
                    />
                  )}
                  {msg.text && (
                    <div>
                      <p className="mt-2">{msg.text}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-x-1.5">
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <div>
                      {msg.edited && (
                        <span className="text-xs text-gray-100 opacity-75">
                          (edited)
                        </span>
                      )}
                    </div>
                  </div>

                  {msg.senderId === authUser._id && (
                    <div className="absolute -bottom-5 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 text-gray-400">
                      <button onClick={() => deleteMessage(msg._id)}>
                        <Trash size={15} />
                      </button>
                      <button onClick={() => setEditingMessage(msg)}>
                        <Edit size={15} />
                      </button>
                    </div>
                  )}


                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat chat-start">
                <div className="chat-bubble bg-slate-800 text-slate-200">
                  <span className="loading loading-dots loading-xs"></span>
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>
        ) : isMessageLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser?.name || ""} />
        )}
      </div>
      <MessageInput />
    </div>
  )
}

export default ChatContainer