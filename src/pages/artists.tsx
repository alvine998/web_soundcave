import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/Pagination";
import { useToast } from "@/components/ui/toast";
import axios from "axios";
import { CONFIG } from "@/config";

interface Artist {
  id: number;
  name: string;
  bio: string;
  genre: string;
  country: string;
  debut_year?: string;
  website?: string;
  email?: string;
  phone?: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
  };
  profile_image?: string;
  createdAt: string;
  // Computed fields untuk UI
  followers?: number;
  songs?: number;
  albums?: number;
  monthlyListeners?: number;
  verified?: boolean;
}

export default function Artists() {
  const router = useRouter();
  const { error } = useToast();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filterGenre, setFilterGenre] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

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

  const fetchArtists = async (pageParam = 1) => {
    const url = `${CONFIG.API_URL}/api/artists?search=${searchQuery || ""}`;

    const params: Record<string, string | number> = {
      page: pageParam,
      limit: pageSize,
    };

    // Hanya kirim filter dan sort jika tidak ada search query
    // (atau sesuaikan dengan kebutuhan backend)
    if (!searchQuery.trim()) {
      if (filterGenre !== "all") {
        params.genre = filterGenre;
      }

      if (sortBy) {
        params.sortBy = sortBy;
      }
    }

    try {
      setIsLoading(true);

      const response = await axios.get(url, {
        params,
        ...getAuthHeaders(),
      });

      if (!response.data?.success) {
        const errorMsg =
          response.data?.message || "Unable to fetch artists from server.";
        error("Failed to Load Artists", errorMsg);
        console.error("API Error:", {
          url,
          params,
          response: response.data,
        });
        return;
      }

      const items = response.data.data as Array<{
        id: number;
        name: string;
        bio: string;
        genre: string;
        country: string;
        debut_year?: string;
        website?: string;
        email?: string;
        phone?: string;
        social_media?: {
          instagram?: string;
          twitter?: string;
          facebook?: string;
          youtube?: string;
        };
        profile_image?: string;
        created_at?: string;
        updated_at?: string;
      }>;

      const mapped: Artist[] = items.map((item) => ({
        id: item.id,
        name: item.name,
        bio: item.bio,
        genre: item.genre,
        country: item.country,
        debut_year: item.debut_year,
        website: item.website,
        email: item.email,
        phone: item.phone,
        social_media: item.social_media,
        profile_image: item.profile_image,
        createdAt: item.created_at
          ? item.created_at.split("T")[0]
          : new Date().toISOString().split("T")[0],
        // Default values untuk UI (bisa diambil dari API nanti jika ada)
        followers: 0,
        songs: 0,
        albums: 0,
        monthlyListeners: 0,
        verified: false,
      }));

      setArtists(mapped);

      // ambil info pagination dari backend (struktur baru dengan object pagination)
      const pagination = response.data.pagination || {};
      const apiPage =
        typeof pagination.page === "number" ? pagination.page : pageParam;
      const apiLimit =
        typeof pagination.limit === "number" ? pagination.limit : pageSize;
      const apiTotal =
        typeof pagination.total === "number" ? pagination.total : mapped.length;
      const apiTotalPages =
        typeof pagination.pages === "number"
          ? pagination.pages
          : Math.max(1, Math.ceil(apiTotal / apiLimit));

      setPage(apiPage);
      setTotal(apiTotal);
      setTotalPages(apiTotalPages);
    } catch (err: any) {
      console.error("Fetch Artists Error:", {
        url,
        params,
        error: err,
        response: err?.response?.data,
      });

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        err?.message ||
        "Terjadi kesalahan saat mengambil data artist.";
      error("Failed to Load Artists", msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchArtists(1);
    }, 500);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterGenre, sortBy]);

  const stats = [
    {
      title: "Total Artists",
      value: total.toLocaleString(),
      icon: "🎤",
      change: "+23",
    },
    { title: "Verified Artists", value: "567", icon: "✓", change: "+12" },
    { title: "Total Followers", value: "2.4M", icon: "❤️", change: "+45K" },
    { title: "New This Month", value: "34", icon: "✨", change: "+8" },
  ];

  const genres = [
    "All",
    "Pop",
    "Rock",
    "Electronic",
    "Hip Hop",
    "Classical",
    "Ambient",
  ];

  return (
    <>
      <Head>
        <title>Artists - SoundCave</title>
        <meta name="description" content="Artists SoundCave" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Artists</h1>
              <p className="text-gray-600">Jelajahi dan kelola semua artist</p>
            </div>
            <button
              onClick={() => router.push("/artists/create")}
              className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Add Artist
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Cari artist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Genre Filter */}
              <select
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
              >
                {genres.map((genre) => (
                  <option key={genre} value={genre.toLowerCase()}>
                    {genre}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
              >
                <option value="popular">Most Popular</option>
                <option value="followers">Most Followers</option>
                <option value="songs">Most Songs</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Artists Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Memuat data artist...</p>
              </div>
            ) : artists.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🎤</span>
                <p className="text-gray-600">Tidak ada artist ditemukan</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Artist
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Genre
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Country
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Debut Year
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Songs
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Albums
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Followers
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {artists.map((artist) => (
                        <tr
                          key={artist.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                {artist.profile_image ? (
                                  <img
                                    src={artist.profile_image}
                                    alt={artist.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <span className="text-xl">🎤</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {artist.name}
                                  </p>
                                  {artist.verified && (
                                    <svg
                                      className="w-4 h-4 text-blue-600 shrink-0"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>
                                {artist.bio && (
                                  <p className="text-xs text-gray-500 truncate mt-1">
                                    {artist.bio}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              {artist.genre}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-700">
                            {artist.country}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {artist.debut_year || "-"}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                            {artist.songs?.toLocaleString() || 0}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                            {artist.albums?.toLocaleString() || 0}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                            {artist.followers
                              ? artist.followers >= 1000
                                ? (artist.followers / 1000).toFixed(1) + "K"
                                : artist.followers.toLocaleString()
                              : "0"}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() =>
                                  router.push(`/artists/${artist.id}`)
                                }
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                View
                              </button>
                              <button
                                onClick={() =>
                                  router.push(`/artists/edit/${artist.id}`)
                                }
                                className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {total > 0 && (
                  <Pagination
                    total={total}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={(nextPage) => {
                      setPage(nextPage);
                      fetchArtists(nextPage);
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
