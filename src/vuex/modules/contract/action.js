/**
 * Created by 15236 on 2017/5/24.
 */
import Settings from '@/services/setting';
import fs from 'fs';
import fsObj from '@/services/fs-service'
const fileName = 'contractList.json';
export const contractAction = {
    // 获取合约列表
    contractListAction({state,commit,rootState}){
        return new Promise((resolve, reject)=>{
            let type = rootState.setting.network.type;
            fsObj.ReadFile(Settings.userDataPath,fileName,(err, data) => {
                if(data){
                    // console.warn('contractListAction',data);
                    let retData = JSON.parse(data.toString().replace(/\n\r/g,'')),walletCate=type;
                    if(type=='custom'){
                        walletCate = 'custom_'+rootState.setting.chainName;
                    }
                    commit('UPDATE_CONTRACT_LIST',retData[walletCate]);
                    resolve();
                }else{
                    reject();
                }
            })
        })
    },

    // 更新合约列表
    updateContractInfo({state,commit,rootState,dispatch},contractObj){
        return new Promise((resolve, reject)=>{
            let data = fs.readFileSync(Settings.userDataPath+'contractList.json',{encoding:'utf-8'});
            let result={}
            // let netType = rootState.setting.network.type
            if(data || JSON.stringify(data) != "{}"){
                let retData = JSON.parse(data.toString().replace(/\n\r/g,''));
                let netType =  rootState.setting.network.type=='custom'?'custom_'+rootState.setting.chainName:rootState.setting.network.type;
                if(!retData[netType]){
                    retData[netType]=[];
                }
                retData[netType].push(contractObj);
                result = retData
            }else{
                let arr = [contractObj];
                result[netType] = arr;
            }
            console.warn(contractObj);
            console.warn(result);
            fs.writeFile(Settings.userDataPath+'contractList.json',JSON.stringify(result),(conterr)=>{
                if(conterr){
                    reject(1,conterr);
                    throw conterr;
                }
                resolve();
            });
            });
    },
}
