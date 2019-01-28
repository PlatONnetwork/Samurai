const validatorNode= resolve => require(['@/views/application/validatorNode'], resolve)
const myNode= resolve => require(['@/views/application/myNode'], resolve)
const nodeApply= resolve => require(['@/views/application/nodeApply'], resolve)
const increaseStake= resolve => require(['@/views/application/increaseStake'], resolve)
const reduceStake= resolve => require(['@/views/application/reduceStake'], resolve)
const nodeDetail= resolve => require(['@/views/application/nodeDetail'], resolve)


import store from '@/vuex/store';
const application= {
    validatorNode: {
        name: '共识节点',
        path: '/validator-node',
        component: validatorNode,
        meta: {
           flag: 'parent'
        }
    },
    nodeDetail: {
        name: '节点详情',
        path: '/node-detail',
        component: nodeDetail,
        meta: {
            flag: 'child'
        }
    },
    myNode: {
        name: '我的共识节点',
        path: '/my-node',
        component: myNode,
        meta: {
            flag: 'child'
        }
    },
    nodeApply: {
        name: '共识节点注册',
        path: '/node-apply',
        component: nodeApply,
        meta: {
            flag: 'child'
        }
    },
    increaseStake: {
        name: '增加质押',
        path: '/increase-stake',
        component: increaseStake,
        meta: {
            flag: 'child'
        }
    },
    reduceStake: {
        name: '减持质押',
        path: '/reduce-stake',
        component: reduceStake,
        meta: {
            flag: 'child'
        }
    },

}


export default application
