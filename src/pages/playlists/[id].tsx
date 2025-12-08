import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useToast } from '@/components/ui/toast';
import axios from 'axios';
import { CONFIG } from '@/config';
import toast from 'react-hot-toast';

interface Music {
  id: number;
  title: string;
  artist: string;
  album?: string;
  duration?: string;
  cover_image?: string;
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
  created_at: string;
  updated_at: string;
  songs?: PlaylistSong[];
  total_songs?: number;
  total_duration?: string;
}

export default function PlaylistDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { error } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<PlaylistSong[]>([]);

  // Helper function untuk mendapatkan token dari localStorage
  const getAuthToken = (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("soundcave_token");
    }
    return null;
  };

  // Helper function untuk mendapatkan headers dengan Authorization
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    };
  };

  // Fetch playlist data
  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!id || typeof id !== 'string') return;

      try {
        setIsLoading(true);
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
            created_at: playlistData.created_at
              ? playlistData.created_at.split("T")[0]
              : new Date().toISOString().split("T")[0],
            updated_at: playlistData.updated_at
              ? playlistData.updated_at.split("T")[0]
              : new Date().toISOString().split("T")[0],
            total_songs: playlistData.total_songs || 0,
            total_duration: playlistData.total_duration || '0h 0m',
          });

          // Fetch songs in playlist separately
          await fetchPlaylistSongs(id);
        } else {
          error(
            'Failed to Load Playlist',
            response.data?.message || 'Unable to fetch playlist data.'
          );
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error?.message ||
          'Terjadi kesalahan saat mengambil data playlist.';
        error('Failed to Load Playlist', msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPlaylistSongs = async (playlistId: string) => {
    try {
      const response = await axios.get(
        `${CONFIG.API_URL}/api/playlist-songs/playlist/${playlistId}`,
        getAuthHeaders()
      );

      if (response.data?.success && response.data?.data) {
        // Sort by position
        const sortedSongs = response.data.data.sort((a: PlaylistSong, b: PlaylistSong) => 
          a.position - b.position
        );
        setSongs(sortedSongs);
      }
    } catch (err: any) {
      console.error('Failed to fetch playlist songs:', err);
      // Don't show error if endpoint doesn't exist yet
    }
  };

  const handleRemoveSong = async (playlistSongId: number) => {
    if (!id || typeof id !== 'string') return;

    try {
      const response = await axios.delete(
        `${CONFIG.API_URL}/api/playlist-songs/${playlistSongId}`,
        getAuthHeaders()
      );

      if (response.data?.success) {
        setSongs(songs.filter(song => song.id !== playlistSongId));
        toast.success('Song removed from playlist');
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

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Loading Playlist - SoundCave</title>
        </Head>
        <Layout>
          <div className="p-6">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Memuat data playlist...</p>
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
                Back to Playlists
              </button>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{playlist.name} - SoundCave</title>
        <meta name="description" content={playlist.description || `Playlist: ${playlist.name}`} />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => router.push('/playlists')}
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Playlists
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push(`/playlists/edit/${id}`)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Playlist Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Cover Image */}
              <div className="shrink-0">
                <div className="w-48 h-48 bg-linear-to-br from-blue-400 to-purple-600 rounded-xl overflow-hidden flex items-center justify-center">
                  {playlist.cover_image ? (
                    <img
                      src={playlist.cover_image}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-7xl">🎵</span>
                  )}
                </div>
              </div>

              {/* Playlist Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {playlist.name}
                    </h1>
                    {playlist.description && (
                      <p className="text-gray-600 mb-4">{playlist.description}</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded ${
                      playlist.is_public
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {playlist.is_public ? 'Public' : 'Private'}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {songs.length}
                    </p>
                    <p className="text-sm text-gray-600">Songs</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {playlist.total_duration || '0h 0m'}
                    </p>
                    <p className="text-sm text-gray-600">Duration</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {playlist.created_at}
                    </p>
                    <p className="text-sm text-gray-600">Created</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Songs List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Songs ({songs.length})
              </h2>
              <button
                onClick={() => router.push(`/playlists/${id}/add-songs`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                + Add Songs
              </button>
            </div>

            {songs.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🎵</span>
                <p className="text-gray-600 mb-4">No songs in this playlist yet</p>
                <button
                  onClick={() => router.push(`/playlists/${id}/add-songs`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Songs
                </button>
              </div>
            ) : (
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
                    {songs.map((playlistSong) => (
                      <tr key={playlistSong.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {playlistSong.position + 1}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            {playlistSong.music.cover_image ? (
                              <img
                                src={playlistSong.music.cover_image}
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
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}
