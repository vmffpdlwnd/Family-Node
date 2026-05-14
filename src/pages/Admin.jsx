import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Typography, Button, Result, Spin } from 'antd';
import { DatabaseOutlined, CalendarOutlined, MessageOutlined, HomeOutlined } from '@ant-design/icons';
import { getPosts, getSchedules, getChats } from '../api/apiClient';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!user) {
    return (
      <Result
        status="403"
        title="접근 권한이 없습니다"
        subTitle="관리자 계정으로 로그인해야 관리자 페이지에 접근할 수 있습니다."
        extra={[
          <Button type="primary" key="login" onClick={() => navigate('/login')}>
            로그인
          </Button>,
        ]}
      />
    );
  }

  if (user.role !== 'admin') {
    return (
      <Result
        status="403"
        title="권한이 없습니다"
        subTitle="현재 계정은 관리자 권한이 없습니다."
        extra={[
          <Button key="home" onClick={() => navigate('/')}>
            홈으로 돌아가기
          </Button>,
        ]}
      />
    );
  }

  const { data: posts = [], isLoading: postsLoading } = useQuery({ queryKey: ['admin-posts'], queryFn: getPosts });
  const { data: schedules = [], isLoading: schedulesLoading } = useQuery({ queryKey: ['admin-schedules'], queryFn: getSchedules });
  const { data: chats = [], isLoading: chatsLoading } = useQuery({ queryKey: ['admin-chats'], queryFn: getChats, refetchInterval: 10000 });

  const loading = postsLoading || schedulesLoading || chatsLoading;

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card style={{ borderRadius: 16, padding: 28 }}>
            <Title level={3}>관리자 대시보드</Title>
            <Paragraph>
              관리자 권한으로 가족 사이트의 데이터 요약과 빠른 이동 버튼을 확인할 수 있습니다.
            </Paragraph>
            <Text type="secondary">현재 계정: {user.username} ({user.role})</Text>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="게시판" style={{ borderRadius: 16 }}>
            {loading ? <Spin /> : <Text strong>{posts.length}</Text>}
            <Paragraph style={{ marginTop: 12 }}>
              전체 게시글 수를 확인하고 게시판 페이지로 이동하세요.
            </Paragraph>
            <Button type="primary" icon={<DatabaseOutlined />} onClick={() => navigate('/board')}>
              게시판 관리
            </Button>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="일정" style={{ borderRadius: 16 }}>
            {loading ? <Spin /> : <Text strong>{schedules.length}</Text>}
            <Paragraph style={{ marginTop: 12 }}>
              전체 일정 수를 확인하고 일정 페이지로 이동하세요.
            </Paragraph>
            <Button icon={<CalendarOutlined />} onClick={() => navigate('/schedule')}>
              일정 관리
            </Button>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="채팅" style={{ borderRadius: 16 }}>
            {loading ? <Spin /> : <Text strong>{chats.length}</Text>}
            <Paragraph style={{ marginTop: 12 }}>
              채팅 메시지 수를 확인하고 채팅 페이지로 이동하세요.
            </Paragraph>
            <Button icon={<MessageOutlined />} onClick={() => navigate('/chat')}>
              채팅 관리
            </Button>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card style={{ borderRadius: 16 }}>
            <Title level={4}>관리자 팁</Title>
            <Paragraph>
              현재 페이지는 관리자 전용 대시보드입니다. 페이지를 확장하여 사용자 관리, 신고 처리, 통계 확인 등 추가 기능을 만들 수 있습니다.
            </Paragraph>
            <Button icon={<HomeOutlined />} onClick={() => navigate('/')}>홈으로 이동</Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Admin;
