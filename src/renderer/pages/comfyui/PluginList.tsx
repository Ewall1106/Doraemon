import { useEffect, useState } from 'react';
import { Button, Flex, Space, Card, Text, Anchor, SimpleGrid, Pill } from '@mantine/core';
import { IconDownload, IconRefresh, IconX } from '@tabler/icons-react';
import { message, Popconfirm } from 'antd';
import gitUrlParse from 'git-url-parse';
import { useComfyStore } from '@/store';

import styles from './styles.module.scss';

const { ipcRenderer } = window.electron;

// 操作按钮
export function ActionButton({ item }) {
  const [pathExist, setPathExist] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [installLoading, setInstallLoading] = useState(false);
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
        )}
      </Flex>
    </>
  );
}

// 插件列表
export default function PluginList() {
  const [tipOne, setTipOne] = useState(true);
  const [tipTwo, setTipTwo] = useState(true);
  const [tipThree, setTipThree] = useState(true);
  const info = useComfyStore((state) => state.info);

  const onRemove = (idx) => {
    if (idx === 1) {
      setTipOne(false);
    } else if (idx === 2) {
      setTipTwo(false);
    } else {
      setTipThree(false);
    }
  };

  return (
    <div className={styles.home}>
      <Card shadow="none" m="md" padding="lg" radius="md">
        <Text size="sm">插件列表：</Text>
        <Space h="xs" />
        <div>
          {tipOne && (
            <Pill onRemove={() => onRemove(1)} withRemoveButton>
              插件每日凌晨进行自动同步更新
            </Pill>
          )}
        </div>
        <div>
          {tipTwo && (
            <Pill onRemove={() => onRemove(2)} withRemoveButton>
              每次安装或更新插件后记得关闭【终端】，然后点击【一键启动】重启
            </Pill>
          )}
        </div>
        <div>
          {tipThree && (
            <Pill onRemove={() => onRemove(3)} withRemoveButton>
              本启动器没有对官方代码做任何侵入，启动时把&quot;魔法&quot;打开可以更好的减少插件内部由于网络导致的报错
            </Pill>
          )}
        </div>
        <Space h="sm" />
        <SimpleGrid cols={{ base: 1, sm: 3, lg: 5 }}>
          {info.pluginList.map((item) => {
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
                  <Anchor size="sm" href={item.git_cn_preview} target="_blank">
                    国内镜像
                  </Anchor>
                </Flex>
                <Space h="md" />
                <ActionButton item={item} />
              </Card>
            );
          })}
        </SimpleGrid>
      </Card>
    </div>
  );
}
