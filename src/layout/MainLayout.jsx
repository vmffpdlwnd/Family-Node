import React, { useState } from 'react';
import { Layout, Menu, theme, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  BarsOutlined,
  CalendarOutlined,
  MessageOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // 현재 경로 파악용
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: '대시보드' },
    { key: '/board', icon: <BarsOutlined />, label: '가족 게시판' },
    { key: '/schedule', icon: <CalendarOutlined />, label: '가족 일정 공유' },
    { key: '/chat', icon: <MessageOutlined />, label: '가족 채팅방' },
    { key: '/settings', icon: <SettingOutlined />, label: '설정' },
  ];

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
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
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
    display: 'flex',          // Flex 설정
    alignItems: 'center',     // 세로 가운데 정렬
    justifyContent: 'flex-start' // 가로 시작점(왼쪽) 정렬
  }}
>
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
</Header>
        
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;