<template>
    <div v-if="pageLoading" class="page-loading">
        <div class="loading">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </div>
        <p class="load-txt">{{loadTxt}}</p>
    </div>

</template>

<script>
    import {mapGetters, mapActions} from 'vuex'
    export default {
        name: 'pageLoading',
        data () {
            return {

            }
        },
        computed:{
            ...mapGetters(['pageLoading'])
        },
        props:(['loadTxt']),
        methods: {


        }
    }
</script>

<style lang="less" scoped>
    .page-loading{
        text-align: center;
        color: #9EABBE;
    }
    .load-txt{
        margin-top:20px;
    }
    .loading{
        margin-top:100px;
        width: 100%;
        height: 40px;
        text-align: center;
    }
    .loading span{
        display: inline-block;
        width: 8px;
        height: 100%;
        border-radius: 4px;
        background:  #9EABBE;
        -webkit-animation: load 0.75s ease infinite;
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

