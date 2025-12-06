# MCP Resources 详解

## Resources 是什么？

Resources 是 MCP 中的**数据暴露机制**，让 LLM 能够**读取**外部数据源。

```
┌─────────────────────────────────────────────────────────────────┐
│                    MCP 三大核心能力对比                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Tools (工具)        Resources (资源)       Prompts (提示)      │
│   ─────────────       ────────────────       ───────────────     │
│   执行动作             提供数据               提供模板            │
│   如：发邮件           如：读取文件           如：代码审查提示      │
│                                                                 │
│   LLM 主动调用         Client/用户请求        用户选择使用         │
│   有输入参数           通过 URI 访问          可带参数模板         │
│                                                                 │
│   POST 操作            GET 操作              模板渲染             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Resources vs Tools 核心区别

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   Tools (工具)                    Resources (资源)              │
│   ────────────                    ────────────────             │
│                                                                │
│   📧 发送邮件                      📄 读取邮件列表               │
│   📝 创建文件                      📖 读取文件内容               │
│   🗑️ 删除记录                      📊 获取数据库数据              │
│   💾 保存数据                      🔍 查看系统状态               │
│                                                                │
│   → 有副作用，改变状态              → 无副作用，只读数据          │
│   → LLM 决定何时调用               → 通常预加载到上下文           │
│   → 动态参数                       → 通过 URI 标识               │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Resources 工作流程

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Client  │    │   MCP    │    │  数据源   │
│          │    │  Server  │    │ (文件等)  │
└────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │
     │ 1. 列出资源    │               │
     │──resources/list─>             │
     │<─资源列表──────│               │
     │               │               │
     │ 2. 读取资源    │               │
     │──resources/read─>             │
     │               │───读取数据────>│
     │               │<──返回数据─────│
     │<─资源内容──────│               │
     │               │               │
     │ 3. 订阅变化(可选)              │
     │──resources/subscribe─>        │
     │               │               │
     │ 4. 变化通知    │               │
     │<─notification─│               │
     │               │               │
```

## 代码示例

### 1. 定义静态资源

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({
  name: "docs-server",
  version: "1.0.0"
});

// 定义静态资源
server.resource(
  "readme",                              // 资源名称
  "file:///project/README.md",           // URI
  async (uri) => {
    const content = await fs.readFile("./README.md", "utf-8");
    return {
      contents: [{
        uri: uri.href,
        mimeType: "text/markdown",
        text: content
      }]
    };
  }
);

// 定义配置文件资源
server.resource(
  "config",
  "file:///project/config.json",
  async (uri) => {
    const config = await fs.readFile("./config.json", "utf-8");
    return {
      contents: [{
        uri: uri.href,
        mimeType: "application/json",
        text: config
      }]
    };
  }
);
```

### 2. 定义动态资源模板

```typescript
// 使用资源模板 - 支持动态参数
server.resourceTemplate(
  "user-profile",
  "user://{userId}/profile",           // URI 模板
  "用户个人资料",
  async (uri, { userId }) => {
    const user = await database.getUser(userId);
    return {
      contents: [{
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(user)
      }]
    };
  }
);

// 数据库表资源
server.resourceTemplate(
  "db-table",
  "db:///{database}/{table}",
  "数据库表内容",
  async (uri, { database, table }) => {
    const data = await db.query(`SELECT * FROM ${database}.${table} LIMIT 100`);
    return {
      contents: [{
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(data)
      }]
    };
  }
);
```

### 3. 完整的文件系统资源服务器

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as fs from "fs/promises";
import * as path from "path";

const server = new McpServer({
  name: "filesystem-server",
  version: "1.0.0"
});

const PROJECT_ROOT = "/path/to/project";

// ===== 列出所有资源 =====
server.setRequestHandler("resources/list", async () => {
  const files = await fs.readdir(PROJECT_ROOT, { recursive: true });
  
  return {
    resources: files
      .filter(file => !file.includes("node_modules"))
      .map(file => ({
        uri: `file:///${file}`,
        name: path.basename(file),
        description: `项目文件: ${file}`,
        mimeType: getMimeType(file)
      }))
  };
});

// ===== 读取单个资源 =====
server.setRequestHandler("resources/read", async (request) => {
  const uri = new URL(request.params.uri);
  const filePath = path.join(PROJECT_ROOT, uri.pathname);
  
  // 安全检查
  if (!filePath.startsWith(PROJECT_ROOT)) {
    throw new Error("Access denied");
  }
  
  const content = await fs.readFile(filePath, "utf-8");
  
  return {
    contents: [{
      uri: request.params.uri,
      mimeType: getMimeType(filePath),
      text: content
    }]
  };
});

// ===== 订阅资源变化 =====
server.setRequestHandler("resources/subscribe", async (request) => {
  const uri = request.params.uri;
  
  // 监听文件变化
  const filePath = new URL(uri).pathname;
  fs.watch(path.join(PROJECT_ROOT, filePath), () => {
    // 发送通知
    server.notification({
      method: "notifications/resources/updated",
      params: { uri }
    });
  });
  
  return {};
});

function getMimeType(filename: string): string {
  const ext = path.extname(filename);
  const mimeTypes: Record<string, string> = {
    ".ts": "text/typescript",
    ".js": "text/javascript",
    ".json": "application/json",
    ".md": "text/markdown",
    ".html": "text/html",
    ".css": "text/css",
  };
  return mimeTypes[ext] || "text/plain";
}

// 启动服务器
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 4. Client 端使用资源

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

class ResourceClient {
  private client: Client;

  // 获取所有可用资源
  async listResources() {
    const response = await this.client.listResources();
    
    console.log("可用资源:");
    response.resources.forEach(r => {
      console.log(`  - ${r.name}: ${r.uri}`);
    });
    
    return response.resources;
  }

  // 读取特定资源
  async readResource(uri: string) {
    const response = await this.client.readResource({ uri });
    return response.contents[0];
  }

  // 将资源内容注入到 LLM 上下文
  async chatWithResources(userMessage: string, resourceUris: string[]) {
    // 1. 读取所有需要的资源
    const resourceContents = await Promise.all(
      resourceUris.map(uri => this.readResource(uri))
    );

    // 2. 构建上下文消息
    const contextMessage = resourceContents
      .map(r => `--- ${r.uri} ---\n${r.text}`)
      .join("\n\n");

    // 3. 发送给 LLM
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `以下是相关资源内容：\n\n${contextMessage}\n\n用户问题：${userMessage}`
        }
      ]
    });

    return response;
  }
}

// 使用示例
const client = new ResourceClient();

// 列出所有资源
const resources = await client.listResources();
// 输出:
// 可用资源:
//   - README.md: file:///README.md
//   - config.json: file:///config.json
//   - index.ts: file:///src/index.ts

// 读取特定资源
const readme = await client.readResource("file:///README.md");
console.log(readme.text);

// 带资源上下文的对话
const answer = await client.chatWithResources(
  "这个项目是做什么的？",
  ["file:///README.md", "file:///package.json"]
);
```

## 实际应用场景

```
┌─────────────────────────────────────────────────────────────────┐
│                      Resources 应用场景                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📁 文件系统                                                     │
│     file:///project/src/index.ts                                │
│     → 让 LLM 读取代码文件进行分析                                 │
│                                                                 │
│  🗄️ 数据库                                                       │
│     db:///mydb/users                                            │
│     → 暴露数据库表结构和示例数据                                  │
│                                                                 │
│  📊 API 数据                                                     │
│     api:///github/repos/owner/repo                              │
│     → 提供 API 响应数据供分析                                     │
│                                                                 │
│  📝 文档                                                         │
│     docs:///api-reference                                       │
│     → 提供产品文档作为上下文                                      │
│                                                                 │
│  🔧 配置                                                         │
│     config:///app/settings                                      │
│     → 提供系统配置信息                                           │
│                                                                 │
│  📈 监控数据                                                     │
│     metrics:///server/cpu                                       │
│     → 提供系统监控数据                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 与 Tools 配合使用

```typescript
const server = new McpServer({ name: "project-server", version: "1.0.0" });

// ===== Resources: 只读访问 =====
server.resource(
  "source-code",
  "file:///src/main.ts",
  async () => ({
    contents: [{
      uri: "file:///src/main.ts",
      text: await fs.readFile("./src/main.ts", "utf-8")
    }]
  })
);

// ===== Tools: 写入操作 =====
server.tool(
  "update_file",
  "更新文件内容",
  {
    path: { type: "string", description: "文件路径" },
    content: { type: "string", description: "新内容" }
  },
  async ({ path, content }) => {
    await fs.writeFile(path, content);
    return {
      content: [{ type: "text", text: `文件 ${path} 已更新` }]
    };
  }
);
```

```
典型工作流：

1. Client 读取 Resources → 代码文件内容
2. 发送给 LLM："请优化这段代码"
3. LLM 分析后调用 Tool → update_file
4. 文件被更新

Resources = 读取数据 (GET)
Tools = 执行操作 (POST/PUT/DELETE)
```

## 总结

```
┌────────────────────────────────────────────────────────────────┐
│                     Resources 核心要点                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ✅ 用途：暴露只读数据给 LLM                                     │
│                                                                │
│  ✅ 特点：                                                       │
│     • 通过 URI 标识 (file://, db://, api://)                    │
│     • 支持静态资源和动态模板                                     │
│     • 可订阅变化通知                                            │
│     • 无副作用，安全的数据访问                                   │
│                                                                │
│  ✅ 与 Tools 区别：                                              │
│     • Resources = 读取数据                                      │
│     • Tools = 执行操作                                          │
│                                                                │
│  ✅ 典型场景：                                                   │
│     • 文件内容、数据库数据、API 响应                             │
│     • 作为 LLM 对话的上下文信息                                  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

