import React, { useState } from 'react';
import { Button, Modal, Flex, Space, Card, Anchor, Grid, Image, Group, Text, Input, Title } from '@mantine/core';
import { IconFile } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

import 'xterm/css/xterm.css';
import styles from './styles.module.scss';

export default function Home() {
  const [opened, { open, close }] = useDisclosure(false);
  const [comfyFilePath, setComfyFilePath] = useState(() => window.electron.store.get('COMFYUI_INSTALL_DIR'));

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
    if (comfyFilePath) {
      handleShell(comfyFilePath);
    } else {
      window.electron.ipcRenderer.sendMessage('ipc-dialog-open');
      window.electron.ipcRenderer.once('ipc-dialog-open', (filePaths) => {
        const filePath = filePaths?.[0];
        if (!filePath) return;

        window.electron.store.set('COMFYUI_INSTALL_DIR', filePath);
        setComfyFilePath(filePath);
        handleModal();
      });
    }
  };

  return (
    <div className={styles.home}>
      <Grid mt="sm">
        <Grid.Col span={6}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
              <Image
                width="100%"
                src="https://avatars.githubusercontent.com/u/121283862?v=4"
                height={160}
                alt="Norway"
                style={{ objectFit: 'contain' }}
              />
            </Card.Section>

            <Group mt="md" mb="xs">
              <Title order={4}>ComfyUI启动器</Title>
            </Group>

            <Flex>
              <Anchor size="sm" href="" target="_blank">
                视频教程
              </Anchor>
              <Text size="sm" c="dimmed" px="2px">
                |
              </Text>
              <Anchor size="sm" href="" target="_blank">
                文章教程
              </Anchor>
            </Flex>

            <Space h="md" />

            <Flex align="center">
              <Text size="sm">安装位置:</Text>
              <Space w="sm" />
              <Input style={{ width: '60%' }} size="xs" disabled placeholder="请选择安装地址" value={comfyFilePath} />

              <Button size="xs" leftSection={<IconFile size={14} />} variant="default">
                更换位置
              </Button>
            </Flex>

            <Button color="blue" fullWidth mt="md" radius="md" onClick={handleRun}>
              一键启动
            </Button>
          </Card>
        </Grid.Col>
      </Grid>

      <Modal opened={opened} onClose={close} title="确认安装到该目录">
        <div>{window.electron.store.get('COMFYUI_INSTALL_DIR')}</div>
        <Button variant="filled" onClick={handleInstall}>
          确认
        </Button>
      </Modal>
    </div>
  );
}
