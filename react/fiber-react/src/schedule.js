// 从根节点开始渲染和调度
// 两个阶段 diff阶段  对比新旧虚拟dom，进行增量更新或创建  
// render阶段， 比较花时间，对任务进行拆分，拆分维度虚拟DOM。此阶段可以暂停
// 成果是effect list 知道哪些节点删除 更新 增加
// render阶段有两个任务：生成fiber树 收集effect list
// commit阶段  进行dom更新创建的阶段 此阶段不能暂停 要一气呵成

import { TAG_ROOT, ELEMENT_TEXT, PLACEMENT, TAG_HOST, TAG_TEXT} from "./constants";
import { setProps } from './utils';

let nextUnitOfWork = null; // 下一个工作单元
let workInprogressRoot = null;  // RootFiber应用的根

export function scheduleRoot(rootFiber) {
    workInprogressRoot = rootFiber;
    nextUnitOfWork = rootFiber;


}

function performUnitOfWork(currentFiber) {
    beginWork(currentFiber)  // 开始
    if(currentFiber.child) {
        return currentFiber.child
    }
   
    while(currentFiber) {
        completeUnitOfWork(currentFiber)   //没有儿子让自己完成
        if(currentFiber.sibling) {    // 看有没有弟弟  
            return currentFiber.sibling  // 有弟弟返回弟弟
        }
        currentFiber = currentFiber.return;  // 找父亲 然后让父亲完成
    }
}

function completeUnitOfWork(currentFiber) {  // 第一个完成的A1(TEST)
    let returnFiber = currentFiber.return;
    if(returnFiber) {
        if(!returnFiber.firstEffect) {
            returnFiber.firstEffect = currentFiber.firstEffect;
        }
        if(!!currentFiber.lastEffect) {
            if(returnFiber.lastEffect) {
                returnFiber.lastEffect.nextEffect = currentFiber.firstEffect
            }
            returnFiber.lastEffect = currentFiber.lastEffect
        }
        const effectTag = currentFiber.effectTag;
        if(effectTag) {  // 自己有副作用
            // 每个fiber有两个属性，firstEffect指向第一个有副作用的子fiber lastEffect指向最后一个有副作用子fiber 中间用nextEffect做成一个单链表 firstEffec=大儿子
            // nextEffec=二儿子
            if(!!returnFiber.lastEffect) {
                returnFiber.lastEffect.nextEffect = currentFiber;
            } else {
                returnFiber.firstEffect = currentFiber;
            }
            returnFiber.lastEffect = currentFiber;

        }
    }

}
// 开始收下线的钱 completeUnitOfWork 收完了
// 1.创建dom元素
// 2.创建子fiber
function beginWork(currentFiber) {
    if(currentFiber.tag === TAG_ROOT) {
        updateHostRoot(currentFiber);
    } else if(currentFiber.tag === TAG_TEXT) {
        updateHostText(currentFiber);
    } else if(currentFiber.tag === TAG_HOST) {  // 原生dom节点
        updateHost(currentFiber);
    }
}

function updateHost(currentFiber) {
    if(!currentFiber.stateNode) {
        currentFiber.stateNode = createDOM(currentFiber)
    }
    const newChildren = currentFiber.props.children;
    reconcileChildren(currentFiber, newChildren)
}

// 完成时收集有副作用的fiber。然后组成effect list
function updateHostText(currentFiber) {
    if(!currentFiber.stateNode) {
        currentFiber.stateNode = createDOM(currentFiber)
    }
}

function createDOM(currentFiber) {
    if(currentFiber.tag === TAG_TEXT) {
        return document.createTextNode(currentFiber.props.text);
    } else if(currentFiber.tag === TAG_HOST) {
        let stateNode = document.createElement(currentFiber.type);
        updateDOM(stateNode, {}, currentFiber.props)
        return stateNode;
    }
}

function updateDOM(stateNode, oldProps, newProps) {
    setProps(stateNode, oldProps, newProps);
}

function updateHostRoot(currentFiber) {
    // 先处理自己，如果是一个原生节点，创建真实dom
    // 创建子fiber
    let newChildren = currentFiber.props.children;
    reconcileChildren(currentFiber, newChildren);
}

function reconcileChildren(currentFiber, newChildren) {
    let newChildrenIndex = 0; // 新子节点的索引
    let prevSibling;          // 上一个新的子fiber
    // 遍历子虚拟dom元素数组，为每个虚拟dom元素创建子fiber
    while(newChildrenIndex < newChildren.length) {
        let newChild = newChildren[newChildrenIndex]  // 取出虚拟dom节点
        let tag;
        if(newChild.type === ELEMENT_TEXT) {
            tag = TAG_TEXT       // 这是一个文本节点
        } else if(typeof newChild.type === "string") {
            tag = TAG_HOST;      // 如果type是字符串，那么这是一个原生dom节点
        }  // beginwork创建fiber 在coompleteunitofwork时候收集effect
        

        let newFiber = {
            tag,
            type: newChild.type,
            props: newChildren.props,
            stateNode: null,     // div还没有创建dom元素
            return: currentFiber, // 父fiber
            effectTag: PLACEMENT,  // 操作类型
            nextEffect: null,   // 单链表 effect list顺序和完成顺序是一样的 但是节点只放哪些出钱的额人的fiber节点不出钱绕过去
        }
        // 最小的儿子没有弟弟
        if(newFiber) {
            if(newChildrenIndex === 0) {   // 当前索引为0，说明是太子
                currentFiber.child = newFiber;
            } else {   // 让太子的sibling弟弟指向二皇子
                prevSibling.sibling = newFiber;
            }
        }
        newChildrenIndex++
    }
}

// 循环执行工作
function workLoop(deadline) {
    let shouldYield = false;  // 是否让出时间片或者控制权
    while(nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)   // 执行完一个任务后
        shouldYield = deadline.timeRemaining() < 1; // 没有时间让出控制权
    }

    if(!nextUnitOfWork) {
        console.log('render 结束了');
        commitRoot()
    }  
    // 如果时间片到期后还有任务没有完成，就需要请求浏览器再次调度  不管有没有任务  每一帧都执行一次workLoop
    requestIdleCallback(workLoop, {timeout: 500});  // 超时时间
    
}

// react告诉浏览器  我现在有任务 请你在闲的时候
// 有优先级的概念expirationTime
requestIdleCallback(workLoop, {timeout: 500});  // 超时时间

function commitRoot() {
    let currentFiber = workInprogressRoot.firstEffect
    while(currentFiber) {
        commitWork(currentFiber)
        currentFiber = currentFiber.nextEffect;
    }
    workInprogressRoot = null
}

function commitWork(currentFiber) {
    if(!currentFiber) return;
    let returnFiber = currentFiber.return;
    let returnDOM = returnFiber.stateNode;
    if(currentFiber.effectTag === PLACEMENT) {
        returnDOM.appendChild(currentFiber.stateNode);
    }

    currentFiber.effectTag = null;
}