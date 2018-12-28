var fs = require('fs');
import Settings from '@/services/setting';
import store from '@/vuex/store'

const fsObj = {
    WriteFile(name, data, cb){
        console.log(data)
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
    saveKey(name,content){
        console.log('Settings.keyPath-----',Settings.keyPath);
        let keyPath = Settings.keyPath,
            netType=store.state.setting.network.type,
            chainName=store.state.setting.chainName,
            path;
        path=`${keyPath}/${name}.json`;
        // if(netType=='custom'){
        //     path=`${keyPath}${chainName}/keystore/${name}.json`;
        // }else{
        //     path=`${keyPath}${name}.json`;
        // }
        fs.writeFile(path, content, (err) => {
            console.log('saveKey-->',err);
        })
    }


 }
export default fsObj


