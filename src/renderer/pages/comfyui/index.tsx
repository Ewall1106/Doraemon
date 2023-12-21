import { useState } from 'react';
import { OpenDialogReturnValue } from 'electron';
import { useDisclosure } from '@mantine/hooks';
import { Button, Flex, Space, Card, Text, Input, SegmentedControl, Modal, List, ThemeIcon, rem } from '@mantine/core';
import { IconFile, IconArrowLeft, IconCircleCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useComfyStore } from '@/store';
import PluginList from './PluginList';

import styles from './styles.module.scss';

const { ipcRenderer } = window.electron;

export default function ComfyUI() {
  const navigate = useNavigate();
  const [graphic, setGraphic] = useState('GPU');
  const [pathInputError, setPathInputError] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const info = useComfyStore((state) => state.info);
  const installPath = useComfyStore((state) => state.installPath);
  const setInstallPath = useComfyStore((state) => state.setInstallPath);
  const [messageApi, contextHolder] = message.useMessage();

  const handleSelectPath = async () => {
    ipcRenderer.sendMessage('dialog.openDirectory');
    ipcRenderer.once('dialog.openDirectory', (result: OpenDialogReturnValue) => {
      const filePath = result?.filePaths?.[0];
      if (!filePath) return;
      setInstallPath(filePath);
      setPathInputError(false);
      messageApi.open({
        type: 'success',
        content: '安装位置设置成功',
      });
    });
  };

  const handleUpdate = async () => {
    const path = `${installPath}/comfyui-portable`;
    const pyPath = `${path}/ComfyUI/main.py`;
    const pathExist = await ipcRenderer.invoke('fs.pathExists', { path: pyPath });

    if (!pathExist) {
      messageApi.open({
        type: 'warning',
        content: '请先点击【一键启动】按钮完成安装后再试',
      });
      return;
    }

    await ipcRenderer.invoke('download.fileList', path, info.scriptList);

    const platform = await ipcRenderer.invoke('process.platform');
    if (platform === 'darwin') {
      ipcRenderer.sendMessage('shell.execute', `${path}/comfyui_macos_update.sh`);
    } else if (platform === 'win32') {
      ipcRenderer.sendMessage('shell.execute', `${path}/comfyui_windows_update.bat`);
    } else {
      messageApi.open({
        type: 'error',
        content: '抱歉该系统环境暂未支持',
      });
    }
  };

  const handleInstall = async () => {
    close();
    const path = `${installPath}/comfyui-portable`;
    await ipcRenderer.invoke('fs.ensureDir', { path });

    const pyPath = `${path}/ComfyUI/main.py`;
    const pyPathExist = await ipcRenderer.invoke('fs.pathExists', { path: pyPath });
    if (!pyPathExist) await ipcRenderer.invoke('download.fileList', path, info.scriptList);

    const platform = await ipcRenderer.invoke('process.platform');
    if (platform === 'darwin') {
      ipcRenderer.sendMessage('shell.execute', `${path}/comfyui_macos_start.sh`);
    } else if (platform === 'win32') {
      graphic === 'CPU'
        ? ipcRenderer.sendMessage('shell.execute', `${path}/comfyui_windows_start_cpu.bat`)
        : ipcRenderer.sendMessage('shell.execute', `${path}/comfyui_windows_start.bat`);
    } else {
      messageApi.open({
        type: 'error',
        content: '抱歉该系统环境暂未支持',
      });
    }
  };

  const handleRun = async () => {
    const pathExist = await ipcRenderer.invoke('fs.pathExists', { path: installPath });
    if (!pathExist) {
      setPathInputError(true);
      messageApi.open({
        type: 'warning',
        content: '安装位置路径有误，请检查后再试',
      });
      return;
    }

    const path = `${installPath}/comfyui-portable`;
    const pyPath = `${path}/ComfyUI/main.py`;
    const pyPathExist = await ipcRenderer.invoke('fs.pathExists', { path: pyPath });
    if (!pyPathExist) {
      open();
    } else {
      handleInstall();
    }
  };

  return (
    <div className={styles.comfyui}>
      {contextHolder}

      <Modal opened={opened} onClose={close} title="提示">
        <List
          spacing="xs"
          size="sm"
          center
          icon={
            <ThemeIcon color="teal" size={20} radius="xl">
              <IconCircleCheck style={{ width: rem(12), height: rem(12) }} />
            </ThemeIcon>
          }
        >
          <List.Item>请确保该安装目录磁盘有5G左右容量空间</List.Item>
          <List.Item>安装过程可能需要5-10分钟，请勿关机或息屏</List.Item>
          <List.Item>安装过程如果由于网络波动问题导致安装失败，删除整个文件夹后重装即可</List.Item>
          <List.Item>看看下面的安装操作视频流程吧</List.Item>
        </List>

        <iframe
          title="1231"
          style={{ border: 'none', marginTop: 15 }}
          width="100%"
          src="//player.bilibili.com/player.html?aid=367052086&bvid=BV1h94y1P7df&cid=1361008212&p=1&autoplay=0"
        />

        <Flex justify="flex-end" mt="md">
          <Button variant="default" onClick={close}>
            取消
          </Button>
          <Space w="xs" />
          <Button onClick={handleInstall}>确认安装</Button>
        </Flex>
      </Modal>

      <div className={styles.header}>
        <Button leftSection={<IconArrowLeft size={14} />} variant="default" onClick={() => navigate('/')}>
          返回
        </Button>
        <Flex>
          <Button variant="default" color="blue" radius="md" onClick={handleUpdate}>
            更新
          </Button>
          <Space w="xs" />
          <Button color="blue" radius="md" onClick={handleRun}>
            一键启动
          </Button>
        </Flex>
      </div>

      <Space h={60} />

      <Card shadow="none" m="md" padding="lg" radius="md">
        <Flex align="center">
          <Text size="sm">安装位置：</Text>
          <Input
            style={{ flexGrow: 1 }}
            size="xs"
            disabled
            placeholder="请选择安装地址"
            value={installPath && `${installPath}/comfyui-portable`}
            error={pathInputError}
          />
          <Space w="md" />
          <Button size="xs" leftSection={<IconFile size={14} />} variant="default" onClick={handleSelectPath}>
            {installPath ? '更换位置' : '选择安装位置'}
          </Button>
        </Flex>
        <Space h="md" />
        <Flex align="center">
          <Text size="sm">启动方式：</Text>
          <SegmentedControl
            value={graphic}
            onChange={setGraphic}
            data={[
              { label: 'GPU', value: 'GPU' },
              { label: 'CPU', value: 'CPU' },
            ]}
          />
        </Flex>
      </Card>

      <PluginList />
      <Space h="sm" />
    </div>
  );
}
