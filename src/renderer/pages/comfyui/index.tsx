import React from 'react';
import { OpenDialogReturnValue } from 'electron';
import { Button, Flex, Space, Card, Anchor, Grid, Image, Group, Text, Input, Title } from '@mantine/core';
import { message } from 'antd';
import { IconFile } from '@tabler/icons-react';
import { useComfyStore } from '@/store';

import styles from './styles.module.scss';

const { ipcRenderer } = window.electron;

export default function ComfyUI() {
  const installPath = useComfyStore((state) => state.installPath);
  const setInstallPath = useComfyStore((state) => state.setInstallPath);

  const [messageApi, contextHolder] = message.useMessage();

  return (
    <div className={styles.home}>
      {contextHolder}

      <div>12312</div>
    </div>
  );
}
