<template>
    <div class="refresh">
        <i :class="[rotate?'Rotation':'','refresh-button']" @click="refresh"></i>
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
                this.wBalance=contractService.web3.fromWei(data.toString(10), 'ether');
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
        display:inline-block;
    }
    .refresh-button{
        display:inline-block;
        width:14px;
        height:14px;
        vertical-align: middle;
        cursor:pointer;
        background: url("./images/controls.svg") no-repeat center center;
        background-size: contain;
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
