import {tradeAction} from './action'
import {tradeGetter} from './getter'
import {tradeMutation} from './mutation'
export default {
    state: {
        walletList: [],
        tradeType:null
    },
    actions:tradeAction,
    getters: tradeGetter,
    mutations:tradeMutation



}
