import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";

interface NewsData {
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

export default function NewsDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Fetch news data
  const fetchNewsData = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const response = await axios.get(
        `${CONFIG.API_URL}/api/news/${id}`,
        getAuthHeaders()
      );

      if (response.data?.success && response.data?.data) {
        setNewsData(response.data.data);
      } else {
        toast.error("Failed to load news data");
        router.push("/news");
      }
    } catch (err: any) {
      console.error("Failed to fetch news:", err);
      const msg =
        err?.response?.data?.message ||
        "Failed to load news data. Please try again.";
      toast.error(msg);
      router.push("/news");
    } finally {
      setIsLoading(false);
    }
  };

  // Load news data
  useEffect(() => {
    if (id) {
      fetchNewsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (!newsData) return;

    if (confirm("Apakah Anda yakin ingin menghapus news ini?")) {
      try {
        const token = getAuthToken();
        const response = await axios.delete(
          `${CONFIG.API_URL}/api/news/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        if (response.data?.success) {
          toast.success("News berhasil dihapus!");
          router.push("/news");
        } else {
          toast.error(response.data?.message || "Failed to delete news");
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          "Failed to delete news. Please try again.";
        toast.error(msg);
      }
    }
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Loading... - SoundCave</title>
        </Head>
        <Layout>
          <div className="p-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Memuat data news...</p>
              </div>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  if (!newsData) {
    return (
      <>
        <Head>
          <title>News Not Found - SoundCave</title>
        </Head>
        <Layout>
          <div className="p-6">
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📰</span>
              <p className="text-gray-600 mb-4">News tidak ditemukan</p>
              <button
                onClick={() => router.push("/news")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to News
              </button>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  // Format date untuk display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Head>
        <title>{newsData.title} - SoundCave</title>
        <meta
          name="description"
          content={newsData.summary || newsData.title}
        />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Header with Actions */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Kembali ke News
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push(`/news`)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Kembali ke List
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* News Article Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Image */}
                {newsData.image_url && (
                  <div className="mb-6 rounded-lg overflow-hidden">
                    <img
                      src={newsData.image_url}
                      alt={newsData.title}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {newsData.title}
                </h1>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">👤</span>
                    <span className="font-medium">{newsData.author}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📂</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {newsData.category}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📅</span>
                    <span>
                      {newsData.published_at
                        ? formatDate(newsData.published_at)
                        : "-"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">👁️</span>
                    <span>{newsData.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        newsData.is_published
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {newsData.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>

                {/* Summary */}
                {newsData.summary && (
                  <div className="mb-6">
                    <p className="text-lg text-gray-700 leading-relaxed italic border-l-4 border-blue-500 pl-4">
                      {newsData.summary}
                    </p>
                  </div>
                )}

                {/* Content */}
                <div className="prose max-w-none mb-6">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {newsData.content}
                  </div>
                </div>

                {/* Tags */}
                {newsData.tags && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {newsData.tags.split(",").map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        newsData.is_published
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {newsData.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Views</span>
                    <span className="text-sm font-medium text-gray-900">
                      {newsData.views.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Category</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {newsData.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informasi
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Author</p>
                    <p className="text-sm font-medium text-gray-900">
                      {newsData.author}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Published At</p>
                    <p className="text-sm font-medium text-gray-900">
                      {newsData.published_at
                        ? formatDate(newsData.published_at)
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Created At</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(newsData.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Updated At</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(newsData.updated_at)}
                    </p>
                  </div>
                  {newsData.deleted_at && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Deleted At</p>
                      <p className="text-sm font-medium text-red-600">
                        {formatDate(newsData.deleted_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">👁️</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {newsData.views.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Views</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
