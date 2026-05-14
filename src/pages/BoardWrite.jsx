import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Typography, Input, Select, Button, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../api/apiClient';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const BoardWrite = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('일반');
  const [content, setContent] = useState('');

  const { mutate, isLoading } = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      message.success('게시글이 등록되었습니다.');
      queryClient.invalidateQueries(['posts']);
      navigate('/board');
    },
    onError: (error) => {
      message.error(error.message || '게시글 등록에 실패했습니다.');
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      message.warning('제목과 내용을 모두 입력해주세요.');
      return;
    }

    mutate({
      title: title.trim(),
      content: content.trim(),
      category,
    });
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
            <Button type="primary" onClick={handleSubmit} loading={isLoading}>
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
