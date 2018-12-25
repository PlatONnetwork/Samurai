<template>
    <div class="contract-list format-style">
        <div :class="[contractList&&contractList.length>0?'':'non-wallet','card content']">
            <div class="contract-item"
                 v-for="(item, index) in contractList"
                 :key="item.address"
                 @click="goToDetail(item)">
                <div class="contract-icon" :class="item.icon"></div>
                <div class="info">
                    <p>{{item.name | sliceName}}</p>
                    <p class="i-wallet"> <span class="font14">{{item.balance}}</span> <span class="font10">Energon</span></p>
                    <div class="addr-box">
                        <p class="addr i-address f12 ">
                            {{item.address}}
                        </p>
                    </div>
                </div>
            </div>
            <div :class="[lang=='en'?'font10':'','add-bottom']">
                <el-button class="f12 w-80" @click="newContract">{{$t("contracts.deployCont")}}</el-button>
                <el-button class="f12 w-80 ml-40" @click="addContract" type="primary">{{$t("contracts.watchCont")}}</el-button>
            </div>
            <div class="empty"></div>
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex'
    import contractService from '@/services/contract-servies';
    export default {
        name: 'contractList',
        data () {
            return {
                contractList:[],
                OrdList:[],

            }
        },
        computed: {
            ...mapGetters(['contractListGetter','nodeState','lang','WalletListGetter','totalBalance','nortotalBalance'])
        },
        mounted(){
            this.contractListAction().then(()=>{
                this.init();
            });
        },
        methods: {
            ...mapActions(['contractListAction','getOrd','getNormalTotalBalance']),
            init(){
                this.contractList = this.contractListGetter;
                this.getNormalTotalBalance()
                if(this.contractList){
                    this.contractList.map((item)=>{
                        !item.icon && (item.icon='contract-icon'+Math.floor((Math.random()*5)+1))
                    });
                    this.getBalance();
                }
                clearInterval(window.contractBalanceTasksTimer);
                window.contractBalanceTasksTimer = setInterval(this.getBalance,5*1000);
            },
            getBalance(){
                let _this = this;
                if(this.contractList){
                    this.contractList.forEach((item,index)=>{
                        contractService.web3.eth.getBalance(item.address,(err,data)=>{
                            if(err){
                                clearInterval(window.contractBalanceTasksTimer);
                                return;
                            }
                            let balance=contractService.web3.fromWei(data.toString(10), 'ether');
                            // item.balance = (Math.floor(Number(balance) * 100) / 100).toFixed(2);
                            // balance = contractService.web3.toWei(balance)
                            item.balance = (Math.floor(Number(balance) * 100) / 100)
                            _this.$set(_this.contractList,index,item)
                        });
                    });
                }
            },
            newContract(){
                this.getOrd().then((data)=>{
                    if(data.length == 0){
                        this.$message.error(this.$t('contracts.walletEmpty'))
                    }else if(this.nortotalBalance == 0){
                        this.$message.error(this.$t('contracts.balanceEmpty'))
                    }else{
                        this.$router.push('/contract-new')
                    }
                })
            },
            addContract(){
                this.$router.push('/contract-add')
            },
            goToDetail(contract){
                this.$router.push({
                    path:'/contract-detail',
                    query:contract
                })
            }
        },
        watch:{
            '$router':function(val,old){
                this.contractListAction().then(()=>{
                    this.init();
                });
            },
            'nodeState':function(val,old){
                if(old!=2 && val==2){
                    this.contractListAction().then(()=>{
                        this.init();
                    });
                }
            }
        },
        filters:{
            sliceName(name){
                if(name.length>12){
                    return name.slice(0,12)+'...'
                }else{
                    return name;
                }
            }
        },
    }
</script>

<style lang="less" scoped>
    .content{
        // padding-top:20px;
        // height:100%;
        height: calc(~"100% - 66px");
        overflow-y: auto;
        margin: 10px auto 0px;
        padding: 20px 15px 0 15px;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        align-content: flex-start;
        .contract-item{
            // width: 230px;
            width: 32%;
            // height: 130px;
            height: 25%;
            // margin-left: 15px;
            margin-bottom: 20px;
            background: url("./images/icon_contract_list.svg") no-repeat left top #FFFFFF;
            box-shadow: 0 4px 6px 0 rgba(48,48,77,0.05), 0 2px 4px 0 rgba(148,148,197,0.05);
            border: 1px solid transparent;
            border-radius: 4px;
            display: flex;
            &:hover{
                    border: 1px solid #00B6DC;
                }
            .contract-icon{
                width: 68px;
                height: 130px;
                background:url("./images/Oval1.png") no-repeat center center;
                // background: no-repeat center center;
                background-repeat:no-repeat;
                background-position: center center;
            }
            .contract-icon1{
                background-image: url('./images/Oval1.png');
            }
            .contract-icon2{
                background-image: url('./images/Oval2.png');
            }
            .contract-icon3{
                background-image: url('./images/Oval3.png');
            }
            .contract-icon4{
                background-image: url('./images/Oval4.png');
            }
            .contract-icon5{
                background-image: url('./images/Oval5.png');
            }
            .info{
                width: 70%;
                cursor: pointer;
                p{
                    width: 100%;
                    margin-top: 15px;
                }
            }
            .i-wallet{
                padding-left: 20px;
                background:url("./images/icon_wallet.svg") no-repeat left center;
            }
            .i-address{
                padding-left: 20px;
                background:url("./images/icon_positioning.svg") no-repeat left center;
            }
            .addr-box{
                width: 100%;
                .addr{
                    overflow:hidden;
                    text-overflow:ellipsis;
                    display:-webkit-box;
                    -webkit-line-clamp:2;
                }
            }
            .font14{
                    font-size:14px;
            }
            .font10{
                font-size:10px;
                color: #22272C;
            }
            .font12{
                font-size:12px;
            }
        }
    }
    .font10{
        .el-button{
            font-size:10px;
        }
    }
    .add-item{
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: 100%;
        height: 100%;
        padding-left: 16px;
        margin-left: auto;
        background: url("./images/contract_Bg.png") no-repeat center;
        // background-size: 230px 130px;
        background-size: 100% 100%;
    }
    .i-add{
        height: 40px;
        line-height: 40px;
        margin-bottom: 44px;
    }
    .contract-add{
        width: 32%;
        height: 25%;
        // margin: 0 0 0 15px;
        .el-button{
            width:79px;
            height:32px;
            padding:0;
        }
    }
    .empty{
        width: 32%;
    }
</style>
