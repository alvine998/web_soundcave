import { useState, useEffect } from "react";
import Head from "next/head";
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

interface Album {
  id: number;
  title: string;
  artist_id: number;
  artist: string;
  release_date: string;
  album_type: string;
  genre: string;
  total_tracks: number;
  record_label: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export default function Albums() {
  const { success, error, warning } = useToast();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterArtist, setFilterArtist] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    artist_id: "",
    genre: "",
    album_type: "",
    release_date: "",
    total_tracks: "",
    record_label: "",
  });
  const [artists, setArtists] = useState<Array<{ id: number; name: string }>>(
    []
  );
  const [genres, setGenres] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

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

  // Album types
  const albumTypes = [
    "single",
    "EP",
    "album",
    "compilation",
    "live_album",
    "remix_album",
  ];

  // Fetch albums from API
  const fetchAlbums = async (pageParam = 1, query?: string) => {
    try {
      setIsLoading(true);
      const url = `${CONFIG.API_URL}/api/albums?search=${query || ""}`;

      const params: Record<string, string | number> = {
        page: pageParam,
        limit: pageSize,
      };

      if (filterArtist !== "all") {
        params.artist_id = filterArtist;
      }

      const response = await axios.get(url, {
        params,
        ...getAuthHeaders(),
      });

      if (!response.data?.success) {
        const errorMsg =
          response.data?.message || "Unable to fetch albums from server.";
        error("Failed to Load Albums", errorMsg);
        return;
      }

      const items = response.data.data as Array<{
        id: number;
        title: string;
        artist_id: number;
        artist: string;
        release_date: string;
        album_type: string;
        genre: string;
        total_tracks: number;
        record_label: string | null;
        image?: string | null;
        created_at?: string;
        updated_at?: string;
        deleted_at?: string | null;
      }>;

      const mapped: Album[] = items.map((item) => ({
        id: item.id,
        title: item.title,
        artist_id: item.artist_id,
        artist: item.artist,
        release_date: item.release_date
          ? item.release_date.split("T")[0]
          : new Date().toISOString().split("T")[0],
        album_type: item.album_type,
        genre: item.genre,
        total_tracks: item.total_tracks,
        record_label: item.record_label,
        image: item.image || null,
        created_at: item.created_at
          ? item.created_at.split("T")[0]
          : new Date().toISOString().split("T")[0],
        updated_at: item.updated_at
          ? item.updated_at.split("T")[0]
          : new Date().toISOString().split("T")[0],
        deleted_at: item.deleted_at || null,
      }));

      setAlbums(mapped);

      // ambil info pagination dari backend
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
        "Terjadi kesalahan saat mengambil data album.";
      error("Failed to Load Albums", msg);
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

  useEffect(() => {
    fetchAlbums(1);
    fetchArtists();
    fetchGenres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // debounce search agar tidak terlalu banyak request
    const timeout = setTimeout(() => {
      const query = searchQuery.trim() || undefined;
      fetchAlbums(1, query);
    }, 500);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterArtist]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      formData.append("file", file);
      formData.append("folder", "albums/covers");

      const response = await axios.post(
        `${CONFIG.API_URL}/api/images/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (response.data?.success && response.data?.data?.file_url) {
        const imageUrl = response.data.data.file_url;
        setCoverImageUrl(imageUrl);
        toast.success(response.data?.message || "Image uploaded successfully");
      } else {
        throw new Error(response.data?.message || "Failed to upload image");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        "Failed to upload image. Please try again.";
      error("Failed to Upload Image", msg);
      toast.error(msg);
      setCoverImage(null);
      setCoverImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddClick = () => {
    setFormData({
      title: "",
      artist: "",
      artist_id: "",
      genre: "",
      album_type: "",
      release_date: "",
      total_tracks: "",
      record_label: "",
    });
    setCoverImage(null);
    setCoverImagePreview(null);
    setCoverImageUrl(null);
    setIsAddModalOpen(true);
  };

  const handleEditClick = (album: Album) => {
    setSelectedAlbum(album);
    setFormData({
      title: album.title,
      artist: album.artist,
      artist_id: album.artist_id.toString(),
      genre: album.genre,
      album_type: album.album_type,
      release_date: album.release_date,
      total_tracks: album.total_tracks.toString(),
      record_label: album.record_label || "",
    });
    setCoverImage(null);
    setCoverImagePreview(album.image);
    setCoverImageUrl(album.image);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (album: Album) => {
    setSelectedAlbum(album);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingImage) return;

    try {
      setIsSubmitting(true);
      const token = getAuthToken();

      const payload: Record<string, any> = {
        title: formData.title,
        artist:
          artists.find((artist) => artist.id === parseInt(formData.artist_id))
            ?.name || "",
        artist_id: parseInt(formData.artist_id),
        genre: formData.genre,
        album_type: formData.album_type,
        release_date: formData.release_date,
        total_tracks: parseInt(formData.total_tracks),
      };

      if (formData.record_label) {
        payload.record_label = formData.record_label;
      }

      if (coverImageUrl) {
        payload.cover_image_url = coverImageUrl;
      }

      const response = await axios.post(
        `${CONFIG.API_URL}/api/albums`,
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
          response.data?.message || "An error occurred while adding the album.";
        error("Failed to Add Album", errorMsg);
        toast.error(errorMsg);
        return;
      }

      await fetchAlbums(1, searchQuery.trim() ? searchQuery : undefined);
      setIsAddModalOpen(false);
      setFormData({
        title: "",
        artist: "",
        artist_id: "",
        genre: "",
        album_type: "",
        release_date: "",
        total_tracks: "",
        record_label: "",
      });
      success("Album Added Successfully", `${formData.title} has been added.`);
      toast.success("Album berhasil ditambahkan!");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        "An error occurred while adding the album. Please try again.";
      error("Failed to Add Album", msg);
      toast.error(msg);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbum || isUploadingImage) return;

    try {
      setIsSubmitting(true);
      const token = getAuthToken();

      const payload: Record<string, any> = {
        title: formData.title,
        artist:
          artists.find((artist) => artist.id === parseInt(formData.artist_id))
            ?.name || "",
        artist_id: parseInt(formData.artist_id),
        genre: formData.genre,
        album_type: formData.album_type,
        release_date: formData.release_date,
        total_tracks: parseInt(formData.total_tracks),
      };

      if (formData.record_label) {
        payload.record_label = formData.record_label;
      }

      if (coverImageUrl) {
        payload.image = coverImageUrl;
      }

      const response = await axios.put(
        `${CONFIG.API_URL}/api/albums/${selectedAlbum.id}`,
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
          "An error occurred while updating the album.";
        error("Failed to Update Album", errorMsg);
        toast.error(errorMsg);
        return;
      }

      await fetchAlbums(page, searchQuery.trim() ? searchQuery : undefined);
      setIsEditModalOpen(false);
      setSelectedAlbum(null);
      setFormData({
        title: "",
        artist: "",
        artist_id: "",
        genre: "",
        album_type: "",
        release_date: "",
        total_tracks: "",
        record_label: "",
      });
      success(
        "Album Updated Successfully",
        `${formData.title} has been updated.`
      );
      toast.success("Album berhasil diperbarui!");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        "An error occurred while updating the album. Please try again.";
      error("Failed to Update Album", msg);
      toast.error(msg);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAlbum) return;

    try {
      const token = getAuthToken();
      const albumTitle = selectedAlbum.title;

      const response = await axios.delete(
        `${CONFIG.API_URL}/api/albums/${selectedAlbum.id}`,
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
          "An error occurred while deleting the album.";
        error("Failed to Delete Album", errorMsg);
        toast.error(errorMsg);
        return;
      }

      await fetchAlbums(page, searchQuery.trim() ? searchQuery : undefined);
      setIsDeleteModalOpen(false);
      setSelectedAlbum(null);
      warning("Album Deleted", `${albumTitle} has been removed.`);
      toast.success("Album berhasil dihapus!");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        "An error occurred while deleting the album. Please try again.";
      error("Failed to Delete Album", msg);
      toast.error(msg);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Get unique artists for filter
  const uniqueArtists = [
    "all",
    ...new Set(albums.map((album) => album.artist)),
  ];

  return (
    <>
      <Head>
        <title>Albums - SoundCave</title>
        <meta name="description" content="Manage music albums" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Album Management
            </h1>
            <p className="text-gray-600">
              Kelola semua album dari berbagai artist
            </p>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Input
                    type="text"
                    placeholder="Cari album atau artist..."
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
                  value={filterArtist}
                  onChange={(e) => setFilterArtist(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="all">All Artists</option>
                  {uniqueArtists.slice(1).map((artist) => (
                    <option key={artist} value={artist}>
                      {artist}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                + Add Album
              </button>
            </div>
          </div>

          {/* Albums Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Memuat data album...</p>
              </div>
            ) : albums.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">💿</span>
                <p className="text-gray-600">Tidak ada album ditemukan</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Album
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Artist
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Genre
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Release Date
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Tracks
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Record Label
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {albums.map((album) => (
                        <tr
                          key={album.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center shrink-0 overflow-hidden">
                                {album.image ? (
                                  <img
                                    src={album.image}
                                    alt={album.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xl">💿</span>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {album.title}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-900">
                            {album.artist}
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              {album.genre}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                              {album.album_type}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-900">
                            {album.release_date}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                            {album.total_tracks}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {album.record_label || "-"}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleEditClick(album)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(album)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
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

                {/* Pagination */}
                {total > 0 && (
                  <Pagination
                    total={total}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={(nextPage) => {
                      const query = searchQuery.trim() || undefined;
                      fetchAlbums(nextPage, query);
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </Layout>

      {/* Add Album Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>Add New Album</DialogTitle>
              <DialogDescription>
                Tambahkan album baru ke platform Anda
              </DialogDescription>
            </DialogHeader>

            <div className="my-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="add-image-upload"
                  disabled={isUploadingImage}
                />
                <label
                  htmlFor="add-image-upload"
                  className={`cursor-pointer ${isUploadingImage ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  {coverImagePreview ? (
                    <div className="space-y-2">
                      <img
                        src={coverImagePreview}
                        alt="Preview"
                        className="mx-auto h-32 w-32 object-cover rounded-lg"
                      />
                      <p className="text-sm text-gray-900 font-medium">
                        {coverImage?.name || "Existing Cover"}
                      </p>
                      {isUploadingImage && (
                        <p className="text-xs text-blue-600">Uploading...</p>
                      )}
                      {coverImageUrl && !isUploadingImage && (
                        <p className="text-xs text-green-600">
                          ✓ Uploaded successfully
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl mb-2">🖼️</div>
                      <p className="text-sm text-gray-600">
                        Click to upload cover image
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG up to 5MB
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div>
                <label
                  htmlFor="add-title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Album Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="add-title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Beach Season"
                />
              </div>

              <div>
                <label
                  htmlFor="add-artist"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Artist <span className="text-red-500">*</span>
                </label>
                <select
                  id="add-artist"
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
                  htmlFor="add-genre"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Genre <span className="text-red-500">*</span>
                </label>
                <select
                  id="add-genre"
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
                  htmlFor="add-type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Album Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="add-type"
                  name="album_type"
                  required
                  value={formData.album_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="">Select type</option>
                  {albumTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() +
                        type.slice(1).replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="add-release-date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Release Date <span className="text-red-500">*</span>
                </label>
                <Input
                  id="add-release-date"
                  name="release_date"
                  type="date"
                  required
                  value={formData.release_date}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="add-tracks"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Total Tracks <span className="text-red-500">*</span>
                </label>
                <Input
                  id="add-tracks"
                  name="total_tracks"
                  type="number"
                  required
                  value={formData.total_tracks}
                  onChange={handleChange}
                  placeholder="e.g. 12"
                  min="1"
                />
              </div>

              <div>
                <label
                  htmlFor="add-record-label"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Record Label
                </label>
                <Input
                  id="add-record-label"
                  name="record_label"
                  type="text"
                  value={formData.record_label}
                  onChange={handleChange}
                  placeholder="e.g. Universal Music"
                />
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
                disabled={isSubmitting || isUploadingImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {(isSubmitting || isUploadingImage) && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSubmitting ? "Adding..." : isUploadingImage ? "Uploading Image..." : "Add Album"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Album Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Album</DialogTitle>
              <DialogDescription>Update informasi album</DialogDescription>
            </DialogHeader>

            <div className="my-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="edit-image-upload"
                  disabled={isUploadingImage}
                />
                <label
                  htmlFor="edit-image-upload"
                  className={`cursor-pointer ${isUploadingImage ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  {coverImagePreview ? (
                    <div className="space-y-2">
                      <img
                        src={coverImagePreview}
                        alt="Preview"
                        className="mx-auto h-32 w-32 object-cover rounded-lg"
                      />
                      <p className="text-sm text-gray-900 font-medium">
                        {coverImage?.name || "Existing Cover"}
                      </p>
                      {isUploadingImage && (
                        <p className="text-xs text-blue-600">Uploading...</p>
                      )}
                      {coverImageUrl && !isUploadingImage && (
                        <p className="text-xs text-green-600">
                          ✓ Uploaded successfully
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl mb-2">🖼️</div>
                      <p className="text-sm text-gray-600">
                        Click to upload cover image
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG up to 5MB
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div>
                <label
                  htmlFor="edit-title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Album Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Beach Season"
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
                  htmlFor="edit-type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Album Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="edit-type"
                  name="album_type"
                  required
                  value={formData.album_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="">Select type</option>
                  {albumTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() +
                        type.slice(1).replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-release-date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Release Date <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-release-date"
                  name="release_date"
                  type="date"
                  required
                  value={formData.release_date}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="edit-tracks"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Total Tracks <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-tracks"
                  name="total_tracks"
                  type="number"
                  required
                  value={formData.total_tracks}
                  onChange={handleChange}
                  placeholder="e.g. 12"
                  min="1"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-record-label"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Record Label
                </label>
                <Input
                  id="edit-record-label"
                  name="record_label"
                  type="text"
                  value={formData.record_label}
                  onChange={handleChange}
                  placeholder="e.g. Universal Music"
                />
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
                disabled={isSubmitting || isUploadingImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {(isSubmitting || isUploadingImage) && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSubmitting ? "Updating..." : isUploadingImage ? "Uploading Image..." : "Update Album"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Album</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus album ini?
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
                    This action cannot be undone. All tracks in this album will
                    be affected.
                  </p>
                </div>
              </div>
            </div>

            {selectedAlbum && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Album:{" "}
                  <span className="font-medium text-gray-900">
                    {selectedAlbum.title}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Artist:{" "}
                  <span className="font-medium text-gray-900">
                    {selectedAlbum.artist}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Tracks:{" "}
                  <span className="font-medium text-gray-900">
                    {selectedAlbum.total_tracks}
                  </span>
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
              Delete Album
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
