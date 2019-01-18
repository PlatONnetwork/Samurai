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
                <el-form-item :label="$t('contracts.watchContract.contABI')" prop="abi">
                    <el-upload
                            class="import2"
                            action="https://jsonplaceholder.typicode.com/posts/"
                            accept= ".json"
                            :on-change="getAbi"
                            :auto-upload="true"
                            :show-file-list='false'>
                        <div class="import2-icon-text">{{$t("contracts.import")}}.abi {{$t("contracts.file")}}</div>
                    </el-upload>
                    <el-input v-model.trim="newContract.abi" type="textarea" :rows="7"  :autosize="{minRows: 7,maxRows:16}"
                              resize="none" :placeholder="$t('contracts.watchContract.contABIHint')"></el-input>
                </el-form-item>
            </el-form>
            <p class="btn-box">
                <el-button class="cancel" @click="goBack">{{$t("form.cancel")}}</el-button>
                <el-button class="addBtn" type="primary" @click="add()">{{$t("contracts.watchContract.add")}}</el-button>
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
                addressList:[],
                abiList:[]
                // 将rules放在computed中，错误提示则可以随着语言进行切换
                // rules:{
                //     name:{required: true, message: this.$t('contracts.contNameEmpty'), trigger: 'blur,change'},
                //     address:[
                //         {required: true, message: this.$t('contracts.watchContract.contAddressEmp'), trigger: 'blur,change'},
                //         {validator: this.checkAddress, trigger: 'blur,change'}
                //      ],
                //     abi:{required: true, message: this.$t('contracts.watchContract.contABIEmp'), trigger: 'blur,change'}
                // },
            }
        },
        computed: {
            ...mapGetters(['network','contractListGetter']),
            rules(){
                return{
                    name:{required: true, message: this.$t('contracts.contNameEmpty'), trigger: 'blur,change'},
                    address:[
                        {required: true, message: this.$t('contracts.watchContract.contAddressEmp'), trigger: 'blur,change'},
                        {validator: this.checkAddress, trigger: 'blur,change'}
                    ],
                    abi:{required: true, message: this.$t('contracts.watchContract.contABIEmp'), trigger: 'blur,change'}
                }
            }
        },
        mounted(){

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
            goBack(){
                this.$router.push('/contract')
            },
            add(){
                this.contractListAction().then(()=>{
                    if(this.contractListGetter && this.contractListGetter.length>0){
                        this.addressList =  this.contractListGetter.map((item)=>{
                            return item.address
                        });
                    }else{
                        this.addressList=[]
                    }
                    if(this.addressList.indexOf(this.newContract.address) == -1){
                        this.$refs['newContract'].validate((valid)=>{
                            if(valid){
                                let MyContract,contract;
                                if(!isNaN(this.checkAbi(this.newContract.abi))){
                                    this.$message.error(this.$t('contracts.contABIinvalid'));
                                    return
                                }
                                // else if(!(this.abiList instanceof Array)){
                                //     this.$message.error(this.$t('contracts.contABIinvalid'));
                                //     return
                                // }
                                else if(this.abiList.length>0 && !this.abiList[0].hasOwnProperty('inputs')){
                                    this.$message.error(this.$t('contracts.contABIinvalid'));
                                    return;
                                }else{
                                    try{
                                        MyContract = contractService.web3.eth.contract(JSON.parse(this.newContract.abi));
                                        contractService.web3.eth.getCode(this.newContract.address,(err,data)=>{
                                            if(err || data=='0x'){
                                                this.$message.error(this.$t('contracts.watchContract.contAddressInvalid'));
                                            }else{
                                                contract = MyContract.at(this.newContract.address);
                                                console.warn('contract--->',contract);
                                                let contractObj = {
                                                    name:this.newContract.name,
                                                    address:contract.address,
                                                    abi:this.newContract.abi,
                                                    icon:'contract-icon'+Math.floor((Math.random()*5)+1)
                                                };
                                                this.updateContractInfo(contractObj).then(()=>{
                                                    this.$router.push('/contract')
                                                }).catch((e)=>{
                                                    console.log(e,'出错了')
                                                });
                                            }
                                        });
                                    }catch(e){
                                        this.$message.error(this.$t('contracts.watchContract.contABIInvalid'));
                                        return;
                                    }
                                }
                            }
                        });

                    }else{
                        this.$message.error(this.$t('contracts.watchContract.contAddressExist'));
                    }

                })

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
    .el-button+.el-button {
        margin-left: 40px;
    }
    // .cancel,.addBtn{
    //     font-weight: 900;
    // }
    .import2{
        position: absolute;
        top: -30px;
        // right: 18px;
        left: 596px;
        width: 80px;
        height: 35px;
    }
    .import2-icon-text{
        width: 123px;
        height: 35px;
        background:url("./images/icon_import2.svg") no-repeat 4px;
        font-family: PingFangHK-Regular;
        font-size: 12px;
        color: #18C2E9;
        letter-spacing: 0.43px;
    }
</style>
<style lang="less">
    .content{
        padding:20px;
        height:100%;
    }
    .btn-box{
        margin-top:30px;
        padding-right:40px;
        text-align: right;
    }
</style>
<style lang="less">
    .contract-add{
        .el-form-item{
            margin-bottom:14px;
        }
        .el-input__inner{
            height:40px;
        }
        .el-form-item__label{
            padding-bottom:10px;
            font-size:12px;
        }
        .el-textarea{
            width:700px;
        }
        .el-form-item__error{
            position:static;
            text-align: left;
        }
    }
</style>
