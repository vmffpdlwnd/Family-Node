import React, { useState } from 'react';
import { Card, Row, Col, Calendar, Typography, Input, Button, List, Space } from 'antd';
import { CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [events, setEvents] = useState({});
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');

  const dateKey = selectedDate.format('YYYY-MM-DD');
  const todayEvents = events[dateKey] || [];

  const handleAddEvent = () => {
    if (!title.trim()) return;
    setEvents((prev) => ({
      ...prev,
      [dateKey]: [
        ...(prev[dateKey] || []),
        { title: title.trim(), time: time.trim() || '시간 미정' },
      ],
    }));
    setTitle('');
    setTime('');
  };

  const dateCellRender = (value) => {
    const listData = events[value.format('YYYY-MM-DD')] || [];
    return listData.length ? (
      <ul className="events-list">
        {listData.map((item, index) => (
          <li key={index}>
            <Text type="secondary">• {item.title}</Text>
          </li>
        ))}
      </ul>
    ) : null;
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Title level={3} style={{ marginBottom: 8 }}>
            <CalendarOutlined /> 가족 일정
          </Title>
          <Paragraph>달력에서 가족 일정을 등록하고, 선택한 날짜의 일정을 확인할 수 있습니다.</Paragraph>
        </Col>

        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 16 }}>
            <Calendar
              fullscreen={false}
              value={selectedDate}
              onSelect={(date) => setSelectedDate(dayjs(date))}
              dateCellRender={dateCellRender}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 20 }}>
            <Title level={5}>{selectedDate.format('YYYY년 M월 D일')}</Title>
            <Paragraph>선택된 날짜 일정</Paragraph>

            <List
              dataSource={todayEvents}
              locale={{ emptyText: '선택한 날짜에 일정이 없습니다.' }}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={item.time}
                  />
                </List.Item>
              )}
              style={{ marginBottom: 24 }}
            />

            <Paragraph strong>일정 추가</Paragraph>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="일정 제목"
              />
              <Input
                value={time}
                onChange={(event) => setTime(event.target.value)}
                placeholder="시간 (예: 18:00)"
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddEvent} block>
                일정 추가
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Schedule;
