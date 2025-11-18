import React from 'react';
import { Search, Settings, User, Users } from 'lucide-react';

// ConversationItem Component
const ConversationItem = ({ chat, isSelected, onClick, unseenCount }) => {
  return (
    <div
      onClick={onClick}
      className={`p-3 md:p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors ${
        isSelected ? 'bg-gray-800 border-l-4 border-blue-500' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative flex-shrink-0">
          <div
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-semibold text-sm ${
              chat.isGroup ? 'bg-purple-600' : 'bg-blue-600'
            }`}
          >
            {chat.isGroup ? (
              <Users size={16} className="md:w-5 md:h-5" />
            ) : (
              chat.avatar
            )}
          </div>

          {chat.online && !chat.isGroup && (
            <div className="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 border-2 border-black rounded-full"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-white truncate text-sm md:text-base">
              {chat.username}
            </h3>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {chat.time}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs md:text-sm text-gray-400 truncate pr-2">
              {chat.lastMessage}
            </p>

            {/* FIXED — Custom unseen message count */}
            {unseenCount > 0 && (
              <span className="flex-shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-blue-500 text-white text-xs rounded-full min-w-[18px] md:min-w-[20px] text-center">
                {unseenCount > 99 ? '99+' : unseenCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Sidebar Component
const Sidebar = ({
  conversations,
  selectedChat,
  setSelectedChat,
  searchTerm,
  setSearchTerm,
  unseenCounts, 
}) => {
  return (
    <div className="h-full bg-black border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h1 className="text-lg md:text-xl font-bold text-blue-400">
            ChatApp
          </h1>
          <div className="flex items-center space-x-1 md:space-x-2">
            <button className="p-1.5 md:p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Settings
                size={18}
                className="text-gray-400 md:w-5 md:h-5"
              />
            </button>
            <button className="p-1.5 md:p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <User size={18} className="text-gray-400 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-2.5 md:top-3 text-gray-500"
            size={14}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((chat) => (
          <ConversationItem
            key={chat._id}
            chat={chat}
            isSelected={selectedChat === chat._id}
            onClick={() => setSelectedChat(chat._id)}
            unseenCount={unseenCounts?.[chat._id] || 0} 
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
