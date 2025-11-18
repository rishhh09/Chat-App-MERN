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

  // 1️ FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await API.get('/api/user/all');
        setConversations(response.data.users);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  // 2️ FETCH UNSEEN COUNTS

  const fetchUnseenCounts = async () => {
    if (!currentUserId) return;
    try {
      const res = await API.get(`/api/messages/unseen/${currentUserId}`);
      setUnseenCounts(res.data.unseen || {});
    } catch (err) {
      console.log("Failed to fetch unseen", err);
    }
  };

  useEffect(() => {
    fetchUnseenCounts();
  }, [currentUserId]);

  // 3️ FETCH MESSAGES WHEN A CHAT OPENS
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await API.get(`/api/messages/${selectedChat}`);
        const data = Array.isArray(response.data)
          ? response.data
          : (response.data.message ?? response.data);

        setMessages(data);

        // mark as seen (✓✓)
        socket.emit("markAsSeen", {
          senderId: selectedChat,
          receiverId: currentUserId,
        });

        // reset unseen count
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

  // 4️ SOCKET: RECEIVE MESSAGE
  useEffect(() => {
    if (!socket) return;

    const handler = (newMessage) => {
      const senderId = newMessage?.sender?._id ?? newMessage.sender;

      // If message belongs to opened chat → append
      if (String(senderId) === String(selectedChat)) {
        setMessages(prev => [...prev, newMessage]);
      } 
      else {
        // If message belongs to another chat → increment unseen
        setUnseenCounts(prev => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }
    };

    socket.on("receiveMessage", handler);
    return () => socket.off("receiveMessage", handler);
  }, [selectedChat, socket]);

  // 5️ SOCKET: MESSAGE DELIVERED (✓)
  useEffect(() => {
    if (!socket) return;

    const handler = ({ deliveredTo }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.receiver === deliveredTo ? { ...msg, delivered: true } : msg
        )
      );
    };

    socket.on("messagesDelivered", handler);
    return () => socket.off("messagesDelivered", handler);
  }, [socket]);

  // 6️ SOCKET: MESSAGE SEEN (✓✓)
  useEffect(() => {
    if (!socket) return;

    const handler = ({ by }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.receiver === by ? { ...msg, seen: true, delivered: true } : msg
        )
      );
    };

    socket.on("messagesSeen", handler);
    return () => socket.off("messagesSeen", handler);
  }, [socket]);

  // 7️ SEND MESSAGE
  const handleSendMessage = () => {
    if (!selectedChat) return;
    if (!currentUserId) return;
    if (!message.trim()) return;

    const payload = {
      sender: currentUserId,
      receiver: selectedChat,
      text: message.trim(),
    };

    socket.emit("sendMessage", payload);

    // add optimistic message with ✓ state pending
    const localMsg = {
      _id: Date.now().toString(),
      sender: { _id: currentUserId },
      receiver: selectedChat,
      text: message.trim(),
      createdAt: new Date().toISOString(),
      delivered: false,
      seen: false
    };

    setMessages(prev => [...prev, localMsg]);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 8️ SOCKET JOIN
  useEffect(() => {
    if (!socket) return;

    const emitJoin = () => {
      if (currentUserId) socket.emit('join', currentUserId);
    };

    if (socket.connected) emitJoin();

    socket.on('connect', emitJoin);
    socket.on('reconnect', emitJoin);

    return () => {
      socket.off('connect', emitJoin);
      socket.off('reconnect', emitJoin);
    };
  }, [socket, currentUserId]);

  // MOBILE HANDLERS
  const handleChatSelect = (chatId) => {
    setSelectedChat(chatId);
    setIsMobileView(true);
  };

  const handleBackToSidebar = () => {
    setIsMobileView(false);
  };

  const selectedConversation = conversations.find(
    conv => conv._id === selectedChat
  );

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
          unseenCounts={unseenCounts}    
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
