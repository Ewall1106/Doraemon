import { ipcMain } from 'electron';
import Store from 'electron-store';

const store = new Store();

export const storeInit = () => {
  ipcMain.on('electron-store-get', async (event, val) => {
    event.returnValue = store.get(val);
  });

  ipcMain.on('electron-store-set', async (event, key, val) => {
    store.set(key, val);
  });
};

export default storeInit;
