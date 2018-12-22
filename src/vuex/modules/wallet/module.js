import {WalletAction} from './action'
import {WalletGetter} from './getter'
import {WalletMutation} from './mutation'
export default {
    state: {
        walletList:[],  //普通钱包列表
        walletType:1,  //钱包类型:1-普通钱包 2-共享钱包
        curWallet:'',
        pageLoading:false,
        totalBalance:0,
        norTotalBalance:0
    },
    actions:WalletAction,
    getters: WalletGetter,
    mutations:WalletMutation
}
