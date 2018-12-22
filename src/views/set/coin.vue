<template>
    <div class="coin">
        <p>接收地址</p>
        <el-select v-model="wallet">

        </el-select>
    </div>
</template>

<script>
    import nodeManager from '@/services/node-manager';
    import {mapState, mapActions, mapGetters} from 'vuex';
    import fs from 'fs';
    import Settings from '@/services/setting'
    import loadingComponent from '@/components/loading/loading';
    export default {
        name: 'coin',
        //实例的数据对象
        data() {
            return {

            }
        },
        //数组或对象，用于接收来自父组件的数据
        props: {

        },
        //计算
        computed: {
            ...mapGetters(['network','lang'])
        },
        //方法
        methods: {
            ...mapActions(['changeLang','updateState','WalletAction']),


        },
        //生命周期函数
        created() {
            this.WalletAction(this.network.type)
        },
        beforeMount() {

        },
        mounted() {

        },
        //监视
        watch: {

        },
        //组件
        components: {

        },
        //过滤器
        filters: {

        },
        //自定义指令
        directive: {

        }
    }
</script>

<style lang="less" scoped>
    .setting{
        margin-top:-60px;
        margin-left:11px;
        padding:7px 22px;
        height:calc(~"100% - 66px");
        background-color: #fff;
        border-radius:4px;
        color: #525768;
        font-size:12px;
        .title{
            margin-top:14px;
            color: #24272B;
        }
        .el-select{
            margin-top:10px;
        }
        .des-txt{
            margin-top:14px;
            .el-button{
                padding:0;
                margin-left:10px;
                width:60px;
                height:24px;
                background: #18C2E9;
                border-radius: 4px;
                color:#fff;
                border:none;
                font-size:12px;
            }
        }
    }
</style>
<style lang="less">
    .setting{
        .el-select{
            font-size:12px;
            .el-input__inner{
                height:40px;
            }
        }
        .el-input{
            font-size:12px;
        }
    }
</style>
