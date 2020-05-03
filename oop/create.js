// Object.create
// 创建一个对象，可创建一个空对象，以任意原型当作自己的原型，是一种实现继承的方式
function create(proto, property) {
    let obj = {};
    obj.__proto__ = proto;

    Object.defineProperties(obj, property);

    return obj;
}