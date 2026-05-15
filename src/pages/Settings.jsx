import React, { useEffect } from 'react';
import { Card, Form, Input, Typography, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { updateProfile } from '../api/apiClient';

const { Title, Paragraph, Text } = Typography;

const Settings = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user, token, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({ nickname: user.nickname || '' });
    }
  }, [user, form]);

  const handleFinish = async ({ nickname }) => {
    if (!user) return;
    try {
      const updatedUser = await updateProfile({ nickname: nickname?.trim() || '' });
      message.success('닉네임이 저장되었습니다.');
      setAuth(updatedUser, token);
      form.setFieldsValue({ nickname: updatedUser.nickname || '' });
    } catch (error) {
      message.error(error.message || '닉네임 저장에 실패했습니다.');
    }
  };

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
          <Text strong>닉네임:</Text> {user.nickname || '설정된 닉네임이 없습니다.'}
        </Paragraph>
        <Paragraph>
          <Text strong>권한:</Text> {user.role || 'guest'}
        </Paragraph>

        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 24 }}>
          <Form.Item
            name="nickname"
            label="닉네임"
            help="닉네임을 입력하면 게시판과 채팅에서 표시됩니다."
          >
            <Input placeholder="새 닉네임을 입력하세요" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              닉네임 저장
            </Button>
            <Button danger style={{ marginLeft: 12 }} onClick={() => { clearAuth(); navigate('/'); }}>
              로그아웃
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;
