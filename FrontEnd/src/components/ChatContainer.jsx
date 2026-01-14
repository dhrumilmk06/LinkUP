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
    setEditingMessage, } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null)

  useEffect(() => {
    // if (selectedUser && selectedUser._id) {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages()

    //cleanup function
    return () => {
      // clean up
      unsubscribeFromMessages();
      setEditingMessage(null); // reset editingMessage when leaving chat
    };
  }, [
    selectedUser,
    getMessagesByUserId,
    subscribeToMessages,
    unsubscribeFromMessages,
    setEditingMessage,
  ]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages])



  return (
    <>
      <ChatHeader />
      <div className='flex-1 px-6 overflow-y-auto py-8'>
        {messages.length > 0 && !isMessageLoading ? (
          <div className='max-w-3xl mx-auto space-y-6'>
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${String(msg.senderId) === String(authUser?._id) ? "chat-end" : "chat-start"}`}>

                <div
                  className={`chat-bubble relative group ${String(msg.senderId) === String(authUser?._id) ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-200"}`}>

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
            <div ref={messageEndRef} />
          </div>
        ) : isMessageLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser?.name || ""} />
        )}
      </div>
      <MessageInput />
    </>
  )
}

export default ChatContainer