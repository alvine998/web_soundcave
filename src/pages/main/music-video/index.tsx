import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import MainLayout from "@/components/MainLayout";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/Pagination";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";

interface MusicVideo {
    id: number;
    title: string;
    artist_name: string;
    duration: string;
    thumbnail?: string;
    view_count: number;
    created_at: string;
    is_approved: number;
    is_highlight: number;
    submitted_by: string;
}

export default function MainMusicVideo() {
    const router = useRouter();
    const [videos, setVideos] = useState<MusicVideo[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [artistId, setArtistId] = useState<number | null>(null);
    const [adminUserId, setAdminUserId] = useState<number | null>(null);
    const [userRole, setUserRole] = useState("");
    const [activeTab, setActiveTab] = useState<'all' | 'request_approval'>('all');
    const [isInitialized, setIsInitialized] = useState(false);

    const getAuthHeaders = () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("soundcave_token") : null;
        return { headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" } };
    };

    const fetchVideos = async (pageParam = 1) => {
        try {
            setIsLoading(true);
            const params: any = {
                page: pageParam,
                limit: pageSize,
                search: searchQuery || ""
            };

            if (activeTab === 'request_approval') {
                params.is_approved = 0;
            }

            if (artistId) {
                params.artist_id = artistId;
            }

            const response = await axios.get(`${CONFIG.API_URL}/api/music-videos`, {
                params,
                ...getAuthHeaders(),
            });

            if (response.data?.success) {
                const items = response.data.data || [];
                setVideos(items.map((item: any) => ({
                    id: item.id,
                    title: item.title || item.name,
                    artist_name: item.artist_name || item.artist?.name || "-",
                    duration: item.duration || "-",
                    thumbnail: item.thumbnail,
                    view_count: item.view_count || 0,
                    created_at: item.created_at ? item.created_at.split("T")[0] : "-",
                    is_approved: item.is_approved || 0,
                    is_highlight: item.is_highlight || 0,
                    submitted_by: item.submitted_by || "",
                })));

                const pagination = response.data.pagination || {};
                setPage(pagination.page || pageParam);
                setTotal(pagination.total || items.length);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to load music videos.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproval = async (id: number) => {
        if (!confirm("Approve this music video?")) return;
        try {
            const response = await axios.put(`${CONFIG.API_URL}/api/music-videos/${id}`, {
                is_approved: 1,
                approved_by: adminUserId
            }, getAuthHeaders());

            if (response.data?.success) {
                toast.success("Music video approved!");
                fetchVideos(page);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to approve music video.");
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm("Reject this music video?")) return;
        try {
            const response = await axios.put(`${CONFIG.API_URL}/api/music-videos/${id}`, {
                is_approved: 2, // Reject
                approved_by: adminUserId
            }, getAuthHeaders());

            if (response.data?.success) {
                toast.success("Music video rejected!");
                fetchVideos(page);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to reject music video.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this music video?")) return;
        try {
            const response = await axios.delete(`${CONFIG.API_URL}/api/music-videos/${id}`, getAuthHeaders());
            if (response.data?.success) {
                toast.success("Music video deleted successfully");
                fetchVideos(page);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to delete music video.");
        }
    };

    useEffect(() => {
        const init = async () => {
            const storedUser = localStorage.getItem("soundcave_user");
            if (storedUser) {
                const user = JSON.parse(storedUser);
                setUserRole(user.role);
                if (user.role === "admin") {
                    setAdminUserId(user.id);
                }
                if (user.role === "independent") {
                    try {
                        const response = await axios.get(`${CONFIG.API_URL}/api/artists`, {
                            params: { ref_user_id: user.id },
                            ...getAuthHeaders()
                        });
                        if (response.data?.success && response.data.data.length > 0) {
                            setArtistId(response.data.data[0].id);
                        }
                    } catch (err) {
                        console.error("Error fetching artist id", err);
                    }
                }
            }
            setIsInitialized(true);
        };
        init();
    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        const timeout = setTimeout(() => {
            fetchVideos(page);
        }, 500);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, page, artistId, isInitialized, activeTab]);

    return (
        <>
            <Head>
                <title>Music Videos - SoundCave</title>
                <meta name="description" content="Manage your music videos" />
            </Head>

            <MainLayout>
                <div className="p-6">
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Music Videos</h1>
                            <p className="text-gray-600">Upload and manage your music videos</p>
                        </div>
                        <button
                            onClick={() => router.push("/main/music-video/create")}
                            className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            + Upload Video
                        </button>
                    </div>

                    {/* Tabs */}
                    {userRole === "admin" && (
                        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
                            <button
                                onClick={() => { setActiveTab('all'); setPage(1); }}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'all'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                All Music Videos
                            </button>
                            <button
                                onClick={() => { setActiveTab('request_approval'); setPage(1); }}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'request_approval'
                                    ? 'bg-white text-orange-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Request Approval
                            </button>
                        </div>
                    )}

                    {/* Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="relative max-w-md">
                            <Input
                                type="text"
                                placeholder="Search music videos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Videos Grid */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="mt-4 text-gray-600">Loading music videos...</p>
                            </div>
                        ) : videos.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="text-6xl mb-4 block">🎬</span>
                                <p className="text-gray-600">No music videos found</p>
                                <button
                                    onClick={() => router.push("/main/music-video/create")}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                    Upload Your First Video
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                    {videos.map((video) => (
                                        <div key={video.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="h-40 bg-gray-200 flex items-center justify-center relative">
                                                {video.thumbnail ? (
                                                    <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-5xl">🎬</span>
                                                )}
                                                {video.is_highlight === 1 && (
                                                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
                                                        Highlight
                                                    </div>
                                                )}
                                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                                    {video.duration}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h4 className="text-sm font-medium text-gray-900 mb-1 truncate">{video.title}</h4>
                                                <p className="text-xs text-gray-500 mb-2">{video.artist_name}</p>
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span>{video.view_count.toLocaleString()} views</span>
                                                    <span>{video.created_at}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-3">
                                                    {userRole === 'admin' && video.is_approved === 0 && (video.submitted_by === 'artist' || video.submitted_by === 'label') ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => router.push(`/main/music-video/edit/${video.id}`)}
                                                                className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                                                            >
                                                                Detail
                                                            </button>
                                                            <button
                                                                onClick={() => handleApproval(video.id)}
                                                                className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(video.id)}
                                                                className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : activeTab === 'request_approval' ? (
                                                        <button
                                                            onClick={() => handleApproval(video.id)}
                                                            className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => router.push(`/main/music-video/edit/${video.id}`)}
                                                                className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(video.id)}
                                                                className="text-red-600 hover:text-red-700 text-xs font-medium"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {total > 0 && (
                                    <Pagination
                                        total={total}
                                        page={page}
                                        pageSize={pageSize}
                                        onPageChange={(nextPage) => { setPage(nextPage); fetchVideos(nextPage); }}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </MainLayout>
        </>
    );
}
