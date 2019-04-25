<template>
    <div class="vote-container">
        <div v-if="!loadCompolete">
            <page-loading :loadTxt="$t('form.loading')"></page-loading>
        </div>
        <div v-else class="my-vote format-style">
            <div class="header">
                <p class="title">{{$t('vote.voteStatistics')}}</p>
                <ul>
                    <li>
                        <p class="top">{{$t('vote.voteStaked')}}</p>
                        <p class="bottom">
                            <span class="bold">{{voteRecord.length==0?'―':locked}}</span>
                            <span>{{voteRecord.length==0?'':'Energon'}}</span>
                        </p>
                    </li>
                    <li>
                        <p class="top">{{$t('vote.vaildTicket')}}</p>
                        <p class="bottom">
                            <span class="bold" v-if="voteRecord.length>0">{{validVote}}/{{invalidVote}}</span>
                            <span class="bold" v-else>―</span>
                        </p>
                    </li>
                    <li>
                        <p class="top">{{$t('vote.Profit')}}</p>
                        <p class="bottom">
                            <span class="bold">{{voteRecord.length==0?'―':profit}}</span>
                            <span>{{voteRecord.length==0?'':'Energon'}}</span>
                        </p>
                    </li>
                </ul>
            </div>
            <div class="content ticket-record">
                <p class="title">{{$t('vote.votingRecord')}}</p>
                <ul class="my-vote-list">
                    <li v-for="ticket in voteRecord" :key="ticket.ticketId" class="ticket-item">
                        <p class="node-name bold">
                            {{ticket.nodeName}}
                        </p>
                        <p class="column">
                            <span class="bold">{{ticket.validVote}}/{{ticket.invalidVote}}</span>
                            <span class="label">{{$t('vote.vaildTicket')}}</span>
                        </p>
                        <p class="column">
                            <span> <span class="bold">{{ticket.locked}}</span></span>
                            <span class="label">{{$t('vote.voteStaked')}}</span>
                        </p>
                        <p class="column">
                            <span class="profit">
                                <span class="bold" v-if="ticket.profit">{{ticket.profit | decimal}}</span>
                                <span v-else>—</span>
                            </span>
                            <span class="label">{{$t('vote.Profit')}}</span>
                        </p>
                        <p class="vote-btn">
                            <span :class="[hasBalOrds?'':'disabled','vote','info']" @click="toVote(ticket)">{{$t('vote.addVote')}}</span>
                            <span class="detail info" @click="toVoteDetail(ticket)">{{$t('vote.voteDetail')}}</span>
                        </p>
                    </li>
                </ul>
                <p v-if="voteRecord.length==0" class="no-data">{{$t('vote.noData')}}</p>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex'
    import contractService from '@/services/contract-servies';
    import mathService from '@/services/math';
    import APIService from '@/services/API-servies';
    import pageLoading from '@/components/loading/pageLoading';

    export default {
        name: 'myVote',
        data () {
            return {
                voteRecord:[],
                tickets:[],
                locked:0,
                validVote:0,
                invalidVote:0,
                profit:0,
                hasBalOrds:false,
                loadCompolete:false
            }
        },
        computed: {
            ...mapGetters(['network'])
        },
        mounted(){
            this.init();
        },
        methods: {
            ...mapActions(['getMyVoteList','getNodeInfo','calculatedIncome','updateNodeName','getOrd','getBalOrd','hasBalOrd']),
            init(){
                this.hasBalOrd().then((hasBalOrd)=>{
                    this.hasBalOrds = hasBalOrd;
                });
                this.getMyVoteList().then((txHashs)=>{
                    console.log('getMyVoteList---',JSON.stringify(txHashs));
                    APIService.node.getTicketCountByTxHash({
                        // "cid":this.network.type=='test'?"203":this.network.type=='amigo'?"103":this.network.type=='batalla'?"104":'',
                        "cid":contractService.cid,
                        "hashList":txHashs
                    }).then((res)=>{
                        this.loadCompolete = true;
                        if(res.code==0){
                            this.tickets = res.data;
                            let statisticsData = this.statistics(this.tickets);
                            console.log('statisticsData--->',statisticsData);
                            this.locked = statisticsData.locked;
                            this.validVote = statisticsData.validVote;
                            this.invalidVote = statisticsData.invalidVote;
                            this.profit = statisticsData.profit;
                            this.groupByNode();
                        }
                    }).catch((e)=>{
                        this.loadCompolete = true;
                    })
                    // contractService.platONCall(contractService.getABI(3),contractService.voteContractAddress,'GetBatchTicketDetail',contractService.voteContractAddress,[ticketIds.join(":")]).then((data)=>{
                    //     this.tickets = JSON.parse(data);
                    //     console.log('tickets--->',JSON.stringify(this.tickets));
                    //     let statisticsData = this.statistics(this.tickets);
                    //     console.log('statisticsData--->',statisticsData);
                    //     this.locked = statisticsData.locked;
                    //     this.validVote = statisticsData.validVote;
                    //     this.invalidVote = statisticsData.invalidVote;
                    //     this.groupByNode();
                    // })
                });
            },
             statistics(arr){
                let locked=0,validVote=0,invalidVote=0,profit=0;
                 arr.forEach((ticket)=>{
                     validVote+=ticket.vailVoteCount;
                     invalidVote+=(ticket.voteSum - ticket.vailVoteCount);
                     locked+=(mathService.mul(contractService.web3.fromWei(ticket.price,"ether"),ticket.vailVoteCount)-0);
                     profit = mathService.add(profit,contractService.web3.fromWei(ticket.income,"ether"))
                });
                return ({
                    locked:locked,
                    validVote:validVote,
                    invalidVote:invalidVote,
                    profit:profit
                })
            },
            groupBy(array, f) {
                const groups = {};
                array.forEach(function (o) {
                    const group = JSON.stringify(f(o));
                    groups[group] = groups[group] || [];
                    groups[group].push(o);
                });
                return Object.keys(groups).map(function (group) {
                    return groups[group];
                });
            },
            // 针对每个节点的数据统计
            groupByNode(){
                this.voteRecord = this.groupBy(this.tickets, function (item) {
                    return [item.nodeId];
                });
                let arr=[],_this=this;
                this.voteRecord.forEach((item,index)=>{
                    console.log('voteRecord-----',item);
                    let obj={
                        profit:0
                    };
                    let statisticsData = _this.statistics(item);
                    obj.nodeName = item[0].nodeName;
                    obj.CandidateId = item[0].nodeId;
                    obj.locked = statisticsData.locked;
                    obj.validVote = statisticsData.validVote;
                    obj.invalidVote = statisticsData.invalidVote;
                    // 单个节点的投票记录列表
                    obj.ticketList = item;
                    item.forEach((sI)=>{
                        obj.profit = mathService.add(obj.profit,contractService.web3.fromWei(sI.income,"ether"));
                    });
                    this.getNodeInfo(item[0].nodeId).then((nodeObj)=>{
                        obj.nodeName = nodeObj.nodeName;
                        obj.icon = nodeObj.icon;
                        _this.$set(this.voteRecord,index,obj);
                    });
                });
            },
            toVote(node){
                if(!this.hasBalOrds) return;
                this.$router.push({
                    path:'/vote',
                    query:{
                        nodeId:node.CandidateId,
                        nodeName:node.nodeName,
                        icon:node.icon
                    }
                });
            },
            toVoteDetail(node){
                console.log('node---->',node);
                this.updateNodeName(node.nodeName);
                this.$router.push({
                    path:'/vote-detail',
                    query:node
                })
            }
        },
        filters:{
            'decimal':function(num){
                num = num+'';
                if(num.indexOf('.')!==-1){
                    return num.slice(0,num.indexOf('.')+9)
                }else{
                    return num
                }
            }
        },
        beforeDestroy(){

        },
        components:{
            pageLoading
        }
    }
</script>

<style lang="less" scoped>
    .vote-container{
        margin: 0 10px;
        height:calc(~"100% - 72px");
        overflow: hidden;
        background: #F3F8FF;
        border-radius: 4px;
    }
    .my-vote{
        margin:0;
        width:100%;
        height:100%;
        .profit{
            display: block;
            max-width:100px;
            white-space: nowrap;
            margin: 0 auto;
        }
    }
    .title{
        margin:0;
        padding-bottom:14px;
        font-size: 14px;
        color: #24272B;
        font-weight:600;
    }
    .header{
        margin-bottom:15px;
        padding:14px 20px;
        background:#fff;
        border-radius: 4px;
        >ul{
            display:flex;
            .top{
                margin-bottom:8px;
                height:17px;
                line-height:17px;
                font-size: 12px;
                color: #525768;
            }
            .bottom{
                height:20px;
                line-height:20px;
                font-size: 12px;
                color: #120000;
                .bold{
                    font-size: 14px;
                    color: #24272B;
                }
            }
        }
        li{
            flex-grow: 1;
        }
    }
    .content{
        margin-top:14px;
        padding:20px;
        height:calc(~"100% - 123px");
        background-color: #fff;
    }
    .vote-item{
        display:flex;
        justify-content: space-around;
        >p{
           display:inline-flex;
           flex-direction: column;
        }
    }
    .no-data{
        padding-left:19px;
        margin-top:6px;
        font-size: 12px;
        color: #9EABBE;
        letter-spacing: 0.43px;
        background: url("./images/34icon_warning.svg") no-repeat left center;
    }
    .ticket-record{
        >ul{
            .ticket-item{
                display:flex;
                height:71px;
                line-height:71px;
                border-bottom:solid 1px #D3D8E1;
                .bold{
                    font-size: 16px;
                    color: #24272B;
                    font-weight:600;
                }
                .node-name{
                    min-width:86px;
                    width:8%;
                    max-width:200px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-size: 12px;
                    img{
                        display:inline-block;
                        margin-right:8px;
                        width:30px;
                        height:30px;
                        border-radius: 30px;
                        vertical-align: middle;
                    }
                }
                .unit{
                    font-size: 12px;
                    color: #22272C;
                }
                p:not(.vote-btn){
                    flex-grow:1;
                    min-width: 100px;
                    overflow: hidden;
                }
                p.vote-btn{
                    min-width:298px;
                }
                .column{
                    padding:10px 0;
                    display:flex;
                    flex-direction: column;
                    text-align: center;
                    >span{
                        &:first-of-type{
                             height:31px;
                             line-height:31px;
                         }
                        &:last-of-type{
                             height:17px;
                             line-height:17px;
                         }
                    }
                    .label{
                        font-size: 12px;
                        color: #9EABBE;
                    }
                }
               .vote-btn{
                   /*padding-right:20px;*/
                    text-align:right;
                   >span{
                       margin-left:20px;
                       display:inline-block;
                       padding:0 20px 0 46px;
                       height:34px;
                       line-height:32px;
                       border:solid 1px #0077FF;
                       border-radius:4px;
                       cursor:pointer;
                       font-size: 12px;
                       &:hover{
                            background-color: #ECF1F8;
                        }
                   }
                   .vote{
                       background: url("./images/61.icon_vote.svg") no-repeat 19px center;
                       background-size: 20px 20px;
                   }
                    .detail{
                        background: url("./images/icon_detail.svg") no-repeat 19px center;
                        background-size: 20px 20px;
                    }
                    .disabled{
                        background: url("./images/61.icon_vote3.svg") no-repeat 19px center;
                        background-size: 20px 20px;
                        border:solid 1px #ccc;
                        cursor:not-allowed;
                    }
               }
            }
        }
        .my-vote-list{
            overflow-y:auto;
            max-height: calc(~"100% - 33px");
        }
    }
</style>
<style lang="less">

</style>

