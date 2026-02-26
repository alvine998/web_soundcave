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
}

export default function MainMusicVideo() {
    const router = useRouter();
    const [videos, setVideos] = useState<MusicVideo[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const getAuthHeaders = () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("soundcave_token") : null;
        return { headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" } };
    };

    const fetchVideos = async (pageParam = 1) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${CONFIG.API_URL}/api/music-videos`, {
                params: { page: pageParam, limit: pageSize, search: searchQuery || "" },
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

    useEffect(() => { fetchVideos(1); }, []);
    useEffect(() => {
        const timeout = setTimeout(() => fetchVideos(1), 500);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

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
                                                    <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">Edit</button>
                                                    <button className="text-red-600 hover:text-red-700 text-xs font-medium">Delete</button>
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
