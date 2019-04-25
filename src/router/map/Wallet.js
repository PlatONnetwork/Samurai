const OWallet= resolve => require(['@/views/wallet/list'], resolve)
const OWalletNew= resolve => require(['@/views/wallet/ord/new'], resolve)
const OWalletImport = resolve => require(['@/views/wallet/ord/import'], resolve)
const OWalletDetails = resolve => require(['@/views/wallet/ord/details'], resolve)
const OWalletSend = resolve => require(['@/views/wallet/send-transcation'], resolve)
const OWalletAccept = resolve => require(['@/views/wallet/accept-transcation'], resolve)
const OWalletShareNew = resolve => require(['@/views/wallet/share/new'], resolve)
const OWalletShareJoin = resolve => require(['@/views/wallet/share/join'], resolve)
const OWalletShareDetail = resolve => require(['@/views/wallet/share/details'], resolve)
import store from '@/vuex/store';
const Wallet= {
    OWallet: {
        name: '普通钱包',
        path: '/o-wallet-list',
        component: OWallet,
        meta: {
           flag: 'parent'
        }
    },
    OWalletNew: {
        name: '创建普通钱包',
        path: '/o-wallet-new',
        component: OWalletNew,
        meta: {
           flag: 'child'
        },
    },
    OWalletImport: {
        name: '导入普通钱包',
        path: '/o-wallet-import',
        component: OWalletImport,
        meta: {
            flag: 'child'
        },
    },
    OWalletDetails: {
        name: '详情',
        path: '/o-wallet-details',
        component: OWalletDetails,
        meta: {
            flag: 'child'
        },
    },
    OWalletSend: {
        name: '发送资产',
        path: '/o-wallet-send',
        component: OWalletSend,
        meta: {
        }
    },
    OWalletAccept: {
        name: '接收',
        path: '/o-wallet-accept',
        component: OWalletAccept,
        meta: {
            flag: 'child'
        }
    },
    OWalletShareNew: {
        name: '创建共享钱包',
        path: '/o-wallet-new-share',
        component: OWalletShareNew,
        meta: {
            flag: 'child'
        },
    },
    OWalletShareJoin: {
        name: '添加共享钱包',
        path: '/o-wallet-share-join',
        component: OWalletShareJoin,
        meta: {
            flag: 'child'
        },
    },
    OWalletShareDetail:{
        name: '共享钱包详情',
        path: '/o-wallet-share-detail',
        component: OWalletShareDetail,
        meta: {
            flag: 'child'
        },
    }
}


export default Wallet
