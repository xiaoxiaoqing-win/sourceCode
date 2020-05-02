/**
 * call和apply方法两个方法都是要改变的this指向，在非严格模式下，如果传递null、undefined，则指向window，
 * 在第二个参数上有所区别，call是将参数一个一个传递，而apply是将参数整体放在数组中传递，两个方法都是立即执行函数
 * call的性能要好于apply
*/

~function anymous(proto) {
    function call(context = window, ...args) {
        context.$fn = this;

        let type = typeof context;
        if(type !== "object" && type !== "function" && type !== symbol) {
            switch(type) {
                case 'number':
                    context = new Number(context)
                    break;
                case 'string':
                    context = new String(context)
                    break;
                case 'boolean':
                    context = new Boolean(context)
                    break;
            }
        }
        let result = context.$fn(...args);
        delete context.$fn;
        return result;
    }

    proto.call = call;
}(Function.prototype)