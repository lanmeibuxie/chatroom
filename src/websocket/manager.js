const WebSocket = require('ws')
const { broadcastSystemMessage, broadcastUserCount } = require('./broadcast')

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
                const data = JSON.parse(message)
                this.handleMessage(ws, data)
            })

            ws.on('close', () => this.handleClose(ws, userId))
        })
    }

    handleMessage(ws, data) {
        if (data.type === "register") {
            this.handleRegistration(ws, data.userId)
        }
        // 可扩展其他消息类型处理
    }

    handleRegistration(ws, userId) {
        this.users.set(ws, userId)
        broadcastSystemMessage(this.wss, `${userId} 加入了聊天室`)
        broadcastUserCount(this.wss)
    }

    handleClose(ws, userId) {
        this.users.delete(ws)
        if (userId) {
            broadcastSystemMessage(this.wss, `${userId} 离开了聊天室`)
            broadcastUserCount(this.wss)
        }
    }
}

module.exports = WebSocketManager