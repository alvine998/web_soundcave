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

interface Cavelist {
  id: number;
  title: string;
  description: string | null;
  is_promotion: boolean | null;
  expiry_promotion: string | null;
  viewers: number;
  likes: number;
  shares: number;
  video_url: string;
  artist_id: number;
  artist_name: string;
  status: "draft" | "publish" | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export default function Cavelists() {
  const router = useRouter();
  const { success, error, warning } = useToast();

  const [cavelists, setCavelists] = useState<Cavelist[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCavelist, setSelectedCavelist] = useState<Cavelist | null>(null);

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

  // Fetch cavelists from API
  const fetchCavelists = async (pageParam = 1, query?: string) => {
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

      const response = await axios.get(
        `${CONFIG.API_URL}/api/cavelists`,
        {
          params,
          ...getAuthHeaders(),
        }
      );

      if (response.data?.success && response.data?.data) {
        const cavelistsList = response.data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description || null,
          is_promotion: item.is_promotion || false,
          expiry_promotion: item.expiry_promotion || null,
          viewers: item.viewers || 0,
          likes: item.likes || 0,
          shares: item.shares || 0,
          video_url: item.video_url,
          artist_id: item.artist_id,
          artist_name: item.artist_name || "",
          status: item.status || "draft",
          published_at: item.published_at || null,
          created_at: item.created_at,
          updated_at: item.updated_at,
          deleted_at: item.deleted_at || null,
        }));
        setCavelists(cavelistsList);

        if (response.data?.pagination) {
          setPage(response.data.pagination.page);
          setTotal(response.data.pagination.total);
          setTotalPages(response.data.pagination.pages);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch cavelists:", err);
      const msg =
        err?.response?.data?.message ||
        "Failed to fetch cavelists. Please try again.";
      error("Failed to Fetch Cavelists", msg);
      toast.error(msg);
      setCavelists([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCavelists(1, searchQuery);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Fetch on filter/sort change
  useEffect(() => {
    setPage(1);
    fetchCavelists(1, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, order]);

  // Fetch on page change
  useEffect(() => {
    fetchCavelists(page, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Initial fetch
  useEffect(() => {
    fetchCavelists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddClick = () => {
    router.push("/cavelists/create");
  };

  const handleEditClick = (cavelist: Cavelist) => {
    router.push(`/cavelists/edit/${cavelist.id}`);
  };

  const handleDeleteClick = (cavelist: Cavelist) => {
    setSelectedCavelist(cavelist);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCavelist) return;

    const cavelistTitle = selectedCavelist.title;

    try {
      const token = getAuthToken();

      const response = await axios.delete(
        `${CONFIG.API_URL}/api/cavelists/${selectedCavelist.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (response.data?.success) {
        setIsDeleteModalOpen(false);
        setSelectedCavelist(null);
        warning("Cavelist Deleted", `${cavelistTitle} has been removed.`);
        toast.success("Cavelist berhasil dihapus!");
        fetchCavelists(page, searchQuery);
      } else {
        throw new Error(response.data?.message || "Failed to delete cavelist");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Failed to delete cavelist. Please try again.";
      error("Failed to Delete", msg);
      toast.error(msg);
    }
  };

  return (
    <>
      <Head>
        <title>Cavelist - SoundCave</title>
        <meta name="description" content="Manage cavelists" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cavelist</h1>
            <p className="text-gray-600">Kelola semua cavelist (video vertikal) di platform Anda</p>
          </div>

          {/* Search and Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col gap-4">
              {/* Top Row - Search and Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Input
                    type="text"
                    placeholder="Cari cavelist..."
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
                  + Add Cavelist
                </button>
              </div>

              {/* Bottom Row - Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 min-w-[140px]"
                >
                  <option value="created_at">Terbaru</option>
                  <option value="title">Judul (A-Z)</option>
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

          {/* Cavelists Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse"
                >
                  <div className="h-96 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : cavelists.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <span className="text-6xl mb-4 block">📱</span>
              <p className="text-gray-600">No cavelists found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {cavelists.map((cavelist) => (
                  <div
                    key={cavelist.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Video Preview - Vertical Format */}
                    <div className="h-96 bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center overflow-hidden relative">
                      {cavelist.video_url ? (
                        <video
                          src={cavelist.video_url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <span className="text-6xl">📱</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {cavelist.title}
                        </h3>
                        {cavelist.is_promotion && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                            Promo
                          </span>
                        )}
                      </div>
                      {cavelist.artist_name && (
                        <p className="text-sm text-gray-600 mb-1">
                          {cavelist.artist_name}
                        </p>
                      )}
                      {cavelist.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {cavelist.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                        <span>👁️ {cavelist.viewers}</span>
                        <span>❤️ {cavelist.likes}</span>
                        <span>📤 {cavelist.shares}</span>
                        <span className={`px-2 py-1 rounded ${
                          cavelist.status === "publish" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {cavelist.status === "publish" ? "Published" : "Draft"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditClick(cavelist)}
                          className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cavelist)}
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
                    fetchCavelists(nextPage, query);
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
            <DialogTitle>Delete Cavelist</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this cavelist?
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

            {selectedCavelist && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Cavelist: <span className="font-medium text-gray-900">{selectedCavelist.title}</span>
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
              Delete Cavelist
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
