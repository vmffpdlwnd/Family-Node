import React, { useMemo, useState } from 'react';
import { Card, Typography, Button, Space, Input, List } from 'antd';
import { MessageOutlined, SendOutlined, CloseOutlined, UnorderedListOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('rooms');
  const [activeRoomId, setActiveRoomId] = useState('family');
  const [message, setMessage] = useState('');
  const [rooms, setRooms] = useState([
    {
      id: 'family',
      title: '가족 단체 채팅',
      description: '가족 모두와 함께하는 채팅',
      messages: [],
    },
  ]);
  const [newRoomTitle, setNewRoomTitle] = useState('');

  const activeRoom = useMemo(() => rooms.find((room) => room.id === activeRoomId), [rooms, activeRoomId]);

  const handleSend = () => {
    if (!message.trim() || !activeRoom) return;
    setRooms((prev) =>
      prev.map((room) =>
        room.id === activeRoom.id
          ? {
              ...room,
              messages: [
                ...room.messages,
                {
                  id: Date.now().toString(),
                  text: message.trim(),
                  sender: '나',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            }
          : room,
      ),
    );
    setMessage('');
  };

  return (
    <>
      <Button
        className="chat-launcher"
        type="primary"
        shape="circle"
        icon={<MessageOutlined />}
        size="large"
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

          <div className="chat-popup-menu">
            <Button type={view === 'chat' ? 'primary' : 'text'} onClick={() => setView('chat')}>
              채팅
            </Button>
            <Button
              type={view === 'rooms' ? 'primary' : 'text'}
              icon={<UnorderedListOutlined />}
              onClick={() => setView('rooms')}
            >
              채팅방 리스트
            </Button>
          </div>

          <div className="chat-content">
            {view === 'rooms' ? (
              <div style={{ padding: '20px' }}>
              <List
                itemLayout="horizontal"
                dataSource={rooms}
                renderItem={(room) => (
                  <List.Item
                    className={room.id === activeRoomId ? 'chat-room-item-active' : ''}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setActiveRoomId(room.id);
                      setView('chat');
                    }}
                  >
                    <List.Item.Meta title={room.title} description={room.description} />
                  </List.Item>
                )}
              />
              <Space style={{ width: '100%', marginTop: 12 }}>
                <Input
                  value={newRoomTitle}
                  onChange={(event) => setNewRoomTitle(event.target.value)}
                  placeholder="새 채팅방 제목"
                />
                <Button
                  type="primary"
                  onClick={() => {
                    if (!newRoomTitle.trim()) return;
                    setRooms((prev) => [
                      ...prev,
                      {
                        id: Date.now().toString(),
                        title: newRoomTitle.trim(),
                        description: '새 채팅방',
                        messages: [],
                      },
                    ]);
                    setNewRoomTitle('');
                  }}
                >
                  추가
                </Button>
              </Space>
            </div>
          ) : (
              <>
                <div className="chat-messages">
                  {activeRoom?.messages.length ? (
                    activeRoom.messages.map((msg) => (
                      <div key={msg.id} className={`chat-message-row ${msg.sender === '나' ? 'me' : ''}`}>
                        <div className="chat-message-bubble">{msg.text}</div>
                        <div className="chat-message-meta">
                          <Text type="secondary">{msg.sender}</Text>
                          <Text type="secondary" className="chat-message-time">
                            {msg.time}
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

                <div className="chat-input-area">
                  <Input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="메시지를 입력하세요..."
                    onPressEnter={handleSend}
                  />
                  <Button type="primary" icon={<SendOutlined />} onClick={handleSend}>
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
