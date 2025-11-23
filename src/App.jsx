import React from 'react';
import { ChatProvider } from './context/ChatContext';
import AppLayout from './components/AppLayout';
import './index.css';

function App() {
    return (
        <ChatProvider>
            <AppLayout />
        </ChatProvider>
    );
}

export default App;
