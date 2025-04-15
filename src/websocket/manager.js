const WebSocket = require('ws')
const Message = require('../models/message'); // 引入消息模型

class WebSocketManager {
    constructor(server) {
        this.wss = new WebSocket.Server({ server })
        this.users = new Map()
        this.setupHandlers()
    }

    setupHandlers() {
        this.wss.on('connection', (ws) => {
            let userId = null

            ws.on('message', (message) => {
                //将接收到的消息解析为JavaScript对象
                const data = JSON.parse(message)

                // 处理消息
                this.handleMessage(ws, data)
            })

            ws.on('close', () => this.handleClose(ws, userId))
        })
    }


    async handleMessage(ws, data) {

        //处理用户注册
        if (data.type === "register") {
            // 创建一个新的消息文档
            // Mongoose Document类型并非javascript对象
            const newMessage = new Message({
                type: "register",       // 消息类型
                userId: data.userId,   // 用户 ID
                content: data.content  // 消息内容
            });

            try {
                //保存消息到数据库
                await newMessage.save();
            }
            catch (error) {
                console.error('保存消息到数据库失败:', error);
            }

            this.handleRegistration(ws, data.userId)
        }
        else if (data.type === "message") {
            // 处理用户消息
            const timestamp = new Date().toISOString();
            //带时间戳的消息
            const messaget = {
                type: "message",
                user: data.userId,
                content: data.content,
                timestamp: timestamp
            }
            const newMessage = new Message(messaget);

            try {
                //保存消息到数据库
                await newMessage.save();
            }
            catch (error) {
                console.error('保存消息到数据库失败:', error);
            }

            this.wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(messaget));
                }
            });
        }
        // 可扩展其他消息类型处理
    }

    handleRegistration(ws, userId) {
        //保存用户ID
        this.users.set(ws, userId)
        //广播用户加入消息
        this.broadcastSystemMessage(this.wss, `${userId} 加入了聊天室`)
        //广播在线人数
        this.broadcastUserCount(this.wss)
    }

    async handleClose(ws, userId) {

        this.users.delete(ws)
        const newMessage = new Message({
            type: "system",
            userId: userId,
            content: `${userId} 离开了聊天室`
        });
        try {
            //保存消息到数据库
            await newMessage.save();
        }
        catch (error) {
            console.error('保存消息到数据库失败:', error);
        }

        if (userId) {
            this.broadcastSystemMessage(this.wss, `${userId} 离开了聊天室`)
            this.broadcastUserCount(this.wss)
        }
    }

    // 广播系统消息给所有连接的客户端
    broadcastSystemMessage(wss, content) {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: "system",
                    content: content
                }))
            }
        })
    }

    // 广播在线人数给所有连接的客户端
    broadcastUserCount(wss) {
        const userCount = wss.clients.size
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: "userCount",
                    count: userCount
                }))
            }
        })
    }

    handleClientMessage(ws, data) {
        if (data.type === "message") {
            const timestamp = new Date().toISOString(); // 获取当前时间的 ISO 格式

            this.wss.clients.forEach(client => {
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
}

module.exports = WebSocketManager