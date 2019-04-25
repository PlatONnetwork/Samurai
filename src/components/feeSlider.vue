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
                        :show-tooltip="false"
                        show-stops>
                </el-slider>
            </div>
            <input class="el-input__inner gas-input"
                   type="text"
                   @input="change"
                   @change="change"
                   @blur="blur"
                   :value="inpNum"/>
            <!--<el-input class="gas-input" v-model.trim="fee" @blur="changeGas" type="number" :maxlength=5 onkeypress="return ((event.keyCode>=48&&event.keyCode<=57)||event.keyCode==46)"-->
                      <!--@change="checkNumber" ></el-input>-->
            <span class="gray">Energon</span>
        </span>
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
                fee:0,
                oldNum:''
            }

        },
        props:(['estimateGas']),
        computed: {
            ...mapGetters(['network']),
            inpNum () {
                return this.oldNum
            }
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
            change (event) {
                let val = event.target.value.trim();
                if(!/^\s*$/.test(val)){
                    // 只能是正整数或空,可根据需求修改正则
                    if (/^[0-9]+\.?\d*$|^$/.test(val) && !/^0{2,}/.test(val) && (val.indexOf('.')==-1 || val.length-val.indexOf('.')<10)) {

                    } else{
                        if(/^[0-9]+\.?\d*$|^$/.test(val) && val.indexOf('.')!==-1 && val.length-val.indexOf('.')>9){
                            event.target.value = event.target.value.slice(0,val.indexOf('.')+9)
                        }else{
                            event.target.value = this.oldNum
                        }
                    }
                }
            },
            blur(event){
                console.log('blur-------');
                let val = event.target.value.trim();
                if(/^\s*$/.test(val)){
                    let options = this.options;
                    this.gasPrice= this.toNonExponential(options[0].gasPrice);
                    this.gasSlider = 0;
                    this.fee = mathService.mul(this.estimateGas,this.gasPrice);
                    this.oldNum =this.fee;
                    event.target.value = this.oldNum
                }else{
                    if (/^[0-9]+\.?\d*$|^$/.test(val) && !/^0{2,}/.test(val) && (val.indexOf('.')==-1 || val.length-val.indexOf('.')<10)) {
                        this.oldNum = val;
                        if(this.estimateGas){
                            let options = this.options;
                            let unitPrice = (mathService.div(this.oldNum,this.estimateGas)-0).toFixed(9);
                            if(unitPrice>options[options.length-1].gasPrice || unitPrice==options[options.length-1].gasPrice){
                                this.gasSlider = options.length*10;
                                this.gasPrice=this.toNonExponential(options[options.length-1].gasPrice);
                                this.fee = mathService.mul(this.estimateGas,this.gasPrice);
                                this.oldNum =this.fee;
                                event.target.value = this.oldNum
                            }else if(unitPrice < options[0].gasPrice || unitPrice== options[0].gasPrice){
                                this.gasPrice= this.toNonExponential(options[0].gasPrice);
                                this.gasSlider = 0;
                                this.fee = mathService.mul(this.estimateGas,this.gasPrice);
                                this.oldNum =this.fee;
                                event.target.value = this.oldNum
                            }else{
                                let num = Math.round((unitPrice/options[options.length-1].gasPrice).toFixed(1)*options.length);
                                this.gasSlider = (num-1)*10;
                                this.oldNum =this.fee;
                                event.target.value = this.oldNum
                            }
                        }
                    }
                }

            },
            gasSel(){
                if(this.estimateGas){
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
                    this.fee = mathService.mul(this.estimateGas,this.gasPrice);
                }
            },
            changeGas(){
                if(this.estimateGas){
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
                    this.fee = mathService.mul(this.estimateGas,this.gasPrice);
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
            },
            fee:function(val){
                this.oldNum = val;
            },
            // inpNum:function(val){
            //     this.$emit('sel',val);
            //     // this.gasPrice = mathService.div(val,this.estimateGas)
            // }
        }
    }
</script>

<style lang="less" scoped>
    .gray{
        color: #9EABBE;
    }
    .slider{
        display:flex;
        align-items: center;
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
        font-size: 12px;
        color: #525768;
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
    .fee-slider .el-slider__button-wrapper{
        top: -18px;
    }
</style>

