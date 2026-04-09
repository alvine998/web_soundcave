import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getAuthToken } from "@/utils/auth";

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [userName, setUserName] = useState("");
    const [userRole, setUserRole] = useState("");

    useEffect(() => {
        const token = getAuthToken();
        if (!token) {
            router.push("/");
            return;
        }

        // Load user info from localStorage
        if (typeof window !== "undefined") {
            const storedUser = localStorage.getItem("soundcave_user");
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    setUserName(user?.full_name || user?.name || "User");
                    setUserRole(user?.role || "");
                } catch {
                    setUserName("User");
                }
            }
        }
    }, [router]);

    const menuItems = [
        { name: "Dashboard", path: "/main/dashboard", icon: "📊" },
        ...(userRole === "label" ? [{ name: "Artists", path: "/main/artist", icon: "🎤" }] : []),
        { name: "Albums", path: "/main/album", icon: "💿" },
        { name: "Songs", path: "/main/song", icon: "🎵" },
        // { name: "Music Videos", path: "/main/music-video", icon: "🎬" },
        { name: "Notifications", path: "/main/notification", icon: "🔔" },
        { name: "Profile", path: "/main/profile", icon: "👤" },
    ];

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.clear();
            sessionStorage.clear();
        }
        router.push("/");
    };

    const roleLabel =
        userRole === "independent"
            ? "Independent Artist"
            : userRole === "label"
                ? "Label"
                : "User";

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30 ${isSidebarOpen ? "w-64" : "w-20"
                    }`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
                    {isSidebarOpen ? (
                        <img
                            src="/images/soundcave_logo.png"
                            alt="SoundCave"
                            className="h-12 w-auto"
                        />
                    ) : (
                        <img
                            src="/images/short_logo.png"
                            alt="SoundCave"
                            className="h-12 w-12 object-contain"
                        />
                    )}
                </div>

                {/* Role Badge */}
                {isSidebarOpen && (
                    <div className="px-6 py-3 border-b border-gray-100">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${userRole === "independent"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                            }`}>
                            {roleLabel}
                        </span>
                    </div>
                )}

                {/* Menu Items */}
                <nav className="py-4">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${router.pathname === item.path
                                ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                                : "text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {isSidebarOpen && (
                                <span className="ml-3 font-medium">{item.name}</span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Logout at bottom */}
                {isSidebarOpen && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
                {/* Topbar */}
                <header
                    className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 z-20"
                    style={{
                        width: isSidebarOpen ? "calc(100% - 16rem)" : "calc(100% - 5rem)",
                    }}
                >
                    <div className="h-full px-6 flex items-center justify-between">
                        {/* Left Side */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center space-x-4">
                            {/* Notification Bell */}
                            <button
                                onClick={() => router.push("/main/notification")}
                                className="relative text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${userRole === "independent" ? "bg-blue-600" : "bg-purple-600"
                                        }`}>
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {userName}
                                    </span>
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                                        <button
                                            onClick={() => { setUserMenuOpen(false); router.push("/main/profile"); }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Profile
                                        </button>
                                        <hr className="my-2 border-gray-200" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="pt-16 min-h-screen">{children}</main>
            </div>
        </div>
    );
}
