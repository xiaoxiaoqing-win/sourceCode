let _ajax = (function anonymous() {
    class MyAjax {
        constructor(options) {
            this.options = options;
            return this.init();
        }

        init() {
            // 解构参数
            let {
                url,
                baseURL,
                method,
                headers,
                params,
                data,
                timeout,
                withCredentials,
                cache,               // axios中无，jquery中有，如果设置为false，则在所有get请求末尾加一个随机数，保证每次请求地址不同，从而清除缓存
                transformRequest,    // post请求，可以对请求主体做特殊处理
                transformResponse,   // 对返回结果做处理
                responseType,
            } = this.options;

            let GET_REG = /^(GET|DELETE|HEAD|OPTIONS)$/i;
            // 请求的api地址的特殊处理
            // 1.拼接完成地址
            url = baseURL + url;

            // 2.get系列请求，要把params或者cache指定的随机数，以问号传参方式拼接到末尾，也可以拼接时间戳
            if(GET_REG.test(method)) {
                if(params !== null) {
                    url += `${_ajax.checkASK(url)}${_ajax.paramsSerializer(params)}`
                }
                if(!cache) {
                    url += `${_ajax.checkASK(url)}_=${Math.random()}`
                }
            }

            // 请求主体传递参数的处理
            if(!GET_REG.test(method)) {
                if(typeof transformRequest === "function") {
                    data = transformRequest(data);
                }
                // transformRequest
            }
            // 基于promise管理ajax发送
            return new Promise((resolve, reject) => {
                let xhr = new XMLHttpRequest;
                xhr.open(method, url);
                // 额外的设置
                xhr.timeout = timeout;
                xhr.withCredentials = withCredentials;
                if(headers !== null && typeof headers === "object") {
                    for(let key in headers) {
                        if(!headers.hasOwnProperty(key)) break;
                        xhr.setRequestHeader(key, headers[key])
                    }
                }
                xhr.onreadystatechange = () => {
                    let status = xhr.status,
                        statusText = xhr.statusText,
                        state = xhr.readyState,
                        result = null;
                    if(/^2\d{2}$/.test(status)) {
                        if(state === 4) {
                            // 一般服务器返回的结果都是json字符串，如果想要拓展更多可能情况，可以在配置项中增加一个responseType来根据返回的类型做不同的处理
                            result = xhr.response;
                            responseType === "json" ? result = JSON.parse(result) : null;
                            // 处理响应头
                            let responseHeaders = {},
                                responseHeadersText = xhr.getAllResponseHeaders();

                            responseHeadersText = responseHeadersText.split(/\n+/g);

                            responseHeadersText.forEach(item => {
                                let [key, value] = item.split(": ");
                                if(key.length === 0) return;
                                responseHeaders[key] = value;
                            })
                            resolve({
                                config: this.options,
                                request: xhr,
                                status,
                                statusText,
                                data: result,
                                headers: responseHeaders
                            })
                        }
                        return;
                    }

                    // 请求失败
                    reject({
                        config: this.options,
                        request: xhr,
                        status,
                        statusText,
                    })
                }
                xhr.send(data)
            }).then(result => {
                if(typeof transformResponse === "function") {
                    result = transformResponse(result);
                }
                return result;
            })
        }
    }

    // 定义ajax对象和默认参数配置
    let _ajax = {};
    _ajax.defaults = {
        url: "",
        baseURL: "",
        method: "get",
        headers: {},
        params: {},
        data: {},
        timeout: 10000,
        withCredentials: false,
        cache: true,           // axios中无，jquery中有，如果设置为false，则在所有get请求末尾加一个随机数，保证每次请求地址不同，从而清除缓存
        transformRequest: null,  // post请求，可以对请求主体做特殊处理
        transformResponse: null, // 对返回结果做处理
        responseType: "json",
    };

    // 用用户传递的配置项，替换默认的配置项
    let init = function (options = {}) {
        _ajax.defaults.headers = Object.assign(_ajax.defaults.headers, options.headers);
        delete options.headers;
        return Object.assign(_ajax.defaults, options)
    };

    // 并发多个ajax请求，待所有请求都成功后做一些
    _ajax.all = function (requestArr) {
        return Promise.all(requestArr);
    };

    // get系列请求
    ['get', 'delete', 'head', 'options'].forEach(item => {
        _ajax[item] = function (url, options = {}) {
            options.url = url;
            options.method = item;
            return new MyAjax(init(options));
        };
    });

    // post系列
    ['post', 'put'].forEach(item => {
        _ajax[item] = function(url, data = {}, options = {}) {
            options.url = url;
            options.data = data;
            options.method = item;
            return new MyAjax(init(options))
        }
    });

    // 公共方法
    _ajax.paramsSerializer = function(obj) {
        // 把对象变为x-www-urlencode格式
        let str = ``;
        for(let key in obj) {
            if(!obj.hasOwnProperty(key)) break;
            str += `&${key}=${obj[key]}`
        }
        str = str.substring(1);
        return str;
    };

    _ajax.checkASK = function(url) {
        // 验证地址中是否存在问号
        return url.indexOf("?") < 0 ? "?" : "&";
    };

    return _ajax;
})();