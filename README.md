# MCP Integration - DataBrain AI

## 🚀 What's New

DataBrain AI now supports **Model Context Protocol (MCP)** integration! This powerful feature allows your AI assistant to connect to external tools and services, dramatically expanding its capabilities.

## 🎯 What is MCP?

Model Context Protocol (MCP) is an open protocol that enables AI models to securely interact with external tools, databases, APIs, and services. Think of it as giving your AI superpowers!

### With MCP, your AI can:

- 📁 **Read and write files** on your computer
- 🌐 **Search the web** in real-time
- 💾 **Query databases** (PostgreSQL, SQLite, etc.)
- 🐙 **Access GitHub** repositories and issues
- ☁️ **Manage cloud storage** (Google Drive, AWS S3)
- 🤖 **Automate browsers** with Puppeteer
- 💬 **Send Slack messages** and more!

## 🔧 How It Works

1. **MCP Servers** are small programs that provide specific tools/capabilities
2. **DataBrain AI** connects to these servers as a client
3. When you chat with the AI, it can **automatically use** the available tools
4. **Results are integrated** seamlessly into the conversation

### Architecture

```
┌─────────────────────────────────────────┐
│         DataBrain AI (You)              │
│                                         │
│  "Search for the latest AI news"        │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│      DataBrain AI (MCP Client)          │
│                                         │
│  Decides to use: brave-search::search   │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│    MCP Server (Brave Search)            │
│                                         │
│  Executes web search and returns results│
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│         DataBrain AI Response           │
│                                         │
│  "Here's what I found: [results]..."    │
└─────────────────────────────────────────┘
```

## 🎨 Features Implemented

### ✅ Complete MCP Client Support

- ✅ Connect to multiple MCP servers simultaneously
- ✅ Auto-reconnect saved servers on app startup
- ✅ Real-time server status monitoring
- ✅ Tool discovery and registration
- ✅ Automatic tool calling during AI conversations

### ✅ User-Friendly UI

- ✅ **Settings → MCP Servers** tab with full management
- ✅ Add/Remove/Connect/Disconnect servers
- ✅ View available tools per server
- ✅ Server status indicators (Connected/Disconnected)
- ✅ Built-in examples for popular servers

### ✅ Smart AI Integration

- ✅ AI automatically detects when to use MCP tools
- ✅ Works with GPT-4, GPT-4o, and GPT-3.5-turbo
- ✅ Seamless tool execution in streaming responses
- ✅ Error handling and fallback mechanisms

## 📖 Quick Start Guide

### Step 1: Open Settings

Press `Ctrl+,` (or `Cmd+,` on Mac) to open Settings.

### Step 2: Go to MCP Servers Tab

Click on the **"MCP Servers"** tab.

### Step 3: Add Your First Server

Click **"Add Server"** and configure:

**Example: Filesystem Access**

```
Server Name: filesystem
Command: npx
Arguments: -y @modelcontextprotocol/server-filesystem C:\Users\YourName\Documents
Environment Variables: (leave empty)
```

### Step 4: Click Connect

The server will connect and show as "Connected" with available tools.

### Step 5: Chat with Enhanced AI

Now your AI can read/write files! Try:

> "List the files in my Documents folder"

> "Create a new file called notes.txt with my meeting notes"

## 📚 Configuration Examples

See [MCP_EXAMPLES.md](./MCP_EXAMPLES.md) for detailed configuration examples including:

- 📁 Filesystem access
- 🔍 Brave Search
- 🐙 GitHub integration
- 💾 PostgreSQL & SQLite
- ☁️ Google Drive & AWS S3
- 💬 Slack integration
- 🧠 Memory/Knowledge base
- 🌐 Puppeteer browser automation
- And many more!

## 🔒 Security Considerations

### Filesystem Access

- ⚠️ **Only grant access to specific folders** you trust
- ⚠️ **Avoid giving access to system folders** (C:\Windows, /etc, etc.)
- ✅ Use dedicated folders for AI interactions

### API Keys

- ✅ API keys are stored locally in your DataBrain AI settings
- ✅ Never share your API keys
- ✅ Use environment variables for sensitive data
- ✅ Regularly rotate API keys

### MCP Server Trust

- ✅ Only use MCP servers from trusted sources
- ✅ Review server code if possible
- ⚠️ Third-party servers may have access to data you provide

## 🛠️ Troubleshooting

### Server Won't Connect

**Problem:** "Failed to connect to server"

**Solutions:**
1. Ensure `npx` is installed: `npm install -g npm`
2. Check if Node.js is installed: `node --version`
3. Verify the command path is correct
4. Check firewall/antivirus settings

### No Tools Available

**Problem:** Server shows "0 tools"

**Solutions:**
1. Wait a few seconds for server initialization
2. Disconnect and reconnect the server
3. Check server logs in DevTools (Ctrl+Shift+I → Console)
4. Verify server package is compatible

### AI Not Using Tools

**Problem:** AI responds but doesn't use MCP tools

**Solutions:**
1. Use a model that supports function calling (GPT-4, GPT-4o, GPT-3.5-turbo)
2. Be explicit in your request: "Use the filesystem tool to..."
3. Ensure the server is connected
4. Check if the task actually requires external tools

### Server Disconnected

**Problem:** Server shows "Disconnected"

**Solutions:**
1. Click "Connect" to reconnect
2. Check if the server process crashed (view logs)
3. Verify environment variables are correct
4. Restart DataBrain AI

## 🎓 Advanced Usage

### Multiple Servers

You can connect multiple servers simultaneously! For example:

- `filesystem` for file operations
- `brave-search` for web searches
- `github` for code repositories
- `postgres` for database queries

The AI will intelligently choose which tool to use based on your request.

### Custom MCP Servers

You can build your own MCP servers! See:
- [MCP SDK Documentation](https://modelcontextprotocol.io/)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)

### Environment Variables

For servers that need API keys or config:

```json
{
  "API_KEY": "your-key-here",
  "API_ENDPOINT": "https://api.example.com",
  "ENABLE_DEBUG": "true"
}
```

## 🚀 Future Enhancements

Planned features:
- [ ] MCP server marketplace/directory
- [ ] One-click server installation
- [ ] Server health monitoring dashboard
- [ ] Tool usage statistics
- [ ] Server templates for common use cases
- [ ] Resource (prompts, context) support

## 📝 Technical Details

### Files Modified/Added

```
databrain-ai/
├── mcp-manager.js              # New: MCP client manager
├── main.js                     # Modified: MCP integration
├── preload.js                  # Modified: MCP API exposure
├── renderer/
│   ├── index.html             # Modified: MCP UI
│   ├── css/styles.css         # Modified: MCP styles
│   └── js/app.js              # Modified: MCP frontend logic
├── MCP_README.md              # New: This file
└── MCP_EXAMPLES.md            # New: Configuration examples
```

### Dependencies Added

```json
{
  "@modelcontextprotocol/sdk": "^latest"
}
```

### IPC Handlers Added

- `mcp-get-servers` - Get all connected servers
- `mcp-get-tools` - Get all available tools
- `mcp-connect-server` - Connect to a server
- `mcp-disconnect-server` - Disconnect from a server
- `mcp-remove-server` - Remove server configuration
- `mcp-call-tool` - Manually call a tool

## 🤝 Contributing

Found a bug or have a feature request? Open an issue on GitHub!

Want to add a new MCP server example? Submit a PR with updates to MCP_EXAMPLES.md.

## 📄 License

MCP integration follows the same MIT License as DataBrain AI.

## 🙏 Credits

- [MCP Community](https://modelcontextprotocol.io/) for server implementations
- DataBrain AI contributors

---

**Enjoy your supercharged AI assistant!** 🎉
