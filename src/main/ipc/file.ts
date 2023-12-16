import { ipcMain, dialog } from 'electron';

export const fileInit = ({ mainWindow }) => {
  ipcMain.on('ipc-dialog-open', async (event, arg) => {
    console.log(arg);

    const options: any = {
      title: '选择安装目录',
      properties: ['openDirectory'],
    };
    dialog
      .showOpenDialog(mainWindow, options)
      .then((result) => {
        event.reply('ipc-dialog-open', result.filePaths);
        return result;
      })
      .catch((err) => console.log(err));
  });
};

export default fileInit;
