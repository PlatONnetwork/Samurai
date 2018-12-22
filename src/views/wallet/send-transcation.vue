<template>
    <div class="send-transcation format-style" style="height:auto">
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
                                    :label="(item.account.length>16?item.account.slice(0,16)+'...':item.account)+'--'+item.balance+'ATP'"
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
                        <el-button slot="append" @click="sendAll">All</el-button>
                    </el-input>
                    <span>{{$t("wallet.wantTo")}}{{sendTranscation.value || 0}}ATP</span>
                </el-form-item>
                <el-form-item :label="$t('wallet.selectFee')">
                    <span class="send-slider">
                        <fee-slider @sel="selFee"></fee-slider>
                    </span>
                </el-form-item>
                <span @click="moreFun" class="cur more">{{$t("wallet.advance")}} <i class="el-icon-arrow-down"></i></span>
                <el-form-item :lable="$t('wallet.advance')" v-if="showMoreFun">
                    <el-input class="txea" :rows="4" type="textarea" v-model.trim="sendTranscation.input" @change="changeVal" :placeholder="$t('wallet.advanceHint')"></el-input>
                </el-form-item>
            </el-form>
            <p class="total">
                <span>{{$t("wallet.total")}}：{{add(sendTranscation.value-0,sendTranscation.gas-0)}}ATP</span>
                <el-button type="primary" @click="confirm()" :disabled="gasLoading || !sendTranscation.to || !sendTranscation.value">{{$t("wallet.send")}}</el-button>
            </p>
        </div>

        <div class="modal confirm" v-if="showConfirm">
            <div class="modal-main">
                <div class="modal-title">{{$t("wallet.sendTransaction")}}</div>
                <div class="modal-content">
                    <div class="confirm-content">
                        <p>{{$t("wallet.amount")}}<span class="txt">{{sendTranscation.value}}ATP</span></p>
                        <p>From<span class="txt">{{fromW.address}}</span></p>
                        <p>To<span class="txt">{{sendTranscation.to}}</span></p>
                        <p>{{$t("wallet.fee")}}<span class="txt">{{sendTranscation.gas}}ATP</span></p>
                    </div>
                    <p @click="confirmShowMore=!confirmShowMore" class="more">{{$t("wallet.advance")}} <i class="el-icon-arrow-down"></i></p>
                    <p v-if="confirmShowMore" class="more-txt">{{sendTranscation.input}}</p>
                    <p class="inputb">
                        <el-input :placeholder="$t('wallet.input')+(fromW.adminAccount?fromW.adminAccount:fromW.account)+' '+$t('wallet.walletPsw')" type="password" v-model.trim="sendTranscation.psw"></el-input>
                    </p>
                </div>
                <div class="modal-btn">
                    <el-button class="cancel" @click="showConfirm=false">{{$t("form.cancel")}}</el-button>
                    <el-button @click="send" type="primary" :disabled="sendLoading">{{$t("form.submit")}}</el-button>
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
                   adminAddress:null,
                   adminAccount:null,
                   required:null
                },
                wallet:{},
                wallets:[],
                sendTranscation: {
                    to: '',
                    value: '',
                    gas: 0.01,
                    input: ''
                },
                sendTranscationRule:{

                },
                showConfirm:false,
                balance:0,
                confirmShowMore:false,
                gas:null,
                gasPrice:null,
                sendLoading:false,
                gasLoading:false
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
                        this.fromW.adminAddress = curWalletArr[0].admin.address;
                        this.fromW.adminAccount = curWalletArr[0].admin.account;
                        //获取签名数
                        contractService.platONCall(contractService.getABI(1),this.fromW.address,'getRequired',this.fromW.adminAddress).then((required)=>{
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
            ...mapActions(['WalletListAction','getGasOptions','getOrdByAddress','saveTractRecord']),
            init(){
                let _this = this;
                this.wallets=[];
                this.WalletListGetter.forEach((item)=>{
                    contractService.web3.eth.getBalance(item.address,(err,data)=>{
                        let balance = contractService.web3.fromWei(data.toString(10), 'ether');
                        balance = (Math.floor(Number(balance) * 100) / 100).toFixed(2);
                        item.balance = balance;
                        if(balance>0){
                            // item.account = item.account.length>16?(item.account.slice(0,16)+'...'):item.account;
                            _this.wallets.push(item);
                            _this.wallets.sort((a,b)=>{
                                return a['createTime'] - b['createTime'];
                            });
                        }
                    })
                });
            },
            fixBalance(bal){
                return (Math.floor(Number(bal) * 100) / 100).toFixed(2);
            },
            add(arg1,arg2){
                return mathService.add(arg1,arg2);
            },
            getGas(){
                return new Promise((resolve, reject)=>{
                    if(this.sendTranscation.value && this.sendTranscation.to && this.fromW.address){
                        if(!/(0x)[0-9a-fA-F]{40}$/g.test(this.sendTranscation.to)){
                            this.$message.error(this.$t('wallet.incorrectAddress'));
                            return;
                        }
                        if(this.walletType==1){
                            let param = {
                                "to":this.sendTranscation.to,
                                "value": contractService.web3.toHex(contractService.web3.toWei(this.sendTranscation.value, "ether"))
                            };
                            if(this.sendTranscation.input && !/^\s*$/g.test(this.sendTranscation.input)){
                                param["data"] = contractService.web3.toHex(this.sendTranscation.input)
                            }
                            contractService.web3.eth.estimateGas(param,(err,data)=>{
                                console.log('估算gas--->',err,data);
                                if(err){
                                    reject(err)
                                }
                                resolve(data);
                            })
                        }else{
                            //共享钱包发送交易,gas为submit_estimated_gas + confirm_estimated_gas
                            let param={
                                destination:this.sendTranscation.to,
                                from:this.fromW.address,
                                value:contractService.web3.toWei(this.sendTranscation.value,"ether"),
                                data:contractService.web3.toHex(this.sendTranscation.input),
                                len:contractService.web3.toHex(this.sendTranscation.input).length,
                                time:new Date().getTime(),
                                fee:mathService.mul(this.sendTranscation.gas,10000000000)
                            };
                            let param1=[param.destination,param.from,param.value,param.data,param.len,param.time,param.fee];
                            const MyContract = contractService.web3.eth.contract(contractService.getABI(1));
                            const myContractInstance = MyContract.at(this.wallet.address);
                            const platOnData = myContractInstance['submitTransaction'].getPlatONData(...param1);
                            contractService.web3.eth.estimateGas({
                                "from":this.wallet.admin.address,
                                "to":this.wallet.address,
                                "data":platOnData
                            },(err,data)=>{
                                console.log('估算gas--->',err,data);
                                if(err){
                                    reject(err)
                                }
                                resolve(data);
                            })
                        }
                    }
                });
            },
            changeVal(){
                if(this.sendTranscation.value==0){
                    this.sendTranscation.value=''
                }else{
                    if((this.walletType==1 && this.fromW.address) || (this.walletType==2 && this.sendTranscation.to)){
                        this.getGas().then((gas)=>{
                            this.gasLoading = false;
                            this.gas = gas;
                            this.sendTranscation.gas = mathService.mul(gas,this.gasPrice);
                        }).catch((e)=>{
                            console.error('estimateGas failed--',e);
                            this.gasLoading = false;
                        });
                    }
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
                    this.sendTranscation.value = balance;
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
                if(this.add(this.sendTranscation.value-0,this.sendTranscation.gas-0)-this.balance>0){
                    this.$message.error(this.$t('wallet.insufficientBalance'));
                    return;
                }
                if(!/(0x)[0-9a-fA-F]{40}$/g.test(this.sendTranscation.to)){
                    this.$message.error(this.$t('wallet.incorrectAddress'));
                    return;
                }
                if(/-|e/g.test(this.sendTranscation.value)){
                    this.$message.error(this.$t('wallet.incorrectValue'));
                    return;
                }
                this.gasLoading = true;
                this.getGas().then((gas)=>{
                    this.gasLoading = false;
                    this.gas = gas;
                    this.sendTranscation.gas = mathService.mul(gas,this.gasPrice);
                    this.sendTranscation.psw='';
                    this.showConfirm = true;
                }).catch((e)=>{
                    this.gasLoading = false;
                    this.$message.error(this.$t('wallet.estimateFailed'))
                });
            },
            send(){
                let _this = this;
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
                        contractService.sendTransaction(transParam.from,transParam.to,Number(transParam.value),priKey,transParam.data,_this.gas,contractService.web3.toWei(_this.gasPrice, "ether"),(errCode,result)=>{
                            console.log('result txhash--->',errCode,!!errCode,result);
                            this.sendLoading = false;
                            if(!!errCode && errCode==2){
                                return;
                            }else if(!!errCode){
                                _this.$message.error(this.$t('wallet.transactionFailed'));
                                return;
                            }
                            let tradeObj={
                                tradeTime:new Date().getTime(),
                                hash:result?result:'txn_hash',
                                value:this.sendTranscation.value,
                                gasPrice:contractService.web3.toWei(_this.gasPrice, "ether"),
                                input:this.sendTranscation.input,
                                fromAccount:this.fromW.account,
                                from:this.fromW.address,
                                to:this.sendTranscation.to,
                                type:'transfer'
                            };
                            _this.saveTractRecord(tradeObj).then(()=>{
                                _this.showConfirm = false;
                                _this.$router.push('/o-wallet-details')
                            });
                        })
                    })
                }else{
                    this.getOrdByAddress(this.fromW.adminAddress).then((obj)=>{
                        console.log('getOrdByAddress--->',obj);
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
                        keyManager.recover2(obj,this.sendTranscation.psw,'buf',(err,data)=>{
                            if(err){
                                this.$message.error(this.$t('form.wrongPsw'));
                                return;
                            }
                            console.log('recover--->',data);
                            let priKey = data;
                            _this.sendLoading = true;
                            contractService.platONSendTransaction(contractService.getABI(1),this.fromW.address,'submitTransaction',JSON.stringify(param1),obj.address,priKey).then((data)=>{
                                console.log('hash--->',data.hash);
                                console.log('result--->id---->',data.result[0]);
                                contractService.platONSendTransaction(contractService.getABI(1),this.fromW.address,'confirmTransaction',JSON.stringify([data.result[0]]),obj.address,priKey).then((data1)=>{
                                    console.log('confirmTransaction---->',data1);
                                    _this.sendLoading = false;
                                    _this.showConfirm = false;
                                    _this.$router.push('/o-wallet-share-detail')
                                }).catch((e)=>{
                                    _this.sendLoading = false;
                                    _this.$message.error(_this.$t('wallet.transactionFailed'));
                                });
                            }).catch((e)=>{
                                _this.sendLoading = false;
                                _this.$message.error(_this.$t('wallet.transactionFailed'));
                            })
                        })
                    }).catch((e)=>{
                        console.log(e);
                        this.$message.error(this.$t('wallet.invalidSignatures'));
                    });
                }
            },
            selFee(data){
                this.gasPrice=data;
                if(this.gas){
                    this.sendTranscation.gas = mathService.mul(this.gas,this.gasPrice);
                }
            }
        },
        components:{
            feeSlider
        }

    }
</script>

<style lang="less" scoped>
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
        height: 560px;
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
                .more-txt{
                    padding-left:10px;
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
</style>
<style lang="less">
    .send-content{
        .el-form-item__label{
            color:#24272b;
            font-size: 12px !important;
        }
        .el-form-item__content{
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
