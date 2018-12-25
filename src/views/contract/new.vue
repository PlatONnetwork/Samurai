<template>
    <div class="contract-new format-style">
        <div class="card content">
            <el-form :model="newContract" :rules="rules" ref="newContract" label-position="top" :placeholder="$t('contracts.fromHint')">
                <el-form-item :label="$t('contracts.from')" prop="fromS">
                    <el-select v-model="fromW.address" @change="selWallet()" :disabled="fromW.address?false:true" :placeholder="$t('contracts.fromHint')">
                        <el-option
                                v-for="item in wallets"
                                :key="item.address"
                                :label="item.account+'--'+item.balance+'Energon'"
                                :value="item.address">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('contracts.amount')" prop="value">
                    <el-input v-model.trim="newContract.value" type="number" :placeholder="$t('contracts.amountHint')">
                        <el-button slot="append" @click="sendAll">All</el-button>
                    </el-input>
                    <span>{{$t("contracts.wantSend")}} {{newContract.value || 0}} Energon</span>
                </el-form-item>
                <el-form-item :label="$t('contracts.watchContract.contName')" prop="name">
                    <el-input v-model.trim="newContract.name" :placeholder="$t('contracts.watchContract.nameHint')">
                    </el-input>
                </el-form-item>
                <el-form-item :label="$t('contracts.contByte')">
                    <el-upload
                            class="upload-bin"
                            drag
                            action="https://jsonplaceholder.typicode.com/posts/"
                            accept= "wasm"
                            :on-remove="removeUpload"
                            :on-change="getBin"
                            :auto-upload="false"
                            :show-file-list="true">
                        <i class="icon-upload" ref="uploadbin"></i>
                        <!-- 去掉拖拽提示 -->
                        <div v-if="uploaded" class="el-upload__text"><em>{{$t("contracts.import")}}</em></div>
                        <!-- <div v-if="uploaded" class="el-upload__text"><em>{{$t("contracts.import")}}</em>\{{$t("contracts.drag")}}</div> -->
                    </el-upload>
                    <el-input v-if='false' v-model.trim="newContract.bin" type="textarea"></el-input>
                    <!-- <input type="file" @change="getBin"> -->
                    <p v-if='contByteEmpty' class="contByte">{{$t('contracts.contByteEmpty')}}</p>
                </el-form-item>
                <el-form-item :label="$t('contracts.contABI')" prop="abi">
                    <el-upload
                            class="import2"
                            action="https://jsonplaceholder.typicode.com/posts/"
                            accept= "json"
                            :on-change="getAbi"
                            :auto-upload="true"
                            :show-file-list='false'>
                        <div class="import2-icon-text">{{$t("contracts.import")}}</div>
                    </el-upload>
                    <el-input v-model.trim="newContract.abi" type="textarea" :rows="4" :placeholder="$t('contracts.contABIHint')" @blur="onchangeGetGas()"></el-input>
                </el-form-item>
                <el-form-item :label="$t('contracts.selectFee')">
                    <span class="send-slider">
                        <fee-slider @sel="selFee"></fee-slider>
                    </span>
                </el-form-item>
            </el-form>
            <p class="total">
                <span>{{$t("contracts.total")}} ：{{add(newContract.value-0,sendTranscation.gas-0)}}Energon</span>
                <el-button type="primary" @click="confirm" :disabled="!newContract.value">{{$t("contracts.deploy")}}</el-button>
            </p>
        </div>
        <div class="modal confirm" v-if="showConfirm">
            <div class="modal-main">
                <div class="modal-title">{{$t("contracts.createCont.creatCont")}}</div>
                <div class="modal-content">
                    <div class="confirm-content">
                        <p>{{$t("wallet.amount")}}<span class="txt">{{newContract.value}}Energon</span></p>
                        <p>From<span class="txt">{{fromW.address}}</span></p>
                        <p>To<span class="txt">{{newContract.name}}</span></p>
                        <p>{{$t("wallet.fee")}}<span class="txt">{{sendTranscation.gas}}Energon</span></p>
                    </div>
                    <!-- 更多功能 -->
                    <!-- <p @click="confirmShowMore=!confirmShowMore" class="more">{{$t("wallet.advance")}} <i class="el-icon-arrow-down"></i></p>
                    <p v-if="confirmShowMore">{{newContract.input}}</p> -->
                    <p class="inputb">
                        <el-input :placeholder="$t('wallet.input')+fromW.account+$t('wallet.walletPsw')" type="password" v-model.trim="newContract.psw"></el-input>
                    </p>
                </div>
                <div class="modal-btn">
                    <el-button class="cancel" @click="showConfirm=false">{{$t("form.cancel")}}</el-button>
                    <el-button @click="send" type="primary" :disabled="creating">{{$t("form.submit")}}</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex'
    import contractService from '@/services/contract-servies';
    import keyManager from '@/services/key-manager';
    import mathService from '@/services/math';
    import feeSlider from '@/components/feeSlider';
    import fsObj from '@/services/fs-service'
    import fs from 'fs';
    import { ipcRenderer } from 'electron';
    export default {
        name: 'contractNew',
        data () {
            return {
                newContract:{
                    name:'',
                    fromS:'',
                    value:'',
                    bin:'',
                    abi:'',
                },
                // gas:0.01,
                wallets:[],
                fromW:{
                    address:'',
                    account:''
                },
                sendTranscation: {
                    gas: 0.01,
                },
                showConfirm:false,
                confirmShowMore:false,
                balance:0,
                gas: "0.01",
                gasPrice: 0,
                // gas:null,
                calcContract: '',
                uploaded: true,
                upList:[],
                abiList:[],
                obj:{},
                creating:false,
                contByteEmpty:false
            }
        },
        computed: {
            ...mapGetters(['network', 'WalletListGetter','curWallet','chainName']),
             rules(){
                return{
                    name:
                        [{required: true, message: this.$t('contracts.contNameEmpty'), trigger: 'blur'},],
                    bin:
                        [{validator: this.checkBin, trigger: 'blur,change'}],
                    abi:
                        [{required: true, message: this.$t('contracts.contABIEmpty'), trigger: 'blur,change'},]
                }
            }

        },
        created(){
            this.init();
        },
        mounted(){

        },
        watch:{
            'wallets':function(val){
                if(this.wallets.length>0){
                    let wallet = this.wallets[0];
                    this.fromW.account = wallet.account;
                    this.fromW.address = wallet.address;
                    contractService.web3.eth.getBalance(this.fromW.address,(err,data)=>{
                        this.balance =  contractService.web3.fromWei(data.toString(10), 'ether');
                        // this.balance = (Math.floor(Number(balance) * 100) / 100).toFixed(2);
                    })
                }
            }
        },
        methods: {
            // ...mapActions([]),
            ...mapActions(['contractListAction','updateContractInfo','getGasOptions','saveTractRecord','getBalOrd','getOrdByAddress']),
            init(){
                let _this = this;
                this.wallets=[];
                this.getBalOrd().then((data)=>{
                        data.forEach((item)=>{
                            contractService.web3.eth.getBalance(item.address,(err,data)=>{
                                let balance = contractService.web3.fromWei(data.toString(10), 'ether');
                                balance = (Math.floor(Number(balance) * 100) / 100).toFixed(2);
                                item.balance = balance;
                                console.log(balance)
                                if(balance>0){
                                    item.account = item.account.length>16?(item.account.slice(0,16)+'...'):item.account;
                                    _this.wallets.push(item);
                                    _this.wallets.sort((a,b)=>{
                                        return a['createTime'] - b['createTime'];
                                    });
                                }
                            })
                        })
                    }
                )
            },
            add(arg1,arg2){
                return mathService.add(arg1,arg2);
            },
            getGas(){
                return new Promise((resolve, reject)=>{
                    if(this.newContract.value && this.fromW.address && this.newContract.abi){
                        this.calcContract = contractService.web3.eth.contract(this.newContract.abi)
                        let platONData = this.calcContract.new.getPlatONData(this.newContract.bin)
                        contractService.web3.eth.estimateGas({
                            "from":this.fromW.address,
                            "data":platONData
                            // "value": contractService.web3.toHex(this.newContract.value)
                        },(err,data)=>{
                            if(err){
                                reject(err)
                            }
                            resolve(data);
                        })
                    }
                });
            },
            onchangeGetGas(){
                this.getGas().then((gas)=> {
                    this.gas = gas;
                    this.sendTranscation.gas = contractService.web3.fromWei(this.gasPrice,"ether")*gas;
                    // this.showConfirm = false;
                    // this.newContract.psw='';
                }).catch((e)=>{
                    throw e;
                })
            },
            selFee(fee){
                var BigNumber = require('bignumber.js');
                this.gasPrice=contractService.web3.toWei(fee,"ether");
                if(this.gas){
                    this.sendTranscation.gas = mathService.mul(this.gas,fee);
                }
                // this.onchangeGetGas()
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
                })
            },
            confirm(){
                if(this.newContract.bin == ''){
                    this.contByteEmpty = true
                }else{
                    this.contByteEmpty = false
                }
                this.$refs['newContract'].validate((valid)=>{
                    if (valid) {
                        if(!this.checkAbi(this.newContract.abi)){
                            this.$message.error(this.$t('contracts.contABIinvalid'));
                        }else if(this.abiList.length>0 && !this.abiList[0].hasOwnProperty('inputs')){
                            this.$message.error(this.$t('contracts.contABIinvalid'));
                            return;
                        }else if(this.newContract.bin == ''){
                            this.$message.error(this.$t('contracts.contByteEmpty'));
                        }else{
                            this.getGas().then((gas)=> {
                                this.gas = gas;
                                this.sendTranscation.gas = contractService.web3.fromWei(this.gasPrice,"ether")*gas;
                                this.showConfirm = true;
                                this.newContract.psw='';
                            }).catch((e)=>{
                                throw e;
                            })
                        }
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
                if(this.add(this.newContract.value-0,this.newContract.gas-0)-this.balance>0){
                    this.$message.error(this.$t('wallet.cannotTrans2'));
                    return;
                }
                // if(!/(0x)[0-9a-fA-F]{40}$/g.test(this.newContract.to)){
                //     this.$message.error('接收地址不正确');
                //     return;
                // }
                if(/-|e/g.test(this.newContract.value)){
                    this.$message.error(this.$t('contracts.inputFormat'));  //发送数量输入格式有误，请重新输入
                    return;
                }

            },
            checkAbi(abi){
                try{
                    let arr = JSON.parse(abi);
                    this.abiList = arr
                    return arr
                }catch(e){
                    return false
                }
            },
            // checkBin(rule, value, callback){
            //     // if (this.newContract.bin == '') {
            //     if (value == '') {
            //         callback(new Error(this.$t('contracts.contByteEmpty')));
            //     }else{
            //         callback();
            //     }
            // },
            getBin(file,fileList){
                // this.file = event.target.files;

                this.newContract.bin = fs.readFileSync(file.raw.path);   // 使用readFileSync转换为buffer格式
                this.$refs.uploadbin.style.background="url("+require('./images/icon_imported_file.svg')+") no-repeat center center"
                this.uploaded = false

                let index1=file.name.lastIndexOf(".");
                let postf=file.name.substring(index1,file.name.length);
                let isWasm = postf === '.wasm';
                this.contByteEmpty = false
                if(fileList.length>1){
                    fileList.pop()
                    this.$message.error(this.$t('wallet.notUploadAgain'))

                }else if(!isWasm){
                    fileList.length=0
                    this.removeUpload()
                    this.$message.error('wallet.wasmFormat');
                }
            },
            removeUpload(fileList){
                this.uploaded = true;
                this.newContract.bin = '';
                this.$refs.uploadbin.style.background="url("+require('./images/icon_import1.svg')+") no-repeat center center";
                console.log(fileList)
            },
            getAbi(file){
                fsObj.ReadFile(file.raw.path,'',(err, Abidata)=>{
                    this.newContract.abi = Abidata
                });
                console.log('get abi')
                this.onchangeGetGas();
            },
            send(){
                let _this = this;
                this.getOrdByAddress(this.fromW.address).then((obj)=>{
                    let ord = JSON.parse(JSON.stringify(obj));
                    console.log(ord)
                    let transParam = {
                        name:"Cname"+new Date().getTime(),
                        abi:this.newContract.abi,
                        from:this.fromW.address,
                        value: contractService.web3.toWei(this.newContract.value, "ether"),
                    };
                    // let gasLimit = mathService.div(contractService.web3.toWei(this.newContract.gas,'ether'));
                    keyManager.recover2(ord,this.newContract.psw,'buf',(err,data)=>{
                        console.warn(err,data);
                        if(err!==0){
                            this.$message.error(this.$t('form.wrongPsw'));
                            return;
                        }
                        let priKey = data;
                        this.creating = true;
                        // this.calcContract = contractService.web3.eth.contract(this.newContract.abi);
                        contractService.platONDeploy(JSON.parse(this.newContract.abi),this.newContract.bin,transParam.from,priKey,parseInt(_this.gas*1.1),_this.gasPrice).then(deployResult=>{
                            console.log(_this.gas,'platONDeploy开始')
                            console.log(Number(transParam.value),'发送数量')
                            if(deployResult.address){
                                contractService.sendTransaction(transParam.from,deployResult.address,Number(transParam.value),priKey,"input",_this.gas,_this.gasPrice,(errCode,result)=>{
                                    console.log('result txhash--->',errCode,!!errCode,result);
                                    if(!!errCode && errCode==2){
                                        return;
                                    }else if(!!errCode){
                                        _this.$message.error(this.$t('wallet.transactionFailed'));
                                        return;
                                    }
                                    _this.saveContract(deployResult).then(()=>{
                                        let trxobj={
                                            tradeTime:new Date().getTime(),
                                            hash:deployResult.hash?deployResult.hash:'txn_hash',
                                            value:_this.newContract.value,
                                            gasPrice:_this.gasPrice,
                                            input:'',
                                            fromAccount:this.fromW.account,
                                            from:this.fromW.address,
                                            to:deployResult.address,
                                            type:'contractCreate'
                                        };
                                        this.saveTractRecord(trxobj).then(()=>{
                                            _this.showConfirm = false;
                                            this.obj = {}
                                            this.creating = false;
                                            _this.$router.push('/contract')
                                        })
                                        console.log(deployResult,'---deployResult')
                                    });
                                })
                            }
                        }),err=>{
                            this.creating = false;
                            this.$message.error(this.$t('contracts.deployFail'));
                            console.log(err)
                        }
                    });
                })
            },
            saveContract(result){
                return new Promise((resolve, reject)=>{
                    // let cate=null,path;

                    let contObj = {
                        name:this.newContract.name,
                        address:result.address,
                        abi:this.newContract.abi
                    };
                    // if(transactionId){
                    //     Object.assign(tradeObj,{
                    //         transactionId:transactionId,
                    //         required:this.fromW.required,
                    //         admin:this.fromW.adminAddress
                    //     })
                    // }

                    console.log(contObj,"开始存储")
                    this.updateContractInfo(contObj).then(()=>{
                        resolve(contObj)
                    }).catch((e)=>{
                        console.log(e,'出错了')
                    });
                });
            },
            sendAll(){
                contractService.web3.eth.getBalance(this.fromW.address,(err,data)=>{
                    let balance=contractService.web3.fromWei(data.toString(10), 'ether');
                    this.newContract.value = (Math.floor(Number(balance) * 100) / 100).toFixed(2);
                });
            },
            // ondragstart(event){
            //     console.log(event)
            //     $event.preventDefault()
            //     ipcRenderer.send('ondragstart', 'E:/WorkingData/WalletClientPc021/wallet-client-pc/src/services/demo')
            // }
        },
        filters:{

        },
        components:{
            feeSlider
        }
    }
</script>

<style lang="less" scoped>
    .content{
        padding:20px;
        height:100%;
    }
    .send-slider{
        display:block;
        width:445px;
    }
    .total{
        position: absolute;
        bottom:15px;
        width:740px;
        height: 60px;
        line-height:60px;
        border-top:solid 1px #D3D8E1;
    .el-button{
        position:absolute;
        right:20px;
        top: 18px;
    }
    }
    .import2{
        position: absolute;
        top: -30px;
        // right: 18px;
        left: 637px;
        width: 80px;
        height: 35px;
    }
    .icon-upload{
        display: inline-block;
        width: 30px;
        height: 30px;
        margin: 2px 5px 0 50px;
        background:url("./images/icon_import1.svg") no-repeat center;
    }
    .import2-icon-text{
        width: 80px;
        height: 35px;
        background:url("./images/icon_import2.svg") no-repeat left;
        font-family: PingFangHK-Regular;
        font-size: 12px;
        color: #18C2E9;
        letter-spacing: 0.43px;
    }
    .el-upload__text{
        display: inline;
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
    .contByte{
        color: #ff4949;
        font-size: 12px;
        line-height: 1;
        padding-top: 4px;
    }
</style>
<style lang="less">
    .contract-new{
    .el-textarea{
        width:700px;
    }
    .el-form-item{
        margin-bottom:14px;
    }
    }
    .upload-bin,.el-upload-dragger,.el-upload{
        height: 40px;
    }
    .el-input-group__append{
        color:#fff;
        background: #9EABBE;
    }
    .el-upload-dragger{
        width:300px;
        display: flex;
        // justify-content: center;
    }
    .el-input__inner{
        height: 40px;
    }
    .el-upload-list{
        position: absolute;
        top: -5px;
        left: 83px;
        text-align: center;
    }
    .contract-new .el-form-item__error {
        position: static;
    }
    .el-textarea__inner{
        height: 52px;
    }
</style>
