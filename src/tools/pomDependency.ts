import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import {
  MavenDependency,
  SSO_DEPENDENCY,
  FEIGN_DEPENDENCY,
  injectDependencies,
  generateSsoUsageExample,
  generateFeignUsageExample,
} from '../apiData/pomDependency/index.js';
import * as fs from 'fs';
import * as path from 'path';

// 定义注入依赖的输入参数schema
const injectDependencySchema = z.object({
  pomFilePath: z.string().describe('pom.xml文件的路径'),
  dependencyTypes: z
    .array(z.enum(['SSO', 'FEIGN', 'BOTH']))
    .describe('要注入的依赖类型：SSO、FEIGN或BOTH'),
});

// 定义自定义依赖注入的输入参数schema
const injectCustomDependencySchema = z.object({
  pomFilePath: z.string().describe('pom.xml文件的路径'),
  groupId: z.string().describe('Maven groupId'),
  artifactId: z.string().describe('Maven artifactId'),
  version: z.string().describe('版本号'),
  scope: z.string().optional().describe('依赖范围（可选）'),
});

export function pomDependency(server: McpServer) {
  // 注册注入预定义依赖的工具
  server.registerTool(
    'injectPomDependencies',
    {
      description: '向Spring Boot项目的pom.xml文件中注入SSO或Feign依赖，支持自动检测重复依赖',
      inputSchema: injectDependencySchema,
    },
    async (args): Promise<CallToolResult> => {
      const { pomFilePath, dependencyTypes } = args as z.infer<typeof injectDependencySchema>;

      try {
        // 读取pom.xml文件
        const absolutePath = path.resolve(pomFilePath);

        if (!fs.existsSync(absolutePath)) {
          return {
            content: [
              {
                type: 'text',
                text: `错误：找不到文件 ${pomFilePath}`,
              },
            ],
            isError: true,
          };
        }

        const pomContent = fs.readFileSync(absolutePath, 'utf-8');

        // 确定要注入的依赖
        const dependencies: MavenDependency[] = [];
        const includeSSO = dependencyTypes.includes('SSO') || dependencyTypes.includes('BOTH');
        const includeFeign = dependencyTypes.includes('FEIGN') || dependencyTypes.includes('BOTH');

        if (includeSSO) {
          dependencies.push(SSO_DEPENDENCY);
        }
        if (includeFeign) {
          dependencies.push(FEIGN_DEPENDENCY);
        }

        // 注入依赖
        const result = injectDependencies(pomContent, dependencies);

        // 写回文件
        fs.writeFileSync(absolutePath, result.updatedContent, 'utf-8');

        // 生成使用示例
        let usageExamples = '';
        if (includeSSO && result.injected.includes('com.feiniu:ssospring')) {
          usageExamples += '\n\n=== SSO使用示例 ===\n';
          usageExamples += generateSsoUsageExample();
        }
        if (includeFeign && result.injected.includes('com.feiniu.fnemp:fnemp-apiclient')) {
          usageExamples += '\n\n=== Feign使用示例 ===\n';
          usageExamples += generateFeignUsageExample();
        }

        let message = `成功处理pom.xml文件：${pomFilePath}\n\n`;

        if (result.injected.length > 0) {
          message += `✅ 已注入的依赖 (${result.injected.length}):\n`;
          result.injected.forEach((dep) => {
            message += `  - ${dep}\n`;
          });
        }

        if (result.skipped.length > 0) {
          message += `\n⏭️  已存在跳过的依赖 (${result.skipped.length}):\n`;
          result.skipped.forEach((dep) => {
            message += `  - ${dep}\n`;
          });
        }

        if (result.injected.length > 0) {
          message += '\n📝 下一步操作:\n';
          message += '  1. 执行 mvn clean install 更新依赖\n';
          message += '  2. 刷新IDE项目\n';
          message += usageExamples;
        }

        return {
          content: [
            {
              type: 'text',
              text: message,
            },
          ],
          structuredContent: {
            success: true,
            pomFilePath: absolutePath,
            injected: result.injected,
            skipped: result.skipped,
          },
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `注入依赖失败：${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // 注册注入自定义依赖的工具
  server.registerTool(
    'injectCustomDependency',
    {
      description: '向pom.xml文件中注入自定义的Maven依赖',
      inputSchema: injectCustomDependencySchema,
    },
    async (args): Promise<CallToolResult> => {
      const { pomFilePath, groupId, artifactId, version, scope } = args as z.infer<
        typeof injectCustomDependencySchema
      >;

      try {
        const absolutePath = path.resolve(pomFilePath);

        if (!fs.existsSync(absolutePath)) {
          return {
            content: [
              {
                type: 'text',
                text: `错误：找不到文件 ${pomFilePath}`,
              },
            ],
            isError: true,
          };
        }

        const pomContent = fs.readFileSync(absolutePath, 'utf-8');

        const customDependency: MavenDependency = {
          groupId,
          artifactId,
          version,
          scope,
        };

        const result = injectDependencies(pomContent, [customDependency]);
        fs.writeFileSync(absolutePath, result.updatedContent, 'utf-8');

        const dependencyKey = `${groupId}:${artifactId}`;
        let message = '';

        if (result.injected.includes(dependencyKey)) {
          message = `✅ 成功注入依赖：${dependencyKey}:${version}\n\n`;
          message += '📝 下一步操作:\n';
          message += '  1. 执行 mvn clean install 更新依赖\n';
          message += '  2. 刷新IDE项目';
        } else {
          message = `⏭️  依赖已存在，跳过注入：${dependencyKey}`;
        }

        return {
          content: [
            {
              type: 'text',
              text: message,
            },
          ],
          structuredContent: {
            success: true,
            dependency: customDependency,
            injected: result.injected.length > 0,
          },
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `注入依赖失败：${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // 注册查看预定义依赖的工具
  server.registerTool(
    'listPredefinedDependencies',
    {
      description: '查看所有预定义的Maven依赖（SSO、Feign等）',
      inputSchema: z.object({}),
    },
    async (): Promise<CallToolResult> => {
      const message = `
📦 预定义的Maven依赖

=== SSO依赖 ===
<dependency>
  <groupId>com.feiniu</groupId>
  <artifactId>ssospring</artifactId>
  <version>1.0.0-SNAPSHOT</version>
</dependency>

用途：单点登录认证
使用示例：
${generateSsoUsageExample()}

=== Feign依赖 ===
<dependency>
  <groupId>com.feiniu.fnemp</groupId>
  <artifactId>fnemp-apiclient</artifactId>
  <version>1.2.4-SNAPSHOT</version>
</dependency>

用途：微服务间HTTP调用
使用示例：
${generateFeignUsageExample()}
`;

      return {
        content: [
          {
            type: 'text',
            text: message,
          },
        ],
        structuredContent: {
          dependencies: {
            SSO: SSO_DEPENDENCY,
            FEIGN: FEIGN_DEPENDENCY,
          },
        },
      };
    },
  );
}
