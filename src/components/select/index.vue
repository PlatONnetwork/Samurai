<template>
    <div class="select-self" :style="{width:sWidth+'px'}"  ref="sel-ref" style="-webkit-app-region: no-drag">
        <span class="model" @click="selBtn" :style="{fontSize:page=='/trade-list'?'15px':'16px'}">
            {{sel}}
            <i class="el-icon-caret-top" v-if="showOptions"></i>
            <i class="el-icon-caret-bottom" v-else></i>
        </span>
        <ul v-if="showOptions" :style="{minWidth:sWidth>100?sWidth:100+'px'}">
            <li v-for="item in optionVs" @click="selOption(item)" :class="[((item.address==curWallet&&sel==item.account) || (item.address==''&&sel==$t('wallet.allWallet')))?'active':'']">
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
                showOptions:false
            }
        },
        props:(['optionVs','defaultSel']),
        computed:{
            ...mapGetters(['curWallet']),
            page: function(){
                 return this.$route.path
            }
        },
        watch:{
            'curWallet':function(val){
                this.getWalletByAddress(val).then((wallet)=>{
                    if(wallet){
                        this.sel = wallet.account;
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
            }
        },
        mounted(){
           this.init();
        },
        methods: {
            ...mapActions(['updateCurWallet','getWalletByAddress']),
            init(){
                console.log('init',this.curWallet,this.sel);
                if(this.defaultSel && !/^\s*$/g.test(this.defaultSel)){
                    this.getWalletByAddress(this.defaultSel).then((wallet)=>{
                        this.sel = wallet.account;
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
                this.sel = val.account;
                this.showOptions = false;
                this.updateCurWallet(val.address);
                this.$emit('back',val);
            },
            changeSelWidth(){
                console.log('changeSelWidth----',this.sel);
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
                        this.sWidth = 100;
                    }
                }
                if(avail){
                    let len=0;
                    for(let key in avail){
                        if(/[\u4e00-\u9fa5]/.test(avail[key])){
                            len+=17;
                        }else if(/[0-9]/.test(avail[key])){
                            len+=13;
                        }else if(/\s/.test(avail[key])){
                            len+=-3;
                        }else{
                            len+=11.2;
                        }
                    }
                    this.sWidth = len+20;
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
                top:14px;
                // color:#bfcbd9;
                // font-size:10px;
                font-size:12px;
            }
        }
        ul{
            position:absolute;
            top:31px;
            left:0;
            z-index:999;
            padding:12px 0;
            width:auto;
            background-color:#fff;
            border: 1px solid #D3D8E1;
            box-shadow: 0 2px 4px 0 rgba(0,0,0,0.10);
            li{
                padding:0 10px;
                height:36px;
                line-height:36px;
                font-size: 12px;
                color: #525768;
                cursor:pointer;
                white-space: nowrap;
                &:hover{
                     background: #e4e8f1;
                 }
            }
            .active{
                color:#fff;
                background-color: #20a0ff;
                &:hover{
                     color:#fff;
                     background-color: #1c8de0;
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
    }

</style>

