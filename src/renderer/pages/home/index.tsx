import { Button, Flex, Space, Card, Anchor, Grid, Group, Text, Title, Avatar } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

import styles from './styles.module.scss';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.home}>
      <Grid mt="sm">
        <Grid.Col span={6}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mt="md" mb="xs">
              <Avatar variant="filled" radius="sm" src="https://avatars.githubusercontent.com/u/121283862?v=4" />
              <Title order={4}>ComfyUI启动器</Title>
            </Group>

            <Space h="md" />

            <Flex>
              <Anchor size="sm" href="" target="_blank">
                视频教程
              </Anchor>
              <Text size="sm" c="dimmed" px="2px">
                |
              </Text>
              <Anchor size="sm" href="" target="_blank">
                文章教程
              </Anchor>
            </Flex>

            <Space h="md" />

            <Button color="blue" fullWidth mt="md" radius="md" onClick={() => navigate('/comfyui')}>
              进入魔法世界
            </Button>
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  );
}
