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
    });
    const [userRole, setUserRole] = useState("");

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
                        });
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
                        });
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

                // Update localStorage
                if (typeof window !== "undefined") {
                    const storedUser = localStorage.getItem("soundcave_user");
                    if (storedUser) {
                        const user = JSON.parse(storedUser);
                        const updated = { ...user, ...formData };
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

    const isArtist = userRole === "artist";
    const roleLabel = isArtist ? "Independent Artist" : userRole === "label" ? "Label" : "User";

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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            {isArtist ? "Artist Name" : "Label Name"} <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            id="name"
                                            name="name"
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
