/**
 * 实现请求并发限制
*/
function requestPool(num){
    const queue = []
    const curr = 0

    function doRequest(){
        if(curr >= num)return
        if(queue.length<=0)return
        curr++
        const {args, resolve, reject} = queue.shift()
        fetch(...args)
            .then(resolve, reject)
            .finally(()=>{
                curr--
                doRequest()
            })
    }

    return function (...args){
        return new Pormise((resolve, reject)=>{
            queue.push({args, resolve, reject})
            doRequest()
        })
    }
}
    