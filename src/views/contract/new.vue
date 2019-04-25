<template>
    <div class="contract-new format-style">
        <div class="card content">
            <el-form :model="newContract" :rules="rules" ref="newContract" label-position="top" :placeholder="$t('contracts.fromHint')">
                <el-form-item :label="$t('contracts.from')">
                    <el-select v-model="fromW.address" @change="selWallet()" :style="{pointerEvents:fromW.address?'auto':'none'}" :placeholder="$t('contracts.fromHint')">
                        <el-option
                                v-for="item in wallets"
                                :key="item.address"
                                :label="item.account+'--'+item.balance+' Energon'"
                                :value="item.address">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('contracts.watchContract.contName')" prop="name">
                    <el-input v-model.trim="newContract.name" :placeholder="$t('contracts.watchContract.nameHint')">
                    </el-input>
                </el-form-item>
                <el-form-item :label="$t('contracts.contByte')">
                    <el-upload
                            :class="[contByteEmpty?'empty':'','upload-bin']"
                            drag
                            action="https://jsonplaceholder.typicode.com/posts/"
                            accept= ".wasm"
                            :on-remove="removeUpload"
                            :on-change="getBin"
                            :auto-upload="false"
                            :show-file-list="true"
                            ref="uploadBg">
                        <i class="icon-upload" ref="uploadbin"></i>
                        <!-- 去掉拖拽提示 -->
                        <div v-if="uploaded" class="el-upload__text"><em>{{$t("contracts.import")}} .wasm {{$t("contracts.file")}}</em></div>
                    </el-upload>
                    <el-input v-if='false' v-model.trim="newContract.bin" type="textarea"></el-input>
                    <p v-if='contByteEmpty' class="contByte el-form-item__error">{{$t('contracts.contByteEmpty')}}</p>
                </el-form-item>
                <el-form-item :label="$t('contracts.contABI')" prop="abi" :class="[lang=='en'?'en':'cn','abi-item']">
                    <el-upload
                            class="import2"
                            action="https://jsonplaceholder.typicode.com/posts/"
                            accept= ".json"
                            :on-change="getAbi"
                            :auto-upload="true"
                            :show-file-list='false'>
                        <div class="import2-icon-text">{{$t("contracts.import")}}.abi {{$t("contracts.file")}}</div>
                    </el-upload>
                    <el-input class="abiInput"
                            v-model.trim="newContract.abi"
                            type="textarea" :rows="5"
                            :placeholder="$t('contracts.contABIHint')"
                            :autosize="{minRows: 5,maxRows:6}"
                            resize="none">
                    </el-input>
                </el-form-item>
            </el-form>
            <p class="deploy-btn">
                <el-button type="primary" @click="confirm" :class="[lang=='en'?'':'letterSpace']" :disabled="!newContract.abi || !newContract.bin || !newContract.name">{{creating?$t("contracts.deploying"):$t("contracts.deploy")}}</el-button>
            </p>
        </div>
        <div class="modal confirm" v-if="showConfirm">
            <div class="modal-main">
                <div class="modal-title">
                    {{$t("contracts.createCont.creatCont")}}
                    <span class="modal-close" @click="showConfirm=false"></span>
                </div>
                <div class="modal-content">
                    <div class="confirm-content">
                        <p>{{$t('contracts.createCont.from')}}
                            <span class="txt">
                                <i :class="['trade-wallet-icon',keyObj.icon]">{{keyObj.account.slice(0,1).toUpperCase()}}</i>
                                {{fromW.account}}
                            </span>
                        </p>
                        <p>{{$t("wallet.fee")}}<span class="txt"><span class="EnergonCount">{{sendTranscation.gas}}</span>&nbsp;Energon</span></p>
                    </div>
                    <p class="inputb">
                        <el-input :placeholder="$t('wallet.input')+fromW.account+$t('wallet.walletPsw')" type="password" v-model.trim="newContract.psw"></el-input>
                    </p>
                </div>
                <div class="modal-btn">
                    <el-button @click="showConfirm=false" :disabled="creating">{{$t("form.cancel")}}</el-button>
                    <el-button @click="send" type="primary" :disabled="!newContract.psw" :loading="creating">{{creating?$t("form.submiting"):$t("form.submit")}}</el-button>
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
                    value:0,
                    bin:'',
                    abi:'',
                    psw:''
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
                gas: 250000000,
                gasPrice: 0,
                // gas:null,
                calcContract: '',
                uploaded: true,
                upList:[],
                abiList:[],
                obj:{},
                creating:false,
                contByteEmpty:false,
                address:'',
                contractNameList:[],
                keyObj:{}
            }
        },
        computed: {
            ...mapGetters(['network', 'WalletListGetter','curWallet','chainName','lang','contractListGetter']),
             rules(){
                return{
                    name: [
                            {required: true, message: this.$t('contracts.contNameEmpty'), trigger: 'blur'},
                            {validator: this.checkName, trigger: 'blur,change'}
                        ],
                    abi: {required: true, message: this.$t('contracts.contABIEmpty'), trigger: 'blur'},
                    bin: [
                            {required: true, message: this.$t('contracts.contByteEmpty'), trigger: 'blur'},
                        ],
                }
            }

        },
        created(){
            this.contractListAction().then(()=>{
                if(this.contractListGetter.length==0){
                    this.contractNameList=[];
                }else{
                    this.contractNameList = this.contractListGetter.map((item)=>{
                        return item.name
                    });
                }
                this.init();
            });
        },
        mounted(){
            this.$refs.uploadBg.$el.addEventListener('click',()=>{
                this.$nextTick(()=>{
                    setTimeout(()=>{
                        if(!this.newContract.bin){
                            this.contByteEmpty = true;
                        }else{
                            this.contByteEmpty = false;
                        }
                    },1000);
                });
            })
        },
        watch:{
            'wallets':function(val){
                if(this.wallets.length>0){
                    let wallet = this.wallets[0];
                    this.fromW.account = wallet.account;
                    this.fromW.address = wallet.address;
                    this.keyObj = this.wallets[0];
                    contractService.web3.eth.getBalance(this.fromW.address,(err,data)=>{
                        this.balance =  contractService.web3.fromWei(data.toString(10), 'ether');
                        // this.balance = (Math.floor(Number(balance) * 100) / 100).toFixed(2);
                    })
                }
            },
            'bin':function(val){
                if(val){
                    this.contByteEmpty = false;
                }
            }
        },
        methods: {
            // ...mapActions([]),
            ...mapActions(['contractListAction','updateContractInfo','getGasOptions','saveTractRecord','getBalOrd','getOrdByAddress','saveContractHash']),
            init(){
                let _this = this;
                this.wallets=[];
                this.getBalOrd().then((data)=>{
                        data.forEach((item)=>{
                            item.account = item.account.length>16?(item.account.slice(0,16)+'...'):item.account;
                            _this.wallets.push(item);
                            _this.wallets.sort((a,b)=>{
                                return a['createTime'] - b['createTime'];
                            });
                        })
                    }
                )
            },
            add(arg1,arg2){
                return mathService.add(arg1,arg2);
            },
            selWallet(){
                let fromW = this.fromW;
                let arr = this.wallets.filter((item)=>{
                    return item.address==fromW.address;
                });
                this.fromW.account = arr.length>0?arr[0].account:'';
                this.keyObj = arr.length>0?arr[0]:{};
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
                        console.log('abi的值为------>',this.checkAbi(this.newContract.abi))
                        console.log(/\[|\]/g.test(this.newContract.abi))
                        if(!this.checkAbi(this.newContract.abi) || !/\[|\]/g.test(this.newContract.abi)){
                            this.$message.warning(this.$t('contracts.contABIinvalid'));
                        }else if(this.abiList.length>0 && !this.abiList[0].hasOwnProperty('inputs') && /\[|\]/g.test(this.newContract.abi)){
                            this.$message.warning(this.$t('contracts.contABIinvalid'));
                            return;
                        }else if(this.newContract.bin == ''){
                            this.$message.warning(this.$t('contracts.contByteEmpty'));
                        }else{
                            contractService.web3.eth.getGasPrice((err,gasPrice)=>{
                                console.log('获取gasPrice--->',err,gasPrice);
                                this.sendTranscation.gas = contractService.web3.fromWei(gasPrice,"ether")*this.gas;
                                this.showConfirm = true;
                                this.newContract.psw='';
                            });
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
            checkName(rule, value, callback){
                if (value === '') {
                    callback(new Error(this.$t('contracts.contNameEmpty')));
                } else if (this.contractNameList.indexOf(value)!==-1){
                    callback(new Error(this.$t('contracts.contNameRepeat')));
                } else {
                    callback();
                }
            },
            getBin(file,fileList){
                this.newContract.bin = fs.readFileSync(file.raw.path);   // 使用readFileSync转换为buffer格式
                this.$refs.uploadbin.style.background="url("+require('./images/icon_imported_file.svg')+") no-repeat center center";
                this.$refs.uploadBg.$children[0].$children[0].$el.style.background="#ECEFF6";
                this.uploaded = false;

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
                this.$refs.uploadBg.$children[0].$children[0].$el.style.background="#FFFFFF";
                console.log(fileList)
            },
            getAbi(file){
                fsObj.ReadFile(file.raw.path,'',(err, Abidata)=>{
                    this.newContract.abi = Abidata
                });
                console.log('get abi')
            },
            send(){
                let _this = this;
                this.getOrdByAddress(this.fromW.address).then((obj)=>{
                    let ord = JSON.parse(JSON.stringify(obj));
                    // console.log(ord)
                    let transParam = {
                        name:"Cname"+new Date().getTime(),
                        abi:this.newContract.abi,
                        from:this.fromW.address,
                        // value: contractService.web3.toWei(this.newContract.value, "ether"),
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
                        contractService.platONDeploy(JSON.parse(this.newContract.abi),this.newContract.bin,transParam.from,priKey,parseInt(_this.gas*1.1),_this.gasPrice*10).then(deployResult=>{
                            console.log(deployResult,'platONDeploy开始')
                            _this.saveContract(deployResult).then(()=>{
                                let trxobj={
                                    tradeTime:new Date().getTime(),
                                    hash:deployResult.hash?deployResult.hash:'txn_hash',
                                    value:_this.newContract.value,
                                    gasPrice:_this.gasPrice,
                                    input:'',
                                    fromAccount:this.fromW.account,
                                    from:this.fromW.address,
                                    type:'contractCreate',
                                };

                                this.saveTractRecord(trxobj).then(()=>{
                                    _this.obj = {};
                                    _this.$message.success(this.$t('trade.transactionSent'));
                                    setTimeout(()=>{
                                        _this.showConfirm = false;
                                        _this.creating = false;
                                        _this.$router.push('/contract')
                                    },3000);
                                })
                                console.log(deployResult,'---deployResult')
                            });
                        }).catch((err)=>{
                            this.creating = false;
                            if(err.toString().indexOf('insufficient funds for gas * price + value')!==-1){
                                window.vueVm.$message.warning(window.vueVm.$i18n.t('wallet.cannotTrans2'));
                            }else{
                                this.$message.error(this.$t('contracts.deployFail'));
                            }
                        })
                    });
                })
            },
            saveContract(result){
                return new Promise((resolve, reject)=>{
                    // let cate=null,path;

                    let contObj = {
                        name:this.newContract.name,
                        hash:result.hash,
                        balance:'0.00',
                        abi:this.newContract.abi,
                        icon:'contract-icon'+Math.floor((Math.random()*4)+1)
                    };
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
            }
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
        position: relative;
        padding:20px;
        height:100%;
    }
    .send-slider{
        display:block;
        width:445px;
    }
    .deploy-btn{
        margin-top:20px;
    }
    .import2{
        position: absolute;
        top: -33px;
        left: 596px;
        width: 80px;
        height: 35px;
    }
    .icon-upload{
        display: inline-block;
        width: 30px;
        height: 30px;
        margin: 3px 5px 0 8px;
        background:url("./images/icon_import1.svg") no-repeat center;
        z-index:999;
    }
    .import2-icon-text{
        width: 123px;
        height: 35px;
        background:url("./images/icon_import2.svg") no-repeat 4px;
        font-family: "Chinese Quote",-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Helvetica Neue",Helvetica,Arial,sans-serif;
        font-size: 12px;
        color: #0077FF;
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
            padding:12px 0;
        .confirm-content{
            padding:14px 10px;
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
        padding: 0 12px;
        margin:30px 10px 20px;
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
            padding:0 20px;
            width:auto;
            min-width:79px;
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
    .EnergonCount{
        font-weight: bold;
    }
    .append{
        width: 52px;
    }
    .el-upload__text em {
        color: #9EABBE;
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
        .el-upload-dragger .el-upload__text{
            font-size:12px;
        }
        .el-upload-list__item{
            font-size:12px;
        }
        .el-form-item__label{
            font-weight: 600;
        }
        .el-upload-list__item-name [class^=el-icon]{
            visibility: hidden;
        }
        .el-upload-list__item:first-child{
            margin-top:14px;
        }
        .abi-item{
            .el-form-item__error{
                padding-left: 611px;
                position: relative;
                left: 0;
                top: 0;
                &:before{
                    left:679px;
                    top:-21px;
                 }
            }
            &.en .el-form-item__error{
                 padding-left: 550px;
             }
        }
        .upload-bin.empty .el-upload-dragger{
            border-color:#ff4949
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
        border: 1px solid #D3D8E1;
        // justify-content: center;
    }
    .el-input__inner{
        height: 40px;
    }
    .el-upload-list{
        position: absolute;
        top: -5px;
        left: 18px;
        text-align: center;
    }
    .abiInput{
        resize: none;
    }
</style>
