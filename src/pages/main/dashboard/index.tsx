import { useState, useEffect } from "react";
import Head from "next/head";
import MainLayout from "@/components/MainLayout";
import axios from "axios";
import { CONFIG } from "@/config";

export default function MainDashboard() {
    const [userName, setUserName] = useState("");
    const [userRole, setUserRole] = useState("");
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getAuthHeaders = () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("soundcave_token") : null;
        return { headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" } };
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUser = localStorage.getItem("soundcave_user");
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    setUserName(user?.name || "User");
                    setUserRole(user?.role || "");
                } catch { /* */ }
            }
        }

        const fetchStats = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${CONFIG.API_URL}/api/dashboard/stats`, getAuthHeaders());
                if (response.data?.success && response.data?.data) {
                    setStats(response.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch stats:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const roleLabel = userRole === "artist" ? "Independent Artist" : userRole === "label" ? "Label" : "User";

    return (
        <>
            <Head>
                <title>Dashboard - SoundCave</title>
                <meta name="description" content="Your SoundCave Dashboard" />
            </Head>

            <MainLayout>
                <div className="p-6">
                    {/* Welcome Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Welcome back, {userName}! 👋
                        </h1>
                        <p className="text-gray-600">
                            Here&apos;s an overview of your {roleLabel} account.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {isLoading ? (
                            [1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                                    <div className="h-8 bg-gray-200 rounded mb-4"></div>
                                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-10 bg-gray-200 rounded"></div>
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-3xl">🎵</span>
                                    </div>
                                    <h3 className="text-gray-600 text-sm font-medium mb-1">Total Songs</h3>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats?.totals?.musics?.toLocaleString() || "0"}
                                    </p>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-3xl">💿</span>
                                    </div>
                                    <h3 className="text-gray-600 text-sm font-medium mb-1">Total Albums</h3>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats?.totals?.albums?.toLocaleString() || "0"}
                                    </p>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-3xl">▶️</span>
                                    </div>
                                    <h3 className="text-gray-600 text-sm font-medium mb-1">Total Plays</h3>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats?.music_stats?.total_play_count?.toLocaleString() || "0"}
                                    </p>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-3xl">❤️</span>
                                    </div>
                                    <h3 className="text-gray-600 text-sm font-medium mb-1">Total Likes</h3>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats?.music_stats?.total_like_count?.toLocaleString() || "0"}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button
                                onClick={() => window.location.href = "/main/song"}
                                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            >
                                <span className="text-2xl">🎵</span>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-gray-900">Upload Song</p>
                                    <p className="text-xs text-gray-500">Add new music to your catalog</p>
                                </div>
                            </button>
                            <button
                                onClick={() => window.location.href = "/main/album"}
                                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            >
                                <span className="text-2xl">💿</span>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-gray-900">Create Album</p>
                                    <p className="text-xs text-gray-500">Organize your songs into albums</p>
                                </div>
                            </button>
                            <button
                                onClick={() => window.location.href = "/main/music-video"}
                                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            >
                                <span className="text-2xl">🎬</span>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-gray-900">Upload Music Video</p>
                                    <p className="text-xs text-gray-500">Share your music videos</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center space-x-4 animate-pulse">
                                        <div className="w-10 h-10 bg-gray-200 rounded"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : stats?.recent_activity ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-2xl">🎵</span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">New Songs</p>
                                            <p className="text-sm text-gray-600">
                                                {stats.recent_activity.last_7_days?.new_musics || 0} new songs in the last 7 days
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-2xl">💿</span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">New Albums</p>
                                            <p className="text-sm text-gray-600">
                                                {stats.recent_activity.last_7_days?.new_albums || 0} new albums in the last 7 days
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No recent activity
                            </div>
                        )}
                    </div>
                </div>
            </MainLayout>
        </>
    );
}
