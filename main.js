const { app, BrowserWindow, shell, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('./database');
const OpenAI = require('openai');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const MCPManager = require('./mcp-manager');

const openAIToolNameMap = new Map();

let mainWindow;
let db;
let openaiClient;
let mcpManager;
let filesystemRoot = null;

// Initialize database
function initDatabase() {
    db = new Database();
}

// Initialize MCP Manager
function initMCPManager() {
    mcpManager = new MCPManager();

    // Load and connect to saved MCP servers
    const settings = db.getSettings();
    if (settings && settings.mcpServers) {
        for (const [serverName, config] of Object.entries(settings.mcpServers)) {
            if (config.enabled !== false) {
                mcpManager.connectServer(serverName, config).catch(err => {
                    console.error(`Failed to connect to MCP server ${serverName}:`, err);
                });
            }
        }
    }
}

// Create application menu
function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Chat',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.send('menu-new-chat');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Export Chat',
                    accelerator: 'CmdOrCtrl+E',
                    click: () => {
                        mainWindow.webContents.send('menu-export-chat');
                    }
                },
                {
                    label: 'Import Chat',
                    accelerator: 'CmdOrCtrl+I',
                    click: () => {
                        mainWindow.webContents.send('menu-import-chat');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Settings',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => {
                        mainWindow.webContents.send('menu-settings');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo', label: 'Undo' },
                { role: 'redo', label: 'Redo' },
                { type: 'separator' },
                { role: 'cut', label: 'Cut' },
                { role: 'copy', label: 'Copy' },
                { role: 'paste', label: 'Paste' },
                { role: 'selectAll', label: 'Select All' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload', label: 'Reload' },
                { role: 'forceReload', label: 'Force Reload' },
                { type: 'separator' },
                { role: 'resetZoom', label: 'Reset Zoom' },
                { role: 'zoomIn', label: 'Zoom In' },
                { role: 'zoomOut', label: 'Zoom Out' },
                { type: 'separator' },
                { role: 'togglefullscreen', label: 'Toggle Fullscreen' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Documentation',
                    click: async () => {
                        const { shell } = require('electron');
                        await shell.openExternal('https://github.com/humolot/databrain');
                    }
                },
                {
                    label: 'Report Issue',
                    click: async () => {
                        const { shell } = require('electron');
                        await shell.openExternal('https://github.com/humolot/databrain/issues');
                    }
                },
                { type: 'separator' },
                {
                    label: 'About DataBrain AI',
                    click: () => {
                        showAboutDialog();
                    }
                }
            ]
        }
    ];

    // Add developer menu in development
   if (process.env.NODE_ENV === 'development') {
        template.push({
            label: 'Developer',
            submenu: [
                { role: 'toggleDevTools', label: 'Toggle Developer Tools' }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// Show About dialog
function showAboutDialog() {
    const aboutMessage = `DataBrain AI
    
Version: 2.0.0
Build: 2025.01.13
    
A professional desktop AI interface supporting multiple AI providers including OpenAI, Anthropic, Google, DeepSeek, and more.

Developer: @Humolot
License: MIT
Copyright © 2025

Features:
• Multiple AI Providers Support
• Real-time Streaming Responses
• File Upload & Analysis
• Export/Import Conversations
• Syntax Highlighting
• Markdown Rendering
• Local SQLite/JSON Storage

Built with Electron, Node.js, and modern web technologies.`;

    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'About DataBrain AI',
        message: 'DataBrain AI v2.0.0',
        detail: aboutMessage,
        buttons: ['OK'],
        icon: path.join(__dirname, 'assets/icon.png')
    });
}

// Create main window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 600,
        backgroundColor: '#0a0a0a',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        frame: true,
        titleBarStyle: 'default',
        icon: path.join(__dirname, 'assets/icon.png')
    });
    
	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		if (url.startsWith('http://') || url.startsWith('https://')) {
			shell.openExternal(url);
		}
		return { action: 'deny' };
	});

	mainWindow.webContents.on('will-navigate', (event, url) => {
		if (url.startsWith('http://') || url.startsWith('https://')) {
			event.preventDefault();
			shell.openExternal(url);
		}
	});

    mainWindow.loadFile('renderer/index.html');

    // Create menu after window is ready
    mainWindow.webContents.on('did-finish-load', () => {
        createMenu();
    });

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// App lifecycle
app.whenReady().then(() => {
    initDatabase();
    initMCPManager();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', async () => {
    // Disconnect all MCP servers before quitting
    if (mcpManager) {
        await mcpManager.disconnectAll();
    }
});

// IPC Handlers

async function buildFilesystemContext(userMessage) {
    const shouldUseFS = true;
    if (!shouldUseFS) return '';

    let context = '';

    try {
        const mainJs = await readFileFromFilesystem('main.js');
        context += `\n\n### main.js\n${mainJs.slice(0, 6000)}`;
    } catch (err) {
        console.warn('[FS] Failed to load main.js:', err.message);
    }

    try {
        const mcpJs = await readFileFromFilesystem('mcp-manager.js');
        context += `\n\n### mcp-manager.js\n${mcpJs.slice(0, 6000)}`;
    } catch (err) {
        console.warn('[FS] Failed to load mcp-manager.js:', err.message);
    }

    if (!context) {
        console.warn('[FS] No filesystem context injected');
    }

    return context;
}

function isFilesystemReady() {
    return (
        mcpManager &&
        mcpManager.isConnected('filesystem') &&
        filesystemRoot
    );
}

async function readFileFromFilesystem(relativePath) {
    if (!mcpManager || !mcpManager.isConnected('filesystem')) {
        throw new Error('Filesystem MCP not connected');
    }

    if (!filesystemRoot) {
        throw new Error('Filesystem root not set');
    }

    // Segurança: impede path traversal
    const safePath = relativePath
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')
        .replace(/\.\./g, '');

    const uri = `file://${filesystemRoot}/${safePath}`;

    const result = await mcpManager.readResource('filesystem', uri);

    if (!result?.contents?.[0]?.text) {
        throw new Error(`Failed to read file: ${relativePath}`);
    }

    return result.contents[0].text;
}



// Settings
ipcMain.handle('get-settings', async () => {
    return db.getSettings();
});

ipcMain.handle('save-settings', async (event, settings) => {
    db.saveSettings(settings);
    
    // Reinitialize OpenAI client with new API key
    if (settings.openai_api_key) {
        openaiClient = new OpenAI({
            apiKey: settings.openai_api_key
        });
    }
    
    return { success: true };
});

// Chat operations
ipcMain.handle('create-chat', async (event, title) => {
    const chatId = db.createChat(title);
    return { chatId };
});

ipcMain.handle('get-chats', async () => {
    return db.getChats();
});

ipcMain.handle('get-chat', async (event, chatId) => {
    return db.getChat(chatId);
});

ipcMain.handle('delete-chat', async (event, chatId) => {
    db.deleteChat(chatId);
    return { success: true };
});

ipcMain.handle('rename-chat', async (event, chatId, newTitle) => {
    db.renameChat(chatId, newTitle);
    return { success: true };
});

// Message operations
ipcMain.handle('get-messages', async (event, chatId) => {
    return db.getMessages(chatId);
});

ipcMain.handle('save-message', async (event, chatId, role, content, attachments = null) => {
    const messageId = db.saveMessage(chatId, role, content, attachments);
    return { messageId };
});

// File upload
ipcMain.handle('upload-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'All Files', extensions: ['*'] },
            { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
            { name: 'Documents', extensions: ['pdf', 'txt', 'doc', 'docx', 'md'] },
            { name: 'Code', extensions: ['js', 'py', 'java', 'cpp', 'c', 'php', 'html', 'css', 'json'] }
        ]
    });

    if (result.canceled) {
        return null;
    }

    const filePath = result.filePaths[0];
    const fileName = path.basename(filePath);
    const fileSize = fs.statSync(filePath).size;
    const ext = path.extname(filePath).toLowerCase();
    
    let fileData;
    let fileType;
    let extractedText = null;
    
    // Image files - send as base64 for vision models
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (imageExts.includes(ext)) {
        const buffer = fs.readFileSync(filePath);
        fileData = buffer.toString('base64');
        fileType = 'image';
        
        // Determine MIME type
        let mimeType = 'image/jpeg';
        if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.gif') mimeType = 'image/gif';
        else if (ext === '.webp') mimeType = 'image/webp';
        
        return {
            name: fileName,
            size: fileSize,
            type: fileType,
            data: fileData,
            mimeType: mimeType,
            ext: ext
        };
    }
    
    // PDF files - extract text
    if (ext === '.pdf') {
        try {
            const buffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(buffer);
            extractedText = pdfData.text;
            fileType = 'pdf';
            
            return {
                name: fileName,
                size: fileSize,
                type: fileType,
                extractedText: extractedText,
                ext: ext,
                pageCount: pdfData.numpages
            };
        } catch (err) {
            console.error('PDF parse error:', err);
            return {
                name: fileName,
                size: fileSize,
                type: 'pdf',
                error: 'Failed to extract text from PDF',
                ext: ext
            };
        }
    }
    
    // DOCX files - extract text
    if (ext === '.docx') {
        try {
            const buffer = fs.readFileSync(filePath);
            const result = await mammoth.extractRawText({ buffer: buffer });
            extractedText = result.value;
            fileType = 'docx';
            
            return {
                name: fileName,
                size: fileSize,
                type: fileType,
                extractedText: extractedText,
                ext: ext
            };
        } catch (err) {
            console.error('DOCX parse error:', err);
            return {
                name: fileName,
                size: fileSize,
                type: 'docx',
                error: 'Failed to extract text from DOCX',
                ext: ext
            };
        }
    }
    
    // Text files (TXT, MD, code files, etc) - read as text
    const textExts = ['.txt', '.md', '.js', '.py', '.java', '.cpp', '.c', '.php', '.html', '.css', '.json', '.xml', '.csv', '.sql'];
    if (textExts.includes(ext)) {
        try {
            extractedText = fs.readFileSync(filePath, 'utf-8');
            fileType = 'text';
            
            return {
                name: fileName,
                size: fileSize,
                type: fileType,
                extractedText: extractedText,
                ext: ext
            };
        } catch (err) {
            console.error('Text read error:', err);
            return {
                name: fileName,
                size: fileSize,
                type: 'text',
                error: 'Failed to read text file',
                ext: ext
            };
        }
    }
    
    // Other files - return as binary with note
    return {
        name: fileName,
        size: fileSize,
        type: 'unsupported',
        ext: ext,
        message: 'File type not directly supported. Upload as reference only.'
    };
});

// AI Chat - Send message to OpenAI
ipcMain.handle('send-to-ai', async (event, messages, model = 'gpt-4-turbo-preview') => {
    try {
        if (!openaiClient) {
            const settings = db.getSettings();
            if (!settings || !settings.openai_api_key) {
                throw new Error('OpenAI API key not configured');
            }
            openaiClient = new OpenAI({
                apiKey: settings.openai_api_key
            });
        }
        
        const fsContext = isFilesystemReady()
		? await buildFilesystemContext(messages[messages.length - 1]?.content || '')
		: '';
		
		const formattedMessages = [];

		if (fsContext) {
			formattedMessages.push({
				role: 'system',
				content: `You have access to the following project files:\n${fsContext}`
			});
		}
        
        for (const msg of messages) {
            let content = msg.content;
            
            // Handle attachments
            if (msg.attachments) {
                const attachments = JSON.parse(msg.attachments);
                
                // Check if this is a vision model
                const isVisionModel = model.includes('gpt-4') && (model.includes('vision') || model.includes('gpt-4o'));
                
                // Process each attachment
                for (const att of attachments) {
                    if (att.type === 'image' && isVisionModel) {
                        // For vision models, send image in special format
                        content = [
                            { type: 'text', text: msg.content },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${att.mimeType || 'image/jpeg'};base64,${att.data}`,
                                    detail: 'high'
                                }
                            }
                        ];
                    } else if (att.extractedText) {
                        // For files with extracted text (PDF, DOCX, TXT)
                        content += `\n\n[File: ${att.name}]\n${att.extractedText}`;
                    } else if (att.type === 'image' && !isVisionModel) {
                        // Non-vision model with image
                        content += `\n\n[Note: Image "${att.name}" was attached but this model doesn't support image analysis. Please use GPT-4o or GPT-4 Vision for image analysis.]`;
                    }
                }
            }
            
            formattedMessages.push({
                role: msg.role,
                content: content
            });
        }

        const response = await openaiClient.chat.completions.create({
            model: model,
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 4000,
            stream: false
        });

        return {
            success: true,
            content: response.choices[0].message.content,
            usage: response.usage
        };

    } catch (error) {
        console.error('OpenAI API Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
});

// Stream AI response
ipcMain.handle('send-to-ai-stream', async (event, messages, model = 'gpt-4-turbo-preview') => {
    try {
        if (!openaiClient) {
            const settings = db.getSettings();
            if (!settings || !settings.openai_api_key) {
                throw new Error('OpenAI API key not configured');
            }
            openaiClient = new OpenAI({
                apiKey: settings.openai_api_key
            });
        }

        // Format messages for OpenAI (same as non-streaming)
        const fsContext = await buildFilesystemContext(
		messages[messages.length - 1]?.content || ''
		);

		const formattedMessages = [];

		if (fsContext) {
			formattedMessages.push({
				role: 'system',
				content: `You have access to the following project files:\n${fsContext}`
			});
		}
        
        for (const msg of messages) {
            let content = msg.content;
            
            // Handle attachments
            if (msg.attachments) {
                const attachments = JSON.parse(msg.attachments);
                
                // Check if this is a vision model
                const isVisionModel = model.includes('gpt-4') && (model.includes('vision') || model.includes('gpt-4o') || model === 'gpt-4o' || model === 'gpt-4o-mini');
                
                // Process each attachment
                for (const att of attachments) {
                    if (att.type === 'image' && isVisionModel) {
                        // For vision models, send image in special format
                        content = [
                            { type: 'text', text: msg.content },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${att.mimeType || 'image/jpeg'};base64,${att.data}`,
                                    detail: 'high'
                                }
                            }
                        ];
                    } else if (att.extractedText) {
                        // For files with extracted text (PDF, DOCX, TXT)
                        content += `\n\n[File: ${att.name}]\n${att.extractedText}`;
                    } else if (att.type === 'image' && !isVisionModel) {
                        // Non-vision model with image
                        content += `\n\n[Note: Image "${att.name}" was attached but this model doesn't support image analysis. Please use GPT-4o or GPT-4o Mini for image analysis.]`;
                    }
                }
            }
            
            formattedMessages.push({
                role: msg.role,
                content: content
            });
        }

        // Get MCP tools if available
        const mcpTools = getMCPToolsForOpenAI();
        const requestOptions = {
            model: model,
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 4000,
            stream: true
        };

        // Add tools if available and model supports it
        if (mcpTools.length > 0 && (model.includes('gpt-4') || model.includes('gpt-3.5-turbo'))) {
            requestOptions.tools = mcpTools;
            requestOptions.tool_choice = 'auto';
        }

        const stream = await openaiClient.chat.completions.create(requestOptions);

        let fullResponse = '';
        let toolCalls = [];

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;

            if (delta?.content) {
                fullResponse += delta.content;
                mainWindow.webContents.send('ai-stream-chunk', delta.content);
            }

            // Handle tool calls
            if (delta?.tool_calls) {
                for (const toolCall of delta.tool_calls) {
                    if (!toolCalls[toolCall.index]) {
                        toolCalls[toolCall.index] = {
                            id: toolCall.id,
                            type: 'function',
                            function: {
                                name: toolCall.function?.name || '',
                                arguments: toolCall.function?.arguments || ''
                            }
                        };
                    } else {
                        if (toolCall.function?.name) {
                            toolCalls[toolCall.index].function.name += toolCall.function.name;
                        }
                        if (toolCall.function?.arguments) {
                            toolCalls[toolCall.index].function.arguments += toolCall.function.arguments;
                        }
                    }
                }
            }
        }

        // If there are tool calls, execute them and get final response
        if (toolCalls.length > 0) {
            mainWindow.webContents.send('ai-stream-chunk', '\n\n[Using MCP tools...]\n\n');

            // Execute all tool calls
            const toolResults = [];
            for (const toolCall of toolCalls) {
                const result = await handleMCPToolCall(toolCall);
                toolResults.push(result);
            }

            // Add tool calls and results to messages
            formattedMessages.push({
                role: 'assistant',
                content: fullResponse || null,
                tool_calls: toolCalls
            });
            formattedMessages.push(...toolResults);

            // Get final response from AI with tool results
            const finalStream = await openaiClient.chat.completions.create({
                model: model,
                messages: formattedMessages,
                temperature: 0.7,
                max_tokens: 4000,
                stream: true
            });

            let finalResponse = '';
            for await (const chunk of finalStream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    finalResponse += content;
                    mainWindow.webContents.send('ai-stream-chunk', content);
                }
            }

            fullResponse = finalResponse;
        }

        mainWindow.webContents.send('ai-stream-end');

        return {
            success: true,
            content: fullResponse
        };

    } catch (error) {
        console.error('OpenAI Stream Error:', error);
        mainWindow.webContents.send('ai-stream-error', error.message);
        return {
            success: false,
            error: error.message
        };
    }
});

// MCP Server Management

// Get all connected MCP servers
ipcMain.handle('mcp-get-servers', async () => {
    try {
        return {
            success: true,
            servers: mcpManager.getAllServers()
        };
    } catch (error) {
        console.error('Error getting MCP servers:', error);
        return {
            success: false,
            error: error.message
        };
    }
});

// Get all available tools from MCP servers
ipcMain.handle('mcp-get-tools', async () => {
    try {
        return {
            success: true,
            tools: mcpManager.getAllTools()
        };
    } catch (error) {
        console.error('Error getting MCP tools:', error);
        return {
            success: false,
            error: error.message
        };
    }
});

// Connect to an MCP server
ipcMain.handle('mcp-connect-server', async (event, serverName, config) => {
    try {
        const result = await mcpManager.connectServer(serverName, config);
		
		if (serverName === 'filesystem') {
			await mcpManager.connectServer(serverName, config);

			const rootsResponse = await mcpManager.clients
			.get('filesystem')
			.client
			.listRoots();

			filesystemRoot = rootsResponse.roots[0].uri
			.replace('file://', '')
			.replace(/\\/g, '/');

			console.log('[MCP] Filesystem ready at startup:', filesystemRoot);
		} else {
			mcpManager.connectServer(serverName, config).catch(console.error);
		}

		
        // Save to settings
        const settings = db.getSettings();
        if (!settings.mcpServers) {
            settings.mcpServers = {};
        }
        settings.mcpServers[serverName] = { ...config, enabled: true };
        db.saveSettings(settings);

        return {
            success: true,
            server: result
        };
    } catch (error) {
        console.error('Error connecting to MCP server:', error);
        return {
            success: false,
            error: error.message
        };
    }
});

// Disconnect from an MCP server
ipcMain.handle('mcp-disconnect-server', async (event, serverName) => {
    try {
        await mcpManager.disconnectServer(serverName);

        // Update settings
        const settings = db.getSettings();
        if (settings.mcpServers && settings.mcpServers[serverName]) {
            settings.mcpServers[serverName].enabled = false;
            db.saveSettings(settings);
        }

        return {
            success: true
        };
    } catch (error) {
        console.error('Error disconnecting from MCP server:', error);
        return {
            success: false,
            error: error.message
        };
    }
});

// Remove an MCP server configuration
ipcMain.handle('mcp-remove-server', async (event, serverName) => {
    try {
        await mcpManager.disconnectServer(serverName);

        // Remove from settings
        const settings = db.getSettings();
        if (settings.mcpServers && settings.mcpServers[serverName]) {
            delete settings.mcpServers[serverName];
            db.saveSettings(settings);
        }

        return {
            success: true
        };
    } catch (error) {
        console.error('Error removing MCP server:', error);
        return {
            success: false,
            error: error.message
        };
    }
});

// Call an MCP tool
ipcMain.handle('mcp-call-tool', async (event, serverName, toolName, args) => {
    try {
        const result = await mcpManager.callTool(serverName, toolName, args);
        return {
            success: true,
            result: result
        };
    } catch (error) {
        console.error('Error calling MCP tool:', error);
        return {
            success: false,
            error: error.message
        };
    }
});

// Helper function to get MCP tools formatted for OpenAI function calling
function getMCPToolsForOpenAI() {
    if (!mcpManager) return [];

    openAIToolNameMap.clear();

    const mcpTools = mcpManager.getAllTools();
    const openAITools = [];

    for (const tool of mcpTools) {

        // 🔴 RECOMENDAÇÃO: não exponha filesystem como tool LLM
        if (tool.serverName === 'filesystem') {
            continue;
        }

        // Nome compatível com OpenAI (regex-safe)
        const openAIName = `${tool.serverName}_${tool.name}`
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');

        // Mapeamento reverso
        openAIToolNameMap.set(openAIName, tool.fullName);

        openAITools.push({
            type: 'function',
            function: {
                name: openAIName,
                description: tool.description || `${tool.name} from ${tool.serverName}`,
                parameters: tool.inputSchema || {
                    type: 'object',
                    properties: {},
                    required: []
                }
            }
        });
    }

    return openAITools;
}

// Helper function to handle MCP tool calls from AI
async function handleMCPToolCall(toolCall) {
    const openAIName = toolCall.function.name;
	const fullName = openAIToolNameMap.get(openAIName);
    const args = JSON.parse(toolCall.function.arguments || '{}');
	
	if (!fullName) {
		throw new Error(`Unknown MCP tool called by OpenAI: ${openAIName}`);
	}
	
    // Parse server name and tool name from fullName (format: serverName::toolName)
    const [serverName, toolName] = fullName.split('::');
	
    if (!serverName || !toolName) {
        throw new Error(`Invalid tool name format: ${fullName}`);
    }

    try {
        const result = await mcpManager.callTool(serverName, toolName, args);
        return {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result.content || result)
        };
    } catch (error) {
        return {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: error.message })
        };
    }
}