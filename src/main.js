import Vue from 'vue'
import App from './App'
import router from './router'
// 导入element
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 导入通用样式
import '@/assets/base.less'
// 导入全局axios
import axios from 'axios'
import ElTreeGrid from 'element-tree-grid'
Vue.component('el-table-tree-column', ElTreeGrid)
// console.log(ElTreeGrid.name)

Vue.prototype.axios = axios
axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/'
// 添加请求拦截器
axios.interceptors.request.use(
  function(config) {
    // 在发送请求之前做些什么
    config.headers.Authorization = localStorage.getItem('token')
    return config
  },
  function(error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 添加响应拦截器
axios.interceptors.response.use(
  function(response) {
    // 对响应数据做点什么
    return response.data
  },
  function(error) {
    // 对响应错误做点什么
    return Promise.reject(error)
  }
)

Vue.config.productionTip = false
// 安装element当成插件使用
Vue.use(ElementUI)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
