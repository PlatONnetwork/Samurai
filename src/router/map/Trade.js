const TradeList= resolve => require(['@/views/trade/trade-list'], resolve)
const TradeDetail= resolve => require(['@/views/trade/trade-detail'], resolve)

const Trade= {
    TradeList: {
        name: '交易',
        path: '/trade-list',
        component: TradeList,
        meta: {
            flag: 'parent'
        }
    },
    TradeDetail: {
        name: '交易详情',
        path: '/trade-detail',
        component: TradeDetail,
        meta: {
            flag: 'child'
        }
    }

}

export default Trade
