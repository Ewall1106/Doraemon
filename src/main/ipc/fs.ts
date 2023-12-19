import { ipcMain } from 'electron';
import { ensureDir, pathExists, remove } from 'fs-extra';

export const fsInit = () => {
  ipcMain.handle('fs.ensureDir', async (event, args) => {
    const { path } = args;
    const result = await ensureDir(path);
    return result;
  });

  ipcMain.handle('fs.pathExists', async (event, args) => {
    const { path } = args;
    const result = await pathExists(path);
    return result;
  });

  ipcMain.handle('fs.remove', async (event, args) => {
    const { path } = args;
    const result = await remove(path);
    return result;
  });
};

export default fsInit;
