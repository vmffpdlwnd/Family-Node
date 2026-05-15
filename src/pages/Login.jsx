import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, message, Tabs } from 'antd';
import { login as loginRequest, register as registerRequest } from '../api/apiClient';
import useAuthStore from '../store/authStore';

const { Title, Paragraph } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const { user, setAuth, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

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

  const onRegister = async ({ username, password, nickname }) => {
    setLoading(true);
    try {
      await registerRequest({ username, password, nickname });
      message.success('회원가입이 완료되었습니다. 로그인해주세요.');
      setActiveTab('login');
    } catch (error) {
      message.error(error.message || '회원가입에 실패했습니다.');
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
          <Paragraph>{user.nickname || user.username}님, 반갑습니다.</Paragraph>
          <Button type="primary" onClick={() => navigate('/')} style={{ marginRight: 12 }}>
            홈으로
          </Button>
          <Button onClick={handleLogout}>로그아웃</Button>
        </Card>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'login',
      label: '로그인',
      children: (
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
      ),
    },
    {
      key: 'register',
      label: '회원가입',
      children: (
        <Form layout="vertical" onFinish={onRegister}>
          <Form.Item
            name="username"
            label="아이디"
            rules={[{ required: true, message: '아이디를 입력해주세요.' }]}
          >
            <Input placeholder="아이디" />
          </Form.Item>

          <Form.Item
            name="nickname"
            label="닉네임"
          >
            <Input placeholder="닉네임 (선택)" />
          </Form.Item>

          <Form.Item
            name="password"
            label="비밀번호"
            rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
          >
            <Input.Password placeholder="비밀번호" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="비밀번호 확인"
            dependencies={[ 'password' ]}
            rules={[
              { required: true, message: '비밀번호를 확인해주세요.' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="비밀번호 확인" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              회원가입
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 160px)' }}>
      <Card style={{ width: 420, borderRadius: 16 }}>
        <Title level={3}>가족 사이트 접속하기</Title>
        <Paragraph>로그인하거나 새 계정을 만들어 가족 기능을 사용하세요.</Paragraph>

        <Tabs
          activeKey={activeTab}
          items={tabItems}
          onChange={(key) => setActiveTab(key)}
        />
      </Card>
    </div>
  );
};

export default Login;
