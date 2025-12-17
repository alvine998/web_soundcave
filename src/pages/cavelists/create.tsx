import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";

export default function CreateCavelist() {
  const router = useRouter();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    is_promotion: false,
    expiry_promotion: "",
    artist_id: "",
    artist_name: "",
    status: "draft" as "draft" | "publish",
    published_at: "",
  });
  const [artists, setArtists] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

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

  // Fetch artists from API
  const fetchArtists = async () => {
    try {
      setIsLoadingArtists(true);
      const response = await axios.get(
        `${CONFIG.API_URL}/api/artists`,
        {
          params: {
            page: 1,
            limit: 100, // Get all artists
          },
          ...getAuthHeaders(),
        }
      );

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

  useEffect(() => {
    fetchArtists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update artist_name when artist_id changes
  useEffect(() => {
    if (formData.artist_id) {
      const selectedArtist = artists.find(
        (a) => a.id === parseInt(formData.artist_id)
      );
      if (selectedArtist) {
        setFormData((prev) => ({
          ...prev,
          artist_name: selectedArtist.name,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        artist_name: "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.artist_id, artists]);

  // Upload video function
  const uploadVideo = async (file: File) => {
    try {
      setIsUploadingVideo(true);
      const token = getAuthToken();

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await axios.post(
        `${CONFIG.API_URL}/api/cavelists/upload`,
        formDataUpload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (response.data?.success && response.data?.data?.file_url) {
        // Only get file_url from response
        const uploadedUrl = response.data.data.file_url;
        setVideoUrl(uploadedUrl);
        toast.success(response.data?.message || "Video uploaded successfully");
      } else {
        throw new Error(response.data?.message || "Failed to upload video");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        "Failed to upload video. Please try again.";
      error("Failed to Upload Video", msg);
      toast.error(msg);
      setVideoFile(null);
      setVideoPreview(null);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);

      // Create preview for video
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload video immediately
      await uploadVideo(file);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const token = getAuthToken();

      // Use uploaded video URL if available, otherwise use manual input
      const videoUrlToUse = videoUrl || formData.video_url || "";

      if (!videoUrlToUse) {
        toast.error("Please upload a video file or enter a video URL");
        return;
      }

      const payload: Record<string, any> = {
        title: formData.title,
        description: formData.description || null,
        video_url: videoUrlToUse,
        is_promotion: formData.is_promotion || false,
        artist_id: formData.artist_id ? parseInt(formData.artist_id) : null,
        artist_name: formData.artist_name || null,
        status: formData.status || "draft",
      };

      // Add expiry_promotion if is_promotion is true
      if (formData.is_promotion && formData.expiry_promotion) {
        // Format date to YYYY-MM-DD (date input returns YYYY-MM-DD)
        payload.expiry_promotion = formData.expiry_promotion;
      }

      // Add published_at if status is publish
      if (formData.status === "publish" && formData.published_at) {
        // Format date to YYYY-MM-DD (date input returns YYYY-MM-DD)
        payload.published_at = formData.published_at;
      }

      const response = await axios.post(
        `${CONFIG.API_URL}/api/cavelists`,
        payload,
        getAuthHeaders()
      );

      if (response.data?.success) {
        success("Cavelist Created", "Cavelist berhasil dibuat!");
        toast.success("Cavelist berhasil dibuat!");
        router.push("/cavelists");
      } else {
        throw new Error(response.data?.message || "Failed to create cavelist");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        "Failed to create cavelist. Please try again.";
      error("Failed to Create Cavelist", msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Cavelist - SoundCave</title>
        <meta name="description" content="Create new cavelist" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => router.push("/cavelists")}
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
              Kembali ke Cavelist
            </button>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Create New Cavelist
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter cavelist title"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="Enter description (optional)"
                />
              </div>

              {/* Artist */}
              <div>
                <label
                  htmlFor="artist_id"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Artist <span className="text-red-500">*</span>
                </label>
                <select
                  id="artist_id"
                  name="artist_id"
                  value={formData.artist_id}
                  onChange={handleChange}
                  required
                  disabled={isLoadingArtists}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed text-black"
                >
                  <option value="">Pilih Artist</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-black"
                >
                  <option value="draft">Draft</option>
                  <option value="publish">Publish</option>
                </select>
              </div>

              {/* Published At (if status is publish) */}
              {formData.status === "publish" && (
                <div>
                  <label
                    htmlFor="published_at"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Published At
                  </label>
                  <Input
                    id="published_at"
                    name="published_at"
                    type="date"
                    value={formData.published_at}
                    onChange={handleChange}
                  />
                </div>
              )}

              {/* Is Promotion */}
              <div className="flex items-center">
                <input
                  id="is_promotion"
                  name="is_promotion"
                  type="checkbox"
                  checked={formData.is_promotion}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="is_promotion"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                >
                  Is Promotion
                </label>
              </div>

              {/* Expiry Promotion (if is_promotion is true) */}
              {formData.is_promotion && (
                <div>
                  <label
                    htmlFor="expiry_promotion"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Expiry Promotion
                  </label>
                  <Input
                    id="expiry_promotion"
                    name="expiry_promotion"
                    type="date"
                    value={formData.expiry_promotion}
                    onChange={handleChange}
                  />
                </div>
              )}

              {/* Video File */}
              <div>
                <label
                  htmlFor="video-file"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Video File <span className="text-red-500">*</span>
                </label>
                <input
                  id="video-file"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  disabled={isUploadingVideo}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {isUploadingVideo && (
                  <p className="mt-2 text-sm text-blue-600">
                    Uploading video...
                  </p>
                )}
                {videoUrl && !isUploadingVideo && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ Video uploaded successfully
                  </p>
                )}
                {videoPreview && (
                  <div className="mt-4">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full max-w-md rounded-lg"
                      style={{ maxHeight: "400px" }}
                    />
                  </div>
                )}
                {!videoPreview && (
                  <div className="mt-2">
                    <label
                      htmlFor="video-url"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Atau masukkan Video URL
                    </label>
                    <Input
                      id="video-url"
                      name="video_url"
                      type="url"
                      value={formData.video_url}
                      onChange={handleChange}
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.push("/cavelists")}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || isUploadingVideo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating..." : "Create Cavelist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
}
