import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { login as loginRequest } from '../api/apiClient';
import useAuthStore from '../store/authStore';

const { Title, Paragraph } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const { user, setAuth, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const data = await loginRequest(values);
      setAuth(data.user, data.token);
      message.success('로그인되었습니다.');
      navigate('/');
    } catch (error) {
      message.error(error.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    message.info('로그아웃 되었습니다.');
    navigate('/');
  };

  if (user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 160px)' }}>
        <Card style={{ width: 420, borderRadius: 16 }}>
          <Title level={4}>이미 로그인되어 있습니다.</Title>
          <Paragraph>{user.username}님, 반갑습니다.</Paragraph>
          <Button type="primary" onClick={() => navigate('/')} style={{ marginRight: 12 }}>
            홈으로
          </Button>
          <Button onClick={handleLogout}>로그아웃</Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 160px)' }}>
      <Card style={{ width: 420, borderRadius: 16 }}>
        <Title level={3}>로그인</Title>
        <Paragraph>가족 사이트에 로그인하여 게시글, 일정, 채팅을 사용할 수 있습니다.</Paragraph>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="username"
            label="아이디"
            rules={[{ required: true, message: '아이디를 입력해주세요.' }]}
          >
            <Input placeholder="아이디" />
          </Form.Item>

          <Form.Item
            name="password"
            label="비밀번호"
            rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
          >
            <Input.Password placeholder="비밀번호" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              로그인
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
