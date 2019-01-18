
//引入web3
let Web3 = require('web3'),
    fs = require('fs'),
    path = require('path'),
    Tx = require('ethereumjs-tx');
const net = require('net');
import nodeManager from '@/services/node-manager';

//是否为数组
const isArray = (o) => {
		return Object.prototype.toString.call(o) === '[object Array]';
	},
	isJson = (obj) => {
		let isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
		return isjson;
	},
	dealArgumentList = (argumentList) => {
		let result = argumentList.map(function(item, index, input) {
			if(isJson(item)) {

				return JSON.stringify(item);
			}
			return item;
		});
		return result;
	},
	dealData = (str) => {
		const code = parseInt(str.substr(2, 64), 16),
			start = parseInt(str.substr(66, 64), 16),
			dataLength = parseInt(str.substr(130, 64), 16) * 2,
			data = str.substr(194, dataLength);
		if(dataLength % 2 == 0) { //当输入够偶数位；
			var StrHex = "";
			for(var i = 0; i < dataLength; i = i + 2) {
				var str = data.substr(i, 2); //16进制；

				var n = parseInt(str, 16); //10进制；
				StrHex = StrHex + String.fromCharCode(n);
			}
		}
		// console.log('code==', code, 'data==', data);
		return {
			code: code,
			data: StrHex,
		}
	}

//合约类
class ContractServies {

	constructor() {
		this.web3 = null;
		// this.provider = localStorage.getItem('chainInfo') ? JSON.parse(localStorage.getItem('chainInfo')).url : 'http://10.10.8.42:6789'; //节点地址18
		this.privateKey = ''; //用户私钥
		this._contracts = {}; //所有的合约
		this.callbacks = {}; //存放sendRawTrasaction回调函数
		this.wrapCount = 60; //轮询次数
		this.timeout = 60; //超时时间
		this.isConnected = false; //连接状态
        this.calcContract = '';
        this.appContractAddress='0x1000000000000000000000000000000000000001';
	}

    /**
     * 根据不同场景获取ABI
     * @param type  1,共享钱包合约
     */
	getABI(type){
        let filePath=this.getFilePath();
        // console.log('getFilePath-----',this.getFilePath());
	    switch(type){
            case 1:
                return JSON.parse(fs.readFileSync(`${filePath}/multisig.cpp.abi.json`,'utf8'));
                break;
            case 2:
                return JSON.parse(fs.readFileSync(`${filePath}/candidateConstract.json`,'utf8'));
                break;
        }
    }
    /**
     * 根据不同场景获取BIN
     * @param type  1,共享钱包合约
     */
    getBIN(type){
        let filePath=this.getFilePath();
        // console.log('getFilePath-----',this.getFilePath());
        switch(type){
            case 1:
                return fs.readFileSync(`${filePath}/multisig.wasm`);
                break;
        }
    }

	setProvider(url,mode,netType,chainName) {
		return new Promise((resolve,reject)=>{
            let ipcNode = nodeManager.getipcNode(netType,chainName);
            if(mode=='ipc'){
                try {
                    const client = net.Socket();
                    // const ipcNode = '\\\\.\\pipe\\platon.ipc';
                    const web3 = new Web3(new Web3.providers.IpcProvider(ipcNode, client));
                    this.web3 = web3;
                    this.isConnected = true;
                    // this.calcContract = this.web3.eth.contract(DEFAULT_ABI);
                    resolve();
                } catch(e) {
                    this.isConnected = false;
                    reject(e);
                }
            }else{
                this.provider = url;
                try {
                    // console.warn('url-->',url);
                    this.web3 = new Web3(new Web3.providers.HttpProvider(this.provider));
                    // this.initRegisterContract();
                    // console.warn(this.web3.eth.blockNumber);
                    this.isConnected = this.web3.isConnected();
                    resolve();
                } catch(e) {
                    this.isConnected = false;
                    reject(e);
                }
            }
		});
	}

    isConnected(){
		return this.isConnected
	}

	setTimeout(time) {
		this.timeout = time;
	}

	/*
	 * 获取节点地址
	 */
	getProvider() {
		return this.provider;
	}

    /**
	 * 部署合约
     * @param ABI  合约ABI
     * @param BIN  合约BIN
     * @param from  发起方
     * @param privateKey  发起方私钥
     * @param gas
     * @param gasPrice
     * @returns {Promise<any>}
     */
	platONDeploy(ABI,BIN,from,privateKey,gas,gasPrice) {
		return new Promise((resolve, reject)=>{
			// console.log(`--deploy start--`,ABI,BIN,from,privateKey);
            this.calcContract = this.web3.eth.contract(ABI);
            // const platONData = this.calcContract.new.getPlatONData(BIN);
            const platONData = this.calcContract.new.getPlatONData(BIN);
            console.log('platONData:', gasPrice);
			this.web3.eth.getTransactionCount(from, (err, data) => {
				// console.warn('getTransactionCount', err, data);
				if (err) {
					throw err;
				}
				const number = data.toString(16);
				const params = {
					nonce: '0x' + number,
                    "gas": gas?(this.web3.toHex(gas)):"0x766709",
                    "gasPrice": gasPrice?(this.web3.toHex(gasPrice)):"0x8250de00",
					data: platONData,
					from: from,
					value: '0x0'
				};
				console.warn(params);
				let tx = new Tx(params);
				// console.log('tx-->', tx);
				tx.sign(privateKey);

				let serializedTx = tx.serialize();
				this.calcContract.deploy('0x' + serializedTx.toString('hex'),(err, myContract)=>{
					// console.log('myContract', myContract, err);
                    if(!err){
                        resolve({hash:myContract.transactionHash});
                    }else{
                        reject(err);
                    }

				});
			})
		});
    }

    /**
	 * 合约sendRowTracsaction调用
     * @param ABI 合约ABI
     * @param funName 方法名
     * @param contractAddress  合约地址
	 * @param _params 入参
	 * @param _from 发起方
	 * @param privateKey 发起方私钥
     */
    platONSendTransaction(ABI,contractAddress,funName,_params,_from,privateKey,gas,gasPrice,value,async,tradetype) {
        return new Promise((resolve, reject)=>{
            console.log(`--platONSendTransaction start--`,ABI,contractAddress,funName,_params,_from,privateKey,gas,gasPrice,value);
            console.log(`--platONSendTransaction start--,gas--`,gas);
            console.log(`--platONSendTransaction start--gasPrice--`,gasPrice);
            const MyContract = this.web3.eth.contract(ABI);
            const myContractInstance = MyContract.at(contractAddress);
            console.log('MyContract---->',myContractInstance);
            let params1 = JSON.parse(_params);
            console.log('params1---->',params1);
            console.log('tradetype---->',tradetype);
            const platOnData = myContractInstance[funName].getPlatONData(...params1,{
                transactionType:tradetype?tradetype:2
            });
            console.warn('platOnData--->',platOnData);
            this.web3.eth.getTransactionCount(_from, (err, data) => {
                // console.warn('getTransactionCount', err, data);
                if (err) {
                    throw err;
                }

                const number = data.toString(16);
                const params = {
                    nonce: '0x' + number,
                    // nonce: '0x' + 999,
                    "gas": gas?(this.web3.toHex(gas)):"0x766709",
                    "gasPrice": gasPrice?(this.web3.toHex(gasPrice)):"0x8250de00",
                    data: platOnData,
                    from: _from,
                    to: myContractInstance.address,
                    value: value?(this.web3.toHex(this.web3.toWei(value, 'ether'))):"0x0",
                    // value: value?(Number(this.web3.toWei(value, 'ether'))):0,
                };
                console.log(`testTransfer params:\n`, JSON.stringify(params));
                let tx = new Tx(params);
                console.log('tx-->', tx);
                tx.sign(privateKey);
                let serializedTx = tx.serialize();
                console.log('0x' + serializedTx.toString('hex'));
                this.web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'),(err, hash)=>{
                    console.log(err,hash);
                    if(!async){
                        if(!err){
                            resolve({hash:hash});
                        }else{
                            if(err.toString().indexOf('insufficient funds for gas * price + value')!==-1){
                                window.vueVm.$message.warning(window.vueVm.$i18n.t('wallet.cannotTrans2'));
                            }
                            reject({err:err});
                        }
                    }else{
                        if (!err){
                            console.log(`platONSendTransaction hash:`, hash);
                            this.getTransactionReceipt(hash, (code, data) => {
                                console.log('sendRawTransaction code==', code,data);
                                if(code==1000){
                                    reject('超时');
                                }
                                if(data.logs && data.logs.length>0){
                                    const result = myContractInstance.decodePlatONLog(data.logs[0]);
                                    console.log('sendRawTransaction result==', result);
                                    resolve({hash:hash,result:result});
                                }else{
                                    resolve({hash:hash});
                                }
                            })
                        }else {
                            if(err.toString().indexOf('insufficient funds for gas * price + value')!==-1){
                                window.vueVm.$message.warning(window.vueVm.$i18n.t('wallet.cannotTrans2'));
                            }
                            reject(err);
                        }
                    }
                });
            })
        });

    }

    /**
     * 合约call调用
     * @param ABI  合约ABI
     * @param contractAddress
     * @param funName  要调用的方法名
     * @param _from  发起方
     * @param params  funName的入参
     */
    platONCall(ABI,contractAddress,funName,_from,params) {
        console.log('--platONCall --', ABI,contractAddress,funName,_from,params);
        return new Promise((resolve, reject)=>{
            params = params?params:[];
            const MyContract = this.web3.eth.contract(ABI);
            const contract = MyContract.at(contractAddress);
            console.log('--platONCall start--', contract);
            if (!contract) throw new Error(`contract 不能为空`);
            const data = contract[funName].getPlatONData(...params);
            // console.log({
            //     from: _from,
            //     to: contractAddress,
            //     data: data
            // });
            this.web3.eth.call({
                from: _from,
                to: contractAddress,
                data: data
            },(err,result)=>{
                console.log('--platONCall result--',err,result);
                if(err){
                    // console.error(err);
                    reject(err);
                }
                let decodeObj = contract.decodePlatONCall(result,funName);
                console.log('--platONCall result decode--',funName,'----',decodeObj);
                resolve(decodeObj.data);
            });
        });

    }


    /**
	 * 通过web3发送交易
     * @param from  发起方
     * @param to    接收方
     * @param value   金额（number类型）
     * @param priKey  发起方私钥（buffer类型）
     * @param input   data
     * @param gas
     * @param gasPrice
     * @param cb
     */
    sendTransaction(from,to,value,priKey,input,gas,gasPrice,cb){
		console.warn('sendTransaction-->',from,to,value,priKey,input,gas,gasPrice);
        //_from为发起交易的地址
        var _from = from;
        //nonce随机数，这里取该账号的交易数量
        var number;
        this.web3.eth.getTransactionCount(_from,(err,data)=>{
        	// console.warn('getTransactionCount',err,data);
        	if(err){
        		throw err;
			}
            number = data.toString(16);
            var privateKey = new Buffer(priKey, 'hex');

            var rawTx = {
                nonce: '0x'+number,//随机数
                // gas:'0x'+90000,
				gas:this.web3.toHex(gas),
                // gasPrice:'0x'+((gasPrice).toString(16)),
                gasPrice:this.web3.toHex(gasPrice),
                to: to,//接受方地址或者合约地址
                value: '0x'+((value).toString(16)),
                data: '0xc9880000000000000000'
            };
            try{
                //使用私钥对原始的交易信息进行签名，得到签名后的交易数据
                console.warn('rawTx',rawTx);
                var tx = new Tx(rawTx);
                tx.sign(privateKey);

                var serializedTx = tx.serialize();
                console.log('0x' + serializedTx.toString('hex'));
                this.web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
                    if (!err){
                        console.log('sendRawTransaction---->',err,hash);
                        cb(0,hash);
                    }else {
                        if(err.toString().indexOf('insufficient funds for gas * price + value')!==-1){
                            window.vueVm.$message.warning(window.vueVm.$i18n.t('wallet.cannotTrans2'));
                            cb(2,err);
                            return;
                        }
                        cb(1,err);
                    }
                });
			}catch(e){
                cb(1,err);
			}
		})
	}

	/*
	 * 观察
	 * contractName 合约名  来源：合约开发文档/合约代码
	 * eventName 事件名  来源：合约开发文档/合约代码  问过吴wei妹子 默认为'Notify' 看返回参数是几个
	 * hash 哈希   来源：调用sendRawTrasaction获得的hash
	 * cb 回调函数
	 */
	watchEvent(contractName, eventName = 'Notify', hash, cb) {
		// console.log('watchEvent==>', contractName, eventName);

		setTimeout(() => { //合约有点慢 等一下
			const contractInstance = this.getContract(contractName).contract;
			//创建合约事件
			let MyEvent = contractInstance[eventName]({
				_info: contractInstance.address
			}, {
				fromBlock: 0,
				toBlock: 'latest'
			});
			MyEvent.watch(function(errorCode, result) {
				if(result.transactionHash == hash) {
					MyEvent.stopWatching();
					let code = '';
					//合约返回不统一  要判断error/errno
					if(result.args._error !== undefined) {
						//错误码
						code = Number(result.args._error);
					} else {
						//错误码
						code = Number(result.args._errno);
					}
					// console.log(contractName + ' ' + eventName + '@result==》', code, result.args._info);
					cb && cb(code, result.args._info);
				}
			});
		}, 1000);

	}

    /**
	 * 获取已完成的交易信息
     * @param hash  交易hash
     * @param fn
     */
    getTransactionReceipt(hash, fn) {
        console.log('getTransactionReceipt hash==>', hash);
        let id = '',data = {},wrapCount=100;
        this.web3.eth.getTransactionReceipt(hash,(err,result)=>{
            if(err) throw err;
            console.log(`result:`, result);
            if (result && result.transactionHash && hash == result.transactionHash) {
                clearTimeout(id);
                if (result.logs.length != 0) {
                    // console.log('sendRawTrasaction result==>', data);
                    fn(0, result);
                    // delete fn;
                } else {
                    fn(1001, '合约异常，失败');
                }
            } else {
                if (wrapCount--) {
                    id = setTimeout(() => {
                        this.getTransactionReceipt(hash, fn);
                    }, 1000);
                } else {
                    fn(1000, '超时');
                    // console.warn('sendRawTrasaction超时');
                    clearTimeout(id);
                    // delete fn;
                }
            }
        })
    }



    getTransactionByHash(ABI,contractAddress,hash,fn){
        const MyContract = this.web3.eth.contract(ABI);
        const myContractInstance = MyContract.at(contractAddress);
        console.log('getTransactionReceipt hash==>', hash);
        this.web3.eth.getTransactionReceipt(hash,(err,result)=>{
            if(err) throw err;
            console.log(`result:`, result);
            if (result && result.transactionHash && hash == result.transactionHash) {
                if (result.logs.length != 0) {
                    const decodeLog = myContractInstance.decodePlatONLog(result.logs[0]);
                    // console.log('sendRawTrasaction result==>', data);
                    fn(0, decodeLog);
                    // delete fn;
                } else {
                    fn(1001, '合约异常，失败');
                }
            }
        })
    }


    getFilePath=() =>{
        // return "C:\\Users\\yann_liang\\AppData\\Local\\Programs\\console\\platon_exe"
        const app = require('electron').remote.app;
        return process.env.NODE_ENV === 'development' ? 'src/services/demo1' : path.join(app.getPath('exe'), '..', '/demo1');
    }


}

export default new ContractServies;
