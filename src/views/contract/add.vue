<template>
    <div class="contract-add format-style">
        <div class="card content">
            <el-form :model="newContract" ref="newContract" :rules="rules" label-position="top">
                <el-form-item :label="$t('contracts.watchContract.contName')" prop="name">
                    <el-input v-model.trim="newContract.name"></el-input>
                </el-form-item>
                <el-form-item :label="$t('contracts.watchContract.contAddress')" prop="address">
                    <el-input v-model.trim="newContract.address"></el-input>
                </el-form-item>
                <el-form-item :label="$t('contracts.watchContract.contABI')" prop="abi">
                    <el-input v-model.trim="newContract.abi" type="textarea" :rows="7"></el-input>
                </el-form-item>
            </el-form>
            <p class="btn-box">
                <el-button class="cancel" @click="goBack">{{$t("form.cancel")}}</el-button>
                <el-button type="primary" @click="add()">{{$t("contracts.watchContract.add")}}</el-button>
            </p>
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex'
    import Settings from '@/services/setting';
    import contractService from '@/services/contract-servies';
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
                addressList:[]
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
            ...mapActions(['updateContractInfo']),
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
                this.contractListGetter.forEach((item,index) => {
                    this.addressList.push(item.address)
                });
                if(this.addressList.indexOf(this.newContract.address) == -1){
                    this.$refs['newContract'].validate((valid)=>{
                        if(valid){
                            let MyContract,contract;
                            try{
                                MyContract = contractService.web3.eth.contract(JSON.parse(this.newContract.abi));
                            }catch(e){
                                this.$message.error(this.$t('contracts.watchContract.contABIInvalid'));
                                return;
                            }
                            contractService.web3.eth.getCode(this.newContract.address,(err,data)=>{
                                if(err || data=='0x'){
                                    this.$message.error(this.$t('contracts.watchContract.contAddressInvalid'));
                                }else{
                                    contract = MyContract.at(this.newContract.address);
                                    console.warn('contract--->',contract);
                                    let contractObj = {
                                        name:this.newContract.name,
                                        address:contract.address,
                                        abi:this.newContract.abi
                                    };
                                    this.updateContractInfo(contractObj).then(()=>{
                                        this.$router.push('/contract')
                                    }).catch((e)=>{
                                        console.log(e,'出错了')
                                    });
                                }
                            });
                        }
                    });
                }else{
                    this.$message.error(this.$t('contracts.watchContract.contAddressExist'));
                }
                this.addressList = []
            }

        },
        filters:{

        },
    }
</script>

<style lang="less" scoped>

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
