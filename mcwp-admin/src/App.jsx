import React from 'react'; // react核心，用到jsx的地方，都需要这个
import { render } from 'react-dom'; // 渲染组件时需要
import { Provider } from 'react-redux'; // react和redux连接的桥梁，就是这个Provider
import store from './Redux/Store/Index'; // 引入sotre
import route from './Router/Index'; // 所有定义好的路由

// babel本身只能转换ES6语法，但ES6新增的Map、Set、Generator等新功能不会转换，所以需要此插件
import 'babel-polyfill';

// 公共样式
import './Assets/Style/common.less';
import './Assets/Style/data-flex.less';

store.subscribe(() => { // 监听state变化
	// console.log(store.getState());
});

// 创建根组件
render(
	<Provider store={store}>
		{route}
	</Provider>,
	document.body.appendChild(document.createElement('div'))
);
