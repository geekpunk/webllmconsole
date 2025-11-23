import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  CHATS: 'web_llm_chats',
  MESSAGES_PREFIX: 'web_llm_messages_',
  SETTINGS: 'web_llm_settings',
};

const DEFAULT_SETTINGS = {
  searchProvider: 'wikipedia', // 'wikipedia' or 'google'
  googleApiKey: '',
  googleCx: ''
};

export const StorageService = {
  getChats: () => {
    try {
      const chats = localStorage.getItem(STORAGE_KEYS.CHATS);
      return chats ? JSON.parse(chats) : [];
    } catch (error) {
      console.error('Failed to load chats', error);
      return [];
    }
  },

  saveChat: (chat) => {
    try {
      const chats = StorageService.getChats();
      const existingIndex = chats.findIndex((c) => c.id === chat.id);

      let updatedChats;
      if (existingIndex >= 0) {
        updatedChats = [...chats];
        updatedChats[existingIndex] = { ...updatedChats[existingIndex], ...chat };
      } else {
        updatedChats = [chat, ...chats];
      }

      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(updatedChats));
      return chat;
    } catch (error) {
      console.error('Failed to save chat', error);
      return null;
    }
  },

  deleteChat: (chatId) => {
    try {
      const chats = StorageService.getChats().filter((c) => c.id !== chatId);
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
      localStorage.removeItem(`${STORAGE_KEYS.MESSAGES_PREFIX}${chatId}`);
    } catch (error) {
      console.error('Failed to delete chat', error);
    }
  },

  getMessages: (chatId) => {
    try {
      const messages = localStorage.getItem(`${STORAGE_KEYS.MESSAGES_PREFIX}${chatId}`);
      return messages ? JSON.parse(messages) : [];
    } catch (error) {
      console.error('Failed to load messages', error);
      return [];
    }
  },

  saveMessages: (chatId, messages) => {
    try {
      localStorage.setItem(`${STORAGE_KEYS.MESSAGES_PREFIX}${chatId}`, JSON.stringify(messages));

      // Update last message in chat list for preview
      const lastMessage = messages[messages.length - 1];
      if (lastMessage) {
        const chats = StorageService.getChats();
        const chatIndex = chats.findIndex(c => c.id === chatId);
        if (chatIndex >= 0) {
          chats[chatIndex].lastMessageAt = lastMessage.timestamp;
          chats[chatIndex].preview = lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? '...' : '');
          localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
        }
      }
    } catch (error) {
      console.error('Failed to save messages', error);
    }
  },

  createChat: (modelId) => {
    const newChat = {
      id: uuidv4(),
      title: 'New Chat',
      modelId: modelId,
      createdAt: Date.now(),
      lastMessageAt: Date.now(),
      preview: 'No messages yet',
    };
    StorageService.saveChat(newChat);
    return newChat;
  },

  updateChatTitle: (chatId, title) => {
    const chats = StorageService.getChats();
    const chatIndex = chats.findIndex(c => c.id === chatId);
    if (chatIndex >= 0) {
      chats[chatIndex].title = title;
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
    }
  },

  getSettings: () => {
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? { ...DEFAULT_SETTINGS, ...JSON.parse(settings) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to load settings', error);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings', error);
    }
  },

  getAllData: () => {
    const data = {
      chats: StorageService.getChats(),
      settings: StorageService.getSettings(),
      messages: {}
    };

    data.chats.forEach(chat => {
      data.messages[chat.id] = StorageService.getMessages(chat.id);
    });

    return data;
  },

  restoreData: (data) => {
    try {
      if (!data.chats || !data.messages) {
        throw new Error('Invalid backup file');
      }

      // Clear existing data (optional, but cleaner for restore)
      // localStorage.clear(); // We might not want to wipe everything if we want to merge, but "restore" usually implies replacement or additive.
      // Let's go with additive/update for safety, but the user request implies "reload the list", so maybe replacement is expected?
      // Let's do a safe merge: overwrite conflicts, keep others.

      // Save Settings
      if (data.settings) {
        StorageService.saveSettings(data.settings);
      }

      // Save Chats
      const currentChats = StorageService.getChats();
      // Filter out chats that are being restored to avoid duplicates if IDs match
      const newChats = [...currentChats.filter(c => !data.chats.find(nc => nc.id === c.id)), ...data.chats];
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(newChats));

      // Save Messages
      Object.entries(data.messages).forEach(([chatId, messages]) => {
        StorageService.saveMessages(chatId, messages);
      });

      return true;
    } catch (error) {
      console.error('Failed to restore data', error);
      return false;
    }
  }
};
