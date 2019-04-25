<template>
    <div :class="[lang=='en'?'en-label':'','trade-detail','format-style']">
        <p>
            <span class="label">{{$t("trade.type")}}</span>
            <span class="bold">
                {{trade.type | tradeType(trade.state)}}
                <span v-if="trade.handle">- {{$t("trade."+trade.handle)}}</span>
            </span>
        </p>
        <p>
            <span class="label">{{$t("trade.tradeTime")}}</span>
            <span v-if="trade.tradeTime" class="bold">{{trade.tradeTime | UTCDate}}</span>
        </p>
        <p v-if="trade.hash">
            <span class="label">{{$t("trade.tradeHash")}}</span>
            <span class="bold">{{trade.hash}}</span>
        </p>
        <p>
            <span class="label">{{$t("trade.tradeStatus")}}</span>
            <span v-if="trade.hash" class="bold">
                <span v-if="trade.isCompolete" class="success bold">Success</span>
                <span v-else-if="trade.isFail || trade.state==2" class="danger bold">Fail</span>
                <span v-else class="pending bold">Pending</span>
            </span>
            <span v-else :class="[trade.executed==0?'danger':'',trade.executed==1?'success':'','bold']">
                {{trade.executed==1?'Success':'Fail'}}
            </span>
        </p>
        <p>
            <span v-if="trade.type=='createValidator' || trade.type=='increaseStake'" class="label">{{$t('application.staked')}}</span>
            <span v-else-if="trade.type=='reduceStake' || trade.type=='quitStake'" class="label">{{$t("application.reduceDep")}}</span>
            <span v-else-if="trade.type=='redeemStake'" class="label">{{$t('application.withdraw2')}}</span>
            <span v-else-if="trade.type=='vote'" class="label">{{$t('application.voteStaked')}}</span>
            <span v-else class="label">{{$t('trade.sum')}}</span>
            <span v-if="trade.hash" class="bold">{{trade.value-0}} Energon</span>
            <span v-else class="bold">{{trade.value-0 | fromWei}} Energon</span>
        </p>
        <p>
            <span class="label">{{$t("trade.from")}}</span>
            <span v-if="trade.fromWallet && trade.fromWallet.type=='share' && trade.type =='transfer'" class="contract-addr"></span>
            <span class="bold">{{trade.from}} 【{{trade.fromWallet && (trade.fromWallet.account.length>16?trade.fromWallet.account.slice(0,16)+'...':trade.fromWallet.account)}}】</span>
        </p>
        <p>
            <span class="label">{{$t("trade.to")}}</span>
            <span class="bold" v-if="trade.to || trade.contractAddress">
                <span :class="[trade.type=='contractCreate'?'contract-create':'','contract-addr']" v-if="trade.type!=='transfer'"></span>
                {{trade.to || trade.contractAddress}}
                <span v-if="trade.toWallet"> 【{{trade.toWallet&&(trade.toWallet.account.length>16?trade.toWallet.account.slice(0,16)+'...':trade.toWallet.account)}}】</span>
                <span v-if="trade.type=='contractCreate' && trade.isCompolete" class="icon-compolete"></span>
            </span>
            <span v-else class="bold">{{trade.type | tradeType}}</span>
        </p>
        <p v-if="voteType.indexOf(trade.type)!==-1">
            <span class="label">{{trade.type=='vote'?$t("vote.voteFor"):$t("application.nodeName2")}}</span>
            <span class="bold">{{trade.nodeName}}</span>
        </p>
        <p v-if="voteType.indexOf(trade.type)!==-1" class="flex">
            <span class="label">{{$t("application.nodePublicKeyID")}}</span>
            <span class="break-word bold">{{trade.nodeId}}</span>
        </p>
        <p v-if="trade.type=='vote'">
            <span class="label">{{$t("vote.ticketPrice")}}</span>
            <span class="break-word bold">{{trade.ticketPrice}} Energon</span>
        </p>
        <p v-if="trade.type=='vote'">
            <span class="label">{{$t("vote.count")}}</span>
            <span class="break-word bold">{{trade.ticketCount}}</span>
        </p>
        <p>
            <span class="label">{{$t("trade.fee")}}</span>
            <span class="bold">{{trade.price}}{{(trade.price!=='(Pending)' && trade.price!=='-')?' Energon':''}}</span>
        </p>
        <p v-if="trade.hash">
            <span class="label">{{$t("trade.gas")}}</span>
            <span class="bold">{{trade.gasUsed}}</span>
        </p>
        <p v-if="trade.hash">
            <span class="label">{{$t("trade.energon")}}</span>
            <span class="bold">{{trade.gasPrice}}<span v-if="trade.gasPrice!=='(Pending)'"> Energon</span></span>
        </p>
        <p v-if="trade.hash">
            <span class="label">{{$t("trade.block")}}</span>
            <span class="bold">{{trade.blockNumber}}</span>
        </p>
        <p class="inputTitle">
            <span class="label">{{$t("trade.TXD")}}</span>
            <span class="input bold">{{trade.input?trade.input:'0x'}}</span>
        </p>
    </div>

</template>

<script>
    import contractService from '@/services/contract-servies';
    import mathService from '@/services/math';
    import {mapGetters, mapActions} from 'vuex'

    export default {
        name: "trade-detail",
        data() {
            return{
                trade: {},
                voteType:['createValidator','increaseStake','reduceStake','quitStake','redeemStake','vote']
            }
        },
        computed:{
            ...mapGetters(['lang'])
        },
        mounted(){
            this.trade = this.$route.query.trade?this.$route.query.trade:{};
            if(this.trade.hash){
                contractService.web3.eth.getTransactionReceipt(this.trade.hash,(err,data)=>{
                    if(err){
                        console.error(err);
                        return;
                    }
                    if(data){
                        if(!data.to){
                            delete data.to;
                        }
                        Object.assign(this.trade,data);
                        if(data.status && data.status=='0x0'){
                            this.trade.isCompolete = false;
                        }
                        if(data.blockNumber){
                            contractService.web3.eth.getBlock(data.blockNumber,(err1,blockData)=>{
                                if(err1 || !blockData) return;
                                this.trade.tradeTime = blockData.timestamp;
                            })
                        }
                        if(this.trade && this.trade.gasUsed){
                            contractService.web3.eth.getTransaction(this.trade.hash,(error,txData)=>{
                                if(err) return;
                                if(txData){
                                    this.trade.gasPrice = mathService.toNonExponential(contractService.web3.fromWei(txData.gasPrice,'ether'));
                                }else{
                                    this.trade.gasPrice = contractService.web3.fromWei(this.trade.gasPrice,'ether');
                                }
                                this.trade.price = mathService.mul(this.trade.gasPrice,this.trade.gasUsed)
                            });
                        }else{
                            this.trade.gasPrice = contractService.web3.fromWei(this.trade.gasPrice,'ether');
                            this.trade.blockNumber = '(Pending)';
                            this.trade.price = '(Pending)';
                            this.trade.gasUsed = '(Pending)';
                        }
                    }else{
                        this.trade.gasPrice = contractService.web3.fromWei(this.trade.gasPrice,'ether');
                        this.trade.blockNumber = '-';
                        this.trade.price = '-';
                        this.trade.gasUsed = '-';
                    }
                });
            }else{  //共享钱包转账交易
                this.trade.price = '-';
                if(this.trade.pending!=1){
                    this.trade.isCompolete = this.trade.executed==1?true:false;
                    this.trade.isFail = this.trade.executed==0?true:false;
                    this.trade.to = this.trade.from;
                    this.trade.from = this.trade.ownersList[0]
                }
            }
        },
        methods:{

        },
        filters:{
            'fromWei':function(num){
                return contractService.web3.fromWei(num,"ether").toString(10);
            }
        },
    }
</script>

<style lang="less" scoped>
    .trade-detail{
        margin-left:10px;
        padding:8px 20px;
        width:calc(~"100% - 20px");
        border-radius:4px;
        font-size: 12px;
        color: #24272B;
        background-color: #fff;
        p{
            height:28px;
            line-height:28px;
            .label{
                display:inline-block;
                min-width:133px;
                width:133px;
                color: #525768;
            }
            .success{
                color: #0BB27A;
            }
            .pending{
                color: #FFBA00;
            }
            .danger{
                color: #F32E25;
            }
        }
        .contract-addr{
            position:relative;
            margin-right:60px;
            &:after{
               content:'Contract ：';
               position:absolute;
               left:19px;
               top:0;
               height:16px;
               line-height:16px;
            }
        }
        .contract-create.contract-addr{
            margin-right:98px;
            &:after{
                content:'Contract created:'
            }
        }
    }
    .en-label{
        p{
            .label{
                min-width:165px;
                width:165px;
            }
        }
    }
    .input{
        margin:8px 0 0 3px;
        padding:2px 10px;
        width: 500px;
        height:141px;
        word-wrap: break-word;
        background: #ECF1F8;
        border: 1px solid #D3D8E1;
        border-radius: 4px;
        cursor: default;
    }
    .inputTitle{
        display: flex;
    }
    .flex{
        display:flex;
    }
    .break-word{
        padding-left:3px;
        line-height: 14px;
        word-break: break-all;
    }
    .icon-compolete{
        display:inline-block;
        width:12px;
        height:16px;
        background: url("./images/icon_complete.svg") no-repeat center center;
        background-size: contain;
        vertical-align: -3px;
    }
</style>
