<template>
    <div class="side-bar">
       <el-menu class="menu" default-active="1" @select="handleSelect">
            <el-menu-item v-for="(item, index) in menu"
                    :key='index'
                    :style="{color: item.icon? 'inherint': '#24272B',opacity:item.parent?'1':'0.6',pointerEvents:item.parent?'none':'auto',fontWeight:item.parent?'600':'normal'}"
                    @click.native="changeRoute(item.path)" :index="index + ''">
                    <i v-if="item.icon" class="iconfont" :class="item.icon"></i> {{$t(item.name)}}
            </el-menu-item>
       </el-menu>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex';

    export default {
        name: 'sideBar',
        data () {
            return {

            }
        },
        computed:{
            ...mapGetters(['lang']),
            menu:function(){
                return [{
                    name: 'sideBar.main',
                    icon: '',
                    path:'/home',
                    parent:true
                }, {
                    name: 'sideBar.wallet',
                    icon: 'icon-wallet',
                    path: '/o-wallet-list'
                }, {
                    name: 'sideBar.send',
                    icon: 'icon-send',
                    path: '/o-wallet-send'
                },{
                    name: 'sideBar.trade',
                    icon: 'icon-trade',
                    path: '/trade-list'
                },{
                    name: 'sideBar.contract',
                    icon: 'icon-contract',
                    path: '/contract'
                 },{
                    name: 'sideBar.application',
                    icon: '',
                    path:'',
                    parent:true
                 },{
                    name: 'sideBar.validatorNode',
                    icon: 'icon_vote',
                    path:'/validator-node',
                },
                    // {
                    //     name: '投票',
                    //     icon: 'icon-vote',
                    //     path: ''
                    // },
                    {
                        name: this.$t('sideBar.more'),
                        icon: '',
                        path: '',
                        parent:true
                    },
                    {
                        name: this.$t('sideBar.setting'),
                        icon: 'icon-Shape',
                        path: '/setting'
                    }
                    ,{
                        name: this.$t('sideBar.help'),
                        icon: 'icon-help',
                        path: ''
                    }
                ]
            }
        },
        methods: {
            ...mapActions(['updateCurWallet','updateWalletType','updateTradeType']),
            changeRoute(path) {
                this.updateCurWallet('');
                this.updateTradeType(null);
                this.updateWalletType(1);
                this.$router.push(path);
            },
            handleSelect(key) {
                if(key==9 && this.lang=='zh-cn'){
                    // 中文wiki
                    // this.openUrl('https://github.com/PlatONnetwork/wiki/wiki/%5BChinese-Simplified%5D-Samurai-%E9%92%B1%E5%8C%85')
                    this.openUrl('https://developer.platon.network/#/?lang=zh')
                }
                else if(key==9 && this.lang=='en'){
                    // 英文文wiki
                    // this.openUrl('https://github.com/PlatONnetwork/wiki/wiki/%5BEnglish%5D-Samurai-Wallet')
                    this.openUrl('https://developer.platon.network/#/?lang=en')
                }
            },
            openUrl(url){
                const shell = require('electron').shell;
                shell.openExternal(url);
            },
        }
    }
</script>

<style lang="less" scoped>
    .side-bar{
        width: 100%;
        // .menu{
        //     background-color: #071649;
        // }
        .icon{
            display:block;
            width:100%;
            height:40px;
        }
        .icon-wallet{
            padding-left:28.5px;
            background: url("./images/icon_wallet.svg") no-repeat left center;
        }
        .icon-trade{
            padding-left:28.5px;
            background: url("./images/icon_trading.svg") no-repeat left center;
        }
        .icon-contract{
            padding-left:28.5px;
            background: url("./images/icon_contract.svg") no-repeat left center;
        }
        .icon-Shape{
            padding-left:28.5px;
            background: url("./images/4.icon_Shape.svg") no-repeat left center;
        }
        .icon-help{
            padding-left:28.5px;
            background: url("./images/4.icon_help.svg") no-repeat left center;
        }
        .icon_vote{
            padding-left:28.5px;
            background: url("./images/icon_vote.svg") no-repeat left center;
        }
        .icon-send{
            padding-left:28.5px;
            background: url("./images/icon_Send.svg") no-repeat left center;
        }
    }

</style>
<style lang="less">
    .side-bar{
        .el-menu{
            background: #fff;
        }
        .is-active{
            font-weight:600!important;
        }
        .el-menu-item{
            height: 40px;
            line-height: 40px;
            font-size: 12px;
            color:#9EABBE;
            opacity:1!important;
            border-left: 2px solid transparent;
            &:hover{
                background: #ECF1F8;
            }
        }
        .el-menu-item.is-active {
            opacity:1!important;
            color: #24272B;
            background: #ECF1F8;
            border-left: 2px solid #0077FF;
            font-weight:600;
        }
    }
</style>
