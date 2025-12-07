import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import {
  SpringBootCodeConfig,
  queryEmpTreeResponseExample,
} from '../apiData/queryEmpTree/index.js';
import { generateSpringBootCode } from '../apiData/queryEmpTree/templates.js';

// 定义查询员工树输入参数的Zod schema
const queryEmpTreeInputSchema = z.object({
  empId: z.string().describe('员工ID'),
  includeSubordinates: z.boolean().optional().describe('是否包含下属，默认false'),
  maxDepth: z.number().optional().describe('查询最大层级，默认3'),
});

// 定义生成Spring Boot代码输入参数的Zod schema
const generateCodeInputSchema = z.object({
  packageName: z.string().describe('包名，例如：com.company.employee'),
  moduleName: z.string().describe('模块名，例如：employee'),
  author: z.string().optional().describe('作者名称'),
  generateController: z.boolean().optional().describe('是否生成Controller，默认true'),
  generateService: z.boolean().optional().describe('是否生成Service，默认true'),
  generateEntity: z.boolean().optional().describe('是否生成Entity，默认true'),
  generateDto: z.boolean().optional().describe('是否生成DTO，默认true'),
  generateRepository: z.boolean().optional().describe('是否生成Repository，默认true'),
});
interface EmployeeTreeNode {
  empId: string;
  empName: string;
  empCode: string;
  deptId: string;
  deptName: string;
  position: string;
  level: number;
  parentEmpId?: string;
  children?: EmployeeTreeNode[];
}
const EmployeeTreeNodeSchema: z.ZodSchema<EmployeeTreeNode> = z.object({
  empId: z.string().describe('员工ID'),
  empName: z.string().describe('员工姓名'),
  empCode: z.string().describe('员工工号'),
  deptId: z.string().describe('部门ID'),
  deptName: z.string().describe('部门名称'),
  position: z.string().describe('职位'),
  level: z.number().describe('员工在组织中的层级'),
  parentEmpId: z.string().optional().describe('上级员工ID'),
  children: z
    .array(z.lazy(() => EmployeeTreeNodeSchema))
    .optional()
    .describe('员工下属员工列表'),
});
export function queryEmpTree(server: McpServer) {
  // 注册查询员工树工具
  server.registerTool(
    'queryEmployeeTree',
    {
      description: '根据员工ID查询员工组织树结构',
      inputSchema: queryEmpTreeInputSchema,
      outputSchema: EmployeeTreeNodeSchema.describe('员工组织树'),
    },
    async (args): Promise<CallToolResult> => {
      const { empId, includeSubordinates, maxDepth } = args as z.infer<
        typeof queryEmpTreeInputSchema
      >;
      // 模拟API调用
      const response = JSON.parse(JSON.stringify(queryEmpTreeResponseExample.data));
      return {
        content: [
          {
            type: 'text',
            text: `成功查询员工树，员工ID: ${empId}, 包含下属: ${includeSubordinates || false}, 最大层级: ${maxDepth || 3}。员工结构树如下:${JSON.stringify(queryEmpTreeResponseExample.data)}。`,
          },
        ],
        structuredContent: response,
      };
    },
  );

  // 注册生成Spring Boot代码工具
  server.registerTool(
    'generateEmployeeSpringBootCode',
    {
      description:
        '为员工树查询接口生成完整的Spring Boot代码，包括Controller、Service、Entity、DTO、Repository等',
      inputSchema: generateCodeInputSchema,
    },
    async (args): Promise<CallToolResult> => {
      const config = args;

      // 生成代码
      const codeMap = generateSpringBootCode(config);

      // 构建返回文本
      let resultText = `已生成Spring Boot代码，包名: ${config.packageName}\n\n`;
      resultText += '生成的文件列表:\n';

      for (const [fileName, code] of Object.entries(codeMap)) {
        resultText += `\n========== ${fileName} ==========\n`;
        resultText += code;
        resultText += '\n';
      }

      return {
        content: [
          {
            type: 'text',
            text: resultText,
          },
        ],
        structuredContent: {
          packageName: config.packageName,
          moduleName: config.moduleName,
          generatedFiles: Object.keys(codeMap),
          code: codeMap,
        },
      };
    },
  );

  // 注册生成单个组件代码工具
  server.registerTool(
    'generateEmployeeComponent',
    {
      description: '生成员工树查询接口的单个组件代码（Controller/Service/Entity/DTO/Repository）',
      inputSchema: z.object({
        packageName: z.string().describe('包名'),
        moduleName: z.string().describe('模块名'),
        author: z.string().optional().describe('作者名称'),
        componentType: z
          .enum(['Controller', 'Service', 'Entity', 'DTO', 'Repository'])
          .describe('组件类型'),
      }),
    },
    async (args): Promise<CallToolResult> => {
      const { packageName, moduleName, author, componentType } = args as {
        packageName: string;
        moduleName: string;
        author?: string;
        componentType: string;
      };

      const config: SpringBootCodeConfig = {
        packageName,
        moduleName,
        author,
        generateController: componentType === 'Controller',
        generateService: componentType === 'Service',
        generateEntity: componentType === 'Entity',
        generateDto: componentType === 'DTO',
        generateRepository: componentType === 'Repository',
      };

      const codeMap = generateSpringBootCode(config);
      const code = Object.values(codeMap)[0] || '';

      return {
        content: [
          {
            type: 'text',
            text: `已生成${componentType}代码:\n\n${code}`,
          },
        ],
        structuredContent: {
          componentType,
          packageName,
          code,
        },
      };
    },
  );
}
