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
                                store.dispatch('updateChainName',chainName);
                                _this.changeNetState(2,false,'custom','',port);
                                store.dispatch('updateLoading',false);
                            }).catch((err)=>{
                                store.dispatch('updateChainName',chainName)
                                _this.changeNetState(0,true,'custom','',port);
                                store.dispatch('updateLoading',false);
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
  //随机获取测试网络节点
  getTestNode(){
	    let num = Math.floor(Math.random()*(4-1+1)+1);
	    switch(num){
            case 1:
                return "enode://0abaf3219f454f3d07b6cbcf3c10b6b4ccf605202868e2043b6f5db12b745df0604ef01ef4cb523adc6d9e14b83a76dd09f862e3fe77205d8ac83df707969b47@18.144.74.193:16789";
                // return "enode://1f3a8672348ff6b789e416762ad53e69063138b8eb4d8780101658f24b2369f1a8e09499226b467d8bc0c4e03e1dc903df857eeb3c67733d21b6aaee2840e429@192.168.9.76:26788";
                break;
            case 2:
                return "enode://e0b6af6cc2e10b2b74540b87098083d48343805a3ff09c655eab0b20dba2b2851aea79ee75b6e150bde58ead0be03ee4a8619ea1dfaf529cbb8ff55ca23531ed@13.229.224.91:16789";
                // return "enode://751f4f62fccee84fc290d0c68d673e4b0cc6975a5747d2baccb20f954d59ba3315d7bfb6d831523624d003c8c2d33451129e67c3eef3098f711ef3b3e268fd3c@192.168.9.76:26789";
                break;
            case 3:
                return "enode://15245d4dceeb7552b52d70e56c53fc86aa030eab6b7b325e430179902884fca3d684b0e896ea421864a160e9c18418e4561e9a72f911e2511c29204a857de71a@54.252.202.130:16789";
                // return "enode://b6c8c9f99bfebfa4fb174df720b9385dbd398de699ec36750af3f38f8e310d4f0b90447acbef64bdf924c4b59280f3d42bb256e6123b53e9a7e99e4c432549d6@192.168.9.76:26790";
                break;
            case 4:
                return "enode://fb886b3da4cf875f7d85e820a9b39df2170fd1966ffa0ddbcd738027f6f8e0256204e4873a2569ef299b324da3d0ed1afebb160d8ff401c2f09e20fb699e4005@3.121.115.180:16789";
                // return "enode://97e424be5e58bfd4533303f8f515211599fd4ffe208646f7bfdf27885e50b6dd85d957587180988e76ae77b4b6563820a27b16885419e5ba6f575f19f6cb36b@192.168.9.76:26791";
                break;
        }
  }
  //初始化测试网络
  initNet(){
	  return new Promise((resolve, reject)=>{
          //初始化创世区块
          let _this = this,
              userDataPath = Settings.userDataPath+'net_test/',
              hasInit = fs.readFileSync(`${userDataPath}init`,{encoding:'utf8'});
          console.warn('hasInit',hasInit,hasInit==1);
          if(hasInit==1){
              resolve();
          }else{
              console.log('initNet');
              var chainProc = spawn.exec(`platon --datadir ${userDataPath}data init ${userDataPath}data/platon.json`, {
                  cwd: _this.getExePath(),
                  encoding: 'arrayBuffer'
              }, function (error, stdout, stderr) {
                  if(!error){
                      //删除之前链上发起的存在本地的交易
                      store.dispatch('deleteTxn');
                      fs.writeFileSync(`${Settings.userDataPath}net_test/init`,1);
                      resolve();
                  }else{
                      alert(window.vueVm.$i18n.t('wallet.initFailed'))
                      console.log('init net error',error);
                      reject();
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
      });

  }
  //连接主网络或测试网络
    conncetNet(type){
        return new Promise((resolve, reject)=>{
            this.initNet().then(()=>{
                this.stop('_connect').then(()=>{
                    //启动主节点
                    console.log('conncetNet-->startMainNode--->',type);
                    let _this = this,
                        userDataPath = Settings.userDataPath+'net_'+type+'/',
                        nodeId = this.getTestNode();
                    console.log('nodeId',nodeId);
                    var conncetProc = spawn.exec(`platon -identity "platon" --rpc --datadir ${userDataPath}data --rpcaddr 0.0.0.0 --port 26793 --rpcport 7793 --rpcapi "db,eth,net,web3,miner,admin,personal" --verbosity 0 --bootnodes=${nodeId} --miner.etherbase 0x1b8d5ee48ef3eb772f32f45908935210930a3ee5  --wasmlog wasm.log console \n`, {
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
            }).catch(()=>{
                reject();
            });

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
