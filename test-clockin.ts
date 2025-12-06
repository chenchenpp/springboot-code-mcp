#!/usr/bin/env tsx

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTools } from './src/tools/index.js';

async function test() {
  const server = new McpServer({
    name: 'rt-api-mcp-test',
    version: '0.1.0',
  });

  registerTools(server);

  console.log('Tools registered successfully!');
  console.log('Available tools: getClockInChannelPage, performClockIn');
}

test().catch(console.error);