import { ipcMain, BrowserWindow, dialog } from 'electron';
import { spawn } from 'node:child_process';

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
        properties: ['openFile'],
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
        spawn('osascript', [
          '-e',
          `tell application "Terminal" to do script "${scriptPath}" activate`,
        ]);
      } else if (process.platform === 'win32') {
        spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/k', scriptPath]);
      } else {
        spawn('x-terminal-emulator', ['-e', scriptPath]);
      }
    });
  }
}
