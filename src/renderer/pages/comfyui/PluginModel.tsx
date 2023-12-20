import { useState, useEffect } from 'react';
import { Button, Flex, Space, Card, Text, Input, Divider, CopyButton } from '@mantine/core';
import { IconDownload, IconExternalLink, IconX } from '@tabler/icons-react';
import { message, Popconfirm } from 'antd';
import { useComfyStore } from '@/store';

const { ipcRenderer } = window.electron;

export function ModelDownlod({ item }) {
  const [pathExist, setPathExist] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const installPath = useComfyStore((state) => state.installPath);
  const [messageApi, contextHolder] = message.useMessage();

  const targetInstallPath = `${installPath}/comfyui-portable/ComfyUI/custom_nodes/${item.targetInstallPath}/${item.name}`;

  useEffect(() => {
    const checkPathExists = async () => {
      const exist: any = await ipcRenderer.invoke('fs.pathExists', { path: targetInstallPath });
      setPathExist(exist);
    };

    checkPathExists();
  }, []);

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await ipcRenderer.invoke('fs.remove', { path: targetInstallPath });
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

  return (
    <div key={item.name}>
      {contextHolder}
      <Divider my="md" variant="dashed" />
      <Flex align="center">
        <Flex direction="column" align="flex-end" style={{ flexGrow: 1 }}>
          <Flex justify="space-between" style={{ width: '100%' }}>
            <Text size="sm" fw="bold">
              模型名称：{item.name}
            </Text>
            {pathExist && <Text size="xs">已存在</Text>}
          </Flex>
        </Flex>
        <Space w="md" />
        {!pathExist && (
          <Button size="xs" leftSection={<IconDownload size={14} />} component="a" target="_blank" href={item.url}>
            下载
          </Button>
        )}
        {pathExist && (
          <Popconfirm
            title="提示"
            description="确认删除该模型吗？"
            okText="确认"
            cancelText="取消"
            onConfirm={handleDelete}
          >
            <Button size="xs" loading={deleteLoading} leftSection={<IconX size={14} />} variant="outline" color="red">
              删除
            </Button>
          </Popconfirm>
        )}
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
    </div>
  );
}

export default function PluginModel({ item }) {
  const installPath = useComfyStore((state) => state.installPath);
  const targetInstallDir = `${installPath}/comfyui-portable/ComfyUI/${item?.modelList?.[0]?.targetInstallPath}`;

  return (
    <Card shadow="none" m="md" padding="lg" radius="md">
      <Flex align="center">
        <Text size="sm" fw="bold">
          下载位置：
        </Text>
        <Input style={{ flexGrow: 1 }} size="xs" disabled placeholder="安装地址" value={targetInstallDir} />
        <Space w="xs" />
        <CopyButton value={targetInstallDir}>
          {({ copied, copy }) => (
            <Button size="xs" color={copied ? 'teal' : 'blue'} variant="outline" onClick={copy}>
              {copied ? '复制成功' : '复制路径'}
            </Button>
          )}
        </CopyButton>
      </Flex>

      {item?.modelList &&
        item.modelList.map((model) => {
          return <ModelDownlod item={model} key={model.name} />;
        })}
    </Card>
  );
}
