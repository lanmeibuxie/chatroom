import { getOrCreateUserId } from './modules/user.js';
import { ChatSocket } from './modules/socket.js';
import { ChatUI } from './modules/ui.js';

// 初始化
// 用户id由客户端生成并存储在localStorage中
const userId = getOrCreateUserId();
const chatUI = new ChatUI();

//ChatSocket初始化会自动绑定连接和接受消息的事件
//由于绑定的事件需要对chatui获取的DOM元素进行操作，所以需要在实例化ChatSocket时候传入chatui实例
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'; // 根据页面协议选择 ws 或 wss
const host = window.location.host; // 获取当前主机名和端口
const wsUrl = `${protocol}//${host}`;

const chatSocket = new ChatSocket(wsUrl, userId, chatUI);

// 绑定发送事件
document.getElementById('sendButton').addEventListener('click', () => {
    if (chatUI.input.value.trim()) {
        chatSocket.send({
            type: 'message',
            userId: userId,
            content: chatUI.input.value
        });
        chatUI.input.value = '';
    }
});

// 回车发送
chatUI.input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') chatUI.sendMessage(chatSocket, userId);
});

window.sendMessage = () => {
    if (chatUI.input.value.trim()) {
        chatSocket.send({
            type: 'message',
            userId: userId,
            content: chatUI.input.value
        });
        chatUI.input.value = '';
    }
};