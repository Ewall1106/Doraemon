import React, { useState } from 'react';
import { Button, Flex, Space, Card, Anchor, Grid, Image, Group, Text, Input, Title } from '@mantine/core';
import { message } from 'antd';
import { IconFile } from '@tabler/icons-react';

import 'xterm/css/xterm.css';
import styles from './styles.module.scss';

export default function Home() {
  const [messageApi, contextHolder] = message.useMessage();
  const [comfyFilePath, setComfyFilePath] = useState(() => window.electron.store.get('COMFYUI_INSTALL_DIR'));

  const handleSelectPath = () => {
    window.electron.ipcRenderer.sendMessage('ipc-dialog-open');
    window.electron.ipcRenderer.once('ipc-dialog-open', (filePaths) => {
      const filePath = filePaths?.[0];
      if (!filePath) return;
      window.electron.store.set('COMFYUI_INSTALL_DIR', filePath);
      setComfyFilePath(filePath);
    });
  };

  const handleShell = (filePath: string) => {
    window.electron.ipcRenderer.sendMessage('ipc-execute-bash', filePath);
  };

  const handleDownload = () => {
    window.electron.ipcRenderer.sendMessage('ipc-download', comfyFilePath);
    window.electron.ipcRenderer.once('ipc-download', (status) => {
      if (status) {
        handleShell(comfyFilePath);
      }
    });
  };

  const handleRun = () => {
    if (!comfyFilePath) {
      messageApi.open({
        type: 'warning',
        content: '请先选择安装位置',
      });
      return;
    }
    handleDownload();
  };

  return (
    <div className={styles.home}>
      {contextHolder}

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
              <Text size="sm">安装位置：</Text>
              <Input style={{ flexGrow: 1 }} size="xs" disabled placeholder="请选择安装地址" value={comfyFilePath} />
              <Button size="xs" leftSection={<IconFile size={14} />} variant="default" onClick={handleSelectPath}>
                {comfyFilePath ? '更换位置' : '选择'}
              </Button>
            </Flex>

            <Button color="blue" fullWidth mt="md" radius="md" onClick={handleRun}>
              一键启动
            </Button>
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  );
}
