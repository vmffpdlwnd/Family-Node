import React, { useState } from 'react';
import { Card, Typography, List, Button, Space, Input, Divider } from 'antd';
import { MessageOutlined, ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const Chat = () => {
  const [rooms, setRooms] = useState([
    {
      id: 'family',
      title: '가족 채팅방',
      description: '가족 전용 채팅방',
      messages: [],
    },
  ]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [message, setMessage] = useState('');
  const [newRoomTitle, setNewRoomTitle] = useState('');

  const handleSend = () => {
    if (!selectedRoom || !message.trim()) return;
    setRooms((prev) =>
      prev.map((room) =>
        room.id === selectedRoom.id
          ? {
              ...room,
              messages: [
                ...room.messages,
                { id: Date.now().toString(), text: message.trim(), sender: '나', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
              ],
            }
          : room,
      ),
    );
    setMessage('');
  };

  const handleCreateRoom = () => {
    if (!newRoomTitle.trim()) return;
    const newRoom = {
      id: Date.now().toString(),
      title: newRoomTitle.trim(),
      description: '새 채팅방',
      messages: [],
    };
    setRooms((prev) => [...prev, newRoom]);
    setNewRoomTitle('');
  };

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ borderRadius: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {!selectedRoom ? (
            <>
              <Title level={3}>💬 가족 채팅방</Title>
              <Paragraph>카톡처럼 채팅방을 선택하고 대화를 시작하세요.</Paragraph>
              <List
                itemLayout="horizontal"
                dataSource={rooms}
                renderItem={(item) => (
                  <List.Item onClick={() => setSelectedRoom(item)} style={{ cursor: 'pointer' }}>
                    <List.Item.Meta title={item.title} description={item.description} />
                  </List.Item>
                )}
              />
              <Space style={{ width: '100%' }}>
                <Input
                  value={newRoomTitle}
                  onChange={(event) => setNewRoomTitle(event.target.value)}
                  placeholder="새 채팅방 제목"
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateRoom}>
                  채팅방 추가
                </Button>
              </Space>
            </>
          ) : (
            <>
              <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setSelectedRoom(null)}>
                채팅방 목록으로
              </Button>
              <Title level={4}>{selectedRoom.title}</Title>
              <Paragraph type="secondary">{selectedRoom.description}</Paragraph>
              <Divider />
              <div style={{ minHeight: 240, marginBottom: 16, borderRadius: 16, background: '#f7f7f7', padding: 20 }}>
                {selectedRoom.messages.length ? (
                  selectedRoom.messages.map((msg) => (
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
                  <Text type="secondary">아직 채팅이 없습니다. 메시지를 보내보세요.</Text>
                )}
              </div>
              <Space style={{ width: '100%' }}>
                <Input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="메시지 입력..."
                  onPressEnter={handleSend}
                />
                <Button type="primary" onClick={handleSend}>
                  전송
                </Button>
              </Space>
            </>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default Chat;
