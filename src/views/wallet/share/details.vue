<template>
    <div class="wallet-detail format-style">
        <div class="wallet-detail-wrapper">
                <div class="wallet-icon wallet-share" :class="[wallet.icon?wallet.icon:'icon-bg']">
                    {{wallet.account&&wallet.account.slice(0,1).toUpperCase()}}
                </div>
                <div class="wallet-detail-info">
                    <p class="wallet-name" :title="(wallet.account&&wallet.account.length>32)?wallet.account:''"  @click="rename">
                        <!-- {{wallet.account | sliceName}} -->
                        <rename :oldName="wallet.account" @changeName="changeName" :rule="false"></rename>
                    </p>
                    <p class="balance">
                        <span class="wallet-name">{{balance}} </span>Energon
                        <!-- <refresh @refreshBalance="refreshValue" :parentAddress="wallet.address"></refresh> -->
                    </p>
                    <p class="address" ref="address">
                        {{wallet.address}}
<!--                        <i class="icon-copy" @click="doCopy2" title="Copy to clipboard" @mouseleave="mouseLeave" ref="copy-i"></i>-->
                        <el-tooltip class="item" effect="dark" offset="0" :content="clipboarMsg" placement="top">
                            <i class="icon-copy" @click="doCopy2"  @mouseleave="mouseLeave" ref="copy-i"></i>
                        </el-tooltip>
                    </p>
                </div>
                <ul class="wallet-operate">
                    <refresh @refreshBalance="refreshValue" :parentAddress="wallet.address"></refresh>
                    <!-- <li class="send" @click="handleSend" v-if="isOwner">
                        <span>{{$t('wallet.send')}}</span>
                    </li>
                    <li class="receive"  @click="handleAccept">
                        <span>{{$t('wallet.accept')}}</span>
                    </li> -->
                    <li class="copy"
                        @click="doCopy">
                        <span>{{$t('wallet.copyAddress')}}</span>
                    </li>
                    <el-popover placement="bottom" popper-class="more-popper"
                                trigger="click">
                        <p class="pop lightBlack" @click="showABI">{{$t('wallet.viewAbi')}}</p>
                        <li class="more" slot="reference">
                            <span>{{$t('wallet.more')}}</span>
                        </li>
                    </el-popover>
                </ul>
            </div>
        <ul class="tab-list clearfix">
            <li v-if="isOwner" @click="changeTab(0)" :class="{'select':select==0,sign:signFlag}">
                <i class="icon-sign"></i>
                {{$t('trade.signTrade')}}
            </li>
            <li @click="changeTab(1)" :class="{'select':select==1}">
                <i class="icon-record"></i>
                {{$t('wallet.record')}}
            </li>
            <li v-if="isOwner" @click="changeTab(2)" :class="{'select':select==2}">
                <i class="icon-send"></i>
                {{$t('wallet.send')}}
            </li>
            <li @click="changeTab(3)" :class="{'select':select==3}">
                <i class="icon-accept"></i>
                {{$t('wallet.accept')}}
            </li>
        </ul>
        <!--交易列表-->
        <div :class="[select>1?'padd-lt':'','wallet-trade-wrapper']">
            <div class="owner-list"  v-show="select==0">
                <p class="title">{{$t('wallet.sharedOwners')}}({{wallet.required}}/{{wallet.ownersArr && wallet.ownersArr.length}})</p>
                <ul>
                    <li v-for="(owner,index) in wallet.ownersArr" :key="owner.address">
                        <span class="index">{{index+1}}</span>
                        <span class="userName" :title="owner.account&&owner.account.length>10?owner.account:''">{{owner.account}}</span>
                        <span>{{owner.address}}</span>
                    </li>
                </ul>
            </div>
            <div class="padd-r">
                <tradeList-component  v-show="select==0 || select==1" ref="child2" :pageNum="pageSize" pageFrom="shareDetail" :tab="select" :isOwner="isOwner"></tradeList-component>
            </div>
            <send-component v-show="select==2" :walletType=2 @initEvent="initEvent"></send-component>
            <accept-qr-component  v-show="select==3" ></accept-qr-component>
        </div>

        <!--查看接口文件弹窗-->
        <div class="modal abi-modal diff-modal" v-if="showABIModal">
            <div class="modal-main">
                <div class="modal-title">
                    {{$t('contracts.interface')}}
                    <span class="modal-close" @click="handleCancel"></span>
                </div>
                <div class="modal-content f12">
                    <div class="abiView-box">
                        <p class="abiView">{{ABIFile}}</p>
                    </div>
                </div>
                <div class="modal-btn">
                    <el-button :class="[lang=='en'?'':'letterSpace']" type="primary" @click="copyConfirm(2)">{{$t('wallet.copy')}}</el-button>
                    <el-button :class="[lang=='en'?'':'letterSpace']" type="primary" @click="handleCancel">{{$t('form.sure')}}</el-button>
                </div>
            </div>
        </div>

        <!--复制地址警告-->
        <div class="modal diff-modal" v-if="isTest">
            <div class="modal-main">
                <div class="modal-title">
                   {{$t('wallet.warning')}}
                    <span class="modal-close" @click="handleCancel"></span>
                </div>
                <div class="modal-content f12">
                    <p class="icon-danger"></p>
                    <p class="mb-10">{{$t('wallet.warningTxt')}}</p>
                </div>
                <div class="modal-btn">
                    <el-button :class="[lang=='en'?'':'letterSpace']" @click="handleCancel">{{$t('form.cancel')}}</el-button>
                    <el-button :class="[lang=='en'?'':'letterSpace']" @click="copyConfirm(1)"  type="primary">{{$t('form.sure')}}</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import contractService from '@/services/contract-servies';
    import keyManager from '@/services/key-manager'
    import fsObj from '@/services/fs-service'
    import {mapGetters, mapActions} from 'vuex';
    import tradeListComponent from '@/components/trade/list';
    import sendComponent from '@/components/trade/send';
    import acceptQrComponent from '../accept-qr';
    import refresh from '@/components/refresh/refresh';
    import rename from '@/components/rename';
import { setInterval, clearInterval } from 'timers';

    export default {
        name: "o-wallet-details",
        data() {
            return{
                clipboarMsg:'Copy to clipboard',
                wallet: {},
                tradeList: [],
                isTest: false,
                balance:null,
                showLoadMore:true,
                showABIModal:false,
                ABIFile:null,
                isOwner:false,
                tradeTimer:null,
                pageSize:20,
                select:0,
                allWallets:[],
                signFlag:false
            }
        },
        computed: {
            ...mapGetters(['shareWalletList', 'network','curWallet','chainName','lang'])
        },
        created(){
            this.getAllWallets().then(res=>{
                this.allWallets=res
            })
            this.WalletListAction(this.network.type);
        },
        mounted(){
            this.init();
            this.$refs.address.addEventListener('copy',(e)=> {
                e.preventDefault();
                e.stopPropagation();
                this.doCopy();
            })
        },
        methods: {
            ...mapActions(['WalletListAction','replaceWallet','getWalletByAddress','getOrd','getAllWallets']),
            init(){
                let _this = this;
                let arr = this.shareWalletList.filter((item)=>{
                    return item.address==_this.curWallet;
                });
                if(arr && arr.length>0){
                    this.wallet = arr[0];
                    if(this.wallet.address){
                        contractService.web3.eth.getBalance(this.wallet.address,(err,data)=>{
                            this.balance=contractService.web3.fromWei(data.toString(10), 'ether');
                        });
                        contractService.platONCall(contractService.getABI(1),this.wallet.address,'getRequired',this.wallet.address).then((required)=>{
                            console.log('getRequired--->',required);
                            this.wallet.required = required;
                        });
                        clearInterval(window.balanceInterval);
                        clearInterval(window.checkSignStatusInterval)
                        window.balanceInterval = setInterval(_this.refresh,5*1000);
                        window.checkSignStatusInterval=setInterval(this.checkSignStatus,500)
                        this.getOrd().then((ords)=>{
                            let atLocalOwners=[];
                            _this.wallet.ownersArr.forEach((owner)=>{
                                let atLocalOwner = ords.filter((ord)=>{
                                    return ord.address==owner.address;
                                });
                                if(atLocalOwner.length>0){
                                    owner.account = atLocalOwner[0].account;
                                    atLocalOwners.push(atLocalOwner[0].address)
                                }
                            });
                            if(atLocalOwners.length>0){
                                this.isOwner = true;
                            }else{
                                this.isOwner = false;
                                this.select=1
                            }
                        });
                    }
                }
            },
            doCopy2(){
                this.$copyText(this.wallet.address).then(()=>{
                    this.clipboarMsg = 'Copied!';
                });
            },
            mouseLeave(){
                setTimeout(()=>{
                    this.clipboarMsg = 'Copy to clipboard';
                },1200)
            },
            refresh(){
                contractService.web3.eth.getBalance(this.wallet.address,(err,data)=>{
                    this.balance=contractService.web3.fromWei(data.toString(10), 'ether');
                });
            },
            selWallet(){
                this.init();
            },
            checkPass(rule, value, callback){
                if (value === '') {
                    callback(new Error(this.$t('form.nonRepPsw')));
                } else if (value !== this.form.newPassword){
                    callback(new Error(this.$t('form.disMatch')));
                } else {
                    callback();
                }
            },
            doCopy(){
                if(this.network.type=='main'){
                    this.copyConfirm(1);
                }else{
                    this.isTest = true;
                }
            },
            copyConfirm(num){
                if(num==1){
                    this.$copyText(this.wallet.address).then((e) => {
                        this.$message.success(this.$t('wallet.copySuccess'));
                        this.isTest = false
                    }, function (e) {
                        this.$message.error(this.$t('wallet.copyFail'));
                        this.isTest = false
                    })
                }else{
                    this.$copyText(this.ABIFile).then((e) => {
                        this.$message.success(this.$t('wallet.copySuccess'));
                    }, function (e) {
                        this.$message.error(this.$t('wallet.copyFail'));
                    })
                }
            },
            handleSend(){
                if((this.balance-0)==0){
                    this.$message({
                        message: this.$t('wallet.cannotTrans'),
                        type: 'warning'
                    });
                    return;
                }
                this.$router.push('/o-wallet-send')
            },
            handleAccept(){
                this.$router.push('/o-wallet-accept')
            },
            handleCancel(){
                this.showABIModal = false;
                this.isTest = false;
            },
            showABI(){
                this.ABIFile = JSON.stringify(contractService.getABI(1));
                this.showABIModal = true;
            },
            confirmEtherTransaction(txHash,confirmations = 21){
                function getConfirmations(txHash,cb) {
                    try {
                        contractService.web3.eth.getTransaction(txHash,function(err,data){
                            const trx = data;
                            if(!trx){
                                clearInterval(this.tradeTimer);
                                return;
                            }
                            contractService.web3.eth.getBlockNumber(function(err,currentBlock){
                                cb(trx.blockNumber === null ? 0 : currentBlock - trx.blockNumber);
                            });
                        })
                    }
                    catch (error) {
                        console.error(error);
                        cb(error);
                    }

                }
                return new Promise((resolve, reject)=>{
                    getConfirmations(txHash,(trxConfirmations)=>{
                        if (trxConfirmations >= confirmations) {
                            resolve({
                                trxConfirmations:trxConfirmations,
                                confirmations:confirmations,
                                isCompolete:true
                            });
                        }else{
                            resolve({
                                trxConfirmations:trxConfirmations,
                                confirmations:confirmations,
                                isCompolete:false
                            });
                        }
                    })
                })
            },
            refreshValue(cost){
                this.balance=cost;
            },
            changeTab(index){
                this.select=index
            },
            rename(){

            },
            changeName(newName){
                let arr = this.allWallets.filter((item)=>{
                    return item.account==newName
                });
                if(arr.length>0 && arr[0].address!==this.wallet.address){
                    this.$message.warning(this.$t('wallet.walletNameExists'));
                }else{
                    const wallet =Object.assign({},this.wallet,{account:newName})
                    this.replaceWallet(wallet).then(()=>{
                        this.wallet.account=newName
                    });
                }
            },
            initEvent(){
                console.log('initEvent')
                this.select=0;
                this.$refs.child2.init()
                this.init();
            },
            checkSignStatus(){
                const {tradeList,pendingTradeList}=this.$refs.child2
                if(pendingTradeList.length){
                    let flag=false
                    pendingTradeList.map(item=>{
                        if(item.availOwners&&item.availOwners.length){
                            flag=true
                        }
                    })
                    this.signFlag=flag
                }else{
                    this.signFlag=false
                }
            }
        },
        watch:{
            'curWallet':function(){
                this.init();
            }
        },
        filters:{
            'month':function (time) {
                return new Date(time).getMonth()+1;
            },
            'date':function (time) {
                return new Date(time).getDate();
            },
            'sliceName':function(name){
                if(name && name.length>36){
                    return name.slice(0,36)+'...'
                }else{
                    return name;
                }
            }
        },
        components:{
            tradeListComponent,
            refresh,
            acceptQrComponent,sendComponent,rename
        },
        beforeDestroy() {
            clearInterval(window.balanceInterval);
            clearInterval(window.checkSignStatusInterval)
            window.balanceInterval = null;
            window.checkSignStatusInterval=null
        },
        destroyed() {
            clearInterval(window.balanceInterval);
            clearInterval(window.checkSignStatusInterval)
            window.balanceInterval = null;
            window.checkSignStatusInterval=null
        },
    }
</script>

<style lang="less" scoped>
    .wallet-detail{
        background: #fff;
        .padd-r{
            padding-right:14px;
        }
        .icon-danger{
            float: left;
            width: 20px;
            height: 20px;
            margin:0 10px 0 0;
            background-image: url("../images/10.icon_An_error .svg");
            background-size: 20px 20px;
            background-repeat: no-repeat;
            background-position: center;
        }
        .wallet-trade-wrapper{
            height:calc(~"100% - 151px");
            overflow-y: auto;
        }
        .padd-lt{
            padding: 0 0 0 14px;
        }
        // .trade-con{
        //     height:100%;
        //     overflow-y: auto;
        // }
    }
    .dan{
        color: #F32E25;
    }
    .wallet-detail-wrapper{
        padding:14px 30px 2px 14px;
        min-height: 109px;
        display: flex;
        // box-shadow: 0 4px 6px 0 rgba(48,48,77,0.05), 0 2px 4px 0 rgba(148,148,197,0.05);
        font-size: 12px;
        color: #24272B;
        .wallet-name{
            font-size: 14px;
            color: #24272B;
            font-weight:600;
            word-break: break-all;
        }
        .balance{
            padding-left:18.2px;
            background:url("../images/icon_wallet.svg") no-repeat left center;
        }
        .address{
            padding-left:18.2px;
            background:url("../images/icon_positioning.svg") no-repeat left center;
        }
        .icon-bg{
            background: url("../images/icon_user.png") no-repeat center center;
            background-size: contain;
        }
        .wallet-icon{
            width: 40px;
            height: 40px;
            margin: 21px 12px 0 0;
            background-repeat:no-repeat;
            background-position: center center;
            background-size: contain;
        }
        .wallet-detail-info{
            flex:1;
            p{
                margin-bottom: 12px;
            }
        }
        .wallet-operate{
            margin-top:30px;
            width: 230px;
            min-width: 230px;
            display:flex;
            justify-content: flex-end;
            >li{
                margin-left:27px;
                padding-top:32px;
                cursor:pointer;
            }
            .send{
                background: url("../images/icon_send.svg") no-repeat top center;
                background-size: 20px 20px;
            }
            .receive{
                background: url("../images/icon_receive.svg") no-repeat top center;
                background-size: 20px 20px;
            }
            .copy{
                background: url("../images/icon_copy.svg") no-repeat top center;
                background-size: 20px 20px;
            }
            .more{
                margin-left:27px;
                padding-top: 32px;
                cursor:pointer;
                background: url("../images/icon_more.svg") no-repeat top center;
                background-size: 20px 20px;
            }

        }
    }
    .owner-list{
        margin: 0 14px 4px 0;
        padding:14px 0 0 14px;
        // min-height:134px;
        // overflow-y:auto;
        font-size: 12px;
        .index{
            margin: 0 10px 0 0;
            display:inline-block;
            width:18px;
            height:18px;
            line-height:18px;
            text-align: center;
            color:#fff;
            border-radius: 18px;
            background: #4897F6;
        }
        .rt{
            width:60px;
        }
        .title{
            font-weight: 600;
            line-height:20px;
            font-size: 12px;
        }
        ul{
            margin: 10px 0 0;
            padding: 14px 0 0 14px;
            background: #ECF1F8;
            border-radius: 4px;
        }
        li{
            padding-bottom:10px;
        }
        .userName{
            position:relative;
            top:3px;
            margin-right: 5px;
            display:inline-block;
            width:60px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-weight: 700;
        }
    }
    .mb-10{
        margin-bottom: 10px;
    }
    .non-rec{
        padding-left:14px;
        margin-top:8px;
        font-size: 12px;
        color: #9EABBE;
        letter-spacing: 0.43px;
    }
    .modal{
       .modal-main{
           width:483px;
            .modal-content{
                padding:20px 20px 60px;
            }
            .el-input{
                width:100%;
            }
       }
    }
    .abi-modal{
        .modal-main{
            width:483px;
            .modal-content{
                padding:12px 0;
                height:150px;
                overflow-y: auto;
            }
        }
    }
    .abiView-box{
        padding: 8px 3px 8px 0;
        height: 100%;
        background: #ECEFF6;
        overflow: auto;
    }
    .abiView{
        padding: 0 20px;
        font-size: 12px;
        color: #24272B;
        height: 100%;
        letter-spacing: 0.43px;
        overflow: auto;
    }

.tab-list{
    margin: 0 14px;
    border-top: 1px solid #D3D8E1;
    i{
        margin:  0 5px 0 0;
        float: left;
        width: 16px;
        height: 20px;
        background-repeat: no-repeat;
        background-position: center 1px;
    }
    .icon-sign{
        background-image: url("../images/32.icon_Sign 2.svg");
    }
    .icon-record{
        background-image: url("../images/18.icon_Transactions2.svg")
    }
    .icon-send{
        background-image: url("../images/18.icon_Send.svg")
    }
    .icon-accept{
        background-image: url("../images/18.icon_Receive.svg")
    }
    >li{
        position: relative;
        margin: 14px 30px 0 0;
        padding: 0 0 2px;
        float: left;
        font-size: 12px;
        cursor: pointer;
        border-bottom: 2px solid #fff;
    }
    li:hover,.select{
        color: #0077FF;

        .icon-sign{
            background-image: url("../images/32.icon_Sign.svg");
        }
        .icon-record{
            background-image: url("../images/18.icon_Transactions.svg")
        }
        .icon-send{
            background-image: url("../images/18.icon_Send2.svg")
        }
        .icon-accept{
            background-image: url("../images/18.icon_Receive2.svg")
        }
    }
    .select{
        font-weight: 600;
        border-bottom: 2px solid #0077FF;
    }
    .sign{
        &::after{
            position: absolute;
            top: 0px;
            right: 0;
            content:' ';
            width: 5px;
            height: 5px;
            background: #F32E25 ;
            border-radius: 50%;
        }
    }
}
</style>
<style lang="less">
    .wallet-detail{
        .modify-psw{
            .el-form-item{
                margin-bottom:10px;
            }
            .el-form-item__error{
                position:static;
            }
        }
    }
    .el-popover{
        top:149px!important;
        left:unset!important;
        right:30px;
        padding:0;
        min-width: 130px;
        border-radius:4px;
        p{
            height:37px;
            line-height:37px;
        }
    }
    .more-popper{
        .popper__arrow{
            left:95px!important;
        }
    }
</style>


