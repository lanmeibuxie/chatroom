const mongoose = require('mongoose')
const { MONGO_URI } = require('../config/constants')

module.exports = async () => {
    try {
        await mongoose.connect(MONGO_URI)
        console.log('✅ MongoDB 连接成功')
    } catch (err) {
        console.error('❌ 连接失败:', err)
        process.exit(1) // 连接失败时退出进程
    }
}