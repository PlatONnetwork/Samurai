
import { app, ipcMain, BrowserWindow } from 'electron'
let consoleWin = null;

const god = {
	//用户
	user: {
		//存放数据
		data: {
			userInfo: {
				uuid: '',
				address: '', //userAddr
				publicKey: '',
				privateKey: '', //
				type: '',
			},
		},
		getUserInfo(args, cb) {
			cb({
				code: 0,
				msg: '',
				data: god.user.data.userInfo,
			})
		},
		setUserInfo(args, cb) {
			args.uuid ? god.user.data.userInfo.uuid = args.uuid : '';
			args.type ? god.user.data.userInfo.type = args.type : '';
			args.address ? god.user.data.userInfo.address = args.address : ''; //userAddr
			args.publicKey ? god.user.data.userInfo.publicKey = args.publicKey : '';
			args.privateKey ? god.user.data.userInfo.privateKey = args.privateKey : '';
			args.password ? god.user.data.userInfo.password = args.password : '';
		}
	},
	//应用信息
	app: {
		//存放数据
		data: {
			chainUrl: 'http://10.10.8.42:8080/blockchain-web',
			contractUrl: 'http://10.10.8.42:6789',
			logUrl:'http://192.168.9.92:9200/'
		},
		getAppInfo(args, cb) {
			cb({
				code: 0,
				msg: '',
				data: god.app.data,
			})
		},
		setAppInfo(args, cb) {
			for (var key in args) {
				if (args.hasOwnProperty(key)) {
					god.app.data[key] = args[key];

				}
			}
		},
		getPath(value,cb){
			const result=app.getPath(value);
			cb({
				code:0,
				msg:'',
				data:result,
			})
		},
		/*openConsole(args, cb) {
			if(consoleWin === null) {
				consoleWin = new BrowserWindow({
					width: 1200,
					height: 740,
					minWidth: 1200,
					minHeight: 600,
					useContentSize: true,
					frame: false, //创建无边框窗口
					resizable: false, //改变窗口size
					webPreferences: {
						webSecurity: false
					}
				});

				consoleWin.loadURL(args.url);
			} else {
				consoleWin.show();
			}

		}*/
	}
}

export default god;