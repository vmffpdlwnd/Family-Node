import React, { useState } from 'react';
import { Layout, Menu, theme, Button, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarsOutlined,
  CalendarOutlined,
  MessageOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import ChatWidget from '../components/ChatWidget';
import useAuthStore from '../store/authStore';

const { Header, Content, Sider } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // 현재 경로 파악용
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { user, clearAuth } = useAuthStore();

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const matcher = window.matchMedia('(max-width: 991px)');
    const handleResize = (event) => setIsMobile(event.matches);
    setIsMobile(matcher.matches);
    matcher.addEventListener('change', handleResize);
    return () => matcher.removeEventListener('change', handleResize);
  }, []);

  const menuItems = React.useMemo(() => {
    const items = [
      { key: '/board', icon: <BarsOutlined />, label: '가족 게시판' },
      { key: '/schedule', icon: <CalendarOutlined />, label: '가족 일정' },
    ];
    if (isMobile) {
      items.push({ key: '/chat', icon: <MessageOutlined />, label: '가족 채팅방' });
    }
    if (user?.role === 'admin') {
      items.push({ key: '/admin', icon: <UserOutlined />, label: '관리자' });
    }
    items.push({ key: '/settings', icon: <SettingOutlined />, label: '설정' });
    return items;
  }, [isMobile, user]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        trigger={null}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/')}
          onKeyPress={(event) => event.key === 'Enter' && navigate('/')}
          style={{
            height: 32,
            margin: 16,
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Lee's Homepage
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout><Header 
  style={{ 
    padding: 0, 
    background: colorBgContainer, 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }}
>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <Button
      type="text"
      icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      onClick={() => setCollapsed(!collapsed)}
      style={{
        fontSize: '16px',
        width: 64,
        height: 64,
      }}
    />
    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
      {menuItems.find(item => item.key === location.pathname)?.label || 'Family-Node'}
    </span>
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    {user ? (
      <Typography.Text strong>{user.username}님</Typography.Text>
    ) : (
      <Typography.Text type="secondary">로그인이 필요합니다.</Typography.Text>
    )}
    <Button
      type="primary"
      onClick={() => {
        if (user) {
          clearAuth();
          navigate('/');
        } else {
          navigate('/login');
        }
      }}
    >
      {user ? '로그아웃' : '로그인'}
    </Button>
  </div>
</Header>
        
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG }}>
          {children}
        </Content>
      </Layout>
      <ChatWidget />
    </Layout>
  );
};

export default MainLayout;