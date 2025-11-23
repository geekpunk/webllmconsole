import React, { useState, useRef, useEffect } from 'react';
import { Send, Globe, Settings, Square } from 'lucide-react';

const MessageInput = ({ onSend, onStop, isGenerating, disabled, placeholder = "Type a message...", isSearchEnabled, onToggleSearch, onOpenSettings }) => {
    const [text, setText] = useState('');
    const textareaRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim() && !disabled) {
            onSend(text);
            setText('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (isGenerating) {
                onStop();
            } else {
                handleSubmit(e);
            }
        }
    };

    const handleChange = (e) => {
        setText(e.target.value);
        // Auto-resize
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '12px',
                padding: '16px',
                backgroundColor: 'var(--bg-color)',
                borderTop: '1px solid var(--border-color)'
            }}
        >
            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    type="button"
                    onClick={onOpenSettings}
                    title="Settings"
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Settings size={20} />
                </button>

                <button
                    type="button"
                    onClick={onToggleSearch}
                    title={isSearchEnabled ? "Web Search On" : "Web Search Off"}
                    style={{
                        background: isSearchEnabled ? 'var(--msg-user-bg)' : 'transparent',
                        border: 'none',
                        color: isSearchEnabled ? 'var(--primary-color)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                >
                    <Globe size={20} />
                </button>
            </div>

            <div style={{
                flex: 1,
                backgroundColor: 'var(--surface-color)',
                borderRadius: '24px',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                border: '1px solid transparent',
                transition: 'border-color 0.2s'
            }}>
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={1}
                    style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        resize: 'none',
                        outline: 'none',
                        fontSize: '1rem',
                        lineHeight: '1.5',
                        color: 'var(--text-primary)',
                        maxHeight: '150px',
                        padding: '4px 0'
                    }}
                />
            </div>

            <button
                type={isGenerating ? "button" : "submit"}
                onClick={isGenerating ? onStop : undefined}
                disabled={(!text.trim() && !isGenerating) || (disabled && !isGenerating)}
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: ((!text.trim() && !isGenerating) || (disabled && !isGenerating)) ? 'var(--surface-color)' : 'var(--primary-color)',
                    color: ((!text.trim() && !isGenerating) || (disabled && !isGenerating)) ? 'var(--text-secondary)' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: ((!text.trim() && !isGenerating) || (disabled && !isGenerating)) ? 'default' : 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                {isGenerating ? <Square size={16} fill="currentColor" /> : <Send size={20} />}
            </button>
        </form>
    );
};

export default MessageInput;
