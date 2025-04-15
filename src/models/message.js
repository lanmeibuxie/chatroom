const mongoose = require('mongoose');

//发送消息的时间戳在服务器端生成
const messageSchema = new mongoose.Schema({
    type: String,
    userId: String,
    content: String,
    timestamp: String
})



module.exports = mongoose.model('Message', messageSchema);

