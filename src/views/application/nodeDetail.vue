<template>
    <div class="node-detail format-style">
        <div class="my-node-content">
            <div class="header">
                <div class="node-info">
                    <p class="pic">
                        <img :src="'./static/images/characters/characters-'+node.Extra.nodePortrait+'.jpg'" alt="" v-if="node.Extra">
                    </p>
                    <p class="name">
                        <span> <span class="bold">{{node.Extra?node.Extra.nodeName:''}}</span> <span v-if="city">({{city}})</span></span>
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
                            <p><span class="txt">{{ticketsCount}}</span></p>
                        </li>
                        <li class="perc-li">
                            <p>{{$t('vote.ticketAge')}}</p>
                            <p><span class="txt">{{epoch}}</span>Bs</p>
                        </li>
                        <li  class="atp-li"></li>
                    </ul>
                </div>
                <div class="vote-btn">
                    <span @click="gotoVote">{{$t('vote.toVote')}}</span>
                </div>
            </div>
            <div class="detail">
                <p class="title">{{$t('application.basicInfo')}}</p>
                <div class="block">
                    <p class="sub-title">{{$t('application.nodeInfo')}}</p>
                    <p>
                        <span class="label-txt">{{$t('application.nodeUrl')}}</span>
                        <span class="bold">{{node.Host}}:{{node.Port}}</span>
                    </p>
                    <p class="candidateId-box">
                        <span class="label-txt">{{$t('application.nodePublicKeyID')}}</span>
                        <span class="candidateId bold">0x{{node.CandidateId}}</span>
                    </p>
                    <p>
                        <span class="label-txt">{{$t('application.nodeWallet')}}</span>
                        <span class="bold">{{node.Owner}}</span>
                    </p>
                    <p class="nodeIntro">
                        <span class="label-txt">{{$t('application.nodeIntro')}}</span>
                        <span class="nodeIntroTxt bold">{{node.Extra?node.Extra.nodeDiscription:''}}</span>
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
                ticketsCount:'',
                epoch:null
            }
        },
        computed: {
            APIConfig:function(){
                var APIConfig = require('@/config/API-config');
                return APIConfig.default;
            }
        },
        mounted(){
            this.init();
        },
        methods: {
            ...mapActions(['getNodeDetail','getCityByIp','verifiersList','getOrd','getBalOrd']),
            init(){
                let param=this.$route.query,_this=this;
                this.city = param.city;
                this.getNodeDetail(param).then((data)=>{
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
                        this.getNodeNote();
                        this.getEpoch();
                    });
                });
            },
            openNet(){
                const shell = require('electron').shell;
                shell.openExternal(this.node.Extra.officialWebsite);
            },
            getNodeNote(){
                contractService.platONCall(contractService.getABI(3),contractService.voteContractAddress,'GetCandidateTicketIds',this.node.Owner,[this.node.CandidateId]).then((ticketIds)=>{
                    console.log('ticketIds---->',ticketIds);
                    this.ticketsCount = JSON.parse(ticketIds).length;
                })
            },
            getEpoch(){
                contractService.platONCall(contractService.getABI(3),contractService.voteContractAddress,'GetCandidateEpoch',this.node.Owner,[this.node.CandidateId]).then((epoch)=>{
                    console.log('epoch----',epoch);
                    this.epoch = epoch;
                })
            },
            gotoVote(){
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
                                        nodeId:this.node.CandidateId,
                                        nodeName:this.node.Extra?this.node.Extra.nodeName:'',
                                        icon:this.node.Extra?this.node.Extra.nodePortrait:''
                                    }
                                });
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
    .nodeIntro{
        display: flex;
    }
    .nodeIntroTxt{
        word-break: break-all;
        width: 611px;
    }
    .net-btn{
        color: #18C2E9;
        cursor: pointer;
    }
    .header{
        border-radius:4px!important;
    }
    .vote-btn{
        height:45px;
        line-height:45px;
        background: #ECF1F8;
        box-shadow: 0 4px 6px 0 rgba(48,48,77,0.05), 0 2px 4px 0 rgba(148,148,197,0.05);
        border-radius: 0 0 4px 4px;
        text-align: center;
        >span{
            padding-left:20px;
            font-size: 12px;
            color: #24272B;
            cursor:pointer;
            background: url("./images/icon_vote_black.svg") no-repeat left center;
            background-size: 16px 16px;
        }
    }
</style>


