import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Typography, Button, Spin, Result } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getPost } from '../api/apiClient';
import useAuthStore from '../store/authStore';

const { Title, Paragraph, Text } = Typography;

const BoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isGuest = !user || user.role === 'guest';
  const canAccess = user && (user.role === 'member' || user.role === 'admin');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () => getPost(id),
    enabled: canAccess && !!id,
  });

  if (isGuest) {
    return (
      <div style={{ padding: 24 }}>
        <Result
          status="403"
          title="게시글을 확인할 수 없습니다"
          subTitle="로그인한 멤버 계정으로 접속해야 게시글 내용을 볼 수 있습니다."
          extra={[
            <Button type="primary" key="login" onClick={() => navigate('/login')}>
              로그인하러 가기
            </Button>,
          ]}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: 24 }}>
        <Result
          status="404"
          title="게시글을 불러오지 못했습니다"
          subTitle={error?.message || '게시글을 찾을 수 없거나 접근할 수 없습니다.'}
          extra={[
            <Button key="back" onClick={() => navigate('/board')}>
              게시판으로 돌아가기
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ borderRadius: 16 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/board')}>
          뒤로가기
        </Button>
        <Title level={3} style={{ marginTop: 16 }}>
          {data.title}
        </Title>
        <Paragraph>
          <Text strong>작성자:</Text> {data.username || '익명'}
          <br />
          <Text strong>카테고리:</Text> {data.category || '일반'}
          <br />
          <Text strong>작성일:</Text> {data.created_at ? new Date(data.created_at).toLocaleString() : '-'}
        </Paragraph>
        <Card type="inner" style={{ whiteSpace: 'pre-wrap' }}>
          <Paragraph>{data.content}</Paragraph>
        </Card>
      </Card>
    </div>
  );
};

export default BoardDetail;
