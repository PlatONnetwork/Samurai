const contractList= resolve => require(['@/views/contract/list'], resolve)
const contractNew= resolve => require(['@/views/contract/new'], resolve)
const contractAdd= resolve => require(['@/views/contract/add'], resolve)
const contractDetail= resolve => require(['@/views/contract/detail'], resolve)

import store from '@/vuex/store';
const Contract= {
    list: {
        name: '合约',
        path: '/contract',
        component: contractList,
        meta: {
           flag: 'parent'
        }
    },
    newContract: {
        name: '部署合约',
        path: '/contract-new',
        component: contractNew,
        meta: {
            flag: 'child'
        }
    },
    add: {
        name: '观察合约',
        path: '/contract-add',
        component: contractAdd,
        meta: {
            flag: 'child'
        }
    },
    detail: {
        name: '合约详情',
        path: '/contract-detail',
        component: contractDetail,
        meta: {
            flag: 'child'
        }
    },

}


export default Contract
