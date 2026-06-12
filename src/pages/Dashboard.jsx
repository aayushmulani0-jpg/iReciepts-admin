import { useEffect, useState } from "react";
import { getStats, getUsers } from "../api";
import { Card, Row, Col, Statistic, Typography, Spin, Alert, Space, Flex } from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileDoneOutlined,
  StopOutlined,
  TeamOutlined
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const { Title, Text } = Typography;

const StatCard = ({ title, value, icon, color }) => (
  <Card style={{ flex: 1, minWidth: 200, height: '100%', borderRadius: 12, overflow: "hidden" }} bodyStyle={{ padding: "24px" }}>
    <Flex align="center" gap="large">
      <div style={{ 
        backgroundColor: `${color}15`, 
        color: color, 
        padding: "16px", 
        borderRadius: "50%", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        fontSize: "28px"
      }}>
        {icon}
      </div>
      <Statistic
        title={<Text type="secondary" style={{ fontSize: "14px", fontWeight: 500 }}>{title}</Text>}
        value={value}
        valueStyle={{ color: "var(--ant-color-text)", fontSize: "28px", fontWeight: 700 }}
      />
    </Flex>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setError("");
      try {
        const [statsRes, usersRes] = await Promise.all([
          getStats().catch((err) => {
            console.error("Stats API failed", err);
            return {};
          }),
          getUsers(1, 1).catch((err) => {
            console.error("Users API failed", err);
            return {};
          })
        ]);
        
        const rawStats = statsRes?.stats || statsRes?.data || statsRes || {};
        
        setStats({
          ...rawStats,
          totalUsers: usersRes?.meta?.total || 0
        });
      } catch (err) {
        console.error("Could not fetch dashboard data.", err);
        setError(err.message || "Failed to load dashboard statistics.");
        setStats({});
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ height: "50vh" }}>
        <Spin size="large" />
      </Flex>
    );
  }

  const categoryBreakdown = stats?.categoryBreakdown || [];
  
  const documentTypeData = [
    { name: 'PDF Invoices', value: stats?.pdfInvoices || 0 },
    { name: 'Image Invoices', value: stats?.imageInvoices || 0 },
    { name: 'Skipped', value: stats?.skippedDocuments || 0 }
  ];
  const PIE_COLORS = ['#eb2f96', '#722ed1', '#ff4d4f'];

  return (
    <Space direction="vertical" size="large" style={{ display: "flex", width: "100%" }}>
      <div>
        <Title level={2} style={{ margin: 0, fontWeight: 700 }}>Dashboard Overview</Title>
        <Text type="secondary" style={{ fontSize: "16px" }}>Welcome back! Here is your latest system snapshot.</Text>
      </div>

      {error && (
        <Alert message="Error" description={error} type="error" showIcon />
      )}

      {/* Hero Stats */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={<TeamOutlined />}
            color="#fa8c16"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard
            title="Total Processed"
            value={stats?.totalProcessed || 0}
            icon={<CheckCircleOutlined />}
            color="#1677ff"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard
            title="Processed Invoices"
            value={stats?.processedInvoices || 0}
            icon={<FileTextOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard
            title="Processed Receipts"
            value={stats?.processedReceipts || 0}
            icon={<FileDoneOutlined />}
            color="#13c2c2"
          />
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[24, 24]} style={{ marginTop: "8px" }}>
        <Col xs={24} lg={14}>
          <Card 
            title={<Title level={4} style={{ margin: 0 }}>Category Breakdown</Title>} 
            style={{ height: '100%', borderRadius: 12 }}
            bodyStyle={{ padding: "24px 24px 0 24px", height: 400 }}
          >
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryBreakdown}
                  margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fill: "var(--ant-color-text-secondary)" }}
                    axisLine={{ stroke: "var(--ant-color-border)" }}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fill: "var(--ant-color-text-secondary)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: "var(--ant-color-bg-text-hover)" }}
                    contentStyle={{ 
                      backgroundColor: "var(--ant-color-bg-elevated)", 
                      border: "1px solid var(--ant-color-border)",
                      borderRadius: "8px",
                      color: "var(--ant-color-text)"
                    }}
                  />
                  <Bar dataKey="count" fill="#1677ff" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Flex justify="center" align="center" style={{ height: "100%" }}>
                <Text type="secondary">No category data available</Text>
              </Flex>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card 
            title={<Title level={4} style={{ margin: 0 }}>Document Types</Title>} 
            style={{ height: '100%', borderRadius: 12 }}
            bodyStyle={{ padding: "24px", height: 400 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={documentTypeData}
                  cx="50%"
                  cy="45%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {documentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: "var(--ant-color-bg-elevated)", 
                    border: "1px solid var(--ant-color-border)",
                    borderRadius: "8px",
                    color: "var(--ant-color-text)"
                  }}
                  itemStyle={{ color: "var(--ant-color-text)" }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: "var(--ant-color-text)" }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default Dashboard;
