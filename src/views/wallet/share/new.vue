<template>
    <div class="wallet-new-share format-style">
        <div class="card wallet-content">
            <div
                v-if="active==1"
                class="box"
            >
                <el-form
                    class=""
                    ref="newWallet"
                    :rules="newRules"
                    :model="newWallet"
                    label-position="top"
                >
                    <el-form-item
                        prop="account"
                        :label="$t('wallet.walletName')"
                    >
                        <el-input
                            v-model.trim="newWallet.account"
                            :placeholder="$t('wallet.sharedWalletName')"
                        ></el-input>
                    </el-form-item>
                    <el-form-item
                        prop="admin"
                        :label="$t('wallet.walletOwner')"
                    >
                        <el-select v-model="newWallet.admin" @change="changeAdmin" :placeholder="$t('wallet.selectHint')">
                            <el-option
                                v-for="ord in ordWalletList"
                                :value="ord.address"
                                :label="(ord.account.length>10?(ord.account.slice(0,10)+'...'):ord.account)+'-'+ord.balance+' Energon'"
                                :key="ord.address"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <div class="owners">
                            <p class="label">{{$t('wallet.sharedOwners')}}({{newWallet.owners.length}})</p>
                            <div
                                v-for="(owner,idx) in newWallet.owners"
                                :key="idx"
                            >
                                <p class="flex">
                                    <span class="account">
                                        <el-input
                                            v-model.trim="owner.account"
                                            :disabled="idx==0"
                                            @change="testOwners"
                                            :placeholder="$t('wallet.ownerAccount')"
                                        ></el-input>
                                    </span>
                                    <span class="address">
                                        <el-input
                                            v-model.trim="owner.address"
                                            :disabled="idx==0"
                                            @change="testOwners"
                                            :placeholder="$t('wallet.ownerAddress')"
                                        ></el-input>
                                    </span>
                                    <span
                                        class="icon-btn del-btn"
                                        @click="addOwner(1,idx)"
                                        v-if="idx>1"
                                    ></span>
                                    <span
                                        class="icon-btn add-btn"
                                        @click="addOwner(2)"
                                        v-if="idx+1==newWallet.owners.length&& newWallet.owners.length<8"
                                    ></span>
                                    <span
                                        class="icon-btn dis-add-btn"
                                        v-if="idx+1==newWallet.owners.length&& newWallet.owners.length>=8"
                                    ></span>
                                </p>
                                <p
                                    v-if="tipIndex.indexOf(idx)!==-1"
                                    class="tip"
                                >{{tipTxt[idx]}}</p>
                            </div>
                        </div>
                    </el-form-item>
                </el-form>
                <p class="btn-box">
                    <el-button
                        type="primary"
                        @click="next('newWallet')"
                    >{{$t('form.next')}}</el-button>
                    <el-button
                        :class="[lang=='en'?'':'letterSpace']"
                        @click="goBack"
                    >{{$t("form.cancel")}}</el-button>
                </p>
            </div>
            <div
                class="box2"
                v-if="active==2"
            >
                <div class="wallet-info" :class="{'zh-info':lang=='zh'}">
                    <p class="title">
                        <span class="label">{{$t("wallet.walletName")}}&nbsp;:</span>
                        <span class="value bold">{{newWallet.account}}</span>
                    </p>
                    <p class="title">
                        <span class="label">{{$t('wallet.sharedOwners')}}&nbsp;:</span>
                        <span class="value bold">{{newWallet.owners.length}}</span>
                    </p>
                    <p
                        v-for="(owner,index) in newWallet.owners"
                        class="owner" :key="index"
                    >
                        <span>{{index+1}}</span>
                        <span class="bold">{{owner.account}}</span>
                        <span>{{owner.address}}</span>
                    </p>
                    <p class="required">{{$t('wallet.requiredNum')}}</p>
                    <p>
                        <el-select v-model="signNum" :placeholder="$t('wallet.selectHint')">
                            <el-option
                                v-for="a in signNumOptions"
                                :value="a"
                                :label="a"
                                :key="a"
                            ></el-option>
                        </el-select>
                    </p>
                </div>
                <p
                    class="btn-box"
                    v-if="active==2"
                >
                <el-button
                    :class="[lang=='en'?'':'letterSpace']"
                    type="primary"
                    @click="create('newWallet')"
                >{{$t('form.create')}}</el-button>
                <el-button
                    @click="backStep"
                >{{$t('form.back')}}</el-button>
            </p>
            </div>

        </div>

        <div
            class="modal create-confirm diff-modal"
            v-if="createConfirm"
        >
            <div class="modal-main">
                <div class="modal-title">
                    {{$t('wallet.createSharedWallet')}}
                    <span
                        class="modal-close"
                        @click="createConfirm=false"
                    ></span>
                </div>
                <div class="modal-content">
                    <div class="content">
                        <!-- <p>{{$t('wallet.amount')}}<span class="txt">0 Energon</span></p> -->
                        <p>{{$t('contracts.executeFrom')}} <span class="txt">
                            <i :class="['trade-wallet-icon',newWallet.owners[0]?newWallet.owners[0].icon:'']">{{newWallet.owners[0].account.slice(0,1).toUpperCase()}}</i>
                            {{newWallet.owners[0]?newWallet.owners[0].account:''}}</span>
                        </p>
                        <!-- <p>To <span class="txt">{{$t('trade.contractCreation2')}}</span></p> -->
                        <p>{{$t('wallet.fee')}} <span class="txt">{{price}} Energon</span></p>
                    </div>
                    <p class="psw-box">
                        <el-input
                            v-model.trim="psw"
                            :disabled="createLoading"
                            :placeholder="$t('wallet.input')+newWallet.owners[0].account+$t('wallet.walletPsw')"
                            type="password"
                        ></el-input>
                    </p>
                </div>
                <div class="modal-btn">
                    <el-button
                        :class="[lang=='en'?'':'letterSpace']"
                        @click="createConfirm=false"
                        :disabled="createLoading"
                    >{{$t("form.cancel")}}</el-button>
                    <el-button
                        :class="[lang=='en'?'':'letterSpace']"
                        @click="confirmCreate"
                        type="primary"
                        :disabled="!psw"
                        :loading="createLoading"
                    >{{$t("form.submit")}}</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import keyManager from "@/services/key-manager";
import { mapActions, mapGetters } from "vuex";
import formServies from "@/services/API-form";
import contractService from "@/services/contract-servies";
import mathService from "@/services/math";

export default {
    name: "o-wallet-create-share",
    data() {
        return {
            active: "1",
            ordWalletList: [],
            newWallet: {
                account: "",
                admin: "",
                owners: [
                    {
                        account: "",
                        address: ""
                    },
                    {
                        account: "",
                        address: ""
                    }
                ]
            },
            signNum: 0,
            tipIndex: [],
            tipTxt: {},
            // newRules: {
            //     account: [
            //         {required: true, message: this.$t('wallet.nonSharedName'), trigger: 'blur,change'},
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
                account: "",
                address: "",
                pubKey: "",
                sign: "",
                priKey: ""
            },
            createConfirm: false,
            psw: "",
            contract: null,
            gas: 0,
            gasPrice: 0,
            price: 0,
            gasN: 0,
            signNumOptions: [],
            createLoading: false,
            gasLoading: false,
            allWallets:[]
        };
    },
    computed: {
        ...mapGetters(["network", "lang"]),
        newRules() {
            return {
                account: [
                    {
                        required: true,
                        validator:this.checkAccount,
                        trigger: "blur,change"
                    }
                ],
                password: [
                    {
                        required: true,
                        message: this.$t("form.nonPsw"),
                        trigger: "blur,change"
                    },
                    {
                        min: 6,
                        message: this.$t("form.less6"),
                        trigger: "blur,change"
                    }
                ],
                passwordConfirm: [
                    { validator: this.checkPass, trigger: "blur,change" }
                ]
            };
        }
    },
    created() {
        this.getAllWallets().then(res=>{
            this.allWallets=res
        })
    },
    mounted() {
        this.getBalOrd().then(data => {
            data.sort(function(a, b) {
                let value1 = a["createTime"];
                let value2 = b["createTime"];
                return value1 - value2;
            });
            this.ordWalletList = JSON.parse(JSON.stringify(data));
        });
    },
    methods: {
        ...mapActions([
            "WalletListAction",
            "updateWalletInfo",
            "getBalOrd",
            "isAtLocal",
            "isSharedWallet",
            "updateInitParams",
            "saveTractRecord",'getAllWallets'
        ]),
        checkPass(rule, value, callback) {
            if (value === "") {
                callback(new Error(formServies.notEmpty(value).msg));
            } else if (value !== this.newWallet.password) {
                callback(new Error(this.$t("form.disMatch")));
            } else {
                callback();
            }
        },
        checkAccount(rule, value, callback){
            if(!value){
                callback(new Error( this.$t('wallet.nonSharedName')))
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
        next(name) {
            let _this = this;
            this.$refs[name].validate(valid => {
                if (valid) {
                    (async function() {
                        let ret = await _this.testOwners();
                        if (ret) {
                            _this.active = 2;
                            _this.signNum =
                                _this.newWallet.owners.length > 2
                                    ? _this.newWallet.owners.length - 1
                                    : 2;
                            _this.signNumOptions = [];
                            for (
                                let i = 2;
                                i < _this.newWallet.owners.length + 1;
                                i++
                            ) {
                                _this.signNumOptions.push(i);
                            }
                        }
                    })();
                }
            });
        },
        backStep() {
            this.active = 1;
        },
        goBack() {
            this.$router.push("/home");
        },
        addOwner(num, idx) {
            if (num == 2) {
                this.newWallet.owners.push({
                    account: "",
                    address: ""
                });
            } else {
                if (this.tipIndex && this.tipIndex.length > 0) {
                    this.testOwners();
                }
                this.newWallet.owners.splice(idx, 1);
            }
        },
        changeAdmin() {
            let arr = this.ordWalletList.filter(item => {
                return item.address == this.newWallet.admin;
            });
            if (arr.length > 0) {
                this.$set(
                    this.newWallet.owners,
                    0,
                    JSON.parse(JSON.stringify(arr[0]))
                );
            }
        },
        async testOwners() {
            return new Promise((resolve, reject) => {
                this.tipIndex = [];
                this.tipTxt = {};
                let owners = this.newWallet.owners,
                    addressList = [],
                    _this = this;
                owners.forEach((item, index) => {
                    if (/^\s*$/g.test(item.account)) {
                        _this.tipIndex.push(index);
                        if (/^\s*$/g.test(item.address)) {
                            _this.tipTxt[index] = _this.$t(
                                "wallet.newShareTip1"
                            );
                        } else {
                            _this.tipTxt[index] = _this.$t(
                                "wallet.newShareTip2"
                            );
                        }
                        resolve(false);
                    } else {
                        if (/^\s*$/g.test(item.address)) {
                            _this.tipIndex.push(index);
                            _this.tipTxt[index] = _this.$t(
                                "wallet.newShareTip3"
                            );
                            resolve(false);
                        } else if (
                            !/(0x)[0-9a-fA-F]{40}$/g.test(item.address)
                        ) {
                            _this.tipIndex.push(index);
                            _this.tipTxt[index] = _this.$t(
                                "wallet.inVaildSharedAddr"
                            );
                            resolve(false);
                        } else {
                            (async function() {
                                let ret = await _this.isSharedWallet(
                                    item.address
                                );
                                if (ret) {
                                    _this.tipIndex.push(index);
                                    _this.tipTxt[index] = _this.$t(
                                        "wallet.inVaildSharedAddr"
                                    );
                                    resolve(false);
                                } else {
                                    addressList.push(item.address);
                                    let count = 0;
                                    addressList.forEach((item, index) => {
                                        count++;
                                        if (
                                            addressList.indexOf(item) !==
                                            addressList.lastIndexOf(item)
                                        ) {
                                            _this.$message.warning(
                                                _this.$t("wallet.addrExits")
                                            );
                                            resolve(false);
                                        }
                                    });
                                    if (
                                        count == _this.newWallet.owners.length
                                    ) {
                                        resolve(true);
                                    }
                                }
                            })();
                        }
                    }
                });
            });
        },
        create() {
            //估算gas :部署合约
            if (!this.gasLoading) {
                this.gasLoading = true;
                this.getGas()
                    .then(() => {
                        this.psw = "";
                        this.createConfirm = true;
                        this.gasLoading = false;
                    })
                    .catch(e => {
                        this.gasLoading = false;
                        throw e;
                    });
            }
        },
        getOwners() {
            let arr = [];
            this.newWallet.owners.forEach(item => {
                arr.push(item.address);
            });
            return arr;
        },
        getGas(addr) {
            return new Promise((resolve, reject) => {
                this.gas = 250000000;
                contractService.web3.eth.getGasPrice((error, result) => {
                    if (error) reject(error);
                    this.gasPrice = result;
                    this.price = mathService.mul(
                        this.gas,
                        mathService.toNonExponential(
                            contractService.web3.fromWei(result, "ether")
                        )
                    );
                    resolve();
                });

                // let calcContract = contractService.web3.eth.contract(contractService.getABI(1));
                // let platONData = calcContract.new.getPlatONData(contractService.getBIN(1));
                // contractService.web3.eth.estimateGas({
                //     "from":addr,
                //     "data":platONData
                // },(err,gas)=>{
                //     console.log('估算gas--->',err,gas);
                //     if(err){
                //         throw err;
                //     }
                //     this.gas = gas;
                //     contractService.web3.eth.getGasPrice((error,result)=>{
                //         if(error) reject(error);
                //         this.gasPrice = result;
                //         this.price = mathService.mul(this.gas,mathService.toNonExponential(contractService.web3.fromWei(result,"ether")));
                //         resolve();
                //     });
                // })
            });
        },
        confirmCreate() {
            let keyobject = this.newWallet.owners[0];
            let ownersArr = JSON.parse(JSON.stringify(this.newWallet.owners));
            ownersArr[0] = {
                account: keyobject.account,
                address: keyobject.address
            };
            keyManager.recover2(keyobject, this.psw, "buf", (err, priKey) => {
                if (err) {
                    this.$message.error(this.$t("form.wrongPsw"));
                } else {
                    let params = [this.getOwners().join(":"), this.signNum];
                    this.createLoading = true;
                    contractService
                        .platONDeploy(
                            contractService.getABI(1),
                            contractService.getBIN(1),
                            keyobject.address,
                            priKey,
                            this.gas,
                            this.gasPrice
                        )
                        .then(data => {
                            this.updateInitParams({
                                hash: data.hash,
                                value: priKey
                            });
                            let tradeObj = {
                                tradeTime: new Date().getTime(),
                                hash: data.hash,
                                value: 0,
                                gasPrice: this.gasPrice,
                                fromAccount: keyobject.account,
                                from: keyobject.address,
                                type: "createJointWallet",
                                state: 0
                            };
                            this.updateWalletInfo({
                                hash: data.hash,
                                state: 0,
                                type: "share",
                                account: this.newWallet.account,
                                admin: {
                                    account: keyobject.account,
                                    address: keyobject.address
                                },
                                ownersArr: ownersArr,
                                required: this.signNum,
                                createTime: new Date().getTime(),
                                icon:
                                    "wallet-icon" +
                                    Math.floor(Math.random() * 4 + 1),
                                processWidth: 25
                            }).then(() => {
                                this.saveTractRecord(tradeObj).then(() => {
                                    this.$message.success(
                                        this.$t("wallet.createShareSuccess")
                                    );
                                    this.$router.push("/o-wallet-list");
                                });
                            });
                        })
                        .catch(e => {
                            console.log(e);
                            this.createLoading = false;
                            if (
                                e
                                    .toString()
                                    .indexOf(
                                        "insufficient funds for gas * price + value"
                                    ) !== -1
                            ) {
                                window.vueVm.$message.warning(
                                    this.$t("wallet.cannotTrans2")
                                );
                            } else {
                                this.$message.error(
                                    this.$t("wallet.createShareFail")
                                );
                            }
                        });
                }
            });
        }
    },
    filters: {
        sliceName(name) {
            if (/^\s*$/g.test(name)) {
                return this.$t("wallet.allWallet");
            }
            if (name.length > 16) {
                return name.slice(0, 16) + "...";
            } else {
                return name;
            }
        }
    },
    watch: {
        ordWalletList: function(val) {
            if (val.length > 0) {
                this.newWallet.admin = val[0].address;
                this.$set(
                    this.newWallet.owners,
                    0,
                    JSON.parse(JSON.stringify(val[0]))
                );
            }
        },
        "$i18n.locale": function(val) {
            this.testOwners();
        }
    }
};
</script>

<style lang="less" scoped>
.wallet-content {
    .el-form-item__label{
        font-weight:600;
    }
    height: 100%;
    padding-top: 14px;
    overflow-y: auto;
}
.box {
    padding: 0 14px;
    width: 580px;
}
.owners {
    > div {
        margin-bottom: 10px;
        .flex {
            display: flex;
        }
        .tip {
            text-align: left;
            line-height: 22px;
            color: #f32e25;
            font-size: 12px;
        }
    }
    .label {
        margin: 0 0 10px;
        font-size: 12px;
        line-height: 1;
        text-align: left;
        font-weight: 600;
    }
    .account {
        margin-right: 6px;
    }
}
// .new-from{
//     /*height:calc(~"100% - 120px");*/
//     margin-right:10px;
//     height:435px;
//     overflow-y: auto;
//     overflow-x: hidden;
//     .el-form{
//         width:300px;
//     }
// }
.icon-btn {
    width: 28px;
    height: 28px;
    margin: 8px 0 0 6px;
    cursor: pointer;
}
.add-btn {
    background: url("../images/add_btn.svg") no-repeat center;
    background-size: cover;
    &:hover {
        background: url("../images/28.icon_add 2.svg") no-repeat center;
    }
}
.dis-add-btn {
    cursor: not-allowed;
    background: url("../images/28.icon_Do not click.svg") no-repeat center;
}
.del-btn {
    display: inline-block;
    background: url("../images/icon_delete.svg") no-repeat center;
    background-size: contain;
    &:hover{
        background-image: url('../images/28.icon_reduce 2.svg')
    }
}
.center {
    margin: 0 auto;
}
.box2 {
    padding: 0 14px;
    // width: 456px;
    /*margin: 20px 10px 0 auto;*/
    // overflow-x: hidden;
    // overflow-y: auto;
    .wallet-info {
        &.zh-info{
            .label {
                width: 78px;
            }
        }
        // margin-left: 54px;
        // margin-top: 20px;
        // padding: 12px 14px;
        // width: 300px;
        font-size: 12px;
        .title {
            font-size: 14px;
            // color: #24272b;
            letter-spacing: 0.5px;
        }
        p {
            margin-bottom: 12px;
            color: #22272c;
            .label {
                width: 78px;
            }
        }
        .owner {
            display: flex;
            > span {
                display: inline-block;
                line-height: 18px;
                &:first-of-type {
                    min-width: 18px;
                    width: 18px;
                    height: 18px;
                    border-radius: 18px;
                    text-align: center;
                    color: #fff;
                    background-color: #4897F6;
                }
                &:nth-of-type(2) {
                    width: 60px;
                    // flex-grow: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin: 0 8px;
                }
                &:last-of-type {
                    // width: 180px;
                }
            }
        }
        .tip {
            color: #f32e25;
            .el-button {
                margin-left: 10px;
                padding: 6px 15.5px;
                font-size: 10px;
            }
        }
        .required {
            margin: 14px 0 10px;
            font-weight: 600;
        }
    }
}
.btn-box {
    // position:absolute;
    // left:0;
    // bottom:0;
    padding:0 0 20px;
    // width:calc(~"100% - 40px");
    // height:61px;
    // line-height:61px;
    // text-align:center;
    // border-top:solid 1px #D3D8E1;
    margin-top: 0;
    .el-button {
        width: 80px;
        height: 32px;
        padding: 0;
        font-size: 12px;
        // &:first-child {
        //     margin: 0 40px 0 0;
        // }
    }
    .el-button + .el-button {
        margin-left: 40px;
    }
    .cancel {
        // margin-right: 142px;
        border: 1px solid #0077ff;
        color: #0077ff;
    }
}
.create-confirm {
    .modal-main {
        width: 483px;
        font-size: 12px;
        .modal-content {
            padding: 12px 0;
            .content {
                padding: 14px 20px;
                height: 72px;
                background: #eceff6;
                p {
                    color: #24272b;
                    margin-bottom: 9px;
                    .txt {
                        float: right;
                        font-weight: 600;
                    }
                }
            }
            .psw-box {
                margin: 30px 0 18px;
                padding: 0 20px;
                .el-input {
                    width: 100%;
                }
            }
        }
    }
}
</style>
<style lang="less">
.wallet-new-share {
    .el-input {
        width: 300px;
    }
    // .el-form-item{
    //     margin-bottom:3px;
    // }
    .el-input__inner {
        height: 40px;
    }
    // .el-form-item__error{
    //     position:static;
    //     text-align: left;
    // }
    .el-form-item__label{
        // padding-bottom:10px;
        // font-size:12px;
        font-weight:600;
    }
    .el-form-item.is-required .el-form-item__label:before {
        content: "";
    }
    .account {
        .el-input {
            width: 80px;
        }
    }
    .address {
        .el-input {
            width: 214px;
        }
    }
}
</style>
