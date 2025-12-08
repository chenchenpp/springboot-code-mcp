模型（Large Language Model, LLM）知道您调用工具时哪些数据是**必传（required）**，哪些是**非必传（optional）**，是通过您在 `registerTool` 时提供的 **`inputSchema`**（输入数据的 JSON Schema 定义）来确定的。

-----

## ⚙️ 模型理解工具参数的机制

在 Model Context Protocol (MCP) 中，LLM 并不是直接解析您的 TypeScript 代码，而是解析您提供的**工具注册信息**，特别是 `inputSchema`。

### 1\. JSON Schema 的作用

当您使用 `registerTool` 注册工具时，`inputSchema` 字段必须是一个符合 **JSON Schema 规范**的对象。JSON Schema 是一种用于描述和验证 JSON 数据结构的强大工具。

您就是通过在这个 Schema 中设置 `required` 数组来明确告诉模型参数的传递要求。

### 2\. `properties` 和 `required` 关键字

JSON Schema 中有两个关键的关键字用于定义参数的必传性：

| 关键字 | 作用 | 对应 MCP/TypeScript |
| :--- | :--- | :--- |
| **`properties`** | 定义了工具接受的所有参数及其数据类型（如 `string`、`number`、`boolean`）。 | 相当于 TypeScript 中的函数参数。 |
| **`required`** | 一个包含字符串的数组，数组中的每个字符串都必须是 `properties` 中定义的参数名称。 | **明确告诉模型：数组中的参数必须传递。** |

-----

## 📝 示例：如何定义必传与非必传参数

假设您有一个工具用于搜索餐馆，它需要**必传**的 `city`，但**非必传**的 `cuisine` 类型。您的 `inputSchema` 定义会像这样：

```typescript
server.registerTool(
  "find_restaurant",
  {
    title: "Restaurant Finder",
    description: "Searches for restaurants based on location and cuisine.",
    inputSchema: {
      type: "object",
      properties: {
        // 必传参数：城市
        city: {
          type: "string",
          description: "The city where the user wants to search for a restaurant.",
        },
        // 非必传参数：菜系
        cuisine: {
          type: "string",
          description: "The type of cuisine (e.g., Italian, Chinese). Optional.",
        },
      },
      // 关键所在：在这个数组中列出的参数是必传的
      required: ["city"],
    },
  },
  async (args) => {
    // ... 工具的执行逻辑
  }
);
```

### LLM 的解析过程

1. **模型接收工具描述**：当您向 LLM 发送请求时，SDK 会将这个完整的工具描述（包括 `name`、`description` 和 `inputSchema`）作为**提示**的一部分发送给模型。
2. **模型识别必传项**：LLM 会解析 `inputSchema`，看到 `required: ["city"]`。模型立即知道：要成功调用 `find_restaurant` 工具，必须在它的参数中提供一个 `city` 的值。
3. **模型识别非必传项**：`cuisine` 出现在 `properties` 中，但**没有**出现在 `required` 数组中。因此，模型知道 `cuisine` 是一个可选参数，只有在用户的请求中明确提及时才需要提供。

通过这种标准的 **JSON Schema** 机制，模型能够准确地知道在生成工具调用请求时，应该包含哪些必需的数据。

## 使用zod快速实现inputSchema定义

这是一个非常好的实践！在 Model Context Protocol (MCP) TypeScript SDK 中，**使用 Zod 来定义 `inputSchema` 是推荐和最常见的方式**，因为它能带来优秀的类型安全和简洁性。

-----

## 🧐 Zod 如何定义必传和非必传参数

当您使用 Zod 定义 `inputSchema` 时，模型是如何知道哪些参数是必传的呢？答案在于 **Zod 的设计和它如何映射到 JSON Schema**。

### 1\. 必传参数 (Required)

在 Zod 中，默认情况下，任何在 `z.object()` 中定义的属性都是**必传的**。

**Zod 示例 (必传)**：

```typescript
import { z } from "zod";

// Zod 默认认为这是一个必传的数字
const Schema = z.object({
  a: z.number(),
  b: z.number(),
});

// 对应的 JSON Schema:
// 1. properties 中会包含 a 和 b
// 2. required 数组中会包含 ["a", "b"]
// 这样模型就知道 a 和 b 都必须提供
```

### 2\. 非必传参数 (Optional)

要将一个参数标记为非必传，您必须使用 Zod 的 `.optional()` 方法链式调用。

**Zod 示例 (非必传)**：

```typescript
import { z } from "zod";

const Schema = z.object({
  city: z.string(),              // 默认：必传 (Required)
  cuisine: z.string().optional(), // 使用 .optional()：非必传 (Optional)
});

/*
  对应的 JSON Schema (发送给 LLM 的描述):
  {
    "type": "object",
    "properties": {
      "city": { "type": "string" },
      "cuisine": { "type": "string" }
    },
    "required": ["city"] // 关键：只有 city 出现在 required 数组中
  }
*/
```

### 3\. MCP SDK 的内部工作原理

当您在 `registerTool` 中传入 Zod Schema 时，MCP TypeScript SDK 会在内部执行一个关键步骤：

* **Zod 到 JSON Schema 的转换**：MCP SDK（或者它所依赖的 Zod 辅助库）会将您定义的 Zod Schema 自动转换成标准的 JSON Schema 格式。
* **必传规则的映射**：在转换过程中，任何**没有**使用 `.optional()` 定义的 Zod 属性，都会被提取出来，并放入 JSON Schema 的 **`required` 数组**中。

最终，LLM 接收到的工具定义仍然是标准的 JSON Schema 格式，从而确保它能够准确理解哪些参数是必传的。

-----

### 完整的 MCP + Zod 示例

```typescript
import { z } from "zod";

const RestaurantFinderSchema = z.object({
  // 必传参数：未调用 .optional()
  city: z.string().describe("The city to search for restaurants in."),

  // 非必传参数：调用了 .optional()
  cuisine: z.string().optional().describe("The type of cuisine (e.g., Italian, Chinese)."),
});

server.registerTool(
  "find_restaurant",
  {
    title: "Restaurant Finder",
    description: "Searches for restaurants based on location and cuisine.",
    // 直接传入 Zod Schema 对象
    inputSchema: RestaurantFinderSchema,
  },
  async (args) => {
    // args 的类型会被 TypeScript 正确推断出来 (args: { city: string; cuisine?: string })
    // ... 工具执行逻辑
  }
);
```

总结：**使用 Zod 的 `.optional()` 来控制参数是否在最终的 JSON Schema `required` 数组中出现，从而控制 LLM 对参数必传性的判断。**

## outputSchema 与 structuredContent

## 🛑 `outputSchema`

在 Model Context Protocol (MCP) 中，要让 AI 模型能够理解和利用 `structuredContent` 中的 JSON 数据，您必须在工具的注册阶段提供一个**明确的 `outputSchema`**。

### 1\. 为什么需要 `outputSchema`？

* **模型训练/推理的依据**：LLM 在处理工具调用时，不是靠猜测返回的数据结构。它在收到用户请求时，会提前读取所有工具的元数据（包括 `name`、`description`、`inputSchema` 和 **`outputSchema`**）。
* **结构化契约**：`outputSchema`（通常是 JSON Schema 或 Zod Schema）是您和模型之间关于工具输出的**结构化契约**。它告诉模型：“如果这个工具调用成功，它会在 `structuredContent` 字段中返回一个符合这个 Schema 的 JSON 对象。”
* **不提供 Schema 的后果**：如果您没有提供 `outputSchema`，模型虽然会收到 `structuredContent` 的值，但它不知道这个 JSON 对象的**内部结构**（例如，哪个字段是员工列表，哪个字段是员工 ID）。模型会倾向于依赖 `content` 字段中的自然语言摘要进行回复。
* **约束structuredContent数据结构**：`structuredContent` 的数据结构必须与 `outputSchema` 匹配，否则模型会报错。

### 2\. 定义 `outputSchema`

您需要使用 Zod 或 JSON Schema 来定义 `response` 变量的结构，并在注册工具时将其传递给 `outputSchema`。

**Zod 示例 (假设您的 `response` 结构)**:

```typescript
import { z } from "zod";

// 1. 定义输出结构 Schema
const EmployeeTreeSchema = z.object({
  empId: z.string().describe("The ID of the employee whose tree was queried."),
  tree: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      subordinates: z.array(z.lazy(() => EmployeeTreeSchema.omit({ empId: true }))).optional(), // 嵌套的下属
    })
  ).describe("The hierarchical list of employees and their subordinates."),
  // ... 其他必要的返回字段
}).describe("The detailed, structured result of the employee tree query.");


// 2. 注册工具时传入 outputSchema
server.registerTool(
  "query_employee_tree",
  {
    // ... inputSchema, description 等
    outputSchema: EmployeeTreeSchema, // 🚀 关键步骤
  },
  async (args) => {
    // ... 工具执行逻辑，获取 response
    return {
      content: [
        {
          type: 'text',
          text: `成功查询员工树，员工ID: ${empId}...`,
        },
      ],
      structuredContent: response, // 确保 response 严格符合 EmployeeTreeSchema
    };
  }
);
```

-----

## 🧐 其他潜在问题

即使您提供了 `outputSchema`，如果模型仍然不使用 `structuredContent`，可能还有以下原因：

### 1\. `content` 字段的摘要太好

* **LLM 的优先级**：LLM 的首要目标是给用户一个**自然语言**的、**简洁**的回答。
* **您的 `content`**：您的 `content` 字段是 `成功查询员工树，员工ID: ${empId}, 包含下属: ${includeSubordinates || false}, 最大层级: ${maxDepth || 3}`。这个摘要**非常简短**，没有包含实际的员工数据。
* **最佳实践**：为了让模型知道数据在 `structuredContent` 中，建议在 `content` 中提供一个**稍微详细但仍简洁的摘要**，**并暗示**详细数据已提供。
  * **改进后的 `content` 示例**：`成功查询了员工 ${empId} 的组织架构树。共找到了 58 个节点。详细的层级数据已在 structuredContent 中提供。`

### 2\. 输出数据结构过于复杂

如果您的 `response` JSON 对象非常庞大（例如，包含数千个节点）或嵌套层级过多，这可能会：

* **消耗过多的 Token**：LLM 必须把整个 `structuredContent` 读入其上下文窗口。如果数据过大，会挤占有限的上下文空间，增加推理成本和延迟。
* **模型选择忽略**：为了优化性能和回复质量，模型可能会选择忽略过于庞大或复杂的工具结果。

**最佳实践**：设计工具时，应确保输出的数据是**高信号、高相关性**的，并考虑使用**分页**、**筛选**或**截断**来限制返回给 LLM 的数据量。

### 3\. 可能是模型本身的问题

这是一个非常合理的推测，您对模型行为的观察（需要同时在 `content` 和 `structuredContent` 中提供数据）**确实与所使用的 LLM 模型版本、底层架构的兼容性以及对 MCP 协议的微调程度有很大关系。**

1. copilot中使用gpt模型是遵循structuredContent数据进行查询的
2. 通义千问：使用structuredContent不生效，而是在content添加结构树才能正常解析返回数据

## 🧐 模型版本与 MCP 兼容性的关系

### 1. 模型对 `structuredContent` 的解析依赖性

* **高版本/最新模型 (Fully Compliant)**：较新的、经过专门优化的模型（例如，最近发布的或针对工具调用功能深度微调的模型）能够**高度依赖** `outputSchema`。它们会优先读取 `structuredContent` 字段，并根据 `outputSchema` 精确解析数据，从而实现最高的效率和可靠性。
* **低版本/通用模型 (Less Compliant)**：较老的或未针对复杂工具调用进行充分微调的模型，其主要训练仍然是基于**自然语言文本**。对于这些模型：
  * 它们会接收 `structuredContent`，但对其**解析效率和准确性较低**。
  * 它们会将其视为次要信息，而将 `content` 视为主要信息。
  * 当在 `content` 中看到格式化的 **JSON 代码块** (`\```json ... \``` `) 时，模型将其识别为一个**高优先级文本**，利用其强大的文本解析能力来提取结构，这比依赖底层的 `structuredContent` 机制更可靠。

### 2. SDK 转换的鲁棒性

虽然 MCP SDK 负责将 Zod Schema 转换为 JSON Schema，但不同版本的 LLM 平台对 JSON Schema 规范的**支持程度**和**容错性**不同。

* **递归结构问题**：您的员工树是递归结构，这在 JSON Schema 中是复杂的。如果低版本模型对递归 Schema 的解析不够鲁棒，即使 Schema 正确，模型也可能失败。
* **Token 限制**：低版本模型的上下文窗口可能较小。当 `outputSchema` 和 `structuredContent` 占用太多 Token 时，模型可能直接选择忽略它们。

### 3. MCP 协议的演进

Model Context Protocol (MCP) 本身也在不断演进。

* 早期的模型可能主要通过 **Prompt Injection**（将工具描述注入到 Prompt 中）来实现工具调用，那时对 `structuredContent` 的处理可能不如后来的**原生工具调用 API** 机制那样完善。
* 高版本 SDK 可能引入了新的 `outputSchema` 字段或特性，但如果您的模型版本较旧，它就**无法理解**这些新的元数据。

---

## 🔑 结论与应对策略

您的发现是正确的：**在 `content` 中返回 JSON 代码块是一种确保数据被所有模型版本 reliably (可靠地) 解析的有效“技巧”。**

### 应对策略

1. **继续双重返回 (最佳实践)**：
    * 继续将 JSON 数据放在 **`structuredContent`** 中，以确保您符合 MCP 协议，并兼容最新的、性能最好的模型。
    * 继续在 **`content`** 中使用 **Markdown 代码块**返回 JSON 结构，以确保兼容低版本和通用模型，提供**双重解析保障**。
2. **咨询模型提供商**：如果您使用的是特定的 LLM 平台（如 Gemini、GPT、Claude 等），请查阅该平台的**工具调用/函数调用文档**，了解它们推荐的最低模型版本以及对 `structuredContent` 的原生支持情况。
3. **简化数据结构**：如果可能，尝试**限制**员工树的**最大返回深度和广度**。结构越简单、数据量越小，模型解析失败的可能性就越低。
