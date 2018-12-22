/**
 * Created by zjw on 2017/5/26.
 */
import reg from '@/config/reg-config'

console.log(window.vueVm.$i18n.t('form.USERNAME'))
class formService {
  constructor() {
    this.userName = function(val){
      return this.check(reg.USERNAME, window.vueVm.$i18n.t('form.nonRepPsw'), val)
    };
    
    this.nonRepPsw = function(val){
      return this.check(reg.USERNAME, window.vueVm.$i18n.t('form.nonRepPsw'), val)
    };
    this.ip = function(val){
       return this.check(reg.IP, window.vueVm.$i18n.t('form.IPW'), val)
    };
    this.phone = function(val){
      return this.check(reg.PHONE, window.vueVm.$i18n.t('form.phoneInvalid'), val)
    };
    this.phoneInvalid = function(val){
      return this.check(reg.PHONE, window.vueVm.$i18n.t('form.phoneInvalid'), val)
    };
    this.email = function(val){
      return this.check(reg.EMAIL, window.vueVm.$i18n.t('form.EMAIL'), val)
    };
    this.password = function(val){
      return this.check(reg.PASSWORD, window.vueVm.$i18n.t('form.nonRepPsw'), val)
    };
    this.anti = function(val){
          return this.check(reg.ANTI, window.vueVm.$i18n.t('form.ANTI'), val)
    };
    //检查资金密码
    this.fundPassword = function(val) {
      return this.check(reg.FUND_PSDAGAIN, window.vueVm.$i18n.t('form.FUND_PSDAGAIN'), val)
    };
    this.psdAgain = function(val) {
      return this.check(null, window.vueVm.$i18n.t('form.PSDAGAIN'), val)
    };
    this.company = function(val){
      return this.check(reg.COMPANY, window.vueVm.$i18n.t('form.COMPANY'), val)
    };
    this.shorthand = function(val){
      return this.check(reg.SHORTHAND, window.vueVm.$i18n.t('form.SHORTHAND'), val)
    };
    this.iName = function(val){
      return this.check(reg.NODENAME, window.vueVm.$i18n.t('form.NODENAME'), val)
    };
    this.iDesc = function(val){
      return this.check(reg.NODEDISC, window.vueVm.$i18n.t('form.NODEDISC'), val)
    };
    this.name = function(val){
      return this.check(reg.NAME, window.vueVm.$i18n.t('form.NAME'), val)
    };
    this.code = function (val){
      return this.check(null, window.vueVm.$i18n.t('form.VCODE'), val)
    };
    this.notEmpty = function(val){
      return this.check(reg.NOTEMPTY, window.vueVm.$i18n.t('form.nonRepPsw'), val)
    };
  }
  check(regular, info, val) {
    if (regular){
      if(!val){
        return {code:1, msg: info};
      }
      const b = regular.test(val);
      let msg = b ? {code: 0, msg:""}: {code:1, msg: info} ;
      return msg;
    }else {
      return {
        code :2 ,
        msg: info
      }
    }
  }
}


//导出一个对象
export default new formService();
