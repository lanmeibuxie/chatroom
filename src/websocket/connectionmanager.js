class ConnectionManager {
    constructor() {
        // WebSocket → 用户ID
        this.connToUser = new Map();

        // 用户ID → WebSocket集合
        this.userToConns = new Map();
    }

    // 添加连接
    addConnection(ws, userId) {
        this.connToUser.set(ws, userId);

        if (!this.userToConns.has(userId)) {
            this.userToConns.set(userId, new Set());
        }
        this.userToConns.get(userId).add(ws);
    }

    // 根据用户ID获取所有连接(可用于私聊)
    getConnectionsByUser(userId) {
        return Array.from(this.userToConns.get(userId) || []);
    }

    // 删除连接
    removeConnection(ws) {
        if (!this.connToUser.has(ws)) return;

        const userId = this.connToUser.get(ws);
        this.connToUser.delete(ws);

        const connections = this.userToConns.get(userId);
        if (connections) {
            connections.delete(ws);
            if (connections.size === 0) {
                this.userToConns.delete(userId);
            }
        }
    }

    // 新增方法：获取在线用户数量
    getOnlineUserCount() {
        return this.userToConns.size;
    }

    // 新增方法：获取在线用户ID列表
    getOnlineUsers() {
        return Array.from(this.userToConns.keys());
    }
}

module.exports = ConnectionManager;