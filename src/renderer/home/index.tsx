import { Button } from '@mantine/core';
import styles from './styles.module.scss';

export default function Home() {
  const handleInstall = () => {
    window.electron.ipcRenderer.sendMessage('ipc-dialog-open');

    window.electron.ipcRenderer.once('ipc-dialog-open', (arg) => {
      console.log(arg);
    });
  };

  return (
    <div className={styles.home}>
      <Button variant="filled" onClick={handleInstall}>
        安装
      </Button>
    </div>
  );
}
