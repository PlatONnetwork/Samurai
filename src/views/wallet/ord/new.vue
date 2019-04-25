<template>
    <div class="wallet-new format-style">
        <div class="card wallet-content" :style="{'padding-top':active==2?'14px':'20px'}">
                <div v-if="active==1" class="box">
                    <el-form class="" ref="newWallet" :rules="newRules" :model="newWallet"
                        label-position="top"
                    >
                        <el-form-item prop="account" :label="$t('wallet.walletName')">
                            <el-input v-model.trim="newWallet.account" :placeholder="$t('wallet.individualWalletName')"></el-input>
                        </el-form-item>
                        <el-form-item prop="password" :label="$t('wallet.password')" class="password">
                            <div class="warn">
                                <i class="remember-password-warning"></i>{{$t("wallet.pleaseRememberPassword")}}
                            </div>
                            <el-input type="password" v-model.trim="newWallet.password" :placeholder="$t('wallet.enterNewPsw')"></el-input>
                        </el-form-item>
                        <el-form-item prop="passwordConfirm" :label="$t('wallet.rePsw')">
                            <el-input type="password" v-model.trim="newWallet.passwordConfirm" :placeholder="$t('wallet.repeatPsw')"></el-input>
                        </el-form-item>
                        <p class="btn-box">
                            <el-button :class="[lang=='en'?'':'letterSpace']" type="primary" @click="newOWallet('newWallet')">{{$t("form.create")}}</el-button>
                            <el-button :class="[lang=='en'?'':'letterSpace','cancel']" @click="goBack">{{$t("form.cancel")}}</el-button>
                        </p>
                    </el-form>
                </div>
                <div class="box2" v-if="active==2">
                    <p class="compolete">{{$t("wallet.IndividualWalletSuccess")}}</p>
                    <!-- <div :class="[lang=='en'?'label-en':'','wallet-info']"> -->
                    <div class="wallet-info"  :class="{'zh-info':lang!='en'}">
                        <p>
                            <span class="label">{{$t("wallet.name")}}:</span>
                            <span class="value bold">{{walletInfo.account}}</span>
                        </p>
                        <p>
                            <span class="label">{{$t("wallet.address")}}:</span>
                            <span class="value bold">{{walletInfo.address}}</span>
                        </p>
                        <p class="public-box">
                            <span class="label">{{$t("wallet.pubKey")}}:</span>
                            <span class="value pub bold">{{walletInfo.publicKey}}</span>
                        </p>
                        <p>
                            <span class="label">{{$t("wallet.signature")}}:</span>
                            <span class="value bold">{{walletInfo.crypto.kdfparams.prf}}</span>
                        </p>
                        <p>
                            <span class="label">{{$t("wallet.prikey")}}:</span>
                            <span class="value bold">{{privatekey}}</span>
                        </p>

                    </div>
                    <p class="back">
                        <el-button @click="goBack"  type="primary" :class="[lang=='en'?'':'letterSpace']">{{$t("wallet.finish")}}</el-button>
                        <el-button @click="backUp" >{{$t("wallet.downloadJson")}}</el-button>
                        <span class="tip">{{$t("wallet.tipSaveJson")}}</span>
                    </p>
                </div>

        </div>
    </div>
</template>

<script>
    import keyManager from '@/services/key-manager'
    import fsObj from '@/services/fs-service'
    import {mapActions, mapGetters} from 'vuex';
    import formServies from '@/services/API-form'

    export default {
        name: "o-wallet-create",
        data() {
            return{
                active:1,
                newWallet: {
                    account: '',
                    password: '',
                    passwordConfirm: ''
                },

                // newRules: {
                //     account: [
                //         {required: true, message: this.$t('wallet.walletNameRequired'), trigger: 'blur,change'},
                //     ],
                //     password: [
                //         {required: true, message: this.$t('form.nonPsw'), trigger: 'blur,change'},
                //         {min: 6, message: this.$t('form.less6'), trigger: 'blur,change'}
                //     ],
                //     passwordConfirm: [
                //         {validator: this.checkPass, trigger: 'blur,change'}
                //     ]
                // },

                walletInfo: {
                    account: '',
                    address: '',
                    pubKey: '',
                    sign: '',
                    priKey: ''
                },
                privatekey:null,
                allWallets:[]
            }

        },
        computed: {
            ...mapGetters(['network','lang']),
            newRules(){
                return{
                    account: [
                        {required: true, trigger: 'blur,change',validator:this.checkAccount},
                    ],
                    password: [
                        {required: true, message: this.$t('form.nonPsw'), trigger: 'blur,change'},
                        {min: 6, message: this.$t('form.less6'), trigger: 'blur,change'}
                    ],
                    passwordConfirm: [
                        {validator: this.checkPass, trigger: 'blur,change'}
                    ]
                }
            }
        },
        created() {
            this.getAllWallets().then(res=>{
                this.allWallets=res
            })
        },
        methods: {
            ...mapActions(['WalletListAction','updateWalletInfo','getAllWallets']),
            checkPass(rule, value, callback){
                if (value === '') {
                    console.log(formServies.notEmpty(value).msg)
                    callback(new Error(formServies.notEmpty(value).msg));
                } else if (value !== this.newWallet.password){
                    callback(new Error(this.$t('form.disMatch')));
                } else {
                    callback();
                }
            },
            checkAccount(rule, value, callback){
                if(!value){
                    callback(new Error( this.$t('wallet.walletNameRequired')))
                }else{
                    console.log('checkAccount',value)
                    this.allWallets.map(item=>{
                        if(value==item.account){
                            callback(new Error( this.$t('wallet.walletNameExists')))
                        }
                    })
                    callback();
                }
            },
            newOWallet(name){
                this.$refs[name].validate((valid) => {
                    if(valid){
                       keyManager.createKey(
                           this.newWallet.account,
                           this.newWallet.password,
                           '',
                           '',
                           (err,keyObj) => {
                             if(err == 0){
                              this.active = 2;
                               this.walletInfo = JSON.parse(JSON.stringify(keyObj));
                               keyObj.createTime = new Date().getTime();
                               fsObj.saveKey(keyObj.address,JSON.stringify(keyObj));
                               let backUpForDevelop = JSON.parse(JSON.stringify(keyObj));
                               backUpForDevelop.icon = 'wallet-icon'+Math.floor((Math.random()*4)+1);
                               let type = this.network.type;
                               this.updateWalletInfo(backUpForDevelop).then(()=>{
                                   this.WalletListAction(type).then(()=>{
                                       keyManager.recover(keyObj.address, this.newWallet.password,'hex', (err, key) => {
                                           this.privatekey = key;
                                           setTimeout(()=>{
                                               keyManager.backUpKey(keyObj.address,keyObj);
                                           },100);
                                       });
                                   })
                               }).catch((e)=>{

                               });
                           }
                       })
                    }
                })
            },
            backUp(){
                console.log(this.walletInfo);
                keyManager.backUpKey(this.walletInfo.address,this.walletInfo);
            },
            goBack(){
                this.$router.push('/home')
            },

        }
    }
</script>

<style lang="less" scoped>
    .wallet-content{
        // height: 602px;
        height: 100%;
        // margin: -30px auto;
        padding-top: 20px;
    }
    .box{
        padding: 0 14px;
        width: 580px;
    }
    .center{
        margin: 0 auto;
    }
    .box2{
        padding: 0 14px;
        // width:580px;
        margin-top:0px;
        .compolete{
            margin:0;
            margin-bottom: 15px;
            padding: 0 0 0 50px;
            height:40px;
            line-height: 40px;
            font-size: 14px;
            // color: #0BB27A;
            // text-align: center;
            background: url("../images/icon_complete.svg") no-repeat left center;
            font-weight: bold;
        }
        .wallet-info{
            padding:12px 0;
            // width:580px;
            font-size: 12px;
            color: #525768;
            border-top: 1px solid #D3D8E1;
            border-bottom: 1px solid #D3D8E1;
            &.zh-info{
                .label {
                    width: 58px;
                }
            }
            p{
                margin-bottom:12px;
                color: #22272C;
                .label{
                    display:inline-block;
                    width:110px;
                    color: #525768;
                }
                .value{
                    font-size: 13px;
                }
                .pub{
                    word-break: break-all;
                    text-indent: 58px;
                }
            }

            .public-box{
                display:flex;
                .pub{
                    padding: 0 0 0 2px;
                    text-indent:0;
                    flex: 1;
                }
            }
        }
        .back{
            margin-top:20px;
            // text-align:center;
            >.el-button{
                width: 186px;
                height: 36px;
                &:last-child{
                    margin-left: 20px;
                }
            }
            .tip{
                position: relative;
                left: 5px;
                bottom: -10px;
                font-size: 12px;
                color: #F32E25;
            }
        }

    }
    .warn{
        margin:-2px 0 10px 2px;
        font-size: 12px;
        color: #F5A623;
        white-space: nowrap;
        // letter-spacing: 1.5px;
        line-height: 18px;
    }
    .remember-password-warning{
        display: inline-block;
        width: 10px;
        height: 10px;
        margin-right: 4px;
        background: url("../images/10.icon_An_error .svg") no-repeat left center;
        background-size: 10px 10px;
    }
    .btn-box{
        margin-top:20px;
        .el-button{
            width:80px;
            height:32px;
            padding:0;
            font-size:12px;
            &:first-child{
                margin: 0 40px 0 0;
            }
        }
        // .cancel{
        //     border: 1px solid #0077FF;
        //     color:#0077FF;
        // }
    }
    // .box2{
    //     .label-en{
    //         p{
    //             .label{
    //                 min-width: 110px;
    //                 width: auto;
    //             }
    //         }

    //     }
    // }
</style>
<style lang="less">
    .wallet-new{
        .el-form-item__label{
            font-weight:600;
        }
        .el-form-item.is-required .el-form-item__label:before{
             content:"";
        }
        .el-form-item{
            margin-bottom:12px;
        }
        .el-input__inner{
            height:40px;
        }
        .password{
            .el-form-item__error{
                top:35px;
            }
        }
    }

</style>
