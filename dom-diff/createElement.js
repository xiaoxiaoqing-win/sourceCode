export function createElement(tagName, props = {}, children) {
    let vnode = {};
    if(!props.hasOwnProperty('key')) return;

    vnode.key = props.key;

    delete props.key;

    return Object.assign(vnode, {
        tagName,
        props,
        children
    })
}

function render(vnode) {
    const element = document.createElement(vnode.tagName);
    const props = vnode.props;

    for(let key in props) {
        if(!props.hasOwnProperty(key)) return;

        // setAttribute设置指定元素上的某个属性值。如果属性已经存在，则更新该值；否则，使用指定的名称和值添加一个新的属性。
        // 获取用getAttribute
        // 删除用remove
        let value = props[key];
        node.setAttribute(key, value);
    }

    if(!vnode.children) return;

    vnode.children.forEach(child => {
        // const childElement = 
        let childElement = null;
        if(typeof child === 'string') {
            childElement = document.createTextNode(child)
        }

        if(Object.prototype.toString.call(child) === "[object Array]") {
            render(child)
        }
        
        element.appendChild(child);
    })

    return elemenet
}