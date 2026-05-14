import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Button, Progress, Space, Statistic } from 'antd';
import { CalendarOutlined, MessageOutlined, BellOutlined, FileTextOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card style={{ borderRadius: 16, minHeight: 280 }} bodyStyle={{ padding: 28 }}>
            <Title level={3} style={{ marginBottom: 8 }}>
              가족 허브에 오신 것을 환영합니다
            </Title>
            <Paragraph style={{ marginBottom: 16, maxWidth: 560 }}>
              게시판, 일정, 채팅을 한 곳에서 관리하며 가족 소통을 간편하게 만듭니다.
            </Paragraph>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card style={{ borderRadius: 16, minHeight: 280, padding: 24 }}>
            <Text strong style={{ fontSize: 16 }}>통계 요약</Text>
            <div style={{ marginTop: 20 }}>
              <Card type="inner" size="small" title="접속률" style={{ borderRadius: 12 }}>
                <Statistic value="0%" valueStyle={{ color: '#333' }} />
              </Card>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 16, minHeight: 300 }} bodyStyle={{ padding: 24 }}>
            <Title level={4}>최신글</Title>
            <Paragraph type="secondary" style={{ marginBottom: 18 }}>
              최근에 작성된 게시글 제목이 여기에 표시됩니다.
            </Paragraph>
            <div style={{ minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', border: '1px dashed #d9d9d9', borderRadius: 12 }}>
              최신 게시글 데이터 연결 대기 중
            </div>
            <Button type="primary" block style={{ marginTop: 20 }} onClick={() => navigate('/board')}>
              게시판 바로가기
            </Button>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 16, minHeight: 300 }} bodyStyle={{ padding: 24 }}>
            <Title level={4}>예정된 일정</Title>
            <Paragraph type="secondary" style={{ marginBottom: 18 }}>
              이번 주 가족 일정을 한눈에 확인하세요.
            </Paragraph>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#666' }}>
              <li>이번 주 일정 데이터 연결 대기 중</li>
            </ul>
            <Button block style={{ marginTop: 20 }} onClick={() => navigate('/schedule')}>
              가족 일정 확인
            </Button>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 16, minHeight: 300 }} bodyStyle={{ padding: 24 }}>
            <Title level={4}>최근 채팅</Title>
            <Paragraph type="secondary" style={{ marginBottom: 18 }}>
              최근 채팅이 있던 방을 알려줍니다.
            </Paragraph>
            <div style={{ minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', border: '1px dashed #d9d9d9', borderRadius: 12 }}>
              채팅 연결 대기 중
            </div>
            <div className="mobile-only" style={{ marginTop: 20 }}>
              <Button type="primary" block onClick={() => navigate('/chat')}>
                채팅 바로가기
              </Button>
            </div>
            <div className="desktop-only" style={{ marginTop: 20 }}>
              <Text type="secondary">최근 채팅 방 정보가 PC에 표시됩니다.</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;