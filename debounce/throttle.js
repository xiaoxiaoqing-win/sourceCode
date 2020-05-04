// 节流  一段时间内只触发一次
function throttle(fn, wait) {
    let pre = 0;
    return function() {
        let now = new Date();
        if(now - pre > wait) {
            fn.apply(this, arguments)
            pre = now;
        }
    }
}