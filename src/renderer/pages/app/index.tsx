import { useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { Dialog, Group, Button, Text } from '@mantine/core';
import { requestConfigUrl } from '@/shared/config';
import { compareVersions } from '@/shared/util';
import { useAppStore } from '@/store';
import Home from '../home';
import Detail from '../detail';
import ComfyUI from '../comfyui';

import styles from './styles.module.scss';

const { ipcRenderer } = window.electron;

export default function App() {
  const [mainVersion, setMainVersion] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const setAppInfo = useAppStore((state) => state.setAppInfo);

  const init = async () => {
    const { mainVersion }: any = await ipcRenderer.invoke('app.getVersion');
    const res: any = await ipcRenderer.invoke('request.get', requestConfigUrl);
    console.log('init request:', res);
    setAppInfo(res);

    if (compareVersions(res?.mainVersion, mainVersion)) {
      open();
      setMainVersion(res?.mainVersion);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className={styles.app}>
      <Dialog opened={opened} withCloseButton onClose={close} size="lg" radius="md">
        <Text size="sm" mb="xs" fw={500}>
          有新的版本v{mainVersion}可以更新啦！
        </Text>

        <Group>
          <Text>查看最新的功能并点击下载安装</Text>
          <Button component="a" target="_blank" href="https://zhuzhukeji.cn/doraemon">
            点击下载
          </Button>
        </Group>
      </Dialog>

      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/comfyui" element={<ComfyUI />} />
          <Route path="/detail" element={<Detail />} />
        </Routes>
      </Router>
    </div>
  );
}
