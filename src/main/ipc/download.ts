import { ipcMain } from 'electron';
import fs from 'node:fs';
import axios from 'axios';
import { throttle } from 'lodash';
import { download, CancelError } from 'electron-dl';

type ListProp = {
  url: string;
  name: string;
};

type fileListProp = Array<ListProp>;

const downloadTasks = {};

export const downloadInit = ({ mainWindow }) => {
  ipcMain.on('download.start', (event, { directory, url, downloadId }) => {
    const throttledReply = throttle(
      (args) => {
        event.reply('download.progress', args);
      },
      800,
      { trailing: false },
    );

    download(mainWindow, url, {
      directory,
      onStarted: (item) => {
        downloadTasks[downloadId] = item;
      },
      onProgress: (progress) => {
        throttledReply({ ...progress, url, downloadId });
      },
    })
      .then(() => {
        delete downloadTasks[downloadId];
        event.reply('download.completed', { downloadId });
      })
      .catch((err) => {
        if (err instanceof CancelError) {
          event.reply('download.cancel', { downloadId });
        } else {
          console.error(err);
          event.reply('download.error', { downloadId });
        }

        delete downloadTasks[downloadId];
      });
  });

  ipcMain.handle('download.pause', async (_event, { downloadId }) => {
    const item = downloadTasks[downloadId];
    if (item) {
      item.pause();
    }
  });

  ipcMain.handle('download.resume', async (_event, { downloadId }) => {
    const item = downloadTasks[downloadId];
    if (item) {
      item.resume();
    }
  });

  ipcMain.handle('download.cancel', async (_event, { downloadId }) => {
    const item = downloadTasks[downloadId];
    if (item) {
      item.cancel();
    }
  });

  ipcMain.handle('download.cancelAll', () => {
    // TODO: 多文件下载时downloadItem无法全部cancel成功
    Object.keys(downloadTasks).forEach((key) => {
      downloadTasks[key].cancel();
      delete downloadTasks[key];
    });
  });

  ipcMain.handle('download.fileList', async (_event, dirPath, fileList: fileListProp) => {
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

  ipcMain.on('download.bigFile', async (event, { path, url, id }) => {
    const throttledReply = throttle((args) => {
      event.reply('download.bigFile', args);
    }, 500);

    axios({
      method: 'get',
      url,
      responseType: 'stream',
    })
      .then((response) => {
        let downloadedLength = 0;

        const startTime = Date.now();
        const writer = fs.createWriteStream(path);
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
            id,
            status: 'downloading',
            speed: speed.toFixed(0),
            progress: progress.toFixed(0),
          });
        });

        writer.on('finish', () => {
          console.log('File downloaded successfully.');
          event.reply('download.bigFile', { id, status: 'finish' });
        });

        writer.on('error', (err) => {
          console.error(`Error writing to file: ${err.message}`);
          event.reply('download.bigFile', { id, status: 'error' });
        });
      })
      .catch((err) => {
        console.error(`Error downloading file: ${err.message}`);
        event.reply('download.bigFile', { id, status: 'error' });
      });
  });
};

export default downloadInit;
