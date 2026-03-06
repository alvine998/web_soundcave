import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import MainLayout from "@/components/MainLayout";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";

export default function MainMusicVideoCreate() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
    const [userRole, setUserRole] = useState("");
    const [adminUserId, setAdminUserId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        artist_id: "",
        genre: "",
        duration: "",
        description: "",
        is_highlight: 0,
        is_approved: 0,
        approved_by: null as number | null,
        release_date: "",
    });

    const [videoFileUrl, setVideoFileUrl] = useState<string | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

    const [artists, setArtists] = useState<any[]>([]);
    const [genres, setGenres] = useState<any[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? ((e.target as HTMLInputElement).checked ? 1 : 0) : value
        }));
    };

    const getAuthHeaders = () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("soundcave_token") : null;
        return { headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" } };
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("soundcave_user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserRole(user.role);
            if (user.role === "admin") {
                setAdminUserId(user.id);
            }

            if (user.role === "independent") {
                fetchMyArtistId(user.id);
            } else if (user.role === "label") {
                fetchLabelArtists();
            }
        }
        fetchGenres();
    }, []);

    const fetchMyArtistId = async (uid: number) => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/artists`, {
                params: { ref_user_id: uid },
                ...getAuthHeaders(),
            });
            if (response.data?.success && response.data.data.length > 0) {
                setFormData(prev => ({ ...prev, artist_id: response.data.data[0].id.toString() }));
            }
        } catch (err) {
            console.error("Failed to fetch artist id", err);
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
        if (!videoFileUrl) return toast.error("Please upload a video file.");
        setIsLoading(true);

        const payload = {
            ...formData,
            artist_id: parseInt(formData.artist_id),
            video_url: videoFileUrl,
            thumbnail_url: thumbnailUrl,
            thumbnail: thumbnailUrl, // Consistency
            is_highlight: formData.is_highlight,
            is_approved: formData.is_approved,
            approved_by: formData.is_approved === 1 ? adminUserId : null,
            release_date: formData.release_date,
            submitted_by: userRole,
        };

        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/music-videos`, payload, getAuthHeaders());
            if (response.data?.success) {
                toast.success("Music video created successfully!");
                router.push("/main/music-video");
            }
        } catch (err) {
            toast.error("Failed to create music video.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Upload Music Video - SoundCave</title>
            </Head>
            <MainLayout>
                <div className="p-6 max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Upload Music Video</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-900">Video File *</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50/50">
                                    <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" id="video-input" />
                                    <label htmlFor="video-input" className="cursor-pointer text-gray-700 font-medium">
                                        {isUploadingVideo ? "Uploading..." : videoFileUrl ? "Video Uploaded ✓" : "Click to select video"}
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-900">Thumbnail</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50/50">
                                    <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" id="thumb-input" />
                                    <label htmlFor="thumb-input" className="cursor-pointer flex flex-col items-center text-gray-700 font-medium">
                                        {thumbnailPreview && <img src={thumbnailPreview} className="h-20 w-32 object-cover mb-2" />}
                                        {isUploadingThumbnail ? "Uploading..." : "Select thumbnail"}
                                    </label>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1 text-gray-900">Video Title *</label>
                                <Input required name="title" value={formData.title} onChange={handleChange} placeholder="Video title" />
                            </div>

                            {userRole === "label" && (
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-900">Artist *</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
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
                                <label className="block text-sm font-medium mb-1 text-gray-900">Genre *</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
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
                                <label className="block text-sm font-medium mb-1 text-gray-900">Duration (e.g. 4:20)</label>
                                <Input name="duration" value={formData.duration} onChange={handleChange} placeholder="4:20" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-900">Release Date</label>
                                <Input type="date" name="release_date" value={formData.release_date} onChange={handleChange} />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1 text-gray-900">Description</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-2 h-24 text-gray-900"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Video description..."
                                />
                            </div>

                            {userRole === "admin" && (
                                <div className="md:col-span-2 flex flex-wrap gap-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            name="is_highlight"
                                            checked={formData.is_highlight === 1}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-blue-900 group-hover:text-blue-700 transition-colors">
                                            Set as Highlight
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            name="is_approved"
                                            checked={formData.is_approved === 1}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                        />
                                        <span className="text-sm font-medium text-green-900 group-hover:text-green-700 transition-colors">
                                            Approve Immediately
                                        </span>
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => router.back()} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button
                                type="submit"
                                disabled={isLoading || isUploadingVideo || isUploadingThumbnail}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                            >
                                {isLoading ? "Saving..." : "Upload Video"}
                            </button>
                        </div>
                    </form>
                </div>
            </MainLayout>
        </>
    );
}
