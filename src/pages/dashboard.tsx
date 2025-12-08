import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import axios from "axios";
import { CONFIG } from "@/config";
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
} from "recharts";

interface DashboardStats {
  totals: {
    users: number;
    albums: number;
    musics: number;
    artists: number;
    playlists: number;
    genres: number;
    podcasts: number;
    music_videos: number;
    notifications: number;
    subscription_plans: number;
    images: number;
    playlist_songs: number;
  };
  music_stats: {
    total_play_count: number;
    total_like_count: number;
  };
  user_stats: {
    total: number;
    admin: number;
    premium: number;
    regular: number;
  };
  album_stats: {
    total: number;
    singles: number;
    eps: number;
    albums: number;
    compilations: number;
  };
  playlist_stats: {
    total: number;
    public: number;
    private: number;
  };
  notification_stats: {
    total: number;
    unread: number;
    read: number;
  };
  recent_activity: {
    last_7_days: {
      new_users: number;
      new_musics: number;
      new_albums: number;
    };
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${CONFIG.API_URL}/api/dashboard/stats`,
        getAuthHeaders()
      );

      if (response.data?.success && response.data?.data) {
        setStats(response.data.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch dashboard stats:", err);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Data untuk charts (placeholder, bisa diupdate dengan data real dari API jika tersedia)
  const monthlyData = [
    { name: "Jan", plays: 4000, downloads: 2400, revenue: 2400 },
    { name: "Feb", plays: 3000, downloads: 1398, revenue: 2210 },
    { name: "Mar", plays: 2000, downloads: 9800, revenue: 2290 },
    { name: "Apr", plays: 2780, downloads: 3908, revenue: 2000 },
    { name: "May", plays: 1890, downloads: 4800, revenue: 2181 },
    { name: "Jun", plays: 2390, downloads: 3800, revenue: 2500 },
    { name: "Jul", plays: 3490, downloads: 4300, revenue: 2100 },
  ];

  const genreData = [
    { name: "Pop", value: 400 },
    { name: "Rock", value: 300 },
    { name: "Jazz", value: 200 },
    { name: "Electronic", value: 278 },
    { name: "Classical", value: 189 },
  ];

  const COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"];

  // Stats cards data
  const statsCards = stats
    ? [
        {
          title: "Total Plays",
          value: stats.music_stats.total_play_count.toLocaleString(),
          change: "",
          isPositive: true,
          icon: "▶️",
        },
        {
          title: "Total Users",
          value: stats.totals.users.toLocaleString(),
          change: "",
          isPositive: true,
          icon: "👥",
        },
        {
          title: "Total Musics",
          value: stats.totals.musics.toLocaleString(),
          change: "",
          isPositive: true,
          icon: "🎵",
        },
        {
          title: "Total Albums",
          value: stats.totals.albums.toLocaleString(),
          change: "",
          isPositive: true,
          icon: "💿",
        },
      ]
    : [];

  // Album stats for bar chart
  const albumStatsData = stats
    ? [
        { name: "Singles", value: stats.album_stats.singles },
        { name: "EPs", value: stats.album_stats.eps },
        { name: "Albums", value: stats.album_stats.albums },
        { name: "Compilations", value: stats.album_stats.compilations },
      ]
    : [];

  // Playlist stats for pie chart
  const playlistStatsData = stats
    ? [
        { name: "Public", value: stats.playlist_stats.public },
        { name: "Private", value: stats.playlist_stats.private },
      ]
    : [];

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
              {statsCards.map((stat, index) => (
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

          {/* Additional Stats Cards */}
          {stats && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">🎤</span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  Total Artists
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totals.artists.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  Total Playlists
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totals.playlists.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">❤️</span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  Total Likes
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.music_stats.total_like_count.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">🔔</span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  Unread Notifications
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.notification_stats.unread.toLocaleString()}
                </p>
              </div>
            </div>
          )}

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

            {/* Pie Chart - Playlist Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Playlist Distribution
              </h3>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={playlistStatsData}
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
                      {playlistStatsData.map((entry, index) => (
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

            {/* Bar Chart - Album Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Album Types Distribution
              </h3>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={albumStatsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3B82F6" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity (Last 7 Days)
            </h3>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 animate-pulse"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : stats ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">👤</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        New Users Registered
                      </p>
                      <p className="text-sm text-gray-600">
                        {stats.recent_activity.last_7_days.new_users} new users
                        in the last 7 days
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">🎵</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        New Musics Uploaded
                      </p>
                      <p className="text-sm text-gray-600">
                        {stats.recent_activity.last_7_days.new_musics} new
                        musics in the last 7 days
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">💿</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        New Albums Created
                      </p>
                      <p className="text-sm text-gray-600">
                        {stats.recent_activity.last_7_days.new_albums} new albums
                        in the last 7 days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No activity data available
              </div>
            )}
          </div>

          {/* User Stats Summary */}
          {stats && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  User Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Users</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.user_stats.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Admin</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.user_stats.admin.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Premium</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.user_stats.premium.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Regular</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.user_stats.regular.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Notification Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.notification_stats.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Unread</span>
                    <span className="text-sm font-semibold text-red-600">
                      {stats.notification_stats.unread.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Read</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.notification_stats.read.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Genres</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.totals.genres.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Playlist Songs</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.totals.playlist_songs.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Images</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.totals.images.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Subscription Plans
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.totals.subscription_plans.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}

