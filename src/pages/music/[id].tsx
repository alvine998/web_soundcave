import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MusicData {
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

export default function MusicDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicData, setMusicData] = useState<MusicData | null>(null);
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

  // Fetch music data
  const fetchMusicData = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const response = await axios.get(
        `${CONFIG.API_URL}/api/musics/${id}`,
        getAuthHeaders()
      );

      if (response.data?.success && response.data?.data) {
        setMusicData(response.data.data);
      } else {
        toast.error("Failed to load music data");
        router.push("/music");
      }
    } catch (err: any) {
      console.error("Failed to fetch music:", err);
      const msg =
        err?.response?.data?.message ||
        "Failed to load music data. Please try again.";
      toast.error(msg);
      router.push("/music");
    } finally {
      setIsLoading(false);
    }
  };

  // Load music data
  useEffect(() => {
    if (id) {
      fetchMusicData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const weeklyPlays = [
    { day: 'Mon', plays: 1200 },
    { day: 'Tue', plays: 1450 },
    { day: 'Wed', plays: 1680 },
    { day: 'Thu', plays: 1340 },
    { day: 'Fri', plays: 2100 },
    { day: 'Sat', plays: 2450 },
    { day: 'Sun', plays: 2280 },
  ];

  const recentActivity = [
    { user: 'john_doe', action: 'Added to playlist', time: '5 mins ago' },
    { user: 'sarah_w', action: 'Downloaded', time: '12 mins ago' },
    { user: 'mike_j', action: 'Liked', time: '1 hour ago' },
    { user: 'emma_r', action: 'Shared', time: '2 hours ago' },
    { user: 'david_b', action: 'Added to favorites', time: '3 hours ago' },
  ];

  const handleDelete = async () => {
    if (!musicData) return;

    if (confirm("Are you sure you want to delete this song?")) {
      try {
        const token = getAuthToken();
        const response = await axios.delete(
          `${CONFIG.API_URL}/api/musics/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        if (response.data?.success) {
          toast.success("Music berhasil dihapus!");
          router.push("/music");
        } else {
          toast.error(response.data?.message || "Failed to delete music");
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          "Failed to delete music. Please try again.";
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
                <p className="text-gray-600">Memuat data music...</p>
              </div>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  if (!musicData) {
    return (
      <>
        <Head>
          <title>Music Not Found - SoundCave</title>
        </Head>
        <Layout>
          <div className="p-6">
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🎵</span>
              <p className="text-gray-600 mb-4">Music tidak ditemukan</p>
              <button
                onClick={() => router.push("/music")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Music
              </button>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{musicData.title} - SoundCave</title>
        <meta
          name="description"
          content={musicData.description || musicData.title}
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
              Back to Music
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push(`/music/edit/${id}`)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Music Player Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start space-x-6">
                  {/* Cover Image */}
                  <div className="w-48 h-48 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-gradient-to-br from-blue-400 to-purple-600">
                    {musicData.cover_image_url ? (
                      <img
                        src={musicData.cover_image_url}
                        alt={musicData.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-8xl">🎵</span>
                    )}
                  </div>

                  {/* Music Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                          {musicData.title}
                        </h1>
                        <p className="text-lg text-gray-600 mb-1">
                          {musicData.artist}
                        </p>
                        {musicData.album && (
                          <p className="text-sm text-gray-500">
                            {musicData.album}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          !musicData.deleted_at
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {!musicData.deleted_at ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Genre</p>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          {musicData.genre}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Duration</p>
                        <p className="text-sm font-medium text-gray-900">
                          {musicData.duration}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Release Date
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {musicData.release_date
                            ? new Date(musicData.release_date).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                    </div>

                    {/* Audio Player */}
                    {musicData.audio_file_url && (
                      <audio
                        id="music-player"
                        src={musicData.audio_file_url}
                        controls
                        className="w-full mt-4"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">▶️</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {musicData.play_count.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total Plays</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">❤️</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {musicData.like_count.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Likes</p>
                </div>
              </div>

              {/* Weekly Plays Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyPlays}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Bar dataKey="plays" fill="#3B82F6" name="Plays" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Description */}
              {musicData.description && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {musicData.description}
                  </p>
                </div>
              )}

              {/* Lyrics */}
              {musicData.lyrics && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Lyrics
                  </h3>
                  <pre className="text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                    {musicData.lyrics}
                  </pre>
                </div>
              )}

              {/* Tags */}
              {musicData.tags && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {musicData.tags.split(",").map((tag, index) => (
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

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Music ID</span>
                    <span className="font-medium text-gray-900">#{id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Artist ID</span>
                    <span className="font-medium text-gray-900">
                      #{musicData.artist_id}
                    </span>
                  </div>
                  {musicData.album_id && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Album ID</span>
                      <span className="font-medium text-gray-900">
                        #{musicData.album_id}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Language</span>
                    <span className="font-medium text-gray-900">
                      {musicData.language || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Explicit</span>
                    <span className="font-medium text-gray-900">
                      {musicData.explicit ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Created At</span>
                    <span className="font-medium text-gray-900">
                      {new Date(musicData.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Updated At</span>
                    <span className="font-medium text-gray-900">
                      {new Date(musicData.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>


              {/* Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Actions
                </h3>
                <div className="space-y-2">
                  {musicData.audio_file_url && (
                    <a
                      href={musicData.audio_file_url}
                      download
                      className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm text-center"
                    >
                      Download Audio
                    </a>
                  )}
                  <button
                    onClick={() => {
                      if (navigator.share && musicData.audio_file_url) {
                        navigator.share({
                          title: musicData.title,
                          text: `Listen to ${musicData.title} by ${musicData.artist}`,
                          url: musicData.audio_file_url,
                        });
                      } else {
                        navigator.clipboard.writeText(
                          musicData.audio_file_url || ""
                        );
                        toast.success("Link copied to clipboard!");
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => router.push(`/playlists?add_music=${id}`)}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Add to Playlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

