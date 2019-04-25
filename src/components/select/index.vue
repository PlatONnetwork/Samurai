<template>
    <div class="select-self" ref="sel-ref" style="-webkit-app-region: no-drag;padding-right: 14px;">
        <span :class="[page=='/trade-list'?'lit':'mid','model']" @click="selBtn">
            <span v-if="page=='/o-wallet-share-detail' || page=='/o-wallet-details'" :class="[wallet.type&&wallet.type=='share'?'wallet-share':'',wallet.icon,'trade-wallet-icon']">{{sel.slice(0,1).toUpperCase()}}</span>
            {{sel}}
            <i class="el-icon-caret-top" v-if="showOptions"></i>
            <i class="el-icon-caret-bottom" v-else></i>
        </span>
        <ul v-if="showOptions" :style="{minWidth:sWidth>100?sWidth:100+'px'}">
            <li v-for="item in optionVs" @click="selOption(item)" :class="[((item.address==curWallet&&sel==item.account) || (item.address==''&&sel==$t('wallet.allWallet')))?'active':'']" :key="item.address">
                <span v-if="page=='/o-wallet-share-detail' || page=='/o-wallet-details'" :class="[item.type&&item.type=='share'?'wallet-share':'',item.icon,'trade-wallet-icon']">{{item.account.slice(0,1).toUpperCase()}}</span>
                {{item.account}}
            </li>
        </ul>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex';

    export default {
        name: 'selectSelf',
        data () {
            return {
                sel:'',
                sWidth:0,
                showOptions:false,
                wallet:{},
                // shareWalletList:[],
            }
        },
        props:(['optionVs','defaultSel']),
        computed:{
            ...mapGetters(['curWallet','WalletListGetter']),
            page: function(){
                 return this.$route.path
            },
        },
        watch:{
            'curWallet':function(val){
                this.getWalletByAddress(val).then((wallet)=>{
                    if(wallet){
                        this.sel = wallet.account.length>16?(wallet.account.slice(0,16)+'...'):wallet.account;
                        this.wallet = wallet;
                        this.changeSelWidth();
                    }
                });
            },
            'defaultSel':function(){
                this.init();
            },
            '$i18n.locale':function(){
                if(!this.defaultSel || /^\s*$/.test(this.defaultSel)){
                    this.sel = this.$t('wallet.allWallet')
                }
                this.optionVs.map((item)=>{
                    if(/^\s*$/.test(item.address)){
                        item.account = this.$t('wallet.allWallet');
                    }
                })
                this.changeSelWidth();
            },
            WalletListGetter(){
              this.getWalletByAddress(this.curWallet).then((wallet)=>{

                    if(wallet){
                        this.sel = wallet.account.length>16?(wallet.account.slice(0,16)+'...'):wallet.account;
                        this.wallet = wallet;
                        this.changeSelWidth();
                    }
                });
            }
        },
        mounted(){
            if(this.$route.path == '/o-wallet-share-detail'){
                this.$emit('filterWallet');
            }
            this.init();
        },
        methods: {
            ...mapActions(['updateCurWallet','getWalletByAddress']),
            init(){
                if(this.defaultSel && !/^\s*$/g.test(this.defaultSel)){
                    this.getWalletByAddress(this.defaultSel).then((wallet)=>{
                        this.wallet = wallet;
                        this.sel = wallet.account.length>16?(wallet.account.slice(0,16)+'...'):wallet.account;
                        this.changeSelWidth();
                    });
                }else{
                    this.sel = this.$t('wallet.allWallet');
                    this.changeSelWidth();
                }
                document.addEventListener('click', this.hidePanelFile, false);
            },
            selBtn(){
                this.showOptions = !this.showOptions;
            },
            selOption(val){
                this.sel = val.account.length>16?(val.account.slice(0,16)+'...'):val.account;
                this.wallet = val;
                this.showOptions = false;
                this.updateCurWallet(val.address);
                this.$emit('back',val);
            },
            changeSelWidth(){
                let avail=null;
                if(this.sel && this.sel!==''){
                    if(this.sel.length>16){
                        avail = this.sel.slice(0,16);
                    }else{
                        avail = this.sel;
                    }
                }else{
                    if(this.optionVs && this.optionVs.length>0){
                        avail = this.optionVs[0].account;
                        avail = avail.length>16?avail.slice(0,16):avail;
                    }else{
                        const iconWidth = (this.page=='/o-wallet-share-detail' || this.page=='/o-wallet-details')?26:0;
                        this.sWidth = 100+iconWidth;
                    }
                }
                if(avail){
                    let len=0;
                    for(let key in avail){
                        if(/[\u4e00-\u9fa5A-Z]/.test(avail[key])){
                            len+=17;
                        }else if(/[0-9]/.test(avail[key])){
                            len+=13;
                        }else if(/[a-z]/.test(avail[key])){
                            len+=12;
                        }else if(/\s/.test(avail[key])){
                            len+=-3;
                        }else{
                            len+=8;
                        }
                    }
                    const iconWidth = (this.page=='/o-wallet-share-detail' || this.page=='/o-wallet-details')?26:0;
                    this.sWidth = len+20+iconWidth;
                }
            },
            hidePanelFile (e) {
                if (!this.$refs['sel-ref'] ||!this.$refs['sel-ref'].contains(e.target)) {
                    this.showOptions = false;
                }
            },
        }
    }
</script>

<style lang="less" scoped>
    .select-self{
        position:relative;
        margin-right:50px;
        ul{
            min-width:100px;
        }
        .model{
            padding-right:5px;
            display:block;
            width:100%;
            height:36px;
            line-height:36px;
            font-size: 16px;
            color: #24272B;
            font-weight: 600;
            letter-spacing: 0.5px;
            overflow:hidden;
            text-overflow: ellipsis;
            cursor:pointer;
            white-space:nowrap;
            i{
                position:absolute;
                right:0;
                top:15px;
                // color:#bfcbd9;
                // font-size:10px;
                font-size:12px;
            }
        }
        .lit.model{
            height:17px;
            line-height:17px;
            font-size: 12px;
            i{
                top:4px;
            }
        }
        ul{
            position:absolute;
            top:31px;
            left:0;
            z-index:999;
            padding:4px 0;
            width:auto;
            background-color:#fff;
            border: 1px solid #D3D8E1;
            // box-shadow: 0 2px 4px 0 rgba(0,0,0,0.10);
            box-shadow: 0 1px 2px 0 rgba(158,171,190,0.20);
            border-radius: 4px;
            li{
                padding:0 10px;
                height:36px;
                line-height:36px;
                font-size: 12px;
                color: #525768;
                cursor:pointer;
                white-space: nowrap;
                &:hover{
                     background: #F0F0F0;
                     color:#0077FF;
                 }
            }
            .active{
                color:#0077FF;
                background-color: #fff;
                &:hover{
                     color:#0077FF;
                     background: #F0F0F0;
                 }
            }
            /*&:before{*/
                /*content:'';*/
                /*position:absolute;*/
                /*top:-17px;*/
                /*left:15px;*/
                /*width:0px;*/
                /*height:0px;*/
                /*border-width:8px;*/
                /*border-style:dashed dashed solid dashed ;*/
                /*border-color:transparent transparent #D3D8E1 transparent;*/
             /*}*/
        }
        .trade-wallet-icon{
            position:relative;
            top:-2px;
            width:22px;
            height:22px;
            line-height:19px;
            background-position-x: 2px;
        }
    }

</style>

