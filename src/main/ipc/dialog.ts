import { ipcMain, dialog } from 'electron';

export const dialogInit = ({ mainWindow }) => {
  ipcMain.on('dialog.openDirectory', async (event, arg) => {
    console.log(arg);

    dialog
      .showOpenDialog(mainWindow, {
        title: '请选择目录',
        properties: ['openDirectory'],
      })
      .then((result) => {
        event.reply('dialog.openDirectory', result);
        return result;
      })
      .catch((err) => console.log(err));
  });
};

export default dialogInit;
