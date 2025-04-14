import { getOrCreateUserId } from './modules/user.js';
import { ChatSocket } from './modules/socket.js';
import { ChatUI } from './modules/ui.js';

// 初始化
const userId = getOrCreateUserId();
const chatUI = new ChatUI();
//ChatSocket初始化会自动绑定连接和接受消息的事件
//由于绑定的事件需要对chatui获取的DOM元素进行操作，所以需要在实例化ChatSocket时候传入chatui实例
const chatSocket = new ChatSocket('ws://localhost:5500', userId, chatUI);

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