import { useEffect, useState } from "react";
import { getStats } from "../api";
import { Card, Row, Col, Statistic, Typography, Spin, Alert, Space, Progress, List } from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileDoneOutlined,
  StopOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const StatCard = ({ title, value, icon, color }) => (
  <Card style={{ flex: 1, minWidth: 200, height: '100%' }}>
    <Statistic
      title={title}
      value={value}
      prefix={<span style={{ color, marginRight: 8 }}>{icon}</span>}
      valueStyle={{ color: "rgba(0, 0, 0, 0.85)" }}
    />
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setError("");
      try {
        const data = await getStats();
        // The API returns { data: { ...stats } } inside the interceptor's unwrapped response
        setStats(data?.stats || data?.data || data);
      } catch (err) {
        console.error("Could not fetch dashboard stats.", err);
        setError(err.message || "Failed to load dashboard stats.");
        setStats({});
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  const categoryBreakdown = stats?.categoryBreakdown || [];

  return (
    <Space direction="vertical" size="large" style={{ display: "flex", width: "100%" }}>
      <div>
        <Title level={2} style={{ margin: 0 }}>Dashboard Overview</Title>
        <Text type="secondary">Welcome back, here is your document processing summary.</Text>
      </div>

      {error && (
        <Alert message="Error" description={error} type="error" showIcon />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="Total Processed"
            value={stats?.totalProcessed || 0}
            icon={<CheckCircleOutlined />}
            color="#1677ff"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="Processed Invoices"
            value={stats?.processedInvoices || 0}
            icon={<FileTextOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="Processed Receipts"
            value={stats?.processedReceipts || 0}
            icon={<FileDoneOutlined />}
            color="#13c2c2"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="PDF Invoices"
            value={stats?.pdfInvoices || 0}
            icon={<FilePdfOutlined />}
            color="#eb2f96"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="Image Invoices"
            value={stats?.imageInvoices || 0}
            icon={<FileImageOutlined />}
            color="#722ed1"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="Skipped Documents"
            value={stats?.skippedDocuments || 0}
            icon={<StopOutlined />}
            color="#ff4d4f"
          />
        </Col>
      </Row>

      <Card title="Category Breakdown" style={{ marginTop: 16 }}>
        {categoryBreakdown.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={categoryBreakdown}
            renderItem={(item) => (
              <List.Item>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text strong>{item.category}</Text>
                    <Text>{item.count}</Text>
                  </div>
                  <Progress 
                    percent={Math.round((item.count / (stats?.totalProcessed || 1)) * 100)} 
                    status="active" 
                    strokeColor="#1677ff"
                  />
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Text type="secondary">No category data available</Text>
          </div>
        )}
      </Card>
    </Space>
  );
};

export default Dashboard;
