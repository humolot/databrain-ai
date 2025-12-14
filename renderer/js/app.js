// Global state
let currentChatId = null;
let currentAttachments = [];
let isStreaming = false;
let settings = {};
let currentModel = null;

// AI Provider configurations
const AI_PROVIDERS = {
    openai: {
        name: 'OpenAI',
        models: [
            // GPT-4o Series (2024)
            { id: 'gpt-4o', name: 'GPT-4o (Latest)', context: '128K' },
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini', context: '128K' },
            { id: 'gpt-4o-2024-11-20', name: 'GPT-4o (Nov 2024)', context: '128K' },
            { id: 'gpt-4o-2024-08-06', name: 'GPT-4o (Aug 2024)', context: '128K' },
            { id: 'gpt-4o-mini-2024-07-18', name: 'GPT-4o Mini (Jul 2024)', context: '128K' },
            
            // o1 Series (Reasoning)
            { id: 'o1', name: 'o1 (Reasoning)', context: '200K' },
            { id: 'o1-mini', name: 'o1 Mini (Reasoning)', context: '128K' },
            { id: 'o1-preview', name: 'o1 Preview', context: '128K' },
            
            // GPT-4 Turbo
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', context: '128K' },
            { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo Preview', context: '128K' },
            { id: 'gpt-4-turbo-2024-04-09', name: 'GPT-4 Turbo (Apr 2024)', context: '128K' },
            { id: 'gpt-4-1106-preview', name: 'GPT-4 Turbo (Nov 2023)', context: '128K' },
            
            // GPT-4 Classic
            { id: 'gpt-4', name: 'GPT-4', context: '8K' },
            { id: 'gpt-4-32k', name: 'GPT-4 32K', context: '32K' },
            { id: 'gpt-4-0613', name: 'GPT-4 (Jun 2023)', context: '8K' },
            
            // GPT-3.5
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', context: '16K' },
            { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K', context: '16K' }
        ]
    },
    anthropic: {
        name: 'Anthropic',
        models: [
            // Claude 3.5 (2024)
            { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Oct 2024)', context: '200K' },
            { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet (Jun 2024)', context: '200K' },
            { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (Oct 2024)', context: '200K' },
            
            // Claude 3 (2024)
            { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', context: '200K' },
            { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', context: '200K' },
            { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', context: '200K' },
            
            // Claude 2
            { id: 'claude-2.1', name: 'Claude 2.1', context: '200K' },
            { id: 'claude-2.0', name: 'Claude 2.0', context: '100K' }
        ]
    },
    google: {
        name: 'Google',
        models: [
            // Gemini 2.0 (2024)
            { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Experimental)', context: '1M' },
            
            // Gemini 1.5 Pro (2024)
            { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', context: '2M' },
            { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro (Latest)', context: '2M' },
            { id: 'gemini-1.5-pro-002', name: 'Gemini 1.5 Pro 002', context: '2M' },
            
            // Gemini 1.5 Flash (2024)
            { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', context: '1M' },
            { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash (Latest)', context: '1M' },
            { id: 'gemini-1.5-flash-002', name: 'Gemini 1.5 Flash 002', context: '1M' },
            { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', context: '1M' },
            
            // Gemini 1.0 Pro
            { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', context: '32K' },
            { id: 'gemini-1.0-pro-vision', name: 'Gemini 1.0 Pro Vision', context: '16K' }
        ]
    },
    deepseek: {
        name: 'DeepSeek',
        models: [
            // DeepSeek V3 (2024)
            { id: 'deepseek-chat', name: 'DeepSeek Chat (V3)', context: '64K' },
            { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner (R1)', context: '64K' },
            
            // DeepSeek Coder
            { id: 'deepseek-coder', name: 'DeepSeek Coder', context: '64K' },
            
            // DeepSeek V2
            { id: 'deepseek-v2.5', name: 'DeepSeek V2.5', context: '64K' },
            { id: 'deepseek-v2', name: 'DeepSeek V2', context: '32K' }
        ]
    },
    groq: {
        name: 'Groq',
        models: [
            // LLaMA 3.3 (2024)
            { id: 'llama-3.3-70b-versatile', name: 'LLaMA 3.3 70B', context: '128K' },
            
            // LLaMA 3.1 (2024)
            { id: 'llama-3.1-70b-versatile', name: 'LLaMA 3.1 70B', context: '128K' },
            { id: 'llama-3.1-8b-instant', name: 'LLaMA 3.1 8B Instant', context: '128K' },
            
            // LLaMA 3 (2024)
            { id: 'llama3-70b-8192', name: 'LLaMA 3 70B', context: '8K' },
            { id: 'llama3-8b-8192', name: 'LLaMA 3 8B', context: '8K' },
            
            // Mixtral
            { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', context: '32K' },
            
            // Gemma
            { id: 'gemma2-9b-it', name: 'Gemma 2 9B', context: '8K' },
            { id: 'gemma-7b-it', name: 'Gemma 7B', context: '8K' }
        ]
    },
    openrouter: {
        name: 'OpenRouter',
        models: [
            // OpenAI via OpenRouter
            { id: 'openai/gpt-4o', name: 'GPT-4o', context: '128K' },
            { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', context: '128K' },
            { id: 'openai/o1', name: 'o1 (Reasoning)', context: '200K' },
            { id: 'openai/o1-mini', name: 'o1 Mini', context: '128K' },
            { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', context: '128K' },
            
            // Anthropic via OpenRouter
            { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', context: '200K' },
            { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', context: '200K' },
            { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', context: '200K' },
            
            // Google via OpenRouter
            { id: 'google/gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', context: '1M' },
            { id: 'google/gemini-pro-1.5', name: 'Gemini 1.5 Pro', context: '2M' },
            { id: 'google/gemini-flash-1.5', name: 'Gemini 1.5 Flash', context: '1M' },
            
            // DeepSeek via OpenRouter
            { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat (V3)', context: '64K' },
            { id: 'deepseek/deepseek-reasoner', name: 'DeepSeek Reasoner', context: '64K' },
            
            // Meta via OpenRouter
            { id: 'meta-llama/llama-3.1-405b-instruct', name: 'LLaMA 3.1 405B', context: '128K' },
            { id: 'meta-llama/llama-3.1-70b-instruct', name: 'LLaMA 3.1 70B', context: '128K' },
            { id: 'meta-llama/llama-3.3-70b-instruct', name: 'LLaMA 3.3 70B', context: '128K' },
            
            // Other Popular Models
            { id: 'mistralai/mistral-large', name: 'Mistral Large', context: '128K' },
            { id: 'cohere/command-r-plus', name: 'Cohere Command R+', context: '128K' },
            { id: 'perplexity/llama-3.1-sonar-large', name: 'Perplexity Sonar Large', context: '128K' }
        ]
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
    await loadChats();
    initEventListeners();
    setupStreamListeners();
    setupAutoScroll();
    updateModelSelectors();
    setupMenuListeners();
    
    // Auto-resize textarea
    const messageInput = document.getElementById('messageInput');
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 150) + 'px';
    });
});

// Setup menu event listeners
function setupMenuListeners() {
    // Listen for menu events from main process
    window.electronAPI.onMenuNewChat(() => {
        createNewChat();
    });
    
    window.electronAPI.onMenuExportChat(() => {
        openExportModal();
    });
    
    window.electronAPI.onMenuImportChat(() => {
        importChat();
    });
    
    window.electronAPI.onMenuSettings(() => {
        openSettings();
    });
}

// Setup auto-scroll observer
function setupAutoScroll() {
    const messagesContainer = document.getElementById('messagesContainer');
    
    let scrollTimeout;
    
    // Create a MutationObserver to watch for new messages
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Clear any pending scroll
                if (scrollTimeout) {
                    clearTimeout(scrollTimeout);
                }
                
                // Scroll immediately
                scrollToBottom();
                
                // Also scroll after a short delay (for images/content loading)
                scrollTimeout = setTimeout(() => {
                    scrollToBottom();
                }, 100);
            }
            
            // Also watch for content changes (streaming)
            if (mutation.type === 'characterData' || mutation.type === 'subtree') {
                if (isStreaming) {
                    scrollToBottom();
                }
            }
        });
    });
    
    // Start observing
    observer.observe(messagesContainer, {
        childList: true,
        subtree: true,
        characterData: true
    });
}

// Load settings
async function loadSettings() {
    settings = await window.electronAPI.getSettings();
    if (!settings.ai_provider) {
        settings.ai_provider = 'openai';
    }
}

// Update model selectors
function updateModelSelectors() {
    const provider = settings.ai_provider || 'openai';
    const models = AI_PROVIDERS[provider].models;
    
    // Update settings modal model select
    const settingsModelSelect = document.getElementById('modelSelect');
    settingsModelSelect.innerHTML = '';
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = `${model.name} (${model.context})`;
        settingsModelSelect.appendChild(option);
    });
    
    // Set current model
    if (settings.default_model) {
        settingsModelSelect.value = settings.default_model;
    }
    
    // Update inline model select
    const currentModelSelect = document.getElementById('currentModelSelect');
    if (currentModelSelect) {
        currentModelSelect.innerHTML = '';
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            currentModelSelect.appendChild(option);
        });
        
        // Set to default or first model
        currentModel = settings.default_model || models[0].id;
        currentModelSelect.value = currentModel;
        
        // Listen for changes
        currentModelSelect.addEventListener('change', (e) => {
            currentModel = e.target.value;
        });
    }
}

// Get current API key based on provider
function getCurrentApiKey() {
    const provider = settings.ai_provider || 'openai';
    const keyMap = {
        openai: 'openai_api_key',
        anthropic: 'anthropic_api_key',
        google: 'google_api_key',
        deepseek: 'deepseek_api_key',
        groq: 'groq_api_key',
        openrouter: 'openrouter_api_key'
    };
    return settings[keyMap[provider]];
}

// Load chats
async function loadChats() {
    const chats = await window.electronAPI.getChats();
    const chatList = document.getElementById('chatList');
    
    chatList.innerHTML = '';
    
    if (chats.length === 0) {
        chatList.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-tertiary); font-size: 14px;">No chats yet</div>';
        return;
    }
    
    chats.forEach(chat => {
        const chatItem = createChatItem(chat);
        chatList.appendChild(chatItem);
    });
}

// Create chat item element
function createChatItem(chat) {
    const div = document.createElement('div');
    div.className = 'chat-item';
    div.dataset.chatId = chat.id;
    
    if (currentChatId === chat.id) {
        div.classList.add('active');
    }
    
    const date = new Date(chat.updated_at);
    const timeStr = formatDate(date);
    
    div.innerHTML = `
        <div class="chat-item-content">
            <div class="chat-item-title">${escapeHtml(chat.title)}</div>
            <div class="chat-item-info">${chat.message_count} messages • ${timeStr}</div>
        </div>
        <div class="chat-item-actions">
            <button class="icon-btn" onclick="deleteChat(${chat.id})" title="Delete">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4H14M6 7V11M10 7V11M3 4L4 13C4 13.5523 4.44772 14 5 14H11C11.5523 14 12 13.5523 12 13L13 4M6 4V2.5C6 2.22386 6.22386 2 6.5 2H9.5C9.77614 2 10 2.22386 10 2.5V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
    `;
    
    div.addEventListener('click', (e) => {
        if (!e.target.closest('.chat-item-actions')) {
            loadChat(chat.id);
        }
    });
    
    return div;
}

// Format date
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

// Load chat
async function loadChat(chatId) {
    currentChatId = chatId;
    currentAttachments = [];
    
    // Update UI
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('chatScreen').classList.remove('hidden');
    
    // Update active chat in sidebar
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-chat-id="${chatId}"]`)?.classList.add('active');
    
    // Load chat details
    const chat = await window.electronAPI.getChat(chatId);
    document.getElementById('chatTitle').textContent = chat.title;
    
    // Load messages
    const messages = await window.electronAPI.getMessages(chatId);
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.innerHTML = '';
    
    messages.forEach(msg => {
        appendMessage(msg.role, msg.content, msg.attachments, false); // Don't auto-scroll during load
    });
    
    scrollToBottom(true); // Force scroll to bottom after all messages loaded
    
    // Focus input after a small delay to ensure DOM is ready
    setTimeout(() => {
        const input = document.getElementById('messageInput');
        if (input) {
            input.focus();
            input.value = '';
            input.style.height = 'auto';
        }
    }, 100);
}

// Create new chat
async function createNewChat() {
    const result = await window.electronAPI.createChat('New Chat');
    currentChatId = result.chatId;
    currentAttachments = [];
    
    await loadChats();
    
    // Show chat screen
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('chatScreen').classList.remove('hidden');
    
    const chat = await window.electronAPI.getChat(currentChatId);
    document.getElementById('chatTitle').textContent = chat.title;
    
    // Clear messages
    document.getElementById('messagesContainer').innerHTML = '';
    
    // Clear and focus input
    setTimeout(() => {
        const input = document.getElementById('messageInput');
        if (input) {
            input.value = '';
            input.style.height = 'auto';
            input.focus();
        }
        updateAttachmentsPreview();
    }, 100);
}

// Delete chat
async function deleteChat(chatId) {
    if (!confirm('Are you sure you want to delete this chat?')) {
        return;
    }
    
    await window.electronAPI.deleteChat(chatId);
    
    if (currentChatId === chatId) {
        currentChatId = null;
        currentAttachments = [];
        document.getElementById('welcomeScreen').classList.remove('hidden');
        document.getElementById('chatScreen').classList.add('hidden');
    }
    
    await loadChats();
    
    // Re-focus on window after delete
    setTimeout(() => {
        window.focus();
    }, 50);
}

// Rename chat
async function renameChat() {
    if (!currentChatId) {
        alert('No chat selected');
        return;
    }
    
    const chat = await window.electronAPI.getChat(currentChatId);
    if (!chat) {
        alert('Chat not found');
        return;
    }
    
    const newTitle = prompt('Enter new chat title:', chat.title);
    
    if (newTitle && newTitle.trim() && newTitle.trim() !== chat.title) {
        await window.electronAPI.renameChat(currentChatId, newTitle.trim());
        document.getElementById('chatTitle').textContent = newTitle.trim();
        await loadChats();
    }
}

// Send message
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    
    if (!content && currentAttachments.length === 0) return;
    if (isStreaming) return;
    if (!currentChatId) {
        await createNewChat();
    }
    
    // Check API key for current provider
    const apiKey = getCurrentApiKey();
    const provider = settings.ai_provider || 'openai';
    if (!apiKey) {
        alert(`Please configure your ${AI_PROVIDERS[provider].name} API key in Settings`);
        openSettings();
        return;
    }
    
    // Get current model (from inline selector or settings)
    const model = currentModel || settings.default_model;
    if (!model) {
        alert('Please select a model in Settings');
        openSettings();
        return;
    }
    
    // Save user message
    const attachmentsData = currentAttachments.length > 0 ? currentAttachments : null;
    const messageMetadata = {
        model: model,
        provider: settings.ai_provider || 'openai'
    };
    await window.electronAPI.saveMessage(currentChatId, 'user', content, attachmentsData);
    
    // Display user message
    appendMessage('user', content, attachmentsData, true, null);
    
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    currentAttachments = [];
    updateAttachmentsPreview();
    
    // Get all messages for context
    const messages = await window.electronAPI.getMessages(currentChatId);
    const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        attachments: msg.attachments
    }));
    
    // Show typing indicator
    const typingDiv = showTypingIndicator();
    
    // Send to AI with streaming
    isStreaming = true;
    
    const result = await window.electronAPI.sendToAIStream(formattedMessages, model);
    
    if (result.success) {
        // Save assistant message
        await window.electronAPI.saveMessage(currentChatId, 'assistant', result.content, null);
        
        // Update chat title if it's the first message
        if (messages.length === 1) {
            const title = generateChatTitle(content);
            await window.electronAPI.renameChat(currentChatId, title);
            document.getElementById('chatTitle').textContent = title;
            await loadChats();
        }
    } else {
        // Show error
        const errorContent = `**Error:** ${result.error}`;
        appendMessage('assistant', errorContent, null);
        isStreaming = false;
    }
}

// Setup stream listeners
function setupStreamListeners() {
    let currentMessageDiv = null;
    let currentContent = '';
    let streamActive = false;
    
    window.electronAPI.onStreamChunk((chunk) => {
        if (!currentMessageDiv) {
            // Remove typing indicator
            const typingIndicator = document.querySelector('.typing-indicator');
            if (typingIndicator) {
                typingIndicator.parentElement.parentElement.remove();
            }
            
            // Create assistant message div
            currentMessageDiv = document.createElement('div');
            currentMessageDiv.className = 'message assistant';
            currentMessageDiv.innerHTML = `
                <div class="message-avatar">AI</div>
                <div class="message-content">
                    <div class="message-role">DataBrain AI</div>
                    <div class="message-text"></div>
                </div>
            `;
            document.getElementById('messagesContainer').appendChild(currentMessageDiv);
            currentContent = '';
            streamActive = true;
        }
        
        currentContent += chunk;
        const messageText = currentMessageDiv.querySelector('.message-text');
        messageText.innerHTML = renderMarkdown(currentContent);
        
        // Auto-scroll while streaming
        scrollToBottom();
    });
    
    window.electronAPI.onStreamEnd(() => {
        if (currentMessageDiv && streamActive) {
            // Add copy button to the completed message
            const messageContent = currentMessageDiv.querySelector('.message-content');
            const copyBtnDiv = document.createElement('div');
            copyBtnDiv.className = 'message-actions';
            copyBtnDiv.innerHTML = `
                <button class="copy-btn" onclick="copyMessage(this, \`${escapeHtml(currentContent).replace(/`/g, '\\`')}\`)" title="Copy">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="5" y="5" width="9" height="9" rx="1" stroke="currentColor" stroke-width="1.5"/>
                        <path d="M3 11V3C3 2.44772 3.44772 2 4 2H10" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                </button>
            `;
            messageContent.appendChild(copyBtnDiv);
        }
        
        currentMessageDiv = null;
        currentContent = '';
        streamActive = false;
        isStreaming = false;
        
        // Scroll to bottom when streaming ends
        scrollToBottom(true);
    });
    
    window.electronAPI.onStreamError((error) => {
        console.error('Stream error:', error);
        if (currentMessageDiv) {
            const messageText = currentMessageDiv.querySelector('.message-text');
            messageText.innerHTML = `<p style="color: var(--error);">Error: ${escapeHtml(error)}</p>`;
        }
        currentMessageDiv = null;
        currentContent = '';
        streamActive = false;
        isStreaming = false;
    });
}

// Show typing indicator
function showTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'message assistant';
    div.innerHTML = `
        <div class="message-avatar">AI</div>
        <div class="message-content">
            <div class="message-role">DataBrain AI</div>
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    
    document.getElementById('messagesContainer').appendChild(div);
    scrollToBottom();
    
    return div;
}

// Append message to UI
function appendMessage(role, content, attachments, autoScroll = true, modelInfo = null) {
    const messagesContainer = document.getElementById('messagesContainer');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatar = role === 'user' ? 'You' : 'AI';
    let roleName = role === 'user' ? 'You' : 'DataBrain AI';
    
    // Add model badge for assistant messages
    let modelBadge = '';
    if (role === 'assistant' && currentModel) {
        const provider = settings.ai_provider || 'openai';
        const providerName = AI_PROVIDERS[provider]?.name || provider;
        const modelName = AI_PROVIDERS[provider]?.models.find(m => m.id === currentModel)?.name || currentModel;
        modelBadge = `<span class="model-badge" title="${providerName}: ${currentModel}">${modelName}</span>`;
    }
    
    let attachmentHtml = '';
    if (attachments) {
        const attachmentsArray = typeof attachments === 'string' ? JSON.parse(attachments) : attachments;
        attachmentsArray.forEach(att => {
            if (att.type === 'image') {
                attachmentHtml += `<div class="message-attachment">
                    <img src="data:image/jpeg;base64,${att.data}" alt="${escapeHtml(att.name)}">
                </div>`;
            } else {
                attachmentHtml += `<div class="message-attachment">
                    📎 ${escapeHtml(att.name)} (${formatFileSize(att.size)})
                </div>`;
            }
        });
    }
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <div class="message-role">${roleName} ${modelBadge}</div>
            <div class="message-text">${renderMarkdown(content)}</div>
            ${attachmentHtml}
            <div class="message-actions">
                <button class="copy-btn" onclick="copyMessage(this, \`${escapeHtml(content).replace(/`/g, '\\`')}\`)" title="Copy">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="5" y="5" width="9" height="9" rx="1" stroke="currentColor" stroke-width="1.5"/>
                        <path d="M3 11V3C3 2.44772 3.44772 2 4 2H10" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    if (autoScroll) {
        scrollToBottom(true);
    }
}

// Render markdown with code highlighting
function renderMarkdown(text) {
    // Configure marked
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { language: lang }).value;
                } catch (err) {}
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true,
        gfm: true
    });
    
    return marked.parse(text);
}

// Upload file
async function uploadFile() {
    const file = await window.electronAPI.uploadFile();
    
    if (file) {
        currentAttachments.push(file);
        updateAttachmentsPreview();
    }
}

// Update attachments preview
function updateAttachmentsPreview() {
    const preview = document.getElementById('attachmentsPreview');
    preview.innerHTML = '';
    
    currentAttachments.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'attachment-item';
        
        let fileInfo = `📎 ${escapeHtml(file.name)} (${formatFileSize(file.size)})`;
        
        // Add file type specific info
        if (file.type === 'image') {
            fileInfo = `🖼️ ${escapeHtml(file.name)} (${formatFileSize(file.size)})`;
        } else if (file.type === 'pdf' && file.pageCount) {
            fileInfo = `📄 ${escapeHtml(file.name)} (${file.pageCount} pages, ${formatFileSize(file.size)})`;
        } else if (file.extractedText) {
            const charCount = file.extractedText.length;
            fileInfo = `📝 ${escapeHtml(file.name)} (${charCount} chars, ${formatFileSize(file.size)})`;
        } else if (file.error) {
            fileInfo = `⚠️ ${escapeHtml(file.name)} - ${file.error}`;
        } else if (file.type === 'unsupported') {
            fileInfo = `❓ ${escapeHtml(file.name)} - ${file.message}`;
        }
        
        div.innerHTML = `
            <span>${fileInfo}</span>
            <button class="attachment-remove" onclick="removeAttachment(${index})">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            </button>
        `;
        preview.appendChild(div);
    });
}

// Remove attachment
function removeAttachment(index) {
    currentAttachments.splice(index, 1);
    updateAttachmentsPreview();
}

// Generate chat title from first message
function generateChatTitle(message) {
    const words = message.split(' ').slice(0, 6);
    let title = words.join(' ');
    if (message.split(' ').length > 6) {
        title += '...';
    }
    return title || 'New Chat';
}

// Settings modal
function openSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('hidden');
    
    // Load current settings
    const provider = settings.ai_provider || 'openai';
    document.getElementById('aiProvider').value = provider;
    
    // Show appropriate provider settings
    document.querySelectorAll('.provider-settings').forEach(el => el.classList.add('hidden'));
    document.getElementById(`${provider}-settings`).classList.remove('hidden');
    
    // Load API keys
    document.getElementById('openaiKey').value = settings.openai_api_key || '';
    document.getElementById('anthropicKey').value = settings.anthropic_api_key || '';
    document.getElementById('googleKey').value = settings.google_api_key || '';
    document.getElementById('deepseekKey').value = settings.deepseek_api_key || '';
    document.getElementById('groqKey').value = settings.groq_api_key || '';
    document.getElementById('openrouterKey').value = settings.openrouter_api_key || '';
    
    // Load system prompt
    document.getElementById('systemPrompt').value = settings.system_prompt || '';
    
    // Update model select
    updateModelSelectors();
    
    // Add provider change listener
    const providerSelect = document.getElementById('aiProvider');
    providerSelect.onchange = function() {
        document.querySelectorAll('.provider-settings').forEach(el => el.classList.add('hidden'));
        document.getElementById(`${this.value}-settings`).classList.remove('hidden');
        settings.ai_provider = this.value;
        updateModelSelectors();
    };
}

function closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
}

async function saveSettings() {
    const provider = document.getElementById('aiProvider').value;
    const model = document.getElementById('modelSelect').value;
    const systemPrompt = document.getElementById('systemPrompt').value;
    
    // Get API key based on provider
    const apiKeys = {
        openai: document.getElementById('openaiKey').value.trim(),
        anthropic: document.getElementById('anthropicKey').value.trim(),
        google: document.getElementById('googleKey').value.trim(),
        deepseek: document.getElementById('deepseekKey').value.trim(),
        groq: document.getElementById('groqKey').value.trim(),
        openrouter: document.getElementById('openrouterKey').value.trim()
    };
    
    const currentKey = apiKeys[provider];
    if (!currentKey) {
        alert(`Please enter your ${AI_PROVIDERS[provider].name} API key`);
        return;
    }
    
    const newSettings = {
        ai_provider: provider,
        default_model: model,
        system_prompt: systemPrompt,
        openai_api_key: apiKeys.openai,
        anthropic_api_key: apiKeys.anthropic,
        google_api_key: apiKeys.google,
        deepseek_api_key: apiKeys.deepseek,
        groq_api_key: apiKeys.groq,
        openrouter_api_key: apiKeys.openrouter
    };
    
    await window.electronAPI.saveSettings(newSettings);
    settings = newSettings;
    
    updateModelSelectors();
    closeSettings();
}

// Event listeners
function initEventListeners() {
    // New chat
    document.getElementById('newChatBtn').addEventListener('click', createNewChat);
    document.getElementById('startChatBtn').addEventListener('click', createNewChat);
    
    // Settings
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('closeSettings').addEventListener('click', closeSettings);
    document.getElementById('cancelSettings').addEventListener('click', closeSettings);
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    
    // Export/Import
    document.getElementById('exportChatBtn').addEventListener('click', openExportModal);
    document.getElementById('importChatBtn').addEventListener('click', importChat);
    document.getElementById('closeExport').addEventListener('click', closeExportModal);
    
    // Export format buttons
    document.querySelectorAll('.export-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const format = btn.dataset.format;
            exportChat(format);
        });
    });
    
    // Chat actions
    document.getElementById('renameChatBtn').addEventListener('click', renameChat);
    document.getElementById('deleteChatBtn').addEventListener('click', () => {
        if (currentChatId) {
            deleteChat(currentChatId);
        }
    });
    
    // Message input
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    document.getElementById('attachBtn').addEventListener('click', uploadFile);
    
    document.getElementById('messageInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Close modal on outside click
    document.getElementById('settingsModal').addEventListener('click', (e) => {
        if (e.target.id === 'settingsModal') {
            closeSettings();
        }
    });
    
    document.getElementById('exportModal').addEventListener('click', (e) => {
        if (e.target.id === 'exportModal') {
            closeExportModal();
        }
    });
}

// Export/Import functions
async function openExportModal() {
    if (!currentChatId) {
        alert('No chat selected to export');
        return;
    }
    
    document.getElementById('exportModal').classList.remove('hidden');
}

function closeExportModal() {
    document.getElementById('exportModal').classList.add('hidden');
}

async function exportChat(format) {
    if (!currentChatId) return;
    
    const chat = await window.electronAPI.getChat(currentChatId);
    const messages = await window.electronAPI.getMessages(currentChatId);
    
    let content, filename, mimeType;
    
    switch (format) {
        case 'json':
            content = JSON.stringify({
                title: chat.title,
                created_at: chat.created_at,
                updated_at: chat.updated_at,
                messages: messages.map(m => ({
                    role: m.role,
                    content: m.content,
                    created_at: m.created_at,
                    attachments: m.attachments
                }))
            }, null, 2);
            filename = `${sanitizeFilename(chat.title)}.json`;
            mimeType = 'application/json';
            break;
            
        case 'markdown':
            content = `# ${chat.title}\n\n`;
            content += `Created: ${new Date(chat.created_at).toLocaleString()}\n\n`;
            content += `---\n\n`;
            messages.forEach(msg => {
                const role = msg.role === 'user' ? '**You**' : '**DataBrain AI**';
                content += `### ${role}\n\n${msg.content}\n\n`;
                if (msg.attachments) {
                    const atts = JSON.parse(msg.attachments);
                    atts.forEach(att => {
                        content += `📎 Attachment: ${att.name}\n`;
                    });
                    content += `\n`;
                }
            });
            filename = `${sanitizeFilename(chat.title)}.md`;
            mimeType = 'text/markdown';
            break;
            
        case 'txt':
            content = `${chat.title}\n`;
            content += `${'='.repeat(chat.title.length)}\n\n`;
            content += `Created: ${new Date(chat.created_at).toLocaleString()}\n\n`;
            messages.forEach(msg => {
                const role = msg.role === 'user' ? 'You' : 'DataBrain AI';
                content += `${role}:\n${msg.content}\n\n`;
                content += `${'-'.repeat(50)}\n\n`;
            });
            filename = `${sanitizeFilename(chat.title)}.txt`;
            mimeType = 'text/plain';
            break;
            
        case 'chatgpt':
            // ChatGPT compatible format
            content = JSON.stringify({
                title: chat.title,
                create_time: new Date(chat.created_at).getTime() / 1000,
                update_time: new Date(chat.updated_at).getTime() / 1000,
                mapping: messages.reduce((acc, msg, idx) => {
                    const id = `msg_${idx}`;
                    acc[id] = {
                        id: id,
                        message: {
                            id: id,
                            author: { role: msg.role },
                            content: {
                                content_type: 'text',
                                parts: [msg.content]
                            },
                            create_time: new Date(msg.created_at).getTime() / 1000
                        },
                        parent: idx > 0 ? `msg_${idx - 1}` : null,
                        children: idx < messages.length - 1 ? [`msg_${idx + 1}`] : []
                    };
                    return acc;
                }, {})
            }, null, 2);
            filename = `${sanitizeFilename(chat.title)}_chatgpt.json`;
            mimeType = 'application/json';
            break;
    }
    
    // Download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    closeExportModal();
}

async function importChat() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.md,.txt';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const content = event.target.result;
                let chatData;
                
                // Try to parse as JSON first
                try {
                    chatData = JSON.parse(content);
                    
                    // Check if it's ChatGPT format
                    if (chatData.mapping) {
                        chatData = convertChatGPTFormat(chatData);
                    }
                    
                    // Import the chat
                    await importChatData(chatData);
                    
                } catch (jsonError) {
                    // If not JSON, treat as plain text
                    await importPlainText(content, file.name);
                }
                
            } catch (error) {
                console.error('Import error:', error);
                alert('Failed to import chat: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function convertChatGPTFormat(chatGPTData) {
    const messages = [];
    const mapping = chatGPTData.mapping;
    
    // Build message chain
    const msgIds = Object.keys(mapping).filter(id => mapping[id].message);
    msgIds.sort((a, b) => {
        const timeA = mapping[a].message.create_time || 0;
        const timeB = mapping[b].message.create_time || 0;
        return timeA - timeB;
    });
    
    msgIds.forEach(id => {
        const msg = mapping[id].message;
        if (msg.content && msg.content.parts && msg.content.parts[0]) {
            messages.push({
                role: msg.author.role === 'user' ? 'user' : 'assistant',
                content: msg.content.parts[0],
                created_at: new Date(msg.create_time * 1000).toISOString()
            });
        }
    });
    
    return {
        title: chatGPTData.title || 'Imported Chat',
        messages: messages
    };
}

async function importChatData(chatData) {
    // Create new chat
    const title = chatData.title || 'Imported Chat';
    const result = await window.electronAPI.createChat(title);
    const newChatId = result.chatId;
    
    // Import messages
    for (const msg of chatData.messages) {
        await window.electronAPI.saveMessage(
            newChatId,
            msg.role,
            msg.content,
            msg.attachments || null
        );
    }
    
    // Reload chats and open the imported one
    await loadChats();
    await loadChat(newChatId);
    
    alert(`Chat "${title}" imported successfully with ${chatData.messages.length} messages!`);
}

async function importPlainText(content, filename) {
    const title = filename.replace(/\.(txt|md)$/, '') || 'Imported Chat';
    const result = await window.electronAPI.createChat(title);
    const newChatId = result.chatId;
    
    // Save entire content as first message
    await window.electronAPI.saveMessage(
        newChatId,
        'user',
        content,
        null
    );
    
    await loadChats();
    await loadChat(newChatId);
    
    alert(`Text file imported as "${title}"!`);
}

function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-z0-9]/gi, '_')
        .replace(/_+/g, '_')
        .substring(0, 50);
}

// Copy message to clipboard
function copyMessage(button, text) {
    // Decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    const decodedText = textarea.value;
    
    navigator.clipboard.writeText(decodedText).then(() => {
        // Visual feedback
        const originalHTML = button.innerHTML;
        button.classList.add('copied');
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13 4L6 11L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        
        setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = originalHTML;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy message');
    });
}

// Utility functions
function scrollToBottom(force = false) {
    const container = document.getElementById('messagesContainer');
    if (!container) return;
    
    if (force) {
        // Force scroll to bottom
        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
        });
        // Double check after a small delay
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 50);
    } else {
        // Check if user is near bottom (within 150px)
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
        
        if (isNearBottom) {
            requestAnimationFrame(() => {
                container.scrollTop = container.scrollHeight;
            });
        }
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ===========================
// MCP Server Management
// ===========================

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Load MCP servers when switching to MCP tab
        if (tabName === 'mcp-settings') {
            loadMCPServers();
        }
    });
});

// Load MCP servers
async function loadMCPServers() {
    try {
        const result = await window.electronAPI.mcpGetServers();

        if (result.success) {
            renderMCPServers(result.servers);
        } else {
            console.error('Failed to load MCP servers:', result.error);
        }
    } catch (error) {
        console.error('Error loading MCP servers:', error);
    }
}

// Render MCP servers list
function renderMCPServers(servers) {
    const serversList = document.getElementById('mcpServersList');

    if (!servers || servers.length === 0) {
        serversList.innerHTML = '<p style="color: var(--text-tertiary); text-align: center; padding: 32px;">No MCP servers connected. Click "Add Server" to get started.</p>';
        return;
    }

    serversList.innerHTML = servers.map(server => `
        <div class="mcp-server-item">
            <div class="mcp-server-info">
                <div class="mcp-server-name">${escapeHtml(server.name)}</div>
                <div class="mcp-server-details">
                    <span class="mcp-server-status ${server.connected ? 'connected' : 'disconnected'}">
                        <span class="mcp-status-dot"></span>
                        ${server.connected ? 'Connected' : 'Disconnected'}
                    </span>
                    <span class="mcp-server-tools">${server.toolCount || 0} tools</span>
                </div>
            </div>
            <div class="mcp-server-actions">
                ${!server.connected ?
                    `<button onclick="reconnectMCPServer('${escapeHtml(server.name)}')">Connect</button>` :
                    `<button onclick="disconnectMCPServer('${escapeHtml(server.name)}')">Disconnect</button>`
                }
                <button class="btn-danger" onclick="removeMCPServer('${escapeHtml(server.name)}')">Remove</button>
            </div>
        </div>
    `).join('');
}

// Show/hide MCP server form
document.getElementById('addMcpServerBtn').addEventListener('click', () => {
    document.getElementById('mcpServerForm').classList.remove('hidden');
    // Scroll to form
    document.getElementById('mcpServerForm').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

document.getElementById('cancelMcpServerBtn').addEventListener('click', () => {
    document.getElementById('mcpServerForm').classList.add('hidden');
    // Clear form
    document.getElementById('mcpServerName').value = '';
    document.getElementById('mcpServerCommand').value = '';
    document.getElementById('mcpServerArgs').value = '';
    document.getElementById('mcpServerEnv').value = '';
});

// Save MCP server
document.getElementById('saveMcpServerBtn').addEventListener('click', async () => {
    const name = document.getElementById('mcpServerName').value.trim();
    const command = document.getElementById('mcpServerCommand').value.trim();
    const argsInput = document.getElementById('mcpServerArgs').value.trim();
    const envInput = document.getElementById('mcpServerEnv').value.trim();

    if (!name || !command) {
        alert('Please provide server name and command');
        return;
    }

    // Parse arguments (split by spaces, respecting quotes)
    const args = argsInput ? argsInput.match(/(?:[^\s"]+|"[^"]*")+/g).map(arg => arg.replace(/^"(.*)"$/, '$1')) : [];

    // Parse environment variables
    let env = {};
    if (envInput) {
        try {
            env = JSON.parse(envInput);
        } catch (e) {
            alert('Invalid JSON format for environment variables');
            return;
        }
    }

    const config = {
        command,
        args,
        env
    };

    try {
        const result = await window.electronAPI.mcpConnectServer(name, config);

        if (result.success) {
            // Hide form and reload servers
            document.getElementById('mcpServerForm').classList.add('hidden');
            document.getElementById('mcpServerName').value = '';
            document.getElementById('mcpServerCommand').value = '';
            document.getElementById('mcpServerArgs').value = '';
            document.getElementById('mcpServerEnv').value = '';

            loadMCPServers();
            alert(`Successfully connected to ${name}`);
        } else {
            alert(`Failed to connect: ${result.error}`);
        }
    } catch (error) {
        console.error('Error connecting to MCP server:', error);
        alert('Failed to connect to server');
    }
});

// Disconnect MCP server
async function disconnectMCPServer(serverName) {
    try {
        const result = await window.electronAPI.mcpDisconnectServer(serverName);

        if (result.success) {
            loadMCPServers();
        } else {
            alert(`Failed to disconnect: ${result.error}`);
        }
    } catch (error) {
        console.error('Error disconnecting from MCP server:', error);
        alert('Failed to disconnect from server');
    }
}

// Reconnect MCP server
async function reconnectMCPServer(serverName) {
    // Get settings to retrieve server config
    const settings = await window.electronAPI.getSettings();

    if (settings.mcpServers && settings.mcpServers[serverName]) {
        try {
            const result = await window.electronAPI.mcpConnectServer(serverName, settings.mcpServers[serverName]);

            if (result.success) {
                loadMCPServers();
            } else {
                alert(`Failed to reconnect: ${result.error}`);
            }
        } catch (error) {
            console.error('Error reconnecting to MCP server:', error);
            alert('Failed to reconnect to server');
        }
    }
}

// Remove MCP server
async function removeMCPServer(serverName) {
    if (!confirm(`Are you sure you want to remove "${serverName}"?`)) {
        return;
    }

    try {
        const result = await window.electronAPI.mcpRemoveServer(serverName);

        if (result.success) {
            loadMCPServers();
        } else {
            alert(`Failed to remove: ${result.error}`);
        }
    } catch (error) {
        console.error('Error removing MCP server:', error);
        alert('Failed to remove server');
    }
}

// Make functions global so they can be called from onclick
window.disconnectMCPServer = disconnectMCPServer;
window.reconnectMCPServer = reconnectMCPServer;
window.removeMCPServer = removeMCPServer;