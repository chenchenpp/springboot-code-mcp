import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { readFile } from 'fs/promises';
import path from 'path';

export function help(server: McpServer) {
  server.registerTool(
    'help',
    {
      title: '帮助',
      description: '介绍rt-api-mcp工具的使用说明',
      inputSchema: {},
    },
    async (): Promise<CallToolResult> => {
      const content = await readFile(path.resolve('src/apiData/help.md'), 'utf-8');
      // await server.sendLoggingMessage({
      //   level: 'info',
      //   data: `${JSON.stringify(output)}`,
      // });
      return {
        content: [{ type: 'text', text: content }],
        structuredContent: {
          type: 'markdown',
          data: content,
        },
      };
    },
  );
}
