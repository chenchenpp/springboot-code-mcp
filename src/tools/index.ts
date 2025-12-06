import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { help } from './help.js';
import { queryEmpTree } from './queryEmpTree.js';
import { pomDependency } from './pomDependency.js';

export function registerTools(server: McpServer) {
  help(server);
  queryEmpTree(server);
  pomDependency(server);
}
