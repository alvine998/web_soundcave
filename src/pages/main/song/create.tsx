import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import MainLayout from "@/components/MainLayout";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";

export default function MainSongCreate() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingAudio, setIsUploadingAudio] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [userRole, setUserRole] = useState("");
    const [userId, setUserId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        artist_id: "",
        album_id: "",
        genre: "",
        duration: "",
        explicit: false,
        release_date: "",
    });

    const [audioFileUrl, setAudioFileUrl] = useState<string | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

    const [artists, setArtists] = useState<any[]>([]);
    const [albums, setAlbums] = useState<any[]>([]);
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
        const storedUser = localStorage.getItem("soundcave_user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserRole(user.role);
            setUserId(user.id);

            if (user.role === "independent") {
                fetchMyArtistId(user.id);
            } else if (user.role === "label") {
                fetchLabelArtists();
            }
        }
        fetchGenres();
        fetchAlbums();
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
                params: { limit: 100 }, // Assuming label sees their own
                ...getAuthHeaders(),
            });
            if (response.data?.success) {
                setArtists(response.data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch artists", err);
        }
    };

    const fetchAlbums = async () => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/albums`, {
                params: { limit: 100 },
                ...getAuthHeaders(),
            });
            if (response.data?.success) {
                setAlbums(response.data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch albums", err);
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

    const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploadingAudio(true);
            const uploadData = new FormData();
            uploadData.append("file", file);
            uploadData.append("folder", "musics");

            try {
                const response = await axios.post(`${CONFIG.API_URL}/api/musics/upload`, uploadData, {
                    headers: {
                        ...getAuthHeaders().headers,
                        "Content-Type": "multipart/form-data",
                    },
                });
                if (response.data?.success) {
                    setAudioFileUrl(response.data.data.file_url);
                    toast.success("Audio uploaded!");
                }
            } catch (err) {
                toast.error("Audio upload failed.");
            } finally {
                setIsUploadingAudio(false);
            }
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverImagePreview(URL.createObjectURL(file));
            setIsUploadingImage(true);
            const uploadData = new FormData();
            uploadData.append("file", file);
            uploadData.append("folder", "musics/covers");

            try {
                const response = await axios.post(`${CONFIG.API_URL}/api/images/upload`, uploadData, {
                    headers: {
                        ...getAuthHeaders().headers,
                        "Content-Type": "multipart/form-data",
                    },
                });
                if (response.data?.success) {
                    setCoverImageUrl(response.data.data.file_url);
                    toast.success("Cover image uploaded!");
                }
            } catch (err) {
                toast.error("Image upload failed.");
            } finally {
                setIsUploadingImage(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!audioFileUrl) return toast.error("Please upload an audio file.");
        setIsLoading(true);

        const selectedArtist = userRole === "independent"
            ? "Your Self" // Or fetch actual name if needed
            : artists.find(a => a.id.toString() === formData.artist_id)?.name || "";

        const payload = {
            ...formData,
            artist: selectedArtist,
            artist_id: parseInt(formData.artist_id),
            album_id: formData.album_id ? parseInt(formData.album_id) : undefined,
            audio_file_url: audioFileUrl,
            cover_image_url: coverImageUrl,
            submitted_by: userRole == 'independent' ? 'artist' : userRole,
            is_approved: 0,
            is_top100: 0,
            release_date: formData.release_date,
        };

        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/musics`, payload, getAuthHeaders());
            if (response.data?.success) {
                toast.success("Song created!");
                router.push("/main/song");
            }
        } catch (err) {
            toast.error("Failed to create song.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Upload Song - SoundCave</title>
            </Head>
            <MainLayout>
                <div className="p-6 max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Upload New Song</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Audio File *</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                                    <input type="file" accept="audio/*" onChange={handleAudioChange} className="hidden" id="audio-input" />
                                    <label htmlFor="audio-input" className="cursor-pointer text-sm text-gray-600">
                                        {isUploadingAudio ? "Uploading..." : audioFileUrl ? <span className="text-green-600">Audio Uploaded ✓</span> : "Click to select audio"}
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-input" />
                                    <label htmlFor="image-input" className="cursor-pointer flex flex-col items-center text-sm text-gray-600">
                                        {coverImagePreview && <img src={coverImagePreview} className="h-20 w-20 object-cover mb-2 rounded" />}
                                        {isUploadingImage ? "Uploading..." : "Select image"}
                                    </label>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <Input required name="title" value={formData.title} onChange={handleChange} placeholder="Song title" />
                            </div>

                            {userRole === "label" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Artist *</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Genre *</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Album</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    name="album_id"
                                    value={formData.album_id}
                                    onChange={handleChange}
                                >
                                    <option value="">None</option>
                                    {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (e.g. 3:45)</label>
                                <Input name="duration" value={formData.duration} onChange={handleChange} placeholder="3:45" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Release Date</label>
                                <Input type="date" name="release_date" value={formData.release_date} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                            <button
                                type="submit"
                                disabled={isLoading || isUploadingAudio || isUploadingImage}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {isLoading ? "Saving..." : "Upload Song"}
                            </button>
                        </div>
                    </form>
                </div>
            </MainLayout>
        </>
    );
}
