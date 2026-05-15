import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Typography, Button, Spin } from 'antd';
import useAuthStore from '../store/authStore';
import { getPosts, getSchedules, getChats, getUsers } from '../api/apiClient';

const { Title, Paragraph, Text } = Typography;

const Home = () => {
  const navigate = useNavigate();

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  });
  const { data: schedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: getSchedules,
  });
  const { data: chats = [], isLoading: chatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: getChats,
    refetchInterval: 10000,
  });

  const latestPost = useMemo(() => posts[0], [posts]);
  const nextSchedule = useMemo(() => {
    if (!schedules.length) return null;
    return [...schedules].sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0];
  }, [schedules]);
  const latestChat = useMemo(() => (chats.length ? chats[chats.length - 1] : null), [chats]);
  const { user } = useAuthStore();
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['home-users'],
    queryFn: getUsers,
    enabled: user?.role === 'admin',
  });

  const totalUsers = users.length;
  const approvedUsers = users.filter((account) => account.role === 'member' || account.role === 'admin').length;
  const accessRate = totalUsers ? Math.round((approvedUsers / totalUsers) * 100) : 0;

  const loading = postsLoading || schedulesLoading || chatsLoading;

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card style={{ borderRadius: 16, minHeight: 280 }} styles={{ body: { padding: 28 } }}>
            <Title level={3} style={{ marginBottom: 8 }}>
              가족 허브에 오신 것을 환영합니다
            </Title>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card style={{ borderRadius: 16, minHeight: 280, padding: 24 }}>
            <Text strong style={{ fontSize: 16 }}>통계</Text>
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Text>로그인한 멤버 접속율</Text>
              <Text style={{ fontSize: 36, fontWeight: 700 }}>
                {user?.role === 'admin' ? `${accessRate}%` : '로그인 후 확인'}
              </Text>
              {user?.role === 'admin' && <Text type="secondary">승인된 멤버/관리자 비율 기준</Text>}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 16, minHeight: 300 }} styles={{ body: { padding: 24 } }}>
            <Title level={4}>최신 게시글</Title>
            <Paragraph type="secondary" style={{ marginBottom: 18 }}>
              클라우드 백엔드에서 로드된 최신 게시글입니다.
            </Paragraph>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <Spin />
              </div>
            ) : latestPost ? (
              <div>
                <Text strong>{latestPost.title}</Text>
                <div style={{ marginTop: 12, color: '#666' }}>{latestPost.content?.slice(0, 100)}...</div>
              </div>
            ) : (
              <Text type="secondary">게시글이 아직 없습니다.</Text>
            )}
            <Button type="primary" block style={{ marginTop: 20 }} onClick={() => navigate('/board')}>
              게시판 바로가기
            </Button>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 16, minHeight: 300 }} styles={{ body: { padding: 24 } }}>
            <Title level={4}>예정된 일정</Title>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <Spin />
              </div>
            ) : nextSchedule ? (
              <div>
                <Text strong>{nextSchedule.title}</Text>
                <div style={{ marginTop: 12, color: '#666' }}>
                  {new Date(nextSchedule.start_date).toLocaleString()}
                </div>
              </div>
            ) : (
              <Text type="secondary">등록된 일정이 없습니다.</Text>
            )}
            <Button block style={{ marginTop: 20 }} onClick={() => navigate('/schedule')}>
              가족 일정 확인
            </Button>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 16, minHeight: 300 }} styles={{ body: { padding: 24 } }}>
            <Title level={4}>최근 채팅</Title>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <Spin />
              </div>
            ) : latestChat ? (
              <div>
                <Text strong>{latestChat.message?.slice(0, 60)}</Text>
                <div style={{ marginTop: 12, color: '#666' }}>{new Date(latestChat.created_at).toLocaleString()}</div>
              </div>
            ) : (
              <Text type="secondary">채팅 기록이 없습니다.</Text>
            )}
            <Button type="primary" block style={{ marginTop: 20 }} onClick={() => navigate('/chat')}>
              채팅 바로가기
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;