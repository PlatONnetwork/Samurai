<template>
    <div class="modal" v-if="netLoading">
        <!-- <div class="modal-main" style="background-color: transparent">
            <i class="el-icon-loading" style="font-size:80px;"></i>
        </div> -->
        <div class="loading">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex'
    export default {
        name: 'loading',
        data () {
            return {

            }
        },
        computed:{
            ...mapGetters(['netLoading'])
        },
        methods: {


        }
    }
</script>

<style lang="less" scoped>
    .loading{
        width: 80px;
        height: 40px;
        margin-top:300px;
        margin-left: 500px;
        /* background: #800080 */
    }
    .loading span{
        display: inline-block;
        width: 8px;
        height: 100%;
        border-radius: 4px;
        background: #FFFFFF;
        -webkit-animation: load 1s ease infinite;
    }
    @-webkit-keyframes load{
        0% {
            transform: scaley(1.0);
        }
        80% {
            transform: scaley(0.3);
        }
        90% {
            transform: scaley(1.0);
        }
    }
    .loading span:nth-child(1){
        -webkit-animation-delay:0.5s;
    }
    .loading span:nth-child(2){
        -webkit-animation-delay:0.25s;
    }
    .loading span:nth-child(3){
        -webkit-animation-delay:0.9s;
    }
    .loading span:nth-child(4){
        -webkit-animation-delay:0.25s;
    }
    .loading span:nth-child(5){
        -webkit-animation-delay:0.5s;
    }

</style>

