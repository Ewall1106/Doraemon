import { ipcMain } from 'electron';
import { spawn } from 'node:child_process';

export const shellInit = () => {
  ipcMain.on('ipc-example', async (event, arg) => {
    const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
    console.log(msgTemplate(arg));
    event.reply('ipc-example', msgTemplate('pong'));
  });

  ipcMain.on('ipc-execute-bash', (event, scriptPath) => {
    if (process.platform === 'darwin') {
      const path = `${scriptPath}/comfyui_macos_start.sh`;
      const childProcess = spawn('osascript', ['-e', `tell application "Terminal" to do script "${path}" activate`]);

      // 监听子进程的stdout和stderr输出
      childProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      childProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });

      // 监听子进程的关闭事件
      childProcess.on('close', (code) => {
        console.log(`子进程退出，退出码 ${code}`);
      });
    } else if (process.platform === 'win32') {
      const options = { cwd: scriptPath.replace('comfyui_windows_start.bat', '') };
      spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/k', scriptPath], options);
    } else {
      spawn('x-terminal-emulator', ['-e', scriptPath]);
    }
  });
};

export default shellInit;
