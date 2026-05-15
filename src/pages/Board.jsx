import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Row, Col, Button, Input, Table, Typography, Spin, Popconfirm, Alert, Tooltip, message } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getPosts, deletePost } from '../api/apiClient';
import useAuthStore from '../store/authStore';

const { Title, Paragraph } = Typography;

const Board = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isGuest = !user || user.role === 'guest';
  const canAccess = user && (user.role === 'member' || user.role === 'admin');

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
    enabled: canAccess,
  });

  const { mutate: removePost, isLoading: isDeleting } = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['admin-posts']);
    },
    onError: (error) => {
      message.error(error.message || '삭제에 실패했습니다.');
    },
  });

  const columns = useMemo(
    () => [
      {
        title: '제목',
        dataIndex: 'title',
        key: 'title',
        render: (text, record) => (
          <a onClick={(event) => {
            event.stopPropagation();
            navigate(`/board/${record.key}`);
          }} style={{ cursor: 'pointer' }}>
            {text}
          </a>
        ),
      },
      { title: '작성자', dataIndex: 'author', key: 'author', width: 140 },
      { title: '카테고리', dataIndex: 'category', key: 'category', width: 120 },
      { title: '작성일', dataIndex: 'date', key: 'date', width: 160 },
      { title: '조회수', dataIndex: 'views', key: 'views', width: 100, align: 'right' },
      {
        title: '관리',
        key: 'actions',
        width: 120,
        render: (_, record) => {
          if (!user) return null;
          const canDelete = user.role === 'admin' || record.user_id === user.id;
          return canDelete ? (
            <Popconfirm
              title="정말 삭제하시겠습니까?"
              onConfirm={() => removePost(record.key)}
              okText="삭제"
              cancelText="취소"
            >
              <Button danger size="small" loading={isDeleting}>
                삭제
              </Button>
            </Popconfirm>
          ) : null;
        },
      },
    ],
    [user, removePost, isDeleting],
  );

  const dataSource = (data || []).map((item) => ({
    key: item.id,
    title: item.title,
    author: item.nickname || item.username || item.author || '익명',
    category: item.category || '일반',
    date: item.created_at ? new Date(item.created_at).toLocaleString() : '-',
    views: item.views ?? 0,
    user_id: item.user_id,
  }));

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
            현재 게스트 상태이므로 게시글을 불러오지 않습니다. 로그인한 가족 구성원만 게시글을 확인하고 작성할 수 있습니다.
          </Paragraph>
          <Button type="primary" onClick={() => navigate('/login')}>
            로그인하러 가기
          </Button>
        </Card>

        <Card style={{ borderRadius: 16 }} styles={{ body: { padding: 20 } }}>
          <Alert
            title="게시판 이용 안내"
            description="멤버는 게시물을 확인하고 작성할 수 있으며, 본인 작성 글만 삭제할 수 있습니다."
            type="info"
            showIcon
          />
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
