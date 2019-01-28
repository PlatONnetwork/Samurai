<template>
    <div class="node-apply format-style">
        <div class="card node-apply-content">
            <div v-show="step==1">
                <el-form :model="nodeForm" ref="nodeForm" :rules="nodeFormRules" class="step form-container" >
                    <p style="display: flex">
                        <span class="label-txt-line" style="line-height:40px">{{$t('application.account')}}</span>
                        <el-form-item prop="name" class="label-item">
                            <el-input class="large-size" v-model.trim="nodeForm.name" :placeholder="$t('application.accountRule')"></el-input>
                        </el-form-item>
                    </p>
                    <p class="title">{{$t('application.nodeInfo')}}</p>
                    <div class="columns">
                        <div>
                            <span class="label-txt-block">{{$t('application.nodeUrl2')}}</span>
                            <el-form-item prop="host">
                                <el-input class="" v-model.trim="nodeForm.host"></el-input>
                            </el-form-item>
                        </div>
                        <div>
                            <span class="label-txt-block">{{$t('application.nodePublicKeyID')}}</span>
                            <el-form-item prop="publicKey">
                                <el-input class="" v-model.trim="nodeForm.publicKey"></el-input>
                            </el-form-item>
                        </div>
                    </div>
                    <p>
                        <span class="label-txt-block">{{$t('application.nodeIntro')}}</span>
                        <el-form-item prop="intro" class="intro-box">
                            <el-input v-model.trim="nodeForm.intro" type="textarea" resize="none" :rows="5" :cols="100" :placeholder="$t('application.nodeIntroTxt')"></el-input>
                            <span class="intro-len">{{nodeForm.intro?nodeForm.intro.length:0}}/200</span>
                        </el-form-item>
                    </p>
                    <p class="title">{{$t('application.profitPlan')}}</p>
                    <div class="columns">
                        <div>
                            <span class="label-txt-block">{{$t('application.nodeWallet2')}}<span class="font10" :style="{letterSpacing:lang=='en'?'0px':'0.43px'}">{{$t('application.nodeWallet2Txt')}}</span></span>
                            <el-form-item prop="admin">
                                <el-select v-model="nodeForm.Owner">
                                    <el-option v-for="wallet in allWallets"
                                               :label="(wallet.account.length>16?wallet.account.slice(0,16):wallet.account)+'--'+wallet.balance+' Energon'"
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
                <p class="btn-box-1 pos" v-if="step==1">
                    <el-button :class="[lang=='zh-cn'?'letterSpace':'','cancel']" @click="back">{{$t('form.cancel')}}</el-button>
                    <el-button type="primary" @click="next">{{$t('form.next')}}</el-button>
                </p>
            </div>
            <div v-show="step==2">
                <el-form v-model="payForm" ref="parForm" :rules="payFormRules" label-position="top">
                    <el-form-item prop="payWallet" :label="$t('application.payWallet')">
                        <el-select v-model="payForm.payWallet" @change="changePayWallet">
                            <el-option v-for="wallet in wallets"
                                       :label="(wallet.account.length>16?wallet.account.slice(0,16):wallet.account)+'--'+wallet.balance+' Energon'"
                                       :value="wallet.address"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item prop="value" :label="$t('application.stakeAmount')">
                        <el-input v-model.trim="payForm.value" @blur="changeVal" @input="getRanking" :placeholder="$t('application.stakeNumber')" type="number">
                            <el-button slot="append" @click="sendAll">All</el-button>
                        </el-input>
                        <span class="send-txt">{{$t("wallet.wantTo")}} <span class="send-val"><span class="bold">{{payForm.value || 0}}</span>&nbsp;Energon</span></span>
                        <p class="danger" v-if="belowMinimum">{{$t('application.notBeBelow')}}{{min}} Energon</p>
                        <p class="gray">{{$t('application.numberTip1')}}{{min}} Energon{{$t('application.numberTip2')}}</p>
                        <p class="d-p"><span class="label-txt" :style="{width:lang=='en'?'153px':'88px'}">{{$t('application.maximumAmount')}}</span><span class="value-txt"><span class="bold">{{depositList.length>0?depositList[0]:(payForm.value || 0)}}</span>&nbsp;Energon</span></p>
                        <p class="d-p"><span class="label-txt" :style="{width:lang=='en'?'153px':'88px'}">{{$t('application.minimumAmount')}}</span><span class="value-txt"><span class="bold">{{depositList.length>0?depositList[depositList.length-1]:(payForm.value || 0)}}</span>&nbsp;Energon</span></p>
                        <p class="d-p"><span class="label-txt" :style="{width:lang=='en'?'153px':'88px'}">{{$t('application.expectedRanking')}}</span><span class="value-txt">{{(ranking!=='-'&&ranking<200)?ranking:$t('application.after200')}}</span></p>
                    </el-form-item>
                    <el-form-item :label="$t('wallet.selectFee')">
                        <span class="send-slider">
                            <fee-slider @sel="selFee" :estimateGas="gas"></fee-slider>
                        </span>
                    </el-form-item>
                    <p class="btn-box pos">
                        <span>支付：{{add(payForm.value-0,payForm.fee-0)}} Energon</span>
                        <span class="btns">
                            <el-button :class="[lang=='zh-cn'?'letterSpace':'','cancel']" @click="back">{{$t('form.cancel')}}</el-button>
                            <el-button type="primary" @click="prev">{{$t('form.back')}}</el-button>
                            <el-button type="primary" :disabled="!payForm.value" @click="submit">{{$t('application.submitApply')}}</el-button>
                        </span>
                    </p>
                </el-form>
            </div>
        </div>

        <div class="modal confirm" v-if="showConfirm">
            <div class="modal-main">
                <div class="modal-title">{{$t('application.createValidator')}}</div>
                <div class="modal-content">
                    <div class="confirm-content">
                        <p>{{$t("wallet.amount")}}<span class="txt"><span class="bold">{{payForm.value}}</span> Energon</span></p>
                        <p>From<span class="txt">{{payForm.payWallet}}</span></p>
                        <p>To<span class="txt">{{contractAddress}}</span></p>
                        <p>{{$t("wallet.fee")}}<span class="txt"><span class="bold">{{payForm.fee}}</span> Energon</span></p>
                    </div>
                    <p class="inputb">
                        <el-input :placeholder="$t('wallet.input')+fromWallet.account+' '+$t('wallet.walletPsw')" type="password" v-model.trim="payForm.psw"></el-input>
                    </p>
                </div>
                <div class="modal-btn">
                    <el-button :class="[lang=='zh-cn'?'letterSpace':'','cancel']" @click="showConfirm=false">{{$t("form.cancel")}}</el-button>
                    <el-button :class="[lang=='zh-cn'?'letterSpace':'']" @click="send" type="primary" :disabled="handleLoading">{{$t("form.submit")}}</el-button>
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
                ranking:'-',
                valueNull:false,
                gas:0,
                gasPrice:0,
                checkRule:false,
                logoNull:false,
                totalPay:0,
                min:1000000,
                belowMinimum:false,
                handleLoading:false
            }
        },
        computed: {
            ...mapGetters(['joinNode','contractAddress','lang']),
            logoIndex(){
                return '01';
                let index = Math.floor(Math.random()*(42-1+1)+1);
                return index<10?'0'+index:index;
            }
        },
        mounted(){
            let _this = this;
            this.getBalOrd().then((list)=>{
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
                    this.nodeForm.Owner = arr[0].address
                }
            });
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

        },
        methods: {
            ...mapActions(['getBalOrd','getOrd','getDepositList','saveApplyRecord','isExits','saveQuitRecord','updateJoinNode','saveTractRecord']),
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
                    arr = value.split(":");
                }
                if (!value) {
                    return callback(new Error(this.$t('application.hostNull')));
                }else if (arr.length!==2 || !(regConfig.IP.test(arr[0])) || !(regConfig.PORT.test(arr[1]))){
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
            add(arg1,arg2){
                return mathService.add(arg1,arg2);
            },
            selFee(data){
                this.gasPrice=data;
                if(this.gas){
                    this.payForm.fee = mathService.mul(this.gas,this.gasPrice);
                }
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
                });
            },
            getRanking(){
                this.valueNull = false;
                this.belowMinimum = false;
                let arr = JSON.parse(JSON.stringify(this.depositList));
                arr.push(this.payForm.value);
                arr.sort((a,b)=>{
                    return b-a
                });
                this.ranking = arr.indexOf(this.payForm.value)+1;
            },
            changeVal(){
                if(!this.payForm.value || this.payForm.value==0){
                    this.payForm.value=null;
                    this.valueNull = true;
                }else{
                    this.valueNull = false;
                    this.total = (this.payForm.value-0)+this.payForm.fee;
                    this.getGas().then((gas)=>{
                        console.log('getGas---->',gas);
                        this.gas = gas;
                        // this.gasPrice = parseInt(mathService.div(contractService.web3.toWei(this.payForm.fee,'ether'),gas));
                    }).catch((e)=>{
                        // this.$message.error('估算gas值失败')
                    });
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
                        //判断节点地址是否可连接
                        let host = this.nodeForm.host.split(":")[0],
                            port = this.nodeForm.host.split(":")[1];
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
                                        this.$message.warning(this.$t('application.nodeUrlExit'));
                                    }else{
                                        this.getDepositList().then((data)=>{
                                            console.log(typeof data,data.length);
                                            if(data.length>0){
                                                if(this.payForm.value){
                                                    data.push(this.payForm.value);
                                                    data.sort(function(a,b){
                                                        return b-a
                                                    });
                                                    this.ranking = data.indexOf(this.payForm.value)+1;
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
                }else if(this.depositList.length>199 && (this.payForm.value<this.depositList[this.depositList.length-1]*1.1)){
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
                    host:this.nodeForm.host.split(":")[0],
                    Port:this.nodeForm.host.split(":")[1],
                    Extra:contractService.web3.toUnicode(extra),
                    createTime:new Date().getTime()
                };
                return [params.nodeId,params.Owner,params.fee,params.host,params.Port,params.Extra];
            },
            getGas(){
                return new Promise((resolve, reject)=>{
                    resolve(2000000);
                    // if(this.payForm.value){
                    //     const MyContract = contractService.web3.eth.contract(contractService.getABI(2));
                    //     const myContractInstance = MyContract.at(contractService.appContractAddress);
                    //     let params = this.getParams();
                    //     const platOnData = myContractInstance['CandidateDeposit'].getPlatONData(...params);
                    //     contractService.web3.eth.estimateGas({
                    //         "from":this.payForm.payWallet,
                    //         "to":contractService.appContractAddress,
                    //         "data":platOnData
                    //     },(err,data)=>{
                    //         console.log('估算gas--->',err,data);
                    //         if(err){
                    //             reject(err)
                    //         }
                    //         resolve(data);
                    //     })
                    // }
                });
            },
            send(){
                let params = this.getParams(),
                    value = this.payForm.value;
                keyManager.recover2(this.fromWallet,this.payForm.psw,'buf',(err,privateKey)=>{
                    if(err){
                        this.$message.error(this.$t('form.wrongPsw'));
                        return;
                    }
                    console.log(JSON.stringify(params));
                    this.handleLoading = true;
                    console.log('params---->',params);
                    // contractService.platONSendTransaction(contractService.getABI(2),contractService.appContractAddress,'CandidateDeposit',JSON.stringify(params),this.payForm.payWallet,privateKey,this.gas,contractService.web3.toWei(this.gasPrice,"ether"),value,false,1001).then((result)=>{
                    contractService.platONSendTransaction(contractService.getABI(2),contractService.appContractAddress,'CandidateDeposit',JSON.stringify(params),this.payForm.payWallet,privateKey,this.gas,21000000000,value,false,1001).then((result)=>{
                        console.log('CandidateDeposit--result-->',result);
                        this.handleLoading = false;
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
                            state:0
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
                                    this.showConfirm=false;
                                    this.updateJoinNode({});
                                    this.$router.push('/my-node');
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
            padding-right:70px;
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
            color: #9EABBE;
            letter-spacing: 0.43px;
        }
        .d-p{
            .label-txt{
                display: inline-block;
                color: #525768;
            }
            .value-txt{
                color: #000002;
            }
        }
        .btn-box-1{
            margin-top:30px;
            height:60px;
            line-height:60px;
            text-align: right;
            border-top:solid 1px #D3D8E1;
            .el-button{
                margin-right:40px;
            }
        }
        .btn-box{
            position:absolute;
            bottom:1px;
            margin:0;
            width:calc(~"100% - 40px");
            height:60px;
            line-height:60px;
            border-top:solid 1px #D3D8E1;
            font-size: 14px;
            color: #24272B;
            font-weight:600;
            text-align:left;
            .btns{
                position:absolute;
                right:40px;
                top:0;
                .el-button{
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
            top:68px;
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

</style>
<style lang="less">
    .node-apply-content{
        .el-input__inner{
            height:40px;
        }
        .el-form-item{
            margin-bottom:14px;
        }
        .label-item.el-form-item{
            display:inline-block;
        }
        .large-size.el-input{
            width:596px;
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
            position: static;
        }
    }
</style>

