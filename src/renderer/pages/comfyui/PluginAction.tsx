import { useEffect, useState } from 'react';
import { Button, Flex, Space, Drawer } from '@mantine/core';
import { IconDownload, IconRefresh, IconX } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { message, Popconfirm } from 'antd';
import gitUrlParse from 'git-url-parse';
import { useComfyStore } from '@/store';
import PluginModel from './PluginModel';

const { ipcRenderer } = window.electron;

export default function PluginAction({ item }) {
  const [pathExist, setPathExist] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [installLoading, setInstallLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const installPath = useComfyStore((state) => state.installPath);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const checkPathExists = async () => {
      const parsedUrl = gitUrlParse(item.git_cn);
      const targetDirectory = `${installPath}/comfyui-portable/ComfyUI/custom_nodes/${parsedUrl.name}`;
      const exist: any = await ipcRenderer.invoke('fs.pathExists', { path: targetDirectory });
      setPathExist(exist);
    };

    checkPathExists();
  }, [installPath]);

  const handlePluginClone = async () => {
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

    try {
      setInstallLoading(true);
      const parsedUrl = gitUrlParse(item.git_cn);
      const targetDirectory = `${installPath}/comfyui-portable/ComfyUI/custom_nodes/${parsedUrl.name}`;
      await ipcRenderer.invoke('fs.ensureDir', { path: targetDirectory });
      await ipcRenderer.invoke('git.clone', { repoURL: item.git_cn, targetDirectory });
      setPathExist(true);
      messageApi.open({
        type: 'success',
        content: '安装成功，记得重启哦',
      });
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: '安装失败',
      });
    }
    setInstallLoading(false);
  };

  const handlePluginPull = async () => {
    try {
      setUpdateLoading(true);
      const parsedUrl = gitUrlParse(item.git_cn);
      const targetDirectory = `${installPath}/comfyui-portable/ComfyUI/custom_nodes/${parsedUrl.name}`;
      await ipcRenderer.invoke('git.pull', { targetDirectory });
      messageApi.open({
        type: 'success',
        content: '更新成功，记得重启哦',
      });
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: '更新失败',
      });
    }
    setUpdateLoading(false);
  };

  const handlePluginDel = async () => {
    try {
      setDeleteLoading(true);
      const parsedUrl = gitUrlParse(item.git_cn);
      const targetDirectory = `${installPath}/comfyui-portable/ComfyUI/custom_nodes/${parsedUrl.name}`;
      await ipcRenderer.invoke('fs.remove', { path: targetDirectory });
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
    <>
      {contextHolder}

      <Drawer opened={opened} onClose={close} position="top" title="模型下载" size="sm">
        <PluginModel item={item} />
      </Drawer>

      <Flex>
        {pathExist ? (
          <Popconfirm
            title="提示"
            description="确认卸载删除该插件吗？"
            okText="确认"
            cancelText="取消"
            onConfirm={handlePluginDel}
          >
            <Button
              loading={deleteLoading}
              variant="outline"
              color="red"
              rightSection={<IconX size={14} />}
              size="xs"
              radius="md"
            >
              卸载
            </Button>
          </Popconfirm>
        ) : (
          <Button
            loading={installLoading}
            variant="outline"
            rightSection={<IconDownload size={14} />}
            size="xs"
            radius="md"
            onClick={handlePluginClone}
          >
            安装
          </Button>
        )}
        <Space w="xs" />
        {pathExist && (
          <>
            <Button
              loading={updateLoading}
              rightSection={<IconRefresh size={14} />}
              variant="default"
              size="xs"
              radius="md"
              onClick={handlePluginPull}
            >
              更新
            </Button>
            <Space w="xs" />
            {item?.modelList?.length > 0 && (
              <Button rightSection={<IconDownload size={14} />} variant="default" size="xs" radius="md" onClick={open}>
                模型下载
              </Button>
            )}
          </>
        )}
      </Flex>
    </>
  );
}
