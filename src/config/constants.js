// 环境常量配置
module.exports = {
    HTTP_PORT: process.env.HTTP_PORT || 5500,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/chatroom'
}