/**
 * Created by 15236 on 2017/5/24.
 */
export const settingGetter = {
    initialUse(state){
      return state.initialUse;
    },
    network(state){
      return state.network
    },
    nodeState(state){
        return state.nodeState
    },
    lang(state){
        return state.lang
    },
    netLoading(state){
        return state.netLoading
    },
    chainName(state){
        return state.chainName
    },
    isMaximized(state){
        return state.isMax
    },
    testMode(state){
        return state.testMode
    }
};
