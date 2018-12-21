import Vue from 'vue'
import Router from 'vue-router'
import Login from 'components/Login'
import Home from 'components/Home'
import Users from 'components/Users'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: Home,
      children: [
        {
          path: '/users',
          component: Users
        }
      ]
    }
  ]
})
router.beforeEach((to, from, next) => {
  /* must call `next` */
  // console.log('哈哈')
  // console.log('to', to)
  // 如果是去登录页,直接放行
  if (to.path === '/login') {
    // 直接放行
    next()
    return
  }
  // 如果不是登录,判断是否有token,如果有,放行
  let token = localStorage.getItem('token')
  if (token) {
    next()
  } else {
    next('/login')
  }
})
export default router
