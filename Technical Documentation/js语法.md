# 导出单个函数

javascript

复制

```javascript
// connection.js
module.exports = function() { ... };
// 导入后：connectDB 是一个函数
```

#### 情况 2：导出对象

javascript

复制

```javascript
// connection.js
module.exports = {
  connect: function() { ... },
  disconnect: function() { ... }
};
// 导入后：connectDB.connect() 调用
```

#### 情况 3：直接赋值给 exports

javascript

复制

```javascript
// connection.js
exports.connectDB = function() { ... };
// 导入后：connectDB = { connectDB: function() }
```

# const关键字

在JavaScript中，`const`关键字用于声明**常量**，具有以下核心特性和使用场景：

------

### **核心特性**

1. **不可重新赋值**
   用`const`声明的变量​**​不能重新赋值​**​，否则会抛出`TypeError`。

   javascript

   复制

   ```javascript
   const a = 10;
   a = 20; // TypeError: Assignment to constant variable.
   ```

2. **块级作用域**
   与`let`类似，作用域限制在声明它的代码块内（如`{}`、循环、条件语句等）。

3. **必须初始化**
   声明时必须直接赋值，否则报`SyntaxError`。

   javascript

   复制

   ```javascript
   const b; // SyntaxError: Missing initializer in const declaration
   ```

4. **允许修改引用类型的内容**
   `const`仅限制变量指向的内存地址不变。对于对象、数组等引用类型，其内容可以修改：

   javascript

   复制

   ```javascript
   const arr = [1, 2, 3];
   arr.push(4); // 允许修改数组内容
   const obj = { name: "Alice" };
   obj.name = "Bob"; // 允许修改对象属性
   ```

5. **暂时性死区（TDZ）**
   在声明前访问变量会触发`ReferenceError`，与`let`行为一致。

------

### **适用场景**

1. **声明常量**
   用于值不需要改变的变量（如配置项、数学常量等）：

   javascript

   复制

   ```javascript
   const PI = 3.14159;
   const API_URL = "https://api.example.com";
   ```

2. **引用类型变量**
   当变量指向对象或数组，且不需要重新赋值时：

   javascript

   复制

   ```javascript
   const users = ["Alice", "Bob"];
   users.push("Charlie"); // 允许修改数组内容
   ```

3. **循环中的`for...of`迭代**
   每次循环会创建新的`const`变量：

   javascript

   复制

   ```javascript
   for (const num of [1, 2, 3]) {
     console.log(num); // 输出1, 2, 3
   }
   ```

------

### **注意事项**

- **避免重新赋值引用类型**
  虽然可以修改引用类型的内容，但重新赋值会报错：

  javascript

  复制

  ```javascript
  const arr = [1, 2];
  arr = [3, 4]; // TypeError
  ```

- **不可用于普通`for`循环**
  因循环变量需重新赋值，需改用`let`：

  javascript

  复制

  ```javascript
  for (let i = 0; i < 3; i++) { /* 正确 */ }
  for (const i = 0; i < 3; i++) { // TypeError }
  ```

- **深层不可变性需手动处理**
  若需对象完全不可变，可使用`Object.freeze()`（注意是浅冻结）：

  javascript

  复制

  ```javascript
  const obj = Object.freeze({ value: 10 });
  obj.value = 20; // 静默失败（非严格模式）或TypeError（严格模式）
  ```

------

### **最佳实践**

- **默认使用`const`，必要时用`let`**
  优先用`const`声明变量，仅在需要重新赋值时使用`let`，避免使用`var`。
- **命名风格**
  常量通常使用全大写和下划线命名（如`MAX_SIZE`），以提高可读性。
- **引用类型谨慎修改**
  明确是否允许修改对象内容，必要时添加注释或使用冻结。

# window对象

**`window` 对象**：浏览器中代表全局作用域，挂载到 `window` 上的函数或变量可在任何地方直接访问（如 `<script>` 标签或开发者控制台中调用 `sendMessage()`）。