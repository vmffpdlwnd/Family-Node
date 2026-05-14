import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Typography, List, Button, Space, Input, Divider, message, Spin } from 'antd';
import { MessageOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { getChats, createChat } from '../api/apiClient';

const { Title, Paragraph, Text } = Typography;

const Chat = () => {
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState('family');
  const [messageText, setMessageText] = useState('');

  const { data: chatData = [], isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: getChats,
    refetchInterval: 5000,
  });

  const messages = chatData || [];

  const { mutate, isLoading: isSending } = useMutation({
    mutationFn: createChat,
    onSuccess: () => {
      message.success('메시지가 전송되었습니다.');
      setMessageText('');
      queryClient.invalidateQueries(['chats']);
    },
    onError: (error) => {
      message.error(error.message || '메시지 전송에 실패했습니다.');
    },
  });

  const handleSend = () => {
    if (!messageText.trim()) return;
    mutate({ message: messageText.trim() });
  };

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ borderRadius: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Title level={3}>💬 가족 채팅방</Title>
          <Paragraph>클라우드 백엔드와 연결된 채팅 메시지를 확인하고 전송합니다.</Paragraph>

          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setSelectedRoom('family')}>
            가족 채팅방으로
          </Button>

          <div style={{ minHeight: 320, marginBottom: 16, borderRadius: 16, background: '#f7f7f7', padding: 20 }}>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin />
              </div>
            ) : messages.length ? (
              <List
                dataSource={messages}
                renderItem={(msg) => (
                  <List.Item key={msg.id} style={{ padding: '12px 0' }}>
                    <List.Item.Meta
                      title={<Text strong>{msg.username || msg.user_id || '가족'}</Text>}
                      description={
                        <>
                          <Text>{msg.message || msg.text}</Text>
                          <div style={{ marginTop: 6 }}>
                            <Text type="secondary">{msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}</Text>
                          </div>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Text type="secondary">아직 메시지가 없습니다. 아래에서 전송해 보세요.</Text>
            )}
          </div>

          <Divider />
          <Space style={{ width: '100%' }}>
            <Input
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              placeholder="메시지를 입력하세요..."
              onPressEnter={handleSend}
            />
            <Button type="primary" onClick={handleSend} loading={isSending}>
              전송
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
};

export default Chat;
