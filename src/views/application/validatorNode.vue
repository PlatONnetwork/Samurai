<template>
    <div class="validator-node format-style">
        <div class="header">
            <el-select v-model="sortBy" @change="search" :class="[lang=='en'?'enSearch':'']">
                <el-option v-for="option in options" :label="option.label" :value="option.code" :key="option.code"></el-option>
            </el-select>
            <span class="icon-search">
                <el-input :class="[keyword&&!/^\s*$/g.test(keyword)?'input1':'input2',lang=='en'?'width278':'']" v-model="keyword" v-if="showKeyInput" @change="search" @keyup.enter.native="search" :placeholder="$t('application.enterAccount')">
                    <i slot="append" class="icon-close" @click="clearSearch"></i>
                </el-input>
                <i v-if="!showKeyInput" @click="showKeyInput=!showKeyInput"></i>
            </span>
            <el-button class="my-node" @click="gotoMyNote">{{$t('vote.myVote')}}</el-button>
            <el-button class="my-node" @click="gotoMyNode">{{$t('application.myNode')}}</el-button>
        </div>
        <div class="card content">
            <div class="note">
                <span class="border"><span class="icon ticket-price"></span>{{$t('vote.ticketPrice')}} <span class="bold">{{ticketPrice}}</span><span class="font10"> Energon</span></span>
                <span class="border"><span class="icon ticket-pool"></span>{{$t('vote.ticketPool')}} <span class="bold">{{remainder}}</span><span class="font10"> %</span></span>
                <span>
                    <span class="icon round-left"></span>
                    {{$t('vote.roundLeft')}}
                    <span class="block" v-for="(b,index) in remainderBlock" :key="index">
                        {{b}}
                    </span>
                    {{$t('vote.blocks')}}
                </span>
            </div>
            <div class="candidate-list" v-if="loadCompolete && nodeList && nodeList.length>0">
                <table class="table" cellspacing="0">
                    <thead>
                        <tr>
                           <td width="1"></td>
                           <td width="18%">{{$t('application.nodeName')}}</td>
                           <td width="13%">{{$t('application.status')}}</td>
                           <td width="13%">{{$t('application.position')}}</td>
                           <td width="16%">{{$t('application.staked')}}</td>
                           <td width="13%">{{$t('application.ranking')}}</td>
                           <td width="13%">{{$t('application.fee')}}</td>
                           <td width="10%">{{$t('vote.tickets')}}</td>
                           <td width="2%"></td>
                           <td width="1"></td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="node in nodeList" @click="gotoDetail(node.CandidateId,node.Owner,node.Extra.nodePortrait,node.ranking,node.city,node.allowed)">
                            <td width="1"></td>
                            <td class="bold">
                                <img :src="'./static/images/characters/characters-'+node.Extra.nodePortrait+'.jpg'" alt="" v-if="node.Extra">
                                <span class="node-name">{{node.Extra ? node.Extra.nodeName:''}}</span>
                            </td>
                            <td class="node-state">
                                <span v-if="node.verNode" class="node1">{{$t('application.status3')}}</span>
                                <span v-else :class="[node.allowed?'node3':'node2']">{{node.allowed?$t('application.status5'):$t('application.status4')}}</span>
                            </td>
                            <td>{{node.city}}</td>
                            <td>{{node.Deposit}}</td>
                            <td>{{node.ranking}}</td>
                            <td>{{node.Fee | perc}}</td>
                            <td>{{node.ticketsCount}}</td>
                            <td> <span @click.stop="gotoVote(node)" class="vote"></span></td>
                            <td width="1"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else-if="loadCompolete" class="no-data-bg">
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
                nodeListCopy:[],
                ticketPrice:0,
                remainder:100,
                remainderBlock:'000',
                loadCompolete:false
            }
        },
        computed: {
            ...mapGetters(['lang','network','chainName']),
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
            },
            APIConfig:function(){
                var APIConfig = require('@/config/API-config');
                return APIConfig.default;
            },
            allowed:function(){
                let cate,filePath;
                if(this.network.type=='custom'){
                    cate = this.chainName;
                }
                if(cate){
                    filePath = Settings.userDataPath+'net_'+this.network.type+'/chain/'+cate+'/cbft.json';
                }else{
                    filePath = Settings.userDataPath+'net_'+this.network.type+'/data/cbft.json';
                }
                let cbftJson = fs.readFileSync(`${filePath}`,'utf8');
                try{
                    let cbftObj = JSON.parse(cbftJson);
                    return cbftObj.ppos.candidate.allowed
                }catch(e){
                    return 512
                }
            }
        },
        mounted(){
            this.init();
        },
        methods: {
            ...mapActions(['candidateList','verifiersList','getCityByIp','isMyNode','getOrd','getBalOrd','getDepositList','GetBatchCandidateTicketIds']),
            init(){
                let _this = this;
                this.getTicketPrice();
                this.getPoolRemainder();
                this.getBlockNumber();
                this.verifiersList().then((verList)=> {
                    this.candidateList().then((list) => {
                        this.loadCompolete = true;
                        this.getTicketInfo(list);
                        console.log('candidateList---000--', list);
                        this.nodeList = list;
                        this.nodeList.forEach((item, index) => {
                            item.verNode = (verList.indexOf(item.CandidateId) !== -1);
                            let ip = item.Host.replace(/^http\:\/\//g, ''),
                                ipStorage = window.localStorage.getItem('ipCitys') ? JSON.parse(window.localStorage.getItem('ipCitys')) : {};
                            if (ipStorage[ip]) {
                                item.city = ipStorage[ip];
                            } else {
                                _this.getCityByIp(ip).then((city) => {
                                    //获取ip的接口是外部网站的接口，不能保证一定会有返回
                                    ipStorage[ip] = city;
                                    window.localStorage.setItem('ipCitys', JSON.stringify(ipStorage));
                                    item.city = city;
                                    this.$set(this.nodeList, index, item);
                                    this.nodeListCopy = JSON.parse(JSON.stringify(this.nodeList));
                                });
                            }
                        });
                        this.nodeListCopy = JSON.parse(JSON.stringify(this.nodeList));
                    });
                });
                window.getTicketInfoTimer = setInterval(()=>{
                    this.getTicketInfo(this.nodeList);
                    this.getVerifiers();
                    this.getPoolRemainder();
                },5000);
            },
            //查看节点是否成为验证节点
            getVerifiers(){
                this.verifiersList().then((verList)=> {
                    this.nodeList.forEach((item, index) => {
                        item.verNode = (verList.indexOf(item.CandidateId) !== -1);
                        this.$set(this.nodeList, index, item);
                    })
                })
            },
            //获取节点所得选票数
            getTicketInfo(list){
                console.log('获取节点所得选票数----',list);
                if(list && list.length>0){
                    let nodeIds = list.map((item)=>{
                        return item.CandidateId
                    });
                    this.GetBatchCandidateTicketIds(nodeIds).then((ticketsList)=>{
                        console.log('ticketsList---->',ticketsList);
                        if(ticketsList){
                            this.nodeList.forEach((node,index)=>{
                                if(ticketsList[node.CandidateId]){
                                    node.ticketsCount = ticketsList[node.CandidateId].length;
                                    if(node.ticketsCount>this.allowed || node.ticketsCount==this.allowed){
                                        node.allowed = true;
                                    }else{
                                        node.allowed = false;
                                    }
                                }else{
                                    node.ticketsCount = 0;
                                    node.allowed = false;
                                }
                                this.$set(this.nodeList,node,index);
                                this.nodeListCopy = JSON.parse(JSON.stringify(this.nodeList));
                            })
                        }

                    });
                }
            },
            //获取当前票价
            getTicketPrice(){
                contractService.platONCall(contractService.getABI(3),contractService.voteContractAddress,'GetTicketPrice',contractService.voteContractAddress).then((ticketPrice)=>{
                    this.ticketPrice = contractService.web3.fromWei(ticketPrice,"ether");
                })
            },
            //获取票池剩余票数量
            getPoolRemainder(){
                contractService.platONCall(contractService.getABI(3),contractService.voteContractAddress,'GetPoolRemainder',contractService.voteContractAddress).then((remainder)=>{
                    this.remainder = ((remainder/51200)*100).toFixed(2);
                })
            },
            getBlockNumber(){
                window.blockNumberTimer = setInterval(()=>{
                    contractService.web3.eth.getBlockNumber((err,block)=>{
                        if(err){
                            console.log('获取当前区块失败');
                            clearInterval(window.blockNumberTimer);
                        }
                        let remainderBlock = 250 - block%250;
                        if(remainderBlock<10){
                            this.remainderBlock = '00'+remainderBlock;
                        }else if(remainderBlock<100){
                            this.remainderBlock = '0'+remainderBlock;
                        }else{
                            this.remainderBlock = remainderBlock+'';
                        }
                    })
                },1000)
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
            gotoMyNote(){
                this.$router.push('/my-vote')
            },
            gotoDetail(id,owner,nodePortrait,ranking,city,allowed){
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
                                city:city,
                                allowed:allowed
                            }
                        });
                    }
                });
            },
            gotoVote(node){
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
                                        nodeName:node.Extra ? node.Extra.nodeName:'',
                                        icon:node.Extra ? node.Extra.nodePortrait:''
                                    }
                                });
                            }
                        });
                    }
                });
            },
            clearSearch(){
                this.keyword='';
                this.search();
            }
        },
        filters:{
            'perc':function(num){
                return 100 - MathService.div(num,100) +'%'
            }
        },
        beforeDestroy() {
            clearInterval(window.blockNumberTimer);
            window.blockNumberTimer = null;
            clearInterval(window.getTicketInfoTimer);
            window.getTicketInfoTimer = null;
        },
        destroyed() {
            clearInterval(window.blockNumberTimer);
            window.blockNumberTimer = null;
            clearInterval(window.getTicketInfoTimer);
            window.getTicketInfoTimer = null;
        },
    }
</script>

<style lang="less" scoped>
    .validator-node{
        margin-top:-70px;
        .card{
            height:calc(~"100% - 42px");
            background: #f8fafd;
        }
        .vote{
            position:relative;
            top:3px;
            display:inline-block;
            width:20px;
            height:20px;
            background: url("./images/icon_vote.svg") no-repeat center center;
            background-size: contain;
        }
        .header{
            margin-bottom:12px;
            display:flex;
            width:100%;
            height:32px;
            line-height:32px;
        }
        .note{
            margin-bottom:14px;
            display:flex;
            width:100%;
            height:60px;
            line-height:60px;
            background: #FFFFFF;
            box-shadow: 0 3px 6px 0 rgba(148,148,197,0.10);
            border-radius: 4px;
            >span{
                flex-grow: 1;
                position: relative;
                text-align: center;
                font-size: 12px;
                color: #525768;
            }
            .border:after{
                content:'';
                position:absolute;
                right:0;
                top:20px;
                width:1px;
                height:20px;
                border-right:solid 1px #ECEFF6;
            }
            .icon{
                display:inline-block;
                width:25px;
                height:15px;
                vertical-align: -3px;
            }
            .ticket-price{
                background: url("./images/icon_fare.svg") no-repeat center center;
                background-size: contain;
            }
            .ticket-pool{
                background: url("./images/icon_tickets.svg") no-repeat center center;
                background-size: contain;
            }
            .round-left{
                background: url("./images/icon_Sandtimer.svg") no-repeat center center;
                background-size: contain;
            }
            .block{
                margin:0 4px;
                display:inline-block;
                width:24px;
                height:24px;
                line-height: 24px;
                background: #ECF1F8;
                border: 1px solid #18C2E9;
                border-radius: 4px;
                font-style: normal;
                font-weight: 600;
            }
            .font10{
                font-size: 10px;
                color: #120000;
            }
            .bold{
                font-size: 14px;
                color: #24272B;
            }
        }
        .node-name{
            display: inline-block;
            max-width: 92px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .candidate-list{
            height:calc(~"100% - 70px");
            font-size: 12px;
            overflow:auto;
            background:#FFF;
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
                tr td{
                    white-space:nowrap;
                    &:first-of-type,&:last-of-type{
                         padding-left:19px;
                         border:none;
                    }
                }
            }
            .bold{
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
        .icon-close{
            width:25px;
            height:25px;
            background: url("./images/cancel.png") no-repeat left center;
            background-size: 10px 10px;
            cursor: pointer;
        }
    }
    .no-data-bg{
        padding-top:310px;
        height:calc(~"100% - 60px");
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
                padding-left:2px;
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
            .el-input-group__append{
                position: absolute;
                right: -22px;
                top: 0;
                margin:0;
                background:transparent;
                border:0px;
            }
            .icon-search-close{
                width:8px;
                height: 8px;
                background: url("./images/close.svg") no-repeat center center;
                cursor: pointer;
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

