import service from '@/utils/request'
import router from '../../router/router'

import {
  constantRoutes,
  errorRoutes
} from '@/router/router'
import {
  getRouters
} from '@/api/menu'
import Layout from '@/layout/index'
// import InnerLayout from '@/views/InnerLayout'
import InnerLayoutMobile from '@/views/InnerLayoutMobile'

const state = {
  routes: [{
    "name": "orderMobile",
    "path": "",
    redirect:'/orderMobile/loginMobile',
    component: InnerLayoutMobile,
    // "alwaysShow": true,
    configurable: false,
    "meta": {
      "title": "移动端订单管理",
      "icon": "gear",
      functionaility: []
    },
    children: [{
    //   "name": "loginMobile",
    //   "path": "/loginMobile",
    //   component: () => import("@/views/orderMobile/loginMobile.vue"),
    //   configurable: false,
    //   // hidden: true,
    //   "meta": {
    //     "title": "移动端登录",
    //     "icon": "gear",
    //     functionaility: []
    //   },
    // }, {

      "name": "createOrderMobile",
      "path": "/createOrderMobile",
      component: () => import("@/views/orderMobile/createOrderMobile.vue"),
      configurable: false,
      // hidden: true,
      "meta": {
        "title": "移动端创建订单",
        "icon": "gear",
        functionaility: []
      },
    }, {

      "name": "showQRCodeMobile",
      "path": "/showQRCodeMobile",
      component: () => import("@/views/orderMobile/showQRCodeMobile.vue"),
      configurable: false,
      // hidden: true,
      "meta": {
        "title": "移动端显示二维码",
        "icon": "gear",
        functionaility: []
      },
    }, {

      "name": "congratulationMobile",
      "path": "/congratulationMobile",
      component: () => import("@/views/orderMobile/congratulationMobile.vue"),
      configurable: false,
      // hidden: true,
      "meta": {
        "title": "订单列表（商户）",
        "icon": "gear",
        functionaility: []
      },
    }]

  }],
  rolePermission: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  },
  setFunctionaility: (state, payload) => {
    state.functionaility = payload
  },
  setRolePermission: (state, payload) => {

    state.rolePermission = payload
  },
  appendRoute: (state, payload) => {
    state.routes.push(...payload)
  }

}

const actions = {
  findIndexPermission({ commit, state }, params) {
    return new Promise((resolve, reject) => {
      service.post('/manager/permission/findIndexPermission', {}).then(response => {
        response = response.data

        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  getCurrentUserPermission({ commit, state, dispatch, rootState }, params = {}) {
    return new Promise((resolve, reject) => {
      if (state.rolePermission.length > 0) {
        resolve(state.rolePermission)
      } else {
        const params = {
          id: rootState.user.userInfo.role.id
        }
        dispatch('findRolePermission', params).then(response => {
          commit('setRolePermission', response)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      }

    })
  },
  findRolePermission({ commit, state }, params) {
    return new Promise((resolve, reject) => {
      console.log('findRolePermission++++++', params)
      service.post('/manager/permission/findRolePermission', params).then(response => {
        response = response.data
        const avatar = !response.avatar || response.avatar === '' ? require("@/image/access/profile.jpg") : process.env.VUE_APP_BASE_API + user.avatar;

        // commit('setRolePermission', response)
        resolve(response)
      }).catch(error => {
        reject(error)
      })

    })
  },
  // 生成路由
  GenerateRoutes({
    commit
  }) {
    return new Promise(resolve => {
      // 向后端请求路由数据
      getRouters().then(res => {
        const accessedRoutes = filterAsyncRouter(res.data)
        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
      })
    })
  },
  appendRoute({
    commit
  }, params) {
    return new Promise(resolve => {
      commit('appendRoute', params)

      router.addRoutes(result)
    })
  },
}


// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap) {
  return asyncRouterMap.filter(route => {
    if (route.component) {
      // Layout组件特殊处理
      if (route.component === 'Layout') {
        route.component = Layout
      } else {
        route.component = loadView(route.component)
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children)
    }
    return true
  })
}

export const loadView = (view) => { // 路由懒加载
  return () => import(`@/views/${view}`)
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}


