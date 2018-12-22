export const WalletGetter = {
    WalletListGetter(state){
        return state.walletList
    },
    curWallet(state){
        return state.curWallet
    },
    walletType(state){
        return state.walletType
    },
    pageLoading(state){
        return state.pageLoading
    },
    totalBalance(state){
        return state.totalBalance
    },
    nortotalBalance(state){
        return state.norTotalBalance
    }
}
