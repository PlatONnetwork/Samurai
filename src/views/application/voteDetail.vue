<template>
    <div class="vote-detail format-style">
        <table cellspacing="0">
            <thead>
                <tr :style="{lineHeight:lang=='en'?'19px':'37px'}">
                    <th width="12%">{{$t('vote.votingTime')}}</th>
                    <th width="15%">{{$t('vote.vaildTicket')}}</th>
                    <th width="8%">{{$t('vote.ticketPrice')}}</th>
                    <th width="15%">{{$t('vote.voteStaked1')}}</th>
                    <th width="10%">{{$t('vote.Profit')}}</th>
                    <th width="28%">{{$t('vote.votingWallet')}}</th>
                    <th width="12%">{{$t('vote.expirationTime')}}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="vote in voteRecord" :key="vote.createTime">
                    <td>
                        <span class="time" :style="{width:isMaximized?'58px':'108px'}">{{vote.createTime | FormatDate}}</span>
                    </td>
                    <td>{{vote.validVote}}/{{vote.invalidVote}}</td>
                    <td>{{vote.ticketPrice}}</td>
                    <td>{{vote.locked}}/{{vote.Released}}</td>
                    <td>{{vote.income?vote.income:'—'}}</td>
                    <td>
                        <span class="vote-wallet" :style="{width:isMaximized?'183px':'383px'}">{{isMaximized?vote.voteWalletTxt:vote.voteWallet}}({{vote.voteWalletAccount}})</span>
                    </td>
                    <td>
                        <span v-if="vote.expireTime" class="time" :style="{width:isMaximized?'58px':'108px'}">
                            {{vote.expireTime | FormatDate}}
                        </span>
                        <span v-else class="time" :style="{width:isMaximized?'58px':'108px'}">{{vote.estimatedExpirTime | FormatDate}}</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    import contractService from '@/services/contract-servies';
    import {mapGetters, mapActions} from 'vuex'

    export default {
        name: 'voteDetail',
        data () {
            return {
                node:{},
                voteRecord:[]
            }
        },
        computed: {
            ...mapGetters(['isMaximized','lang'])
        },
        mounted(){
            this.init();
        },
        methods: {
            ...mapActions(['getOrdByAddress','calculatedIncome']),
            init(){
                this.node = this.$route.query;
                let voteRecord = this.groupBy(this.node.ticketList, function (item) {
                    return [item.BlockNumber];
                });
                this.statistics(voteRecord);
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
            statistics(arr){
                let voteArr = [];
                arr.forEach((item)=>{
                    let obj = {
                        validVote:0,
                        invalidVote:0,
                        locked:0,
                        Released:0,
                        income:0
                    };
                    item.forEach((sItem)=>{
                        if(sItem.State==1){
                            obj.validVote++;
                            obj.locked+=contractService.web3.fromWei(sItem.Deposit,"ether")-0;
                        }else{
                            obj.invalidVote++;
                            obj.Released = contractService.web3.fromWei(sItem.Deposit,"ether")-0;
                        }
                        if(sItem.State==2){
                            this.calculatedIncome().then((i)=>{
                                obj.income = obj.income + (contractService.web3.fromWei(i,"ether")-0);
                            });
                        }
                        if(sItem.RBlockNumber){
                            contractService.web3.eth.getBlock(sItem.RBlockNumber,(err,blockData)=>{
                                if(err) return;
                                if(blockData){
                                    obj.expireTime = blockData.timestamp;
                                }
                            })
                        }
                    });
                    //同一次投票的票价、投票钱包、投票时所在块高 是一样的，所以取第一个元素的值即可
                    obj.ticketPrice = contractService.web3.fromWei(item[0].Deposit,"ether");
                    obj.voteWallet = item[0].Owner;
                    obj.voteWalletTxt = item[0].Owner.slice(0,10)+'****'+item[0].Owner.slice(item[0].Owner.length-8,item[0].Owner.length);
                    this.getOrdByAddress(obj.voteWallet).then((w)=>{
                        obj.voteWalletAccount = w?w.account:''
                    });
                    let blockNumber = item[0].BlockNumber;
                    contractService.web3.eth.getBlock(blockNumber,(err,blockData)=>{
                        console.log(err,blockData);
                        if(err) return;
                        if(blockData){
                            obj.createTime = blockData.timestamp;
                            obj.estimatedExpirTime = this.estimatedExpirTime(obj.createTime);
                        }
                        voteArr.push(obj);
                        this.voteRecord = voteArr;
                    })
                })
            },
            estimatedExpirTime(createtime){
                let expireTime = 17.78*24*60*60*1000;
                return createtime+expireTime;
            }
        },
        filters:{

        }
    }
</script>

<style lang="less" scoped>
    .vote-detail{
        padding:0 20px;
        text-align: left;
        background: #FFFFFF;
        box-shadow: 0 4px 6px 0 rgba(48,48,77,0.05), 0 2px 4px 0 rgba(148,148,197,0.05);
        border-radius: 4px;
        table{
            width:100%;
            font-size: 12px;
            color: #24272B;
        }
        thead{
            tr{
                height:37px;
                color: #525768;
                letter-spacing: 0.5px;
                th{
                    font-weight: normal;
                    border-bottom:solid 1px #D3D8E1;
                }
            }
        }
        tbody{
            tr{
                height:45.5px;
                color: #24272B;
                td{
                    border-bottom:solid 1px #ECEFF6;
                }
            }
            .time{
                padding-top:10px;
                display:block;
                font-size: 10px;
                height:45.5px;
            }
            .vote-wallet{
                display: inline-block;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
    }
</style>



