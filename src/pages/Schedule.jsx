import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Row, Col, Calendar, Typography, Input, Button, List, Space, message, Spin, Alert, Popconfirm } from 'antd';
import { CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getSchedules, createSchedule, deleteSchedule } from '../api/apiClient';
import useAuthStore from '../store/authStore';

const { Title, Paragraph, Text } = Typography;

const Schedule = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [events, setEvents] = useState({});
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');

  const isGuest = !user || user.role === 'guest';
  const canAccess = user && (user.role === 'member' || user.role === 'admin');

  const { data: scheduleItems = [], isLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: getSchedules,
    refetchInterval: 10000,
    enabled: canAccess,
  });

  const { mutate, isLoading: isCreating } = useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      message.success('일정이 등록되었습니다.');
      queryClient.invalidateQueries(['schedules']);
      setTitle('');
      setTime('');
    },
    onError: (error) => {
      message.error(error.message || '일정 등록에 실패했습니다.');
    },
  });

  const { mutate: removeSchedule, isLoading: isDeleting } = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      message.success('일정이 삭제되었습니다.');
      queryClient.invalidateQueries(['schedules']);
    },
    onError: (error) => {
      message.error(error.message || '일정 삭제에 실패했습니다.');
    },
  });

  useEffect(() => {
    const nextEvents = scheduleItems.reduce((acc, item) => {
      const dateKey = dayjs(item.start_date).format('YYYY-MM-DD');
      const entry = {
        id: item.id,
        title: item.title,
        time: dayjs(item.start_date).format('HH:mm') || '시간 미정',
        user_id: item.user_id,
      };
      acc[dateKey] = [...(acc[dateKey] || []), entry];
      return acc;
    }, {});
    setEvents(nextEvents);
  }, [scheduleItems]);

  const dateKey = selectedDate.format('YYYY-MM-DD');
  const todayItems = scheduleItems.filter(
    (item) => dayjs(item.start_date).format('YYYY-MM-DD') === dateKey,
  );

  const handleAddEvent = () => {
    if (!title.trim()) {
      message.warning('일정 제목을 입력해주세요.');
      return;
    }

    const startDate = `${dateKey} ${time.trim() || '00:00:00'}`;
    const endDate = `${dateKey} 23:59:59`;

    mutate({
      title: title.trim(),
      description: time.trim() ? `시간: ${time.trim()}` : '가족 일정',
      start_date: startDate,
      end_date: endDate,
    });
  };

  const handleDelete = (id) => {
    removeSchedule(id);
  };

  const dateCellRender = (value) => {
    const listData = events[value.format('YYYY-MM-DD')] || [];
    return listData.length ? (
      <ul className="events-list">
        {listData.map((item) => (
          <li key={item.id}>
            <Text type="secondary">• {item.title}</Text>
          </li>
        ))}
      </ul>
    ) : null;
  };

  if (isGuest) {
    return (
      <div>
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Title level={3} style={{ marginBottom: 8 }}>
              <CalendarOutlined /> 가족 일정
            </Title>
            <Paragraph>게스트는 일정 DB를 불러오지 않고 기본 화면만 확인할 수 있습니다.</Paragraph>
          </Col>

          <Col xs={24}>
            <Card style={{ borderRadius: 16 }} styles={{ body: { padding: 20 } }}>
              <Alert
                title="일정 보기 안내"
                description="멤버 계정으로 로그인하면 가족 일정 목록을 확인하고, 일정을 등록 및 삭제할 수 있습니다."
                type="info"
                showIcon
              />
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card style={{ borderRadius: 16 }} styles={{ body: { padding: 16 } }}>
              <Calendar fullscreen={false} value={selectedDate} onSelect={(date) => setSelectedDate(dayjs(date))} />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card style={{ borderRadius: 16 }} styles={{ body: { padding: 20 } }}>
              <Title level={5}>{selectedDate.format('YYYY년 M월 D일')}</Title>
              <Paragraph>게스트는 일정을 등록하거나 삭제할 수 없습니다.</Paragraph>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

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
          <Card style={{ borderRadius: 16 }} styles={{ body: { padding: 16 } }}>
            {isLoading ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <Spin />
              </div>
            ) : (
              <Calendar
                fullscreen={false}
                value={selectedDate}
                onSelect={(date) => setSelectedDate(dayjs(date))}
                dateCellRender={dateCellRender}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card style={{ borderRadius: 16 }} styles={{ body: { padding: 20 } }}>
            <Title level={5}>{selectedDate.format('YYYY년 M월 D일')}</Title>
            <Paragraph>선택된 날짜 일정</Paragraph>

            <List
              dataSource={todayItems}
              locale={{ emptyText: '선택한 날짜에 일정이 없습니다.' }}
              renderItem={(item) => {
                const canDelete = user.role === 'admin' || item.user_id === user.id;
                return (
                  <List.Item
                    actions={
                      canDelete
                        ? [
                            <Popconfirm
                              key="delete"
                              title="정말 삭제하시겠습니까?"
                              onConfirm={() => handleDelete(item.id)}
                              okText="삭제"
                              cancelText="취소"
                            >
                              <Button danger size="small" loading={isDeleting}>
                                삭제
                              </Button>
                            </Popconfirm>,
                          ]
                        : []
                    }
                  >
                    <List.Item.Meta title={item.title} description={item.time} />
                  </List.Item>
                );
              }}
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
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddEvent} loading={isCreating} block>
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
