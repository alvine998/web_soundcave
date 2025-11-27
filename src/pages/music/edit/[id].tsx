import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';

export default function EditMusic() {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    duration: '',
    releaseDate: '',
    description: '',
    lyrics: '',
  });

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  // Load existing music data
  useEffect(() => {
    if (id) {
      // Simulasi load data - ganti dengan API call yang sebenarnya
      setFormData({
        title: 'Summer Vibes',
        artist: 'The Waves',
        album: 'Beach Season',
        genre: 'Pop',
        duration: '3:45',
        releaseDate: '2024-01-15',
        description: 'A refreshing summer anthem that brings beach vibes to your ears.',
        lyrics: 'Verse 1:\nSummer days and endless nights\nBeach waves and city lights\n\nChorus:\nFeel the summer vibes...',
      });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulasi update - ganti dengan API call yang sebenarnya
    setTimeout(() => {
      console.log('Updated Data:', formData);
      console.log('Audio File:', audioFile);
      console.log('Cover Image:', coverImage);
      setIsLoading(false);
      router.push('/music');
    }, 2000);
  };

  const genres = ['Pop', 'Rock', 'Jazz', 'Electronic', 'Hip Hop', 'Classical', 'Ambient', 'R&B', 'Country'];
  
  // Available artists for selection
  const availableArtists = [
    'The Waves',
    'Luna Echo',
    'Nature Sounds',
    'Urban Beats',
    'Classical Masters',
    'Thunder Strike',
    'Summer Vibes',
    'Ocean Dreams',
    'Jazz Collective',
  ];

  return (
    <>
      <Head>
        <title>Edit Music - SoundCave</title>
        <meta name="description" content="Edit music details" />
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Music</h1>
                <p className="text-gray-600">Update informasi musik</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Current Files Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Current Files</p>
                    <p className="text-xs text-blue-700 mt-1">Upload new files only if you want to replace the existing ones</p>
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Replace Files (Optional)</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Audio File */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Audio File
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioChange}
                        className="hidden"
                        id="audio-upload"
                      />
                      <label htmlFor="audio-upload" className="cursor-pointer">
                        <div className="text-4xl mb-2">🎵</div>
                        {audioFile ? (
                          <p className="text-sm text-gray-900 font-medium">{audioFile.name}</p>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600">Click to replace audio file</p>
                            <p className="text-xs text-gray-500 mt-1">MP3, WAV, FLAC up to 50MB</p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="text-4xl mb-2">🖼️</div>
                        {coverImage ? (
                          <p className="text-sm text-gray-900 font-medium">{coverImage.name}</p>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600">Click to replace cover image</p>
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
                      name="artist"
                      required
                      value={formData.artist}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                    >
                      <option value="">Select artist</option>
                      {availableArtists.map((artist) => (
                        <option key={artist} value={artist}>
                          {artist}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Album */}
                  <div>
                    <label htmlFor="album" className="block text-sm font-medium text-gray-700 mb-2">
                      Album
                    </label>
                    <Input
                      id="album"
                      name="album"
                      type="text"
                      value={formData.album}
                      onChange={handleChange}
                      placeholder="Enter album name"
                    />
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                    >
                      <option value="">Select genre</option>
                      {genres.map((genre) => (
                        <option key={genre} value={genre}>
                          {genre}
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
                    <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Release Date
                    </label>
                    <Input
                      id="releaseDate"
                      name="releaseDate"
                      type="date"
                      value={formData.releaseDate}
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
                      Updating...
                    </span>
                  ) : (
                    'Update Music'
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

