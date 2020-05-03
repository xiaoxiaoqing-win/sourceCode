// Object.create
function create(proto, property) {
    let obj = {};
    obj.__proto__ = proto;

    Object.defineProperties(obj, property);
    
    return obj;
}