import contractService from '@/services/contract-servies';

export const appGetter = {
  getUserInfo (state) {
    return state.info
  },
  joinNode(state){
    return state.joinNode
  },
  contractAddress(state){
    return contractService.appContractAddress
  }

};
