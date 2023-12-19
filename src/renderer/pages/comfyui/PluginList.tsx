import { useState } from 'react';
import { Flex, Space, Card, Text, Anchor, SimpleGrid, Pill } from '@mantine/core';
import { useComfyStore } from '@/store';
import PluginAction from './PluginAction';

import styles from './styles.module.scss';

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
                <PluginAction item={item} />
              </Card>
            );
          })}
        </SimpleGrid>
      </Card>
    </div>
  );
}
