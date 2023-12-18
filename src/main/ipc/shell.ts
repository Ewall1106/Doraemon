import { ipcMain } from 'electron';
import { dirname } from 'path';
import { chmodSync } from 'node:fs';
import { spawn } from 'node:child_process';

export const shellInit = () => {
  ipcMain.on('shell.execute', (event, scriptPath) => {
    let childProcess;

    if (process.platform === 'darwin') {
      chmodSync(scriptPath, '755');
      childProcess = spawn('osascript', ['-e', `tell application "Terminal" to do script "${scriptPath}" activate`]);
    } else if (process.platform === 'win32') {
      const options = { cwd: dirname(scriptPath) };
      childProcess = spawn('powershell.exe', ['/c', 'start', 'powershell.exe', '/k', scriptPath], options);
    }

    childProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    childProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      event.reply('shell.execute', { done: true });
    });

    childProcess.on('close', (code) => {
      console.log(`close: ${code}`);
      event.reply('shell.execute', { done: true });
    });
  });
};

export default shellInit;
