import { ipcMain, BrowserWindow, dialog } from 'electron';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import Store from 'electron-store';
import axios from 'axios';

const store = new Store();

export default class Application {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.init();
  }

  init() {
    ipcMain.on('ipc-example', async (event, arg) => {
      const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
      console.log(msgTemplate(arg));
      event.reply('ipc-example', msgTemplate('pong'));
    });

    // Dialog
    ipcMain.on('ipc-dialog-open', async (event, arg) => {
      console.log(arg);

      const options: any = {
        title: '选择安装目录',
        properties: ['openDirectory'],
      };
      dialog
        .showOpenDialog(this.mainWindow, options)
        .then((result) => {
          event.reply('ipc-dialog-open', result.filePaths);
          return result;
        })
        .catch((err) => console.log(err));
    });

    // Shell
    ipcMain.on('ipc-execute-bash', (event, scriptPath) => {
      if (process.platform === 'darwin') {
        const path = `${scriptPath}/comfyui_macos_start.sh`;
        spawn('osascript', ['-e', `tell application "Terminal" to do script "${path}" activate`]);
      } else if (process.platform === 'win32') {
        const options = { cwd: scriptPath.replace('comfyui_windows_start.bat', '') };
        spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/k', scriptPath], options);
      } else {
        spawn('x-terminal-emulator', ['-e', scriptPath]);
      }
    });

    // install
    ipcMain.on('ipc-download', async (event, dirPath) => {
      const pendingList = [];
      const downloadFiles = ['comfyui_macos_start.sh', 'comfyui_macos_start.py'];

      downloadFiles.forEach((file) => {
        pendingList.push(
          new Promise((resolve, reject) => {
            axios({
              method: 'get',
              url: `https://gitee.com/zhuzhukeji/annotators/raw/master/${file}`,
              responseType: 'stream',
            })
              .then((response) => {
                const filePath = `${dirPath}/${file}`;
                const writer = fs.createWriteStream(filePath);

                response.data.pipe(writer);

                writer.on('finish', () => {
                  console.log('File downloaded successfully.');
                  resolve(undefined);
                });

                writer.on('error', (err) => {
                  console.error(`Error writing to file: ${err.message}`);
                  reject();
                });

                return response;
              })
              .catch((err) => {
                console.error(`Error downloading file: ${err.message}`);
                reject();
              });
          }),
        );
      });

      Promise.all(pendingList)
        .then((res) => {
          event.reply('ipc-download', true);
          return res;
        })
        .catch(() => {
          event.reply('ipc-download', false);
        });
    });

    // Store
    ipcMain.on('electron-store-get', async (event, val) => {
      event.returnValue = store.get(val);
    });

    ipcMain.on('electron-store-set', async (event, key, val) => {
      store.set(key, val);
    });
  }
}
