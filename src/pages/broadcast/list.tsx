import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/Pagination";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";

interface StreamHistory {
    id: number;
    title: string;
    description: string;
    artist_name?: string;
    status: string;
    start_time: string;
    end_time: string;
    total_viewers?: number;
    peak_viewers?: number;
    thumbnail?: string;
    duration?: string;
    created_at?: string;
    updated_at?: string;
}

export default function BroadcastHistoryList() {
    const router = useRouter();
    const [streams, setStreams] = useState<StreamHistory[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [userRole, setUserRole] = useState("");
    const [isInitialized, setIsInitialized] = useState(false);
    const [stoppingStreamId, setStoppingStreamId] = useState<number | null>(null);

    const getAuthHeaders = () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("soundcave_token") : null;
        return { headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" } };
    };

    const fetchStreamHistory = async (pageParam = 1) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${CONFIG.API_URL}/api/artist-streams/history`, {
                params: {
                    page: pageParam,
                    limit: pageSize,
                    search: searchQuery || "",
                },
                ...getAuthHeaders(),
            });

            if (response.data?.success) {
                const items = response.data.data || [];
                setStreams(items.map((item: any) => ({
                    id: item.id,
                    title: item.title || "-",
                    description: item.description || "-",
                    artist_name: item.artist_name || item.artist?.name || "-",
                    status: item.status || "completed",
                    start_time: item.start_time ? item.start_time.split("T")[0] : "-",
                    end_time: item.end_time ? item.end_time.split("T")[0] : "-",
                    total_viewers: item.total_viewers || 0,
                    peak_viewers: item.peak_viewers || 0,
                    thumbnail: item.thumbnail,
                    duration: item.duration || "-",
                    created_at: item.created_at ? item.created_at.split("T")[0] : "-",
                    updated_at: item.updated_at ? item.updated_at.split("T")[0] : "-",
                })));

                const pagination = response.data.pagination || {};
                setPage(pagination.page || pageParam);
                setTotal(pagination.total || items.length);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to load stream history.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this stream record?")) return;
        try {
            const response = await axios.delete(`${CONFIG.API_URL}/api/artist-streams/${id}`, getAuthHeaders());
            if (response.data?.success) {
                toast.success("Stream deleted successfully");
                fetchStreamHistory(page);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to delete stream.");
        }
    };

    const handleStopBroadcast = async (id: number) => {
        if (!confirm("Are you sure you want to stop this broadcast?")) return;
        try {
            setStoppingStreamId(id);
            const response = await axios.post(
                `${CONFIG.API_URL}/api/artist-streams/end/${id}`,
                {},
                getAuthHeaders()
            );
            if (response.data?.success) {
                toast.success("Broadcast stopped successfully");
                fetchStreamHistory(page);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to stop broadcast.");
        } finally {
            setStoppingStreamId(null);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("soundcave_user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserRole(user.role);

            if (user.role !== "admin") {
                router.push("/main/dashboard");
                return;
            }
        } else {
            router.push("/");
            return;
        }

        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        const timeout = setTimeout(() => {
            fetchStreamHistory(page);
        }, 500);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, page, isInitialized]);

    const getStatusBadge = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower === "live" || statusLower === "active") {
            return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Live</span>;
        } else if (statusLower === "completed" || statusLower === "ended") {
            return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Completed</span>;
        } else if (statusLower === "scheduled") {
            return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Scheduled</span>;
        }
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">{status}</span>;
    };

    const formatDuration = (duration: string) => {
        if (!duration || duration === "-") return "-";
        const seconds = parseInt(duration);
        if (isNaN(seconds)) return duration;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    return (
        <>
            <Head>
                <title>Live Stream History - SoundCave</title>
                <meta name="description" content="View live stream history" />
            </Head>

            <Layout>
                <div className="p-6">
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Stream History</h1>
                            <p className="text-gray-600">View all past live stream broadcasts</p>
                        </div>
                        <button
                            onClick={() => router.push("/broadcast")}
                            className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            + New Broadcast
                        </button>
                    </div>

                    {/* Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="relative max-w-md">
                            <Input
                                type="text"
                                placeholder="Search streams..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Streams Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="mt-4 text-gray-600">Loading stream history...</p>
                            </div>
                        ) : streams.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="text-6xl mb-4 block">📺</span>
                                <p className="text-gray-600">No streams found</p>
                                <button
                                    onClick={() => router.push("/broadcast")}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                    Start Your First Broadcast
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Artist</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Start Date</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Viewers</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Peak Viewers</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {streams.map((stream) => (
                                                <tr key={stream.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="shrink-0 h-10 w-10 rounded overflow-hidden bg-gray-200 flex items-center justify-center">
                                                                {stream.thumbnail ? (
                                                                    <img src={stream.thumbnail} alt={stream.title} className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <span className="text-xl">📺</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{stream.title}</p>
                                                                <p className="text-xs text-gray-500">{stream.description?.substring(0, 30)}...</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-600">{stream.artist_name}</td>
                                                    <td className="py-4 px-6">{getStatusBadge(stream.status)}</td>
                                                    <td className="py-4 px-6 text-sm text-gray-600">{stream.start_time}</td>
                                                    <td className="py-4 px-6 text-sm text-gray-900">{(stream.total_viewers ?? 0).toLocaleString()}</td>
                                                    <td className="py-4 px-6 text-sm text-gray-900">{(stream.peak_viewers ?? 0).toLocaleString()}</td>
                                                    <td className="py-4 px-6">
                                                        <button
                                                            onClick={() => router.push(`/broadcast/${stream.id}`)}
                                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-3"
                                                        >
                                                            View
                                                        </button>
                                                        {(stream.status.toLowerCase() === "live" || stream.status.toLowerCase() === "active") && (
                                                            <button
                                                                onClick={() => handleStopBroadcast(stream.id)}
                                                                disabled={stoppingStreamId === stream.id}
                                                                className="text-amber-600 hover:text-amber-700 text-sm font-medium mr-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {stoppingStreamId === stream.id ? "Stopping..." : "Stop"}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(stream.id)}
                                                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {total > 0 && (
                                    <Pagination
                                        total={total}
                                        page={page}
                                        pageSize={pageSize}
                                        onPageChange={(nextPage) => {
                                            setPage(nextPage);
                                            fetchStreamHistory(nextPage);
                                        }}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </Layout>
        </>
    );
}
