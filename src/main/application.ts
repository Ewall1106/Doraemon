import { BrowserWindow } from 'electron';
import { shellInit, downloadInit, storeInit, dialogInit, fsInit, processInit, gitInit, requestInit } from './ipc';

export default class Application {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.init();
  }

  init() {
    fsInit();
    gitInit();
    storeInit();
    shellInit();
    requestInit();
    processInit();
    downloadInit();
    dialogInit({ mainWindow: this.mainWindow });
  }
}
