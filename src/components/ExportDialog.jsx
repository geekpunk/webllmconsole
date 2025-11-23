import React, { useState } from 'react';
import { Download } from 'lucide-react';

const ExportDialog = ({ isOpen, onClose, onConfirm }) => {
    const [filename, setFilename] = useState('chatlist');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(filename);
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleConfirm();
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
                overflow: 'hidden',
                border: '1px solid var(--border-color)'
            }}>
                <div style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        color: '#3b82f6'
                    }}>
                        <Download size={24} />
                    </div>

                    <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        marginBottom: '8px',
                        color: 'var(--text-primary)'
                    }}>
                        Export Chat Data
                    </h3>

                    <p style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '20px'
                    }}>
                        Enter a name for your export file
                    </p>

                    <div style={{ width: '100%', marginBottom: '24px' }}>
                        <input
                            type="text"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter filename"
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--surface-color)',
                                color: 'var(--text-primary)',
                                fontSize: '0.9rem'
                            }}
                        />
                        <div style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            marginTop: '8px',
                            textAlign: 'left'
                        }}>
                            Will be saved as: <strong>{filename}.json</strong>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        width: '100%'
                    }}>
                        <button
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                background: 'transparent',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!filename.trim()}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: !filename.trim() ? 'var(--surface-color)' : '#3b82f6',
                                color: !filename.trim() ? 'var(--text-secondary)' : 'white',
                                cursor: !filename.trim() ? 'default' : 'pointer',
                                fontWeight: 500
                            }}
                        >
                            Export
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportDialog;
