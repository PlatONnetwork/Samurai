/**
 * Created by 15236 on 2017/5/24.
 */
import Settings from '@/services/setting'
export const contractMutation = {
    ['UPDATE_CONTRACT_LIST'](state,data){
        state.contractList = data;
    }
};
