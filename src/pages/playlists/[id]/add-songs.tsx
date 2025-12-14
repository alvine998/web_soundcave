import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/Pagination';
import { useToast } from '@/components/ui/toast';
import axios from 'axios';
import { CONFIG } from '@/config';
import toast from 'react-hot-toast';

interface Music {
  id: number;
  title: string;
  artist: string;
  artist_id: number;
  album?: string;
  album_id?: number;
  genre: string;
  duration?: string;
  cover_image_url?: string;
  audio_file_url?: string;
}

interface PlaylistSong {
  id: number;
  playlist_id: number;
  music_id: number;
  position: number;
  created_at: string;
  updated_at: string;
  music: Music;
}

interface Playlist {
  id: number;
  name: string;
  description: string | null;
  is_public: boolean;
  cover_image: string | null;
}

export default function AddSongsToPlaylist() {
  const router = useRouter();
  const { id } = router.query;
  const { success, error } = useToast();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<PlaylistSong[]>([]);
  const [availableMusics, setAvailableMusics] = useState<Music[]>([]);
  const [selectedMusicIds, setSelectedMusicIds] = useState<Set<number>>(new Set());
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [filterArtist, setFilterArtist] = useState<string>('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [artists, setArtists] = useState<Array<{ id: number; name: string }>>([]);
  const [genres, setGenres] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);

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

  // Fetch playlist data
  const fetchPlaylist = async () => {
    if (!id || typeof id !== 'string') return;

    try {
      setIsLoadingPlaylist(true);
      const response = await axios.get(
        `${CONFIG.API_URL}/api/playlists/${id}`,
        getAuthHeaders()
      );

      if (response.data?.success && response.data?.data) {
        const playlistData = response.data.data;
        setPlaylist({
          id: playlistData.id,
          name: playlistData.name,
          description: playlistData.description,
          is_public: playlistData.is_public,
          cover_image: playlistData.cover_image,
        });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        'Failed to load playlist.';
      error('Failed to Load Playlist', msg);
      toast.error(msg);
    } finally {
      setIsLoadingPlaylist(false);
    }
  };

  // Fetch existing playlist songs
  const fetchPlaylistSongs = async () => {
    if (!id || typeof id !== 'string') return;

    try {
      const response = await axios.get(
        `${CONFIG.API_URL}/api/playlist-songs/playlist/${id}`,
        getAuthHeaders()
      );

      if (response.data?.success && response.data?.data) {
        const songs = response.data.data as PlaylistSong[];
        setPlaylistSongs(songs);
        // Mark existing songs as selected (so they appear disabled)
        const existingMusicIds = new Set(songs.map((song) => song.music_id));
        setSelectedMusicIds(existingMusicIds);
      }
    } catch (err: any) {
      console.error('Failed to fetch playlist songs:', err);
      // Don't show error if endpoint doesn't exist yet
    }
  };

  // Fetch available musics
  const fetchMusics = async (pageParam = 1, query?: string) => {
    try {
      setIsLoading(true);
      const params: Record<string, any> = {
        page: pageParam,
        limit: pageSize,
        sort_by: sortBy,
        order: order,
      };

      if (query) {
        params.search = query;
      }
      if (filterGenre !== 'all') {
        params.genre = filterGenre;
      }
      if (filterArtist !== 'all' && filterArtist) {
        params.artist_id = parseInt(filterArtist);
      }

      const response = await axios.get(`${CONFIG.API_URL}/api/musics`, {
        params,
        ...getAuthHeaders(),
      });

      if (response.data?.success && response.data?.data) {
        const musicsList = response.data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          artist: item.artist,
          artist_id: item.artist_id,
          album: item.album || null,
          album_id: item.album_id || null,
          genre: item.genre,
          duration: item.duration || null,
          cover_image_url: item.cover_image_url || null,
          audio_file_url: item.audio_file_url || null,
        }));
        setAvailableMusics(musicsList);

        if (response.data?.pagination) {
          setPage(response.data.pagination.page);
          setTotal(response.data.pagination.total);
          setTotalPages(response.data.pagination.pages);
        }
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        'Failed to fetch musics. Please try again.';
      error('Failed to Fetch Musics', msg);
      toast.error(msg);
      setAvailableMusics([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch artists
  const fetchArtists = async () => {
    try {
      setIsLoadingArtists(true);
      const response = await axios.get(`${CONFIG.API_URL}/api/artists`, {
        params: { page: 1, limit: 100 },
        ...getAuthHeaders(),
      });

      if (response.data?.success && response.data?.data) {
        const artistsList = response.data.data.map((item: any) => ({
          id: item.id,
          name: item.name,
        }));
        setArtists(artistsList);
      }
    } catch (err: any) {
      console.error('Failed to fetch artists:', err);
    } finally {
      setIsLoadingArtists(false);
    }
  };

  // Fetch genres
  const fetchGenres = async () => {
    try {
      setIsLoadingGenres(true);
      const response = await axios.get(`${CONFIG.API_URL}/api/genres`, {
        params: { page: 1, limit: 100 },
        ...getAuthHeaders(),
      });

      if (response.data?.success && response.data?.data) {
        const genresList = response.data.data.map((item: any) => ({
          id: item.id,
          name: item.name,
        }));
        setGenres(genresList);
      }
    } catch (err: any) {
      console.error('Failed to fetch genres:', err);
    } finally {
      setIsLoadingGenres(false);
    }
  };

  // Handle music selection toggle
  const handleMusicToggle = (musicId: number) => {
    const existingMusicIds = new Set(playlistSongs.map((song) => song.music_id));
    
    // Don't allow toggling if already in playlist
    if (existingMusicIds.has(musicId)) {
      return;
    }

    setSelectedMusicIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(musicId)) {
        newSet.delete(musicId);
      } else {
        newSet.add(musicId);
      }
      return newSet;
    });
  };

  // Add selected songs to playlist
  const handleAddSongs = async () => {
    if (!id || typeof id !== 'string') return;
    if (selectedMusicIds.size === 0) {
      toast.error('Pilih setidaknya satu lagu untuk ditambahkan');
      return;
    }

    try {
      setIsAdding(true);
      const playlistId = parseInt(id);
      const existingMusicIds = new Set(playlistSongs.map((song) => song.music_id));
      
      // Filter out songs that are already in playlist
      const newMusicIds = Array.from(selectedMusicIds).filter(
        (musicId) => !existingMusicIds.has(musicId)
      );

      if (newMusicIds.length === 0) {
        toast.error('Semua lagu yang dipilih sudah ada di playlist');
        setIsAdding(false);
        return;
      }

      // Get current max position
      const maxPosition = playlistSongs.length > 0
        ? Math.max(...playlistSongs.map((song) => song.position))
        : -1;

      // Add songs sequentially
      const promises = newMusicIds.map((musicId, index) => {
        const position = maxPosition + 1 + index;
        return axios.post(
          `${CONFIG.API_URL}/api/playlist-songs`,
          {
            playlist_id: playlistId,
            music_id: musicId,
            position: position,
          },
          getAuthHeaders()
        );
      });

      await Promise.all(promises);

      success('Songs Added', 'Lagu berhasil ditambahkan ke playlist');
      toast.success('Lagu berhasil ditambahkan ke playlist');

      // Refresh playlist songs
      await fetchPlaylistSongs();
      
      // Clear selection
      setSelectedMusicIds(new Set(existingMusicIds));

      // Optionally refresh musics list
      await fetchMusics(page, searchQuery);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        'Failed to add songs to playlist.';
      error('Failed to Add Songs', msg);
      toast.error(msg);
    } finally {
      setIsAdding(false);
    }
  };

  // Remove song from playlist
  const handleRemoveSong = async (playlistSongId: number) => {
    if (!id || typeof id !== 'string') return;

    try {
      const response = await axios.delete(
        `${CONFIG.API_URL}/api/playlist-songs/${playlistSongId}`,
        getAuthHeaders()
      );

      if (response.data?.success) {
        setPlaylistSongs(playlistSongs.filter((song) => song.id !== playlistSongId));
        toast.success('Lagu berhasil dihapus dari playlist');
        
        // Refresh musics to update selection state
        await fetchMusics(page, searchQuery);
      } else {
        throw new Error(response.data?.message || 'Failed to remove song');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        'Failed to remove song from playlist.';
      error('Failed to Remove Song', msg);
      toast.error(msg);
    }
  };

  // Update song position
  const handleUpdatePosition = async (playlistSongId: number, newPosition: number) => {
    try {
      const response = await axios.put(
        `${CONFIG.API_URL}/api/playlist-songs/${playlistSongId}`,
        {
          position: newPosition,
        },
        getAuthHeaders()
      );

      if (response.data?.success) {
        toast.success('Posisi lagu berhasil diupdate');
        await fetchPlaylistSongs();
      } else {
        throw new Error(response.data?.message || 'Failed to update position');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        'Failed to update song position.';
      error('Failed to Update Position', msg);
      toast.error(msg);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (id) {
        fetchMusics(1, searchQuery);
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch on filter/sort change
  useEffect(() => {
    if (id) {
      setPage(1);
      fetchMusics(1, searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterGenre, filterArtist, sortBy, order]);

  // Fetch on page change
  useEffect(() => {
    if (id) {
      fetchMusics(page, searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Initial fetch
  useEffect(() => {
    if (id) {
      fetchPlaylist();
      fetchPlaylistSongs();
      fetchMusics();
      fetchArtists();
      fetchGenres();
    }
  }, [id]);

  if (isLoadingPlaylist) {
    return (
      <>
        <Head>
          <title>Loading - SoundCave</title>
        </Head>
        <Layout>
          <div className="p-6">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  if (!playlist) {
    return (
      <>
        <Head>
          <title>Playlist Not Found - SoundCave</title>
        </Head>
        <Layout>
          <div className="p-6">
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🎵</span>
              <p className="text-gray-600">Playlist tidak ditemukan</p>
              <button
                onClick={() => router.push('/playlists')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Kembali ke Playlists
              </button>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  const existingMusicIds = new Set(playlistSongs.map((song) => song.music_id));
  const selectedCount = Array.from(selectedMusicIds).filter(
    (id) => !existingMusicIds.has(id)
  ).length;

  return (
    <>
      <Head>
        <title>Tambah Lagu ke {playlist.name} - SoundCave</title>
      </Head>

      <Layout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => router.push(`/playlists/${id}`)}
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Kembali ke Playlist
            </button>

            <div className="flex items-center space-x-3">
              {selectedCount > 0 && (
                <button
                  onClick={handleAddSongs}
                  disabled={isAdding}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAdding ? 'Menambahkan...' : `Tambah ${selectedCount} Lagu`}
                </button>
              )}
            </div>
          </div>

          {/* Playlist Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="text-gray-600 mb-4">{playlist.description}</p>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>
                {playlistSongs.length} lagu di playlist
              </span>
              <span
                className={`px-2 py-1 rounded ${
                  playlist.is_public
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {playlist.is_public ? 'Public' : 'Private'}
              </span>
            </div>
          </div>

          {/* Existing Songs in Playlist */}
          {playlistSongs.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Lagu di Playlist ({playlistSongs.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        #
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Artist
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Album
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {playlistSongs
                      .sort((a, b) => a.position - b.position)
                      .map((playlistSong) => (
                        <tr
                          key={playlistSong.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {playlistSong.position + 1}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              {playlistSong.music.cover_image_url ? (
                                <img
                                  src={playlistSong.music.cover_image_url}
                                  alt={playlistSong.music.title}
                                  className="w-10 h-10 rounded object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                  <span className="text-lg">🎵</span>
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {playlistSong.music.title}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-700">
                            {playlistSong.music.artist}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {playlistSong.music.album || '-'}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {playlistSong.music.duration || '-'}
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => handleRemoveSong(playlistSong.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  type="text"
                  placeholder="Cari lagu..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  className="w-full"
                />
              </div>
              <div className="min-w-[150px]">
                <select
                  value={filterGenre || 'all'}
                  onChange={(e) => setFilterGenre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-black"
                >
                  <option value="all">Semua Genre</option>
                  {genres.map((genre) => (
                    <option key={genre.id} value={genre.name}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-[150px]">
                <select
                  value={filterArtist || 'all'}
                  onChange={(e) => setFilterArtist(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-black"                  disabled={isLoadingArtists}
                >
                  <option value="all">Semua Artist</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={String(artist.id)}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-[150px]">
                <select
                  value={`${sortBy}-${order}`}
                  onChange={(e) => {
                    const [sort, ord] = e.target.value.split('-');
                    setSortBy(sort);
                    setOrder(ord as 'asc' | 'desc');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-black"
                >
                  <option value="created_at-desc">Terbaru</option>
                  <option value="created_at-asc">Terlama</option>
                  <option value="title-asc">Judul A-Z</option>
                  <option value="title-desc">Judul Z-A</option>
                  <option value="artist-asc">Artist A-Z</option>
                  <option value="artist-desc">Artist Z-A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Available Musics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Pilih Lagu untuk Ditambahkan
                {selectedCount > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({selectedCount} dipilih)
                  </span>
                )}
              </h2>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Memuat lagu...</p>
              </div>
            ) : availableMusics.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🎵</span>
                <p className="text-gray-600">Tidak ada lagu ditemukan</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-12">
                          <input
                            type="checkbox"
                            checked={
                              availableMusics.length > 0 &&
                              availableMusics.every(
                                (music) =>
                                  selectedMusicIds.has(music.id) ||
                                  existingMusicIds.has(music.id)
                              )
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                const newSet = new Set(selectedMusicIds);
                                availableMusics.forEach((music) => {
                                  if (!existingMusicIds.has(music.id)) {
                                    newSet.add(music.id);
                                  }
                                });
                                setSelectedMusicIds(newSet);
                              } else {
                                const newSet = new Set(selectedMusicIds);
                                availableMusics.forEach((music) => {
                                  newSet.delete(music.id);
                                });
                                setSelectedMusicIds(newSet);
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Title
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
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {availableMusics.map((music) => {
                        const isInPlaylist = existingMusicIds.has(music.id);
                        const isSelected = selectedMusicIds.has(music.id);

                        return (
                          <tr
                            key={music.id}
                            className={`hover:bg-gray-50 transition-colors ${
                              isInPlaylist ? 'opacity-60' : ''
                            }`}
                          >
                            <td className="py-4 px-6">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleMusicToggle(music.id)}
                                disabled={isInPlaylist}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-3">
                                {music.cover_image_url ? (
                                  <img
                                    src={music.cover_image_url}
                                    alt={music.title}
                                    className="w-10 h-10 rounded object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                    <span className="text-lg">🎵</span>
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {music.title}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-700">
                              {music.artist}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600">
                              {music.album || '-'}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600">
                              {music.genre}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600">
                              {music.duration || '-'}
                            </td>
                            <td className="py-4 px-6 text-sm">
                              {isInPlaylist ? (
                                <span className="text-green-600 font-medium">
                                  Sudah di Playlist
                                </span>
                              ) : isSelected ? (
                                <span className="text-blue-600 font-medium">
                                  Dipilih
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {total > 0 && (
                  <div className="p-6 border-t border-gray-200">
                    <Pagination
                      total={total}
                      page={page}
                      pageSize={pageSize}
                      onPageChange={(nextPage) => {
                        setPage(nextPage);
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}
