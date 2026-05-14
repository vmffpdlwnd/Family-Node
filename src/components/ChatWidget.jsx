import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Typography, Button, Space, Input, List, Alert, Popconfirm } from 'antd';
import { MessageOutlined, SendOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import useAuthStore from '../store/authStore';
import { getRooms, createRoom, deleteRoom, getChats, createChat } from '../api/apiClient';

const { Text, Title } = Typography;

const ChatWidget = () => {
  const { user } = useAuthStore();
  const isGuest = !user || user.role === 'guest';
  const [open, setOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState('');
  const [message, setMessage] = useState('');
  const [newRoomTitle, setNewRoomTitle] = useState('');

  const queryClient = useQueryClient();

  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
    enabled: !isGuest,
    refetchInterval: 10000,
  });

  const { data: chatData = [], isLoading: chatsLoading } = useQuery({
    queryKey: ['chats', activeRoomId],
    queryFn: () => getChats(activeRoomId),
    enabled: !isGuest && !!activeRoomId,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (rooms.length && !rooms.some((room) => room.id === activeRoomId)) {
      setActiveRoomId(rooms[0].id);
    }
  }, [rooms, activeRoomId]);

  const activeRoom = useMemo(() => rooms.find((room) => room.id === activeRoomId), [rooms, activeRoomId]);
  const messages = chatData || [];

  const { mutate: sendMessage, isLoading: isSending } = useMutation({
    mutationFn: (payload) => createChat(payload),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries(['chats', activeRoomId]);
    },
    onError: () => {},
  });

  const { mutate: addRoom, isLoading: isCreatingRoom } = useMutation({
    mutationFn: (payload) => createRoom(payload),
    onSuccess: () => {
      setNewRoomTitle('');
      queryClient.invalidateQueries(['rooms']);
    },
    onError: () => {},
  });

  const { mutate: removeRoom, isLoading: isDeletingRoom } = useMutation({
    mutationFn: (roomId) => deleteRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
      if (!rooms.find((room) => room.id === activeRoomId)) {
        const nextRoom = rooms.filter((room) => room.id !== activeRoomId)[0];
        if (nextRoom) setActiveRoomId(nextRoom.id);
      }
    },
    onError: () => {},
  });

  const handleSend = () => {
    if (!message.trim() || !activeRoomId) return;
    sendMessage({ room_id: activeRoomId, message: message.trim() });
  };

  const handleCreateRoom = () => {
    if (!newRoomTitle.trim()) return;
    addRoom({ title: newRoomTitle.trim() });
  };

  const handleDeleteRoom = (roomId) => {
    removeRoom(roomId);
  };

  return (
    <>
      <Button
        className="chat-launcher"
        type="primary"
        shape="circle"
        icon={<MessageOutlined style={{ fontSize: 24, lineHeight: 1 }} />}
        style={{ width: 56, height: 56, padding: 0 }}
        onClick={() => setOpen((prev) => !prev)}
      />

      {open && (
        <Card className="chat-floating-card" bordered={false} bodyStyle={{ padding: 0 }}>
          <div className="chat-header">
            <Space align="center" size={8}>
              <MessageOutlined />
              <span>가족 채팅</span>
            </Space>
            <Button type="text" icon={<CloseOutlined />} onClick={() => setOpen(false)} />
          </div>

          <div className="chat-content">
            {isGuest ? (
              <div style={{ padding: '20px' }}>
                <Alert
                  message="로그인이 필요합니다"
                  description="채팅과 채팅방 관리는 로그인한 멤버만 이용할 수 있습니다."
                  type="info"
                  showIcon
                />
              </div>
            ) : (
              <>
                <div style={{ padding: '20px' }}>
                  <Title level={5}>채팅방 리스트</Title>
                  <Space style={{ width: '100%', marginTop: 12, marginBottom: 16 }}>
                    <Input
                      value={newRoomTitle}
                      onChange={(event) => setNewRoomTitle(event.target.value)}
                      placeholder={isGuest ? '로그인 후 채팅방을 만들 수 있습니다.' : '새 채팅방 제목'}
                      disabled={isGuest}
                    />
                    <Button type="primary" disabled={isGuest} onClick={handleCreateRoom}>
                      추가
                    </Button>
                  </Space>
                  <List
                    itemLayout="horizontal"
                    dataSource={rooms}
                    renderItem={(room) => (
                      <List.Item
                        className={room.id === activeRoomId ? 'chat-room-item-active' : ''}
                        style={{ cursor: 'pointer', padding: '10px 0' }}
                        onClick={() => setActiveRoomId(room.id)}
                        actions={
                          user?.role === 'admin' && room.id !== 'family'
                            ? [
                                <Popconfirm
                                  key="delete-room"
                                  title="이 채팅방을 삭제하시겠습니까?"
                                  okText="삭제"
                                  cancelText="취소"
                                  onConfirm={() => handleDeleteRoom(room.id)}
                                >
                                  <Button danger type="text" icon={<DeleteOutlined />} />
                                </Popconfirm>,
                              ]
                            : []
                        }
                      >
                        <List.Item.Meta title={room.title} />
                      </List.Item>
                    )}
                  />
                </div>

                <div style={{ padding: '0 20px 20px' }}>
                  <div className="chat-messages">
                    {messages.length ? (
                      messages.map((msg) => (
                        <div key={msg.id} className={`chat-message-row ${msg.user_id === user?.id ? 'me' : ''}`}>
                          <div className="chat-message-bubble">{msg.message || msg.text}</div>
                          <div className="chat-message-meta">
                            <Text type="secondary">{msg.username || msg.user_id || '가족'}</Text>
                            <Text type="secondary" className="chat-message-time">
                              {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : msg.time}
                            </Text>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="chat-empty">
                        <Text type="secondary">선택한 채팅방에 아직 메시지가 없습니다.</Text>
                      </div>
                    )}
                  </div>
                </div>

                <div className="chat-input-area" style={{ padding: '0 20px 20px' }}>
                  <Input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={isGuest ? '로그인 후 메시지를 보낼 수 있습니다.' : '메시지를 입력하세요...'}
                    onPressEnter={handleSend}
                    disabled={isGuest}
                  />
                  <Button type="primary" icon={<SendOutlined />} onClick={handleSend} disabled={isGuest}>
                    전송
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatWidget;