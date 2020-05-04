// 防抖 可应用在联想输入框上
function debounce(fn, wait, isStart) {
    let timer = null;
    return function() {
        clearTimeout(timer)
        if(isStart) {
            let callNow = !timer;
            timer = setTimeout(function() {
                timeout = null;
            }, wait)
            if(callNow) {
                fn.apply(this, arguments)
            }
        } else {
            timer = setTimeout(() => {
                fn.apply(this, arguments)
            }, wait)
        }
    }
}
