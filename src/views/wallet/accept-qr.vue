<template>
    <div class="accept-transcation">
        <div>
            <p class="mb-10 bold f12">{{$t("wallet.walletAddress")}}</p>
            <p class="item" ref="addressItem">{{wallet.address}}<span @click="doCopy(wallet.address)">{{$t('wallet.copy')}}</span></p>
            <p
                class="mb-10 bold f12"
                v-if="!wallet.type"
            >{{$t("wallet.walletpubKey")}}
            </p>
            <p
                class="item"
                v-if="!wallet.type"
                 ref="publicKey"
            >{{wallet.publicKey}}
                <span @click="copyConfirm(wallet.publicKey)">{{$t('wallet.copy')}}</span>
            </p>
        </div>
        <div class="qr">
            <p class="pt-20 mb-10">{{$t("wallet.QRCode")}}</p>
            <qriously
                v-if="wallet.address"
                :value="wallet.address"
                :size="120"
            />
        </div>
        <div
            class="modal diff-modal"
            v-if="isTest"
        >
            <div class="modal-main">
                <div class="modal-title">
                    {{$t('wallet.warning')}}
                    <span
                        class="modal-close"
                        @click="handleCancel"
                    ></span>
                </div>
                <div class="modal-content f12">
                    <p class="icon-danger"></p>
                    <p class="mb-10">{{$t('wallet.warningTxt')}}</p>
                </div>
                <div class="modal-btn">
                    <el-button
                        @click="handleCancel"
                    >{{$t('form.cancel')}}</el-button>
                    <el-button
                        @click="copyConfirm()"
                        type="primary"
                    >{{$t('form.sure')}}</el-button>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
// import VueQr from 'vue-qr';
import keyManager from "@/services/key-manager";
import { mapGetters, mapActions } from "vuex";

export default {
    name: "o-wallet-accept-qr",
    components: {
        // VueQr
    },
    data() {
        return {
            wallet: {
                address: "",
                pubKey: ""
            },
            publicKey: null,
            isTest: false,
            txt:''
        };
    },
    created() {
        this.getAllWallets();
    },
    mounted() {
        this.init();
        this.$refs.addressItem.addEventListener('copy',(e)=> {
            e.preventDefault();
            e.stopPropagation();
            this.doCopy(this.wallet.address);
        })
        this.$refs.publicKey.addEventListener('copy',(e)=> {
            e.preventDefault();
            e.stopPropagation();
            this.copyConfirm(this.wallet.publicKey);
        })
    },
    computed: {
        ...mapGetters(["allWalletList", "curWallet", "network"])
    },
    methods: {
        ...mapActions(["getAllWallets"]),
        init() {
            let _this = this;
            let curWalletArr = this.allWalletList.filter(item => {
                return item.address == _this.curWallet;
            });
            if (curWalletArr.length > 0) {
                _this.wallet = curWalletArr[0];
            }
        },
        doCopy(txt) {
            if (this.network.type == "main") {
                this.copyConfirm(txt);
            } else {
                this.isTest = true;
                this.txt=txt
            }
        },
        publicKeyCopy(){
            this.$message.success(this.$t('wallet.copySuccess'));
        },
        copyConfirm(txt){
            const copyText=txt||this.txt
            this.$copyText(copyText).then((e) => {
                this.$message.success(this.$t('wallet.copySuccess'));
                this.isTest = false
            }, function (e) {
                this.$message.error(this.$t('wallet.copyFail'));
                this.isTest = false
            })
        },
        handleCancel(){
            this.isTest = false;
        },
    },
    watch: {
        curWallet: function() {
            this.init();
        }
    }
};
</script>

<style lang="less" scoped>
.accept-transcation {
    display: flex;
    justify-content: space-between;
    padding-top: 20px;
    .mb-10 {
        margin-bottom: 10px;
    }
    .qr {
        font-size: 12px;
        margin: 0 85px;
    }
    .item {
        position: relative;
        width: 385px;
        margin: 0 0 15px;
        padding: 10px 70px 10px 10px;
        background: #ecf1f8;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        word-wrap: break-word;
        min-height: 36px;
        span {
            position: absolute;
            right: 10px;
            top: 10px;
            color: #525768;
            font-weight: normal;
            cursor: pointer;
            &:hover {
                color: #0077ff;
            }
        }
    }
    .modal {
        .modal-main {
            width: 483px;
            .modal-content {
                padding: 20px 20px 60px;
            }
            .el-input {
                width: 100%;
            }
        }
    }
    .icon-danger{
        float: left;
        width: 20px;
        height: 20px;
        margin:0 10px 0 0;
        background-image: url("images/10.icon_An_error .svg");
        background-size: 20px 20px;
        background-repeat: no-repeat;
        background-position: center;
    }
}
</style>
