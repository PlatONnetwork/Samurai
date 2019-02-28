import contractService from '@/services/contract-servies';
import Settings from '@/services/setting';
import fsObj from '@/services/fs-service';
const fileName='voteList.json';
var jsSHA = require("jssha");
import mathService from '@/services/math';



import fs from 'fs';

export const voteAction = {
    //计算票ID
    buildTicketId({state,commit,rootState},txHash){
        return new Promise((resolve, reject)=>{
            console.log('buildTicketId----',txHash);
            contractService.web3.eth.getTransactionReceipt(txHash,(err,result)=>{
                console.log(err,result);
                if(err || !result) {
                    resolve(null);
                    return;
                }
                if (result.logs.length != 0) {
                    const MyContract = contractService.web3.eth.contract(contractService.getABI(3));
                    const myContractInstance = MyContract.at(contractService.voteContractAddress);
                    const decodeLog = myContractInstance.decodePlatONLog(result.logs[0]);
                    console.log('decodeLog----',decodeLog);
                    try{
                        let data = JSON.parse(decodeLog);
                        if(data.Data){
                            let num = data.Data-0,ids=[];
                            for(let i=0;i<num;i++){
                                let is = i+'',ticketIndex='';
                                for(let j=0;j<is.length;j++){
                                    ticketIndex+=is.charCodeAt(j).toString(16)
                                }
                                // let ticketIndex = (i+'').charCodeAt(0).toString(16)
                                let str = txHash.replace(/^0x/,'')+ticketIndex;
                                var shaObj = new jsSHA("SHA3-256", "HEX");
                                shaObj.update(str);
                                let id='0x'+shaObj.getHash("HEX");
                                console.log('id---->',id);
                                ids.push(id);
                            }
                            resolve(ids);
                        }else{
                            resolve(null);
                        }
                    }catch(e){
                        console.error(e);
                        resolve(null);
                    }
                }else{
                    resolve(null);
                }
            })
        })

    },
    //获取我的投票记录--票ID列表
    getMyVoteList({state,commit,rootState,dispatch}){
        return new Promise((resolve, reject)=>{
            let type = rootState.setting.network.type;
            fsObj.ReadFile(Settings.userDataPath,fileName,(err, data) => {
                if(err){
                    reject();
                }
                if(data){
                    let retData = JSON.parse(data.toString().replace(/\n\r/g,'')),walletCate=type;
                    if(type=='custom'){
                        walletCate = rootState.setting.chainName;
                    }
                    let voteList = retData[walletCate];
                    if(voteList && voteList.length>0){
                        let ticketIds = [],count=0;
                        voteList.forEach((vote)=>{
                            dispatch('buildTicketId',vote.txHash).then((ticketId)=>{
                                console.log('buildTicketId---,cb');
                                count++;
                                console.log('ticketId----',ticketId);
                                if(ticketId){
                                    ticketIds = ticketIds.concat(ticketId)
                                }
                                console.log(count,voteList);
                                if(count == voteList.length){
                                    resolve(ticketIds)
                                }
                            })
                        });
                    }else{
                        resolve([])
                    }
                }else{
                    resolve([])
                }
            })
        });
    },
    //根据票ID查询票详情
    getTicketDetail({state,commit,rootState},ticketId){
        return new Promise((resolve, reject)=>{
            contractService.platONCall(contractService.getABI(3),contractService.voteContractAddress,'GetTicketDetails',contractService.voteContractAddress,[ticketId]).then((ticketDetail)=>{
                resolve(ticketDetail);
            })
        });
    },
    //保存投票记录
    saveVoteRecord({state,commit,rootState},obj){
        return new Promise((resolve, reject)=>{
            fsObj.ReadFile(Settings.userDataPath,fileName,(err, data) => {
                if(err){
                    reject();
                }
                let result = {};
                let type = rootState.setting.network.type,
                    chainName = rootState.setting.chainName,
                    walletCate = type;
                if(type=='custom'){
                    walletCate = 'custom_'+chainName;
                }
                if(data){
                    let retData = JSON.parse(data.toString().replace(/\n\r/g,''));
                    if(!retData[walletCate]){
                        retData[walletCate]=[];
                    }
                    retData[walletCate].push(obj);
                    result = retData
                }else{
                    let arr = [];
                    arr.push(obj);
                    result[walletCate] = arr;
                }
                fsObj.WriteFile(fileName, JSON.stringify(result), (err1) => {
                    if(err1){
                        reject(1,err1);
                        throw err1;
                    }
                    resolve();
                })
            })
        });
    },
    //根据节点ID返回节点相关信息
    getNodeInfo({state,commit,rootState},nodeID){
        return new Promise((resolve, reject)=>{
            let type = rootState.setting.network.type,
                chainName = rootState.setting.chainName,
                walletCate = type;
            if(type=='custom'){
                walletCate = 'custom_'+chainName;
            }
            let data = fs.readFileSync(`${Settings.userDataPath}${fileName}`,'utf8');
            if(data){
                let retData = JSON.parse(data)[type] || [];
                console.log(retData);
                let node = retData.filter((item)=>{
                    return item.CandidateId.replace(/^0x/,'') == nodeID.replace(/^0x/,'');
                });
                if(node.length>0){
                    resolve(node[0]);
                }else{
                    resolve('');
                }
            }
        })
    },
    //批量获取指定候选人的选票Id的列表
    GetBatchCandidateTicketIds({state,commit,rootState,dispatch},ids){
        return new Promise((resolve, reject)=>{
            contractService.platONCall(contractService.getABI(3),contractService.voteContractAddress,'GetBatchCandidateTicketIds',contractService.voteContractAddress,[ids.join(':')]).then((ticketList)=>{
                if(ticketList){
                    try{
                        let list = JSON.parse(ticketList);
                        resolve(list);
                    }catch(e){
                        console.log('批量获取指定候选人的选票Id的列表失败---',e);
                        resolve(null)
                    }
                }
            })
        })
    },
    //计算选票收益
    calculatedIncome(){
        function getI(x,N,R){
            if(x==0){
                return mathService.mul(N,R)
            }else{
                return mathService.mul((getI(x-1,N,R)+N),R);
            }
        }
        return new Promise((resolve, reject)=>{
            contractService.web3.eth.getBlockNumber((err,blockNumber)=>{
                if(err || !blockNumber){
                    resolve(0);
                }
                let cycle = 24*3600*365;
                let x = parseInt(blockNumber/cycle); //增发周期序号
                let N = 100000000,R = 1.025,h = blockNumber,hy=h/cycle,i;
                console.log(getI(x,N,R));
                resolve(getI(x,N,R))
            })
        })
    },
    updateNodeName({state,commit,rootState,dispatch},nodeName){
        state.nodeName = nodeName;
    }
};
