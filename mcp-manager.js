const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { ListRootsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const path = require('path');

class MCPManager
{
	constructor()
	{
		this.clients = new Map();
	}

	findNpx()
	{
		return process.platform === 'win32' ? 'npx.cmd' : 'npx';
	}

	async connectServer(serverName, config)
	{
		if (this.clients.has(serverName)) {
			return this.getServerInfo(serverName);
		}

		let command = config.command;
		if (command === 'npx') {
			command = this.findNpx();
		}

		console.log(`[MCP] Connecting: ${serverName}`);
		console.log(`[MCP] ${command} ${config.args?.join(' ') || ''}`);

		const client = new Client(
		{ name: 'databrain-ai', version: '1.0.0' },
		{
			capabilities: {
				roots: { listChanged: true }
			}
		}
		);

		// Roots handler (filesystem support)
		client.setRequestHandler(ListRootsRequestSchema, async () => {
			const dirs =
			config.args?.filter(arg =>
			!arg.startsWith('-') &&
			(arg.includes(':') || arg.includes('/') || arg.includes('\\'))
			) || [];

			return {
				roots: dirs.map(dir => ({
					uri: `file://${dir.replace(/\\/g, '/')}`,
					name: path.basename(dir)
				}))
			};
		});

		const transport = new StdioClientTransport({
			command,
			args: config.args || [],
			env: { ...process.env, ...config.env }
		});

		transport.onerror = err => {
			console.error(`[MCP:${serverName}] transport error`, err);
		};

		await client.connect(transport);

		let tools = [];
		let resources = [];

		// SAFE discovery
		try {
			const res = await client.listResources();
			resources = res?.resources || [];
		} catch {
			console.log(`[MCP] ${serverName} has no resources`);
		}

		try {
			const res = await client.listTools();
			tools = res?.tools || [];
		} catch {
			console.log(`[MCP] ${serverName} has no tools`);
		}

		const proc = transport._process;

		if (proc?.stderr) {
			proc.stderr.on('data', d =>
			console.error(`[MCP:${serverName} stderr]`, d.toString())
			);
		}

		this.clients.set(serverName, {
			serverName,
			client,
			transport,
			process: proc,
			tools,
			resources
		});

		console.log(
		`[MCP] Connected ${serverName} | tools=${tools.length} | resources=${resources.length}`
		);

		return this.getServerInfo(serverName);
	}

	getServerInfo(serverName)
	{
		const s = this.clients.get(serverName);
		if (!s)
			return null;

		return {
			name: serverName,
			connected: true,
			toolCount: s.tools.length,
			resourceCount: s.resources.length,
			tools: s.tools,
			resources: s.resources
		};
	}

	getAllServers()
	{
		return [...this.clients.keys()].map(n => this.getServerInfo(n));
	}

	getAllTools()
	{
		const out = [];
		for (const [serverName, s] of this.clients) {
			for (const tool of s.tools) {
				out.push({
					...tool,
					serverName,
					fullName: `${serverName}::${tool.name}`
				});
			}
		}
		return out;
	}

	async callTool(serverName, toolName, args =
	{
	}) {
		const s = this.clients.get(serverName);
		if (!s)
			throw new Error(`Server ${serverName} not connected`);

		return s.client.callTool({
			name: toolName,
			arguments: args
		});
	}

	async readResource(serverName, uri)
	{
		const s = this.clients.get(serverName);
		if (!s)
			throw new Error(`Server ${serverName} not connected`);

		return s.client.readResource({ uri });
	}

	async disconnectServer(serverName)
	{
		const s = this.clients.get(serverName);
		if (!s)
			return;

		try {
			await s.transport.close();
			s.process?.kill();
		} finally {
			this.clients.delete(serverName);
		}

		console.log(`[MCP] Disconnected ${serverName}`);
	}

	async disconnectAll()
	{
		for (const name of this.clients.keys()) {
			await this.disconnectServer(name);
		}
	}
}

module.exports = MCPManager;
