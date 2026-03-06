import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import MainLayout from "@/components/MainLayout";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";

export default function CreateArtist() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        genre: "",
        country: "",
        bio: "",
        cover_image: "",
        photo: "",
        is_highlight: 0,
    });
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    const getAuthHeaders = () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("soundcave_token") : null;
        return { headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" } };
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (file: File, type: 'cover' | 'photo') => {
        try {
            if (type === 'cover') setIsUploadingCover(true);
            else setIsUploadingPhoto(true);

            const token = typeof window !== "undefined" ? localStorage.getItem("soundcave_token") : null;
            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('folder', 'artists');

            const response = await axios.post(
                `${CONFIG.API_URL}/api/images/upload`,
                uploadData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                }
            );

            if (response.data?.success && response.data?.data?.file_url) {
                const fileUrl = response.data.data.file_url;
                setFormData((prev) => ({ ...prev, [type === 'cover' ? 'cover_image' : 'photo']: fileUrl }));
                toast.success(`${type === 'cover' ? 'Cover' : 'Photo'} uploaded successfully!`);
            } else {
                throw new Error("Upload failed");
            }
        } catch (err) {
            toast.error(`Failed to upload ${type}`);
        } finally {
            if (type === 'cover') setIsUploadingCover(false);
            else setIsUploadingPhoto(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'photo') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'cover') setCoverImagePreview(reader.result as string);
                else setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            handleFileUpload(file, type);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isUploadingCover || isUploadingPhoto) {
            toast.error("Please wait for images to finish uploading");
            return;
        }
        setIsLoading(true);

        try {
            const response = await axios.post(
                `${CONFIG.API_URL}/api/artists`,
                formData,
                getAuthHeaders()
            );

            if (response.data?.success) {
                toast.success("Artist created successfully!");
                router.push("/main/artist");
            } else {
                toast.error(response.data?.message || "Failed to create artist.");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to create artist.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Add Artist - SoundCave</title>
            </Head>

            <MainLayout>
                <div className="p-6 max-w-2xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Artist</h1>
                        <p className="text-gray-600">Register a new artist under your label</p>
                    </div>

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
                                placeholder="Enter artist stage name"
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
                                placeholder="artist@example.com"
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
                                    placeholder="e.g. Pop, Jazz"
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
                                    placeholder="e.g. Indonesia"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Cover Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cover Image (Banner)
                                </label>
                                <div className="relative group border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors bg-gray-50 h-40 flex flex-col items-center justify-center overflow-hidden">
                                    {coverImagePreview ? (
                                        <>
                                            <img src={coverImagePreview} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <p className="text-white text-xs font-medium">Change Cover</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-1">
                                            <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <p className="text-xs text-gray-500">Upload Banner</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'cover')}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={isUploadingCover}
                                    />
                                    {isUploadingCover && (
                                        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Photo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Artist Photo
                                </label>
                                <div className="relative group border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors bg-gray-50 h-40 flex flex-col items-center justify-center overflow-hidden">
                                    {photoPreview ? (
                                        <>
                                            <img src={photoPreview} alt="Photo Preview" className="absolute inset-0 w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <p className="text-white text-xs font-medium">Change Photo</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-1">
                                            <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M24 8a8 8 0 100 16 8 8 0 000-16zM8 40a16 16 0 0132 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <p className="text-xs text-gray-500">Upload Profile</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'photo')}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={isUploadingPhoto}
                                    />
                                    {isUploadingPhoto && (
                                        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Highlight Status
                            </label>
                            <div className="flex items-center space-x-6">
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="radio"
                                            name="is_highlight"
                                            className="sr-only"
                                            checked={formData.is_highlight === 1}
                                            onChange={() => setFormData(prev => ({ ...prev, is_highlight: 1 }))}
                                        />
                                        <div className={`w-5 h-5 border-2 rounded-full border-gray-300 flex items-center justify-center transition-all group-hover:border-blue-400 ${formData.is_highlight === 1 ? 'border-blue-600 bg-blue-600' : ''}`}>
                                            {formData.is_highlight === 1 && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                    </div>
                                    <span className="ml-2 text-sm text-gray-700 font-medium">Highlight</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="radio"
                                            name="is_highlight"
                                            className="sr-only"
                                            checked={formData.is_highlight === 0}
                                            onChange={() => setFormData(prev => ({ ...prev, is_highlight: 0 }))}
                                        />
                                        <div className={`w-5 h-5 border-2 rounded-full border-gray-300 flex items-center justify-center transition-all group-hover:border-blue-400 ${formData.is_highlight === 0 ? 'border-blue-600 bg-blue-600' : ''}`}>
                                            {formData.is_highlight === 0 && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                    </div>
                                    <span className="ml-2 text-sm text-gray-700 font-medium">Standard</span>
                                </label>
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
                                placeholder="Tell us about the artist..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400 transition-all font-medium"
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
                                disabled={isLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                            >
                                {isLoading ? "Creating..." : "Add Artist"}
                            </button>
                        </div>
                    </form>
                </div>
            </MainLayout>
        </>
    );
}
