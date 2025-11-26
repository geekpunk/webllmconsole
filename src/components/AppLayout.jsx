import React from 'react';
import { useChat } from '../context/ChatContext';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

const AppLayout = () => {
    const { currentChatId } = useChat();

    return (
        <div className={`app-layout ${currentChatId ? 'chat-active' : ''}`}>
            <div className="sidebar-container">
                <ChatList />
            </div>
            <main className="main-container">
                <ChatWindow />
            </main>
        </div>
    );
};

export default AppLayout;
