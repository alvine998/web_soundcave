import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/Pagination';
import { useToast } from '@/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import axios from 'axios';
import { CONFIG } from '@/config';
import toast from 'react-hot-toast';

interface Playlist {
  id: number;
  name: string;
  description: string | null;
  is_public: boolean;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Computed fields untuk UI
  songs?: number;
  duration?: string;
  followers?: number;
}

export default function Playlists() {
  const router = useRouter();
  const { success, error } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: true,
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [currentCoverImage, setCurrentCoverImage] = useState<string | null>(null);

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

  const fetchPlaylists = async (pageParam = 1, query?: string) => {
    try {
      setIsLoading(true);
      const url = `${CONFIG.API_URL}/api/playlists?search=${query || ""}`;

      const params: Record<string, string | number> = {
        page: pageParam,
        limit: pageSize,
      };

      if (filterStatus !== 'all') {
        params.is_public = filterStatus === 'public' ? 'true' : 'false';
      }

      const response = await axios.get(url, {
        params,
        ...getAuthHeaders(),
      });

      if (!response.data?.success) {
        const errorMsg =
          response.data?.message || "Unable to fetch playlists from server.";
        error("Failed to Load Playlists", errorMsg);
        return;
      }

      const items = response.data.data as Array<{
        id: number;
        name: string;
        description: string | null;
        is_public: boolean;
        cover_image: string | null;
        created_at?: string;
        updated_at?: string;
        deleted_at?: string | null;
      }>;

      const mapped: Playlist[] = items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        is_public: item.is_public,
        cover_image: item.cover_image,
        created_at: item.created_at
          ? item.created_at.split("T")[0]
          : new Date().toISOString().split("T")[0],
        updated_at: item.updated_at
          ? item.updated_at.split("T")[0]
          : new Date().toISOString().split("T")[0],
        deleted_at: item.deleted_at || null,
        // Default values untuk UI (bisa diambil dari API nanti jika ada)
        songs: 0,
        duration: '0h 0m',
        followers: 0,
      }));

      setPlaylists(mapped);

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
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        "Terjadi kesalahan saat mengambil data playlist.";
      error("Failed to Load Playlists", msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // debounce search agar tidak terlalu banyak request
    const timeout = setTimeout(() => {
      const query = searchQuery.trim() || undefined;
      fetchPlaylists(1, query);
    }, 500);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterStatus]);

  const handleAddClick = () => {
    setFormData({ name: '', description: '', is_public: true });
    setCoverImage(null);
    setCoverImageUrl(null);
    setCoverImagePreview(null);
    setCurrentCoverImage(null);
    setIsAddModalOpen(true);
  };

  const handleEditClick = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setFormData({
      name: playlist.name,
      description: playlist.description || '',
      is_public: playlist.is_public,
    });
    setCoverImage(null);
    setCoverImageUrl(null);
    setCoverImagePreview(null);
    setCurrentCoverImage(playlist.cover_image);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setIsDeleteModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload image immediately
      await uploadImage(file);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      setIsUploadingImage(true);
      const token = getAuthToken();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'playlists/covers');

      const response = await axios.post(
        `${CONFIG.API_URL}/api/images/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (response.data?.success && response.data?.data?.file_url) {
        const imageUrl = response.data.data.file_url;
        setCoverImageUrl(imageUrl);
        toast.success(response.data?.message || 'Image uploaded successfully');
      } else {
        throw new Error(response.data?.message || 'Failed to upload image');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        'Failed to upload image. Please try again.';
      error('Failed to Upload Image', msg);
      toast.error(msg);
      setCoverImage(null);
      setCoverImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAuthToken();

      const payload: Record<string, any> = {
        name: formData.name,
        description: formData.description || null,
        is_public: formData.is_public,
      };

      if (coverImageUrl) {
        payload.cover_image = coverImageUrl;
      }

      const response = await axios.post(
        `${CONFIG.API_URL}/api/playlists`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!response.data?.success) {
        const errorMsg =
          response.data?.message ||
          'An error occurred while adding the playlist.';
        error('Failed to Add Playlist', errorMsg);
        toast.error(errorMsg);
        return;
      }

      await fetchPlaylists(1, searchQuery.trim() ? searchQuery : undefined);
      setIsAddModalOpen(false);
      setFormData({ name: '', description: '', is_public: true });
      setCoverImage(null);
      setCoverImageUrl(null);
      setCoverImagePreview(null);
      success(
        'Playlist Added Successfully',
        `${formData.name} has been added to your playlist list.`
      );
      toast.success('Playlist berhasil ditambahkan!');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        'An error occurred while adding the playlist. Please try again.';
      error('Failed to Add Playlist', msg);
      toast.error(msg);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlaylist) return;

    try {
      const token = getAuthToken();

      const payload: Record<string, any> = {
        name: formData.name,
        description: formData.description || null,
        is_public: formData.is_public,
      };

      // Only send cover_image if a new image was uploaded
      if (coverImageUrl) {
        payload.cover_image = coverImageUrl;
      }

      const response = await axios.put(
        `${CONFIG.API_URL}/api/playlists/${selectedPlaylist.id}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!response.data?.success) {
        const errorMsg =
          response.data?.message ||
          'An error occurred while updating the playlist.';
        error('Failed to Update Playlist', errorMsg);
        toast.error(errorMsg);
        return;
      }

      await fetchPlaylists(page, searchQuery.trim() ? searchQuery : undefined);
      setIsEditModalOpen(false);
      setSelectedPlaylist(null);
      setFormData({ name: '', description: '', is_public: true });
      setCoverImage(null);
      setCoverImageUrl(null);
      setCoverImagePreview(null);
      setCurrentCoverImage(null);
      success(
        'Playlist Updated Successfully',
        `${formData.name} has been updated.`
      );
      toast.success('Playlist berhasil diperbarui!');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        'An error occurred while updating the playlist. Please try again.';
      error('Failed to Update Playlist', msg);
      toast.error(msg);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPlaylist) return;

    try {
      const token = getAuthToken();
      const playlistName = selectedPlaylist.name;

      const response = await axios.delete(
        `${CONFIG.API_URL}/api/playlists/${selectedPlaylist.id}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data?.success) {
        const errorMsg =
          response.data?.message ||
          'An error occurred while deleting the playlist.';
        error('Failed to Delete Playlist', errorMsg);
        toast.error(errorMsg);
        return;
      }

      await fetchPlaylists(page, searchQuery.trim() ? searchQuery : undefined);
      setIsDeleteModalOpen(false);
      setSelectedPlaylist(null);
      success(
        'Playlist Deleted Successfully',
        `${playlistName} has been removed.`
      );
      toast.success('Playlist berhasil dihapus!');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        'An error occurred while deleting the playlist. Please try again.';
      error('Failed to Delete Playlist', msg);
      toast.error(msg);
    }
  };

  const stats = [
    { title: 'Total Playlists', value: total.toLocaleString(), icon: '📝', change: '+12' },
    { title: 'Total Songs', value: '15,234', icon: '🎵', change: '+145' },
    { title: 'Total Followers', value: '45,678', icon: '❤️', change: '+1,234' },
    { title: 'Avg Duration', value: '3h 45m', icon: '⏱️', change: '+15m' },
  ];

  return (
    <>
      <Head>
        <title>Playlists - SoundCave</title>
        <meta name="description" content="Playlists SoundCave" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Playlists</h1>
              <p className="text-gray-600">Kelola dan jelajahi semua playlist</p>
            </div>
            <button
              onClick={handleAddClick}
              className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Create Playlist
            </button>
          </div>


          {/* Filters and View Toggle */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Input
                    type="text"
                    placeholder="Cari playlist..."
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
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="all">All Playlists</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Playlists Grid/List View */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Memuat data playlist...</p>
            </div>
          ) : playlists.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-12">
              <span className="text-6xl mb-4 block">🎵</span>
              <p className="text-gray-600">Tidak ada playlist ditemukan</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Playlist Cover */}
                  <div className="h-40 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center relative overflow-hidden">
                    {playlist.cover_image ? (
                      <img
                        src={playlist.cover_image}
                        alt={playlist.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-6xl">🎵</span>
                    )}
                  </div>

                  {/* Playlist Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {playlist.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {playlist.description}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ml-2 ${
                          playlist.is_public
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {playlist.is_public ? 'Public' : 'Private'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>{playlist.songs || 0} songs</span>
                      <span>{playlist.duration || '0h 0m'}</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          ❤️ {(playlist.followers || 0).toLocaleString()}
                        </span>
                        <span className="text-xs">{playlist.created_at}</span>
                      </div>
                      <button
                        onClick={() => router.push(`/playlists/${playlist.id}`)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Playlist
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Songs
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Followers
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
                      {playlists.map((playlist) => (
                        <tr key={playlist.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded flex items-center justify-center shrink-0 overflow-hidden">
                                {playlist.cover_image ? (
                                  <img
                                    src={playlist.cover_image}
                                    alt={playlist.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <span className="text-xl">🎵</span>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {playlist.name}
                                </p>
                                {playlist.description && (
                                  <p className="text-xs text-gray-500 line-clamp-1">
                                    {playlist.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-900">
                            {playlist.songs || 0}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-700">
                            {playlist.duration || '0h 0m'}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-900">
                            {(playlist.followers || 0).toLocaleString()}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                playlist.is_public
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {playlist.is_public ? 'Public' : 'Private'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => router.push(`/playlists/${playlist.id}`)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleEditClick(playlist)}
                                className="text-gray-600 hover:text-gray-700 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(playlist)}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {total > 0 && (
                <Pagination
                  total={total}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={(nextPage) => {
                    const query = searchQuery.trim() || undefined;
                    fetchPlaylists(nextPage, query);
                  }}
                />
              )}
            </>
          )}
        </div>
      </Layout>

      {/* Add Playlist Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>Add New Playlist</DialogTitle>
              <DialogDescription>
                Tambahkan playlist baru ke platform Anda
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="add-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Playlist Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="add-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. My Favorite Songs"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="add-description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="add-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter playlist description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors max-w-md">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                    id="cover-upload"
                    disabled={isUploadingImage}
                  />
                  <label htmlFor="cover-upload" className={`cursor-pointer ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {coverImagePreview ? (
                      <div className="space-y-2">
                        <img
                          src={coverImagePreview}
                          alt="Preview"
                          className="mx-auto h-32 w-32 object-cover rounded-lg"
                        />
                        <p className="text-sm text-gray-900 font-medium">{coverImage?.name}</p>
                        {isUploadingImage && (
                          <p className="text-xs text-blue-600">Uploading...</p>
                        )}
                        {coverImageUrl && !isUploadingImage && (
                          <p className="text-xs text-green-600">✓ Uploaded successfully</p>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="text-4xl mb-2">🖼️</div>
                        <p className="text-sm text-gray-600">Click to upload cover image</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Is Public */}
              <div className="flex items-center">
                <input
                  id="add-is-public"
                  name="is_public"
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="add-is-public"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                >
                  Make this playlist public
                </label>
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Add Playlist
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Playlist Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Playlist</DialogTitle>
              <DialogDescription>
                Update informasi playlist
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="edit-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Playlist Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. My Favorite Songs"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="edit-description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter playlist description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>
                {currentCoverImage && !coverImagePreview && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">Current cover image:</p>
                    <img
                      src={currentCoverImage}
                      alt="Current cover"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors max-w-md">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                    id="edit-cover-upload"
                    disabled={isUploadingImage}
                  />
                  <label htmlFor="edit-cover-upload" className={`cursor-pointer ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {coverImagePreview ? (
                      <div className="space-y-2">
                        <img
                          src={coverImagePreview}
                          alt="Preview"
                          className="mx-auto h-32 w-32 object-cover rounded-lg"
                        />
                        <p className="text-sm text-gray-900 font-medium">{coverImage?.name}</p>
                        {isUploadingImage && (
                          <p className="text-xs text-blue-600">Uploading...</p>
                        )}
                        {coverImageUrl && !isUploadingImage && (
                          <p className="text-xs text-green-600">✓ Uploaded successfully</p>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="text-4xl mb-2">🖼️</div>
                        <p className="text-sm text-gray-600">Click to replace cover image</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Is Public */}
              <div className="flex items-center">
                <input
                  id="edit-is-public"
                  name="is_public"
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="edit-is-public"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                >
                  Make this playlist public
                </label>
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Update Playlist
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Playlist</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus playlist ini?
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
                    This action cannot be undone. All songs in this playlist will be removed.
                  </p>
                </div>
              </div>
            </div>

            {selectedPlaylist && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Playlist:{" "}
                  <span className="font-medium text-gray-900">
                    {selectedPlaylist.name}
                  </span>
                </p>
                {selectedPlaylist.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    Description:{" "}
                    <span className="font-medium text-gray-900">
                      {selectedPlaylist.description}
                    </span>
                  </p>
                )}
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
              Delete Playlist
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

