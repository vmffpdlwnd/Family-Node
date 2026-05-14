import React from 'react';
import { Card, Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const { Title, Paragraph, Text } = Typography;

const Settings = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <Card style={{ borderRadius: 16 }}>
          <Title level={3}>설정</Title>
          <Paragraph>로그인하면 가족 게시판, 일정, 채팅 기능을 모두 사용할 수 있습니다.</Paragraph>
          <Button type="primary" onClick={() => navigate('/login')}>
            로그인하러 가기
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ borderRadius: 16 }}>
        <Title level={3}>내 정보</Title>
        <Paragraph>
          <Text strong>아이디:</Text> {user.username}
        </Paragraph>
        <Paragraph>
          <Text strong>권한:</Text> {user.role || 'guest'}
        </Paragraph>
        <Button danger onClick={() => { clearAuth(); navigate('/'); }}>
          로그아웃
        </Button>
      </Card>
    </div>
  );
};

export default Settings;
