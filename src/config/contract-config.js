// 
//  contract-config.js
//  <project>
//  合约的名字、abi、 通过合约文档或者看合约代码得到
//	合约的address部署后得到
//  Created by yann_liang on 2017-08-10.
//  Copyright 2017 yann_liang. All rights reserved.
// 

const CONTRACT_CONFIG = {
	metaCoin: {
		name: 'MetaCoin',
		abi: [{
				"constant": false,
				"inputs": [{
						"name": "by",
						"type": "uint256"
					},
					{
						"name": "_value",
						"type": "uint256"
					}
				],
				"name": "Notify3LongString",
				"outputs": [{
					"name": "_ret",
					"type": "bool"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": true,
				"inputs": [],
				"name": "getErrno",
				"outputs": [{
					"name": "",
					"type": "uint256"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": true,
				"inputs": [{
						"name": "by",
						"type": "uint256"
					},
					{
						"name": "_value",
						"type": "uint256"
					}
				],
				"name": "mutiplyByWithConstant",
				"outputs": [{
					"name": "resutl",
					"type": "uint256"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
						"name": "_str",
						"type": "string"
					},
					{
						"name": "_addr",
						"type": "address"
					}
				],
				"name": "log",
				"outputs": [],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
						"name": "by",
						"type": "uint256"
					},
					{
						"name": "_value",
						"type": "uint256"
					}
				],
				"name": "mutiplyByWithEvent",
				"outputs": [{
					"name": "_ret",
					"type": "bool"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
						"name": "_str",
						"type": "string"
					},
					{
						"name": "_i",
						"type": "int256"
					}
				],
				"name": "log",
				"outputs": [],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
						"name": "_name",
						"type": "string"
					},
					{
						"name": "_version",
						"type": "string"
					}
				],
				"name": "register",
				"outputs": [],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
					"name": "_str",
					"type": "string"
				}],
				"name": "log",
				"outputs": [],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [],
				"name": "kill",
				"outputs": [],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
						"name": "_str",
						"type": "string"
					},
					{
						"name": "_str2",
						"type": "string"
					}
				],
				"name": "log",
				"outputs": [],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
					"name": "a",
					"type": "uint256"
				}],
				"name": "multiply7",
				"outputs": [{
					"name": "d",
					"type": "uint256"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
						"name": "by",
						"type": "uint256"
					},
					{
						"name": "_value",
						"type": "uint256"
					}
				],
				"name": "mutiplyByWithEventReturn99",
				"outputs": [{
					"name": "_ret",
					"type": "bool"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [],
				"name": "clearLog",
				"outputs": [],
				"payable": false,
				"type": "function"
			},
			{
				"constant": true,
				"inputs": [],
				"name": "getSender",
				"outputs": [{
					"name": "_ret",
					"type": "string"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": true,
				"inputs": [{
						"name": "by",
						"type": "uint256"
					},
					{
						"name": "_value",
						"type": "uint256"
					}
				],
				"name": "callWithLongString",
				"outputs": [{
					"name": "result",
					"type": "string"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
						"name": "by",
						"type": "uint256"
					},
					{
						"name": "stringValue",
						"type": "string"
					}
				],
				"name": "mutiplyConcatString",
				"outputs": [{
					"name": "_ret",
					"type": "bool"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
					"name": "addr",
					"type": "address"
				}],
				"name": "getBalanceInEth",
				"outputs": [{
					"name": "",
					"type": "uint256"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
					"name": "result",
					"type": "string"
				}],
				"name": "justReturnWhatUGet",
				"outputs": [{
					"name": "_ret",
					"type": "bool"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": true,
				"inputs": [],
				"name": "getOwner",
				"outputs": [{
					"name": "_ret",
					"type": "string"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
						"name": "by",
						"type": "uint256"
					},
					{
						"name": "_value",
						"type": "uint256"
					}
				],
				"name": "mutiplyBy",
				"outputs": [{
					"name": "resutl",
					"type": "uint256"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
					"name": "_value",
					"type": "uint256"
				}],
				"name": "Notify1LongString",
				"outputs": [{
					"name": "_ret",
					"type": "bool"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": true,
				"inputs": [],
				"name": "getLog",
				"outputs": [{
					"name": "_ret",
					"type": "string"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
						"name": "receiver",
						"type": "address"
					},
					{
						"name": "amount",
						"type": "uint256"
					}
				],
				"name": "sendCoin",
				"outputs": [{
					"name": "sufficient",
					"type": "bool"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
						"name": "_str",
						"type": "string"
					},
					{
						"name": "_ui",
						"type": "uint256"
					}
				],
				"name": "log",
				"outputs": [],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
					"name": "obj",
					"type": "uint256"
				}],
				"name": "setStoreObj",
				"outputs": [{
					"name": "result",
					"type": "bool"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
					"name": "addr",
					"type": "address"
				}],
				"name": "getBalance",
				"outputs": [{
					"name": "",
					"type": "uint256"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"inputs": [],
				"payable": false,
				"type": "constructor"
			},
			{
				"anonymous": false,
				"inputs": [{
					"indexed": false,
					"name": "_info",
					"type": "string"
				}],
				"name": "Notify1",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [{
						"indexed": false,
						"name": "_errno",
						"type": "uint256"
					},
					{
						"indexed": false,
						"name": "_info",
						"type": "string"
					}
				],
				"name": "Notify",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [{
						"indexed": false,
						"name": "_errno",
						"type": "uint256"
					},
					{
						"indexed": false,
						"name": "_info",
						"type": "string"
					},
					{
						"indexed": false,
						"name": "_data",
						"type": "string"
					}
				],
				"name": "Notify3",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [{
						"indexed": true,
						"name": "_from",
						"type": "address"
					},
					{
						"indexed": true,
						"name": "_to",
						"type": "address"
					},
					{
						"indexed": false,
						"name": "_value",
						"type": "uint256"
					}
				],
				"name": "Transfer",
				"type": "event"
			}
		],
		address: '0x0c013b2c3678d628a01355b6fafce1115cd546d4',
	},

}

export default CONTRACT_CONFIG;