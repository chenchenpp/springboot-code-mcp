import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import {
  ChannelPageResponse,
  ClockInResponse,
  channelPageResponseExample,
  clockInResponseExample,
} from '../apiData/clockInActivity/index.js';

// 定义输入参数的Zod schema
const channelPageInputSchema = z.object({
  storeId: z.string().describe('门店编号'),
});

const clockInInputSchema = z.object({
  storeId: z.string().describe('门店编号'),
  activityId: z.string().describe('活动ID'),
});

export function clockInActivity(server: McpServer) {
  // 注册频道页工具
  server.registerTool(
    'getClockInChannelPage',
    {
      description: '根据门店ID获取消费打卡频道页数据',
      inputSchema: channelPageInputSchema,
    },
    async (): Promise<CallToolResult> => {
      // 模拟API调用
      const response: ChannelPageResponse = channelPageResponseExample;

      return {
        content: [{ type: 'text', text: '成功获取频道页数据' }],
        structuredContent: JSON.parse(JSON.stringify(response)),
      };
    },
  );

  // 注册打卡工具
  server.registerTool(
    'performClockIn',
    {
      description: '根据门店ID和活动ID执行消费打卡操作',
      inputSchema: clockInInputSchema,
    },
    async (): Promise<CallToolResult> => {
      // 模拟API调用
      const response: ClockInResponse = clockInResponseExample;

      return {
        content: [{ type: 'text', text: response.tips }],
        structuredContent: JSON.parse(JSON.stringify(response)),
      };
    },
  );
}
