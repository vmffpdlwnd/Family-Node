import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Row, Col, Typography, Button, Result, Spin, List, Tag, Space, message, Divider, Select } from 'antd';
import { DatabaseOutlined, CalendarOutlined, MessageOutlined, HomeOutlined, TeamOutlined } from '@ant-design/icons';
import { getPosts, getSchedules, getChats, getUsers, updateUserRole } from '../api/apiClient';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
  const { data: users = [], isLoading: usersLoading, isError: usersError, error: usersErrorDetails, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getUsers,
    enabled: user.role === 'admin',
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const totalUsers = users.length;
  const approvedUsers = users.filter((account) => account.role === 'member' || account.role === 'admin').length;
  const accessRate = totalUsers ? Math.round((approvedUsers / totalUsers) * 100) : 0;

  const { mutate: updateRole, isLoading: isUpdatingRole } = useMutation({
    mutationFn: ({ id, role }) => updateUserRole(id, role),
    onSuccess: () => {
      message.success('사용자 역할을 변경했습니다.');
    },
    onError: (error) => {
      message.error(error.message || '역할 변경에 실패했습니다.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const loading = postsLoading || schedulesLoading || chatsLoading || usersLoading;

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card style={{ borderRadius: 16, padding: 28 }}>
            <Title level={3}>관리자 대시보드</Title>
            <Text type="secondary">현재 계정: {user.nickname || user.username} ({user.role})</Text>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card title="게시판" style={{ borderRadius: 16 }}>
            <Paragraph style={{ marginBottom: 8 }}>게시판 전체 게시글 수</Paragraph>
            {loading ? <Spin /> : <Text strong style={{ fontSize: 24 }}>{posts.length}</Text>}
            <Button type="primary" icon={<DatabaseOutlined />} onClick={() => navigate('/board')} style={{ marginTop: 16 }}>
              게시판 보기
            </Button>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card title="일정" style={{ borderRadius: 16 }}>
            <Paragraph style={{ marginBottom: 8 }}>등록된 가족 일정 개수</Paragraph>
            {loading ? <Spin /> : <Text strong style={{ fontSize: 24 }}>{schedules.length}</Text>}
            <Button icon={<CalendarOutlined />} onClick={() => navigate('/schedule')} style={{ marginTop: 16 }}>
              일정 보기
            </Button>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card title="채팅" style={{ borderRadius: 16 }}>
            <Paragraph style={{ marginBottom: 8 }}>채팅 메시지 합계</Paragraph>
            {loading ? <Spin /> : <Text strong style={{ fontSize: 24 }}>{chats.length}</Text>}
            <Button icon={<MessageOutlined />} onClick={() => navigate('/chat')} style={{ marginTop: 16 }}>
              채팅 보기
            </Button>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card title="접속율" style={{ borderRadius: 16 }}>
            <Paragraph style={{ marginBottom: 8 }}>로그인한 멤버 접속율</Paragraph>
            {loading ? <Spin /> : <Text strong style={{ fontSize: 24 }}>{accessRate}%</Text>}
            <Button icon={<TeamOutlined />} onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} style={{ marginTop: 16 }}>
              사용자 관리
            </Button>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card style={{ borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
              <div>
                <Title level={4}>사용자 목록</Title>
                <Paragraph>현재 등록된 사용자와 역할 상태를 확인하고, 게스트를 멤버로 승급할 수 있습니다.</Paragraph>
              </div>
              <Button onClick={() => refetchUsers()} loading={usersLoading}>
                사용자 새로고침
              </Button>
            </div>

            {usersError ? (
              <Text type="danger">사용자 목록을 불러오는 중 오류가 발생했습니다: {usersErrorDetails?.message || '알 수 없는 오류'}</Text>
            ) : (
              <List
                dataSource={users}
                loading={usersLoading}
                renderItem={(account) => {
                  const isSelf = account.id === user.id;
                  return (
                    <List.Item
                      actions={[
                        <Select
                          key="role"
                          value={account.role}
                          onChange={(value) => updateRole({ id: account.id, role: value })}
                          style={{ width: 140 }}
                          disabled={isSelf}
                          loading={isUpdatingRole}
                        >
                          <Option value="guest">guest</Option>
                          <Option value="member">member</Option>
                          <Option value="admin">admin</Option>
                        </Select>,
                      ]}
                    >
                      <List.Item.Meta
                        title={account.nickname || account.username}
                        description={
                          <Space direction="vertical" size="small">
                            <Space size="small">
                              <Tag color={account.role === 'admin' ? 'red' : account.role === 'member' ? 'green' : 'default'}>
                                {account.role}
                              </Tag>
                              <Text type="secondary">{new Date(account.created_at).toLocaleDateString()}</Text>
                              {isSelf && <Text type="secondary">(본인 계정)</Text>}
                            </Space>
                            <Text type="secondary">닉네임: {account.nickname || '-'}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
                locale={{ emptyText: '등록된 사용자가 없습니다.' }}
              />
            )}

            <Divider />
            <Button icon={<HomeOutlined />} onClick={() => navigate('/')}>
              홈으로 이동
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Admin;
