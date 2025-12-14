const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Settings
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    
    // Chat operations
    createChat: (title) => ipcRenderer.invoke('create-chat', title),
    getChats: () => ipcRenderer.invoke('get-chats'),
    getChat: (chatId) => ipcRenderer.invoke('get-chat', chatId),
    deleteChat: (chatId) => ipcRenderer.invoke('delete-chat', chatId),
    renameChat: (chatId, newTitle) => ipcRenderer.invoke('rename-chat', chatId, newTitle),
    
    // Message operations
    getMessages: (chatId) => ipcRenderer.invoke('get-messages', chatId),
    saveMessage: (chatId, role, content, attachments) => ipcRenderer.invoke('save-message', chatId, role, content, attachments),
    
    // File operations
    uploadFile: () => ipcRenderer.invoke('upload-file'),
    
    // AI operations
    sendToAI: (messages, model) => ipcRenderer.invoke('send-to-ai', messages, model),
    sendToAIStream: (messages, model) => ipcRenderer.invoke('send-to-ai-stream', messages, model),
    
    // Stream listeners
    onStreamChunk: (callback) => ipcRenderer.on('ai-stream-chunk', (event, chunk) => callback(chunk)),
    onStreamEnd: (callback) => ipcRenderer.on('ai-stream-end', () => callback()),
    onStreamError: (callback) => ipcRenderer.on('ai-stream-error', (event, error) => callback(error)),
    
    removeStreamListeners: () => {
        ipcRenderer.removeAllListeners('ai-stream-chunk');
        ipcRenderer.removeAllListeners('ai-stream-end');
        ipcRenderer.removeAllListeners('ai-stream-error');
    },
    
    // Menu event listeners
    onMenuNewChat: (callback) => ipcRenderer.on('menu-new-chat', callback),
    onMenuExportChat: (callback) => ipcRenderer.on('menu-export-chat', callback),
    onMenuImportChat: (callback) => ipcRenderer.on('menu-import-chat', callback),
    onMenuSettings: (callback) => ipcRenderer.on('menu-settings', callback),

    // MCP operations
    mcpGetServers: () => ipcRenderer.invoke('mcp-get-servers'),
    mcpGetTools: () => ipcRenderer.invoke('mcp-get-tools'),
    mcpConnectServer: (serverName, config) => ipcRenderer.invoke('mcp-connect-server', serverName, config),
    mcpDisconnectServer: (serverName) => ipcRenderer.invoke('mcp-disconnect-server', serverName),
    mcpRemoveServer: (serverName) => ipcRenderer.invoke('mcp-remove-server', serverName),
    mcpCallTool: (serverName, toolName, args) => ipcRenderer.invoke('mcp-call-tool', serverName, toolName, args)
});
