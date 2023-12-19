import { useState } from 'react';
import { OpenDialogReturnValue } from 'electron';
import { Button, Flex, Space, Card, Text, Input, Anchor, SimpleGrid, SegmentedControl } from '@mantine/core';
import { IconFile, IconArrowLeft, IconDownload, IconRefresh } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import gitUrlParse from 'git-url-parse';
import { useComfyStore } from '@/store';

import styles from './styles.module.scss';

const { ipcRenderer } = window.electron;

const pluginList = [
  {
    name: 'ComfyUI-Manager',
    github: 'https://github.com/ltdrdata/ComfyUI-Manager.git',
    gitee: 'https://gitee.com/zhuzhukeji/ComfyUI-Manager.git',
  },
  {
    name: 'ComfyUI-AnimateDiff-Evolved',
    github: 'https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved.git',
    gitee: 'https://gitee.com/zhuzhukeji/ComfyUI-AnimateDiff-Evolved.git',
  },
  {
    name: 'comfyui_controlnet_aux',
    github: 'https://github.com/ltdrdata/ComfyUI-Manager.git',
    gitee: 'https://gitee.com/zhuzhukeji/ComfyUI-Manager.git',
  },
  {
    name: 'ComfyUI-Advanced-ControlNet',
    github: 'https://github.com/ltdrdata/ComfyUI-Manager.git',
    gitee: 'https://gitee.com/zhuzhukeji/ComfyUI-Manager.git',
  },
];

export default function ComfyUI() {
  const navigate = useNavigate();
  const [graphic, setGraphic] = useState('GPU');
  const installPath = useComfyStore((state) => state.installPath);
  const setInstallPath = useComfyStore((state) => state.setInstallPath);
  const [messageApi, contextHolder] = message.useMessage();

  const handleSelectPath = async () => {
    ipcRenderer.sendMessage('dialog.openDirectory');
    ipcRenderer.once('dialog.openDirectory', (result: OpenDialogReturnValue) => {
      const filePath = result?.filePaths?.[0];
      if (!filePath) return;
      setInstallPath(filePath);
      messageApi.open({
        type: 'success',
        content: '安装位置设置成功',
      });
    });
  };

  const handleRun = async () => {
    const pathExist = await ipcRenderer.invoke('fs.pathExists', { path: installPath });
    if (!pathExist) {
      messageApi.open({
        type: 'warning',
        content: '安装位置文件夹不存在，请检查后再试',
      });
    } else {
      const path = `${installPath}/comfyui-portable`;
      const fileList = [
        {
          name: 'comfyui_macos_start.sh',
          url: 'https://gitee.com/zhuzhukeji/annotators/raw/master/comfyui/comfyui_macos_start.sh',
        },
        {
          name: 'comfyui_macos_update.sh',
          url: 'https://gitee.com/zhuzhukeji/annotators/raw/master/comfyui/comfyui_macos_update.sh',
        },
        {
          name: 'comfyui_windows_start.bat',
          url: 'https://gitee.com/zhuzhukeji/annotators/raw/master/comfyui/comfyui_windows_start.bat',
        },
        {
          name: 'comfyui_windows_start_cpu.bat',
          url: 'https://gitee.com/zhuzhukeji/annotators/raw/master/comfyui/comfyui_windows_start_cpu.bat',
        },
        {
          name: 'comfyui_windows_update.bat',
          url: 'https://gitee.com/zhuzhukeji/annotators/raw/master/comfyui/comfyui_windows_update.bat',
        },
        {
          name: 'start.py',
          url: 'https://gitee.com/zhuzhukeji/annotators/raw/master/comfyui/start.py',
        },
      ];
      await ipcRenderer.invoke('fs.ensureDir', { path });
      await ipcRenderer.invoke('download.fileList', path, fileList);

      const platform = await ipcRenderer.invoke('process.platform');
      if (platform === 'darwin') {
        ipcRenderer.sendMessage('shell.execute', `${path}/comfyui_macos_start.sh`);
      } else if (platform === 'win32') {
        if (graphic === 'CPU') {
          ipcRenderer.sendMessage('shell.execute', `${path}/comfyui_windows_start_cpu.bat`);
        } else {
          ipcRenderer.sendMessage('shell.execute', `${path}/comfyui_windows_start.bat`);
        }
      } else {
        messageApi.open({
          type: 'error',
          content: '抱歉该系统环境暂未支持',
        });
      }
      ipcRenderer.once('shell.execute', ({ done }) => {
        console.log(done);
      });
    }
  };

  const handlePluginClone = async (item) => {
    try {
      const parsedUrl = gitUrlParse(item.gitee);
      const targetDirectory = `${installPath}/comfyui-portable/ComfyUI/custom_nodes/${parsedUrl.name}`;
      await ipcRenderer.invoke('fs.ensureDir', { path: targetDirectory });
      await ipcRenderer.invoke('git.clone', { repoURL: item.gitee, targetDirectory });
      messageApi.open({
        type: 'success',
        content: '安装成功',
      });
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: '安装失败',
      });
    }
  };

  const handlePluginPull = async (item) => {
    const parsedUrl = gitUrlParse(item.gitee);
    try {
      const targetDirectory = `${installPath}/comfyui-portable/ComfyUI/custom_nodes/${parsedUrl.name}`;
      await ipcRenderer.invoke('git.pull', { targetDirectory });
      messageApi.open({
        type: 'success',
        content: '更新成功',
      });
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: '更新成功',
      });
    }
  };

  return (
    <div className={styles.home}>
      {contextHolder}

      <div className={styles.header}>
        <Button leftSection={<IconArrowLeft size={14} />} variant="default" onClick={() => navigate('/')}>
          返回
        </Button>

        <Button color="blue" radius="md" onClick={handleRun}>
          一键启动
        </Button>
      </div>

      <Card shadow="none" m="md" padding="lg" radius="md">
        <Flex align="center">
          <Text size="sm">安装位置：</Text>
          <Input style={{ flexGrow: 1 }} size="xs" disabled placeholder="请选择安装地址" value={installPath} />
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

      <Card shadow="none" m="md" padding="lg" radius="md">
        <Text size="sm">插件列表：</Text>
        <Space h="xs" />
        <SimpleGrid cols={{ base: 1, sm: 3, lg: 5 }}>
          {pluginList.map((item) => {
            return (
              <Card style={{ width: '100%' }} shadow="none" padding="xs" radius="md" withBorder key={item.name}>
                <Text size="sm" fw="bold">
                  {item.name}
                </Text>
                <Space h="md" />
                <Flex>
                  <Anchor size="sm" href={item.github} target="_blank">
                    Github
                  </Anchor>
                  <Text size="sm" c="dimmed" px="2px">
                    |
                  </Text>
                  <Anchor size="sm" href={item.gitee} target="_blank">
                    国内镜像
                  </Anchor>
                </Flex>
                <Space h="md" />
                <Flex>
                  <Button
                    variant="outline"
                    rightSection={<IconDownload size={14} />}
                    size="xs"
                    radius="md"
                    onClick={() => handlePluginClone(item)}
                  >
                    安装
                  </Button>
                  <Space w="xs" />
                  <Button
                    rightSection={<IconRefresh size={14} />}
                    variant="default"
                    size="xs"
                    radius="md"
                    onClick={() => handlePluginPull(item)}
                  >
                    更新
                  </Button>
                </Flex>
              </Card>
            );
          })}
        </SimpleGrid>
      </Card>
    </div>
  );
}
