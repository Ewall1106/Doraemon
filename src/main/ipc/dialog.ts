import { ipcMain, dialog } from 'electron';

export const dialogInit = ({ mainWindow }) => {
  ipcMain.on('ipc-dialog-open', async (event, arg) => {
    console.log(arg);

    dialog
      .showOpenDialog(mainWindow, {
        title: '选择安装目录',
        properties: ['openDirectory'],
      })
      .then((result) => {
        console.log('ipc-dialog-open', result);
        event.reply('ipc-dialog-open', result);
        return result;
      })
      .catch((err) => console.log(err));
  });
};

export default dialogInit;
