# 使用官方 Node.js 18 的轻量级 Alpine 镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml 文件到容器中
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm 包管理器
RUN npm install -g pnpm

# 安装项目依赖
RUN pnpm install

# 复制项目的所有文件到容器中
COPY . .

# 暴露应用程序的端口（HTTP 和 WebSocket 使用相同端口）
EXPOSE 5500



# 启动应用程序
CMD ["pnpm", "start"]
