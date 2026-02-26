import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import MainLayout from "@/components/MainLayout";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";

export default function MainSongEdit() {
    const router = useRouter();
    const { id } = router.query;
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isUploadingAudio, setIsUploadingAudio] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [userRole, setUserRole] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        artist_id: "",
        album_id: "",
        genre: "",
        duration: "",
        explicit: false,
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
        fetchAlbums();
        fetchSongData();
    }, [id]);

    const fetchSongData = async () => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/musics/${id}`, getAuthHeaders());
            if (response.data?.success) {
                const song = response.data.data;
                setFormData({
                    title: song.title || "",
                    artist_id: song.artist_id?.toString() || "",
                    album_id: song.album_id?.toString() || "",
                    genre: song.genre || "",
                    duration: song.duration || "",
                    explicit: song.explicit || false,
                });
                setAudioFileUrl(song.audio_file_url);
                setCoverImageUrl(song.cover_image_url || song.cover_image);
                setCoverImagePreview(song.cover_image_url || song.cover_image);
            }
        } catch (err) {
            toast.error("Failed to load song data.");
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
        setIsLoading(true);

        const selectedArtist = userRole === "independent"
            ? "Your Self"
            : artists.find(a => a.id.toString() === formData.artist_id)?.name || "";

        const payload = {
            ...formData,
            artist: selectedArtist,
            artist_id: parseInt(formData.artist_id),
            album_id: formData.album_id ? parseInt(formData.album_id) : undefined,
            audio_file_url: audioFileUrl,
            cover_image_url: coverImageUrl,
        };

        try {
            const response = await axios.put(`${CONFIG.API_URL}/api/musics/${id}`, payload, getAuthHeaders());
            if (response.data?.success) {
                toast.success("Song updated successfully!");
                router.push("/main/song");
            }
        } catch (err) {
            toast.error("Failed to update song.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isPageLoading) {
        return (
            <MainLayout>
                <div className="p-6 text-center">Loading song data...</div>
            </MainLayout>
        );
    }

    return (
        <>
            <Head>
                <title>Edit Song - SoundCave</title>
            </Head>
            <MainLayout>
                <div className="p-6 max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Edit Song</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Audio File</label>
                                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                    <input type="file" accept="audio/*" onChange={handleAudioChange} className="hidden" id="audio-input" />
                                    <label htmlFor="audio-input" className="cursor-pointer">
                                        {isUploadingAudio ? "Uploading..." : audioFileUrl ? "Change Audio ✓" : "Click to select audio"}
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Cover Image</label>
                                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-input" />
                                    <label htmlFor="image-input" className="cursor-pointer flex flex-col items-center">
                                        {coverImagePreview && <img src={coverImagePreview} className="h-20 w-20 object-cover mb-2" />}
                                        {isUploadingImage ? "Uploading..." : "Change image"}
                                    </label>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Title *</label>
                                <Input required name="title" value={formData.title} onChange={handleChange} placeholder="Song title" />
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
                                <label className="block text-sm font-medium mb-1">Album</label>
                                <select
                                    className="w-full border rounded-lg p-2"
                                    name="album_id"
                                    value={formData.album_id}
                                    onChange={handleChange}
                                >
                                    <option value="">None</option>
                                    {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Duration (e.g. 3:45)</label>
                                <Input name="duration" value={formData.duration} onChange={handleChange} placeholder="3:45" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => router.back()} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button
                                type="submit"
                                disabled={isLoading || isUploadingAudio || isUploadingImage}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                            >
                                {isLoading ? "Updating..." : "Update Song"}
                            </button>
                        </div>
                    </form>
                </div>
            </MainLayout>
        </>
    );
}
