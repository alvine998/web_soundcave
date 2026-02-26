import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import MainLayout from "@/components/MainLayout";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";

export default function MainAlbumEdit() {
    const router = useRouter();
    const { id } = router.query;
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [userRole, setUserRole] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        artist_id: "",
        type: "album",
        release_date: "",
        description: "",
    });

    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

    const [artists, setArtists] = useState<any[]>([]);

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
        fetchAlbumData();
    }, [id]);

    const fetchAlbumData = async () => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/albums/${id}`, getAuthHeaders());
            if (response.data?.success) {
                const album = response.data.data;
                setFormData({
                    title: album.title || "",
                    artist_id: album.artist_id?.toString() || "",
                    type: album.type || "album",
                    release_date: album.release_date || "",
                    description: album.description || "",
                });
                setCoverImageUrl(album.cover_image_url || album.cover_image);
                setCoverImagePreview(album.cover_image_url || album.cover_image);
            }
        } catch (err) {
            toast.error("Failed to load album data.");
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

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverImagePreview(URL.createObjectURL(file));
            setIsUploadingImage(true);
            const uploadData = new FormData();
            uploadData.append("file", file);
            uploadData.append("folder", "albums/covers");

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

        const payload = {
            ...formData,
            artist_id: parseInt(formData.artist_id),
            cover_image_url: coverImageUrl,
        };

        try {
            const response = await axios.put(`${CONFIG.API_URL}/api/albums/${id}`, payload, getAuthHeaders());
            if (response.data?.success) {
                toast.success("Album updated successfully!");
                router.push("/main/album");
            }
        } catch (err) {
            toast.error("Failed to update album.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isPageLoading) {
        return (
            <MainLayout>
                <div className="p-6 text-center">Loading album data...</div>
            </MainLayout>
        );
    }

    return (
        <>
            <Head>
                <title>Edit Album - SoundCave</title>
            </Head>
            <MainLayout>
                <div className="p-6 max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Edit Album</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 flex flex-col items-center">
                                <label className="block text-sm font-medium mb-2">Cover Image</label>
                                <div className="border-2 border-dashed rounded-lg p-4 text-center w-full max-w-xs aspect-square flex items-center justify-center">
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-input" />
                                    <label htmlFor="image-input" className="cursor-pointer flex flex-col items-center justify-center h-full w-full">
                                        {coverImagePreview ? (
                                            <img src={coverImagePreview} className="h-full w-full object-cover rounded-lg" />
                                        ) : (
                                            <div className="flex flex-col items-center text-gray-400">
                                                <span className="text-4xl mb-2">💿</span>
                                                <span className="text-sm">Change Album Art</span>
                                            </div>
                                        )}
                                        {isUploadingImage && <div className="text-blue-600 text-xs mt-2">Uploading...</div>}
                                    </label>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Album Title *</label>
                                <Input required name="title" value={formData.title} onChange={handleChange} placeholder="Album name" />
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
                                <label className="block text-sm font-medium mb-1">Release Type *</label>
                                <select
                                    className="w-full border rounded-lg p-2"
                                    required
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                >
                                    <option value="album">Album</option>
                                    <option value="single">Single</option>
                                    <option value="ep">EP</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Release Date</label>
                                <Input type="date" name="release_date" value={formData.release_date} onChange={handleChange} />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="w-full border rounded-lg p-2 h-24"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Album description..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => router.back()} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button
                                type="submit"
                                disabled={isLoading || isUploadingImage}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                            >
                                {isLoading ? "Updating..." : "Update Album"}
                            </button>
                        </div>
                    </form>
                </div>
            </MainLayout>
        </>
    );
}
