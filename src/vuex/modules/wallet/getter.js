export const WalletGetter = {
    WalletListGetter(state){
        return state.walletList
    },
    shareWalletList(state){
        return state.shareWalletList
    },
    allWalletList(state) {
        return [...state.walletList,...state.shareWalletList];
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
    },
    initParams(state){
        return state.initParams
    },
    norTotalBalance(state){
        return state.norTotalBalance
    }
}
