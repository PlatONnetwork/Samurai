<template>
    <div class="contract-list format-style" v-if="loadCompolete">
        <p class="tabs">
            <span @click="newContract" :class="[canDeploy?'':'disabled','deploy']">{{$t("contracts.deployCont")}}</span>
            <span @click="addContract" class="add">{{$t("contracts.watchCont")}}</span>
        </p>
        <div :class="[contractList&&contractList.length>0?'':'non-wallet','card content']">
            <p v-if="contractList&&contractList.length==0">{{$t("contracts.noContract")}}</p>
            <div v-for="(item, index) in contractList"
                 :class="[!item.address?'contract-pointer':'','contract-item']"
                 :style="{marginRight:isMaximized?'9px':'9px'}"
                 :key="item.address"
                 @click="goToDetail(item)">
                <div :class="[item.icon,'contract-icon']">{{item.name.slice(0,1).toUpperCase()}}</div>
                <div class="contract-info">
                    <p class="name">{{item.name | sliceName}}</p>
                    <p :class="[isMaximized?'addr-mid':'addr-max','i-address']">
                        {{item.address?item.address:$t('settings.customNet.creating')}}
                    </p>
                </div>
                <p class="process" v-if="!item.address">
                    <!--<el-progress :stroke-width="14" :percentage="item.processWidth" color="rgb(35,200,239,1)"></el-progress>-->
                    <span :style="{width:item.processWidth+'%'}"></span>
                </p>
            </div>
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
                loadCompolete:false,
                canDeploy:false
            }
        },
        computed: {
            ...mapGetters(['contractListGetter','nodeState','lang','WalletListGetter','totalBalance','nortotalBalance','isMaximized'])
        },
        mounted(){
            this.contractListAction().then(()=>{
                this.init();
            });
        },
        methods: {
            ...mapActions(['contractListAction','insertAddress','hasBalOrd']),
            init(){
                this.contractList = this.contractListGetter;
                this.hasBalOrd().then((hasBalOrds)=>{
                    this.loadCompolete = true;
                    this.canDeploy = hasBalOrds;
                });
                if(this.contractList){
                    this.getBalance();
                }
                clearInterval(window.contractBalanceTasksTimer);
                window.contractBalanceTasksTimer = setInterval(this.getBalance,5*1000);
            },
            getBalance(){
                console.log('getBalance----');
                let _this = this;
                if(this.contractList){
                    this.contractList.forEach((item,index)=>{
                        console.log('item.address---',item.address);
                        if(!item.address){
                            contractService.web3.eth.getTransactionReceipt(item.hash,(err,data)=>{
                                if(!item.processWidth){
                                    item.processWidth = 30;
                                }else{
                                    item.processWidth+=(item.processWidth>80?0:20)
                                }
                                if(data){
                                    item.address = data.contractAddress;
                                    _this.insertAddress({
                                        hash:item.hash,
                                        address:data.contractAddress
                                    });
                                }
                                _this.$set(_this.contractList,index,item);
                            })
                        }
                    });
                }
            },
            newContract(){
                if(!this.canDeploy) return;
                this.$router.push('/contract-new')
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
        beforeDestroy() {
            if(window.contractBalanceTasksTimer){
                clearInterval(window.contractBalanceTasksTimer);
            }
        },
    }
</script>

<style lang="less" scoped>
    .content{
        height: calc(~"100% - 32px");
        overflow-y: auto;
        margin: 13px auto 0;
        padding: 20px 15px 0 15px;
        /*display: flex;*/
        /*flex-wrap:wrap;*/
        /*justify-content: flex-start;*/
        &.non-wallet{
            p{
                text-align: center;
                margin-top: 273px;
                color: #9EABBE;
            }
        }
        .contract-item{
            width: 236px;
            height: 76px;
            display:inline-flex;
            /*width:31.8%;*/
            /*flex-grow: 1;*/
            padding:16px 0 16px 11px;
            position: relative;
            /*width: 33%;*/
            /*height: 15%;*/
            margin-bottom: 20px;
            box-shadow: 0 1px 4px 0 #E5E9F2;
            border: 1px solid transparent;
            border-radius: 4px;
            /*display: flex;*/
            /*&:nth-of-type(3n){
                margin-right:0!important;
             }*/
            &:hover{
                border: 1px solid #0077FF;
            }
            .contract-info{
                cursor: pointer;
                .name{
                    margin-bottom:9px;
                    height:17px;
                    font-weight:600;
                    font-size:12px;
                }
            }
            .i-address{
                padding-left: 16px;
                font-size: 10px;
                color: #9EABBE;
                white-space: nowrap;
                width: 158px;
                overflow: hidden;
                text-overflow: ellipsis;
                word-break:break-all;
                background:url("./images/contract_addr.svg") no-repeat left 1px;
                background-size: 12px 11px;
            }
            .addr-mid{
                width:163px;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
        .contract-pointer{
            pointer-events: none;
            background: #ECEFF6;
        }
    }
    .deploy{
       padding-left:22px;
       background: url("./images/icon_contract.svg") no-repeat 2px center;
       &:not(.disabled):hover{
          background: url("./images/icon_contract_2.svg") no-repeat 2px center;
       }
    }
    .add{
        margin-left:25px;
        padding-left:22px;
        background: url("./images/icon_contract_3.svg") no-repeat 2px center;
        &:hover{
            background: url("./images/icon_contract_4.svg") no-repeat 2px center;
        }
    }
    .tabs span{
        color: #525768;
        &:hover{
            color: #0077FF;
         }
        &.disabled{
             color: #9EABBE;
         }
    }
</style>
