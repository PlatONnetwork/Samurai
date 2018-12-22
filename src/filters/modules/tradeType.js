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
    }
})
