import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Button, Input, Table, Typography, Spin } from 'antd';
import { SearchOutlined, PlusOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../api/apiClient';

const { Title } = Typography;

const Board = () => {
  const navigate = useNavigate();
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

  const columns = useMemo(
    () => [
      { title: '제목', dataIndex: 'title', key: 'title' },
      { title: '작성자', dataIndex: 'author', key: 'author', width: 120 },
      { title: '카테고리', dataIndex: 'category', key: 'category', width: 120 },
      { title: '작성일', dataIndex: 'date', key: 'date', width: 160 },
      { title: '조회수', dataIndex: 'views', key: 'views', width: 100, align: 'right' },
    ],
    [],
  );

  const dataSource = data.map((item) => ({
    key: item.id,
    title: item.title,
    author: item.username || item.author || '익명',
    category: item.category || '일반',
    date: item.created_at ? new Date(item.created_at).toLocaleString() : '-',
    views: item.views ?? 0,
  }));

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

      <Card style={{ borderRadius: 16, marginBottom: 24 }} bodyStyle={{ padding: 20 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Input placeholder="게시판 검색" prefix={<SearchOutlined />} allowClear />
          </Col>
          <Col xs={24} md={8}>
            <Button block icon={<SortAscendingOutlined />}>
              정렬 선택
            </Button>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 0 }}>
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
            pagination={{ pageSize: 10 }}
            rowKey="key"
            locale={{ emptyText: '등록된 게시글이 없습니다.' }}
          />
        )}
      </Card>
    </div>
  );
};

export default Board;
