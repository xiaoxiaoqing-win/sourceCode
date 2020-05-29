import React from 'react';
import ReactDOM from 'react-dom';

let style = {border: "3px solid red", margin: 10};
// webpack打包时，通过babel编译成js
let element = (
    <div id="A1" style={style}>
        <div id="B1" style={style}>
            <div id="C1" style={style}>C1</div>
            <div id="C2" style={style}>C2</div>
        </div>
        <div id="B2" style={style}></div>
    </div>
)
console.log(element);

// 虚拟dom是一个js对象，以js对象的形式描述界面上DOM的样子

// element
ReactDOM.render(
  element,
  document.getElementById('root')
);
