import Setting from '@/services/setting'
import contractService from '@/services/contract-servies'
import Settings from '@/services/setting'
var fs = require("fs");
export const tradeAction = {
    //获取所有普通钱包交易
    getOrdTradeList({state,commit,rootState}){
        return new Promise((resolve, reject)=>{
            try{
                let cate=null,filePath;
                if(rootState.setting.network.type=='custom'){
                    cate = rootState.setting.chainName;
                }
                if(cate){
                    filePath = Setting.userDataPath+'net_'+rootState.setting.network.type+'/'+cate+'_txn.json';
                }else{
                    filePath = Setting.userDataPath+'net_'+rootState.setting.network.type+'/txn.json';
                }
                fs.exists(filePath,(exists)=> {
                    if(exists){
                        let data = fs.readFileSync(filePath, { encoding: 'utf8' });
                        try{
                            data = JSON.parse(data);
                            resolve(data?JSON.parse(data):[])
                        }catch(e){
                            resolve(data?data:[])
                        }
                    }else{
                        resolve([])
                    }
                });
            }catch(err){
                console.error(err)
            }
        })
    },
    //获取所有共享钱包交易
    getShareTradeList({state,commit,rootState,dispatch},num){
        return new Promise((resolve, reject)=>{
            let shareTradeList=[],count=0;
            dispatch('getShare').then((shares)=>{
                if(!shares || shares.length==0){
                    resolve([])
                }else{
                    let tradeCount = 0;
                    shares.forEach((share)=>{
                        contractService.platONCall(contractService.getABI(1),share.address,'getTransactionList',share.admin.address,[0,num]).then((result)=>{
                            if(result=='0x' || result=='') {
                                count++;
                                tradeCount++;
                            }else{
                                let arr = result.replace(/\:$/g,'').split(":");
                                tradeCount += arr.length;
                                if(!/^\s*$/g.test(result)){
                                    arr.forEach((item)=>{
                                        let _arr=item.split("|"),decodeInput;
                                        try{
                                            decodeInput = contractService.web3.toUtf8(_arr[4])
                                        }catch(e){
                                            decodeInput = _arr[4]?_arr[4]:'';
                                        }
                                        let obj = {
                                            id:_arr[8],
                                            from:'0x'+_arr[0],
                                            to:'0x'+_arr[1],
                                            value:_arr[2],
                                            tradeTime:_arr[3]-0,
                                            input:decodeInput,
                                            fee:_arr[5],
                                            pending:_arr[6],
                                            executed:_arr[7],
                                            required:share.required,
                                            type:'transfer'
                                        };
                                        //判断交易状态，如果已签名数+剩余未签名数<签名数，该笔交易置为交易失败
                                        contractService.platONCall(contractService.getABI(1),share.address,'getOwners',share.admin.address,[]).then((owners)=>{
                                            contractService.platONCall(contractService.getABI(1),share.address,'getRequired',share.admin.address).then((required)=>{
                                                contractService.platONCall(contractService.getABI(1),share.address,'getMultiSigList',share.admin.address,[_arr[8]]).then((multiSigList)=>{
                                                    let ownersList = owners.split(":");
                                                    let arr = multiSigList.replace(/^\:|\:$/g,'').split(":");
                                                    let confirmList = arr[1].replace(/^\,|\,$/g,'').split(",");
                                                    let rejectList = arr[2]?arr[2].replace(/^\,|\,$/g,'').split(","):[];
                                                    obj.required = required;
                                                    if(ownersList.length - rejectList.length < required){
                                                        obj.pending = 0;
                                                        obj.executed = 0;
                                                    }
                                                    count++;
                                                    shareTradeList.push(obj);
                                                });
                                            })
                                        });
                                    });
                                }
                            }
                        })
                    });
                    let timer = setInterval(()=>{
                        if(count==tradeCount){
                            shareTradeList.sort(function(a,b){
                                let value1 = a['tradeTime'];
                                let value2 = b['tradeTime'];
                                return value2 - value1;
                            });
                            clearInterval(timer);
                            resolve(shareTradeList)
                        }
                    },1000)
                };

            }).catch((e)=>{
                throw e;
            })
        });
    },
    //获取所有交易
    getTradeList({state,commit,rootState,dispatch}, num){
        return new Promise((resolve, reject)=>{
            let tradeList=[];
            dispatch('getOrdTradeList').then((ordTradeList)=>{
                dispatch('getShareTradeList',num).then((shareTradeList)=>{
                    tradeList = ordTradeList.concat(shareTradeList);
                    tradeList.sort(function(a,b){
                        let value1 = a['tradeTime'];
                        let value2 = b['tradeTime'];
                        return value2 - value1;
                    });
                    resolve(tradeList);
                })
            });
        });
    },
    // 获取当前共享钱包的总交易数
    getTransactionCount({state,commit,rootState,dispatch}){
        return new Promise((resolve, reject)=>{
            let curWallet = rootState.wallet.curWallet;
            if(!curWallet) resolve(0);
            dispatch('getWalletByAddress',curWallet).then((wallet)=>{
                if(!wallet) return;
                contractService.platONCall(contractService.getABI(1),wallet.address,'getListSize',wallet.admin.address,[]).then((count)=>{
                    resolve(count)
                })
            });

       })
    },
    //获取当前共享钱包的交易列表
    getCurShareTradeList({state,commit,rootState,dispatch},num){
        return new Promise((resolve, reject)=>{
            let curWallet = rootState.wallet.curWallet;
            dispatch('getWalletByAddress',curWallet).then((curObj)=>{
                if(!curObj) resolve([]);
                let shareTradeList=[],count=0;
                contractService.platONCall(contractService.getABI(1),curObj.address,'getTransactionList',curObj.admin.address,[0,num]).then((result)=>{
                    if(result=='0x') return;
                    let arr = result.replace(/\:$/g,'').split(":");
                    if(!/^\s*$/g.test(result)){
                        arr.forEach((item)=>{
                            let _arr=item.split("|"),decodeInput;
                            try{
                                decodeInput = contractService.web3.toUtf8(_arr[4])
                            }catch(e){
                                decodeInput = _arr[4]?_arr[4]:'';
                            }
                            let obj = {
                                id:_arr[8],
                                from:'0x'+_arr[0],
                                to:'0x'+_arr[1],
                                value:_arr[2],
                                tradeTime:_arr[3]-0,
                                input:decodeInput,
                                fee:_arr[5],
                                pending:_arr[6],
                                executed:_arr[7],
                                required:curObj.required,
                                type:'transfer'
                            };
                            //判断交易状态，如果已签名数+剩余未签名数<签名数，该笔交易置为交易失败
                            contractService.platONCall(contractService.getABI(1),curObj.address,'getOwners',curObj.admin.address,[]).then((owners)=>{
                                contractService.platONCall(contractService.getABI(1),curObj.address,'getRequired',curObj.admin.address).then((required)=>{
                                    contractService.platONCall(contractService.getABI(1),curObj.address,'getMultiSigList',curObj.admin.address,[_arr[8]]).then((multiSigList)=>{
                                        let ownersList = owners.split(":");
                                        let arr = multiSigList.replace(/^\:|\:$/g,'').split(":");
                                        let confirmList = arr[1].replace(/^\,|\,$/g,'').split(",");
                                        let rejectList = arr[2]?arr[2].replace(/^\,|\,$/g,'').split(","):[];
                                        obj.required = required;
                                        if(ownersList.length - rejectList.length < required){
                                            obj.pending = 0;
                                            obj.executed = 0;
                                        }
                                        count++;
                                        shareTradeList.push(obj);
                                    });
                                })
                            });
                        });
                        let timer = setInterval(()=>{
                            if(count==arr.length){
                                shareTradeList.sort(function(a,b){
                                    let value1 = a['tradeTime'];
                                    let value2 = b['tradeTime'];
                                    return value2 - value1;
                                });
                                clearInterval(timer);
                                resolve(shareTradeList)
                            }
                        },1000)
                    }
                })
            });
        });
    },
    //获取当前钱包的交易列表
    getCurTradeList({state,commit,rootState,dispatch},param){
        return new Promise((resolve, reject)=>{
            if(window.vueVm.$route.path== "/o-wallet-share-detail"){
                //共享钱包详情页，size比较特殊，要保证首屏待确认的全部加载，已完成的加载20条
                let pendings=[],compoletes=[];
                dispatch('getTransactionCount').then((count)=>{
                    if(count<1){
                        resolve({
                            total:0,
                            list:[],
                            pendings:[]
                        });
                    }else{
                        dispatch('getCurShareTradeList',count).then((shareTradeList)=>{
                            pendings = shareTradeList.filter((item)=>{
                                return item.pending==1;
                            });
                            compoletes = shareTradeList.filter((item)=>{
                                return item.pending==0;
                            });
                            resolve({
                                total:compoletes.length,
                                list:compoletes.slice(0,param.size),
                                pendings:pendings
                            });
                        })
                    }
                })
            }else{
                let walletType = rootState.wallet.walletType,
                    curWallet = rootState.wallet.curWallet,
                    actionName = walletType==1?'getOrdTradeList':'getShareTradeList';
                if(curWallet && !/^\s*$/g.test(curWallet)){
                    dispatch(actionName,param.size).then((list)=>{
                        let arr = list.filter((item)=>{
                            return item.from==curWallet || '0x'+item.from==curWallet
                        });
                        let filterArr=[];
                        if(param.type){
                            filterArr = arr.filter((item)=>{
                                return item.type==param.type;
                            })
                        }else{
                            filterArr = arr;
                        }
                        filterArr.sort(function(a,b){
                            let value1 = a['tradeTime'];
                            let value2 = b['tradeTime'];
                            return value2 - value1;
                        });
                        resolve({
                            total:filterArr.length,
                            list:filterArr.slice(0,param.size)
                        });
                    })
                }else{
                    dispatch('getTradeList',param.size).then((data)=>{
                        let filterArr=[];
                        if(param.type){
                            filterArr = data.filter((item)=>{
                                return item.type==param.type;
                            })
                        }else{
                            filterArr = data;
                        }
                        resolve({
                            total:filterArr.length,
                            list:filterArr.slice(0,param.size)
                        });
                    });
                }
            }
        })
    },
   //保存交易记录
    saveTractRecord({state,commit,rootState,dispatch},tradeObj){
        return new Promise((resolve, reject)=>{
            let cate=null,path,type=rootState.setting.network.type;
            if(type=='custom'){
                cate = rootState.setting.chainName;
            }
            if(cate){
                path = Settings.userDataPath+'net_'+type+'/'+cate+'_txn.json';
            }else{
                path = Settings.userDataPath+'net_'+type+'/txn.json';
            }
            fs.exists(path,(exists)=> {
                if(exists){
                    let data = fs.readFileSync(path, { encoding: 'utf8' }),dataArr=[];
                    dataArr = data?JSON.parse(data):[];
                    dataArr.push(tradeObj);
                    fs.writeFile(path, JSON.stringify(dataArr), function (err) {
                        if (err) {
                            reject();
                            throw err;
                        }else{
                            resolve();
                        }
                    });
                }else{
                    let arr = [];
                    arr.push(tradeObj);
                    fs.writeFile(path, JSON.stringify(arr), (err) => {
                        if (err) {
                            reject();
                            throw err;
                        }else{
                            resolve();
                        }
                    });
                }
            });
        });
    },
    updateTradeType({state,commit},type){
        state.tradeType = type;
    }
}
