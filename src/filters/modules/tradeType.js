import Vue from 'vue'

//全局过滤器
// 注册
export default Vue.filter('tradeType', function(value,state) {
    switch(value){
        case 'transfer':   //发送交易
            return state==0?window.vueVm.$i18n.t('trade.sending'):window.vueVm.$i18n.t('trade.sent');
            break;
        case 'contractCreate':    //部署合约
            return window.vueVm.$i18n.t('trade.contractCreation');
            break;
        case 'contractExecution':   //合约执行
            return window.vueVm.$i18n.t('trade.contractExecution');
            break;
        case 'createJointWallet':   //创建联名钱包
            return window.vueVm.$i18n.t('wallet.createSharedWallet');
            break;
        case 'jointWalletExecution':  //执行联名钱包
            return window.vueVm.$i18n.t('trade.jointWalletExecution');
            break;
        case 'createValidator': //注册共识节点
            return window.vueVm.$i18n.t('trade.createValidator');
            break;
        case 'increaseStake':  //增加质押
            return window.vueVm.$i18n.t('trade.increaseStake');
            break;
        case 'reduceStake':  //减持质押
        case 'quitStake':   //退出竞选
            return window.vueVm.$i18n.t('trade.reduceStake');
            break;
        case 'redeemStake':
            //提取质押
            return window.vueVm.$i18n.t('trade.redeemStake');
            break;
        case 'vote':
            //投票
            return state==1?window.vueVm.$i18n.t('vote.toVote'):window.vueVm.$i18n.t('vote.voting');
            break;
    }
})
