# 简易聊天室 (Chatroom)

## 项目简介
简易聊天室是一个基于 Node.js 和 WebSocket 的实时聊天应用，支持多人在线聊天功能。项目使用 Express 提供 HTTP 服务，WebSocket 实现实时通信，并通过 MongoDB 管理用户数据。前端采用原生 HTML 和 JavaScript 构建，支持动态更新在线人数和消息显示。

## 功能特性
### 实时聊天
- 支持多人实时在线聊天
- 消息即时广播到所有在线用户

### 用户管理
- 自动生成唯一用户 ID
- 动态更新在线用户人数

### 系统消息
- 广播用户加入和离开聊天室的系统消息

### 前端功能
- 消息时间格式化显示
- 支持滚动到底部的聊天窗口
- 响应式布局，适配不同设备

### 后端功能
- 使用 WebSocket 实现实时通信
- 使用 MongoDB 管理用户数据
- 提供静态文件服务

### Docker 支持
- 提供 Dockerfile，可快速部署到容器环境

## 技术栈
### 后端
- Node.js：运行时环境
- Express：提供 HTTP 服务
- WebSocket (ws)：实现实时通信
- MongoDB：用户数据存储
- Mongoose：MongoDB 的对象建模工具

### 前端
- HTML/CSS/JavaScript：构建用户界面
- ES6 模块化：组织前端代码

### 工具
- Docker：容器化部署
- pnpm：高效的包管理工具

## 项目结构
chatroom/
├── .dockerignore            # Docker 构建时忽略的文件和目录
├── .gitignore               # Git 忽略的文件和目录
├── Dockerfile               # Docker 配置文件
├── README.md                # 项目说明文档
├── package.json             # 项目依赖和脚本配置
├── pnpm-lock.yaml           # pnpm 锁定文件
├── public/                  # 前端静态资源
│   ├── index.html           # 主页面 HTML 文件
│   ├── js/                  # 前端 JavaScript 文件
│   │   ├── main.js          # 前端入口文件
│   │   ├── modules/         # 前端模块
│   │   │   ├── socket.js    # WebSocket 客户端模块
│   │   │   ├── ui.js        # UI 管理模块
│   │   │   └── user.js      # 用户管理模块
│   │   └── utils/
│   │       └── timeFormatter.js # 时间格式化工具
├── src/                     # 后端代码
│   ├── app.js               # Express 应用配置
│   ├── config/              # 配置文件
│   │   └── constants.js     # 常量配置
│   ├── db/                  # 数据库相关代码
│   │   └── connection.js    # MongoDB 连接模块
│   ├── models/              # 数据模型
│   │   ├── message.js       # 消息模型
│   │   └── user.js          # 用户模型
│   ├── websocket/           # WebSocket 相关代码
│   │   ├── connectionmanager.js # WebSocket 连接管理器
│   │   └── manager.js       # WebSocket 管理器
│   └── server.js            # 服务器入口文件
└── Technical Documentation/ # 技术文档
    ├── chatroom开发手册.md  # 开发手册
    ├── js语法.md            # JavaScript 语法说明
    └── 未处理的需求.md      # 项目未处理需求

## 快速开始
1. 克隆项目
```bash 
git clone https://github.com/your-username/chatroom.git
cd chatroom
```
1. 安装依赖
使用 pnpm 安装依赖：
```bash 
 pnpm install
```
1. 启动 MongoDB
使用 Docker 启动 MongoDB：
```bash   
docker run -d --name mongodb -p 27017:27017 mongo:latest
```
1. 启动项目
 ```bash  
 pnpm start
 #或者 node src/server.js
 ```
2. 访问应用
在浏览器中访问：
 ```bash
    http://localhost:5500
 ```
使用 Docker 部署
1. 构建 Docker 镜像
 ```bash
   docker build -t chatroom-app .
 ```
2. 运行容器
 ```bash  docker run -d -p 5500:5500 --name 
 docker run -d -p 5500:5500 --name chatroom-container chatroom-app
 ```

