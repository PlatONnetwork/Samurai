<template>
    <div class="wallet format-style">
        <div class="wallet-header">
            <div class="wallet-info">
                <span>{{$t('wallet.totalBalance')}}</span>
                <span class="ml-30" v-show="showBalance==1">{{totalBalance}}Energon</span>
                <span class="ml-30" v-show="showBalance==0">***Energon</span>
                <span :class="showBalance==1?'icon-eye':'icon-hide'" @click="toggleIcon"></span>
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
            <div class="wallet-item"
                 v-for="(item, index) in walletList"
                 :key="item.address"
                 @click="goToDetail(item)">
                <div class="wallet-icon" :class="item.icon"></div>
                <div class="info">
                    <p>{{item.account | sliceName}}</p>
                    <p class="i-wallet"> <span class="font14">{{item.balance}}</span> <span class="font10">Energon</span></p>
                    <div class="addr-box">
                        <p class="addr i-address f12 ">
                            {{item.address}}
                        </p>
                    </div>
                </div>
            </div>
            <div :class="[lang=='en'?'font10':'','add-bottom']">
                <el-button class="f12 w-80" @click="newWallet">{{$t('wallet.createWallet')}}</el-button>
                <el-button v-if="curIndex==1" class="f12 w-80 ml-40" @click="importWallet" type="primary">{{$t('wallet.importW')}}</el-button>
                <el-button v-else class="f12 w-80 ml-40" @click="joinWallet" type="primary">{{$t('wallet.addShareWallet')}}</el-button>
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
            }
        },
        computed: {
            ...mapGetters(['WalletListGetter','network','nodeState','lang','walletType','totalBalance'])
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
            ...mapActions(['WalletListAction','updateCurWallet','updateWalletType','getOrd','getTotalBalance']),
            init(){
                this.walletList = this.WalletListGetter;
                if(this.walletList){
                    this.walletList.map((item)=>{
                        !item.icon && (item.icon='wallet-icon'+Math.floor((Math.random()*5)+1))
                    });
                    this.getBalance();
                    this.getTotalBalance();
                }
                clearInterval(window.balanceTasksTimer);
                window.balanceTasksTimer = setInterval(this.getBalance,5*1000);
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
                this.updateCurWallet(item.address);
                if(this.curIndex==1){
                    this.$router.push('/o-wallet-details');
                }else{
                    this.$router.push('/o-wallet-share-detail')
                }
            },
            getBalance(){
                let _this = this;
                if(this.walletList){
                    this.walletList.forEach((item,index)=>{
                        contractService.web3.eth.getBalance(item.address,(err,data)=>{
                            let balance=contractService.web3.fromWei(data.toString(10), 'ether');
                            item.balance = (Math.floor(Number(balance) * 100) / 100).toFixed(2);
                            _this.$set(_this.walletList,index,item);
                        });
                    });
                    this.getTotalBalance();
                }
            },
            setImage(iconIndex){
                this.walletIcon = 'background: url('+require('./images/Oval'+Math.floor((Math.random()*5)+1)+'.png')+') no-repeat center center'
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
                if(name.length>16){
                    return name.slice(0,16)+'...'
                }else{
                    return name;
                }
            }
        },
        beforeDestroy() {
            clearInterval(window.balanceTasksTimer);
            window.balanceTasksTimer = null;
        },
        destroyed() {
            clearInterval(window.balanceTasksTimer);
            window.balanceTasksTimer = null;
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
                // width: 230px;
                width: 32%;
                // height: 130px;
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
                .wallet-icon{
                    width: 68px;
                    height: 130px;
                    // background:url("./images/Oval1.png") no-repeat center center;
                    // background: no-repeat center center;
                    background-repeat:no-repeat;
                    background-position: center center;
                }

                .wallet-icon1{
                    background-image: url('./images/Oval1.png');
                }
                .wallet-icon2{
                    background-image: url('./images/Oval2.png');
                }
                .wallet-icon3{
                    background-image: url('./images/Oval3.png');
                }
                .wallet-icon4{
                    background-image: url('./images/Oval4.png');
                }
                .wallet-icon5{
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
        .w-80{
            width: 77px;
        }
        .ml-40{
            margin-left: 40px;
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
    }
</style>
