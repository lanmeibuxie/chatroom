// 生成/读取用户ID

// export 的核心作用
// ​​模块化​​：将代码拆分为独立模块，通过导出（export）和导入（import）实现代码复用和依赖管理。
// ​​控制暴露范围​​：明确声明哪些内容可以被其他模块访问，哪些是模块私有的。

// 其他模块使用时需要按名称导入：
// import { getOrCreateUserId } from './user.js';

export function getOrCreateUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = `用户_${Math.floor(Math.random() * 1000)}`;
        localStorage.setItem('userId', userId);
    }
    return userId;
}