'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import fs from 'fs'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import ChildProcess from 'child_process'
import YAML from 'yamljs'
import iconv from 'iconv'
const isDevelopment = process.env.NODE_ENV !== 'production'
const ipcMain = require('electron').ipcMain;
//const yaml = require("yamljs")
const path = require("path")
// 打开一个子进程
const myChildProccess = require('child_process');
var mySpawn = [];
// 收到消息, 打开进程
function handleGenerateRequest(e, msg) {
  console.log(process.env.NODE_ENV)
  const configPath = process.env.NODE_ENV === 'development' ? path.join(__dirname, '../src/assets/config.yaml') : path.join(process.cwd(), 'config.yml');
  const configFile = fs.readFileSync(configPath, 'utf-8');
  const config = YAML.parse(configFile);
  console.log(e);
  console.log(msg);
  const execStr = `${config['python_path']} ${config['t2p_path']}/main.py --text ${msg}`
  console.log(execStr)
  ChildProcess.exec('cd ' + config['t2p_path'] + ' ; ' + config['python_path'] + ' ' + config['t2p_path'] + 'main.py', {
    cwd: config['t2p_path']
  }, (error, stdout, stderr) => {
    // if (error) {
    //   console.error('error:', error);
    //   return;
    // }
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + iconv);
  })
  // var python = ChildProcess.spawn(config['python_path'], [config['t2p_path'] + '/demos/fp_optimization.py'], {
  //   cwd: config['t2p_path']
  // })
  // python.stdout.on('data', (data) => {
  //   console.log(`子进程输出:' ${data}`)
  // });
  // python.stderr.on('data', (data) => {
  //   console.log(`子进程error:' ${data}`)
  // });
  // python.on('exit', (code, signal) => {
  //   console.log('子进程退出:', `code ${code} and signal ${signal}`)
  // });
  e.sender.send('cs-reply', '打开进程:' + msg);
}
ipcMain.on('open-child-now', handleGenerateRequest); //(e, msg) => {
//   console.log('打开进程-->mainProcessGet:' + msg)
//   //var spawn = myChildProccess.spawn("C:\\Windows\\System32\\notepad.exe");// C:/Users/nickt/Desktop/1.py");//'C:\\Program Files\\Notepad++\\notepad++.exe'
//   mySpawn[mySpawn.length] = spawn;
//   handleGenerateRequest();
//   e.sender.send('cs-reply', '打开进程:' + msg);
// });

ipcMain.on('kill-child-now', (e, msg) => {
  console.log('关闭进程-->mainProcessGet:' + msg)
  e.sender.send('cs-reply', '正在关闭所有打开的应用')
  // 收到消息, 关闭所有进程
  for (var i = 0; i < mySpawn.length; i++) {
    mySpawn[i].kill();
  }
  mySpawn = [];
});
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 720,
    webPreferences: {

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,//process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: false,//process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
