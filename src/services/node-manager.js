import store from '@/vuex/store'
const fs = require('fs');
var web3 = require('web3');
const spawn = require('child_process');
const net = require('net');
var nodePath = require('path');
const Q = require('bluebird');
import Settings from '@/services/setting';
import contractService from '@/services/contract-servies';
const STATES = {
    STARTING: 0 /* Node about to be started */,
    STARTED: 1 /* Node started */,
    CONNECTED: 2 /* IPC connected - all ready */,
    STOPPING: 3 /* Node about to be stopped */,
    STOPPED: 4 /* Node stopped */,
    ERROR: -1 /* Unexpected error */
};
let instance;
class nodeManager {
	constructor() {
        if (!instance) {
            instance = this;
        }
        this.STATES = STATES;
        this.state = STATES.STOPPED;
        this.netType=null; //网络类型：main主网络；test测试网络；custom:私有网络
        return instance;
        this._node = null;  //本地节点子进程
        this._chain = null;  //初始化创世区块子进程
	}
	isConnect(){
	    return new Promise((resolve,reject)=>{
	        let count = 1;
	        let nodeTimer = setInterval(()=>{
                const client = net.Socket();
                const ipcNode = '\\\\.\\pipe\\platon.ipc';
                const web3 = new Web3(new Web3.providers.IpcProvider(ipcNode, client));
                web3.version.getNetwork((err, networkId) => {
                    count++;
                    console.warn(err, networkId);
                    if (!err) {
                        clearInterval(nodeTimer);
                        resolve(true)
                    }
                    if(count==50){
                        clearInterval(nodeTimer);
                        resolve(false)
                    }
                })
            },1000);
        });

    }
	init(type,ip,port){
	    if(store.state.setting.nodeState==2) return;
        store.dispatch('updateState',0);
	    console.log('init',type,ip,port);
        if(type){
        // if((type&&type!='custom') || (type&&ip&&port)){
            store.dispatch('updateLoading',true);
            if(type=='custom'){
                const client = net.Socket();
                const ipcNode = '\\\\.\\pipe\\platon.ipc';
                const web3 = new Web3(new Web3.providers.IpcProvider(ipcNode, client));
                this.isConnect().then((isConn)=>{
                     if(isConn){   //节点已启动
                         this.changeNetState(2,false,type,ip,port);
                         store.dispatch('updateLoading',false);
                     }else{    //节点未启动
                         console.log('isConnect-----',isConnect)
                         // this.startNode('platon',port);
                     }
                });
            }else{
                this._start(type).then(()=>{
                    console.warn('able to');
                    this.changeNetState(2,false,type,ip,port);
                    store.dispatch('updateLoading',false);
                }).catch(err => {
                    store.dispatch('updateLoading',false);
                    throw err;
                });
            }
        }else{
            this.changeNetState(0,true);
        }

	}
	changeNetState(nodeState,initialUse,type,ip,port){
        store.dispatch('updateState',nodeState);
        store.dispatch('updateNetSetting',{
            initialUse:initialUse,
            network:{
                type:type,
                ip:ip,
                port:port
            }
        });
    }
	stop(proc){
	    console.warn('_node--->',this._node,!!this._node);
	    console.warn('_connect--->',this._connect,!!this._connect);
	    let pro = proc;
	    console.warn(pro,!!this[pro]);
        return new Q(resolve => {
            if(!this[pro]){
                return resolve();
            }
            this[pro].stderr.removeAllListeners('data');
            this[pro].stdout.removeAllListeners('data');
            // this[pro].stdin.removeAllListeners('error');
            this[pro].removeAllListeners('error');
            // this[pro].removeAllListeners('exit');
            this[pro].kill('SIGINT');

            // after some time just kill it if not already done so
            const killTimeout = setTimeout(() => {
                if (this[pro]) {
                    this[pro].kill('SIGKILL');
                    console.warn('still alive',!!this[pro]);
                }
            }, 2000 /* 8 seconds */);

            this[pro].once('close', () => {
                clearTimeout(killTimeout);

                this[pro] = null;
                store.dispatch('updateState',0);
                resolve();
            });
        });
    }
    initChain(chainName,port){
	    //初始化创世区块
        console.log('initChain');
        console.warn('cwd',this.getExePath());
        let _this = this,
            userDataPath = Settings.userDataPath+'net_custom/';
        console.warn(`${userDataPath}${chainName}.json`);
        var chainProc = spawn.exec(`platon --datadir "${userDataPath}chain/${chainName}" init ${userDataPath}${chainName}.json`, {
            cwd: _this.getExePath(),
            encoding: 'arrayBuffer'
        }, function (error, stdout, stderr) {
            if(!error){
                //删除之前链上发起的存在本地的交易
                store.dispatch('deleteTxn');
                _this.startNode(chainName,port);
            }else{
                alert(window.vueVm.$i18n.t('wallet.initFailed'))
                console.warn(2,error)
            }
        });
        chainProc.on('error', function (error) {
            console.log('error----->', new TextDecoder("GB2312").decode(error));
        });
        chainProc.stdout.once('data', function (data) {
            console.log('stdout ----->', new TextDecoder("GB2312").decode(data));
        });
        chainProc.stderr.on('data', function (data) {
            console.log('stderr---->', new TextDecoder("GB2312").decode(data));
        });
    }
    startNode(chainName,port){
	    return new Promise((resolve, reject)=>{
	        this.stop('_node').then(()=>{
                //启动主节点
                console.log('startMainNode');
                let _this = this,
                    userDataPath = Settings.userDataPath+'net_custom/';
                console.warn('cwd--->',_this.getExePath());
                var nodeProc = spawn.exec(`platon -identity "${chainName}" --rpc --datadir ${userDataPath}chain/${chainName} --port 16789 --rpcport ${port} --rpcapi "db,eth,net,web3,miner,admin,personal" --rpcaddr 0.0.0.0 --verbosity 0  --miner.etherbase 0x1b8d5ee48ef3eb772f32f45908935210930a3ee5 console \n`, {
                    cwd: _this.getExePath(),
                    encoding: 'arrayBuffer',
                    maxBuffer: 500000 * 1024,
                }, function (error, stdout, stderr) {
                    if(!error){
                        console.log('启动成功')
                    }else{
                        console.warn(2,error)
                    }
                });
                nodeProc.on('error', function (error) {
                    console.log('error----->', new TextDecoder("GB2312").decode(error));
                    reject();
                });
                nodeProc.stdout.once('data', function (data) {
                    console.log('stdout ----->', new TextDecoder("GB2312").decode(data));
                    _this.isConnect().then((isConn)=>{
                        if(isConn){   //节点已启动
                            nodeProc.stdin.write('miner.start() \n');
                            contractService.setProvider('','ipc').then(()=>{
                                _this.changeNetState(2,false,'custom','',port);
                                store.dispatch('updateLoading',false);
                                store.dispatch('updateChainName',chainName);
                            }).catch((err)=>{
                                _this.changeNetState(0,true,'custom','',port);
                                store.dispatch('updateLoading',false);
                                store.dispatch('updateChainName',chainName)
                                alert(err);
                            })
                            resolve();
                        }else{    //节点未启动
                            _this.changeNetState(0,true,'custom','',port);
                            alert(window.vueVm.$i18n.t('wallet.initFailed'));
                            reject();
                        }
                    });
                });
                nodeProc.stderr.on('data', function (data) {
                    console.log('stderr---->', new TextDecoder("GB2312").decode(data));
                });
                nodeProc.stderr.once('close', function (data) {
                    console.log('close---->', data);
                    reject();
                });
                this._node = nodeProc;
            });
        })
    }
  //连接主网络或测试网络
    conncetNet(type){
        return new Promise((resolve, reject)=>{
            this.stop('_connect').then(()=>{
                //启动主节点
                console.log('conncetNet-->startMainNode--->',type);
                let _this = this,
                    userDataPath = Settings.userDataPath+'net_'+type+'/';
                var conncetProc = spawn.exec(`platon -identity "platon" --rpc --datadir ${userDataPath}data --rpcaddr 0.0.0.0 --port 26793 --rpcport 7793 --rpcapi "db,eth,net,web3,miner,admin,personal" --verbosity 0 --bootnodes="enode://1f3a8672348ff6b789e416762ad53e69063138b8eb4d8780101658f24b2369f1a8e09499226b467d8bc0c4e03e1dc903df857eeb3c67733d21b6aaee2840e429@192.168.9.76:26788" --miner.etherbase 0x1b8d5ee48ef3eb772f32f45908935210930a3ee5  --wasmlog wasm.log console \n`, {
                    cwd: _this.getExePath(),
                    encoding: 'arrayBuffer',
                    maxBuffer: 500000 * 1024,
                }, function (error, stdout, stderr) {
                    if(!error){
                        console.log('启动成功')
                    }else{
                        console.warn(2,error)
                    }
                });
                conncetProc.on('error', function (error) {
                    console.log('error----->', new TextDecoder("GB2312").decode(error));
                    reject();
                });
                conncetProc.stdout.once('data', function (data) {
                    console.log('stdout ----->', new TextDecoder("GB2312").decode(data));
                    _this.isConnect().then((isConn)=>{
                        if(isConn){   //节点已启动
                            // conncetProc.stdin.write('miner.start() \n');
                            contractService.setProvider('','ipc').then(()=>{
                                _this.changeNetState(2,false,type,'','26793');
                                store.dispatch('updateLoading',false);
                            }).catch((err)=>{
                                _this.changeNetState(0,true,type,'','26793');
                                store.dispatch('updateLoading',false);
                                alert(err);
                            })
                            resolve();
                        }else{    //节点未启动
                            _this.changeNetState(0,true,type,'','26793');
                            alert(window.vueVm.$i18n.t('wallet.initFailed'));
                            reject();
                        }
                    });
                });
                conncetProc.stderr.on('data', function (data) {
                    console.log('stderr---->', new TextDecoder("GB2312").decode(data));
                });
                conncetProc.stderr.once('close', function (data) {
                    console.log('close---->', data);
                    reject();
                });
                this._connect = conncetProc;
            })
        });

    }

    getExePath=() =>{
        // return "C:\\Users\\yann_liang\\AppData\\Local\\Programs\\console\\platon_exe"
        const app = require('electron').remote.app;
        console.warn('getExePath--->app.getPath(exe)',app.getPath('exe'));
        return process.env.NODE_ENV === 'development' ? 'src/services/platon-exe' : nodePath.join(app.getPath('exe'), '..', '/platon_exe');
    }
}

export default new nodeManager;
