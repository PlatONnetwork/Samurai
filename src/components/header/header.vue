<template>
    <div class="header-wrapper">
        <div style="-webkit-app-region: drag;height:65px;" >
            <p class="header-tool" style="-webkit-app-region: no-drag">
                <span @click="min"><i class="min"></i></span>
                <span @click="max"><i class="max" ref="max"></i></span>
                <span @click="close"><i class="close"></i></span>
            </p>
            <p class="clear-float"></p>
            <p class="header-title">
                <slot></slot>
            </p>
        </div>

    </div>
</template>

<script>
    import { ipcRenderer } from 'electron';
    import {mapState, mapActions, mapGetters} from 'vuex';
    export default {
        name: "vHeader",
        data(){
            return {
                isBig: true
            }
        },
        computed:{
            ...mapGetters(['isMaximized'])
        },
        methods: {
            ...mapActions(['updateState','updateNetSetting','changeWindow']),
            min(){
                ipcRenderer.send('minimize-window');
            },
            close(){
                ipcRenderer.send('hide-window');
            },
            max(){
                if(this.isMaximized){
                    this.$refs.max.style.background="url("+require('./images/restore.svg')+") no-repeat center bottom"
                    ipcRenderer.send('maximize-window')
                }else{
                    this.$refs.max.style.background="url("+require('./images/maximize.svg')+") no-repeat center bottom"
                    ipcRenderer.send('orignal-window')
                }
                this.changeWindow(this.isMaximized)
            }
        }
    }
</script>

<style lang="less" scoped>
    .header-wrapper{
        width: 100%;
        height: 120px;
        background: url("./images/header-bg-max.png") no-repeat center center #EAECF6;
        .header-tool{
            float: right;
            height: 20px;
            line-height:20px;
            span{
                margin-right:12px;
                font-size:8px;
                color:#24272B;
                cursor:pointer;
            }
        }
        .clear-float{
            clear: both;
        }
        .header-title{
            position: relative;
            top: -6px;
            padding-left: 14px;
            height: 22px;
            font-size: 16px;
            color: #24272B;
        }
        .min{
            display: inline-block;
            width: 10px;
            height: 8px;
            background: url("./images/minimize.svg") no-repeat center center
        }
        .max{
            display: inline-block;
            width: 10px;
            height: 10px;
            background: url("./images/maximize.svg") no-repeat center bottom
        }
        .close{
            display: inline-block;
            width: 10px;
            height: 10px;
            background: url("./images/close.svg") no-repeat center bottom
        }
    }

</style>
