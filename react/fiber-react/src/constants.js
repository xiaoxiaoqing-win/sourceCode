// 文本元素
export const ELEMENT_TEXT = Symbol.for("ELEMENT_TEXT");

// react需要一个根fiber
export const TAG_ROOT = Symbol.for("TAG_ROOT");

// 原生节点，区分函数组件和类组件
export const TAG_HOST = Symbol.for("TAG_HOST");

export const TAG_TEXT = Symbol.for("TAG_TEXT");

// 文本节点
export const TAG_ELEMENT = Symbol.for("TAG_ELEMENT");

// 插入
export const PLACEMENT = Symbol.for("PLACEMENT");

// 更新
export const UPDATE = Symbol.for("UPDATE");

// 删除
export const DELETEDOM = Symbol.for("DELETEDOM");