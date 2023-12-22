import { BrowserWindow } from 'electron';
import {
  appInit,
  shellInit,
  downloadInit,
  storeInit,
  dialogInit,
  fsInit,
  processInit,
  gitInit,
  requestInit,
} from './ipc';

export default class Application {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.init();
  }

  init() {
    appInit();
    fsInit();
    gitInit();
    storeInit();
    shellInit();
    requestInit();
    processInit();
    dialogInit({ mainWindow: this.mainWindow });
    downloadInit({ mainWindow: this.mainWindow });
  }
}
