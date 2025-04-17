import { formatTime } from '../utils/timeFormatter.js';
// 不需要 import ChatUI，因为它是通过参数传递的。

export class ChatSocket {
    constructor(url, userId, chatUI, isNewUser) {
        this.ws = new WebSocket(url);
        this.userId = userId;
        this.bindEvents();
        this.chatUI = chatUI;
        this.isNewUser = isNewUser; // 新用户标记
    }

    // 绑定事件监听(在类中定义方法不需要使用function关键字)
    bindEvents() {
        // 当WebSocket连接成功时，发送用户ID到服务器
        this.ws.onopen = () => {
            // 连接成功后，发送注册或重连消息
            this.send({ type: this.isNewUser ? 'register' : 'reconnect', userId: this.userId });
        };

        this.ws.onmessage = (event) => this.handleMessage(event);
    }

    // 处理接收的消息
    handleMessage(event) {
        // 将 JSON 字符串解析为 JavaScript 对象。
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'userCount':
                this.chatUI.updateUserCount(data.count);
                break;
            case 'system':
                this.chatUI.appendSystemMessage(data.content);
                break;
            case 'message':
                this.chatUI.appendUserMessage(data.user, data.content, data.timestamp);
                break;
        }
        // 处理消息时，自动滚动到聊天窗口底部
        this.chatUI.messages.scrollTop = this.chatUI.messages.scrollHeight;
    }

    // 向服务器发送消息
    send(message) {
        //将 JavaScript 对象转换为 JSON 字符串。
        this.ws.send(JSON.stringify(message));
    }


}