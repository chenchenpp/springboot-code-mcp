FROM node:20-alpine AS base

WORKDIR /rt-api-mcp

# 使用 corepack 启用 pnpm
RUN corepack enable

# 仅复制依赖安装所需文件
COPY pnpm-lock.yaml package.json tsconfig.json vite.config.ts ./
# 复制源码并构建
COPY ./src src
# 安装依赖
RUN pnpm install

RUN pnpm build

# 运行阶段
FROM node:20-alpine AS runtime

WORKDIR /rt-api-mcp
RUN corepack enable

COPY --from=base /rt-api-mcp/node_modules ./node_modules
COPY --from=base /rt-api-mcp/dist ./dist
COPY package.json ./

# 默认以 STDIO 模式启动，如需 HTTP 模式可在运行容器时覆盖命令
CMD ["node", "dist/index.js", "--http"]
