<template>
    <div class="node-sync">
        <p>{{$t('nodeSync.syncStatus')}} <span v-if="syncing"><i class="el-icon-loading"></i></span></p>
        <p>{{$t('nodeSync.Peers')}} : <span class="bold">{{nodeCount}}</span></p>
        <p>{{$t('nodeSync.Blocks')}} : <span class="bold">{{remainBlock}}</span></p>
        <p v-if="syncing || nodeCount==0">
            <el-progress :stroke-width="14" :percentage="(highestBlock?(currentBlock/highestBlock):0)*100" color="rgb(35,200,239,1)"></el-progress>
        </p>
        <p v-else>
            <el-progress :stroke-width="14" :percentage="100" color="rgb(35,200,239,1)"></el-progress>
        </p>
    </div>
</template>

<script>
    import nodeManager from '@/services/node-manager';
    import contractService from '@/services/contract-servies';
    import Settings from '@/services/setting';
    import fs from 'fs';
    export default {
        name: 'nodeSync',
        data () {
            return {
                syncing:false,
                currentBlock:0,
                highestBlock:0,
                remainBlock:0,
                nodeCount:0,
                timer:null
            }
        },
        mounted(){
            window.syncInterval = setInterval(this.check,3*1000);
        },
        methods: {
            check(){
                try{
                    contractService.web3.eth.getSyncing((err,data)=>{
                        if(!err && !!data){
                            this.currentBlock = data.currentBlock;
                            this.highestBlock = data.highestBlock;
                            this.remainBlock = data.currentBlock - data.highestBlock;
                            if(this.currentBlock-this.highestBlock==0){
                                   this.syncing = false;
                                   this.remainBlock = 0;
                                   clearInterval(window.syncInterval);
                            }
                        }else{
                            this.remainBlock = 0;
                        }
                    });
                    contractService.web3.net.getPeerCount((error, result)=>{
                        // console.warn(error, result)
                        if(error){
                            throw error;
                        }
                        this.nodeCount = result;
                    })
                }catch(error){
                    console.warn(error)
                }
            },
        },
        beforeDestroy() {
            clearInterval(window.syncInterval);
            window.syncInterval = null;
        },
        destroyed() {
            clearInterval(window.syncInterval);
            window.syncInterval = null;
        },
    }
</script>

<style lang="less" scoped>
    .node-sync{
        margin-top:10px;
        padding:10px 20px;
        font-size: 12px;
        color:#fff;
        border-top:solid 1px #182858;
        p{
            margin-bottom:10px;
            i{
                font-size:10px;
            }
        }
        .bold{
            font-weight:600;
        }
    }

</style>
<style lang="less">
    .node-sync{
        .el-progress__text{
            display:none;
        }
        .el-progress-bar{
            padding-right:0;
        }
        .el-progress-bar__outer,.el-progress-bar__inner{
            border-radius:0;
        }
    }
</style>
