<template>
    <div class="increase-stake format-style">
        <div class="card increase-stake-content">
            <el-form v-model="payForm" label-position="top">
                <el-form-item prop="payWallet" :label="$t('application.payWallet')">
                    <el-select v-model="payForm.payWallet" :placeholder="$t('wallet.selectHint')" @change="changePayWallet" :style="{pointerEvents:payForm.payWallet?'auto':'none'}">
                        <el-option v-for="wallet in wallets" :key="wallet.address" :value="wallet.address"
                                   :label="(wallet.account.length>10?wallet.account.slice(0,10):wallet.account)+'--'+wallet.balance+' Energon'"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="value" :label="$t('application.stakeAmount')">
                    <el-input v-model.trim="payForm.value" @blur="changeVal" @input="getRanking" :placeholder="$t('application.stakeNumber')" type="number" v-focus="payFormInputFocus" :key="payFormInputKey">
                        <el-button slot="append" @click="sendAll">All</el-button>
                    </el-input>
                    <p class="danger" v-if="valueNull">{{$t('application.stakeAmountNull')}}</p>
                    <span class="send-txt">{{$t("wallet.wantTo")}} <span class="send-val"><span class="bold">{{payForm.value || 0}}</span>&nbsp;Energon</span></span>
                </el-form-item>
                <p class="tip">{{$t('application.inCannotBeLess')}}</p>
                <p><span>{{$t('application.maximumAmount')}}</span>&nbsp;&nbsp;<span class="value-txt"><span class="bold">{{depositList.length>0?depositList[0]:(node?node.Deposit:'')}}</span>&nbsp;Energon</span></p>
                <p><span>{{$t('application.minimumAmount')}}</span>&nbsp;&nbsp;<span class="value-txt"><span class="bold">{{depositList.length>0?depositList[depositList.length-1]:(node?node.Deposit:'')}}</span>&nbsp;Energon</span></p>
                <p class="marT30"><span>{{$t('application.totalAmount')}}</span>&nbsp;&nbsp;<span class="value-txt"><span class="bold">{{totalDep}}</span>&nbsp;Energon</span></p>
                <p><span>{{$t('application.expectedRanking')}}</span>&nbsp;&nbsp;<span class="value-txt bold">{{ranking}}</span></p>
                <div class="btn-box">
                    <p class="stake">{{$t('application.stake2')}}</p>
                    <p class="value">{{payForm.value || 0}} Energon</p>
                    <p class="btns">
                        <el-button :class="[lang=='zh-cn'?'letterSpace':'']" type="primary" @click="submit" :disabled="!payForm.value">{{$t('form.submit')}}</el-button>
                        <el-button :class="[lang=='zh-cn'?'letterSpace':'']"@click="back">{{$t('form.cancel')}}</el-button>
                    </p>
                </div>
            </el-form>
        </div>

        <div class="modal confirm" v-if="showConfirm">
            <div class="modal-main">
                <div class="modal-title">
                    {{$t('application.increaseStakeConf')}}
                    <el-button class="modal-close" @click="showConfirm=false" :disabled="handleLoading"></el-button>
                </div>
                <div class="modal-content">
                    <div class="confirm-content">
                        <p>{{$t("application.staked2")}}<span class="txt">{{payForm.value}} Energon</span></p>
                        <p>{{$t("application.payWallet2")}}
                            <span class="txt">
                                <i :class="['trade-wallet-icon',fromWallet.icon]">{{fromWallet.account.slice(0,1).toUpperCase()}}</i>
                                {{fromWallet.account || payForm.payWallet}}
                            </span>
                        </p>
                        <p>{{$t("wallet.fee")}}<span class="txt">{{payForm.fee}} Energon</span></p>
                    </div>
                    <p class="inputb">
                        <el-input  :disabled="handleLoading" :placeholder="$t('wallet.input')+fromWallet.account+$t('wallet.walletPsw')" type="password" v-model.trim="payForm.psw"></el-input>
                    </p>
                </div>
                <div class="modal-btn">
                    <el-button :class="[lang=='zh-cn'?'letterSpace':'']" @click="showConfirm=false" :disabled="handleLoading">{{$t("form.cancel")}}</el-button>
                    <el-button :class="[lang=='zh-cn'?'letterSpace':'']" @click="send" type="primary" :loading="handleLoading || !payForm.psw">{{$t("form.submit")}}</el-button>
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
    var fs = require("fs");
    export default {
        name: 'increaseStake',
        data () {
            return {
                node:null,
                wallets:[],
                fromWallet:null,
                payForm:{
                    payWallet:null,
                    value:null,
                    fee:0.01,
                    psw:''
                },
                payFormRules:{},
                rules:{},
                showConfirm:false,
                checkRule:false,
                depositList:[],
                ranking:'-',
                totalDep:0,
                gas:2000000,
                gasPrice:'',
                valueNull:false,
                total:0,
                handleLoading:false,
                payFormInputKey:0,
                payFormInputFocus:false
            }
        },
        computed: {
            ...mapGetters(['lang','contractAddress'])
        },
        mounted(){
            this.node = this.$route.query;
            this.payForm.value=mathService.mul(this.node.Deposit,0.1);
            this.getRanking();
            this.getBalOrd(this.node.CandidateId).then((list)=>{
                if(list.length==0) return;
                this.wallets = list;
                this.payForm.payWallet = list[0].address;
                this.fromWallet = list[0];
            });
            this.getDepositList().then((data)=>{
                console.log('质押排名---',data);
                if(data.length>0){
                    this.ranking = data.indexOf(this.node.Deposit)+1;
                }else{
                    this.ranking = 1;
                }
                this.depositList = data;
                this.remaining = this.node.Deposit;
                this.total = (this.payForm.value-0)+this.payForm.fee;
            });
        },
        methods: {
            ...mapActions(['getBalOrd','getDepositList','saveTractRecord','getWalletByAddress']),
            changePayWallet(){
                this.getWalletByAddress(this.payForm.payWallet).then((wallet)=>{
                    this.fromWallet = wallet;
                })
            },
            back(){
                this.$router.back();
            },
            submit(){
                if(Number(this.payForm.value) < Number(mathService.mul(this.node.Deposit,0.1))){
                    this.$message.warning(this.$t('application.inCannotBeLess'))
                }else{
                    contractService.web3.eth.getBalance(this.fromWallet.address,(err,data)=>{
                        let balance=contractService.web3.fromWei(data.toString(10), 'ether');
                        if(balance-this.total<0){
                            this.$message.warning(this.$t('wallet.cannotTrans2'));
                        }else{
                            this.showConfirm=true;
                            this.payForm.psw = '';
                        }
                    });
                }
            },
            sendAll(){
                contractService.web3.eth.getBalance(this.fromWallet.address,(err,data)=>{
                    let balance=contractService.web3.fromWei(data.toString(10), 'ether');
                    this.payForm.value = balance - this.payForm.fee;
                    this.total = (this.payForm.value-0)+this.payForm.fee;
                    this.getRanking();
                });
            },
            getRanking(val){
                console.log('getRanking----');
                if(val && val.length>20){
                    const now=val.substring(0,20)
                    val=now
                    this.payForm.value=now
                    this.payFormInputKey=Math.random()
                    this.payFormInputFocus=true
                }
                console.log('getRanking--2222--',this.node.Deposit,this.payForm.value);
                this.valueNull = false;
                this.totalDep = (this.node.Deposit-0)+(this.payForm.value-0);
                console.log('this.totalDep-----',this.totalDep);
                let arr = JSON.parse(JSON.stringify(this.depositList));
                arr.push(this.totalDep);
                arr.sort((a,b)=>{
                    return b-a
                });
                this.ranking = arr.indexOf(this.totalDep)+1;
            },
            changeVal(){
                if(!this.payForm.value || this.payForm.value==0){
                    this.payForm.value=mathService.mul(this.node.Deposit,0.1);
                }else if(Number(this.payForm.value) < Number(mathService.mul(this.node.Deposit,0.1))){
                    this.payForm.value = mathService.mul(this.node.Deposit,0.1);
                }else{
                    this.valueNull = false;
                    this.total = (this.payForm.value-0)+this.payForm.fee;
                }
            },
            send(){
                let Extra = JSON.stringify(this.node.Extra);
                let params=[this.node.CandidateId,this.node.Owner,this.node.Fee,this.node.Host,this.node.Port,contractService.web3.toUnicode(Extra)];
                keyManager.recover2(this.fromWallet,this.payForm.psw,'buf',(err,privateKey)=>{
                    if(err){
                        this.$message.error(this.$t('form.wrongPsw'));
                        return;
                    }
                    this.handleLoading = true;
                    let gas = this.gas?parseInt(this.gas*1.1):0;
                    contractService.platONSendTransaction(contractService.getABI(2),contractService.appContractAddress,'CandidateDeposit',JSON.stringify(params),this.payForm.payWallet,privateKey,gas,contractService.web3.toWei(this.gasPrice,"ether"),this.payForm.value,false,1001).then((result)=>{
                        console.log('CandidateDeposit--result-->',result);
                        //记录交易
                        let tradeObj={
                            tradeTime:new Date().getTime(),
                            hash:result.hash,
                            value:this.payForm.value,
                            gasPrice:this.gasPrice,
                            fromAccount:this.fromWallet.account,
                            from:this.payForm.payWallet,
                            to:contractService.appContractAddress,
                            type:'increaseStake',
                            state:0,
                            nodeId:this.node.CandidateId,
                            nodeName:this.node.Extra.nodeName
                        };
                        console.log('increaseStake-----tradeObj---->',tradeObj);
                        this.saveTractRecord(tradeObj).then(()=>{
                            this.$message.success(this.$t('trade.transactionSent'));
                            setTimeout(()=>{
                                this.handleLoading = false;
                                this.showConfirm = false;
                                this.$router.push('/my-node');
                            },3000);
                        }).catch((e)=>{
                            // this.sendLoading = false;
                            this.$message.error(this.$t('wallet.transactionFailed'));
                        });

                    }).catch((e)=>{
                        this.handleLoading = false;
                        this.$message.error(this.$t('application.increaseFail'))
                    })
                });

            },
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
    .increase-stake-content{
        position:relative;
        padding:20px;
        height:100%;
        overflow-y: auto;
        font-size: 12px;
        color: #24272B;
        letter-spacing: 0.43px;
        .send-txt{
            position: absolute;
            top: 12px;
            left: 311px;
            color: #525768;
        }
        .send-val{
            font-size: 14px;
            color: #22272C;
        }
        p{
            margin:14px 0;
        }
        p.danger{
            margin:0;
            line-height: 14px;
        }
        p.tip{
            margin:10px 0 0;
            padding-bottom:14px;
            font-size: 12px;
            color: #9EABBE;
            border-bottom:solid 1px #D3D8E1;
        }
        .marT30{
            margin-top:30px;
        }
        .label-txt{
            display: inline-block;
            color: #525768;
        }
        .label-txt-en{
            width:175px;
        }
        .label-txt-cn{
            width:88px;
        }
        .value-txt{
            color: #000002;
        }
        .send-slider{
            margin-top: -9px;
            display:block;
            width:445px;
        }
        .btn-box{
            position:absolute;
            bottom:1px;
            margin:0;
            width:calc(~"100% - 40px");
            font-size: 14px;
            color: #24272B;
            .value{
                margin-top:10px;
                color: #120000;
                font-weight:600;
            }
            .btns{
                margin:14px 0 0;
                padding:14px 0;
                border-top:solid 1px #D3D8E1;
                .el-button{
                    margin-right:30px;
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
    .bold{
        font-weight: bold;
    }

</style>
<style lang="less">
    .increase-stake-content{
        .el-input__inner{
            height:40px;
            line-height:40px;
        }
        .el-form-item{
            margin-bottom:14px;
            .el-form-item__content{
                font-size:12px;
            }
        }
    }
</style>

