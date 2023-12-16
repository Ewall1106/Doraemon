import React from 'react';
import { OpenDialogReturnValue } from 'electron';
import { Button, Flex, Space, Card, Anchor, Grid, Image, Group, Text, Input, Title } from '@mantine/core';
import { message } from 'antd';
import { IconFile } from '@tabler/icons-react';
import { useComfyStore } from '@/store';

import styles from './styles.module.scss';

const { ipcRenderer } = window.electron;

export default function Home() {
  const installPath = useComfyStore((state) => state.installPath);
  const setInstallPath = useComfyStore((state) => state.setInstallPath);

  const [messageApi, contextHolder] = message.useMessage();

  const handleSelectPath = () => {
    ipcRenderer.sendMessage('ipc-dialog-open');
    ipcRenderer.once('ipc-dialog-open', (result: OpenDialogReturnValue) => {
      const filePath = result?.filePaths?.[0];
      if (!filePath) return;
      setInstallPath(filePath);
    });
  };

  const handleShell = (filePath: string) => {
    ipcRenderer.sendMessage('ipc-shell-execute', filePath);
    ipcRenderer.once('ipc-shell-execute', ({ done }) => {
      console.log(done);
    });
  };

  const handleDownload = () => {
    ipcRenderer.sendMessage('ipc-download', installPath);
    ipcRenderer.once('ipc-download', (status) => {
      if (status) {
        handleShell(installPath);
      } else {
        messageApi.open({
          type: 'error',
          content: '启动文件下载失败，请检测网络',
        });
      }
    });
  };

  const handleRun = () => {
    ipcRenderer.sendMessage('ipc-fs-path-exists', { path: installPath });
    ipcRenderer.once('ipc-fs-path-exists', ({ exists }) => {
      if (exists) {
        handleDownload();
      } else {
        messageApi.open({
          type: 'warning',
          content: '安装位置路径不存在',
        });
      }
    });
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
              <Input style={{ flexGrow: 1 }} size="xs" disabled placeholder="请选择安装地址" value={installPath} />
              <Button size="xs" leftSection={<IconFile size={14} />} variant="default" onClick={handleSelectPath}>
                {installPath ? '更换位置' : '选择'}
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
