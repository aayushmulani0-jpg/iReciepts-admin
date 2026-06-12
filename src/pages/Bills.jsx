import { useState, useEffect, useCallback } from "react";
import { getBills, getUsers } from "../api";
import { Table, Card, Input, Button, Avatar, Space, Typography, message, Popover, Divider } from "antd";
import { SearchOutlined, FilePdfOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [billsData, usersData] = await Promise.all([
        getBills(currentPage, pageSize),
        getUsers(1, 1000)
      ]);
      setBills(billsData.data || []);
      setTotal(billsData.meta?.total || 0);

      const rawUsers = usersData.data || [];
      const map = {};
      if (Array.isArray(rawUsers)) {
        rawUsers.forEach((u) => {
          const id = u._id || u.id;
          if (id) map[id] = u;
        });
      }
      setUsersMap(map);
    } catch (err) {
      console.error("Failed to load data.", err);
      message.error(err.message || "Failed to load bills.");
      setBills([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      title: "User",
      key: "user",
      render: (_, record) => {
        const user = usersMap[record.userId];
        if (user) {
          const userDetails = (
            <div style={{ minWidth: 150 }}>
              <Space direction="vertical" size={2} style={{ width: "100%" }}>
                <Text strong>{user.name || "Unknown"}</Text>
                <Text type="secondary">{user.email || "No Email"}</Text>
                <Divider style={{ margin: "8px 0" }} />
                <Text>ID: {user._id || user.id}</Text>
              </Space>
            </div>
          );

          let avatarNode = <Avatar icon={<UserOutlined />} style={{ cursor: "pointer" }} />;

          const avatarUrl = user.avatar || user.profilePicture || user.picture || user.avtar;
          if (avatarUrl) {
            avatarNode = <Avatar src={avatarUrl} style={{ cursor: "pointer" }} />;
          } else if (user.name) {
            avatarNode = <Avatar style={{ backgroundColor: "#1677ff", cursor: "pointer" }}>{user.name.charAt(0).toUpperCase()}</Avatar>;
          }

          return (
            <Popover content={userDetails} title="User Details" trigger="hover">
              {avatarNode}
            </Popover>
          );
        }
        return <Text>-</Text>;
      },
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

  return (
    <Space direction="vertical" size="large" style={{ display: "flex" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Bills & Invoices</Title>
          <Text type="secondary">View and inspect processed receipts</Text>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={bills}
          rowKey={(record) => record.id || record._id}
          loading={loading}
          scroll={{ x: true }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showTotal: (total) => `Total ${total} items`,
          }}
          onChange={(pagination) => {
            setCurrentPage(pagination.current);
            setPageSize(pagination.pageSize);
          }}
        />
      </Card>
    </Space>
  );
};

export default Bills;
