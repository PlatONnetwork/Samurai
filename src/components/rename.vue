<template>
    <div class="">
        <p v-if="canEdit" class="rel">
            <input type="text" v-model.trim="newName" @blur="changeName" class="div" id="div" autofocus/>
            <span :class="[canEdit?'hide':'','hide-ele']" v-if="canEdit">{{newName}}</span>
        </p>
        <p v-else class="inline">
            <span class="contract-name" @click="toEdit">
                <span class="border nowrap">{{oldName | sliceName}}</span>
                <i class="rename"></i>
            </span>
        </p>
    </div>
</template>

<script>
    export default {
        name: "rename",
        data() {
            return{
                canEdit:false,
                newName:'',
                inputWidth:0
            }
        },
        props:(['oldName','rule']),
        computed: {},
        mounted() {

        },
        methods: {
            toEdit(){
                this.newName = this.oldName;
                this.canEdit = true;
                let timer = setInterval(()=>{
                    let ele = document.getElementById('div');
                    if(ele){
                        console.log('ele-----',ele);
                        ele.focus();
                        clearInterval(timer)
                    }
                },100);
            },
            changeName(){
                if(/^\s*$/.test(this.newName)){
                    this.canEdit = false;
                    this.newName = this.oldName;
                }
                if(!this.rule || this.rule.test(this.newName)){
                    this.$emit('changeName',this.newName);
                    this.canEdit = false;
                }else{
                    this.canEdit = false;
                    this.newName = this.oldName;
                }
            },
        },
        watch:{
            'oldName':function(val){
                this.newName = this.oldName;
            }
        },
        filters:{
            'sliceName':function(name){
                if(name && name.length>36){
                    return name.slice(0,36)+'...'
                }else{
                    return name;
                }
            }
        },
    }
</script>
<style lang="less" scoped>
    .nowrap{
        white-space: nowrap;
    }
    .inline{
        display: inline-block;
        &:hover{
            .border{
                border-bottom: solid 1px #0077FF;
            }
            .rename{
                display: inline-block;
                opacity:1;
            }
        }
    }
    .contract-name{
        display: flex;
        font-size: 14px;
        color: #24272B;
        font-weight: 600;
        cursor:pointer;
        border-bottom:solid 1px transParent;
    }
    .rename{
        margin-left:3px;
        opacity: 0;
        width:13px;
        height:19px;
        cursor:pointer;
        background: url("./images/56.icon_editor.svg") no-repeat left center;
        background-size: contain;
    }
    .div{
        position:absolute;
        top:0;
        left:0;
        z-index:999;
        height:19px;
        line-height:19px;
        border:none;
        text-decoration:underline;
        text-decoration-color: #0077FF;
        &:focus{
            border:none;
            outline: none;
         }
    }
    .rel{
        position:relative;
        height:19px;
    }
    .hide-ele{
        position:absolute;
        top:1px;
        left:0;
        padding-right:5px;
        border-bottom:solid 1px #0077FF;
        &:after{
            content:'1232';

         }
    }
    .hide{
        opacity:0;
    }
</style>
<style lang="less">
</style>


