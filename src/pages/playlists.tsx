import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';

export default function Playlists() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const playlists = [
    {
      id: 1,
      name: 'Chill Vibes',
      description: 'Relax and unwind with these mellow tunes',
      songs: 45,
      duration: '3h 24m',
      followers: 1250,
      creator: 'Admin',
      isPublic: true,
      lastUpdated: '2 days ago',
      color: 'from-blue-400 to-blue-600',
    },
    {
      id: 2,
      name: 'Workout Beats',
      description: 'High energy music to power your workout',
      songs: 38,
      duration: '2h 45m',
      followers: 2100,
      creator: 'Admin',
      isPublic: true,
      lastUpdated: '1 week ago',
      color: 'from-red-400 to-red-600',
    },
    {
      id: 3,
      name: 'Focus & Study',
      description: 'Instrumental tracks for concentration',
      songs: 52,
      duration: '4h 10m',
      followers: 3400,
      creator: 'Admin',
      isPublic: true,
      lastUpdated: '3 days ago',
      color: 'from-green-400 to-green-600',
    },
    {
      id: 4,
      name: 'Party Mix',
      description: 'Get the party started with these bangers',
      songs: 60,
      duration: '4h 30m',
      followers: 1800,
      creator: 'DJ Mike',
      isPublic: true,
      lastUpdated: '1 day ago',
      color: 'from-purple-400 to-purple-600',
    },
    {
      id: 5,
      name: 'Sleep Sounds',
      description: 'Peaceful sounds for a good night rest',
      songs: 25,
      duration: '2h 15m',
      followers: 950,
      creator: 'Admin',
      isPublic: false,
      lastUpdated: '5 days ago',
      color: 'from-indigo-400 to-indigo-600',
    },
    {
      id: 6,
      name: 'Road Trip',
      description: 'Perfect tunes for your next adventure',
      songs: 72,
      duration: '5h 20m',
      followers: 2800,
      creator: 'Travel Tunes',
      isPublic: true,
      lastUpdated: '1 week ago',
      color: 'from-yellow-400 to-yellow-600',
    },
  ];

  const stats = [
    { title: 'Total Playlists', value: '342', icon: '📝', change: '+12' },
    { title: 'Total Songs', value: '15,234', icon: '🎵', change: '+145' },
    { title: 'Total Followers', value: '45,678', icon: '❤️', change: '+1,234' },
    { title: 'Avg Duration', value: '3h 45m', icon: '⏱️', change: '+15m' },
  ];

  return (
    <>
      <Head>
        <title>Playlists - SoundCave</title>
        <meta name="description" content="Playlists SoundCave" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Playlists</h1>
              <p className="text-gray-600">Kelola dan jelajahi semua playlist</p>
            </div>
            <button className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              + Create Playlist
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{stat.icon}</span>
                  <span className="text-xs text-green-600 font-medium">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Filters and View Toggle */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Input
                    type="text"
                    placeholder="Cari playlist..."
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
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900">
                  <option>All Playlists</option>
                  <option>Public</option>
                  <option>Private</option>
                  <option>Collaborative</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Playlists Grid/List View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Playlist Cover */}
                  <div className={`h-40 bg-linear-to-br ${playlist.color} flex items-center justify-center`}>
                    <span className="text-6xl">🎵</span>
                  </div>

                  {/* Playlist Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {playlist.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {playlist.description}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ml-2 ${
                          playlist.isPublic
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {playlist.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>{playlist.songs} songs</span>
                      <span>{playlist.duration}</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          ❤️ {playlist.followers.toLocaleString()}
                        </span>
                        <span className="text-xs">{playlist.lastUpdated}</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Playlist
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Songs
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Followers
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {playlists.map((playlist) => (
                      <tr key={playlist.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 bg-linear-to-br ${playlist.color} rounded flex items-center justify-center shrink-0`}>
                              <span className="text-xl">🎵</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {playlist.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                by {playlist.creator}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-900">
                          {playlist.songs}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {playlist.duration}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-900">
                          {playlist.followers.toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              playlist.isPublic
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {playlist.isPublic ? 'Public' : 'Private'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                              View
                            </button>
                            <button className="text-gray-600 hover:text-gray-700 text-sm">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-700 text-sm">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}

