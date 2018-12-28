/**
 * Created by 15236 on 2017/5/24.
 */
import ApiService from '@/services/API-servies'
import Settings from '@/services/setting';
import fs from 'fs';

export const settingAction = {
    initSetting({state,commit},obj){
        state.appVersion = obj.appVersion;
        state.rpcMode = obj.rpcMode;
    },
    updateNetSetting({state,commit},obj){
        commit('UPDATE_NET_SETTING',obj);
        let network = obj.network;
        if(network && network.type){
            Settings.saveUserData('type',network.type);
            let keyType = network.type;
            if(keyType=='custom'){
                keyType = 'custom_'+state.chainName;
            }
            Settings.setKeyPath(keyType);
        }else{
            Settings.deleteUseData('type')
        }
        if(network && network.ip){
            Settings.saveUserData('ip',network.ip);
        }else{
            Settings.deleteUseData('ip')
        }
        if(network && network.port){
            Settings.saveUserData('port',network.port);
        }else{
            Settings.deleteUseData('port')
        }
    },
    updateState({state,commit},num){
        state.nodeState = num;
    },
    changeLang({state,commit},lang){
        commit('CHANGE_LANG',lang);
        window.vueVm.$i18n.locale = lang;
        window.i18nLocale = lang;
        window.localStorage.setItem('user_lang',lang)
    },
    updateLoading({state,commit},bool){
        state.netLoading = bool;
    },
    deleteTxn(){
        Settings.deleteUseData('txn.json');
        Settings.deleteUseData('net_custom/txn.json');
    },
    updateChainName({state,commit},name){
        console.log('update chainName',name);
        Settings.saveUserData('chainName',name);
        state.chainName = name;
    },
    //在head,index,cuttomNet中管理最大化
    changeWindow({state,commit},isMax){
        console.log('changeWindow',!isMax)
        state.isMax = !isMax
        commit('CHANGE_WINDOW',!isMax);
    },
    getCustoms({state,commit},cb){
        //读取创建的私有链
        let userDataPath = Settings.userDataPath+'net_custom/chain',arr=[],_this=this;
        fs.readdir(userDataPath, function(err, paths) {
            if(err){
                throw err;
            } else {
                if(paths && paths.length>0){
                    paths.forEach(function(path) {
                        console.warn(userDataPath,path);
                        var _src = userDataPath + '/' +path;
                        fs.stat(_src, function(err, stat) {
                            if(err){
                                throw err;
                            } else {
                                // 判断是文件还是目录
                                if(stat.isDirectory()) {
                                    if(fs.existsSync(`${_src}/platon`)){
                                        let port = fs.readFileSync(`${_src}/port`,{encoding:'utf-8'});
                                        arr.push({
                                            name:path,
                                            port:port
                                        });
                                        cb(arr);
                                    }
                                }
                            }
                        })
                    });
                }else{
                    cb([])
                }
            }
        })
    }
}
