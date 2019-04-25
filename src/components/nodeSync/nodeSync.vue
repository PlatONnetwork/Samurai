<template>
    <div class="node-sync">
        <p>{{$t('nodeSync.syncStatus')}} <span v-if="syncing"><i class="el-icon-loading"></i></span></p>
        <p>
            {{$t('nodeSync.Peers')}} :
            <span v-if="network.type!=='custom'&&nodeCount==0" class="connecting">Connecting...</span>
            <span v-else class="bold">{{nodeCount}}</span>
        </p>
        <p>{{$t('nodeSync.Blocks')}} :
            <span class="bold connecting" v-if="currentBlock==0 && blockNumber==0">Connecting...</span>
            <span class="bold" v-else-if="blockNumber>0 && currentBlock==highestBlock">{{$t('nodeSync.compolete')}}</span>
            <span class="bold" v-else>{{$t('nodeSync.syncing')}}({{currentBlock}}/{{highestBlock}})</span>
        </p>
        <p v-if="syncing || nodeCount==0">
            <el-progress :stroke-width="14" :percentage="(highestBlock?(currentBlock/highestBlock):0)*100" color="rgb(35,200,239,1)"></el-progress>
        </p>
        <p v-else>
            <el-progress :stroke-width="14" :percentage="100" color="rgb(35,200,239,1)"></el-progress>
        </p>
    </div>
</template>

<script>
    import {mapActions, mapGetters} from 'vuex';
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
                nodeCount:0,
                timer:null,
                blockNumber:0
            }
        },
        computed:{
            ...mapGetters(['network'])
        },
        mounted(){
            window.syncInterval = setInterval(this.check,3*1000);
        },
        methods: {
            check(){
                try{
                    contractService.web3.eth.getSyncing((err,data)=>{
                        // console.log('getSyncing--->',err,data);
                        if(!err && !!data){
                            this.syncing = true;
                            this.currentBlock = data.currentBlock;
                            this.highestBlock = data.highestBlock;
                            if(this.currentBlock-this.highestBlock==0){
                                   this.syncing = false;
                            }
                        }else{
                            this.currentBlock = data&&data.currentBlock;
                            this.highestBlock = data&&data.highestBlock;
                            this.syncing = false;
                            contractService.web3.eth.getBlockNumber((err,blockNumber)=>{
                                this.blockNumber = blockNumber;
                            })
                        }
                    });
                    contractService.web3.net.getPeerCount((error, result)=>{
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
        margin-top:5px;
        padding:12px 20px;
        font-size: 12px;
        color: #24272B;
        border-top:solid 1px #ECF1F8;
        p{
            margin-bottom:10px;
            i{
                font-size:14px;
                margin-left: 2px;
                vertical-align: bottom;
            }
        }
        .bold{
            font-weight:600;
        }
    }
    .connecting{
        font-weight:600;
        color:#ea106e;
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
            background: #0077FF;
        }
    }
</style>
