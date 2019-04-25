<template>
    <div class="node-apply format-style">
        <div class="card node-apply-content">
            <div v-show="step==1">
                <el-form :model="nodeForm" ref="nodeForm" :rules="nodeFormRules" class="step form-container" >
                    <div>
                        <p class="title">{{$t('application.account')}}</p>
                        <p class="columns">
                            <el-form-item prop="name" class="label-item">
                                <el-input class="large-size" v-model.trim="nodeForm.name" :placeholder="$t('application.accountRule')"></el-input>
                            </el-form-item>
                        </p>
                    </div>
                    <p class="title">{{$t('application.nodeInfo')}}</p>
                    <div class="columns">
                        <div>
                            <span class="label-txt-block">{{$t('application.nodeUrl2')}}</span>
                            <el-form-item prop="host">
                                <el-input class="" v-model.trim="nodeForm.host" placeholder="XXX.XXX.XXX.XXX XXXX"></el-input>
                            </el-form-item>
                        </div>
                        <div>
                            <span class="label-txt-block">{{$t('application.nodePublicKeyID')}}({{$t('wallet.pubKey')}})</span>
                            <el-form-item prop="publicKey">
                                <el-input class="" v-model.trim="nodeForm.publicKey"></el-input>
                            </el-form-item>
                        </div>
                    </div>
                    <p>
                        <span class="label-txt-block">{{$t('application.nodeIntro')}}</span>
                        <el-form-item prop="intro" class="intro-box intro">
                            <el-input v-model.trim="nodeForm.intro" type="textarea" resize="none" :rows="7" :cols="100" :placeholder="$t('application.nodeIntroTxt')"></el-input>
                            <span class="intro-len">{{nodeForm.intro?nodeForm.intro.length:0}}/200</span>
                        </el-form-item>
                    </p>
                    <p class="title">{{$t('application.profitPlan')}}</p>
                    <div class="columns">
                        <div>
                            <span class="label-txt-block">{{$t('application.nodeWallet2')}}<span class="font10" :style="{letterSpacing:lang=='en'?'0px':'0.43px'}">{{$t('application.nodeWallet2Txt')}}</span></span>
                            <el-form-item prop="admin">
                                <el-select v-model="nodeForm.Owner" @change="ownerChange" :placeholder="$t('wallet.selectHint')">
                                    <el-option v-for="wallet in allWallets"
                                               :label="(wallet.account.length>10?wallet.account.slice(0,10):wallet.account)+'--'+wallet.balance+' Energon'"
                                               :value="wallet.address"></el-option>
                                </el-select>
                            </el-form-item>
                        </div>
                        <div>
                            <span class="label-txt-block">{{$t('application.ratio2')}}<span class="font10" :style="{letterSpacing:lang=='en'?'0px':'0.43px'}">{{$t('application.ratio2Txt')}}</span></span>
                            <el-form-item prop="bonus" class="bonus-input">
                                <el-input v-model.trim="nodeForm.bonus" type="number" @input.native="checkPerc($event)" class="bonus-input"></el-input>
                                <span>%</span>
                            </el-form-item>
                        </div>
                    </div>
                    <p class="title">{{$t('application.institutionalInfo')}}</p>
                    <div class="columns">
                        <div>
                            <span class="label-txt-block">{{$t('application.orgName')}}</span>
                            <el-form-item prop="orgName">
                                <el-input v-model.trim="nodeForm.orgName"></el-input>
                            </el-form-item>
                        </div>
                        <div>
                            <span class="label-txt-block">{{$t('application.orgNet')}}</span>
                            <el-form-item prop="orgNet">
                                <el-input v-model.trim="nodeForm.orgNet" ></el-input>
                            </el-form-item>
                        </div>
                    </div>
                </el-form>
                <p class="btn-box-1" v-if="step==1">
                    <el-button type="primary" @click="next">{{$t('form.next')}}</el-button>
                    <el-button :class="[lang=='zh-cn'?'letterSpace':'']" @click="back">{{$t('form.cancel')}}</el-button>
                </p>
            </div>
            <div v-show="step==2">
                <el-form v-model="payForm" ref="parForm" :rules="payFormRules" label-position="top">
                    <el-form-item prop="payWallet" :label="$t('application.payWallet')">
                        <el-select v-model="payForm.payWallet" @change="changePayWallet" :placeholder="$t('wallet.selectHint')">
                            <el-option v-for="wallet in wallets"
                                       :label="(wallet.account.length>10?wallet.account.slice(0,10):wallet.account)+'--'+wallet.balance+' Energon'"
                                       :value="wallet.address"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item prop="value" :label="$t('application.stakeAmount')">
                        <el-input v-model.trim="payForm.value" @blur="changeVal" @input="getRanking" :placeholder="$t('application.stakeNumber')" type="number"  v-focus="payFormInputFocus" :key="payFormInputKey">
                            <el-button slot="append" @click="sendAll">ALL</el-button>
                        </el-input>
                        <span class="send-txt">{{$t("wallet.wantTo")}} <span class="send-val"><span class="bold">{{payForm.value || 0}}</span>&nbsp;Energon</span></span>
                        <p class="danger" v-if="belowMinimum">{{$t('application.notBeBelow')}}{{min}} Energon</p>
                        <p class="gray">{{$t('application.numberTip1')}}{{min}} Energon{{$t('application.numberTip2')}}</p>
                        <!--<p class="d-p"><span class="label-txt">{{$t('application.maximumAmount')}}</span><span class="value-txt"><span class="bold">{{depositList.length>0?depositList[0]:(payForm.value || 0)}}</span>&nbsp;Energon</span></p>-->
                        <!--<p class="d-p"><span class="label-txt">{{$t('application.minimumAmount')}}</span><span class="value-txt"><span class="bold">{{depositList.length>0?depositList[depositList.length-1]:(payForm.value || 0)}}</span>&nbsp;Energon</span></p>-->
                        <p class="d-p"><span class="label-txt">{{$t('application.expectedRanking')}}</span><span class="value-txt">{{(ranking!=='-'&&ranking<200)?ranking:$t('application.after200')}}</span></p>
                    </el-form-item>
                    <div class="btn-box pos">
                        <p class="stake">{{$t('application.stake2')}}</p>
                        <p class="value">{{payForm.value || 0}} Energon</p>
                        <p class="btns">
                            <el-button type="primary" :disabled="!payForm.value" @click="submit">{{$t('form.submit')}}</el-button>
                            <el-button type="primary" @click="prev">{{$t('form.back')}}</el-button>
                            <el-button :class="[lang=='zh-cn'?'letterSpace':'']" @click="back">{{$t('form.cancel')}}</el-button>
                        </p>
                    </div>
                </el-form>
            </div>
        </div>

        <div class="modal confirm" v-if="showConfirm">
            <div class="modal-main">
                <div class="modal-title">{{$t('application.createValidator')}}</div>
                <div class="modal-content">
                    <div class="confirm-content">
                        <p>{{$t("application.nodeName2")}}<span class="txt"><span class="bold">{{nodeForm.name}}</span></span></p>
                        <p>
                            {{$t("application.nodeWallet")}}
                            <span class="txt">
                                <i :class="['trade-wallet-icon',ownerWallet.icon]">{{ownerWallet.account.slice(0,1).toUpperCase()}}</i>
                                <span v-if="ownerWallet.account">{{ownerWallet.account.length>16?(ownerWallet.account.slice(0,16)+'...'):ownerWallet.account}}</span>
                                <span v-else>{{nodeForm.Owner}}</span>
                            </span>
                        </p>
                        <p>{{$t('application.staked2')}}<span class="txt">{{payForm.value}} Energon</span></p>
                        <p>{{$t('application.payWallet2')}}
                            <span class="txt">
                                <i :class="['trade-wallet-icon',fromWallet.icon]">{{fromWallet.account.slice(0,1).toUpperCase()}}</i>
                                <span v-if="fromWallet.account">{{fromWallet.account.length>16?(fromWallet.account.slice(0,16)+'...'):fromWallet.account}}</span>
                                <span v-else>{{payForm.payWallet}}</span>
                            </span>
                        </p>
                        <p>{{$t("wallet.fee")}}<span class="txt"><span class="bold">{{payForm.fee}}</span> Energon</span></p>
                    </div>
                    <p class="inputb">
                        <el-input :placeholder="$t('wallet.input')+(fromWallet.account.length>16?(fromWallet.account.slice(0,16)+'...'):fromWallet.account)+$t('wallet.walletPsw')" type="password" v-model.trim="payForm.psw"></el-input>
                    </p>
                </div>
                <div class="modal-btn">
                    <el-button :class="[lang=='zh-cn'?'letterSpace':'']" @click="showConfirm=false" :disabled="handleLoading">{{$t("form.cancel")}}</el-button>
                    <el-button :class="[lang=='zh-cn'?'letterSpace':'']" @click="send" type="primary" :disabled="!payForm.psw" :loading="handleLoading">{{$t("form.submit")}}</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex'
    import keyManager from '@/services/key-manager';
    import contractService from '@/services/contract-servies';
    import feeSlider from '@/components/feeSlider';
    import mathService from '@/services/math';
    import APIService from '@/services/API-servies';
    import regConfig from '@/config/reg-config';
    import MathService from '@/services/math';
    var fs = require("fs");
    export default {
        name: 'nodeApply',
        data () {
            return {
                step:1,
                wallets:[],
                fromWallet:null,
                nodeForm:{
                    name:'',
                    pic:null,
                    host:null,
                    publicKey:null,
                    intro:'',
                    Owner:'',
                    bonus:'',
                    orgName:'',
                    orgNet:''
                },
                payForm:{
                    payWallet:'',
                    value:null,
                    fee:0.01,
                    psw:''
                },
                nodeFormRules:{
                    name:{validator: this.checkNames, trigger: 'blur change', required: true},
                    host:{validator: this.checkHost, trigger: 'blur change', required: true},
                    publicKey:{validator: this.checkPublicKey, trigger: 'blur change', required: true},
                    intro:{validator: this.checkIntro, trigger: 'blur change', required: true},
                    bonus:{validator: this.checkBonus, trigger: 'blur change', required: true},
                    orgName:{validator: this.checkOrgName, trigger: 'blur change', required: true},
                    orgNet:{validator: this.checkOrgNet, trigger: 'blur change', required: true}
                },
                payFormRules:{},
                showConfirm:false,
                allWallets:[],
                depositList:[],
                depositListCopy:[],
                ranking:'-',
                valueNull:false,
                gas:2000000,
                gasPrice:0,
                checkRule:false,
                logoNull:false,
                totalPay:0,
                min:1000000,
                belowMinimum:false,
                handleLoading:false,
                payFormInputKey:0,
                payFormInputFocus:false,
                ownerWallet:{}
            }
        },
        computed: {
            ...mapGetters(['joinNode','contractAddress','lang']),
            logoIndex(){
                let index = Math.floor(Math.random()*(4-1+1)+1);
                return index<10?'0'+index:index;
            }
        },
        mounted(){
            let _this = this;
            this.initWallets();
            if(this.joinNode && JSON.stringify(this.joinNode)!=='{}'){
                this.nodeForm.name = this.joinNode.Extra.nodeName;
                this.nodeForm.host = this.joinNode.Host+':'+this.joinNode.Port;
                this.nodeForm.publicKey = this.joinNode.CandidateId;
                this.nodeForm.intro = this.joinNode.Extra.nodeDiscription;
                this.nodeForm.Owner = this.joinNode.Owner || this.joinNode.Owner;
                this.nodeForm.bonus = this.perc(this.joinNode.Fee);
                this.nodeForm.orgName = this.joinNode.Extra.nodeDepartment;
                this.nodeForm.orgNet = this.joinNode.Extra.officialWebsite;
                this.changeVal();
            }
            this.payForm.value=this.min;
        },
        methods: {
            ...mapActions(['getMinBalOrd','getBalOrd','getOrd','getDepositList','saveApplyRecord','isExits','saveQuitRecord','updateJoinNode','saveTractRecord']),
            perc(num){
                if(!num) return;
                return 100 - MathService.div(num,100)
            },
            checkNames(rule, value, callback) {
                if (!value) {
                    return callback(new Error(this.$t('application.accountNull')));
                }else if (!/^[a-zA-Z][0-9a-zA-Z_]{5,29}$/g.test(value)){
                    return callback(new Error(this.$t('application.accountRule2')));
                } else{
                    callback();
                }
            },
            checkHost(rule, value, callback){
                let arr;
                if(value){
                    arr = value.replace(/^.*\:\/\//,'').split(/\s+|\:/);
                }
                if (!value) {
                    return callback(new Error(this.$t('application.hostNull')));
                }else if (arr.length!==2 || !(regConfig.IP.test(arr[0]) || regConfig.NETWORK2.test(arr[0])) || !(regConfig.PORT.test(arr[1]))){
                    return callback(new Error(this.$t('application.invalidHost')));
                } else{
                    callback();
                }
            },
            checkPublicKey(rule, value, callback){
                if (!value) {
                    return callback(new Error(this.$t('application.publicKeyNull')));
                }else if (!/^(0x)?[a-fA-F0-9]{128}$/g.test(value)){
                    return callback(new Error(this.$t('application.invalidPublicKey')));
                } else{
                    callback();
                }
            },
            checkIntro(rule, value, callback){
                if (!value) {
                    return callback(new Error(this.$t('application.introNull')));
                }else if (value.length<10 || value.length>200){
                    return callback(new Error(this.$t('application.invalidIntro')));
                } else{
                    callback();
                }
            },
            checkBonus(rule, value, callback){
                if (!value) {
                    return callback(new Error(this.$t('application.ratioNull')));
                }else if (value<0 || value>100){
                    return callback(new Error(this.$t('application.invalidRatio')));
                } else{
                    callback();
                }
            },
            checkPerc(e){
                let val = e.target.value;
                if(val.indexOf('.')!==-1){
                    setTimeout(()=>{
                        this.nodeForm.bonus = val.slice(0,val.indexOf('.'));
                    },500);
                }
            },
            checkOrgName(rule, value, callback){
                if (!value) {
                    return callback(new Error(this.$t('application.orgNameNull')));
                }else if (value.length>60){
                    return callback(new Error(this.$t('application.invalidOrgName')));
                } else{
                    callback();
                }
            },
            checkOrgNet(rule, value, callback){
                if (!value){
                    return callback(new Error(this.$t('application.orgNetNull')));
                }else if (!(regConfig.NETWORK.test(value))){
                    return callback(new Error(this.$t('application.invalidOrgNet')));
                } else{
                    callback();
                }
            },
            changePayWallet(){
                let _this = this;
                let arr = this.wallets.filter((item)=>{
                    return item.address==_this.payForm.payWallet
                })
                this.fromWallet = arr.length>0?arr[0]:null
            },
            ownerChange(){
                let arr = this.allWallets.filter((item)=>{
                    return item.address==this.nodeForm.Owner;
                });
                this.ownerWallet = arr[0];
            },
            add(arg1,arg2){
                return mathService.add(arg1,arg2);
            },
            initWallets(){
                let _this = this;
                //获取余额大于质押最小值的普通钱包列表
                this.getMinBalOrd(this.min).then((list)=>{
                    this.wallets = list;
                });
                this.getOrd().then((arr)=>{
                    this.allWallets = arr;
                    this.allWallets.forEach((wallet,index)=>{
                        contractService.web3.eth.getBalance(wallet.address,(err,data)=>{
                            if(err) throw err;
                            let balance=contractService.web3.fromWei(data.toString(10), 'ether');
                            wallet.balance = (Math.floor(Number(balance) * 100) / 100).toFixed(2);
                            _this.$set(_this.allWallets,index,wallet)
                        })
                    });
                    if((!this.joinNode || JSON.stringify(this.joinNode)=='{}') && arr.length>0){
                        // 默认显示第一个
                        this.nodeForm.Owner = arr[0].address
                    }
                });
            },
            //检验文件
            validateFile(fileObj) {
                let fileSize = fileObj.size;
                let fileTypeArr = ['.png', '.jpg', '.jpeg', '.pdf'];
                let [name, promptText] = [fileObj.name, ''];
                let fileSuffixName = name.substring(name.lastIndexOf('.'));
                if (!fileTypeArr.find(value => value == fileSuffixName))
                    promptText = this.$t('personalCenter.account.imgErr');
                if (fileSize > 10 * 1024 * 1024)
                    promptText = this.$t('personalCenter.account.imgLess');
                if (promptText) this.$message.error(promptText);
                return !promptText;
            },
            sendAll(){
                contractService.web3.eth.getBalance(this.fromWallet.address,(err,data)=>{
                    let balance=contractService.web3.fromWei(data.toString(10), 'ether');
                    this.payForm.value = balance - this.payForm.fee;
                    this.total = (this.payForm.value-0)+this.payForm.fee;
                    this.getRanking();
                    this.initWallets();
                });
            },
            getRanking(val){
                console.log('getRanking--------',this.depositListCopy);
                if(val && val.length>20){
                    const now=val.substring(0,20)
                    val=now
                    this.payForm.value=now
                    this.payFormInputKey=Math.random()
                    this.payFormInputFocus=true
                }
                this.valueNull = false;
                this.belowMinimum = false;
                let arr = JSON.parse(JSON.stringify(this.depositListCopy));
                arr.push({totalDep:this.payForm.value-0,BlockNumber:Number.POSITIVE_INFINITY});
                arr.sort((a,b)=>{
                    return (b.totalDep-a.totalDep) || (a.BlockNumber-b.BlockNumber);
                });
                let depArr = arr.map((d)=>{
                    return d.totalDep;
                });
                // console.log('arr--------',arr.length,arr);
                // console.log('depArr--------',depArr.length,depArr);
                this.ranking = depArr.lastIndexOf(this.payForm.value-0)+1;
            },
            changeVal(){
                if(!this.payForm.value || (Number(this.payForm.value) < Number(this.min))){
                    this.payForm.value = this.min;
                }else{
                    this.valueNull = false;
                    this.total = this.add(this.payForm.value-0,this.payForm.fee-0);
                }
            },
            back(){
                this.$router.push('/validator-node');
            },
            connectNode(port,host,cb){
                var net = require('net'),socket = net.Socket;
                var nsk = new socket(),
                hasAnswered = false;
                nsk.setTimeout(5000);//设置连接超时时间  5s
                nsk.on('connect',function(){//连接状态
                    nsk.destroy();//销毁
                    hasAnswered = true;
                    cb(port,'open');
                })
                .on('timeout',function(){//连接超时
                    nsk.destroy();
                    if(!hasAnswered){
                        cb(port,'timeout');
                    }
                })
                .on('error',function(){//连接错误
                    nsk.destroy();
                    hasAnswered = true;
                    cb(port,'closed');
                });
                nsk.connect(port,host);//执行连接
            },
            next(){
                this.$refs['nodeForm'].validate((valid)=>{
                    console.log('valid----',valid);
                    if(valid){
                        this.ownerChange();
                        //判断节点地址是否可连接
                        let host = this.nodeForm.host.split(/\s|\:/)[0],
                            port = this.nodeForm.host.split(/\s|\:/)[1];
                        this.connectNode(port,host,(port,status)=>{
                            console.log('connectNode--->',port,status);
                            if(status=='closed' || status=='timeout'){
                                this.$message.warning(this.$t('application.cannotConnect'));
                                return;
                            }else{
                                this.isExits({
                                    CandidateId:this.nodeForm.publicKey,
                                    host:this.nodeForm.host
                                }).then((isExit)=>{
                                    if(isExit){
                                        this.$message.warning(isExit==1?this.$t('application.nodeUrlExit'):this.$t('application.nodeIDExit'));
                                    }else{
                                        this.getDepositList().then((data)=>{
                                            console.log('getDepositList----',data);
                                            if(data.length>0){
                                                this.depositListCopy = JSON.parse(JSON.stringify(data));
                                                if(this.payForm.value){
                                                    data.push({totalDep:this.payForm.value-0,BlockNumber:Number.POSITIVE_INFINITY});
                                                    data.sort((a,b)=>{
                                                        return (b.totalDep-a.totalDep) || (a.BlockNumber-b.BlockNumber);
                                                    });
                                                    let depArr = data.map((d)=>{
                                                        return d.totalDep;
                                                    });
                                                    // console.log('depositListCopy-----',this.depositListCopy,depArr);
                                                    this.ranking = depArr.lastIndexOf(this.payForm.value-0)+1;
                                                }
                                            }else{
                                                this.ranking = 1;
                                            }
                                            this.depositList = data;
                                            this.total = (this.payForm.value-0)+this.payForm.fee;
                                            this.step=2;
                                            this.fromWallet=this.wallets[0];
                                            this.payForm.payWallet = this.wallets[0].address;
                                        });
                                    }
                                });
                            }
                        });
                    }
                });

            },
            prev(){
                this.step=1;
            },
            submit(){
                if(this.ranking>200){
                    this.$message.warning(this.$t('application.cannotSubmit'));
                }else if(this.payForm.value<this.min){
                    this.belowMinimum = true;
                }else if(this.depositList.length>199 && (this.payForm.value<this.depositList[this.depositList.length-1].totalDep*1.1)){
				    //不能低于第200名（即候选池最后一名）的质押金的110%
                    this.$message.warning(this.$t('application.ApCannotBeLess'))
                }else{
                    contractService.web3.eth.getBalance(this.fromWallet.address,(err,data)=>{
                        let balance=contractService.web3.fromWei(data.toString(10), 'ether');
                        let total = this.add(Number(this.payForm.value),Number(this.payForm.fee));
                        if(balance-total<0){
                            this.$message.warning(this.$t('wallet.cannotTrans2'));
                        }else{
                            this.showConfirm=true;
                            this.payForm.psw = '';
                        }
                    });
                }
            },
            getParams(){
                let extra = JSON.stringify({
                    nodeName: this.nodeForm.name,
                    nodePortrait: this.logoIndex,
                    nodeDiscription: this.nodeForm.intro,
                    nodeDepartment: this.nodeForm.orgName,
                    officialWebsite: this.nodeForm.orgNet,
                    time:new Date().getTime()
                });
                let params={
                    nodeId:'0x'+this.nodeForm.publicKey.replace(/^0x/,''),
                    Owner:this.nodeForm.Owner,
                    ownerAccount:this.fromWallet.account,
                    fee:mathService.mul((100-this.nodeForm.bonus),100) ,
                    host:this.nodeForm.host.split(/\s|\:/)[0],
                    Port:this.nodeForm.host.split(/\s|\:/)[1],
                    Extra:contractService.web3.toUnicode(extra),
                    createTime:new Date().getTime()
                };
                return [params.nodeId,params.Owner,params.fee,params.host,params.Port,params.Extra];
            },
            send(){
                let params = this.getParams(),
                    value = this.payForm.value;
                keyManager.recover2(this.fromWallet,this.payForm.psw,'buf',(err,privateKey)=>{
                    if(err){
                        this.$message.error(this.$t('form.wrongPsw'));
                        return;
                    }
                    // console.log(JSON.stringify(params));
                    this.handleLoading = true;
                    // console.log('params---->',params);
                    // contractService.platONSendTransaction(contractService.getABI(2),contractService.appContractAddress,'CandidateDeposit',JSON.stringify(params),this.payForm.payWallet,privateKey,this.gas,contractService.web3.toWei(this.gasPrice,"ether"),value,false,1001).then((result)=>{
                    contractService.platONSendTransaction(contractService.getABI(2),contractService.appContractAddress,'CandidateDeposit',JSON.stringify(params),this.payForm.payWallet,privateKey,this.gas,21000000000,value,false,1001).then((result)=>{
                        console.log('CandidateDeposit--result-->',result);
                        //记录交易
                        let tradeObj={
                            tradeTime:new Date().getTime(),
                            hash:result.hash,
                            value:value,
                            gasPrice:21000000000,
                            fromAccount:this.nodeForm.name,
                            from:this.payForm.payWallet,
                            to:contractService.appContractAddress,
                            type:'createValidator',
                            state:0,
                            nodeId:params[0],
                            nodeName:this.nodeForm.name
                        };
                        console.log('createValidator-----tradeObj---->',tradeObj);
                        this.saveTractRecord(tradeObj).then(()=>{
                            this.saveApplyRecord({
                                CandidateId:params[0],
                                Owner:params[1],
                                Fee:params[2],
                                Host:params[3],
                                Port:params[4],
                                Extra:JSON.parse(params[5]),
                                Deposit:value
                            }).then(()=>{
                                this.saveQuitRecord(null).then(()=>{
                                    this.$message.success(this.$t('trade.transactionSent'));
                                    setTimeout(()=>{
                                        this.handleLoading = false;
                                        this.showConfirm=false;
                                        this.updateJoinNode({});
                                        this.$router.push('/my-node');
                                    },3000);
                                });
                            });
                        }).catch((e)=>{
                                // this.sendLoading = false;
                                this.$message.error(this.$t('wallet.transactionFailed'));
                        });

                    }).catch((e)=>{
                        this.handleLoading = false;
                        this.$message.error(this.$t('wallet.transactionFailed'))
                    })
                });

            }
        },
        filters:{

        },
        components:{
            feeSlider
        },
        directives: {
            focus: {
                inserted: function (el, {value}) {
                    value&&el.firstElementChild&&el.firstElementChild.focus()
                }
            }
        }
    }
</script>

<style lang="less" scoped>
    .form-container{
        width:740px;
    }
    .font10{
        font-size:10px;
        color: #120000;
    }
    .marT10{
        margin-top:10px;
    }
    .node-apply-content{
        position:relative;
        height:100%;
        overflow-y: auto;
        padding:20px;
        font-size: 12px;
        .step{
            // padding-right:70px;
            padding: 0 70px 40px 0;
        }
        .label-txt-line{
            display:inline-block;
            margin-right:14px;
            width:53px;
            color: #24272B;
        }
        .label-txt-block{
            display:block;
            margin-bottom:10px;
        }
        .title{
            color: #24272B;
            letter-spacing: 0.43px;
            font-weight: 600;
        }
        .columns{
            display: flex;
            justify-content: space-between;
            margin-top:14px;

        }
        .bonus-input{
            position:relative;
            width:300px;
            height:40px;
            border-radius:4px;
            -webkit-appearance:none;
            -moz-appearance: none;
            outline:none;
            span{
                position:absolute;
                right:10px;
                top:3px;
                color: #9EABBE;
            }
            input{
                padding-left:6px;
                width:98%;
                height:38px;
                border:none;
                &:focus{
                    border-color:#18C2E9
                 }
            }
        }
        .send-txt{
            position: relative;
            top: 12px;
            color: #525768;
        }
        .send-slider{
            margin-top: -9px;
            display:block;
            width:445px;
        }
        .send-val{
            font-size: 14px;
            color: #22272C;
        }
        .gray{
            padding-bottom:8px;
            color: #9EABBE;
            letter-spacing: 0.43px;
            border-bottom: solid 1px #D3D8E1;
        }
        .d-p{
            .label-txt{
                margin-right:4px;
                display: inline-block;
                color: #525768;
            }
            .value-txt{
                color: #000002;
                font-weight:600;
            }
        }
        .btn-box-1{
            height:60px;
            line-height:60px;
            border-top:solid 1px #D3D8E1;
            background: #fff;
            .el-button{
                margin-right:40px;
            }
        }
        .btn-box{
            position:absolute;
            bottom:1px;
            margin:0;
            width:calc(~"100% - 40px");
            font-size: 14px;
            color: #24272B;
            font-weight:600;
            text-align:left;
            .stake{
                height:20px;
                line-height:20px;
                font-size: 14px;
                color: #24272B;
                font-weight: normal;
            }
            .value{
                margin:10px 0 14px;
                height:22px;
                line-height:22px;
                font-size: 16px;
                color: #24272B;
                letter-spacing: 0.5px;
            }
            .btns{
                height:60px;
                line-height:60px;
                border-top:solid 1px #D3D8E1;
                .el-button+.el-button{
                    margin-left:40px;
                }
            }
        }
        .check-box{
            position:absolute;
            bottom:80px;
            margin:0;
            a{
                color:#18C2E9;
                text-decoration: underline;
            }
        }
    }
    .intro-box{
        position:relative;
        .intro-len{
            position: absolute;
            bottom:0;
            right:20px;
            font-size: 10px;
            color: #9EABBE;
            letter-spacing: 0.36px;
        }
    }
    .label-txt-en{
        height: 32px;
    }
    .file{
        img{
            display: inline-block;
            vertical-align: middle;
            width:30px;
        }
    }
    .pos{
        position:fixed;
        bottom:17px;
        width:calc(~"100% - 240px")
    }
    .confirm-content{
        padding:14px!important;
    }
</style>
<style lang="less">
    .node-apply-content{
        .el-input__inner{
            height:40px;
        }
        .el-form-item{
            margin-bottom:14px;
            &.is-error{
                position:relative;
                &:after{
                     content:'';
                     position:absolute;
                     right:11px;
                     top:1px;
                     width:15px;
                     height:38px;
                     background: url("../../../static/images/icon_warning.svg") no-repeat center center #FFF;
                     background-size: 12px 12px;
                 }
                .intro-len{
                    bottom:17px;
                    right:31px;
                }
            }
            &.intro.is-error:after{
                 top:97px;
            }
        }
        .label-item.el-form-item{
            display:block;
            width:100%;
        }
        .large-size.el-input{
            width:100%;
        }
        .marT10.el-input{
            margin-top:10px;
        }
        .el-textarea{
            width:669px;
        }
        .el-form-item__content{
            font-size:12px;
        }
        .el-form-item__error{
            position:static;
            padding-left:0;
            text-align:right;
            &:before{
                display:none;
             }
        }
        .el-input-group__append{
            width:72px;
            height:40px;
            text-align: center;
            background: #4897F6;
            .el-button{
                width:72px;
                font-weight: normal;
            }
        }
       .el-form--label-top .el-form-item__label{
           font-weight:600;
       }
    }
</style>

