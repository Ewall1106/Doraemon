import { useState } from 'react';
import { Flex, Space, Card, Text, Anchor, SimpleGrid, Pill } from '@mantine/core';
import { useComfyStore } from '@/store';
import PluginAction from './PluginAction';

import styles from './styles.module.scss';

export default function PluginList() {
  const [tipOne, setTipOne] = useState(true);
  const [tipTwo, setTipTwo] = useState(true);
  const info = useComfyStore((state) => state.info);

  const onRemove = (idx) => {
    if (idx === 1) {
      setTipOne(false);
    } else if (idx === 2) {
      setTipTwo(false);
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
        <Space h="sm" />
        <SimpleGrid cols={{ base: 1, sm: 3, lg: 4 }}>
          {info.pluginList.map((item) => {
            return (
              <Card style={{ width: '100%' }} shadow="none" padding="xs" radius="md" withBorder key={item.name}>
                <Text size="sm" fw="bold">
                  {item.name}
                </Text>
                <Space h="md" />
                <Flex>
                  {item?.linkList &&
                    item.linkList.map((info, jdx) => {
                      return (
                        <Flex key={jdx}>
                          <Anchor size="sm" href={info.link} target="_blank">
                            {info.name}
                          </Anchor>
                          {jdx !== item.linkList.length - 1 && (
                            <Text size="sm" c="dimmed" px="2px">
                              |
                            </Text>
                          )}
                        </Flex>
                      );
                    })}
                </Flex>
                <Space h="md" />
                <PluginAction item={item} />
              </Card>
            );
          })}
          <Card style={{ width: '100%' }} shadow="none" padding="xs" radius="md" withBorder>
            <Text size="sm" fw="bold">
              更多插件接入中...
            </Text>
            <Space h="md" />
            <Flex>
              <Anchor size="sm" href="https://github.com/Ewall1106/Doraemon" target="_blank">
                欢迎提出你的意见 && 共同进行开源建设
              </Anchor>
            </Flex>
            <Space h="md" />
          </Card>
        </SimpleGrid>
      </Card>
    </div>
  );
}
