import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import MainLayout from "@/components/MainLayout";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/Pagination";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";

interface Album {
    id: number;
    title: string;
    artist_name: string;
    release_date: string;
    type: string;
    cover_image?: string;
    song_count: number;
}

export default function MainAlbum() {
    const router = useRouter();
    const [albums, setAlbums] = useState<Album[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const getAuthHeaders = () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("soundcave_token") : null;
        return { headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" } };
    };

    const fetchAlbums = async (pageParam = 1) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${CONFIG.API_URL}/api/albums`, {
                params: { page: pageParam, limit: pageSize, search: searchQuery || "" },
                ...getAuthHeaders(),
            });

            if (response.data?.success) {
                const items = response.data.data || [];
                setAlbums(items.map((item: any) => ({
                    id: item.id,
                    title: item.title || item.name,
                    artist_name: item.artist_name || item.artist?.name || "-",
                    release_date: item.release_date ? item.release_date.split("T")[0] : "-",
                    type: item.type || "album",
                    cover_image: item.cover_image,
                    song_count: item.song_count || 0,
                })));

                const pagination = response.data.pagination || {};
                setPage(pagination.page || pageParam);
                setTotal(pagination.total || items.length);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to load albums.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchAlbums(1); }, []);
    useEffect(() => {
        const timeout = setTimeout(() => fetchAlbums(1), 500);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    return (
        <>
            <Head>
                <title>Albums - SoundCave</title>
                <meta name="description" content="Manage your albums" />
            </Head>

            <MainLayout>
                <div className="p-6">
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Albums</h1>
                            <p className="text-gray-600">Manage and organize your album releases</p>
                        </div>
                        <button
                            onClick={() => router.push("/main/album/create")}
                            className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            + Create Album
                        </button>
                    </div>

                    {/* Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="relative max-w-md">
                            <Input
                                type="text"
                                placeholder="Search albums..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Albums Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="mt-4 text-gray-600">Loading albums...</p>
                            </div>
                        ) : albums.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="text-6xl mb-4 block">💿</span>
                                <p className="text-gray-600">No albums found</p>
                                <button
                                    onClick={() => router.push("/main/album/create")}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                    Create Your First Album
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Album</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Songs</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Release Date</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {albums.map((album) => (
                                                <tr key={album.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="shrink-0 h-10 w-10 rounded overflow-hidden bg-gray-200 flex items-center justify-center">
                                                                {album.cover_image ? (
                                                                    <img src={album.cover_image} alt={album.title} className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <span className="text-xl">💿</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{album.title}</p>
                                                                <p className="text-xs text-gray-500">{album.artist_name}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded capitalize">
                                                            {album.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-900">{album.song_count}</td>
                                                    <td className="py-4 px-6 text-sm text-gray-600">{album.release_date}</td>
                                                    <td className="py-4 px-6">
                                                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-3">Edit</button>
                                                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">Delete</button>
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
                                        onPageChange={(nextPage) => { setPage(nextPage); fetchAlbums(nextPage); }}
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
