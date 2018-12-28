import fsObj from '@/services/fs-service'
const fileName = 'walletInfo.json';
const fileNameS = 'sharedWalletInfo.json';
import Settings from '@/services/setting';
import contractService from '@/services/contract-servies';
import MathService from '@/services/math';
import fs from 'fs';
import Options from '../../../../static/json/config'
export const WalletAction = {
    getWallets({state,commit,rootState},walletType){
        return new Promise((resolve, reject)=>{
            let type = rootState.setting.network.type,
                fileName_s = walletType==1?fileName:fileNameS;
            fsObj.ReadFile(Settings.userDataPath,fileName_s,(err, data) => {
                if(data){
                    let retData = JSON.parse(data.toString().replace(/\n\r/g,'')),walletCate=type;
                    if(type=='custom'){
                        walletCate = 'custom_'+rootState.setting.chainName;
                    }
                    resolve(retData[walletCate] || []);
                }else{
                    reject([]);
                }
            })
        })
    },
    //获取普通钱包列表
    getOrd({state,commit,rootState,dispatch}){
        return new Promise((resolve, reject)=>{
            dispatch('getWallets',1).then((data)=>{
                data.sort(function(a,b){
                    let value1 = a['createTime'];
                    let value2 = b['createTime'];
                    return value1 - value2;
                });
                resolve(data);
            }).catch((e)=>{
                reject();
            });
        })
    },
    //获取余额不为0的普通钱包列表
    getBalOrd({state,commit,rootState,dispatch}){
        return new Promise((resolve, reject)=>{
            dispatch('getOrd').then((data)=>{
                let arr=[],count=0;
                data.forEach((item)=>{
                    contractService.web3.eth.getBalance(item.address,(err,data)=>{
                        count++;
                        let balance=contractService.web3.fromWei(data.toString(10), 'ether');
                        if(balance!=0){
                            item.balance = (Math.floor(Number(balance) * 100) / 100).toFixed(2);
                            arr.push(item)
                        }
                    });
                });
                let timer = setInterval(()=>{
                    if(count==data.length){
                        clearInterval(timer);
                        arr.sort(function(a,b){
                            let value1 = a['createTime'];
                            let value2 = b['createTime'];
                            return value1 - value2;
                        });
                        resolve(arr)
                    }
                },1000)
            })
        })
    },
    //获取共享钱包列表
    getShare({state,commit,rootState,dispatch}){
        return new Promise((resolve, reject)=>{
            dispatch('getWallets',2).then((data)=>{
                resolve(data);
            }).catch((e)=>{
                reject();
            });
        })
    },
    //获取当前情景下钱包列表
    WalletListAction({state,commit,rootState,dispatch}){
        return new Promise((resolve, reject)=>{
            dispatch('getWallets',state.walletType).then((data)=>{
                commit('UPDATE_WALLET_LIST',data);
                resolve(data);
            }).catch((e)=>{
                reject();
            });
        })
    },
    //获取所有钱包列表
    getAllWallets({state,commit,rootState,dispatch}){
        return new Promise((resolve, reject)=>{
            let arr=[];
            dispatch('getWallets',1).then((ords)=>{
                ords.sort(function(a,b){
                    let value1 = a['createTime'];
                    let value2 = b['createTime'];
                    return value1 - value2;
                });
                dispatch('getWallets',2).then((shares)=>{
                    shares.sort(function(a,b){
                        let value1 = a['createTime'];
                        let value2 = b['createTime'];
                        return value1 - value2;
                    });
                    arr = ords.concat(shares);
                    resolve(arr);
                })
            })
        })

    },
    //根据钱包地址返回该钱包是否在当前客户端
    isAtLocal({state,commit,dispatch,rootState},address){
        return new Promise((resolve, reject)=>{
            dispatch('getOrd').then((data)=>{
                let arr = data.filter((item)=>{
                    return item.address==address;
                });
                if(arr.length>0){
                    resolve(true)
                }else{
                    resolve(false)
                }
            })
        })
    },
    //根据钱包地址返回该钱包是否是一个共享钱包
    async isSharedWallet({state,commit,dispatch,rootState},address){
        return new Promise((resolve, reject)=>{
            const MyContract = contractService.web3.eth.contract(contractService.getABI(1));
            contractService.web3.eth.getCode(address,(err,data)=>{
                if(err){
                    resolve(false)
                }
                if(data==MyContract.new.getPlatONData(contractService.getBIN(1))){
                    resolve(true)
                }else{
                    resolve(false)
                }
            })
        })
    },
    //根据钱包地址返回普通钱包
    getOrdByAddress({state,commit,dispatch,rootState},address){
        return new Promise((resolve, reject)=>{
            dispatch('getOrd').then((data)=>{
                let arr = data.filter((item)=>{
                    return item.address==address;
                });
                if(arr.length>0){
                    resolve(arr[0]);
                }else{
                    resolve(null)
                }
            });
        })
    },
    //根据钱包地址返回共享钱包
    getShareByAddress({state,commit,dispatch,rootState},address){
        return new Promise((resolve, reject)=>{
            dispatch('getShare').then((data)=>{
                let arr = data.filter((item)=>{
                    return item.address==address;
                });
                if(arr.length>0){
                    resolve(arr[0]);
                }else{
                    resolve(null)
                }
            });
        })
    },
    //根据钱包地址返回钱包
    getWalletByAddress({state,commit,dispatch,rootState},address){
        return new Promise((resolve, reject)=>{
            dispatch('getAllWallets').then((data)=>{
                let arr = data.filter((item)=>{
                    return item.address==address;
                });
                if(arr.length>0){
                    resolve(arr[0]);
                }else{
                    resolve(null)
                }
            })
        })
    },
    //根据共享钱包地址返回其所有者列表
    getOwnerAccountByAddress({state,commit,dispatch,rootState},param){
        return new Promise((resolve, reject)=>{
            dispatch('getWalletByAddress',param.wallet).then((data)=>{
                if(data.ownersArr){
                    let arr = data.ownersArr.filter((item)=>{
                        return item.address==param.address;
                    });
                    if(arr.length>0){
                        resolve(arr[0].account)
                    }else{
                        resolve(null);
                    }
                }else{
                    dispatch('getOrdByAddress',param.address).then((data)=>{
                        if(data){
                            resolve(data.account)
                        }else{
                            resolve(null)
                        }
                    });
                }
            })
        });
    },
    //获取所有钱包的总余额
    getTotalBalance({state,commit,dispatch}){
        let total=0,count=0;
        dispatch('getOrd').then((ords)=>{
            ords.forEach((ord)=>{
                contractService.web3.eth.getBalance(ord.address,(err,data)=>{
                    if(err) return null;
                    total+=(contractService.web3.fromWei(data,"ether").toString(10)-0);
                    count++;
                });
            });
            dispatch('getShare').then((shares)=>{
                shares.forEach((share)=>{
                    contractService.web3.eth.getBalance(share.address,(err,data1)=>{
                        if(err) return null;
                        total+=(contractService.web3.fromWei(data1,"ether").toString(10)-0);
                        count++;
                    });
                });
                let timer = setInterval(()=>{
                    if(count==ords.length+shares.length){
                        total = (Math.floor(Number(total) * 100) / 100).toFixed(2);
                        state.totalBalance = total;
                        clearInterval(timer);
                    }
                },1000)

            })
        });
    },
    //获取普通钱包的总余额
    getNormalTotalBalance({state,commit,dispatch}){
        let total=0,count=0;
        dispatch('getOrd').then((ords)=>{
            ords.forEach((ord)=>{
                contractService.web3.eth.getBalance(ord.address,(err,data)=>{
                    if(err) return null;
                    total+=(contractService.web3.fromWei(data,"ether").toString(10)-0);
                    count++;
                    state.norTotalBalance = (Math.floor(Number(total) * 100) / 100).toFixed(2);
                });

            });
        });
    },
    //更新当前情景钱包种类(普通or共享)
    updateWalletType({state,commit},type){
        commit('UPDATE_WALLET_TYPE',type);
    },
    //获取共享钱包的拥有者
    getSharedOwner({state,commit,dispatch},address){
        return new Promise((resolve, reject)=>{
             dispatch('getShareByAddress',address).then((data)=>{
                resolve(data?data.admin:null);
            })
        })

    },
    updateCurWallet({state,commit},address){
        state.curWallet = address;
    },
    replaceWallet({state,commit,rootState},obj){
        return new Promise((resolve, reject)=>{
            fsObj.ReadFile(Settings.userDataPath,fileName,(err, data) => {
                if(data){
                    let type = rootState.setting.network.type=='custom'?'custom_'+rootState.setting.chainName:rootState.setting.network.type;
                    let retData = JSON.parse(data.toString().replace(/\n\r/g,''));
                    retData[type].forEach((item,index)=>{
                        if(item.address==obj.address){
                            retData[type].splice(index,1,obj)
                        }
                    });
                    fsObj.WriteFile(fileName, JSON.stringify(retData), (err) => {
                        if(err){
                            fsObj.saveKey(obj.address,JSON.stringify(obj));
                            commit('UPDATE_WALLET_LIST',retData[type]);
                            resolve();
                        }else{
                            reject();
                        }
                    });
                    resolve();
                }else{
                    reject();
                }
            })
        })
    },
    getGasOptions({state,commit},cb){
        if(Options){
            cb(Options)
        }
    },
    //更新普通钱包列表
    updateWalletInfo({state,commit,rootState},keyObj){
        return new Promise((resolve, reject)=>{
            let fileName1 = (state.walletType==1)?fileName:fileNameS
            fsObj.ReadFile('',fileName1, (err, data)=> {
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
                    retData[walletCate].push(keyObj);
                    result = retData
                }else{
                    let arr = [];
                    arr.push(keyObj);
                    result[walletCate] = arr;
                }
                fsObj.WriteFile(fileName1, JSON.stringify(result), (err1) => {
                    if(err1){
                        reject(1,err1);
                        throw err1;
                    }
                    resolve();
                })
            });
        });
    },
    updatePageLoading({state,commit},bool){
        state.pageLoading = bool;
    }
};
