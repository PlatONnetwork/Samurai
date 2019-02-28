<template>
    <div class="wallet format-style">
        <div class="wallet-header">
            <div class="wallet-info">
                <span>{{$t('wallet.totalBalance')}}</span>
                <span class="ml-30" v-show="showBalance==1"> <span class="bold">{{totalBalance}}</span>&nbsp;Energon</span>
                <span class="ml-30" v-show="showBalance==0">***&nbsp;Energon</span>
                <span :class="showBalance==1?'icon-hide':'icon-eye'" @click="toggleIcon"></span>
            </div>
            <div class="tabs">
                <span :class="{selected: curIndex == 1}"
                      @click="toggleWay(1)">{{$t('wallet.individual')}}
                </span>
                <span :class="{selected: curIndex == 2}"
                      @click="toggleWay(2)">{{$t('wallet.shared')}}
                </span>
            </div>
        </div>
        <div class="card wallet-content" :class="walletList.length>0?'':'non-wallet'">
            <div :class="['wallet-item',curIndex == 2?'wallet-share':'',(!item.address || item.state==0)?'unabled':'']"
                 v-for="(item,index) in walletList"
                 :key="item.address"
                 @click="goToDetail(item)">
                <div class="wallet-icon" :class="item.icon"></div>
                <div class="info">
                    <p class="name bold" :title="item.account&&item.account.length>16?item.account:''">{{item.account | sliceName}}</p>
                    <p class="i-wallet"> <span class="font14 bold">{{item.balance}}</span>&nbsp;<span class="font10">Energon</span></p>
                    <div class="addr-box">
                        <p class="addr i-address f12 " :title="item.address">
                            {{item.address?item.address:$t('settings.customNet.creating')}}
                        </p>
                    </div>
                </div>
                <p class="process" v-if="!item.address || item.state==0">
                    <!--<el-progress :stroke-width="14" :percentage="item.processWidth" color="rgb(35,200,239,1)"></el-progress>-->
                    <span :style="{width:item.processWidth+'%'}"></span>
                </p>
            </div>
            <div class="add-bottom">
                <el-button @click="newWallet">{{$t('wallet.createWallet')}}</el-button>
                <el-button v-if="curIndex==1" class=" ml-40" @click="importWallet" type="primary">{{$t('wallet.importW')}}</el-button>
                <el-button v-else class=" ml-40" @click="joinWallet" type="primary">{{$t('wallet.addShareWallet')}}</el-button>
            </div>
        </div>
    </div>
</template>
<script>
    import {mapGetters, mapActions} from 'vuex'
    import contractService from '@/services/contract-servies';

    export default {
        name: "ordinary-wallet",
        data() {
            return{
                curIndex: 1,
                showBalance: 1,
                walletList:[],
                balanceTasksTimer:null
            }
        },
        computed: {
            ...mapGetters(['WalletListGetter','network','nodeState','lang','walletType','totalBalance','initParams'])
        },
        mounted(){
            this.curIndex = this.walletType;
            this.WalletListAction().then(()=>{
                this.init();
            });
            let local = window.localStorage.getItem('balanceShow')?window.localStorage.getItem('balanceShow'):1;
            window.localStorage.setItem('balanceShow',local);
            this.showBalance = local;
        },
        methods: {
            ...mapActions(['WalletListAction','updateCurWallet','updateWalletType','getOrd','getTotalBalance','insertShareAddress','getWalletByAddress','loadKeyStore','deleteShare','deleteInitParam','saveTractRecord']),
            init(){
                if(this.curIndex==1){
                    this.loadKeyStore();
                }
                this.WalletListAction().then(()=>{
                    this.walletList = this.WalletListGetter;
                    if(this.walletList){
                        this.getTotalBalance();
                        this.getBalance();
                    }
                    clearInterval(this.balanceTasksTimer);
                    this.balanceTasksTimer = setInterval(this.getBalance,5*1000);
                });
            },
            newWallet(){
               if(this.curIndex==1){
                   this.$router.push('/o-wallet-new');
               }else{
                   this.getOrd().then((data)=>{
                       if(data.length==0){
                           this.$message.warning(this.$t('wallet.tip2'));
                       } else if(this.totalBalance==0){
                           this.$message.warning(this.$t('wallet.tip1'));
                       }
                       else{
                           this.$router.push('/o-wallet-new-share');
                       }
                   });
               }
            },
            importWallet(){
                this.$router.push('/o-wallet-import');
            },
            joinWallet(){
                this.$router.push('/o-wallet-share-join');
            },
            toggleWay(i){
                this.curIndex = i;
                this.updateWalletType(i);
                this.WalletListAction().then(()=>{
                    this.init();
                });
            },
            toggleIcon(){
                this.showBalance = Math.abs(this.showBalance-1);
                window.localStorage.setItem('balanceShow',this.showBalance)
            },
            goToDetail(item){
                if(this.curIndex==1){
                    this.loadKeyStore();
                    this.WalletListAction().then(()=>{
                        let arr = this.WalletListGetter.filter((w)=>{
                            return w.address==item.address;
                        });
                        if(arr.length>0){
                            this.updateCurWallet(item.address);
                            this.$router.push('/o-wallet-details');
                        }else{
                            this.$message.warning(this.$t('wallet.invalidSignatures'));
                            this.init();
                        }
                    });
                }else{
                    if(!item.address || item.state!==1) return;
                    this.updateCurWallet(item.address);
                    this.$router.push('/o-wallet-share-detail');
                }
            },
            getBalance(){
                console.log('getBalance----');
                let _this = this;
                if(this.walletList){
                    this.walletList.forEach((item,index)=>{
                        if(item.address){
                            contractService.web3.eth.getBalance(item.address,(err,data)=>{
                                let balance=contractService.web3.fromWei(data.toString(10), 'ether');
                                if(balance.indexOf('.')!==-1){
                                    balance = balance.slice(0,balance.indexOf('.')+3)
                                }else{
                                    balance+='.00';
                                }
                                item.balance = balance;
                                _this.$set(_this.walletList,index,item);
                            });
                            if(_this.walletType==2 && item.state==0){
                                if(new Date().getTime() - item.createTime > 2*60*1000){
                                    _this.deleteInitParam(item.hash);
                                    _this.deleteShare(item.hash);
                                    _this.init();
                                }else{
                                    _this.initWallet(item,(state)=>{
                                        item.processWidth = 100;
                                        _this.insertShareAddress([{
                                            hash:item.hash,
                                            state:state,
                                            processWidth:100
                                        }]).then(()=>{
                                            _this.init();
                                        })
                                    });
                                }
                            }
                        }else{
                            contractService.web3.eth.getTransactionReceipt(item.hash,(err,data)=>{
                                if(data){
                                    item.address = data.contractAddress;
                                    item.processWidth = 50;
                                    _this.insertShareAddress([{
                                        hash:item.hash,
                                        address:data.contractAddress,
                                        processWidth:50
                                    }]);
                                }else{
                                    item.balance = '0.00';
                                    if(new Date().getTime() - item.createTime > 2*60*1000){
                                        _this.deleteInitParam(item.hash);
                                        _this.deleteShare(item.hash);
                                        _this.init();
                                    }
                                }
                                _this.$set(_this.walletList,index,item);
                            })
                        }
                    });
                    this.getTotalBalance();
                }
            },
            setImage(iconIndex){
                this.walletIcon = 'background: url('+require('./images/Oval'+Math.floor((Math.random()*5)+1)+'.png')+') no-repeat center center'
            },
            initWallet(item,cb){
                console.log('initWallet--',item);
                if(this.initParams && this.initParams[item.hash]){
                    let prikey = this.initParams[item.hash],
                        ownersArr = item.ownersArr.map((owner)=>{
                            return owner.address;
                        });
                    let params = [ownersArr.join(':'),item.required];
                    contractService.platONSendTransaction(contractService.getABI(1),item.address,'initWallet',JSON.stringify(params),item.admin.address,prikey,false,false,false,true,2).then((data)=>{
                        console.log('initWallet--data---',data);
                        let tradeObj={
                            tradeTime:new Date().getTime(),
                            hash:data.hash,
                            value:0,
                            gasPrice:0,
                            fromAccount:(item.ownersArr&&item.ownersArr.length>0)?item.ownersArr[0].account:'',
                            from:(item.ownersArr&&item.ownersArr.length>0)?item.ownersArr[0].address:'',
                            type:'createJointWallet',
                            state:1
                        };
                        this.saveTractRecord(tradeObj).then(()=>{
                            cb(1);
                        })
                    }).catch((e)=>{
                        cb(2);
                    })
                }else{
                    cb(2);
                }
            }
        },
        watch:{
            '$router':function(val,old){
                this.WalletListAction().then(()=>{
                    this.init();
                });
            },
            'nodeState':function(val,old){
                if(old!=2 && val==2){
                    this.WalletListAction().then(()=>{
                        this.init();
                    });
                }
            }

        },
        filters:{
            sliceName(name){
                // let num = this.curIndex&&this.curIndex==2?12:16;
                if(name && name.length>16){
                    return name.slice(0,16)+'...'
                }else{
                    return name;
                }
            }
        },
        beforeDestroy() {
            clearInterval(this.balanceTasksTimer);
            this.balanceTasksTimer = null;
        },
        destroyed() {
            clearInterval(this.balanceTasksTimer);
            this.balanceTasksTimer = null;
        },

    }
</script>

<style lang="less" scoped>
    .bg-style{
        background-size: 16px 16px;
        background-repeat: no-repeat;
        background-position: center;
    }
    .wallet{
        .wallet-header{
            display: flex;
            justify-content: space-between;

        }
        .wallet-info{
            width: auto;
            font-size: 12px;
            line-height: 28px;
            span{
                min-width: 16px;
                height: 28px;
                display: inline-block;
                float: left;
            }
        }
        .wallet-content{
            position: relative;
            height: calc(~"100% - 101px");
            overflow-y: auto;
            margin: 10px auto;
            padding: 20px 15px 0 15px;
            display: flex;
            /*justify-content: space-between;*/
            flex-wrap: wrap;
            align-content: flex-start;
            .wallet-item{
                position:relative;
                width: 32%;
                min-height: 130px;
                height: 25%;
                margin-right: 1.3%;
                margin-bottom: 20px;
                background: #FFFFFF;
                box-shadow: 0 4px 6px 0 rgba(48,48,77,0.05), 0 2px 4px 0 rgba(148,148,197,0.05);
                border: 1px solid transparent;
                border-radius: 4px;
                display: flex;
                &:hover{
                     border: 1px solid #00B6DC;
                 }
                .info{
                    width: 70%;
                    p{
                        width: 94%;
                        margin-top: 14px;
                    }
                    .name{
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }
                .i-wallet{
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    padding-left: 20px;
                    background:url("./images/icon_wallet.svg") no-repeat left center;
                }
                .i-address{
                    padding-left: 20px;
                    background:url("./images/icon_positioning.svg") no-repeat left 2px;
                }
                .addr-box{
                    width: 100%;
                    .addr{
                        text-overflow: ellipsis;
                        display: -webkit-box;
                        word-break: break-all;
                        overflow: hidden;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
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
            .wallet-share{
                background: url("./images/icon_Shared.svg") no-repeat left top;
                cursor:pointer;
            }
            .unabled{
                background-color: rgba(235,239,247,0.50);
                cursor:default;
            }
            .creating{
                background: url("./images/icon_Shared_creating.svg") no-repeat left top rgba(235,239,247,0.50);
            }
            .add-item{
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                width: 100%;
                height: 100%;
                padding-left: 16px;
                margin-left: auto;
                background-image: url("./images/card_bg.png");
                // background-size: 230px 130px;
                background-size: 100% 100%;
                background-repeat: no-repeat;
            }
            .i-add{
                height: 40px;
                line-height: 40px;
                margin-bottom: 44px;
                text-indent: 20px;
                background:url("./images/icon_add.svg") no-repeat left center;
            }
        }
        .ml-30{
            margin-left: 30px;
        }
        .icon-eye{
            margin-left: 8px;
            cursor: pointer;
            background-image: url("./images/icon-eye.svg");
            .bg-style;
        }
        .icon-hide{
            margin-left: 8px;
            cursor: pointer;
            background-image: url("./images/icon-hide.svg");
            .bg-style;
        }
        .tabs{
            margin-right:24px;
        }
    }
    .wallet-add{
        width: 32%;
        height: 25%;
        // margin: 0 0 0 15px;
        .el-button{
            width:79px;
            height:32px;
            padding:0;
        }
    }
    .font10{
        .el-button{
            font-size:10px;
        }
    }
    .empty{
        width: 32%;
    }
</style>
<style lang="less">
    .non-wallet{
        background: url("./images/createWallet.png") no-repeat center 90px #fff!important;
    }
    .add-bottom{
        position: fixed;
        bottom: 20px;
        left: 168px;
        margin: 0 20px;
        width: calc(~"100% - 200px");
        height:60px;
        line-height:60px;
        text-align: center;
        background-color:#fff;
        box-shadow: 0 3px 6px 0 rgba(148,148,197,0.10);
        &:before{
             content:'';
             position:absolute;
             top:0;
             left:15px;
             width:calc(~"100% - 40px");
             height:1px;
             border-top:solid 1px #D3D8E1;
         }
        .ml-40{
            margin-left:142px;
        }
        .el-button{
            width:auto;
            padding:0 15px;
        }
    }
</style>
