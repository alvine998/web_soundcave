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

interface News {
  id: number;
  title: string;
  content: string;
  summary: string | null;
  author: string;
  category: string;
  image_url: string | null;
  published_at: string;
  is_published: boolean;
  views: number;
  tags: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export default function News() {
  const router = useRouter();
  const { success, error, warning } = useToast();
  const [news, setNews] = useState<News[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAuthor, setFilterAuthor] = useState("all");
  const [filterPublished, setFilterPublished] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    summary: "",
    author: "",
    category: "",
    image_url: "",
    published_at: "",
    is_published: false,
    tags: "",
  });

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

  // Categories
  const categories = [
    "Announcement",
    "Artist",
    "Feature",
    "Update",
    "Event",
    "News",
  ];

  // Fetch news from API
  const fetchNews = async (pageParam = 1, query?: string) => {
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
      if (filterCategory !== "all") {
        params.category = filterCategory;
      }
      if (filterAuthor !== "all") {
        params.author = filterAuthor;
      }
      if (filterPublished !== "all") {
        params.is_published = filterPublished === "true";
      }

      const response = await axios.get(`${CONFIG.API_URL}/api/news`, {
        params,
        ...getAuthHeaders(),
      });

      if (response.data?.success && response.data?.data) {
        const newsList = response.data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          summary: item.summary || null,
          author: item.author,
          category: item.category,
          image_url: item.image_url || null,
          published_at: item.published_at,
          is_published: item.is_published || false,
          views: item.views || 0,
          tags: item.tags || null,
          created_at: item.created_at,
          updated_at: item.updated_at,
          deleted_at: item.deleted_at || null,
        }));
        setNews(newsList);

        if (response.data?.pagination) {
          setPage(response.data.pagination.page);
          setTotal(response.data.pagination.total);
          setTotalPages(response.data.pagination.pages);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch news:", err);
      const msg =
        err?.response?.data?.message ||
        "Failed to fetch news. Please try again.";
      error("Failed to Fetch News", msg);
      toast.error(msg);
      setNews([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNews(1, searchQuery);
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Fetch on filter/sort change
  useEffect(() => {
    fetchNews(1, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory, filterAuthor, filterPublished, sortBy, order]);

  // Fetch on page change
  useEffect(() => {
    fetchNews(page, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Initial fetch
  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddClick = () => {
    setFormData({
      title: "",
      content: "",
      summary: "",
      author: "",
      category: "",
      image_url: "",
      published_at: "",
      is_published: false,
      tags: "",
    });
    setIsAddModalOpen(true);
  };

  const handleEditClick = (newsItem: News) => {
    setSelectedNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      summary: newsItem.summary || "",
      author: newsItem.author,
      category: newsItem.category,
      image_url: newsItem.image_url || "",
      published_at: newsItem.published_at
        ? newsItem.published_at.split("T")[0] +
          " " +
          newsItem.published_at.split("T")[1].split(".")[0].substring(0, 5)
        : "",
      is_published: newsItem.is_published,
      tags: newsItem.tags || "",
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (newsItem: News) => {
    setSelectedNews(newsItem);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAuthToken();

      const payload: Record<string, any> = {
        title: formData.title,
        content: formData.content,
        author: formData.author,
        category: formData.category,
        is_published: formData.is_published,
      };

      if (formData.summary) {
        payload.summary = formData.summary;
      }
      if (formData.image_url) {
        payload.image_url = formData.image_url;
      }
      if (formData.published_at) {
        payload.published_at = formData.published_at;
      }
      if (formData.tags) {
        payload.tags = formData.tags;
      }

      const response = await axios.post(
        `${CONFIG.API_URL}/api/news`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (response.data?.success) {
        setIsAddModalOpen(false);
        setFormData({
          title: "",
          content: "",
          summary: "",
          author: "",
          category: "",
          image_url: "",
          published_at: "",
          is_published: false,
          tags: "",
        });
        success("News Added", `${formData.title} has been added successfully.`);
        toast.success("News berhasil ditambahkan!");
        fetchNews(page, searchQuery);
      } else {
        throw new Error(response.data?.message || "Failed to add news");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Failed to add news. Please try again.";
      error("Failed to Add News", msg);
      toast.error(msg);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNews) return;

    try {
      const token = getAuthToken();

      const payload: Record<string, any> = {
        title: formData.title,
        content: formData.content,
        author: formData.author,
        category: formData.category,
        is_published: formData.is_published,
      };

      if (formData.summary) {
        payload.summary = formData.summary;
      }
      if (formData.image_url) {
        payload.image_url = formData.image_url;
      }
      if (formData.published_at) {
        payload.published_at = formData.published_at;
      }
      if (formData.tags) {
        payload.tags = formData.tags;
      }

      const response = await axios.put(
        `${CONFIG.API_URL}/api/news/${selectedNews.id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (response.data?.success) {
        setIsEditModalOpen(false);
        setSelectedNews(null);
        setFormData({
          title: "",
          content: "",
          summary: "",
          author: "",
          category: "",
          image_url: "",
          published_at: "",
          is_published: false,
          tags: "",
        });
        success("News Updated", `${formData.title} has been updated.`);
        toast.success("News berhasil diperbarui!");
        fetchNews(page, searchQuery);
      } else {
        throw new Error(response.data?.message || "Failed to update news");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Failed to update news. Please try again.";
      error("Failed to Update News", msg);
      toast.error(msg);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedNews) return;

    const newsTitle = selectedNews.title;

    try {
      const token = getAuthToken();

      const response = await axios.delete(
        `${CONFIG.API_URL}/api/news/${selectedNews.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (response.data?.success) {
        setIsDeleteModalOpen(false);
        setSelectedNews(null);
        warning("News Deleted", `${newsTitle} has been removed.`);
        toast.success("News berhasil dihapus!");
        fetchNews(page, searchQuery);
      } else {
        throw new Error(response.data?.message || "Failed to delete news");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Failed to delete news. Please try again.";
      error("Failed to Delete News", msg);
      toast.error(msg);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Get unique authors for filter
  const uniqueAuthors = [
    "all",
    ...new Set(news.map((item) => item.author)),
  ].filter((author) => author !== "all" || true);

  return (
    <>
      <Head>
        <title>News - SoundCave</title>
        <meta name="description" content="Manage news and announcements" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">News Management</h1>
            <p className="text-gray-600">Kelola berita dan pengumuman platform</p>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col gap-4">
              {/* Top Row - Search and Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Input
                    type="text"
                    placeholder="Cari berita..."
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

                <button
                  onClick={handleAddClick}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  + Add News
                </button>
              </div>

              {/* Bottom Row - Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 min-w-[140px]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={filterAuthor}
                  onChange={(e) => setFilterAuthor(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 min-w-[140px]"
                >
                  <option value="all">All Authors</option>
                  {uniqueAuthors
                    .filter((author) => author !== "all")
                    .map((author) => (
                      <option key={author} value={author}>
                        {author}
                      </option>
                    ))}
                </select>

                <select
                  value={filterPublished}
                  onChange={(e) => setFilterPublished(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 min-w-[140px]"
                >
                  <option value="all">All Status</option>
                  <option value="true">Published</option>
                  <option value="false">Draft</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 min-w-[140px]"
                >
                  <option value="created_at">Terbaru</option>
                  <option value="title">Judul (A-Z)</option>
                  <option value="published_at">Published Date</option>
                  <option value="views">Most Views</option>
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

          {/* News List */}
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <span className="text-6xl mb-4 block">📰</span>
              <p className="text-gray-600">No news found</p>
            </div>
          ) : (
            <>
              <div className="space-y-6 mb-6">
                {news.map((newsItem) => (
                  <div
                    key={newsItem.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="md:w-64 h-48 md:h-auto bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center overflow-hidden shrink-0">
                        {newsItem.image_url ? (
                          <img
                            src={newsItem.image_url}
                            alt={newsItem.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-6xl">📰</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                {newsItem.category}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded ${
                                  newsItem.is_published
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {newsItem.is_published ? "Published" : "Draft"}
                              </span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {newsItem.title}
                            </h3>
                            {newsItem.summary && (
                              <p className="text-sm text-gray-600 mb-3">
                                {newsItem.summary}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-4">
                            <span>✍️ {newsItem.author}</span>
                            <span>
                              📅{" "}
                              {new Date(newsItem.published_at).toLocaleDateString()}
                            </span>
                            <span>👁️ {newsItem.views.toLocaleString()} views</span>
                          </div>
                        </div>

                        {newsItem.tags && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {newsItem.tags.split(",").map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => router.push(`/news/${newsItem.id}`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditClick(newsItem)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(newsItem)}
                            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                          >
                            Delete
                          </button>
                        </div>
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
                    fetchNews(nextPage, query);
                  }}
                />
              )}
            </>
          )}

          {/* Add Modal */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleAddSubmit}>
                <DialogHeader>
                  <DialogTitle>Add News</DialogTitle>
                  <DialogDescription>
                    Tambahkan berita atau pengumuman baru
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                  <div className="md:col-span-2">
                    <label
                      htmlFor="add-title"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="add-title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter news title"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="add-author"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Author <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="add-author"
                      name="author"
                      required
                      value={formData.author}
                      onChange={handleChange}
                      placeholder="Enter author name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="add-category"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="add-category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="add-image-url"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Image URL
                    </label>
                    <Input
                      id="add-image-url"
                      name="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="add-published-at"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Published At
                    </label>
                    <Input
                      id="add-published-at"
                      name="published_at"
                      type="datetime-local"
                      value={formData.published_at}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="add-is-published"
                      name="is_published"
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="add-is-published"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Published
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="add-summary"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Summary
                    </label>
                    <Input
                      id="add-summary"
                      name="summary"
                      value={formData.summary}
                      onChange={handleChange}
                      placeholder="Enter news summary"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="add-content"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="add-content"
                      name="content"
                      required
                      rows={8}
                      value={formData.content}
                      onChange={handleChange}
                      placeholder="Enter news content..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="add-tags"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Tags
                    </label>
                    <Input
                      id="add-tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="e.g. feature, announcement, update"
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
                    Add News
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleEditSubmit}>
                <DialogHeader>
                  <DialogTitle>Edit News</DialogTitle>
                  <DialogDescription>
                    Perbarui informasi berita
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                  <div className="md:col-span-2">
                    <label
                      htmlFor="edit-title"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="edit-title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter news title"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-author"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Author <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="edit-author"
                      name="author"
                      required
                      value={formData.author}
                      onChange={handleChange}
                      placeholder="Enter author name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-category"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="edit-category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="edit-image-url"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Image URL
                    </label>
                    <Input
                      id="edit-image-url"
                      name="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-published-at"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Published At
                    </label>
                    <Input
                      id="edit-published-at"
                      name="published_at"
                      type="datetime-local"
                      value={formData.published_at}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="edit-is-published"
                      name="is_published"
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="edit-is-published"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Published
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="edit-summary"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Summary
                    </label>
                    <Input
                      id="edit-summary"
                      name="summary"
                      value={formData.summary}
                      onChange={handleChange}
                      placeholder="Enter news summary"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="edit-content"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="edit-content"
                      name="content"
                      required
                      rows={8}
                      value={formData.content}
                      onChange={handleChange}
                      placeholder="Enter news content..."
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
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="e.g. feature, announcement, update"
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
                    Update News
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Modal */}
          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete News</DialogTitle>
                <DialogDescription>
                  Apakah Anda yakin ingin menghapus berita ini?
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
                    This action cannot be undone. This news will be permanently
                    deleted.
                  </p>
                </div>
              </div>

              {selectedNews && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    News:{" "}
                    <span className="font-medium text-gray-900">
                      {selectedNews.title}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Author:{" "}
                    <span className="font-medium text-gray-900">
                      {selectedNews.author}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Views:{" "}
                    <span className="font-medium text-gray-900">
                      {selectedNews.views}
                    </span>
                  </p>
                </div>
              )}

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
                  Delete News
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
    </>
  );
}
