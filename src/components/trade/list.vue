<template>
    <div style="height: 100%;overflow-y: auto;overflow-x: hidden;">
        <div v-if="!loadCompolete">
            <page-loading :loadTxt="$t('form.loading')"></page-loading>
        </div>

        <div v-else :class="[total>pageNum*numIndex?'paddB30':'','trade-list']">
            <div class="non-wallet content no-list-record" v-if="tradeList.length==0 && pageFrom=='tradeList' && loadCompolete">
                <p>{{$t('trade.noListRecord')}}</p>
            </div>
            <!--<p class="trade-rec-title" v-if="pageFrom=='shareDetail' && tab==0">{{pageFrom=='shareDetail'?$t('trade.pendingTrade'):$t('trade.record')}}</p>-->
            <ul v-if="pageFrom!='shareDetail' || pageFrom=='shareDetail'&&tab==0">
                <li v-for="(item,index) in pendingTradeListCopy" :key="index" @click="checkDetail(item)">
                    <div class="lt">
                        <p class="month" v-if="item">{{item.tradeTime | month}}</p>
                        <p class="date"  v-if="item">{{item.tradeTime | date}}</p>
                    </div>
                    <div class="mid">
                        <div>
                            <div class="type bold">
                                {{item.type | tradeType(item.state)}}
                                <ul v-if="item.ownersList && item.pending==1" class="owners">
                                    <li v-for="(owner,index) in item.ownersList"
                                        :key="owner"
                                        :class="(item.confirmList&&item.confirmList.indexOf(owner)!==-1)?'success':
                                    (item.rejectList&&item.rejectList.indexOf(owner)!==-1)?'reject':''">
                                        {{index+1}}
                                    </li>
                                </ul>
                            </div>
                            <div class="nowrap">
                                 <span
                                         :style="{maxWidth:isMaximized?'180px':'none'}"
                                         :class="[isMaximized?'':'addr-length',(item.fromWallet || item.fromWalletAccount)?'':'addr','icon-type']" :title="item.from">
                                    <span :class="['trade-wallet-icon',item.fromWallet?item.fromWallet.icon:'wallet-icon1']" v-if="item.fromWallet || item.fromWalletAccount">{{(item.fromWallet&&item.fromWallet.account.slice(0,1).toUpperCase())||item.fromWalletAccount}}</span>
                                    {{item.fromWallet&&(item.fromWallet.account.length>16?item.fromWallet.account.slice(0,16)+'...':item.fromWallet.account) || item.from}}
                                </span>
                                <span class="transfer"></span>
                                <span v-if="item.type=='contractCreate'"
                                      :style="{maxWidth:isMaximized?'180px':'none'}"
                                      :class="[isMaximized?'cont-length-lit':'cont-length','icon-type','contract-addr']"
                                      :title="item.contractAddress">
                                    {{$t('trade.contractCreation2')}}&nbsp;
                                    {{item.contractAddress || item.to}}
                                </span>
                                <span v-else-if="item.type=='createJointWallet'"
                                      :style="{maxWidth:isMaximized?'180px':'none'}"
                                      :class="[isMaximized?'cont-length-lit':'cont-length','icon-type']">
                                      <span :class="['trade-wallet-icon wallet-share',item.toWallet?item.toWallet.icon:'wallet-icon1']" v-if="item.toWallet || item.toWalletAccount">{{(item.toWallet&&item.toWallet.account.slice(0,1).toUpperCase()) || item.toWalletAccount}}</span>
                                      {{(item.toWallet&&(item.toWallet.account.length>16?item.toWallet.account.slice(0,16)+'...':item.toWallet.account)) || item.contractAddress || item.to}}
                                </span>
                                <span v-else
                                      :style="{maxWidth:isMaximized?'180px':'none'}"
                                      :class="['icon-type',item.type=='transfer' || item.type=='jointWalletExecution'?'':'contract-addr',isMaximized?'cont-length-lit':'cont-length']" :title="item.to">
                                    <span :class="['trade-wallet-icon',item.toWallet?item.toWallet.icon:'wallet-icon1']" v-if="item.toWallet || item.toWalletAccount">{{(item.toContract&&item.toContract.slice(0,1).toUpperCase())||(item.toWallet&&item.toWallet.account.slice(0,1).toUpperCase()) || item.toWalletAccount}}</span>
                                    {{(item.toWallet&&(item.toWallet.account.length>16?item.toWallet.account.slice(0,16)+'...':item.toWallet.account)) || item.to}}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div :class="[isMaximized?'mid-rt':'max','rt']">
                        <p class="value">
                            <span v-if="item.hash" :class="[item.type=='redeemStake'?'success':(item.type!='reduceStake' && item.type!='quitStake' && item.type!='contractCreate' && item.type!='createJointWallet' && item.type!='jointWalletExecution' && item.type!='contractExecution')?'danger':'gray']">{{item.type=='redeemStake'?'+':(item.type!='reduceStake' && item.type!='quitStake' && item.type!='contractCreate' && item.type!='createJointWallet' && item.type!='jointWalletExecution' && item.type!='contractExecution')?'-':''}}{{item.value  | decimal}}&nbsp;Energon</span>
                            <span v-else class="danger">-{{trans(item.value-0)}}&nbsp;Energon</span>
                        </p>
                        <p class="state">
                            <span v-if="item.hash" class="tc gray">
                                <span v-if="item.isCompolete" class="nowrap compolete">
                                    {{$t('trade.finished')}}
                                </span>
                                <span v-else-if="item.state==2" class="nowrap fail">
                                    {{$t('trade.failed')}}
                                </span>
                                <span v-else class="nowrap">
                                    <i class="circle-loading"></i>
                                    <!-- <el-progress type="circle" :percentage="item.processWidth" :width="15" :show-text="false" color="#0077FF"></el-progress> -->
                                    {{$t('trade.pending')}}
                                </span>
                            </span>
                            <span v-else class="tc gray">
                                <span v-if="item.pending==1">
                                    <span v-if="item.availOwners&&item.availOwners.length>0">
                                        <el-button :class="[lang=='zh-cn'?'letterSpace':'']" type="primary" @click="confirm(item,1)">{{$t('trade.confirm')}}</el-button>
                                        <el-button :class="[lang=='zh-cn'?'letterSpace':'']" @click="confirm(item,2)">{{$t('trade.reject')}}</el-button>
                                    </span>
                                    <span v-else-if="item.confirmationsOwners && (item.confirmationsOwners.length==item.required)" class="tc nowrap">
                                        {{$t('trade.pending')}}
                                    </span>
                                    <span v-else class="nowrap">
                                        {{$t('trade.toBeSigned')}}
                                    </span>
                                </span>
                                <span v-else :class="[item.executed=='0'?'danger':'','nowrap compolete']">{{item.executed==1?$t('trade.finished'):$t('trade.failed')}}</span>
                            </span>
                        </p>
                    </div>
                </li>
            </ul>
            <p v-if="pageFrom=='shareDetail' && tab==0 && pendingTradeList.length==0" class="marginT10 no-data">{{$t('trade.noSignRecord')}}</p>

            <!-- <p class="trade-rec-title" v-if="pageFrom!='tradeList'">{{$t('trade.record')}}</p> -->
            <ul v-if="pageFrom!='shareDetail' || pageFrom=='shareDetail'&&tab==1">
                <li v-for="(item,index) in tradeListCopy" :key="index" @click="checkDetail(item)">
                    <div class="lt">
                        <p class="month" v-if="item">{{item.tradeTime | month}}</p>
                        <p class="date"  v-if="item">{{item.tradeTime | date}}</p>
                    </div>
                    <div class="mid">
                        <div>
                            <div class="type bold">
                                {{item.type | tradeType(item.state)}}
                                <ul v-if="item.ownersList && item.pending==1" class="owners">
                                    <li v-for="(owner,index) in item.ownersList"
                                        :key="owner"
                                        :class="(item.confirmList&&item.confirmList.indexOf(owner)!==-1)?'success':
                                    (item.rejectList&&item.rejectList.indexOf(owner)!==-1)?'reject':''">
                                        {{index+1}}
                                    </li>
                                </ul>
                            </div>
                            <div class="nowrap">
                                 <span
                                         :style="{maxWidth:isMaximized?'180px':'none'}"
                                         :class="[isMaximized?'':'addr-length',(item.fromWallet || item.fromWalletAccount)?'':'addr','icon-type']" :title="item.from">
                                    <span :class="['trade-wallet-icon',item.fromWallet?item.fromWallet.icon:'wallet-icon1']" v-if="item.fromWallet || item.fromWalletAccount">{{(item.fromWallet&&item.fromWallet.account.slice(0,1).toUpperCase())||item.fromWalletAccount}}</span>
                                    {{item.fromWallet&&(item.fromWallet.account.length>16?item.fromWallet.account.slice(0,16)+'...':item.fromWallet.account) || item.from}}
                                </span>
                                <span class="transfer"></span>
                                <span v-if="item.type=='contractCreate'"
                                      :style="{maxWidth:isMaximized?'180px':'none'}"
                                      :class="[isMaximized?'cont-length-lit':'cont-length','icon-type','contract-addr']"
                                      :title="item.contractAddress">
                                    {{$t('trade.contractCreation2')}}&nbsp;
                                    {{item.contractAddress || item.to}}
                                </span>
                                <span v-else-if="item.type=='createJointWallet'"
                                      :style="{maxWidth:isMaximized?'180px':'none'}"
                                      :class="[isMaximized?'cont-length-lit':'cont-length','icon-type']">
                                      <span :class="['trade-wallet-icon wallet-share',item.toWallet?item.toWallet.icon:'wallet-icon1']" v-if="item.toWallet || item.toWalletAccount">{{(item.toWallet&&item.toWallet.account.slice(0,1).toUpperCase()) || item.toWalletAccount}}</span>
                                      {{(item.toWallet&&(item.toWallet.account.length>16?item.toWallet.account.slice(0,16)+'...':item.toWallet.account)) || item.contractAddress || item.to}}
                                </span>
                                <span v-else
                                      :style="{maxWidth:isMaximized?'180px':'none'}"
                                      :class="['icon-type',item.type=='transfer' || item.type=='jointWalletExecution'?'':'contract-addr',isMaximized?'cont-length-lit':'cont-length']" :title="item.to">
                                    <span :class="['trade-wallet-icon',item.toWallet?item.toWallet.icon:'wallet-icon1',item.toWallet&&item.toWallet.type=='share'?'wallet-share':'']" v-if="item.toWallet || item.toWalletAccount">{{(item.toContract&&item.toContract.slice(0,1).toUpperCase()) || (item.toWallet&&item.toWallet.account.slice(0,1).toUpperCase()) || item.toWalletAccount}}</span>
                                    {{(item.toWallet&&(item.toWallet.account.length>16?item.toWallet.account.slice(0,16)+'...':item.toWallet.account)) || item.to}}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div :class="[isMaximized?'mid-rt':'max','rt']">
                        <p class="value">
                            <span v-if="item.hash" :class="[item.type=='redeemStake'?'success':(item.type!='reduceStake' && item.type!='quitStake' && item.type!='contractCreate' && item.type!='createJointWallet' && item.type!='jointWalletExecution' && item.type!='contractExecution')?'danger':'gray']">{{item.type=='redeemStake'?'+':(item.type!='reduceStake' && item.type!='quitStake' && item.type!='contractCreate' && item.type!='createJointWallet' && item.type!='jointWalletExecution' && item.type!='contractExecution')?'-':''}}{{item.value  | decimal}}&nbsp;Energon</span>
                            <span v-else class="danger">-{{trans(item.value-0)}}&nbsp;Energon</span>
                        </p>
                        <p class="state">
                            <span v-if="item.hash" class="tc gray">
                                <span v-if="item.isCompolete" class="nowrap compolete">
                                    {{$t('trade.finished')}}
                                </span>
                                <span v-else-if="item.state==2" class="nowrap fail">
                                    {{$t('trade.failed')}}
                                </span>
                                <span v-else class="nowrap">
                                    <i class="circle-loading"></i>
                                    <!-- <el-progress type="circle" :percentage="item.processWidth" :width="15" :show-text="false" color="#0077FF"></el-progress> -->
                                    {{$t('trade.pending')}}
                                </span>
                            </span>
                            <span v-else class="tc gray">
                                <span v-if="item.pending==1">
                                    <span v-if="item.availOwners&&item.availOwners.length>0">
                                        <el-button :class="[lang=='zh-cn'?'letterSpace':'']" type="primary" @click="confirm(item,1)">{{$t('trade.confirm')}}</el-button>
                                        <el-button :class="[lang=='zh-cn'?'letterSpace':'']" @click="confirm(item,2)">{{$t('trade.reject')}}</el-button>
                                    </span>
                                    <span v-else-if="item.confirmationsOwners && (item.confirmationsOwners.length==item.required)" class="tc nowrap">
                                        {{$t('trade.pending')}}
                                    </span>
                                    <span v-else class="nowrap">
                                        {{$t('trade.toBeSigned')}}
                                    </span>
                                </span>
                                <span v-else :class="[item.executed=='0'?'danger':'','nowrap compolete']">{{item.executed==1?$t('trade.finished'):$t('trade.failed')}}</span>
                            </span>
                        </p>
                    </div>
                </li>
            </ul>
            <p v-if="(pageFrom!='shareDetail' || pageFrom=='shareDetail'&&tab==1) && tradeList.length==0 && pageFrom!='tradeList'"
               :class="[pageFrom=='tradeList'?'marginT30':'marginT10','no-data']">
                <span v-if="pageFrom=='tradeList'" class="icon-no-data"></span>
                {{$t('trade.noRecord')}}
            </p>
            <p v-if="total>pageNum*numIndex" class="load-more" @click="loadMore">{{$t('trade.loadMore')}}</p>

        </div>
        <div class="modal sel-owner" v-if="showSelOwners">
            <div class="modal-main">
                <div class="modal-title">
                    {{$t("trade.selOwner")}}
                    <span class="modal-close" @click="showSelOwners=false"></span>
                </div>
                <div class="modal-content">
                    <ul class="owners-list">
                        <li v-for="wallet in availOwners"
                            :key="wallet.address"
                            :class="[owner&&owner.address==wallet.address?'avail-cur':'',wallet.balance==0?'avail-disabled':'']"
                            @click="selOwner(wallet)">
                            <div class="lt wallet-icon" :class="wallet.icon">
                                {{wallet.account&&wallet.account.slice(0,1).toUpperCase()}}
                            </div>
                            <div class="rt">
                                <p class="marB">{{wallet.account}}</p>
                                <p> {{wallet.balance}}<span class="txt"> Energon</span></p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="modal confirm" v-if="showConfirmModal">
            <div class="modal-main">
                <div class="modal-title">
                    <!--                    {{$t("contracts.executeContCap")}}-{{handle==1?$t('trade.confirm'):$t('trade.reject')}}-->
                    {{handle==1?$t('trade.executionConfirm'):$t('trade.executionReject')}}
                    <span class="modal-close" @click="closeShowConfirmModal"></span>
                </div>
                <div class="modal-content">
                    <!--<div class="confirm-content">
                        <p>{{$t("wallet.amount")}}<span class="txt">{{trade.value | div}}&nbsp;Energon</span></p>
                        <p>From<span class="txt">{{owner?owner.address:''}}</span></p>
                        <p>To<span class="txt contract-addr">0x{{trade.from.replace(/^0x/g,'')}}</span></p>
                        <p>{{$t("wallet.fee")}}<span class="txt">{{price}}&nbsp;Energon</span></p>
                    </div>-->
                    <div class="confirm-content">
                        <p v-if="trade.fromWallet">{{$t('wallet.shared')}}
                            <span class="txt">
                                <i :class="['trade-wallet-icon',trade.fromWallet?trade.fromWallet.icon:'wallet-icon1']" v-if="trade.fromWallet || trade.fromWalletAccount">{{(trade.fromWallet&&trade.fromWallet.account.slice(0,1).toUpperCase())||trade.fromWalletAccount}}</i>
                                {{trade.fromWallet&&(trade.fromWallet.account.length>16?trade.fromWallet.account.slice(0,16)+'...':trade.fromWallet.account) || trade.from}}
                            </span>
                        </p>
                        <p>{{$t('wallet.to')}}
                            <span class="txt"  v-if="trade.toWallet || trade.toWalletAccount">
                                <i :class="['trade-wallet-icon',(trade.toWallet && trade.toWallet.icon)?trade.toWallet.icon:'wallet-icon1']">{{(trade.toWallet&&trade.toWallet.account.slice(0,1).toUpperCase()) || trade.toWalletAccount}}</i>
                             {{(trade.toWallet&&(trade.toWallet.account.length>16?trade.toWallet.account.slice(0,16)+'...':trade.toWallet.account)) || trade.to}}
                                <!-- {{sendTranscation.to}} -->
                            </span>

                        </p>
                        <p>{{$t("wallet.amount")}}<span class="txt"><span class="bold">{{trade.value | div}}</span>&nbsp;Energon</span></p>
                        <p v-if="owner">{{$t('wallet.executorFrom')}}
                            <span class="txt">
                            <i :class="['trade-wallet-icon',owner.icon]">{{owner.account.slice(0,1).toUpperCase()}}</i>
                            {{owner.account.slice(0,16)}}
                                <!-- {{fromW.address}} -->
                            </span>
                        </p>
                        <p class="fee">{{$t("wallet.fee")}}<span class="txt"><span class="bold">{{price}}</span>&nbsp;Energon</span></p>
                    </div>
                    <p class="inputb">
                        <el-input :disabled="submitting" :placeholder="$t('wallet.input')+(owner.account.length>16?owner.account.slice(0,16)+'...':owner.account)+$t('wallet.walletPsw')" type="password" v-model.trim="psw"></el-input>
                    </p>
                </div>
                <div class="modal-btn">
                    <el-button :class="[lang=='zh-cn'?'letterSpace':'']" @click="showConfirmModal=false" :disabled="submitting">{{$t("form.cancel")}}</el-button>
                    <el-button :class="[lang=='zh-cn'?'letterSpace':'']" v-if="handle==1" @click="confirmTransaction" type="primary" :loading="submitting && handle==1" :disabled="!psw">{{$t("form.submit")}}</el-button>
                    <el-button :class="[lang=='zh-cn'?'letterSpace':'']" v-if="handle==2" @click="rejectTransaction" type="primary" :loading="submitting && handle==2" :disabled="!psw">{{$t("form.submit")}}</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import contractService from '@/services/contract-servies';
    import {mapGetters, mapActions} from 'vuex';
    import mathService from '@/services/math';
    import keyManager from '@/services/key-manager';
    import pageLoading from '@/components/loading/pageLoading';
    let initTimer

    export default {
        name: "trade",
        data() {
            return{
                tradeList: [],
                tradeListCopy: [],
                pendingTradeList:[],
                pendingTradeListCopy:[],
                numIndex:1,
                psw:'',
                showConfirmModal:false,
                trade:{},
                handle:null,
                total:0,
                gas:0,
                gasPrice:0,
                price:0,
                submitting:false,
                gasLoading:false,
                tradeListTimer:null,
                refreshtradeListTimer:null,
                tradeListCopyTime:null,
                pendingTradeListTime:null,
                showSelOwners:false,
                availOwners:[],
                owner:null,
                loadCompolete:false,
                showToWallet:['transfer','createJointWallet','jointWalletExecution'],
            }
        },
        props:(['pageNum','type','pageFrom','isOwner','tab']),
        computed:{
            ...mapGetters(['curWallet','walletType','isMaximized','lang','contractListGetter'])
        },
        mounted(){
            if(this.tradeListTimer){
                clearInterval(this.tradeListTimer);
            }
            this.contractListAction();
            this.init();
            this.refreshtradeListTimer = setInterval(()=>{
                this.init();
            },5000);
        },
        methods:{
            ...mapActions(['getShareByAddress','isAtLocal','getOrdByAddress','getWalletByAddress','getCurTradeList','getSharedOwner','getOwnerAccountByAddress','updatetradeProcess','getAvailOwner','saveTractRecord','updatePageLoading','getPendingExecution','contractListAction']),
            init(){
                this.updatePageLoading(true);
                this.getCurTradeList({
                    size:this.pageNum*this.numIndex,
                    type:this.type
                }).then((dataObj)=>{
                    console.log("cccc",dataObj.pendings)
                    this.updatePageLoading(false);
                    let list = dataObj.list;
                    //如果是共享钱包详情页，需要分类展示
                    if(this.pageFrom=='shareDetail'){
                        this.pendingTradeList = JSON.parse(JSON.stringify(dataObj.pendings));
                        console.log("aaaa:",this.pendingTradeList)
                        if(this.pendingTradeList.length==0){
                            this.pendingTradeListCopy = this.pendingTradeList;
                            this.loadCompolete = true;
                        }
                        this.pendingTradeList.forEach((item,index)=>{
                            this.getShareConfirmations(item,(data)=>{
                                this.getWalletByAddress(item.from).then((fromWallet)=>{
                                    if(fromWallet){
                                        item.fromWallet = fromWallet?fromWallet:null;
                                    }else{
                                        item.fromWalletAccount = item.from.slice(2,3)
                                    }
                                    this.getWalletByAddress(item.to).then((toWallet)=>{
                                        if(this.showToWallet.indexOf(item.type)!==-1){
                                            if(toWallet){
                                                item.toWallet = toWallet?toWallet:null;
                                            }else{
                                                item.toWalletAccount = item.to.slice(2,3)
                                            }
                                        }
                                        this.loadCompolete = true;
                                        // console.log('num1',1)
                                        this.$set(this.pendingTradeList,index,data)
                                    });
                                });
                            });
                        })

                    }else{
                        list=dataObj.list;
                        this.pendingTradeList=[];
                    }
                    this.total = dataObj.total;
                    this.tradeList = JSON.parse(JSON.stringify(list));
                    // console.log("bbbb:",this.tradeList)
                    if(this.tradeList.length==0){
                        this.tradeListCopy = this.tradeList;
                        this.loadCompolete = true;
                    }else{
                        this.tradeList.forEach((item,index)=>{
                            if(item.hash){
                                if(!item.processWidth){
                                    item.processWidth = 0;
                                }
                                contractService.web3.eth.getTransactionReceipt(item.hash,(err,data)=>{
                                    if(data && !data.to){
                                        delete data.to;
                                    }
                                    if(err){
                                        console.error(err);
                                        return;
                                    }
                                    Object.assign(item,data);
                                });
                            }else{
                                this.getShareConfirmations(item,(data)=>{
                                    this.$set(this.tradeList,index,data)
                                });
                            }
                            // console.log("contract",this.contractListGetter);
                            let contractArr = this.contractListGetter.filter((contractObj)=>{
                                return item.to == contractObj.address;
                            });
                            if(contractArr && contractArr.length==1){
                                item.toContract = contractArr[0].name;
                            }
                        });
                        // this.getProcess();
                    }
                    this.getProcess();
                }).catch(error=>{
                    this.loadCompolete = true;
                });
            },
            getProcess(){
                let _this = this,len=this.tradeList.length,compoleteTxhash=[],pendingLen =this.pendingTradeList.length,pendingCompoleteTxhash=[] ;
                _inset();
                function _inset(){
                    let count1=0,count2=0;
                    _this.tradeList.forEach((item,index)=>{
                        if(item.hash){
                            contractService.web3.eth.getTransactionReceipt(item.hash,(err,data)=>{
                                if(err) return;
                                if(data){
                                    if(data.status && data.status=='0x0'){
                                        item.state=2;
                                        item.isCompolete = false;
                                    }else{
                                        item.state = 1;
                                        item.isCompolete = true;
                                    }
                                    item.processWidth=100;
                                    if(item.type=='contractCreate' || item.type=='createJointWallet'){
                                        item.to = data.to || data.contractAddress;
                                    }
                                    if(compoleteTxhash.indexOf(item.hash)==-1){
                                        len = len-1;
                                        compoleteTxhash.push(item.hash);
                                        if(len==0){
                                            clearInterval(_this.tradeListTimer)
                                        }
                                    }
                                }else{
                                    item.isCompolete = false;
                                    item.processWidth+=(item.processWidth>60?0:10);
                                    if(item.type=="createJointWallet" && (new Date().getTime() - item.tradeTime > 2*60*1000)){
                                        item.state = 2;
                                        if(compoleteTxhash.indexOf(item.hash)==-1){
                                            len = len-1;
                                            compoleteTxhash.push(item.hash);
                                            if(len==0){
                                                clearInterval(_this.tradeListTimer)
                                            }
                                        }
                                    }
                                }
                                _this.getWalletByAddress(item.from).then((fromWallet)=>{
                                    if(fromWallet){
                                        item.fromWallet = fromWallet?fromWallet:null;
                                    }else{
                                        item.fromWalletAccount = item.from.slice(2,3)
                                    }
                                    _this.getWalletByAddress(item.to).then((toWallet)=>{
                                        if(_this.showToWallet.indexOf(item.type)!==-1){
                                            if(toWallet){
                                                item.toWallet = toWallet?toWallet:null;
                                            }else{
                                                item.toWalletAccount = item.to.slice(2,3)
                                            }
                                        }
                                        Object.assign(item,data);
                                        _this.$set(_this.tradeList,index,item);
                                        _this.$nextTick(()=>{
                                            count1++;
                                            if(count1==_this.tradeList.length){
                                                _this.tradeListCopyTime=setTimeout(()=>{
                                                    _this.tradeListCopy = _this.tradeList;
                                                },100);
                                                console.log('tradeListCopy',count1)
                                            }
                                        });
                                        _this.loadCompolete = true;
                                    });
                                });
                            });
                        }else{
                            // if(_this.pageFrom=='tradeList'){
                            if(item.pending==1){ //根据交易ID获取已签名数
                                contractService.platONCall(contractService.getABI(1),item.from,'getConfirmations',item.from,[item.id]).then((confirmations)=>{
                                    if(confirmations==''){
                                        item.confirmations = 0;
                                    }else{
                                        let arr = confirmations.replace(/^\:+|\:+$/g,'').split(/\:+/g);
                                        item.confirmations = arr.length;
                                        item.confirmationsOwners=arr;
                                    }
                                    _this.getShareConfirmations(item,(data)=>{
                                        if(data.confirmations == data.required){
                                            data.pending = '0';
                                            data.executed = '1';
                                        }else if(data.ownersList.length - data.rejectList.length < data.required){
                                            data.pending = '0';
                                            data.executed = '0';
                                        }
                                    });
                                })
                            }else{
                                if(compoleteTxhash.indexOf(item.id)==-1){
                                    len = len-1;
                                    compoleteTxhash.push(item.id);
                                    if(len==0){
                                        clearInterval(_this.tradeListTimer)
                                    }
                                }
                            }
                            _this.getWalletByAddress(item.from).then((fromWallet)=>{
                                if(fromWallet){
                                    item.fromWallet = fromWallet?fromWallet:null;
                                }else{
                                    item.fromWalletAccount = item.from.slice(2,3)
                                }
                                _this.getWalletByAddress(item.to).then((toWallet)=>{
                                    if(_this.showToWallet.indexOf(item.type)!==-1){
                                        if(toWallet){
                                            item.toWallet = toWallet?toWallet:null;
                                        }else{
                                            item.toWalletAccount = item.to.slice(2,3)
                                        }
                                    }
                                    _this.$set(_this.tradeList,index,item);
                                    _this.$nextTick(()=>{
                                        count1++;
                                        if(count1==_this.tradeList.length){
                                            // console.log('tradeListCopy',count1)
                                            _this.tradeListCopyTime=setTimeout(()=>{
                                                _this.tradeListCopy = _this.tradeList;
                                            },100);
                                        }
                                    });
                                    _this.loadCompolete = true;
                                });
                            });
                        }
                    });
                    // console.log('cccc',_this.pendingTradeList);
                    _this.pendingTradeList.forEach((item,index)=>{
                        if(item.pending==1){ //根据交易ID获取已签名数
                            contractService.platONCall(contractService.getABI(1),item.from,'getConfirmations',item.from,[item.id]).then((confirmations)=>{
                                if(confirmations==''){
                                    item.confirmations = 0;
                                }else{
                                    let arr = confirmations.replace(/^\:+|\:+$/g,'').split(/\:+/g);
                                    item.confirmations = arr.length;
                                    item.confirmationsOwners=arr;
                                }
                                _this.getShareConfirmations(item,(data)=>{
                                    count2++;
                                    if(data.confirmations == data.required){
                                        _this.init();
                                    }else if(data.ownersList.length - data.rejectList.length < data.required){
                                        _this.init();
                                    }else{
                                        _this.$set(_this.pendingTradeList,index,data);
                                        if(count2==_this.pendingTradeList.length){
                                            // console.log('num1',2)
                                            // console.log('cccc',_this.pendingTradeList);
                                            _this.pendingTradeListTime=setTimeout(()=>{
                                                _this.pendingTradeListCopy = _this.pendingTradeList;
                                            },200);

                                            // console.log('pendingTradeListCopy',_this.pendingTradeListCopy);
                                        }
                                    }
                                });
                            })
                        }else{
                            if(pendingCompoleteTxhash.indexOf(item.id)==-1){
                                pendingLen = pendingLen-1;
                                pendingCompoleteTxhash.push(item.id);
                                if(pendingLen==0){
                                    clearInterval(_this.tradeListTimer)
                                }
                            }
                        }
                    })
                }
                // this.tradeListTimer = setInterval(_inset,5000);
            },
            getShareConfirmations(trx,cb){
                this.getShareByAddress(trx.from).then((share)=>{
                    if(!share) return;
                    trx.ownersList = share.ownersArr.map((o)=>{
                        return o.address;
                    });
                    contractService.platONCall(contractService.getABI(1),trx.from,'getMultiSigList',trx.from,[trx.id]).then((data)=>{
                        let arr = data.replace(/^\:|\:$/g,'').split(":");
                        let confirmList = arr[1].replace(/^\,|\,$/g,'').split(",");
                        let rejectList = arr[2]?arr[2].replace(/^\,|\,$/g,'').split(","):[];
                        confirmList = confirmList.map((v)=>{return '0x'+v});
                        rejectList = rejectList.map((v)=>{return '0x'+v});
                        trx.confirmList = confirmList;
                        trx.rejectList = rejectList;
                        this._getAvailOwner(trx.from,(avail)=>{
                            let confirmations = confirmList.concat(rejectList);
                            if(avail.length>0){
                                trx.availOwners = avail.filter((item)=>{
                                    return (confirmations.length==0 || confirmations.indexOf(item.address)==-1)
                                });
                            }else{
                                trx.availOwners=[];
                            }
                            cb(trx);
                        });
                    });
                });
            },
            loadMore(){
                this.numIndex+=1;
                this.init();
            },
            checkDetail(trade){
                console.log("进入交易详情：",trade);
                if((!trade.hash&&trade.pending==1) || (trade.type=='transfer'&&trade.hash&&trade.state==0)) return;
                this.$router.push({
                    path:'/trade-detail',
                    query:{
                        trade:trade
                    }
                })
            },
            async _getAvailOwner(walletAddr,cb){
                let data = await this.getAvailOwner(walletAddr);
                cb(data);
            },
            confirm(trade,num){
                if(this.gasLoading) return;
                this.psw='';
                this.handle = num;
                this.trade = trade;
                this.submitting = false;
                this.availOwners=[];
                if(trade.availOwners.length>0){
                    this.getPendingExecution(trade).then((pendingTxs)=>{
                        console.log('pendingTxs--->',pendingTxs);
                        if(pendingTxs){
                            trade.availOwners = trade.availOwners.filter((avail)=>{
                                return avail.address!==pendingTxs.from;
                            });
                        }
                        if(trade.availOwners.length>0){
                            this.availOwners = trade.availOwners;
                            this.availOwners.forEach((item,index)=>{
                                contractService.web3.eth.getBalance(item.address,(err,data)=>{
                                    if(err) return null;
                                    item.balance=contractService.web3.fromWei(data,"ether").toString(10)-0;
                                    this.$set(this.availOwners,index,item)
                                });
                            });
                            if(this.availOwners.length>1){
                                this.showSelOwners = true;
                            }else if(this.availOwners.length==1){
                                this.owner = this.availOwners[0];
                                this.showSelOwners = false;
                                this.getGas(null,null,()=>{
                                    this.showConfirmModal = true;
                                });
                            }
                        }else{
                            this.availOwners=[];
                        }
                    });
                }
            },
            selOwner(owner){
                if(owner.balance===0) return;
                this.owner = owner;
                this.showSelOwners = false;
                this.getGas(null,null,()=>{
                    this.showConfirmModal = true;
                });
            },
            async getGas(trade,num,cb){
                this.gas = 2000000;
                contractService.web3.eth.getGasPrice((error,result)=>{
                    if(error) throw error;
                    this.gasPrice = result;
                    this.price = mathService.mul(this.gas,mathService.toNonExponential(contractService.web3.fromWei(result,"ether")));
                    cb();
                });
            },
            closeShowConfirmModal(){
                if(this.submitting) return;
                this.showConfirmModal = false;
            },
            doHandle(handle){
                let num=5
                keyManager.recover2(this.owner,this.psw,'buf',(err,prikey)=>{
                    if(err){
                        this.$message.error(this.$t('form.wrongPsw'));
                        this.submitting = false;
                        return;
                    }
                    contractService.web3.eth.getBalance(this.owner.address,(err,balance)=>{
                        let b = contractService.web3.fromWei(balance,"ether").toString(10);
                        if(b<mathService.div(this.trade.fee,1000000000000000000)){
                            this.$message.warning(this.$t('wallet.cannotTrans2'));
                            this.submitting = false;
                            return;
                        }else{
                            contractService.platONSendTransaction(contractService.getABI(1),this.trade.from,handle,JSON.stringify([this.trade.id-0]),this.owner.address,prikey,this.gas,this.gasPrice,false,false,2).then((data)=>{
                                let tradeObj={
                                    tradeTime:new Date().getTime(),
                                    hash:data.hash,
                                    value:'0.00',
                                    gasPrice:this.gasPrice,
                                    fromAccount:this.owner.account,
                                    from:this.owner.address,
                                    to:this.trade.from,
                                    txId:this.trade.id,
                                    type:'jointWalletExecution',
                                    state:0,
                                    handle:handle
                                };
                                this.saveTractRecord(tradeObj).then(()=>{
                                    this.init();
                                    /*initTimer=setInterval(()=>{
                                        this.init();
                                        num--
                                        if(num<=0){
                                            clearInterval(initTimer)
                                        }
                                    },1000)*/
                                    setTimeout(()=>{
                                        this.showConfirmModal = false;
                                        this.submitting = false;
                                    },1000);
                                });
                            }).catch((err)=>{
                                this.submitting = false;
                                if(err.indexOf('insufficient funds for gas * price + value')!==-1){
                                    window.vueVm.$message.warning(window.vueVm.$i18n.t('wallet.cannotTrans2'));
                                }else{
                                    this.$message.error(this.$t('wallet.transactionFailed'));
                                }
                            })
                        }
                    });
                })
            },

            confirmTransaction(){
                this.submitting = true;
                this.doHandle('confirmTransaction');
            },
            trans(value){
                if(value===0){
                    return '0.00';
                }
                return contractService.web3.fromWei(value,"ether")
            },
            rejectTransaction(){
                this.doHandle('revokeConfirmation');
            }
        },
        filters:{
            'month':function (time) {
                let a= new Date(time-0).toUTCString().split(" ");
                let b = ['zero','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                if(window.vueVm.$i18n.locale=='zh-cn'){
                    return b.indexOf(a[2])+'月';
                }else{
                    return a[2];
                }

            },
            'date':function (time) {
                let a= new Date(time-0).toUTCString().split(" ");
                return a[1];
            },
            'div':function(num){
                return mathService.div(num,1000000000000000000)
            },
            'feeDiv':function(num){
                return mathService.div(num,100)
            },
            'decimal':function(num){
                if(num===0){
                    return '0.00';
                }
                num = num+'';
                if(num.indexOf('.')!==-1){
                    return num.slice(0,num.indexOf('.')+5)
                }else{
                    return num
                }
            }
        },
        watch:{
            'curWallet':function(){
                this.init();
            },
            'walletType':function(){
                this.init();
            },
            'type':function(){
                this.init()
            },
            'loadCompolete':function(val){
                console.log('loadCompolete change',val);
            }
        },
        beforeDestroy() {
            if(this.tradeListTimer){
                clearInterval(this.tradeListTimer);
            }
            this.updatetradeProcess(this.tradeList);
        },
        destroyed() {
            if(this.tradeListTimer){
                clearInterval(this.tradeListTimer);
            }
            if(this.refreshtradeListTimer){
                clearInterval(this.refreshtradeListTimer);
            }
        },
        components:{
            pageLoading
        }
    }
</script>

<style lang="less" scoped>
    .nowrap{
        white-space:nowrap;
    }
    .contract-addr{
        padding-left:20px;
    }
    .tc{
        display:inline-block;
        width:100%;
        text-align: right;
        white-space: nowrap;
    }
    .paddB30{
        padding-bottom:30px;
    }
    .trade-wallet-icon{
        position:relative;
        top:0;
    &.wallet-share{
     // width:17px;
     // height:17px;
         line-height:17px;
         font-size:10px;
         border-radius: 0;
     }
    }
    .trade-list{
    .content {
        height:calc(~"100% - 32px");
        /*height: calc(100% - 32px);*/
        overflow-y: auto;
        margin: 0 auto ;
        padding: 20px 15px 0 15px;
    }
    .no-list-record{
    p{
        text-align: center;
        margin-top: 273px;
        color: #9EABBE;
    }
    }
    height: 100%;
    position:relative;
    background: #FFFFFF;
    border-radius: 4px;
    >ul{
    >li{
        position:relative;
        display: flex;
        height: auto;
        padding-left:14px;
        font-size: 12px;
        color: #24272B;
        background: #fff;
        cursor:pointer;
        border-left:solid 3px transparent;
    &:after{
         content:'';
         position:absolute;
         bottom:0;
         left:14px;
         width:calc(~"100% - 28px");
         height:1px;
         border-bottom:solid 1px #ECF1F8;
     }
    &:hover{
         border-left:solid 3px #0077FF;
         background: #ECF1F8;
     }
    .lt{
        padding-top:21px;
        width:40px;
        min-width: 40px;
        text-align: center;
        border-radius: 4px 0 0 4px;
    .month{
        font-size: 10px;
        color: #525768;
    }
    .date{
        margin-top:2px;
        height:20px;
        line-height:20px;
        font-size: 14px;
        font-weight: 600;
    }
    }
    .mid{
        flex-grow: 1;
        padding:14px;
    .type{
        margin-bottom:12px;
        font-size: 14px;
        color: #24272B;
    }
    }
    .icon-type{
        display:inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .addr{
        background: url("./images/icon_positioning.svg") no-repeat left center;
    }
    .cont{
        white-space: nowrap;
        background: url("./images/icon_file.svg") no-repeat left center;
    }
    .cont-length-lit{
        width:300px;
    }
    .cont-length{
        width: 420px;
    }
    .compolete,.fail{
        padding-left:21px;
        position:relative;
    &:before{
         position:absolute;
         left:0;
         top:0;
         width:15px;
         height:15px;
         content:'';
     }
    }
    .compolete:before{
        background: url("./images/icon_complete.svg") no-repeat left center;
        background-size: contain;
    }
    .danger.compolete:before{
        background: url("./images/icon_failure.svg") no-repeat left center;
        background-size: contain;
    }
    .fail:before{
        background: url("./images/icon_failure.svg") no-repeat left center;
        background-size: contain;
    }
    .transfer{
        position: relative;
        top:-2px;
        display:inline-block;
        margin:0 10px;
        width:14px;
        height:12px;
        background: url("./images/icon_conversion.svg") no-repeat center center;
        background-size:contain;
    }
    .rt{
        display:flex;
        width:270px;
        line-height:77px;
    .value{
        flex:1;
        font-size: 12px;
        color: #F32E25;
        text-align: right;
        font-weight:600;
    }
    .state{
        padding-right:24px;
        width:160px;
        min-width:160px;
        font-weight:600;
    .el-button{
        width:56px;
        height:28px;
        line-height:26px;
    }
    }
    }
    .rt.max{
        width:400px;
    .state{
        width:300px;
    }
    }
    .process{
        position:absolute;
        bottom:-1px;
        left:0;
        width:100%;
        height:2px;
    span{
        display:block;
        height:2px;
        background: #18C2E9;
        box-shadow: 0 4px 6px 0 rgba(48,48,77,0.05), 0 2px 4px 0 rgba(148,148,197,0.05);
    }
    }
    }
    }
    .load-more{
        position:fixed;
        bottom: 4px;
        width:calc(~"100% - 198px");
        height:34px;
        line-height:30px;
        text-align: center;
        font-size: 12px;
        color: #9EABBE;
        cursor:pointer;
        letter-spacing: 0.36px;
        background-color: #f5f5f5;
    }
    .marginT10{
        margin-top:10px;
        text-align: left;
    &.no-data{
         padding-left:32px;
         background:url("../../../static/images/34icon_warning.svg") no-repeat 14px center;
     }
    }
    .marginT30{
        margin-top:100px;
        padding-left:0;
    &.no-data{
         background: none;
     }
    .icon-no-data{
        position: relative;
        top:2px;
        margin-right:4px;
        display:inline-block;
        width:13px;
        height:13px;
        background: url("../../../static/images/34icon_warning.svg") no-repeat center center;
    }
    }
    }
    .confirm{
    .modal-main{
        width:483px;
        font-size: 12px;
    .modal-content{
    /*padding:12px;*/
    .confirm-content{
        padding:14px 10px;
        height:152px;
        background: #ECEFF6;
    p{
        color: #24272B;
        margin-bottom:9px;
    .txt{
        float:right;
        color: #000000;
    }
    }
    }
    .more{
        margin:10px;
        cursor:pointer;
    i{
        font-size:10px;
    }
    }
    .extra-data{
        padding-left:10px;
        word-break: break-all;
    }
    .inputb{
        margin:10px 20px 0;

    .el-input{
        width:100%;
    }
    }
    }
    .modal-btn{
        padding-top:7.5px;
        line-height:1;
        height:48.5px;
    button{
        width:79px;
        height:32px;
        font-size:12px;
    }
    }
    }
    }
    .owners{
        display:inline-block;
    li{
        position: relative;
        margin-left:6px;
        display:inline-block;
        width:18px;
        height:18px;
        line-height:18px;
        text-align: center;
        font-size: 10px;
        color: #FFFFFF;
        border-radius: 18px;
        background: #D3D8E1;
    }
    .success{
        background: #0BB27A;
    }
    .reject:after{
        position:absolute;
        top:0;
        left:0;
        width:100%;
        height:100%;
        border-radius: 100%;
        content:'';
        background: url("./images/icon_close.png") no-repeat center center #D3D8E1;
        background-size: contain;
    }
    }
    .trade-rec-title{
        margin-top: 16px;
        margin-bottom: 8px;
        /*padding-left:14px;*/
        font-size: 14px;
        color: #24272B;
        letter-spacing: 0.5px;
    }
    .no-data{
        margin-top:100px;
        font-size: 12px;
        color: #9EABBE;
        letter-spacing: 0.43px;
    }
</style>
<style lang="less">
    .trade-list{
    .el-select{
        width:115px;
    .el-input{
        width:115px;
    .el-input__icon{
        color: #000000;
    }
    }
    .el-input__inner{
        font-size: 16px;
        color: #24272B;
        font-weight:600;
        letter-spacing: 0.5px;
        border:none;
        background-color: transparent;
    }
    }
    .el-progress{
        margin-right:6px;
        vertical-align: middle;
    }
    }
    .no-data{
        padding-left:20px;
        margin-top:150px;
        font-size: 12px;
        color: #9EABBE;
        background:url("../../../static/images/34icon_warning.svg") no-repeat left center;
    }
    .circle-loading{
        position: relative;
        top: 4px;
        right: 3px;
        display: inline-block;
        width: 15px;
        height: 15px;
        background: url("./images/icon_loading.svg") no-repeat center center;
        animation: dropdown 1.5s linear infinite;
    }
    @keyframes dropdown {
        0% { transform:rotate(0deg);}
        25% { transform:rotate(90deg);}
        50% { transform:rotate(180deg);}
        75% { transform:rotate(270deg);}
        100% {transform:rotate(360deg);}
    }

</style>
