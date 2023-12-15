import React from 'react';
import { Button } from '@mantine/core';

import 'xterm/css/xterm.css';
import styles from './styles.module.scss';

export default function Home() {
  const handleExecuteBat = (filePath: string) => {
    window.electron.ipcRenderer.sendMessage('ipc-execute-bash', filePath);
  };

  const handleInstall = () => {
    window.electron.ipcRenderer.sendMessage('ipc-dialog-open');

    window.electron.ipcRenderer.once('ipc-dialog-open', (filePaths) => {
      const filePath = filePaths?.[0];
      console.log(filePath);
      handleExecuteBat(filePath);
    });
  };

  const handleRun = () => {
    window.electron.store.set('foo', 'bar');
    console.log('>>>>>>>>>>>>',  window.electron.store.get('foo'))
  };

  return (
    <div className={styles.home}>
      <Button variant="filled" onClick={handleRun}>
        一键启动
      </Button>
    </div>
  );
}
