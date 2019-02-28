<template>
    <div class="contract-list format-style">
        <div class="card content">
            <div class="contract-info">
                <div class="contract-icon" :class="contract.icon"></div>
                <div class="contract-detail-info">
                    <p class="contract-name" :title="(contract.name&&contract.name.length>36)?contract.name:''">{{contract.name | sliceName}}</p>
                    <p class="balance">
                        <span class="contract-name">{{balance}}</span> <span class="gray">Energon</span>
                        <refresh @refreshBalance="refreshValue" :parentAddress="contract.address"></refresh>
                    </p>
                    <p class="address">{{contract.address}}</p>
                </div>
                <ul class="wallet-operate">
                    <li class="copy"
                        @click="doCopy">
                        <span>{{$t('contracts.copy')}}</span>
                    </li>
                    <li class="abi"
                        @click="showABI">
                        <span>{{$t('contracts.interface')}}</span>
                    </li>
                </ul>
            </div>
            <div class="abi-info">
                <div class="lt">
                    <p class="title">{{$t('contracts.executeCont')}}</p>
                    <el-select :placeholder="$t('contracts.selectFunc')" v-model="fun" @change="funChange" class="marB14 marR30">
                        <el-option v-for="abi in abiArr" :key="abi.name" :value="abi.name" :label="abi.name"></el-option>
                    </el-select>
                    <div v-if="funBody" class="fun-body">
                        <el-form :model="funForm" ref="funForm" :rules="funRules" label-position="top">
                            <el-form-item v-for="input in inputs" :key="input.name" :label="input.name">
                                <el-input :placeholder="input.type" v-model.trim="input.value"></el-input>
                            </el-form-item>
                        </el-form>
                        <p class="title">{{$t("contracts.executeFrom")}}</p>
                        <el-select v-model="wallet">
                            <el-option v-for="ord in ordWalletList" :key="ord.address" :value="ord.address" :label="ord.account"></el-option>
                        </el-select>
                        <p class="title marT14">{{$t("contracts.executeType")}}</p>
                        <el-select v-model="tradeType">
                            <el-option v-for="type in tradeTypes" :key="type.code" :value="type.code" :label="type.label"></el-option>
                        </el-select>
                    </div>
                    <p class="btn-box">
                        <el-button v-if="funBody" @click="confirm" :class="[lang=='en'?'':'letterSpace']">{{$t("contracts.execute")}}</el-button>
                    </p>
                </div>
                <div class="rSide" v-if="abiInfo.length>0">
                    <i class="icon-close" @click="closeSide"></i>
                    <div class="right-contract-name">
                        <span class="contract-name" :title="(contract.name&&contract.name.length>36)?contract.name:''">{{contract.name | sliceName}} - </span>
                        <span>
                            <span class="contract-name">{{balance}}</span> <span class="contract-name">Energon</span>
                        </span>
                    </div>

                </div>
                <ul class="r-ul-info" v-for="item in abiInfo" :key="item.index">
                    <li class="rinfo">{{item}}</li>
                </ul>
                <!-- <div style="clear:both;"></div> -->
            </div>
        </div>

        <!--查看接口文件弹窗-->
        <div class="modal abi-modal" v-if="showABIModal">
            <div class="modal-main">
                <div class="modal-title">
                    {{$t("contracts.contractInterface")}}
                    <span class="modal-close" @click="handleCancel"></span>
                </div>
                <div class="modal-content f12">
                    <p class="abiView">{{contract.abi}}</p>
                    <!-- <textarea class="abiView" :value="contract.abi" readonly></textarea> -->
                </div>
                <div class="modal-btn">
                    <el-button type="primary" @click="copyContract" :class="[lang=='en'?'':'letterSpace']">{{$t('contracts.copyContract')}}</el-button>
                    <el-button type="primary" @click="handleCancel" :class="[lang=='en'?'':'letterSpace']">{{$t('form.sure')}}</el-button>
                </div>
            </div>
        </div>

        <!--复制地址警告-->
        <div class="modal" v-if="isTest">
            <div class="modal-main">
                <div class="modal-title">
                    {{$t('wallet.warning')}}
                    <span class="modal-close" @click="handleCancel"></span>
                </div>
                <div class="modal-content f12">
                    <p class="icon-danger"></p>
                    <p class="mb-10 danger">{{$t('wallet.warningContTxt')}}</p>
                </div>
                <div class="modal-btn">
                    <el-button @click="handleCancel" :class="[lang=='en'?'':'letterSpace']">{{$t('form.cancel')}}</el-button>
                    <el-button @click="copyConfirm"  :class="[lang=='en'?'':'letterSpace']" type="primary">{{$t('form.sure')}}</el-button>
                </div>
            </div>
        </div>

        <!--执行合约二次确认弹窗-->
        <div class="modal confirm" v-if="showFunModal">
            <div class="modal-main">
                <div class="modal-title">
                    {{$t('contracts.executeCont')}}-{{fun}}
                    <span class="modal-close" @click="showFunModal=false"></span>
                </div>
                <div class="modal-content f12">
                    <div class="confirm-content">
                        <p>{{$t("wallet.amount")}}<span class="txt"><span class="bold">0.00</span> Energon</span></p>
                        <p>From<span class="txt">{{keyObject.address}}</span></p>
                        <p>To<span class="txt">{{contract.address}}</span></p>
                        <p>{{$t("wallet.fee")}}<span class="txt"><span class="bold">{{gas}}</span> Energon</span></p>
                    </div>
                    <p class="inputb">
                        <el-input :placeholder="$t('wallet.input')+(keyObject.account)+' '+$t('wallet.walletPsw')" type="password" v-model.trim="psw"></el-input>
                    </p>
                </div>
                <div class="modal-btn">
                    <el-button class="cancel" @click="showFunModal=false">{{$t('form.cancel')}}</el-button>
                    <el-button type="primary" @click="exec">{{$t('form.sure')}}</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex'
    import keyManager from '@/services/key-manager';
    import contractService from '@/services/contract-servies';
    import refresh from '@/components/refresh/refresh';
    var fs = require("fs");
    export default {
        name: 'contractDetail',
        data () {
            return {
                contract:{},
                balance:0,
                isTest:false,
                showABIModal:false,
                showFunModal:false,
                fun:'',
                abiArr:[],
                funBody:false,
                funForm:{},
                inputs:{},
                funRules:{},
                wallet:{},
                ordWalletList:[],
                psw:'',
                gasPrice:null,
                keyObject:null,
                gas:0,
                constant:'',
                hash:'',
                params:[],
                abiInfo:[],
                tradeType:2
            }
        },
        computed: {
            ...mapGetters(['network','lang']),
            //2 普通交易  5 MPC交易  6 VC交易
            tradeTypes:function(){
                return [{
                    code:2,
                    label:this.$t('contracts.ordTx')
                },{
                    code:5,
                    label:this.$t('contracts.mpcTx')
                }]
            }
        },
        mounted(){
            this.contract = this.$route.query?this.$route.query:null;
            // if(this.contract.abi){
            //     const MyContract = contractService.web3.eth.contract(JSON.parse(this.contract.abi));
            //     const contract = MyContract.at(this.contract.address);
            //
            // }
            contractService.web3.eth.getGasPrice((err,gasPrice)=>{
                if(err){
                    throw err;
                }
                this.gasPrice = gasPrice;
            });
            this.abiArr = this.contract.abi?JSON.parse(this.contract.abi):[];
            this.getOrd().then((data)=>{
                this.getBalance(JSON.parse(JSON.stringify(data)));
            });
            // this.refresh();
            window.balanceInterval = setInterval(this.refresh,5*1000);
            contractService.web3.eth.getBalance(this.contract.address,(err,data)=>{
                this.balance=contractService.web3.fromWei(data.toString(10), 'ether');
            });
        },
        methods: {
            ...mapActions(['getOrd','saveTractRecord']),
            getBalance(list){
                let _this = this,arr=[];
                list.forEach((item,index)=>{
                    contractService.web3.eth.getBalance(item.address,(err,data)=>{
                        let balance=contractService.web3.fromWei(data.toString(10), 'ether');
                        if(balance!=0){
                            item.balance = (Math.floor(Number(balance) * 100) / 100).toFixed(2);
                            arr.push(item);
                        }
                    });
                });
                this.ordWalletList = arr;
            },
            goBack(){
                this.$router.push('/contract')
            },
            doCopy(){
                if(this.network.type=='main'){
                    this.copyConfirm();
                }else{
                    this.isTest = true;
                }
            },
            copyConfirm(){
                this.$copyText(this.contract.address).then((e) => {
                    this.$message.success(this.$t('wallet.copySuccess'));
                    this.isTest = false
                }, function (e) {
                    this.$message.error(this.$t('wallet.copyFail'));
                    this.isTest = false
                })
            },
            handleCancel(){
                this.showABIModal = false;
                this.isTest = false;
            },
            showABI(){
                this.showABIModal = true;
            },
            funChange(){
                if(this.fun && this.fun!==''){
                    this.funBody = true;
                    let arr = this.abiArr.filter((item)=>{
                        return item.name==this.fun
                    });
                    this.inputs = arr.length>0?arr[0].inputs:[];
                    this.constant = arr.length>0?arr[0].constant:'';
                    this.inputs.forEach((item)=>{
                        item.value='';
                    })
                }
            },
            checkForm(){
                let bool = true;
                this.inputs.forEach((item)=>{
                    if(!item.value || /^\s*$/g.test(item.value)){
                        bool=false;
                    }
                });
                return bool;
            },
            confirm(){
                if(this.checkForm()){
                    this.showFunModal = true;
                    this.psw = ''
                    let arr = this.ordWalletList.filter((item)=>{
                        return item.address==this.wallet
                    });
                    if(arr.length>0){
                        let keyObject = arr[0];
                        this.keyObject = keyObject;
                        this.getGas();
                    }
                }else{
                    this.$message.warning(this.$t('wallet.paramsEmpty'))
                }
                console.log(this.contract)
            },
            getGas(){
                if(this.keyObject && this.fun){
                    contractService.web3.eth.getGasPrice((error,result)=>{
                        if(error) throw error;
                        this.gas = contractService.web3.fromWei(2000000*result,"ether")
                    });

                    // const MyContract = contractService.web3.eth.contract(JSON.parse(this.contract.abi));
                    // const myContractInstance = MyContract.at(this.contract.address);
                    // let params=[];
                    // this.inputs.forEach((item)=>{
                    //     params.push(item.value)
                    // });
                    // const platOnData = myContractInstance[this.fun].getPlatONData(...params);
                    // contractService.web3.eth.estimateGas({
                    //     "to":this.contract.address,
                    //     // "from":this.keyObject.address,
                    //     "data":platOnData
                    // },(err,data)=>{
                    //     if(err){
                    //         throw err;
                    //     }
                    //     contractService.web3.eth.getGasPrice((error,result)=>{
                    //         if(error) throw err;
                    //         this.gas = contractService.web3.fromWei(data*result,"ether")
                    //     });
                    // })
                }

            },
            exec(){
                if(this.keyObject){
                    let keyObject = this.keyObject;
                    keyManager.recover2(keyObject, this.psw,'buf',(err, priKey) => {
                        if(err){
                            this.$message.error(this.$t('wallet.pswError'));
                            return;
                        }
                        this.params=[];
                        this.inputs.forEach((item)=>{
                            // 开头是int、uint则转为number
                            if(item.type.substr(0,3)=='int' || item.type.substr(0,4)=='uint'){
                                this.params.push(Number(item.value))
                            }else{
                                this.params.push(item.value)
                            }

                        });
                        console.log(' this.params----', this.params);
                        // abi中的constant参数为false时是交易类的，返回hash。为true时是call查询，返回结果
                        if(this.constant == 'false'){
                            contractService.platONSendTransaction(JSON.parse(this.contract.abi),this.contract.address,this.fun,JSON.stringify(this.params),keyObject.address,priKey,false,false,false,true,this.tradeType).then((data)=>{
                                console.log('hash-->result--->',data.hash);
                                this.hash = data.hash
                                let obj={
                                    tradeTime:new Date().getTime(),
                                    hash:data.hash?data.hash:'txn_hash',
                                    value:0,
                                    gasPrice:this.gasPrice,
                                    input:'',
                                    fromAccount:keyObject.account,
                                    from:keyObject.address,
                                    to:this.contract.address,
                                    type:'contractExecution'
                                };
                                this.abiInfo.push(obj.hash)
                                this.saveTractRecord(obj).then(()=>{
                                    this.showFunModal = false;
                                })
                            })
                        }else {
                            console.log('选择的函数为：',this.fun)
                            contractService.platONCall(JSON.parse(this.contract.abi),this.contract.address,this.fun,keyObject.address,this.params).then((data)=>{
                                this.abiInfo.push(data)
                                this.showFunModal = false;
                            })
                        }
                    });
                }

            },
            closeSide(){
                this.abiInfo = [];
            },
            refresh(){
                contractService.web3.eth.getBalance(this.contract.address,(err,data)=>{
                    this.balance=contractService.web3.fromWei(data.toString(10), 'ether');
                });
            },
            refreshValue(cost){
                this.balance=cost;
            },
            copyContract(){
                this.$copyText(this.contract.abi).then((e) => {
                    this.$message.success(this.$t('wallet.copySuccess'));
                    this.isTest = false
                }, function (e) {
                    this.$message.error(this.$t('wallet.copyFail'));
                    this.isTest = false
                })
            }
        },
        filters:{
            'sliceName':function(name){
                if(name && name.length>36){
                    return name.slice(0,36)+'...'
                }else{
                    return name;
                }
            }
        },
        watch:{
            ordWalletList:function(val){
                if(val.length>0){
                    this.wallet = val[0].address;
                }
            }
        },
        components:{
            refresh
        }
    }
</script>

<style lang="less" scoped>
    .content{
        padding:14px 0 14px 14px;
        height:100%;
        font-size: 12px;
        color: #525768;
    }
    .contract-info{
        padding-right:30px;
        padding-bottom:2px;
        display:flex;
        border-bottom:solid 1px #D3D8E1;
    }
    .contract-icon{
        margin-right:12px;
        width:40px;
        background: no-repeat center;
    }
    .contract-icon1{
        background-image: url('./images/Oval1.png');
    }
    .contract-icon2{
        background-image: url('./images/Oval2.png');
    }
    .contract-icon3{
        background-image: url('./images/Oval3.png');
    }
    .contract-icon4{
        background-image: url('./images/Oval4.png');
    }
    .contract-icon5{
        background-image: url('./images/Oval5.png');
    }
    .contract-name{
        font-size: 14px;
        color: #24272B;
        font-weight: 600;
    }
    .balance{
        padding-left:18.2px;
        background:url("./images/icon_wallet.svg") no-repeat left center;
    }
    .address{
        padding-left:18.2px;
        background:url("./images/icon_positioning.svg") no-repeat left center;
    }
    .gray{
        font-size: 10px;
        color: #22272C;
    }
    .contract-detail-info{
        flex-grow: 1;
        >p{
            margin-bottom:12px;
        }
    }
    .wallet-operate{
       padding-top:22px;
       width:123px;
        >li{
            padding-top:32px;
            display:inline-block;
            width:48px;
        }
        .copy{
            text-align: center;
            background: url("./images/icon_copy.svg") no-repeat top center;
        }
        .abi{
            margin-left:23px;
            background: url("./images/icon_contract .svg") no-repeat top center;
        }
    }
    .lt{
        width: 330px;
        float: left;
    }
    .abi-info{
        // display:flex;
        // justify-content: space-between;
        width: 770px;
        height:440px;
        padding:14px 0;
        overflow-y: auto;
        .title{
            margin-bottom:10px;
            font-size: 14px;
            color: #24272B;
            letter-spacing: 0.5px;
        }
        .fun-body{
            padding-right:30px;
            .el-form{
                max-height: 250px;
                overflow-y: auto;
                height: auto;
            }
        }
    }
    .marB14{
        margin-bottom:14px;
    }
    .marR30{
        margin-right:30px;
    }
    .marT14{
        margin-top:14px;
    }
    .btn-box{
        padding-right:30px;
        margin-top:30px;
        text-align: right;
    }
    .abi-modal{
        .modal-content{
            padding:20px;
            // width: 483px;
            height:150px;

            overflow-y: auto;
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
                    // width: 490px;
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
    .rSide{
        position: relative;
        width: 380px;
        height: 35px;
        // right: 30px;
        left: 362px;
        background:rgba(24,194,233,0.1);
        // background-color: #18C2E9;
        // opacity:0.1
    }
    .r-ul-info{
        // margin-top: 16px;
        width: 408px;
        float: right;
    }
    .rinfo{
        width: 380px;
        height: auto;
        padding: 0 5px 0 0;
        margin:0 23px 0 0;
        word-break: break-all;
        background:rgba(24,194,233,0.1);
    }
    .icon-close{
        position: absolute;
        top: -7px;
        right: -4px;
        display: block;
        width: 15px;
        height: 15px;
        background: url("./images/icon_delete.svg") no-repeat center center;
    }
    .right-contract-name{
        position: absolute;
        height: 33px;
        padding: 10px 0 0 14px
    }
    .rinfo{
        padding-left: 14px;
    }
    .abiView{
        background: #ECEFF6;
        font-size: 12px;
        color: #24272B;
        letter-spacing: 0.43px;
    }
    .bold{
        font-weight: bold;
    }
</style>

<style lang="less">
    .abi-info{
        .el-input__inner{
            height:40px;
        }
        .el-form-item{
            margin-bottom:14px;
        }
    }

</style>
