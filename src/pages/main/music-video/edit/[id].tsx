import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import MainLayout from "@/components/MainLayout";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";

export default function MainMusicVideoEdit() {
    const router = useRouter();
    const { id } = router.query;
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
    const [userRole, setUserRole] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        artist_id: "",
        genre: "",
        duration: "",
        description: "",
    });

    const [videoFileUrl, setVideoFileUrl] = useState<string | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

    const [artists, setArtists] = useState<any[]>([]);
    const [genres, setGenres] = useState<any[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getAuthHeaders = () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("soundcave_token") : null;
        return { headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" } };
    };

    useEffect(() => {
        if (!id) return;

        const storedUser = localStorage.getItem("soundcave_user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserRole(user.role);

            if (user.role === "label") {
                fetchLabelArtists();
            }
        }
        fetchGenres();
        fetchVideoData();
    }, [id]);

    const fetchVideoData = async () => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/music-videos/${id}`, getAuthHeaders());
            if (response.data?.success) {
                const video = response.data.data;
                setFormData({
                    title: video.title || "",
                    artist_id: video.artist_id?.toString() || "",
                    genre: video.genre || "",
                    duration: video.duration || "",
                    description: video.description || "",
                });
                setVideoFileUrl(video.video_url);
                setThumbnailUrl(video.thumbnail_url || video.thumbnail);
                setThumbnailPreview(video.thumbnail_url || video.thumbnail);
            }
        } catch (err) {
            toast.error("Failed to load music video data.");
        } finally {
            setIsPageLoading(false);
        }
    };

    const fetchLabelArtists = async () => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/artists`, {
                params: { limit: 100 },
                ...getAuthHeaders(),
            });
            if (response.data?.success) {
                setArtists(response.data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch artists", err);
        }
    };

    const fetchGenres = async () => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/genres`, {
                params: { limit: 50 },
                ...getAuthHeaders(),
            });
            if (response.data?.success) {
                setGenres(response.data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch genres", err);
        }
    };

    const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploadingVideo(true);
            const uploadData = new FormData();
            uploadData.append("file", file);
            uploadData.append("folder", "music-videos");

            try {
                const response = await axios.post(`${CONFIG.API_URL}/api/music-videos/upload`, uploadData, {
                    headers: {
                        ...getAuthHeaders().headers,
                        "Content-Type": "multipart/form-data",
                    },
                });
                if (response.data?.success) {
                    setVideoFileUrl(response.data.data.file_url);
                    toast.success("Video uploaded!");
                }
            } catch (err) {
                toast.error("Video upload failed.");
            } finally {
                setIsUploadingVideo(false);
            }
        }
    };

    const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setThumbnailPreview(URL.createObjectURL(file));
            setIsUploadingThumbnail(true);
            const uploadData = new FormData();
            uploadData.append("file", file);
            uploadData.append("folder", "music-videos/thumbnails");

            try {
                const response = await axios.post(`${CONFIG.API_URL}/api/images/upload`, uploadData, {
                    headers: {
                        ...getAuthHeaders().headers,
                        "Content-Type": "multipart/form-data",
                    },
                });
                if (response.data?.success) {
                    setThumbnailUrl(response.data.data.file_url);
                    toast.success("Thumbnail uploaded!");
                }
            } catch (err) {
                toast.error("Thumbnail upload failed.");
            } finally {
                setIsUploadingThumbnail(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            ...formData,
            artist_id: parseInt(formData.artist_id),
            video_url: videoFileUrl,
            thumbnail_url: thumbnailUrl,
            thumbnail: thumbnailUrl,
        };

        try {
            const response = await axios.put(`${CONFIG.API_URL}/api/music-videos/${id}`, payload, getAuthHeaders());
            if (response.data?.success) {
                toast.success("Music video updated successfully!");
                router.push("/main/music-video");
            }
        } catch (err) {
            toast.error("Failed to update music video.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isPageLoading) {
        return (
            <MainLayout>
                <div className="p-6 text-center">Loading music video data...</div>
            </MainLayout>
        );
    }

    return (
        <>
            <Head>
                <title>Edit Music Video - SoundCave</title>
            </Head>
            <MainLayout>
                <div className="p-6 max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Edit Music Video</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Video File</label>
                                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                    <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" id="video-input" />
                                    <label htmlFor="video-input" className="cursor-pointer">
                                        {isUploadingVideo ? "Uploading..." : videoFileUrl ? "Change Video ✓" : "Click to select video"}
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Thumbnail</label>
                                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                    <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" id="thumb-input" />
                                    <label htmlFor="thumb-input" className="cursor-pointer flex flex-col items-center">
                                        {thumbnailPreview && <img src={thumbnailPreview} className="h-20 w-32 object-cover mb-2" />}
                                        {isUploadingThumbnail ? "Uploading..." : "Change thumbnail"}
                                    </label>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Video Title *</label>
                                <Input required name="title" value={formData.title} onChange={handleChange} placeholder="Video title" />
                            </div>

                            {userRole === "label" && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Artist *</label>
                                    <select
                                        className="w-full border rounded-lg p-2"
                                        required
                                        name="artist_id"
                                        value={formData.artist_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Artist</option>
                                        {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Genre *</label>
                                <select
                                    className="w-full border rounded-lg p-2"
                                    required
                                    name="genre"
                                    value={formData.genre}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Genre</option>
                                    {genres.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Duration (e.g. 4:20)</label>
                                <Input name="duration" value={formData.duration} onChange={handleChange} placeholder="4:20" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="w-full border rounded-lg p-2 h-24"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Video description..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => router.back()} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button
                                type="submit"
                                disabled={isLoading || isUploadingVideo || isUploadingThumbnail}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                            >
                                {isLoading ? "Updating..." : "Update Video"}
                            </button>
                        </div>
                    </form>
                </div>
            </MainLayout>
        </>
    );
}
