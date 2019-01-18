import { appAction } from './action'
import { appGetter } from './getter'
import { appMutation } from './mutation'
export default {
  state:{
    info:{},
    joinNode:null  
  },
  actions:appAction,
  getters:appGetter,
  mutations:appMutation
}
