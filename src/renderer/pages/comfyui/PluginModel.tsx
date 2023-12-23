import { useState, useEffect } from 'react';
import { Button, Flex, Space, Card, Text, Divider, CopyButton, Drawer, TextInput, rem } from '@mantine/core';
import { IconDownload, IconExternalLink, IconX, IconSearch } from '@tabler/icons-react';
import { useId } from '@mantine/hooks';
import { message, Popconfirm, Progress } from 'antd';
import { useComfyStore } from '@/store';

const { ipcRenderer } = window.electron;

export function ModelItem({ item }) {
  const downloadId = useId();
  const [percent, setPercent] = useState(0);
  const [pathExist, setPathExist] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const installPath = useComfyStore((state) => state.installPath);
  const downloading = useComfyStore((state) => state.downloading);
  const setDownloading = useComfyStore((state) => state.setDownloading);

  const [messageApi, contextHolder] = message.useMessage();

  const targetInstallDir = `${installPath}/comfyui-portable/${item.targetInstallPath}`;
  const targetInstallPath = `${targetInstallDir}/${item.name}`;

  useEffect(() => {
    const checkPathExists = async () => {
      const exist: any = await ipcRenderer.invoke('fs.pathExists', { path: targetInstallPath });
      setPathExist(exist);
    };

    checkPathExists();
  }, []);

  const handleDelete = async () => {
    try {
      await ipcRenderer.invoke('fs.remove', { path: targetInstallPath });
      setPercent(0);
      setPathExist(false);
      messageApi.open({
        type: 'success',
        content: '删除成功',
      });
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: '删除失败',
      });
    }
    setDeleteLoading(false);
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    await ipcRenderer.invoke('fs.ensureDir', { path: targetInstallDir });
    await ipcRenderer.sendMessage('download.start', { directory: targetInstallDir, url: item.url, downloadId });

    ipcRenderer.on('download.progress', ({ percent, downloadId: _downloadId }) => {
      if (_downloadId !== downloadId) return;
      setPercent(Number((percent * 100).toFixed(2)));
    });

    ipcRenderer.on('download.completed', ({ downloadId: _downloadId }) => {
      if (_downloadId !== downloadId) return;
      setPathExist(true);
    });

    ipcRenderer.on('download.error', ({ downloadId: _downloadId }) => {
      if (_downloadId !== downloadId) return;
      console.log('download.error', downloadId);
      setPercent(0);
      setDownloading(false);
    });
  };

  const handleCancel = async () => {
    try {
      await ipcRenderer.invoke('download.cancel', { downloadId });
      setPercent(0);
      setDownloading(false);
      messageApi.open({
        type: 'success',
        content: '取消成功',
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div key={item.name}>
      {contextHolder}

      <Flex justify="space-between">
        <Flex direction="column">
          <Text size="sm" fw="bold">
            模型名称：{item.name}
          </Text>
          <Space h="xs" />
          <Flex align="center">
            <Text size="sm" fw="bold" style={{ flexShrink: 0 }}>
              下载位置：
            </Text>
            <Text size="xs" lineClamp={2} style={{ flexShrink: 1 }}>
              {`${targetInstallDir}`}
            </Text>
          </Flex>
        </Flex>

        <Flex direction="column" justify="center" style={{ flexShrink: 0 }}>
          <Flex align="center">
            {pathExist && (
              <Text size="xs" lineClamp={1}>
                已存在
              </Text>
            )}
            <Space w="md" />
            {!pathExist && !percent && (
              <Button
                onClick={handleDownload}
                disabled={downloading}
                size="xs"
                leftSection={<IconDownload size={14} />}
              >
                下载
              </Button>
            )}
            {percent !== 0 && percent !== 100 && (
              <Popconfirm
                title="提示"
                description="确认取消下载吗？"
                okText="确认"
                cancelText="取消"
                onConfirm={handleCancel}
              >
                <Button variant="outline" color="red" size="xs" leftSection={<IconX size={14} />}>
                  取消
                </Button>
              </Popconfirm>
            )}
            {pathExist && (
              <Popconfirm
                title="提示"
                description="确认删除该模型吗？"
                okText="确认"
                cancelText="取消"
                onConfirm={handleDelete}
              >
                <Button
                  size="xs"
                  loading={deleteLoading}
                  leftSection={<IconX size={14} />}
                  variant="outline"
                  color="red"
                >
                  删除
                </Button>
              </Popconfirm>
            )}
            <Space w="2" />
            <CopyButton value={targetInstallDir}>
              {({ copied, copy }) => (
                <Button size="xs" color={copied ? 'teal' : 'blue'} variant="outline" onClick={copy}>
                  {copied ? '复制成功' : '复制路径'}
                </Button>
              )}
            </CopyButton>
            <Space w="2" />
            <Button size="xs" variant="default" component="a" target="_blank" href={item.url}>
              浏览器打开
            </Button>
            <Space w="2" />
            <Button
              size="xs"
              leftSection={<IconExternalLink size={14} />}
              variant="default"
              component="a"
              target="_blank"
              href={item.source}
            >
              来源
            </Button>
          </Flex>
          {percent !== 0 && percent !== 100 && (
            <>
              <Space h="sm" />
              <Flex>
                <Space w="lg" />
                <Progress percent={percent} status="active" />
              </Flex>
            </>
          )}
        </Flex>
      </Flex>

      <Divider my="md" variant="dashed" />
    </div>
  );
}

export default function PluginModel({ item, opened, onClose }) {
  const [value, setValue] = useState('');
  const [modelList, setModelList] = useState(() => item?.modelList || []);
  const downloading = useComfyStore((state) => state.downloading);

  const handleSearch = (event) => {
    const search = event.currentTarget.value;
    setValue(search);
    if (search === '') {
      setModelList(item?.modelList || []);
      return;
    }
    const newModelList = modelList.filter((data) => !search || data.name.toLowerCase().includes(search.toLowerCase()));
    setModelList(newModelList);
  };

  return (
    <Drawer opened={opened} onClose={onClose} closeOnClickOutside={false} position="top" title="模型下载" size="sm">
      <Card shadow="none" radius="md">
        <TextInput
          value={value}
          onChange={(event) => handleSearch(event)}
          disabled={downloading}
          leftSectionPointerEvents="none"
          leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} />}
          label=""
          placeholder="搜索模型名称"
        />
        <Space h="lg" />
        {modelList.map((model) => {
          return <ModelItem item={model} key={model.name} />;
        })}

        {!modelList?.length && (
          <Text fw="bold" size="xs">
            来到了一片无人的区域....
          </Text>
        )}
      </Card>
    </Drawer>
  );
}
