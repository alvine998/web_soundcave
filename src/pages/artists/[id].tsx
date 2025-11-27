import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function ArtistDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [artistData, setArtistData] = useState({
    name: '',
    genre: '',
    country: '',
    email: '',
    phone: '',
    website: '',
    bio: '',
    followers: 0,
    songs: 0,
    albums: 0,
    monthlyListeners: 0,
    verified: false,
    joinDate: '',
    socialMedia: {
      instagram: '',
      twitter: '',
      facebook: '',
      spotify: '',
    },
  });

  // Load artist data
  useEffect(() => {
    if (id) {
      // Simulasi load data - ganti dengan API call yang sebenarnya
      setArtistData({
        name: 'The Waves',
        genre: 'Pop',
        country: 'USA',
        email: 'thewaves@email.com',
        phone: '+1 234 567 8900',
        website: 'https://thewaves.com',
        bio: 'The Waves is a pop band known for their beach-inspired melodies and summer anthems. Formed in California, they have been making waves in the music industry since 2020. With their unique blend of pop and surf rock, they have captured the hearts of millions worldwide.',
        followers: 125000,
        songs: 45,
        albums: 5,
        monthlyListeners: 89000,
        verified: true,
        joinDate: '2020-03-15',
        socialMedia: {
          instagram: '@thewaves',
          twitter: '@thewavesmusic',
          facebook: 'facebook.com/thewaves',
          spotify: 'spotify.com/artist/thewaves',
        },
      });
    }
  }, [id]);

  const weeklyListeners = [
    { day: 'Mon', listeners: 12000 },
    { day: 'Tue', listeners: 13500 },
    { day: 'Wed', listeners: 14800 },
    { day: 'Thu', listeners: 13400 },
    { day: 'Fri', listeners: 16200 },
    { day: 'Sat', listeners: 18500 },
    { day: 'Sun', listeners: 17600 },
  ];

  const topSongs = [
    { title: 'Summer Vibes', plays: 12500, likes: 2340 },
    { title: 'Ocean Breeze', plays: 11200, likes: 2150 },
    { title: 'Beach Paradise', plays: 9800, likes: 1890 },
    { title: 'Sunset Dreams', plays: 8900, likes: 1720 },
    { title: 'Coastal Love', plays: 8100, likes: 1580 },
  ];

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this artist?')) {
      // Implement delete logic
      router.push('/artists');
    }
  };

  return (
    <>
      <Head>
        <title>{artistData.name} - SoundCave</title>
        <meta name="description" content={artistData.bio} />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Header with Actions */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Artists
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push(`/artists/edit/${id}`)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Artist Profile Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Cover Image */}
                <div className="h-48 bg-linear-to-br from-blue-400 to-purple-600 relative">
                  {artistData.verified && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-2">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
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
                  <div className="flex items-start space-x-6 mb-6">
                    {/* Profile Image */}
                    <div className="w-28 h-28 bg-blue-100 rounded-full flex items-center justify-center shrink-0 border-4 border-white">
                      <span className="text-5xl">🎤</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 mt-4">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {artistData.name}
                      </h1>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          {artistData.genre}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {artistData.country}
                        </span>
                        <span>Joined {artistData.joinDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4 py-4 border-t border-b border-gray-100">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{artistData.songs}</p>
                      <p className="text-xs text-gray-600">Songs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{artistData.albums}</p>
                      <p className="text-xs text-gray-600">Albums</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {(artistData.followers / 1000).toFixed(0)}K
                      </p>
                      <p className="text-xs text-gray-600">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {(artistData.monthlyListeners / 1000).toFixed(0)}K
                      </p>
                      <p className="text-xs text-gray-600">Monthly</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Listeners Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Listeners</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyListeners}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="listeners"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Listeners"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Top Songs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Songs</h3>
                <div className="space-y-4">
                  {topSongs.map((song, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-bold text-gray-400 w-8 text-center">
                          #{index + 1}
                        </span>
                        <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-xl">🎵</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{song.title}</p>
                          <p className="text-xs text-gray-600">
                            {song.plays.toLocaleString()} plays • {song.likes.toLocaleString()} likes
                          </p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Biography */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Biography</h3>
                <p className="text-gray-700 leading-relaxed">{artistData.bio}</p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <a
                      href={`mailto:${artistData.email}`}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {artistData.email}
                    </a>
                  </div>
                  {artistData.phone && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <a
                        href={`tel:${artistData.phone}`}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {artistData.phone}
                      </a>
                    </div>
                  )}
                  {artistData.website && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Website</p>
                      <a
                        href={artistData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {artistData.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
                <div className="space-y-2">
                  {artistData.socialMedia.instagram && (
                    <a
                      href={`https://instagram.com/${artistData.socialMedia.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-2xl">📷</span>
                      <span className="text-sm text-gray-700">{artistData.socialMedia.instagram}</span>
                    </a>
                  )}
                  {artistData.socialMedia.twitter && (
                    <a
                      href={`https://twitter.com/${artistData.socialMedia.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-2xl">🐦</span>
                      <span className="text-sm text-gray-700">{artistData.socialMedia.twitter}</span>
                    </a>
                  )}
                  {artistData.socialMedia.facebook && (
                    <a
                      href={`https://${artistData.socialMedia.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-2xl">📘</span>
                      <span className="text-sm text-gray-700 truncate">Facebook</span>
                    </a>
                  )}
                  {artistData.socialMedia.spotify && (
                    <a
                      href={`https://${artistData.socialMedia.spotify}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-2xl">🎵</span>
                      <span className="text-sm text-gray-700 truncate">Spotify</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    View All Songs
                  </button>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    View Albums
                  </button>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Add New Song
                  </button>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

