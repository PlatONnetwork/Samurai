import Vue from 'vue'
import Vuex from 'vuex'
import setting from './modules/setting/module.js'
import wallet from './modules/wallet/module.js'
import trade from './modules/trade/module.js'
import contract from './modules/contract/module.js'

Vue.use(Vuex);

// 应用初始状态
const state = {

};

// 定义所需的 mutations
const mutations = {

};

// 创建 store 实例
export default new Vuex.Store({
	modules: {
        setting,
		wallet,
        trade,
        contract
	},
	state
})

