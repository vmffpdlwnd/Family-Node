import React, { useState } from 'react';
import { Card, Typography, Input, Select, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const BoardWrite = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('일반');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    console.log('게시글 저장:', { title, category, content });
    navigate('/board');
  };

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ borderRadius: 16 }}>
        <Title level={3}>새 게시글 작성</Title>
        <Paragraph>제목, 카테고리, 내용을 입력한 뒤 저장 버튼을 눌러주세요.</Paragraph>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="제목을 입력하세요"
          />

          <Select value={category} onChange={(value) => setCategory(value)} style={{ width: 200 }}>
            <Option value="일반">일반</Option>
            <Option value="공지">공지</Option>
            <Option value="생활">생활</Option>
          </Select>

          <Input.TextArea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={10}
            placeholder="내용을 입력하세요"
          />

          <Space>
            <Button type="primary" onClick={handleSubmit}>
              저장
            </Button>
            <Button onClick={() => navigate('/board')}>
              취소
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
};

export default BoardWrite;
