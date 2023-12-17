import React, { useEffect, useState } from 'react';
import { OpenDialogReturnValue } from 'electron';
import {
  Button,
  Flex,
  Space,
  Card,
  Anchor,
  Grid,
  Image,
  Group,
  Text,
  Input,
  Title,
  Breadcrumbs,
  Anchor,
  Divider,
  Progress,
  Stepper,
} from '@mantine/core';
import { message } from 'antd';
import { IconFile, IconArrowLeft, IconDownload } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useComfyStore } from '@/store';

import styles from './styles.module.scss';

const { ipcRenderer } = window.electron;

export default function ComfyUI() {
  const navigate = useNavigate();
  const [installed, setInstalled] = useState(false);
  const [active, setActive] = useState(0);

  const [speed, setSpeed] = useState(0);
  const [progress, setProgress] = useState(0);

  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));
  const installPath = useComfyStore((state) => state.installPath);
  const setInstallPath = useComfyStore((state) => state.setInstallPath);

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    ipcRenderer
      .invoke('fs.pathExists', { path: `${installPath}/ComfyUI/main.py` })
      .then((pathExist) => {
        console.log('>>>>>', pathExist);
        if (pathExist) setInstalled(true);
      })
      .catch(() => {});
  }, [installPath]);

  const handleSelectPath = async () => {
    ipcRenderer.sendMessage('dialog.openDirectory');
    ipcRenderer.once('dialog.openDirectory', (result: OpenDialogReturnValue) => {
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
    ipcRenderer.sendMessage('download.bigFile', installPath);
    ipcRenderer.on('download.bigFile', ({ status, speed, progress }) => {
      console.log('>>>>>>>', status);
      if (status === 'downloading') {
        setSpeed(speed);
        setProgress(progress);
      } else {
        // messageApi.open({
        //   type: 'error',
        //   content: '启动文件下载失败，请检测网络',
        // });
      }
    });
  };

  const handleRun = async () => {
    const pathExist = await ipcRenderer.invoke('fs.pathExists', { path: installPath });
    if (!pathExist) {
      messageApi.open({
        type: 'warning',
        content: '安装位置路径不存在',
      });
    } else {
      // 1.下载python依赖包
      // 3.下载script文件
      // 4. 获取git信息并显示到前端
      // 5. 测试能否解压成功
    }
  };

  return (
    <div className={styles.home}>
      {contextHolder}

      <div className={styles.header}>
        <Button leftSection={<IconArrowLeft size={14} />} variant="default" onClick={() => navigate('/')}>
          返回
        </Button>

        <Button color="blue" radius="md" onClick={handleRun} disabled>
          一键启动
        </Button>
      </div>

      <Card shadow="none" m="md" padding="lg" radius="md" withBorder>
        {/* <Flex align="center">
          <Text size="sm">安装位置：</Text>
          <Input style={{ flexGrow: 1 }} size="xs" disabled placeholder="请选择安装地址" value={installPath} />
          <Space w="md" />
          <Button size="xs" leftSection={<IconFile size={14} />} variant="default" onClick={handleSelectPath}>
            {installPath ? '更换位置' : '选择安装位置'}
          </Button>
        </Flex> */}

        <Stepper active={active} onStepClick={setActive}>
          <Stepper.Step label="安装位置" description="">
            <Flex align="center" style={{ padding: 18 }}>
              <Text size="sm">请选择项目安装位置：</Text>
              <Input style={{ flexGrow: 1 }} size="xs" disabled placeholder="请选择安装地址" value={installPath} />
              <Space w="md" />
              <Button size="xs" leftSection={<IconFile size={14} />} variant="default" onClick={handleSelectPath}>
                选择安装位置
              </Button>
            </Flex>
          </Stepper.Step>
          <Stepper.Step label="ComfyUI下载" description="">
            <Flex align="center" style={{ padding: 18 }}>
              <Text size="sm">{`下载进度:${progress}% 速度:${speed} KB/s`}</Text>
              <Space w="md" />
              <Progress style={{ flexGrow: 1 }} value={0} />
              <Space w="md" />
              <Button size="xs" leftSection={<IconDownload size={14} />} variant="default" onClick={handleDownload}>
                点击开始下载
              </Button>
              <Space w="2" />
              <Button size="xs" leftSection={<IconDownload size={14} />} variant="default">
                浏览器中下载
              </Button>
            </Flex>
          </Stepper.Step>
          <Stepper.Step label="文件解压" description="">
            Step 2 content: Verify email
          </Stepper.Step>
          <Stepper.Completed>Completed, click back button to get to previous step</Stepper.Completed>
        </Stepper>

        <Group justify="center" mt="xl">
          <Button variant="default" onClick={prevStep}>
            上一步
          </Button>
          <Button onClick={nextStep}>下一步</Button>
        </Group>
      </Card>
    </div>
  );
}
