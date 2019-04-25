<template>
    <div class="refresh">
        <i :class="[rotate?'Rotation':'','refresh-button']" @click="refresh"></i>
        <span class="refresh-text">{{$t('wallet.refresh')}}</span>
    </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex';
import contractService from '@/services/contract-servies';
export default {
    name:"refresh",
    data(){
        return{
            rotate:false,
            wBalance:0
        }
    },
    props: (['parentAddress']),
    computed: {
        ...mapGetters(['network'])
    },
    mounted() {

    },
    methods: {
        refresh(){
            this.rotate = true;
            contractService.web3.eth.getBalance(this.parentAddress,(err,data)=>{
                // this.wBalance=contractService.web3.fromWei(data.toString(10), 'ether');
                 const {fromWei,toDecimal}=contractService.web3
                this.wBalance=fromWei(toDecimal(data), 'ether');
                if(this.wBalance){
                    setTimeout(()=>{
                        this.rotate = false;
                    },1000)
                }else{
                    setTimeout(()=>{
                        this.rotate = false;
                    },30000)
                }
            });
            // this.$emit('refreshBalance',this.wBalance);
        },

    },
    filters:{

    },
    watch:{
        wBalance:function(){
            this.$emit('refreshBalance',this.wBalance);
        }
    }
}
</script>

<style lang="less" scoped>
    .refresh{
        display: flex;
        // display:inline-block;
        flex-direction: column;
    }
    .refresh-button{
        margin: 0 auto;
        display:inline-block;
        width:23px;
        height:23px;
        vertical-align: middle;
        cursor:pointer;
        background: url("./images/refresh.svg") no-repeat center center;
        background-size: 20px 20px;
    }
    .refresh-text{
        padding: 8px 0 0;
    }
    @keyframes rotation{
        from {-webkit-transform: rotate(0deg);}
        to {-webkit-transform: rotate(-180deg);}
    }
    .Rotation{
        animation: rotation 1s linear infinite;
        animation-iteration-count:30;
    }
</style>
