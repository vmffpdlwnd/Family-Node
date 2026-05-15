import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Typography, Button, Space, Input, Divider, message, Spin, Alert, Popconfirm } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getChats, createChat, deleteChat } from '../api/apiClient';
import useAuthStore from '../store/authStore';

const { Title, Paragraph, Text } = Typography;

const Chat = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedRoom, setSelectedRoom] = useState('family');
  const [messageText, setMessageText] = useState('');

  const isGuest = !user || user.role === 'guest';
  const canAccess = user && (user.role === 'member' || user.role === 'admin');

  const { data: chatData = [], isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: getChats,
    refetchInterval: 5000,
    enabled: canAccess,
  });

  const messages = chatData || [];

  const { mutate: sendMessage, isLoading: isSending } = useMutation({
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

  const { mutate: removeMessage, isLoading: isDeleting } = useMutation({
    mutationFn: deleteChat,
    onSuccess: () => {
      message.success('메시지가 삭제되었습니다.');
      queryClient.invalidateQueries(['chats']);
    },
    onError: (error) => {
      message.error(error.message || '메시지 삭제에 실패했습니다.');
    },
  });

  const handleSend = () => {
    if (!messageText.trim()) return;
    sendMessage({ message: messageText.trim() });
  };

  if (isGuest) {
    return (
      <div style={{ padding: 24 }}>
        <Card style={{ borderRadius: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Title level={3}>💬 가족 채팅방</Title>
            <Paragraph>게스트는 채팅 DB를 불러오지 않습니다. 로그인한 멤버만 채팅을 볼 수 있습니다.</Paragraph>
            <Alert
              title="채팅 이용 안내"
              description="멤버 계정으로 로그인하면 채팅 목록에 접속하고 메시지를 전송할 수 있습니다."
              type="info"
              showIcon
            />
          </Space>
        </Card>
      </div>
    );
  }

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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.map((msg) => {
                  const isMine = String(msg.user_id) === String(user?.id);
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMine ? 'flex-end' : 'flex-start',
                        gap: 6,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                        {!isMine && <Text strong>{msg.username || msg.user_id || '가족'}</Text>}
                        {isMine && <Text type="secondary">나</Text>}
                      </div>
                      <div
                        style={{
                          maxWidth: isMine ? '75%' : '55%',
                          width: 'auto',
                          minWidth: 'fit-content',
                          display: 'inline-flex',
                          flexDirection: 'column',
                          background: isMine ? '#daf2ff' : '#ffffff',
                          border: '1px solid #f0f0f0',
                          borderRadius: 18,
                          padding: '12px 14px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        }}
                      >
                        <Text style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.message || msg.text}</Text>
                        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}
                          </Text>
                          {isMine && (
                            <Popconfirm
                              key="delete"
                              title="메시지를 삭제하시겠습니까?"
                              onConfirm={() => removeMessage(msg.id)}
                              okText="삭제"
                              cancelText="취소"
                              getPopupContainer={(triggerNode) => triggerNode?.ownerDocument.body}
                              popupStyle={{ zIndex: 10000 }}
                            >
                              <Button danger size="small" loading={isDeleting}>
                                삭제
                              </Button>
                            </Popconfirm>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
