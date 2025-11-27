import React from 'react';
import { X, Info } from 'lucide-react';

const AboutModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

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
                width: '600px',
                maxWidth: '90%',
                maxHeight: '90vh',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Info size={20} color="var(--primary-color)" />
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>About Web LLM Chat</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '24px', overflowY: 'auto', lineHeight: '1.6' }}>
                    <section style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Secure, Private AI</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
                            Web LLM Chat is a modern, secure chat application that runs Large Language Models (LLMs) directly in your browser.
                            Unlike traditional AI services, <strong>your chat data never leaves your device</strong>. The model runs locally using WebGPU, ensuring complete privacy and security for your conversations.
                        </p>
                    </section>

                    <section style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>How to Use</h3>
                        <ol style={{ paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                            <li style={{ marginBottom: '8px' }}>
                                <strong>Select a Model:</strong> Choose from a variety of optimized models (like Llama 3 or Gemma 2) using the selector in the chat header. The first time you use a model, it will download to your device.
                            </li>
                            <li style={{ marginBottom: '8px' }}>
                                <strong>Start Chatting:</strong> Type your message and press send. The AI will respond instantly, running entirely on your computer.
                            </li>
                            <li style={{ marginBottom: '8px' }}>
                                <strong>Web Search:</strong> Toggle the globe icon to enable web search. This allows the AI to fetch real-time information from Wikipedia or Google to answer your questions accurately.
                            </li>
                            <li style={{ marginBottom: '8px' }}>
                                <strong>Manage Data:</strong> Use the Settings menu to export your chat history to JSON or import previous conversations. You are in full control of your data.
                            </li>
                            <li style={{ marginBottom: '8px' }}>
                                <strong>Custom Personas:</strong> Set a global system prompt in Settings, or override it for specific chats to give the AI a unique personality or role.
                            </li>
                        </ol>
                    </section>

                    <div style={{
                        backgroundColor: 'var(--surface-color)',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        marginBottom: '24px'
                    }}>
                        <p style={{ fontStyle: 'italic', color: 'var(--text-primary)', textAlign: 'center' }}>
                            "This entire application was created with Google Gemini 3 & Antigravity. No code was written by a human to make this outside of prompting."
                        </p>
                    </div>

                    <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <p style={{ marginBottom: '4px' }}><strong>License:</strong> MIT Open Source License</p>
                        <p style={{ marginBottom: '4px' }}><strong>Author:</strong> Mike Wolf</p>
                        <p>
                            <strong>Source Code:</strong>{' '}
                            <a
                                href="https://github.com/geekpunk/webllmconsole"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
                            >
                                github.com/geekpunk/webllmconsole
                            </a>
                        </p>
                    </section>
                </div>

                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 24px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 500
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AboutModal;
