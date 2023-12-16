import { ipcMain } from 'electron';
import fs from 'node:fs';
import axios from 'axios';

export const downloadInit = () => {
  ipcMain.on('ipc-download', async (event, dirPath) => {
    const pendingList = [];
    const downloadFiles = ['comfyui_macos_start.sh', 'comfyui_macos_start.py'];

    downloadFiles.forEach((file) => {
      pendingList.push(
        new Promise((resolve, reject) => {
          axios({
            method: 'get',
            url: `https://gitee.com/zhuzhukeji/annotators/raw/master/${file}`,
            responseType: 'stream',
          })
            .then((response) => {
              const filePath = `${dirPath}/${file}`;
              const writer = fs.createWriteStream(filePath);

              response.data.pipe(writer);

              writer.on('finish', () => {
                console.log('File downloaded successfully.');
                resolve(undefined);
              });

              writer.on('error', (err) => {
                console.error(`Error writing to file: ${err.message}`);
                reject();
              });

              return response;
            })
            .catch((err) => {
              console.error(`Error downloading file: ${err.message}`);
              reject();
            });
        }),
      );
    });

    Promise.all(pendingList)
      .then((res) => {
        event.reply('ipc-download', true);
        return res;
      })
      .catch(() => {
        event.reply('ipc-download', false);
      });
  });
};

export default downloadInit;
