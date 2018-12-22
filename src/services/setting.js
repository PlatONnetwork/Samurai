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
            let exePath = nodeManager.getExePath();
            let pathProc = child_process.execFile("getUserDataPath.bat", null, {
                cwd: exePath,
            },  (error, stdout, stderr)=> {
                if (error !== null) {
                    console.log("exec error" + error);
                    reject();
                }
            });
            pathProc.stdout.once('data', (data)=>{
                console.log('stdout: ' + data);
                const arr = data.trim().split(/\s+/);
                console.log('UserDataPath=', arr[2]);
                let dataPath = arr[2];
                dataPath = dataPath.replace(/\\/g,'/')+'/';
                this.userDataPath = dataPath;
                //初始化文件存储目录
                this.mkf(this.userDataPath+'net_main',()=>{
                    this.mkf(this.userDataPath+'net_main/keystore')
                });
                this.mkf(this.userDataPath+'net_test',()=>{
                    this.mkf(this.userDataPath+'net_test/keystore')
                });
                this.mkf(this.userDataPath+'net_custom',()=>{
                    this.mkf(this.userDataPath+'net_custom/chain');
                    this.mkf(this.userDataPath+'net_custom/keystore')
                });
                if(!fs.existsSync(`${this.userDataPath}walletInfo.json`)){
                    this.saveUserData('walletInfo.json',JSON.stringify({}))
                }
                if(!fs.existsSync(`${this.userDataPath}sharedWalletInfo.json`)){
                    this.saveUserData('sharedWalletInfo.json',JSON.stringify({}))
                }
                if(!fs.existsSync(`${this.userDataPath}contractList.json`)){
                    this.saveUserData('contractList.json',JSON.stringify({}))
                }
                resolve();
            });

       });

    }

    // @returns "Application Support/Mist" in production mode
    // @returns "Application Support/Electron" in development mode
    setKeyPath(type,cb) {
        if(!type) return;
        let defaultKeyPath = this.userDataPath,userDataPath = this.userDataPath+'keyPath';
        fs.exists(userDataPath, (exists) => {
            if(exists){
                let data =  JSON.parse(fs.readFileSync(userDataPath,{encoding:'utf8'}));
                this.keyPath = data[type]
            }else{
                if(type=='custom'){
                    this.keyPath = defaultKeyPath+'net_'+type+'/chain/';
                }else{
                    this.keyPath = defaultKeyPath+'net_'+type+'/keystore/';
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

    // get cli() {
    //     return argv;
    // }

    get appVersion() {
        return packageJson.version;
    }

    get appName() {
        return this.uiMode === 'mist' ? 'Mist' : 'Ethereum Wallet';
    }

    get appLicense() {
        return packageJson.license;
    }

    // get inProductionMode() {
    //     return defaultConfig.production;
    // }

    //
    // get swarmURL() {
    //     return argv.swarmurl;
    // }
    //
    // get gethPath() {
    //     return argv.gethpath;
    // }
    //
    // get ethPath() {
    //     return argv.ethpath;
    // }
    //
    // get rpcMode() {
    //     if (argv.rpc && argv.rpc.indexOf('http') === 0) return 'http';
    //     if (argv.rpc && argv.rpc.indexOf('ws:') === 0) {
    //         console.warn(
    //             'Websockets are not yet supported by Mist, using default IPC connection'
    //         );
    //         argv.rpc = null;
    //         return 'ipc';
    //     } else return 'ipc';
    // }

    get rpcConnectConfig() {
        if (this.rpcMode === 'ipc') {
            return {
                path: this.rpcIpcPath
            };
        }

        return {
            hostPort: this.rpcHttpPath
        };
    }

    // get rpcHttpPath() {
    //     return this.rpcMode === 'http' ? argv.rpc : null;
    // }

    get rpcIpcPath() {
        // let ipcPath = this.rpcMode === 'ipc' ? argv.rpc : null;

        if (ipcPath) {
            return ipcPath;
        }

        ipcPath = this.userHomePath;

        if (process.platform === 'darwin') {
            ipcPath += '/Library/Ethereum/geth.ipc';
        } else if (
            process.platform === 'freebsd' ||
            process.platform === 'linux' ||
            process.platform === 'sunos'
        ) {
            ipcPath += '/.ethereum/geth.ipc';
        } else if (process.platform === 'win32') {
            ipcPath = '\\\\.\\pipe\\geth.ipc';
        }

        console.debug(`IPC path: ${ipcPath}`);

        return ipcPath;
    }

    // get nodeType() {
    //     return argv.node;
    // }
    //
    // get network() {
    //     return argv.network;
    // }
    //
    // get syncmode() {
    //     return argv.syncmode;
    // }
    //
    // get nodeOptions() {
    //     return argv.nodeOptions;
    // }

    get language() {
        return this.loadConfig('ui.i18n');
    }

    set language(langCode) {
        this.saveConfig('ui.i18n', langCode);
    }



    // get skiptimesynccheck() {
    //     return argv.skiptimesynccheck;
    // }


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
