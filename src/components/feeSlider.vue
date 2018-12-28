<template>
    <div class="fee-slider">
        <span class="slider">
            <div class="lb">
                <p>
                    <span>{{$t("wallet.cheaper")}}</span>
                    <span class="fr">{{$t("wallet.faster")}}</span>
                </p>
                <el-slider
                        v-model="gasSlider"
                        :step="10"
                        :max="options&&(options.length-1)*10"
                        @change="gasSel"
                        show-stops>
                </el-slider>
            </div>
            <el-input class="gas-input" v-model.trim="fee" @blur="changeGas" type="number"></el-input><span class="gray">Energon</span>
        </span>
        <p>{{$t('wallet.estimatedTime')}}：{{$t('contracts.within')}} {{expectTime}}{{optionsTime==30?$t('contracts.second'):$t('contracts.withinmins')}}</p>
    </div>
</template>

<script>
    import {mapActions, mapGetters} from 'vuex';
    import contractService from '@/services/contract-servies';
    import mathService from '@/services/math';

    export default {
        name: "fee-slider",
        data() {
            return{
                options:null,
                gasSlider:1,
                expectTime:15,
                selfGas:1,
                copyGas:null,
                optionsTime:0,
                gasPrice:0,
                fee:0
            }

        },
        props:(['estimateGas']),
        computed: {
            ...mapGetters(['network'])
        },
        mounted() {
            this.getGasOptions((options)=>{
                this.options = options;
                this.gasPrice = this.toNonExponential(options[0].gasPrice);
                this.$emit('sel',this.gasPrice);
                if(this.estimateGas){
                    this.fee = mathService.mul(this.estimateGas,this.gasPrice);
                }else{
                    this.fee = '';
                }
            });
        },
        methods: {
            ...mapActions(['getGasOptions']),
            gasSel(){
                if(this.options && this.options.length>1){
                    let options = this.options;
                    let index = this.gasSlider/10;
                    this.gasPrice = this.toNonExponential(options[index].gasPrice);
                    this.optionsTime = options[index].time;
                    if(options[index].time==30){
                        this.expectTime = options[index].within
                    }else if(options[index].time<300){
                        this.expectTime = options[index].within
                    }else{
                        this.expectTime = options[index].within
                    }
                    if(this.copyGas){
                        this.gasPrice = this.toNonExponential(this.copyGas);
                        this.copyGas = null;
                    }
                    if(this.estimateGas){
                        this.fee = mathService.mul(this.estimateGas,this.gasPrice);
                    }else{
                        this.fee = ''
                    }
                }
            },
            changeGas(){
                this.copyGas = null;
                let options = this.options;
                let unitPrice = mathService.div(this.fee,this.estimateGas);
                if(unitPrice>options[options.length-1].gasPrice || unitPrice==options[options.length-1].gasPrice){
                    this.gasSlider = options.length*10;
                    this.gasPrice=this.toNonExponential(options[options.length-1].gasPrice);
                }else if(this.gasPrice< options[0].gasPrice || this.gasPrice== options[0].gasPrice){
                    this.gasPrice= this.toNonExponential(options[0].gasPrice);
                    this.gasSlider = 0;
                }else{
                    this.copyGas = this.toNonExponential(this.gasPrice);
                    let num = Math.round((this.gasPrice/options[options.length-1].gasPrice).toFixed(1)*options.length);
                    this.gasSlider = (num-1)*10;
                }
                if(this.estimateGas){
                    this.fee = mathService.mul(this.estimateGas,this.gasPrice);
                }else{
                    this.fee = ''
                }
            },
            toNonExponential(num) {
                var m = Number(num).toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
                return Number(num).toFixed(Math.max(0, (m[1] || '').length - m[2]));
            },
            GasToAtp:function(val){
                return contractService.web3.fromWei(val,"gwei")
            }
        },
        watch:{
            gasPrice:function(val){
                this.$emit('sel',val);
            },
            estimateGas:function(val){
                this.fee = mathService.mul(val,this.gasPrice);
            }
        }
    }
</script>

<style lang="less" scoped>
    .gray{
        color: #9EABBE;
    }
    .slider{
        display:flex;
        .lb{
            flex-grow:1;
        }
        .gas-input{
            min-width:100px;
            width:100px;
            margin:0 10px;
            vertical-align:-8px;
            >span{
                margin-left:10px;
                font-size: 12px;
                color: #9EABBE;
            }
        }
    }

</style>
<style lang="less">
    .fee-slider{
        .el-slider{
            .el-slider__runway{
                margin:2px 0;
            }
        }
        .el-input{
            .el-input__inner{
                width:100px;
                height:32px;
            }
        }
    }

</style>

