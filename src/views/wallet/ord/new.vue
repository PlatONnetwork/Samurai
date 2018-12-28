<template>
    <div class="wallet-new format-style">
        <div class="card wallet-content">
                <p class="step center"></p>
                <div v-if="active==1" class="box center">
                    <p class="icons"></p>
                    <el-form class="center" ref="newWallet" :rules="newRules" :model="newWallet">
                        <el-form-item prop="account">
                            <el-input v-model.trim="newWallet.account" :placeholder="$t('wallet.individualWalletName')"></el-input>
                        </el-form-item>
                        <div class="warn">
                            <i class="el-icon-warning"></i>{{$t("wallet.pleaseRememberPassword")}}
                        </div>
                        <el-form-item prop="password">
                            <el-input type="password" v-model.trim="newWallet.password" :placeholder="$t('wallet.enterNewPsw')"></el-input>
                        </el-form-item>
                        <el-form-item prop="passwordConfirm">
                            <el-input type="password" v-model.trim="newWallet.passwordConfirm" :placeholder="$t('wallet.repeatPsw')"></el-input>
                        </el-form-item>
                        <p class="btn-box">
                            <el-button class="cancel" @click="goBack">{{$t("form.cancel")}}</el-button>
                            <el-button type="primary" style="float: right;" @click="newOWallet('newWallet')">{{$t("form.create")}}</el-button>
                        </p>

                    </el-form>
                </div>
                <div class="center box2" v-if="active==2">
                    <p class="icons"></p>
                    <p class="compolete">{{$t("wallet.IndividualWalletSuccess")}}</p>
                    <div :class="[lang=='en'?'label-en':'','wallet-info']">
                        <p>
                            <span class="label">{{$t("wallet.name")}}:</span>
                            <span class="value">{{walletInfo.account}}</span>
                        </p>
                        <p>
                            <span class="label">{{$t("wallet.address")}}:</span>
                            <span class="value">{{walletInfo.address}}</span>
                        </p>
                        <p class="public-box">
                            <span class="label">{{$t("wallet.pubKey")}}:</span>
                            <span class="value pub">{{walletInfo.pubKey}}</span>
                        </p>
                        <p>
                            <span class="label">{{$t("wallet.signature")}}:</span>
                            <span class="value">{{walletInfo.sign}}</span>
                        </p>
                        <p>
                            <span class="label">{{$t("wallet.prikey")}}:</span>
                            <span class="value">{{walletInfo.priKey}}</span>
                        </p>
                        <p class="tip">{{$t("wallet.tipSaveJson")}} <el-button @click="backUp" type="primary">{{$t("wallet.downloadJson")}}</el-button> </p>
                    </div>
                    <p class="back">
                        <el-button @click="goBack"  type="primary">{{$t("wallet.finish")}}</el-button>
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
            }

        },
        computed: {
            ...mapGetters(['network','lang']),
            newRules(){
                return{
                    account: [
                        {required: true, message: this.$t('wallet.walletNameRequired'), trigger: 'blur,change'},
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
            console.log('111',this.$route)
        },
        methods: {
            ...mapActions(['WalletListAction','updateWalletInfo']),
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
                               this.walletInfo.account = keyObj.account;
                               this.walletInfo.address = keyObj.address;
                               this.walletInfo.sign = keyObj.crypto.kdfparams.prf;
                               this.walletInfo.pubKey = keyObj.publicKey;
                               keyObj.createTime = new Date().getTime();
                               let backUpForDevelop = Object.assign({}, keyObj);
                               let type = this.network.type;
                               fsObj.saveKey(keyObj.address,JSON.stringify(keyObj));
                               this.updateWalletInfo(backUpForDevelop).then(()=>{
                                   this.WalletListAction(type).then(()=>{
                                       keyManager.recover(keyObj.address, this.newWallet.password,'hex', (err, key) => {
                                           this.walletInfo.priKey = key;
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
        height: 530px;
        margin: -30px auto;
        padding-top: 20px;
    }
    .box{
        width: 300px;
    }
    .icons{
        position:relative;
        margin-bottom:28px;
        width:300px;
        height:34px;
        background: url("../images/line.jpg") no-repeat center center;
        &:before,&:after{
           content:'';
           position:absolute;
           top:0;
           width:34px;
           height:34px;
        }
        &:before{
             left:20px;
             background: url("../images/icon_1.svg") no-repeat center center;
         }
        &:after{
             right:20px;
             background: url("../images/icon_2.svg") no-repeat center center;
         }
    }
    .center{
        margin: 0 auto;
    }
    .box2{
        width:580px;
        margin-top:20px;
        .icons{
            width:580px;
        }
        .icons:before{
            left:155px;
            background: url("../images/icon_3.svg") no-repeat center center;
        }
        .icons:after{
            right:155px;
            background: url("../images/icon_4.svg") no-repeat center center;
        }
        .compolete{
            margin-top:25px;
            padding-top:48px;
            height:68px;
            font-size: 14px;
            color: #0BB27A;
            text-align: center;
            background: url("../images/icon_complete.svg") no-repeat top center;
        }
        .wallet-info{
            margin-top:20px;
            padding:12px 14px;
            width:580px;
            font-size: 12px;
            color: #525768;
            border: 1px solid #D3D8E1;
            p{
                margin-bottom:12px;
                color: #22272C;
                .label{
                    display:inline-block;
                    width:58px;
                    color: #525768;
                }
                .pub{
                    word-break: break-all;
                    text-indent: 58px;
                }
            }
            .tip{
                color: #F32E25;
                .el-button{
                    margin-left:10px;
                    font-size: 10px;
                }
            }
            .public-box{
                display:flex;
                .label{
                    min-width:58px;
                }
                .pub{
                    text-indent:0;
                }
            }
        }
        .back{
            margin-top:30px;
            text-align:center;
        }

    }
    .warn{
        margin:-2px 0 10px;
        font-size: 10px;
        color: #F32E25;
        white-space: nowrap;
        letter-spacing: 1.5px;
    }
    .btn-box{
        margin-top:30px;
        .el-button{
            width:79px;
            height:32px;
            padding:0;
            font-size:12px;
        }
        .cancel{
            border: 1px solid #18C2E9;
            color:#18C2E9;
        }
    }
    .box2{
        .label-en{
        p{
            .label{
                width: auto;
            }
        }

    }
    }
</style>
<style lang="less">
    .wallet-new{
        .el-form-item{
            margin-bottom:12px;
        }
        .el-input__inner{
            height:40px;
        }
        .el-form-item__error{
            position:static;
        }
    }

</style>
