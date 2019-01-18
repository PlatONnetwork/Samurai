<template>
    <div :class="[total>pageNum*numIndex?'paddB30':'','trade-list']">
        <p class="trade-rec-title" v-if="pageFrom=='shareDetail'">{{pageFrom=='shareDetail'?$t('trade.pendingTrade'):$t('trade.record')}}</p>
        <ul>
            <li v-for="(item,index) in pendingTradeList" :key="index" @click="checkDetail(item)">
                <div class="lt">
                    <p class="month" v-if="item">{{item.tradeTime | month}}</p>
                    <p class="date" v-if="item">{{item.tradeTime | date}}</p>
                </div>
                <div class="mid">
                    <div>
                        <div class="type bold">
                            {{item.type | tradeType}}
                            <ul v-if="item.ownersList && item.pending==1" class="owners">
                                <li v-for="(owner,index) in item.ownersList"
                                    :key = owner
                                    :class="(item.confirmList&&item.confirmList.indexOf(owner)!==-1)?'success':
                                            (item.rejectList&&item.rejectList.indexOf(owner)!==-1)?'reject':''">
                                    {{index+1}}
                                </li>
                            </ul>
                        </div>
                        <div>
                            <span :class="[isMaximized?'':'addr-length','addr','icon-type']" :title="item.from">{{item.from}}</span>
                            <span class="transfer"></span>
                            <span v-if="item.type=='contractCreate' || item.type=='createJointWallet'" :class="[isMaximized?'':'cont-length','icon-type','contract-addr']" :title="item.contractAddress">{{item.type=='contractCreate'?$t('trade.contractCreation2'):$t('wallet.createSharedWallet')}}&nbsp;{{item.contractAddress}}</span>
                            <span v-else :class="['icon-type',item.type=='transfer'?'addr':'contract-addr',isMaximized?'':'cont-length']" :title="item.to">{{item.to}}</span>
                        </div>
                    </div>
                </div>
                <div class="rt">
                    <p class="value">
                        <span v-if="item.hash">{{(item.type!='reduceStake' && item.type!='redeemStake' && item.type!='quitStake')?'-':''}}{{item.value}}&nbsp;Energon</span>
                        <span v-else>-{{trans(item.value-0)}}&nbsp;Energon</span>
                    </p>
                    <p class="state">
                        <span v-if="item.hash" class="tc">
                            <span v-if="item.isCompolete">
                                {{$t('trade.finished')}}
                            </span>
                            <span v-else-if="item.state==2" class="danger">
                                {{$t('trade.failed')}}
                            </span>
                            <span v-else class="state-pending">{{$t('trade.pending')}}</span>
                        </span>
                        <span v-else>
                            <span v-if="item.pending==1">
                                <span v-if="item.availOwners&&item.availOwners.length>0">
                                    <el-button type="primary" @click="confirm(item,1)">{{$t('trade.confirm')}}</el-button>
                                    <el-button @click="confirm(item,2)">{{$t('trade.reject')}}</el-button>
                                </span>
                                <span v-else  class="tc">
                                    {{$t('trade.toBeSigned')}}
                                </span>
                            </span>
                            <span v-else :class="[item.executed=='0'?'danger':'','tc']">{{item.executed==1?$t('trade.finished'):$t('trade.failed')}}</span>
                        </span>
                    </p>
                </div>
                <p class="process" v-if="item.hash && !item.isCompolete && item.state!==2">
                    <span :style="{width:item.processWidth+'%'}"></span>
                </p>
            </li>
        </ul>
        <p v-if="pageFrom=='shareDetail' && pendingTradeList.length==0" :class="[pageFrom=='tradeList'?'marginT30':'marginT0','no-data']">{{$t('trade.noRecord')}}</p>

        <p class="trade-rec-title" v-if="pageFrom!='tradeList'">{{$t('trade.record')}}</p>
        <ul>
            <li v-for="(item,index) in tradeList" :key="index" @click="checkDetail(item)">
                <div class="lt">
                    <p class="month" v-if="item">{{item.tradeTime | month}}</p>
                    <p class="date"  v-if="item">{{item.tradeTime | date}}</p>
                </div>
                <div class="mid">
                    <div>
                        <div class="type bold">
                            {{item.type | tradeType}}
                            <ul v-if="item.ownersList && item.pending==1" class="owners">
                                <li v-for="(owner,index) in item.ownersList"
                                    :key="owner"
                                    :class="(item.confirmList&&item.confirmList.indexOf(owner)!==-1)?'success':
                                    (item.rejectList&&item.rejectList.indexOf(owner)!==-1)?'reject':''">
                                    {{index+1}}
                                </li>
                            </ul>
                        </div>
                        <div>
                            <span :class="[isMaximized?'':'addr-length','addr','icon-type']" :title="item.from">{{item.from}}</span>
                            <span class="transfer"></span>
                            <span v-if="item.type=='contractCreate' || item.type=='createJointWallet'" :class="[isMaximized?'':'cont-length','icon-type','contract-addr']" :title="item.contractAddress">{{item.type=='contractCreate'?$t('trade.contractCreation2'):$t('wallet.createSharedWallet')}}&nbsp;{{item.contractAddress}}</span>
                            <span v-else :class="['icon-type',item.type=='transfer'?'addr':'contract-addr',isMaximized?'':'cont-length']" :title="item.to">{{item.to}}</span>
                        </div>
                    </div>
                </div>
                <div class="rt">
                    <p class="value">
                        <span v-if="item.hash">{{(item.type!='reduceStake' && item.type!='redeemStake' && item.type!='quitStake')?'-':''}}{{item.value}}&nbsp;Energon</span>
                        <span v-else>-{{trans(item.value-0)}}&nbsp;Energon</span>
                    </p>
                    <p class="state">
                        <span v-if="item.hash" class="tc">
                            <span v-if="item.isCompolete">
                                {{$t('trade.finished')}}
                            </span>
                            <span v-else-if="item.state==2" class="danger">
                                {{$t('trade.failed')}}
                            </span>
                            <span v-else class="state-pending">{{$t('trade.pending')}}</span>
                        </span>
                        <span v-else>
                            <span v-if="item.pending==1">
                                <span v-if="item.availOwners&&item.availOwners.length>0">
                                    <el-button type="primary" @click="confirm(item,1)">{{$t('trade.confirm')}}</el-button>
                                    <el-button @click="confirm(item,2)">{{$t('trade.reject')}}</el-button>
                                </span>
                                <span v-else class="tc">
                                    {{$t('trade.toBeSigned')}}
                                </span>
                            </span>
                            <span v-else :class="[item.executed=='0'?'danger':'','tc']">{{item.executed==1?$t('trade.finished'):$t('trade.failed')}}</span>
                        </span>
                    </p>
                </div>
                <p class="process" v-if="item.hash && !item.isCompolete && item.state!==2">
                    <span :style="{width:item.processWidth+'%'}"></span>
                </p>
            </li>
        </ul>
        <p v-if="tradeList.length==0" :class="[pageFrom=='tradeList'?'marginT30':'marginT0','no-data']">{{$t('trade.noRecord')}}</p>
        <p v-if="total>pageNum*numIndex" class="load-more" @click="loadMore">{{$t('trade.loadMore')}}</p>

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
                            <div class="lt" :class="wallet.icon"></div>
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
                    {{$t("contracts.executeContCap")}}-{{handle==1?$t('trade.confirm'):$t('trade.reject')}}
                    <span class="modal-close" @click="closeShowConfirmModal"></span>
                </div>
                <div class="modal-content">
                    <div class="confirm-content">
                        <p>{{$t("wallet.amount")}}<span class="txt">{{trade.value | div}}&nbsp;Energon</span></p>
                        <p>From<span class="txt">{{owner?owner.address:''}}</span></p>
                        <p>To<span class="txt contract-addr">0x{{trade.from.replace(/^0x/g,'')}}</span></p>
                        <p>{{$t("wallet.fee")}}<span class="txt">{{price}}&nbsp;Energon</span></p>
                    </div>
                    <p class="inputb">
                        <el-input :disabled="submitting" :placeholder="$t('wallet.input')+owner.account+$t('wallet.walletPsw')" type="password" v-model.trim="psw"></el-input>
                    </p>
                </div>
                <div class="modal-btn">
                    <el-button class="cancel" @click="showConfirmModal=false" :disabled="submitting">{{$t("form.cancel")}}</el-button>
                    <el-button v-if="handle==1" @click="confirmTransaction" type="primary" :loading="submitting && handle==1">{{$t("form.submit")}}</el-button>
                    <el-button v-if="handle==2" @click="rejectTransaction" type="primary" :loading="submitting && handle==2">{{$t("form.submit")}}</el-button>
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

    export default {
        name: "trade",
        data() {
            return{
                tradeList: [],
                pendingTradeList:[],
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
                showSelOwners:false,
                availOwners:[],
                owner:null
            }
        },
        props:(['pageNum','type','pageFrom','isOwner']),
        computed:{
            ...mapGetters(['curWallet','walletType','isMaximized'])
        },
        mounted(){
            if(this.tradeListTimer){
                clearInterval(this.tradeListTimer);
            }
            this.init();
        },
        methods:{
            ...mapActions(['getShareByAddress','isAtLocal','getOrdByAddress','getCurTradeList','getSharedOwner','getOwnerAccountByAddress','updatetradeProcess','getAvailOwner','saveTractRecord']),
            init(){
                this.getCurTradeList({
                        size:this.pageNum*this.numIndex,
                        type:this.type
                    }).then((dataObj)=>{
                    let list = dataObj.list;
                    //如果是共享钱包详情页，需要分类展示
                    if(this.pageFrom=='shareDetail'){
                        this.pendingTradeList = JSON.parse(JSON.stringify(dataObj.pendings));
                        this.pendingTradeList.forEach((item,index)=>{
                            this.getShareConfirmations(item,(data)=>{
                                this.$set(this.pendingTradeList,index,data)
                            });
                        })
                    }else{
                        list=dataObj.list;
                        this.pendingTradeList=[];
                    }
                    this.total = dataObj.total;
                    this.tradeList = JSON.parse(JSON.stringify(list));
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
                    });
                    this.getProcess();
                });
            },
            getProcess(){
                let _this = this,len=this.tradeList.length,compoleteTxhash=[],pendingLen =this.pendingTradeList.length,pendingCompoleteTxhash=[] ;
                _inset();
                function _inset(){
                    _this.tradeList.forEach((item,index)=>{
                        if(item.hash){
                            contractService.web3.eth.getTransactionReceipt(item.hash,(err,data)=>{
                                if(err) return;
                                if(data){
                                    if(data.status && data.status=='0x0'){
                                        item.state=2;
                                    }else{
                                        item.state = 1;
                                    }
                                    item.processWidth=100;
                                    item.isCompolete = true;
                                    if(item.type=='contractCreate' || item.type=='createJointWallet'){
                                       item.to = data.contractAddress
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
                                    item.processWidth+=(item.processWidth>80?0:10);
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
                                Object.assign(item,data);
                                _this.$set(_this.tradeList,index,item)
                            });
                        }else{
                            if(_this.pageFrom=='tradeList'){
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
                                            }else{
                                                _this.$set(_this.tradeList,index,data);
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
                            }
                        }
                    });
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
                                    if(data.confirmations == data.required){
                                        _this.init();
                                    }else if(data.ownersList.length - data.rejectList.length < data.required){
                                        _this.init();
                                    }else{
                                        _this.$set(_this.pendingTradeList,index,data);
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
                this.tradeListTimer = setInterval(_inset,5000);
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
                if((!trade.hash&&trade.pending==1) || (trade.hash&&trade.state==0)) return;
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

                // this.gasLoading = true;
                // const MyContract = contractService.web3.eth.contract(contractService.getABI(1));
                // const myContractInstance = MyContract.at(trade.from);
                // let params=[trade.id-0],funN = num==1?'confirmTransaction':'revokeConfirmation';
                // const platOnData = myContractInstance[funN].getPlatONData(...params);
                // await contractService.web3.eth.estimateGas({
                //     "from":this.curOwner.address,
                //     "to":trade.from,
                //     "data":platOnData
                // },(err,data)=>{
                //     this.gasLoading = false;
                //     console.log('估算gas-->',err,data);
                //     if(err){
                //         this.$message.error(this.$t('wallet.estimateFailed'));
                //         throw err;
                //     }
                //     this.gas = data;
                //     contractService.web3.eth.getGasPrice((error,result)=>{
                //         if(error) throw err;
                //         this.gasPrice = result;
                //         this.price = mathService.mul(this.gas,mathService.toNonExponential(contractService.web3.fromWei(result,"ether")));
                //         cb();
                //     });
                // })
            },
            closeShowConfirmModal(){
                if(this.submitting) return;
                this.showConfirmModal = false;
            },
            doHandle(handle){
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
                                    value:0,
                                    gasPrice:this.gasPrice,
                                    fromAccount:this.owner.account,
                                    from:this.owner.address,
                                    to:this.trade.from,
                                    type:'jointWalletExecution',
                                    state:0
                                };
                                this.saveTractRecord(tradeObj).then(()=>{
                                    this.showConfirmModal = false;
                                    this.submitting = false;
                                    this.init();
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
        },
    }
</script>

<style lang="less" scoped>
    .contract-addr{
        padding-left:20px;
    }
    .state-pending{
        color: #FFBA00;
    }
    .tc{
        display:inline-block;
        width:79%;
        text-align: right;
    }
    .paddB30{
        padding-bottom:30px;
    }
    .trade-list{
        position:relative;
        >ul{
            >li{
                position:relative;
                display: flex;
                margin-bottom:10px;
                // height:77px;
                height: auto;
                font-size: 12px;
                color: #24272B;
                box-shadow: 0 4px 6px 0 rgba(48,48,77,0.05), 0 2px 4px 0 rgba(148,148,197,0.05);
                background: #fff;
                cursor:pointer;
                .lt{
                    padding-top:9px;
                    width:40px;
                    text-align: center;
                    background: #ECEFF6;
                    border-radius: 4px 0 0 4px;
                    background:url("./images/icon_calendar.svg") no-repeat center 50px #ECEFF6;
                    background-size:26px 22.6px;
                    .month{
                        font-size: 10px;
                        color: #525768;
                    }
                    .date{
                        margin-top:2px;
                        height:20px;
                        line-height:20px;
                        font-size: 14px;
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
                    padding-left:18.2px;
                    display:inline-block;
                    width:178px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .addr{
                    background: url("./images/icon_positioning.svg") no-repeat left center;
                }
                .addr-length{
                    width: 330px;
                }
                .cont{
                    white-space: nowrap;
                    background: url("./images/icon_file.svg") no-repeat left center;
                }
                .cont-length{
                    width: 410px;
                }
                .transfer{
                    display:inline-block;
                    margin:0 10px;
                    width:14px;
                    height:12px;
                    background: url("./images/icon_conversion.svg") no-repeat center center;
                    background-size:contain;
                }
                .rt{
                    display:flex;
                    width:246px;
                    line-height:77px;
                    .value{
                        flex:1;
                        font-size: 12px;
                        color: #F32E25;
                    }
                    .state{
                        width:130px;
                        .el-button{
                            width:50px;
                            height:28px;
                            line-height:28px;
                        }
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
            bottom:0;
            width:calc(~"100% - 180px");
            height:34px;
            line-height:30px;
            text-align: center;
            font-size: 12px;
            color: #9EABBE;
            cursor:pointer;
            letter-spacing: 0.36px;
            background-color: #f5f5f5;
        }
        .marginT0{
            margin-top:0;
            text-align: left;
        }
        .marginT30{
            margin-top:100px;
        }
    }
    .confirm{
        .modal-main{
            width:483px;
            font-size: 12px;
            .modal-content{
                padding:12px;
                .confirm-content{
                    padding:14px 10px;
                    height:126px;
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
                    margin:10px 10px 0;
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
        padding-left:14px;
        font-size: 14px;
        color: #24272B;
        letter-spacing: 0.5px;
    }
    .no-data{
        margin-top:100px;
        padding-left:14px;
        text-align: center;
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
    }
    .no-data{
        margin-top:150px;
        text-align: center;
        font-size: 12px;
        color: #9EABBE;
    }
</style>
