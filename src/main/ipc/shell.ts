import { ipcMain } from 'electron';
import { chmodSync } from 'node:fs';
import { spawn } from 'node:child_process';

export const shellInit = () => {
  ipcMain.on('ipc-example', async (event, arg) => {
    const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
    console.log(msgTemplate(arg));
    event.reply('ipc-example', msgTemplate('pong'));
  });

  ipcMain.on('ipc-shell-execute', (event, scriptPath) => {
    let childProcess;

    if (process.platform === 'darwin') {
      const fullPath = `${scriptPath}/comfyui_macos_start.sh`;
      chmodSync(fullPath, '755');
      childProcess = spawn('osascript', ['-e', `tell application "Terminal" to do script "${fullPath}" activate`]);
    } else if (process.platform === 'win32') {
      const fullPath = `${scriptPath}/comfyui_windows_start.bat`;
      const options = { cwd: scriptPath };
      childProcess = spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/k', fullPath], options);
    } else {
      childProcess = spawn('x-terminal-emulator', ['-e', scriptPath]);
    }

    childProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    childProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      event.reply('ipc-shell-execute', { done: true });
    });

    childProcess.on('close', (code) => {
      console.log(`子进程退出，退出码 ${code}`);
      event.reply('ipc-shell-execute', { done: true });
    });
  });
};

export default shellInit;
