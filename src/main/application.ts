import { BrowserWindow } from 'electron';
import { shellInit, downloadInit, storeInit, fileInit } from './ipc';

export default class Application {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.init();
  }

  init() {
    storeInit();
    shellInit();
    downloadInit();
    fileInit({ mainWindow: this.mainWindow });
  }
}
