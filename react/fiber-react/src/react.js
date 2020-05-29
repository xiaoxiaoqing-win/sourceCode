import { ELEMENT_TEXT } from './constants';

// 创建元素的方法
// 元素的类型   配置对象   放着所有的儿子，统一为数组
function createElement(type, config, ...children) {
    delete config.__self
    delete config.__source  // 表示这个元素是在哪行哪列哪个文件生成的
    return {
        type,
        props: {
            ...config,
            // 兼容处理，如果是react元素就返回自己，如果是文本类型，如果是字符串的话，返回元素对象
            children: children.map(child => {
                // child是React.createElement返回的react元素，字符串的话才会转成文本节点
                return typeof child === "object" ? child : {
                    type: ELEMENT_TEXT,
                    props: {text: child, children: []}
                }
            })
        }
    }
}

const React = {
    createElement
}

export default React;