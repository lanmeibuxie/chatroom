const mongoose = require('mongoose')
const { MONGO_URI } = require('../config/constants')

// 这相当于导出了一个 ​​匿名函数​​。当其他文件引入这个模块时，接收到的就是该匿名函数。
// 模块导出的本质是一个函数，必须通过 () 执行
module.exports = async () => {
    try {
        await mongoose.connect(MONGO_URI)
        console.log('✅ MongoDB 连接成功')
    } catch (err) {
        console.error('❌ 连接失败:', err)
        process.exit(1) // 连接失败时退出进程
    }
}