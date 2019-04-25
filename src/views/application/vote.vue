<template>
    <div class="vote format-style">
        <div class="header">
            <p class="node-name">{{nodeName}}</p>
            <p class="node-pub" :title="nodeId">
                <span class="title text-nowrap">{{$t('vote.nodeID')}} : </span>
                <span class="pub-txt" :style="{width:isMaximized?'665px':'930px'}">{{nodeId}}</span>
            </p>
        </div>
        <div>
            <p class="sub-title">{{$t('vote.votingWallet')}} <span class="tip">{{$t('vote.votingWalletTip')}}</span></p>
            <el-select v-model="wallet" @change="selWallet" :style="{pointerEvents:wallet?'auto':'none'}" class="sel-self" :placeholder="$t('wallet.selectHint')">
                <el-option v-for="w in wallets"
                           :key="w.address"
                           :label="(w.account.length>16?(w.account.slice(0,16)+'...'):w.account)+'--'+w.balance+' Energon'"
                           :value="w.address">
                </el-option>
            </el-select>
            <p class="sub-title">{{$t('vote.ticketsCount')}}</p>
            <p class="nonselect">
                <span @click="step(-1)" class="step sub" :class="{'no-click':count<=1}"></span>
                <numberOnly-input class="input-width" :placeholder="$t('vote.enterVoteNumber')" @valueChange="changeCount" :typeInt="true" :inputVal="count"></numberOnly-input>
                <!--<input type="number" v-model.trim="count" @input="changeCount($event)" class="step-input el-input__inner"/>-->
                <span @click="step(1)"  class="step add"></span>
            </p>
        </div>
        <div class="btn-box">
            <p>{{$t('vote.total')}}: </p>
            <p class="pay">
                <span class="bold">{{total}} Energon</span>
                <span class="ticket-price">({{$t('vote.ticketPrice')}} : {{price}} Energon)</span>
            </p>
            <p class="btns vote_btns">
                <el-button type="primary" :class="[lang=='en'?'':'letterSpace']" :disabled="count<1" @click="submit">{{$t("vote.toVote")}}</el-button>
            </p>
        </div>

        <div class="modal confirm" v-if="showConfirm">
            <div class="modal-main">
                <div class="modal-title">
                    {{$t('vote.votingConfirmation')}}
                    <el-button class="modal-close" @click="showConfirm=false" :disabled="handleLoading"></el-button>
                </div>
                <div class="modal-content">
                    <div class="confirm-content">
                        <p>{{$t("vote.voteFor")}}<span class="txt">{{nodeName}}</span></p>
                        <p>{{$t("vote.ticketsCount")}}<span class="txt">{{count}}</span></p>
                        <p>{{$t("wallet.amount")}}<span class="txt">{{amount}} Energon</span></p>
                        <p>{{$t("vote.votingWallet")}}
                            <span class="txt">
                                <i :class="[keyObj.icon,'trade-wallet-icon']">{{keyObj.account.slice(0,1).toUpperCase()}}</i>
                                {{keyObj.account.length>16?keyObj.account.slice(0,16)+'...':keyObj.account}}
                            </span>
                        </p>
                        <p>{{$t("wallet.fee")}}<span class="txt">{{fee}} Energon</span></p>
                    </div>
                    <p class="inputb">
                        <el-input :placeholder="$t('wallet.input')+(keyObj.account.length>16?keyObj.account.slice(0,16)+'...':keyObj.account)+$t('wallet.walletPsw')" type="password" v-model.trim="psw" :disabled="handleLoading"></el-input>
                    </p>
                </div>
                <div class="modal-btn">
                    <el-button :class="[lang=='en'?'':'letterSpace']" @click="showConfirm=false" :disabled="handleLoading">{{$t("form.cancel")}}</el-button>
                    <el-button :class="[lang=='en'?'':'letterSpace']" @click="send" type="primary" :loading="handleLoading" :disabled="!psw">{{$t("form.submit")}}</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex'
    import Settings from '@/services/setting';
    import MathService from '@/services/math';
    import contractService from '@/services/contract-servies';
    import keyManager from '@/services/key-manager';
    import numberOnlyInput from '@/components/numberOnlyInput';

    var fs = require("fs");
    export default {
        name: 'vote',
        data () {
            return {
                nodeId:null,
                nodeName:'',
                wallets:[],
                wallet:null,
                count:1,
                total:0,
                price:0,
                gas:2000000,
                gasPrice:0,
                amount:0,
                fee:0,
                showConfirm:false,
                handleLoading:false,
                psw:'',
                keyObj:null,
                icon:''
            }
        },
        computed: {
            ...mapGetters(['voteContractAddress','lang','isMaximized'])
        },
        mounted(){
            this.init();
        },
        methods: {
            ...mapActions(['candidateList','verifiersList','getCityByIp','isMyNode','getBalOrd','saveVoteRecord','getOrdByAddress','saveTractRecord','candidateList']),
            init(){
                this.nodeId = '0x'+this.$route.query.nodeId.replace(/^0x/,'');
                this.nodeName = this.$route.query.nodeName;
                this.icon = this.$route.query.icon;
                this.getBalOrd().then((list)=>{
                    this.wallets = list;
                    if(this.wallets.length>0){
                        this.wallet = this.wallets[0].address;
                        this.keyObj = this.wallets[0];
                        this.getTotal();
                    }
                });
                this.getTicketPrice();
            },
            selWallet(){
                this.getOrdByAddress(this.wallet).then((obj)=>{
                    this.keyObj = obj;
                })
            },
            getTotal(){
                this.getGas().then(()=>{
                    let fee = MathService.mul(this.gas,MathService.toNonExponential(contractService.web3.fromWei(this.gasPrice,"ether")));
                    let amount = MathService.mul(this.count,MathService.toNonExponential(this.price));
                    // console.log('amount---',amount,this.count,MathService.toNonExponential(contractService.web3.fromWei(this.price,"ether")));
                    this.amount = amount;
                    this.fee = fee;
                    this.total = MathService.add(fee,amount);
                })
            },
            step(num){
                if(num==-1 && this.count==1) return;
                this.count = this.count+num;
                this.getTotal();
            },
            changeCount(val){
                this.count = val-0;
                this.getTotal();
            },
            async getTicketPrice(){
                await contractService.platONCall(contractService.getABI(3),contractService.voteContractAddress,'GetTicketPrice',contractService.voteContractAddress).then((price)=>{
                    this.price = contractService.web3.fromWei(price,"ether");
                })
            },
            getGas(){
                return new Promise((resolve, reject)=>{
                    contractService.web3.eth.getGasPrice((error,result)=>{
                        if(error) throw error;
                        this.gasPrice = result.toString(10)-0;
                        resolve(2000000);
                    });
                });
            },
            submit(){
                this.getGas().then(()=>{
                    this.getTicketPrice();
                    this.getTotal();
                    contractService.web3.eth.getBalance(this.wallet,(err,data)=>{
                        if(err) return;
                        let balance=contractService.web3.fromWei(data.toString(10), 'ether');
                        if(this.total-balance>0){
                            this.$message.warning(this.$t('wallet.cannotTrans2'));
                        }else{
                            //获取票池剩余票数量
                            contractService.platONCall(contractService.getABI(3),contractService.voteContractAddress,'GetPoolRemainder',contractService.voteContractAddress).then((remainder)=>{
                                if(this.count>remainder){
                                    this.$message.warning(this.$t('vote.exceed'));
                                }else{
                                    this.showConfirm = true;
                                }
                            });
                        }
                    })
                })
            },
            send(){
                keyManager.recover2(this.keyObj,this.psw,'buf',(err,privateKey)=>{
                    if(err){
                        this.$message.error(this.$t('form.wrongPsw'));
                        return;
                    }
                    //判断节点还在不在候选池
                    this.candidateList().then((list)=>{
                        console.log('candidateList------',list);
                        let idArr = list.map((item)=>{
                            return item.CandidateId
                        });
                        if(idArr.length==0 || idArr.indexOf(this.nodeId.replace(/^0x/,''))==-1){
                            this.$message.warning(this.$t('vote.invalidNode'));
                            setTimeout(()=>{
                                this.$router.push('/validator-node')
                            },1000);
                        }else{
                            //提交时重新获取最新票价判断余额是否充足
                            this.getTicketPrice();
                            this.getTotal();
                            if(this.total>this.wallet.balance){
                                this.$message.warning(this.$t('wallet.cannotTrans2'));
                            }else{
                                this.amount = MathService.mul(this.count,this.price);
                                let params=[this.count,contractService.web3.toWei(this.price,"ether").toString(10),this.nodeId];
                                this.handleLoading = true;
                                contractService.platONSendTransaction(contractService.getABI(3),contractService.voteContractAddress,'VoteTicket',JSON.stringify(params),this.keyObj.address,privateKey,this.gas,this.gasPrice,this.amount,false,1000).then((result)=>{
                                    console.log('投票结果--->',result);
                                    //记录交易
                                    let tradeObj={
                                        tradeTime:new Date().getTime(),
                                        hash:result.hash,
                                        value:this.amount,
                                        gasPrice:this.gasPrice,
                                        fromAccount:this.keyObj.account,
                                        from:this.keyObj.address,
                                        to:contractService.voteContractAddress,
                                        type:'vote',
                                        state:0,
                                        nodeId:this.nodeId,
                                        nodeName:this.nodeName,
                                        ticketPrice:this.price,
                                        ticketCount:this.count
                                    };
                                    this.saveVoteRecord({
                                        txHash:result.hash,
                                        CandidateId:this.nodeId,
                                        nodeName:this.nodeName,
                                        icon:this.icon
                                    }).then(()=>{
                                        this.saveTractRecord(tradeObj).then(()=>{
                                            this.$message.success(this.$t('trade.transactionSent'));
                                            setTimeout(()=>{
                                                this.handleLoading = false;
                                                this.$router.push('/validator-node')
                                            },3000);
                                        });
                                    }).catch(()=>{
                                        this.handleLoading = false;
                                        this.$message.error(this.$t('wallet.transactionFailed'))
                                    });
                                }).catch(()=>{
                                    this.handleLoading = false;
                                    this.$message.error(this.$t('wallet.transactionFailed'))
                                })
                            }
                        }
                    });
                });
            }
        },
        filters:{

        },
        components:{
            numberOnlyInput
        }
    }
</script>

<style lang="less" scoped>
    .text-nowrap{
        white-space: nowrap;
    }
    i{
        font-style: normal;
    }
    .vote{
        position:relative;
        padding:14px;
        background: #fff;
        border-radius:4px;
        font-size: 12px;
        color: #24272B;
        .header{
            display:flex;
            flex-direction: column;
            margin-bottom:14px;
            padding:14px;
            height:75px;
            background: #ECF1F8;
            border-radius:4px;
            .lt{
                min-width:52px;
            }
            .rt{
                flex-grow:1;
            }
            .node-name{
                font-size: 14px;
                color: #24272B;
                font-weight:600;
            }
            .node-pub{
                display:flex;
                margin-top:10px;
                font-size: 12px;
                color: #525768;
                .title{
                    margin-right:5px;
                }
                .pub-txt{
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
            img{
                display:inline-block;
                width:40px;
                height:40px;
                border-radius:40px;
            }
        }
        .sub-title{
            margin:14px 0 10px 0;
            font-weight:600;
        }
        .tip{
            margin-left:5px;
            font-size: 10px;
            color: #525768;
            letter-spacing: 0.43px;
            font-weight: normal;
        }
        .step{
            display:inline-block;
            width:26px;
            height:26px;
            vertical-align: middle;
            cursor:pointer;
        }
        .sub{
            background: url("./images/icon_delete.svg") no-repeat center center;
            &:hover{
                background: url("./images/28.icon_reduce 2.svg") no-repeat center center;
             }
             &.no-click{
                  background: url("./images/icon_delete.svg") no-repeat center center;
              }
        }
        .add{
            background: url("./images/icon_add_2.svg") no-repeat center center;
            &:hover{
                background: url("./images/28.icon_add 2.svg") no-repeat center center;
             }
        }
        .step-input{
            margin:0 10px;
            width:220px;
            height:40px;
        }
        .btn-box{
            position:absolute;
            bottom:0;
            width:calc(~"100% - 28px");
            height:126px;
            font-size: 14px;
            color: #24272B;
            letter-spacing: 0.5px;
            .pay{
                margin-top:10px;
                font-size: 16px;
                color: #24272B;
            }
            .ticket-price{
                margin-left:10px;
                font-size: 12px;
                color: #525768;
            }
            .btns{
                margin-top:14px;
                padding:14px 0;
                border-top:solid 1px  #D3D8E1;
            }
        }
        .ticket-price{
            font-size: 12px;
            color: #120000;
        }
        .input-width{
            margin:0 10px;
            display: inline-block;
            width:228px;
            height:40px;
        }
    }
</style>
<style lang="less">
    .vote{
        .el-input__inner{
            height:100%;
        }
        .input-width{
            .el-input__inner{
                text-align: center;
            }
        }
        .sel-self{
            .el-input{
                width:300px;
            }
        }
    }
    .vote_btns .el-button span{
        margin-left: 3px;
    }
</style>


