import express from 'express';
import { env } from './env.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { registerTools } from './tools/index.js';
// import { createHash } from 'crypto';

async function startStdio(server: McpServer) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('[MCP] STDIO transport started. Waiting for client...');
}

async function startHttp(server: McpServer) {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post(env.MCP_HTTP_PATH, async (req, res) => {
    // const hash = createHash('sha256').update(Date.now().toString()).digest('hex').substring(0, 16); // 简短指纹
    const transport = new StreamableHTTPServerTransport({
      enableJsonResponse: true,
      // 使用hash值作为会话id
      sessionIdGenerator: undefined,
    });

    res.on('close', () => {
      transport.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  app.listen(env.MCP_HTTP_PORT, () => {
    console.log(
      `[MCP] HTTP transport listening on http://localhost:${env.MCP_HTTP_PORT}${env.MCP_HTTP_PATH}`,
    );
  });
}

function getMode(): 'stdio' | 'http' {
  const args = new Set(process.argv.slice(2));
  if (args.has('--http')) return 'http';
  if (args.has('--stdio')) return 'stdio';
  return env.MCP_MODE;
}

async function main() {
  const server = new McpServer({
    name: 'rt-api-mcp',
    version: '0.1.0',
  });

  registerTools(server);

  const mode = getMode();

  if (mode === 'http') {
    await startHttp(server);
  } else {
    await startStdio(server);
  }
}

main().catch((err) => {
  console.error('[MCP] Fatal error', err);
  process.exitCode = 1;
});
