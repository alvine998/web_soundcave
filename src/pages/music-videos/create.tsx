import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";

export default function CreateMusicVideo() {
  const router = useRouter();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    artist_id: "",
    artist: "",
    genre: "",
    duration: "",
    release_date: "",
    description: "",
    video_url: "",
    thumbnail: "",
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
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
    fetchArtists();
    fetchGenres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Upload video function
  const uploadVideo = async (file: File) => {
    try {
      setIsUploadingVideo(true);
      const token = getAuthToken();

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("folder", "music-videos");

      const response = await axios.post(
        `${CONFIG.API_URL}/api/music-videos/upload`,
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

  // Upload image function for thumbnail
  const uploadImage = async (file: File) => {
    try {
      setIsUploadingImage(true);
      const token = getAuthToken();

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("folder", "music-videos/thumbnails");

      const response = await axios.post(
        `${CONFIG.API_URL}/api/images/upload`,
        formDataUpload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (response.data?.success && response.data?.data?.file_url) {
        const uploadedUrl = response.data.data.file_url;
        setThumbnailUrl(uploadedUrl);
        toast.success(response.data?.message || "Thumbnail uploaded successfully");
      } else {
        throw new Error(response.data?.message || "Failed to upload thumbnail");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        "Failed to upload thumbnail. Please try again.";
      error("Failed to Upload Thumbnail", msg);
      toast.error(msg);
      setThumbnailFile(null);
      setThumbnailPreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload image immediately
      await uploadImage(file);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

      // Use uploaded thumbnail URL if available, otherwise use manual input
      const thumbnailUrlToUse = thumbnailUrl || formData.thumbnail || null;

      const payload = {
        title: formData.title,
        artist:
          artists.find((artist) => artist.id === parseInt(formData.artist_id))
            ?.name || "",
        artist_id: parseInt(formData.artist_id),
        genre: formData.genre,
        release_date: formData.release_date,
        duration: formData.duration,
        description: formData.description || null,
        video_url: videoUrlToUse,
        thumbnail: thumbnailUrlToUse,
      };

      const response = await axios.post(
        `${CONFIG.API_URL}/api/music-videos`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (response.data?.success) {
        success(
          "Music Video Added",
          `${formData.title} has been added successfully.`
        );
        toast.success("Music video berhasil ditambahkan!");
        router.push("/music-videos");
      } else {
        throw new Error(response.data?.message || "Failed to add video");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Failed to add music video. Please try again.";
      error("Failed to Add Video", msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Music Video - SoundCave</title>
      </Head>

      <Layout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create Music Video
              </h1>
              <p className="text-gray-600 mt-1">
                Add a new music video to your platform
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
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
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter video title"
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

                {/* Genre */}
                <div>
                  <label
                    htmlFor="genre"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Genre <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="genre"
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

                {/* Duration */}
                <div>
                  <label
                    htmlFor="duration"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="duration"
                    name="duration"
                    type="text"
                    required
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g. 04:32"
                  />
                </div>

                {/* Release Date */}
                <div>
                  <label
                    htmlFor="release_date"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Release Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="release_date"
                    name="release_date"
                    type="date"
                    required
                    value={formData.release_date}
                    onChange={handleChange}
                  />
                </div>

                {/* Video File */}
                <div className="md:col-span-2">
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
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                  )}
                </div>

                {/* Thumbnail */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="thumbnail-file"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Thumbnail Image
                  </label>
                  <input
                    id="thumbnail-file"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    disabled={isUploadingImage}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {isUploadingImage && (
                    <p className="mt-2 text-sm text-blue-600">
                      Uploading thumbnail...
                    </p>
                  )}
                  {thumbnailUrl && !isUploadingImage && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ Thumbnail uploaded successfully
                    </p>
                  )}
                  {thumbnailPreview && (
                    <div className="mt-4">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full max-w-md h-auto rounded-lg"
                      />
                    </div>
                  )}
                  {!thumbnailPreview && (
                    <div className="mt-2">
                      <label
                        htmlFor="thumbnail-url"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Atau masukkan Thumbnail URL
                      </label>
                      <Input
                        id="thumbnail-url"
                        name="thumbnail"
                        type="url"
                        value={formData.thumbnail}
                        onChange={handleChange}
                        placeholder="https://example.com/thumbnails/..."
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                    placeholder="Enter video description"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || isUploadingVideo}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating..." : "Create Music Video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
}
