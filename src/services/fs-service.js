var fs = require('fs');
import Settings from '@/services/setting';
import store from '@/vuex/store'

const fsObj = {
    WriteFile(name, data, cb){
        fs.writeFile(`${Settings.userDataPath}${name}`, data, (err) => {
            cb(err);
        })
    },
    ReadFile(dir,name,cb){
        let root = '';
        if(dir){
            root = dir;
        }else{
            root = Settings.userDataPath
        }
        fs.readFile(`${root}${name}`,'utf-8',(err, data) => {
            cb(err, data)
        })
    },
    saveKey(address,content){
        let keyPath = Settings.keyPath,
            netType=store.state.setting.network.type,
            chainName=store.state.setting.chainName,
            path,keyObj,jsonKeyObj;
        path=`${keyPath}/${address}.json`;
        try{
            keyObj = JSON.parse(content);
            if(keyObj.account){
                delete keyObj.account
            }
            jsonKeyObj = JSON.stringify(keyObj)
        }catch(e){
            jsonKeyObj = content;
        }
        fs.writeFileSync(path, jsonKeyObj)
    }


 }
export default fsObj


