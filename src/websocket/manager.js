const WebSocket = require('ws')
const Message = require('../models/message'); // 引入消息模型
const User = require('../models/user'); // 引入用户模型
const ConnectionManager = require('./connectionmanager'); // 引入连接管理器
const user = require('../models/user');
const message = require('../models/message');


class WebSocketManager {
    constructor(server) {
        this.wss = new WebSocket.Server({ server })
        this.ctmanager = new ConnectionManager();
        this.setupHandlers()
    }

    setupHandlers() {
        this.wss.on('connection', (ws) => {

            //同步最近的消息到新连接
            this.syncRecentMessages(ws); // 新增调用

            ws.on('message', (message) => {
                //将接收到的消息解析为JavaScript对象
                const data = JSON.parse(message)

                // 处理消息
                this.handleMessage(ws, data)
            })

            ws.on('close', () => this.handleClose(ws))
        })
    }


    async handleMessage(ws, data) {

        switch (data.type) {

            //优先处理高频操作
            case "message":
                // 处理用户发送的消息
                //添加时间戳后的消息对象
                const msg = {
                    type: "message",
                    userId: data.userId,
                    content: data.content,
                    timestamp: new Date().toISOString()
                }
                const messageMsg = new Message(msg);
                //需要注意sendMessageToAll方法应当接受javaScript对象
                this.sendMessageToAll(msg);
                //保存消息到数据库
                await this.saveMessageToDatabase(messageMsg);
                break;

            case "reconnect":
                // 处理用户重新连接
                const reconnectMsg = this.handleConnection(ws, data)
                //保存消息到数据库
                await this.saveMessageToDatabase(reconnectMsg);
                break;

            case "register":
                const registerMsg = this.handleConnection(ws, data)
                //保存消息到数据库
                await this.saveMessageToDatabase(registerMsg);
                const newUser = new User({
                    userId: data.userId
                });
                try {
                    //保存用户到数据库
                    await newUser.save();
                }
                catch (error) {
                    console.error('保存用户到数据库失败:', error);
                    // 处理错误，发错误消息给客户端,让客户端重新注册
                    //
                    //
                }
                break;
            default:
                console.error('未知消息类型:', data.type);
                //发送错误消息给客户端
                return;

        }

    }

    // 处理用户注册和重新连接
    handleConnection(ws, data) {

        //保存用户ID
        this.ctmanager.addConnection(ws, data.userId);
        const registerMsgContent = `${data.type == "register" ? "新用户 " : " "}${data.userId} 加入了聊天室`

        //广播用户加入消息
        this.broadcastSystemMessage(this.wss, registerMsgContent)

        //广播在线人数
        this.broadcastUserCount(this.wss)
        return new Message({
            type: data.type,
            userId: data.userId,
            content: registerMsgContent
        });
    }

    async handleClose(ws) {
        const userId = this.ctmanager.connToUser.get(ws); // 使用 ConnectionManager 获取用户 ID
        const msg = {
            type: "system",
            userId: userId,
            content: `${userId} 离开了聊天室`
        };

        // 从 ConnectionManager 中删除连接
        this.ctmanager.removeConnection(ws);

        const newMessage = new Message(msg);
        // 保存消息到数据库
        await this.saveMessageToDatabase(newMessage);

        if (userId) {
            this.broadcastSystemMessage(this.wss, `${userId} 离开了聊天室`);
            this.broadcastUserCount(this.wss);
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
        const userCount = this.ctmanager.getOnlineUserCount()
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: "userCount",
                    count: userCount
                }))
            }
        })
    }

    // 发送消息给所有连接的客户端
    sendMessageToAll(message) {
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message))
            }
        })
    }

    //消息保存到数据库
    async saveMessageToDatabase(message) {
        try {
            await message.save()
        } catch (error) {
            console.error('保存消息到数据库失败:', error)
        }
    }

    // 同步最近的消息到新连接
    async syncRecentMessages(ws) {
        try {
            // 从数据库获取最近的20条消息（按时间倒序）
            const messages = await Message.find()
                .sort({ timestamp: -1 })
                .limit(20)
                .exec();

            // 反转数组保证时间正序（旧消息在前）
            messages.reverse().forEach(msg => {
                if (ws.readyState === WebSocket.OPEN) {
                    // 发送格式与实时消息一致
                    ws.send(JSON.stringify({
                        type: msg.type,
                        userId: msg.userId,
                        content: msg.content,
                        timestamp: msg.timestamp
                    }));
                }
            });
        } catch (error) {
            console.error('同步历史消息失败:', error);
            // 可选：发送错误通知
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: "error",
                    content: "历史消息加载失败"
                }));
            }
        }
    }

}

module.exports = WebSocketManager