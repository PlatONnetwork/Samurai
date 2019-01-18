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
        props:(['placeholder']),
        computed: {
            inpNum () {
                return this.oldNum
            }
        },
        mounted() {

        },
        methods: {
            change (event) {
                let val = event.target.value.trim();
                // 只能是正整数或空,可根据需求修改正则
                if (/^[0-9]+\.?\d*$|^$/.test(val) && !/^0{2,}/.test(val)) {
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


