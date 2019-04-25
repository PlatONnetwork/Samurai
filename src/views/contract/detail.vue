<template>
    <div class="contract-list format-style contract-detail">
        <div class="card content">
            <div class="contract-info" v-if="!foldTop">
                <div class="contract-icon" :class="contract.icon">{{contract.name&&contract.name.slice(0,1).toUpperCase()}}</div>
                <div class="contract-detail-info">
                    <p @click="rename" :title="(contract.name&&contract.name.length>36)?contract.name:''">
                        <rename :oldName="contract.name" @changeName="changeName" :rule="false"></rename>
                    </p>
                    <p class="balance">
                        <span class="important-txt">{{balance}}</span> <span class="gray">Energon</span>
                    </p>
                    <p class="address">
                        {{contract.address}}
                        <el-tooltip class="item" effect="dark" offset="40" :content="clipboarMsg" placement="top">
                            <i class="icon-copy" @click="doCopy2"  @mouseleave="mouseLeave" ref="copy-i"></i>
                        </el-tooltip>
                    </p>
                </div>
                <ul class="wallet-operate">
                    <refresh @refreshBalance="refreshValue" :parentAddress="contract.address"></refresh>
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
            <div :class="[foldTop?'position-handle':'','abi-info']" @mousewheel="wheel($event)" ref="abi-info">
                <div :class="[foldTop?'padT':'','lt']">
                    <p class="main-title title">
                        <span>{{$t('contracts.executeCont')}}</span>
                    </p>
                    <p class="func">{{$t('contracts.function')}}</p>
                    <el-select :placeholder="$t('contracts.selectFunc')" v-model="fun" @change="funChange" class="marB14 marR30">
                        <el-option v-for="abi in abiArr" :key="abi.name" :value="abi.name" :label="abi.name"></el-option>
                    </el-select>
                    <div v-if="funBody" class="fun-body">
                        <el-form :model="funForm" ref="funForm" :rules="funRules" label-position="top">
                            <el-form-item v-for="input in inputs" :key="input.name" :label="input.name">
                                <el-input :placeholder="input.type" v-model.trim="input.value"></el-input>
                            </el-form-item>
                        </el-form>
                        <p class="title font12">{{$t("contracts.executeType")}}</p>
                        <el-select v-model="tradeType" :placeholder="$t('wallet.selectHint')">
                            <el-option v-for="type in tradeTypes" :key="type.code" :value="type.code" :label="type.label"></el-option>
                        </el-select>
                        <p class="title font12 marT14">{{$t("contracts.executeFrom")}}</p>
                        <el-select v-model="wallet" :placeholder="$t('wallet.selectHint')">
                            <el-option v-for="ord in ordWalletList" :key="ord.address" :value="ord.address" :label="(ord.account.length>16?ord.account.slice(0,16)+'...':ord.account)+'--'+ord.balance+' Energon'"></el-option>
                        </el-select>
                    </div>
                    <p class="btn-box">
                        <el-button type="primary" v-if="funBody" @click="confirm" :class="[lang=='en'?'':'letterSpace']">{{$t("contracts.execute")}}</el-button>
                    </p>
                </div>
                <div class="function-result">
                    <div class="rSide" v-if="abiInfo.length>0">
                        <i class="icon-close" @click="closeSide"></i>
                        <div class="right-contract-name">
                            <span class="important-txt" :title="(contract.name&&contract.name.length>36)?contract.name:''">{{contract.name | sliceName}} - </span>
                            <span>
                            <span class="important-txt">{{balance}}</span> <span class="important-txt">Energon</span>
                        </span>
                        </div>
                    </div>
                    <ul class="r-ul-info" v-for="item in abiInfo" :key="item.index">
                        <li class="rinfo">{{item}}</li>
                    </ul>
                </div>
                <!-- <div style="clear:both;"></div> -->
            </div>
        </div>

        <!--查看接口文件弹窗-->
        <div class="modal confirm abi-modal diff-modal" v-if="showABIModal">
            <div class="modal-main">
                <div class="modal-title">
                    {{$t("contracts.contractInterface")}}
                    <span class="modal-close" @click="handleCancel"></span>
                </div>
                <div class="modal-content f12">
                    <div class="abiView-box">
                        <p class="abiView">{{contract.abi}}</p>
                    </div>
                </div>
                <div class="modal-btn">
                    <el-button @click="copyContract" :class="[lang=='en'?'':'letterSpace']">{{$t('contracts.copyContract')}}</el-button>
                    <el-button type="primary" @click="handleCancel" :class="[lang=='en'?'':'letterSpace']">{{$t('form.sure')}}</el-button>
                </div>
            </div>
        </div>

        <!--复制地址警告-->
        <div class="modal confirm is-test diff-modal" v-if="isTest">
            <div class="modal-main">
                <div class="modal-title">
                    {{$t('wallet.warning')}}
                    <span class="modal-close" @click="handleCancel"></span>
                </div>
                <div class="modal-content f12">
                    <p class="icon-danger"></p>
                    <p class="mb-10">{{$t('wallet.warningContTxt')}}</p>
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
                        <p>
                            {{$t('contracts.executeFrom')}}
                            <span class="txt">
                                <span :class="[keyObject.icon,'trade-wallet-icon']">{{keyObject.account?keyObject.account.slice(0,1).toUpperCase():keyObject.address.slice(2,3)}}</span>
                                {{keyObject.account || keyObject.address}}
                            </span>
                        </p>
                        <p>{{$t("wallet.fee")}}<span class="txt"><span class="bold">{{gas}}</span> Energon</span></p>
                    </div>
                    <p class="inputb">
                        <el-input :placeholder="$t('wallet.input')+(keyObject.account)+$t('wallet.walletPsw')" type="password" v-model.trim="psw"></el-input>
                    </p>
                </div>
                <div class="modal-btn">
                    <el-button @click="showFunModal=false" :disabled="executing">{{$t('form.cancel')}}</el-button>
                    <el-button type="primary" @click="exec" :disabled="!psw" :loading="executing">{{executing?$t('form.submiting'):$t('form.submit')}}</el-button>
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
    import rename from '@/components/rename';
    var fs = require("fs");
    export default {
        name: 'contractDetail',
        data () {
            return {
                clipboarMsg:'Copy to clipboard',
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
                tradeType:2,
                foldTop:false,
                executing:false,
                contractNameList:[]
            }
        },
        computed: {
            ...mapGetters(['network','lang','contractListGetter']),
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
            this.contractListAction().then(()=>{
                this.init();
            });

        },
        methods: {
            ...mapActions(['getOrd','saveTractRecord','insertAddress','contractListAction']),
            init(){
                this.contract = this.$route.query?this.$route.query:null;
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
                window.balanceInterval = setInterval(this.refresh,5*1000);
                contractService.web3.eth.getBalance(this.contract.address,(err,data)=>{
                    this.balance=contractService.web3.fromWei(data.toString(10), 'ether');
                });
            },
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
            changeName(newName){
                let arr = this.contractListGetter.filter((item)=>{
                    return item.name==newName
                });
                if(arr.length>0 && arr[0].address!==this.contract.address){
                    this.$message.warning(this.$t('contracts.contNameRepeat'));
                }else{
                    this.insertAddress({
                        hash:this.contract.hash,
                        name:newName
                    }).then(()=>{
                        this.contract.name = newName;
                    })
                }
            },
            goBack(){
                this.$router.push('/contract')
            },
            doCopy2(){
                this.$copyText(this.contract.address).then(()=>{
                    this.clipboarMsg = 'Copied!';
                });
            },
            mouseLeave(){
                setTimeout(()=>{
                    this.clipboarMsg = 'Copy to clipboard';
                },1200)
            },
            wheel(e){
                console.log('wheel event',this.$refs['abi-info']);
                if(e.deltaY>0){
                    this.foldTop = true;
                }else{
                    this.foldTop = false;
                }
            },
            rename(){

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
                            this.executing = true;
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
                                    this.$message.success(this.$t('trade.transactionSent'));
                                    setTimeout(()=>{
                                        this.executing = false;
                                        this.showFunModal = false;
                                    },3000);
                                })
                            })
                        }else {
                            this.executing = true;
                            console.log('选择的函数为：',this.fun)
                            contractService.platONCall(JSON.parse(this.contract.abi),this.contract.address,this.fun,keyObject.address,this.params).then((data)=>{
                                this.abiInfo.push(data);
                                this.$message.success(this.$t('trade.transactionSent'));
                                setTimeout(()=>{
                                    this.executing = false;
                                    this.showFunModal = false;
                                },3000);
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
            refresh,
            rename
        }
    }
</script>

<style lang="less" scoped>
    .function-result{
        position: absolute;
        width: 380px;
        right: 10px;
    }
    .icon-danger{
        float: left;
        width: 20px;
        height: 20px;
        margin:0 10px 0 0;
        background-image: url("./images/10.icon_An error .svg");
        background-size: 20px 20px;
        background-repeat: no-repeat;
        background-position: center;
    }
    .is-test.modal .modal-main .modal-content{
        padding:20px 20px 74px;
        color: #24272B;
    }
    .content{
        padding:0;
        height:100%;
        font-size: 12px;
        color: #525768;
    }
    .padT{
        padding-top:40px;
    }
    .contract-info{
        margin:0 14px;
        padding:14px 0 2px;
        display:flex;
        border-bottom:solid 1px #D3D8E1;
    }
    .contract-icon{
        margin-top:21px;
        margin-right:12px;
        width:40px;
        min-width:40px;
    }
    .important-txt{
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
        background:url("../../../static/images/contract-addr.svg") no-repeat left center;
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
       display: flex;
       width:191px;
       min-width:191px;
        >li{
            padding-top:32px;
            display:inline-block;
        }
        .copy{
            margin-left:30px;
            text-align: center;
            background: url("./images/icon_copy.svg") no-repeat top center;
            background-size: 20px;
        }
        .abi{
            margin-left:23px;
            background: url("./images/icon_contract .svg") no-repeat top center;
            background-size: 20px;
        }
    }
    .lt{
        width: 337px;
        float: left;
    }
    .abi-info{
        position: relative;
        padding:0 14px 14px;
        width: 770px;
        /*height:440px;*/
        height:calc(~"100% - 110px");
        /*overflow-y: auto;*/
        .title{
            margin-bottom:10px;
            font-size: 14px;
            color: #24272B;
            letter-spacing: 0.5px;
            font-weight:600;
        }
        .main-title{
            margin-bottom:14px;
            /*width:100%;*/
            height:34px;
            line-height:43px;
            font-size: 12px;
            color: #0077FF;
            background-color:#fff;
            >span{
                padding:0 0 3px 20px;
                background: url("./images/57.icon_perform.svg") no-repeat left 0.9px;
                border-bottom:solid 2px #0077FF;
            }
        }
        .fun-body{
            padding-right:30px;
            .el-form{
                /*max-height: 250px;*/
                /*overflow-y: auto;*/
                height: auto;
            }
        }
    }
    .position-handle{
        height:calc(~"100% - 65px");
        .main-title{
            position:fixed;
            top:64px;
            z-index:999;
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
        margin:17px 0 7px;
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
                padding:12px 0;
                .confirm-content{
                    padding:14px 10px;
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
                    /*margin:10px 10px 0;*/
                    .el-input{
                        width:100%;
                    }
                }
            }
            .modal-btn{
                button{
                    padding:0 20px;
                    min-width:79px;
                    width:auto;
                    font-size:12px;
                }
            }
        }
    }
    .rSide{
        /*position: relative;*/
        margin-top:14px;
        width: 380px;
        height: 35px;
        /*left: 362px;*/
        background:rgba(24,194,233,0.1);
    }
    .r-ul-info{
        width: 380px;
        float: right;
    }
    .rinfo{
        width: 380px;
        height: auto;
        padding: 0 5px 10px 0;
        margin:0 23px 0 0;
        word-break: break-all;
        background:rgba(24,194,233,0.1);
    }
    .icon-close{
        position: absolute;
        top: 6px;
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
    .abiView-box{
        padding: 8px 3px 8px 0;
        height: 100%;
        background: #ECEFF6;
        overflow: auto;
    }
    .abiView{
        padding: 0 20px;
        font-size: 12px;
        color: #24272B;
        height: 100%;
        letter-spacing: 0.43px;
        overflow: auto;
    }
    .bold{
        font-weight: bold;
    }
    .func{
        margin-bottom:10px;
        color: #24272B;
        font-weight: 600;
    }
    .font12{
        font-size:12px!important;
    }
    .contract-detail{
        overflow-y: auto;
        background: #fff;
        &.format-style{
            .card{
                box-shadow:none;
            }
         }
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
    .contract-detail{
        .el-form-item__label{
            font-weight: 600;
        }
    }

</style>
