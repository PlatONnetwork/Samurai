import Vue from 'vue'

//全局过滤器
// 注册
export default Vue.filter('PathName', function(value) {
    switch(value){
        case '普通钱包':
            return window.vueVm.$i18n.t('wallet.walletTitle');
            break;
        case '创建普通钱包':
            return window.vueVm.$i18n.t('wallet.createIndividualWallet');
            break;
        case '创建共享钱包':
            return window.vueVm.$i18n.t('wallet.createSharedWallet');
            break;
        case '添加共享钱包':
            return window.vueVm.$i18n.t('wallet.AddSharedWallet');
            break;
        case '导入普通钱包':
            return window.vueVm.$i18n.t('wallet.importIndividualWallet');
            break;
        case '发送资产':
            return window.vueVm.$i18n.t('wallet.sendFunds');
            break;
        case '接收':
            return window.vueVm.$i18n.t('wallet.accept');
            break;
        case '交易':
            return window.vueVm.$i18n.t('sideBar.trade');
            break;
        case '交易详情':
            return window.vueVm.$i18n.t('sideBar.tradeInfor');
            break;
        case '设置':
            return window.vueVm.$i18n.t('sideBar.setting');
            break;
        case '合约':
            return window.vueVm.$i18n.t('contracts.contracts');
            break;
        case '合约详情':
            return window.vueVm.$i18n.t('contracts.contractsInfor');
            break;
        case '部署合约':
            return window.vueVm.$i18n.t('contracts.deployCont');
            break;
        case '观察合约':
            return window.vueVm.$i18n.t('contracts.addWatchCont');
            break;
        case '竞选节点':
            return window.vueVm.$i18n.t('application.validatorNode');
            break;
        case '我的竞选节点':
            return window.vueVm.$i18n.t('application.myValidatorNode');
            break;
        case '节点竞选申请':
            return window.vueVm.$i18n.t('application.apply'); 
            break;
        case '增加质押':
            return window.vueVm.$i18n.t('application.increase'); 
            break;
        case '减持质押':
            return window.vueVm.$i18n.t('application.reduce'); 
            break;
        default:
            return value;
    }
})
