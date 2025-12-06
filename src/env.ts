import { z } from 'zod';

const EnvSchema = z.object({
  MCP_HTTP_PORT: z.coerce.number().default(3000),
  MCP_HTTP_PATH: z.string().default('/mcp'),
  MCP_MODE: z.enum(['stdio', 'http']).default('stdio'),
});

export const env = EnvSchema.parse(process.env);
export type Env = z.infer<typeof EnvSchema>;
