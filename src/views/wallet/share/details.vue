<template>
    <div class="wallet-detail format-style">
        <div class="card wallet-detail-wrapper">
            <div class="wallet-info">
                <div :class="[wallet.icon?wallet.icon:'icon-bg','wallet-icon-1']"></div>
                <div class="wallet-detail-info">
                    <p class="wallet-name" :title="(wallet.account&&wallet.account.length>32)?wallet.account:''">{{wallet.account | sliceName}}</p>
                    <p class="balance">
                        <span class="wallet-name">{{balance}} </span>Energon
                        <refresh @refreshBalance="refreshValue" :parentAddress="wallet.address"></refresh>
                    </p>
                    <p class="address" ref="address">{{wallet.address}}</p>
                </div>
                <ul class="wallet-operate">
                    <li class="send" @click="handleSend" v-if="isOwner">
                        <span>{{$t('wallet.send')}}</span>
                    </li>
                    <li class="receive"  @click="handleAccept">
                        <span>{{$t('wallet.accept')}}</span>
                    </li>
                    <li class="copy"
                        @click="doCopy">
                        <span>{{$t('wallet.copyAddress')}}</span>
                    </li>
                    <el-popover placement="bottom"
                                trigger="click">
                        <p class="pop lightBlack" @click="showABI">{{$t('wallet.viewAbi')}}</p>
                        <li class="more" slot="reference">
                            <span>{{$t('wallet.more')}}</span>
                        </li>
                    </el-popover>
                </ul>
            </div>
            <div class="owner-list">
                <div class="lt">
                    <p class="title">{{$t('wallet.sharedOwners')}}({{wallet.required}}/{{wallet.ownersArr && wallet.ownersArr.length}})</p>
                    <ul>
                        <li v-for="(owner,index) in wallet.ownersArr" :key="owner.address">
                            <span class="index">{{index+1}}</span>
                            <span class="userName" :title="owner.account&&owner.account.length>10?owner.account:''">{{owner.account}}</span>
                            <span>{{owner.address}}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!--交易列表-->
        <div class="wallet-trade-wrapper">
            <div class="trade-con">
                <tradeList-component ref="child2" :pageNum="pageSize" pageFrom="shareDetail" :isOwner="isOwner"></tradeList-component>
            </div>
        </div>

        <!--查看接口文件弹窗-->
        <div class="modal abi-modal" v-if="showABIModal">
            <div class="modal-main">
                <div class="modal-title">
                    {{$t('contracts.interface')}}
                    <span class="modal-close" @click="handleCancel"></span>
                </div>
                <div class="modal-content f12">
                    <p class="abiView">{{ABIFile}}</p>
                </div>
                <div class="modal-btn">
                    <el-button :class="[lang=='en'?'':'letterSpace']" type="primary" @click="copyConfirm(2)">{{$t('wallet.copy')}}</el-button>
                    <el-button :class="[lang=='en'?'':'letterSpace']" type="primary" @click="handleCancel">{{$t('form.sure')}}</el-button>
                </div>
            </div>
        </div>

        <!--复制地址警告-->
        <div class="modal" v-if="isTest">
            <div class="modal-main">
                <div class="modal-title">
                   {{$t('wallet.warning')}}
                    <span class="modal-close" @click="handleCancel"></span>
                </div>
                <div class="modal-content f12">
                    <p class="icon-danger"></p>
                    <p class="mb-10 dan">{{$t('wallet.warningTxt')}}</p>
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
    import refresh from '@/components/refresh/refresh';
    export default {
        name: "o-wallet-details",
        data() {
            return{
                wallet: {},
                tradeList: [],
                isTest: false,
                balance:null,
                showLoadMore:true,
                showABIModal:false,
                ABIFile:null,
                isOwner:false,
                tradeTimer:null,
                pageSize:20
            }
        },
        computed: {
            ...mapGetters(['WalletListGetter', 'network','curWallet','chainName','lang'])
        },
        created(){
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
            ...mapActions(['WalletListAction','replaceWallet','getWalletByAddress','getOrd']),
            init(){
                let _this = this;
                let arr = this.WalletListGetter.filter((item)=>{
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
                        window.balanceInterval = setInterval(_this.refresh,5*1000);
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
                            }
                        });
                    }
                }
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
            refresh
        },
        beforeDestroy() {
            clearInterval(window.balanceInterval);
            window.balanceInterval = null;
        },
        destroyed() {
            clearInterval(window.balanceInterval);
            window.balanceInterval = null;
        },
    }
</script>

<style lang="less" scoped>
    .wallet-detail{
        background: #f5f5f5;
        .icon-danger{
            width: 100%;
            height: 30px;
            margin-bottom: 18px;
            background-image: url("../images/icon_warning.svg");
            background-size: 30px 30px;
            background-repeat: no-repeat;
            background-position: center;
        }
        .wallet-trade-wrapper{
            height:calc(~"100% - 243px");
        }
        .trade-con{
            height:100%;
            overflow-y: auto;
        }
    }
    .dan{
        color: #F32E25;
    }
    .wallet-detail-wrapper{
        padding:14px 0 2px 14px;
        box-shadow: 0 4px 6px 0 rgba(48,48,77,0.05), 0 2px 4px 0 rgba(148,148,197,0.05);
        font-size: 12px;
        color: #24272B;
        .wallet-info{
            padding-right:30px;
            display: flex;
            border-bottom:solid 1px #D3D8E1;
        }
        .wallet-name{
            font-size: 14px;
            color: #24272B;
            font-weight:600;
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
        .wallet-icon-1{
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
            width: 230px;
            display:flex;
            justify-content: flex-end;
            margin-top:30px;
            >li{
                margin-left:27px;
                padding-top:32px;
                cursor:pointer;
            }
            .send{
                background: url("../images/icon_send.svg") no-repeat top center;
            }
            .receive{
                background: url("../images/icon_receive.svg") no-repeat top center;
            }
            .copy{
                background: url("../images/icon_copy.svg") no-repeat top center;
            }
            .more{
                margin-left:27px;
                padding-top: 32px;
                cursor:pointer;
                background: url("../images/icon_more.svg") no-repeat top center;
            }

        }
        .owner-list{
           padding:14px 0 0;
           display:flex;
           justify-content: space-between;
           height:134px;
           overflow-y:auto;
            .admin-owner{
                display: flex;
                width:100%;
                font-weight:600;
                font-size: 14px;
                color: #24272B;
            }
            .owner-box{
                display: inline-block;
                min-width:42px;
                height:42px;
                background: url("../images/Oval4.png") no-repeat left center;
            }
            .mulit_line{
                width:100%;
                padding-left:5px;
            }
            .mulit_line span{
                display:inline-block;
                width:90%;
                vertical-align:middle;
                word-break: break-all;
            }
            .mulit_line i{
                width:1px;
                display:inline-block;
                vertical-align:middle;
                font-size:0;
                background:transparent;
                line-height:43px;
            }
            .owner-name{
                margin-left:10px;
            }
            .index{
                display:inline-block;
                width:18px;
                height:18px;
                line-height:18px;
                text-align: center;
                color:#fff;
                border-radius: 18px;
                background: #D3D8E1;
            }
            .rt{
                width:230px;
            }
            .title{
                line-height:20px;
                font-size: 14px;
            }
            li,p{
                margin-bottom:11px;
            }
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
    .abi-modal{
        .modal-main{
            width:483px;
            .modal-content{
                padding:20px;
                height:150px;
                overflow-y: auto;
            }
        }
    }
    .abiView{
        background: #ECEFF6;
        font-size: 12px;
        color: #24272B;
        letter-spacing: 0.43px;
    }
    .userName{
        position:relative;
        top:3px;
        margin-right: 5px;
        display:inline-block;
        width:108px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 900
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
</style>


