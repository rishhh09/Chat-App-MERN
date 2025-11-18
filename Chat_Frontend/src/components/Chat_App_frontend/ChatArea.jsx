import React, { useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, Users, Smile, Paperclip, Mic, ArrowLeft } from 'lucide-react';

// ChatHeader Component
const ChatHeader = ({ selectedConversation, onBackToSidebar, isMobile }) => {
  return (
    <div className="p-3 md:p-4 bg-black border-b border-gray-800 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Back button for mobile */}
          {isMobile && (
            <button 
              onClick={onBackToSidebar}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors md:hidden"
            >
              <ArrowLeft size={20} className="text-gray-400" />
            </button>
          )}
          <div className="relative flex-shrink-0">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
              selectedConversation?.isGroup ? 'bg-purple-600' : 'bg-blue-600'
            }`}>
              {selectedConversation?.isGroup ? <Users size={16} className="md:w-5 md:h-5" /> : selectedConversation?.avatar}
            </div>
            {selectedConversation?.online && !selectedConversation?.isGroup && (
              <div className="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 border-2 border-black rounded-full"></div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-white text-sm md:text-base truncate">{selectedConversation?.username || 'Select a chat'}</h2>
            <p className={`text-xs md:text-sm ${selectedConversation?.online ? 'text-green-400' : 'text-gray-400'}`}>
              {selectedConversation?.online ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 md:space-x-2">
          <button className="p-1.5 md:p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Phone size={16} className="text-gray-400 md:w-5 md:h-5" />
          </button>
          <button className="p-1.5 md:p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Video size={16} className="text-gray-400 md:w-5 md:h-5" />
          </button>
          <button className="p-1.5 md:p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <MoreVertical size={16} className="text-gray-400 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// MessageBubble Component
const MessageBubble = ({ message, currentUserId }) => {
  const senderId = message?.sender?._id ?? message?.sender ?? message?.senderId;
  const isOwn = String(senderId) === String(currentUserId);

  const getTickIcon = () => {
    if (!isOwn) return null;

    if (message.seen) {
      return <span className="flex items-center text-blue-400 text-sm">✓✓</span>;
    }
    if (message.delivered) {
      return <span className="flex items-center text-gray-300 text-sm">✓✓</span>;
    }
    return <span className="flex items-center text-gray-400 text-sm">✓</span>;
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-1`}>
      <div
        className={`max-w-[280px] sm:max-w-xs md:max-w-sm lg:max-w-md px-3 md:px-4 py-2 rounded-lg ${
          isOwn
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-800 text-white rounded-bl-sm'
        }`}
      >
        <p className="text-sm break-words">{message.text}</p>

        <p
          className={`text-xs mt-1 flex items-center gap-1 ${
            isOwn ? 'text-blue-200' : 'text-gray-400'
          }`}
        >
          {message.createdAt
            ? new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : message.time ?? ""}

          {getTickIcon()}
        </p>
      </div>
    </div>
  );
};

// MessagesArea Component
const MessagesArea = ({ messages, currentUserId }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-3 md:space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p className="text-center">Select a conversation to start messaging</p>
        </div>
      ) : (
        <>
          {messages.map((msg) => (
            <MessageBubble key={msg._id} message={msg} currentUserId={currentUserId} />
          ))}

          {/* auto-scroll anchor */}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
};

// MessageInput Component
const MessageInput = ({ message, setMessage, handleSendMessage, handleKeyPress }) => {
  return (
    <div className="p-3 md:p-4 bg-black border-t border-gray-800 flex-shrink-0">
      <div className="flex items-end space-x-2">
        <button className="hidden sm:block p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <Paperclip size={18} className="text-gray-400 md:w-5 md:h-5" />
        </button>

        <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 focus-within:border-blue-500">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="w-full p-2.5 md:p-3 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-sm md:text-base"
            rows="1"
            style={{ minHeight: '40px', maxHeight: '100px' }}
          />
        </div>

        <div className="flex items-center space-x-1">
          <button className="hidden sm:block p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Smile size={18} className="text-gray-400 md:w-5 md:h-5" />
          </button>

          <button className="hidden sm:block p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Mic size={18} className="text-gray-400 md:w-5 md:h-5" />
          </button>

          <button
            onClick={handleSendMessage}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Send size={18} className="text-white md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Main ChatArea Component
const ChatArea = ({
  selectedConversation,
  currentMessages,
  message,
  setMessage,
  handleSendMessage,
  handleKeyPress,
  onBackToSidebar,
  isMobile,
  currentUserId
}) => {
  return (
    <div className="h-full flex flex-col bg-gray-900">
      <ChatHeader
        selectedConversation={selectedConversation}
        onBackToSidebar={onBackToSidebar}
        isMobile={isMobile}
      />

      <MessagesArea messages={currentMessages} currentUserId={currentUserId} />

      <MessageInput
        message={message}
        setMessage={setMessage}
        handleSendMessage={handleSendMessage}
        handleKeyPress={handleKeyPress}
      />
    </div>
  );
};

export default ChatArea;
