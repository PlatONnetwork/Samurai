<template>
    <div class="trade-list format-style new-list">
        <div class="trade-header">
            <span :class="[lang=='en'?'sel-en':'','wallet-sel']">
                <sel-self :optionVs="wallets" :defaultSel="wallet" @back="selAWallet"></sel-self>
            </span>
            <!-- <el-select v-model="type" @change="selType">
                <el-option value="" :label="$t('trade.allTypes')">{{$t("trade.allTypes")}}</el-option>
                <el-option
                        v-for="item in types"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                </el-option>
            </el-select> -->
        </div>
        <div class="trade-con">
            <tradeList-component ref="child1" :pageNum="pageSize" :type="type" pageFrom="tradeList"></tradeList-component>
        </div>
    </div>
</template>

<script>
    import contractService from '@/services/contract-servies';
    import {mapGetters, mapActions} from 'vuex';
    import mathService from '@/services/math';
    import tradeListComponent from '@/components/trade/list';
    import selSelf from '@/components/select';

    export default {
        name: "trade-list",
        data() {
            return{
                tradeList: [],
                tradeListAll:[],
                wallet:'',
                type:'',
                wallets:[],
                numIndex:1,
                showLoadMore:true,
                shareTradeList:[],
                pageSize:20
            }
        },
        computed:{
            ...mapGetters(['network', 'WalletListGetter','curWallet','tradeType','lang']),
            types(){
                return [{
                    value:'transfer',
                    label:this.$t('trade.sent')
                },{
                    value:'contractCreate',
                    label:this.$t('trade.contractCreation')
                },{
                    value:'contractExecution',
                    label:this.$t('trade.contractExecution')
                },{
                    value:'mpc',
                    label:this.$t('trade.mpc')
                },{
                    value:'other',
                    label:this.$t('trade.others')
                }]
            }
        },
        mounted(){
            this.wallet = this.curWallet;
            this.type = this.tradeType?this.tradeType:'';
            this.getAllWallets().then((allWallets)=>{
                this.wallets = [{
                    address:'',
                    account:this.$t('wallet.allWallet')
                }].concat(allWallets);
            });
        },
        methods:{
            ...mapActions(['getTradeList','getShare','getAllWallets','updateCurWallet','updateWalletType','updateTradeType']),
            selAWallet(data){
                this.wallet = data.address;
                this.updateCurWallet(data.address);
                if(data.type && data.type=='share'){
                    this.updateWalletType(2);
                }else{
                    this.updateWalletType(1);
                }
            },
            selType(){
                this.updateTradeType(this.type);
            }
        },
        filters:{
            'month':function (time) {
                return new Date(time).getMonth()+1;
            },
            'date':function (time) {
                return new Date(time).getDate();
            },
            'div':function(num){
                return mathService.div(num,1000000000000000000)
            }
        },
        watch:{
            curWallet:function(val,old){
               this.wallet = val;
            }
        },
        components:{
            tradeListComponent,
            selSelf
        },
        beforeDestroy() {
            clearInterval(window.tradeTimer);
            window.tradeTimer = null;
        },
        destroyed() {
            clearInterval(window.tradeTimer);
            window.tradeTimer = null;
        },
    }
</script>

<style lang="less" scoped>
    .trade-list{
        .trade-header{
            display: flex;
            p{
                height: 50px;
                line-height: 50px;
                font-size: 16px;
               margin-right: 15px;
            }
            .el-select{
                margin-right:30px;
            }
        }
        .more{
            margin-top:17px;
            text-align: center;
            font-size: 12px;
            color: #9EABBE;
            cursor:pointer;
        }
        .trade-con{
            width:100%;
            height: calc(~"100% - 36px");
            overflow-y: auto;
            overflow-x: hidden;
        }
        .wallet-sel{
            padding-left:6px;
            margin-top: 1px;
        }
    }
    .new-list{
        margin-top: -74px;
        .trade-header{
            display: block;
            .wallet-sel{
                float: left;
                margin-left: -38px;
            }
        }
    }
    .new-list{
        .trade-header{
            .sel-en{
                margin-left: -94px;
            }
        }
    }

</style>
<style lang="less">
    .trade-list{
        .el-select{
            width:115px;
            .el-input{
                width:115px;
            }
            .el-input__inner{
                padding-right: 30px;
                font-size: 16px;
                color: #24272B;
                font-weight:600;
                letter-spacing: 0.5px;
                border:none;
                background-color: transparent;
            }
        }
        .no-data{
            margin-top:150px;
            font-size: 12px;
            color: #9EABBE;
            text-align: center;
        }
    }

</style>
