import router from './router/router'
import Cookies from 'js-cookie'
import Layout from '@/layout'

import {
  errorRoutes
} from './router/router'
import store from '@/store/store'
import {
  Message,
  MessageBox
} from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({
  showSpinner: false
})

const whiteList = ['/login', '/auth-redirect', '/bind', '/register']

const mainRoutes = store.state.permission.routes

let result = errorRoutes

const transformData = routeData => {
  const result = []
  const loop = children => {
    children.forEach(item => {
      const temp = item
      result.push(temp)
      if (!!item.children && item.children.length > 0) {
        loop(item.children)
      }
    })
  }
  loop(routeData)
  return result
}

console.log('resourceData', mainRoutes)
console.log('resourceData', transformData(mainRoutes))

// 拼装路由
const assmbleRoute = resourceData => {
  let result = []

  const loop = routeData => {
    let result = []

    routeData.forEach(item => {
      let component
      let path = item.path
      let code = item.code

      try {
        if (item.type === 'menu') {
          if (item.children.length > 0) {
            component = require('@/views/InnerLayout.vue').default
          } else {
            component = require('@/views/' + item.path + '.vue').default
          }
        } else {
          console.log(item.path)
          component = require('@/views/' + item.path + '.vue').default
        }
      } catch (error) {
        console.log('catch+++++++++++++++', error)
        component = require('@/views/Error/Page404.vue').default
        path = path.replace('.', '')
        code = code
      }

      let temp = {
        id: item.id,
        name: code,
        path: '/' + path,
        component: component,
        meta: {
          icon: "gear",
          title: item.name,
          functionaility: []
        }
      }
      if (item.children && item.children.length > 0) {
        temp.children = []
        temp.children.push(...loop(item.children))
      }
      result.push(temp)
    })
    return result
  }

  result = loop(resourceData)
  return result
}
// 获取每个页面的权限信息，存到一个索引中
const getFuntionailityData = rolePermissionData => {
  let result = []
  console.log(rolePermissionData)
  rolePermissionData.forEach(item1 => {
    if (item1.children && item1.children.length > 0) {
      item1.children.forEach(item2 => {
        let temp = {
          id: item2.id,
          name: item2.code || 'none',
          functionaility: []
        }
        if (item2.children && item2.children.length > 0) {
          const checkedItems = item2.children.filter(item3 => item3.checked === true)
          temp.functionaility.push(...checkedItems)
        }

        result.push(temp)


      })
    }
  })
  return result
}
// 将权限信息分配到每个页面路由中
const dispatchPermissionToRoute = (routeData, funtionailityData) => {
  console.log('dispatchPermissionToRoute routeDate+++++++++++++++++', routeData)
  const loop = routeDate => {
    const result = []
    routeDate.forEach(item => {
      const permissionData = funtionailityData.find(item2 => item2.id === item.id)

      const functionailityData = permissionData ? permissionData.functionaility.map(item => item.code) : []
      if (permissionData) {


      }
      const temp = {
        id: item.id,
        name: item.name,
        path: item.path,
        component: item.component,
        meta: item.meta,
      }

      temp.meta.functionaility = functionailityData


      if (item.children && item.children.length > 0) {
        temp.children = []
        temp.children.push(...loop(item.children))
      }
      result.push(temp)
    })
    return result
  }
  return loop(routeData)
}



router.beforeEach(async (to, from, next) => {
  NProgress.start()
  // store.commit('app/updateBackRoute', to.path)
  console.log('to.path1+++++', to.path)
  // next()

  let userInfo = store.state.user.userInfo
  let pagePermissionData = null
  let rolePermissionData = null
  console.log('userInfo1+++++', userInfo)
  if (!userInfo || Object.keys(userInfo).length === 0) {
    if (to.path !== '/login' && to.path !== '/') {
      // 判断当前用户是否已拉取完user_info信息
      try {
        userInfo = await store.dispatch('getUserInfo')
        // pagePermissionData = await store.dispatch('permission/findIndexPermission')
        // rolePermissionData = await store.dispatch('permission/getCurrentUserPermission')

      } catch (error) {
        console.log(error)
        userInfo = null


      }

      console.log('userInfo2+++++++++', userInfo)
      console.log('pagePermissionData++++', pagePermissionData)
      console.log('rolePermissionData++++', rolePermissionData)


      if (userInfo) {

        // const parsedData = mainRoutes[0].children
        // let parsedData = assmbleRoute(pagePermissionData)

        // const funtionailityData = getFuntionailityData(rolePermissionData)
        // parsedData = dispatchPermissionToRoute(parsedData, funtionailityData)

        // console.log('funtionailityData routeDate+++++++++++++++++', funtionailityData)
        // console.log('parseRouteData++++++', parsedData)
        // mainRoutes[0].children = parsedData
        

        result = result.concat(mainRoutes)
        router.addRoutes(result) // 动态添加可访问路由表
        
        // next()
        next({
          ...to,
          replace: true
        }) // hack方法 确保addRoutes已完成

      } else {
        next()
        // next({
        //   ...to,
        //   replace: true
        // }) // hack方法 确保addRoutes已完成
      }

    } else {


      next()
    }
  } else {
    // store.commit('setLogin', true)
    // 
    
    // if (from.path === '/login') {
    //   location.reload()
    // } else {
    //   next()
    // }
    next()

  }

})

router.afterEach((to, from) => {
  console.log('finsh', to)
  NProgress.done()
})

router.onError(error => {


  console.log('router.onError', error)
})
