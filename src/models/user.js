//用户模型
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: String,
})

module.exports = mongoose.model('User', userSchema);