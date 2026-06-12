import { useContext } from "react";
import { Outlet } from "react-router-dom";
import { Layout as AntLayout, Avatar, Typography, Space, theme, Popover, Divider, Flex, Switch } from "antd";
import Sidebar from "./Sidebar";
import { UserOutlined, SunOutlined, MoonOutlined } from "@ant-design/icons";
import { ThemeContext } from "../ThemeContext";

const { Header, Content } = AntLayout;
const { Text } = Typography;

const Layout = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const token = localStorage.getItem("adminToken");

  let adminEmail = "";


  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      adminEmail = payload.email || "";

    } catch (e) {
      // Failed to parse token
    }
  }

  const userDetails = (
    <div style={{ width: 200 }}>
      <Space direction="vertical" size={2} style={{ width: "100%" }}>

        <Text type="secondary">{adminEmail}</Text>
        <Divider style={{ margin: "8px 0" }} />

        <Text>Role: Administrator</Text>
        <Text>Status: Active</Text>
      </Space>
    </div>
  );

  return (
    <AntLayout style={{ height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <Flex vertical flex={1} style={{ overflow: "hidden" }}>
        <Header style={{ padding: "0 24px", background: colorBgContainer }}>
          <Flex justify="flex-end" align="center" style={{ height: "100%" }}>
            <Flex align="center" gap="middle">
              <Switch
                checked={isDarkMode}
                onChange={toggleTheme}
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
              />
              <Flex vertical align="flex-end" style={{ lineHeight: "1.2" }}>

                <Text type="secondary" style={{ fontSize: "12px" }}>{adminEmail}</Text>
              </Flex>
              <Popover content={userDetails} title="Profile Details" trigger="hover" placement="bottomRight">
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#1677ff", cursor: "pointer" }} />
              </Popover>
            </Flex>
          </Flex>
        </Header>
        <Content style={{ margin: "24px", background: colorBgContainer, padding: 24, borderRadius: borderRadiusLG, overflow: "auto" }}>
          <Outlet />
        </Content>
      </Flex>
    </AntLayout>
  );
};

export default Layout;
