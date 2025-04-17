import { formatTime } from '../utils/timeFormatter.js';
export class ChatUI {

    // 构造函数 (constructor)​

    constructor() {
        //通过 this 绑定实例属性，初始化 DOM 元素引用。
        this.messages = document.getElementById('messages');
        this.userCount = document.getElementById('userCount');
        this.input = document.getElementById('input');
        this.isLoadingHistory = false; // 防止重复加载历史消息
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

    // 绑定滚动事件以加载历史消息
    bindScrollEvent(chatSocket) {
        this.messages.addEventListener('scroll', async () => {
            if (this.messages.scrollTop === 0 && !this.isLoadingHistory) {
                this.isLoadingHistory = true; // 防止重复加载
                chatSocket.requestHistory(); // 请求更多历史消息
            }
        });
    }

    // 在顶部插入历史消息
    prependMessages(messages) {
        // 防止滚动到顶部时，消息列表跳动
        const container = this.messages;
        const oldScrollHeight = container.scrollHeight;
        const oldScrollTop = container.scrollTop;

        // 创建一个轻量级的 DocumentFragment 容器，用于批量操作 DOM 元素，减少页面重绘次数，提升性能。
        const fragment = document.createDocumentFragment();
        messages.forEach(({ type, userId, content, timestamp }) => {
            const div = document.createElement('div');
            switch (type) {
                case 'message':
                    div.className = 'message';
                    div.textContent = `[${userId}] (${formatTime(timestamp)}) ${content}`;
                    break;
                case 'system':
                    div.className = 'message system-message';
                    div.textContent = `[系统] ${content}`;
                    break;
                case 'reconnect':
                    div.className = 'message system-message';
                    div.textContent = `[系统] ${content}`;
                    break;
                default:
                    console.error('未知消息类型:', type);
                    return; // 跳过未知类型的消息
            }
            fragment.appendChild(div);
        });

        // 将消息插入到顶部
        container.prepend(fragment);

        // 调整滚动位置，防止跳动
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = oldScrollTop + (newScrollHeight - oldScrollHeight);
    }


}