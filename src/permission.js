import router from './router/router'

import {
  errorRoutes
} from './router/router'
import store from '@/store/store'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({
  showSpinner: false
})
import { Notify } from 'vant';

const mainRoutes = store.state.permission.routes

let result = errorRoutes



router.beforeEach(async (to, from, next) => {
  NProgress.start()
  store.commit('app/updateFromRoute', from)

  const userInfo = store.state.user.userInfo
  const checkHeader = () => {
    const logoutBlackList = ['/loginMobile', '/changePassword', '/alipayAuth', '/']
    store.commit('app/updateHeader', {
      logout: !logoutBlackList.find(item => item === to.path)
    })
  }
  const checkNeedUserInfo = to => {
    const needUserInfoBlackList = ['/loginMobile', '/changePassword', '/alipayAuth', '/']
    return !needUserInfoBlackList.find(item => item === to.path)
  }
  checkHeader()

  if (!userInfo || Object.keys(userInfo).length === 0) {
    if (checkNeedUserInfo(to)) {
      await store.dispatch('getUserInfo')
    }
    next()
  } else {
    next()

  }




  // next({
  //   ...to,
  //   replace: true
  // }) // hack方法 确保addRoutes已完成
})

router.afterEach((to, from) => {
  console.log('finsh', to)
  NProgress.done()
})

router.onError(error => {


  console.log('router.onError', error)
})
