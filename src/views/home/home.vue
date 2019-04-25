<template>
    <div class="wrapper">
        <div class="container">
            <div class="left">
                <div class="logo" style="-webkit-app-region: drag">
                    <!-- Samurai -->
                    <span class="lang"  style="-webkit-app-region: no-drag" @click="changeL">{{lang=='zh-cn'?'中':'EN'}}</span>
                </div>
                <side-bar></side-bar>
                <node-sync></node-sync>
                <span class="net-name" v-if="network && network.type">{{network.type=='custom'?chainName:(network.type=='test'?'':(network.type.slice(0,1).toUpperCase()+network.type.slice(1)))+' Testnet'}}</span>
            </div>
            <div class="right">
                <v-header>
                <span v-if="headR" class="felx-box">
                    <span class="header icon-back" v-if="flag==='child'" style="-webkit-app-region: no-drag;cursor: pointer;" @click="goBack"></span>
                    <span v-if="path=='/o-wallet-accept'" class="accept">{{title | PathName}}-</span>
                    <sel-self @filterWallet="filterWallet" :optionVs="path=='/o-wallet-details'?WalletListGetter:filterShareWallet" :defaultSel="curWallet" style="-webkit-app-region: no-drag"  @back="selAWallet"></sel-self>
                </span>
                    <span v-else>
                    <span class="header icon-back" v-if="flag=== 'child'" style="-webkit-app-region: no-drag;cursor: pointer;" @click="goBack"></span>
                    <span class="header dark-black">{{title | PathName}}</span>
                    <span v-if="path=='/vote-detail'" class="accept normal"> - {{nodeName}}</span>
                </span>
                </v-header>
                <router-view></router-view>
                <div class="autpupdater-content" v-if="showAutpupdater">
                    <p class="autpupdater-title">{{$t('settings.note')}}
                        <i class="icon-close" @click="showAutpupdater=0"></i>
                    </p>
                    <div class="text-content" v-if="showAutpupdater==1">
                        <span>{{$t('settings.hasUpdate')}}</span>
                        <el-button type="primary" @click="downloadUpdate" :disabled="disabled">{{$t("settings.updater")}}</el-button>
                    </div>
                    <p v-if="showAutpupdater==2">{{$t('settings.noUpdate')}}</p>
                    <p v-if="showAutpupdater==3">{{percent}}%</p>
                    <p v-if="showAutpupdater==4">{{updateInfo}}</p>
                </div>
            </div>
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
    import { ipcRenderer } from "electron";

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
                filterShareWallet:[],
                showAutpupdater:0,
                downloadPath:''
            }
        },
        computed: {
            ...mapGetters(['network','lang','WalletListGetter','curWallet','chainName','nodeState','nodeName','shareWalletList'])
        },
        watch: {
          $route: function (n, o) {
              // this.title = this.$t(n.name);
              console.log(n);
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
        beforeRouteEnter(to, from, next){
            nodeManager.getSystemPath().then(()=>{
                next();
            });
        },
        created(){
            // this.title = this.$t(this.$route.name);
            this.title = this.$route.name;
            this.flag = this.$route.meta.flag;
        },
        mounted(){
            window.addEventListener("online",()=> {
                this.$message.success(this.$t('wallet.networkConnection'));
            });

            window.addEventListener("offline",()=> {
                this.$message.error(this.$t('wallet.networkTimeout'))
            });

            this.$root.$on('checkUpdateVersion',this.checkUpdate)
            this.filterShareWallet = this.shareWalletList;
            if(this.nodeState==2)return;
            Settings.init().then(()=>{
                let localType = Settings.loadUserData('type');
                let localIp = Settings.loadUserData('ip');
                let localPort = Settings.loadUserData('port');
                let chainName = Settings.loadUserData('chainName');
                if(localType=='custom'&&localPort){
                    nodeManager.startNode(chainName,localPort);
                }else if(localType=='amigo' || localType=='batalla' || localType=='test' || localType=='innerdev'){
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
            filterWallet(){
                this.filterShareWallet = this.shareWalletList.filter((item)=>{
                    return item.processWidth == 100;
                });
            },
            openUrl(url){
                const shell = require('electron').shell;
                shell.openExternal(url);
            },
            checkUpdate(){
                console.log('checkUpdateVersion')
                ipcRenderer.send("checkForUpdate");
                ipcRenderer.on("message", (event, data) => {
                    console.log("message",event, data);
                    this.showAutpupdater=4;
                    this.updateInfo=data.msg
                });

                ipcRenderer.on("isUpdateNow", (event,data) => {
                    console.log(event,data)
                    this.showAutpupdater=1
                    // this.downloadPath=`http://192.168.9.85:10080/tools/${data.data.path}`
                    this.downloadPath=`https://download.platon.network/0.6/${data.data.path}`
                });
                ipcRenderer.on("noUpdateNow", (event,data) => {
                    console.log(event,data)
                    this.showAutpupdater=2
                    this.downloadPath=''
                });
            },
            downloadUpdate(){
                // this.showAutpupdater=3
                // ipcRenderer.send("downloadUpdate");
                // ipcRenderer.on("downloadProgress", (event, progressObj) => {
                //     console.log("downloadProgress",progressObj);
                //     this.percent=progressObj.percent.toString().substr(0,3)
                //     this.disabled=true
                // });
                this.showAutpupdater=0
                this.openUrl(this.downloadPath)
            }
        },
    }
</script>

<style lang="less" scoped>
    @mainColor: #112561;
    .wrapper{
        padding:4px;
        height:100%;
        &:before{
             content: '';
             position: fixed;
             top: 4px;
             left: 4px;
             z-index: 9;
             width: calc(~"100% - 8px");
             height: calc(~"100% - 8px");
             box-shadow: 0 0 5px 2px rgba(203,210,221,0.5);
         }
         .container{
             position:relative;
             z-index: 99;
             display: flex;
             height:100%;
             overflow:hidden;
         }
        .left{
            position: relative;
            width: 180px;
            min-width:180px;
            height: auto;
            background: #fff;
            .logo{
                width: 100%;
                height: 60px;
                box-sizing: border-box;
                padding:21px 0 21px 49px;
                color:#fff;
                font-size:15px;
                border-bottom: 1px solid #ECF1F8;
                background: url("./images/logoSide.svg") no-repeat 21px 19px;
            }
            .lang{
                float:right;
                margin-right:10px;
                width:20px;
                height:20px;
                line-height:20px;
                text-align:center;
                background: #0077FF;
                border-radius: 4px;
                font-size:12px;
                cursor:pointer;
            }
            .net-name{
                position:absolute;
                // left:50%;
                // transform: translatex(-50%);
                bottom:0;
                // padding:0 16.5px;
                width: 100%;
                height:30px;
                line-height:30px;
                color:#24272B;
                font-size: 11px;
                // border: 1px solid #EA106E;
                // border-radius: 4px;
                // overflow: hidden;
                // text-overflow: ellipsis;
                // white-space: nowrap;
                background: #D3D8E1;
                text-align: center;
                padding: 0 16px;
            }
        }
        .net-name:before{
            content: "";
            background: url("./images/4.icon_network.svg") no-repeat center 1px;
            width: 14px;
            height: 18px;
            background-size: 14px 14px;
            display: inline-block;
            vertical-align: middle;

        }
        .right{
            flex: 1;
            background: #F3F8FF;
            overflow-x:hidden;
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
    .normal{
        margin-left:5px;
        font-weight:normal;
    }
    .autpupdater-content{
        position: absolute;
        bottom: 6.4%;
        right: 1.4%;
        width: 390px;
        background: #ECF1F8;
        box-shadow: 0 1px 6px 0 rgba(82,87,104,0.10);
        border-radius: 4px;
        padding: 10px 15px;
        .el-button{
            width: 60px;
            height: 24px;
            line-height: 24px;
            font-size: 10px;
            // margin: -8px 0 0 0;
        }
        .icon-close{
            position:absolute;
            top:5px;
            right:7px;
            width:9px;
            height:9px;
            cursor:pointer;
            background: url("./images/close.svg") no-repeat center center;
            background-size: contain;
        }
        .text-content{
            display: flex;
            justify-content: space-between;
        }
    }
    .autpupdater-title{
        padding: 0 0 6px 0;
    }

</style>

