<template>
    <div class="wallet-import format-style">
        <div class="wallet-header tabs fr">
            <span :class="{selected: curIndex == 1}"
                   @click="toggleWay(1)">{{$t("wallet.hex")}}
            </span>
            <span :class="{selected: curIndex == 2}"
                  @click="toggleWay(2)">Keystore(.json)
            </span>
            <span :class="{selected: curIndex == 3}"
                  @click="toggleWay(3)">{{$t("wallet.mnemonicPhrase")}}
            </span>
        </div>
        <div class="clearfloat"></div>
        <div class="card wallet-content">
            <el-form v-show="curIndex == 1"
                     ref="byPriKey"
                     :model="byPriKey"
                     :rules="byPriKeyRule">
                <el-form-item prop="account">
                    <el-input :placeholder="$t('wallet.walletName')"
                              v-model.trim="byPriKey.account">
                    </el-input>
                </el-form-item>
                <el-form-item prop="priKey">
                    <el-input type="textarea"
                              :placeholder="$t('wallet.inputPKHint')"
                              :autosize="{minRows: 2,maxRows:6}"
                              resize="none"
                              v-model.trim="byPriKey.priKey">
                    </el-input>
                </el-form-item>
                <div class="warn">
                    <i class="el-icon-warning"></i>{{$t("wallet.pleaseRememberPassword")}}
                </div>
                <el-form-item prop="password">
                    <el-input type="password"
                              :placeholder="$t('wallet.enterNewPsw')"
                              v-model.trim="byPriKey.password">
                    </el-input>
                </el-form-item>
                <el-form-item prop="passwordConfirm">
                    <el-input type="password"
                              :placeholder="$t('wallet.repeatPsw')"
                              v-model.trim="byPriKey.passwordConfirm">
                    </el-input>
                </el-form-item>
                <div class="ben">
                    <el-button @click="cancel">{{$t("form.cancel")}}</el-button>
                    <el-button type="primary"
                               class="fr"
                               @click="importByPriKey">{{$t("wallet.import")}}
                    </el-button>
                </div>
            </el-form>
            <el-form v-show="curIndex == 2"
                     ref="byKeyStore"
                     :model="byKeyStore"
                     :rules="byKeyStoreRule">
                <el-form-item prop="account">
                    <el-input :placeholder="$t('wallet.walletName')"
                              v-model.trim="byKeyStore.account">
                    </el-input>
                </el-form-item>
                <span v-show="hasRead" class="file-box">
                    {{$t("wallet.browse")}}
                        <input type="file"
                               class="file"
                               id="file"
                               accept=".json"
                               @change="getFileName"/>

                </span><span v-show="hasRead" class="f12">{{$t("wallet.unselectedFile")}}</span>
                <el-form-item v-show="!hasRead">
                    <span class="document icon-left"></span>
                    <el-input class="input-file" disabled v-model.trim="fileName"></el-input>
                    <span class="document icon-size">{{fileSize}}</span>
                    <span class="document icon-right" @click="stop"></span>
                    <span v-show="!hasRead"  class="line"></span>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model.trim="byKeyStore.password"
                              type="password"
                              onpaste="return false"
                              ondragstart="return false"
                              ondragEnter="return false"
                              ondrop="return false"
                              :placeholder="$t('wallet.decryptKeystore')">
                    </el-input>
                </el-form-item>
                <div class="ben">
                    <el-button @click="cancel">{{$t("form.cancel")}}</el-button>
                    <el-button type="primary"
                               class="fr"
                               @click="importByKeystore">
                        {{$t("wallet.import")}}
                    </el-button>
                </div>

            </el-form>

            <el-form v-show="curIndex == 3"
                     ref="byAssitant"
                     :model="byAssitant"
                     :rules="byAssitantRule">
                <el-form-item prop="account">
                    <el-input :placeholder="$t('wallet.walletName')"
                              v-model.trim="byAssitant.account">
                    </el-input>
                </el-form-item>
                <el-form-item prop="assitant">
                    <el-input type="textarea"
                              :placeholder="$t('wallet.inputPhraseHint')"
                              :autosize="{minRows: 2,maxRows:6}"
                              resize="none"
                              v-model.trim="byAssitant.assitant">
                    </el-input>
                </el-form-item>
                <div class="warn">
                    <i class="el-icon-warning"></i>{{$t("wallet.pleaseRememberPassword")}}
                </div>
                <el-form-item prop="password">
                    <el-input type="password"
                              :placeholder="$t('wallet.enterNewPsw')"
                              v-model.trim="byAssitant.password">
                    </el-input>
                </el-form-item>
                <el-form-item prop="passwordConfirm">
                    <el-input type="password"
                              :placeholder="$t('wallet.repeatPsw')"
                              v-model.trim="byAssitant.passwordConfirm">
                    </el-input>
                </el-form-item>
                <div class="ben">
                    <el-button @click="cancel">{{$t("form.cancel")}}</el-button>
                    <el-button type="primary"
                               class="fr"
                               @click="importByAssit">{{$t("wallet.import")}}
                    </el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script>
    import keyManager from '@/services/key-manager'
    import importByMnemonic from '@/services/by-mnemonic'
    import fsObj from '@/services/fs-service'
    import {mapGetters, mapActions} from 'vuex';
    export default {
        account: "o-wallet-import",
        data() {
            return{
               curIndex: 1,
                ifReset: false,
                tip: '',
                fileName: '',
                fileSize:0,
                hasRead: true,
                byPriKey: {
                    account: '',
                    priKey: '',
                    password: '',
                    passwordConfirm: ''
                },
                byKeyStore: {
                    account:'',
                    password:''
                },
                byAssitant: {
                    account: '',
                    assitant: '',
                    password: '',
                    passwordConfirm: ''

                },
            }
        },
        computed: {
            ...mapGetters(['WalletListGetter', 'network']),
            byPriKeyRule(){
                return {
                    account:{required: true, message: this.$t('wallet.walletNameRequired'), trigger: 'blur'},
                    priKey: [
                        {required: true, message: this.$t('wallet.PKRequired'), trigger: 'blur'},
                        {min: 64, max:64, message: this.$t('wallet.PKlength'),trigger: 'blur'}
                    ],
                    password:[
                        {required: true, message: this.$t('form.nonPsw'), trigger: 'blur'},
                        {min: 6, message: this.$t('form.less6'),trigger: 'blur'}
                    ],
                    passwordConfirm: [
                        {validator: this.checkPass, trigger: 'blur'}
                    ]
                }
            },
            byKeyStoreRule(){
                return{
                    account:{required: true, message: this.$t('wallet.walletNameRequired'), trigger: 'blur'},
                    password:[
                        {required: true, message: this.$t('form.nonPsw'), trigger: 'blur'}
                    ]
                }
            },
            byAssitantRule(){
                return{
                    account: [
                        {required: true, message: this.$t('wallet.walletNameRequired'), trigger: 'blur'},
                    ],
                    assitant: [
                        {required: true, message: this.$t('wallet.PhraseRequired'), trigger: 'blur'},
                    ],
                    password:[
                        {required: true, message: this.$t('form.nonPsw'), trigger: 'blur'},
                        {min: 6, message: this.$t('form.less6'),trigger: 'blur'}
                    ],
                    passwordConfirm: [
                        {validator: this.checkPass2, trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            ...mapActions(['WalletListAction','updateWalletInfo']),
            checkPass(rule, value, callback){
                if (value === '') {
                    callback(new Error(this.$t('form.nonRepPsw')));
                } else if (value !== this.byPriKey.password){
                    callback(new Error(this.$t('form.disMatch')));
                } else {
                    callback();
                }
            },
            checkPass2(rule, value, callback){
                if (value === '') {
                    callback(new Error(this.$t('form.nonRepPsw')));
                } else if (value !== this.byAssitant.password){
                    callback(new Error(this.$t('form.disMatch')));
                } else {
                    callback();
                }
            },
            toggleWay(i){
                document.getElementById('file').value=null;
                this.hasRead = true;
                this.fileName='';
                this.curIndex = i;
                if(i==1){
                    this.$refs['byPriKey'].resetFields();
                    // this.$refs['byPriKey'].clearValidate();
                }else if(i==2){
                    this.$refs['byKeyStore'].resetFields();
                    // this.$refs['byKeyStore'].clearValidate();
                }else{
                    this.$refs['byAssitant'].resetFields();
                    // this.$refs['byAssitant'].clearValidate();
                }
            },
            cancel(){
                this.$router.push('/o-wallet-list')
            },
            getFileName(val) {
                if(val) {
                    let file = document.getElementById("file").files[0];
                    if(file){
                        this.fileName =  file.name;
                        this.fileSize = (file.size/1024).toFixed(2)+'kb';
                        this.hasRead = false;
                    }
                }
            },
            stop(){
                this.ifReset = true;
                this.hasRead = true;
                document.getElementById('file').value=null;
            },
            importByPriKey(){
                this.$refs['byPriKey'].validate((valid)=>{
                    if(valid){
                        keyManager.importWalletByPriKey(
                            this.byPriKey.account,
                            this.byPriKey.priKey,
                            this.byPriKey.password,
                            (err, keyObj) => {
                                if(err == 0){
                                    this.rewriteWalletInfo(keyObj)
                                }else{
                                    this.$message.error(this.$t('wallet.invalidPrivatekey'))
                                }
                            }
                        )
                    }
                });

            },

            importByKeystore(){
                this.$refs['byKeyStore'].validate((valid)=>{
                    if(valid){
                        let file = document.getElementById('file').files[0];
                        console.warn('file',file);
                        if(!file){
                            this.$message.error(this.$t('wallet.fileRequired'));
                            return;
                        };
                        let name = file.name;
                        this.fileName = name;
                        let dirPath = file.path.replace(name,'');
                        fsObj.ReadFile(dirPath, name, (err, data) => {
                            if(err){
                                this.$message.error(this.$t('form.wrongPsw'))
                            }
                            if(data) {
                                try{
                                    let dataToObj = JSON.parse(data.toString().replace(/\n\r/g,''));
                                    dataToObj.account = this.byKeyStore.account;
                                    console.warn('dataToObj--->',dataToObj);
                                    keyManager.importKey(
                                        dataToObj,
                                        this.byKeyStore.password,
                                        (err, obj) => {
                                            if(err == 0){
                                                document.getElementById('file').value=null;
                                                this.rewriteWalletInfo(obj);
                                            }else if(err == -2){
                                                this.$message.error(this.$t('wallet.invalidFile'))
                                            }else{
                                                this.$message.error(this.$t('form.wrongPsw'))
                                            }
                                        }
                                    )
                                }catch(e){
                                    this.$message.error(this.$t('wallet.invalidFile'))
                                }
                            }
                        })
                    }
                });
            },
            importByAssit(){
                this.$refs['byAssitant'].validate((valid)=>{
                    if(valid){
                        importByMnemonic(
                            this.byAssitant.account,
                            this.byAssitant.assitant,
                            this.byAssitant.password,
                            (err,data) => {
                                if(!err){
                                    this.rewriteWalletInfo(data)
                                }else{
                                    this.$message.error(this.$t('wallet.invalidWord'));
                                }
                            });
                    }
                })
            },

            // 重写walletInfo.json 文件：
            // 先利用钱包标识字段adress 确认钱包是否存在；未存在，则重写文件，并调用WalletListAction，更新walletInfoList
            rewriteWalletInfo( keyObj) {
                let flag = true;
                if(this.WalletListGetter && this.WalletListGetter.length>0){
                    this.WalletListGetter.forEach((item) => {
                        if(item.address == keyObj.address) {
                            flag = false;
                            this.$message({
                                message: this.$t('wallet.alreadyExits'),
                                type: 'error'
                            });
                            return
                        }
                    });
                }
                if(flag){
                    keyObj.address = '0x'+keyObj.address.replace(/^0x/,'');
                    keyObj.createTime = new Date().getTime();
                    keyObj.icon = 'wallet-icon'+Math.floor((Math.random()*5)+1);
                    let backUpObj = JSON.parse(JSON.stringify(keyObj));
                    let type = this.network.type;
                    this.updateWalletInfo(keyObj).then(()=>{
                        fsObj.saveKey(backUpObj.address,JSON.stringify(backUpObj));
                        this.WalletListAction(type);
                        this.$message.success(this.$t('wallet.importSuccess'));
                        this.hasRead = true;
                        this.fileName='';
                        this.$router.push('/o-wallet-list');
                    }).catch((e)=>{
                        this.$message.error(this.$t('wallet.importFail'));
                    });
                }
            }
        }
    }
</script>

<style lang="less" scoped>
    .wallet-import{
        .wallet-content{
            height: 530px;
            margin: 10px auto;
            padding-top: 30px;
            .el-form{
                width: 300px;
                margin: 0 auto;
            }
            .el-button{
                width:79px;
                height:32px;
                padding:0;
                font-size:12px;
            }
        }
        .file-box{
            position: relative;
            margin-right:8px;
            margin-bottom:9px;
            width: 60px;
            height: 24px;
            line-height: 24px;
            display: inline-block;
            background: #18C2E9;
            border-radius: 4px;
            text-align: center;
            font-size: 10px;
            color: #FFFFFF;
            letter-spacing: 1px;
        }
        .ben{
            margin-top:30px;
        }
        .file{
            height: 60px;
            position: absolute;
            top: 0;
            left: 0;
            opacity: 0;

        }
        .document{
            width: 16px;
            height: 16px;
            display: inline-block;
            position: absolute;
            z-index: 22;
        }
        .icon-left{
            left:14px;
            top:12px;
            background: url("../images/icon_file.svg") no-repeat center center;
            background-size: 16px 16px;
        }
        .icon-right{
            top:12px;
            right: 14px;
            cursor:pointer;
            background: url("../images/icon_delete.svg") no-repeat center center;
            background-size: 16px 16px;
        }
        .icon-size{
            top:0;
            left:224px;
            height:40px;
            line-height:40px;
            opacity: 0.5;
            font-size: 10px;
            color: #9EABBE;
        }
        .line{
            width: 0;
            height: 2px;
            position: absolute;
            top: 40px;
            display: inline-block;
            background: #18C2E9;;
            animation: loading 3s;
            animation-fill-mode: forwards;
        }
        @keyframes loading{
            from {
                width: 0;
            }
            to{
                width: 300px;
            }
        }
        .warn{
            margin:-2px 0 10px;
            font-size: 10px;
            // color: #F32E25;
            color: #F5A623;
            white-space: nowrap;
            letter-spacing: 1.5px;
        }
    }

</style>
<style lang="less">
    .wallet-import{
        .el-form-item{
            margin-bottom:12px;
        }
        .el-form-item__error{
            position:static;
        }
        .input-file{
            .el-input__inner{
                padding-left:43px;
                padding-right:86px;
                text-overflow: ellipsis;
                border-bottom:solid 2px #9EABBE;
            }
        }
        .el-input__inner{
            height:40px;
        }
        .el-input.is-disabled .el-input__inner{
            font-size: 12px;
            color: #525768;
            background: #fff;
        }
        .el-textarea .el-textarea__inner{
            font-family: "Arial";
            color: #1f2d3d;
            font-size:12px;
        }

    }

</style>

