/**
 * Created by 15236 on 2017/5/24.
 */
import Settings from '@/services/setting'
export const settingMutation = {
    ['UPDATE_NET_SETTING'](state, obj) {
       state.initialUse = obj.initialUse;
       if(!obj.initialUse){
           state.network=obj.network;
       }else{
           state.network={
               type:null,  //string  节点类型 'main':主网络;'test':测试网络,'custom':'私有网络'
               ip:null,    //string  ip
               port:null,  //string  端口
           }
       }
    },
    ['CHANGE_LANG'](state, lang) {
        state.lang=lang
    },
    ['CHANGE_WINDOW'](state, isMax) {
        state.isMax=isMax
    }
};
