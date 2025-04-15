const express = require('express')
const path = require('path')

const createApp = () => {
    const app = express()

    // 中间件
    // 设置静态文件目录，提供对 public 文件夹中静态资源的访问
    // 例如，public 文件夹中的 HTML、CSS、JS 文件可以通过 http://<host>:<port>/<文件名> 直接访问
    app.use(express.static(path.join(__dirname, '../public')))


    return app
}

module.exports = createApp