import { formatTime } from '../utils/timeFormatter.js';
export class ChatUI {

    // 构造函数 (constructor)​

    constructor() {
        //通过 this 绑定实例属性，初始化 DOM 元素引用。
        this.messages = document.getElementById('messages');
        this.userCount = document.getElementById('userCount');
        this.input = document.getElementById('input');
    }

    // 更新在线人数
    updateUserCount(count) {
        // 假设 userCount 是文本元素（如 <span>），若绑定到其他元素（如输入框），行为可能不符合预期。
        this.userCount.textContent = count;
    }

    // 添加系统消息
    appendSystemMessage(content) {
        const div = document.createElement('div');
        //使用add避免覆盖原有类名
        div.classList.add('message', 'system-message');
        div.textContent = `[系统] ${content}`;
        this.messages.appendChild(div);
        this.scrollToBottom();
    }

    // 添加用户消息
    appendUserMessage(user, content, timestamp) {
        const div = document.createElement('div');
        div.className = 'message';
        div.textContent = `[${user}] (${formatTime(timestamp)}) ${content}`;
        this.messages.appendChild(div);
        this.scrollToBottom();
    }

    // 发送消息
    sendMessage(chatSocket, userId) {
        if (this.input.value.trim()) {
            chatSocket.send({
                type: 'message',
                userId: userId,
                content: this.input.value
            });
            this.input.value = '';
        }
    }

    // 滚动到底部
    scrollToBottom() {
        this.messages.scrollTop = this.messages.scrollHeight;
    }
}