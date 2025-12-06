import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export function help(server: McpServer) {
  server.registerTool(
    'help',
    {
      title: '帮助',
      description: '输入 help 寻求帮助',
      inputSchema: {},
    },
    async (): Promise<CallToolResult> => {
      const info = `
        rt-api-mcp是用于获取“新组织与权限接口”的mcp工具；主要帮助你在开发项目时，自动编写依赖接口的代码编写
        输入参数调用工具：
          1. 通过命令行参数指定输入参数，例如：--input '{"name":"张三","age":18}'
          2. 通过环境变量指定输入参数，例如：INPUT='{"name":"张三","age":18}' node index.js
          3. 通过stdin输入参数，例如：echo '{"name":"张三","age":18}' | node index.js
          4. 通过环境变量指定输入参数，例如：INPUT='{"name":"张三","age":18}' node index.js
      `;
      // await server.sendLoggingMessage({
      //   level: 'info',
      //   data: `${JSON.stringify(output)}`,
      // });
      return {
        content: [{ type: 'text', text: info }],
        // structuredContent: output,
      };
    },
  );
}
