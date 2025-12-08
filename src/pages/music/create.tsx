import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import axios from 'axios';
import { CONFIG } from '@/config';
import toast from 'react-hot-toast';

export default function CreateMusic() {
  const router = useRouter();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artist_id: '',
    album_id: '',
    genre: '',
    duration: '',
    release_date: '',
    language: '',
    explicit: false,
    description: '',
    lyrics: '',
    tags: '',
  });

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileUrl, setAudioFileUrl] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [artists, setArtists] = useState<Array<{ id: number; name: string }>>([]);
  const [albums, setAlbums] = useState<Array<{ id: number; title: string; artist: string }>>([]);
  const [genres, setGenres] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);

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

  // Fetch artists from API
  const fetchArtists = async () => {
    try {
      setIsLoadingArtists(true);
      const response = await axios.get(
        `${CONFIG.API_URL}/api/artists`,
        {
          params: {
            page: 1,
            limit: 100, // Get all artists
          },
          ...getAuthHeaders(),
        }
      );

      if (response.data?.success && response.data?.data) {
        const artistsList = response.data.data.map((artist: { id: number; name: string }) => ({
          id: artist.id,
          name: artist.name,
        }));
        setArtists(artistsList);
      }
    } catch (err: any) {
      console.error('Failed to fetch artists:', err);
      setArtists([]);
    } finally {
      setIsLoadingArtists(false);
    }
  };

  // Fetch albums from API
  const fetchAlbums = async () => {
    try {
      const response = await axios.get(
        `${CONFIG.API_URL}/api/albums`,
        {
          params: {
            page: 1,
            limit: 100, // Get all albums
          },
          ...getAuthHeaders(),
        }
      );

      if (response.data?.success && response.data?.data) {
        const albumsList = response.data.data.map((album: { id: number; title: string; artist: string }) => ({
          id: album.id,
          title: album.title,
          artist: album.artist,
        }));
        setAlbums(albumsList);
      }
    } catch (err: any) {
      console.error('Failed to fetch albums:', err);
      setAlbums([]);
    }
  };

  // Fetch genres from API
  const fetchGenres = async () => {
    try {
      setIsLoadingGenres(true);
      const response = await axios.get(
        `${CONFIG.API_URL}/api/genres`,
        {
          params: {
            page: 1,
            limit: 100, // Get all genres
          },
          ...getAuthHeaders(),
        }
      );

      if (response.data?.success && response.data?.data) {
        const genresList = response.data.data.map((genre: { id: number; name: string }) => ({
          id: genre.id,
          name: genre.name,
        }));
        setGenres(genresList);
      }
    } catch (err: any) {
      console.error('Failed to fetch genres:', err);
      setGenres([]);
    } finally {
      setIsLoadingGenres(false);
    }
  };

  useEffect(() => {
    fetchArtists();
    fetchAlbums();
    fetchGenres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update albums when artist changes
  useEffect(() => {
    if (formData.artist_id) {
      fetchAlbums();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.artist_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      // Upload audio file immediately
      await uploadAudioFile(file);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload image immediately
      await uploadImage(file);
    }
  };

  const uploadAudioFile = async (file: File) => {
    try {
      setIsUploadingAudio(true);
      const token = getAuthToken();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'musics');

      const response = await axios.post(
        `${CONFIG.API_URL}/api/musics/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (response.data?.success && response.data?.data?.file_url) {
        const audioUrl = response.data.data.file_url;
        setAudioFileUrl(audioUrl);
        toast.success(response.data?.message || 'Audio file uploaded successfully');
      } else {
        throw new Error(response.data?.message || 'Failed to upload audio file');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        'Failed to upload audio file. Please try again.';
      error('Failed to Upload Audio', msg);
      toast.error(msg);
      setAudioFile(null);
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      setIsUploadingImage(true);
      const token = getAuthToken();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'musics/covers');

      const response = await axios.post(
        `${CONFIG.API_URL}/api/images/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (response.data?.success && response.data?.data?.file_url) {
        const imageUrl = response.data.data.file_url;
        setCoverImageUrl(imageUrl);
        toast.success(response.data?.message || 'Image uploaded successfully');
      } else {
        throw new Error(response.data?.message || 'Failed to upload image');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        'Failed to upload image. Please try again.';
      error('Failed to Upload Image', msg);
      toast.error(msg);
      setCoverImage(null);
      setCoverImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = getAuthToken();

      // Validate required files
      if (!audioFileUrl) {
        error('Audio File Required', 'Please upload an audio file first.');
        toast.error('Please upload an audio file first.');
        setIsLoading(false);
        return;
      }

      const payload: Record<string, any> = {
        title: formData.title,
        artist:
          artists.find((artist) => artist.id === parseInt(formData.artist_id))
            ?.name || "",
        artist_id: parseInt(formData.artist_id),
        genre: formData.genre,
        audio_file_url: audioFileUrl,
        duration: formData.duration,
        explicit: formData.explicit || false,
      };

      // Optional fields
      if (formData.album_id) {
        payload.album_id = parseInt(formData.album_id);
        payload.album =
          albums.find((album) => album.id === parseInt(formData.album_id))
            ?.title || "";
      }
      if (formData.release_date) {
        payload.release_date = formData.release_date;
      }
      if (formData.language) {
        payload.language = formData.language;
      }
      if (formData.description) {
        payload.description = formData.description;
      }
      if (formData.lyrics) {
        payload.lyrics = formData.lyrics;
      }
      if (formData.tags) {
        payload.tags = formData.tags;
      }
      if (coverImageUrl) {
        payload.cover_image_url = coverImageUrl;
      }

      const response = await axios.post(
        `${CONFIG.API_URL}/api/musics`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!response.data?.success) {
        const errorMsg =
          response.data?.message ||
          'An error occurred while uploading the music.';
        error('Failed to Upload Music', errorMsg);
        toast.error(errorMsg);
        return;
      }

      success(
        'Music Uploaded Successfully',
        `${formData.title} has been uploaded.`
      );
      toast.success('Music berhasil diupload!');
      router.push('/music');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        'An error occurred while uploading the music. Please try again.';
      error('Failed to Upload Music', msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <Head>
        <title>Upload Music - SoundCave</title>
        <meta name="description" content="Upload new music" />
      </Head>

      <Layout>
        <div className="p-6 max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <button
                onClick={() => router.back()}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload New Music</h1>
                <p className="text-gray-600">Tambahkan musik baru ke library Anda</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* File Upload Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">File Upload</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Audio File */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Audio File <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioChange}
                        className="hidden"
                        id="audio-upload"
                        required
                        disabled={isUploadingAudio}
                      />
                      <label htmlFor="audio-upload" className={`cursor-pointer ${isUploadingAudio ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <div className="text-4xl mb-2">🎵</div>
                        {audioFile ? (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-900 font-medium">{audioFile.name}</p>
                            {isUploadingAudio && (
                              <p className="text-xs text-blue-600">Uploading...</p>
                            )}
                            {audioFileUrl && !isUploadingAudio && (
                              <p className="text-xs text-green-600">✓ Uploaded successfully</p>
                            )}
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600">Click to upload audio file</p>
                            <p className="text-xs text-gray-500 mt-1">MP3, WAV, OGG, M4A, AAC, FLAC up to 50MB</p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Image <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                        disabled={isUploadingImage}
                      />
                      <label htmlFor="image-upload" className={`cursor-pointer ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {coverImagePreview ? (
                          <div className="space-y-2">
                            <img
                              src={coverImagePreview}
                              alt="Preview"
                              className="mx-auto h-32 w-32 object-cover rounded-lg"
                            />
                            <p className="text-sm text-gray-900 font-medium">{coverImage?.name}</p>
                            {isUploadingImage && (
                              <p className="text-xs text-blue-600">Uploading...</p>
                            )}
                            {coverImageUrl && !isUploadingImage && (
                              <p className="text-xs text-green-600">✓ Uploaded successfully</p>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="text-4xl mb-2">🖼️</div>
                            <p className="text-sm text-gray-600">Click to upload cover image</p>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Song Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter song title"
                    />
                  </div>

                  {/* Artist */}
                  <div>
                    <label htmlFor="artist" className="block text-sm font-medium text-gray-700 mb-2">
                      Artist <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="artist"
                      name="artist_id"
                      required
                      value={formData.artist_id}
                      onChange={handleChange}
                      disabled={isLoadingArtists}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {isLoadingArtists ? 'Loading artists...' : 'Select artist'}
                      </option>
                      {artists.map((artist) => (
                        <option key={artist.id} value={artist.id}>
                          {artist.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Album */}
                  <div>
                    <label htmlFor="album" className="block text-sm font-medium text-gray-700 mb-2">
                      Album
                    </label>
                    <select
                      id="album"
                      name="album_id"
                      value={formData.album_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                    >
                      <option value="">Select album (optional)</option>
                      {albums
                        .filter(album => !formData.artist_id || true) // Filter by artist_id if needed
                        .map((album) => (
                          <option key={album.id} value={album.id}>
                            {album.title} - {album.artist}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Genre */}
                  <div>
                    <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
                      Genre <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="genre"
                      name="genre"
                      required
                      value={formData.genre}
                      onChange={handleChange}
                      disabled={isLoadingGenres}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {isLoadingGenres ? 'Loading genres...' : 'Select genre'}
                      </option>
                      {genres.map((genre) => (
                        <option key={genre.id} value={genre.name}>
                          {genre.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                      Duration <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="duration"
                      name="duration"
                      type="text"
                      required
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="e.g. 3:45"
                    />
                  </div>

                  {/* Release Date */}
                  <div>
                    <label htmlFor="release_date" className="block text-sm font-medium text-gray-700 mb-2">
                      Release Date
                    </label>
                    <Input
                      id="release_date"
                      name="release_date"
                      type="date"
                      value={formData.release_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter song description..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400"
                  />
                </div>

                {/* Lyrics */}
                <div className="mt-6">
                  <label htmlFor="lyrics" className="block text-sm font-medium text-gray-700 mb-2">
                    Lyrics
                  </label>
                  <textarea
                    id="lyrics"
                    name="lyrics"
                    rows={8}
                    value={formData.lyrics}
                    onChange={handleChange}
                    placeholder="Enter song lyrics..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400 font-mono"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    'Upload Music'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </Layout>
    </>
  );
}

