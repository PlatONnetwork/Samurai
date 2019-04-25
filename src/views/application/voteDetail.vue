<template>
    <div class="vote-detail format-style">
        <table cellspacing="0">
            <thead>
                <tr :style="{lineHeight:lang=='en'?'15px':'20px'}">
                    <th width="12%">{{$t('vote.votingTime')}}</th>
                    <th width="15%">
                        {{$t('vote.validT')}}<br v-if="lang=='en'&&isMaximized">{{$t('vote.inValid')}}
                    </th>
                    <th width="9%">
                        {{$t('vote.tp1')}}<br v-if="lang=='en'&&isMaximized">{{$t('vote.tp2')}}
                    </th>
                    <th width="10%">
                        {{$t('vote.vs1')}}<br v-if="lang=='en'&&isMaximized">{{$t('vote.vs2')}}
                    </th>
                    <th width="10%">{{$t('vote.Profit')}}</th>
                    <th width="12%">{{$t('vote.votingWallet')}}</th>
                    <th width="16%">
                        {{$t('vote.exT1')}}</th>
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
                        <span v-if="vote.voteWalletAccount" class="vote-wallet" :style="{width:isMaximized?'100px':'383px'}" style="padding-top:4px;">{{vote.voteWalletAccount}}</span>
                        <span v-else class="vote-wallet" :style="{width:isMaximized?'150px':'383px'}" style="padding-top:4px;">{{isMaximized?vote.voteWalletTxt:vote.voteWallet}}</span>
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
    import mathService from '@/services/math';
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
                    return [item.hash];
                });
                console.log('voteRecord----',voteRecord);
                // console.log('aaaaa----',this.node.ticketList);
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
                    console.log('item---->',item);
                    let obj = {
                        validVote:0,
                        invalidVote:0,
                        locked:0,
                        Released:0,
                        income:0
                    };
                    item.forEach((sItem)=>{
                        obj.validVote +=sItem.vailVoteCount;
                        obj.invalidVote +=(sItem.voteSum-sItem.vailVoteCount);
                        obj.locked += mathService.mul(contractService.web3.fromWei(sItem.price,"ether"),sItem.vailVoteCount)-0;
                        obj.Released += mathService.mul(contractService.web3.fromWei(sItem.price,"ether"),(sItem.voteSum-sItem.vailVoteCount))-0;
                        obj.income = mathService.add(obj.income,contractService.web3.fromWei(sItem.income,"ether"))-0;
                    });
                    //同一次投票的票价、投票钱包、投票时所在块高 是一样的，所以取第一个元素的值即可
                    obj.ticketPrice = contractService.web3.fromWei(item[0].price,"ether");
                    obj.voteWallet = item[0].walletAddress;
                    obj.voteWalletTxt = item[0].walletAddress.slice(0,10)+'****'+item[0].walletAddress.slice(item[0].walletAddress.length-8,item[0].walletAddress.length);
                    this.getOrdByAddress(obj.voteWallet).then((w)=>{
                        obj.voteWalletAccount = w?w.account:'';
                        if(item[0].deadLine){
                            obj.expireTime = item[0].deadLine;
                        }else{
                            contractService.web3.eth.getTransactionReceipt(item[0].hash,(error,txData)=>{
                                // 获取交易所在的区块
                                let blockNumber = txData.blockNumber;
                                contractService.web3.eth.getBlock(blockNumber,(err,blockData)=>{
                                    console.log(err,blockData);
                                    if(err) return;
                                    if(blockData){
                                        obj.createTime = blockData.timestamp;
                                        obj.estimatedExpirTime = this.estimatedExpirTime(obj.createTime);
                                    }
                                    voteArr.push(obj);
                                    // console.log(voteArr);
                                    this.voteRecord = voteArr.sort((a,b)=> {
                                        return b.createTime - a.createTime;
                                    });
                                })
                            })
                        }
                    });
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
        padding:14px;
        text-align: left;
        background: #FFFFFF;
        box-shadow: 0 4px 6px 0 rgba(48,48,77,0.05), 0 2px 4px 0 rgba(148,148,197,0.05);
        border-radius: 4px;
        height: auto;
        min-height:calc(~"100% - 70px");
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
                    padding-right: 28px;
                    padding-bottom: 12px;
                    border-bottom:solid 1px #D3D8E1;
                    white-space: nowrap;
                    font-weight:600;
                }
            }
        }
        tbody{
            tr{
                height:45.5px;
                color: #24272B;
                td{
                    border-bottom:solid 1px #ECEFF6;
                    margin-right: 16px;
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



