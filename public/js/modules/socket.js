import { formatTime } from '../utils/timeFormatter.js';
// 不需要 import ChatUI，因为它是通过参数传递的。

export class ChatSocket {
    constructor(url, userId, chatUI) {
        this.ws = new WebSocket(url);
        this.userId = userId;
        this.bindEvents();
        this.chatUI = chatUI;
    }

    // 绑定事件监听(在类中定义方法不需要使用function关键字)
    bindEvents() {
        // 当WebSocket连接成功时，发送用户ID到服务器
        this.ws.onopen = () => {
            this.send({ type: 'register', userId: this.userId });
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

    // JavaScript 是动态类型语言，编辑器（如 VS Code）无法在运行时推断 chatUI 的具体类型

    //更新在线人数
    updateUserCount(count) {
        this.chatUI.userCount = count;
    }

    // 添加系统消息
    appendSystemMessage(content) {
        const systemDiv = document.createElement('div');
        systemDiv.className = 'message system-message';
        systemDiv.textContent = `[系统] ${content}`;
        this.chatUI.messages.appendChild(systemDiv);
    }

    // 添加用户消息
    appendUserMessage(user, content, timestamp) {
        const userDiv = document.createElement('div');
        userDiv.className = 'message';
        //  ​​JavaScript/TypeScript 模板字符串​​（Template Literal），使用反引号（`）包裹，
        // 通过 ${} 语法嵌入变量或表达式。其功能是 ​​动态生成格式化的
        // 消息字符串​​。
        userDiv.textContent = `[${user}] (${formatTime(timestamp)}) ${content}`;
        this.chatUI.messages.appendChild(userDiv);
    }
}