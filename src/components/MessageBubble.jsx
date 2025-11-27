import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Link as LinkIcon, Info, X } from 'lucide-react';
import { AVAILABLE_MODELS } from '../services/LLMService';

const MetaIcon = ({ size = 18, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5.9C13.2 5.9 14.2 6.5 14.8 7.4L16.4 10C17.3 11.4 19 12.3 20.8 12.3C22.6 12.3 24 10.9 24 9.1C24 7.3 22.6 5.9 20.8 5.9C19.6 5.9 18.6 6.5 18 7.4L16.4 10C15.5 11.4 13.8 12.3 12 12.3C10.2 12.3 8.5 11.4 7.6 10L6 7.4C5.4 6.5 4.4 5.9 3.2 5.9C1.4 5.9 0 7.3 0 9.1C0 10.9 1.4 12.3 3.2 12.3C4.4 12.3 5.4 11.7 6 10.8L7.6 8.2C8.5 6.8 10.2 5.9 12 5.9Z" />
        <path d="M12 18.1C10.8 18.1 9.8 17.5 9.2 16.6L7.6 14C6.7 12.6 5 11.7 3.2 11.7C1.4 11.7 0 13.1 0 14.9C0 16.7 1.4 18.1 3.2 18.1C4.4 18.1 5.4 17.5 6 16.6L7.6 14C8.5 12.6 10.2 11.7 12 11.7C13.8 11.7 15.5 12.6 16.4 14L18 16.6C18.6 17.5 19.6 18.1 20.8 18.1C22.6 18.1 24 16.7 24 14.9C24 13.1 22.6 11.7 20.8 11.7C19.6 11.7 18.6 12.3 18 13.2L16.4 15.8C15.5 17.2 13.8 18.1 12 18.1Z" />
    </svg>
);

const GeminiIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" fill="url(#gemini-gradient)" />
        <defs>
            <linearGradient id="gemini-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4E88D4" />
                <stop offset="1" stopColor="#9B6DFF" />
            </linearGradient>
        </defs>
    </svg>
);

const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';
    const [showInfo, setShowInfo] = useState(false);

    const getModelIcon = () => {
        if (isUser) return <User size={18} color="white" />;

        const modelId = message.modelId || '';
        if (modelId.toLowerCase().includes('llama')) {
            return <MetaIcon size={18} color="#0668E1" />;
        }
        if (modelId.toLowerCase().includes('gemma')) {
            return <GeminiIcon size={18} />;
        }
        return <Bot size={18} color="var(--text-secondary)" />;
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: isUser ? 'row-reverse' : 'row',
            marginBottom: '16px',
            gap: '8px',
            alignItems: 'flex-end',
            position: 'relative'
        }}>
            <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: isUser ? 'var(--primary-color)' : 'var(--surface-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: !isUser ? '1px solid var(--border-color)' : 'none'
            }}>
                {getModelIcon()}
            </div>

            <div style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '18px',
                borderBottomRightRadius: isUser ? '4px' : '18px',
                borderBottomLeftRadius: isUser ? '18px' : '4px',
                backgroundColor: isUser ? 'var(--msg-user-bg)' : 'var(--msg-ai-bg)',
                color: isUser ? 'var(--msg-user-text)' : 'var(--msg-ai-text)',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                position: 'relative'
            }}>
                {isUser ? (
                    <div>{message.content}</div>
                ) : (
                    <ReactMarkdown
                        components={{
                            code({ node, inline, className, children, ...props }) {
                                return !inline ? (
                                    <div style={{
                                        background: 'rgba(0,0,0,0.1)',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        overflowX: 'auto',
                                        margin: '8px 0'
                                    }}>
                                        <code {...props} style={{ fontFamily: 'monospace' }}>{children}</code>
                                    </div>
                                ) : (
                                    <code {...props} style={{
                                        background: 'rgba(0,0,0,0.1)',
                                        padding: '2px 4px',
                                        borderRadius: '3px',
                                        fontFamily: 'monospace'
                                    }}>{children}</code>
                                )
                            }
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                )}
                <div style={{
                    fontSize: '0.7rem',
                    opacity: 0.7,
                    marginTop: '4px',
                    textAlign: 'right',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                }}>
                    {!isUser && message.modelId && (
                        <span style={{ fontWeight: 500 }}>
                            {AVAILABLE_MODELS.find(m => m.id === message.modelId)?.name || 'Unknown Model'}
                        </span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <span>
                            {new Date(message.timestamp).toLocaleDateString()} {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                            onClick={() => setShowInfo(true)}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                color: 'inherit',
                                opacity: 0.8,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            title="View Context Info"
                        >
                            <Info size={12} />
                        </button>
                    </div>
                </div>

                {message.searchResults && message.searchResults.length > 0 && (
                    <div style={{
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: '1px solid rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px'
                    }}>
                        {message.searchResults.map((result, idx) => (
                            <a
                                key={idx}
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={result.title}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: 'inherit',
                                    textDecoration: 'none',
                                    fontSize: '0.75rem',
                                    opacity: 0.9,
                                    backgroundColor: 'rgba(0,0,0,0.05)',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                }}
                            >
                                <LinkIcon size={12} />
                                <span style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {result.title}
                                </span>
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Modal */}
            {showInfo && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }} onClick={() => setShowInfo(false)}>
                    <div style={{
                        backgroundColor: 'var(--bg-color)',
                        borderRadius: '12px',
                        width: '500px',
                        maxWidth: '90%',
                        maxHeight: '80vh',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{
                            padding: '16px 24px',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Message Context</h3>
                            <button onClick={() => setShowInfo(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '24px', overflowY: 'auto' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>System Prompt</h4>
                                <div style={{
                                    backgroundColor: 'var(--surface-color)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    whiteSpace: 'pre-wrap',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    {message.systemPrompt || 'No system prompt used.'}
                                </div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                    {isUser ? 'Full Message Content (Sent to LLM)' : 'Message Content'}
                                </h4>
                                <div style={{
                                    backgroundColor: 'var(--surface-color)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    whiteSpace: 'pre-wrap',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    {message.actualContent || message.content}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageBubble;
