<template>
    <div class="validator-node format-style">
        <div class="header">
            <el-select popper-class="validator-select" v-model="sortBy" @change="search" :class="[lang=='en'?'enSearch':'','select'+sortBy]" :placeholder="$t('wallet.selectHint')" @visible-change="clickSel">
                <el-option v-for="option in options" :label="option.label" :value="option.code" :key="option.code"></el-option>
            </el-select>
            <span class="icon-search">
                <el-input :class="[keyword&&!/^\s*$/g.test(keyword)?'input1':'input2']" v-model="keyword" v-if="showKeyInput" @change="search" @keyup.enter.native="search" :placeholder="$t('application.enterAccount')">
                    <i slot="append" class="icon-close" @click="clearSearch"></i>
                </el-input>
                <i v-if="!showKeyInput" @click="showKeyInput=!showKeyInput"></i>
            </span>
            <span class="my-vote" @click="gotoMyNote">{{$t('vote.myVote')}}</span>
            <span class="my-node" @click="gotoMyNode">{{$t('application.myNode')}}</span>
        </div>
        <div class="card content">
            <div class="note">
                <span class="border"><span class="icon ticket-price"></span>{{$t('vote.ticketPrice')}} <span class="bold">{{ticketPrice}}</span><span class="font10"> Energon</span></span>
                <span class="border">
                    <span class="icon ticket-pool"></span>
                    {{$t('vote.ticketPool')}}
                    <el-progress :percentage="remainder*100/100" color="#0077FF" :show-text="false"></el-progress>
                    <span class="bold">{{remainder}}</span><span class="font10"> %</span></span>
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
                    <tr v-for="(node,index) in nodeList" @click="gotoDetail(node.CandidateId,node.Owner,node.Extra.nodePortrait,index+1,node.city,node.allowed,node.outSideNode,node.ticketsCount)">
                        <td width="1" class="border"></td>
                        <td class="bold">
                            <span :class="['icon-node','node-'+node.Extra.nodePortrait%4]" v-if="node.Extra">{{node.Extra&&node.Extra.nodeName ? node.Extra.nodeName.slice(0,1).toUpperCase():''}}</span>
                            <span class="node-name">{{node.Extra ? node.Extra.nodeName:''}}</span>
                        </td>
                        <td class="node-state">
                            <span v-if="node.verNode==1" class="node1">{{$t('application.status3')}}</span>
                            <span v-else :class="[node.allowed?'node3':'node2']">{{node.allowed?$t('application.status5'):$t('application.status4')}}</span>
                        </td>
                        <td>{{node.city}}</td>
                        <td class="font-bold">{{node.Deposit}}</td>
                        <td class="font-bold">{{index+1}}</td>
                        <td class="font-bold">{{node.Fee | perc}}</td>
                        <td class="font-bold">{{node.ticketsCount}}</td>
                        <td> <span @click.stop="gotoVote(node)" :class="[(!hasBalOrds || node.outSideNode)?'disabled':'','vote']"></span></td>
                        <td width="1"></td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <div v-else-if="loadCompolete" class="no-data-bg">
                <p>{{$t('application.noCandidate')}}</p>
            </div>
            <div v-else>
                <page-loading :loadTxt="$t('form.loading')"></page-loading>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex'
    import Settings from '@/services/setting';
    import MathService from '@/services/math';
    import contractService from '@/services/contract-servies';
    import pageLoading from '@/components/loading/pageLoading';
    var fs = require("fs");
    export default {
        name: 'validatorNode',
        data () {
            return {
                sortBy:'1',
                keyword:'',
                showKeyInput:false,
                candidateNodeList:[],
                nodeList:[],
                nodeListDeep:[],
                verList:[],
                nodeListCopy:[],
                ticketPrice:0,
                remainder:100,
                remainderBlock:'---',
                loadCompolete:false,
                hasBalOrds:false,
                insertIndex:0,  //最后一个候选节点位于节点列表中的index,便于将不在候选池中的验证节点插入列表
            }
        },
        computed: {
            ...mapGetters(['lang','network','chainName','isMaximized']),
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
                if(fs.existsSync(filePath)){
                    let cbftJson = fs.readFileSync(`${filePath}`,'utf8');
                    try{
                        let cbftObj = JSON.parse(cbftJson);
                        return cbftObj.ppos.candidate.allowed
                    }catch(e){
                        return 512
                    }
                }else{
                    return 512
                }
            }
        },
        mounted(){
            // contractService.getCid();
            this.init();
            if(window.getTicketInfoTimer){
                clearInterval(window.getTicketInfoTimer);
                window.getTicketInfoTimer = null;
            }else{
                window.getTicketInfoTimer = setInterval(()=>{
                    console.log('setInterval----');
                    this.init();
                },5000);
            }
        },
        methods: {
            ...mapActions(['getCandidateListByGroup','candidateList','verifiersList','getCityByIp','isMyNode','GetBatchCandidateTicketIds','hasBalOrd','updatePageLoading','getCandidateList','verifiersNodeList','getApplyNodeList']),
            init(){
                this.updatePageLoading(true);
                let _this = this;
                this.getTicketPrice();
                this.getPoolRemainder();
                this.getBlockNumber();
                this.hasBalOrd().then((hasBalOrd)=>{
                    this.hasBalOrds = hasBalOrd;
                });
                this.getCandidateListByGroup().then((groupList)=>{
                    console.log('定位4',groupList);
                    if(groupList.length==0){
                        this.loadCompolete = true;
                        return;
                    }
                    this.nodeListCopy = JSON.parse(JSON.stringify(groupList));
                    if(this.keyword && !/^\s*$/g.test(this.keyword)){
                        if(this.keyword.indexOf("\\")!==-1){
                            this.nodeListDeep=[];
                            return;
                        }
                        this.nodeListDeep=groupList.filter((item)=>{
                            return item.Extra && item.Extra.nodeName && !!item.Extra.nodeName.toLowerCase().match(this.keyword.toLowerCase())
                        });
                    }else{
                        this.nodeListDeep = groupList;
                    }
                    // this.nodeList = groupList;
                    this.getTicketInfo();
                    this.nodeListDeep.forEach((item, index) => {
                        item.verNode=0;
                        if(!item.outSideNode){
                            item.Deposit = contractService.web3.fromWei(item.Deposit,"ether");
                        }
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
                                this.$set(this.nodeListDeep, index, item);
                            });
                        }
                    });
                });

            },
            clickSel(bool){
                if(!bool) return;
                let ele = document.getElementsByClassName('el-select-dropdown__list');
                ele[0].style.width=160+'px';
            },
            //获取节点所得选票数
            getTicketInfo(){
                console.log('getTicketInfo');
                if(this.nodeListDeep && this.nodeListDeep.length>0){
                    let nodeIds = this.nodeListDeep.map((item)=>{
                        return item.CandidateId
                    }),count=0;
                    this.GetBatchCandidateTicketIds(nodeIds).then((ticketsList)=>{
                        this.verifiersList().then((verList)=> {
                            this.nodeList = this.nodeListDeep;
                            this.nodeList.forEach((node, index) => {
                                count++;
                                node.verNode = (verList.indexOf(node.CandidateId) !== -1)?1:2;
                                if(ticketsList && ticketsList[node.CandidateId]){
                                    node.ticketsCount = ticketsList[node.CandidateId];
                                }else{
                                    node.ticketsCount = 0;
                                }
                                this.$set(this.nodeList,node,index);
                                if(count==this.nodeList.length){
                                    this.nodeListCopy = JSON.parse(JSON.stringify(this.nodeList));
                                    this.search();
                                    this.loadCompolete = true;
                                }
                            })
                        });
                    });
                }else{
                    this.loadCompolete = true;
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
                    contractService.web3.eth.getSyncing((e,data)=>{
                        if(!e && !!data){
                            this.remainderBlock = '---'
                        }else{
                            contractService.web3.eth.getBlockNumber((err,block)=>{
                                if(err){
                                    clearInterval(window.blockNumberTimer);
                                }
                                if(block==0){
                                    this.remainderBlock = '---'
                                }else{
                                    let remainderBlock = 250 - block%250;
                                    if(remainderBlock<10){
                                        this.remainderBlock = '00'+remainderBlock;
                                    }else if(remainderBlock<100){
                                        this.remainderBlock = '0'+remainderBlock;
                                    }else{
                                        this.remainderBlock = remainderBlock+'';
                                    }
                                }

                            })
                        }
                    });
                },1000)
            },
            search(){
                let arr = JSON.parse(JSON.stringify(this.nodeListCopy));
                if(this.keyword && !/^\s*$/g.test(this.keyword)){
                    if(this.keyword.indexOf("\\")!==-1){
                        this.nodeList=[];
                        return;
                    }
                    this.nodeList=arr.filter((item)=>{
                        return item.Extra && item.Extra.nodeName && !!item.Extra.nodeName.toLowerCase().match(this.keyword.toLowerCase())
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
                        break;
                    case '3':
                        //分红比例
                        this.nodeList.sort(function(a,b){
                            return (a.Fee - b.Fee) || (a.BlockNumber-b.BlockNumber);
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
                this.getApplyNodeList().then((n)=>{
                    if(!n){
                        this.$router.push({
                            path:'/my-node',
                            query:{
                                ticketsCount:0
                            }
                        })
                    }else{
                        let myNodeId = n.CandidateId,ticketsCount=0,allowed=false;
                        let mynodeArr = this.nodeList.filter((item)=>{
                            return item.CandidateId.replace(/^0x/,'') == myNodeId.replace(/^0x/,'');
                        });
                        if(mynodeArr.length>0){
                            ticketsCount =  mynodeArr[0].ticketsCount;
                            allowed = mynodeArr[0].allowed
                        }
                        this.$router.push({
                            path:'/my-node',
                            query:{
                                ticketsCount:ticketsCount,
                                allowed:allowed
                            }
                        })
                    }

                });
            },
            gotoMyNote(){
                this.$router.push('/my-vote')
            },
            gotoDetail(id,owner,nodePortrait,ranking,city,allowed,outSideNode,ticketsCount){
                if(outSideNode) return;
                //由于SetCandidateExtra接口会暴露出去 用户logo可能会不按照格式传参，获取列表若nodePortrait不是合法的，则随机设置，带过去详情页
                this.isMyNode(id).then((bool)=>{
                    if(bool){
                        this.$router.push({
                            path:'/my-node',
                            query:{
                                ticketsCount:ticketsCount,
                                allowed:allowed
                            }
                        })
                    }else{
                        this.$router.push({
                            path:'/node-detail',
                            query:{
                                nodeId:id,
                                owner:owner,
                                nodePortrait:nodePortrait,
                                ranking:ranking,
                                city:city,
                                allowed:allowed,
                                outSideNode:outSideNode,
                                ticketsCount:ticketsCount
                            }
                        });
                    }
                });
            },
            gotoVote(node){
                if(!this.hasBalOrds) return;
                this.candidateList().then((list)=>{
                    let idArr = list.map((item)=>{
                        return item.CandidateId
                    });
                    if(idArr.length==0 || idArr.indexOf(node.CandidateId.replace(/^0x/,''))==-1){
                        this.$message.warning(this.$t('vote.invalidNode'));
                        this.init();
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
            },
            clearSearch(){
                this.keyword='';
                this.showKeyInput = false;
                this.search();
            }
        },
        filters:{
            'perc':function(num){
                if(!num) return;
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
        components:{
            pageLoading
        },
        watch:{
            '$route': {
                handler: function(val, oldVal){
                    if(val.path==="/validator-node"){
                        this.init();
                    }
                },
                immediate: true
            }
        }
    }

</script>

<style lang="less" scoped>
    .font-bold{
        font-weight: 600;
    }
    .validator-node{
        font-size:12px;
        .card{
            padding:0;
            height:calc(~"100% - 42px");
            background: #f3f8ff;
        }
        .vote{
            position:relative;
            top:3px;
            display:inline-block;
            width:20px;
            height:20px;
            background: url("./images/61.icon_vote.svg") no-repeat center center;
            background-size: contain;
            &.disabled{
                background: url("./images/61.icon_vote3.svg") no-repeat center center;
                background-size: contain;
                cursor:not-allowed;
            }
        }
        .header{
            margin-top:-6px;
            margin-bottom:11px;
            display:flex;
            width:100%;
            height:25px;
            line-height:25px;
        }
        .note{
            margin-bottom:14px;
            display:flex;
            width:100%;
            height:52px;
            line-height:52px;
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
                top:17px;
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
                line-height: 22px;
                font-size:16px;
                background: #ECF1F8;
                border: 1px solid #0077FF;
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
            height:calc(~"100% - 61px");
            font-size: 12px;
            overflow:auto;
            overflow-x: hidden;
            background:#FFF;
            border-radius:4px;
            table{
                width:100%;
                tr{
                    padding-right:20px;
                }
                thead tr td{
                    line-height:37px;
                    color: #525768;
                    text-align: left;
                    border-bottom:solid 1px #ECEFF6;
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
                    .border{
                        border-left:solid 3px #0077FF;
                    }

                }
                tr td{
                    white-space:nowrap;
                    &:first-of-type,&:last-of-type{
                        padding-left:19px;
                        border:none;
                        border-radius:0 4px 0 0;
                    }
                    &:first-of-type{
                        border-left:solid 3px transparent;
                        border-radius:4px 0 0 0;
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
    .my-node,.my-vote{
        padding-left:20px;
        height:25px;
        line-height:25px;
        color: #525768;
        text-align: center;
        border-radius: 4px;
        cursor:pointer;
        &:hover{
            color:  #0077FF;
        }
    }
    .my-node{
        margin-left:30px;
        background: url("./images/61.icon_node2.svg") no-repeat left center;
        &:hover{
            background: url("./images/61.icon_node.svg") no-repeat left center;
        }
    }
    .my-vote{
        background: url("./images/61.icon_vote2.svg") no-repeat left center;
        &:hover{
            background: url("./images/61.icon_vote.svg") no-repeat left center;
        }
    }
    .icon-search{
        flex-grow:1;
        height:25px;
        i{
            display:block;
            width:25px;
            height:25px;
            background: url("./images/icon_query.svg") no-repeat left center;
        }
        .icon-close{
            width:25px;
            height:25px;
            background: url("./images/cancel.png") no-repeat left center;
            background-size: 8px 8px;
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
        border-radius: 4px;
        background: url("../../../static/images/empty.png") no-repeat center 90px #fff;
        p{
            color: #9EABBE;
        }
    }
    .enSearch{
        margin-right:14px;
    }

</style>
<style lang="less">
    .validator-node{
        .el-progress{
            margin:0 6px;
            display:inline-block;
            width:75px;
            .el-progress-bar__inner{
                background-color: #0077FF;
            }
        }
        .el-select{
            width:115px;
            .el-input{
                width:115px;
                height:25px;
                line-height:25px;
            }
            .el-input__icon{
                color: #24272B;
            }
            .el-input__inner{
                padding-left:2px;
                height:25px;
                line-height:25px;
                font-size: 16px;
                color: #24272B;
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
                width:185px;
                height:25px;
                line-height:25px;
                .el-input__inner{
                    padding-left:25px;
                    height:25px;
                    border: 1px solid #9EABBE;
                    border-radius: 12px;
                }
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

        .widthAdjust(@cn,@en){
            width:@cn;
            .el-input{
                width:@cn;
            }
            &.enSearch{
                width:@en;
                .el-input{
                    width:@en;
                }
            }
        }
        .select1{
            .widthAdjust(103px,93px)
        }
        .select2{
            .widthAdjust(103px,155px)
        }
        .select3{
            .widthAdjust(103px,145px)
        }
        .select4{
            .widthAdjust(103px,103px)
        }
    }
    .node-state{
        span{
            display: block;
            width:79px;
            height:26px;
            line-height: 26px;
            text-align: center;
            font-size: 10px;
            letter-spacing: 0.5px;
        }
        .node1{
            color: #0077FF;
            border: 1px solid #0077FF;
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
    .validator-select{
        //#0077FF
        /deep/ .selected{
            color: #0077FF;
            background: transparent;
            &:hover{
                background-color: #e4e8f1;
            }
        }
        .el-select-dropdown__item{
            &:hover{
                 color: #0077FF;
            }
        }
    }
</style>

