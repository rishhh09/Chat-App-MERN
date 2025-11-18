import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import API from '../../api';

const Chat_frontend = ({ socket, currentUserId }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const [unseenCounts, setUnseenCounts] = useState({});

  // 1) Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get('/api/user/all');
        setConversations(res.data.users);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  // 2) Fetch unseen counts
  const fetchUnseenCounts = async () => {
    if (!currentUserId) return;
    try {
      const res = await API.get(`/api/messages/unseen/${currentUserId}`);
      setUnseenCounts(res.data.unseen || {});
    } catch (err) {
      console.log("Failed to load unseen", err);
    }
  };

  useEffect(() => {
    fetchUnseenCounts();
  }, [currentUserId]);

  // 3) Fetch messages when selecting a chat
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await API.get(`/api/messages/${selectedChat}`);
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data.message ?? res.data);

        setMessages(data);

        // mark these messages as seen
        socket.emit("markSeen", {
          senderId: selectedChat,
          receiverId: currentUserId,
        });

        // reset unseen
        setUnseenCounts(prev => ({
          ...prev,
          [selectedChat]: 0
        }));

      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  // 4) Receive message
  useEffect(() => {
    if (!socket) return;

    const handler = (newMessage) => {
      const senderId = newMessage?.sender?._id ?? newMessage.sender;
      
      // message for open chat
      if (String(senderId) === String(selectedChat)) {
        setMessages(prev => [...prev, newMessage]);

        // mark as seen instantly
        socket.emit("markSeen", {
          senderId,
          receiverId: currentUserId
        });
        return;
      }

      // ignore messages YOU sent
      if (String(senderId) === String(currentUserId)) return;

      // increment unread count
      setUnseenCounts(prev => ({
        ...prev,
        [senderId]: (prev[senderId] || 0) + 1,
      }));
    };

    socket.on("receiveMessage", handler);
    return () => socket.off("receiveMessage", handler);
  }, [selectedChat, socket]);

  // 5) Delivered events
  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      setMessages(prev =>
        prev.map(m =>
          m._id === msg._id ? { ...m, delivered: true } : m
        )
      );
    };

    socket.on("messagesDelivered", handler);
    return () => socket.off("messagesDelivered", handler);
  }, [socket]);

  // 6) Seen events
  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      setMessages(prev =>
        prev.map(m =>
          m._id === msg._id ? { ...m, delivered: true, seen: true } : m
        )
      );
    };

    socket.on("messagesSeen", handler);
    return () => socket.off("messagesSeen", handler);
  }, [socket]);

  // 7) Send message
  const handleSendMessage = () => {
    if (!selectedChat || !currentUserId || !message.trim()) return;

    const payload = {
      sender: currentUserId,
      receiver: selectedChat,
      text: message.trim(),
    };

    socket.emit("sendMessage", payload);

    // optimistic message
    const tempMsg = {
      _id: Date.now().toString(),
      sender: { _id: currentUserId },
      receiver: selectedChat,
      text: message.trim(),
      createdAt: new Date().toISOString(),
      delivered: false,
      seen: false
    };

    setMessages(prev => [...prev, tempMsg]);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 8) Join socket room
  useEffect(() => {
    if (!socket) return;

    const join = () => {
      if (currentUserId) socket.emit("join", currentUserId);
    };

    if (socket.connected) join();

    socket.on("connect", join);
    socket.on("reconnect", join);

    return () => {
      socket.off("connect", join);
      socket.off("reconnect", join);
    };
  }, [socket, currentUserId]);

  // mobile
  const handleChatSelect = (chatId) => {
    setSelectedChat(chatId);
    setIsMobileView(true);
  };

  const handleBackToSidebar = () => {
    setIsMobileView(false);
  };

  const selectedConversation = conversations.find(c => c._id === selectedChat);

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      
      {/* Sidebar */}
      <div className={`${isMobileView ? "hidden" : "block"} md:block w-full md:w-80`}>
        <Sidebar
          conversations={conversations}
          selectedChat={selectedChat}
          setSelectedChat={handleChatSelect}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          unseenCounts={unseenCounts}
        />
      </div>

      {/* Chat Area */}
      <div className={`${!isMobileView ? "hidden" : "block"} md:block flex-1`}>
        {selectedConversation ? (
          <ChatArea
            selectedConversation={selectedConversation}
            currentMessages={messages}
            message={message}
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
            handleKeyPress={handleKeyPress}
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
