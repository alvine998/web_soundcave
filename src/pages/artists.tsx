import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';

export default function Artists() {
  const router = useRouter();
  const [filterGenre, setFilterGenre] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const artists = [
    {
      id: 1,
      name: 'The Waves',
      genre: 'Pop',
      followers: 125000,
      songs: 45,
      albums: 5,
      monthlyListeners: 89000,
      verified: true,
      country: 'USA',
    },
    {
      id: 2,
      name: 'Luna Echo',
      genre: 'Electronic',
      followers: 98000,
      songs: 38,
      albums: 4,
      monthlyListeners: 72000,
      verified: true,
      country: 'UK',
    },
    {
      id: 3,
      name: 'Nature Sounds',
      genre: 'Ambient',
      followers: 67000,
      songs: 52,
      albums: 6,
      monthlyListeners: 45000,
      verified: false,
      country: 'Japan',
    },
    {
      id: 4,
      name: 'Urban Beats',
      genre: 'Hip Hop',
      followers: 210000,
      songs: 72,
      albums: 8,
      monthlyListeners: 156000,
      verified: true,
      country: 'USA',
    },
    {
      id: 5,
      name: 'Classical Masters',
      genre: 'Classical',
      followers: 45000,
      songs: 120,
      albums: 12,
      monthlyListeners: 32000,
      verified: true,
      country: 'Austria',
    },
    {
      id: 6,
      name: 'Thunder Strike',
      genre: 'Rock',
      followers: 178000,
      songs: 65,
      albums: 7,
      monthlyListeners: 125000,
      verified: true,
      country: 'UK',
    },
  ];

  const stats = [
    { title: 'Total Artists', value: '1,456', icon: '🎤', change: '+23' },
    { title: 'Verified Artists', value: '567', icon: '✓', change: '+12' },
    { title: 'Total Followers', value: '2.4M', icon: '❤️', change: '+45K' },
    { title: 'New This Month', value: '34', icon: '✨', change: '+8' },
  ];

  const genres = ['All', 'Pop', 'Rock', 'Electronic', 'Hip Hop', 'Classical', 'Ambient'];

  return (
    <>
      <Head>
        <title>Artists - SoundCave</title>
        <meta name="description" content="Artists SoundCave" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Artists</h1>
              <p className="text-gray-600">Jelajahi dan kelola semua artist</p>
            </div>
            <button 
              onClick={() => router.push('/artists/create')}
              className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Add Artist
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

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Cari artist..."
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
                <option value="popular">Most Popular</option>
                <option value="followers">Most Followers</option>
                <option value="songs">Most Songs</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Artists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Artist Cover */}
                <div className="h-48 bg-linear-to-br from-blue-400 to-purple-600 flex items-center justify-center relative">
                  <span className="text-7xl">🎤</span>
                  {artist.verified && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Artist Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
                        {artist.name}
                      </h3>
                      <p className="text-sm text-gray-600">{artist.country}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {artist.genre}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{artist.songs}</p>
                      <p className="text-xs text-gray-600">Songs</p>
                    </div>
                    <div className="text-center border-l border-r border-gray-100">
                      <p className="text-lg font-bold text-gray-900">{artist.albums}</p>
                      <p className="text-xs text-gray-600">Albums</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {(artist.followers / 1000).toFixed(0)}K
                      </p>
                      <p className="text-xs text-gray-600">Followers</p>
                    </div>
                  </div>

                  {/* Monthly Listeners */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Monthly Listeners</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {(artist.monthlyListeners / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(artist.monthlyListeners / artist.followers) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => router.push(`/artists/${artist.id}`)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View Profile
                    </button>
                    <button 
                      onClick={() => router.push(`/artists/edit/${artist.id}`)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">6</span> of{' '}
              <span className="font-medium">1,456</span> artists
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
      </Layout>
    </>
  );
}

