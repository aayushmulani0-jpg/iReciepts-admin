import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers, deleteUser, getUserById } from "../api";
import { Table, Card, Input, Button, Tag, Avatar, Space, Typography, message, Modal, Popover, Divider } from "antd";
import { SearchOutlined, DeleteOutlined, UserOutlined, EyeOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const resolveUserId = (user) => user?.id || user?._id || "";

const normalizeUser = (user) => ({
  ...user,
  id: resolveUserId(user),
});

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const fetchUsersData = useCallback(async () => {
    setLoading(true);
    try {
      const trimmedSearch = search.trim();
      let rawUsers = [];
      let currentTotal = 0;

      // If search string matches a 24-character hex ID (MongoDB ObjectId)
      if (/^[a-fA-F0-9]{24}$/.test(trimmedSearch)) {
        try {
          const userRes = await getUserById(trimmedSearch);
          if (userRes?.data) {
            rawUsers = [userRes.data];
            currentTotal = 1;
          }
        } catch (e) {
          // Ignore and fallback to normal search
        }
      }

      if (rawUsers.length === 0) {
        const data = await getUsers(1, 20, trimmedSearch);
        rawUsers = data?.data || [];
        currentTotal = data?.meta?.total || 0;
      }

      setUsers(Array.isArray(rawUsers) ? rawUsers.map(normalizeUser) : []);
      setTotal(currentTotal);
    } catch (err) {
      console.error("Failed to load users.", err);
      message.error(err.message || "Failed to load users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsersData();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsersData]);

  const handleDelete = (id) => {
    if (!id) {
      message.error("Cannot delete user: missing user id.");
      return;
    }

    Modal.confirm({
      title: 'Are you sure you want to delete this user?',
      content: 'This action cannot be undone.',
      okText: 'Yes, delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteUser(id);
          message.success("User deleted successfully.");
          fetchUsersData();
        } catch (err) {
          console.error("Failed to delete user", err);
          message.error(err.message || "Failed to delete user.");
        }
      }
    });
  };

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (_, record) => {
        if (record.name) {
          const userDetails = (
            <div style={{ minWidth: 150 }}>
              <Space direction="vertical" size={2} style={{ width: "100%" }}>
                <Text strong>{record.name || "Unknown"}</Text>
                <Text type="secondary">{record.email || "No Email"}</Text>
                <Divider style={{ margin: "8px 0" }} />
                <Text>ID: {record._id || record.id}</Text>
              </Space>
            </div>
          );

          let avatarNode = <Avatar icon={<UserOutlined />} style={{ cursor: "pointer" }} />;

          const avatarUrl = record.avatar || record.profilePicture || record.picture || record.avtar;
          if (avatarUrl) {
            avatarNode = <Avatar src={<img src={avatarUrl} alt="avatar" />} style={{ cursor: "pointer" }} />;
          } else if (record.name) {
            avatarNode = <Avatar style={{ backgroundColor: "#1677ff", cursor: "pointer" }}>{record.name.charAt(0).toUpperCase()}</Avatar>;
          }

          return (
            <Space
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/users/${record.id}`)}
            >
              <Popover content={userDetails} title="User Details" trigger="hover">
                {avatarNode}
              </Popover>
              <Text strong style={{ color: "#1677ff", textDecoration: "underline" }}>{record.name}</Text>
            </Space>
          );
        }
        return <Text>-</Text>;
      }
    },
    {
      title: "User ID",
      dataIndex: "id",
      key: "id",
      render: (id) => <Text copyable type="secondary" style={{ fontSize: '12px', fontFamily: 'monospace' }}>{id}</Text>
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => email || "-"
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        if (role) {
          return (
            <Tag color={role === "admin" ? "warning" : "success"}>
              {role.toUpperCase()}
            </Tag>
          );
        }
        return <Text>-</Text>;
      }
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-")
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Space>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            disabled={!record.id}
            title="Delete User"
          />
        </Space>
      )
    }
  ];

  return (
    <Space direction="vertical" size="large" style={{ display: "flex" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>User Management</Title>
          <Text type="secondary">Manage application users and permissions</Text>
        </div>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search users..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          scroll={{ x: true }}
          pagination={{
            total: total,
            showTotal: (total) => `Total ${total} items`,
          }}
        />
      </Card>
    </Space>
  );
};

export default Users;
