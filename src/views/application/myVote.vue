<template>
    <div class="my-vote format-style">
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
                <!--<li>-->
                    <!--<p class="top">{{$t('vote.Profit')}}</p>-->
                    <!--<p class="bottom">-->
                        <!--<span class="bold">{{voteRecord.length==0?'―':profit}}</span>-->
                        <!--<span>{{voteRecord.length==0?'':'Energon'}}</span>-->
                    <!--</p>-->
                <!--</li>-->
            </ul>
        </div>
        <div class="content ticket-record">
            <p class="title">{{$t('vote.votingRecord')}}</p>
            <ul>
                <li v-for="ticket in voteRecord" :key="ticket.ticketId" class="ticket-item">
                    <p class="node-name bold">
                        <img :src="'./static/images/characters/characters-'+ticket.icon+'.jpg'" alt="">
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
                    <!--<p class="column">-->
                        <!--<span class="profit"><span class="bold">{{ticket.profit?ticket.profit:'—'}}</span></span>-->
                        <!--<span class="label">{{$t('vote.Profit')}}</span>-->
                    <!--</p>-->
                    <p class="vote-btn">
                        <span class="vote" @click="toVote(ticket)">{{$t('vote.addVote')}}</span>
                        <span class="detail" @click="toVoteDetail(ticket)">{{$t('vote.voteDetail')}}</span>
                    </p>
                </li>
            </ul>
            <p v-if="voteRecord.length==0" class="no-data">{{$t('vote.noData')}}</p>
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex'
    import contractService from '@/services/contract-servies';
    import mathService from '@/services/math';

    export default {
        name: 'myVote',
        data () {
            return {
                voteRecord:[],
                tickets:[],
                locked:0,
                validVote:0,
                invalidVote:0,
                profit:0
            }
        },
        computed: {
            // ...mapGetters([''])
        },
        mounted(){
            this.init();
        },
        methods: {
            ...mapActions(['getMyVoteList','getNodeInfo','calculatedIncome','updateNodeName','getOrd','getBalOrd']),
            init(){
                this.getMyVoteList().then((ticketIds)=>{
                    console.log('getMyVoteList---',JSON.stringify(ticketIds));
                    contractService.platONCall(contractService.getABI(3),contractService.voteContractAddress,'GetBatchTicketDetail',contractService.voteContractAddress,[ticketIds.join(":")]).then((data)=>{
                        this.tickets = JSON.parse(data);
                        console.log('tickets--->',JSON.stringify(this.tickets));
                        let statisticsData = this.statistics(this.tickets);
                        console.log('statisticsData--->',statisticsData);
                        this.locked = statisticsData.locked;
                        this.validVote = statisticsData.validVote;
                        this.invalidVote = statisticsData.invalidVote;
                        this.groupByNode();
                    })
                });
            },
             statistics(arr){
                let locked=0,validVote=0,invalidVote=0,profit=0;
                 arr.forEach((ticket)=>{
                     console.log('票状态---->',ticket.State);
                    if(ticket.State==1){
                        validVote++;
                        locked+=contractService.web3.fromWei(ticket.Deposit,"ether")-0;
                    }else{
                        invalidVote++;
                    }
                     if(ticket.State==2){
                         profit++;
                     }
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
            groupByNode(){
                this.voteRecord = this.groupBy(this.tickets, function (item) {
                    return [item.CandidateId];
                });
                let arr=[],_this=this;
                this.voteRecord.forEach((item,index)=>{
                    let obj={};
                    let statisticsData = _this.statistics(item);
                    console.log('statisticsData--2-->',statisticsData);
                    obj.nodeName = item[0].nodeName;
                    obj.CandidateId = item[0].CandidateId;
                    obj.locked = statisticsData.locked;
                    obj.validVote = statisticsData.validVote;
                    obj.invalidVote = statisticsData.invalidVote;
                    obj.luckyTicket = statisticsData.profit;
                    obj.ticketList = item;
                    this.calculatedIncome().then((income)=>{
                        let profit = mathService.mul((contractService.web3.fromWei(income,"ether")-0),statisticsData.profit);
                        console.log('profit--->',profit);
                        this.profit+=profit-0;
                        obj.profit = profit;
                        this.getNodeInfo(item[0].CandidateId).then((nodeObj)=>{
                            obj.nodeName = nodeObj.nodeName;
                            obj.icon = nodeObj.icon;
                            _this.$set(this.voteRecord,index,obj);
                        });
                    });
                });
            },
            toVote(node){
                this.getOrd().then((arr)=>{
                    if(arr.length==0){
                        this.$message.warning(this.$t('application.noWallet'));
                        return;
                    }else{
                        this.getBalOrd().then((arr)=>{
                            if(arr.length==0){
                                this.$message.warning(this.$t('vote.noBalance'));
                                return;
                            }else{
                                this.$router.push({
                                    path:'/vote',
                                    query:{
                                        nodeId:node.CandidateId,
                                        nodeName:node.nodeName,
                                        icon:node.icon
                                    }
                                });
                            }
                        });
                    }
                });
            },
            toVoteDetail(node){
                this.updateNodeName(node.nodeName);
                this.$router.push({
                    path:'/vote-detail',
                    query:node
                })
            }
        },
        filters:{

        },
        beforeDestroy(){

        }
    }
</script>

<style lang="less" scoped>
    .my-vote{
        .profit{
            display: block;
            max-width:100px;
            white-space: nowrap;
        }
    }
    .header{
        margin-bottom:15px;
        padding:14px 20px;
        background:#fff;
        box-shadow: 0 4px 6px 0 rgba(48,48,77,0.05), 0 2px 4px 0 rgba(148,148,197,0.05);
        border-radius: 4px;
        >ul{
            display:flex;
            .top{
                margin:9.7px 0 8px;
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
        .title{
            margin:0;
            padding-bottom:13.3px;
            font-size: 14px;
            color: #24272B;
            font-weight:600;
            border-bottom:solid 1px #D3D8E1;
        }
    }
    .content{
        padding:0 20px;
        >p{
            margin:10px 0;
        }
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
        font-size: 12px;
        color: #9EABBE;
        letter-spacing: 0.43px;
    }
    .ticket-record{
        .title{

        }
        >ul{
            .ticket-item{
                display:flex;
                margin-bottom:10px;
                height:77px;
                line-height:77px;
                background: #FFFFFF;
                box-shadow: 0 4px 6px 0 rgba(48,48,77,0.05), 0 2px 4px 0 rgba(148,148,197,0.05);
                border-radius: 4px;
                .bold{
                    font-size: 16px;
                    color: #24272B;
                    font-weight:600;
                }
                .node-name{
                    padding-left:20px;
                    min-width:86px;
                    width:15%;
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
                p{
                    flex-grow:1;
                }
                .column{
                    padding:15px 0;
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
                   padding-right:20px;
                    text-align:right;
                   >span{
                       margin-left:20px;
                       display:inline-block;
                       padding:0 12px 0 38px;
                       height:34px;
                       line-height:34px;
                       border:solid 1px #18C2E9;
                       border-radius:4px;
                       cursor:pointer;
                       font-size: 12px;
                       color: #24272B;
                   }
                   .vote{
                       background: url("./images/icon_vote.svg") no-repeat 12px center;
                       background-size: 20px 20px;
                   }
                    .detail{
                        background: url("./images/icon_detail.svg") no-repeat 12px center;
                        background-size: 20px 20px;
                    }
               }
            }
        }
    }
</style>
<style lang="less">

</style>

