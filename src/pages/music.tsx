import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/Pagination";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";

interface Music {
  id: number;
  title: string;
  artist: string;
  artist_id: number;
  album: string | null;
  album_id: number | null;
  genre: string;
  release_date: string;
  duration: string;
  language: string | null;
  explicit: boolean;
  lyrics: string | null;
  description: string | null;
  tags: string | null;
  audio_file_url: string;
  cover_image_url: string | null;
  play_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export default function Music() {
  const router = useRouter();
  const { success, error, warning } = useToast();
  const [musics, setMusics] = useState<Music[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGenre, setFilterGenre] = useState("all");
  const [filterArtist, setFilterArtist] = useState("all");
  const [filterLanguage, setFilterLanguage] = useState("all");
  const [filterExplicit, setFilterExplicit] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<Music | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    artist_id: "",
    album: "",
    album_id: "",
    genre: "",
    release_date: "",
    duration: "",
    language: "",
    explicit: false,
    lyrics: "",
    description: "",
    tags: "",
  });
  const [artists, setArtists] = useState<Array<{ id: number; name: string }>>(
    []
  );
  const [albums, setAlbums] = useState<Array<{ id: number; title: string; artist: string }>>(
    []
  );
  const [genres, setGenres] = useState<Array<{ id: number; name: string }>>(
    []
  );
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);

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

  // Languages
  const languages = [
    "all",
    "English",
    "Indonesian",
    "Spanish",
    "French",
    "Japanese",
    "Korean",
    "Other",
  ];

  // Fetch musics from API
  const fetchMusics = async (pageParam = 1, query?: string) => {
    try {
      setIsLoading(true);
      const params: Record<string, any> = {
        page: pageParam,
        limit: pageSize,
        sort_by: sortBy,
        order: order,
      };

      if (query) {
        params.search = query;
      }
      if (filterGenre !== "all") {
        params.genre = filterGenre;
      }
      if (filterArtist !== "all") {
        params.artist_id = filterArtist;
      }
      if (filterLanguage !== "all") {
        params.language = filterLanguage;
      }
      if (filterExplicit !== "all") {
        params.explicit = filterExplicit === "true";
      }

      const response = await axios.get(`${CONFIG.API_URL}/api/musics`, {
        params,
        ...getAuthHeaders(),
      });

      if (response.data?.success && response.data?.data) {
        const musicsList = response.data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          artist: item.artist,
          artist_id: item.artist_id,
          album: item.album || null,
          album_id: item.album_id || null,
          genre: item.genre,
          release_date: item.release_date,
          duration: item.duration,
          language: item.language || null,
          explicit: item.explicit || false,
          lyrics: item.lyrics || null,
          description: item.description || null,
          tags: item.tags || null,
          audio_file_url: item.audio_file_url,
          cover_image_url: item.cover_image_url || null,
          play_count: item.play_count || 0,
          like_count: item.like_count || 0,
          created_at: item.created_at,
          updated_at: item.updated_at,
          deleted_at: item.deleted_at || null,
        }));
        setMusics(musicsList);

        if (response.data?.pagination) {
          setPage(response.data.pagination.page);
          setTotal(response.data.pagination.total);
          setTotalPages(response.data.pagination.pages);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch musics:", err);
      const msg =
        err?.response?.data?.message ||
        "Failed to fetch musics. Please try again.";
      error("Failed to Fetch Musics", msg);
      toast.error(msg);
      setMusics([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch artists from API
  const fetchArtists = async () => {
    try {
      setIsLoadingArtists(true);
      const response = await axios.get(`${CONFIG.API_URL}/api/artists`, {
        params: {
          page: 1,
          limit: 100, // Get all artists
        },
        ...getAuthHeaders(),
      });

      if (response.data?.success && response.data?.data) {
        const artistsList = response.data.data.map(
          (artist: { id: number; name: string }) => ({
            id: artist.id,
            name: artist.name,
          })
        );
        setArtists(artistsList);
      }
    } catch (err: any) {
      console.error("Failed to fetch artists:", err);
      setArtists([]);
    } finally {
      setIsLoadingArtists(false);
    }
  };

  // Fetch albums from API
  const fetchAlbums = async () => {
    try {
      const response = await axios.get(`${CONFIG.API_URL}/api/albums`, {
        params: {
          page: 1,
          limit: 100, // Get all albums
        },
        ...getAuthHeaders(),
      });

      if (response.data?.success && response.data?.data) {
        const albumsList = response.data.data.map(
          (album: { id: number; title: string; artist: string }) => ({
            id: album.id,
            title: album.title,
            artist: album.artist,
          })
        );
        setAlbums(albumsList);
      }
    } catch (err: any) {
      console.error("Failed to fetch albums:", err);
      setAlbums([]);
    }
  };

  // Fetch genres from API
  const fetchGenres = async () => {
    try {
      setIsLoadingGenres(true);
      const response = await axios.get(`${CONFIG.API_URL}/api/genres`, {
        params: {
          page: 1,
          limit: 100, // Get all genres
        },
        ...getAuthHeaders(),
      });

      if (response.data?.success && response.data?.data) {
        const genresList = response.data.data.map(
          (genre: { id: number; name: string }) => ({
            id: genre.id,
            name: genre.name,
          })
        );
        setGenres(genresList);
      }
    } catch (err: any) {
      console.error("Failed to fetch genres:", err);
      setGenres([]);
    } finally {
      setIsLoadingGenres(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMusics(1, searchQuery);
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Fetch on filter/sort change
  useEffect(() => {
    fetchMusics(1, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterGenre, filterArtist, filterLanguage, filterExplicit, sortBy, order]);

  // Fetch on page change
  useEffect(() => {
    fetchMusics(page, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Initial fetch
  useEffect(() => {
    fetchMusics();
    fetchArtists();
    fetchAlbums();
    fetchGenres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update albums when artist changes
  useEffect(() => {
    if (formData.artist_id) {
      fetchAlbums();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.artist_id]);

  const handleEditClick = (music: Music) => {
    setFormData({
      title: music.title,
      artist: music.artist,
      artist_id: music.artist_id.toString(),
      album: music.album || "",
      album_id: music.album_id?.toString() || "",
      genre: music.genre,
      release_date: music.release_date.split("T")[0],
      duration: music.duration,
      language: music.language || "",
      explicit: music.explicit,
      lyrics: music.lyrics || "",
      description: music.description || "",
      tags: music.tags || "",
    });
    setSelectedMusic(music);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (music: Music) => {
    setSelectedMusic(music);
    setIsDeleteModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedMusic) return;

    try {
      const token = getAuthToken();

      const payload: Record<string, any> = {
        title: formData.title,
        artist:
          artists.find((artist) => artist.id === parseInt(formData.artist_id))
            ?.name || "",
        artist_id: parseInt(formData.artist_id),
        genre: formData.genre,
        release_date: formData.release_date,
        duration: formData.duration,
        explicit: formData.explicit,
      };

      // Optional fields
      if (formData.album_id) {
        payload.album_id = parseInt(formData.album_id);
        payload.album =
          albums.find((album) => album.id === parseInt(formData.album_id))
            ?.title || "";
      }
      if (formData.language) {
        payload.language = formData.language;
      }
      if (formData.lyrics) {
        payload.lyrics = formData.lyrics;
      }
      if (formData.description) {
        payload.description = formData.description;
      }
      if (formData.tags) {
        payload.tags = formData.tags;
      }

      const response = await axios.put(
        `${CONFIG.API_URL}/api/musics/${selectedMusic.id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!response.data?.success) {
        const errorMsg =
          response.data?.message ||
          "An error occurred while updating the music.";
        error("Failed to Update Music", errorMsg);
        toast.error(errorMsg);
        return;
      }

      setIsEditModalOpen(false);
      setSelectedMusic(null);
      setFormData({
        title: "",
        artist: "",
        artist_id: "",
        album: "",
        album_id: "",
        genre: "",
        release_date: "",
        duration: "",
        language: "",
        explicit: false,
        lyrics: "",
        description: "",
        tags: "",
      });
      success(
        "Music Updated Successfully",
        `${formData.title} has been updated.`
      );
      toast.success("Music berhasil diperbarui!");
      fetchMusics(page, searchQuery);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        "An error occurred while updating the music. Please try again.";
      error("Failed to Update Music", msg);
      toast.error(msg);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMusic) return;

    const musicTitle = selectedMusic.title;

    try {
      const token = getAuthToken();

      const response = await axios.delete(
        `${CONFIG.API_URL}/api/musics/${selectedMusic.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!response.data?.success) {
        const errorMsg =
          response.data?.message ||
          "An error occurred while deleting the music.";
        error("Failed to Delete Music", errorMsg);
        toast.error(errorMsg);
        return;
      }

      setIsDeleteModalOpen(false);
      setSelectedMusic(null);
      warning("Music Deleted", `${musicTitle} has been removed.`);
      toast.success("Music berhasil dihapus!");
      fetchMusics(page, searchQuery);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        "An error occurred while deleting the music. Please try again.";
      error("Failed to Delete Music", msg);
      toast.error(msg);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <>
      <Head>
        <title>Music - SoundCave</title>
        <meta name="description" content="Music Library SoundCave" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Music Library</h1>
            <p className="text-gray-600">Kelola semua musik dalam platform Anda</p>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col gap-4">
              {/* Top Row - Search and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Input
                    type="text"
                    placeholder="Cari judul, artist, atau album..."
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

                {/* Right Side - Actions */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => router.push('/music/create')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    + Upload Music
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium whitespace-nowrap">
                    Export
                  </button>
                </div>
              </div>

              {/* Bottom Row - Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Genre Filter */}
                <div className="flex-shrink-0">
                  <select
                    value={filterGenre}
                    onChange={(e) => setFilterGenre(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 min-w-[140px]"
                  >
                    <option value="all">All Genres</option>
                    {genres.map((genre) => (
                      <option key={genre.id} value={genre.name}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Artist Filter */}
                <div className="flex-shrink-0">
                  <select
                    value={filterArtist}
                    onChange={(e) => setFilterArtist(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 min-w-[140px]"
                  >
                    <option value="all">All Artists</option>
                    {artists.map((artist) => (
                      <option key={artist.id} value={artist.id}>
                        {artist.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language Filter */}
                <div className="flex-shrink-0">
                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 min-w-[140px]"
                  >
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang === "all" ? "All Languages" : lang}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Explicit Filter */}
                <div className="flex-shrink-0">
                  <select
                    value={filterExplicit}
                    onChange={(e) => setFilterExplicit(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 min-w-[140px]"
                  >
                    <option value="all">All Content</option>
                    <option value="false">Clean</option>
                    <option value="true">Explicit</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="flex-shrink-0">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 min-w-[180px]"
                  >
                    <option value="created_at">Terbaru</option>
                    <option value="title">Judul (A-Z)</option>
                    <option value="play_count">Paling Banyak Diputar</option>
                    <option value="like_count">Paling Banyak Disukai</option>
                  </select>
                </div>

                {/* Order */}
                <div className="flex-shrink-0">
                  <select
                    value={order}
                    onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 min-w-[100px]"
                  >
                    <option value="desc">Desc</option>
                    <option value="asc">Asc</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Music Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Song
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Album
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Genre
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Plays
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : musics.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">
                        No music found
                      </td>
                    </tr>
                  ) : (
                    musics.map((music) => (
                      <tr
                        key={music.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center shrink-0 overflow-hidden">
                              {music.cover_image_url ? (
                                <img
                                  src={music.cover_image_url}
                                  alt={music.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xl">🎵</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {music.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(music.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-900">
                          {music.artist}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {music.album || "-"}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            {music.genre}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {music.duration}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                          {music.play_count.toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              !music.deleted_at
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {!music.deleted_at ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => router.push(`/music/${music.id}`)}
                              className="text-blue-600 hover:text-blue-700"
                              title="View Details"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path
                                  fillRule="evenodd"
                                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEditClick(music)}
                              className="text-gray-600 hover:text-gray-700"
                              title="Edit"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(music)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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
                  const query = searchQuery.trim() || undefined;
                  fetchMusics(nextPage, query);
                }}
              />
            )}
          </div>

          {/* Edit Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Music</DialogTitle>
                <DialogDescription>
                  Perbarui informasi music yang dipilih
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div>
                  <label
                    htmlFor="edit-title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="edit-title"
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter music title"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-artist"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Artist <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="edit-artist"
                    name="artist_id"
                    required
                    value={formData.artist_id}
                    onChange={handleChange}
                    disabled={isLoadingArtists}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {isLoadingArtists ? "Loading artists..." : "Select artist"}
                    </option>
                    {artists.map((artist) => (
                      <option key={artist.id} value={artist.id}>
                        {artist.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="edit-album"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Album
                  </label>
                  <select
                    id="edit-album"
                    name="album_id"
                    value={formData.album_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                  >
                    <option value="">Select album (optional)</option>
                    {albums
                      .filter(
                        (album) =>
                          !formData.artist_id ||
                          true // Filter by artist_id if needed
                      )
                      .map((album) => (
                        <option key={album.id} value={album.id}>
                          {album.title} - {album.artist}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="edit-genre"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Genre <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="edit-genre"
                    name="genre"
                    required
                    value={formData.genre}
                    onChange={handleChange}
                    disabled={isLoadingGenres}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {isLoadingGenres ? "Loading genres..." : "Select genre"}
                    </option>
                    {genres.map((genre) => (
                      <option key={genre.id} value={genre.name}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="edit-release-date"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Release Date
                  </label>
                  <Input
                    id="edit-release-date"
                    name="release_date"
                    type="date"
                    value={formData.release_date}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-duration"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="edit-duration"
                    name="duration"
                    type="text"
                    required
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g. 03:45"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-language"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Language
                  </label>
                  <select
                    id="edit-language"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                  >
                    <option value="">Select language</option>
                    {languages
                      .filter((lang) => lang !== "all")
                      .map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    id="edit-explicit"
                    name="explicit"
                    type="checkbox"
                    checked={formData.explicit}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="edit-explicit"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Explicit Content
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="edit-description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="edit-description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter music description..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="edit-tags"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tags
                  </label>
                  <Input
                    id="edit-tags"
                    name="tags"
                    type="text"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g. pop, dreamy, midnight"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="edit-lyrics"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Lyrics
                  </label>
                  <textarea
                    id="edit-lyrics"
                    name="lyrics"
                    rows={6}
                    value={formData.lyrics}
                    onChange={handleChange}
                    placeholder="Enter song lyrics..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400 font-mono"
                  />
                </div>
              </div>

              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEditSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Music
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Modal */}
          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Music</DialogTitle>
                <DialogDescription>
                  Apakah Anda yakin ingin menghapus music ini?
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-start space-x-4 mt-4">
                  <div className="shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Warning</p>
                  <p className="text-sm text-red-700 mt-1">
                    This action cannot be undone. This music will be permanently
                    deleted.
                  </p>
                </div>
              </div>

              {selectedMusic && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Music:{" "}
                    <span className="font-medium text-gray-900">
                      {selectedMusic.title}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Artist:{" "}
                    <span className="font-medium text-gray-900">
                      {selectedMusic.artist}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Plays:{" "}
                    <span className="font-medium text-gray-900">
                      {selectedMusic.play_count}
                    </span>
                  </p>
                </div>
              )}

              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Music
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
    </>
  );
}

