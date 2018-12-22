//
//  key.js
//  <project>
//  钱包管理
//  key-manager的git url:http://192.168.9.66/Juzix-ethereum/key-manager/tree/develop
//  Created by yann_liang on 2017-08-02.
//  Copyright 2017 yann_liang. All rights reserved.
//
/*
 * 错误码
 *
 * 1.
 * 2.
 * 3.密码不能为空
 * 4.不支持的type类型
 * 5.初始密码，请修改
 * 6.用户名不能为空
 * 7.用户名和密码不能为空
 * 8.密码错误
 *
 */

import ContractServies from './contract-servies'
import { ipcRenderer } from 'electron'

const KeyManager = require('key-manager'),
	{
		dialog
	} = require('electron').remote,
	util = require("console-utility"),
	EthereumTx = require('ethereumjs-tx');
console.log(KeyManager)
//文件过滤
const FILE_FILTERS = [{
		name: 'Json',
		extensions: ['json']
	},
	{
		name: 'All Files',
		extensions: ['*']
	}
];

/*
 * 钱包类
 */
class Key {
	constructor() {
		this.path = ''; //钱包默认保存的路径
		this.keyObject = {}; //钱包对象
		this.keyList = []; //钱包对象列表
		this.privateKey = ''; //钱包私钥
		this.type = ''; //文件证书类型 1软件证书 2U-key
		this.version = '0.0.2';
		this.loginFlag = false;
		this.userId = '';
		this.uuid = '';
		this.password = "";
		this.uKey = {
			phDev: '', //设备句柄
			dwPinType: 1, //PIN类型 0：管理员PIN，1：用户PIN
			showData: "我爱 this world 呵呵哒",
		}

	}

	/*
	 * 创建钱包对象
	 * username 用户名
	 * password 密码
	 * successCB 成功回调 可选
	 * errorCB 失败回调 可选
	 */
	createKey(account,username, password, successCB, errorCB) {
		let keyObject = KeyManager.createKey(account,username, password);

		successCB && successCB(keyObject);

		return keyObject;

	}
	/*
	 * 生产钱包文件
	 * keyObject 钱包对象
	 * successCB 成功回调 可选
	 * errorCB 失败回调 可选
	 */
	createFile(keyObject, successCB, errorCB) {
		KeyManager.exportToFile(keyObject, this.path, '', false,(errorCore, outpath) => {
			if(!errorCore) {
				successCB && successCB(keyObject, outpath);
			} else {
				errorCB && errorCB();
			}
		});

	}
	/*
	 * 获取用户公钥
	 */
	getPublicKey() {
		if(this.type == 1) {
			return KeyManager.getPublicKey(this.privateKey);
		} else if(this.type == 2) {
			return KeyManager.ukeyECCGetPubKey(this.uKey.phDev).pbPubKey;
		}
	}

	/*
	 * 获取用户列表
	 * type 文件证书类型 1软件证书 2U-key
	 * successCB(usernameList) 成功回调 返回用户名列表
	 * errorCB 失败回调
	 */
	getUserList(type, successCB, errorCB) {

		if(type == 1) {
			//回调的有问题 用同步
			//this.keyList = KeyManager.importFromDir(this.path);
			KeyManager.importFromDir(this.path, (code, keyList) => {
				this.keyList = keyList;
				let usernameList = keyList.map(function(item, index, input) {
					return item.account;
				});

				successCB && successCB(usernameList);
			})

		} else if(type == 2) {
			const result = KeyManager.ukeyEnumDevice()
			if(result.err == 0) {
				successCB && successCB(result.pbNameList);
			} else {
				errorCB && errorCB(result.err);
			}

		} else {
			errorCB && errorCB(4, '不支持的type类型');
		}
	}

	/*
	 * 登录
	 * username 用户名
	 * password 密码
	 * type 文件证书类型 1软件证书 2U-key
	 * successCB 成功回调 可选
	 * errorCB(errorCode,msg) 失败回调 可选
	 */
	login(username, password, type, successCB, errorCB) {
		console.log(type);
		this._updateKeyList();
		if(username && password) {
			if(type == 1) {
				let keyObject = null;
				for(let i = 0; i < this.keyList.length; i++) {
					if(this.keyList[i].account == username) {
						keyObject = this.keyList[i];
						break;
					}
				}
				KeyManager.recover(password, keyObject, (errorCore, privateKey) => {
					console.log(errorCore, privateKey)
					if(!errorCore) {
						this.privateKey = privateKey;
						this.keyObject = keyObject;
						this.type = 1;
						this.uuid = username;
						this.password = password;
						//发给主进程
						ipcRenderer.send('event', 'user', 'setUserInfo', {
							address: keyObject.address,
							uuid: keyObject.account,
							privateKey: privateKey,
							type: 1,
							password: password,
						});

						//设置钱包私钥
						ContractServies.setPrivateKey(privateKey);
						successCB && successCB();
					} else {
						errorCB && errorCB();
					}
				});
			} else if(type == 2) {
				/*ipcRenderer.send('event', 'wallet', 'login', {
					username: username,
					password: password,
					type: type,
				},'login999');
				ipcRenderer.on('callback',(event,callbackId,res)=>{
					console.log(callbackId,res)
					if(res.code == 0) {
						successCB && successCB();
					} else {
						errorCB && errorCB(res.code, '');
					}
				})*/

				KeyManager.ukeyOpenDevice(username, (errorCode, res) => {
					console.log('创建USBKEY设备上下文并打开USBKEY设备', res);
					this.type = 2;
					if(errorCode == 0) {
						console.log(errorCode, res);
						//保存句柄
						this.uKey.phDev = res.phDev;

						KeyManager.ukeyVerifyPin(res.phDev, this.uKey.dwPinType, password, (errorCode, res1) => {
							console.log(errorCode, res1)
							if(errorCode == 0) {
								//判断是否是初始PIN
								KeyManager.ukeyIsDefaultPin(res.phDev, this.uKey.dwPinType, (errorCode, res2) => {
									console.log('ukeyVerifyPin', errorCode, res2);
									if(res2.pbDefaultPin) {
										console.log(errorCode)
										errorCB && errorCB(5, '初始密码，请修改');
									} else {
										this.uuid = username;
										this.password = password;
										//发给主进程
										ipcRenderer.send('event', 'user', 'setUserInfo', {
											address: KeyManager.ukeyECCAddress(res.phDev).address,
											uuid: username,
											privateKey: '',
											type: 2,
											password: password,
										});

										ipcRenderer.send('setPhDev', res.phDev);
										successCB && successCB();
									}

								})

							} else if(errorCode == -5 || errorCode == -8) {
								errorCB && errorCB(8, res1.pdwRetryCount);//密码错误 错误码 重试次数
							} else {
								errorCB && errorCB(errorCode, '异常');
							}

						})
					} else {

						errorCB && errorCB(errorCode, '异常');
					}
				})
			} else {
				errorCB && errorCB(4, '不支持的type类型');
			}
		} else if(!username && !password) {
			console.warn('用户名和密码不能为空');
			errorCB && errorCB(7, '用户名和密码不能为空');
		} else
		if(!username) {
			console.warn('用户名不能为空');
			errorCB && errorCB(6, '用户名不能为空');
		} else if(!password) {
			console.warn('密码不能为空');
			errorCB && errorCB(3, '密码不能为空');
		}

	}

	/*
	 * 导出文件
	 * successCB 成功回调 可选
	 * errorCB 失败回调 可选
	 */
	exportFile(successCB, errorCB) {
		dialog.showSaveDialog({
			filters: FILE_FILTERS
		}, (filename) => {
			console.log(filename)
			const index = filename.lastIndexOf('\\'),
				path = filename.substr(0, index),
				name = filename.substr(index, filename.length);
			console.log('path=', path, 'name=', name)
			KeyManager.exportToFile(this.keyObject, path, name, false,(errorCore, outpath) => {
				console.log('outpath', errorCore, outpath);
				if(!errorCore) {
					successCB && successCB(outpath);
				} else {
					errorCB && errorCB();
				}
			});
		});
	}

	/*
	 * 导入文件 不需要输入密码
	 * successCB 成功回调 可选
	 * errorCB 失败回调 可选
	 */
	importFile(keyObject, successCB, errorCB) {
		console.log('现在正在开始导入文件')
		KeyManager.exportToFile(keyObject, this.path, keyObject.account + '.json',false, (errorCore, files) => {
			console.log('现在正在开始导入文件返回的是：')
			console.log(errorCore, files)
			if(!errorCore) {
				//获取最新的钱包对象[]
				this._updateKeyList();
				successCB && successCB();
			} else {
				errorCB && errorCB(errorCore);
			}
		});
	}

	/*
	 * 待定
	 */
	getKeyObjectOfPath(successCB, errorCB) {
		dialog.showOpenDialog({
			filters: FILE_FILTERS,
			//批量导入用
			/*properties:['openFile','openDirectory']*/
		}, (filenames) => {
			//单个导入，取第一个
			const filePath = filenames[0];
			KeyManager.importFromFilePath(filePath, function(errorCore, keyObject) {
				if(!errorCore) {
					/*console.log(keyObject)
					this.keyList = keyObject;
					console.log(this.keyList)
					let usernameList = [];
					for(let i = 0; i < keyObjects.length; i++) {
						usernameList[i] = keyObjects[i].id;
					}*/
					successCB && successCB(filePath, keyObject);
				} else {
					errorCB && errorCB();
				}
			});

		});
	}

	/*
	 * 重置密码
	 *
	 *
	 * type 类型
	 * successCB 成功回调 可选
	 * errorCB 失败回调 可选
	 *
	 */
	resetPassword(username, newPassword, oldPassword, type, successCB, errorCB) {
		type = type || this.type;
		if(type == 1) {
			let keyObject = null;
			//找出相应的钱包
			for(let i = 0; i < this.keyList.length; i++) {
				if(this.keyList[i].account == username) {
					keyObject = this.keyList[i];
					break;
				}
			};

			//重置相应钱包的密码
			KeyManager.resetPassword(oldPassword, newPassword, keyObject, (errorCore, newKeyObject) => {
				if(!errorCore) {
					//将新的钱包保存到默认目录
					KeyManager.exportToFile(newKeyObject, this.path, '',true, (errorCore, outpath) => {
						console.log(errorCore, outpath)
						if(!errorCore) {
							//获取最新的钱包对象[]
							this._updateKeyList();
							successCB && successCB(outpath);
						} else {
							errorCB && errorCB();
						}
					});
				} else {
					errorCB && errorCB();
				}
			});
		} else if(type == 2) {
			let phDev = this.uKey.phDev ? this.uKey.phDev : KeyManager.ukeyOpenDevice(username).phDev;
			console.log(phDev, this.uKey.dwPinType, oldPassword, newPassword);
			KeyManager.ukeyChangePin(phDev, this.uKey.dwPinType, oldPassword, newPassword, (errorCode, res) => {
				console.log(res)
				if(errorCode == 0) {
					successCB && successCB();
				} else {
					errorCB && errorCB(errorCore, '异常');
				}
			})
		}

	}

	importFromAccount(accout,successCB, errorCB){
		KeyManager.importFromAccount(accout,this.path,(errorCode,keyObject)=>{
			console.log('fdasfsafasa====>'+errorCode);
			if(errorCode==0){
				successCB&&successCB(keyObject);
			}else{
				errorCB&&errorCB(errorCode);
			}
		})
	}

	/*
	 * 设置钱包的属性，属性值
	 * key 属性
	 * value 值
	 */
	setWallet(key, value) {
		this.keyObject[key] = value;
		//写入文件
		KeyManager.exportToFile(this.keyObject, this.path, '',true);
		//更新钱包对象列表
		this._updateKeyList();
	}

	/*
	 * 解出用户私钥
	 * password 密码
	 * keyObject钱包对象
	 * successCB
	 * errorCB
	 */
	recover(password, keyObject, successCB, errorCB) {
		console.log(password, keyObject)
		KeyManager.recover(password, keyObject, (errorCore, privateKey) => {
			this.uuid = keyObject.account;
			console.log(errorCore, privateKey);
			if(!errorCore) {
				this.privateKey = privateKey;
				this.keyObject = keyObject;
				//设置钱包私钥
				ContractServies.setPrivateKey(privateKey);
				successCB && successCB();
			} else {
				errorCB && errorCB();
			}
		});
	}

	/*
	 * 获取地址
	 */
	getAddress() {
		if(this.type == 1) {
			return this.keyObject.address;
		} else if(this.type == 2) {
			return KeyManager.ukeyECCAddress(this.uKey.phDev).address;
		} else {
			return '';
		}
	}

	/*
	 * 签名
	 */
	sign(rawTx, successCB, errorCB) {
		if(this.type == 1) {
			const tx = new EthereumTx(rawTx);
			let privateKey = Buffer.from(this.privateKey, 'hex');
			tx.sign(privateKey);

			const serializedTx = tx.serialize();
			let serializedTxHex = "0x" + serializedTx.toString('hex');
			successCB && successCB(serializedTxHex);
		} else if(this.type == 2) {
			ipcRenderer.send('event', 'wallet', 'sign', rawTx, 'signFromExe');
			ipcRenderer.on('callback', (event, callbackId, res) => {
				console.log(callbackId, res)
				if(callbackId == 'signFromExe' && res.code == 0) {
					successCB && successCB(res.data);
				} else {
					errorCB && errorCB(res.code, '');
				}
			})
			/*util.rlp(rawTx, (errorCore, res) => {
				if(errorCore === 0) {
					console.log('rlp', errorCore, res, this.getAddress());

					KeyManager.ukeyECCSign(this.uKey.phDev, res, this.uKey.showData, (errorCore, res2) => {
						console.log('ukeyECCSign', errorCore, res2)
						if(errorCore === 0) {
							successCB && successCB(res2.pbSignRlp);
						}
					})
				}
			})*/

			//return ;
		} else {
			return '';
		}
	}

	/*
	 * 改变用户登录状态
	 *
	 */
	changeUserId(userId) {
		this.userId = userId;
	}

	/*
	 * 判断用户是否登录
	 */
	getUserId() {
		return this.userId;
	}

	/*
	 * 改变用户登录状态
	 *
	 */
	changeLoginStatus(bool) {
		this.loginFlag = bool;
	}

	/*
	 * 判断用户是否登录
	 */
	isLogin() {
		return this.loginFlag;
	}

	/*
	 * 私有的 更新钱包对象列表
	 */
	_updateKeyList() {
		this.keyList = KeyManager.importFromDir(this.path);
		console.log('软件证书列表', this.keyList)
	}

}

export default new Key;
