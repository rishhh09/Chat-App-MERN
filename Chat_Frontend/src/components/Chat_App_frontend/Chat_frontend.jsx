import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import axios from 'axios';

const Chat_frontend = ({ socket, currentUserId }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);

  // ✅ Step 1: Fetch all users (conversations)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/user/all");
        setConversations(response.data.users); 
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  // ✅ Step 2: Fetch messages when a chat is selected
  useEffect(() => {
     if (!selectedChat) {
      setMessages([]); // clear when no chat selected
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/messages/${selectedChat}`);
        const data = Array.isArray(response.data) ? response.data : (response.data.message ?? response.data)
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  // ✅ Step 3: Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

     const handler = (newMessage) => {
      const senderId = newMessage?.sender?._id ?? newMessage?.sender ?? newMessage?.senderId;
      const receiverId = newMessage?.receiver?._id ?? newMessage?.receiver ?? newMessage?.receiverId;

      // compare as strings
      if (String(senderId) === String(selectedChat) || String(receiverId) === String(selectedChat)) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.on("receiveMessage", handler);

    return () => {
      socket.off("receiveMessage", handler);
    };
  }, [selectedChat, socket]);

  // ✅ Step 4: Send message (require sender + consistent local message shape)
  const handleSendMessage = () => {
    if (!selectedChat) {
      console.warn('No chat selected, abort send');
      return;
    }
    if (!currentUserId) {
      console.warn('No currentUserId, abort send');
      return;
    }
    if (!message.trim()) return;

    const payload = {
      sender: currentUserId,        // ensure backend required field present
      receiver: selectedChat,
      text: message.trim(),
    };

    console.log('emit sendMessage payload', payload);
    socket.emit("sendMessage", payload);

    // optimistic local message shaped like server document
    const localMsg = {
      _id: Date.now().toString(),
      sender: { _id: currentUserId },
      receiver: selectedChat,
      text: message.trim(),
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, localMsg]);
    setMessage('');
  };

  const handleKeyPress = (e) => {
  if (e.key === "Enter") {
    sendMessage(); // your send function
  }
};

  // ✅ Mobile handlers
  const handleChatSelect = (chatId) => {
    setSelectedChat(chatId);
    setIsMobileView(true);
  };

  const handleBackToSidebar = () => {
    setIsMobileView(false);
  };

  const selectedConversation = conversations.find((conv) => conv._id === selectedChat || conv.id === selectedChat);

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <div className={`${isMobileView ? 'hidden' : 'block'} md:block w-full md:w-80 lg:w-96 xl:w-80`}>
        <Sidebar 
          conversations={conversations}
          selectedChat={selectedChat}
          setSelectedChat={handleChatSelect}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>

      {/* Chat Area */}
      <div className={`${!isMobileView ? 'hidden' : 'block'} md:block flex-1 min-w-0`}>
        {selectedConversation ? (
          <ChatArea
            selectedConversation={selectedConversation}
            currentMessages={messages}
            message={message}
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
            onKeyDown={handleKeyPress}
            onBackToSidebar={handleBackToSidebar}
            isMobile={isMobileView}
            currentUserId={currentUserId}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat_frontend;
