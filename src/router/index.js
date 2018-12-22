import Vue from 'vue'
import Router from 'vue-router'

import Index from './map/Index'
import customNet from './map/customNet'
import Home from './map/Home'


//重定向 放最后面
import Redirect from './map/Redirect'

Vue.use(Router)

export default new Router({
    routes: [
        Index, //首页模块
        Home,
        customNet,
        /*{
            path: '/',
            name: 'landing-page',
            component: require('@/components/LandingPage')
        },*/
        Redirect, //路由重定向(访问不存在的页面时，重定向到这个页面) 放最后面
    ]
})
