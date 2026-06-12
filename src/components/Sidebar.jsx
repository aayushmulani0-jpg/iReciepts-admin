import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/users",
      icon: <TeamOutlined />,
      label: "Users",
    },
    {
      key: "/bills",
      icon: <FileTextOutlined />,
      label: "Bills",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

  return (
    <Sider
      theme="dark"
      breakpoint="lg"
      collapsedWidth="0"
    >
      <div style={{ padding: "16px", color: "white", textAlign: "center", marginBottom: "16px" }}>
        <h2 style={{ margin: 0, color: "#1677ff", fontSize: "24px" }}>iReceipts</h2>
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>Admin Portal</span>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => {
          if (key === "logout") {
            handleLogout();
          } else {
            navigate(key);
          }
        }}
        items={menuItems}
      />
    </Sider>
  );
};

export default Sidebar;
