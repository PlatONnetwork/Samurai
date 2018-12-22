<template>
    <div class="modal" v-if="pageLoading">
        <div class="modal-main" style="background-color: transparent">
            <i class="el-icon-loading" style="font-size:80px;"></i>
        </div>
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
        methods: {


        }
    }
</script>

<style lang="less" scoped>


</style>

