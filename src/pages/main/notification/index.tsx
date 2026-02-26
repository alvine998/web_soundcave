import { useState, useEffect } from "react";
import Head from "next/head";
import MainLayout from "@/components/MainLayout";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

export default function MainNotification() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getAuthHeaders = () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("soundcave_token") : null;
        return { headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" } };
    };

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${CONFIG.API_URL}/api/notifications`, {
                params: { page: 1, limit: 50 },
                ...getAuthHeaders(),
            });

            if (response.data?.success) {
                const items = response.data.data || [];
                setNotifications(items.map((item: any) => ({
                    id: item.id,
                    title: item.title || "Notification",
                    message: item.message || item.body || "",
                    type: item.type || "info",
                    is_read: item.is_read || false,
                    created_at: item.created_at ? item.created_at.split("T")[0] : "-",
                })));
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to load notifications.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchNotifications(); }, []);

    const markAsRead = async (id: number) => {
        try {
            await axios.put(`${CONFIG.API_URL}/api/notifications/${id}/read`, {}, getAuthHeaders());
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
        } catch {
            // silently fail
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "success": return "✅";
            case "warning": return "⚠️";
            case "error": return "❌";
            default: return "ℹ️";
        }
    };

    const getTypeBg = (type: string) => {
        switch (type) {
            case "success": return "bg-green-100 text-green-600";
            case "warning": return "bg-yellow-100 text-yellow-600";
            case "error": return "bg-red-100 text-red-600";
            default: return "bg-blue-100 text-blue-600";
        }
    };

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <>
            <Head>
                <title>Notifications - SoundCave</title>
                <meta name="description" content="Your notifications" />
            </Head>

            <MainLayout>
                <div className="p-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
                        <p className="text-gray-600">
                            {unreadCount > 0
                                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                                : "You're all caught up!"}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="mt-4 text-gray-600">Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="text-6xl mb-4 block">🔔</span>
                                <p className="text-gray-600">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => !notification.is_read && markAsRead(notification.id)}
                                        className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.is_read ? "bg-blue-50/50" : ""
                                            }`}
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getTypeBg(notification.type)}`}>
                                                <span>{getTypeIcon(notification.type)}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-1">
                                                    <p className={`text-sm ${!notification.is_read ? "font-semibold" : "font-medium"} text-gray-900`}>
                                                        {notification.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 ml-4 shrink-0">
                                                        <span className="text-xs text-gray-400">{notification.created_at}</span>
                                                        {!notification.is_read && (
                                                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600">{notification.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </MainLayout>
        </>
    );
}
