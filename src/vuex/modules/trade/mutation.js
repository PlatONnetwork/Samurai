export const tradeMutation = {
    ['UPDATE_WALLET_LIST'](state, data){
        state.walletList.concat(data)
    }
}
