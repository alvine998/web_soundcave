import { useState, useEffect } from "react";
import Head from "next/head";
import MainLayout from "@/components/MainLayout";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";

export default function MainProfile() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        bio: "",
        website: "",
        country: "",
        genre: "",
        photo: "",
        cover_image: "",
    });
    const [userRole, setUserRole] = useState("");

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
    const [currentCover, setCurrentCover] = useState<string | null>(null);

    const getAuthHeaders = () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("soundcave_token") : null;
        return { headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" } };
    };

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setIsLoading(true);

                // Load from localStorage first
                if (typeof window !== "undefined") {
                    const storedUser = localStorage.getItem("soundcave_user");
                    if (storedUser) {
                        const user = JSON.parse(storedUser);
                        setUserRole(user?.role || "");
                        setFormData({
                            full_name: user?.full_name || "",
                            email: user?.email || "",
                            phone: user?.phone || "",
                            bio: user?.bio || "",
                            website: user?.website || "",
                            country: user?.country || "",
                            genre: user?.genre || "",
                            photo: user?.photo || "",
                            cover_image: user?.cover_image || "",
                        });

                        if (user?.photo) {
                            const fullUrl = user.photo.startsWith('http') ? user.photo : `${CONFIG.API_URL}${user.photo}`;
                            setCurrentPhoto(fullUrl);
                        }
                        if (user?.cover_image) {
                            const fullUrl = user.cover_image.startsWith('http') ? user.cover_image : `${CONFIG.API_URL}${user.cover_image}`;
                            setCurrentCover(fullUrl);
                        }
                    }
                }

                // Try to fetch from API
                try {
                    const response = await axios.get(`${CONFIG.API_URL}/api/profile`, getAuthHeaders());
                    if (response.data?.success && response.data?.data) {
                        const profile = response.data.data;
                        setUserRole(profile.role || userRole);
                        setFormData({
                            full_name: profile.full_name || "",
                            email: profile.email || "",
                            phone: profile.phone || "",
                            bio: profile.bio || "",
                            website: profile.website || "",
                            country: profile.country || "",
                            genre: profile.genre || "",
                            photo: profile.photo || "",
                            cover_image: profile.cover_image || "",
                        });

                        if (profile.photo) {
                            const fullUrl = profile.photo.startsWith('http') ? profile.photo : `${CONFIG.API_URL}${profile.photo}`;
                            setCurrentPhoto(fullUrl);
                        }
                        if (profile.cover_image) {
                            const fullUrl = profile.cover_image.startsWith('http') ? profile.cover_image : `${CONFIG.API_URL}${profile.cover_image}`;
                            setCurrentCover(fullUrl);
                        }
                    }
                } catch {
                    // API might not exist yet, use localStorage data
                }
            } catch {
                // fallback
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result as string);
            reader.readAsDataURL(file);
            await uploadImage(file, 'photo');
        }
    };

    const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => setCoverPreview(reader.result as string);
            reader.readAsDataURL(file);
            await uploadImage(file, 'cover');
        }
    };

    const uploadImage = async (file: File, type: 'photo' | 'cover') => {
        const isPhoto = type === 'photo';
        if (isPhoto) {
            setIsUploadingPhoto(true);
        } else {
            setIsUploadingCover(true);
        }

        try {
            const token = localStorage.getItem("soundcave_token");
            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('folder', isPhoto ? 'artists/profile' : 'artists/cover');

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
                const imageUrl = response.data.data.file_url;
                setFormData(prev => ({ ...prev, [isPhoto ? 'photo' : 'cover_image']: imageUrl }));
                toast.success(`${isPhoto ? 'Photo' : 'Cover'} uploaded successfully`);
            } else {
                throw new Error('Failed to upload image');
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to upload image.");
            if (isPhoto) {
                setPhotoPreview(null);
            } else {
                setCoverPreview(null);
            }
        } finally {
            if (isPhoto) {
                setIsUploadingPhoto(false);
            } else {
                setIsUploadingCover(false);
            }
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const storedUser = localStorage.getItem("soundcave_user");
            if (!storedUser) {
                toast.error("User not found.");
                return;
            }
            const user = JSON.parse(storedUser);

            const response = await axios.put(
                `${CONFIG.API_URL}/api/users/${user.id}`,
                formData,
                getAuthHeaders()
            );

            if (response.data?.success) {
                toast.success("Profile updated successfully!");

                if (typeof window !== "undefined") {
                    const storedUser = localStorage.getItem("soundcave_user");
                    if (storedUser) {
                        const user = JSON.parse(storedUser);
                        const updated = {
                            ...user,
                            ...formData,
                        };
                        localStorage.setItem("soundcave_user", JSON.stringify(updated));
                    }
                }
            } else {
                toast.error(response.data?.message || "Failed to update profile.");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const isArtist = userRole === "artist" || userRole === "independent";
    const roleLabel = userRole === "artist" ? "Artist" : userRole === "independent" ? "Independent Artist" : userRole === "label" ? "Label" : "User";

    return (
        <>
            <Head>
                <title>Profile - SoundCave</title>
                <meta name="description" content="Your profile" />
            </Head>

            <MainLayout>
                <div className="p-6 max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
                        <p className="text-gray-600">Manage your account information</p>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-600">Loading profile...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Account Info */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${isArtist ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                                        }`}>
                                        {roleLabel}
                                    </span>
                                </div>

                                {isArtist && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        {/* Profile Photo */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Artist Photo</label>
                                            <div className="relative group">
                                                <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-500 transition-colors">
                                                    {(photoPreview || currentPhoto) ? (
                                                        <img src={photoPreview || currentPhoto || ""} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-gray-400 text-3xl">👤</span>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handlePhotoChange}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        disabled={isUploadingPhoto}
                                                    />
                                                </div>
                                                {isUploadingPhoto && <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>}
                                            </div>
                                            <p className="mt-2 text-xs text-gray-500">JPG or PNG, max 2MB</p>
                                        </div>

                                        {/* Cover Banner */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Banner</label>
                                            <div className="relative group">
                                                <div className="w-full h-32 rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-500 transition-colors">
                                                    {(coverPreview || currentCover) ? (
                                                        <img src={coverPreview || currentCover || ""} alt="Cover" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-gray-400 text-3xl">🖼️</span>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleCoverChange}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        disabled={isUploadingCover}
                                                    />
                                                </div>
                                                {isUploadingCover && <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>}
                                            </div>
                                            <p className="mt-2 text-xs text-gray-500">Wide banner, max 5MB</p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            {isArtist ? "Artist Name" : "Label Name"} <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            id="name"
                                            name="full_name"
                                            type="text"
                                            required
                                            value={formData.full_name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone
                                        </label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+62 812 3456 7890"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                            Bio
                                        </label>
                                        <Input
                                            id="bio"
                                            name="bio"
                                            type="text"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            placeholder="Write your bio..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>

                                <div className="space-y-4">
                                    {isArtist && (
                                        <div>
                                            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                                                Genre
                                            </label>
                                            <Input
                                                id="genre"
                                                name="genre"
                                                type="text"
                                                value={formData.genre}
                                                onChange={handleChange}
                                                placeholder="e.g. Pop, Rock, Hip Hop"
                                            />
                                        </div>
                                    )}

                                    {!isArtist && (
                                        <div>
                                            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                                                Website
                                            </label>
                                            <Input
                                                id="website"
                                                name="website"
                                                type="url"
                                                value={formData.website}
                                                onChange={handleChange}
                                                placeholder="https://yourlabel.com"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                                            {isArtist ? "Bio" : "Description"}
                                        </label>
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            rows={4}
                                            value={formData.bio}
                                            onChange={handleChange}
                                            placeholder={isArtist ? "Tell us about yourself..." : "Tell us about your label..."}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400 transition-all"
                                        />
                                    </div>
                                </div>
                            </div> */}

                            {/* Save Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </MainLayout>
        </>
    );
}
