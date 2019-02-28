<template>
    <div class="node-detail format-style">
        <div class="my-node-content">
            <div class="no-result" v-if="loadCompolete && (!node || JSON.stringify(node)=='{}')">
                {{$t('application.noResult')}}
                <p class="btn-box">
                    <el-button @click="nodeQuery">{{$t('application.apply')}}</el-button>
                </p>
            </div>
            <div v-else-if="loadCompolete" style="height: 100%">
                <div v-if="nodeLoading" class="no-result">
                    <p class="bold">{{$t('application.applyWaiting')}}</p>
                    <div class="node-apply">
                        <div class="pic-box">
                            <img :src="'./static/images/characters/characters-'+node.Extra.nodePortrait+'.jpg'" alt="" v-if="node.Extra">
                        </div>
                        <div class="main">
                            <p class="bold">{{node.Extra?node.Extra.nodeName:''}}</p>
                            <p><span>{{$t('application.staked')}}：</span>{{node.Deposit}} Energon</p>
                            <p><span>{{$t('application.nodeUrl')}}:</span>{{node.Host+':'+node.Port}}</p>
                        </div>
                        <div class="city">{{city}}</div>
                         <p class="process">
                             <span :style="{width:depositApplyProcess?depositApplyProcess:10+'%'}"></span>
                         </p>
                    </div>
                </div>
                <div v-else>
                    <div class="header">
                        <div class="node-info">
                            <p class="pic">
                                <img :src="'./static/images/characters/characters-'+node.Extra.nodePortrait+'.jpg'" alt="" v-if="node.Extra">
                            </p>
                            <p class="name">
                                <span> <span class="bold">{{node.Extra?node.Extra.nodeName:''}}</span> <span v-if="city">({{city}})</span></span>
                                <span class="time" v-if="node.Extra">{{$t('application.applyTime')}} : {{node.Extra.time | FormatDate}}</span>
                                <span class="time" v-else>{{$t('application.applyTime')}}:</span>
                            </p>
                            <p class="node-state">
                                <span v-if="quitPending" class="node2">{{node.verNode?$t('application.status3'):node.ranking>100?(node.ranking>100?$t('application.status4'):$t('application.status5')):''}}</span>
                                <span v-else-if="nodeState" :class="nodeState==1?'danger':'node2'">{{nodeState==1?$t('application.status1'):nodeState==2?$t('application.status2'):''}}</span>
                                <span v-else-if="node.verNode" class="node1">{{$t('application.status3')}}</span>
                                <span v-else :class="[nodeAllowed?'node3':'node2']">{{nodeAllowed?$t('application.status5'):$t('application.status4')}}</span>
                            </p>
                        </div>
                        <div>
                            <ul class="pledge-info">
                                <li class="atp-li">
                                    <p>{{$t('application.staked')}}</p>
                                    <p>
                                        <span class="txt">{{((nodeState==1&&!quitPending) || nodeState==2)?'一':node.Deposit}}</span>
                                        <span>{{((nodeState==1&&!quitPending) || nodeState==2)?'':' Energon'}}</span>
                                    </p>
                                </li>
                                <li class="perc-li">
                                    <p>{{$t('application.fee')}}</p>
                                    <p>
                                        <span v-if="(nodeState==1&&!quitPending) || nodeState==2" class="txt">一</span>
                                        <span v-else>
                                           <span class="txt">{{node.Fee | perc}}</span>%
                                        </span>
                                    </p>
                                </li>
                                <li class="perc-li">
                                    <p>{{$t('vote.currentTickets')}}</p>
                                    <p><span class="txt">{{ticketsCount}}</span></p>
                                </li>
                                <li class="perc-li">
                                    <p>{{$t('vote.ticketAge')}}</p>
                                    <p><span class="txt">{{epoch}}</span>Bs</p>
                                </li>
                                <li class="atp-li">
                                    <p>
                                        {{$t('application.unboundStake')}}
                                        <span v-if="!!pendingRedeemStake" class="danger font10">{{$t('application.pendingRedeem')}}({{pendingRedeemStake}} Energon)</span>
                                    </p>
                                    <p>
                                        <span class="txt">{{unboundStake}}</span> Energon
                                        <span :class="[!!unboundStake&&!pendingRedeemStake?'':'gray','btn']" @click="handleWidthdraw(1)">{{$t('application.redeem')}}</span>
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div :class="[(!!pendingIncrease || !!pendingStake)?'handle-btns-1':'','handle-btns']" v-if="nodeState==0">
                        <span @click="handle(1)" :class="[!!pendingIncrease?'unabled':'','pending-btn']">
                            <span class="increase span-btn">{{$t('application.increase')}}</span>
                            <span v-if="pendingIncrease">{{$t('application.pending')}}(+{{pendingIncrease}} Energon)</span>
                        </span>
                        <span @click="handle(2)" :class="[!!pendingStake?'unabled':'','pending-btn']">
                            <span class="reduce span-btn">{{$t('application.reduce')}}</span>
                            <span v-if="pendingStake">{{$t('application.pending')}}(-{{pendingStake}} Energon)</span>
                        </span>
                        <span @click="handle(3)">
                            <span class="span-btn">{{$t('application.revoke')}}</span>
                        </span>
                    </div>
                    <p class="handle-btns" v-else>
                        <span v-if="quitPending">{{$t('application.revokePending')}}</span>
                        <span v-else class="join-again" @click="handle(4)">{{$t('application.joinAgain')}}</span>
                    </p>
                    <div class="detail">
                        <p class="title">{{$t('application.basicInfo')}}</p>
                        <div class="block">
                            <p class="sub-title">{{$t('application.nodeInfo')}}</p>
                            <p>
                                <span class="label-txt">{{$t('application.nodeUrl')}}</span>
                                <span>{{node.Host}}:{{node.Port}}</span>
                            </p>
                            <p class="candidateId-box">
                                <span class="label-txt">{{$t('application.nodePublicKeyID')}}</span>
                                <span class="candidateId">{{node.CandidateId}}</span>
                            </p>
                            <p>
                                <span class="label-txt">{{$t('application.nodeWallet')}}</span>
                                <span>{{node.Owner}}</span>
                            </p>
                            <p class="nodeIntro">
                                <span class="label-txt">{{$t('application.nodeIntro')}}</span>
                                <span class="nodeIntroTxt">{{node.Extra?node.Extra.nodeDiscription:''}}</span>
                            </p>
                        </div>
                        <div class="block">
                            <p class="sub-title">{{$t('application.profitPlan')}}</p>
                            <p>
                                <span class="label-txt">{{$t('application.ratio')}}</span>
                                <span>{{node.Fee | perc}}%</span>
                            </p>
                        </div>
                        <div class="block">
                            <p class="sub-title">{{$t('application.institutionalInfo')}}</p>
                            <p>
                                <span class="label-txt">{{$t('application.orgName')}}</span>
                                <span>{{node.Extra?node.Extra.nodeDepartment:''}}</span>
                            </p>
                            <p>
                                <span class="label-txt">{{$t('application.orgNet')}}</span>
                                <span class="net-btn" @click="openNet">{{node.officialWebsite || node.Extra.officialWebsite}}</span>
                            </p>
                        </div>

                    </div>
                </div>
            </div>

        </div>

        <!--质押申请确认-->
        <div class="modal" v-if="candidateWithdrawModal">
            <div class="modal-main">
                <div class="modal-title">
                    {{$t('application.prompt')}}
                    <span class="modal-close" @click="candidateWithdrawModal=false"></span>
                </div>
                <div class="modal-content">
                    <p>{{$t('application.promptTxt')}}</p>
                    <p class="marT14">{{$t('application.walletAddress')}}:</p>
                    <p>{{node.Owner}}</p>
                </div>
                <div class="modal-btn">
                    <el-button type="cancel" :class="[lang=='zh-cn'?'letterSpace':'']" @click="candidateWithdrawModal=false">{{$t('form.cancel')}}</el-button>
                    <el-button type="primary" :class="[lang=='zh-cn'?'letterSpace':'']"  @click="handleWidthdraw(2)">{{$t('form.comfirm')}}</el-button>
                </div>
            </div>
        </div>
        <!--提取质押确认输入密码-->
        <div class="modal confirm" v-if="withdrawPswModal">
            <div class="modal-main">
                <div class="modal-title">
                    {{handleType==1?$t('application.withdrawStakeConf'):$t('application.quitValidatorConf')}}
                    <el-button class="modal-close" @click="candidateWithdrawModal=false" :disabled="handleLoading"></el-button>
                </div>
                <div class="modal-content">
                    <div class="confirm-content">
                        <p>{{$t("wallet.amount")}}<span class="txt">{{unboundStake}} Energon</span></p>
                        <p>From<span class="txt">{{node.Owner}}</span></p>
                        <p>To<span class="txt contract-addr">{{contractAddress}}</span></p>
                        <p>{{$t("wallet.fee")}}<span class="txt">{{price}} Energon</span></p>
                    </div>
                    <p class="inputb">
                        <el-input  type="password" :placeholder="$t('wallet.input')+(keyObj?keyObj.account:'')+' '+$t('wallet.walletPsw')" v-model="psw"></el-input>
                    </p>
                    <p class="danger" v-if="pswNull">{{$t('form.nonPsw')}}</p>
                </div>
                <div class="modal-btn">
                    <el-button :class="[lang=='zh-cn'?'letterSpace':'']" type="cancel" @click="withdrawPswModal=false">{{$t('form.cancel')}}</el-button>
                    <el-button :class="[lang=='zh-cn'?'letterSpace':'']" type="primary" :loading="handleLoading" @click="handleCandidateWithdraw">{{$t('form.submit')}}</el-button>
                </div>
            </div>
        </div>

        <!--退出竞选确认-->
        <div class="modal quit-modal" v-if="quitModal">
            <div class="modal-main">
                <div class="modal-title">
                    {{$t('application.warn')}}
                    <span class="modal-close" @click="quitModal=false"></span>
                </div>
                <div class="modal-content">
                    <p class="icon-warn"></p>
                    <p class="danger">{{$t('application.warnText')}}</p>
                </div>
                <div class="modal-btn">
                    <el-button :class="[lang=='zh-cn'?'letterSpace':'']" type="cancel" @click="quitModal=false">{{$t('form.cancel')}}</el-button>
                    <el-button :class="[lang=='zh-cn'?'letterSpace':'']" type="primary" @click="handleWidthdraw(3)">{{$t('trade.confirm')}}</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex';
    import MathService from '@/services/math';
    import keyManager from '@/services/key-manager';
    import contractService from '@/services/contract-servies';
    import { setInterval, clearInterval } from 'timers';
    import Settings from '@/services/setting';

    var fs = require("fs");
    export default {
        name: 'myNode',
        data () {
            return {
                node:{},
                candidateWithdrawModal:false,
                withdrawPswModal:false,
                WithdrawValue:0,
                psw:'',
                pswNull:false,
                quitModal:false,
                keyObj:null,
                gas:0,
                gasPrice:0,
                price:0,
                handleType:0,
                withdrawInfos:[],
                pendingStake:0,
                pendingIncrease:0,
                pendingReduce:0,
                unboundStake:0,
                nodeState:0,
                handleLoading:false,
                nodeLoading:false,
                pendingTradeTimer:null,
                getRecuceDetailTimer:null,
                getMyNodeTimer:null,
                quitPending:false,
                depositApplyProcess:0,
                city:null,
                pendingRedeemStake:0,
                ticketsCount:0,
                epoch:0,
                withdrawInfosTimer:null,
                loadCompolete:false,
                nodeAllowed:false
            }
        },
        computed: {
            ...mapGetters(['contractAddress','lang','network','chainName']),
            APIConfig:function(){
                var APIConfig = require('@/config/API-config');
                return APIConfig.default;
            },
            allowed:function(){
                let cate,filePath;
                if(this.network.type=='custom'){
                    cate = this.chainName;
                }
                if(cate){
                    filePath = Settings.userDataPath+'net_'+this.network.type+'/chain/'+cate+'/cbft.json';
                }else{
                    filePath = Settings.userDataPath+'net_'+this.network.type+'/data/cbft.json';
                }
                let cbftJson = fs.readFileSync(`${filePath}`,'utf8');
                try{
                    let cbftObj = JSON.parse(cbftJson);
                    return cbftObj.ppos.candidate.allowed
                }catch(e){
                    return 512
                }
            }
        },
        mounted(){
            this.init();
        },
        methods: {
            ...mapActions(['getApplyNodeList','getNodeDetail','getOrd','getBalOrd','getCityByIp','verifiersList','getWalletByAddress','saveQuitRecord','getNodeState','clearApplyRecord','getQuitNodeList','updateJoinNode','saveTractRecord','getLastDeposit','getLastStake']),
            init(){
                console.log('myNode--init');
                this.getQuitNodeList().then((quitList)=>{
                    console.log('quitList---',quitList,quitList.length);
                    if(quitList.length>0){   //判断对否已退出竞选
                            let curNodeApply = quitList[0];
                            this.nodeState = 1;
                            this.node = curNodeApply;
                            this.loadCompolete = true;
                            // this.pendingStake = 0;
                            // this.unboundStake = 0;
                            this.getTicketInfo();
                            clearInterval(this.pendingTradeTimer);
                            this.pendingTradeTimer = setInterval(()=>{
                                this.getLastDeposit().then((lastDeposit)=>{
                                    console.log('lastDeposit---1---',lastDeposit);
                                    if(!lastDeposit.quitStake){
                                        this.quitPending = false;
                                        clearInterval(this.pendingTradeTimer);
                                        console.log('this.node--1-->',this.node);
                                        this.candidateWithdrawInfos();
                                        this.getWalletByAddress(this.node.Owner).then((keyObj)=> {
                                            this.keyObj  = keyObj
                                        })
                                    }else{
                                        this.quitPending = true;
                                    }
                                })
                            },1000)
                    }else{
                        this.getApplyNodeList().then((n)=>{
                            console.log('getApplyNodeList---',n);
                            let curNodeApply={};
                            if(n){
                                if(n.pending){   //节点质押申请提交中...
                                    this.nodeLoading = true;
                                    this.node = n;
                                    this.loadCompolete = true;
                                    this.getLastStake('createValidator').then((o)=>{
                                        this.depositApplyProcess = o?o.processWidth:0;
                                    });
                                    clearInterval(this.getMyNodeTimer);
                                    this.getMyNodeTimer = setInterval(()=>{
                                        this.init();
                                    },5000)
                                }else if(n.dieOut){   //节点已被淘汰
                                    this.nodeLoading = false;
                                    this.node = n;
                                    this.loadCompolete = true;
                                    this.nodeState = 2;
                                    console.log('this.node--2-->',this.node);
                                    this.candidateWithdrawInfos();
                                    this.getTicketInfo();
                                    this.getWalletByAddress(this.node.Owner).then((keyObj)=> {
                                        this.keyObj  = keyObj
                                    })
                                }else{   //节点正常
                                   clearInterval(this.getMyNodeTimer);
                                   curNodeApply = n;
                                    this.node = curNodeApply;
                                    this.getMyNodeDetail(curNodeApply);
                                    this.getRecuceDetail();
                                    this.loadCompolete = true;
                                    if(this.pendingTradeTimer){
                                        this.pendingTradeTimer = null;
                                    }
                                    clearInterval(this.pendingTradeTimer);
                                    this.pendingTradeTimer = setInterval(()=>{
                                        this.getLastDeposit().then((lastDeposit)=>{
                                                if(!lastDeposit.increaseStake){
                                                    this.pendingIncrease = 0;
                                                    setTimeout(()=>{
                                                        this.getMyNodeDetail(curNodeApply);
                                                        clearInterval(this.pendingTradeTimer);
                                                    },1000)
                                                }else{
                                                    this.pendingIncrease = lastDeposit.increaseStake?lastDeposit.increaseStake.value:0;
                                                }
                                        })
                                    },1000)
                                }
                            }else{
                                this.loadCompolete = true;
                            }
                        });
                    }
                })
            },
            getTicketInfo(){
                //获取得票信息
                contractService.platONCall(contractService.getABI(3),contractService.voteContractAddress,'GetCandidateTicketIds',this.node.Owner,[this.node.CandidateId]).then((ticketIds)=>{
                    console.log('ticketIds---->',ticketIds);
                    this.ticketsCount = JSON.parse(ticketIds).length;
                    this.nodeAllowed = this.ticketsCount<this.allowed?false:true;
                });
                contractService.platONCall(contractService.getABI(3),contractService.voteContractAddress,'GetCandidateEpoch',this.node.Owner,[this.node.CandidateId]).then((epoch)=>{
                    console.log('epoch----',epoch);
                    this.epoch = epoch=='0x'?0:epoch;
                })
            },
            getRecuceDetail(){
                console.log('do getRecuceDetail');
                let _this = this;
                function _getRecuceDetail(){
                    _this.getLastDeposit().then((lastDeposit)=>{
                        console.log('lastDeposit-----2-',lastDeposit,!lastDeposit.reduceStake && !lastDeposit.redeemStake);
                        if(!lastDeposit.reduceStake && !lastDeposit.redeemStake){
                            _this.pendingReduce = 0;
                            _this.pendingRedeemStake = 0;
                            _this.getMyNodeDetail(_this.node);
                            console.log('this.node--3-->',_this.node);
                            _this.candidateWithdrawInfos();
                            clearInterval(_this.getRecuceDetailTimer);
                            _this.getRecuceDetailTimer = null;
                        }else{
                            _this.pendingReduce = lastDeposit.reduceStake?lastDeposit.reduceStake.value:0;
                            _this.pendingRedeemStake = lastDeposit.redeemStake?lastDeposit.redeemStake.value:0;
                            console.log('this.node--4-->',_this.node);
                            _this.candidateWithdrawInfos();
                        }
                    })
                }
                _getRecuceDetail();
                this.getRecuceDetailTimer = setInterval(()=>{
                    console.log('do --getLastDeposit');
                    _getRecuceDetail();
                },5000);
            },
            getCity(){
                let ip = obj.Host.replace(/^http\:\/\//g,''),
                    ipStorage = window.localStorage.getItem('ipCitys')?JSON.parse(window.localStorage.getItem('ipCitys')):{};
                if(ipStorage[ip]){
                    this.city = ipStorage[ip];
                }else{
                    this.getCityByIp(ip).then((city)=>{
                        this.city = city;
                    })
                }
            },
            getMyNodeDetail(curNodeApply){
                console.log('getMyNodeDetail')
                this.getNodeDetail({
                    nodeId:curNodeApply.CandidateId,
                    Owner:curNodeApply.Owner
                }).then((obj)=>{
                    console.log('curNodeApply---',obj);
                    obj.ranking = curNodeApply.ranking;
                    if(!obj || obj=='0x'){
                        this.nodeLoading = true;
                        this.node = curNodeApply;
                        this.getTicketInfo();
                        this.getCity();
                    }else{
                        this.nodeLoading = false;
                        obj.Deposit = contractService.web3.fromWei(obj.Deposit,"ether");
                        this.verifiersList().then((verList)=>{
                            Object.assign(obj,{
                                verNode: (verList.indexOf(obj.CandidateId)!==-1)
                            });
                            obj.officialWebsite = obj.Extra.officialWebsite;
                            this.getNodeState(obj.CandidateId).then((state)=>{
                                this.nodeState = state;
                                this.node = obj;
                                this.node.CandidateId = '0x'+this.node.CandidateId;
                                this.getTicketInfo();
                                this.getWalletByAddress(this.node.Owner).then((keyObj)=> {
                                    this.keyObj  = keyObj
                                })
                            });
                            this.getCity();
                        })
                    }
                })
            },
            nodeQuery(){
                this.getOrd().then((arr)=>{
                    if(arr.length==0){
                       this.$message.warning(this.$t('application.noWallet'));
                       return;
                    }else{
                        this.getBalOrd().then((arr)=>{
                            if(arr.length==0){
                                this.$message.warning(this.$t('application.noBalance'));
                                return;
                            }else{
                                this.$router.push('/node-apply')
                            }
                        });
                    }
                });
            },
            handle(num){
                let _this=this;
                switch(num){
                    case 1:
                        if(!!this.pendingIncrease) return;
                        _this.$router.push({
                            path:'/increase-stake',
                            query:this.node
                        });
                        break;
                    case 2:
                        if(!!this.pendingStake) return;
                        _this.$router.push({
                            path:'/reduce-stake',
                            query:this.node
                        });
                        break;
                    case 3:
                        this.getGas(2).then(()=>{
                            this.price = contractService.web3.fromWei(this.gasPrice, "ether")*this.gas;
                            this.quitModal=true;
                        }).catch((e)=>{
                            this.quitModal=true;
                            // this.$message.error('估算gas值失败')
                        });
                        break;
                    case 4:
                        // 重新加入
                        this.updateJoinNode(this.node);
                        this.$router.push('/node-apply');
                        break;
                }
            },
            getGas(num){
                return new Promise((resolve, reject)=>{

                    const MyContract = contractService.web3.eth.contract(contractService.getABI(2));
                    const myContractInstance = MyContract.at(contractService.appContractAddress);
                    let params=[],funN='';
                    if(num==2){
                        params=[this.node.CandidateId,contractService.web3.toWei(this.node.Deposit*2,"ether")];
                        funN='CandidateApplyWithdraw';
                    }else if(num==1){
                        params=[this.node.CandidateId];
                        funN='CandidateWithdraw';
                    }
                    console.log('params',params,funN,num);
                    let platOnData = myContractInstance[funN].getPlatONData(...params);
                    console.log(JSON.stringify({
                        "from":this.node.Owner,
                        "to":contractService.appContractAddress,
                        "data":platOnData
                    }));
                    try{
                        contractService.web3.eth.estimateGas({
                            "from":this.node.Owner,
                            "to":contractService.appContractAddress,
                            "data":platOnData,
                        },(err,data)=>{
                            console.log('估算gas--->',err,data);
                            this.gas = data?data:2000000;
                            contractService.web3.eth.getGasPrice((e,gasPrice)=>{
                                console.log('getGasPrice--->',e,gasPrice.toString(10));
                                if(e){
                                    reject(e)
                                }
                                this.gasPrice = gasPrice.toString(10)-0;
                                this.price = contractService.web3.fromWei(this.gasPrice, "ether")*this.gas;
                                this.handleType = num;
                                resolve();
                            });
                        })
                    }catch(e){
                        console.log('estimateGas failed',e)
                    }

                });
            },
            handleWidthdraw(num){
                this.candidateWithdrawModal = false;
                this.withdrawPswModal = false;
                this.quitModal = false;
                this.psw='';
                switch(num){
                    case 1:
                        if(!this.unboundStake || this.pendingRedeemStake) return;
                        //提取质押金确认弹窗
                        this.getGas(1).then(()=>{
                            this.price = contractService.web3.fromWei(this.gasPrice, "ether")*this.gas;
                            this.candidateWithdrawModal =true;
                        }).catch((e)=>{
                            console.log('估算gas值失败',e);
                            this.candidateWithdrawModal =true;
                            // this.$message.error('估算gas值失败')
                        });
                        break;
                    case 2:
                        //提取质押金输入密码
                        this.withdrawPswModal =true;
                        break;
                    case 3:
                        //退出竞选输入密码
                        this.withdrawPswModal =true;
                        break;
                }
            },
            handleCandidateWithdraw(){
                if(/^\s*$/g.test(this.psw)){
                    this.pswNull = true;
                    return;
                }
                let funName='',params=[],tradeType,async;
                if(this.handleType==2){
                    //退出竞选
                    funName='CandidateApplyWithdraw';
                    params=[this.node.CandidateId,contractService.web3.toWei(this.node.Deposit*2,"ether")];
                    tradeType = 1002;
                }
                if(this.handleType==1){
                    //提取已解除质押金
                    funName='CandidateWithdraw';
                    params=[this.node.CandidateId];
                    tradeType = 1003;
                }
                keyManager.recover2(this.keyObj,this.psw,'buf',(err,privateKey)=>{
                    if(err==-100){
                        this.$message.warning(this.$t('wallet.invalidSignatures'));
                        return;
                    }else if(err){
                        this.$message.error(this.$t('form.wrongPsw'));
                        return;
                    }
                    this.handleLoading = true;
                    contractService.platONSendTransaction(contractService.getABI(2),contractService.appContractAddress,funName,JSON.stringify(params),this.node.Owner,privateKey,this.gas,this.gasPrice,false,false,tradeType).then((result)=>{
                        let tradeObj={
                            tradeTime:new Date().getTime(),
                            hash:result.hash,
                            value:this.handleType==1?this.unboundStake:this.node.Deposit,
                            gasPrice:this.gasPrice,
                            fromAccount:this.keyObj.account,
                            from:this.node.Owner,
                            type:this.handleType==1?'redeemStake':'quitStake',
                            state:0
                        };
                        this.saveTractRecord(tradeObj).then(()=>{
                            if(this.handleType==2){
                                this.saveQuitRecord(this.node).then(()=> {
                                    this.clearApplyRecord().then(() => {
                                        this.handleLoading = false;
                                        this.init();
                                        this.withdrawPswModal =false;
                                    })
                                })
                            }else{
                                this.handleLoading = false;
                                this.init();
                                this.withdrawPswModal =false;
                            }
                        }).catch((e)=>{
                            // this.sendLoading = false;
                            this.$message.error(this.$t('wallet.transactionFailed'));
                        });
                    }).catch((e)=>{
                        this.handleLoading = false;
                        this.$message.error(this.$t('application.increaseFail'))
                    })
                })
            },
            //减持质押申请,退出竞选前要先申请提取质押金
            candidateWithdraw(cb){
                keyManager.recover2(this.keyObj,this.psw,'buf',(err,privateKey)=>{
                    if(err){
                        this.$message.error(this.$t('form.wrongPsw'));
                    }
                    let params=[this.node.CandidateId];
                    contractService.platONSendTransaction(contractService.getABI(2),contractService.appContractAddress,'CandidateWithdraw',JSON.stringify(params),this.node.Owner,privateKey,this.gas,this.gasPrice,false,false,1003).then((result)=>{
                        console.log('CandidateWithdraw--->',result);

                         //记录交易
                        let tradeObj={
                            tradeTime:new Date().getTime(),
                            hash:result.hash,
                            value:this.node.Deposit,
                            gasPrice:this.gasPrice,
                            fromAccount:this.keyObj.account,
                            from:this.node.Owner,
                            type:'quitStake',
                            state:0
                        };
                        console.log('reduceStake-----tradeObj---->',tradeObj);
                        this.saveTractRecord(tradeObj).then(()=>{
                             cb();
                        }).catch((e)=>{
                           this.$message.error(this.$t('wallet.transactionFailed'));
                        });

                    }).catch((e)=>{
                        this.$message.error(this.$t('application.increaseFail'))
                    })
                })
            },
            candidateWithdrawInfos(){
                let _this = this;
                function toObj(str) {
                    if (!str || str == '0x') return []
                    let result
                    try {
                        result = JSON.parse(str)
                    } catch (error) {
                        console.warn(`toObj error`, error)
                        throw new Error(error)
                    }
                    if (Array.isArray(result)) {
                        return result.map(item => {
                            item.Extra ? item.Extra = JSON.parse(web3.toUtf8(item.Extra)) : ''
                            return item
                        })
                    } else {
                        result.Extra ? result.Extra = JSON.parse(web3.toUtf8(result.Extra)) : ''
                        return result
                    }
                }
                function getData(){
                    contractService.platONCall(contractService.getABI(2),contractService.appContractAddress,'CandidateWithdrawInfos',_this.node.Owner,[_this.node.CandidateId]).then((data)=>{
                        _this.withdrawInfos = toObj(data).Infos;
                        console.log('_this.withdrawInfos-------',_this.withdrawInfos,_this.pendingReduce);
                        if(_this.nodeState==1 || _this.nodeState==2){
                            if(_this.withdrawInfos.length==0){
                                clearInterval(_this.withdrawInfosTimer);
                            }
                        }
                        contractService.web3.eth.getBlockNumber((err,blockNumber)=>{
                            if(err) return;
                            _this.pendingStake = _this.pendingReduce;
                            _this.unboundStake = 0;
                            _this.withdrawInfos.forEach((item)=>{
                                item.Balance = contractService.web3.fromWei(item.Balance,"ether");
                                if(blockNumber - item.LockNumber > item.LockBlockCycle){
                                    _this.unboundStake+=(item.Balance-0);
                                }else{
                                    _this.pendingStake+=(item.Balance-0);
                                }
                            })
                        });

                    })
                }
                if(this.nodeState==1 || this.nodeState==2){
                    clearInterval(this.withdrawInfosTimer);
                    this.withdrawInfosTimer = setInterval(function(){
                        getData();
                    },1000)
                }else{
                    getData();
                }
            },
            openNet(){
                const shell = require('electron').shell;
                shell.openExternal(this.node.Extra.officialWebsite);
            }
        },
        filters:{
            'perc':function(num){
                if(!num) return;
                return 100 - MathService.div(num,100)
            }
        },
         beforeDestroy() {
            if(this.pendingTradeTimer){
                clearInterval(this.pendingTradeTimer);
                this.pendingTradeTimer = null;
            };
             if(this.getRecuceDetailTimer){
                clearInterval(this.getRecuceDetailTimer);
                this.getRecuceDetailTimer = null;
            };
            if(this.getMyNodeTimer){
                clearInterval(this.getMyNodeTimer);
                this.getMyNodeTimer = null;
            };
             if(this.withdrawInfosTimer){
                 clearInterval(this.withdrawInfosTimer);
                 this.withdrawInfosTimer = null;
             }
        },
    }
</script>

<style lang="less" scoped>
    .font10{
        font-size:10px;
    }
    .my-node-content{
        height:100%;
        font-size: 12px;
        color: #24272B;
        letter-spacing: 0.43px;
    }
    a{
        color:#18C2E9;
        text-decoration: underline;
    }
    .btn{
        margin-left:9.5px;
        color: #18C2E9;
        cursor:pointer;
    }
    .btn.gray{
        color: #9EABBE;
        cursor:not-allowed;
    }
    .no-result{
        padding-top:285px;
        height:100%;
        text-align: center;
        border-radius:10px;
        background: url("./images/node_images.png") no-repeat center 60px #fff;
        box-shadow: 0 4px 6px 0 rgba(48,48,77,0.05), 0 2px 4px 0 rgba(148,148,197,0.05);
    }
    .node-apply{
        position:relative;
        padding:10px 10px 10px 14px;
        margin:14px auto;
        width:400px;
        display:flex;
        box-shadow: 0 4px 6px 0 rgba(48,48,77,0.05), 0 2px 4px 0 rgba(148,148,197,0.05);
        border-radius: 4px;
        border:solid 1px #DFE3E9;
        .pic-box{
            padding-top:10px;
            min-width:40px;
            width:40px;
            img{
                width:40px;
                border-radius: 40px;
            }
        }
        .main{
            flex-grow: 1;
            padding:0 10px;
            color: #24272B;
            font-size: 12px;
            text-align:left;
            >p:nth-of-type(1){
                margin-bottom:10px;
                font-size: 14px;
            }
            >p:nth-of-type(2){
                margin-bottom:8px;
            }
            >p:nth-of-type(3){
                color: #525768;
            }
        }
        .city{
            min-width:50px;
            width:auto;
            color: #9EABBE;
        }

    }
    .btn-box{
        margin-top:20px;
        text-align:center;
        .el-button{
            padding:0 15px;
            width:auto;
            font-size: 14px;
            color: #FFFFFF;
            background: #18C2E9;
            border-radius: 4px;
        }
    }
    .txt{
        margin-top:14px;
        span{
            color: #18C2E9;
            cursor: pointer;
        }
    }
    .handle-btns{
        height:45px;
        line-height:45px;
        color: #24272B;
        text-align: center;
        background: #ECF1F8;
        box-shadow: 0 4px 6px 0 rgba(48,48,77,0.05), 0 2px 4px 0 rgba(148,148,197,0.05);
        border-radius: 0 0 4px 4px;
        >span{
            margin-right:90px;
            padding-left:20px;
            font-weight:bold;
            cursor: pointer;
        }
        >span.join-again{
            background: url("./images/icon_join.svg") no-repeat left center;
            background-size: 16px;
        }
        >span:nth-of-type(3){
            .span-btn{
                padding-left:20px;
                margin-right:0;
                background: url("./images/icon_esc.svg") no-repeat left center;
                background-size: contain;
            }
        }
        .pending-btn{
            position: relative;
            top: 0;
            display:inline-flex;
            flex-direction: column;
            line-height:20px;
            >span{
                padding-left:20px;
                text-align: left;
            }
            .increase {
                background: url("./images/icon_add.svg") no-repeat left center;
                background-size: 16px;
            }
            .reduce{
                background: url("./images/icon_reduce.svg") no-repeat left center;
                background-size: 16px;
            }
        }
        .pending-btn.unabled{
            top: -9px;
            cursor:not-allowed;
            .increase {
                background: url("./images/icon_add2.svg") no-repeat left center;
                background-size: 16px;
            }
            .reduce{
                background: url("./images/icon_reduce2.svg") no-repeat left center;
                background-size: 16px;
            }
            >span:nth-of-type(1){
                color: #9EABBE;
            }
            >span:nth-of-type(2){
                color: #F32E25;
                font-size: 10px;
                font-weight: normal;
            }
        }
    }
    .handle-btns-1{
        >span:not(.unabled){
           .span-btn{
               position:relative;
               top:-8px;
           }
        }
    }
    .modal{
        .modal-main .modal-content{
            padding:20px 20px 60px;
            font-size:12px;
        }
        .marT14{
            margin-top:14px;
        }
    }
    .modal.confirm .modal-main .modal-content .inputb{
        margin:10px 0 0 0;
    }
    .quit-modal{
        .modal-main{
            width:483px;
            .modal-content{
                padding:40px 0;
                text-align: center;
            }
            .icon-warn{
                margin-bottom:18px;
                height:30px;
                background: url("./images/icon_warning.svg") no-repeat center center;
                background-size: contain;
            }
        }
    }
    .nodeIntro{
        display: flex;
    }
    .nodeIntroTxt{
        word-break: break-all;
        width: 611px;
        margin-left: 4px;
    }
    .label-txt+span{
        font-weight: bold;
        font-family: Arial;
        letter-spacing: 0.5px;
    }
    .candidateId{
        margin-left: 4px;
    }
    .net-btn{
        color: #18C2E9;
        cursor: pointer;
    }
</style>

