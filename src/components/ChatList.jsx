import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { MessageSquarePlus, Trash2, MessageSquare, Settings } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import SettingsModal from './SettingsModal';
import ExportDialog from './ExportDialog';

const ChatList = () => {
    const { chats, currentChatId, setCurrentChatId, createNewChat, deleteChat, settings, updateSettings, exportChats, importChats } = useChat();
    const [chatToDelete, setChatToDelete] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

    const handleDeleteConfirm = () => {
        if (chatToDelete) {
            deleteChat(chatToDelete);
            setChatToDelete(null);
        }
    };

    const handleExport = (filename) => {
        exportChats(filename);
    };

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--surface-color)'
        }}>
            <div style={{
                padding: '16px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Chats</h2>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Settings"
                    >
                        <Settings size={18} />
                    </button>
                </div>
                <button
                    onClick={createNewChat}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                >
                    <MessageSquarePlus size={18} />
                    New Chat
                </button>
            </div>

            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '8px'
            }}>
                {chats.length === 0 ? (
                    <div style={{
                        padding: '32px 16px',
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem'
                    }}>
                        No chats yet. Start a new conversation!
                    </div>
                ) : (
                    chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => setCurrentChatId(chat.id)}
                            style={{
                                padding: '12px 16px',
                                borderRadius: '12px',
                                marginBottom: '4px',
                                cursor: 'pointer',
                                backgroundColor: currentChatId === chat.id ? 'var(--bg-color)' : 'transparent',
                                border: currentChatId === chat.id ? '1px solid var(--border-color)' : '1px solid transparent',
                                transition: 'all 0.2s',
                                position: 'relative',
                                group: 'chat-item'
                            }}
                            className="chat-item"
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '4px'
                            }}>
                                <h3 style={{
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '180px'
                                }}>
                                    {chat.title || 'New Chat'}
                                </h3>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    {new Date(chat.lastMessageAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--text-secondary)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '200px',
                                    margin: 0
                                }}>
                                    {chat.preview || 'No messages'}
                                </p>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setChatToDelete(chat.id);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: '4px',
                                        cursor: 'pointer',
                                        color: 'var(--text-secondary)',
                                        opacity: 0.6
                                    }}
                                    title="Delete chat"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={!!chatToDelete}
                onClose={() => setChatToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Chat?"
                message="This action cannot be undone. The chat history will be permanently deleted."
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
        </div>
    );
};

export default ChatList;
