import Vue from 'vue'

//全局过滤器
// 注册
export default Vue.filter('tradeType', function(value) {
    switch(value){
        case 'transfer':
            return window.vueVm.$i18n.t('trade.sent');
            break;
        case 'contractCreate':
            return window.vueVm.$i18n.t('trade.contractCreation');
            break;
        case 'contractExecution':
            return window.vueVm.$i18n.t('trade.contractExecution');
            break;
        case 'createJointWallet':
            return window.vueVm.$i18n.t('wallet.createSharedWallet');
            break;
        case 'jointWalletExecution':
            return window.vueVm.$i18n.t('trade.jointWalletExecution');
            break;
        case 'createValidator':  
            return window.vueVm.$i18n.t('trade.createValidator');
            break;
        case 'increaseStake':
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
    }
})
