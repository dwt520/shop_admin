import Vue from 'vue'
import App from './App'
import router from './router'
// 导入element
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 导入通用样式
import '@/assets/base.less'
Vue.config.productionTip = false
// 安装element当成插件使用
Vue.use(ElementUI)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
