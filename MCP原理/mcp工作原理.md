# MCP 工具调用流程详解

这是一个很好的问题！让我详细解释模型（LLM）是如何知道调用哪个 MCP 工具的。

## 核心流程图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          完整调用流程                                    │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  用户     │    │  Client  │    │   LLM    │    │  MCP     │
│          │    │ (Claude) │    │  (模型)   │    │  Server  │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │
     │ 1.连接启动     │               │               │
     │               │──────── tools/list ──────────>│
     │               │<─────── 返回工具列表 ──────────│
     │               │               │               │
     │ 2.用户提问     │               │               │
     │──"今天天气"──>│               │               │
     │               │               │               │
     │               │ 3.发送给LLM    │               │
     │               │──消息+工具定义─>│               │
     │               │               │               │
     │               │ 4.LLM决策      │               │
     │               │<─tool_use────│               │
     │               │  (调用哪个工具) │               │
     │               │               │               │
     │               │ 5.执行工具     │               │
     │               │──────── tools/call ──────────>│
     │               │<─────── 返回结果 ──────────────│
     │               │               │               │
     │               │ 6.再次发给LLM  │               │
     │               │──结果────────>│               │
     │               │<─最终回答─────│               │
     │               │               │               │
     │<──返回答案────│               │               │
     │               │               │               │
```

## 关键点：工具是如何被"发现"的

### 1. MCP Server 定义工具

```typescript
// your-mcp-server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({
  name: "weather-server",
  version: "1.0.0"
});

// 定义工具 - 这里的描述非常重要！
server.tool(
  "get_weather",           // 工具名称
  "获取指定城市的天气信息，包括温度、湿度、天气状况等", // 描述 - LLM靠这个理解
  {
    // 参数 JSON Schema
    city: {
      type: "string",
      description: "城市名称，如：北京、上海、深圳"
    },
    unit: {
      type: "string",
      enum: ["celsius", "fahrenheit"],
      description: "温度单位"
    }
  },
  async ({ city, unit }) => {
    // 实际执行逻辑
    const weather = await fetchWeatherAPI(city, unit);
    return {
      content: [{ type: "text", text: JSON.stringify(weather) }]
    };
  }
);
```

### 2. Client 获取工具列表

```typescript
// 当 Client 连接到 Server 时
const tools = await client.listTools();

// 返回的工具列表格式：
{
  tools: [
    {
      name: "get_weather",
      description: "获取指定城市的天气信息，包括温度、湿度、天气状况等",
      inputSchema: {
        type: "object",
        properties: {
          city: { type: "string", description: "城市名称" },
          unit: { type: "string", enum: ["celsius", "fahrenheit"] }
        },
        required: ["city"]
      }
    },
    {
      name: "search_news",
      description: "搜索最新新闻",
      inputSchema: { ... }
    }
  ]
}
```

### 3. 发送给 LLM 的请求（关键！）

```typescript
// Client 把工具信息和用户消息一起发给 LLM
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  
  // ⭐ 这里把 MCP 工具转换为 LLM 能理解的格式
  tools: [
    {
      name: "get_weather",
      description: "获取指定城市的天气信息，包括温度、湿度、天气状况等",
      input_schema: {
        type: "object",
        properties: {
          city: { type: "string", description: "城市名称" },
          unit: { type: "string" }
        },
        required: ["city"]
      }
    }
  ],
  
  messages: [
    { role: "user", content: "北京今天天气怎么样？" }
  ]
});
```

### 4. LLM 的决策过程

```
LLM 内部思考过程：
┌─────────────────────────────────────────────────────────────┐
│ 用户问题: "北京今天天气怎么样？"                               │
│                                                              │
│ 可用工具:                                                     │
│   1. get_weather - 获取指定城市的天气信息                      │
│   2. search_news - 搜索最新新闻                               │
│                                                              │
│ 分析:                                                         │
│   - 用户问的是"天气"相关                                       │
│   - get_weather 的描述匹配 ✓                                  │
│   - 需要参数: city="北京"                                     │
│                                                              │
│ 决策: 调用 get_weather                                        │
└─────────────────────────────────────────────────────────────┘
```

### 5. LLM 返回工具调用请求

```json
{
  "role": "assistant",
  "content": [
    {
      "type": "tool_use",
      "id": "toolu_01ABC123",
      "name": "get_weather",        // LLM 选择的工具
      "input": {
        "city": "北京",              // LLM 从用户消息中提取的参数
        "unit": "celsius"
      }
    }
  ],
  "stop_reason": "tool_use"
}
```

### 6. Client 调用 MCP Server

```typescript
// Client 收到 LLM 的 tool_use，调用 MCP Server
const result = await mcpClient.callTool({
  name: "get_weather",    // 从 LLM 响应中获取
  arguments: {
    city: "北京",
    unit: "celsius"
  }
});
```

## 完整示例代码

```typescript
// ============= MCP Server 端 =============
// weather-server.ts

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "weather-server",
  version: "1.0.0"
});

// 定义多个工具
server.tool(
  "get_weather",
  "获取实时天气信息",
  {
    city: { type: "string", description: "城市名称" }
  },
  async ({ city }) => {
    // 模拟天气数据
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          city,
          temperature: 25,
          condition: "晴天",
          humidity: 60
        })
      }]
    };
  }
);

server.tool(
  "get_forecast",
  "获取未来几天的天气预报",
  {
    city: { type: "string", description: "城市名称" },
    days: { type: "number", description: "预报天数，1-7天" }
  },
  async ({ city, days }) => {
    return {
      content: [{
        type: "text",
        text: `${city}未来${days}天的天气预报...`
      }]
    };
  }
);

// 启动服务器
const transport = new StdioServerTransport();
await server.connect(transport);


// ============= Client 端 (集成 LLM) =============
// client.ts

import Anthropic from "@anthropic-ai/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

class MCPChatClient {
  private anthropic: Anthropic;
  private mcpClient: Client;
  private availableTools: any[] = [];

  async initialize() {
    // 1. 连接 MCP Server 并获取工具
    await this.mcpClient.connect(transport);
    const { tools } = await this.mcpClient.listTools();
    this.availableTools = tools;
    
    console.log("可用工具:", tools.map(t => t.name));
  }

  async chat(userMessage: string) {
    // 2. 转换工具格式给 Anthropic API
    const anthropicTools = this.availableTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema
    }));

    // 3. 发送请求给 LLM
    let response = await this.anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      tools: anthropicTools,  // ⭐ 告诉 LLM 有哪些工具可用
      messages: [{ role: "user", content: userMessage }]
    });

    // 4. 处理工具调用循环
    while (response.stop_reason === "tool_use") {
      const toolUseBlock = response.content.find(
        block => block.type === "tool_use"
      );
      
      if (toolUseBlock) {
        console.log(`LLM 决定调用: ${toolUseBlock.name}`);
        console.log(`参数:`, toolUseBlock.input);

        // 5. 调用 MCP Server 执行工具
        const toolResult = await this.mcpClient.callTool({
          name: toolUseBlock.name,
          arguments: toolUseBlock.input
        });

        // 6. 把结果发回给 LLM
        response = await this.anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          tools: anthropicTools,
          messages: [
            { role: "user", content: userMessage },
            { role: "assistant", content: response.content },
            {
              role: "user",
              content: [{
                type: "tool_result",
                tool_use_id: toolUseBlock.id,
                content: toolResult.content[0].text
              }]
            }
          ]
        });
      }
    }

    // 7. 返回最终文本回答
    return response.content
      .filter(block => block.type === "text")
      .map(block => block.text)
      .join("");
  }
}

// 使用示例
const client = new MCPChatClient();
await client.initialize();

const answer = await client.chat("北京今天天气怎么样？");
console.log(answer);
// 输出: "北京今天天气晴朗，温度25°C，湿度60%，非常适合户外活动。"
```

## 关键总结

```
┌────────────────────────────────────────────────────────────────┐
│                    LLM 如何知道调用哪个工具？                    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1. 📋 工具发现                                                 │
│     MCP Server 通过 tools/list 暴露工具定义                      │
│                                                                │
│  2. 📝 工具描述是关键                                           │
│     LLM 根据 name + description + inputSchema 理解工具用途       │
│                                                                │
│  3. 🤖 LLM 自主决策                                            │
│     根据用户消息内容，LLM 决定：                                  │
│     - 是否需要调用工具                                          │
│     - 调用哪个工具                                              │
│     - 传什么参数                                                │
│                                                                │
│  4. 🔄 Client 负责桥接                                          │
│     Client 把 MCP 工具格式 → LLM API 工具格式                    │
│     Client 执行 LLM 的工具调用决策                               │
│                                                                │
│  ⭐ 核心：模型不直接与 MCP 通信，Client 是中间层！                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## 最佳实践提示

```typescript
// ✅ 好的工具描述 - LLM 能准确理解
server.tool(
  "search_database",
  "在公司员工数据库中搜索员工信息，支持按姓名、工号、部门查询",
  { query: { type: "string", description: "搜索关键词" } },
  handler
);

// ❌ 差的工具描述 - LLM 难以理解何时使用
server.tool(
  "search",
  "搜索",
  { q: { type: "string" } },
  handler
);
```

