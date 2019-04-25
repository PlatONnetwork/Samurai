<template>
    <div class="wrapper"  style="-webkit-app-region: drag" ref="bg">
        <video src="static/video/bg.mov" height="100.1%" autoplay="autoplay" loop="loop" class="video" muted></video>
        <!--<span class="txt-bg" v-if="initialUse==false">Welcome to Samurai </span>-->
        <span class="logo"></span>
        <div class="beginCenter" v-if="loadCompolete" style="height:100%">
            <div v-if="initialUse">
                <div class="content">
                    <!--<h1>{{$t("settings.networkConfig")}}</h1>-->
                    <p class="title">{{$t("settings.networkConfig")}}</p>
                    <ul :class="[testMode?'test-mode':'','net-list']" style="-webkit-app-region: no-drag">
                        <li :class="[netType=='main'?'active':'','main']">
                            <h2 class="net-title">{{$t("settings.mainTitle")}}</h2>
                            <p class="net-icon">
                                <span></span>
                            </p>
                            <p class="net-content">{{$t("settings.mainContent")}}</p>
                            <p :class="[lang=='en'?'en-btn':'cn-btn','btn']" style="-webkit-app-region: no-drag">
                                <el-button class="disabled" :loading="connectLoading&&netType=='main'" :disabled="connectLoading&&netType!='main'">{{$t("settings.joiningNet")}}</el-button>
                            </p>
                            <p class="coming">{{$t("settings.comingSoon")}}</p>
                        </li>
                        <li @click="selNet('test')" :class="[netType=='test'?'active':'','test']">
                            <h2 class="net-title">{{$t("settings.testTitle")}}</h2>
                            <p class="net-icon">
                                <span></span>
                            </p>
                            <p class="net-content">{{$t("settings.testContent")}}</p>
                            <p :class="[lang=='en'?'en-btn':'cn-btn','btn btn-db']" style="-webkit-app-region: no-drag">
                                <el-button @click="next(1)" :loading="connectLoading&&netType=='amigo'" :disabled="connectLoading&&netType!='amigo'">{{$t("settings.joiningNet1")}}</el-button>
                                <el-button @click="next(2)" :loading="connectLoading&&netType=='batalla'" :disabled="connectLoading&&netType!='batalla'">{{$t("settings.joiningNet2")}}</el-button>
                     <!--           <el-button v-if="testMode" @click="next(4)" :loading="connectLoading&&netType=='test'" :disabled="connectLoading&&netType!='test'">{{$t("settings.joiningNet3")}}</el-button>
                                <el-button v-if="testMode" @click="next(5)" :loading="connectLoading&&netType=='innerdev'" :disabled="connectLoading&&netType!='innerdev'">{{$t("settings.joiningNet4")}}</el-button>-->
                            </p>
                        </li>
                        <li @click="selNet('custom')" :class="[netType=='custom'?'active':'','private']">
                            <h2 class="net-title">{{$t("settings.priTitle")}}</h2>
                            <p class="net-icon">
                                <span></span>
                            </p>
                            <p class="net-content">{{$t("settings.priContent")}}</p>
                            <p :class="[lang=='en'?'en-btn':'cn-btn','btn']" style="-webkit-app-region: no-drag">
                                <el-button @click="next(3)" :loading="connectLoading&&netType=='custom'" :disabled="connectLoading&&netType!='custom'">{{$t("settings.createPrivateNet")}}</el-button>
                            </p>
                        </li>
                    </ul>
                </div>
            </div>
            <div v-else class="welcome-page">
                <p class="welcomeP">Welcome to Samurai  </p>
                <p class="btn-box2"  style="-webkit-app-region: no-drag"><el-button class="enter-button" :disabled="nodeState==0" @click="goToMain()">{{$t("sideBar.enter")}}>></el-button></p>
                <span class="cur-net" v-if="network && network.type">{{network.type=='custom'?chainName:(network.type=='test'?'':(network.type.slice(0,1).toUpperCase()+network.type.slice(1)))+' Testnet'}}</span>
            </div>
        </div>
        <div v-if="!loadCompolete || (nodeState==0 && !initialUse)" class="loading">
            <div class="loading-icon">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
        <div class="custom-header" style="-webkit-app-region: drag">
            <span @click="close" style="-webkit-app-region: no-drag"> <i class="close"></i></span>
            <!--<span @click="max" style="-webkit-app-region: no-drag" class="magnify">&nbsp;</span>-->
            <span @click="max" style="-webkit-app-region: no-drag"><i class="max" ref="max"></i></span>
            <span @click="min" style="-webkit-app-region: no-drag"><i class="min"></i></span>
        </div>
    </div>
</template>

<script>
    import nodeManager from '@/services/node-manager';
    import {mapState, mapActions, mapGetters} from 'vuex';
    import fs from 'fs';
    import contractService from '@/services/contract-servies';
    import Settings from '@/services/setting'
    import { ipcRenderer } from 'electron';
    import { url } from 'inspector';

    export default {
        name: 'landing-page',
        //实例的数据对象
        data() {
            return {
                netType:'amigo',
                loadCompolete:false,
                fromPath:'',
                connectLoading:false,
                // isBig: true,
                // bg:"url('./images/bj.png')"
            }
        },
        //数组或对象，用于接收来自父组件的数据
        props: {

        },
        //计算
        computed: {
            ...mapGetters(['initialUse','network','chainName','isMaximized','testMode','lang','nodeState'])
        },
        beforeRouteEnter(to, from, next){
            nodeManager.getSystemPath().then(()=>{
                next(vm=>{
                    vm.fromPath=from.path;
                    vm.netType = from.path=='/customNet'?'custom':'amigo'
                });
            });
        },
        //方法
        methods: {
            ...mapActions(['updateState','updateNetSetting','changeWindow','clearTotalBalance']),
            selNet(type){
                // if(type=='main') return;
                if(this.connectLoading) return;
                this.netType=type;
            },
            next(num){
                let _this = this;
                Settings.saveUserData('type',this.netType);
                this.netType=num==1?'amigo':num==2?'batalla':num==3?'custom':num==4?'test':num==5?'innerdev':'';
                if(this.netType=='custom'){
                    this.$router.push('/customNet')
                }else if(this.netType=='batalla' || this.netType=='amigo' || this.netType=='test' || this.netType=='innerdev'){
                    this.connectLoading = true;
                    nodeManager.conncetNet(this.netType).then(()=>{
                        this.connectLoading = false;
                        console.log('index.vue 连接测试网络成功');
                    }).catch(()=>{
                        this.connectLoading = false;
                    })
                }
            },
            goToMain(){
                this.$router.push('/home')
            },
            min(){
                ipcRenderer.send('minimize-window');
            },
            close(){
                ipcRenderer.send('hide-window');
            },
            // 最大化
            max(){
                if(this.isMaximized){
                    // this.$refs.bg.style.background = "url("+require('./images/maxbg.png')+") no-repeat center center";
                    this.$refs.bg.style.height = "100%";
                    this.$refs.max.style.background="url("+require('./images/restore_white.svg')+") no-repeat center bottom"
                    ipcRenderer.send('maximize-window');
                }else{
                    // this.$refs.bg.style.background = "url("+require('./images/bj.png')+") no-repeat center center";
                    this.$refs.max.style.background="url("+require('./images/maximize_white.svg')+") no-repeat center bottom"
                    ipcRenderer.send('orignal-window');
                }
                // this.isBig = !this.isBig
                this.changeWindow(this.isMaximized)
            },
            init(){
                let localType,localIp = Settings.loadUserData('ip'),localPort,chainName;
                if(this.fromPath=='/setting'){
                    let query = this.$route.query;
                    localType = query.type;
                    localPort = query.type=='custom'?query.chainPort:Settings.loadUserData('port');
                    chainName = query.type=='custom'?query.chainName:Settings.loadUserData('chainName');
                }else{
                    localType = Settings.loadUserData('type');
                    localPort = Settings.loadUserData('port');
                    chainName = Settings.loadUserData('chainName');
                }
                this.loadCompolete = false;
                console.warn('created-----init---port-type',localPort,localType);
                if(localType=='custom' && localPort && chainName){
                    nodeManager.startNode(chainName,localPort).then(()=>{
                        if(this.fromPath=='/setting'){
                            this.$message.success(this.$t('settings.netSet')+chainName+this.$t('settings.networkSet'));
                        }
                        this.loadCompolete = true;
                    }).catch(()=>{
                        this.loadCompolete = true;
                    }).finally(()=>{
                        this.loadCompolete = true;
                    })
                }else if(localType=='batalla' || localType=='amigo' || localType=='test'|| localType=='innerdev'){
                    //todo  后续注释掉
                    // contractService.setProvider('http://10.10.8.209:6789','http').then(()=>{
                    // // contractService.setProvider('http://127.0.0.1:7793','http').then(()=>{
                    //     this.loadCompolete = true;
                    //     this.updateState(2);
                    //     this.updateNetSetting({
                    //             initialUse:false,
                    //             network:{
                    //                 type:'test',
                    //                 ip:'',
                    //                 port:'26793'
                    //             }
                    //         });
                    // }).catch((err)=>{
                    //     this.loadCompolete = true;
                    //     this.updateState(0);
                    //     alert(err);
                    // });
                    // return;

                    nodeManager.conncetNet(localType).then(()=>{
                        this.loadCompolete = true;
                        if(this.fromPath=='/setting'){
                            this.$message.success(this.$t('settings.netSet')+localType+this.$t('settings.networkSet'));
                        }
                        console.log('index 连接测试网络成功');
                    }).catch((e)=>{
                        this.loadCompolete = true;
                    }).finally(()=>{
                        this.loadCompolete = true;
                    })
                }else{
                    this.loadCompolete = true;
                }
                let path = Settings.userDataPath+'keyPath';
                fs.exists(path, (exists) => {
                    console.log('index----',exists);
                    if(!exists){
                        let paths={
                            main:Settings.userDataPath+'net_main/keystore/',
                            // test:Settings.userDataPath+'net_test/keystore/',
                            amigo:Settings.userDataPath+'net_amigo/keystore/',
                            batalla:Settings.userDataPath+'net_batalla/keystore/',
                            custom:Settings.userDataPath+'net_custom/chain/',
                        };
                        if(this.testMode){
                            paths['test']=Settings.userDataPath+'net_test/keystore/';
                            paths['innerdev']=Settings.userDataPath+'net_innerdev/keystore/';
                        }
                        Settings.saveUserData('keyPath',JSON.stringify(paths));
                        Settings.setKeyPath(localType);
                    }else{
                        let keyType = localType;
                        if(keyType=='custom'){
                            keyType='custom_'+this.chainName;
                        }
                        Settings.setKeyPath(keyType);
                    }
                });
            }
        },
        //生命周期函数
        mounted() {
            Settings.init().then(()=>{
                this.init();
            })
        },
        beforeMount() {

        },
        //监视
        watch: {
            network :function(val){
                this.clearTotalBalance();
            }
        },
        //组件
        components: {

        },
        //过滤器
        filters: {

        },
        //自定义指令
        directive: {

        }
    }
</script>

<style lang="less" scoped>
    .wrapper{
        position:relative;
        // height:672px;
        height: 100%;
        color:#fff;
        // background:url("./images/maxBg.png") no-repeat center center #112651;
        background-size: cover;
        overflow: hidden;
    }
    .video{
        position:absolute;
        z-index: 1;
    }
    .custom-header{
        position:absolute;
        top:0;
        right:0;
        z-index:999;
        padding-right:5px;
        height:50px;
        span{
            float:right;
            margin-top:15px;
            margin-right:15px;
            font-size:10px;
            color:#fff;
            cursor:pointer;
        }
    }
    .magnify{
        width:15px;
        height:15px;
        background: url("./images/magnify.png") no-repeat center;
        background-size: 12px;
    }
    .loading{
        /*position: relative;*/
        /*padding-top:200px;*/
        position: fixed;
        top:50%;
        transform: translate(-50%,-90%);
        left: 50%;
        text-align: center;
        z-index: 9;
    }
    .txt-bg{
        position:absolute;
        top:50%;
        left:50%;
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        height:50px;
        border:solid 1px #333;
        font-size:44px;
        opacity:0.1;
        letter-spacing: 1.38px;
        z-index: 3;
    }
    .logo{
        position:absolute;
        top:13.2px;
        left:23.8px;
        width:119px;
        height:25px;
        background: url("./images/logoW.svg") no-repeat center center;
        z-index: 9;
    }
    .beginCenter{
        position: relative;
        display: flex;
        justify-content: center;
        // flex-direction: column;
        z-index: 9;
    }
    .content{
        padding:62px 46px 0;
        h1{
            top:33px;
            position: absolute;
            color: #FFFFFF;
            opacity: 0.1;
            font-size: 44px;
            letter-spacing: 1.38px;
        }
        .title{
            font-size: 24px;
        }
    }
    .net-list{
        margin-top:30px;
        display:flex;
        li{
            &:hover{
                background-image: linear-gradient(40deg, rgba(51,62,128,0.9) 0%, rgba(65,93,149,0.9) 100%);
                &.test .net-icon >span{
                    background: url('./images/icon_test.svg') no-repeat center center rgba(255,255,255,0.4);
                }
                &.private .net-icon >span{
                    background: url('./images/icon_pri.svg') no-repeat center center rgba(255,255,255,0.4);
                }
            }
            position:relative;
            padding:30px 0 40px;
            margin-right:24px;
            width:260px;
            height:400px;
            font-size:12px;
            cursor:pointer;
            background-image: linear-gradient(40deg, rgba(51,62,128,0.7) 0%, rgba(65,93,149,0.7) 100%);
            border-radius: 4px;
            .title{
                padding-bottom:6px;
                margin-bottom:5.5px;
                font-size:14px;
                border-bottom:solid 1px rgba(255,255,255,0.15)
            }
            .title.one{
                display:block;
                white-space: nowrap;
            }
            .gray{
                position: relative;
                top: 8px;
                display:inline-block;
                font-size:20px;
                transform: scale(0.5);
                transform-origin:0 0;
            }
            .net-title{
                height:28px;
                line-height:28px;
                font-size: 20px;
                color: #FFFFFF;
                text-align: center;
                font-weight: normal;
            }
            .net-content{
                padding:0 19px;
                height: 49px;
                font-size: 13px;
                color: #FFFFFF;
                letter-spacing: 0.54px;
                text-align: center;
            }
            .btn{
                position:absolute;
                bottom:40px;
                width:100%;
                text-align: center;
                .el-button{
                    padding:0 15px;
                    width:auto;
                    height:36px;
                    text-align: center;
                    color:#fff;
                    font-size:14px;
                    border:none;
                    background: #0077FF;
                    letter-spacing: 0.44px;
                    &:not(.disabled):hover{
                         background: #4897F6;
                    }
                    &.disabled,&.is-disabled{
                        opacity: 0.5;
                        &:hover{
                             background: #0077FF;
                             cursor:not-allowed;
                         }
                    }
                }
            }
            .btn-db{
                bottom:2px;
            }
            .en-btn{
                .el-button{
                    min-width: 190px;
                }
            }
            .cn-btn{
                .el-button{
                    min-width: 150px;
                }
            }
            .coming{
                position:absolute;
                bottom:15px;
                width:100%;
                text-align: center;
                font-size:10px;
            }
        }
        .active{
            /*opacity: 0.9;*/
            background-image: linear-gradient(40deg, rgba(51,62,128,0.9) 0%, rgba(65,93,149,0.9) 100%);
        }
        .net-icon{
            margin:24px 25px 9px;
            height:150px;
            text-align: center;
            border-bottom:solid 1px rgba(255,255,255,0.15);
            >span{
                display: inline-block;
                width:116px;
                height:116px;
                border-radius: 116px;
            }
        }
        .main{
            background-image: linear-gradient(40deg, #333E80 0%, #415D95 100%);
            opacity: 0.5;
            cursor:not-allowed;
            .net-icon >span{
                background: url('./images/icon_main.svg') no-repeat center center rgba(255,255,255,0.1);
            }
        }
        .test{
            .net-icon >span{
                background: url('./images/icon_test_2.svg') no-repeat center center rgba(255,255,255,0.1);
            }
            &.active .net-icon >span{
                 background: url('./images/icon_test.svg') no-repeat center center rgba(255,255,255,0.4);
            }
        }
        .private{
            .net-icon >span{
                background: url('./images/icon_pri_2.svg') no-repeat center center rgba(255,255,255,0.1);
            }
            &.active .net-icon >span{
                 background: url('./images/icon_pri.svg') no-repeat center center rgba(255,255,255,0.4);
             }
        }
    }
    /*.test-mode.net-list{
        margin-top: 6px;
        li{
            height:472px;
        }
    }*/
    .btn-box{
        margin-top:80px;
        text-align:center;
        .el-button{
            width:170px;
            height:40px;
            background: #EA106E;
            color:#fff;
            border:none;
            letter-spacing: 0.44px;
            &:hover{
                background: #EA107E;
             }
        }
    }
    .btn-box2{
        text-align:center;
        .el-button{
            width:170px;
            height:40px;
            background: #0077FF;
            margin:52px 0 0 0;
            color:#fff;
            border:none;
            letter-spacing: 0.44px;
            &:hover{
                background: #0077FF;
             }
        }
    }
    .welcome-page{
        height: 400px;
        padding: 119px 0 100px 0;
        margin: 58px 0 0 0;
        background: url("./images/logo.svg") no-repeat center top;
        background-size:106px 96px;
        align-self: center;
        p{
            font-size:40px;
            text-align: center;
        }
        .cur-net{
            position:absolute;
            right:29px;
            bottom:30px;
            padding:0 15.5px;
            height:28px;
            line-height:28px;
            border: 1px solid #0077FF;
            border-radius: 4px;
        }
        .enter-button{
            font-weight:normal;
            font-size:17px;
        }
    }
    .min{
        display: inline-block;
        width: 10px;
        height: 8px;
        background: url("./images/minimize_white.svg") no-repeat center center
        }
    .max{
        display: inline-block;
        width: 10px;
        height: 10px;
        background: url("./images/maximize_white.svg") no-repeat center bottom
    }
    .close{
        display: inline-block;
        width: 10px;
        height: 10px;
        background: url("./images/close_white.svg") no-repeat center bottom
    }
    .welcomeP{
        height:56px;
        line-height:56px;
        font-weight:600;
        letter-spacing: 1.26px;
    }
    .loading-icon{
        width: 80px;
        height: 40px;
        margin: 0 auto;
        margin-top:100px;
        span{
            display: inline-block;
            width: 8px;
            height: 100%;
            border-radius: 4px;
            background: #FFFFFF;
            -webkit-animation: load 0.75s ease infinite;
        }
    }
    @-webkit-keyframes load{
        0% {
            transform: scaley(1.0);
        }
        80% {
            transform: scaley(0.3);
        }
        90% {
            transform: scaley(1.0);
        }
    }
    .loading-icon span:nth-child(1){
        -webkit-animation-delay:0.5s;
    }
    .loading-icon span:nth-child(2){
        -webkit-animation-delay:0.25s;
    }
    .loading-icon span:nth-child(3){
        -webkit-animation-delay:0.9s;
    }
    .loading-icon span:nth-child(4){
        -webkit-animation-delay:0.25s;
    }
    .loading-icon span:nth-child(5){
        -webkit-animation-delay:0.5s;
    }
    .el-button.is-loading:before{
        background-color:transparent;
    }
    .btn-db{
        .el-button{
            margin-left:0;
            margin-bottom:10px;
        }
    }
</style>
<style>
    .btn-box2 span{
        margin-bottom: 2px;
        display: inline-block;
    }
</style>
