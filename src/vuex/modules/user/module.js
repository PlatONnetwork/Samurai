/**
 * Created by 15236 on 2017/5/24.
 */
import { userAction } from './action'
import { userGetter } from './getter'
import { userMutation } from './mutation'
export default {
  state:{
    info:{

    }
  },
  actions:userAction,
  getters:userGetter,
  mutations:userMutation
}
