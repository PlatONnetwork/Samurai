const validatorNode= resolve => require(['@/views/application/validatorNode'], resolve)
const myNode= resolve => require(['@/views/application/myNode'], resolve)
const nodeApply= resolve => require(['@/views/application/nodeApply'], resolve)
const increaseStake= resolve => require(['@/views/application/increaseStake'], resolve)
const reduceStake= resolve => require(['@/views/application/reduceStake'], resolve)
const nodeDetail= resolve => require(['@/views/application/nodeDetail'], resolve)
const vote= resolve => require(['@/views/application/vote'], resolve)
const myVote= resolve => require(['@/views/application/myVote'], resolve)


import store from '@/vuex/store';
const application= {
    validatorNode: {
        name: '竞选节点',
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
        name: '我的竞选节点',
        path: '/my-node',
        component: myNode,
        meta: {
            flag: 'child'
        }
    },
    nodeApply: {
        name: '节点竞选申请',
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
    vote: {
        name: '投票确认',
        path: '/vote',
        component: vote,
        meta: {
            flag: 'child'
        }
    },
    myVote: {
        name: '我的投票',
        path: '/my-vote',
        component: myVote,
        meta: {
            flag: 'child'
        }
    },

}


export default application
