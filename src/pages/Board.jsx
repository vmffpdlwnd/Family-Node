import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Button, Input, Table, Typography, Spin, Alert } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../api/apiClient';
import useAuthStore from '../store/authStore';

const { Title, Paragraph } = Typography;

const Board = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isGuest = !user || user.role === 'guest';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

  const posts = Array.isArray(data) ? data : [];

  const columns = useMemo(
    () => [
      {
        title: 'No.',
        dataIndex: 'no',
        key: 'no',
        width: 80,
        align: 'center',
        render: (_text, _record, index) => index + 1,
      },
      { title: '카테고리', dataIndex: 'category', key: 'category', width: 120 },
      {
        title: '제목',
        dataIndex: 'title',
        key: 'title',
        render: (text, record) => (
          <a
            onClick={(event) => {
              event.stopPropagation();
              navigate(`/board/${record.key}`);
            }}
            style={{ cursor: 'pointer' }}
          >
            {text}
          </a>
        ),
      },
      { title: '작성자', dataIndex: 'author', key: 'author', width: 140 },
      { title: '작성일', dataIndex: 'date', key: 'date', width: 140 },
      { title: '조회수', dataIndex: 'views', key: 'views', width: 100, align: 'right' },
    ],
    [navigate],
  );

  const dataSource = posts.map((item) => {
    const createdAt = item.created_at ? new Date(item.created_at) : null;
    const isToday = createdAt ? createdAt.toDateString() === new Date().toDateString() : false;
    const dateLabel = createdAt
      ? isToday
        ? createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : createdAt.toLocaleDateString([], { month: '2-digit', day: '2-digit' })
      : '-';

    return {
      key: item.id,
      title: item.title,
      author: item.nickname || item.username || item.author || '익명',
      category: item.category || '일반',
      date: dateLabel,
      views: item.views ?? 0,
      user_id: item.user_id,
    };
  });


  if (isGuest) {
    return (
      <div>
        <Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3}>📋 가족 게시판</Title>
          </Col>
        </Row>

        <Card style={{ borderRadius: 16, marginBottom: 24 }} styles={{ body: { padding: 20 } }}>
          <Paragraph>
            현재 게스트 상태이므로 게시글 목록을 볼 수 없습니다. 로그인한 가족 구성원만 게시글을 확인할 수 있습니다.
          </Paragraph>
          <Button type="primary" onClick={() => navigate('/login')}>
            로그인하러 가기
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3}>📋 가족 게시판</Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/board/write')}>
            새 게시글
          </Button>
        </Col>
      </Row>

      <Card style={{ borderRadius: 16, marginBottom: 24 }} styles={{ body: { padding: 20 } }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Input placeholder="게시판 검색" prefix={<SearchOutlined />} allowClear disabled />
          </Col>
          <Col xs={24} md={8}>
            <Button block disabled>
              정렬 선택
            </Button>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 16 }} styles={{ body: { padding: 0 } }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <Spin />
          </div>
        ) : isError ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#ff4d4f' }}>
            게시글을 불러오는 중 오류가 발생했습니다.
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={{ pageSize: 7 }}
            rowKey="key"
            locale={{ emptyText: '등록된 게시글이 없습니다.' }}
          />
        )}
      </Card>
    </div>
  );
};

export default Board;
