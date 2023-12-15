import React from 'react';
import { Button, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import 'xterm/css/xterm.css';
import styles from './styles.module.scss';

export default function Home() {
  const [opened, { open, close }] = useDisclosure(false);

  const handleShell = (filePath: string) => {
    window.electron.ipcRenderer.sendMessage('ipc-execute-bash', filePath);
  };

  const handleInstall = () => {
    const COMFYUI_INSTALL_DIR = window.electron.store.get('COMFYUI_INSTALL_DIR');
    window.electron.ipcRenderer.sendMessage('ipc-download', COMFYUI_INSTALL_DIR);
    window.electron.ipcRenderer.once('ipc-download', (status) => {
      if (status) {
        close();
        handleShell(COMFYUI_INSTALL_DIR);
      }
    });
  };

  const handleModal = () => {
    open();
  };

  const handleRun = () => {
    const COMFYUI_INSTALL_DIR = window.electron.store.get('COMFYUI_INSTALL_DIR');
    if (COMFYUI_INSTALL_DIR) {
      handleShell(COMFYUI_INSTALL_DIR);
    } else {
      window.electron.ipcRenderer.sendMessage('ipc-dialog-open');
      window.electron.ipcRenderer.once('ipc-dialog-open', (filePaths) => {
        const filePath = filePaths?.[0];
        console.log(filePath);
        window.electron.store.set('COMFYUI_INSTALL_DIR', filePath);
        // handleShell(filePath);
        handleModal();
      });
    }
  };

  return (
    <div className={styles.home}>
      <Modal opened={opened} onClose={close} title="确认安装到该目录">
        <div>{window.electron.store.get('COMFYUI_INSTALL_DIR')}</div>
        <Button variant="filled" onClick={handleInstall}>
          确认
        </Button>
      </Modal>

      <Button variant="filled" onClick={handleRun}>
        一键启动
      </Button>
      <div>{window.electron.store.get('COMFYUI_INSTALL_DIR')}</div>
    </div>
  );
}
