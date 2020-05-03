// new的执行机制
// 1.形成一个全新的执行上下文
// 2.形成AO变量对象
// 3.初始化作用域链
// 4.默认创建一个对象，这个对象就是当前类的实例（与普通函数执行不同）
// 5.声明this指向新创建实例（与普通函数执行不同）
// 6.代码执行
// 7.不论是否有return，都会将新创建的实例返回

function myNew(fn, ...args) {
    let obj = Object.create(fn.prototype);
    let result = fn.call(...args);
    return result !== null 
            && (typeof result === "object" || typeof result === "function")
            ? result : obj;
}
