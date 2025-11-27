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

export default function MusicDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [isPlaying, setIsPlaying] = useState(false);

  const [musicData, setMusicData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    duration: '',
    releaseDate: '',
    uploadDate: '',
    plays: 0,
    likes: 0,
    downloads: 0,
    description: '',
    lyrics: '',
    status: 'active',
  });

  // Load music data
  useEffect(() => {
    if (id) {
      // Simulasi load data - ganti dengan API call yang sebenarnya
      setMusicData({
        title: 'Summer Vibes',
        artist: 'The Waves',
        album: 'Beach Season',
        genre: 'Pop',
        duration: '3:45',
        releaseDate: '2024-01-15',
        uploadDate: '2024-01-15 10:30 AM',
        plays: 12500,
        likes: 2340,
        downloads: 890,
        description: 'A refreshing summer anthem that brings beach vibes to your ears. Perfect for those sunny days and road trips along the coast.',
        lyrics: 'Verse 1:\nSummer days and endless nights\nBeach waves and city lights\nFeel the rhythm in the air\nLet go of all your care\n\nChorus:\nFeel the summer vibes\nDancing under starry skies\nLet the music take you higher\nSet your soul on fire\n\nVerse 2:\nSandy toes and ocean breeze\nSwaying palms and memories\nEvery moment feels so right\nUnderneath the moonlight',
        status: 'active',
      });
    }
  }, [id]);

  const weeklyPlays = [
    { day: 'Mon', plays: 1200 },
    { day: 'Tue', plays: 1450 },
    { day: 'Wed', plays: 1680 },
    { day: 'Thu', plays: 1340 },
    { day: 'Fri', plays: 2100 },
    { day: 'Sat', plays: 2450 },
    { day: 'Sun', plays: 2280 },
  ];

  const recentActivity = [
    { user: 'john_doe', action: 'Added to playlist', time: '5 mins ago' },
    { user: 'sarah_w', action: 'Downloaded', time: '12 mins ago' },
    { user: 'mike_j', action: 'Liked', time: '1 hour ago' },
    { user: 'emma_r', action: 'Shared', time: '2 hours ago' },
    { user: 'david_b', action: 'Added to favorites', time: '3 hours ago' },
  ];

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this song?')) {
      // Implement delete logic
      router.push('/music');
    }
  };

  return (
    <>
      <Head>
        <title>{musicData.title} - SoundCave</title>
        <meta name="description" content={musicData.description} />
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
              Back to Music
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push(`/music/edit/${id}`)}
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
              {/* Music Player Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start space-x-6">
                  {/* Cover Image */}
                  <div className="w-48 h-48 bg-linear-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-8xl">🎵</span>
                  </div>

                  {/* Music Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                          {musicData.title}
                        </h1>
                        <p className="text-lg text-gray-600 mb-1">{musicData.artist}</p>
                        <p className="text-sm text-gray-500">{musicData.album}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          musicData.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {musicData.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Genre</p>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          {musicData.genre}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Duration</p>
                        <p className="text-sm font-medium text-gray-900">{musicData.duration}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Release Date</p>
                        <p className="text-sm font-medium text-gray-900">{musicData.releaseDate}</p>
                      </div>
                    </div>

                    {/* Player Controls */}
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                      >
                        {isPlaying ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>1:18</span>
                          <span>{musicData.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">▶️</span>
                    <span className="text-xs text-green-600 font-medium">+12%</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{musicData.plays.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Plays</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">❤️</span>
                    <span className="text-xs text-green-600 font-medium">+8%</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{musicData.likes.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Likes</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">⬇️</span>
                    <span className="text-xs text-green-600 font-medium">+5%</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{musicData.downloads.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Downloads</p>
                </div>
              </div>

              {/* Weekly Plays Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyPlays}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Bar dataKey="plays" fill="#3B82F6" name="Plays" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{musicData.description}</p>
              </div>

              {/* Lyrics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Lyrics</h3>
                <pre className="text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                  {musicData.lyrics}
                </pre>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Upload Date</span>
                    <span className="font-medium text-gray-900">{musicData.uploadDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">File ID</span>
                    <span className="font-medium text-gray-900">#{id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Format</span>
                    <span className="font-medium text-gray-900">MP3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quality</span>
                    <span className="font-medium text-gray-900">320kbps</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Size</span>
                    <span className="font-medium text-gray-900">8.5 MB</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-blue-600">
                          {activity.user.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.user}
                        </p>
                        <p className="text-xs text-gray-600">{activity.action}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Download Audio
                  </button>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Share
                  </button>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Add to Playlist
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

