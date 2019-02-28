<template>
    <div class="wrapper">
        <div class="left">
            <div class="logo" style="-webkit-app-region: drag">
                <!-- Samurai -->
                <span class="lang"  style="-webkit-app-region: no-drag" @click="changeL">{{lang=='zh-cn'?'中':'EN'}}</span>
            </div>
            <side-bar></side-bar>
            <node-sync></node-sync>
            <span class="net-name">{{network.type=='custom'?chainName:(network.type.toUpperCase()+'-NET')}}</span>
        </div>
        <div class="right">
            <v-header>
                <span v-if="headR" class="felx-box">
                    <span class="header icon-back" v-if="flag==='child'" style="-webkit-app-region: no-drag;cursor: pointer;" @click="goBack"></span>
                    <span v-if="path=='/o-wallet-accept'" class="accept">{{title | PathName}}-</span>
                    <sel-self :optionVs="WalletListGetter" :defaultSel="curWallet" style="-webkit-app-region: no-drag"  @back="selAWallet"></sel-self>
                </span>
                <span v-else>
                    <span class="header icon-back" v-if="flag=== 'child'" style="-webkit-app-region: no-drag;cursor: pointer;" @click="goBack"></span>
                    <span class="header dark-black">{{title | PathName}}</span>
                    <span v-if="path=='/vote-detail'" class="accept">-{{nodeName}}</span>
                </span>
            </v-header>
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
    import sideBar from '../../components/sideBar/sideBar'
    import nodeSync from '../../components/nodeSync/nodeSync'
    import vHeader from '../../components/header/header'
    import {mapGetters, mapActions} from 'vuex';
    import nodeManager from '@/services/node-manager';
    import Settings from '@/services/setting'
    import selSelf from '@/components/select';
    import contractService from '@/services/contract-servies';

    export default {
        name: "home",
        components: {
           sideBar,
            vHeader,
            nodeSync,
            selSelf
        },
        data() {
            return {
                flag: '',
                headR:false,
                path:'',
                title:'',
            }
        },
        computed: {
            ...mapGetters(['network','lang','WalletListGetter','curWallet','chainName','nodeState','nodeName'])
        },
        watch: {
          $route: function (n, o) {
              // this.title = this.$t(n.name);
              this.path = n.path;
              this.title = n.name;
              this.flag = n.meta.flag;
              if(n.path=='/o-wallet-details' || n.path=='/o-wallet-share-detail' || n.path=='/o-wallet-accept'){
                  this.headR = true;
              }else{
                  this.headR = false;
              }
          },
          network :function(val){
              this.WalletListAction(val.type);
          }
        },
        created(){
            // this.title = this.$t(this.$route.name);
            this.title = this.$route.name;
            this.flag = this.$route.meta.flag;
        },
        mounted(){
            if(this.nodeState==2)return;
            Settings.init().then(()=>{
                let localType = Settings.loadUserData('type');
                let localIp = Settings.loadUserData('ip');
                let localPort = Settings.loadUserData('port');
                let chainName = Settings.loadUserData('chainName');
                if(localType=='custom'&&localPort){
                    nodeManager.startNode(chainName,localPort);
                }else if(localType=='main' || localType=='test'){
                    //todo  后续注释掉
                    // contractService.setProvider('http://10.10.8.209:6789','http').then(()=>{
                    //     this.updateState(2);
                    //     this.updateNetSetting({
                    //         initialUse:false,
                    //         network:{
                    //             type:'test',
                    //             ip:'',
                    //             port:'26793'
                    //         }
                    //     });
                    // }).catch((err)=>{
                    //     this.updateState(0);
                    //     alert(err);
                    // });
                    // return;

                    nodeManager.conncetNet(localType).then(()=>{
                        console.log('home 连接测试网络成功');
                    })
                }
            });
        },
        methods: {
            ...mapActions(['WalletListAction','changeLang','updateCurWallet','updateState','updateNetSetting']),
            goBack(){
                if(this.path=='/my-node'){
                    this.$router.push('/validator-node');
                }else{
                    this.$router.back()
                }
            },
            changeL(){
                let destLang = this.lang=='zh-cn'?'en':'zh-cn';
                this.changeLang(destLang);
                this.$i18n.locale = destLang;
                window.i18nLocale = destLang;
            },
            selAWallet(data){
                console.warn('selAWallet--->',data);
            },
        },
    }
</script>

<style lang="less" scoped>
    @mainColor: #112561;
    .wrapper{
        height:100%;
        display: flex;
        .left{
            position:relative;
            width: 180px;
            height: auto;
            background-color: #071649;
            .logo{
                width: 100%;
                height: 63px;
                box-sizing: border-box;
                padding:21px 0 21px 49px;
                color:#fff;
                font-size:15px;
                background: url("./images/logoSide.svg") no-repeat 21px 19px @mainColor;
            }
            .lang{
                float:right;
                margin-right:10px;
                width:20px;
                height:20px;
                line-height:20px;
                text-align:center;
                background: #18C2E9;
                border-radius: 4px;
                font-size:12px;
                cursor:pointer;
            }
            .net-name{
                position:absolute;
                left:50%;
                transform: translatex(-50%);
                bottom:20px;
                padding:0 16.5px;
                max-width:96px;
                height:28px;
                line-height:28px;
                color:#fff;
                font-size:12px;
                border: 1px solid #EA106E;
                border-radius: 4px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
        .right{
            flex: 1;
            background-color: #f8fafd;
            .header{
                float: left;
                display: inline-block;
                min-width: 16px;
                height: 36px;
                line-height:36px;
            }
            .icon-back{
                margin-left:5px;
                margin-right: 6px;
                height:36px;
                line-height:36px;
                background: url("./images/icon-back.svg") no-repeat center center;
                background-size: 16px 16px;
            }
        }
    }
    .felx-box{
        display: flex;
        padding-left:1px;
    }
    .accept{
        position:relative;
        top:7px;
    }

</style>

