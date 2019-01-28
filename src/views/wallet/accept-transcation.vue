<template>
    <div class="accept-transcation format-style">
        <div class="accept card">
            <p class="pt-20 mb-8">{{$t("wallet.QRCode")}}</p>
            <div class="qr">
                <qriously  v-if="wallet.address" :value="wallet.address" :size="120" />
            </div>
            <p class="mb-8">{{$t("wallet.walletAddress")}}</p>
            <p class="mb-16 f12">{{wallet.address}}</p>
            <p class="mb-8" v-if="!wallet.type">{{$t("wallet.walletpubKey")}}</p>
            <p class="f12 pub" v-if="!wallet.type">{{wallet.publicKey}}</p>
        </div>

    </div>

</template>

<script>
    // import VueQr from 'vue-qr';
    import keyManager from '@/services/key-manager';
    import {mapGetters, mapActions} from 'vuex';

    export default {
        name: "o-wallet-accept-transcation",
        components: {
            // VueQr
        },
        data(){
            return{
               wallet: {
                   address: '',
                   pubKey: ''
               },
                publicKey:null
            }
        },
        created(){
            this.WalletListAction(this.network.type);
        },
        mounted(){
            this.init();
        },
        computed:{
            ...mapGetters(['WalletListGetter','curWallet','network'])
        },
        methods:{
            ...mapActions(['WalletListAction']),
            init(){
                let _this = this;
                let curWalletArr = this.WalletListGetter.filter((item)=>{
                    return item.address == _this.curWallet;
                });
                if(curWalletArr.length>0){
                    _this.wallet = curWalletArr[0];
                }
            }
        },
        watch:{
            'curWallet':function(){
                this.init();
            }
        }
    }
</script>

<style lang="less" scoped>
    .accept{
        height: 560px;
        padding-top: 20px;
        >p{
            width: 80%;
            padding-left: 20px;
        }
        .mb-16{
            margin-bottom: 16px;
        }
        .mb-8{
            margin-bottom: 8px;
        }
        .qr{
            margin-bottom:16px;
            margin-left: 20px;
        }
        .pub{
            width:740px;
            word-break: break-all;
        }
    }

</style>
