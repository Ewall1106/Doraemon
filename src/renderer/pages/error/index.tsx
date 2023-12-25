import { Result } from 'antd';
import { Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div>
      <Result
        status="404"
        title="404"
        subTitle="抱歉，好像除了点问题... 检查下网络/重启/联系作者反馈一下吧"
        extra={<Button onClick={() => navigate('/')}>返回首页</Button>}
      />
    </div>
  );
}
