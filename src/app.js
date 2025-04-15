const express = require('express')
const path = require('path')

const createApp = () => {
    const app = express()

    // 中间件
    app.use(express.static(path.join(__dirname, '../public')))


    return app
}

module.exports = createApp