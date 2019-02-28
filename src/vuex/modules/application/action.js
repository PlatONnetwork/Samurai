import contractService from '@/services/contract-servies';
import Settings from '@/services/setting';
import fsObj from '@/services/fs-service';
const fileName='nodeApplyList.json';
const fileNameQuit='nodeQuitList.json';
var Http = require('axios');
var APIConfig = require('@/config/API-config');
import fs from 'fs';

export const appAction = {
    getCityByIp({state,commit,rootState},ip){
        return new Promise((resolve, reject)=>{
            // Http.get(`http://api.map.baidu.com/location/ip?ip=${ip}&ak=jsSLtOlxlROBxMFjvcsOAAEGCUdmvgpL`).then((res)=>{
            Http.post('http://ip-api.com/batch/',[
                {"query": ip, "fields": "city,country,query", "lang": "en"}
            ]).then((res)=>{
                console.log('status-------',ip,res.status,res.data)
                if(res.status==200){
                    if(res.data && res.data.length>0){
                        resolve(res.data[0].country)
                    }else{
                        resolve(rootState.setting.lang=='en'?'Intranet IP':'内网IP')
                    }
                }else{
                    resolve(rootState.setting.lang=='en'?'Intranet IP':'内网IP')
                }
            })
        })
    },
    //获取节点竞选列表
    candidateList(){
        return new Promise((resolve, reject)=>{
            contractService.platONCall(contractService.getABI(2),contractService.appContractAddress,'CandidateList',contractService.appContractAddress,[]).then((data)=>{
                let arr=[];
                try{
                    arr = JSON.parse(data);
                    arr.sort(function(a,b){
                        if(a.Deposit==b.Deposit){
                            return a.blockNumber - b.blockNumber;
                        }else{
                            return b.Deposit - a.Deposit;
                        }
                    });
                    arr.forEach((item,index)=>{
                        item.Deposit = contractService.web3.fromWei(item.Deposit,"ether");
                        try{
                            item.Extra = JSON.parse(item.Extra);
                        }catch(e){
                            item.Extra = {};
                        }
                        if(item.Extra && item.Extra.nodePortrait){
                            if(isNaN(item.Extra.nodePortrait)){
                                let rdNumber = Math.floor(Math.random()*(42-1+1)+1);
                                item.Extra.nodePortrait = rdNumber<10?'0'+rdNumber:rdNumber;
                            }else{
                                item.Extra.nodePortrait = Number(item.Extra.nodePortrait)<10?'0'+Number(item.Extra.nodePortrait):Number(item.Extra.nodePortrait);
                            }
                        }else{
                            let rdNumber = Math.floor(Math.random()*(42-1+1)+1);
                            item.Extra.nodePortrait = rdNumber<10?'0'+rdNumber:rdNumber;
                        }
                        item.ranking = index+1;
                    });
                    resolve(arr);
                }catch(e){
                    console.log(e)
                    resolve([])
                }
            })
        });
    },
    //获取某一个候选节点的排序
    getRanking({state,commit,rootState,dispatch},nodeId){
        return new Promise((resolve, reject)=>{
            dispatch('candidateList').then((list)=>{
                if(list.length>0){
                    let CandidateIdArr = list.map((item)=>{
                        return item.CandidateId.replace(/^0x/,'');
                    });
                    if(CandidateIdArr.indexOf(nodeId.replace(/^0x/,''))==-1){
                        resolve(null);
                    }else{
                        resolve(CandidateIdArr.indexOf(nodeId.replace(/^0x/,''))+1);
                    }
                }else{
                    resolve(null);
                }
            })
        })
    },
    //判断节点地址、公钥的唯一性
    isExits({state,commit,rootState,dispatch},obj){
        return new Promise((resolve, reject)=>{
            dispatch('candidateList').then((list)=>{
                let exitArr = list.filter((item)=>{
                    let id1 = item.CandidateId.replace(/^0x/,'');
                    let id2 = obj.CandidateId.replace(/^0x/,'');
                    return id1==id2 || `${item.Host}:${item.Port}`==obj.host
                });
                resolve(exitArr.length>0)
            })
        });
    },
    //获取竞选金额列表
    getDepositList({state,commit,rootState,dispatch}){
        return new Promise((resolve, reject)=>{
            dispatch('candidateList').then((data)=>{
                let arr=[];
                if(data.length>0){
                    data.forEach((item)=>{
                        arr.push(item.Deposit)
                    });
                    arr.sort(function(a,b){
                        return b-a
                    });
                    resolve(arr);
                }else{
                    resolve([])
                }

                // resolve(arr);
            })
        });
    },
    //获取我的竞选节点
    getApplyNodeList({state,commit,rootState,dispatch}){
        return new Promise((resolve, reject)=>{
            let type = rootState.setting.network.type;
            fsObj.ReadFile(Settings.userDataPath,fileName,(err, data) => {
                if(err){
                    reject();
                }
                if(data){
                    let retData = JSON.parse(data.toString().replace(/\n\r/g,'')),walletCate=type;
                    if(type=='custom'){
                        walletCate = 'custom_'+rootState.setting.chainName;
                    }
                    if(retData[walletCate] && retData[walletCate].length>0){
                        let myNode = retData[walletCate][0];
                        console.log('myNode-----',myNode);
                        dispatch('getRanking',myNode.CandidateId).then((ranking)=>{
                            console.log('ranking----',ranking);
                            if(ranking){
                                myNode.ranking = ranking;
                                myNode.dieOut = false;
                                myNode.pending = false;
                                resolve(myNode);
                            }else{
                                //还未竞选成功 或者 已被淘汰不在列表中了
                                dispatch('getLastStake','createValidator').then((createValidator)=>{
                                    console.log('createValidator----',createValidator);
                                    if(!!createValidator){
                                        myNode.pending = true;
                                        myNode.dieOut = false;
                                        resolve(myNode)
                                    }else{
                                        myNode.pending = false;
                                        myNode.dieOut = true;
                                        resolve(myNode)
                                    }
                                });
                            }
                        });
                    }else{
                        resolve(null)
                    }
                }else{
                    resolve(null)
                }
            })
        });
    },
    //获取已退出的节点列表
    getQuitNodeList({state,commit,rootState}){
        return new Promise((resolve, reject)=>{
            let type = rootState.setting.network.type;
            fsObj.ReadFile(Settings.userDataPath,fileNameQuit,(err, data) => {
                if(err){
                    reject();
                }
                if(data){
                    let retData = JSON.parse(data.toString().replace(/\n\r/g,'')),walletCate=type;
                    if(type=='custom'){
                        walletCate = 'custom_'+rootState.setting.chainName;
                    }
                    resolve(retData[walletCate] || []);
                }else{
                    resolve([])
                }
            })
        });
    },
    getNodeDetail({state,commit,rootState},obj){
        return new Promise((resolve, reject)=>{
            contractService.platONCall(contractService.getABI(2),contractService.appContractAddress,'CandidateDetails',obj.Owner,[obj.nodeId]).then((data)=>{
                try{
                    let obj = JSON.parse(data);
                    try{
                        obj.Extra = obj.Extra?JSON.parse(obj.Extra):{};
                    }catch(e){
                        obj.Extra = {};
                    }
                    resolve(obj);
                }catch(e){
                    resolve(null)
                }
            })
        })
    },
    // 获取参与当前共识的验证人列表
    verifiersList(){
        return new Promise((resolve, reject)=>{
            contractService.platONCall(contractService.getABI(2),contractService.appContractAddress,'VerifiersList',contractService.appContractAddress,[]).then((data)=>{
                console.log('verifiersList--->',data);
                try{
                    let arr = JSON.parse(data);
                    if(arr.length==0){
                        resolve([])
                    }else{
                        const map1 = arr.map(x => x.CandidateId);
                        resolve(map1);
                    }
                }catch(e){
                    resolve([])
                }
            })
        });
    },
    //保存竞选申请记录
    saveApplyRecord({state,commit,rootState,dispatch},obj){
        console.log('saveApplyRecord---',obj);
        return new Promise((resolve, reject)=>{
            fsObj.ReadFile('',fileName, (err, data)=> {
                if(err){
                    reject(1,err);
                    throw err;
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
                    retData[walletCate]=[];
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
            });
        });
    },
    // 清空竞选申请记录
    clearApplyRecord({state,commit,rootState,dispatch}){
        return new Promise((resolve, reject)=>{
            fsObj.ReadFile('',fileName, (err, data)=> {
                if(err){
                    reject(1,err);
                    throw err;
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
                }else{
                    let arr = [];
                    result[walletCate] = arr;
                }
                fsObj.WriteFile(fileName, JSON.stringify(result), (err1) => {
                    if(err1){
                        reject(1,err1);
                        throw err1;
                    }
                    resolve();
                })
            });
        });
    },
    //保存竞选退出记录
    saveQuitRecord({state,commit,rootState,dispatch},obj){
        return new Promise((resolve, reject)=>{
            fsObj.ReadFile('',fileNameQuit, (err, data)=> {
                if(err){
                    reject(1,err);
                    throw err;
                }
                let result = {};
                if(!!obj){
                    let type = rootState.setting.network.type,
                        chainName = rootState.setting.chainName,
                        walletCate = type;
                    if(type=='custom'){
                        walletCate = 'custom_'+chainName;
                    }
                    if(data){
                        let retData = JSON.parse(data.toString().replace(/\n\r/g,''));
                        retData[walletCate]=[];
                        retData[walletCate].push(obj);
                        result = retData
                    }else{
                        let arr = [];
                        arr.push(obj);
                        result[walletCate] = arr;
                    }
                }
                fsObj.WriteFile(fileNameQuit, JSON.stringify(result), (err1) => {
                    if(err1){
                        reject(1,err1);
                        throw err1;
                    }
                    resolve();
                })
            });
        });
    },
    //判断某一条竞选是否是当前用户的竞选
    isMyNode({state,commit,rootState,dispatch},nodeId){
        return new Promise((resolve, reject)=>{
            let type = rootState.setting.network.type,arr=[];
            let nodeApplyList = fs.readFileSync(Settings.userDataPath+fileName,'utf8');
            let retData = JSON.parse(nodeApplyList.toString().replace(/\n\r/g,'')),walletCate=type;
            if(type=='custom'){
                walletCate = 'custom_'+rootState.setting.chainName;
            }
            arr = retData[walletCate];
            if(arr && arr.length>0){
                const nodeIds =  arr.map(x => x.CandidateId);
                resolve(nodeIds.indexOf(nodeId)!==-1 || nodeIds.indexOf('0x'+nodeId)!==-1);
            }else{
                resolve(false)
            }
        });
    },
    //判断我的竞选节点是否已被淘汰或已退出
    getNodeState({state,commit,rootState,dispatch},nodeId){
        return new Promise((resolve, reject)=>{
            let type = rootState.setting.network.type,
                quitArr=[],
                state;//0:正常,1:已退出,2:已淘汰
            let nodeQuitList = fs.readFileSync(Settings.userDataPath+fileNameQuit,'utf8');
            let retData = JSON.parse(nodeQuitList.toString().replace(/\n\r/g,'')),walletCate=type;
            if(type=='custom'){
                walletCate = 'custom_'+rootState.setting.chainName;
            }
            quitArr = retData[walletCate] || [];
            console.log('quitArr-----',quitArr);
            dispatch('candidateList').then((candidateList)=>{
                console.log('candidateList---',candidateList)
                let curNodeArr = candidateList.filter((item)=>{
                    return item.CandidateId==nodeId
                });
                if(curNodeArr.length>0){
                    resolve(0)
                }else{
                    let curQuitNodeArr = quitArr.filter((item)=>{
                        return item.CandidateId==nodeId
                    });
                    console.log('curQuitNodeArr----',curQuitNodeArr,nodeId);
                    if(curQuitNodeArr.length>0){
                        resolve(1)
                    }else{
                        resolve(2)
                    }
                }
            });
        });
    },
    //更新已退出并申请重新加入的节点信息
    updateJoinNode({state,commit},node){
        state.joinNode = node;
    },
    getLastStake({state,commit,dispatch,rootState},type){
        return new Promise((resolve, reject)=>{
            dispatch('getOrdTradeList').then((tradeList)=>{
                let arr = tradeList.filter((item)=>{
                    return item.type==type
                });
                if(arr && arr.length>0){
                    arr.sort((a,b)=>{
                        return b.tradeTime - a.tradeTime;
                    });
                    let lastObj = arr[0];
                    contractService.web3.eth.getTransactionReceipt(lastObj.hash,(err,data)=>{
                        if(err){
                            resolve(null)
                        }
                        if(!data){
                            resolve(lastObj)
                        }else{
                            resolve(null)
                        }
                    })
                }else{
                    resolve(null)
                }
            })
        })
    },
    //获取最新一条增持、减持质押、退出竞选的交易
    getLastDeposit({state,commit,dispatch,rootState}){
        return new Promise((resolve, reject)=>{
            let pendingStake = {};
            dispatch('getLastStake','increaseStake').then((increaseStake)=>{
                console.log('increaseStake---cb---',increaseStake);
                pendingStake.increaseStake = increaseStake;
                dispatch('getLastStake','reduceStake').then((reduceStake)=>{
                    console.log('reduceStake---cb---',reduceStake);
                    pendingStake.reduceStake = reduceStake;
                    dispatch('getLastStake','quitStake').then((quitStake)=>{
                        pendingStake.quitStake = quitStake;
                        dispatch('getLastStake','redeemStake').then((redeemStake)=> {
                            pendingStake.redeemStake = redeemStake;
                            resolve(pendingStake);
                        })
                    })
                })
            })
        })
    }
};
