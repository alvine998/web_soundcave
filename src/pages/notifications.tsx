import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  date: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'New Artist Registered',
      message: 'John Doe just created an artist account and uploaded their first album',
      time: '2 min ago',
      date: '2024-01-15',
      isRead: false,
      type: 'info',
    },
    {
      id: 2,
      title: 'Album Uploaded',
      message: 'Premium album "Summer Vibes" has been uploaded with 12 tracks',
      time: '15 min ago',
      date: '2024-01-15',
      isRead: false,
      type: 'success',
    },
    {
      id: 3,
      title: 'Payment Received',
      message: 'User subscription payment of Rp 150.000 received for Premium plan',
      time: '1 hour ago',
      date: '2024-01-15',
      isRead: true,
      type: 'success',
    },
    {
      id: 4,
      title: 'Report Generated',
      message: 'Monthly analytics report is ready to view and download',
      time: '2 hours ago',
      date: '2024-01-15',
      isRead: true,
      type: 'info',
    },
    {
      id: 5,
      title: 'System Update',
      message: 'Platform maintenance scheduled for tonight at 11 PM',
      time: '3 hours ago',
      date: '2024-01-15',
      isRead: true,
      type: 'warning',
    },
    {
      id: 6,
      title: 'New Playlist Created',
      message: 'User created "Chill Vibes" playlist with 25 songs',
      time: '5 hours ago',
      date: '2024-01-15',
      isRead: true,
      type: 'info',
    },
    {
      id: 7,
      title: 'Music Video Uploaded',
      message: 'Artist "The Weeknd" uploaded new music video "Blinding Lights"',
      time: '8 hours ago',
      date: '2024-01-14',
      isRead: true,
      type: 'success',
    },
    {
      id: 8,
      title: 'User Report Submitted',
      message: 'User reported inappropriate content in comments section',
      time: '10 hours ago',
      date: '2024-01-14',
      isRead: true,
      type: 'warning',
    },
    {
      id: 9,
      title: 'Genre Added',
      message: 'New genre "Lo-fi Hip Hop" has been added to the platform',
      time: '1 day ago',
      date: '2024-01-14',
      isRead: true,
      type: 'info',
    },
    {
      id: 10,
      title: 'Subscription Expired',
      message: '5 users subscriptions expired today. Send renewal reminders.',
      time: '1 day ago',
      date: '2024-01-14',
      isRead: true,
      type: 'warning',
    },
    {
      id: 11,
      title: 'Album Approved',
      message: 'Album "Midnight Dreams" by Sarah Smith has been approved',
      time: '2 days ago',
      date: '2024-01-13',
      isRead: true,
      type: 'success',
    },
    {
      id: 12,
      title: 'Server Maintenance Complete',
      message: 'Scheduled maintenance completed successfully. All systems operational.',
      time: '2 days ago',
      date: '2024-01-13',
      isRead: true,
      type: 'info',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || notification.type === filterType;

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'read' && notification.isRead) ||
      (filterStatus === 'unread' && !notification.isRead);

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <>
      <Head>
        <title>Notifications - SoundCave</title>
        <meta name="description" content="View all notifications" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">
              Kelola dan lihat semua notifikasi sistem Anda
            </p>
          </div>


          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Cari notifikasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-3">
                {/* Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="all">All Types</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>

                {/* Mark All as Read */}
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    Mark All as Read
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {filteredNotifications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                          notification.type === 'success'
                            ? 'bg-green-100 text-green-600'
                            : notification.type === 'warning'
                            ? 'bg-yellow-100 text-yellow-600'
                            : notification.type === 'error'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {notification.type === 'success' ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : notification.type === 'warning' ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : notification.type === 'error' ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-base font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-medium">
                                New
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{notification.message}</p>

                        {/* Actions */}
                        <div className="flex items-center space-x-3">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                              Mark as Read
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <span className="text-6xl mb-4 block">📭</span>
                <p className="text-gray-600 mb-2">No notifications found</p>
                <p className="text-sm text-gray-500">
                  Try adjusting your filters or search query
                </p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}

