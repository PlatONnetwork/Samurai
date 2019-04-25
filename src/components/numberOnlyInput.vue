<template>
    <div class="">
        <input class="el-input__inner"
               type="text"
               :placeholder="placeholder"
               @input="change"
               @change="change"
               :value="inpNum"/>
    </div>
</template>

<script>
    export default {
        name: "number-only-input",
        data() {
            return{
                oldNum:''
            }
        },
        props:(['placeholder','typeInt','inputVal']),
        computed: {
            inpNum () {
                if(this.inputVal){
                    this.oldNum = this.inputVal;
                }
                return this.oldNum
            }
        },
        mounted() {

        },
        methods: {
            change (event) {
                let val = event.target.value.trim(),patt;
                if(this.typeInt){
                    patt=new RegExp("^[1-9]+[0-9]*$|^$");
                }else{
                    patt=new RegExp("^[0-9]+\.?\\d*$|^$");
                }
                if (patt.test(val) && !/^0{2,}/.test(val)) {
                    this.oldNum = val
                } else {
                    event.target.value = this.oldNum
                }
                this.$emit('valueChange',this.oldNum)
            }
        },
        watch:{

        }
    }
</script>


