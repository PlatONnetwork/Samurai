<template>
    <div class="custom-net">
        <div class="custom-header" style="-webkit-app-region: drag">
            <!-- <span @click="close" style="-webkit-app-region: no-drag"> <i class="el-icon-close"></i></span>
            <span @click="min" style="-webkit-app-region: no-drag">—</span> -->
            <span @click="close"><i class="close"></i></span>
            <span @click="max"><i class="max" ref="max"></i></span>
            <span @click="min"><i class="min"></i></span>
        </div>
        <div class="padd compolete" v-if="compolete">
            <p class="title">
                {{$t('settings.priNet')}}--{{net.name}} {{$t('settings.customNet.successfully')}}
            </p>
            <div class="content">
                <p>
                    <span class="label">{{$t('settings.customNet.netName')}}:</span>
                    {{net.name}}
                </p>
                <p class="pub-box">
                    <span :class="[lang=='zh-cn'?'min1':'min2','label']">{{$t('application.nodePublicKey')}}:</span>
                    <span class="pub">{{nodeList[0].publicKey}}</span>
                </p>
                <p>
                    <span class="label">{{$t('settings.customNet.nodeIP')}}</span>
                    {{nodeList[0].ip}}
                </p>
                <p>
                    <span class="label">RPC {{$t('settings.customNet.port')}}:</span>
                    {{nodeList[0].port}}
                </p>
                <p>
                    <span class="label">P2P {{$t('settings.customNet.port')}}:</span>
                    26793
                </p>
                <p>
                    <span class="label">Coinbase {{$t('sideBar.wallet')}}:</span>
                    {{keystore?keystore.address:''}}
                    <el-button type="primary" @click="backup">{{$t('settings.customNet.backUpKey')}}</el-button>
                </p>
                <p>
                    <span class="label">{{$t('settings.customNet.folder')}}:</span>
                    {{userDataPath}}
                </p>
            </div>
            <p>
                <el-button type="primary" :class="[lang=='zh-cn'?'letterSpace':'']" @click="finish">{{$t('wallet.finish')}}</el-button>
            </p>
        </div>
        <div class="padd" v-else>
            <p class="title">
                <span @click="selTab(1)" class="tab">{{$t("settings.customNet.createNet")}}</span>
                <!--<span @click="selTab(2)" :class="[tab==2?'active':'']">{{$t("settings.customNet.addNet")}}</span>-->
            </p>
            <div v-if="tab==1">
                <ul v-show="step==1" class="ul">
                    <li>
                        <span class="sub-title">1.{{$t("settings.customNet.block")}}</span>
                        <el-form class="center" :model="net" ref="net" :rules="rules"  label-width="105px" label-position="left">
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
                        </el-form>
                    </li>
                </ul>
                <ul v-show="step==2" class="ul">
                    <li>
                        <span class="sub-title">2.{{$t("settings.customNet.createWallet")}}</span>
                        <el-form class="center" :model="wallet" ref="wallet" :rules="walletRules"  label-width="118px" label-position="left">
                            <el-form-item prop="name" :label="$t('settings.customNet.walletName')">
                                <el-input v-model.trim="wallet.name" :placeholder="$t('settings.customNet.walletName')"></el-input>
                            </el-form-item>
                            <el-form-item prop="psw" :label="$t('settings.customNet.password')">
                                <el-input v-model.trim="wallet.psw" type="password" :placeholder="$t('wallet.enterNewPsw')"></el-input>
                            </el-form-item>
                            <el-form-item prop="pswA" :label="$t('settings.customNet.rePassword')">
                                <el-input v-model.trim="wallet.pswA" type="password" :placeholder="$t('wallet.repeatPsw')"></el-input>
                            </el-form-item>
                        </el-form>
                    </li>
                </ul>
                <div v-show="step==3">
                    <!--<p class="addr">{{$t("settings.customNet.address")}}:{{keystore?keystore.address:''}}</p>-->
                    <!--<p class="mark">{{$t("settings.customNet.tip")}}{{wallet.name}}{{$t("settings.customNet.tip2")}} <el-button @click="backup">{{$t("settings.customNet.download")}}</el-button></p>-->
                    <ul class="ul node-list">
                        <span class="sub-title">{{$t("settings.customNet.nodeaddress")}}</span>
                        <el-form ref="node" :model="nodeList[0]" :rules="nodeRules"  label-width="124px" label-position="left">
                            <li v-for="(item,index) in nodeList">
                                <el-form-item prop="privateKey" :label="$t('settings.customNet.node')+$t('settings.customNet.priK')">
                                    <el-input v-model.trim="item.privateKey" :disabled="createLoading">
                                        <el-button slot="append" class="slot" :disabled="createLoading" @click="generatePrivateKey">{{$t('settings.customNet.generate')}}</el-button>
                                    </el-input>
                                </el-form-item>
                                <el-form-item prop="ip" :label="$t('settings.customNet.node')+$t('settings.customNet.IP')">
                                    <el-input v-model.trim="item.ip" :disabled="createLoading">
                                        <el-button slot="append" class="slot" :disabled="createLoading" @click="getIp">{{$t('settings.customNet.getIp')}}</el-button>
                                    </el-input>
                                </el-form-item>
                                <el-form-item prop="port" :label="$t('settings.customNet.node')+$t('settings.customNet.port')">
                                    <el-input v-model.trim="item.port" :disabled="createLoading"></el-input>
                                </el-form-item>
                            </li>
                        </el-form>

                    </ul>
                </div>
                <p :class="[step==3?'btn-box-1':'','btn-tab1']">
                    <el-button :class="[lang=='zh-cn'?'letterSpace':'','back']" @click="back" :disabled="createLoading">{{$t("settings.customNet.cancel")}}</el-button>
                    <el-button class="init" @click="initBtn" v-if="step==1">{{$t("settings.customNet.create")}}</el-button>
                    <el-button class="init" @click="initAccount" v-if="step==2">{{$t("settings.customNet.createAndWrite")}}</el-button>
                    <el-button class="init" @click="create" v-if="step==3" :loading="createLoading">{{$t("settings.customNet.startNode")}}</el-button>
                </p>
            </div>
            <div v-if="tab==2">
                <ul class="ul" v-if="step==4">
                    <li class="import import-null" v-show="!file">
                        <input type="file"
                               class="file"
                               id="file"
                               @change="getFileName"/>
                        <span class="sub-title">{{$t("settings.customNet.importFiles")}}</span>
                        <p class="txt">{{$t("settings.customNet.importFilesHint")}}</p>
                    </li>
                    <li class="import import-has" v-show="file">
                        {{file.name}}
                    </li>
                </ul>
                <ul class="ul" v-if="step==5">
                    <li>
                        <span class="sub-title">{{$t("settings.customNet.nodeAddress")}}</span>
                        <el-form ref="conn" :model="conn" :rules="connRules"  label-width="80px" label-position="left">
                            <el-form-item prop="privateKey" :label="$t('settings.customNet.nodePK')">
                                <el-input v-model.trim="conn.privateKey"></el-input>
                            </el-form-item>
                            <el-form-item prop="ip" :label="$t('settings.customNet.nodeIP')">
                                <el-input v-model.trim="conn.ip"></el-input>
                            </el-form-item>
                            <el-form-item prop="port" :label="$t('settings.customNet.nodePort')">
                                <el-input v-model.trim="conn.port"></el-input>
                            </el-form-item>
                        </el-form>
                    </li>
                </ul>
                <p class="btn-box">
                    <el-button class="back" @click="back">{{$t("settings.customNet.cancel")}}</el-button>
                    <el-button class="init" @click="importNodes" v-if="step==4">{{$t("settings.customNet.next")}}</el-button>
                    <el-button class="init" @click="join" v-if="step==5">{{$t("settings.customNet.addNode")}}</el-button>
                </p>
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
                tab:1,
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
                // nodeList:[{
                //     privateKey:'87787aeee9540ec942629b5cbf3bbcc4c765ec02129943ef7463d2864f188938',
                //     ip:'10.10.8.214',
                //     port:'6789'
                // },{
                //     publicKey:'3b53564afbc3aef1f6e0678171811f65a7caa27a927ddd036a46f817d075ef0a5198cd7f480829b53fe62bdb063bc6a17f800d2eebf7481b091225aabac2428d',
                //     ip:'10.10.8.2',
                //     port:'2345'
                // },{
                //     publicKey:'858d6f6ae871e291d3b7b2b91f7369f46deb6334e9dacb66fa8ba6746ee1f025bd4c090b17d17e0d9d5c19fdf81eb8bde3d40a383c9eecbe7ebda9ca95a3fb94',
                //     ip:'10.10.8.3',
                //     port:'3456'
                // },{
                //     publicKey:'b0971a3670e593ad7a3d5b3983b5d67db827e1fd267688dfef97e27604c1121dc6b8e5ba82a89d6dc552083296df8a7ab41466ab1e47929af69e94efd65df7b3',
                //     ip:'10.10.8.4',
                //     port:'4567'
                // }],
                nodeList:[{
                    privateKey:'',
                    ip:'',
                    port:''
                }],
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
            selTab(n){
                this.tab = n;
                if(n==1){
                    this.step=1;
                }else if(n==2){
                    this.step=4;
                }
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
                           })
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
                        if(this.nodeList.length>0 && this.nodeList[0].privateKey){
                            publicKey = EthUtil.privateToPublic(new Buffer(this.nodeList[0].privateKey, 'hex')).toString('hex');
                            this.nodeList[0].publicKey = publicKey;
                            this.nodeList.forEach((item)=>{
                                stateNodes.push(item.publicKey)
                            });
                            this.jsonData.config.cbft.initialNodes = stateNodes;
                            this.jsonData.timestamp = '0x'+((Math.round(new Date().getTime() / 1000)).toString(16));
                            this.saveJson(this.jsonData).then(()=>{
                                this.initDir(()=>{
                                    console.log('initDir success');
                                    this.userDataPath = `${Settings.userDataPath}net_custom/chain/${this.net.name}`;
                                    nodeManager.initChain(this.net.name,this.nodeList[0].port);
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
                fs.writeFileSync(path.join(basePath, `chain/${this.net.name}/nodekey`), this.nodeList[0].privateKey);
                fs.writeFileSync(path.join(basePath, `chain/${this.net.name}/static-nodes`), JSON.stringify(this.jsonData.config.cbft.initialNodes));
                //保存端口
                fs.writeFileSync(path.join(basePath, `chain/${this.net.name}/port`), this.nodeList[0].port);
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
                    this.nodeList[0].privateKey = privateKey.toString('hex');
                    this.nodeList[0].publicKey = publicKey;
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
                                _this.nodeList[0].ip = alias.address;
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
    .custom-net{
        .slot{
            width:70px;
            font-size: 12px;
            color: #525768;
            font-weight: normal;
        }
        .custom-header{
            height:50px;
            background: url("./images/logoB.svg") no-repeat 20px center;
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
            margin:14px 0;
            height:34px;
            font-size: 16px;
            color: #24272B;
            letter-spacing: 0.5px;
            span{
                padding:5px;
                margin-right:50px;
                cursor:pointer;
            }
            .active{
                color: #18C2E9;
                border-bottom:solid 3px #18C2E9;
            }
            .tab{
                color: #18C2E9;
                font-weight:600;
            }
        }
        .ul{
            >li{
                position:relative;
                margin-bottom:24px;
                padding:26px 0 0 30px;
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
                p{
                    margin-bottom:12px;
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
                background: #18C2E9;
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
                color: #18C2E9;
                border: 1px solid #18C2E9;
                &:hover{
                    border-color:#18C2E1;
                 }
            }
            .init{
                background: #18C2E9;
                border:none;
                color:#fff;
                &:hover{
                     background:#18C2E1;
                 }
            }
        }
        .btn-tab1{
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
                color: #18C2E9;
                border: 1px solid #18C2E9;
                &:hover{
                    border-color:#18C2E1;
                 }
            }
            .init{
                background: #18C2E9;
                border:none;
                color:#fff;
                &:hover{
                     background:#18C2E1;
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
        text-align:center;
        .title{
            margin:50px 0 20px;
            padding-top:48px;
            height:68px;
            font-size: 14px;
            color: #0BB27A;
            background: url("./images/icon_complete.svg") no-repeat center top;
        }
        .content{
            padding:12px 14px 8px;
            width:580px;
            margin:0 auto 30px;
            text-align: left;
            border: 1px solid #D3D8E1;
            border-radius: 4px;
            p{
                margin-bottom:12px;
                font-size: 12px;
                color: #22272C;
                .label{
                    color: #525768;
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
                    min-width:58px;
                }
                .min2{
                    min-width:104px;
                }
                .pub{
                    word-break: break-all;
                }
            }
        }
    }

</style>
<style lang="less">
    .custom-net{
        .el-input{
            width: 300px;
            .el-input__inner{
                font-size:12px;
                height:40px;
            }
        }
        .el-form-item__label{
            font-size: 12px;
            color: #24272B;
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button{
            -webkit-appearance: none !important;
            margin: 0;
        }
        .el-input-group__append{
            background: #D3D8E1;
            border-radius: 0px 4px 4px 0px;
            font-family: "微软雅黑","Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
        }
        .el-form-item__error{
            width:300px;
        }
    }
    .el-form-item.is-required .el-form-item__label:before{
        content:"";
        margin-right: 0px;
    }
</style>
