// bind方法是预先改变this指向，不立即执行函数

~function anymous(proto) {
    function bind(context = window, ...args) {
        context === null ? context = window : null;
        var _this = this;
        return function() {
            let innerArgs = Array.prototype.slice.call(arguments);
            let finalArgs = innerArgs.concat(args);
            return _this.call(context, ...finalArgs);
        }
    }
    proto.bind = bind;
}(Function.prototype)