import { ipcMain } from 'electron';
import fs from 'node:fs';
import axios from 'axios';
import { throttle } from 'lodash';

export const downloadInit = () => {
  // ipcMain.on('ipc-download', async (event, dirPath) => {
  //   const pendingList = [];
  //   const downloadFiles = ['comfyui_start.py'];

  //   if (process.platform === 'darwin') {
  //     downloadFiles.push('comfyui_macos_start.sh');
  //   } else {
  //     downloadFiles.push('comfyui_windows_start.bat');
  //   }

  //   downloadFiles.forEach((file) => {
  //     pendingList.push(
  //       new Promise((resolve, reject) => {
  //         axios({
  //           method: 'get',
  //           url: `https://gitee.com/zhuzhukeji/annotators/raw/master/${file}`, // TODO: 替换为正式开源后的gitee地址
  //           responseType: 'stream',
  //         })
  //           .then((response) => {
  //             let downloadedLength = 0;

  //             const startTime = Date.now();
  //             const filePath = `${dirPath}/${file}`;
  //             const writer = fs.createWriteStream(filePath);
  //             const totalLength = parseInt(response.headers['content-length'], 10);

  //             response.data.pipe(writer);
  //             response.data.on('data', (chunk) => {
  //               downloadedLength += chunk.length;
  //               const progress = (downloadedLength / totalLength) * 100;
  //               const currentTime = Date.now();
  //               const elapsedTime = (currentTime - startTime) / 1000; // in seconds
  //               const speed = downloadedLength / elapsedTime / 1024; // in KB/s
  //               event.reply('dialog.openDirectory', {
  //                 status: 'downloading',
  //                 progress: progress.toFixed(2),
  //                 speed: speed.toFixed(2),
  //               });
  //               // console.log(`Download Progress: ${progress.toFixed(2)}%, Speed: ${speed.toFixed(2)} KB/s`);
  //             });

  //             writer.on('finish', () => {
  //               console.log('File downloaded successfully.');
  //               resolve(undefined);
  //             });

  //             writer.on('error', (err) => {
  //               console.error(`Error writing to file: ${err.message}`);
  //               reject();
  //             });
  //           })
  //           .catch((err) => {
  //             console.error(`Error downloading file: ${err.message}`);
  //             reject();
  //           });
  //       }),
  //     );
  //   });

  //   Promise.all(pendingList)
  //     .then((res) => {
  //       event.reply('ipc-download', true);
  //       return res;
  //     })
  //     .catch(() => {
  //       event.reply('ipc-download', false);
  //     });
  // });
  ipcMain.on('download.bigFile', async (event, dirPath) => {
    const throttledReply = throttle((args) => {
      event.reply('download.bigFile', args);
    }, 500);

    axios({
      method: 'get',
      url: `https://modelscope.cn/api/v1/models/zhuzhukeji/annotators/repo?Revision=master&FilePath=hsxl_temporal_layers.f16.safetensors`, // TODO: 替换为正式开源后的gitee地址
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
