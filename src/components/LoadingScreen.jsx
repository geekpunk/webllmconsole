import React from 'react';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const LoadingScreen = ({ downloadProgress, onContinue, areModelsReady, targetModelIds }) => {
    // Filter to only show the required models
    const requiredModels = targetModelIds || [
        "Llama-3.2-1B-Instruct-q4f16_1-MLC"
    ];

    const allReady = requiredModels.every(id => downloadProgress[id]?.text === "Ready");

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
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '24px'
        }}>
            <div style={{
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center',
                backgroundColor: 'var(--bg-color)',
                padding: '32px',
                borderRadius: '16px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
            }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '16px', fontWeight: 700 }}>
                    Initializing AI Models
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                    We are downloading the optimized models for your device. This happens once and ensures fast, private, offline performance.
                </p>

                <div style={{
                    backgroundColor: 'var(--surface-color)',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '32px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    {requiredModels.map(modelId => {
                        const progress = downloadProgress[modelId];
                        const isReady = progress?.text === "Ready";
                        const name = modelId.includes("Llama") ? "Llama 3.2 1B" : "Gemma 2 2B";

                        return (
                            <div key={modelId} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '16px',
                                lastChild: { marginBottom: 0 }
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {isReady ? (
                                        <CheckCircle size={20} color="var(--success-color, #4caf50)" />
                                    ) : (
                                        <Loader2 size={20} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                                    )}
                                    <span style={{ fontWeight: 500 }}>{name}</span>
                                </div>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    {progress?.text || 'Waiting...'}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {allReady ? (
                    <button
                        onClick={onContinue}
                        style={{
                            padding: '12px 32px',
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.3)'
                        }}
                    >
                        Start Chatting
                    </button>
                ) : (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem'
                    }}>
                        <AlertTriangle size={16} />
                        <span>Please wait while models are downloading...</span>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
