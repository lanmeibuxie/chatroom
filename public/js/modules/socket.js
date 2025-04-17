import { formatTime } from '../utils/timeFormatter.js';
// 不需要 import ChatUI，因为它是通过参数传递的。

export class ChatSocket {
    constructor(url, userId, chatUI, isNewUser) {
        this.ws = new WebSocket(url);
        this.userId = userId;
        this.bindEvents();
        this.chatUI = chatUI;
        this.isNewUser = isNewUser; // 新用户标记
        this.topMsgId = -1; // 用于存储顶部消息的 ID,初始值为-1
    }

    // 绑定事件监听(在类中定义方法不需要使用function关键字)
    bindEvents() {
        // 当WebSocket连接成功时，发送用户ID到服务器
        this.ws.onopen = () => {
            // 连接成功后，发送注册或重连消息
            this.send({ type: this.isNewUser ? 'register' : 'reconnect', userId: this.userId });
            //请求历史消息
            this.requestHistory();
        };

        this.ws.onmessage = (event) => this.handleMessage(event);
    }

    // 处理接收的消息
    handleMessage(event) {
        // 将 JSON 字符串解析为 JavaScript 对象。
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'message':
                this.chatUI.appendUserMessage(data.userId, data.content, data.timestamp);
                break;
            case 'system':
                this.chatUI.appendSystemMessage(data.content);
                break;
            case 'userCount':
                this.chatUI.updateUserCount(data.count);
                break;
            case 'reconnect':
                this.chatUI.appendSystemMessage(data.content);
            case 'history':
                console.log(data.topMsgId, data.messages);
                this.topMsgId = data.topMsgId; // 更新顶部消息 ID
                this.chatUI.prependMessages(data.messages); // 插入历史消息到顶部
                this.chatUI.isLoadingHistory = false; // 允许加载更多
                break;
            default:
                return;
        }
        // 仅在非历史消息时滚动到底部
        if (data.type !== 'history') {
            this.chatUI.messages.scrollTop = this.chatUI.messages.scrollHeight;
        }
    }

    // 向服务器发送消息
    send(message) {
        //将 JavaScript 对象转换为 JSON 字符串。
        this.ws.send(JSON.stringify(message));
    }

    // 请求更多历史消息
    requestHistory() {
        // 发送请求历史消息的消息到服务器
        this.send({
            type: 'history',
            topMsgId: this.topMsgId //-1代表第一次请求
        });
    }

}