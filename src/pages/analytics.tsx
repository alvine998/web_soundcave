import Head from 'next/head';
import Layout from '@/components/Layout';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function Analytics() {
  // Data untuk analytics
  const weeklyData = [
    { day: 'Mon', users: 120, sessions: 240, pageviews: 480 },
    { day: 'Tue', users: 150, sessions: 280, pageviews: 520 },
    { day: 'Wed', users: 180, sessions: 320, pageviews: 600 },
    { day: 'Thu', users: 140, sessions: 260, pageviews: 490 },
    { day: 'Fri', users: 200, sessions: 380, pageviews: 720 },
    { day: 'Sat', users: 250, sessions: 450, pageviews: 850 },
    { day: 'Sun', users: 220, sessions: 400, pageviews: 760 },
  ];

  const deviceData = [
    { device: 'Mobile', users: 4500, percentage: 45 },
    { device: 'Desktop', users: 3500, percentage: 35 },
    { device: 'Tablet', users: 2000, percentage: 20 },
  ];

  const topSongs = [
    { title: 'Summer Vibes', plays: 12500, listeners: 8200, duration: '3:45' },
    { title: 'Midnight Dreams', plays: 11200, listeners: 7800, duration: '4:12' },
    { title: 'Ocean Waves', plays: 9800, listeners: 6500, duration: '3:28' },
    { title: 'City Lights', plays: 8900, listeners: 5900, duration: '3:55' },
    { title: 'Moonlight', plays: 8100, listeners: 5400, duration: '4:01' },
  ];

  const metrics = [
    {
      title: 'Total Users',
      value: '12,543',
      change: '+15.3%',
      isPositive: true,
      icon: '👥',
      description: 'Active users this month',
    },
    {
      title: 'Avg Session Time',
      value: '24m 32s',
      change: '+8.7%',
      isPositive: true,
      icon: '⏱️',
      description: 'Average time per session',
    },
    {
      title: 'Bounce Rate',
      value: '32.4%',
      change: '-5.2%',
      isPositive: true,
      icon: '📊',
      description: 'Users leaving immediately',
    },
    {
      title: 'Conversion Rate',
      value: '4.8%',
      change: '+2.1%',
      isPositive: true,
      icon: '🎯',
      description: 'Free to premium conversion',
    },
  ];

  return (
    <>
      <Head>
        <title>Analytics - SoundCave</title>
        <meta name="description" content="Analytics SoundCave" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">Detail analisis performa dan perilaku user</p>
          </div>

          {/* Date Range Filter */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>This Year</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Export Report
              </button>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{metric.icon}</span>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded ${
                      metric.isPositive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {metric.change}
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  {metric.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</p>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Weekly Trend */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Weekly User Activity
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    name="Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    name="Sessions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Device Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Device Distribution
              </h3>
              <div className="space-y-6">
                {deviceData.map((device, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {device.device}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {device.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${device.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {device.users.toLocaleString()} users
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Page Views Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Page Views & Engagement
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="pageviews" fill="#3B82F6" name="Page Views" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Songs Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Performing Songs
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Rank
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Song Title
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Total Plays
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Unique Listeners
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Duration
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topSongs.map((song, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 text-sm text-gray-900">
                        #{index + 1}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-lg">🎵</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {song.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {song.plays.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {song.listeners.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {song.duration}
                      </td>
                      <td className="py-4 px-4">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

