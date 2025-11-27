import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/StorageService';
import { llmService, AVAILABLE_MODELS, getAvailableModels } from '../services/LLMService';
import { WebSearchService } from '../services/WebSearchService';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [modelLoadingProgress, setModelLoadingProgress] = useState(null);
    const [isFirstTimeUser, setIsFirstTimeUser] = useState(!StorageService.isFTUECompleted());
    const [downloadProgress, setDownloadProgress] = useState({});

    const [loadingTargetModelId, setLoadingTargetModelId] = useState(null);

    // Check if default models are ready (Only Llama 1B is required for initial load now)
    const areDefaultModelsReady = [
        "Llama-3.2-1B-Instruct-q4f16_1-MLC"
    ].every(id => downloadProgress[id]?.text === "Ready");

    const completeFTUE = useCallback(() => {
        StorageService.setFTUECompleted();
        setIsFirstTimeUser(false);
    }, []);

    // Initialize settings with default model if not present
    const [settings, setSettings] = useState(() => {
        const saved = StorageService.getSettings();
        if (!saved.defaultModelId) {
            // Default to Llama 3.2 1B
            return { ...saved, defaultModelId: "Llama-3.2-1B-Instruct-q4f16_1-MLC" };
        }
        return saved;
    });

    const [currentModelId, setCurrentModelId] = useState(settings.defaultModelId);
    const [isSearchEnabled, setIsSearchEnabled] = useState(false);

    // Auto-download models on mount
    useEffect(() => {
        const downloadModels = async () => {
            const modelsToDownload = [
                "Llama-3.2-1B-Instruct-q4f16_1-MLC"
            ];

            const availableIds = getAvailableModels().map(m => m.id);
            const targets = modelsToDownload.filter(id => availableIds.includes(id));

            for (const modelId of targets) {
                // Check if already cached? web-llm doesn't expose this easily without init.
                // We'll just start the download process.
                await llmService.downloadModel(modelId, (progress) => {
                    setDownloadProgress(prev => ({
                        ...prev,
                        [modelId]: progress
                    }));
                });

                setDownloadProgress(prev => ({
                    ...prev,
                    [modelId]: { text: "Ready", progress: 1 }
                }));
            }
        };

        // Small delay to let UI render first
        setTimeout(downloadModels, 1000);
    }, []);

    // ... (rest of useEffects)

    // ... (createNewChat, deleteChat, updateChat, sendMessage, switchModel)

    const updateSettings = useCallback(async (newSettings) => {
        setSettings(newSettings);
        StorageService.saveSettings(newSettings);

        // Check if default model changed and needs downloading
        if (newSettings.defaultModelId) {
            const modelId = newSettings.defaultModelId;
            // Check if we have progress indicating it's ready
            const isReady = downloadProgress[modelId]?.text === "Ready";

            if (!isReady) {
                setLoadingTargetModelId(modelId);
                try {
                    await llmService.downloadModel(modelId, (progress) => {
                        setDownloadProgress(prev => ({ ...prev, [modelId]: progress }));
                    });
                    setDownloadProgress(prev => ({ ...prev, [modelId]: { text: "Ready", progress: 1 } }));
                } catch (e) {
                    console.error("Failed to download", e);
                } finally {
                    setLoadingTargetModelId(null);
                }
            }

            // If no chat is open, update current model to default
            if (!currentChatId) {
                setCurrentModelId(modelId);
            }
        }
    }, [currentChatId, downloadProgress]);

    // ... (stopGeneration, exportChats, importChats, refreshModels)



    // ... (rest of useEffects)

    // ... (createNewChat, deleteChat, updateChat, sendMessage, switchModel)

    // ... (stopGeneration, exportChats, importChats, refreshModels)

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
            } else {
                setCurrentModelId(settings.defaultModelId);
            }
        } else {
            setMessages([]);
            setCurrentModelId(settings.defaultModelId);
        }
    }, [currentChatId, chats, settings.defaultModelId]);

    const createNewChat = useCallback(() => {
        // Use default model for new chat
        const newChat = StorageService.createChat(settings.defaultModelId);
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        return newChat;
    }, [settings.defaultModelId]);

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

            // If updating current chat's model, update state
            if (chatId === currentChatId && updates.modelId) {
                setCurrentModelId(updates.modelId);
            }
        }
    }, [chats, currentChatId]);

    const sendMessage = useCallback(async (content) => {
        if (!currentChatId) return;

        // Get System Prompt early to store in messages
        const currentChat = chats.find(c => c.id === currentChatId);
        const systemPrompt = currentChat?.systemPrompt || settings.systemPrompt;

        let finalContent = content;
        let searchResults = [];

        setIsGenerating(true);

        try {
            // Determine effective model ID
            const effectiveModelId = currentChat?.modelId || settings.defaultModelId || getAvailableModels()[0].id;
            const effectiveModel = getAvailableModels().find(m => m.id === effectiveModelId);
            const contextWindow = effectiveModel?.context_window || 4096;

            // Safety margin: keep 20% free for response and system prompt
            const maxTokens = Math.floor(contextWindow * 0.8);
            const maxChars = maxTokens * 4; // Approximate 4 chars per token

            // Truncate content if necessary
            if (finalContent.length > maxChars) {
                console.warn(`Content length (${finalContent.length}) exceeds model context limit (${maxChars}). Truncating...`);

                // If we have web context, try to truncate that first
                if (finalContent.includes("Context from web search:")) {
                    const userQueryPart = `\n\nUser Query: ${content}`;
                    const availableCharsForContext = maxChars - userQueryPart.length;

                    if (availableCharsForContext > 0) {
                        const truncatedContext = finalContent.substring(0, availableCharsForContext) + "... [truncated]";
                        // Reconstruct carefully to ensure we don't lose the user query if possible, 
                        // but here we are truncating the whole string. 
                        // Let's do it more smartly:
                        const contextPart = finalContent.split("\n\nUser Query:")[0];
                        const truncatedContextPart = contextPart.substring(0, availableCharsForContext) + "... [truncated]";
                        finalContent = `${truncatedContextPart}${userQueryPart}`;
                    } else {
                        // Edge case: User query itself is too long? Just truncate everything.
                        finalContent = finalContent.substring(0, maxChars) + "... [truncated]";
                    }
                } else {
                    finalContent = finalContent.substring(0, maxChars) + "... [truncated]";
                }
            }

            // Initialize model if needed
            if (llmService.currentModelId !== effectiveModelId) {
                await llmService.initialize(effectiveModelId, (progress) => {
                    setModelLoadingProgress(progress);
                });
                setModelLoadingProgress(null);
            }

            // Perform Web Search if enabled
            if (isSearchEnabled) {
                try {
                    const effectiveSearchProvider = (currentChat?.searchProvider && currentChat.searchProvider !== 'default')
                        ? currentChat.searchProvider
                        : settings.searchProvider;

                    searchResults = await WebSearchService.search(content, effectiveSearchProvider, settings);

                    if (searchResults.length > 0) {
                        // Summarize each result using the LLM
                        for (let i = 0; i < searchResults.length; i++) {
                            const summary = await llmService.summarize(searchResults[i].snippet);
                            searchResults[i].snippet = summary;
                        }

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
                searchResults: searchResults, // Store results to display in UI if needed
                systemPrompt: systemPrompt // Store system prompt for inspection
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

            // Prepare messages for LLM (exclude timestamp, use actualContent)
            let llmMessages = newMessages.map(msg => ({
                role: msg.role,
                content: msg.actualContent || msg.content
            }));

            // Inject System Prompt
            if (systemPrompt) {
                // Ensure system prompt is the very first message
                llmMessages.unshift({ role: 'system', content: systemPrompt });
            }

            // Stream response
            let aiMessage = {
                role: 'assistant',
                content: '',
                timestamp: Date.now(),
                modelId: effectiveModelId, // Store model ID
                systemPrompt: systemPrompt // Store system prompt
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
    }, [currentChatId, messages, chats, isSearchEnabled, settings]);

    const switchModel = useCallback((modelId) => {
        // This is now mostly used for settings or manual override if we allow it
        // But per requirements, we change settings or chat settings.
        // If we want to change the CURRENT chat's model:
        if (currentChatId) {
            updateChat(currentChatId, { modelId });
        } else {
            // If no chat, maybe update default? No, that should be explicit.
            // Just update local state for preview?
            setCurrentModelId(modelId);
        }
    }, [currentChatId, updateChat]);

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

    const refreshModels = useCallback(async () => {
        // Reset progress for default models to trigger loading screen
        setDownloadProgress(prev => {
            const next = { ...prev };
            ["Llama-3.2-1B-Instruct-q4f16_1-MLC", "gemma-2-2b-it-q4f32_1-MLC-1k"].forEach(id => {
                delete next[id];
            });
            return next;
        });

        // Trigger download again
        const modelsToDownload = [
            "gemma-2-2b-it-q4f32_1-MLC-1k",
            "Llama-3.2-1B-Instruct-q4f16_1-MLC"
        ];

        const availableIds = getAvailableModels().map(m => m.id);
        const targets = modelsToDownload.filter(id => availableIds.includes(id));

        for (const modelId of targets) {
            await llmService.downloadModel(modelId, (progress) => {
                setDownloadProgress(prev => ({
                    ...prev,
                    [modelId]: progress
                }));
            });

            setDownloadProgress(prev => ({
                ...prev,
                [modelId]: { text: "Ready", progress: 1 }
            }));
        }
    }, []);

    const value = {
        chats,
        currentChatId,
        setCurrentChatId,
        messages,
        isGenerating,
        modelLoadingProgress,
        downloadProgress,
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
        importChats,
        isFirstTimeUser,
        completeFTUE,
        areDefaultModelsReady,
        refreshModels,
        loadingTargetModelId
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
