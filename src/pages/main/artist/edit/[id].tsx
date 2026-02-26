import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import MainLayout from "@/components/MainLayout";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";

export default function EditArtist() {
    const router = useRouter();
    const { id } = router.query;
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        genre: "",
        country: "",
        bio: "",
    });

    const getAuthHeaders = () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("soundcave_token") : null;
        return { headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" } };
    };

    useEffect(() => {
        if (!id) return;

        const fetchArtist = async () => {
            try {
                const response = await axios.get(`${CONFIG.API_URL}/api/artists/${id}`, getAuthHeaders());
                if (response.data?.success && response.data?.data) {
                    const artist = response.data.data;
                    setFormData({
                        name: artist.name || "",
                        email: artist.email || "",
                        genre: artist.genre || "",
                        country: artist.country || "",
                        bio: artist.bio || "",
                    });
                }
            } catch (err: any) {
                toast.error("Failed to load artist details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchArtist();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const response = await axios.put(
                `${CONFIG.API_URL}/api/artists/${id}`,
                formData,
                getAuthHeaders()
            );

            if (response.data?.success) {
                toast.success("Artist updated successfully!");
                router.push("/main/artist");
            } else {
                toast.error(response.data?.message || "Failed to update artist.");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to update artist.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Head>
                <title>Edit Artist - SoundCave</title>
            </Head>

            <MainLayout>
                <div className="p-6 max-w-2xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Artist</h1>
                        <p className="text-gray-600">Update artist information</p>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Artist Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact Email
                                </label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                                        Genre <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="genre"
                                        name="genre"
                                        type="text"
                                        required
                                        value={formData.genre}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                        Country <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="country"
                                        name="country"
                                        type="text"
                                        required
                                        value={formData.country}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                                    Bio
                                </label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    rows={4}
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400 transition-all"
                                />
                            </div>

                            <div className="flex justify-end pt-4 space-x-3">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                                >
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </MainLayout>
        </>
    );
}
