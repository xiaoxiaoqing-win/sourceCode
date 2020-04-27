class MyPromise {
    constructor(executor) {
        this.status = "pending";     // 初始化状态为pending
        this.value = undefined;      // 初始化返回的成功的结果或者失败的原因
        this.resolveArr = [];        // 初始化then中成功的方法
        this.rejectArr = [];         // 初始化then中失败的方法


        // 定义change方法，因为我们发现好像resolve和reject方法共同的地方还挺多🤔
        let change = (status, value) => {
            if (this.status !== "pending") return;  // 状态一旦改变，就不会再变
            this.status = status;
            this.value = value;

            // 根据状态判断要执行成功的方法或失败的方法
            let fnArr = status === "resolved" ? this.resolveArr : this.rejectArr;

            // fnArr中的方法依次执行
            fnArr.forEach(item => {
                if (typeof item !== "function") return;
                item(value);
            })
        }
        // 这里是resolve方法，成功后执行，将状态改变为resolved，并且将结果返回
        let resolve = result => {
            // 如果数组中有值，则立即改变状态
            if (this.resolveArr.length > 0) {
                change("resolved", result)
            }
            // 如果没值，则延后改变状态
            let timer = setTimeout(_ => {
                change("resolved", result)
                clearTimeout(timer);
            }, 0)
        }

        // 这里是reject方法，异常时执行，状态改为rejected，并且将失败的原因返回
        let reject = reason => {
            // 如果数组中有值，则立即改变状态
            if (this.rejectArr.length > 0) {
                change("rejected", reason);
            }
            // 如果没值，则延后改变状态
            let timer = setTimeout(_ => {
                change("rejected", reason);
                clearTimeout(timer);
            }, 0)
        }

        // try、catch捕获异常，如果错误，执行reject方法
        try {
            executor(resolve, reject)
        } catch (err) {
            reject(err)
        }
    }

    then(resolveFn, rejectFn) {
        // 如果传入的两个参数不是函数，则直接执行返回结果
        if (typeof resolveFn !== "function") {
            resolveFn = result => {
                return result;
            }
        }

        if (typeof rejectFn !== "function") {
            rejectFn = reason => {
                return MyPromise.reject(reason);
            }
        }

        return new MyPromise((resolve, reject) => {
            this.resolveArr.push(result => {
                try {
                    let x = resolveFn(result);  // 获取执行成功方法返回的结果

                    // 如果x是一个promise实例，则继续调用then方法 ==> then链的实现
                    if (x instanceof MyPromise) {
                        x.then(resolve, reject)
                        return;
                    }

                    // 不是promise实例，直接执行成功的方法
                    resolve(x);
                } catch (err) {
                    reject(err)
                }
            })

            this.rejectArr.push(reason => {
                try {
                    let x = rejectFn(reason);

                    if (x instanceof MyPromise) {
                        x.then(resolve, reject)
                        return;
                    }

                    resolve(x);
                } catch (err) {
                    reject(err)
                }
            })
        })
    }

    catch(rejectFn) {
        return this.then(null, rejectFn)
    }

    static resolve(result) {
        // 返回新的promise实例，执行promise实例中resolve方法
        return new MyPromise(resolve => {
            resolve(result)
        })
    }

    static reject(reason) {
        // 返回新的promise实例，执行promise实例中reject方法
        return new MyPromise((_, reject) => {
            reject(reason);
        })
    }

    // 接收数组参数
    static all(promiseList) {
        // 返回新实例，调用后还可使用then、catch等方法
        return new MyPromise((resolve, reject) => {
            let index = 0,      // 成功次数计数
                results = [];   // 返回的结果
            for(let i = 0; i < promiseList.length; i++) {
                let item = promiseList[i];
                // 如果item不是promise实例
                if(!(item instanceof MyPromise)) return;
                item.then(result => {
                    index++;
                    results[i] = result;
                    if(index === promiseList.length) {
                        resolve(results);
                    }
                }).catch(reason => {
                    reject(reason);
                })
            }
        })
    }

    static race(promiseList) {
        return new MyPromise((resolve, reject) => {
            promiseList.forEach(item => {
                if(!(item instanceof MyPromise)) return;

                item.then(result => {
                    resolve(result);
                }).catch(err => {
                    reject(err)
                })
            })
        })
    }

    static allSettled(promiseList) {
        return new MyPromise((resolve, reject) => {
            let results = [];

            for(let i = 0; i < promiseList.length; i++) {
                let item = promiseList[i];

                if(!(item instanceof MyPromise)) return;

                item.then(result => {
                    results[i] = result;
                }, reason => {
                    results[i] = reason;
                })
                resolve(results);
            }
        })
    }
    finally(finallyFn) {
        let P = this.constructor;
        return this.then(
            value => P.resolve(finallyFn()).then(() => value),
            reason => P.reject(finallyFn()).then(() => reason)
        )
    }

    done(resolveFn, rejectFn) {
        this.then(resolveFn, rejectFn)
            .catch(reason => {
                setTimeout(() => {
                    throw reason
                }, 0)
            })
    }
}