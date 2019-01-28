<template>
    <div class="validator-node format-style">
        <div class="header">
            <el-select v-model="sortBy" @change="search" :class="[lang=='en'?'enSearch':'']">
                <el-option v-for="option in options" :label="option.label" :value="option.code"></el-option>
            </el-select>
            <span class="icon-search">
                <el-input :class="[keyword&&!/^\s*$/g.test(keyword)?'input1':'input2',lang=='en'?'width278':'']" v-model="keyword" v-if="showKeyInput" @change="search" @keyup.enter.native="search" :placeholder="$t('application.enterAccount')"></el-input>
                <i v-if="!showKeyInput" @click="showKeyInput=!showKeyInput"></i>
            </span>
            <el-button class="my-node" @click="gotoMyNode">{{$t('application.myNode')}}</el-button>
        </div>
        <div class="card content">
            <div class="candidate-list" v-if="nodeList && nodeList.length>0">
                <table class="table" cellspacing="0">
                    <thead>
                        <tr>
                           <td width="18%">{{$t('application.nodeName')}}</td>
                           <td width="18%">{{$t('application.status')}}</td>
                           <td width="18%">{{$t('application.position')}}</td>
                           <td width="18%">{{$t('application.staked')}}</td>
                           <td width="14%">{{$t('application.ranking')}}</td>
                           <td width="14%">{{$t('application.fee')}}</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="node in nodeList" @click="gotoDetail(node.CandidateId,node.Owner,node.Extra.nodePortrait,node.ranking,node.city)">
                            <td class="bold">
                                <img :src="'./static/images/characters/characters-'+node.Extra.nodePortrait+'.jpg'" alt="" v-if="node.Extra">
                                <span class="node-name">{{node.Extra ? node.Extra.nodeName:''}}</span>
                            </td>
                            <td class="node-state">
                                <span v-if="node.verNode" class="node1">{{$t('application.status3')}}</span>
                                <span v-else :class="[node.ranking>100?'node3':'node2']">{{node.ranking>100?$t('application.status4'):$t('application.status5')}}</span>
                            </td>
                            <td>{{node.city}}</td>
                            <td>{{node.Deposit}}</td>
                            <td>{{node.ranking}}</td>
                            <td>{{node.Fee | perc}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else class="no-data-bg">
                <p>{{$t('application.noCandidate')}}</p>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex'
    import Settings from '@/services/setting';
    import MathService from '@/services/math';
    import contractService from '@/services/contract-servies';
    var fs = require("fs");
    export default {
        name: 'validatorNode',
        data () {
            return {
                sortBy:'1',
                keyword:'',
                showKeyInput:false,
                nodeList:[],
                verList:[],
                nodeListCopy:[]
            }
        },
        computed: {
            ...mapGetters(['lang']),
            options:function(){
                return [{
                    code:'1',
                    label:this.$t('application.sortBy1')
                },{
                    code:'2',
                    label:this.$t('application.sortBy2')
                },{
                    code:'3',
                    label:this.$t('application.sortBy3')
                },{
                    code:'4',
                    label:this.$t('application.sortBy4')
                }]
            }
        },
        mounted(){
            this.init();
        },
        methods: {
            ...mapActions(['candidateList','verifiersList','getCityByIp','isMyNode','getDepositList']),
            init(){
                let _this = this;
                this.verifiersList().then((verList)=>{
                    this.candidateList().then((list)=>{
                        console.log('candidateList---000--',list);
                        this.nodeList = list;
                        this.nodeList.forEach((item,index)=>{
                            item.verNode = (verList.indexOf(item.CandidateId)!==-1);
                            let ip = item.Host.replace(/^http\:\/\//g,''),
                                ipStorage = window.localStorage.getItem('ipCitys')?JSON.parse(window.localStorage.getItem('ipCitys')):{};
                            if(ipStorage[ip]){
                                item.city = ipStorage[ip];
                            }else{
                                _this.getCityByIp(ip).then((city)=>{
                                    ipStorage[ip] = city;
                                    window.localStorage.setItem('ipCitys',JSON.stringify(ipStorage));
                                    item.city = city;
                                    this.$set(this.nodeList,index,item);
                                    this.nodeListCopy = JSON.parse(JSON.stringify(this.nodeList));
                                });
                            }
                        });
                        this.nodeListCopy = JSON.parse(JSON.stringify(this.nodeList));
                    });
                })
            },
            search(){
                let arr = JSON.parse(JSON.stringify(this.nodeListCopy));
                if(this.keyword && !/^\s*$/g.test(this.keyword)){
                    this.nodeList=arr.filter((item)=>{
                        return item.Extra && item.Extra.nodeName && !!item.Extra.nodeName.match(this.keyword)
                    });
                }else{
                    this.nodeList = arr;
                }
                switch(this.sortBy){
                    case '1':
                        //默认排序
                        break;
                    case '2':
                        //质押排名
                        this.nodeList.sort(function(a,b){
                            return a.ranking-b.ranking;
                        });
                        break;
                    case '3':
                        //分红比例
                        this.nodeList.sort(function(a,b){
                            console.log(b.Fee-a.Fee);
                            if(b.Fee==a.Fee){
                                return a.Deposit-b.Deposit;
                            }else{
                                return a.Fee - b.Fee;
                            }
                        });
                        break;
                    case '4':
                        //所属区域
                        this.nodeList.sort(function(a,b){
                            if(!!a.city && !!b.city){
                                let aC = a.city.slice(0,1),bC = b.city.slice(0,1);
                                return aC>bC;
                            }
                        });
                        break;
                }
            },
            gotoMyNode(){
                this.$router.push('/my-node')
            },
            gotoDetail(id,owner,nodePortrait,ranking,city){
                //由于SetCandidateExtra接口会暴露出去 用户logo可能会不按照格式传参，获取列表若nodePortrait不是合法的，则随机设置，带过去详情页
                this.isMyNode(id).then((bool)=>{
                    if(bool){
                        this.$router.push('/my-node')
                    }else{
                        this.$router.push({
                            path:'/node-detail',
                            query:{
                                nodeId:id,
                                owner:owner,
                                nodePortrait:nodePortrait,
                                ranking:ranking,
                                city:city
                            }
                        });
                    }
                });
            }
        },
        filters:{
            'perc':function(num){
                return 100 - MathService.div(num,100) +'%'
            }
        },
    }
</script>

<style lang="less" scoped>
    .validator-node{
        .card{
            height:calc(~"100% - 47px");
        }
        .header{
            margin-bottom:12px;
            display:flex;
            height:32px;
            line-height:32px;
        }
        .node-name{
            display: inline-block;
            max-width: 92px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .candidate-list{
            height:100%;
            font-size: 12px;
            overflow:auto;
            table{
                width:100%;
                tr{
                    padding-right:20px;
                }
                thead tr td{
                    line-height:37px;
                    color: #525768;
                    text-align: left;
                    border-bottom:solid 1px #D3D8E1;
                    &:first-of-type{
                        padding-left:20px;
                     }
                }
                tbody tr td{
                    text-align: left;
                    line-height:45.5px;
                    color: #24272B;
                    border-bottom:solid 1px #ECEFF6;
                }
                tbody tr:hover{
                    background: #ECF1F8;
                    cursor: pointer;
                }
            }
            .bold{
                padding-left:20px;
                height:48px;
                display: flex;
                justify-content: left;
                align-items: center;
                font-weight: 600;
                img{
                    display: inline-block;
                    width:30px;
                    margin-right: 2px;
                    vertical-align: middle;
                    border-radius: 30px;
                }
            }
        }
    }
    .my-node{
        width:117px;
        height:32px;
        line-height:32px;
        color:#fff;
        background: #18C2E9;
        text-align: center;
        border-radius: 4px;
    }
    .icon-search{
        flex-grow:1;
        height:32px;
        i{
            display:block;
            width:32px;
            height:32px;
            background: url("./images/icon_query.svg") no-repeat left center;
        }
    }
    .no-data-bg{
        padding-top:310px;
        height:100%;
        text-align: center;
        font-size: 12px;
        color: #24272B;
        letter-spacing: 0.43px;
        background: url("./images/list.png") no-repeat center 90px ;
    }

</style>
<style lang="less">
    .validator-node{
        .el-select{
            width:115px;
            .el-input{
                width:115px;
                height:32px;
                line-height:32px;
            }
            .el-input__icon{
                color: #24272B;
            }
            .el-input__inner{
                height:32px;
                line-height:32px;
                font-size: 16px;
                color: #24272B;
                font-weight:600;
                letter-spacing: 0.5px;
                border:none;
                background-color: transparent;
            }
        }
        .el-scrollbar__wrap{
            overflow: auto;
        }
        .icon-search{
            .el-input{
                width:177px;
                height:32px;
                line-height:32px;
                .el-input__inner{
                    padding-left:25px;
                    height:25px;
                    border: 1px solid #9EABBE;
                    border-radius: 12px;
                }
            }
            .width278{
                width: 278px;
            }
            .input1{
                .el-input__inner{
                    padding-left:15px;
                    background: transparent;
                }
            }
            .input2{
                position:relative;
                .el-input__inner{
                    background: url("./images/icon_query.svg") no-repeat 10px center transparent;
                }
            }
        }
    }
    .node-state{
        span{
            display: block;
            width:77px;
            height:24px;
            line-height: 22px;
            text-align: center;
            font-size: 10px;
            letter-spacing: 0.5px;
        }
        .node1{
            color:#18C2E9;
            border: 1px solid #18C2E9;
            border-radius: 4px;
        }
        .node2{
            color: #525768;
            border: 1px solid #9EABBE;
            border-radius: 4px;
        }
        .node3{
            color: #F5A623;
            border: 1px solid #F5A623;
            border-radius: 4px;
        }
    }
    .enSearch{
        width: 171px !important;

    }
    // .enSearch .el-input{
    //     width: 171px !important;
    // }
    .validator-node .enSearch .el-input{
        width: 171px;
    }
</style>

