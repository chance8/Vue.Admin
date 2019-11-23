import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 20000 // request timeout
})

var storeTemp = store
// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    var curTime = new Date()
    console.log(store.getters.sidebarLogo)
    // var expireTime = new Date(Date.parse(storeTemp.state.tokenExpire))
    // if (storeTemp.state.token && (curTime < expireTime && storeTemp.state.tokenExpire)) {
    //   // 判断是否存在token，如果存在的话，则每个http header都加上token
    //   config.headers.Authorization = "Bearer " + storeTemp.state.token;
    // }
    if (store.getters.token) {
      config.headers.Authorization = 'Bearer ' + getToken()
      config.headers['X-Token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    console.log(response)
    const res = response.data

    // if the custom code is not 20000, it is judged as an error.
    if (res.success !== true) {
      Message({
        message: res.message || '服务器返回错误',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.Status === 401) {
        // to re-login
        MessageBox.confirm('您未登录，您可以取消以停留在此页，或重新登录', 'Confirm logout', {
          confirmButtonText: '登录',
          cancelButtonText: '关闭',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || '服务器返回错误'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
