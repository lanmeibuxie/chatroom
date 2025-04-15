// 引入所需模块
const express = require('express'); // Express框架，用于创建HTTP服务器
const WebSocket = require('ws'); // WebSocket库，用于创建WebSocket服务器
const mongoose = require('mongoose');

// 创建Express应用实例
const app = express();
const port = 5500; // 定义HTTP服务器的端口号


// 连接本地 MongoDB
mongoose.connect('mongodb://localhost:27017/chatroom')
    .then(() => console.log('MongoDB 连接成功'))
    .catch(err => console.error('连接失败:', err));


// 静态文件服务
app.use(express.static('public')); // 将'public'文件夹中的文件作为静态资源提供

// 创建HTTP服务器并监听指定端口
// 服务器会接受来自局域网或公网的请求
const server = app.listen(port, "0.0.0.0", () => {
    console.log(`HTTP服务运行在 http://localhost:${port}`); // 启动成功后输出提示信息
});

// 创建WebSocket服务器并绑定到HTTP服务器
const wss = new WebSocket.Server({ server }); // WebSocket服务器共享HTTP服务器的端口

// 在线用户管理
const users = new Map(); // 使用Map对象存储在线用户，键为WebSocket连接，值为用户名

// 监听WebSocket连接事件
wss.on('connection', (ws) => {
    let userId = null;

    // 监听消息
    ws.on('message', (message) => {
        //将接收到的消息解析为JavaScript对象
        const data = JSON.parse(message);

        if (data.type === "register") {
            // 用户注册，保存用户ID
            userId = data.userId;
            users.set(ws, userId);

            // 广播用户加入消息
            broadcastSystemMessage(`${userId} 加入了聊天室`);
            broadcastUserCount();
        } else if (data.type === "message") {
            // 处理用户消息
            const timestamp = new Date().toISOString();
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: "message",
                        user: userId,
                        content: data.content,
                        timestamp: timestamp
                    }));
                }
            });
        }
    });

    // 连接关闭处理
    ws.on('close', () => {
        users.delete(ws);
        if (userId) {
            broadcastSystemMessage(`${userId} 离开了聊天室`);
            broadcastUserCount();
        }
    });
});

function broadcastSystemMessage(content) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: "system",
                content: content
            }));
        }
    });
}

function handleClientMessage(ws, data) {
    if (data.type === "message") {
        const timestamp = new Date().toISOString(); // 获取当前时间的 ISO 格式

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: "message",
                    user: users.get(ws),
                    content: data.content,
                    timestamp: timestamp // 添加时间戳
                }));
            }
        });
    }
}

// 广播在线人数的函数
function broadcastUserCount() {
    const userCount = wss.clients.size; // 获取当前在线客户端数量
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: "userCount",
                count: userCount
            }));
        }
    });
}