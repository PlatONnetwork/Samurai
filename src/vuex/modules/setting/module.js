/**
 * Created by 15236 on 2017/5/24.
 */
import { settingAction } from './action'
import { settingGetter } from './getter'
import { settingMutation } from './mutation'
export default {
  state:{
      appVersion:'',
      rpcMode:'ipc',
      initialUse:true,   //bool 标识是否配置过网络  true首次使用 false已配置过网络
      network:{
          type:null,  //string  节点类型 'main':主网络;'test':测试网络,'custom':'私有网络'
          ip:null,    //string  ip
          port:null,  //string  端口
      },
      nodeState:0,   //节点状态（0未连接  1私有链创建成功  2节点启动成功，已连接）
      lang:window.localStorage.getItem('user_lang')?window.localStorage.getItem('user_lang'):'zh-cn',
      netLoading:false,   //网络切换过程过渡效果展示
      chainName:'',
      isMax:true

  },
  actions:settingAction,
  getters:settingGetter,
  mutations:settingMutation
}
