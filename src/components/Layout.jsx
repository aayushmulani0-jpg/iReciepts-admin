import { Outlet } from "react-router-dom";
import { Layout as AntLayout, Avatar, Typography, Space, theme, Popover, Divider } from "antd";
import Sidebar from "./Sidebar";
import { UserOutlined } from "@ant-design/icons";

const { Header, Content } = AntLayout;
const { Text } = Typography;

const Layout = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const userDetails = (
    <div style={{ width: 200 }}>
      <Space direction="vertical" size={2} style={{ width: "100%" }}>
        <Text strong>Admin User</Text>
        <Text type="secondary">admin@ireceipts.com</Text>
        <Divider style={{ margin: "8px 0" }} />
        <Text>Role: Administrator</Text>
        <Text>Status: Active</Text>
      </Space>
    </div>
  );

  return (
    <AntLayout style={{ height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <AntLayout style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <Header style={{ padding: "0 24px", background: colorBgContainer, display: "flex", justifyContent: "space-between", alignItems: "center", flex: "0 0 auto" }}>
          <div></div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: "1.2" }}>
              <Text strong>Admin User</Text>
              <Text type="secondary" style={{ fontSize: "12px" }}>admin@ireceipts.com</Text>
            </div>
            <div>
              <Popover content={userDetails} title="Profile Details" trigger="hover" placement="bottomRight">
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#1677ff", cursor: "pointer" }} />
              </Popover>
            </div>
          </div>
        </Header>
        <Content style={{ margin: "24px", background: colorBgContainer, padding: 24, borderRadius: borderRadiusLG, overflow: "auto", flex: "1" }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
