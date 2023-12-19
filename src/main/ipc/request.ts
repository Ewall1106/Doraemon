import { ipcMain } from 'electron';
import axios from 'axios';

export const requestInit = () => {
  ipcMain.handle('request.get', async (event, url, config = {}) => {
    const res = await axios.get(url, config);
    return res.data;
  });
};

export default requestInit;
