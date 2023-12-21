import { app, ipcMain } from 'electron';
import packageJson from '../../../package.json';
import mainPackageJson from '../../../release/app/package.json';

export const appInit = () => {
  ipcMain.handle('app.getVersion', async () => {
    console.log('Electron 主进程版本号:', mainPackageJson.version);
    return {
      version: packageJson.version,
      mainVersion: mainPackageJson.version,
      electronVersion: app.getVersion(),
    };
  });
};

export default appInit;
