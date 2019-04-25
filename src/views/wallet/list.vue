<template>
    <div class="wallet format-style">
        <div class="wallet-header">
            <ul class="tab-list clearfix">
                <li
                    class="item1"
                    @click="$router.push('/o-wallet-new')"
                >{{$t('wallet.createIndividualWallet')}}</li>
                <li
                    class="item2"
                    @click="$router.push('/o-wallet-import')"
                >{{$t('wallet.importIndividualWallet')}}</li>
                <li
                    class="item3"
                    :class="{disabled:disabled}"
                    @click="createSharedWallet"
                >{{$t('wallet.createSharedWallet')}}</li>
                <li
                    class="item4"
                    :class="{disabled:!walletList.length}"
                    @click="joinWallet"
                >{{$t('wallet.AddSharedWallet')}}</li>
            </ul>
            <div class="wallet-info-v6">
                <div class="show-box">
                    <i
                        :class="showBalance==0?'icon-eye':'icon-hide'"
                        @click="toggleIcon"
                    ></i>
                    &nbsp;{{$t('wallet.totalBalance')}}
                </div>
                <div class="ml-30">
                    <span
                        class="bold"
                        v-show="showBalance==1"
                    >{{totalBalance}}</span>
                    <span
                        class="bold hide-money"
                        v-show="showBalance==0"
                    >***</span>
                    &nbsp;Energon
                </div>
            </div>
        </div>
        <div class="card wallet-content-box wallet-content-box-ord">
            <div class="ordinary-wallet-title">
                <i class=""></i>
                {{$t('wallet.individual')}}
            </div>
            <p class="info">{{$t('wallet.individualText')}}</p>
            <ul class="wallet-list clearfix wallet-list-my">
                <li
                    class="fl"
                    v-for="(item) in walletList"
                    :key="item.address"
                    @click="goToDetail(item)"
                >
                    <i
                        class="wallet-icon"
                        :class="item.icon"
                    >{{item.account.slice(0,1).toUpperCase()}}</i>
                    <div class="wallet-info">
                        <p
                            class="name"
                            :title="item.account&&item.account.length>16?item.account:''"
                        >{{item.account | sliceName}}</p>
                        <p class="i-wallet">
                            <span class="font14 bold">{{item.balance?item.balance:'-'}}</span>&nbsp;
                            <span class="font10">Energon</span>
                        </p>
                        <p
                            class="addr"
                            :title="item.address"
                        >
                            {{item.address?item.address:$t('settings.customNet.creating')}}
                        </p>
                    </div>
                </li>
                <li class="fl add-item" v-if="!walletList.length">
                    <i class="wallet-icon wallet-icon-add1"></i>
                    <div class="wallet-info">
                        <p class="name">{{$t('wallet.add')}}</p>
                        <div class="btn-box">
                            <el-button
                                @click="$router.push('/o-wallet-new')"
                            >{{$t("form.create")}}
                            </el-button>
                            <el-button type="primary" @click="$router.push('/o-wallet-import')">{{$t("wallet.import")}}</el-button>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        <div class="card wallet-content-box wallet-content-box-ord">
            <div class="share-wallet-title">
                <i class=""></i>
                {{$t('wallet.shared')}}
            </div>
            <p class="info">{{$t('wallet.sharedText')}}</p>
            <ul class="wallet-list clearfix wallet-list-my">
                <li
                    class="fl"
                    :class="{'share-wallet-creating':(!item.address || item.state==0),'disabled-build':!item.address || item.state==0}"
                    v-for="(item) in shareWalletList"
                    :key="item.address"
                    @click="goToDetail(item)"
                >
                    <i
                        class="wallet-icon wallet-share"
                        :class="item.icon"
                    >{{item.account.slice(0,1).toUpperCase()}}</i>
                    <div class="wallet-info">
                        <p
                            class="name"
                            :title="item.account&&item.account.length>16?item.account:''"
                        >{{item.account | sliceName}}</p>
                        <p class="i-wallet">
                            <span class="font14 bold">{{item.balance?item.balance:'-'}}</span>&nbsp;
                            <span class="font10">Energon</span>
                        </p>
                        <p
                            class="addr"
                            :title="item.address"
                        >
                            {{item.address?item.address:$t('settings.customNet.creating')}}
                        </p>
                    </div>
                    <p class="process" v-if="!item.address || item.state==0">
                        <span :style="{width:item.processWidth+'%'}"></span>
                    </p>
                </li>
                <li class="fl add-item"  v-if="!shareWalletList.length">
                    <i class="wallet-icon wallet-icon-add1"></i>
                    <div class="wallet-info">
                        <p class="name">{{$t('wallet.AddSharedWallet')}}</p>
                        <div class="btn-box">
                            <el-button
                                @click="createSharedWallet"
                                :class="{disabled:disabled}"
                            >{{$t("form.create")}}
                            </el-button>
                            <el-button
                                type="primary"
                                @click="joinWallet"
                                :class="{disabled:!walletList.length}"
                            >{{$t("wallet.addShare")}}</el-button>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import contractService from "@/services/contract-servies";
import { remote } from "electron";

export default {
    name: "ordinary-wallet",
    data() {
        return {
            curIndex: 1,
            showBalance: 1,
            walletList: [],
            shareWalletList: [],
            balanceTasksTimer: null,
            disabled: true
        };
    },
    computed: {
        ...mapGetters([
            "WalletListGetter",
            // 'shareWalletList',
            "network",
            "nodeState",
            "lang",
            "walletType",
            "totalBalance",
            "initParams"
        ])
    },
    mounted() {
        this.curIndex = this.walletType;
        this.WalletListAction().then(() => {
            this.init();
        });
        let local = window.localStorage.getItem("balanceShow")
            ? window.localStorage.getItem("balanceShow")
            : 1;
        window.localStorage.setItem("balanceShow", local);
        this.showBalance = local;
    },
    methods: {
        ...mapActions([
            "WalletListAction",
            "updateCurWallet",
            "updateWalletType",
            "getOrd",
            "getTotalBalance",
            "insertShareAddress",
            "getWalletByAddress",
            "loadKeyStore",
            "deleteShare",
            "deleteInitParam",
            "saveTractRecord",
            "getShare"
        ]),
        init() {
            // if (this.curIndex == 1) {
            this.loadKeyStore().then(()=>{
                this.WalletListAction().then(() => {
                    this.walletList = this.WalletListGetter;
                    if (this.walletList) {
                        this.getTotalBalance();
                        this.getBalance();
                    }
                    clearInterval(this.balanceTasksTimer);
                    this.balanceTasksTimer = setInterval(() => {
                        this.getBalance();
                        this.getShareBalance();
                    }, 5 * 1000);
                });
                this.getOrd().then(data => {
                    console.log('this.getOrd',data.length , this.totalBalance)
                    this.disabled =
                        data.length && this.totalBalance-1 >= 0 ? false : true;
                });
                this.getShare().then(res => {
                    this.shareWalletList = res;
                    this.getTotalBalance();
                    this.getShareBalance();
                });
            });
            // }

        },
        newWallet() {
            if (this.curIndex == 1) {
                this.$router.push("/o-wallet-new");
            } else {
                this.getOrd().then(data => {
                    if (data.length == 0) {
                        this.$message.warning(this.$t("wallet.tip2"));
                    } else if (this.totalBalance == 0) {
                        this.$message.warning(this.$t("wallet.tip1"));
                    } else {
                        this.$router.push("/o-wallet-new-share");
                    }
                });
            }
        },
        importWallet() {
            this.$router.push("/o-wallet-import");
        },
        createSharedWallet() {
            !this.disabled && this.$router.push("/o-wallet-new-share");
        },
        joinWallet() {
            this.walletList.length && this.$router.push("/o-wallet-share-join");
        },
        toggleIcon() {
            this.showBalance = Math.abs(this.showBalance - 1);
            window.localStorage.setItem("balanceShow", this.showBalance);
        },
        goToDetail(item) {
            if (item.type != "share") {
                this.updateWalletType(1);
                this.loadKeyStore();
                this.WalletListAction().then(() => {
                    let arr = this.WalletListGetter.filter(w => {
                        return w.address == item.address;
                    });
                    if (arr.length > 0) {
                        console.log('updateCurWallet updateCurWallet updateCurWallet');
                        this.updateCurWallet(item.address);
                        this.$router.push("/o-wallet-details");
                    } else {
                        this.$message.warning(
                            this.$t("wallet.invalidSignatures")
                        );
                        this.init();
                    }
                });
            } else {
                this.updateWalletType(2);
                if (!item.address || item.state !== 1) return;
                this.updateCurWallet(item.address);
                this.$router.push("/o-wallet-share-detail");
            }
        },
        getBalance() {
            console.log("getBalance----");
            if (!this.walletList.length) return;
            this.walletList.forEach((item, index) => {
                contractService.web3.eth.getBalance(
                    item.address,
                    (err, data) => {
                        // let balance = contractService.web3.fromWei(data.toString(10), "ether");
                        const {fromWei,toDecimal}=contractService.web3
                        let balance=fromWei(toDecimal(data), 'ether');

                        if (balance.indexOf(".") !== -1) {
                            balance = balance.slice(
                                0,
                                balance.indexOf(".") + 3
                            );
                        } else {
                            balance += ".00";
                        }
                        item.balance = balance;
                        this.$set(this.walletList, index, item);
                    }
                );
            });
            this.getTotalBalance();
            this.disabled = this.totalBalance-1 >= 0 ? false : true;
        },
        getShareBalance() {
            console.log("getShareBalance----");
            if (!this.shareWalletList.length) return;
            this.shareWalletList.forEach((item, index) => {
                if (item.address) {
                    contractService.web3.eth.getBalance(
                        item.address,
                        (err, data) => {
                            // let balance = contractService.web3.fromWei(data.toString(10),"ether");
                            const {fromWei,toDecimal}=contractService.web3
                            let balance=fromWei(toDecimal(data), 'ether');
                            if (balance.indexOf(".") !== -1) {
                                balance = balance.slice(
                                    0,
                                    balance.indexOf(".") + 3
                                );
                            } else {
                                balance += ".00";
                            }
                            item.balance = balance;
                            this.$set(this.shareWalletList, index, item);
                        }
                    );
                    if (item.state == 0) {
                        if (
                            new Date().getTime() - item.createTime >
                            2 * 60 * 1000
                        ) {
                            this.deleteInitParam(item.hash);
                            this.deleteShare(item.hash);
                            this.init();
                        } else {
                            this.initWallet(item, state => {
                                item.processWidth = 100;
                                this.insertShareAddress([
                                    {
                                        hash: item.hash,
                                        state: state,
                                        processWidth: 100
                                    }
                                ]).then(() => {
                                    this.init();
                                });
                            });
                        }
                    }
                } else {
                    contractService.web3.eth.getTransactionReceipt(
                        item.hash,
                        (err, data) => {
                            if (data) {
                                item.address = data.contractAddress;
                                item.processWidth = 50;
                                this.insertShareAddress([
                                    {
                                        hash: item.hash,
                                        address: data.contractAddress,
                                        processWidth: 50
                                    }
                                ]);
                            } else {
                                item.balance = "0.00";
                                if (
                                    new Date().getTime() - item.createTime >
                                    2 * 60 * 1000
                                ) {
                                    this.deleteInitParam(item.hash);
                                    this.deleteShare(item.hash);
                                    this.init();
                                }
                            }
                            this.$set(this.shareWalletList, index, item);
                        }
                    );
                }
            });
            this.getTotalBalance();
        },
        setImage(iconIndex) {
            this.walletIcon =
                "background: url(" +
                require("./images/Oval" +
                    Math.floor(Math.random() * 5 + 1) +
                    ".png") +
                ") no-repeat center center";
        },
        initWallet(item, cb) {
            console.log("initWallet--", item);
            if (this.initParams && this.initParams[item.hash]) {
                let prikey = this.initParams[item.hash],
                    ownersArr = item.ownersArr.map(owner => {
                        return owner.address;
                    });
                let params = [ownersArr.join(":"), item.required];
                contractService
                    .platONSendTransaction(
                        contractService.getABI(1),
                        item.address,
                        "initWallet",
                        JSON.stringify(params),
                        item.admin.address,
                        prikey,
                        false,
                        false,
                        false,
                        true,
                        2
                    )
                    .then(data => {
                        console.log("initWallet--data---", data);
                        let tradeObj = {
                            tradeTime: new Date().getTime(),
                            hash: data.hash,
                            value: 0,
                            gasPrice: 0,
                            fromAccount:
                                item.ownersArr && item.ownersArr.length > 0
                                    ? item.ownersArr[0].account
                                    : "",
                            from:
                                item.ownersArr && item.ownersArr.length > 0
                                    ? item.ownersArr[0].address
                                    : "",
                            type: "createJointWallet",
                            state: 1
                        };
                        this.saveTractRecord(tradeObj).then(() => {
                            cb(1);
                        });
                    })
                    .catch(e => {
                        cb(2);
                    });
            } else {
                cb(2);
            }
        }
    },
    watch: {
        $router: function(val, old) {
            this.WalletListAction().then(() => {
                this.init();
            });
        },
        nodeState: function(val, old) {
            if (old != 2 && val == 2) {
                this.WalletListAction().then(() => {
                    this.init();
                });
            }
        }
    },
    filters: {
        sliceName(name) {
            // let num = this.curIndex&&this.curIndex==2?12:16;
            if (name && name.length > 16) {
                return name.slice(0, 16) + "...";
            } else {
                return name;
            }
        }
    },
    beforeDestroy() {
        clearInterval(this.balanceTasksTimer);
        this.balanceTasksTimer = null;
    },
    destroyed() {
        clearInterval(this.balanceTasksTimer);
        this.balanceTasksTimer = null;
    }
};
</script>

<style lang="less" scoped>
.share-wallet-creating{
  background: #ECEFF6 !important;
}
.format-style{
    background: #fff;
    .card{
        box-shadow: none;
    }
}
.wallet-content-box.wallet-content-box-ord{
    margin-top: 0;
    padding: 14px 0 14px 10px;
    border-bottom:10px solid #F3F8FF;
}
.wallet-icon {
    margin-top: 9px;
    font-style: normal;
}
.bg-style {
    background-size: 16px 16px;
    background-repeat: no-repeat;
    background-position: center;
}
.wallet {
    .wallet-header {
        // display: flex;
        // justify-content: space-between;
        position: relative;
        padding: 2px 0;
        padding-bottom: 12px;
        background: #F3F8FF;
    }
    .tab-list {
        font-size: 12px;
        color: #525768;
        > li {
            float: left;
            padding: 0 20px 0;
            cursor: pointer;
            background: no-repeat left center;
            &:hover {
                color: #0077ff;
            }
            &.disabled {
                color: #9eabbe;
                cursor: not-allowed;
                &:hover {
                    cursor: not-allowed;
                }
            }
        }
        .item1,
        .item1.disabled:hover {
            background-image: url("./images/8.icon_Ordinary purse 2.svg");
        }
        .item1:hover {
            background-image: url("./images/8.icon_Ordinary purse 8.svg");
        }
        .item2,
        .item2.disabled:hover {
            background-image: url("./images/8.icon_Ordinary purse4.svg");
        }
        .item2:hover {
            background-image: url("./images/8.icon_Ordinary purse3.svg");
        }
        .item3,
        .item3.disabled:hover {
            background-image: url("./images/8.icon_Ordinary purse9.svg");
        }
        .item3:hover {
            background-image: url("./images/8.icon_Ordinary purse.svg");
        }
        .item4,
        .item4.disabled:hover {
            background-image: url("./images/8.icon_Ordinary purse2.svg");
        }
        .item4:hover {
            background-image: url("./images/8,icon_Ordinary purse.svg");
        }
    }
    .wallet-content {
        position: relative;
        height: calc(~"100% - 101px");
        overflow-y: auto;
        margin: 10px auto;
        padding: 20px 15px 0 15px;
        display: flex;
        /*justify-content: space-between;*/
        flex-wrap: wrap;
        align-content: flex-start;
        .wallet-item {
            position: relative;
            width: 32%;
            min-height: 130px;
            height: 25%;
            margin-right: 1.3%;
            margin-bottom: 20px;
            background: #ffffff;
            box-shadow: 0 4px 6px 0 rgba(48, 48, 77, 0.05),
                0 2px 4px 0 rgba(148, 148, 197, 0.05);
            border: 1px solid transparent;
            border-radius: 4px;
            display: flex;
            &:hover {
                border: 1px solid #00b6dc;
            }
            .info {
                width: 70%;
                p {
                    width: 94%;
                    margin-top: 14px;
                }
                .name {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
            .i-wallet {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                padding-left: 20px;
                background: url("./images/icon_wallet.svg") no-repeat left
                    center;
            }
            .i-address {
                padding-left: 20px;
                background: url("./images/icon_positioning.svg") no-repeat left
                    2px;
            }
            .addr-box {
                width: 100%;
                .addr {
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    word-break: break-all;
                    overflow: hidden;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }
            }
            .font14 {
                font-size: 14px;
            }
            .font10 {
                font-size: 10px;
                color: #22272c;
            }
            .font12 {
                font-size: 12px;
            }
        }
        .wallet-share {
            background: url("./images/icon_Shared.svg") no-repeat left top;
            cursor: pointer;
        }
        .unabled {
            background-color: rgba(235, 239, 247, 0.5);
            cursor: default;
        }
        .creating {
            background: url("./images/icon_Shared_creating.svg") no-repeat left
                top rgba(235, 239, 247, 0.5);
        }
        .add-item {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            width: 100%;
            height: 100%;
            padding-left: 16px;
            margin-left: auto;
            background-image: url("./images/card_bg.png");
            // background-size: 230px 130px;
            background-size: 100% 100%;
            background-repeat: no-repeat;
        }
        .i-add {
            height: 40px;
            line-height: 40px;
            margin-bottom: 44px;
            text-indent: 20px;
            background: url("./images/icon_add.svg") no-repeat left center;
        }
    }
    .ml-30 {
        height: 20px;
    }
    .icon-eye {
        margin-left: 8px;
        cursor: pointer;
        background-image: url("./images/icon-eye.svg");
        .bg-style;
        -webkit-app-region: no-drag;
    }
    .icon-hide {
        margin-left: 8px;
        cursor: pointer;
        background-image: url("./images/icon-hide.svg");
        .bg-style;
        -webkit-app-region: no-drag;
    }
}

.wallet-info-v6 {
    margin-bottom: 8px;
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 99;
    text-align: right;
    .ml-30 {
        font-size: 10px;
    }
    .bold {
        font-size: 16px;
    }
    .show-box {
        height: 16px;
        line-height: 16px;
        font-size: 12px;
        z-index: 999;
        i {
            position: relative;
            top: 3px;
            width: 16px;
            height: 16px;
            font-size: 16px;
            display: inline-block;
        }
    }
}
.wallet-content-box {
    margin: 0 auto;
    /*margin-bottom: 10px;*/
    padding: 14px 10px 10px;
    overflow-y: auto;
    .info {
        margin: 10px 0 0 0;
        font-size: 12px;
        color: #9eabbe;
        letter-spacing: 0;
    }
}
.ordinary-wallet-title,
.share-wallet-title {
    padding: 0 6px 0 0;
    display: inline-block;
    // width: 113px;
    height: 26px;
    line-height: 26px;
    background: #eceff6;
    border-radius: 2px;
    font-size: 12px;
    font-weight: bold;
    text-align: right;
    > i {
        float: left;
        margin:5px 6px;
        width: 16px;
        height: 16px;
        background: no-repeat center;
    }
}
.ordinary-wallet-title {
    > i {
        background-image: url("./images/ordinary purse 5.svg");
    }
}
.share-wallet-title {
    > i {
        background-image: url("./images/ordinary purse6.svg");
    }
}
.wallet-list-my .wallet-icon{
    margin-top: 15px;
}
.wallet-list {
    justify-content: space-between;
    flex-wrap: wrap;
    > li {
        display: flex;
        position: relative;
        margin: 14px 14px 0 0;
        padding: 10px;
        background: #ffffff;
        box-shadow: 0 1px 4px 0 #e5e9f2;
        border-radius: 5px;
        width: 240px;
        height: 90px;
        border: 1px solid transparent;
        cursor: pointer;
        &:hover {
            border: 1px solid #0077FF;
        }
        &:nth-child(3n) {
            margin-right: 0px;
        }
    }

    .wallet-info {
        width: 178px;
        padding: 0 0 0 7px;
    }
    .name {
        font-weight: 700;
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .i-wallet {
        padding: 8px 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .addr {
        font-size: 10px;
        text-overflow: ellipsis;
        // word-break: break-all;
        overflow: hidden;
        white-space: nowrap; //溢出不换行
    }
    .font14 {
        font-size: 14px;
    }
    .font10 {
        font-size: 10px;
        color: #22272c;
    }
    .font12 {
        font-size: 12px;
    }
    .btn-box{
        display: flex;
        justify-content: space-between;
        padding: 16px 0 0;
    }
    .el-button{
        height: 32px;
    }
    .disabled-build{
        background: #ECEFF6;
        box-shadow: 0 1px 4px 0 #E5E9F2;
        cursor: not-allowed;
    }

}
li.add-item{
    cursor:default;
    .disabled {
        // color: #9eabbe;
        opacity: 0.5;
        cursor: not-allowed;
        // border-width: 0px;
        &:hover {
            cursor: not-allowed;
        }
        .el-button{
            cursor: not-allowed;
        }
    }
}
.wallet-icon-add1 {
    background: url("./images/8,icon_Ordinary purse11.svg")
        rgba(158, 171, 190, 0.2) no-repeat center;
    border: 1px solid #9eabbe;
}
.wallet-icon-add2 {
    background: url("./images/8,icon_Ordinary purse12.svg")
        rgba(158, 171, 190, 0.2) no-repeat center;
    border: 1px solid #9eabbe;
}
// .wallet-add {
//     width: 32%;
//     height: 25%;
//     // margin: 0 0 0 15px;
//     .el-button {
//         width: 79px;
//         height: 32px;
//         padding: 0;
//     }
// }
.font10 {
    .el-button {
        font-size: 10px;
    }
}
.empty {
    width: 32%;
}
.hide-money{
    vertical-align: middle;
    margin-top: 2px;
    display: inline-block;
}
</style>
<style lang="less">
.non-wallet {
    background: url("./images/empty.png") no-repeat center 90px #fff !important;
}
.add-bottom {
    position: fixed;
    bottom: 20px;
    left: 168px;
    margin: 0 20px;
    width: calc(~"100% - 200px");
    height: 60px;
    line-height: 60px;
    text-align: center;
    background-color: #fff;
    box-shadow: 0 3px 6px 0 rgba(148, 148, 197, 0.1);
    &:before {
        content: "";
        position: absolute;
        top: 0;
        left: 15px;
        width: calc(~"100% - 40px");
        height: 1px;
        border-top: solid 1px #d3d8e1;
    }
    .ml-40 {
        margin-left: 142px;
    }
    .el-button {
        width: auto;
        padding: 0 15px;
    }
}
</style>
