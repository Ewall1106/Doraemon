import { ipcMain } from 'electron';
import fs from 'node:fs';
import axios from 'axios';
import { throttle } from 'lodash';

type ListProp = {
  url: string;
  name: string;
};

type fileListProp = Array<ListProp>;

export const downloadInit = () => {
  ipcMain.handle('download.fileList', async (event, dirPath, fileList: fileListProp) => {
    const pendingList = [];
    fileList.forEach((file) => {
      pendingList.push(
        new Promise((resolve, reject) => {
          axios({
            method: 'get',
            url: `${file.url}`,
            responseType: 'stream',
          })
            .then((response) => {
              const filePath = `${dirPath}/${file.name}`;
              const writer = fs.createWriteStream(filePath);

              response.data.pipe(writer);

              writer.on('finish', () => {
                console.log('File downloaded successfully.');
                resolve(true);
              });

              writer.on('error', (err) => {
                console.error(`Error writing to file: ${err.message}`);
                reject();
              });
            })
            .catch((err) => {
              console.error(`Error downloading file: ${err.message}`);
              reject();
            });
        }),
      );
    });
    const result = await Promise.all(pendingList);
    return result;
  });

  ipcMain.on('download.bigFile', async (event, dirPath) => {
    console.log(dirPath);

    const throttledReply = throttle((args) => {
      event.reply('download.bigFile', args);
    }, 500);

    axios({
      method: 'get',
      url: '',
      responseType: 'stream',
    })
      .then((response) => {
        let downloadedLength = 0;

        const startTime = Date.now();
        const filePath = `/Users/xiong/Desktop/qqqqq/hsxl_temporal_layers.f16.safetensors`;
        const writer = fs.createWriteStream(filePath);
        const totalLength = parseInt(response.headers['content-length'], 10);

        response.data.pipe(writer);
        response.data.on('data', (chunk) => {
          downloadedLength += chunk.length;
          const progress = (downloadedLength / totalLength) * 100;
          const currentTime = Date.now();
          const elapsedTime = (currentTime - startTime) / 1000; // in seconds
          const speed = downloadedLength / elapsedTime / 1024; // in KB/s
          console.log(`Download Progress: ${progress.toFixed(0)}%, Speed: ${speed.toFixed(0)} KB/s`);
          throttledReply({
            status: 'downloading',
            speed: speed.toFixed(0),
            progress: progress.toFixed(0),
          });
        });

        writer.on('finish', () => {
          console.log('File downloaded successfully.');
        });

        writer.on('error', (err) => {
          console.error(`Error writing to file: ${err.message}`);
          event.reply('download.bigFile', { status: 'error' });
        });
      })
      .catch((err) => {
        console.error(`Error downloading file: ${err.message}`);
        event.reply('download.bigFile', { status: 'error' });
      });
  });
};

export default downloadInit;
