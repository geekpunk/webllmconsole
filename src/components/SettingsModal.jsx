import React, { useState, useRef } from 'react';
import { X, Download, Upload, RefreshCw } from 'lucide-react';
import { getAvailableModels } from '../services/LLMService';

const SettingsModal = ({ isOpen, onClose, settings, onSave, onExport, onImport, downloadProgress, onRefreshModels }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const fileInputRef = useRef(null);
    const availableModels = getAvailableModels();

    if (!isOpen) return null;

    const handleChange = (key, value) => {
        if (key === 'defaultModelId') {
            const isOptimized = value.includes("Llama-3.2-1B") || value.includes("Gemma-2-2b");
            if (!isOptimized) {
                const confirmed = window.confirm("Warning: This model is not optimized for this device and may have slow load times or performance issues. Do you want to continue?");
                if (!confirmed) return;
            }
        }
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                await onImport(file);
                alert('Data imported successfully!');
                onClose();
            } catch (error) {
                alert('Failed to import data: ' + error.message);
            }
        }
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
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Settings</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Default Model</label>
                        <select
                            value={localSettings.defaultModelId || availableModels[0]?.id}
                            onChange={(e) => handleChange('defaultModelId', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--surface-color)',
                                color: 'var(--text-primary)'
                            }}
                        >
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
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Global System Prompt</label>
                        <textarea
                            value={localSettings.systemPrompt || ''}
                            onChange={(e) => handleChange('systemPrompt', e.target.value)}
                            placeholder="Enter a default system prompt for all chats..."
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--surface-color)',
                                color: 'var(--text-primary)',
                                minHeight: '80px',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                        />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            This prompt will be used if a chat doesn't have a specific one set.
                        </p>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Search Provider</label>
                        <select
                            value={localSettings.searchProvider}
                            onChange={(e) => handleChange('searchProvider', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--surface-color)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <option value="wikipedia">Wikipedia (Free)</option>
                            <option value="google">Google Custom Search (Requires Key)</option>
                        </select>
                    </div>

                    {localSettings.searchProvider === 'google' && (
                        <>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Google API Key</label>
                                <input
                                    type="password"
                                    value={localSettings.googleApiKey}
                                    onChange={(e) => handleChange('googleApiKey', e.target.value)}
                                    placeholder="Enter API Key"
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-color)',
                                        backgroundColor: 'var(--surface-color)',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Search Engine ID (CX)</label>
                                <input
                                    type="text"
                                    value={localSettings.googleCx}
                                    onChange={(e) => handleChange('googleCx', e.target.value)}
                                    placeholder="Enter CX ID"
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-color)',
                                        backgroundColor: 'var(--surface-color)',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>
                        </>
                    )}

                    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Data Management</h3>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button
                                onClick={onExport}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--surface-color)',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Download size={18} />
                                Export
                            </button>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--surface-color)',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Upload size={18} />
                                Import
                            </button>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImport}
                                accept=".json"
                                style={{ display: 'none' }}
                            />
                        </div>
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

export default SettingsModal;
