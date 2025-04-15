const http = require('http')
const connectDB = require('./db/connection')
const createApp = require('./app')
const WebSocketManager = require('./websocket/manager')
const { HTTP_PORT } = require('./config/constants')
const os = require('os'); // 引入 os 模块

// 获取服务器的实际 IP 地址
function getServerIp() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            // 过滤条件：只获取 IPv4 地址，且不是内部地址（如 127.0.0.1）
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost'; // 如果没有外部 IP，则返回 localhost
}

async function startServer() {
    // 1. 连接数据库
    //确保连接到数据库进行后续操作
    // await connectDB()

    // 2. 创建Express应用
    const app = createApp()
    const server = app.listen(HTTP_PORT, "0.0.0.0")

    // 3. 初始化WebSocket
    new WebSocketManager(server)

    // 4. 启动服务
    server.listen(HTTP_PORT, () => {
        const serverIp = getServerIp(); // 获取服务器的实际 IP 地址
        console.log(`🚀 HTTP服务运行在 http://${serverIp}:${HTTP_PORT}`)
        console.log(`🕸️ WebSocket已启用 ws://${serverIp}:${HTTP_PORT}`)
    })
}

startServer()