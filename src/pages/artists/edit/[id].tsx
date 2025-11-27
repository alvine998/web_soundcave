import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';

export default function EditArtist() {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    genre: '',
    country: '',
    email: '',
    phone: '',
    website: '',
    bio: '',
    socialMedia: {
      instagram: '',
      twitter: '',
      facebook: '',
      spotify: '',
    },
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  // Load existing artist data
  useEffect(() => {
    if (id) {
      // Simulasi load data - ganti dengan API call yang sebenarnya
      setFormData({
        name: 'The Waves',
        genre: 'Pop',
        country: 'USA',
        email: 'thewaves@email.com',
        phone: '+1 234 567 8900',
        website: 'https://thewaves.com',
        bio: 'The Waves is a pop band known for their beach-inspired melodies and summer anthems. Formed in California, they have been making waves in the music industry since 2020.',
        socialMedia: {
          instagram: '@thewaves',
          twitter: '@thewavesmusic',
          facebook: 'facebook.com/thewaves',
          spotify: 'spotify.com/artist/thewaves',
        },
      });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('social_')) {
      const socialKey = name.replace('social_', '');
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialKey]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      console.log('Profile Image:', profileImage);
      console.log('Cover Image:', coverImage);
      setIsLoading(false);
      router.push('/artists');
    }, 2000);
  };

  const genres = ['Pop', 'Rock', 'Jazz', 'Electronic', 'Hip Hop', 'Classical', 'Ambient', 'R&B', 'Country'];

  return (
    <>
      <Head>
        <title>Edit Artist - SoundCave</title>
        <meta name="description" content="Edit artist information" />
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Artist</h1>
                <p className="text-gray-600">Update informasi artist</p>
              </div>
            </div>
          </div>

          {/* Current Info Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">Current Images</p>
                <p className="text-xs text-blue-700 mt-1">Upload new images only if you want to replace the existing ones</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Images Upload */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Replace Images (Optional)</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Photo
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                        id="profile-upload"
                      />
                      <label htmlFor="profile-upload" className="cursor-pointer">
                        <div className="text-4xl mb-2">👤</div>
                        {profileImage ? (
                          <p className="text-sm text-gray-900 font-medium">{profileImage.name}</p>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600">Click to replace profile photo</p>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Photo
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="hidden"
                        id="cover-upload"
                      />
                      <label htmlFor="cover-upload" className="cursor-pointer">
                        <div className="text-4xl mb-2">🖼️</div>
                        {coverImage ? (
                          <p className="text-sm text-gray-900 font-medium">{coverImage.name}</p>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600">Click to replace cover photo</p>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 10MB</p>
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
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Artist Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter artist name"
                    />
                  </div>

                  {/* Genre */}
                  <div>
                    <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Genre <span className="text-red-500">*</span>
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

                  {/* Country */}
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="country"
                      name="country"
                      type="text"
                      required
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="e.g. USA, UK, Indonesia"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="artist@email.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+62 812 3456 7890"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://artistwebsite.com"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="mt-6">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Biography <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={6}
                    required
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about the artist..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Instagram */}
                  <div>
                    <label htmlFor="social_instagram" className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <Input
                      id="social_instagram"
                      name="social_instagram"
                      type="text"
                      value={formData.socialMedia.instagram}
                      onChange={handleChange}
                      placeholder="@username"
                    />
                  </div>

                  {/* Twitter */}
                  <div>
                    <label htmlFor="social_twitter" className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter/X
                    </label>
                    <Input
                      id="social_twitter"
                      name="social_twitter"
                      type="text"
                      value={formData.socialMedia.twitter}
                      onChange={handleChange}
                      placeholder="@username"
                    />
                  </div>

                  {/* Facebook */}
                  <div>
                    <label htmlFor="social_facebook" className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook
                    </label>
                    <Input
                      id="social_facebook"
                      name="social_facebook"
                      type="text"
                      value={formData.socialMedia.facebook}
                      onChange={handleChange}
                      placeholder="facebook.com/artist"
                    />
                  </div>

                  {/* Spotify */}
                  <div>
                    <label htmlFor="social_spotify" className="block text-sm font-medium text-gray-700 mb-2">
                      Spotify
                    </label>
                    <Input
                      id="social_spotify"
                      name="social_spotify"
                      type="text"
                      value={formData.socialMedia.spotify}
                      onChange={handleChange}
                      placeholder="spotify.com/artist/..."
                    />
                  </div>
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
                    'Update Artist'
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

