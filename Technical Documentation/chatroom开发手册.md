

# 文档综述

由于许多技术是第一次接触,为方便本人以及协作者查阅,将开发过程中查阅的资料整理到了这个文档中.本文档使用markdown编写,请使用支持markdown的编辑器打开

# app.listen方法

### **代码解析**

javascript

复制

```javascript
const server = app.listen(HTTP_PORT, "0.0.0.0");
```

#### **1. `app.listen()` 方法**

- **作用**：启动一个 HTTP 服务器，监听指定端口和主机。

- 

  参数

  ：

  | 参数顺序 |   类型   |         示例值         |                说明                |
  | :------: | :------: | :--------------------: | :--------------------------------: |
  | 第1参数  |  Number  | `HTTP_PORT`（如 3000） |            监听的端口号            |
  | 第2参数  |  String  |      `"0.0.0.0"`       | 绑定到的主机 IP 地址（详解见下文） |
  | 第3参数  | Function |    `() => { ... }`     | 回调函数（当服务器成功启动时触发） |

------

### **2. `"0.0.0.0"` 的特殊含义**

- **作用**：绑定到所有可用的网络接口。
- 具体解释：
  - `0.0.0.0` 不是一个真实的 IP 地址，而是表示 **允许服务器从任何网络接口接收请求**。
  - 包括：
    - 本地回环地址（`127.0.0.1`，即 `localhost`）。
    - 本机局域网 IP（如 `192.168.1.100`）。
    - 公网 IP（如果有）。
  - **若不指定此参数**，默认为 `localhost`（`127.0.0.1`），仅允许本机访问，外部无法连接。

------

### **3. 为什么需要 `0.0.0.0`？**

- **常见场景**：

  - 开发环境需要让 **本机和其他设备**（如手机、平板）访问你的服务。
  - 服务器部署在 Docker 容器中，需将端口绑定到宿主机的 `0.0.0.0`。
  - 生产环境中需接受外部公开请求。

- **不配置 `0.0.0.0` 的后果**：

  javascript

  复制

  ```javascript
  app.listen(3000) // 只监听 127.0.0.1:3000
  ```

  - 外部设备无法通过 IP 地址或域名访问你的服务。

------

### **4. 返回值 `server`**

- `app.listen()` 返回一个 Node.js 的 `http.Server` 对象。

- 后续可操作此对象：

  javascript

  复制

  ```javascript
  // 关闭服务器
  server.close();
  
  // 监听服务器错误事件
  server.on('error', (err) => {
    console.error('服务器错误：', err);
  });
  
  // 监听连接事件
  server.on('connection', (socket) => {
    console.log('新客户端连接：', socket.remoteAddress);
  });
  ```

# mongodb相关

#### 为什么我们的项目要使用Mongodb?

#### ✅ **适合的原因**

1. **灵活 Schema**
   聊天消息的格式可能变化（如文本、图片、文件、表情包等），MongoDB 的文档模型允许动态添加字段，无需预先定义表结构。
2. **写入性能**
   高频插入消息时，MongoDB 的写入吞吐量优于传统关系型数据库（如 MySQL），适合消息流场景。
3. **扩展性**
   未来用户量增长后，可通过分片（Sharding）水平扩展，分散数据存储压力。
4. **嵌套数据支持**
   可轻松存储嵌套结构（如消息内的回复、元数据），无需复杂联表查询。

#### ⚠️ **需注意的风险**

1. **事务一致性**
   如果涉及“消息发送+更新用户未读计数”等需要原子性操作时，需依赖 MongoDB 的多文档事务（4.0+版本支持），但频繁使用事务可能影响性能。

2. **长期数据膨胀**
   聊天记录可能随时间急剧增长，需提前规划数据归档或分片策略。

   以上内容为ai生成

#### mongodb在本项目中

在本项目中,mongodb数据库的运行是通过docker,且以后端运行在同一机器上以便通过url连接数据库mongodb://localhost:27017/chatroom

#### Mongodb的学习

强烈建议观看以下视频,以建立基本的了解

https://www.bilibili.com/video/BV16u4y1y7Fm?

#### mongodb数据库的构成

1. **数据库 (Database)**
   一个 MongoDB 实例可包含多个数据库（如 `admin`、`test`），每个数据库是独立的数据容器。
2. **集合 (Collection)**
   每个数据库包含多个集合（类似关系型数据库中的“表”），​**​集合是文档的逻辑分组​**​。
3. **文档 (Document)**
   集合中的基本存储单元，采用 BSON 格式（类似 JSON），每个文档代表一条数据记录。

#### mongodb的设计特点

- 

  同一集合中的文档可以结构不同

  ：

  MongoDB 是 

  无模式（Schemaless）

   的，允许同一集合中存在不同结构的文档。例如：

  json

  复制

  ```json
  // 文档1（文本消息）
  { _id: 1, type: "text", content: "Hello", timestamp: "2023-10-01" }
  
  // 文档2（图片消息）
  { _id: 2, type: "image", url: "http://...", size: "2MB" }
  ```

- **不同集合的文档通常类型不同**：
  例如 `users` 集合存储用户信息，`messages` 集合存储聊天记录。

#### ⚠️ **实际开发中的最佳实践**

尽管 MongoDB 允许灵活存储，但为了**查询效率和维护性**，建议：

1. 

   同一集合的文档保持结构一致性

   ：

   - 使用公共字段（如 `type` 字段区分消息类型）。
   - 非必需字段允许动态增减（如 `image` 消息有 `url`，文本消息没有）。

2. **避免完全异构文档**：
   若文档差异过大（如同时存用户数据和日志），应拆分为不同集合。

#### gui工具

MongoDBCompass

navicat

vscode插件等

可以用以连接mongodb并提供可视化服务

#### 对mongodb数据库的操作

在mongodb终端中

展示数据库

```bash
show dbs	#只有真正写入数据库后数据库才会被创建
```

切换数据库

```
use 数据库名称 #数据库名称可以不存在
```

创建集合

```
db.集合名称.func()
```

#### model

在model文件夹下包含了数据库定义的模型

```json

 const Message = require('./models/Message'); // 导入模型

// // 使用模型查询数据
 Message.find({ type: 'text' })
   .then(messages => console.log(messages));
```

这是使用示例

#### save方法

保存到数据库中使用

##### **调用 `save()` 函数保存到哪里？**

- **数据库名称**：在连接 MongoDB 时指定（如 `mongodb://localhost:27017/chat_app` 中的 `chat_app`）。
- **集合名称**：默认是模型名的复数小写形式（如模型 `Message` 对应集合 `messages`），也可通过 Schema 的 `collection` 选项自定义。

#### mongoose的引入

- **Mongoose 是单例库**：无论你在多少个文件中 `require('mongoose')`，Node.js 模块系统会确保它们指向同一个实例。
- **数据库连接只需建立一次**：在主文件中调用 `mongoose.connect()` 后，整个应用共享该连接。
- **模型注册依赖 Mongoose 实例**：定义模型的模块（如 `models/message.js`）必须引入 Mongoose，否则无法使用 `mongoose.Schema` 和 `mongoose.model()`。