import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Typography, Button, Space, Input, List, Alert, Popconfirm } from 'antd';
import { MessageOutlined, SendOutlined, CloseOutlined, DeleteOutlined, ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import useAuthStore from '../store/authStore';
import { getRooms, createRoom, deleteRoom, getChats, createChat, deleteChat } from '../api/apiClient';

const { Text } = Typography;

const ChatWidget = ({ pageMode = false }) => {
  const { user } = useAuthStore();
  const isGuest = !user || user.role === 'guest';
  const [open, setOpen] = useState(pageMode);
  const [activeRoom, setActiveRoom] = useState(null);
  const [message, setMessage] = useState('');
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  const queryClient = useQueryClient();

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
    enabled: !isGuest,
    refetchInterval: 10000,
  });

  const { data: chatData = [] } = useQuery({
    queryKey: ['chats', activeRoom?.id],
    queryFn: () => getChats(activeRoom?.id),
    enabled: !isGuest && !!activeRoom?.id,
    refetchInterval: 5000,
  });

  const { mutate: sendMessage } = useMutation({
    mutationFn: (payload) => createChat(payload),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries(['chats', activeRoom?.id]);
    },
  });

  const { mutate: removeMessage, isLoading: isDeletingMessage } = useMutation({
    mutationFn: (chatId) => deleteChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries(['chats', activeRoom?.id]);
    },
  });

  const { mutate: addRoom } = useMutation({
    mutationFn: (payload) => createRoom(payload),
    onSuccess: () => {
      setNewRoomTitle('');
      setShowAddInput(false);
      queryClient.invalidateQueries(['rooms']);
    },
  });

  const { mutate: removeRoom } = useMutation({
    mutationFn: (roomId) => deleteRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
    },
  });

  const handleSend = () => {
    if (!message.trim() || !activeRoom?.id) return;
    sendMessage({ room_id: activeRoom.id, message: message.trim() });
  };

  const handleDeleteMessage = (chatId) => {
    removeMessage(chatId);
  };

  return (
    <>
      {!pageMode && (
        <Button
          className="chat-launcher"
          type="primary"
          shape="circle"
          icon={<MessageOutlined style={{ fontSize: 24 }} />}
          style={{ width: 56, height: 56, padding: 0 }}
          onClick={() => setOpen((prev) => !prev)}
        />
      )}

      {(pageMode || open) && (
        <Card
          className={pageMode ? 'chat-page-card' : 'chat-floating-card'}
          style={pageMode ? { width: '100%', minHeight: 'calc(100vh - 64px)', margin: '0 auto' } : undefined}
          bodyStyle={{ padding: 0 }}
        >
          <div className="chat-header">
            <Space align="center" size={8}>
              {activeRoom && (
                <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setActiveRoom(null)} />
              )}
              <MessageOutlined />
              <span>{activeRoom ? activeRoom.name : '가족 채팅'}</span>
            </Space>
            {!pageMode && (
              <Button type="text" icon={<CloseOutlined />} onClick={() => setOpen(false)} />
            )}
          </div>

          {isGuest ? (
            <div style={{ padding: 20 }}>
              <Alert message="로그인이 필요합니다" type="info" showIcon />
            </div>
          ) : !activeRoom ? (
            <div style={{ padding: '16px 20px' }}>
              <div style={{ marginBottom: 12 }}>
                {showAddInput ? (
                  <Space style={{ width: '100%' }}>
                    <Input
                      value={newRoomTitle}
                      onChange={(e) => setNewRoomTitle(e.target.value)}
                      placeholder="채팅방 이름"
                      onPressEnter={() => { if (newRoomTitle.trim()) addRoom({ name: newRoomTitle.trim() }); }}
                      autoFocus
                    />
                    <Button type="primary" onClick={() => { if (newRoomTitle.trim()) addRoom({ name: newRoomTitle.trim() }); }}>추가</Button>
                    <Button onClick={() => setShowAddInput(false)}>취소</Button>
                  </Space>
                ) : (
                  <Button type="dashed" icon={<PlusOutlined />} block onClick={() => setShowAddInput(true)}>
                    채팅방 추가
                  </Button>
                )}
              </div>
              <List
                size="small"
                dataSource={rooms || []}
                locale={{ emptyText: '채팅방이 없습니다.' }}
                renderItem={(room) => (
                  <List.Item
                    style={{ cursor: 'pointer', padding: '10px 8px', borderRadius: 4 }}
                    onClick={() => setActiveRoom(room)}
                    actions={
                      user?.role === 'admin'
                        ? [
                            <Popconfirm
                              key="delete"
                              title="채팅방을 삭제하시겠습니까?"
                              okText="삭제"
                              cancelText="취소"
                              onConfirm={(e) => { e.stopPropagation(); removeRoom(room.id); }}
                              getPopupContainer={(triggerNode) => triggerNode?.ownerDocument.body}
                              popupStyle={{ zIndex: 10000 }}
                            >
                              <Button danger type="text" size="small" icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
                            </Popconfirm>,
                          ]
                        : []
                    }
                  >
                    <Text>{room.name}</Text>
                  </List.Item>
                )}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '400px', padding: '12px 20px' }}>
              <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', marginBottom: 12 }}>
                {(chatData || []).length ? (chatData || []).map((msg) => (
                  <div key={msg.id} className={`chat-message-row ${msg.user_id === user?.id ? 'me' : ''}`}>
                    <div className="chat-message-bubble">{msg.message}</div>
                    <div className="chat-message-meta">
                      <Text type="secondary">{msg.username}</Text>
                      <Text type="secondary" className="chat-message-time">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      {msg.user_id === user?.id && (
                        <Popconfirm
                          title="메시지를 삭제하시겠습니까?"
                          onConfirm={() => handleDeleteMessage(msg.id)}
                          okText="삭제"
                          cancelText="취소"
                          getPopupContainer={(triggerNode) => triggerNode?.ownerDocument.body}
                          popupStyle={{ zIndex: 10000 }}
                        >
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            loading={isDeletingMessage}
                            style={{ marginLeft: 8 }}
                          />
                        </Popconfirm>
                      )}
                    </div>
                  </div>
                )) : (
                  <Text type="secondary">메시지가 없습니다.</Text>
                )}
              </div>
              <Space style={{ width: '100%' }}>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  onPressEnter={handleSend}
                />
                <Button type="primary" icon={<SendOutlined />} onClick={handleSend}>전송</Button>
              </Space>
            </div>
          )}
        </Card>
      )}
    </>
  );
};

export default ChatWidget;