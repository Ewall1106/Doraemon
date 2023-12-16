import { BrowserWindow } from 'electron';
import { shellInit, downloadInit, storeInit, dialogInit, fsInit } from './ipc';

export default class Application {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.init();
  }

  init() {
    fsInit();
    storeInit();
    shellInit();
    downloadInit();
    dialogInit({ mainWindow: this.mainWindow });
  }
}
