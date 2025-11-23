import React from 'react';
import { useChat } from '../context/ChatContext';
import { AVAILABLE_MODELS } from '../services/LLMService';
import { Cpu } from 'lucide-react';

const ModelSelector = () => {
    const { currentModelId, switchModel, isGenerating } = useChat();

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: 'var(--surface-color)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
        }}>
            <Cpu size={16} color="var(--text-secondary)" />
            <select
                value={currentModelId}
                onChange={(e) => switchModel(e.target.value)}
                disabled={isGenerating}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                    width: '100%'
                }}
            >
                {AVAILABLE_MODELS.map(model => (
                    <option key={model.id} value={model.id}>
                        {model.name} ({Math.round(model.vram_required_MB / 1024 * 10) / 10} GB VRAM)
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ModelSelector;
