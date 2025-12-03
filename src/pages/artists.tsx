import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/Pagination';
import { useToast } from '@/components/ui/toast';
import axios from 'axios';
import { CONFIG } from '@/config';

interface Artist {
  id: number;
  name: string;
  bio: string;
  genre: string;
  country: string;
  debutYear?: string;
  website?: string;
  email?: string;
  phone?: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
  };
  profileImage?: string;
  createdAt: string;
  // Computed fields untuk UI
  followers?: number;
  songs?: number;
  albums?: number;
  monthlyListeners?: number;
  verified?: boolean;
}

export default function Artists() {
  const router = useRouter();
  const { error } = useToast();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filterGenre, setFilterGenre] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchArtists = async (pageParam = 1) => {
    const hasSearch = searchQuery.trim();
    const url = hasSearch
      ? `${CONFIG.API_URL}/api/artists/search`
      : `${CONFIG.API_URL}/api/artists`;

    const params: Record<string, string> = {
      page: String(pageParam),
      limit: String(pageSize),
    };

    if (hasSearch) {
      params.q = searchQuery.trim();
    }

    // Hanya kirim filter dan sort jika tidak ada search query
    // (atau sesuaikan dengan kebutuhan backend)
    if (!hasSearch) {
      if (filterGenre !== 'all') {
        params.genre = filterGenre;
      }

      if (sortBy) {
        params.sortBy = sortBy;
      }
    }

    try {
      setIsLoading(true);

      const response = await axios.get(url, { params });

      if (!response.data?.success) {
        const errorMsg = response.data?.message || 'Unable to fetch artists from server.';
        error('Failed to Load Artists', errorMsg);
        console.error('API Error:', {
          url,
          params,
          response: response.data,
        });
        return;
      }

      const items = response.data.data as Array<{
        id: number;
        name: string;
        bio: string;
        genre: string;
        country: string;
        debutYear?: string;
        website?: string;
        email?: string;
        phone?: string;
        socialMedia?: {
          instagram?: string;
          twitter?: string;
          facebook?: string;
          youtube?: string;
        };
        profileImage?: string;
        created_at?: string;
        updated_at?: string;
      }>;

      const mapped: Artist[] = items.map((item) => ({
        id: item.id,
        name: item.name,
        bio: item.bio,
        genre: item.genre,
        country: item.country,
        debutYear: item.debutYear,
        website: item.website,
        email: item.email,
        phone: item.phone,
        socialMedia: item.socialMedia,
        profileImage: CONFIG.API_URL+item.profileImage,
        createdAt: item.created_at
          ? item.created_at.split('T')[0]
          : new Date().toISOString().split('T')[0],
        // Default values untuk UI (bisa diambil dari API nanti jika ada)
        followers: 0,
        songs: 0,
        albums: 0,
        monthlyListeners: 0,
        verified: false,
      }));

      setArtists(mapped);

      const apiPage =
        typeof response.data.page === 'number' ? response.data.page : pageParam;
      const apiLimit =
        typeof response.data.limit === 'number' ? response.data.limit : pageSize;
      const apiTotal =
        typeof response.data.total === 'number'
          ? response.data.total
          : mapped.length;
      const apiTotalPages =
        typeof response.data.totalPages === 'number'
          ? response.data.totalPages
          : Math.max(1, Math.ceil(apiTotal / apiLimit));

      setPage(apiPage);
      setTotal(apiTotal);
      setTotalPages(apiTotalPages);
    } catch (err: any) {
      console.error('Fetch Artists Error:', {
        url,
        params,
        error: err,
        response: err?.response?.data,
      });

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        err?.message ||
        'Terjadi kesalahan saat mengambil data artist.';
      error('Failed to Load Artists', msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchArtists(1);
    }, 500);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterGenre, sortBy]);

  const stats = [
    { title: 'Total Artists', value: total.toLocaleString(), icon: '🎤', change: '+23' },
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

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Cari artist..."
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
                <option value="popular">Most Popular</option>
                <option value="followers">Most Followers</option>
                <option value="songs">Most Songs</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Artists Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Memuat data artist...</p>
            </div>
          ) : artists.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-12">
              <span className="text-6xl mb-4 block">🎤</span>
              <p className="text-gray-600">Tidak ada artist ditemukan</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {artists.map((artist) => (
                  <div
                    key={artist.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Artist Cover */}
                    <div className="h-48 bg-linear-to-br from-blue-400 to-purple-600 flex items-center justify-center relative overflow-hidden">
                      {artist.profileImage ? (
                        <img
                          src={artist.profileImage}
                          alt={artist.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-7xl">🎤</span>
                      )}
                      {artist.verified && (
                        <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-2 z-10">
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
                          {artist.debutYear && (
                            <p className="text-xs text-gray-500 mt-1">
                              Debut: {artist.debutYear}
                            </p>
                          )}
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          {artist.genre}
                        </span>
                      </div>

                      {artist.bio && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {artist.bio}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100 mb-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">
                            {artist.songs || 0}
                          </p>
                          <p className="text-xs text-gray-600">Songs</p>
                        </div>
                        <div className="text-center border-l border-r border-gray-100">
                          <p className="text-lg font-bold text-gray-900">
                            {artist.albums || 0}
                          </p>
                          <p className="text-xs text-gray-600">Albums</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">
                            {artist.followers
                              ? (artist.followers / 1000).toFixed(0) + 'K'
                              : '0'}
                          </p>
                          <p className="text-xs text-gray-600">Followers</p>
                        </div>
                      </div>

                      {/* Monthly Listeners */}
                      {artist.monthlyListeners && artist.followers && (
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
                                width: `${Math.min(
                                  (artist.monthlyListeners / artist.followers) * 100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

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
              {total > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <Pagination
                    total={total}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={(nextPage) => {
                      setPage(nextPage);
                      fetchArtists(nextPage);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </Layout>
    </>
  );
}

