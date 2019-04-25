<template>
    <div class="send-transcation">
        <div class="send-content">
            <el-form class="send-transcation-form" ref="sendTranscation"
                     v-model="sendTranscation"
                     :rules="sendTranscationRule"
                     label-position="top">
                <el-form-item :label="$t('wallet.to')">
                    <el-input v-model.trim="sendTranscation.to" :placeholder="$t('wallet.walletAddress0x')" @change="changeDest"></el-input>
                </el-form-item>
                <el-form-item :label="$t('wallet.amountSend')">
                    <el-input v-model.trim="sendTranscation.value" @blur="changeVal" :placeholder="$t('wallet.amountHint')" type="number" @input="sendTranscationValueChange" :key="sendTranscationInputKey" v-focus="sendTranscationFocus">
                        <el-button class="append" slot="append" @click="sendAll">ALL</el-button>
                    </el-input>
                    <span class="wantTo">{{$t("wallet.wantTo")}}
                        <span class="black">
                            <span class="EnergonCount">{{sendTranscation.value || 0}}</span>
                            Energon
                        </span>
                    </span>
                </el-form-item>
                <el-form-item :label="$t('wallet.selectFee')">
                    <span class="send-slider">
                        <fee-slider @sel="selFee" :estimateGas="gas"></fee-slider>
                    </span>
                </el-form-item>
            </el-form>
            <div class="total-box">
                <div class="total-num">
                    <p class="total-text">{{$t("wallet.total")}}</p>
                    <p class="font16 bold">
                        {{walletType==1?add(sendTranscation.value-0,sendTranscation.gas-0):sendTranscation.value-0}}&nbsp;Energon
                    </p>
                     <span class="share-info" v-if="walletType==2">{{$t("wallet.ServiceChargeMsg")}} ({{sendTranscation.gas-0}} Energon)</span>
                </div>
                <el-button :class="[lang=='en'?'':'letterSpace']" type="primary" @click="confirm()" :disabled="gasLoading || !sendTranscation.to || !sendTranscation.value">{{$t("wallet.send")}}</el-button>
            </div>
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
                           <!-- <div class="lt wallet-icon" :class="wallet.icon"> -->
                               <div :class="['lt wallet-icon',wallet.icon]">
                               {{wallet.account&&wallet.account.slice(0,1).toUpperCase()}}
                           </div>
                           <div class="rt">
                               <p class="marB wallet-name">{{wallet.account}}</p>
                               <p> {{wallet.balance}}<span class="txt"> Energon</span></p>
                           </div>
                       </li>
                   </ul>
                </div>
            </div>
        </div>
<!--        联盟交易确认弹窗-->
        <div class="modal confirm" v-if="showConfirm">
            <div class="modal-main">
                <div class="modal-title">
                    {{$t("wallet.sendTransaction")}}
                    <span class="modal-close" @click="closeShowConfirm"></span>
                </div>
                <div class="modal-content">
                    <div class="confirm-content">
                        <p>{{$t("wallet.amount")}}<span class="txt"><span class="bold">{{sendTranscation.value}}</span>&nbsp;Energon</span></p>
                        <p>{{$t('wallet.from')}}
                            <span class="txt">
                            <i :class="['trade-wallet-icon',wallet.icon,wallet.type=='share'?'wallet-share':'']">{{wallet.account&&wallet.account.slice(0,1).toUpperCase()}}</i>
                            {{wallet.account&&wallet.account.slice(0,16)}}
                            <!-- {{fromW.address}} -->
                            </span>
                        </p>
                        <p>{{$t('wallet.to')}}<span class="txt">
                            <i :class="['trade-wallet-icon',toWallet.icon?toWallet.icon:'wallet-icon1',toWallet.type=='share'?'wallet-share':'']">{{toWallet.account?toWallet.account.slice(0,1).toUpperCase():sendTranscation.to.slice(2,3).toUpperCase()}}</i>
                            {{toWallet.account?toWallet.account:sendTranscation.to}}
                            <!-- {{sendTranscation.to}} -->
                            </span></p>
                        <p v-if="walletType==2">{{$t('wallet.executorFrom')}}
                            <span class="txt">
                            <i :class="['trade-wallet-icon',owner.icon]">{{owner.account&&owner.account.slice(0,1).toUpperCase()}}</i>
                            {{owner.account&&owner.account.slice(0,16)}}
                                <!-- {{fromW.address}} -->
                            </span>
                        </p>
                        <p class="fee">{{$t("wallet.fee")}}<span class="txt"><span class="bold">{{sendTranscation.gas}}</span>&nbsp;Energon</span></p>
                    </div>
                    <p class="inputb">
                        <el-input class="input-psw" :disabled="sendLoading" :placeholder="confirmPswPlaceholder()" type="password" v-model.trim="sendTranscation.psw"></el-input>
                    </p>
                </div>
                <div class="modal-btn">
                    <el-button :class="[lang=='en'?'':'letterSpace']" @click="showConfirm=false" :disabled="sendLoading">{{$t("form.cancel")}}</el-button>
                    <el-button :class="[lang=='en'?'':'letterSpace','subBtn']" @click="send" type="primary" :loading="sendLoading" :disabled="!sendTranscation.psw">{{sendLoading?$t('form.submiting'):$t("form.submit")}}</el-button>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex';
    import contractService from '@/services/contract-servies';
    import keyManager from '@/services/key-manager';
    import mathService from '@/services/math';
    import Settings from '@/services/setting';
    import feeSlider from '@/components/feeSlider';
    var fs = require("fs");
    let pwsErrorFlag=true,pwsErrorTimer=null,subSendTimer=null;

    export default {
        name: "o-wallet-send-transcation",
        data(){
            return{
                showMoreFun:false,
                fromW:{
                   address:'',
                   account:'',
                   required:null
                },
                wallet:{},
                wallets:[],
                sendTranscation: {
                    to: '',
                    value: '',
                    gas: 0,
                    input: '',
                    psw:''
                },
                sendTranscationRule:{

                },
                showConfirm:false,
                balance:0,
                confirmShowMore:false,
                gas:210000,
                gasPrice:null,
                sendLoading:false,
                gasLoading:false,
                showSelOwners:false,
                availOwners:[],
                owner:null,
                sendTranscationInputKey:0,
                sendTranscationFocus:false,
                toWallet:{}
            }

        },
        props:(['walletType']),
        computed:{
            ...mapGetters(['network', 'WalletListGetter','curWallet','chainName','lang','allWalletList']),
            /*confirmPswPlaceholder(){
                const {walletType,fromW,owner}=this,
                sliceLen=str=>{
                    if(!str)return ''
                    return str.length>16?str.slice(0,16)+'...':str
                }
                return this.$t('wallet.input')+sliceLen(walletType==1?fromW.account:owner.account)+this.$t('wallet.walletPsw')
            }*/
        },
        mounted(){
            this.init();
        },
        watch:{
            'curWallet':function(nowVal,oldVal){
                let curWallet = this.curWallet;
                let curWalletArr = this.allWalletList.filter((item)=>{
                    return item.address == curWallet;
                });
                if(!curWalletArr.length) return nowVal
                this.wallet = curWalletArr[0];
                this.fromW.account = curWalletArr[0].account;
                this.fromW.address = curWalletArr[0].address;
                if(this.walletType==2){
                    //获取签名数
                    contractService.platONCall(contractService.getABI(1),this.fromW.address,'getRequired',this.fromW.address).then((required)=>{
                        this.fromW.required = required;
                    })
                }
                contractService.web3.eth.getBalance(this.fromW.address,(err,data)=>{
                    // this.balance =  contractService.web3.fromWei(data.toString(10), 'ether');
                    const {fromWei,toDecimal}=contractService.web3
                    this.balance=fromWei(toDecimal(data), 'ether');
                })
            }
        },
        methods: {
            ...mapActions(['saveTractRecord','getAvailOwner','getWalletByAddress']),
             init(){
                console.log('init-------',this.sendTranscation);
                this.sendTranscation.to='';
                this.sendTranscation.value='';
                const {curWallet,allWalletList}=this;
                this.fromW.address=curWallet;
                 allWalletList.forEach((item)=>{
                     if(item.address==curWallet){
                         if(item.type=='share'){
                             if(item.state!==1){
                                 return;
                             }else{
                                 this._getAvailOwner(item.address,(avail)=>{
                                     if(avail.length>0){
                                         _getBalance(item);
                                     }
                                 });
                             }
                         }else{
                             _getBalance(item);
                         }
                         this.wallet=item;
                         contractService.web3.eth.getBalance(this.wallet.address,(err,data)=>{
                            //  this.balance =  contractService.web3.fromWei(data.toString(10), 'ether');
                            const {fromWei,toDecimal}=contractService.web3
                            this.balance=fromWei(toDecimal(data), 'ether');
                         });
                         return
                     }
                 })
                this.wallets=[];
                let _this = this;
                if(this.walletType==2){
                    this.gas = 2000000;
                }
                function _getBalance(item){
                    contractService.web3.eth.getBalance(item.address,(err,data)=>{
                        // let balance = contractService.web3.fromWei(data.toString(10), 'ether');
                        const {fromWei,toDecimal}=contractService.web3
                        let balance=fromWei(toDecimal(data), 'ether');
                        if(balance>0){
                            balance = (Math.floor(Number(balance) * 100) / 100).toFixed(2);
                            item.balance = balance;
                            _this.wallets.push(item);
                            _this.wallets.sort((a,b)=>{
                                return a['createTime'] - b['createTime'];
                            });
                        }
                        return balance
                    })
                }
                this.allWalletList.forEach((item)=>{
                    this.fromW.address==item.address?(this.fromW.account=item.account):''
                    if(item.type=='share'){
                        if(item.state!==1){
                            return;
                        }else{
                            this._getAvailOwner(item.address,(avail)=>{
                                if(avail.length>0){
                                    _getBalance(item);
                                }
                            });
                        }
                    }else{
                        _getBalance(item);
                    }
                });
            },
            confirmPswPlaceholder(){
                const {walletType,fromW,owner}=this,
                    sliceLen=str=>{
                        if(!str)return ''
                        return str.length>16?str.slice(0,16)+'...':str
                    }
                return this.$t('wallet.input')+sliceLen(walletType==1?fromW.account:owner.account)+this.$t('wallet.walletPsw')
            },
            async _getAvailOwner(walletAddr,cb){
                let data = await this.getAvailOwner(walletAddr);
                cb(data);
            },
            fixBalance(bal){
                return (Math.floor(Number(bal) * 100) / 100).toFixed(2);
            },
            add(arg1,arg2){
                return mathService.add(arg1,arg2);
            },
            changeVal(){
                if(this.sendTranscation.value==0){
                    this.sendTranscation.value=''
                }
            },
            moreFun(){
                this.showMoreFun = !this.showMoreFun;
            },
            selWallet(){
                let fromW = this.fromW;
                let arr = this.wallets.filter((item)=>{
                    return item.address==fromW.address;
                });
                this.fromW.account = arr.length>0?arr[0].account:'';
                contractService.web3.eth.getBalance(this.fromW.address,(err,data)=>{
                    if(err){
                        throw err;
                    }
                    // this.balance = contractService.web3.fromWei(data.toString(10), 'ether');
                    const {fromWei,toDecimal}=contractService.web3
                    this.balance=fromWei(toDecimal(data), 'ether');
                });
                this.changeVal();
            },
            sendAll(){
                const address=this.sendTranscation.to;//
                contractService.web3.eth.getBalance(this.fromW.address,(err,data)=>{
                    // let balance=contractService.web3.fromWei(data.toString(10), 'ether');
                    const {fromWei,toDecimal}=contractService.web3
                    let balance=fromWei(toDecimal(data), 'ether');
                    console.log('sendAll',this.sendTranscation.gas);
                    this.init();
                    this.sendTranscation.to=address;//
                    if(this.walletType==1){
                        this.sendTranscation.value = mathService.sub(balance,this.sendTranscation.gas);
                    }else{
                        this.sendTranscation.value = balance;
                    }
                });
            },
            changeDest(){
                if(!/(0x)[0-9a-fA-F]{40}$/g.test(this.sendTranscation.to)){
                    this.$message.error(this.$t('wallet.incorrectAddress'));
                    return;
                }
                this.changeVal();
            },
            confirm(){
                if(this.sendTranscation.to==this.fromW.address){
                    this.$message.error(this.$t('wallet.sendToSelf'));
                    return;
                }
                if(this.walletType==1){
                    if(mathService.sub(mathService.add(this.sendTranscation.value-0,this.sendTranscation.gas-0),this.balance)>0){
                        this.$message.warning({message:this.$t('wallet.insufficientBalance'),customClass:'warn'});
                        return;
                    }
                }else{
                    if(mathService.sub(this.sendTranscation.value-0,this.balance)>0){
                        this.$message.warning({message:this.$t('wallet.insufficientBalance'),customClass:'warn'});
                        return;
                    }
                }
                if(!/(0x)[0-9a-fA-F]{40}$/g.test(this.sendTranscation.to)){
                    this.$message.error(this.$t('wallet.incorrectAddress'));
                    return;
                }
                if(/-|e/g.test(this.sendTranscation.value)){
                    this.$message.error(this.$t('wallet.incorrectValue'));
                    return;
                }
                this.sendTranscation.psw='';
                this.getWalletByAddress(this.sendTranscation.to).then(res=>((res&&(this.toWallet=res))||(this.toWallet={})))
                if(this.walletType==1){
                    this.showConfirm = true;
                }else{
                    this._getAvailOwner(this.fromW.address,(avail)=>{
                        if(avail.length>0){
                            avail.forEach((item,index)=>{
                                contractService.web3.eth.getBalance(item.address,(err,data)=>{
                                    if(err) return null;
                                    // item.balance=contractService.web3.fromWei(data,"ether").toString(10)-0;
                                    const {fromWei,toDecimal}=contractService.web3
                                    item.balance=fromWei(toDecimal(data), 'ether');
                                    this.$set(this.availOwners,index,item)
                                    this.$set(this.availOwners[index],'icon',item.icon)
                                });
                            });
                            this.availOwners = avail;
                            if(this.availOwners.length==1){
                                this.owner = this.availOwners[0];
                                // console.log(this.owner);
                                this.showSelOwners = false;
                                this.showConfirm = true;
                            }else{
                                this.showSelOwners = true;
                            }
                        }
                    });
                }
            },
            selOwner(owner){
                if(owner.balance==0) return;
                this.owner = owner;
                this.showSelOwners = false;
                this.showConfirm = true;
            },
            closeShowConfirm(){
                if(this.sendLoading) return;
                this.showConfirm = false;
            },
            send(){
                if(this.walletType==1){ //普通钱包发送交易
                    let transParam = {
                        from: this.fromW.address,
                        to: this.sendTranscation.to,
                        value: contractService.web3.toWei(this.sendTranscation.value, "ether"),
                        data: contractService.web3.toHex(this.sendTranscation.input)
                    };
                    keyManager.recover(transParam.from,this.sendTranscation.psw,'hex',(err,data)=>{
                        // console.warn('private---',err,data);
                        if(err){
                            if(!pwsErrorFlag){
                                pwsErrorTimer==null&& (pwsErrorTimer=setTimeout(()=>{
                                    pwsErrorFlag=true
                                    clearTimeout(pwsErrorTimer)
                                    pwsErrorTimer=null
                                },3000))
                            }else{
                                pwsErrorFlag=false
                                this.$message.error(this.$t('form.wrongPsw'));
                            }
                            return;
                        }
                        let priKey = data;
                        this.sendLoading = true;
                        contractService.sendTransaction(transParam.from,transParam.to,Number(transParam.value),priKey,transParam.data,this.gas,contractService.web3.toWei(this.gasPrice, "ether"),(errCode,result)=>{
                            console.log('result txhash--->',errCode,!!errCode,result);
                            this.sendLoading = false;
                            if(!!errCode && errCode==2){
                                return;
                            }else if(!!errCode){
                                this.$message.error(this.$t('wallet.transactionFailed'));
                                return;
                            }
                            let tradeObj={
                                tradeTime:new Date().getTime(),
                                hash:result?result:'txn_hash',
                                value:this.sendTranscation.value,
                                gasPrice:contractService.web3.toWei(this.gasPrice, "ether"),
                                input:this.sendTranscation.input,
                                fromAccount:this.fromW.account,
                                from:this.fromW.address,
                                to:this.sendTranscation.to,
                                type:'transfer'
                            };
                            this.saveTractRecord(tradeObj).then(()=>{
                                this.showConfirm = false;
                                // this.$router.push('/o-wallet-details');
                                this.init();
                                this.$emit('initEvent');
                                this.$message.success(this.$t('trade.transactionSent'));
                            });
                        })
                    })
                }else{
                    let param={
                        destination:this.sendTranscation.to,
                        from:this.fromW.address,
                        value:contractService.web3.toWei(this.sendTranscation.value,"ether"),
                        data:contractService.web3.toHex(this.sendTranscation.input),
                        len:contractService.web3.toHex(this.sendTranscation.input).length,
                        time:new Date().getTime(),
                        fee:mathService.mul(this.sendTranscation.gas,10000000000)
                    };
                    console.log('param-->',param);
                    let param1=[param.destination,param.from,param.value,param.data,param.len,param.time,param.fee];
                    keyManager.recover2(this.owner,this.sendTranscation.psw,'buf',(err,data)=>{
                        if(err){
                            this.$message.error(this.$t('form.wrongPsw'));
                            return;
                        }
                        let priKey = data;
                        this.sendLoading = true;
                        if(subSendTimer){
                            clearTimeout(subSendTimer)
                        }
                        subSendTimer=setTimeout(()=>{
                            debugger
                            this.$message.error(this.$t('wallet.networkTimeout'));
                            this.sendLoading = false;
                        },10000)
                        contractService.platONSendTransaction(contractService.getABI(1),this.fromW.address,'submitTransaction',JSON.stringify(param1),this.owner.address,priKey,false,false,false,true).then((data)=>{
                            let txId = (data.result&&data.result.length>0)?data.result[0]:null;
                            contractService.platONSendTransaction(contractService.getABI(1),this.fromW.address,'confirmTransaction',JSON.stringify([data.result[0]]),this.owner.address,priKey,false,false,false).then((data1)=>{
                                clearTimeout(subSendTimer)
                                let tradeObj1={
                                    tradeTime:new Date().getTime(),
                                    hash:data1.hash,
                                    value:0,
                                    gasPrice:this.gasPrice,
                                    fromAccount:this.owner.account,
                                    from:this.owner.address,
                                    to:this.fromW.address,
                                    txId:txId,
                                    type:'jointWalletExecution',
                                    state:0
                                };
                                this.saveTractRecord(tradeObj1).then(()=>{
                                    this.sendLoading = false;
                                    this.showConfirm = false;
                                    this.init();
                                    this.$emit('initEvent');
                                    // this.$router.push('/o-wallet-share-detail')
                                    this.$message.success(this.$t('trade.transactionSent'));
                                });
                            }).catch((e)=>{
                                this.sendLoading = false;
                                this.$message.error(this.$t('wallet.transactionFailed'));
                            });
                        }).catch((e)=>{
                            this.sendLoading = false;
                            this.$message.error(this.$t('wallet.transactionFailed'));
                        })
                    })
                }
            },
            selFee(data){
                this.gasPrice=data;
                this.sendTranscation.gas = mathService.mul(this.gas,this.gasPrice);
            },
            sendTranscationValueChange(val){
                if(val.length>20){
                    const now=val.substring(0,20)
                    val=now
                    this.sendTranscation.value=now
                    this.sendTranscationInputKey=Math.random()
                    this.sendTranscationFocus=true
                }
            }
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
    .font16{
        font-size:16px;
    }
    .send-transcation{
        height: calc(~"100% - 70px");
    }
    .cur{
        cursor:pointer;
    }
    .send{
        float:right;
    }
    .send-slider{
        display:block;
        width:445px;
    }
    .send-content{
        height: 100%;
        box-sizing: border-box;
        margin: 0 auto;
        padding-top: 20px;
        // padding-left: 14px;
        font-size: 12px;
        color: #525768;
        .el-input-group__append{
            position:relative;
        }
        .more{
            color: #24272b;
            i{
                font-size:10px;
            }
        }
        .total-box{
            position: absolute;
            bottom: 10px;
            width:calc(~"100% - 240px");
            /*height: 60px;*/
            line-height:60px;
            color:#24272b;
            .el-button{
                // position:absolute;
                // right:20px;
                // top: 14px;
                width: 79px;
                height: 32px;
                padding: 0;
            }
        }
        .total-num{
            font-size: 14px;
            border-bottom:solid 1px #D3D8E1;
            height: auto;
            >.font16{
                margin: 10px 0 14px;
                height: 22px;
                line-height: 22px;
            }
        }
        .total-text{
            height: 20px;
            line-height: 20px;
        }
        .share-info{
            /*position: absolute;*/
            bottom: 0;
            /*height: 12px;*/
            font-size: 12px;
            color: #9EABBE;
            letter-spacing: 0.38px;
            line-height: 17px;
            margin-bottom: 14px;
            display: block;
        }
    }
    .confirm{
        .modal-main{
            width:483px;
            font-size: 12px;
            .modal-content{
                // padding:12px;
                .confirm-content{
                    padding:14px 10px;
                    max-height:152px;
                    height:auto;
                    background: #ECEFF6;
                    p{
                        color: #24272B;
                        margin-bottom:9px;
                        .txt{
                            float:right;
                            color: #000000;
                        }
                    }
                    .fee{
                        margin-bottom:0;
                    }
                }
                .more{
                    margin:10px;
                    cursor:pointer;
                    i{
                        font-size:10px;
                    }
                }
                .more-txt{
                    padding-left:10px;
                    word-break: break-all;
                }
                .inputb{
                    margin:30px 20px 18px;
                    .el-input{
                        width:100%;
                    }
                }
                .wallet-share{
                    border-radius: 0;
                }
            }
            .modal-btn{
                // padding-top:7.5px;
                // line-height:1;
                // height:48.5px;
                button{
                    width:79px;
                    height:32px;
                    font-size:12px;
                }
            }
        }
    }
    .el-button.is-disabled{
        background-color: #0077FF;
        opacity: 0.5;
    }
    .append{
        width:72px;
        letter-spacing: 0;
        font-weight: normal;
    }
    .EnergonCount{
        font-weight: bold;
    }
    .wantTo{
        line-height: 40px;
        padding-left: 10px;
        .black{
            font-size: 14px;
            color:#22272C;
        }
    }
</style>
<style lang="less">
    .send-content{
        .el-form-item__label{
            color:#24272b;
            font-size: 12px !important;
        }
        .el-form-item__content{
            display: flex;
            align-items: flex-end;
            font-size: 12px !important;
        }
        .el-input{
            font-size:12px;
            .el-input__inner{
                height:40px;
            }
        }
        .el-input-group__append{
            color:#fff;
            background: #4897F6;
        }
        .txea{
            margin-top:10px;
             width:500px;
            .el-textarea__inner{
                font-size:11px;
            }
        }

        .gas-input{
            .el-input{
                width:100px;
                .el-input__inner{
                    height:32px!important;
                }

            }
        }
    }
</style>
