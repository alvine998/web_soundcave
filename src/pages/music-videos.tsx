import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Pagination } from "@/components/Pagination";
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

interface MusicVideo {
  id: number;
  title: string;
  artist_id: number;
  artist: string;
  release_date: string;
  duration: string;
  genre: string;
  description: string | null;
  video_url: string;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export default function MusicVideos() {
  const router = useRouter();
  const { success, error, warning } = useToast();

  const [videos, setVideos] = useState<MusicVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterArtist, setFilterArtist] = useState("all");
  const [filterGenre, setFilterGenre] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<MusicVideo | null>(null);
  const [artists, setArtists] = useState<Array<{ id: number; name: string }>>(
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


  // Fetch music videos from API
  const fetchMusicVideos = async (pageParam = 1, query?: string) => {
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
      if (filterArtist !== "all") {
        params.artist_id = filterArtist;
      }
      if (filterGenre !== "all") {
        params.genre = filterGenre;
      }

      const response = await axios.get(
        `${CONFIG.API_URL}/api/music-videos`,
        {
          params,
          ...getAuthHeaders(),
        }
      );

      if (response.data?.success && response.data?.data) {
        const videosList = response.data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          artist_id: item.artist_id,
          artist: item.artist,
          release_date: item.release_date,
          duration: item.duration,
          genre: item.genre,
          description: item.description || null,
          video_url: item.video_url,
          thumbnail: item.thumbnail || null,
          created_at: item.created_at,
          updated_at: item.updated_at,
          deleted_at: item.deleted_at || null,
        }));
        setVideos(videosList);

        if (response.data?.pagination) {
          setPage(response.data.pagination.page);
          setTotal(response.data.pagination.total);
          setTotalPages(response.data.pagination.pages);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch music videos:", err);
      const msg =
        err?.response?.data?.message ||
        "Failed to fetch music videos. Please try again.";
      error("Failed to Fetch Videos", msg);
      toast.error(msg);
      setVideos([]);
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
      fetchMusicVideos(1, searchQuery);
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Fetch on filter/sort change
  useEffect(() => {
    fetchMusicVideos(1, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterArtist, filterGenre, sortBy, order]);

  // Fetch on page change
  useEffect(() => {
    fetchMusicVideos(page, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Initial fetch
  useEffect(() => {
    fetchMusicVideos();
    fetchArtists();
    fetchGenres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddClick = () => {
    router.push("/music-videos/create");
  };

  const handleEditClick = (video: MusicVideo) => {
    router.push(`/music-videos/edit/${video.id}`);
  };

  const handleDeleteClick = (video: MusicVideo) => {
    setSelectedVideo(video);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedVideo) return;

    const videoTitle = selectedVideo.title;

    try {
      const token = getAuthToken();

      const response = await axios.delete(
        `${CONFIG.API_URL}/api/music-videos/${selectedVideo.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (response.data?.success) {
        setIsDeleteModalOpen(false);
        setSelectedVideo(null);
        warning("Video Deleted", `${videoTitle} has been removed.`);
        toast.success("Music video berhasil dihapus!");
        fetchMusicVideos(page, searchQuery);
      } else {
        throw new Error(response.data?.message || "Failed to delete video");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Failed to delete music video. Please try again.";
      error("Failed to Delete", msg);
      toast.error(msg);
    }
  };


  return (
    <>
      <Head>
        <title>Music Videos - SoundCave</title>
        <meta name="description" content="Manage music videos" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Music Videos</h1>
            <p className="text-gray-600">Kelola semua music video di platform Anda</p>
          </div>


          {/* Search and Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col gap-4">
              {/* Top Row - Search and Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Input
                    type="text"
                    placeholder="Cari video atau artist..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
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

                <button
                  onClick={handleAddClick}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  + Add Video
                </button>
              </div>

              {/* Bottom Row - Filters */}
              <div className="flex flex-wrap items-center gap-3">
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

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 min-w-[140px]"
                >
                  <option value="created_at">Terbaru</option>
                  <option value="title">Judul (A-Z)</option>
                  <option value="release_date">Release Date</option>
                </select>

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

          {/* Videos Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse"
                >
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <span className="text-6xl mb-4 block">🎬</span>
              <p className="text-gray-600">No music videos found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Thumbnail */}
                    <div className="h-48 bg-gradient-to-br from-red-400 to-pink-600 flex items-center justify-center overflow-hidden">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-6xl">🎬</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{video.artist}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          {video.genre}
                        </span>
                        <span className="text-xs text-gray-500">
                          ⏱️ {video.duration}
                        </span>
                      </div>

                      {video.description && (
                        <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                          {video.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditClick(video)}
                          className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(video)}
                          className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {total > 0 && (
                <Pagination
                  total={total}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={(nextPage) => {
                    const query = searchQuery.trim() || undefined;
                    fetchMusicVideos(nextPage, query);
                  }}
                />
              )}
            </>
          )}
        </div>
      </Layout>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Music Video</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this music video?
            </DialogDescription>
          </DialogHeader>

          <div className="my-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-600 mt-0.5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-900">Warning</p>
                  <p className="text-sm text-red-700 mt-1">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            {selectedVideo && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Video: <span className="font-medium text-gray-900">{selectedVideo.title}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Artist: <span className="font-medium text-gray-900">{selectedVideo.artist}</span>
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Delete Video
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

