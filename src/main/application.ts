import { BrowserWindow } from 'electron';
import { shellInit, downloadInit, storeInit, dialogInit, fsInit, processInit, gitInit } from './ipc';

export default class Application {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.init();
  }

  init() {
    gitInit();
    fsInit();
    storeInit();
    shellInit();
    downloadInit();
    processInit();
    dialogInit({ mainWindow: this.mainWindow });
  }
}
