/**
 * Created by 15236 on 2017/5/24.
 */
import {contractAction } from './action'
import {contractGetter } from './getter'
import {contractMutation } from './mutation'
export default {
  state:{
      contractList:[],
      contrachHash:{}
  },
  actions:contractAction,
  getters:contractGetter,
  mutations:contractMutation
}
