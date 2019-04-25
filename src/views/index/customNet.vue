<template>
    <div class="custom-net">
        <div class="bg">
            <div class="custom-header" style="-webkit-app-region: drag">
                <span @click="close"><i class="close"></i></span>
                <span @click="max"><i class="max" ref="max"></i></span>
                <span @click="min"><i class="min"></i></span>
            </div>
            <div class="padd compolete" v-if="compolete">
                <p class="title">{{$t("settings.customNet.createNet")}}</p>
                <p class="net-name">
                    {{$t('settings.priNet')}} -
                    <span class="success">{{net.name}}</span>
                    {{$t('settings.customNet.successfully')}}
                </p>
                <div class="content">
                    <p>
                        <span class="label">{{$t('settings.customNet.netName')}}:</span>
                        {{net.name}}
                    </p>
                    <p class="pub-box">
                        <span :class="[lang=='zh-cn'?'min1':'min2','label']">{{$t('application.nodePublicKey')}}:</span>
                        <span class="pub">{{nodeInfo.publicKey}}</span>
                    </p>
                    <p>
                        <span class="label">{{$t('settings.customNet.nodeIP')}}</span>
                        {{nodeInfo.ip}}
                    </p>
                    <p>
                        <span class="label">RPC {{$t('settings.customNet.port')}}:</span>
                        {{nodeInfo.port}}
                    </p>
                    <p>
                        <span class="label">P2P {{$t('settings.customNet.port')}}:</span>
                        26793
                    </p>
                    <p>
                        <span class="label">Coinbase {{$t('sideBar.wallet')}}:</span>
                        {{keystore?keystore.address:''}}
                    </p>
                    <p>
                        <span class="label">{{$t('settings.customNet.folder')}}:</span>
                        {{userDataPath}}
                    </p>
                </div>
                <p>
                    <el-button type="primary" :class="[lang=='zh-cn'?'letterSpace':'']" @click="finish">{{$t('wallet.finish')}}</el-button>
                    <el-button class="back-up" @click="backup">{{$t('settings.customNet.backUpKey')}}</el-button>
                </p>
            </div>
            <div class="padd" v-else>
                <p class="title">
                    <span class="tab">{{$t("settings.customNet.createNet")}}</span>
                </p>
                <div>
                    <ul class="ul">
                        <li>
                            <div class="sub-title border">
                                <p class="bold">1.{{$t("settings.customNet.block")}}</p>
                                <p class="indent">{{$t("settings.customNet.blockSubTitle")}}</p>
                            </div>
                            <el-form v-show="step==1" class="center" :model="net" ref="net" :rules="rules"  label-width="100px" label-position="left">
                                <el-form-item prop="name" :label="$t('settings.customNet.netName')">
                                    <el-input v-model.trim="net.name" :placeholder="$t('settings.customNet.netNameHint')"></el-input>
                                </el-form-item>
                                <el-form-item :label="$t('settings.customNet.consensus')">
                                    <el-select v-model="net.algo" disabled>
                                        <el-option value="CBFT" label="CBFT"></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item prop="interval" :label="$t('settings.customNet.interval')">
                                    <el-input v-model.trim="net.interval" type="number" class="interval"></el-input>
                                </el-form-item>
                                <p class="btn-tab1">
                                    <el-button type="primary" @click="initBtn">{{$t("settings.customNet.create")}}</el-button>
                                    <el-button :class="[lang=='zh-cn'?'letterSpace':step==1?'step1':'','back']" @click="back" :disabled="createLoading">{{$t("settings.customNet.cancel")}}</el-button>
                                </p>
                            </el-form>
                            <div :class="[step>1?'border':'','sub-title']">
                                <p class="bold">2.{{$t("settings.customNet.createWallet")}}</p>
                                <p class="indent">{{$t("settings.customNet.coinBaseSubTitle")}}</p>
                            </div>
                            <div class="sub-title" v-show="step==1">
                                <p class="bold">3.{{$t("settings.customNet.nodeaddress")}}</p>
                                <p class="indent">{{$t("settings.customNet.nodeSubTitle")}}</p>
                            </div>
                            <el-form v-show="step==2" class="center" :model="wallet" ref="wallet" :rules="walletRules"  label-width="118px" label-position="left">
                                <el-form-item prop="name" :label="$t('settings.customNet.walletName')">
                                    <el-input v-model.trim="wallet.name" :placeholder="$t('settings.customNet.walletName')"></el-input>
                                </el-form-item>
                                <el-form-item prop="psw" :label="$t('settings.customNet.password')">
                                    <el-input v-model.trim="wallet.psw" type="password" :placeholder="$t('wallet.enterNewPsw')"></el-input>
                                </el-form-item>
                                <el-form-item prop="pswA" :label="$t('settings.customNet.rePassword')">
                                    <el-input v-model.trim="wallet.pswA" type="password" :placeholder="$t('wallet.repeatPsw')"></el-input>
                                </el-form-item>
                                <p class="btn-tab1">
                                    <el-button type="primary" @click="initAccount">{{$t("settings.customNet.createAndWrite")}}</el-button>
                                    <el-button :class="[lang=='zh-cn'?'letterSpace':step==1?'step1':'','back']" @click="prev" :disabled="createLoading">{{$t("form.back")}}</el-button>
                                </p>
                            </el-form>
                            <div class="sub-title" v-show="step==2">
                                <p class="bold">3.{{$t("settings.customNet.nodeaddress")}}</p>
                                <p class="indent">{{$t("settings.customNet.nodeSubTitle")}}</p>
                            </div>
                            <div class="sub-title border" v-show="step==3">
                                <p class="bold">3.{{$t("settings.customNet.nodeaddress")}}</p>
                                <p class="indent">{{$t("settings.customNet.nodeSubTitle")}}</p>
                            </div>
                            <el-form ref="node" v-show="step==3" :model="nodeInfo" :rules="nodeRules"  label-width="124px" label-position="left">
                                <el-form-item prop="privateKey" :label="$t('settings.customNet.node')+' '+$t('settings.customNet.priK')" class="append-item">
                                    <el-input v-model.trim="nodeInfo.privateKey" :disabled="createLoading">
                                        <el-button slot="append" class="slot" :disabled="createLoading" @click="generatePrivateKey">{{$t('settings.customNet.generate')}}</el-button>
                                    </el-input>
                                </el-form-item>
                                <el-form-item prop="ip" :label="$t('settings.customNet.node')+' '+$t('settings.customNet.IP')" class="append-item">
                                    <el-input v-model.trim="nodeInfo.ip" :disabled="createLoading" placeholder="XXX.XXX.XXX.XXX">
                                        <el-button slot="append" class="slot" :disabled="createLoading" @click="getIp">{{$t('settings.customNet.getIp')}}</el-button>
                                    </el-input>
                                </el-form-item>
                                <el-form-item prop="port" :label="$t('settings.customNet.node')+' '+$t('settings.customNet.port')">
                                    <el-input v-model.trim="nodeInfo.port" :disabled="createLoading"></el-input>
                                </el-form-item>
                                <p class="btn-box-1 btn-tab1">
                                    <el-button type="primary" @click="create" :loading="createLoading">{{$t("settings.customNet.startNode")}}</el-button>
                                    <el-button :class="[lang=='zh-cn'?'letterSpace':step==1?'step1':'','back']" @click="back" :disabled="createLoading">{{$t("settings.customNet.cancel")}}</el-button>
                                </p>
                            </el-form>
                        </li>
                    </ul>
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
    import keyManager from '@/services/key-manager';
    import contractService from '@/services/contract-servies';
    const EthUtil = require('ethereumjs-util');
    const path = require('path');
    import RegConfig from '@/config/reg-config';
    import { ipcRenderer } from 'electron';
    import fsObj from '@/services/fs-service'
    var keythereum = require("keythereum");
    export default {
        name: 'customNet',
        //实例的数据对象
        data() {
            return {
                //初始化所用json文件内容
                jsonData:{
                    config: {
                        chainId: 100,
                        homesteadBlock: 1,
                        eip150Block: 2,
                        eip150Hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
                        eip155Block: 3,
                        eip158Block: 3,
                        byzantiumBlock: 4,
                        cbft: {
                            period: 1, //出块间隔，默认1,
                            epoch: 250,
                            maxLatency: 300,   //共识节点间最大网络延迟时间，单位：毫秒
                            legalCoefficient: 0.33,  //检查块的合法性时的用到的时间系数
                            duration: 1,  //出块时长,秒
                            initialNodes: [
                                // "enode://公钥@ip:端口"*4,
                            ],
                            nodeID: "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
                        }
                    },
                    nonce: "0x0",
                    timestamp: "",   //秒级时间戳的十六进制"0x5bd299df",
                    extraData: "0x000000000000000000000000000000000000000000000000000000000000000012582d7da0a495e92a99e99530c001dc5a108f713a3b080ced64ffc9fbd60bb60cfba164da81368eee4e9e8c665771b4709f9493b527d4af1378a0bb42bf7e1d3991adacbf68d782f6467663e37207180000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    // gasLimit: "0x989680",
                    gasLimit: "0x99947b760",
                    difficulty: "0x1",
                    mixHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
                    coinbase: "0x0000000000000000000000000000000000000000",
                    alloc: {
                        //钱包地址:{balance:'0x200000000000000000000000000000000000000000000000000000000000000'}
                    },
                    number: "0x0",
                    gasUsed: "0x0",
                    parentHash: "0x0000000000000000000000000000000000000000000000000000000000000000"
                },
                step:1,
                conn:{
                    ip:'',
                    port:'',
                    privateKey:''
                },
                createLoading:false,
                compolete:false,
                // conn:{
                //     ip:'10.10.8.214',
                //     port:'4567',
                //     privateKey:'aa4aac7a35a7bdf60b69b8aa19b941c04bdae48b305933ed07117291b682ca6b'
                // },
                enodes:null,
                net:{
                    name:'',
                    algo:'CBFT',
                    interval:'',
                },
                wallet:{
                    name:'',
                    psw:'',
                    pswA:''
                },
                keystore:null,
                nodeInfo:{
                    privateKey:'',
                    ip:'',
                    port:''
                },
                file:false,
                //创建私有链在切换中英文之后，不用computed
                rules:{
                    name: [
                        { validator: this.checkNetname, trigger: 'blur,change', required: true}
                    ],
                    interval:{validator: this.checknetIntarval, trigger: 'blur,change', required: true}
                },
                walletRules:{
                    name: { required: true, message: this.$t('wallet.walletNameRequired'), trigger: 'blur' },
                    psw:[
                        { required: true, message: this.$t('wallet.walletPswRequired'), trigger: 'blur' },
                        { min: 6, message: this.$t('wallet.enterNewPswHint'), trigger: 'blur' }
                        ],
                    pswA:[
                        { required: true, message: this.$t('form.nonRepPsw'), trigger: 'blur' },
                        { validator: this.checkPswA, trigger: 'blur'}
                    ]
                },
                nodeRules:{
                    privateKey:{ validator: this.checkPrivatekey, trigger: 'blur'},
                    ip:{ validator: this.checkIP, trigger: 'blur'},
                    port:{ validator: this.checkPort, trigger: 'blur'}
                },
                connRules:{
                    privateKey:{required: true, message: this.$t('wallet.NodePKRequired'), trigger: 'blur'},
                    ip:{required: true, message: this.$t('wallet.NodeIPRequired'), trigger: 'blur'},
                    port:{required: true, message: this.$t('wallet.NodePortRequired'), trigger: 'blur'}
                },
                fromPath:''
            }
        },
        //数组或对象，用于接收来自父组件的数据
        props: {

        },
        //计算
        computed: {
            ...mapGetters(['nodeState','network','isMaximized','lang'])
        },
        //方法
        methods: {
            ...mapActions(['updateState','updateNetSetting','updateLoading','getCustoms','changeWindow','updateWalletInfo']),
            checkNetname:function(rule, value, callback){
                if (!value) {
                    return callback(new Error(this.$t('wallet.netNameEmpty')));
                } else if (!/^[0-9a-zA-z]+$/g.test(value)){
                    return callback(new Error(this.$t('wallet.netNameIllegal')));
                } else {
                    callback();
                }
            },
            checknetIntarval(rule, value, callback){
                if (!value) {
                    return callback(new Error(this.$t('wallet.blockSpacingEmpty')));
                } else if (!/^[1-9]+[0-9]*$/g.test(value)){
                    return callback(new Error(this.$t('wallet.blockSpacingIllegal')));
                } else {
                    callback();
                }
            },
            checkPswA(rule, value, callback){
                if (value === '') {
                    callback(new Error(this.$t('wallet.repeatPswP')));
                } else if (value !== this.wallet.psw){
                    callback(new Error(this.$t('wallet.pswNoMatch')));
                } else {
                    callback();
                }
            },
            checkPrivatekey(rule, value, callback){
                if (value === '') {
                    callback(new Error(this.$t('wallet.NodePKRequired')));
                } else if (!/^[a-fA-F0-9]{64}$/g.test(value)){
                    callback(new Error(this.$t('wallet.NodePKillegal')));
                } else {
                    callback();
                }
            },
            checkIP(rule, value, callback){
                if (value === '') {
                    callback(new Error(this.$t('wallet.NodeIPRequired')));
                } else if (!RegConfig.IP.test(value)){
                    callback(new Error(this.$t('wallet.NodeIPillegal')));
                } else {
                    callback();
                }
            },
            checkPort(rule, value, callback){
                if (value === '') {
                    callback(new Error(this.$t('wallet.NodePortRequired')));
                } else if (!RegConfig.PORT.test(value)){
                    callback(new Error(this.$t('wallet.NodePortillegal')));
                } else {
                    callback();
                }
            },
            prev(){
                this.step=1;
            },
            back(){
                console.log(this.fromPath);
                if(this.fromPath=='/'){
                    Settings.deleteUseData('type');
                }
                this.$router.back();
            },
            initBtn(){
                this.$refs['net'].validate((valid) => {
                   if(valid){
                       let name=this.net.name,_this=this;
                       this.getCustoms((data)=>{
                           console.warn('getCustoms cb');
                           let arr = data.filter((item)=>{
                               return item.name==name;
                           });
                           console.log('arr------',arr);
                           if(arr.length>0){
                               this.$message.error(this.$t('wallet.netNameRepeat'));
                               return;
                           }else{
                               window.localStorage.setItem('chainName',_this.net.name);
                               _this.jsonData.config.cbft.period = Number(_this.net.interval);
                               _this.step = 2;
                               console.warn('jsonData-->step1',_this.jsonData);
                           }
                       })
                   }
                });
            },
            initAccount(){
                this.$refs['wallet'].validate((valid) => {
                    if (valid) {
                        keyManager.createKey(this.wallet.name,this.wallet.psw,'','',(err,data)=>{
                            if(err){
                                throw err;
                            }else{
                                this.keystore = data;
                                Object.assign(this.jsonData.alloc,{
                                    // [data.address]:{balance:'0x200000000000000000000000000000000000000000000000000000000000000'}
                                    [data.address]:{balance:'0x152d02c7e14af6800000'}
                                });
                                console.warn('jsonData-->step2',this.jsonData);
                                this.step = 3;
                            }
                        })
                    }
                });
            },
            backup(){
                //备份钱包文件
                keyManager.backUpKey(this.wallet.address,this.keystore);
            },
            create(){
                console.warn(this.$refs['node']);
                this.$refs['node'].validate((valid)=>{
                    if(valid){
                        //组合state-nodes
                        this.createLoading = true;
                        let stateNodes=[],publicKey,_this = this;
                        if(this.nodeInfo.privateKey){
                            publicKey = EthUtil.privateToPublic(Buffer.from(this.nodeInfo.privateKey, 'hex')).toString('hex');
                            this.nodeInfo.publicKey = publicKey;
                            stateNodes.push(this.nodeInfo.publicKey);
                            this.jsonData.config.cbft.initialNodes = stateNodes;
                            this.jsonData.timestamp = '0x'+((Math.round(new Date().getTime() / 1000)).toString(16));
                            this.saveJson(this.jsonData).then(()=>{
                                this.initDir(()=>{
                                    console.log('initDir success');
                                    this.userDataPath = `${Settings.userDataPath}net_custom/chain/${this.net.name}`;
                                    this.updateState(0);
                                    nodeManager.initChain(this.net.name,this.nodeInfo.port,(num)=>{
                                        if(num==0){
                                            this.createLoading = false;
                                            fsObj.deleteFolder(this.userDataPath,(err)=>{
                                                if(err){
                                                    throw err;
                                                }
                                            })
                                        }
                                    });
                                });
                            }).catch((e)=>{
                                this.createLoading = false;
                                console.log(e);
                            });
                        }else{
                            this.createLoading = false;
                        }
                    }
                })
            },
            saveJson(jsonData){
                let type = 'custom';
                return new Promise((resolve, reject)=>{
                    let filePath = path.join(`${Settings.userDataPath}net_${type}`,`${this.net.name}.json`);
                    console.log('filePath---',Settings.userDataPath,filePath);
                    fs.writeFile(filePath, JSON.stringify(jsonData), (err) => {
                        if (err) {
                            reject(err);
                            throw err
                        }
                        resolve();
                    });
                })
            },
            initDir(cb){
                console.warn('userDataPath',Settings.userDataPath);
                let stateArr=[],basePath=`${Settings.userDataPath}net_custom`;
                if(!fs.existsSync(path.join(basePath, 'chain'))){
                    //创建dir--data
                    fs.mkdirSync(path.join(basePath, 'chain'));
                }
                if(!fs.existsSync(path.join(basePath, `chain/${this.net.name}`))){
                    //创建链目录
                    fs.mkdirSync(path.join(basePath, `chain/${this.net.name}`));
                    let cbftJSON = require("../../../static/json/cbft.json");
                    fs.writeFileSync(`${basePath}/chain/${this.net.name}/cbft.json`,JSON.stringify(cbftJSON))
                }
                if(!fs.existsSync(path.join(basePath, `chain/${this.net.name}/keystore`))){
                    //创建钱包存储目录并保存钱包
                    fs.mkdirSync(path.join(basePath, `chain/${this.net.name}/keystore`));
                }
                fs.writeFileSync(path.join(basePath, `chain/${this.net.name}/keystore/${this.keystore.address}`), JSON.stringify(this.keystore));
                // 创建nodekey和static-nodes
                fs.writeFileSync(path.join(basePath, `chain/${this.net.name}/nodekey`), this.nodeInfo.privateKey);
                fs.writeFileSync(path.join(basePath, `chain/${this.net.name}/static-nodes`), JSON.stringify(this.jsonData.config.cbft.initialNodes));
                //保存端口
                fs.writeFileSync(path.join(basePath, `chain/${this.net.name}/port`), this.nodeInfo.port);
                cb();
            },

            importNodes(){
                if(!this.file){
                    this.$message.error(this.$t('settings.customNet.filesReq'));
                    return;
                }
                this.step=5;

            },
            getFileName(val){
               if(val){
                   let file = document.getElementById("file").files[0];
                   let nodes = fs.readFileSync(file.path,{encoding:'utf8'});
                   try{
                       nodes=JSON.parse(nodes);
                       this.enodes = nodes;
                       this.saveEnodes(nodes);
                       this.file = file;
                       document.getElementById('file').value='';
                   }catch(e){
                       this.file = null;
                       document.getElementById('file').value='';
                       this.$message.error(this.$t('settings.customNet.cannotResolved'));
                   }

               }
            },
            saveEnodes(nodes){
                //保存节点信息
                let basePath=`${Settings.userDataPath}net_custom}`,
                chainName = window.localstorage.getItem('chainName');
                //创建dir--data
                if(!fs.existsSync(path.join(basePath, 'data'))){
                    fs.mkdirSync(path.join(basePath, 'data'));
                }
                //创建链目录
                if(!fs.existsSync(path.join(basePath, `data/${chainName}`))){
                    fs.mkdirSync(path.join(basePath, `data/${chainName}`));
                }
                // 创建static-nodes
                fs.writeFileSync(path.join(basePath, `data/${chainName}/static-nodes`), JSON.stringify(nodes));

            },
            join(){
                let chainName = window.localstorage.getItem('chainName');
                this.$refs['conn'].validate((valid)=>{
                    if(valid){
                        this.updateState(0);
                        this.updateLoading(false);
                        // 创建nodekey
                        fs.writeFile(path.join(basePath, `data/${chainName}/nodekey`),this.conn.privateKey,()=>{
                            nodeManager.initChain(chainName,this.conn.port)
                        });
                    }
                });
            },
            min(){
                ipcRenderer.send('minimize-window');
            },
            close(){
                ipcRenderer.send('hide-window');
            },
            max(){
                console.log('最大化')
                if(this.isMaximized){
                    this.$refs.max.style.background="url("+require('./images/restore.svg')+") no-repeat center bottom"
                    ipcRenderer.send('maximize-window')
                }else{
                    this.$refs.max.style.background="url("+require('./images/maximize.svg')+") no-repeat center bottom"
                    ipcRenderer.send('orignal-window')
                }
                this.changeWindow(this.isMaximized)
            },
            saveKey(cb){
                this.keystore.createTime = new Date().getTime();
                this.updateWalletInfo(this.keystore).then(()=>{
                    cb();
                }).catch((e)=>{
                    cb();
                    throw e;
                })
            },
            generatePrivateKey(){
                let params = {
                    keyBytes: 32,
                    ivBytes: 16
                };
                keythereum.create(params,(dk)=>{
                   let privateKey = dk.privateKey,
                       publicKey = EthUtil.privateToPublic(privateKey).toString('hex');
                    this.nodeInfo.privateKey = privateKey.toString('hex');
                    this.nodeInfo.publicKey = publicKey;
                })
            },
            getIp(){
                let _this = this;
                let os = require('os');
                let interfaces=os.networkInterfaces(),
                    platform=os.platform();
                console.log('interfaces---',interfaces);
                for(var devName in interfaces){
                    if((platform!='linux' && (devName=='以太网' || devName=='WLAN')) || (platform=='linux' && devName!='lo')){
                        var iface = interfaces[devName];
                        console.log('iface---',iface);
                        for(var i=0;i<iface.length;i++){
                            var alias = iface[i];
                            if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
                                _this.nodeInfo.ip = alias.address;
                            }
                        }
                    }
                }
            },
            finish(){
                this.$router.push('/')
            }
        },
        //生命周期函数
        created() {

        },
        beforeRouteEnter(to, from, next){
            next(vm=>{
                vm.fromPath=from.path;
            });
        },
        beforeMount() {

        },
        mounted() {
            this.ip = this.network.ip;
            this.port = this.network.port;
        },
        //监视
        watch: {
            'nodeState':function(val,old){
                if(old!=2 && val==2){
                    this.saveKey(()=>{
                        fsObj.saveKey(this.keystore.address,JSON.stringify(this.keystore));
                        this.createLoading = false;
                        this.compolete = true;
                        // this.$router.push('/')
                    });
                }
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
    .bg{
        position:relative;
        z-index:99;
        height:100%;
        background-color:#f8fafd;
    }
    .custom-net{
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
        .slot{
            position:relative;
            z-index:999;
            width:70px;
            font-size: 12px;
            color: #fff;
            font-weight: normal;
        }
        .custom-header{
            height:50px;
            background: url("./images/logoB.svg") no-repeat 20px center #fff;
            box-shadow: inset 0 -1px 0 0 #E4E8EB;
            span{
                float:right;
                margin-top:15px;
                margin-right:15px;
                font-size:10px;
                color:#24272B;
                cursor:pointer;
            }
        }
        .padd{
            padding:0 40px;
        }
        .title{
            margin:14px 0 20px;
            height:22px;
            line-height:22px;
            font-size: 16px;
            color: #24272B;
            letter-spacing: 0.5px;
            span{
                padding:5px;
                margin-right:50px;
                cursor:pointer;
            }
            .active{
                color: #0077FF;
                border-bottom:solid 3px #0077FF;
            }
            .tab{
                margin-bottom:20px;
                color: #24272B;
                font-weight:600;
            }
        }
        .ul{
            >li{
                border-radius:4px;
                .sub-title{
                    margin-bottom:14px;
                    padding-bottom:14px;
                    font-size: 12px;
                    color: #9EABBE;
                    .bold{
                        margin-bottom:8px;
                        font-size: 14px;
                        color: #24272B;
                        font-weight:600;
                        letter-spacing: 0.5px;
                    }
                    .indent{
                        text-indent: 9px;
                    }
                    &.border{
                         border-bottom:solid 1px #D3D8E1;
                     }
                }
                .label{
                    display:inline-block;
                    width:77px;
                    font-size:12px;
                }
            }
            .import{
                position:relative;
                padding:0;
                height:144px;
                text-align: center;
                font-size: 12px;
                color: #525768;
                input{
                    width:100%;
                    height:100%;
                    opacity: 0;
                    cursor:pointer;
                }
                .txt{
                    position:absolute;
                    bottom:42px;
                    left:0;
                    z-index:-10;
                    margin:0;
                    width:100%;
                    text-align: center;
                    cursor:pointer;
                }
            }
            .import-null{
                background: url("./images/icon_import.svg") no-repeat center 35px;
            }
            .import-has{
                padding-top:84px;
                background: url("./images/icon_file.svg") no-repeat center 35px;
            }
        }
        .addr{
            height:20px;
            line-height:20px;
            font-size: 14px;
            color: #525768;
        }
        .mark{
            margin:14px 0 24px;
            height:24px;
            line-height:24px;
            font-size: 12px;
            color: #F32F26;
            .el-button{
                padding:0;
                margin-left:14px;
                width:90px;
                height:24px;
                line-height:24px;
                font-size:10px;
                text-align:center;
                color:#fff;
                background: #0077FF;
                border:none;
            }
        }
        .node-list{
            position:relative;
            width:500px;
            border: 1px solid #D3D8E1;
            border-radius:4px;
            .sub-title{
                position:absolute;
                top:-10px;
                left:21px;
                padding:0 8px;
                font-size:14px;
                background-color: #fff;
                color: #24272B;
                letter-spacing: 0.5px;
                font-weight:600;
            }
            li{
                margin-bottom:24px;
                padding:26px 0 0 30px;
                display:inline-block;
                width:50%;
                border:none;
            }
            /*&:after{*/
                /*content:'';*/
                /*position:absolute;*/
                /*top:47%;*/
                /*left:30px;*/
                /*width:810px;*/
                /*height:2px;*/
                /*border-bottom:solid 1px #D3D8E1;*/
             /*}*/
        }
        .btn-box{
            width:500px;
            text-align: left;
            margin:30px 0;
            .el-button{
                margin:0;
                width:186px;
                height:36px;
            }
            .back{
                margin-right:123px;
            }
        }
        .btn-tab1{
            text-align: left;
            margin:20px 0 30px;
            .el-button{
                margin:0;
                width:186px;
                height:36px;
                font-size:14px;
            }
            .back{
                margin-left:29px;
                &.step1{
                     margin-left:19px;
                 }
            }
        }
        .btn-box-1{
            margin-right:128px;
            width:100%;
        }
    }
    .interval:after{
        content:'S';
        position:absolute;
        right:14px;
        top:0;
        font-size: 12px;
        color: #525768;
    }
    .is-error .interval:after{
        right:29px;
    }
    .min{
        display: inline-block;
        width: 10px;
        height: 8px;
        background: url("./images/minimize.svg") no-repeat center center;
        -webkit-app-region: no-drag;
    }
    .max{
        display: inline-block;
        width: 10px;
        height: 10px;
        background: url("./images/maximize.svg") no-repeat center bottom;
        -webkit-app-region: no-drag;
    }
    .close{
        display: inline-block;
        width: 10px;
        height: 10px;
        background: url("./images/close.svg") no-repeat center bottom;
        -webkit-app-region: no-drag;
    }
    .compolete{
        .title{
            margin:14px 0 20px;
            height:22px;
            line-height:22px;
            font-size: 16px;
            color: #24272B;
            font-weight:600;
        }
        .net-name{
            padding-left:50px;
            height:40px;
            line-height:40px;
            font-size: 14px;
            color: #24272B;
            letter-spacing: 0.5px;
            font-weight:600;
            background: url("./images/icon_complete.svg") no-repeat left center;
        }
        .content{
            margin:14px 0 20px;
            padding-top:15px;
            text-align: left;
            border-top: 1px solid #D3D8E1;
            border-bottom: 1px solid #D3D8E1;
            p{
                margin-bottom:14px;
                font-size: 13px;
                color: #24272B;
                font-weight:600;
                .label{
                    display:inline-block;
                    width:118px;
                    font-size: 12px;
                    color: #525768;
                    font-weight:normal;
                }
                .el-button{
                    padding-left:15px;
                    padding-right:15px;
                    width:auto;
                    height:24px;
                    line-height:24px;
                    font-size: 10px;
                }
            }
            .pub-box{
                display:flex;
                .min1{
                    min-width:118px;
                }
                .min2{
                    min-width:118px;
                }
                .pub{
                    word-break: break-all;
                }
            }
        }
        .el-button{
            width:186px;
            height:36px;
            font-size:14px;
        }
        .back-up{
            margin-left:20px;
        }
    }

</style>
<style lang="less">
    .custom-net{
        .el-form-item{
          margin-bottom:12px;
        }
        .el-input{
            width: 300px;
            .el-input__inner{
                font-size:12px;
                height:40px;
                background-color: transparent;
            }
            &.is-disabled .el-input__inner{
                color: #24272B;
             }
        }
        .el-form-item__label{
            font-size: 12px;
            color: #24272B;
            white-space: nowrap;
            font-weight: 600;
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button{
            -webkit-appearance: none !important;
            margin: 0;
        }
        .el-input-group__append{
            background: #4897F6;
            border-radius: 0px 4px 4px 0px;
            font-family: "Chinese Quote",-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Helvetica Neue",Helvetica,Arial,sans-serif;
            &:hover{
                 background: #0077FF;
                 .slot{
                     border:none;
                 }
            }
        }
        .append-item{
            .el-form-item__error{
                left: 231px;
                top: 10px;
                padding-left: 78px;
            }
        }
        .el-form-item__error:before{
            top:2px;
        }
    }
    .el-form-item.is-required .el-form-item__label:before{
        content:"";
        margin-right: 0px;
    }
</style>
