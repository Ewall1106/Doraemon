import { ipcMain, BrowserWindow, dialog } from 'electron';

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
  }
}
