const WebSocket = require('ws')

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

    handleMessage(ws, data) {
        if (data.type === "register") {
            this.handleRegistration(ws, data.userId)
        }
        else if (data.type === "message") {
            // 处理用户消息
            const timestamp = new Date().toISOString();
            this.wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: "message",
                        user: this.users.get(ws),
                        content: data.content,
                        timestamp: timestamp
                    }));
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

    handleClose(ws, userId) {
        this.users.delete(ws)
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