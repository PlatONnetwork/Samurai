import contractService from '@/services/contract-servies';

export const voteGetter = {
    voteContractAddress(state){
        return contractService.voteContractAddress
    },
    nodeName(state){
        return state.nodeName
    }
};
