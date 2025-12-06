FROM node:20-alpine AS base

WORKDIR /app

# 使用 corepack 启用 pnpm
RUN corepack enable

# 仅复制依赖安装所需文件
COPY package.json tsconfig.json ./

# 安装依赖
RUN pnpm install

# 复制源码并构建
COPY src ./src
RUN pnpm run build

# 运行阶段
FROM node:20-alpine AS runtime

WORKDIR /app
RUN corepack enable

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY package.json ./

# 默认以 STDIO 模式启动，如需 HTTP 模式可在运行容器时覆盖命令
CMD ["node", "dist/index.js", "--stdio"]
