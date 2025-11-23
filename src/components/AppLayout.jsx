import React from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

const AppLayout = () => {
    return (
        <div style={{
            display: 'flex',
            width: '100%',
            height: '100vh',
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-primary)',
            overflow: 'hidden'
        }}>
            <ChatList />
            <main style={{
                flex: 1,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--bg-color)'
            }}>
                <ChatWindow />
            </main>
        </div>
    );
};

export default AppLayout;
