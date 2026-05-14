import React from 'react';
import { Card, Col, Row, Statistic, List, Tag, Typography } from 'antd'; // Typography 추가됨
import { CheckCircleOutlined, SyncOutlined, MessageOutlined } from '@ant-design/icons';

const { Text } = Typography;

const Home = () => {
  const dummyNews = [
    { id: 1, title: '이번 주말 가족 식사 공지', date: '2026-05-14' },
    { id: 2, title: '오라클 클라우드 서버 점검 안내', date: '2026-05-13' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={[16, 16]}>
        {/* 서버 상태 위젯 */}
        <Col xs={24} sm={12} lg={8}>
          <Card variant="outlined" hoverable>
            <Statistic
              title="인프라 상태 (OCI)"
              value="Running"
              styles={{ content: { color: '#3f8600' } }} // 최신 방식 반영
              prefix={<CheckCircleOutlined />}
            />
            <Tag color="processing" icon={<SyncOutlined spin />} style={{ marginTop: '10px' }}>
              정상 가동 중
            </Tag>
          </Card>
        </Col>

        {/* 게시글 요약 위젯 */}
        <Col xs={24} sm={12} lg={8}>
          <Card 
            title={<span><MessageOutlined /> 최근 소식</span>} 
            variant="outlined" 
            hoverable
          >
            <List
              size="small"
              dataSource={dummyNews}
              renderItem={(item) => (
                <List.Item>
                  <Text ellipsis style={{ maxWidth: '70%' }}>{item.title}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>{item.date}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;