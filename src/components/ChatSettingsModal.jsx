import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getAvailableModels } from '../services/LLMService';

const ChatSettingsModal = ({ isOpen, onClose, chat, onSave, globalSettings, downloadProgress }) => {
    const [systemPrompt, setSystemPrompt] = useState('');
    const [searchProvider, setSearchProvider] = useState('default');
    const [modelId, setModelId] = useState('default');
    const availableModels = getAvailableModels();

    useEffect(() => {
        if (chat) {
            setSystemPrompt(chat.systemPrompt || '');
            setSearchProvider(chat.searchProvider || 'default');
            setModelId(chat.modelId || 'default');
        }
    }, [chat, isOpen]);

    if (!isOpen || !chat) return null;

    const handleSave = () => {
        onSave(chat.id, {
            systemPrompt,
            searchProvider,
            modelId: modelId === 'default' ? null : modelId
        });
        onClose();
    };

    const handleModelChange = (e) => {
        const value = e.target.value;
        if (value !== 'default') {
            const isOptimized = value.includes("Llama-3.2-1B") || value.includes("Gemma-2-2b");
            if (!isOptimized) {
                const confirmed = window.confirm("Warning: This model is not optimized for this device and may have slow load times or performance issues. Do you want to continue?");
                if (!confirmed) return;
            }
        }
        setModelId(value);
    };

    return (
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
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'var(--bg-color)',
                borderRadius: '12px',
                width: '400px',
                maxWidth: '90%',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Chat Settings</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Model Override</label>
                        <select
                            value={modelId}
                            onChange={handleModelChange}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--surface-color)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <option value="default">Use Global Default</option>
                            {availableModels.map(model => (
                                <option key={model.id} value={model.id}>
                                    {model.name} ({Math.round(model.vram_required_MB / 1024 * 10) / 10} GB)
                                </option>
                            ))}
                        </select>
                        {/* Download indicators */}
                        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {availableModels.map(model => {
                                const progress = downloadProgress?.[model.id];
                                if (!progress) return null;
                                return (
                                    <div key={model.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        <span>{model.name}</span>
                                        <span>{progress.text}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>System Prompt</label>
                        <textarea
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            placeholder="Enter a specific system prompt for this chat..."
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--surface-color)',
                                color: 'var(--text-primary)',
                                minHeight: '120px',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                        />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {systemPrompt ? 'Overriding global default.' : `Using global default: "${globalSettings?.systemPrompt?.substring(0, 50)}${globalSettings?.systemPrompt?.length > 50 ? '...' : ''}"`}
                        </p>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Search Provider Override</label>
                        <select
                            value={searchProvider}
                            onChange={(e) => setSearchProvider(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--surface-color)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <option value="default">Use Global Default</option>
                            <option value="wikipedia">Wikipedia</option>
                            <option value="google">Google Custom Search</option>
                        </select>
                    </div>
                </div>

                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatSettingsModal;
