import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import MainLayout from "@/components/MainLayout";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/Pagination";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";

interface Artist {
    id: number;
    name: string;
    genre: string;
    country: string;
    profile_image?: string;
    createdAt?: string;
}

export default function MainArtistList() {
    const router = useRouter();
    const [artists, setArtists] = useState<Artist[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const getAuthHeaders = () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("soundcave_token") : null;
        return { headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" } };
    };

    const fetchArtists = async (pageParam = 1) => {
        try {
            setIsLoading(true);
            // Assuming there's an endpoint to fetch artists managed by the label
            // Or we use the general artists endpoint and filter if needed
            const response = await axios.get(`${CONFIG.API_URL}/api/artists`, {
                params: {
                    page: pageParam,
                    limit: pageSize,
                    search: searchQuery || "",
                    // managed_by_me: true // Potential backend flag for label-specific artists
                },
                ...getAuthHeaders(),
            });

            if (response.data?.success) {
                const items = response.data.data || [];
                setArtists(items.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    genre: item.genre || "-",
                    country: item.country || "-",
                    profile_image: item.profile_image,
                    createdAt: item.created_at ? item.created_at.split("T")[0] : "-",
                })));

                const pagination = response.data.pagination || {};
                setPage(pagination.page || pageParam);
                setTotal(pagination.total || items.length);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to load artists.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchArtists(1);
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => fetchArtists(1), 500);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this artist?")) return;

        try {
            const response = await axios.delete(`${CONFIG.API_URL}/api/artists/${id}`, getAuthHeaders());
            if (response.data?.success) {
                toast.success("Artist deleted successfully");
                fetchArtists(page);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to delete artist.");
        }
    };

    return (
        <>
            <Head>
                <title>Manage Artists - SoundCave</title>
            </Head>

            <MainLayout>
                <div className="p-6">
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Artists</h1>
                            <p className="text-gray-600">Manage artists under your label</p>
                        </div>
                        <button
                            onClick={() => router.push("/main/artist/create")}
                            className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            + Add Artist
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="relative max-w-md">
                            <Input
                                type="text"
                                placeholder="Search artists..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="mt-4 text-gray-600">Loading artists...</p>
                            </div>
                        ) : artists.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="text-6xl mb-4 block">🎤</span>
                                <p className="text-gray-600">No artists found</p>
                                <button
                                    onClick={() => router.push("/main/artist/create")}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                    Add Your First Artist
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Artist</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Genre</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Country</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Joined At</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {artists.map((artist) => (
                                                <tr key={artist.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                                                {artist.profile_image ? (
                                                                    <img src={artist.profile_image} alt={artist.name} className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <span className="text-xl">🎤</span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-900">{artist.name}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">{artist.genre}</span>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-700">{artist.country}</td>
                                                    <td className="py-4 px-6 text-sm text-gray-600">{artist.createdAt}</td>
                                                    <td className="py-4 px-6">
                                                        <button
                                                            onClick={() => router.push(`/main/artist/edit/${artist.id}`)}
                                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-3"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(artist.id)}
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
                                        onPageChange={(nextPage) => { setPage(nextPage); fetchArtists(nextPage); }}
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
