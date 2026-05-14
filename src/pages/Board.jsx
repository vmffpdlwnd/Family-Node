import React from 'react';
import { Card, Row, Col, Button, Input, Table, Typography } from 'antd';
import { SearchOutlined, PlusOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const columns = [
  { title: '제목', dataIndex: 'title', key: 'title' },
  { title: '작성자', dataIndex: 'author', key: 'author', width: 120 },
  { title: '카테고리', dataIndex: 'category', key: 'category', width: 120 },
  { title: '작성일', dataIndex: 'date', key: 'date', width: 140 },
  { title: '조회수', dataIndex: 'views', key: 'views', width: 100, align: 'right' },
];

const Board = () => {
  const navigate = useNavigate();

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
        <Table
          columns={columns}
          dataSource={[]}
          pagination={{ pageSize: 10 }}
          rowKey="title"
          locale={{ emptyText: '등록된 게시글이 없습니다.' }}
        />
      </Card>
    </div>
  );
};

export default Board;