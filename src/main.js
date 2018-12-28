//js
import Vue from 'vue'
import router from './router'
import ElementUI from 'element-ui'
import store from './vuex/store'
import filters from './filters/index.js'
import VueClipboard from 'vue-clipboard2'
Vue.use(VueClipboard);
import VueQriously from 'vue-qriously'
Vue.use(VueQriously)
import VueI18n from 'vue-i18n'//多语言
import messages from '@/lang/index'
Vue.use(VueI18n);
//css
import '../static/css/reset.css'
import '../static/css/element-ui.css'
//import '../static/css/iconfont.css'

//less
import "./less/index.less"

Vue.use(ElementUI);


if (!process.env.IS_WEB){
    Vue.use(require('vue-electron'));
}
//Vue.config.silent = true;
Vue.config.productionTip = false
const browserLang = (navigator.language || navigator.browserLanguage).toLowerCase();
const browserLanguage = browserLang.indexOf('en')=='-1'?'zh-cn':'en';
const localLang = window.localStorage.getItem('user_lang')?window.localStorage.getItem('user_lang'):browserLanguage
console.warn('browserLanguage',browserLanguage);
const i18n = new VueI18n({
    //定义默认语言
    locale: localLang,
    // locale:'en',//deve
    messages,
})
/* eslint-disable no-new */
window.vueVm = new Vue({
  el: '#app',
  router,
  i18n,
  store
});
