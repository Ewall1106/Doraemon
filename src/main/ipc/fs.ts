import { ipcMain } from 'electron';
import { ensureDir, pathExists } from 'fs-extra';

export const fsInit = () => {
  ipcMain.on('ipc-fs-ensure-dir', async (event, arg) => {
    const { dir } = arg;
    ensureDir(dir)
      .then(() => {
        event.reply('ipc-fs-ensure-dir', { success: true });
        return true;
      })
      .catch((err) => {
        console.error(err);
        event.reply('ipc-fs-ensure-dir', { success: false, err });
      });
  });

  ipcMain.on('ipc-fs-path-exists', async (event, arg) => {
    const { path } = arg;
    pathExists(path)
      .then((exists) => {
        event.reply('ipc-fs-path-exists', { exists });
        return true;
      })
      .catch((err) => {
        console.error(err);
        event.reply('ipc-fs-path-exists', { exists: false });
      });
  });
};

export default fsInit;
