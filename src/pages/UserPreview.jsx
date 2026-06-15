import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, getBills } from "../api";
import {
  Table, Card, Button, Avatar, Space, Typography,
  message, Statistic, Tag, Flex
} from "antd";
import {
  ArrowLeftOutlined, UserOutlined, FilePdfOutlined,
  MailOutlined, IdcardOutlined, CalendarOutlined,
  FileTextOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const UserPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalBills: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, billsRes] = await Promise.all([
        getUserById(id),
        getBills(1, 1000, id)
      ]);

      const userData = userRes?.data || null;
      setUser(userData);

      const billsData = billsRes?.data || [];
      setBills(billsData);

      // Calculate stats
      const totalBillsCount = billsRes?.meta?.total || billsData.length;

      setStats({
        totalBills: totalBillsCount,
      });
    } catch (err) {
      console.error("Failed to load user preview.", err);
      message.error(err.message || "Failed to load user preview.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, fetchData]);

  const columns = [
    {
      title: "Invoice No.",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      render: (text) => (text || "-"),
    },
    {
      title: "Vendor",
      dataIndex: "vendorName",
      key: "vendorName",
      render: (text) => <Text strong>{text || "-"}</Text>,
    },
    {
      title: "Amount",
      key: "amount",
      render: (_, record) => {
        if (record.totalAmount != null) {
          const curr = record.currency ? `${record.currency} ` : "";
          return <Text>{curr}{Number(record.totalAmount).toFixed(2)}</Text>;
        }
        return <Text>-</Text>;
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
    },
    {
      title: "Received At",
      key: "receivedAt",
      render: (_, record) => {
        if (record.message && record.message.receivedAt) {
          return new Date(record.message.receivedAt).toLocaleDateString();
        }
        return "-";
      },
    },
    {
      title: "Attachment",
      key: "action",
      align: "right",
      render: (_, record) => {
        const fileUrl = record.fileUrl || record.pdfUrl || record.url || record.attachmentUrl || record.attachment?.url || record.message?.attachments?.[0]?.url || record.file;
        return (
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            disabled={!fileUrl}
            onClick={() => {
              if (fileUrl) window.open(fileUrl, "_blank");
            }}
          >
            View PDF
          </Button>
        );
      },
    },
  ];

  let avatarUrl = "";
  if (user) {
    avatarUrl = user.avatar || user.profilePicture || user.picture || user.avtar || "";
  }

  return (
    <Flex vertical gap="large" style={{ width: "100%" }}>
      <Flex align="center" gap="middle">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <div>
          <Title level={2} style={{ margin: 0 }}>User Profile</Title>

        </div>
      </Flex>

      <Card loading={loading} style={{ width: "100%" }}>
        {user ? (
          <Flex wrap="wrap" justify="space-between" align="center" gap="large">
            <Space size="large" align="center">
              {avatarUrl ? (
                <Avatar src={<img src={avatarUrl} alt="avatar" />} size={100} />
              ) : (
                <Avatar size={100} icon={<UserOutlined />} style={{ backgroundColor: "#1677ff", fontSize: 40 }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : ""}
                </Avatar>
              )}
              <Space direction="vertical" size={4}>
                <Space align="center">
                  <Title level={3} style={{ margin: 0 }}>{user.name || "Unknown"}</Title>
                  <Tag color={user.role === "admin" ? "warning" : "success"}>
                    {(user.role || "user").toUpperCase()}
                  </Tag>
                </Space>
                <Space size="small">
                  <MailOutlined style={{ color: "#8c8c8c" }} />
                  <Text copyable type="secondary" style={{ fontSize: "16px" }}>{user.email || "No Email"}</Text>
                </Space>
                <Space size="small">
                  <IdcardOutlined style={{ color: "#8c8c8c" }} />
                  <Text copyable style={{ color: "#8c8c8c", fontFamily: "monospace" }}>{user._id || user.id}</Text>
                </Space>
                <Space size="small">
                  <CalendarOutlined style={{ color: "#8c8c8c" }} />
                  <Text type="secondary" style={{ fontSize: "13px" }}>
                    Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                  </Text>
                </Space>
              </Space>
            </Space>

            <Statistic
              title="Total Bills"
              value={stats.totalBills}
              prefix={<FileTextOutlined />}
              valueStyle={{ fontSize: "32px", color: "#1677ff" }}
              style={{ textAlign: "right", paddingRight: "24px" }}
            />
          </Flex>
        ) : (
          <Flex justify="center" align="center" style={{ padding: 40 }}>
            <Text type="secondary">User not found</Text>
          </Flex>
        )}
      </Card>

      <Card title={`Bills & Invoices (${stats.totalBills})`} style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={bills}
          rowKey={(record) => record.id || record._id}
          loading={loading}
          scroll={{ x: true }}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </Flex>
  );
};

export default UserPreview;
