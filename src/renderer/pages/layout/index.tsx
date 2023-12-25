import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { Dialog, Group, Button, Text } from '@mantine/core';
import { requestConfigUrl } from '@/shared/config';
import { compareVersions } from '@/shared/util';
import { useAppStore } from '@/store';

import styles from './styles.module.scss';

const { ipcRenderer } = window.electron;

export default function Layout() {
  const navigate = useNavigate();
  const [mainVersion, setMainVersion] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const setAppInfo = useAppStore((state) => state.setAppInfo);

  const init = async () => {
    try {
      const version: any = await ipcRenderer.invoke('app.getVersion');
      const res: any = await ipcRenderer.invoke('request.get', requestConfigUrl);
      console.log('===init request===', res);
      setAppInfo(res);

      if (compareVersions(res?.mainVersion, version?.mainVersion)) {
        open();
        setMainVersion(res?.mainVersion);
      }
    } catch (error) {
      console.log(error);
      navigate('/error');
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className={styles.layout}>
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

      <div className={styles.outlet}>
        <Outlet />
      </div>
    </div>
  );
}
