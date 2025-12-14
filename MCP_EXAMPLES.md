# MCP Server Configuration Examples

This document provides examples of how to configure popular MCP servers with DataBrain AI.

## What is MCP?

Model Context Protocol (MCP) is a protocol that allows AI models to interact with external tools and services. By connecting MCP servers to DataBrain AI, you can extend the AI's capabilities with features like filesystem access, web search, database queries, and more.

## How to Add MCP Servers

1. Open **Settings** (Ctrl+, or Cmd+,)
2. Go to the **MCP Servers** tab
3. Click **Add Server**
4. Fill in the server configuration
5. Click **Connect**

---

## Popular MCP Servers

### 1. Filesystem Access

Allows the AI to read and write files on your computer.

**Configuration:**
- **Server Name:** `filesystem`
- **Command:** `npx`
- **Arguments:** `-y @modelcontextprotocol/server-filesystem C:\Users\YourName\Documents`
- **Environment Variables:** (leave empty)

**Note:** Replace `C:\Users\YourName\Documents` with the path you want to give the AI access to.

**Use Cases:**
- Read and analyze files
- Create and edit documents
- Search through directories
- Organize files

---

### 2. Brave Search

Enables the AI to search the web using Brave Search API.

**Configuration:**
- **Server Name:** `brave-search`
- **Command:** `npx`
- **Arguments:** `-y @modelcontextprotocol/server-brave-search`
- **Environment Variables:**
```json
{
  "BRAVE_API_KEY": "your-brave-api-key-here"
}
```

**Get API Key:** https://brave.com/search/api/

**Use Cases:**
- Search for current information
- Find recent news
- Research topics
- Fact-checking

---

### 3. GitHub Integration

Access GitHub repositories, issues, pull requests, and more.

**Configuration:**
- **Server Name:** `github`
- **Command:** `npx`
- **Arguments:** `-y @modelcontextprotocol/server-github`
- **Environment Variables:**
```json
{
  "GITHUB_TOKEN": "your-github-token-here"
}
```

**Get Token:** https://github.com/settings/tokens

**Use Cases:**
- Read repository code
- Create and manage issues
- Review pull requests
- Search code across repositories

---

### 4. PostgreSQL Database

Connect to PostgreSQL databases.

**Configuration:**
- **Server Name:** `postgres`
- **Command:** `npx`
- **Arguments:** `-y @modelcontextprotocol/server-postgres`
- **Environment Variables:**
```json
{
  "POSTGRES_CONNECTION_STRING": "postgresql://user:password@localhost:5432/database"
}
```

**Use Cases:**
- Query databases
- Analyze data
- Generate reports
- Database management

---

### 5. Google Drive

Access and manage Google Drive files.

**Configuration:**
- **Server Name:** `gdrive`
- **Command:** `npx`
- **Arguments:** `-y @modelcontextprotocol/server-gdrive`
- **Environment Variables:**
```json
{
  "GOOGLE_CLIENT_ID": "your-client-id",
  "GOOGLE_CLIENT_SECRET": "your-client-secret"
}
```

**Setup:** Follow Google Drive API setup instructions

**Use Cases:**
- Read Google Docs
- Manage files and folders
- Search drive content
- Upload and download files

---

### 6. Slack Integration

Interact with Slack workspaces.

**Configuration:**
- **Server Name:** `slack`
- **Command:** `npx`
- **Arguments:** `-y @modelcontextprotocol/server-slack`
- **Environment Variables:**
```json
{
  "SLACK_BOT_TOKEN": "xoxb-your-token-here"
}
```

**Get Token:** https://api.slack.com/apps

**Use Cases:**
- Send messages to channels
- Read conversations
- Search message history
- Manage channels

---

### 7. Memory/Knowledge Base

Persistent memory for the AI across sessions.

**Configuration:**
- **Server Name:** `memory`
- **Command:** `npx`
- **Arguments:** `-y @modelcontextprotocol/server-memory`
- **Environment Variables:** (leave empty)

**Use Cases:**
- Remember important information
- Build knowledge bases
- Track long-term context
- Personal AI assistant

---

### 8. Puppeteer (Browser Automation)

Automate web browsers for scraping and testing.

**Configuration:**
- **Server Name:** `puppeteer`
- **Command:** `npx`
- **Arguments:** `-y @modelcontextprotocol/server-puppeteer`
- **Environment Variables:** (leave empty)

**Use Cases:**
- Web scraping
- Automated testing
- Take screenshots
- Fill web forms

---

### 9. SQLite Database

Work with SQLite databases.

**Configuration:**
- **Server Name:** `sqlite`
- **Command:** `npx`
- **Arguments:** `-y @modelcontextprotocol/server-sqlite C:\path\to\database.db`
- **Environment Variables:** (leave empty)

**Use Cases:**
- Query local databases
- Data analysis
- Database management
- SQLite file operations

---

### 10. AWS S3

Interact with Amazon S3 storage.

**Configuration:**
- **Server Name:** `aws-s3`
- **Command:** `npx`
- **Arguments:** `-y @modelcontextprotocol/server-aws-s3`
- **Environment Variables:**
```json
{
  "AWS_ACCESS_KEY_ID": "your-access-key",
  "AWS_SECRET_ACCESS_KEY": "your-secret-key",
  "AWS_REGION": "us-east-1"
}
```

**Use Cases:**
- Upload/download files
- Manage S3 buckets
- List and search objects
- File operations

---

## Custom MCP Servers

You can also create your own MCP servers! Check the MCP documentation:
https://modelcontextprotocol.io/

### Example: Local Python MCP Server

**Configuration:**
- **Server Name:** `my-custom-server`
- **Command:** `python`
- **Arguments:** `C:\path\to\my_mcp_server.py`
- **Environment Variables:** (as needed)

---

## Troubleshooting

### Server Won't Connect

1. **Check command availability:** Make sure `npx` or the command is in your PATH
2. **Verify API keys:** Ensure environment variables are correct
3. **Check permissions:** Some servers need file/folder access
4. **View logs:** Open DevTools (Ctrl+Shift+I) and check Console for errors

### Server Connected but No Tools

- The server may be starting up - wait a few seconds and refresh
- Check if the server is compatible with your system
- Verify the server package is installed correctly

### Tools Not Being Used

- Make sure you're using a model that supports function calling (GPT-4, GPT-3.5-turbo)
- The AI decides when to use tools - you may need to ask explicitly
- Some tasks may not require external tools

---

## Best Practices

1. **Start Small:** Connect one server at a time to test
2. **Limit Access:** Only give filesystem access to specific folders
3. **Secure API Keys:** Keep your API keys private and secure
4. **Monitor Usage:** Some MCP servers may have API rate limits or costs
5. **Disconnect When Done:** Disconnect unused servers to save resources

---

## Need Help?

- MCP Documentation: https://modelcontextprotocol.io/
- MCP Server Registry: https://github.com/modelcontextprotocol/servers
- DataBrain AI Issues: https://github.com/humolot/databrain-ai/issues
