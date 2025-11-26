import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Link as LinkIcon } from 'lucide-react';
import { AVAILABLE_MODELS } from '../services/LLMService';

const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <div style={{
            display: 'flex',
            flexDirection: isUser ? 'row-reverse' : 'row',
            marginBottom: '16px',
            gap: '8px',
            alignItems: 'flex-end'
        }}>
            <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: isUser ? 'var(--primary-color)' : 'var(--surface-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                {isUser ? <User size={18} color="white" /> : <Bot size={18} color="var(--text-secondary)" />}
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
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
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
                    <span>
                        {new Date(message.timestamp).toLocaleDateString()} {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
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
        </div>
    );
};

export default MessageBubble;
