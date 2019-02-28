import routeObj from './Wallet'
const Home = reserved => require(['@/views/home/home'], reserved);
const Setting = reserved => require(['@/views/set/setting'], reserved);
const coin = reserved => require(['@/views/set/coin'], reserved);
import Wallet from './Wallet'
import Trade from './Trade'
import Contract from './Contract'
import Application from './application'
export default {
    path: '/home',
    name: 'home',
    component: Home,
    redirect: '/o-wallet-list',
    children: [
        {
            path: '/setting', //设置
            name: '设置',
            component: Setting
        },
        {
            path: '/coin', //设置
            name: '申请测试币',
            component: coin
        },
        Wallet.OWallet,
        Wallet.OWalletNew,
        Wallet.OWalletShareNew,
        Wallet.OWalletShareJoin,
        Wallet.OWalletImport,
        Wallet.OWalletDetails,
        Wallet.OWalletShareDetail,
        Wallet.OWalletSend,
        Wallet.OWalletAccept,
        Trade.TradeList,
        Trade.TradeDetail,
        Contract.list,
        Contract.newContract,
        Contract.add,
        Contract.detail,
        Application.validatorNode,
        Application.myNode,
        Application.nodeApply,
        Application.nodeDetail,
        Application.increaseStake,
        Application.reduceStake,
        Application.vote,
        Application.myVote
    ]
}
