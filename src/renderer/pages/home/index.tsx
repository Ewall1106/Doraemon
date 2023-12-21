import { Button, Flex, Space, Card, Anchor, Group, Text, Title, Avatar, SimpleGrid, Image } from '@mantine/core';
import { IconBrandGithubFilled } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, useComfyStore } from '@/store';
import logo from '../../../../assets/icon.svg';
import styles from './styles.module.scss';

export default function Home() {
  const navigate = useNavigate();
  const appInfo = useAppStore((state) => state.appInfo);
  const setComfyInfo = useComfyStore((state) => state.setInfo);

  const handleNavigate = (item) => {
    // 非通用项目
    if (item.route === '/comfyui') {
      setComfyInfo(item);
    }

    navigate(item.route);
  };

  return (
    <div className={styles.home}>
      <div className={styles.header}>
        <Flex align="center">
          <Image width={40} height={40} src={logo} alt="Doraemon" />
          <Space w="xs" />
          <Title order={5}>AI百宝箱</Title>
        </Flex>
        <Button
          rightSection={<IconBrandGithubFilled />}
          variant="light"
          component="a"
          target="_blank"
          href="https://github.com/Ewall1106/Doraemon"
        >
          Github
        </Button>
      </div>

      <Space h={60} />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {appInfo?.appList &&
          appInfo.appList.map((item, idx) => {
            return (
              <Card shadow="sm" padding="lg" radius="md" withBorder key={idx}>
                <Group mt="md" mb="xs">
                  <Avatar variant="filled" radius="sm" src={item.logo} />
                  <Flex direction="column">
                    <Title order={4}>{item.name}</Title>
                    <Text c="dimmed" fz="sm">
                      {item.brief}
                    </Text>
                  </Flex>
                </Group>

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

                {item?.buttonText && (
                  <Button color="blue" fullWidth mt="md" radius="md" onClick={() => handleNavigate(item)}>
                    {item.buttonText}
                  </Button>
                )}
              </Card>
            );
          })}
      </SimpleGrid>
    </div>
  );
}
