import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";

export default function CreatePodcast() {
  const router = useRouter();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    host: "",
    category: "",
    duration: "",
    release_date: "",
    description: "",
    episode_number: "",
    season: "",
    video_url: "",
    thumbnail: "",
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

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

  // Upload video function
  const uploadVideo = async (file: File) => {
    try {
      setIsUploadingVideo(true);
      const token = getAuthToken();

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("folder", "podcast-videos");

      const response = await axios.post(
        `${CONFIG.API_URL}/api/podcasts/upload`,
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
      formDataUpload.append("folder", "podcasts/thumbnails");

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

      const payload: Record<string, any> = {
        title: formData.title,
        host: formData.host,
        category: formData.category,
        release_date: formData.release_date,
        duration: formData.duration,
        description: formData.description || null,
        video_url: videoUrlToUse,
        thumbnail: thumbnailUrlToUse,
      };

      if (formData.episode_number) {
        payload.episode_number = parseInt(formData.episode_number);
      }
      if (formData.season) {
        payload.season = parseInt(formData.season);
      }

      const response = await axios.post(
        `${CONFIG.API_URL}/api/podcasts`,
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
          "Podcast Added",
          `${formData.title} has been added successfully.`
        );
        toast.success("Podcast berhasil ditambahkan!");
        router.push("/podcasts");
      } else {
        throw new Error(response.data?.message || "Failed to add podcast");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Failed to add podcast. Please try again.";
      error("Failed to Add Podcast", msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Categories
  const categories = [
    "Technology",
    "Business",
    "Music Business",
    "Production",
    "Interview",
    "Reviews",
    "Education",
    "News & Updates",
    "Live Sessions",
  ];

  return (
    <>
      <Head>
        <title>Create Podcast - SoundCave</title>
      </Head>

      <Layout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create Podcast
              </h1>
              <p className="text-gray-600 mt-1">
                Add a new podcast episode to your platform
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
                    Episode Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. The Music Industry Today"
                  />
                </div>

                {/* Host */}
                <div>
                  <label
                    htmlFor="host"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Host <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="host"
                    name="host"
                    type="text"
                    required
                    value={formData.host}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                  />
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Season */}
                <div>
                  <label
                    htmlFor="season"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Season
                  </label>
                  <Input
                    id="season"
                    name="season"
                    type="number"
                    value={formData.season}
                    onChange={handleChange}
                    placeholder="e.g. 1"
                  />
                </div>

                {/* Episode Number */}
                <div>
                  <label
                    htmlFor="episode_number"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Episode Number
                  </label>
                  <Input
                    id="episode_number"
                    name="episode_number"
                    type="number"
                    value={formData.episode_number}
                    onChange={handleChange}
                    placeholder="e.g. 1"
                  />
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
                    placeholder="e.g. 45:30"
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
                        placeholder="https://example.com/video.mp4"
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
                        placeholder="https://example.com/thumbnail.jpg"
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
                    placeholder="Enter episode description"
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
                  disabled={isLoading || isUploadingVideo || isUploadingImage}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating..." : "Create Podcast"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
}
