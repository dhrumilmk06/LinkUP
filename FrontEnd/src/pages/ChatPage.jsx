import React from 'react'
import { useAuthStore } from '../Store/useAuthStore'

const ChatPage = () => {
  const { logout } = useAuthStore(); 
  return (
    <div className='z-10'>
      ChatPage
      <button onClick={logout} >logout</button>
    </div>
  )
}

export default ChatPage