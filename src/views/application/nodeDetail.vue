<template>
    <div class="node-detail format-style">
        <div class="my-node-content">
            <div class="header">
                <div class="node-info">
                    <p class="pic">
                        <span :class="['icon-node','node-'+node.Extra.nodePortrait%4]" v-if="node.Extra">{{node.Extra ? node.Extra.nodeName.slice(0,1).toUpperCase():''}}</span>
                    </p>
                    <p class="name">
                        <span><span class="bold">{{node.Extra?node.Extra.nodeName:''}}</span> <span v-if="city">({{city}})</span></span>
                        <span class="time" v-if="node.Extra">{{$t('application.applyTime')}}:{{node.Extra.time | FormatDate}}</span>
                        <span class="time" v-else>{{$t('application.applyTime')}}:</span>
                    </p>
                    <p class="node-state">
                        <span v-if="node.verNode" class="node1">{{$t('application.status3')}}</span>
                        <span v-else :class="[node.allowed?'node3':'node2']">{{node.allowed?$t('application.status5'):$t('application.status4')}}</span>
                    </p>
                </div>
                <div>
                    <ul class="pledge-info">
                        <li class="atp-li">
                            <p>{{$t('application.staked')}}</p>
                            <p> <span class="txt">{{node.Deposit}}</span> Energon</p>
                        </li>
                        <li class="perc-li">
                            <p>{{$t('application.fee')}}</p>
                            <p><span class="txt">{{node.Fee | perc}}</span>%</p>
                        </li>
                        <li class="perc-li">
                            <p>{{$t('application.ranking')}}</p>
                            <p><span class="txt">{{node.ranking}}</span></p>
                        </li>
                        <li class="perc-li">
                            <p>{{$t('vote.currentTickets')}}</p>
                            <p><span class="txt">{{node.ticketsCount}}</span></p>
                        </li>
                        <!--<li class="perc-li">-->
                            <!--<p>{{$t('vote.ticketAge')}}</p>-->
                            <!--<p><span class="txt">{{epoch}}</span>Bs</p>-->
                        <!--</li>-->
                        <!--<li  class="atp-li"></li>-->
                    </ul>
                </div>
                <div class="vote-btn" v-if="!node.outSideNode">
                    <span @click="gotoVote" :class="[hasBalOrds?'':'disabled']">{{$t('vote.toVote')}}</span>
                </div>
            </div>
            <div class="detail">
                <p class="title">{{$t('application.basicInfo')}}</p>
                <div class="block">
                    <p class="sub-title">{{$t('application.nodeInfo')}}</p>
                    <p>
                        <span class="label-txt">{{$t('application.nodeUrl')}}</span><span class="bold">{{node.Host}}:{{node.Port}}</span>
                    </p>
                    <p class="candidateId-box">
                        <span class="label-txt">{{$t('application.nodePublicKeyID')}}</span>
                        <span class="candidateId bold">0x{{node.CandidateId}}</span>
                    </p>
                    <p>
                        <span class="label-txt">{{$t('application.nodeWallet')}}</span><span class="bold">{{node.Owner}}</span>
                    </p>
                    <p class="nodeIntro">
                        <span class="label-txt">{{$t('application.nodeIntro')}}</span>
                        <span class="nodeIntroTxt bold" :style="{width:isMaximized?'604px':'88%'}">{{node.Extra?node.Extra.nodeDiscription:''}}</span>
                    </p>
                </div>
                <div class="block">
                    <p class="sub-title">{{$t('application.profitPlan')}}</p>
                    <p>
                        <span class="label-txt">{{$t('application.ratio')}}</span>
                        <span class="bold">{{node.Fee | perc}}%</span>
                    </p>
                </div>
                <div class="block">
                    <p class="sub-title">{{$t('application.institutionalInfo')}}</p>
                    <p>
                        <span class="label-txt">{{$t('application.orgName')}}</span>
                        <span class="bold">{{node.Extra?node.Extra.nodeDepartment:''}}</span>
                    </p>
                    <p>
                        <span class="label-txt">{{$t('application.orgNet')}}</span>
                        <span class="net-btn bold" @click="openNet">{{node.officialWebsite}}</span>
                    </p>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex'
    var Http = require('http');
    import Settings from '@/services/setting';
    import MathService from '@/services/math';
    import contractService from '@/services/contract-servies';
    var fs = require("fs");
    export default {
        name: 'nodeDetail',
        data () {
            return {
                node:{},
		        city:'',
                epoch:null,
                hasBalOrds:false
            }
        },
        computed: {
            ...mapGetters(['isMaximized']),
            APIConfig:function(){
                var APIConfig = require('@/config/API-config');
                return APIConfig.default;
            }
        },
        mounted(){
            this.init();
        },
        methods: {
            ...mapActions(['getNodeDetail','getCityByIp','verifiersList','getOrd','getBalOrd','hasBalOrd','candidateList']),
            init(){
                let param=this.$route.query,_this=this;
                this.city = param.city;
                this.hasBalOrd().then((hasBalOrd)=>{
                    this.hasBalOrds = hasBalOrd;
                });
                this.getNodeDetail(param).then((data)=>{
                    console.log('getNodeDetail----',data);
                    if(!data) return;
                    let ip = data.Host.replace(/^http\:\/\//g,'');
                    data.officialWebsite = data.Extra.officialWebsite;
                    this.verifiersList().then((verList)=>{
                        Object.assign(data,{
                            verNode: (verList.indexOf(data.CandidateId)!==-1)
                        });
                        this.node = data;
                        this.node.Deposit = contractService.web3.fromWei(this.node.Deposit,"ether");
                        this.node.Extra.nodePortrait = param.nodePortrait;
                        this.node.ranking = param.ranking;
                        this.node.allowed = param.allowed;
                        this.node.outSideNode = param.outSideNode;
                        this.node.ticketsCount = param.ticketsCount;
                        this.getEpoch();
                    });
                });
            },
            openNet(){
                //打开外部网站
                const shell = require('electron').shell;
                shell.openExternal(this.node.Extra.officialWebsite);
            },
            getEpoch(){
                // 获取指定候选人的票龄
                contractService.platONCall(contractService.getABI(3),contractService.voteContractAddress,'GetCandidateEpoch',this.node.Owner,[this.node.CandidateId]).then((epoch)=>{
                    console.log('epoch----',epoch);
                    this.epoch = epoch;
                })
            },
            gotoVote(){
                if(!this.hasBalOrds) return;
                this.candidateList().then((list)=>{
                    let idArr = list.map((item)=>{
                        return item.CandidateId
                    });
                    if(idArr.length==0 || idArr.indexOf(this.node.CandidateId.replace(/^0x/,''))==-1){
                        this.$message.warning(this.$t('vote.invalidNode'));
                    }else{
                        this.$router.push({
                            path:'/vote',
                            query:{
                                nodeId:this.node.CandidateId,
                                nodeName:this.node.Extra?this.node.Extra.nodeName:'',
                                icon:this.node.Extra?this.node.Extra.nodePortrait:''
                            }
                        });
                    }
                });
            }
        },
        filters:{
            'perc':function(num){
                if(!num) return;
                return 100 - MathService.div(num,100)
            }
        },
    }
</script>

<style lang="less" scoped>
    .node-detail .pledge-info{
        .atp-li{
            margin-right: 20px;
        }
        .perc-li{
            margin-right: 20px;
        }
    }
    .label-txt+.bold{
        font-weight:bold;
    }
    .nodeIntro{
        display: flex;
    }
    .nodeIntroTxt{
        word-break: break-all;
        width: 604px;
    }
    .net-btn{
        color:  #0077FF;
        cursor: pointer;
    }
    .header{
        border-radius:4px!important;
    }
    .vote-btn{
        height:45px;
        line-height:45px;
        background: #ECF1F8;
        border-radius: 0 0 4px 4px;
        text-align: center;
        >span{
            padding-left:20px;
            font-size: 12px;
            color: #24272B;
            cursor:pointer;
            background: url("./images/61.icon_vote2.svg") no-repeat left center;
            background-size: 16px 16px;
            &:not(.disabled):hover{
                 color:#0077FF;
                 background: url("./images/61.icon_vote.svg") no-repeat left center;
                 background-size: 16px 16px;
             }
        }
        .disabled{
            cursor:not-allowed;
            background: url("./images/61.icon_vote3.svg") no-repeat left center;
            background-size: 16px 16px;
        }
    }
    .icon-node{
        width:42px;
        height:42px;
        line-height:42px;
        font-size: 16px;
    }
    .node-state{
        span{
            height:32px;
            line-height:30px;
        }
    }
</style>


