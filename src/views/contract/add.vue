<template>
    <div class="contract-add format-style">
        <div class="card content">
            <el-form :model="newContract" ref="newContract" :rules="rules" label-position="top">
                <el-form-item :label="$t('contracts.watchContract.contName')" prop="name">
                    <el-input v-model.trim="newContract.name" :placeholder="$t('contracts.watchContract.nameHint')"></el-input>
                </el-form-item>
                <el-form-item :label="$t('contracts.watchContract.contAddress')" prop="address">
                    <el-input v-model.trim="newContract.address" :placeholder="$t('contracts.watchContract.addressHint')"></el-input>
                </el-form-item>
                <el-form-item :label="$t('contracts.watchContract.contABI')" prop="abi" :class="[lang=='en'?'en':'cn','abi-item']">
                    <el-upload
                            class="import2"
                            action="https://jsonplaceholder.typicode.com/posts/"
                            accept= ".json"
                            :on-change="getAbi"
                            :auto-upload="true"
                            :show-file-list='false'>
                        <div class="import2-icon-text">{{$t("contracts.import")}}.abi {{$t("contracts.file")}}</div>
                    </el-upload>
                    <el-input v-model.trim="newContract.abi" type="textarea" :rows="5"  :autosize="{minRows: 5,maxRows:16}"
                              resize="none" :placeholder="$t('contracts.watchContract.contABIHint')"></el-input>
                </el-form-item>
            </el-form>
            <p class="btn-box">
                <el-button :class="[lang=='en'?'':'letterSpace','addBtn']" type="primary" @click="add()" :loading="submitting" :disabled="!newContract.name || !newContract.address ||!newContract.abi">{{$t("contracts.watchContract.add")}}</el-button>
                <el-button :class="[lang=='en'?'':'letterSpace']" @click="goBack" :disabled="submitting">{{$t("form.cancel")}}</el-button>
            </p>
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex'
    import Settings from '@/services/setting';
    import contractService from '@/services/contract-servies';
    import fsObj from '@/services/fs-service'
    var fs = require("fs");
    export default {
        name: 'contractAdd',
        data () {
            return {
                newContract:{
                    name:'',
                    address:'',
                    abi:''
                },
                abiList:[],
                contractNameList:[],
                contractAddrList:[],
                submitting:false
            }
        },
        computed: {
            ...mapGetters(['network','contractListGetter','lang']),
            rules(){
                return{
                    name:[
                        {required: true, message: this.$t('contracts.contNameEmpty'), trigger: 'blur,change'},
                        {validator: this.checkName, trigger: 'blur,change'}
                    ],
                    address:[
                        {required: true, message: this.$t('contracts.watchContract.contAddressEmp'), trigger: 'blur,change'},
                        {validator: this.checkAddress, trigger: 'blur,change'}
                    ],
                    abi: {required: true, message: this.$t('contracts.contABIEmpty'), trigger: 'blur'},
                }
            }
        },
        mounted(){
            this.contractListAction().then(()=>{
                if(this.contractListGetter.length==0){
                    this.contractNameList=[];
                    this.contractAddrList=[];
                }else{
                    this.contractNameList = this.contractListGetter.map((item)=>{
                        return item.name
                    });
                    this.contractAddrList = this.contractListGetter.map((item)=>{
                        return item.address
                    });
                }
            });
        },
        methods: {
            ...mapActions(['updateContractInfo','contractListAction']),
            checkAddress(rule, value, callback){
                if (value === '') {
                    callback(new Error(this.$t('contracts.watchContract.contAddressEmp')));
                } else if (!/(0x)[0-9a-fA-F]{40}$/g.test(value)){
                    callback(new Error(this.$t('contracts.watchContract.contAddressError')));
                } else {
                    callback();
                }
            },
            checkName(rule, value, callback){
                if (value === '') {
                    callback(new Error(this.$t('contracts.contNameEmpty')));
                } else if (this.contractNameList.indexOf(value)!==-1){
                    callback(new Error(this.$t('contracts.contNameRepeat')));
                } else {
                    callback();
                }
            },
            goBack(){
                this.$router.push('/contract')
            },
            add(){
                if(this.contractAddrList.indexOf(this.newContract.address) == -1){
                    this.$refs['newContract'].validate((valid)=>{
                        if(valid){
                            let MyContract,contract;
                            if(!isNaN(this.checkAbi(this.newContract.abi))){
                                this.$message.error(this.$t('contracts.contABIinvalid'));
                                return
                            } else if(this.abiList.length>0 && !this.abiList[0].hasOwnProperty('inputs')){
                                this.$message.error(this.$t('contracts.contABIinvalid'));
                                return;
                            }else{
                                try{
                                    MyContract = contractService.web3.eth.contract(JSON.parse(this.newContract.abi));
                                    contractService.web3.eth.getCode(this.newContract.address,(err,data)=>{
                                        if(err || data=='0x'){
                                            this.$message.error(this.$t('contracts.watchContract.contAddressInvalid'));
                                        }else{
                                            this.submitting = true;
                                            contract = MyContract.at(this.newContract.address);
                                            console.warn('contract--->',contract);
                                            let contractObj = {
                                                name:this.newContract.name,
                                                address:contract.address,
                                                abi:this.newContract.abi,
                                                icon:'contract-icon'+Math.floor((Math.random()*4)+1)
                                            };
                                            this.updateContractInfo(contractObj).then(()=>{
                                                this.$message.success(this.$t('contracts.watchContract.addSuccess'));
                                                setTimeout(()=>{
                                                    this.submitting = false;
                                                    this.$router.push('/contract')
                                                },3000);
                                            }).catch((e)=>{
                                                console.log(e,'出错了')
                                            });
                                        }
                                    });
                                }catch(e){
                                    this.submitting = false;
                                    this.$message.error(this.$t('contracts.watchContract.contABIInvalid'));
                                    return;
                                }
                            }
                        }
                    });
                }else{
                    this.$message.warning(this.$t('contracts.watchContract.contAddressExist'));
                }
            },
            getAbi(file){
                fsObj.ReadFile(file.raw.path,'',(err, Abidata)=>{
                    this.newContract.abi = Abidata
                });
                console.log('get abi')
            },
            checkAbi(abi){
                try{
                    let arr = JSON.parse(abi);
                    this.abiList = arr
                    return arr
                }catch(e){
                    return false
                }
            }

        },
        filters:{

        },
    }
</script>

<style lang="less" scoped>
    .content{
        padding:14px;
    }
    .el-button+.el-button {
        margin-left: 40px;
    }
    .import2{
        position: absolute;
        top: -33px;
        left: 596px;
        width: 80px;
        height: 35px;
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
    .btn-box{
        margin-top:20px;
        padding-right:40px;
    }
</style>
<style lang="less">
    .content{
        padding:17px 15px;
        height:100%;
    }
    .contract-add{
        .el-form-item{
            margin-bottom:14px;
        }
        .el-input__inner{
            height:40px;
        }
        .el-form-item__label{
            padding:0;
            margin-bottom:10px;
            height:17px;
            font-size:12px;
            font-weight: 600;
        }
        .el-textarea{
            width:700px;
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
    }
</style>
