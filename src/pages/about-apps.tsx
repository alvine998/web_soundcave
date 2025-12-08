import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";

interface AppInfo {
  id?: number;
  app_name: string;
  tagline: string;
  description: string;
  version: string;
  launch_date: string;
  email: string;
  phone: string;
  address: string;
  social_media: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  app_links: {
    ios?: string;
    android?: string;
    web?: string;
  };
  legal: {
    privacy_policy?: string;
    terms_of_service?: string;
    cookie_policy?: string;
  };
  features: {
    offline_mode: boolean;
    high_quality_audio: boolean;
    unlimited_playlists: boolean;
    ad_free: boolean;
  };
  stats: {
    total_users: number;
    total_songs: number;
    total_albums: number;
  };
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export default function AboutApps() {
  const { success, error } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [appInfoId, setAppInfoId] = useState<number | null>(null);

  const [appData, setAppData] = useState<AppInfo>({
    app_name: "",
    tagline: "",
    description: "",
    version: "",
    launch_date: "",
    email: "",
    phone: "",
    address: "",
    social_media: {
      facebook: "",
      twitter: "",
      instagram: "",
      youtube: "",
    },
    app_links: {
      ios: "",
      android: "",
      web: "",
    },
    legal: {
      privacy_policy: "",
      terms_of_service: "",
      cookie_policy: "",
    },
    features: {
      offline_mode: false,
      high_quality_audio: false,
      unlimited_playlists: false,
      ad_free: false,
    },
    stats: {
      total_users: 0,
      total_songs: 0,
      total_albums: 0,
    },
  });

  const [tempAppData, setTempAppData] = useState<AppInfo>(appData);

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

  // Fetch app info (assuming id = 1 for now, or we can get from API)
  const fetchAppInfo = async () => {
    try {
      setIsLoading(true);
      // Try to fetch with id = 1 first
      const response = await axios.get(
        `${CONFIG.API_URL}/api/app-info/1`,
        getAuthHeaders()
      );

      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        setAppInfoId(data.id);
        setAppData(data);
        setTempAppData(data);
      }
    } catch (err: any) {
      // If not found, that's okay - we'll create new one
      console.log("App info not found, will create new one");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.startsWith("social_media.")) {
      const key = name.split(".")[1];
      setTempAppData((prev) => ({
        ...prev,
        social_media: {
          ...prev.social_media,
          [key]: value,
        },
      }));
    } else if (name.startsWith("app_links.")) {
      const key = name.split(".")[1];
      setTempAppData((prev) => ({
        ...prev,
        app_links: {
          ...prev.app_links,
          [key]: value,
        },
      }));
    } else if (name.startsWith("legal.")) {
      const key = name.split(".")[1];
      setTempAppData((prev) => ({
        ...prev,
        legal: {
          ...prev.legal,
          [key]: value,
        },
      }));
    } else if (name.startsWith("features.")) {
      const key = name.split(".")[1];
      setTempAppData((prev) => ({
        ...prev,
        features: {
          ...prev.features,
          [key]: type === "checkbox" ? checked : value === "true",
        },
      }));
    } else if (name.startsWith("stats.")) {
      const key = name.split(".")[1];
      setTempAppData((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          [key]: parseInt(value) || 0,
        },
      }));
    } else {
      setTempAppData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      const token = getAuthToken();

      // Format launch_date to YYYY-MM-DD only (remove time part if exists)
      let launchDate = tempAppData.launch_date;
      if (launchDate) {
        // If it contains 'T', split and take only the date part
        if (launchDate.includes('T')) {
          launchDate = launchDate.split('T')[0];
        }
        // If it contains space, split and take only the date part
        if (launchDate.includes(' ')) {
          launchDate = launchDate.split(' ')[0];
        }
      }

      const payload = {
        app_name: tempAppData.app_name,
        tagline: tempAppData.tagline,
        description: tempAppData.description,
        version: tempAppData.version,
        launch_date: launchDate || "",
        email: tempAppData.email,
        phone: tempAppData.phone,
        address: tempAppData.address,
        social_media: tempAppData.social_media,
        app_links: tempAppData.app_links,
        legal: tempAppData.legal,
        features: tempAppData.features,
        stats: tempAppData.stats,
      };

      let response;
      
      // If appInfoId exists, use PUT to update
      if (appInfoId) {
        response = await axios.put(
          `${CONFIG.API_URL}/api/app-info/${appInfoId}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
      } else {
        // Otherwise, use POST to create new
        response = await axios.post(
          `${CONFIG.API_URL}/api/app-info`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
      }

      if (response.data?.success) {
        if (response.data?.data?.id) {
          setAppInfoId(response.data.data.id);
        }
        setAppData(tempAppData);
        setIsEditing(false);
        success(
          "App Info Updated",
          "Application information has been saved successfully."
        );
        toast.success("App info berhasil disimpan!");
        // Refresh data
        fetchAppInfo();
      } else {
        throw new Error(response.data?.message || "Failed to save");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Failed to update app information. Please try again.";
      error("Update Failed", msg);
      toast.error(msg);
    }
  };

  const handleCancel = () => {
    setTempAppData(appData);
    setIsEditing(false);
  };

  return (
    <>
      <Head>
        <title>About Apps - SoundCave</title>
        <meta name="description" content="Manage application information" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">About Application</h1>
            <p className="text-gray-600">Kelola informasi dan deskripsi aplikasi SoundCave</p>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Edit Information
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* App Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    App Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="app_name"
                    value={tempAppData.app_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tagline <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="tagline"
                    value={tempAppData.tagline}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>

                {/* Version */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Version
                  </label>
                  <Input
                    type="text"
                    name="version"
                    value={tempAppData.version}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>

                {/* Launch Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Launch Date
                  </label>
                  <Input
                    type="date"
                    name="launch_date"
                    value={
                      tempAppData.launch_date
                        ? tempAppData.launch_date.split("T")[0].split(" ")[0]
                        : ""
                    }
                    onChange={(e) => {
                      // Ensure we only store YYYY-MM-DD format
                      const dateValue = e.target.value;
                      setTempAppData((prev) => ({
                        ...prev,
                        launch_date: dateValue,
                      }));
                    }}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    value={tempAppData.description}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400 ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                    placeholder="Enter app description..."
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={tempAppData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={tempAppData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="address"
                    value={tempAppData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Social Media Links</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Facebook */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📘 Facebook
                  </label>
                  <Input
                    type="url"
                    name="social_media.facebook"
                    value={tempAppData.social_media.facebook || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="https://facebook.com/..."
                  />
                </div>

                {/* Instagram */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📸 Instagram
                  </label>
                  <Input
                    type="url"
                    name="social_media.instagram"
                    value={tempAppData.social_media.instagram || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="https://instagram.com/..."
                  />
                </div>

                {/* Twitter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🐦 Twitter/X
                  </label>
                  <Input
                    type="url"
                    name="social_media.twitter"
                    value={tempAppData.social_media.twitter || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="https://twitter.com/..."
                  />
                </div>

                {/* YouTube */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🎥 YouTube
                  </label>
                  <Input
                    type="url"
                    name="social_media.youtube"
                    value={tempAppData.social_media.youtube || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
            </div>

            {/* App Download Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">App Download Links</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* iOS */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🍎 iOS App Store
                  </label>
                  <Input
                    type="url"
                    name="app_links.ios"
                    value={tempAppData.app_links.ios || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="https://apps.apple.com/..."
                  />
                </div>

                {/* Android */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📱 Google Play Store
                  </label>
                  <Input
                    type="url"
                    name="app_links.android"
                    value={tempAppData.app_links.android || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="https://play.google.com/..."
                  />
                </div>

                {/* Web */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🌐 Web URL
                  </label>
                  <Input
                    type="url"
                    name="app_links.web"
                    value={tempAppData.app_links.web || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="https://soundcave.com"
                  />
                </div>
              </div>
            </div>

            {/* Legal & Support Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Legal & Support</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Privacy Policy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🔒 Privacy Policy URL
                  </label>
                  <Input
                    type="text"
                    name="legal.privacy_policy"
                    value={tempAppData.legal.privacy_policy || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="https://soundcave.com/privacy"
                  />
                </div>

                {/* Terms of Service */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📄 Terms of Service URL
                  </label>
                  <Input
                    type="text"
                    name="legal.terms_of_service"
                    value={tempAppData.legal.terms_of_service || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="https://soundcave.com/terms"
                  />
                </div>

                {/* Cookie Policy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🍪 Cookie Policy URL
                  </label>
                  <Input
                    type="text"
                    name="legal.cookie_policy"
                    value={tempAppData.legal.cookie_policy || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="https://soundcave.com/cookies"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Key Features
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="features.offline_mode"
                    checked={tempAppData.features.offline_mode}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Offline Mode
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="features.high_quality_audio"
                    checked={tempAppData.features.high_quality_audio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    High Quality Audio
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="features.unlimited_playlists"
                    checked={tempAppData.features.unlimited_playlists}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Unlimited Playlists
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="features.ad_free"
                    checked={tempAppData.features.ad_free}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Ad Free
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

