import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';
import { useToast } from '@/components/ui/toast';
import axios from 'axios';
import { CONFIG } from '@/config';
import Image from 'next/image';

// Dynamically import recharts to avoid SSR issues (recharts uses browser APIs)
const RechartsComponents = dynamic(
  () =>
    import('recharts').then((mod) => {
      // Return a component that renders the chart
      const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = mod;

      const WeeklyListenersChart = ({ data }: { data: { day: string; listeners: number }[] }) => (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
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
      );

      return WeeklyListenersChart;
    }),
  { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center text-gray-400">Loading chart...</div> }
);

export default function ArtistDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { error } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [artistData, setArtistData] = useState({
    name: '',
    genre: '',
    country: '',
    email: '',
    phone: '',
    website: '',
    bio: '',
    debutYear: '',
    profileImage: '',
    createdAt: '',
    followers: 0,
    songs: 0,
    albums: 0,
    monthlyListeners: 0,
    verified: false,
    socialMedia: {
      instagram: '',
      twitter: '',
      facebook: '',
      youtube: '',
    },
    photo: '',
    cover_image: '',
  });
  const [albums, setAlbums] = useState<any[]>([]);
  const [topSongs, setTopSongs] = useState<any[]>([]);

  // Helper function untuk mendapatkan token dari localStorage
  const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('soundcave_token');
    }
    return null;
  };

  // Helper function untuk mendapatkan headers dengan Authorization
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    };
  };

  // Load artist data
  useEffect(() => {
    const fetchArtist = async () => {
      if (!id || typeof id !== 'string') return;

      try {
        setIsLoading(true);
        const response = await axios.get(`${CONFIG.API_URL}/api/artists/${id}`, getAuthHeaders());

        if (response.data?.success && response.data?.data) {
          const artist = response.data.data;
          setArtistData({
            name: artist.name || '',
            genre: artist.genre || '',
            country: artist.country || '',
            email: artist.email || '',
            phone: artist.phone || '',
            website: artist.website || '',
            bio: artist.bio || '',
            debutYear: artist.debutYear || '',
            profileImage: artist.profileImage
              ? `${CONFIG.API_URL}${artist.profileImage}`
              : '',
            createdAt: artist.created_at
              ? artist.created_at.split('T')[0]
              : '',
            followers: artist.follower_count || 0,
            songs: 0, // Will be updated by fetchTopSongs
            albums: 0, // Will be updated by fetchAlbums
            monthlyListeners: artist.monthly_listeners || (artist.play_count || 0),
            verified: artist.is_verified || false,
            socialMedia: {
              instagram: artist.socialMedia?.instagram || '',
              twitter: artist.socialMedia?.twitter || '',
              facebook: artist.socialMedia?.facebook || '',
              youtube: artist.socialMedia?.youtube || '',
            },
            photo: artist.photo
              ? (artist.photo.startsWith('http') ? artist.photo : `${CONFIG.API_URL}${artist.photo}`)
              : '',
            cover_image: artist.cover_image
              ? (artist.cover_image.startsWith('http') ? artist.cover_image : `${CONFIG.API_URL}${artist.cover_image}`)
              : '',
          });
        } else {
          error(
            'Failed to Load Artist',
            response.data?.message || 'Unable to fetch artist data.'
          );
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error?.message ||
          'Terjadi kesalahan saat mengambil data artist.';
        error('Failed to Load Artist', msg);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAlbums = async () => {
      if (!id || typeof id !== 'string') return;
      try {
        const response = await axios.get(`${CONFIG.API_URL}/api/albums`, {
          params: { artist_id: id, page: 1, limit: 5 },
          ...getAuthHeaders(),
        });
        if (response.data?.success) {
          setAlbums(response.data.data || []);
          setArtistData(prev => ({
            ...prev,
            albums: response.data.pagination?.total || (response.data.data?.length || 0)
          }));
        }
      } catch (err) {
        console.error("Failed to fetch artist albums:", err);
      }
    };

    const fetchTopSongs = async () => {
      if (!id || typeof id !== 'string') return;
      try {
        const response = await axios.get(`${CONFIG.API_URL}/api/musics`, {
          params: { artist_id: id, page: 1, limit: 10 },
          ...getAuthHeaders(),
        });
        if (response.data?.success) {
          setTopSongs(response.data.data || []);
          setArtistData(prev => ({
            ...prev,
            songs: response.data.pagination?.total || (response.data.data?.length || 0)
          }));
        }
      } catch (err) {
        console.error("Failed to fetch artist songs:", err);
      }
    };

    fetchArtist();
    fetchAlbums();
    fetchTopSongs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

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
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Memuat data artist...</p>
            </div>
          ) : (
            <>
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
                    <div className="h-64 w-full relative bg-gray-100">
                      {artistData.cover_image ? (
                        <Image
                          src={artistData.cover_image}
                          alt={`${artistData.name} Cover`}
                          fill
                          className="object-cover"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-600"></div>
                      )}

                      {artistData.verified && (
                        <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-2 z-10 shadow-lg">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Artist Info */}
                    <div className="p-6">
                      <div className="flex items-start space-x-6 mb-6">
                        {/* Profile Image */}
                        <div className="w-32 h-32 rounded-full relative -mt-16 ml-2 border-4 border-white shadow-md overflow-hidden bg-blue-50 flex items-center justify-center shrink-0">
                          {artistData.photo ? (
                            <Image
                              src={artistData.photo}
                              alt={artistData.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-5xl">🎤</span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 mt-2">
                          <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {artistData.name}
                          </h1>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4 flex-wrap gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              {artistData.genre}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              {artistData.country}
                            </span>
                            {artistData.debutYear && (
                              <span>Debut: {artistData.debutYear}</span>
                            )}
                            {artistData.createdAt && (
                              <span>Joined {artistData.createdAt}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-4 gap-4 py-4 border-t border-b border-gray-100">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{formatNumber(artistData.songs)}</p>
                          <p className="text-xs text-gray-600">Songs</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{formatNumber(artistData.albums)}</p>
                          <p className="text-xs text-gray-600">Albums</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatNumber(artistData.followers)}
                          </p>
                          <p className="text-xs text-gray-600">Followers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatNumber(artistData.monthlyListeners)}
                          </p>
                          <p className="text-xs text-gray-600">Monthly</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Listeners Chart */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Listeners</h3>
                    <RechartsComponents data={weeklyListeners} />
                  </div>

                  {/* Top Songs */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Songs</h3>
                    <div className="space-y-4">
                      {topSongs.length === 0 ? (
                        <p className="text-sm text-gray-500">No songs found for this artist.</p>
                      ) : (
                        topSongs.map((song, index) => (
                          <div
                            key={song.id}
                            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                          >
                            <div className="flex items-center space-x-4">
                              <span className="text-lg font-bold text-gray-400 w-8 text-center">
                                #{index + 1}
                              </span>
                              <div className="w-12 h-12 bg-blue-50 rounded overflow-hidden flex items-center justify-center relative">
                                {song.cover_image ? (
                                  <Image
                                    src={song.cover_image.startsWith('http') ? song.cover_image : `${CONFIG.API_URL}${song.cover_image}`}
                                    alt={song.title}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <span className="text-xl">🎵</span>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{song.title}</p>
                                <p className="text-xs text-gray-600">
                                  {song.play_count?.toLocaleString() || 0} plays • {song.like_count?.toLocaleString() || 0} likes
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-xs text-gray-500 font-mono">{song.duration}</span>
                              <button className="text-blue-600 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Albums Section */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Albums</h3>
                    {albums.length === 0 ? (
                      <p className="text-gray-500 text-sm">No albums found for this artist.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {albums.map((album) => (
                          <div key={album.id} className="group cursor-pointer">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2 relative">
                              {album.image ? (
                                <img
                                  src={album.image}
                                  alt={album.title}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">
                                  💿
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg">
                                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <h4 className="text-sm font-semibold text-gray-900 truncate">{album.title}</h4>
                            <p className="text-xs text-gray-500">{album.release_date ? album.release_date.split('T')[0] : album.release_year || ''}</p>
                          </div>
                        ))}
                      </div>
                    )}
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
                      {artistData.socialMedia.youtube && (
                        <a
                          href={`https://youtube.com/${artistData.socialMedia.youtube.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-2xl">📺</span>
                          <span className="text-sm text-gray-700 truncate">{artistData.socialMedia.youtube}</span>
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
            </>
          )}
        </div>
      </Layout>
    </>
  );
}

