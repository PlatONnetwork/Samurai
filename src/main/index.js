import { nativeImage, app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu } from 'electron'
import god from './god'
import fs from 'fs';
import path from 'path';
import os from 'os';
const {
	exec
} = require('child_process');

clearCache(); //清理缓存。不然很坑爹

if(process.env.NODE_ENV !== 'development') {
	global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
	//autoRunDriver();
}
// 保持一个对于 window 对象的全局引用，如果你不这样做，
// 当 JavaScript 对象被垃圾回收， window 会被自动地关闭
let mainWindow, tray = null;

const exePath = app.getPath('exe'),
	winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`,
	iconPath = process.env.NODE_ENV === 'development' ?`./static/images/48x48.png` :path.join(exePath, '..', '48x48.png'),
	config = process.env.NODE_ENV === 'development' ?`./static/json/config.json` :	path.join(exePath, '..', 'config.json');

const setConfig=()=> {
		fs.readFile(configPath,'utf8', (err,data) => {
			console.log('setConfig',err,data)
			if (!err && data) {
				try {
					data = JSON.parse(data);
				} catch (error) {
					console.warn(error);
				}
				if (data.logUrl) {
					god.app.setAppInfo({
						logUrl: data.logUrl
					});
					console.log(god.app.data)
				}

			} else {
				console.warn(err);
			};
		})
	}
function createWindow() {
    // 创建浏览器窗口。
    mainWindow = new BrowserWindow({
        width: 980,
        height: 672,
        minWidth: 980,
        minHeight: 672,
        useContentSize: true,
        iconNativeImage: iconPath,
        frame: false, //创建无边框窗口
        resizable: false, //改变窗口size
        webPreferences: {
            webSecurity: false
        }
    });

    // 加载应用的 index.html
    mainWindow.loadURL(winURL);

    // 打开开发者工具。
    // mainWindow.webContents.openDevTools();

    // 当 window 被关闭，这个事件会被触发。
    mainWindow.on('closed', () => {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        mainWindow = null
    })

    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([

        {
            label: "打开面板",
            click() {
                mainWindow.show()
            }
        },
        {
            label: "退出",
            role: "quit"
        }
    ]);

    tray.setToolTip('PlatONWallet');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => { //双击显示
        mainWindow.show();
    })

    //注册开发者工具快捷键
    const retOpen = globalShortcut.register('CommandOrControl+F12', () => {
        BrowserWindow.getFocusedWindow().webContents.openDevTools({
            mode: 'undocked'
        });
    });
}
const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
	if(mainWindow) {
		if(mainWindow.isMinimized()) {
			mainWindow.restore();
		}

		if(!mainWindow.isVisible()){
			mainWindow.show();
		}
		mainWindow.focus();
	}
})

if(shouldQuit) {
	app.quit();
}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow);


// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
	// 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
	// 否则绝大部分应用及其菜单栏会保持激活。
	if(process.platform !== 'darwin') {
		app.quit()
	}
});

app.on('activate', () => {
	// 在这文件，你可以续写应用剩下主进程代码。
	// 也可以拆分成几个文件，然后用 require 导入。
	if(mainWindow === null) {
		createWindow()
	}
});

//注册协议
app.setAsDefaultProtocolClient('PlatONnetwork');

//最小化
ipcMain.on('hide-window', () => {
	mainWindow.hide();
});

//最小化
ipcMain.on('minimize-window', () => {
	mainWindow.minimize();
});

//最大化
ipcMain.on('maximize-window', () => {
	mainWindow.maximize()
});

//还原
ipcMain.on('orignal-window', () => {
	mainWindow.unmaximize();
	// mainWindow.restore()
});

ipcMain.on('ondragstart', (event, filePath) => {
	event.sender.startDrag({
	  file: filePath,
	//   icon: '/path/to/icon.png'
	})
})

//dapp通讯
ipcMain.on('event', (event, plugin, method, argsStr, callbackID, ability) => {
	console.log(plugin, method, argsStr, callbackID, ability);
	if(god[plugin]&&god[plugin][method]){
		god[plugin][method](argsStr, (agrs) => {
			console.log('callbackID,agrs', callbackID, agrs)
			event.sender.send('callback', callbackID, agrs);
		});
	}else{
		const msg=`${plugin}==>${method} is not undefined`;
		console.warn(msg);
		event.sender.send('callback', callbackID, {
			code:-1,
			data:'',
			msg:msg,
		});
	};

})

//dapp通讯
ipcMain.on('setPhDev', (event, hDev) => {
	god.wallet.data.hDev = hDev;
	console.log('hDev', god.wallet.data.hDev);
})

function clearCache() {
	let path = app.getPath('appData') + '/Electron/Cache',
		files = [];
	if(fs.existsSync(path)) {
		files = fs.readdirSync(path);
		files.forEach(function(file, index) {
			fs.unlinkSync(path + "/" + file);
		});
	}
}

//安装驱动
function autoRunDriver() {
	var driverPath = path.join(app.getPath('exe'), '..', 'JuZhenUSBKeyDriver_WD.exe');
	var driverflagPath = path.join(app.getPath('exe'), '..', 'install_driver');
	var needInstall = fs.existsSync(driverflagPath);

	console.log('autoRunDriver', driverPath, needInstall);

	if(needInstall) {
		exec(driverPath, (error, stdout, stderr) => {
			if(error) {
				console.error(`exec error: ${error}`);
			} else {
				fs.unlink(driverflagPath, function(err) {
					if(err) {
						throw err;
					}
					console.log('重新安装驱动成功，现在重启electron', `stdout: ${stdout}`, `stderr: ${stderr}`);
					app.relaunch({
						args: process.argv.slice(1).concat(['--relaunch'])
					})
					app.exit(0)
				})
			}
		});
	}
}

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
*/
