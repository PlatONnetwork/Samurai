/**
 * Created by zjw on 2017/5/26.
 */
import reg from '@/config/reg-config'
import inputInfo from '@/config/input-info-congif'

class formService {
  constructor() {
    this.userName = function(val){
      return this.check(reg.USERNAME, inputInfo.USERNAME, val)
    };
    this.phone = function(val){
      return this.check(reg.PHONE, inputInfo.PHONE, val)
    };
    this.email = function(val){
      return this.check(reg.EMAIL, inputInfo.EMAIL, val)
    };
    this.password = function(val){
      return this.check(reg.PASSWORD, inputInfo.PASSWORD, val)
    };
    this.psdAgain = function(val) {
      return this.check(null, inputInfo.PSDAGAIN, val)
    };
    this.company = function(val){
      return this.check(reg.COMPANY, inputInfo.COMPANY, val)
    };
    this.shorthand = function(val){
      return this.check(reg.SHORTHAND, inputInfo.SHORTHAND, val)
    };
    this.iName = function(val){
      return this.check(reg.NODENAME, inputInfo.NODENAME, val)
    };
    this.iDesc = function(val){
      return this.check(reg.NODEDISC, inputInfo.NODEDISC, val)
    };
    this.name = function(val){
      return this.check(reg.NAME, inputInfo.NAME, val)
    };
    this.code = function (val){
      return this.check(null, inputInfo.VCODE, val)
    };
    this.notEmpty = function(val){
      return this.check(reg.NOTEMPTY, inputInfo.NOTEMPTY, val)
    };
  }
  check(regular, info, val) {
    if (regular){
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
