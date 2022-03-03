import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'

import FastClick from 'fastclick'
import VueLazyload from "vue-lazyload";

import toast from 'components/common/toast/index'

Vue.config.productionTip = false

//安装事件总线对象
Vue.prototype.$bus = new Vue()

//安装toast插件
Vue.use(toast)

//解决移动端300ms的延迟
FastClick.attach(document.body)

//安装图片懒加载插件
Vue.use(VueLazyload, {
  loading: require('./assets/img/common/coderqyf.png')
})


/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router,
  store,
})