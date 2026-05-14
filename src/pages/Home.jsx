import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Typography, Button, Statistic, Spin } from 'antd';
import { getPosts, getSchedules, getChats } from '../api/apiClient';

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

  const loading = postsLoading || schedulesLoading || chatsLoading;

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card style={{ borderRadius: 16, minHeight: 280 }} bodyStyle={{ padding: 28 }}>
            <Title level={3} style={{ marginBottom: 8 }}>
              가족 허브에 오신 것을 환영합니다
            </Title>
            <Paragraph style={{ marginBottom: 16, maxWidth: 560 }}>
              게시판, 일정, 채팅을 한 곳에서 관리하며 가족 소통을 간편하게 만듭니다.
            </Paragraph>
            <Paragraph type="secondary">
              클라우드 백엔드와 연동되어 데이터를 실시간으로 표시합니다.
            </Paragraph>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card style={{ borderRadius: 16, minHeight: 280, padding: 24 }}>
            <Text strong style={{ fontSize: 16 }}>서비스 요약</Text>
            <div style={{ marginTop: 20 }}>
              <Card type="inner" size="small" title="게시판" style={{ borderRadius: 12, marginBottom: 16 }}>
                <Statistic value={posts.length} suffix="개" />
              </Card>
              <Card type="inner" size="small" title="일정" style={{ borderRadius: 12, marginBottom: 16 }}>
                <Statistic value={schedules.length} suffix="개" />
              </Card>
              <Card type="inner" size="small" title="채팅" style={{ borderRadius: 12 }}>
                <Statistic value={chats.length} suffix="개" />
              </Card>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 16, minHeight: 300 }} bodyStyle={{ padding: 24 }}>
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
          <Card style={{ borderRadius: 16, minHeight: 300 }} bodyStyle={{ padding: 24 }}>
            <Title level={4}>예정된 일정</Title>
            <Paragraph type="secondary" style={{ marginBottom: 18 }}>
              백엔드에서 불러온 최신 가족 일정을 확인합니다.
            </Paragraph>
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
          <Card style={{ borderRadius: 16, minHeight: 300 }} bodyStyle={{ padding: 24 }}>
            <Title level={4}>최근 채팅</Title>
            <Paragraph type="secondary" style={{ marginBottom: 18 }}>
              최근 채팅 메시지 내용을 보여줍니다.
            </Paragraph>
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