import React, { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import ModelSelector from './ModelSelector';
import SettingsModal from './SettingsModal';
import ExportDialog from './ExportDialog';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const ChatWindow = () => {
    const {
        currentChatId,
        messages,
        sendMessage,
        isGenerating,
        modelLoadingProgress,
        chats,
        isSearchEnabled,
        setIsSearchEnabled,
        settings,
        updateSettings,
        stopGeneration,
        exportChats,
        importChats
    } = useChat();

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const currentChat = chats.find(c => c.id === currentChatId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isGenerating]);

    const handleExport = (filename) => {
        exportChats(filename);
    };

    if (!currentChatId) {
        return (
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                gap: '16px'
            }}>
                <h2>Select a chat or start a new one</h2>
                <p>Your conversations are stored locally.</p>
            </div>
        );
    }

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            position: 'relative'
        }}>
            {/* Header */}
            <div style={{
                height: 'var(--header-height)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                backgroundColor: 'var(--bg-color)'
            }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                    {currentChat?.title || 'New Chat'}
                </h2>
                <ModelSelector />
            </div>

            {/* Messages Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {messages.length === 0 ? (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic'
                    }}>
                        Start chatting with the AI...
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <MessageBubble key={index} message={msg} />
                    ))
                )}

                {/* Loading Indicator */}
                {modelLoadingProgress && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: 'var(--surface-color)',
                        borderRadius: '8px',
                        margin: '16px 0',
                        fontSize: '0.9rem'
                    }}>
                        <Loader2 size={20} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                        <span>{modelLoadingProgress.text}</span>
                    </div>
                )}

                {isGenerating && !modelLoadingProgress && (
                    <div style={{ display: 'flex', gap: '8px', padding: '8px' }}>
                        <div className="typing-dot" style={{ width: '8px', height: '8px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></div>
                        <div className="typing-dot" style={{ width: '8px', height: '8px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both 0.16s' }}></div>
                        <div className="typing-dot" style={{ width: '8px', height: '8px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both 0.32s' }}></div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <MessageInput
                onSend={sendMessage}
                onStop={stopGeneration}
                isGenerating={isGenerating}
                disabled={!!modelLoadingProgress}
                isSearchEnabled={isSearchEnabled}
                onToggleSearch={() => setIsSearchEnabled(!isSearchEnabled)}
                onOpenSettings={() => setIsSettingsOpen(true)}
            />

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                onSave={updateSettings}
                onExport={() => setIsExportDialogOpen(true)}
                onImport={importChats}
            />

            <ExportDialog
                isOpen={isExportDialogOpen}
                onClose={() => setIsExportDialogOpen(false)}
                onConfirm={handleExport}
            />

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
        </div>
    );
};

export default ChatWindow;
