# 实践过程

## 资源

1. 官方文档：<https://modelcontextprotocol.io/docs/getting-started/intro>
2. mcp github: <https://github.com/modelcontextprotocol>
3. typescript-sdk: <https://github.com/modelcontextprotocol/typescript-sdk?tab=readme-ov-file>

## 使用

- stdio模式：本地服务模式

    ```js

        import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
        import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

        const server = new McpServer({
            name: 'rt-api-mcp',
            version: '0.1.0',
        });

        const transport = new StdioServerTransport();
        await server.connect(transport);

    ```

- http模式：远程服务模式

   ```js
        import express from 'express';

        import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
        import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

        const app = express();
        app.use(express.json());

       app.get('/health', (_req, res) => {
            res.json({ status: 'ok' });
        });

        app.post("/mcp", async (req, res) => {
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

        app.listen(3000, () => {
            console.log(
                `[MCP] HTTP transport listening on http://localhost:${env.MCP_HTTP_PORT}${env.MCP_HTTP_PATH}`,
            );
        });
    ```

## 核心

- tool：编写模型调用的工具，模型根据语句分析能够自动调用对应的工具
- resources：资源包，客户端传送的附件等可以捕捉分析
- prompt：提示词，编译内置提示词，从而减少用户使用复杂度
