<template>
    <div class="send-transcation format-style">
        <div class="send-content card">
            <el-form ref="sendTranscation"
                     v-model="sendTranscation"
                     :rules="sendTranscationRule"
                     label-position="top">
                <div class="conversion-box">
                    <el-form-item :label="$t('wallet.from')">
                        <el-select v-model="fromW.address" @change="selWallet()">
                            <el-option
                                    v-for="item in wallets"
                                    :key="item.address"
                                    :label="(item.account.length>16?item.account.slice(0,16)+'...':item.account)+'--'+item.balance+'Energon'"
                                    :value="item.address">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <span class="conversion"></span>
                    <el-form-item :label="$t('wallet.to')">
                        <el-input v-model.trim="sendTranscation.to" :placeholder="$t('wallet.walletAddress0x')" @change="changeDest"></el-input>
                    </el-form-item>
                </div>
                <el-form-item :label="$t('wallet.amountSend')">
                    <el-input v-model.trim="sendTranscation.value" @blur="changeVal" :placeholder="$t('wallet.amountHint')" type="number">
                        <el-button class="append" slot="append" @click="sendAll">ALL</el-button>
                    </el-input>
                    <span class="wantTo">{{$t("wallet.wantTo")}}
                        <span class="EnergonCount">{{sendTranscation.value || 0}}</span>
                        Energon
                    </span>
                </el-form-item>
                <el-form-item :label="$t('wallet.selectFee')">
                    <span class="send-slider">
                        <fee-slider @sel="selFee" :estimateGas="gas"></fee-slider>
                    </span>
                </el-form-item>
            </el-form>
            <p class="total">
                <span class="bold">{{$t("wallet.total")}}：{{add(sendTranscation.value-0,sendTranscation.gas-0)}}&nbsp;Energon</span>
                <el-button type="primary" @click="confirm()" :disabled="gasLoading || !sendTranscation.to || !sendTranscation.value">{{$t("wallet.send")}}</el-button>
            </p>
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

        <div class="modal confirm" v-if="showConfirm">
            <div class="modal-main">
                <div class="modal-title">
                    {{$t("wallet.sendTransaction")}}
                    <span class="modal-close" @click="closeShowConfirm"></span>
                </div>
                <div class="modal-content">
                    <div class="confirm-content">
                        <p>{{$t("wallet.amount")}}<span class="txt"><span class="bold">{{sendTranscation.value}}</span>&nbsp;Energon</span></p>
                        <p>From<span class="txt">{{fromW.address}}</span></p>
                        <p>To<span class="txt">{{sendTranscation.to}}</span></p>
                        <p class="fee">{{$t("wallet.fee")}}<span class="txt"><span class="bold">{{sendTranscation.gas}}</span>&nbsp;Energon</span></p>
                    </div>
                    <p class="inputb">
                        <el-input :disabled="sendLoading" :placeholder="$t('wallet.input')+(walletType==1?fromW.account:(owner.account?owner.account:''))+' '+$t('wallet.walletPsw')" type="password" v-model.trim="sendTranscation.psw"></el-input>
                    </p>
                </div>
                <div class="modal-btn">
                    <el-button @click="showConfirm=false" :disabled="sendLoading">{{$t("form.cancel")}}</el-button>
                    <el-button class="subBtn" @click="send" type="primary" :loading="sendLoading">{{$t("form.submit")}}</el-button>
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
                    input: ''
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
                owner:null
            }

        },
        computed:{
            ...mapGetters(['network', 'WalletListGetter','curWallet','chainName','walletType'])
        },
        created(){
            this.init();
        },
        watch:{
            'wallets':function(val){
                let curWallet = this.curWallet;
                let curWalletArr = this.wallets.filter((item)=>{
                    return item.address == curWallet;
                });
                if(curWalletArr.length>0){
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
                        this.balance =  contractService.web3.fromWei(data.toString(10), 'ether');
                        // this.balance = (Math.floor(Number(balance) * 100) / 100).toFixed(2);
                    })
                }
            }
        },
        methods: {
            ...mapActions(['WalletListAction','getGasOptions','getOrdByAddress','saveTractRecord','getAvailOwner']),
             init(){
                this.wallets=[];
                let _this = this;
                if(this.walletType==2){
                    this.gas = 2000000;
                }
                function _getBalance(item){
                    contractService.web3.eth.getBalance(item.address,(err,data)=>{
                        let balance = contractService.web3.fromWei(data.toString(10), 'ether');
                        if(balance>0){
                            balance = (Math.floor(Number(balance) * 100) / 100).toFixed(2);
                            item.balance = balance;
                            _this.wallets.push(item);
                            _this.wallets.sort((a,b)=>{
                                return a['createTime'] - b['createTime'];
                            });
                        }
                    })
                }
                this.WalletListGetter.forEach((item)=>{
                    if(this.walletType==2){
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
                    this.balance = contractService.web3.fromWei(data.toString(10), 'ether');
                });
                this.changeVal();
            },
            sendAll(){
                contractService.web3.eth.getBalance(this.fromW.address,(err,data)=>{
                    let balance=contractService.web3.fromWei(data.toString(10), 'ether');
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
                        this.$message.error(this.$t('wallet.insufficientBalance'));
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
                if(this.walletType==1){
                    this.showConfirm = true;
                }else{
                    this._getAvailOwner(this.fromW.address,(avail)=>{
                        if(avail.length>0){
                            avail.forEach((item,index)=>{
                                contractService.web3.eth.getBalance(item.address,(err,data)=>{
                                    if(err) return null;
                                    item.balance=contractService.web3.fromWei(data,"ether").toString(10)-0;
                                    this.$set(this.availOwners,index,item)
                                });
                            });
                            this.showSelOwners = true;
                            this.availOwners = avail;
                        }
                    });
                }
            },
            selOwner(owner){
                if(owner.balance===0) return;
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
                        console.warn('private---',err,data);
                        if(err){
                            this.$message.error(this.$t('form.wrongPsw'));
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
                                this.$router.push('/o-wallet-details')
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
                        console.log('recover--->',data);
                        let priKey = data;
                        this.sendLoading = true;
                        contractService.platONSendTransaction(contractService.getABI(1),this.fromW.address,'submitTransaction',JSON.stringify(param1),this.owner.address,priKey,false,false,false,true).then((data)=>{
                            console.log('submitTransaction----->',data);
                            let tradeObj={
                                tradeTime:new Date().getTime(),
                                hash:data.hash,
                                value:contractService.web3.fromWei(param.value,"ether"),
                                gasPrice:this.gasPrice,
                                fromAccount:this.fromW.account,
                                from:this.fromW.address,
                                type:'jointWalletExecution',
                                state:1
                            };
                            console.log('submitTransaction-----tradeObj---->',tradeObj);
                            this.saveTractRecord(tradeObj).then(()=>{
                                contractService.platONSendTransaction(contractService.getABI(1),this.fromW.address,'confirmTransaction',JSON.stringify([data.result[0]]),this.owner.address,priKey,false,false,false).then((data1)=>{
                                    console.log('confirmTransaction------>',data1);
                                    let tradeObj1={
                                        tradeTime:new Date().getTime(),
                                        hash:data1.hash,
                                        value:0,
                                        gasPrice:this.gasPrice,
                                        fromAccount:this.owner.account,
                                        from:this.owner.address,
                                        type:'jointWalletExecution',
                                        state:0
                                    };
                                    console.log('confirmTransaction-----tradeObj---->',tradeObj1);
                                    this.saveTractRecord(tradeObj1).then(()=>{
                                        this.sendLoading = false;
                                        this.showConfirm = false;
                                        this.$router.push('/o-wallet-share-detail')
                                    });
                                    console.log('confirmTransaction---->',data1);
                                }).catch((e)=>{
                                    this.sendLoading = false;
                                    this.$message.error(this.$t('wallet.transactionFailed'));
                                });
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
            }
        },
        components:{
            feeSlider
        }

    }
</script>

<style lang="less" scoped>
    .send-transcation{
        height: calc(~"100% - 90px");
    }
    .cur{
        cursor:pointer;
    }
    .send{
        float:right;
    }
    .conversion-box{
        display:flex;
        .conversion{
            width:60px;
            background: url("./images/icon_conversion.svg") no-repeat center center;
        }
    }
    .send-slider{
        display:block;
        width:445px;
    }
    .send-content{
        height: 100%;
        box-sizing: border-box;
        margin: 10px auto;
        padding-top: 20px;
        padding-left: 30px;
        font-size: 12px;
        color: #525768;
        .more{
            color: #24272b;
            i{
                font-size:10px;
            }
        }
        .total{
            position: absolute;
            bottom: 50px;
            width:740px;
            height: 60px;
            line-height:60px;
            border-top:solid 1px #D3D8E1;
            .el-button{
                position:absolute;
                right:20px;
                top: 18px;
                width: 79px;
                height: 32px;
                padding: 0;
            }
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
                    max-height:126px;
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
    .el-button.is-disabled{
        background-color: #18C2E9;
        opacity: 0.5;
    }
    .append{
        width: 52px;
        letter-spacing: 0;
    }
    .EnergonCount{
        font-weight: bold;
    }
    .wantTo{
        line-height: normal;
        padding-left: 10px;
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
        .el-form-item{
            &:nth-child(1){
                display: inline-block;
            }
            &:nth-child(2){
                display: inline-block;
            }
        }
        .el-input{
            font-size:12px;
            .el-input__inner{
                height:40px;
            }
        }
        .el-input-group__append{
            color:#fff;
            background: #9EABBE;
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
