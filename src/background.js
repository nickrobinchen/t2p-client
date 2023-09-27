'use strict'

import { app, protocol, BrowserWindow, ipcRenderer } from 'electron'
import fs from 'fs'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import ChildProcess from 'child_process'
import YAML from 'yamljs'
import net from 'net'
import axios from 'axios'
const isDevelopment = process.env.NODE_ENV !== 'production'
const ipcMain = require('electron').ipcMain;
//const yaml = require("yamljs")
const path = require("path")

// const configPath = process.env.NODE_ENV === 'development' ? path.join(__dirname, '../src/assets/config.yaml') : path.join(process.cwd(), 'config.yaml');
// const configFile = fs.readFileSync(configPath, 'utf-8');
// const config = YAML.parse(configFile);

let engine_available = false;
let engine_img_path = '';
var ws, timer;
var msg = null;
var msg_received = false;
var sender;
function x(str) {
  ChildProcess.execSync(str);
}
// setTimeout(() => {

//   ws = new WebSocket('ws://localhost:8109');
//   ws.onmessage = e => {
//     try {
//       if (e.data) {
//         console.log(e.data)
//         let data = JSON.parse(e.data);
//         if ('engine_img_path' in data) {
//           engine_available = true
//           ChildProcess.exec('mspaint ' + data['engine_img_path'])
//         }
//         sender.send('generated-reply', e.data);
//       }
//     } catch (error) {
//       console.log(error)
//     }

//   }
// }, 5000)

var mySpawn = [];

function handleTextInput(e, args) {
  //ws.send(JSON.stringify())
  axios.get('http://localhost:1016', { data: { text: args.text, iterations: args.iter, use_engine: args.engine, lang: args.lang, gender: args.gender } }).then((res) => {

    console.log(res.data);
    if (args.engine && 'engine_img_path' in res.data) {

      setTimeout(() => {
        ChildProcess.exec(res.data.engine_img_path)
      }, 2000)
    }
    // const str = res.data.engine_img_path.toString();
    // console.log(str)
    e.sender.send('generated-reply', JSON.stringify(res.data));
  }).catch(error => {
    console.log(error);

    e.sender.send('generated-failed', JSON.stringify(error));
  })
  //sender = e.sender;
}

// const configPath = process.env.NODE_ENV === 'development' ? path.join(__dirname, '../src/assets/config.yaml') : path.join(process.cwd(), 'config.yaml');
// const configFile = fs.readFileSync(configPath, 'utf-8');
// const config = YAML.parse(configFile);
// const execStr = `${config['python_path']} ${config['t2p_path']}/main.py --text "${args.text}" --iterations ${args.iter} --use_engine ${args.engine} --lang ${args.lang}`
// console.log(execStr)
// ChildProcess.exec(execStr, {
//   cwd: config['t2p_path']
// }, (error, stdout, stderr) => {
//   console.log(stdout);
//   try {
//     var result = JSON.parse(stdout);
//     if (result != null) {
//       if (args.engine && 'engine_img_path' in result) {
//         ChildProcess.exec(result['engine_img_path'])
//       }
//       e.sender.send('generated-reply', JSON.stringify(result));
//     }
//   } catch (error) {
//     console.log(error.toString())
//   }
// })

ipcMain.on('text-input', handleTextInput);
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1000,
    height: 930,
    webPreferences: {
      webSecurity: false,
      //preload: path.join(__dirname, '/src/preload.js'),
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,//process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: false,//process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST);//win.webContents.openDevTools()
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
  ipcMain.handle('text-input', handleTextInput)

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
