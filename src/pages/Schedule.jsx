import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Row, Col, Calendar, Typography, Input, Button, Space, message, Spin, Alert, Popconfirm, Modal, Select } from 'antd';
import { CalendarOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import locale from 'antd/es/date-picker/locale/ko_KR';
import { getSchedules, createSchedule, deleteSchedule, updateSchedule as updateScheduleApi } from '../api/apiClient';
import useAuthStore, { getAuthToken } from '../store/authStore';

dayjs.locale('ko');

const { Title, Paragraph, Text } = Typography;

const fetchHolidays = async (year, month) => {
  try {
    const res = await fetch(`/api/holidays?year=${year}&month=${month}`);
    return await res.json();
  } catch {
    return {};
  }
};

const Schedule = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');

  const isGuest = !user || user.role === 'guest';
  const canAccess = !!user && (user.role === 'member' || user.role === 'admin');

  const { data: holidays = {} } = useQuery({
    queryKey: ['holidays', currentMonth.year(), currentMonth.month() + 1],
    queryFn: () => fetchHolidays(currentMonth.year(), currentMonth.month() + 1),
    staleTime: 1000 * 60 * 60 * 24,
  });

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
      setShowAddModal(false);
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

  const { mutate: updateScheduleMutate, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => updateScheduleApi(id, data),
    onSuccess: () => {
      message.success('일정이 수정되었습니다.');
      queryClient.invalidateQueries(['schedules']);
      setEditItem(null);
    },
    onError: (error) => {
      message.error(error.message || '일정 수정에 실패했습니다.');
    },
  });

  const parseLocalScheduleDate = (dateString) => {
    if (!dateString) return dayjs();
    let normalized = dateString;
    if (normalized.endsWith('Z')) normalized = normalized.slice(0, -1);
    normalized = normalized.replace(/([+-]\d{2}:?\d{2})$/, '');
    normalized = normalized.replace('T', ' ');
    return dayjs(normalized);
  };

  const enrichedScheduleItems = useMemo(() => {
    if (!scheduleItems || !Array.isArray(scheduleItems)) return [];
    return scheduleItems.map((item) => {
      const parsedDate = parseLocalScheduleDate(item.start_date);
      return {
        ...item,
        parsedDate,
        time: parsedDate.format('HH:mm'),
        dateKey: parsedDate.format('YYYY-MM-DD'),
      };
    });
  }, [scheduleItems]);

  const events = useMemo(() => {
    return enrichedScheduleItems.reduce((acc, item) => {
      acc[item.dateKey] = [...(acc[item.dateKey] || []), item];
      return acc;
    }, {});
  }, [enrichedScheduleItems]);

  const dateKey = selectedDate.format('YYYY-MM-DD');
  const todayItems = enrichedScheduleItems.filter((item) => item.dateKey === dateKey);

  const handleAddEvent = () => {
    if (!title.trim()) { message.warning('일정 제목을 입력해주세요.'); return; }
    mutate({
      title: title.trim(),
      description: time.trim() ? `시간: ${time.trim()}` : '가족 일정',
      start_date: `${dateKey} ${time.trim() || '00:00:00'}`,
      end_date: `${dateKey} 23:59:59`,
    });
  };

  const handleEditOpen = (item) => {
    setEditItem(item);
    setEditTitle(item.title);
    setEditTime(item.time);
  };

  const handleEditSave = () => {
    if (!editItem) return;
    if (!editTitle.trim()) { message.warning('일정 제목을 입력해주세요.'); return; }
    updateScheduleMutate({
      id: editItem.id,
      data: {
        title: editTitle.trim(),
        description: editTime.trim() ? `시간: ${editTime.trim()}` : '가족 일정',
        start_date: `${dateKey} ${editTime.trim() || '00:00:00'}`,
        end_date: `${dateKey} 23:59:59`,
      },
    });
  };

  const dateFullCellRender = (displayMonth) => (value) => {
    const dayOfWeek = value.day();
    const dateStr = value.format('YYYY-MM-DD');
    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;
    const holiday = holidays[dateStr];
    const isRed = isSunday || !!holiday;
    const isOtherMonth = value.month() !== displayMonth.month() || value.year() !== displayMonth.year();
    const isSelected = value.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD');
    const isToday = value.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
    const listData = events[dateStr] || [];

    return (
      <div style={{ minHeight: 80, padding: '4px 6px', borderRadius: 8, background: isSelected ? '#e6f4ff' : 'transparent', border: isToday ? '1px solid #1677ff' : '1px solid transparent', cursor: 'pointer', opacity: isOtherMonth ? 0.35 : 1 }}>
        <div style={{ fontWeight: isToday ? 700 : 400, color: isRed ? '#ff4d4f' : isSaturday ? '#1677ff' : undefined, marginBottom: 2 }}>
          {value.date()}
        </div>
        {holiday && <div style={{ fontSize: 9, color: '#ff4d4f', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{holiday}</div>}
        {listData.slice(0, 2).map((item) => (
          <div key={item.id} style={{ fontSize: 10, padding: '1px 4px', borderRadius: 4, background: '#e6f4ff', color: '#1677ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
            {item.time} {item.title}
          </div>
        ))}
        {listData.length > 2 && <Text type="secondary" style={{ fontSize: 10 }}>+{listData.length - 2}개</Text>}
      </div>
    );
  };

  const headerRender = ({ value, onChange }) => {
    const year = value.year();
    const month = value.month();
    const years = Array.from({ length: 10 }, (_, i) => dayjs().year() - 5 + i);
    const months = Array.from({ length: 12 }, (_, i) => i);

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button onClick={() => { const newVal = value.subtract(1, 'month'); onChange(newVal); setCurrentMonth(newVal); }}>{'<'}</Button>
          <Select
            value={year}
            onChange={(val) => { const newVal = value.year(val); onChange(newVal); setCurrentMonth(newVal); }}
            options={years.map((y) => ({ value: y, label: `${y}년` }))}
            style={{ width: 90 }}
          />
          <Select
            value={month}
            onChange={(val) => { const newVal = value.month(val); onChange(newVal); setCurrentMonth(newVal); }}
            options={months.map((m) => ({ value: m, label: `${m + 1}월` }))}
            style={{ width: 70 }}
          />
          <Button onClick={() => { const newVal = value.add(1, 'month'); onChange(newVal); setCurrentMonth(newVal); }}>{'>'}</Button>
        </div>
        <Button onClick={() => { const today = dayjs(); onChange(today); setCurrentMonth(today); setSelectedDate(today); }}>오늘</Button>
      </div>
    );
  };

  if (isGuest) {
    return (
      <div>
        <Title level={3}><CalendarOutlined /> 가족 일정</Title>
        <Alert description="멤버 계정으로 로그인하면 가족 일정을 등록하고 상세 일정을 확인할 수 있습니다. 공휴일은 로그인하지 않아도 볼 수 있습니다." type="info" showIcon style={{ marginBottom: 16 }} />
        <Card style={{ borderRadius: 16 }}>
          <Calendar
            fullscreen={false}
            locale={locale}
            value={selectedDate}
            onSelect={(date) => { const d = dayjs(date); setSelectedDate(d); setCurrentMonth(d); }}
            fullCellRender={dateFullCellRender(currentMonth)}
            headerRender={headerRender}
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card style={{ borderRadius: 16 }} styles={{ body: { padding: 16 } }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Title level={3} style={{ margin: 0 }}><CalendarOutlined /> 가족 일정</Title>
              <Space>
                <Button onClick={() => { const today = dayjs(); setSelectedDate(today); setCurrentMonth(today); }}>오늘</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowAddModal(true)}>일정 추가</Button>
              </Space>
            </div>
            {isLoading ? (
              <div style={{ padding: 40, textAlign: 'center' }}><Spin /></div>
            ) : (
              <Calendar
                fullscreen={false}
                locale={locale}
                value={selectedDate}
                onSelect={(date) => { const d = dayjs(date); setSelectedDate(d); setCurrentMonth(d); }}
                fullCellRender={dateFullCellRender(currentMonth)}
                headerRender={headerRender}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Title level={4} style={{ margin: 0 }}>{selectedDate.format('YYYY년 M월 D일')} 일정</Title>
            <Text type="secondary">{todayItems.length}개</Text>
          </div>
          {todayItems.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {todayItems.map((item) => {
                const isOwner = String(item.user_id) === String(user?.id);
                const canEdit = user?.role === 'admin' || isOwner;
                return (
                  <Card
                    key={item.id}
                    style={{ borderRadius: 16, border: '1px solid #f0f0f0' }}
                    styles={{ body: { padding: 20 } }}
                    actions={canEdit ? [
                      <Button key="edit" type="text" icon={<EditOutlined />} onClick={() => handleEditOpen(item)}>수정</Button>,
                      <Popconfirm key="delete" title="삭제하시겠습니까?" onConfirm={() => removeSchedule(item.id)} okText="삭제" cancelText="취소">
                        <Button type="text" danger icon={<DeleteOutlined />} loading={isDeleting}>삭제</Button>
                      </Popconfirm>,
                    ] : []}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <ClockCircleOutlined style={{ color: '#1677ff' }} />
                      <Text type="secondary" style={{ fontSize: 13 }}>{item.time}</Text>
                    </div>
                    <Title level={5} style={{ margin: 0, marginBottom: 4 }}>{item.title}</Title>
                    <Text type="secondary">{item.description || '가족 일정'}</Text>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card style={{ borderRadius: 16, textAlign: 'center' }} styles={{ body: { padding: 48 } }}>
              <CalendarOutlined style={{ fontSize: 32, color: '#d9d9d9', marginBottom: 12 }} />
              <Paragraph type="secondary">선택한 날짜에 일정이 없습니다.</Paragraph>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowAddModal(true)}>일정 추가</Button>
            </Card>
          )}
        </Col>
      </Row>

      <Modal title={`${selectedDate.format('M월 D일')} 일정 추가`} open={showAddModal} onCancel={() => setShowAddModal(false)} onOk={handleAddEvent} okText="추가" cancelText="취소" confirmLoading={isCreating}>
        <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="일정 제목" />
          <Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="시간 (예: 18:00)" />
        </Space>
      </Modal>

      <Modal title="일정 수정" open={!!editItem} onCancel={() => setEditItem(null)} onOk={handleEditSave} okText="저장" cancelText="취소" confirmLoading={isUpdating}>
        <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
          <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="일정 제목" />
          <Input value={editTime} onChange={(e) => setEditTime(e.target.value)} placeholder="시간 (예: 18:00)" />
        </Space>
      </Modal>
    </div>
  );
};

export default Schedule;