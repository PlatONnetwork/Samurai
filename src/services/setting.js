const app = require('electron').remote.app;
const path = require('path');
const fs = require('fs');
const packageJson = require('../../package.json');
const lodash = require('lodash');
import store from '@/vuex/store';
let instance = null;
import nodeManager from '@/services/node-manager';
var child_process = require("child_process");

class Settings {
    constructor() {
        if (!instance) {
            instance = this;
        }
        this.keyPath='';
        return instance;
    }

    mkf(path,cb){
        fs.exists(path, (exists) => {
            if(!exists){
                fs.mkdir(path, { recursive: true }, (err) => {
                    if (err) {
                        throw err;
                    }else{
                        if(cb && typeof cb=='function'){
                            cb()
                        }
                    }
                })
            }else{
                if(cb && typeof cb=='function'){
                    cb()
                }
            }
        })
    }

    init() {
        return new Promise((resolve, reject)=>{
            console.info(`Running in production mode: ${this.inProductionMode}`);
            const run=() =>{
                //初始化文件存储目录
                this.mkf(this.userDataPath+'net_main',()=>{
                    this.mkf(this.userDataPath+'net_main/keystore')
                });
                this.mkf(this.userDataPath+'net_test',()=>{
                    this.mkf(this.userDataPath+'net_test/keystore');
                    if(!fs.existsSync(`${this.userDataPath}net_test/init`)){
                        fs.writeFileSync(`${this.userDataPath}net_test/init`,0)
                    }else{
                        let dataExit = fs.existsSync(`${this.userDataPath}net_test/data/platon`);
                        console.log('dataExit----',dataExit);
                        fs.writeFileSync(`${this.userDataPath}net_test/init`,dataExit?1:0);
                    }
                    this.mkf(this.userDataPath+'net_test/data',()=>{
                        let configJSON = require("../../static/json/platon");
                        fs.writeFileSync(`${this.userDataPath}net_test/data/platon.json`,JSON.stringify(configJSON));
                        let cbftJSON = require("../../static/json/cbft.json");
                        fs.writeFileSync(`${this.userDataPath}net_test/data/cbft.json`,JSON.stringify(cbftJSON));
                        let staticNodesJSON = require("../../static/json/static-nodes.json");
                        fs.writeFileSync(`${this.userDataPath}net_test/data/static-nodes.json`,JSON.stringify(staticNodesJSON));
                    });
                });
                this.mkf(this.userDataPath+'net_custom',()=>{
                    this.mkf(this.userDataPath+'net_custom/chain');
                    this.mkf(this.userDataPath+'net_custom/keystore')
                });

                //普通钱包
                if(!fs.existsSync(`${this.userDataPath}walletInfo.json`)){
                    this.saveUserData('walletInfo.json',JSON.stringify({}))
                }
                //联名钱包
                if(!fs.existsSync(`${this.userDataPath}sharedWalletInfo.json`)){
                    this.saveUserData('sharedWalletInfo.json',JSON.stringify({}))
                }
                //合约列表
                if(!fs.existsSync(`${this.userDataPath}contractList.json`)){
                    this.saveUserData('contractList.json',JSON.stringify({}))
                }
                //节点竞选申请最近一条记录
                if(!fs.existsSync(`${this.userDataPath}nodeApplyList.json`)){
                    this.saveUserData('nodeApplyList.json',JSON.stringify({}))
                }
                //退出竞选最近一条记录
                if(!fs.existsSync(`${this.userDataPath}nodeQuitList.json`)){
                    this.saveUserData('nodeQuitList.json',JSON.stringify({}))
                }
                //投票记录
                if(!fs.existsSync(`${this.userDataPath}voteList.json`)){
                    this.saveUserData('voteList.json',JSON.stringify({}))
                }
                resolve();
            }
            if (this.rpcMode === 'http') {
                console.warn(
                    'Connecting to a node via HTTP instead of ipcMain. This is less secure!!!!'.toUpperCase()
                );
            }
            store.dispatch('initSetting',{
                appVersion:packageJson.version,
                rpcMode:this.rpcMode
            });

            //获取用户数据存储目录
            // let exePath = nodeManager.getExePath();
            // let pathProc = child_process.execFile("getUserDataPath.bat", null, {
            //     cwd: exePath,
            // },  (error, stdout, stderr)=> {
            //     if (error !== null) {
            //         console.log("exec error" + error);
            //         reject();
            //     }
            // });
            // pathProc.stdout.once('data', (data)=>{
            //     console.log('stdout: ' + data);
            //     const arr = data.trim().split(/\s+/);
            //     console.log('UserDataPath=', arr[2]);
            //     let dataPath = arr[2];
            //     dataPath = dataPath.replace(/\\/g,'/')+'/';
            //     this.userDataPath = dataPath;
            //     run();
            // });

            let dataPath = app.getPath('appData');
            dataPath = dataPath.replace(/\\/g,'/')+'/';
            console.log('dataPath----',dataPath);
            // this.userDataPath = dataPath+'\\Samurai\\';
            this.mkf(dataPath + '/Samurai', () => {
                this.userDataPath =path.join( dataPath,'','Samurai/');
                this.userDataPath = this.userDataPath.replace(/\\/g,'/');
                console.log(`appData dataPath=${this.userDataPath},${dataPath}`)
                run();
            });


       });

    }

    // @returns "Application Support/Mist" in production mode
    // @returns "Application Support/Electron" in development mode
    setKeyPath(type,cb) {
        console.log('setting---',type);
        if(!type) return;
        let defaultKeyPath = this.userDataPath,userDataPath = this.userDataPath+'keyPath';
        fs.exists(userDataPath, (exists) => {
            console.log('keypath exits---',exists);
            if(exists){
                let data =  JSON.parse(fs.readFileSync(userDataPath,{encoding:'utf8'}));
                console.log('data----',data);
                if(type=='test' || type=='main'){
                    this.keyPath = data[type]
                }else{
                    let chainName = type.replace(/^custom_/,'');
                    this.keyPath = data[type]?data[type]:(defaultKeyPath+'net_custom'+'/chain/'+chainName+'/keystore');
                }
            }else{
                if(type=='test' || type=='main'){
                    this.keyPath = defaultKeyPath+'net_'+type+'/keystore/';
                }else{
                    let chainName = type.replace(/^custom_/,'');
                    this.keyPath = defaultKeyPath+'net_custom'+'/chain/'+chainName+'/keystore';
                }
            }
            if(cb && typeof cb=='function'){
                cb();
            }
        });
    }

    // get userDataPath(){
    //     return this.userDataPath
    //
    //     // let appPath = app.getPath('appData').replace(/\\/g,'/');
    //     // if(fs.existsSync(`${appPath}/PlatON`)){
    //     //     return `${appPath}/PlatON/`
    //     // }else{
    //     //     fs.mkdirSync(`${appPath}/PlatON`);
    //     //     return `${appPath}/PlatON/`
    //     // }
    // }

    get appDataPath() {
        // Application Support/
        return app.getPath('appData');
    }

    get userHomePath() {
        return app.getPath('home');
    }

    get appVersion() {
        return packageJson.version;
    }

    get language() {
        return this.loadConfig('ui.i18n');
    }

    set language(langCode) {
        this.saveConfig('ui.i18n', langCode);
    }


    saveConfig(key, value) {
        let obj = global.config.get(1);

        if (!obj) {
            this.initConfig();
            obj = global.config.get(1);
        }

        if (lodash.get(obj, key) !== value) {
            lodash.set(obj, key, value);
            global.config.update(obj);

            console.debug(`Settings: saveConfig('${key}', '${value}')`);
            console.trace(global.config.data);
        }
    }

    loadConfig(key) {
        const obj = global.config.get(1);

        if (!obj) {
            this.initConfig();
            return this.loadConfig(key);
        }

        console.trace(
            `Settings: loadConfig('${key}') = '${lodash.get(obj, key)}'`
        );

        return lodash.get(obj, key);
    }

    loadUserData(thisPath) {
        const fullPath = this.constructUserDataPath(thisPath);

        console.trace('Load user data', fullPath);

        // check if the file exists
        try {
            fs.accessSync(fullPath, fs.R_OK);
        } catch (err) {
            return null;
        }

        // try to read it
        try {
            const data = fs.readFileSync(fullPath, { encoding: 'utf8' });
            console.debug(`Reading "${data}" from ${fullPath}`);
            return data;
        } catch (err) {
            console.warn(`File not readable: ${fullPath}`, err);
        }

        return null;
    }

    saveUserData(thisPath, data) {
        if (!data) {
            // return so we dont write null, or other invalid data
            return;
        }

        const fullPath = this.constructUserDataPath(thisPath);
        try {
            console.debug(`Saving "${data}" to ${fullPath}`);
            fs.writeFileSync(fullPath, data, { encoding: 'utf8' });
        } catch (err) {
            console.warn(`Unable to write to ${fullPath}`, err);
        }
    }

    deleteUseData(thisPath){
        const fullPath = this.constructUserDataPath(thisPath);
        try{
            if(fs.existsSync(fullPath)){
                fs.unlinkSync(fullPath);
            }
        }catch(err){
            console.warn(`Unable to delete to ${fullPath}`, err);
        }

    }

    constructUserDataPath(filePath) {
        console.warn('constructUserDataPath',this.userDataPath,filePath);
        return path.join(this.userDataPath, filePath);
    }
}

// module.exports = new Settings();
export default new Settings;
/* ==========================
Command line argument parsing
============================= */


// const argv = require('yargs')
//     .usage('Usage: $0 [Mist options] [Node options]')
//     .option({
//         mode: {
//             alias: 'm',
//             demand: false,
//             default: defaultConfig.mode,
//             describe: 'App UI mode: wallet, mist.',
//             requiresArg: true,
//             nargs: 1,
//             type: 'string',
//             group: 'Mist options:'
//         },
//         node: {
//             demand: false,
//             default: null,
//             describe: 'Node to use: geth, eth',
//             requiresArg: true,
//             nargs: 1,
//             type: 'string',
//             group: 'Mist options:'
//         },
//         network: {
//             demand: false,
//             default: null,
//             describe: 'Network to connect to: main, test',
//             requiresArg: true,
//             nargs: 1,
//             type: 'string',
//             group: 'Mist options:'
//         },
//         rpc: {
//             demand: false,
//             describe:
//                 'Path to node IPC socket file OR HTTP RPC hostport (if IPC socket file then --node-ipcpath will be set with this value).',
//             requiresArg: true,
//             nargs: 1,
//             type: 'string',
//             group: 'Mist options:'
//         },
//         swarm: {
//             describe: 'Enable Swarm on start.',
//             requiresArg: false,
//             nargs: 0,
//             type: 'boolean',
//             group: 'Mist options:'
//         },
//         swarmurl: {
//             demand: false,
//             default: 'http://localhost:8500',
//             describe:
//                 'URL serving the Swarm HTTP API. If null, Mist will open a local node.',
//             requiresArg: true,
//             nargs: 1,
//             type: 'string',
//             group: 'Mist options:'
//         },
//         gethpath: {
//             demand: false,
//             describe: 'Path to Geth executable to use instead of default.',
//             requiresArg: true,
//             nargs: 1,
//             type: 'string',
//             group: 'Mist options:'
//         },
//         ethpath: {
//             demand: false,
//             describe: 'Path to Eth executable to use instead of default.',
//             requiresArg: true,
//             nargs: 1,
//             type: 'string',
//             group: 'Mist options:'
//         },
//         'ignore-gpu-blacklist': {
//             demand: false,
//             describe: 'Ignores GPU blacklist (needed for some Linux installations).',
//             requiresArg: false,
//             nargs: 0,
//             type: 'boolean',
//             group: 'Mist options:'
//         },
//         'reset-tabs': {
//             demand: false,
//             describe: 'Reset Mist tabs to their default settings.',
//             requiresArg: false,
//             nargs: 0,
//             type: 'boolean',
//             group: 'Mist options:'
//         },
//         loglevel: {
//             demand: false,
//             default: 'info',
//             describe:
//                 'Minimum logging threshold: info, debug, error, trace (shows all logs, including possible passwords over IPC!).',
//             requiresArg: true,
//             nargs: 1,
//             type: 'string',
//             group: 'Mist options:'
//         },
//         syncmode: {
//             demand: false,
//             requiresArg: true,
//             describe: 'Geth synchronization mode: [fast|light|full|nosync]',
//             nargs: 1,
//             type: 'string',
//             group: 'Mist options:'
//         },
//         version: {
//             alias: 'v',
//             demand: false,
//             requiresArg: false,
//             nargs: 0,
//             describe: 'Display Mist version.',
//             group: 'Mist options:',
//             type: 'boolean'
//         },
//         skiptimesynccheck: {
//             demand: false,
//             requiresArg: false,
//             nargs: 0,
//             describe:
//                 'Disable checks for the presence of automatic time sync on your OS.',
//             group: 'Mist options:',
//             type: 'boolean'
//         },
//         '': {
//             describe:
//                 'To pass options to the underlying node (e.g. Geth) use the --node- prefix, e.g. --node-datadir',
//             group: 'Node options:'
//         }
//     })
//     .help('h')
//     .alias('h', 'help')
//     .parse(process.argv.slice(1));
//
// argv.nodeOptions = [];
//
// for (const optIdx in argv) {
//     if (optIdx.indexOf('node-') === 0) {
//         argv.nodeOptions.push(`--${optIdx.substr(5)}`);
//
//         if (argv[optIdx] !== true) {
//             argv.nodeOptions.push(argv[optIdx]);
//         }
//     }
// }
//
// // some options are shared
// if (argv.ipcpath) {
//     argv.nodeOptions.push('--ipcpath', argv.ipcpath);
// }
//
// if (argv.nodeOptions && argv.nodeOptions.syncmode) {
//     argv.push('--syncmode', argv.nodeOptions.syncmode);
// }
