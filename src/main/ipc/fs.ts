import { ipcMain } from 'electron';
import { ensureDir, pathExists } from 'fs-extra';

export const fsInit = () => {
  ipcMain.handle('fs.ensureDir', async (event, args) => {
    const { dir } = args;
    const result = await ensureDir(dir);
    return result;
  });

  ipcMain.handle('fs.pathExists', async (event, args) => {
    const { path } = args;
    const result = await pathExists(path);
    return result;
  });
};

export default fsInit;
