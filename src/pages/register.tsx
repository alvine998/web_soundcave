import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";

type RegisterType = "independent" | "label";

export default function Register() {
    const router = useRouter();
    const { type } = router.query;

    const [registerType, setRegisterType] = useState<RegisterType>("independent");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
    });

    useEffect(() => {
        if (type === "independent" || type === "label") {
            setRegisterType(type);
        }
    }, [type]);

    // Redirect if already logged in
    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("soundcave_token");
            if (token) {
                router.push("/dashboard");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Validate password match
        if (formData.password !== formData.confirmPassword) {
            setError("Password and confirm password do not match.");
            toast.error("Password and confirm password do not match.");
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            toast.error("Password must be at least 6 characters.");
            setIsLoading(false);
            return;
        }

        try {
            const payload: Record<string, any> = {
                full_name: formData.full_name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone || undefined,
                role: registerType,
            };

            const response = await axios.post(
                CONFIG.API_URL + "/api/auth/register",
                payload
            );

            if (response.data?.success) {
                toast.success(
                    response.data.message || "Registration successful! Please login."
                );
                router.push("/");
            } else {
                const message =
                    response.data?.message || "Registration failed. Please try again.";
                setError(message);
                toast.error(message);
            }
        } catch (err: any) {
            const apiMessage =
                err?.response?.data?.message ||
                err?.response?.data?.error?.message ||
                "An error occurred during registration. Please try again.";
            setError(apiMessage);
            toast.error(apiMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const isArtist = registerType === "independent";

    return (
        <>
            <Head>
                <title>{`Register as ${isArtist ? "Independent Artist" : "Label"} - SoundCave`}</title>
                <meta
                    name="description"
                    content={`Register as ${isArtist ? "independent artist" : "label"} on SoundCave`}
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-white px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-lg w-full">
                    {/* Logo/Brand Section */}
                    <div className="text-center mb-6 flex flex-col items-center">
                        <Image
                            src="/images/soundcave_logo.png"
                            alt="SoundCave"
                            width={200}
                            height={200}
                        />
                    </div>

                    {/* Type Switcher */}
                    <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6 bg-white shadow-sm">
                        <button
                            type="button"
                            onClick={() => {
                                setRegisterType("independent");
                                router.replace("/register?type=artist", undefined, {
                                    shallow: true,
                                });
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${isArtist
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <span>🎤</span> Independent Artist
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setRegisterType("label");
                                router.replace("/register?type=label", undefined, {
                                    shallow: true,
                                });
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${!isArtist
                                ? "bg-purple-600 text-white"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <span>🏢</span> Label
                        </button>
                    </div>

                    {/* Register Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-1 text-center">
                            {isArtist ? "Register as Independent Artist" : "Register as Label"}
                        </h2>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            {isArtist
                                ? "Create an account to manage your music on SoundCave"
                                : "Register your label to distribute music on SoundCave"}
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    {isArtist ? "Artist Name" : "Label Name"}{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="name"
                                    name="full_name"
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder={isArtist ? "Your artist name" : "Your label name"}
                                />
                            </div>

                            {/* Company Name (Label only) */}
                            {!isArtist && (
                                <div>
                                    <label
                                        htmlFor="companyName"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Company Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="companyName"
                                        name="full_name"
                                        type="text"
                                        required
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="Company / business entity name"
                                    />
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="nama@email.com"
                                />
                            </div>

                            {/* Password */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Min. 6 characters"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Confirm Password <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Repeat password"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label
                                    htmlFor="phone"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Phone Number
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

                            {/* Country */}
                            {/* <div>
                                <label
                                    htmlFor="country"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Country <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="country"
                                    name="country"
                                    type="text"
                                    required
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="e.g. Indonesia, USA, UK"
                                />
                            </div> */}

                            {/* Artist-specific fields */}
                            {/* {isArtist && (
                                <>
                                    <div>
                                        <label
                                            htmlFor="genre"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Genre <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            id="genre"
                                            name="genre"
                                            type="text"
                                            required
                                            value={formData.genre}
                                            onChange={handleChange}
                                            placeholder="e.g. Pop, Rock, Hip Hop"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="bio"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Bio
                                        </label>
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            rows={3}
                                            value={formData.bio}
                                            onChange={handleChange}
                                            placeholder="Tell us about yourself as an artist..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400 transition-all"
                                        />
                                    </div>
                                </>
                            )} */}

                            {/* Label-specific fields */}
                            {/* {!isArtist && (
                                <>
                                    <div>
                                        <label
                                            htmlFor="website"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
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

                                    <div>
                                        <label
                                            htmlFor="description"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows={3}
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Tell us about your label..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400 transition-all"
                                        />
                                    </div>
                                </>
                            )} */}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white ${isArtist
                                    ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                                    : "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
                                    }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    `Register as ${isArtist ? "Artist" : "Label"}`
                                )}
                            </button>
                        </form>

                        {/* Back to Login */}
                        <p className="mt-5 text-center text-sm text-gray-600">
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={() => router.push("/")}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Login here
                            </button>
                        </p>
                    </div>

                    {/* Footer */}
                    <p className="mt-8 text-center text-xs text-gray-500">
                        &copy; 2025 SoundCave. All rights reserved.
                    </p>
                </div>
            </div>
        </>
    );
}
