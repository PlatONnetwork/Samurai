import { voteAction } from './action'
import { voteGetter } from './getter'
import { voteMutation } from './mutation'
export default {
  state:{
    nodeName:''
  },
  actions:voteAction,
  getters:voteGetter,
  mutations:voteMutation
}
