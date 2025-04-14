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
const server = app.listen(port, () => {
    console.log(`HTTP服务运行在 http://localhost:${port}`); // 启动成功后输出提示信息
});

// 创建WebSocket服务器并绑定到HTTP服务器
const wss = new WebSocket.Server({ server }); // WebSocket服务器共享HTTP服务器的端口

// 在线用户管理
const users = new Map(); // 使用Map对象存储在线用户，键为WebSocket连接，值为用户名

// 监听WebSocket连接事件
wss.on('connection', (ws) => {
    // 为新连接的用户分配随机用户名
    const username = `用户_${Math.floor(Math.random() * 1000)}`; // 生成随机用户名
    users.set(ws, username); // 将WebSocket连接和用户名存储到Map中

    // 广播用户加入消息
    broadcastSystemMessage(`${username} 加入了聊天室`);

    // 广播在线人数
    broadcastUserCount();

    // 消息处理
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        handleClientMessage(ws, data);
    });

    // 连接关闭处理
    ws.on('close', () => {
        users.delete(ws);
        broadcastSystemMessage(`${username} 离开了聊天室`);
        // 广播在线人数
        broadcastUserCount();
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