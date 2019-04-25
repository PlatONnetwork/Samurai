<template>
    <div class="setting">
       <p class="title">{{$t("settings.network")}}</p>
       <el-select v-model="netType" @change="changeNet" :placeholder="$t('wallet.selectHint')">
           <el-option value="main" :label="$t('settings.mainNet')" :disabled="true"></el-option>
           <el-option value="amigo" :label="$t('settings.testNet')"></el-option>
           <el-option value="batalla" :label="$t('settings.bataNet')"></el-option>
           <!--<el-option v-if="testMode" value="test" :label="$t('settings.innerNet')"></el-option>-->
           <!--<el-option v-if="testMode" value="innerdev" :label="$t('settings.innerdevNet')"></el-option>-->
           <el-option v-for="custom in customs" :label="custom.name" :value="'custom_'+custom.name"></el-option>
           <el-option value="创建私有链" :label="$t('settings.priNet')"></el-option>
       </el-select>
        <p class="title">{{$t("settings.lang")}}</p>
        <el-select v-model="language" @change="changeLang" :placeholder="$t('wallet.selectHint')">
            <el-option value="zh-cn" :label="$t('settings.zh')"></el-option>
            <el-option value="en" :label="$t('settings.en')"></el-option>
        </el-select>
        <p class="title">{{$t("settings.filePath")}}</p>
        <p class="des-txt">{{$t("settings.path")}}:{{currentPath}}<el-button @click="modifyPath">{{$t("settings.change")}}</el-button></p>
        <!--<input type="file" id="id" name="image" class="getImgUrl_file" @change="preview($event)">-->

        <p class="title">{{$t("settings.about")}}</p>
        <p :class="[lang=='en'?'txt-en':'','des-txt']">{{$t("settings.system")}}V{{version}}<el-button @click="checkUpdate" :disabled="updateDisabled">{{$t("settings.check")}}</el-button></p>
        <!--<p class="des-txt">{{$t("settings.applyTest")}} <el-button @click="apply">{{$t("settings.apply")}}</el-button></p>-->
        <p class="title">{{$t("settings.community")}}</p>
        <p class="icons">
            <span class="plane" @click="openUrl('https://t.me/PlatONHK')"></span>
            <span class="wechat" @click="openWechatPic()"></span>
            <span class="github" @click="openUrl('https://github.com/PlatONnetwork')"></span>
            <span class="weite" @click="openUrl('https://twitter.com/PlatON_Network')"></span>
            <span class="facebook" @click="openUrl('https://www.facebook.com/PlatONNetwork/')"></span>
            <span class="reddit" @click="openUrl('https://www.reddit.com/user/PlatON_Network')"></span>
            <span class="medium" @click="openUrl('https://medium.com/@PlatON_Network')"></span>
            <span class="babbitt" @click="openUrl('https://www.chainnode.com/forum/267')"></span>
            <span class="Money" @click="openUrl('https://bihu.com/people/1215832888')"></span>
        </p>

        <loading-component></loading-component>

        <div class="modal show-wechat" v-if="showWeChat">
            <div class="modal-main">
                <div class="modal-content">
                    <span class="icon-close" @click="showWeChat=false"></span>
                    <img src="./images/wechat.jpg" alt="">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import nodeManager from '@/services/node-manager';
    import {mapState, mapActions, mapGetters} from 'vuex';
    import fs from 'fs';
    import Settings from '@/services/setting'
    import loadingComponent from '@/components/loading/loading';
    import { ipcRenderer } from "electron";
    const packageJson = require("@/../package.json");
    let os = require('os');

    export default {
        name: 'setting',
        //实例的数据对象
        data() {
            return {
                netType:'',
                language:'',
                currentPath:'',
                customs:[],
                showWeChat:false,
                showAutpupdater:0,
                disabled:false,
                percent:'0.00',
                updateInfo:'',
                version:packageJson.build.buildVersion,
                downloadPath:''
            }
        },
        //数组或对象，用于接收来自父组件的数据
        props: {

        },
        //计算
        computed: {
            ...mapGetters(['network','lang','netLoading','chainName','testMode']),
            updateDisabled(){
                const bool=/win/.test(os.platform())
                return !bool
            }
        },
        //方法
        methods: {
            ...mapActions(['changeLang','updateState','updateLoading']),
            sliceType(type){
                return type.replace(/^custom_/g,'')
            },
            changeNet(){
                console.log('netType--',this.netType);
                if((this.network.type!=='custom'&&this.network.type==this.netType) || (this.network.type=='custom'&&this.network.type==this.sliceType(this.netType))) return;
                if(this.netType=='创建私有链'){
                    //创建私有链
                    nodeManager.stop('_connect').then(()=>{
                        console.log('setting.vue stop _connect');
                        this.$router.push('/customNet')
                    });
                }else if(this.netType=='main'){
                    return;
                }else if(this.netType=='test' || this.netType=='amigo' || this.netType=='batalla' || this.netType=='innerdev'){
                    //连接主网络
                    // this.updateLoading(true);
                    nodeManager.stop('_node').then(()=>{
                        console.log('setting.vue stop _node');
                        this.$router.push({
                            path:'/',
                            query:{
                                type:this.netType
                            }
                        })
                    })
                }else{
                    let netType1 = this.sliceType(this.netType);
                    let arr = this.customs.filter((item)=>{
                        return item.name==netType1
                    });
                    if(arr.length>0){
                        let port = arr[0].port,name=arr[0].name,proc;
                        if(this.network.type=='custom'){
                            proc='_node';
                        }else{
                            proc='_connect';
                        }
                        nodeManager.stop(proc).then(()=>{
                            this.$router.push({
                                path:'/',
                                query:{
                                    type:'custom',
                                    chainName:name,
                                    chainPort:port
                                }
                            });
                        })
                    }
                }
            },
            modifyPath(){
                const currentPath = this.currentPath.replace(/\//g,'\\');
                try{
                    const dialog = require('electron').remote.dialog;
                    dialog.showOpenDialog({
                        defaultPath:currentPath,
                        properties:['openDirectory']
                    },(data)=>{
                        if(data){
                            this.copyKeystores(data)
                        }
                    })
                }catch(error){
                    console.error(error)
                }

            },
            copyKeystores(path){
                let dist = path[0],src=this.currentPath,_this = this;
                fs.readdir(src, function(err, paths) {
                    if(err){
                        throw err;
                    } else {
                        paths.forEach(function(path) {
                            var _src = src + '/' +path;
                            var _dist = dist + '/' +path;
                            fs.stat(_src, function(err, stat) {
                                if(err){
                                    throw err;
                                } else {
                                    // 判断是文件还是目录
                                    if(stat.isFile()) {
                                        if(path.slice(path.lastIndexOf('.'),path.length)=='.json'){
                                            if(fs.readFileSync(_src,{encoding:'utf8'}).indexOf('"address":"0x')!=-1){
                                                fs.writeFileSync(_dist, fs.readFileSync(_src));
                                            }
                                        }
                                    } else if(stat.isDirectory()) {
                                        // 目录
                                    }
                                }
                            })
                        });
                        let data =  JSON.parse(fs.readFileSync(Settings.userDataPath+'keyPath',{encoding:'utf8'}));
                        let curType = _this.netType;
                        if(_this.netType=='custom'){
                            curType = 'custom_'+this.chainName;
                        }
                        data[curType] = dist.replace(/\\/g,'/')+'/';
                        Settings.saveUserData('keyPath',JSON.stringify(data));
                        Settings.setKeyPath(curType,()=>{
                            _this.currentPath = Settings.keyPath
                        });
                    }
                })
            },
            openUrl(url){
                const shell = require('electron').shell;
                shell.openExternal(url);
            },
            openWechatPic(){
                this.showWeChat = true;
            },
            apply(){
                // this.$router.push('/coin')
            },
            getCustoms(){
                //读取创建的私有链
                let userDataPath = Settings.userDataPath+'net_custom/chain',arr=[],_this=this;
                fs.readdir(userDataPath, function(err, paths) {
                    if(err){
                        throw err;
                    } else {
                        paths.forEach(function(path) {
                            console.warn(userDataPath,path);
                            var _src = userDataPath + '/' +path;
                            fs.stat(_src, function(err, stat) {
                                if(err){
                                    throw err;
                                } else {
                                    // 判断是文件还是目录
                                    if(stat.isDirectory()) {
                                        if(fs.existsSync(`${_src}/platon`)){
                                            let port = fs.readFileSync(`${_src}/port`,{encoding:'utf-8'});
                                            arr.push({
                                                name:path,
                                                port:port
                                            });
                                        }
                                    }
                                }
                            })
                        });
                        _this.customs = arr;
                    }
                })
            },
            checkUpdate(){
                this.$root.$emit('checkUpdateVersion')
            },
        },
        //生命周期函数
        created() {

        },
        beforeMount() {

        },
        mounted() {
            this.netType = (this.network.type=='custom')?'custom_'+this.chainName:this.network.type;
            this.language =this.lang;
            // this.currentPath = this.network.type=='custom'?`${Settings.keyPath}${this.chainName}/keystore`:Settings.keyPath;
            this.currentPath = Settings.keyPath;
            this.getCustoms();
        },
        //监视
        watch: {
            network:function(val,old){
                console.log('network change',val,old);
                this.netType = (val.type=='custom')?'custom_'+this.chainName:val.type;
            },
            lang:function(val){
                this.language = val;
            },
            // netLoading:function(val,old){
            //     if(!val && old){
            //         this.$router.push('/')
            //     }
            // }
        },
        //组件
        components: {
            loadingComponent
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
    .setting{
        padding:7px 22px;
        margin: 0 10px;
        height:calc(~"100% - 70px");
        background-color: #fff;
        border-radius:4px;
        color: #525768;
        font-size:12px;
        .title{
            margin-top:14px;
            color: #24272B;
            font-weight: 600;
        }
        .el-select{
            margin-top:10px;
        }
        .des-txt{
            margin-top:14px;
            .el-button{
                padding:0;
                margin-left:10px;
                width:72px;
                height:30px;
                line-height:30px;
                background: #0077FF;
                border-radius: 4px;
                color:#fff;
                border:none;
                font-size:12px;
            }
        }
        .txt-en{
            .el-button{
                width: 134px;
            }
        }
    }
    .icons{
        margin-top:10px;
        span{
            margin-right:14px;
            display:inline-block;
            width:33px;
            height:33px;
            cursor:pointer;
        }
        .bg-icon(@icon,@iconHover){
            background: url(@icon) no-repeat center center;
            &:hover{
                 background: url(@iconHover) no-repeat center center;
             }
        }
        .plane{
            .bg-icon("./images/plane.svg","./images/plane copy.svg")
        }
        .wechat{
            .bg-icon("./images/wechat.svg","./images/wechat copy.svg")
        }
        .github{
            .bg-icon("./images/github.svg","./images/github copy.svg")
        }
        .weite{
            .bg-icon("./images/weite.svg","./images/weite copy.svg")
        }
        .facebook{
            .bg-icon("./images/facebook.svg","./images/facebook copy.svg")
        }
        .reddit{
            .bg-icon("./images/reddit.svg","./images/reddit copy.svg")
        }
        .medium{
            .bg-icon("./images/medium.svg","./images/medium copy.svg")
        }
        .babbitt{
           .bg-icon("./images/babbitt.svg","./images/babbitt copy.svg")
        }
        .Money{
            .bg-icon("./images/Money.svg","./images/Money  Copy.svg")
        }

    }
    .show-wechat{
        .modal-content{
            position:relative;
            .icon-close{
                position:absolute;
                top:5px;
                right:7px;
                width:16px;
                height:16px;
                cursor:pointer;
                background: url("./images/close.svg") no-repeat center center;
                background-size: contain;
            }
        }
    }
</style>
<style lang="less">
    .setting{
        .el-select{
            font-size:12px;
            .el-input__inner{
                height:40px;
            }
        }
        .el-input{
            font-size:12px;
        }
    }
</style>
