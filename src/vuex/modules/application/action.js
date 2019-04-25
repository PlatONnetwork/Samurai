import contractService from '@/services/contract-servies';
import Settings from '@/services/setting';
import fsObj from '@/services/fs-service';
const fileName='nodeApplyList.json';
const fileNameQuit='nodeQuitList.json';
var Http = require('axios');
var APIConfig = require('@/config/API-config');
import fs from 'fs';
import MathService from '@/services/math';
import Vue from 'vue';
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
            contractService.platONCall(contractService.getABI(2),contractService.appContractAddress,'GetCandidateList',contractService.appContractAddress,[]).then((data)=>{
                let arr=[],concatArr=[];
                try{
                    concatArr = JSON.parse(data);
                    let v = JSON.parse(JSON.stringify(data))
                    console.log('concatArr---',JSON.stringify(v));
                    let a = concatArr[0]?concatArr[0]:[];
                    let b = concatArr[1]?concatArr[1]:[];
                    arr = a.concat(b);
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
                    console.log(e);
                    resolve([])
                }
            })
        });
    },
    //获取节点竞选列表--排序
    getCandidateListByGroup({state,commit,dispatch}){
        return new Promise((resolve, reject)=>{
            contractService.platONCall(contractService.getABI(2),contractService.appContractAddress,'GetCandidateList',contractService.appContractAddress,[]).then((data)=>{
                console.warn('定位1',data)
                let arr = JSON.parse(data),count=0;
                // console.log(arr);
                arr.forEach((item,index)=>{
                    count++;
                    dispatch('getTPrice',{list:item,idx:index}).then((tItem)=>{
                        console.warn('定位2',count,arr.length)
                        Vue.set(arr,index,tItem);
                        if(count==arr.length){
                            dispatch('getOutNodes').then((outNodes)=>{
                                console.warn('定位3',outNodes)
                                let concatData = arr[0].concat(outNodes).concat(arr[1]),count2=0;
                                if(concatData.length>0){
                                    concatData.forEach((item,index)=>{
                                        count2++;
                                        let Extra;
                                        try {
                                            Extra = JSON.parse(item.Extra);
                                            if(Extra && Extra.nodePortrait){
                                                if(isNaN(Extra.nodePortrait)){
                                                    let rdNumber = Math.floor(Math.random()*(42-1+1)+1);
                                                    Extra.nodePortrait = rdNumber<10?'0'+rdNumber:rdNumber;
                                                }else{
                                                    Extra.nodePortrait = Number(Extra.nodePortrait)<10?'0'+Number(Extra.nodePortrait):Number(Extra.nodePortrait);
                                                }
                                            }else{
                                                let rdNumber = Math.floor(Math.random()*(42-1+1)+1);
                                                Extra.nodePortrait = rdNumber<10?'0'+rdNumber:rdNumber;
                                            }
                                            item.Extra = JSON.parse(JSON.stringify(Extra));
                                        }
                                        catch(err) {
                                            console.log('catch extra----',err);
                                        }
                                        finally {
                                            console.log('count----',count2,concatData.length);
                                            console.log('concatData-----',concatData);
                                            if(count2==concatData.length){
                                                resolve(concatData);
                                            }
                                        }
                                    });
                                }else{
                                    resolve([])
                                }
                            });
                        }
                    })
                });
            })
        })
    },
    //获取不在候选池的验证节点
    getOutNodes({state,commit,dispatch}){
        return new Promise((resolve, reject)=>{
            dispatch('verifiersNodeList').then((verList)=>{
                console.log('verList----',verList);
                if(verList.length==0){
                    resolve([])
                }else{
                    dispatch('candidateList').then((nodeList)=>{
                        console.log('nodeList----',nodeList);
                        if(nodeList.length==0){
                            resolve(verList)
                        }else{
                            let cidList = nodeList.map((item)=>{
                                    return item.CandidateId
                                }),outList;
                            outList = verList.filter((a)=>{
                                return cidList.indexOf(a.CandidateId)==-1
                            });
                            outList.forEach((o)=>{
                                o.outSideNode = true;  //外部节点标识
                                o.ticketsCount = 0;   //掉榜的节点有效票数为0
                                o.verNode = true;
                            });
                            resolve(outList);
                        }
                    })
                }
            })
        })
    },
    //获取得票总价
    getTPrice({state,commit,dispatch},obj){
        return new Promise((resolve, reject)=>{
            let arr = obj.list;
            if(arr.length==0){
                resolve([]);
            }
            let idArr = arr.map((item)=>{
                return item.CandidateId
            });
            contractService.platONCall(contractService.getABI(3),contractService.voteContractAddress,'GetTicketPrice',contractService.voteContractAddress).then((ticketPrice)=>{
               let tPrice = contractService.web3.fromWei(ticketPrice,"ether");
                dispatch('GetBatchCandidateTicketIds',idArr).then((tCountList)=>{
                    // console.log('tCountList-------',tCountList);
                    let count=0;
                    arr.forEach((a)=>{
                        count++;
                        if(obj.idx==0){
                            // 判断节点是否是提名节点 true是提名节点
                            a.allowed = true;
                        }else if(obj.idx==1){
                            a.allowed = false;
                        }
                        if(tCountList && tCountList[a.CandidateId]){
                            a.ticketsCount = tCountList[a.CandidateId];
                            // 投票的钱
                            a.voteDep = MathService.mul(tPrice,a.ticketsCount)-0;
                            // 质押金+投票的钱
                            a.totalDep = MathService.add(contractService.web3.fromWei(a.Deposit,"ether")-0,a.voteDep)-0;
                        }else{
                            a.ticketsCount = 0;
                            a.voteDep = 0;
                            a.totalDep = contractService.web3.fromWei(a.Deposit,"ether")-0
                        }
                        if(count==arr.length){
                            arr.sort(function(a,b){
                                return (b.totalDep-a.totalDep) || (a.BlockNumber-b.BlockNumber);
                            });
                            resolve(arr);
                        }
                    })
                })
            })
        })
    },

    //获取候选节点ID列表
    getCandidateList({state,commit,dispatch}){
        return new Promise((resolve, reject)=>{
            contractService.platONCall(contractService.getABI(2),contractService.appContractAddress,'GetCandidateList',contractService.appContractAddress,[]).then((data)=>{
                let arr = JSON.parse(data)[0];
                if(arr.length>0){
                    let arrIds = arr.map((item)=>{
                        return item.CandidateId
                    });
                    resolve(arrIds);
                }else{
                    resolve([])
                }
            })
        })
    },
    //获取某一个候选节点的排序
    getRanking({state,commit,rootState,dispatch},nodeId){
        return new Promise((resolve, reject)=>{
            dispatch('candidateList').then((list)=>{
                if(list.length>0){
                    let CandidateIdArr = list.map((item)=>{
                        return item.CandidateId&&item.CandidateId.replace(/^0x/,'');
                    });
                    console.log('CandidateIdArr---',CandidateIdArr);
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
                let exitUrlArr = list.filter((item)=>{
                    return `${item.Host}:${item.Port}`==obj.host
                });
                let exitIDArr = list.filter((item)=>{
                    let id1 = item.CandidateId?item.CandidateId.replace(/^0x/,''):'';
                    let id2 = obj.CandidateId.replace(/^0x/,'');
                    return id1==id2;
                });
                if(exitUrlArr.length>0){
                    resolve(1)
                }else if(exitIDArr.length>0){
                    resolve(2)
                }else{
                    resolve(0)
                }
            })
        });
    },
    //获取竞选金额列表
    getDepositList({state,commit,rootState,dispatch}){
        return new Promise((resolve, reject)=>{
            dispatch('candidateList').then((data)=>{
                console.log('candidateList--',data);
                if(data.length>0){
                    data.map((item)=>{
                        item.Deposit = contractService.web3.toWei(item.Deposit,"ether");
                    });
                    dispatch('getTPrice',{list:data,idx:0}).then((vList)=>{
                        // 返回包含竞选金额的节点列表
                        resolve(vList);
                        // let arr = vList.map((a)=>{
                        //     return a.totalDep
                        // });
                        // arr.sort(function(a,b){
                        //     return b-a
                        // });
                        // resolve(arr);
                    });
                }else{
                    resolve([])
                }
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
            contractService.platONCall(contractService.getABI(2),contractService.appContractAddress,'GetCandidateDetails',obj.Owner,[obj.nodeId]).then((data)=>{
                try{
                    let res = JSON.parse(data),obj;
                    if(res && res.length>0){
                        obj = res[0]
                    }
                    console.log('obj----->',obj);
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
    // 获取参与当前共识的验证人的节点ID列表
    verifiersList(){
        return new Promise((resolve, reject)=>{
            contractService.platONCall(contractService.getABI(2),contractService.appContractAddress,'GetVerifiersList',contractService.appContractAddress,[]).then((data)=>{
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
    // 获取参与当前共识的验证人列表
    verifiersNodeList(){
        return new Promise((resolve, reject)=>{
            console.log('platon call-----','verifiersNodeList');
            contractService.platONCall(contractService.getABI(2),contractService.appContractAddress,'GetVerifiersList',contractService.appContractAddress,[]).then((data)=>{
                console.log('verifiersList--->',data);
                try{
                    let arr = JSON.parse(data);
                    if(arr.length==0){
                        resolve([])
                    }else{
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
                        });
                        resolve(arr);
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
            dispatch('candidateList').then((candidateList)=>{
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
    //获取最新一条增持、减持质押、退出竞选的交易
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
