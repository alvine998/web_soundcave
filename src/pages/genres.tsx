import { useEffect, useState } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
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
import { Pagination } from "@/components/Pagination";

interface Genre {
  id: number;
  name: string;
  description: string;
  songCount: number;
  createdAt: string;
  color?: string;
}

export default function Genres() {
  const { success, error, warning } = useToast();
  const [genres, setGenres] = useState<Genre[]>([]);

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

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchGenres = async (pageParam = 1, query?: string) => {
    try {
      setIsLoading(true);

      const url = `${CONFIG.API_URL}/api/genres?search=${query || ""}`;

      const params: Record<string, string | number> = {
        page: pageParam,
        limit: pageSize,
      };
      if (query && query.trim()) {
        params.q = query.trim();
      }

      const response = await axios.get(url, {
        params,
        ...getAuthHeaders(),
      });

      if (!response.data?.success) {
        error(
          "Failed to Load Genres",
          response.data?.message || "Unable to fetch genres from server."
        );
        return;
      }

      const items = response.data.data as Array<{
        id: number;
        name: string;
        description: string;
        color?: string | null;
        created_at?: string;
        songCount?: number;
      }>;

      const mapped: Genre[] = items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        color: item.color || undefined,
        // backend tidak mengirim songCount, default 0 agar UI tetap jalan
        songCount: typeof item.songCount === "number" ? item.songCount : 0,
        createdAt: item.created_at
          ? item.created_at.split("T")[0]
          : new Date().toISOString().split("T")[0],
      }));

      setGenres(mapped);

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
        "Terjadi kesalahan saat mengambil data genre.";
      error("Failed to Load Genres", msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // initial load
    fetchGenres(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // debounce search agar tidak terlalu banyak request
    const timeout = setTimeout(() => {
      const query = searchQuery.trim() || undefined;
      // setiap ganti search, selalu mulai dari page 1
      fetchGenres(1, query);
    }, 500);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleAddClick = () => {
    setFormData({ name: "", description: "" });
    setIsAddModalOpen(true);
  };

  const handleEditClick = (genre: Genre) => {
    setSelectedGenre(genre);
    setFormData({
      name: genre.name,
      description: genre.description,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (genre: Genre) => {
    setSelectedGenre(genre);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        // optional color, bisa dikembangkan nanti dari UI
        color: undefined as string | undefined,
      };

      const response = await axios.post(
        `${CONFIG.API_URL}/api/genres`,
        payload,
        getAuthHeaders()
      );

      if (!response.data?.success) {
        error(
          "Failed to Add Genre",
          response.data?.message || "An error occurred while adding the genre."
        );
        return;
      }

      await fetchGenres(1, searchQuery.trim() ? searchQuery : undefined);
      setIsAddModalOpen(false);
      setFormData({ name: "", description: "" });
      success(
        "Genre Added Successfully",
        `${payload.name} has been added to your genre list.`
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        "An error occurred while adding the genre. Please try again.";
      error("Failed to Add Genre", msg);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGenre) return;

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        color: selectedGenre.color,
      };

      const response = await axios.put(
        `${CONFIG.API_URL}/api/genres/${selectedGenre.id}`,
        payload,
        getAuthHeaders()
      );

      if (!response.data?.success) {
        error(
          "Failed to Update Genre",
          response.data?.message ||
            "An error occurred while updating the genre."
        );
        return;
      }

      await fetchGenres(page, searchQuery.trim() ? searchQuery : undefined);
      setIsEditModalOpen(false);
      setSelectedGenre(null);
      setFormData({ name: "", description: "" });
      success(
        "Genre Updated Successfully",
        `${payload.name} has been updated.`
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        "An error occurred while updating the genre. Please try again.";
      error("Failed to Update Genre", msg);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedGenre) return;

    try {
      const genreName = selectedGenre.name;

      const response = await axios.delete(
        `${CONFIG.API_URL}/api/genres/${selectedGenre.id}`,
        getAuthHeaders()
      );

      if (!response.data?.success) {
        error(
          "Failed to Delete Genre",
          response.data?.message ||
            "An error occurred while deleting the genre."
        );
        return;
      }

      await fetchGenres(page, searchQuery.trim() ? searchQuery : undefined);
      setIsDeleteModalOpen(false);
      setSelectedGenre(null);
      warning(
        "Genre Deleted",
        `${genreName} has been removed from your genre list.`
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        "An error occurred while deleting the genre. Please try again.";
      error("Failed to Delete Genre", msg);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Data sudah difilter & dipaginasi di server berdasarkan searchQuery + page
  const filteredGenres = genres;
  const currentPage = Math.min(page, totalPages || 1);

  return (
    <>
      <Head>
        <title>Genres - SoundCave</title>
        <meta name="description" content="Manage music genres" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Genre Management
            </h1>
            <p className="text-gray-600">
              Kelola semua genre musik di platform Anda
            </p>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Cari genre..."
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

              {/* Add Button */}
              <button
                onClick={handleAddClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                + Add Genre
              </button>
            </div>
          </div>

          {/* Genres Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Genre Name
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Songs
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredGenres.map((genre) => (
                    <tr
                      key={genre.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded">
                          {genre.name}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {genre.description}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                        {genre.songCount.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {genre.createdAt}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleEditClick(genre)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(genre)}
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

            {/* Empty State */}
            {filteredGenres.length === 0 && (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🎵</span>
                <p className="text-gray-600">No genres found</p>
              </div>
            )}

            {/* Pagination */}
            {total > 0 && (
              <Pagination
                total={total}
                page={currentPage}
                pageSize={pageSize}
                onPageChange={(nextPage) => {
                  const query = searchQuery.trim() || undefined;
                  fetchGenres(nextPage, query);
                }}
              />
            )}
          </div>
        </div>
      </Layout>

      {/* Add Genre Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>Add New Genre</DialogTitle>
              <DialogDescription>
                Tambahkan genre musik baru ke platform Anda
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
              <div>
                <label
                  htmlFor="add-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Genre Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="add-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Pop, Rock, Jazz"
                />
              </div>

              <div>
                <label
                  htmlFor="add-description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="add-description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter genre description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Add Genre
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Genre Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Genre</DialogTitle>
              <DialogDescription>
                Update informasi genre musik
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
              <div>
                <label
                  htmlFor="edit-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Genre Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Pop, Rock, Jazz"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter genre description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Update Genre
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Genre</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus genre ini?
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
                    This action cannot be undone. All songs associated with this
                    genre will be affected.
                  </p>
                </div>
              </div>
            </div>

            {selectedGenre && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Genre:{" "}
                  <span className="font-medium text-gray-900">
                    {selectedGenre.name}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Songs:{" "}
                  <span className="font-medium text-gray-900">
                    {selectedGenre.songCount}
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
              Delete Genre
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
