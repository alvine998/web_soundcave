import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';

export default function Music() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const musicList = [
    {
      id: 1,
      title: 'Summer Vibes',
      artist: 'The Waves',
      album: 'Beach Season',
      genre: 'Pop',
      duration: '3:45',
      plays: 12500,
      uploadDate: '2024-01-15',
      status: 'active',
    },
    {
      id: 2,
      title: 'Midnight Dreams',
      artist: 'Luna Echo',
      album: 'Night Tales',
      genre: 'Electronic',
      duration: '4:12',
      plays: 11200,
      uploadDate: '2024-01-12',
      status: 'active',
    },
    {
      id: 3,
      title: 'Ocean Waves',
      artist: 'Nature Sounds',
      album: 'Calm Collection',
      genre: 'Ambient',
      duration: '3:28',
      plays: 9800,
      uploadDate: '2024-01-10',
      status: 'active',
    },
    {
      id: 4,
      title: 'City Lights',
      artist: 'Urban Beats',
      album: 'Street Life',
      genre: 'Hip Hop',
      duration: '3:55',
      plays: 8900,
      uploadDate: '2024-01-08',
      status: 'active',
    },
    {
      id: 5,
      title: 'Moonlight Sonata',
      artist: 'Classical Masters',
      album: 'Timeless Classics',
      genre: 'Classical',
      duration: '4:01',
      plays: 8100,
      uploadDate: '2024-01-05',
      status: 'active',
    },
    {
      id: 6,
      title: 'Rock Anthem',
      artist: 'Thunder Strike',
      album: 'Power Chords',
      genre: 'Rock',
      duration: '4:30',
      plays: 7500,
      uploadDate: '2024-01-03',
      status: 'inactive',
    },
  ];

  const genres = ['All', 'Pop', 'Rock', 'Electronic', 'Hip Hop', 'Classical', 'Ambient'];

  const stats = [
    { title: 'Total Songs', value: '1,234', icon: '🎵' },
    { title: 'Total Artists', value: '456', icon: '🎤' },
    { title: 'Total Albums', value: '789', icon: '💿' },
    { title: 'Total Duration', value: '2,345h', icon: '⏱️' },
  ];

  return (
    <>
      <Head>
        <title>Music - SoundCave</title>
        <meta name="description" content="Music Library SoundCave" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Music Library</h1>
            <p className="text-gray-600">Kelola semua musik dalam platform Anda</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">{stat.icon}</span>
                  <div>
                    <h3 className="text-gray-600 text-sm font-medium">
                      {stat.title}
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left Side - Filters */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Input
                    type="text"
                    placeholder="Cari judul, artist, atau album..."
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

                {/* Genre Filter */}
                <select
                  value={filterGenre}
                  onChange={(e) => setFilterGenre(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  {genres.map((genre) => (
                    <option key={genre} value={genre.toLowerCase()}>
                      {genre}
                    </option>
                  ))}
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="newest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                  <option value="most-played">Paling Banyak Diputar</option>
                  <option value="title">Judul (A-Z)</option>
                </select>
              </div>

              {/* Right Side - Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={() => router.push('/music/create')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  + Upload Music
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Music Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Song
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Album
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Genre
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Plays
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
                  {musicList.map((music) => (
                    <tr key={music.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center shrink-0">
                            <span className="text-xl">🎵</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {music.title}
                            </p>
                            <p className="text-xs text-gray-500">{music.uploadDate}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {music.artist}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {music.album}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          {music.genre}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {music.duration}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                        {music.plays.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            music.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {music.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => router.push(`/music/${music.id}`)}
                            className="text-blue-600 hover:text-blue-700"
                            title="View Details"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => router.push(`/music/edit/${music.id}`)}
                            className="text-gray-600 hover:text-gray-700"
                            title="Edit"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this song?')) {
                                // Implement delete logic
                              }
                            }}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">1</span> to{' '}
                <span className="font-medium">6</span> of{' '}
                <span className="font-medium">1,234</span> results
              </p>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                  2
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                  3
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

