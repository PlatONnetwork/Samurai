<template>
    <div class="vote format-style">
        <div class="header">
            <div class="lt">
                <img :src="'./static/images/characters/characters-'+icon+'.jpg'" alt="">
            </div>
            <div class="rt">
               <p class="node-name">{{nodeName}}</p>
               <p class="node-pub" :title="nodeId">
                   <span class="title">{{$t('vote.nodeID')}}:</span>
                   <span class="pub-txt" :style="{width:isMaximized?'630px':'930px'}">{{nodeId}}</span></p>
            </div>
        </div>
        <div class="content">
            <p class="sub-title">{{$t('vote.votingWallet')}} <span class="tip">{{$t('vote.votingWalletTip')}}</span></p>
            <el-select v-model="wallet" @change="selWallet" :style="{pointerEvents:wallet?'auto':'none'}">
                <el-option v-for="w in wallets"
                           :key="w.address"
                           :label="w.account.length>16?w.account.slice(0,16)+'...':w.account+'--'+w.balance+'ATP'"
                           :value="w.address">
                </el-option>
            </el-select>
            <p class="sub-title">{{$t('vote.ticketsCount')}}</p>
            <span :disabled="count<1 || count==1" @click="step(-1)" class="step sub"></span>
            <input v-model.trim="count" @input="changeCount($event)" class="step-input el-input__inner"/>
            <span @click="step(1)"  class="step add"></span>
        </div>
        <p class="btn-box">
            <span class="bold">{{$t('vote.total')}}:{{total}}ATP</span>
            <span class="ticket-price">({{$t('vote.ticketPrice')}}:{{price}} Energon)</span>
            <span class="btns">
                <el-button :class="[lang=='en'?'':'letterSpace','cancel']" @click="back">{{$t("form.cancel")}}</el-button>
                <el-button type="primary" :class="[lang=='en'?'':'letterSpace']" @click="submit">{{$t("form.submit")}}</el-button>
            </span>
        </p>

        <div class="modal confirm" v-if="showConfirm">
            <div class="modal-main">
                <div class="modal-title">
                    {{$t('vote.votingConfirmation')}}
                    <el-button class="modal-close" @click="showConfirm=false" :disabled="handleLoading"></el-button>
                </div>
                <div class="modal-content">
                    <div class="confirm-content">
                        <p>{{$t("wallet.amount")}}<span class="txt">{{total}}ATP</span></p>
                        <p>From<span class="txt">{{keyObj.address}}</span></p>
                        <p>To<span class="txt contract-addr">{{voteContractAddress}}</span></p>
                        <p>{{$t("wallet.fee")}}<span class="txt">{{fee}}ATP</span></p>
                    </div>
                    <p class="inputb">
                        <el-input :placeholder="$t('wallet.input')+keyObj.account+' '+$t('wallet.walletPsw')" type="password" v-model.trim="psw" :disabled="handleLoading"></el-input>
                    </p>
                </div>
                <div class="modal-btn">
                    <el-button :class="[lang=='en'?'':'letterSpace','cancel']" @click="showConfirm=false" :disabled="handleLoading">{{$t("form.cancel")}}</el-button>
                    <el-button :class="[lang=='en'?'':'letterSpace']" @click="send" type="primary" :loading="handleLoading">{{$t("form.submit")}}</el-button>
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
            ...mapActions(['candidateList','verifiersList','getCityByIp','isMyNode','getBalOrd','saveVoteRecord','getOrdByAddress']),
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
                    console.log('amount---',amount,this.count,MathService.toNonExponential(contractService.web3.fromWei(this.price,"ether")));
                    this.amount = amount;
                    this.fee = fee;
                    this.total = MathService.add(fee,amount);
                })
            },
            step(num){
                this.count = this.count+num;
                this.getTotal();
            },
            changeCount(e){
                let val = e.target.value;
                if(val.indexOf('.')!==-1){
                    setTimeout(()=>{
                        this.count = val.slice(0,val.indexOf('.'));
                    },1000);
                }else{
                    this.getTotal();
                }
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
                    if(this.total>this.wallet.balance){
                        this.$message.warning(this.$t('wallet.cannotTrans2'));
                    }else{
                        this.showConfirm = true;
                    }
                })
            },
            send(){
                keyManager.recover2(this.keyObj,this.psw,'buf',(err,privateKey)=>{
                    if(err){
                        this.$message.error(this.$t('form.wrongPsw'));
                        return;
                    }
                    this.amount = MathService.mul(this.count,this.price);
                    let params=[this.count,contractService.web3.toWei(this.price,"ether").toString(10),this.nodeId];
                    this.handleLoading = true;
                    contractService.platONSendTransaction(contractService.getABI(3),contractService.voteContractAddress,'VoteTicket',JSON.stringify(params),this.keyObj.address,privateKey,this.gas,this.gasPrice,this.amount,false,1000).then((result)=>{
                        console.log('投票结果--->',result);
                        this.handleLoading = false;
                        this.saveVoteRecord({
                            txHash:result.hash,
                            CandidateId:this.nodeId,
                            nodeName:this.nodeName,
                            icon:this.icon
                        }).then(()=>{
                            this.$router.push('/validator-node')
                        });
                    }).catch(()=>{
                        this.handleLoading = false;
                        this.$message.error(this.$t('wallet.transactionFailed'))
                    })
                });
            },
            back(){
                this.$router.back();
            }
        },
        filters:{

        }
    }
</script>

<style lang="less" scoped>
    .vote{
        position:relative;
        padding:14px;
        background: #fff;
        border-radius:4px;
        font-size: 12px;
        color: #24272B;
        .header{
            display:flex;
            margin-bottom:20.2px;
            padding:14px 0 9.8px 0;
            height:72px;
            border-bottom:solid 1px #D3D8E1;
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
                    min-width:70px;
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
        }
        .tip{
            font-size: 10px;
            color: #120000;
            letter-spacing: 0.43px;
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
        }
        .add{
            background: url("./images/icon_add_2.svg") no-repeat center center;
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
            height:60px;
            line-height:60px;
            border-top:solid 1px #D3D8E1;
            font-size: 14px;
            color: #24272B;
            letter-spacing: 0.5px;
            .btns{
                position:absolute;
                right:40px;
                .el-button{
                    margin-left:40px;
                }
            }
        }
        .ticket-price{
            font-size: 12px;
            color: #120000;
        }
    }
</style>
<style lang="less">
    .vote{
        .el-input__inner{
            height:100%;
        }
    }
</style>


