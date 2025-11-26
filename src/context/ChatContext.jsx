import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/StorageService';
import { llmService, AVAILABLE_MODELS } from '../services/LLMService';
import { WebSearchService } from '../services/WebSearchService';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [modelLoadingProgress, setModelLoadingProgress] = useState(null);
    const [currentModelId, setCurrentModelId] = useState(AVAILABLE_MODELS[0].id); // Default to first model
    const [settings, setSettings] = useState(StorageService.getSettings());
    const [isSearchEnabled, setIsSearchEnabled] = useState(false);

    // Load chats on mount
    useEffect(() => {
        const loadedChats = StorageService.getChats();
        // Sort by last message time
        loadedChats.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
        setChats(loadedChats);
    }, []);

    // Load messages when currentChatId changes
    useEffect(() => {
        if (currentChatId) {
            const loadedMessages = StorageService.getMessages(currentChatId);
            setMessages(loadedMessages);

            // Also update the model selection based on the chat's preference if it exists
            const chat = chats.find(c => c.id === currentChatId);
            if (chat && chat.modelId) {
                setCurrentModelId(chat.modelId);
            }
        } else {
            setMessages([]);
        }
    }, [currentChatId, chats]);

    const createNewChat = useCallback(() => {
        const newChat = StorageService.createChat(currentModelId);
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        return newChat;
    }, [currentModelId]);

    const deleteChat = useCallback((chatId) => {
        StorageService.deleteChat(chatId);
        setChats(prev => prev.filter(c => c.id !== chatId));
        if (currentChatId === chatId) {
            setCurrentChatId(null);
        }
    }, [currentChatId]);

    const updateChat = useCallback((chatId, updates) => {
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
            const updatedChat = { ...chat, ...updates };
            StorageService.saveChat(updatedChat);
            setChats(prev => prev.map(c => c.id === chatId ? updatedChat : c));
        }
    }, [chats]);

    const sendMessage = useCallback(async (content) => {
        if (!currentChatId) return;

        let finalContent = content;
        let searchResults = [];

        setIsGenerating(true);

        // Perform Web Search if enabled
        if (isSearchEnabled) {
            try {
                const currentChat = chats.find(c => c.id === currentChatId);
                const effectiveSearchProvider = (currentChat?.searchProvider && currentChat.searchProvider !== 'default')
                    ? currentChat.searchProvider
                    : settings.searchProvider;

                searchResults = await WebSearchService.search(content, effectiveSearchProvider, settings);
                if (searchResults.length > 0) {
                    const contextString = searchResults.map(r => `[${r.source}] ${r.title}: ${r.snippet} (${r.url})`).join('\n');
                    finalContent = `Context from web search:\n${contextString}\n\nUser Query: ${content}`;
                }
            } catch (error) {
                console.error("Search failed", error);
            }
        }

        const userMessage = {
            role: 'user',
            content: content, // Display original content to user
            actualContent: finalContent, // Send augmented content to LLM
            timestamp: Date.now(),
            searchResults: searchResults // Store results to display in UI if needed
        };

        const newMessages = [...messages, userMessage];

        // Optimistically update UI
        setMessages(newMessages);
        StorageService.saveMessages(currentChatId, newMessages);

        // Update chat list preview
        setChats(prev => {
            const newChats = [...prev];
            const index = newChats.findIndex(c => c.id === currentChatId);
            if (index !== -1) {
                newChats[index] = {
                    ...newChats[index],
                    lastMessageAt: Date.now(),
                    preview: content.substring(0, 50) + (content.length > 50 ? '...' : '')
                };
                // Re-sort
                newChats.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
            }
            return newChats;
        });

        setIsGenerating(true);

        try {
            // Initialize model if needed
            if (llmService.currentModelId !== currentModelId) {
                await llmService.initialize(currentModelId, (progress) => {
                    setModelLoadingProgress(progress);
                });
                setModelLoadingProgress(null);
            }

            // Prepare messages for LLM (exclude timestamp, use actualContent)
            let llmMessages = newMessages.map(msg => ({
                role: msg.role,
                content: msg.actualContent || msg.content
            }));

            // Inject System Prompt
            const currentChat = chats.find(c => c.id === currentChatId);
            const systemPrompt = currentChat?.systemPrompt || settings.systemPrompt;

            if (systemPrompt) {
                // Ensure system prompt is the very first message
                llmMessages.unshift({ role: 'system', content: systemPrompt });
            }

            // Stream response
            let aiMessage = {
                role: 'assistant',
                content: '',
                timestamp: Date.now(),
                modelId: currentModelId // Store model ID
            };



            await llmService.chat(
                llmMessages,
                (text) => {
                    aiMessage.content = text;
                    setMessages([...newMessages, { ...aiMessage }]);
                },
                async (finalText) => {
                    // Save final state
                    const finalMessages = [...newMessages, { ...aiMessage, content: finalText }];
                    StorageService.saveMessages(currentChatId, finalMessages);
                    setIsGenerating(false);

                    // Generate title if it's the first few messages and title is still "New Chat"
                    const currentChat = chats.find(c => c.id === currentChatId);
                    if (currentChat && currentChat.title === 'New Chat' && finalMessages.length >= 2) {
                        const newTitle = await llmService.generateTitle(llmMessages);
                        if (newTitle) {
                            StorageService.updateChatTitle(currentChatId, newTitle);
                            setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, title: newTitle } : c));
                        }
                    }
                }
            );
        } catch (error) {
            console.error("Error sending message:", error);
            setIsGenerating(false);
            setModelLoadingProgress(null);
            // Optionally add error message to chat
        }
    }, [currentChatId, messages, currentModelId, chats, isSearchEnabled, settings]);

    const switchModel = useCallback((modelId) => {
        setCurrentModelId(modelId);
        // If we are in a chat, update that chat's preferred model
        if (currentChatId) {
            const chat = chats.find(c => c.id === currentChatId);
            if (chat) {
                StorageService.saveChat({ ...chat, modelId });
                setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, modelId } : c));
            }
        }
    }, [currentChatId, chats]);

    const updateSettings = useCallback((newSettings) => {
        setSettings(newSettings);
        StorageService.saveSettings(newSettings);
    }, []);

    const stopGeneration = useCallback(async () => {
        await llmService.interrupt();
        setIsGenerating(false);
    }, []);

    const exportChats = useCallback((filename = 'chatlist') => {
        const data = StorageService.getAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, []);

    const importChats = useCallback(async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    const success = StorageService.restoreData(data);
                    if (success) {
                        // Reload state
                        setChats(StorageService.getChats());
                        setSettings(StorageService.getSettings());
                        if (currentChatId) {
                            setMessages(StorageService.getMessages(currentChatId));
                        }
                        resolve(true);
                    } else {
                        reject(new Error('Failed to restore data'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }, [currentChatId]);

    const value = {
        chats,
        currentChatId,
        setCurrentChatId,
        messages,
        isGenerating,
        modelLoadingProgress,
        currentModelId,
        createNewChat,
        deleteChat,
        updateChat,
        sendMessage,
        switchModel,
        settings,
        updateSettings,
        isSearchEnabled,
        setIsSearchEnabled,
        stopGeneration,
        exportChats,
        importChats
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
