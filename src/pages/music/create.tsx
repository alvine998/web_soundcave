import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';

export default function CreateMusic() {
  const router = useRouter();
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

    // Simulasi upload - ganti dengan API call yang sebenarnya
    setTimeout(() => {
      console.log('Form Data:', formData);
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
                      />
                      <label htmlFor="audio-upload" className="cursor-pointer">
                        <div className="text-4xl mb-2">🎵</div>
                        {audioFile ? (
                          <p className="text-sm text-gray-900 font-medium">{audioFile.name}</p>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600">Click to upload audio file</p>
                            <p className="text-xs text-gray-500 mt-1">MP3, WAV, FLAC up to 50MB</p>
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
                        required
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="text-4xl mb-2">🖼️</div>
                        {coverImage ? (
                          <p className="text-sm text-gray-900 font-medium">{coverImage.name}</p>
                        ) : (
                          <>
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

