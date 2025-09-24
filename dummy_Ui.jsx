import React, { useState, useRef, useEffect } from 'react';

// Helper component for icons
const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d={path} clipRule="evenodd" />
    </svg>
);

const SearchIcon = () => <Icon path="M10 18a8 8 0 100-16 8 8 0 000 16zm-5.3-9.7a.7.7 0 011.4 0v1.6a.7.7 0 01-1.4 0v-1.6zm8.2 3.1a.7.7 0 01-1 1l-2.2-2.1a.7.7 0 011-1l2.2 2.1z" />;
const SendIcon = () => <Icon path="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />;
const MenuIcon = () => <Icon path="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" />;
const ChatBubbleIcon = () => <Icon path="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM4.125 4.5c-1.32 0-2.373 1.053-2.373 2.373v7.252c0 1.32 1.053 2.373 2.373 2.373h15.75c1.32 0 2.373-1.053 2.373-2.373V6.873c0-1.32-1.053-2.373-2.373-2.373H4.125z" />;
const UserGroupIcon = () => <Icon path="M18 18.75a3 3 0 00-3-3H9a3 3 0 00-3 3V21h12v-2.25zM12 12.75a3 3 0 100-6 3 3 0 000 6zM21 21v-2.25a3 3 0 00-3-3h-1.5a.75.75 0 000 1.5H18a1.5 1.5 0 011.5 1.5V21h1.5zM4.5 21v-2.25A1.5 1.5 0 016 17.25h1.5a.75.75 0 000-1.5H6a3 3 0 00-3 3V21h1.5z" />;
const UserCircleIcon = () => <Icon path="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />;

const initialContacts = [
    { id: 1, name: 'Aria Sharma', avatar: 'https://placehold.co/100x100/7F9CF5/FFFFFF?text=AS', lastMessage: 'See you tomorrow!', time: '9:30 PM', unread: 2 },
    { id: 2, name: 'Leo Gupta', avatar: 'https://placehold.co/100x100/A3BFFA/FFFFFF?text=LG', lastMessage: 'Sounds good!', time: '8:15 PM', unread: 0 },
    { id: 3, name: 'Zoya Khan', avatar: 'https://placehold.co/100x100/A3BFFA/FFFFFF?text=ZK', lastMessage: 'Haha, that\'s hilarious.', time: '6:45 PM', unread: 0 },
    { id: 4, name: 'Kabir Singh', avatar: 'https://placehold.co/100x100/A3BFFA/FFFFFF?text=KS', lastMessage: 'Okay, I will check.', time: 'Yesterday', unread: 1 },
    { id: 5, name: 'Nora Patel', avatar: 'https://placehold.co/100x100/A3BFFA/FFFFFF?text=NP', lastMessage: 'You sent a file.', time: 'Yesterday', unread: 0 },
];

const initialGroups = [
    { id: 101, name: 'Project Phoenix', avatar: 'https://placehold.co/100x100/F87171/FFFFFF?text=PP', lastMessage: 'Leo: Don\'t forget the deadline!', time: '7:05 PM', unread: 1 },
    { id: 102, name: 'Design Team', avatar: 'https://placehold.co/100x100/60A5FA/FFFFFF?text=DT', lastMessage: 'You: I\'ve updated the mockups.', time: 'Yesterday', unread: 0 },
    { id: 103, name: 'Weekend Gamers', avatar: 'https://placehold.co/100x100/34D399/FFFFFF?text=WG', lastMessage: 'Zoya: Anyone up for a match tonight?', time: 'Yesterday', unread: 5 },
];

const initialMessages = {
    1: [{ id: 1, text: 'Hey, how is the project going?', sender: 'Aria Sharma', timestamp: '9:15 PM', type: 'received' }, { id: 2, text: 'Hey Aria! Going great. Just finishing up the final module.', sender: 'You', timestamp: '9:16 PM', type: 'sent' }, { id: 3, text: 'Awesome! Let me know if you need any help.', sender: 'Aria Sharma', timestamp: '9:18 PM', type: 'received' }, { id: 4, text: 'Will do. Thanks! Should be done by tomorrow morning.', sender: 'You', timestamp: '9:19 PM', type: 'sent' }, { id: 5, text: 'Perfect! See you tomorrow!', sender: 'Aria Sharma', timestamp: '9:20 PM', type: 'received' },],
    2: [{ id: 1, text: 'Can we reschedule our meeting?', sender: 'Leo Gupta', timestamp: '8:10 PM', type: 'received' }, { id: 2, text: 'Sure, Leo. What time works for you?', sender: 'You', timestamp: '8:12 PM', type: 'sent' }, { id: 3, text: 'How about 3 PM tomorrow?', sender: 'Leo Gupta', timestamp: '8:14 PM', type: 'received' }, { id: 4, text: 'Sounds good!', sender: 'You', timestamp: '8:15 PM', type: 'sent' },],
    3: [], 4: [], 5: [],
    101: [{ id: 1, text: 'Hey team, what\'s the status on the Phoenix deployment?', sender: 'Kabir Singh', timestamp: '7:00 PM', type: 'received' }, { id: 2, text: 'I am pushing the final commits now.', sender: 'You', timestamp: '7:02 PM', type: 'sent' }, { id: 3, text: 'Don\'t forget the deadline!', sender: 'Leo Gupta', timestamp: '7:05 PM', type: 'received' },],
    102: [{ id: 1, text: 'I\'ve updated the mockups.', sender: 'You', timestamp: 'Yesterday', type: 'sent' }],
    103: [{ id: 1, text: 'Anyone up for a match tonight?', sender: 'Zoya Khan', timestamp: 'Yesterday', type: 'received' }],
};

const ContactList = ({ contacts, selectedChat, onSelect, setIsSidebarOpen }) => (
    <div className="flex flex-col h-full bg-gray-900">
        <div className="p-4 border-b border-gray-800"><h1 className="text-2xl font-bold text-white">Chats</h1><div className="relative mt-4"><input type="text" placeholder="Search contacts..." className="w-full py-2 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /><div className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon /></div></div></div>
        <div className="flex-grow overflow-y-auto">{contacts.map((contact) => (<div key={contact.id} onClick={() => { onSelect(contact); if (window.innerWidth < 768) setIsSidebarOpen(false); }} className={`flex items-center p-4 cursor-pointer hover:bg-gray-800 border-b border-gray-800 transition-colors duration-200 ${selectedChat?.id === contact.id ? 'bg-blue-900/50' : ''}`}><img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full mr-4" /><div className="flex-1 min-w-0"><div className="flex justify-between items-center"><p className="text-white font-semibold truncate">{contact.name}</p><p className="text-xs text-gray-400">{contact.time}</p></div><div className="flex justify-between items-center mt-1"><p className="text-sm text-gray-400 truncate">{contact.lastMessage}</p>{contact.unread > 0 && (<span className="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{contact.unread}</span>)}</div></div></div>))}</div>
    </div>
);

const GroupList = ({ groups, selectedChat, onSelect, setIsSidebarOpen }) => (
    <div className="flex flex-col h-full bg-gray-900">
        <div className="p-4 border-b border-gray-800"><h1 className="text-2xl font-bold text-white">Groups</h1><div className="relative mt-4"><input type="text" placeholder="Search groups..." className="w-full py-2 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /><div className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon /></div></div></div>
        <div className="flex-grow overflow-y-auto">{groups.map((group) => (<div key={group.id} onClick={() => { onSelect(group); if (window.innerWidth < 768) setIsSidebarOpen(false); }} className={`flex items-center p-4 cursor-pointer hover:bg-gray-800 border-b border-gray-800 transition-colors duration-200 ${selectedChat?.id === group.id ? 'bg-blue-900/50' : ''}`}><img src={group.avatar} alt={group.name} className="w-12 h-12 rounded-full mr-4" /><div className="flex-1 min-w-0"><div className="flex justify-between items-center"><p className="text-white font-semibold truncate">{group.name}</p><p className="text-xs text-gray-400">{group.time}</p></div><div className="flex justify-between items-center mt-1"><p className="text-sm text-gray-400 truncate">{group.lastMessage}</p>{group.unread > 0 && (<span className="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{group.unread}</span>)}</div></div></div>))}</div>
    </div>
);

const ChatWindow = ({ selectedChat, messages, newMessage, setNewMessage, handleSendMessage, messagesEndRef, setIsSidebarOpen }) => (
    <div className="flex flex-col h-full bg-black text-white">
        <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800"><div className="flex items-center"><button className="md:hidden mr-4 text-white" onClick={() => setIsSidebarOpen(prev => !prev)}><MenuIcon /></button><img src={selectedChat.avatar} alt={selectedChat.name} className="w-10 h-10 rounded-full mr-3" /><div><h2 className="text-lg font-semibold">{selectedChat.name}</h2><p className="text-sm text-gray-400">Online</p></div></div></div>
        <div className="flex-1 p-6 overflow-y-auto"><div className="space-y-6">{messages.map((message) => (<div key={message.id} className={`flex items-end gap-3 ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}>{message.type === 'received' && <img src={selectedChat.avatar} alt={selectedChat.name} className="w-8 h-8 rounded-full" />}<div className={`max-w-xs md:max-w-md lg:max-w-xl px-4 py-3 rounded-2xl ${message.type === 'sent' ? 'bg-blue-600 rounded-br-none' : 'bg-gray-800 rounded-bl-none'}`}><p className="text-sm">{message.text}</p><p className={`text-xs mt-1 ${message.type === 'sent' ? 'text-blue-200' : 'text-gray-400'}`}>{message.timestamp}</p></div></div>))}</div><div ref={messagesEndRef} /></div>
        <div className="p-4 bg-gray-900"><form onSubmit={handleSendMessage} className="flex items-center space-x-4"><input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 py-3 px-4 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" /><button type="submit" className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50" disabled={!newMessage.trim()}><SendIcon /></button></form></div>
    </div>
);

const NavigationSidebar = ({ activeView, setActiveView }) => (
    <div className="flex flex-col items-center h-full py-4 bg-gray-900 border-r border-gray-800">
        <div className="flex flex-col items-center space-y-6">
            <button onClick={() => setActiveView('chats')} title="Chats" className={`p-3 rounded-lg transition-colors duration-200 ${activeView === 'chats' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                <ChatBubbleIcon />
            </button>
            <button onClick={() => setActiveView('groups')} title="Groups" className={`p-3 rounded-lg transition-colors duration-200 ${activeView === 'groups' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                <UserGroupIcon />
            </button>
        </div>
        <div className="mt-auto">
            <button title="Profile" className="p-3 text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200">
                <UserCircleIcon />
            </button>
        </div>
    </div>
);

function App() {
    const [contacts, setContacts] = useState(initialContacts);
    const [groups, setGroups] = useState(initialGroups);
    const [selectedChat, setSelectedChat] = useState(contacts[0]);
    const [allMessages, setAllMessages] = useState(initialMessages);
    const [messages, setMessages] = useState(allMessages[selectedChat.id]);
    const [newMessage, setNewMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeView, setActiveView] = useState('chats');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (activeView === 'chats' && contacts.length > 0) {
            setSelectedChat(contacts[0]);
        } else if (activeView === 'groups' && groups.length > 0) {
            setSelectedChat(groups[0]);
        } else {
            setSelectedChat(null);
        }
    }, [activeView, contacts, groups]);

    useEffect(() => {
        if (selectedChat) {
            setMessages(allMessages[selectedChat.id] || []);
        } else {
            setMessages([]);
        }
    }, [selectedChat, allMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !selectedChat) return;
        const newMsg = {
            id: messages.length + 1,
            text: newMessage,
            sender: 'You',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'sent',
        };
        const updatedChatMessages = [...(allMessages[selectedChat.id] || []), newMsg];
        setAllMessages({ ...allMessages, [selectedChat.id]: updatedChatMessages });
        setNewMessage('');
    };

    return (
        <div className="font-sans h-screen antialiased bg-black text-gray-300">
            <div className="flex h-full">
                <aside className="w-24 bg-gray-900">
                    <NavigationSidebar activeView={activeView} setActiveView={setActiveView} />
                </aside>

                <div className="relative flex-1 flex h-full">
                    <aside className={`absolute md:relative z-20 h-full w-full md:w-1/3 lg:w-1/4 transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                        {activeView === 'chats' ? (
                            <ContactList contacts={contacts} selectedChat={selectedChat} onSelect={setSelectedChat} setIsSidebarOpen={setIsSidebarOpen} />
                        ) : (
                            <GroupList groups={groups} selectedChat={selectedChat} onSelect={setSelectedChat} setIsSidebarOpen={setIsSidebarOpen} />
                        )}
                    </aside>

                    <main className="flex-1 h-full">
                        {selectedChat ? (
                            <ChatWindow selectedChat={selectedChat} messages={messages} newMessage={newMessage} setNewMessage={setNewMessage} handleSendMessage={handleSendMessage} messagesEndRef={messagesEndRef} setIsSidebarOpen={setIsSidebarOpen} />
                        ) : (
                            <div className="flex h-full items-center justify-center bg-black text-gray-500"><p>Select a chat to start messaging.</p></div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default App;

