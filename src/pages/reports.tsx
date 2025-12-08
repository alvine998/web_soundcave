import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CustomerReport {
  period: {
    days: number;
    start_date: string;
    end_date: string;
    previous_start: string;
    previous_end: string;
  };
  user_statistics: {
    total_users: number;
    premium_users: number;
    regular_users: number;
    admin_users: number;
    current_period_new_users: number;
    previous_period_new_users: number;
    user_growth_percent: number;
    premium_growth_percent: number;
    daily_growth: Array<{ date: string; count: number }>;
    monthly_growth: Array<{ month: string; count: number }>;
    user_distribution: {
      premium: number;
      regular: number;
      admin: number;
      premium_percentage: number;
    };
  };
  revenue: {
    estimated_monthly_revenue: number;
    estimated_annual_revenue: number;
    revenue_growth_percent: number;
    premium_subscribers: number;
    currency: string;
  };
  conversion_metrics: {
    conversion_rate: number;
    total_users: number;
    premium_users: number;
    regular_users: number;
    current_period_premium: number;
    previous_period_premium: number;
  };
  engagement_metrics: {
    total_playlists: number;
    total_playlist_songs: number;
    avg_playlists_per_user: number;
    avg_songs_per_playlist: number;
    active_users: number;
    retention_rate: number;
  };
}

export default function Reports() {
  const [reportType, setReportType] = useState("customers");
  const [period, setPeriod] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<CustomerReport | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Helper function untuk mendapatkan token dari localStorage
  const getAuthToken = (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("soundcave_token");
    }
    return null;
  };

  // Helper function untuk mendapatkan headers dengan Authorization
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    };
  };

  // Fetch customer report
  const fetchCustomerReport = async (periodDays: number = 30) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${CONFIG.API_URL}/api/dashboard/customer-report`,
        {
          params: {
            period: periodDays,
          },
          ...getAuthHeaders(),
        }
      );

      if (response.data?.success && response.data?.data) {
        setReportData(response.data.data);
      } else {
        toast.error("Failed to load customer report");
      }
    } catch (err: any) {
      console.error("Failed to fetch customer report:", err);
      const msg =
        err?.response?.data?.message ||
        "Failed to load customer report. Please try again.";
      toast.error(msg);
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerReport(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const customers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@email.com',
      plan: 'Premium',
      joinDate: '2024-01-15',
      lastActive: '2 hours ago',
      totalSpent: '$149.99',
      status: 'active',
      country: 'USA',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      plan: 'Free',
      joinDate: '2024-02-10',
      lastActive: '1 day ago',
      totalSpent: '$0.00',
      status: 'active',
      country: 'UK',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.j@email.com',
      plan: 'Premium',
      joinDate: '2023-12-05',
      lastActive: '3 hours ago',
      totalSpent: '$299.99',
      status: 'active',
      country: 'Canada',
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah.w@email.com',
      plan: 'Basic',
      joinDate: '2024-01-20',
      lastActive: '1 week ago',
      totalSpent: '$49.99',
      status: 'inactive',
      country: 'Australia',
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'david.b@email.com',
      plan: 'Premium',
      joinDate: '2024-02-01',
      lastActive: '30 mins ago',
      totalSpent: '$199.99',
      status: 'active',
      country: 'USA',
    },
  ];

  // Format data untuk charts
  const dailyGrowthData = reportData?.user_statistics.daily_growth.map(
    (item) => ({
      date: new Date(item.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }),
      count: item.count,
    })
  ) || [];

  const monthlyGrowthData = reportData?.user_statistics.monthly_growth.map(
    (item) => ({
      month: new Date(item.month + "-01").toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric",
      }),
      count: item.count,
    })
  ) || [];

  const userDistributionData = reportData
    ? [
        {
          name: "Premium",
          value: reportData.user_statistics.user_distribution.premium,
        },
        {
          name: "Regular",
          value: reportData.user_statistics.user_distribution.regular,
        },
        {
          name: "Admin",
          value: reportData.user_statistics.user_distribution.admin,
        },
      ]
    : [];

  const COLORS = ["#3B82F6", "#8B5CF6", "#10B981"];

  const stats = reportData
    ? [
        {
          title: "Total Users",
          value: reportData.user_statistics.total_users.toLocaleString(),
          change: `+${reportData.user_statistics.user_growth_percent.toFixed(
            2
          )}%`,
          isPositive: true,
          icon: "👥",
        },
        {
          title: "Active Users",
          value: reportData.engagement_metrics.active_users.toLocaleString(),
          change: "",
          isPositive: true,
          icon: "✓",
        },
        {
          title: "Monthly Revenue",
          value: `${reportData.revenue.currency} ${reportData.revenue.estimated_monthly_revenue.toLocaleString()}`,
          change: `+${reportData.revenue.revenue_growth_percent.toFixed(2)}%`,
          isPositive: true,
          icon: "💰",
        },
        {
          title: "Conversion Rate",
          value: `${reportData.conversion_metrics.conversion_rate.toFixed(2)}%`,
          change: "",
          isPositive: true,
          icon: "📊",
        },
      ]
    : [];

  const handleExport = (format: string) => {
    alert(`Exporting report as ${format}...`);
  };

  return (
    <>
      <Head>
        <title>Customer Reports - SoundCave</title>
        <meta name="description" content="Customer Reports SoundCave" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Reports</h1>
            <p className="text-gray-600">Analisis lengkap data customer dan revenue</p>
          </div>

          {/* Stats Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
                >
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{stat.icon}</span>
                    {stat.change && (
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded ${
                          stat.isPositive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Filters and Export */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left Side - Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="customers">Customer Report</option>
                  <option value="revenue">Revenue Report</option>
                  <option value="subscription">Subscription Report</option>
                  <option value="activity">Activity Report</option>
                </select>

                <select
                  value={period}
                  onChange={(e) => setPeriod(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value={7}>Last 7 Days</option>
                  <option value={30}>Last 30 Days</option>
                  <option value={90}>Last 90 Days</option>
                  <option value={365}>Last Year</option>
                </select>
              </div>

              {/* Right Side - Export Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleExport('PDF')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => handleExport('Excel')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Export Excel
                </button>
                <button
                  onClick={() => handleExport('CSV')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Daily Growth Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Daily User Growth
              </h3>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="New Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* User Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                User Distribution
              </h3>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userDistributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Monthly Growth Chart */}
          {reportData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly User Growth
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" name="New Users" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Additional Statistics */}
          {reportData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  User Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Premium Users</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {reportData.user_statistics.premium_users.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Regular Users</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {reportData.user_statistics.regular_users.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Admin Users</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {reportData.user_statistics.admin_users.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      New Users (Period)
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      +
                      {reportData.user_statistics.current_period_new_users.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Revenue Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Monthly Revenue
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {reportData.revenue.currency}{" "}
                      {reportData.revenue.estimated_monthly_revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Annual Revenue
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {reportData.revenue.currency}{" "}
                      {reportData.revenue.estimated_annual_revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Premium Subscribers
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {reportData.revenue.premium_subscribers.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Engagement Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Playlists</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {reportData.engagement_metrics.total_playlists.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Avg Playlists/User
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {reportData.engagement_metrics.avg_playlists_per_user.toFixed(
                        2
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Avg Songs/Playlist
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {reportData.engagement_metrics.avg_songs_per_playlist.toFixed(
                        2
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Retention Rate</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {reportData.engagement_metrics.retention_rate.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Period Information */}
          {reportData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Report Period
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Period</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {reportData.period.days} days
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(reportData.period.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">End Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(reportData.period.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Previous Period</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(
                      reportData.period.previous_start
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(
                      reportData.period.previous_end
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}

