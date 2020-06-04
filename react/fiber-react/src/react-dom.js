// 把一个元素渲染到一个容器内部
import { TAG_ROOT } from './constants';
import {scheduleRoot} from './schedule';


function render(element, container) {
    let rootFiber = {
        tag: TAG_ROOT,  // 每个fiber会有一个tag标识  元素类型

        stateNode: container, // 一般情况下如果这个元素是一个原生节点的话，stateNode指向真实dom元素
        // props.children是一个数组，里面放的是react元素 虚拟dom 后面会根据每个react元素创建 对应的fiber
        props: {
            children: [element]   // fiber的属性对象children属性，里面 放的是要渲染的元素
        }
    }

    scheduleRoot(rootFiber);
}

const ReactDOM = {
    render
}

export default ReactDOM;