const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class DatabaseManager {
    constructor() {
        const userDataPath = app.getPath('userData');
        this.dbPath = path.join(userDataPath, 'databrain.json');
        
        this.db = this.loadDatabase();
    }

    loadDatabase() {
        if (fs.existsSync(this.dbPath)) {
            try {
                const data = fs.readFileSync(this.dbPath, 'utf8');
                return JSON.parse(data);
            } catch (error) {
                console.error('Error loading database:', error);
                return this.getDefaultDatabase();
            }
        }
        return this.getDefaultDatabase();
    }

    getDefaultDatabase() {
        return {
            settings: {},
            chats: [],
            messages: [],
            nextChatId: 1,
            nextMessageId: 1
        };
    }

    saveDatabase() {
        try {
            const dir = path.dirname(this.dbPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.dbPath, JSON.stringify(this.db, null, 2), 'utf8');
        } catch (error) {
            console.error('Error saving database:', error);
        }
    }

    // Settings operations
    getSettings() {
        return this.db.settings || {};
    }

    saveSettings(settings) {
        this.db.settings = { ...this.db.settings, ...settings };
        this.saveDatabase();
    }

    // Chat operations
    createChat(title = 'New Chat') {
        const chat = {
            id: this.db.nextChatId++,
            title: title,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        this.db.chats.push(chat);
        this.saveDatabase();
        
        return chat.id;
    }

    getChats() {
        return this.db.chats
            .map(chat => {
                const messageCount = this.db.messages.filter(m => m.chat_id === chat.id).length;
                return {
                    ...chat,
                    message_count: messageCount
                };
            })
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }

    getChat(chatId) {
        return this.db.chats.find(chat => chat.id === chatId) || null;
    }

    deleteChat(chatId) {
        // Remove chat
        this.db.chats = this.db.chats.filter(chat => chat.id !== chatId);
        
        // Remove associated messages
        this.db.messages = this.db.messages.filter(msg => msg.chat_id !== chatId);
        
        this.saveDatabase();
    }

    renameChat(chatId, newTitle) {
        const chat = this.db.chats.find(c => c.id === chatId);
        if (chat) {
            chat.title = newTitle;
            chat.updated_at = new Date().toISOString();
            this.saveDatabase();
        }
    }

    updateChatTimestamp(chatId) {
        const chat = this.db.chats.find(c => c.id === chatId);
        if (chat) {
            chat.updated_at = new Date().toISOString();
            this.saveDatabase();
        }
    }

    // Message operations
    saveMessage(chatId, role, content, attachments = null) {
        const message = {
            id: this.db.nextMessageId++,
            chat_id: chatId,
            role: role,
            content: content,
            attachments: attachments ? JSON.stringify(attachments) : null,
            created_at: new Date().toISOString()
        };
        
        this.db.messages.push(message);
        this.updateChatTimestamp(chatId);
        this.saveDatabase();
        
        return message.id;
    }

    getMessages(chatId) {
        return this.db.messages
            .filter(msg => msg.chat_id === chatId)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    // Clear all data (for testing/reset)
    clearAllData() {
        this.db = this.getDefaultDatabase();
        this.saveDatabase();
    }

    close() {
        this.saveDatabase();
    }
}

module.exports = DatabaseManager;