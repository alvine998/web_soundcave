import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import MainLayout from "@/components/MainLayout";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/Pagination";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";

interface Song {
    id: number;
    title: string;
    artist_name: string;
    album_name: string;
    genre: string;
    duration: string;
    play_count: number;
    like_count: number;
    cover_image?: string;
}

export default function MainSong() {
    const router = useRouter();
    const [songs, setSongs] = useState<Song[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [artistId, setArtistId] = useState<number | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const getAuthHeaders = () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("soundcave_token") : null;
        return { headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" } };
    };

    const fetchSongs = async (pageParam = 1) => {
        try {
            setIsLoading(true);
            const params: any = { page: pageParam, limit: pageSize, search: searchQuery || "" };
            if (artistId) {
                params.artist_id = artistId;
            }

            const response = await axios.get(`${CONFIG.API_URL}/api/musics`, {
                params,
                ...getAuthHeaders(),
            });

            if (response.data?.success) {
                const items = response.data.data || [];
                setSongs(items.map((item: any) => ({
                    id: item.id,
                    title: item.title || item.name,
                    artist_name: item.artist_name || item.artist?.name || "-",
                    album_name: item.album_name || item.album?.title || "-",
                    genre: item.genre || "-",
                    duration: item.duration || "-",
                    play_count: item.play_count || 0,
                    like_count: item.like_count || 0,
                    cover_image: item.cover_image,
                })));

                const pagination = response.data.pagination || {};
                setPage(pagination.page || pageParam);
                setTotal(pagination.total || items.length);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to load songs.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this song?")) return;
        try {
            const response = await axios.delete(`${CONFIG.API_URL}/api/musics/${id}`, getAuthHeaders());
            if (response.data?.success) {
                toast.success("Song deleted successfully");
                fetchSongs(page);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to delete song.");
        }
    };

    useEffect(() => {
        const init = async () => {
            const storedUser = localStorage.getItem("soundcave_user");
            if (storedUser) {
                const user = JSON.parse(storedUser);
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
            fetchSongs(page);
        }, 500);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, page, artistId, isInitialized]);

    const formatDuration = (dur: string) => {
        if (!dur || dur === "-") return "-";
        const num = parseInt(dur);
        if (isNaN(num)) return dur;
        const min = Math.floor(num / 60);
        const sec = num % 60;
        return `${min}:${sec.toString().padStart(2, "0")}`;
    };

    return (
        <>
            <Head>
                <title>Songs - SoundCave</title>
                <meta name="description" content="Manage your songs" />
            </Head>

            <MainLayout>
                <div className="p-6">
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Songs</h1>
                            <p className="text-gray-600">Manage your music catalog</p>
                        </div>
                        <button
                            onClick={() => router.push("/main/song/create")}
                            className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            + Upload Song
                        </button>
                    </div>

                    {/* Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="relative max-w-md">
                            <Input
                                type="text"
                                placeholder="Search songs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Songs Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="mt-4 text-gray-600">Loading songs...</p>
                            </div>
                        ) : songs.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="text-6xl mb-4 block">🎵</span>
                                <p className="text-gray-600">No songs found</p>
                                <button
                                    onClick={() => router.push("/main/song/create")}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                    Upload Your First Song
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Song</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Album</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Genre</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Duration</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Plays</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Likes</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {songs.map((song) => (
                                                <tr key={song.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="shrink-0 h-10 w-10 rounded overflow-hidden bg-gray-200 flex items-center justify-center">
                                                                {song.cover_image ? (
                                                                    <img src={song.cover_image} alt={song.title} className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <span className="text-xl">🎵</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{song.title}</p>
                                                                <p className="text-xs text-gray-500">{song.artist_name}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-700">{song.album_name}</td>
                                                    <td className="py-4 px-6">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">{song.genre}</span>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-600">{formatDuration(song.duration)}</td>
                                                    <td className="py-4 px-6 text-sm text-gray-900 font-medium">{song.play_count.toLocaleString()}</td>
                                                    <td className="py-4 px-6 text-sm text-gray-900 font-medium">{song.like_count.toLocaleString()}</td>
                                                    <td className="py-4 px-6">
                                                        <button
                                                            onClick={() => router.push(`/main/song/edit/${song.id}`)}
                                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-3"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(song.id)}
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
                                        onPageChange={(nextPage) => { setPage(nextPage); fetchSongs(nextPage); }}
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
