<template>
    <div class="wrapper"  style="-webkit-app-region: drag" ref="bg">
        <span class="txt-bg" v-if="initialUse==false">Welcome to Samurai </span>
        <span class="logo"></span>
        <div class="beginCenter" v-if="loadCompolete" style="height:100%">
            <div v-if="initialUse">
                <div class="content">
                    <h1>{{$t("settings.networkConfig")}}</h1>
                    <p>{{$t("settings.networkConfig")}}</p>
                    <ul class="net-list" style="-webkit-app-region: no-drag">
                        <li :class="[netType=='main'?'active':'','main']">
                            <h2 class="net-title">{{$t("settings.mainTitle")}}</h2>
                            <hr>
                            <p class="net-content">{{$t("settings.mainContent")}}</p>
                        </li>
                        <li @click="selNet('test')" :class="[netType=='test'?'active':'']">
                            <h2 class="net-title">{{$t("settings.testTitle")}}</h2>
                            <hr>
                            <p class="net-content">{{$t("settings.testContent")}}</p>
                        </li>
                        <li @click="selNet('custom')" :class="[netType=='custom'?'active':'']">
                            <h2 class="net-title">{{$t("settings.priTitle")}}</h2>
                            <hr>
                            <p class="net-content">{{$t("settings.priContent")}}</p>
                        </li>
                    </ul>
                    <p class="btn-box" style="-webkit-app-region: no-drag">
                        <el-button @click="next()" :loading="connectLoading">{{$t("settings.joiningNet")}}</el-button>
                    </p>
                </div>
            </div>
            <div v-else class="welcome-page">
                <p class="welcomeP">Welcome to Samurai  </p>
                <p class="btn-box2"  style="-webkit-app-region: no-drag"><el-button class="enter-button" @click="goToMain()">{{$t("sideBar.enter")}}>></el-button></p>
                <span class="cur-net">{{network.type=='custom'?chainName:(network.type.toUpperCase()+'-NET')}}</span>
            </div>
        </div>
        <div v-else class="loading">
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
                netType:'test',
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
            ...mapGetters(['initialUse','network','chainName','isMaximized'])
        },
        beforeRouteEnter(to, from, next){
            next(vm=>{
                vm.fromPath=from.path;
                vm.netType = from.path=='/customNet'?'custom':'test'
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
            next(){
                let _this = this;
                Settings.saveUserData('type',this.netType);
                if(this.netType=='custom'){
                    this.$router.push('/customNet')
                }else if(this.netType=='main' || this.netType=='test'){
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
                    })
                }else if(localType=='main' || localType=='test'){
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
                            test:Settings.userDataPath+'net_test/keystore/',
                            custom:Settings.userDataPath+'net_custom/chain/',
                        };
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
        background:url("./images/maxBg.png") no-repeat center center #112651;
        background-size: cover;
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
        padding-top:200px;
        text-align: center;
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
    }
    .logo{
        position:absolute;
        top:13.2px;
        left:23.8px;
        width:119px;
        height:25px;
        background: url("./images/logoW.svg") no-repeat center center;
    }
    .beginCenter{
        display: flex;
        justify-content: center;
        // flex-direction: column;
    }
    .content{
        padding:68px 46px 0;
        h1{
            top:33px;
            position: absolute;
            color: #FFFFFF;
            opacity: 0.1;
            font-size: 44px;
            letter-spacing: 1.38px;
        }
    }
    .net-list{
        margin-top:30px;
        display:flex;
        li{
            margin-right:24px;
            width:280px;
            height:160px;
            border-radius: 10px;
            font-size:12px;
            cursor:pointer;
            border:solid 5px #112651;
            &:first-of-type{
                background: url("./images/Card1.png") no-repeat center center;
             }
            &:nth-of-type(2){
                background: url("./images/Card2.png") no-repeat center center;
             }
            &:last-of-type{
                margin-right:0;
                background: url("./images/Card3.png") no-repeat center center;
             }
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
                font-size: 14px;
                color: #FFFFFF;
                letter-spacing: 0;
                margin: 17px 0 0 60px;
            }
            .net-content{
                width: 195px;
                margin: 0 0 0 60px;
                font-size: 12px;
                color: #FFFFFF;
            }
        }
        hr{
            width: 203px;
            margin-right: 9px;
            opacity: 0.15;
            background: #FFFFFF;
        }
        .active{
            background-image: linear-gradient(40deg, #333E80 0%, #415D95 100%);
            border:solid 5px #18c2e9;
            box-shadow:0 0 5px 2px #456492;
        }
        .main{
            opacity: 0.5;
            background-image: linear-gradient(40deg, #333E80 0%, #415D95 100%);
            cursor:not-allowed;;
        }
        .main{
            opacity: 0.5;
            background-image: linear-gradient(40deg, #333E80 0%, #415D95 100%);
            border-radius: 4px;
        }
    }
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
            background: #EA106E;
            margin:105px 0 0 0;
            color:#fff;
            border:none;
            letter-spacing: 0.44px;
            &:hover{
                background: #EA107E;
             }
        }
    }
    .welcome-page{
        height: 400px;
        padding: 112px 0 100px 0;
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
            border: 1px solid #EA106E;
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
        padding-top: 24px;
        height: 10px;
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
</style>
