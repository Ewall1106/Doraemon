import { OpenDialogReturnValue } from 'electron';
import { Button, Flex, Space, Card, Text, Input } from '@mantine/core';
import { IconFile, IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useComfyStore } from '@/store';
import styles from './styles.module.scss';

const { ipcRenderer } = window.electron;

export default function ComfyUI() {
  const navigate = useNavigate();
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
        ipcRenderer.sendMessage('shell.execute', `${path}/comfyui_windows_start.bat`);
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

      <Card shadow="none" m="md" padding="lg" radius="md" withBorder>
        <Flex align="center">
          <Text size="sm">安装位置：</Text>
          <Input style={{ flexGrow: 1 }} size="xs" disabled placeholder="请选择安装地址" value={installPath} />
          <Space w="md" />
          <Button size="xs" leftSection={<IconFile size={14} />} variant="default" onClick={handleSelectPath}>
            {installPath ? '更换位置' : '选择安装位置'}
          </Button>
        </Flex>
      </Card>
    </div>
  );
}
