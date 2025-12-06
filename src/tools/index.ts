import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { help } from './help.js';
import { clockInActivity } from './clockInActivity.js';
import { queryEmpTree } from './queryEmpTree.js';

export function registerTools(server: McpServer) {
  help(server);
  clockInActivity(server);
  queryEmpTree(server);
}
