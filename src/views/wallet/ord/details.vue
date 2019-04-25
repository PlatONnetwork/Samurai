<template>
    <div class="wallet-detail format-style">
        <div class="wallet-detail-wrapper">
            <div class="wallet-icon" :class="[wallet.icon?wallet.icon:'icon-bg']">
                {{wallet.account&&wallet.account.slice(0,1).toUpperCase()}}
            </div>
            <div class="wallet-detail-info">
                <p class="wallet-name" :title="(wallet.account&&wallet.account.length>32)?wallet.account:''">
                    <!-- {{wallet.account | sliceName}} -->
                    <rename :oldName="wallet.account" @changeName="changeName" :rule="false"></rename>
                </p>
                <p class="balance">
                    <span class="wallet-name">{{balance}} </span>Energon
                    <!-- <refresh @refreshBalance="refreshValue" :parentAddress="wallet.address"></refresh> -->
                </p>
                <p class="address" ref="address">
                    {{wallet.address}}
                    <el-tooltip class="item" effect="dark" offset="0" :content="clipboarMsg" placement="top">
                        <i class="icon-copy" @click="doCopy2"  @mouseleave="mouseLeave" ref="copy-i"></i>
                    </el-tooltip>
                </p>

            </div>
            <ul class="wallet-operate">
                <refresh @refreshBalance="refreshValue" :parentAddress="wallet.address"></refresh>
                <!-- <li class="send" @click="handleSend">
                    <span>{{$t('wallet.send')}}</span>
                </li>
                <li class="receive"  @click="handleAccept">
                    <span>{{$t('wallet.accept')}}</span>
                </li> -->
                <li class="copy"
                    @click="doCopy">
                    <span>{{$t('wallet.copyAddress')}}</span>
                </li>
                <el-popover placement="bottom" popper-class="more-popper"
                            trigger="click">
                    <p class="pop lightBlack" @click="exportKeystore">{{$t('wallet.exportKeystore')}}</p>
                    <p class="pop lightBlack" @click="showPriKey">{{$t('wallet.viewPrivate')}}</p>
                    <p class="pop lightBlack" @click="updatePassword">{{$t('wallet.modifyPsw')}}</p>
                    <p class="pop lightBlack" @click="deleteWallet">{{$t('wallet.deleteWallet')}}</p>
                    <li class="more" slot="reference">
                        <span>{{$t('wallet.more')}}</span>
                    </li>
                </el-popover>
            </ul>
        </div>
        <ul class="tab-list clearfix">
            <li @click="changeTab(1)" :class="{'select':select==1}">
                <i class="icon-record"></i>
                {{$t('wallet.record')}}
            </li>
            <li @click="changeTab(2)" :class="{'select':select==2}">
                <i class="icon-send"></i>
                {{$t('wallet.send')}}
            </li>
            <li @click="changeTab(3)" :class="{'select':select==3}">
                <i class="icon-accept"></i>
                {{$t('wallet.accept')}}
            </li>
        </ul>
        <div :class="[select==1?'':'padd-lt','wallet-trade-wrapper']">
            <tradeList-component v-if="select==1" ref="child2" :pageNum="pageSize" pageFrom="ordDetail"></tradeList-component>
            <send-component v-show="select==2" :walletType=1 @initEvent="initEvent"></send-component>
            <accept-qr-component  v-show="select==3" ></accept-qr-component>
        </div>
        <div class="modal confirm-modal" v-if="active == 'confirm'">
            <div class="modal-main">
                <div class="modal-title">
                    {{$t('wallet.modify')}}
                    <span class="modal-close" @click="handleCancel"></span>
                </div>
                <div class="modal-content f12">
                    <p v-if="confirm == 'export'" class="mb-10">{{$t('wallet.importTxt')}}</p>
                    <p v-if="confirm == 'show'" class="mb-10">{{$t('wallet.viewPrivateTxt')}}</p>
                    <p v-if="confirm == 'delete'" class="mb-10">{{$t('wallet.deleteTxt')}}</p>
                    <p class="mb-10 bold">{{$t('wallet.walletAddress')}}</p>
                    <p class="wallet-address bold" :class="{'delete':confirm == 'delete'}">{{wallet.address}}</p>
                    <p v-if="confirm == 'delete'" class="mb-10 modal-info6">{{$t('wallet.walletDeleteInfo')}}</p>
                    <el-input v-model.trim="password" type="password" :placeholder="$t('wallet.enterPsw')" @input="pswNull=false"></el-input>
                    <p class="el-form-item__error error-info" v-if="pswNull" style="position:static">{{$t('form.nonPsw')}}</p>
                </div>
                <div class="modal-btn">
                    <el-button @click="handleCancel" :class="[lang=='en'?'':'letterSpace']">{{$t('form.cancel')}}</el-button>
                    <el-button @click="handleConfirm" type="primary" :class="[lang=='en'?'':'letterSpace']">{{$t('form.sure')}}</el-button>
                </div>
            </div>
        </div>
        <div class="modal" v-if="active == 'show'">
            <div class="modal-main">
                <div class="modal-title">
                    {{$t('wallet.walletPrivate')}}
                    <span class="modal-close" @click="handleCancel"></span>
                </div>
                <div class="modal-content f12">
                    <p>{{wallet.priKey}}</p>
                </div>
                <div class="modal-btn">
                    <el-button type="primary" @click="active = ''" :class="[lang=='en'?'':'letterSpace']">{{$t('form.sure')}}</el-button>
                </div>
            </div>
        </div>
        <div class="modal modify-psw" v-if="active == 'update'">
            <div class="modal-main">
                <div class="modal-title">
                    {{$t('wallet.modifyPsw')}}
                    <span class="modal-close" @click="handleCancel"></span>
                </div>
                <div class="modal-content f12">
                    <p class="mb-10">{{$t('wallet.modifyPswTxt')}}</p>
                    <p class="mb-10 bold">{{$t('wallet.walletAddress')}}</p>
                    <p class="wallet-address bold">{{wallet.address}}</p>
                    <el-form ref="password" :model="form" :rules="formRules">
                        <el-form-item prop="oldPassword">
                            <el-input v-model.trim="form.oldPassword"
                                      type="password"
                                      :placeholder="$t('wallet.enterOldPsw')">
                            </el-input>
                        </el-form-item>
                        <p class="modal-info6">{{$t('wallet.walletBackUpInfo')}}</p>
                        <el-form-item prop="newPassword">
                            <el-input v-model.trim="form.newPassword"
                                      type="password"
                                      :placeholder="$t('wallet.enterNewPsw')">
                            </el-input>
                        </el-form-item>
                        <el-form-item prop="newPassword2">
                            <el-input v-model.trim="form.newPassword2"
                                      type="password"
                                      :placeholder="$t('wallet.repeatPsw')">
                            </el-input>
                        </el-form-item>
                    </el-form>
                </div>
                <div class="modal-btn">
                    <el-button :class="[lang=='en'?'':'letterSpace','cancel']" @click="handleCancel">{{$t('form.cancel')}}</el-button>
                    <el-button :class="[lang=='en'?'':'letterSpace','sureBtn']" @click="handleUpdate"  type="primary">{{$t('form.sure')}}</el-button>
                </div>
            </div>
        </div>
        <div class="modal modal-copy diff-modal" v-if="isTest">
            <div class="modal-main">
                <div class="modal-title">
                   {{$t('wallet.warning')}}
                    <span class="modal-close" @click="handleCancel"></span>
                </div>
                <div class="modal-content f12">
                    <p class="icon-danger"></p>
                    <p class="mb-10">{{$t('wallet.warningTxt')}}</p>
                </div>
                <div class="modal-btn">
                    <el-button @click="handleCancel" :class="[lang=='en'?'':'letterSpace']">{{$t('form.cancel')}}</el-button>
                    <el-button @click="copyConfirm"  type="primary" :class="[lang=='en'?'':'letterSpace']">{{$t('form.sure')}}</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import contractService from '@/services/contract-servies';
    import keyManager from '@/services/key-manager'
    import fsObj from '@/services/fs-service'
    import {mapGetters, mapActions} from 'vuex';
    import tradeListComponent from '@/components/trade/list';
    import sendComponent from '@/components/trade/send';
    import acceptQrComponent from '../accept-qr';
    import refresh from '@/components/refresh/refresh';
    import Settings from '@/services/setting';
    import fs from 'fs';
    import rename from '@/components/rename';

    export default {
        name: "o-wallet-details",
        data() {
            return{
                clipboarMsg:'Copy to clipboard',
                wallet: {},
                tradeList: [],
                isTest: false,
                balance:null,
                active: '', // confirm: 验证，show: 展示私钥，update: 修改密码
                confirm: '',
                password: '',
                pswNull:false,
                pageSize:20,
                form: {
                    oldPassword: '',
                    newPassword: '',
                    newPassword2: ''
                },
                // 弹窗时无法切换中英文，不用加入computed
                formRules: {
                    oldPassword: [
                        {required: true, message: this.$t('form.nonOldPsw'), trigger: 'blur'},
                    ],
                    newPassword: [
                        {required: true, message: this.$t('form.nonPsw'), trigger: 'blur'},
                        {min: 6, message: this.$t('form.less6'),trigger: 'blur'}
                    ],
                    newPassword2: [
                        {validator: this.checkPass, trigger: 'blur'}
                    ],
                },
                select:1,
                allWallets:[]
            }
        },
        computed: {
            ...mapGetters(['WalletListGetter', 'network','curWallet','chainName','lang'])
        },
        created(){
            this.getAllWallets().then(res=>{
                this.allWallets=res
            })
            this.WalletListAction(this.network.type);
        },
        mounted(){
            this.init();
            this.$refs.address.addEventListener('copy',(e)=> {
                e.preventDefault();
                e.stopPropagation();
                this.doCopy();
            })
        },
        methods: {
            ...mapActions(['WalletListAction','replaceWallet','getAllWallets']),
            init(){
                let _this = this;
                let arr = this.WalletListGetter.filter((item)=>{
                    return item.address==_this.curWallet;
                });
                if(arr && arr.length>0){
                    this.wallet = arr[0];
                    if(this.wallet.address){
                        contractService.web3.eth.getBalance(this.wallet.address,(err,data)=>{
                            const {fromWei,toDecimal}=contractService.web3
                            let balance=fromWei(toDecimal(data), 'ether');
                            this.balance=balance
                            // this.balance=contractService.web3.fromWei(data.toString(10), 'ether');
                        });
                        clearInterval(window.balanceInterval);
                        window.balanceInterval = setInterval(_this.refresh,5*1000);
                    }
                    // document.addEventListener('copy',(e)=> {
                    //     e.preventDefault();
                    //     e.stopPropagation();
                    //     let text = window.getSelection().getRangeAt(0).commonAncestorContainer.data;
                    //     console.log('触发复制事件---',text);
                    //     if(text==this.wallet.address){
                    //         this.doCopy();
                    //     }
                    // })
                }
            },
            initEvent(){
                this.select=1;
                setTimeout(()=>{
                    this.$refs.child2.init()
                },400)
                this.init();
            },
            doCopy2(){
                this.$copyText(this.wallet.address).then(()=>{
                    // this.$refs['copy-i'].setAttribute('title','Copied!');
                    this.clipboarMsg = 'Copied!';
                });
            },
            mouseLeave(){
                setTimeout(()=>{
                    this.clipboarMsg = 'Copy to clipboard';
                },1200)

                // this.$refs['copy-i'].setAttribute('title','Copy to clipboard');
            },
            refresh(){
                contractService.web3.eth.getBalance(this.wallet.address,(err,data)=>{
                    // this.balance=contractService.web3.fromWei(data.toString(10), 'ether');
                    const {fromWei,toDecimal}=contractService.web3
                    let balance=fromWei(toDecimal(data), 'ether');
                    this.balance=balance
                });
            },
            selWallet(){
                this.init();
            },
            checkPass(rule, value, callback){
                if (value === '') {
                    callback(new Error(this.$t('form.nonRepPsw')));
                } else if (value !== this.form.newPassword){
                    callback(new Error(this.$t('form.disMatch')));
                } else {
                    callback();
                }
            },
            doCopy(){
                if(this.network.type=='main'){
                    this.copyConfirm();
                }else{
                    this.isTest = true;
                }
            },
            copyConfirm(){
                this.$copyText(this.wallet.address).then((e) => {
                    this.$message.success(this.$t('wallet.copySuccess'));
                    this.isTest = false
                }, function (e) {
                    this.$message.error(this.$t('wallet.copyFail'));
                    this.isTest = false
                })
            },
            handleSend(){
                if((this.balance-0)==0){
                    this.$message({
                        message: this.$t('wallet.cannotTrans'),
                        type: 'warning'
                    });
                    return;
                }
                this.$router.push('/o-wallet-send')
            },
            handleAccept(){
                this.$router.push('/o-wallet-accept')
            },
            handleCancel(){
                this.active = '';
                this.confirm = '';
                this.isTest = false;
            },
            handleConfirm(){
                if(!this.password || /^\s*$/g.test(this.password)){
                    this.pswNull = true;
                    return;
                }else{
                    this.pswNull = false;
                }
                let account = this.wallet.address,type=this.network.type;
                keyManager.recover(account, this.password,'hex',(err, priKey) => {
                    console.warn('priKey',err,priKey,this.confirm);
                    if(priKey){
                        if(this.confirm == 'export'){
                            keyManager.backUpKey(this.wallet.address,this.wallet);
                            this.active = '';
                            this.confirm = '';
                        }else if(this.confirm == 'show'){
                            this.active = 'show';
                            this.wallet.priKey = priKey;
                        }else if(this.confirm == 'delete'){
                            let walletCate = type;
                            if(type=='custom'){
                                walletCate = 'custom_'+this.chainName;
                            }
                            fsObj.ReadFile('','walletInfo.json',(err, data) => {
                                let retData = JSON.parse(data.toString().replace(/\n\r/g,''));
                                console.warn('retData===',retData);
                                for(var k in retData){
                                    if(k == walletCate){
                                        let items = retData[k];
                                        items.forEach((item, index) => {
                                            if(item.address == this.wallet.address){
                                                items.splice(index, 1);
                                                return
                                            }
                                        });
                                        let result = items;
                                        retData[k] = result
                                    }
                                }
                                fsObj.WriteFile('walletInfo.json',JSON.stringify(retData),(err) =>{
                                    try{

                                        if(fs.existsSync(`${Settings.keyPath}/${this.wallet.address}.json`)){
                                            fs.unlinkSync(`${Settings.keyPath}/${this.wallet.address}.json`);
                                        }else{
                                            let paths = fs.readdirSync(Settings.keyPath)
                                            paths.forEach(path=>{
                                                const fullPath=`${Settings.keyPath}/${path}`
                                                let file = fs.statSync(fullPath);
                                                if(file.isFile()&&path.slice(path.lastIndexOf('.'),path.length)=='.json'){
                                                    let fileContent = fs.readFileSync(fullPath,{encoding:'utf8'});
                                                    try{
                                                        let keyObj = JSON.parse(fileContent);
                                                        if(keyObj.address===account){
                                                            fs.unlinkSync(fullPath);
                                                        }
                                                    }catch(e){
                                                        throw e;
                                                    }
                                                }
                                            })
                                        }
                                    }catch(e){
                                        console.log(e)
                                    }
                                    this.WalletListAction(type);
                                    this.$message.success(this.$t('wallet.deleteSuccess'));
                                    this.$router.push('/o-wallet-list')
                                })
                            })
                        }
                    }else{
                        this.$message.error(this.$t('wallet.pswError'));
                    }
                });
            },
            handleUpdate(){
                this.$refs['password'].validate((valid) => {
                    if(valid) {
                        keyManager.resetPassword(
                            this.wallet.account,
                            this.wallet.address,
                            this.form.oldPassword,
                            this.form.newPassword,
                            (err, data) => {
                                console.warn(err, data);
                                if(err == 0){
                                    this.replaceWallet(data).then(()=>{
                                        this.active = '';
                                        this.confirm = '';
                                        this.$message.success(this.$t('wallet.modifyPswSuccess'));
                                        this.$router.push('/o-wallet-list');
                                    });
                                }else{
                                    this.$message.error(this.$t('wallet.oldPswError'));
                                }
                            }
                        )
                    }
                })

            },
            exportKeystore(){
                this.active = 'confirm';
                this.confirm = 'export';
                this.password='';
                this.pswNull = false;
            },
            showPriKey(){
                this.active = 'confirm';
                this.confirm = 'show';
                this.password='';
                this.pswNull = false;
            },
            updatePassword(){
                this.active = 'update';
                this.confirm = '';
                this.form.oldPassword='';
                this.form.newPassword='';
                this.form.newPassword2='';
            },
            deleteWallet(){
                this.active = 'confirm';
                this.confirm = 'delete';
                this.password='';
                this.pswNull = false;
            },
            refreshValue(cost){
                this.balance=cost;
            },
            changeTab(index){
                this.select=index
            },
            rename(){
            },
            changeName(newName){
                let arr = this.allWallets.filter((item)=>{
                    return item.account==newName
                });
                if(arr.length>0 && arr[0].address!==this.wallet.address){
                    this.$message.warning(this.$t('wallet.walletNameExists'));
                }else{
                    const wallet =Object.assign({},this.wallet,{account:newName})
                    this.replaceWallet(wallet).then(()=>{
                        this.wallet.account=newName
                    });
                }
            },
        },
        watch:{
            'curWallet':function(){
                this.init();
            }
        },
        filters:{
            'month':function (time) {
                return new Date(time).getMonth()+1;
            },
            'date':function (time) {
                return new Date(time).getDate();
            },
            'sliceName':function(name){
                if(name && name.length>36){
                    return name.slice(0,36)+'...'
                }else{
                    return name;
                }
            }
        },
        components:{
            tradeListComponent,
            refresh,
            acceptQrComponent,sendComponent,rename
        },
        beforeDestroy() {
            clearInterval(window.balanceInterval);
            window.balanceInterval = null;
        },
        destroyed() {
            clearInterval(window.balanceInterval);
            window.balanceInterval = null;
        },
    }
</script>

<style lang="less" scoped>
    .wallet-detail{
        background: #fff;
        .icon-danger{
            float: left;
            width: 20px;
            height: 20px;
            margin:0 10px 0 0;
            background-image: url("../images/10.icon_An_error .svg");
            background-size: 20px 20px;
            background-repeat: no-repeat;
            background-position: center;
        }
        .load-more{
            margin-top:30px;
            text-align: center;
            font-size: 12px;
            color: #9EABBE;
            cursor:pointer;
        }
        .wallet-trade-wrapper{
            height:calc(~"100% - 151px");
            overflow-y: auto;
        }
        .padd-lt{
            padding: 0 0 0 14px;
        }
        // .trade-con{
        //     height: 100%;
        //     overflow-y: auto;
        // }
    }
    .dan{
        color: #F32E25;
    }
    .wallet-detail-wrapper{
        padding:14px 30px 2px 14px;
        min-height: 109px;
        display: flex;
        // box-shadow: 0 4px 6px 0 rgba(48,48,77,0.05), 0 2px 4px 0 rgba(148,148,197,0.05);
        font-size: 12px;
        color: #24272B;
        .wallet-name{
            font-size: 14px;
            color: #24272B;
            font-weight:600;
            word-break: break-all;
        }
        .balance{
            padding-left:18.2px;
            background:url("../images/icon_wallet.svg") no-repeat left center;
        }
        .address{
            padding-left:18.2px;
            background:url("../images/icon_positioning.svg") no-repeat left center;
        }
        .icon-bg{
            background: url("../images/icon_user.png") no-repeat center center;
            background-size: contain;
        }
        .wallet-icon{
            width: 40px;
            height: 40px;
            margin: 21px 12px 0 0;
            background-repeat:no-repeat;
            background-position: center center;
            background-size: contain;
        }
        .wallet-detail-info{
            flex-grow:1;
            p{
                margin-bottom: 12px;
            }
        }
        .wallet-operate{
            margin-top:30px;
            width:170px;
            min-width:170px;
            display:flex;
            justify-content: space-between;
            >li{
                padding-top:32px;
                cursor:pointer;
            }
            .send{
                background: url("../images/icon_send.svg") no-repeat top center;
                background-size: 20px 20px;
            }
            .receive{
                background: url("../images/icon_receive.svg") no-repeat top center;
                background-size: 20px 20px;
            }
            .copy{
                background: url("../images/icon_copy.svg") no-repeat top center;
                background-size: 20px 20px;
            }
            .more{
                padding-top: 32px;
                cursor:pointer;
                background: url("../images/icon_more.svg") no-repeat top center;
                background-size: 20px 20px;
            }
        }
    }
    .mb-10{
        margin-bottom: 10px;
    }
    .non-rec{
        padding-left:14px;
        margin-top:8px;
        font-size: 12px;
        color: #9EABBE;
        letter-spacing: 0.43px;
    }
    .modal{
       .modal-main{
           width:483px;
            .modal-content{
                padding:20px 20px;
            }
            .el-input{
                width:100%;
            }
       }
       .wallet-address{
           height: 37px;
           padding: 0 20px;
           margin: 0 -20px 14px;
           line-height: 37px;
           background: #ECF1F8;
           &.delete{
               margin-bottom: 10px;
           }
       }
       .modal-info6{
           position: relative;
           padding: 0 0 0 14px;
            margin: 0 0 10px 0;
            &::before{
                position: absolute;
                content: ' ';
                top: 0;
                left: 0;
                width: 12px;
                height: 100%;
                margin: 0 4px 0 0;
                background: url('../images/icon_Anerror.svg') no-repeat left 3px;
            }
            color: #FFBA01;
        }
    }
    .modify-psw{
        .modal-main{
            .modal-btn{
                padding-right:20px;
                height:48.5px;
                line-height:48.5px;
                .el-button{
                    margin-left:40px;
                    width:79px;
                    height:32px;
                    padding:0;
                    font-size:12px;
                }
            }
        }
    }
   .tab-list{
        margin: 0 14px;
        border-top: 1px solid #D3D8E1;
       i{
           margin:  0 5px 0 0;
           float: left;
           width: 16px;
           height: 20px;
           background-repeat: no-repeat;
           background-position: center 1px;
       }
       .icon-record{
           background-image: url("../images/18.icon_Transactions2.svg")
       }
       .icon-send{
           background-image: url("../images/18.icon_Send.svg")
       }
       .icon-accept{
           background-image: url("../images/18.icon_Receive.svg")
       }
       >li{
           margin: 14px 30px 0 0;
           padding: 0 0 2px;
           float: left;
           font-size: 12px;
           cursor: pointer;
           border-bottom: 2px solid #fff;
       }
       li:hover,.select{
            color: #0077FF;

            .icon-record{
                background-image: url("../images/18.icon_Transactions.svg")
            }
            .icon-send{
                background-image: url("../images/18.icon_Send2.svg")
            }
            .icon-accept{
                background-image: url("../images/18.icon_Receive2.svg")
            }
        }
        .select{
            font-weight: 600;
            border-bottom: 2px solid #0077FF;
        }
    }
    .modal.modal-copy{
        .modal-main {
            .modal-content {
                padding: 20px 20px 60px;
            }
        }
    }
</style>
<style lang="less">
    .el-tooltip__popper{
        width: 118px;
        text-align: center;
    }
    .wallet-detail{
        .modify-psw{
            .el-form-item{
                margin-bottom:10px;
            }
            .el-form-item__error{
                padding-left:15px;
                position:static;
                &::before{
                    top: auto;
                    bottom: 0;
                    left: 0px;
                }
            }
        }
        .confirm-modal{
            .error-info{
                padding-left: 15px;
                &::before{
                    top: auto;
                    left: 20px;
                }
            }
        //     .el-form-item__error{
        //         padding-left:15px;
        //         position:static;
        //         &::before{
        //             bottom: 0;
        //             left: 0px;
        //         }
        //     }
        }
    }
    .el-popover{
        top:149px!important;
        left:unset!important;
        right:30px;
        padding:0;
        min-width: 130px;
        border-radius:4px;
        p{
            height:37px;
            line-height:37px;
        }
    }
    .more-popper{
        .popper__arrow{
            left:95px!important;
        }
    }
    // .popper__arrow{
    //     left:55px
    // }
</style>


