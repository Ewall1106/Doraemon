import { ipcMain } from 'electron';

export const processInit = () => {
  ipcMain.handle('process.platform', async () => {
    return process.platform;
  });
};

export default processInit;
