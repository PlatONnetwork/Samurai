<template>
    <div class="wallet-join format-style">
      <div class="card">
          <el-form :model="newWallet" :rules="rules" ref="newWallet" class="join-form">
              <el-form-item prop="account">
                  <el-input v-model.trim="newWallet.account" :placeholder="$t('wallet.sharedWalletName')"></el-input>
              </el-form-item>
              <el-form-item :label="$t('wallet.walletOwner')">
                  <el-select v-model="newWallet.ordWallet" @change="ordChange()" :placeholder="$t('wallet.selectHint')">
                      <el-option v-for="wallet in ordWalletList" :value="wallet.address" :label="(wallet.account.length>16?(wallet.account.slice(0,16)+'...'):wallet.account)+'-'+wallet.balance+'Energon'" :placeholder="$t('wallet.selectHint')"></el-option>
                  </el-select>
              </el-form-item>
              <el-form-item prop="address">
                  <el-input v-model.trim="newWallet.address" :placeholder="$t('wallet.enterSharedAddr')"></el-input>
              </el-form-item>
          </el-form>
          <p class="btn-box">
              <el-button class="cancel" @click="goBack">{{$t("form.cancel")}}</el-button>
              <el-button class="add" type="primary" @click="add()">{{$t('wallet.addShare')}}</el-button>
          </p>
      </div>
    </div>
</template>

<script>
    import keyManager from '@/services/key-manager';
    import fsObj from '@/services/fs-service';
    import {mapActions, mapGetters} from 'vuex';
    import formServies from '@/services/API-form';
    import contractService from '@/services/contract-servies';
    export default {
        name: "o-wallet-join-share",
        data() {
            return{
                ordWalletList:[],
                newWallet:{
                    account:'',
                    ordWallet:'',
                    ordAccount:'',
                    address:''
                },
                // rules:{
                //     account: [
                //         {required: true, message: this.$t('wallet.nonSharedName'), trigger: 'blur,change'},
                //     ],
                //     address: {validator: this.checkAddress, trigger: 'blur,change'}
                // },
            }

        },
        computed: {
            ...mapGetters(['network']),
            rules(){
                return{
                    account: [
                        {required: true, message: this.$t('wallet.nonSharedName'), trigger: 'blur,change'},
                    ],
                    address: {validator: this.checkAddress, trigger: 'blur,change'}
                }
            }
        },
        mounted() {
            this.getOrd().then((data)=>{
                this.getBalance(data);
                this.ordWalletList = data;
            })
        },
        methods: {
            ...mapActions(['WalletListAction','updateWalletInfo','getOrd','getShare','getOrdByAddress']),
            checkAddress(rule, value, callback){
                if (value === '') {
                    callback(new Error(this.$t('wallet.nonSharedAddr')));
                } else if (!/(0x)[0-9a-fA-F]{40}$/g.test(value)){
                    callback(new Error(this.$t('wallet.inVaildSharedAddr')));
                } else {
                    callback();
                }
            },
            getBalance(list){
                let _this = this,arr=[];
                list.forEach((item,index)=>{
                    contractService.web3.eth.getBalance(item.address,(err,data)=>{
                        let balance=contractService.web3.fromWei(data.toString(10), 'ether');
                        item.balance = (Math.floor(Number(balance) * 100) / 100).toFixed(2);
                        _this.$set(list,index,item)
                    });
                });
            },
            goBack(){
                this.$router.push('/home')
            },
            ordChange(){
                this.ordWalletList.forEach((item)=>{
                    if(item.address==this.newWallet.ordWallet){
                        this.newWallet.ordAccount = item.account;
                    }
                });
            },
            add(){
                this.$refs['newWallet'].validate((valid)=>{
                    if(valid){
                        const MyContract = contractService.web3.eth.contract(contractService.getABI(1));
                        contractService.web3.eth.getCode(this.newWallet.address,(err,data)=>{
                            console.log(err,data);
                            if(data!==MyContract.new.getPlatONData(contractService.getBIN(1))){
                                //判断是否为共享钱包合约地址
                                console.log(MyContract.new.getPlatONData(contractService.getBIN(1)))
                                this.$message.error(this.$t('wallet.addShareFail'));
                            }else{
                                this.getShare().then((shareWallets)=>{
                                    let arr = shareWallets.filter((item)=>{
                                        return item.address==this.newWallet.address
                                    });
                                    if(arr.length>0){
                                        this.$message.warning(this.$t('wallet.shareAlreadyExits'));
                                    }else{
                                        //执行添加共享钱包逻辑
                                        //查询签名数
                                        let keyObj={
                                            type:'share',
                                            account:this.newWallet.account,
                                            address:this.newWallet.address,
                                            admin:{
                                                address:this.newWallet.ordWallet,
                                                account:this.newWallet.ordAccount
                                            },
                                            createTime:new Date().getTime()
                                        };
                                        contractService.platONCall(contractService.getABI(1),this.newWallet.address,'getRequired',this.newWallet.ordWallet).then((required)=>{
                                            keyObj.required = required;
                                            this.updateWalletInfo(keyObj).then(()=>{
                                                this.$message.success(this.$t('wallet.addShareSuccess'));
                                                this.$router.push('/o-wallet-list')
                                            });
                                        });
                                    }
                                })
                            }
                        });
                    }
                })
            }
        },
        filters:{
            sliceName(name){
                if(/^\s*$/g.test(name)){
                    return this.$t('wallet.allWallet');
                }
                if(name.length>16){
                    return name.slice(0,16)+'...'
                }else{
                    return name;
                }
            }
        },
        watch:{
            ordWalletList:function(val){
                if(val.length>0){
                    this.newWallet.ordWallet = val[0].address;
                    this.newWallet.ordAccount = val[0].account;
                }
            }
        }
    }
</script>

<style lang="less" scoped>
    .card{
        padding-top: 40px;
        height:100%;
    }
    .join-form{
        width: 300px;
        margin: 0 auto;
    }
    .btn-box{
        width: 300px;
        margin: 30px auto 0;
        .add{
            float:right;
        }
    }

</style>
<style lang="less">
    .wallet-join{
        .el-form-item{
            margin-bottom:14px;
        }
        .el-form-item__label{
            padding:0 12px 8px 0;
        }
        .el-form-item__error{
            position:static;
        }
    }
</style>
