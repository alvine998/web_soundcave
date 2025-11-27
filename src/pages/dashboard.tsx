import Head from 'next/head';
import Layout from '@/components/Layout';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  // Data untuk charts
  const monthlyData = [
    { name: 'Jan', plays: 4000, downloads: 2400, revenue: 2400 },
    { name: 'Feb', plays: 3000, downloads: 1398, revenue: 2210 },
    { name: 'Mar', plays: 2000, downloads: 9800, revenue: 2290 },
    { name: 'Apr', plays: 2780, downloads: 3908, revenue: 2000 },
    { name: 'May', plays: 1890, downloads: 4800, revenue: 2181 },
    { name: 'Jun', plays: 2390, downloads: 3800, revenue: 2500 },
    { name: 'Jul', plays: 3490, downloads: 4300, revenue: 2100 },
  ];

  const genreData = [
    { name: 'Pop', value: 400 },
    { name: 'Rock', value: 300 },
    { name: 'Jazz', value: 200 },
    { name: 'Electronic', value: 278 },
    { name: 'Classical', value: 189 },
  ];

  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

  const stats = [
    {
      title: 'Total Plays',
      value: '45,231',
      change: '+12.5%',
      isPositive: true,
      icon: '▶️',
    },
    {
      title: 'Active Users',
      value: '2,543',
      change: '+8.2%',
      isPositive: true,
      icon: '👥',
    },
    {
      title: 'Total Revenue',
      value: '$12,489',
      change: '+23.1%',
      isPositive: true,
      icon: '💰',
    },
    {
      title: 'New Songs',
      value: '156',
      change: '-3.4%',
      isPositive: false,
      icon: '🎵',
    },
  ];

  return (
    <>
      <Head>
        <title>Dashboard - SoundCave</title>
        <meta name="description" content="Dashboard SoundCave" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Selamat datang kembali! Berikut ringkasan aktivitas Anda.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{stat.icon}</span>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded ${
                      stat.isPositive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Line Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly Performance
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="plays"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Plays"
                  />
                  <Line
                    type="monotone"
                    dataKey="downloads"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    name="Downloads"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Genre Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent ?? 0 * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genreData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Area Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Revenue Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly Comparison
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="plays" fill="#3B82F6" name="Plays" />
                  <Bar dataKey="downloads" fill="#8B5CF6" name="Downloads" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {[
                {
                  action: 'New song uploaded',
                  title: 'Summer Vibes',
                  time: '2 minutes ago',
                  icon: '🎵',
                },
                {
                  action: 'User registered',
                  title: 'john_doe@email.com',
                  time: '15 minutes ago',
                  icon: '👤',
                },
                {
                  action: 'Playlist created',
                  title: 'Chill Beats',
                  time: '1 hour ago',
                  icon: '📝',
                },
                {
                  action: 'Payment received',
                  title: '$49.99 from premium subscription',
                  time: '2 hours ago',
                  icon: '💳',
                },
                {
                  action: 'Song featured',
                  title: 'Midnight Dreams',
                  time: '3 hours ago',
                  icon: '⭐',
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{activity.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600">{activity.title}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

