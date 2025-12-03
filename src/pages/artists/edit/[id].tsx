import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import axios from 'axios';
import { CONFIG } from '@/config';
import toast from 'react-hot-toast';

export default function EditArtist() {
  const router = useRouter();
  const { id } = router.query;
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    genre: '',
    country: '',
    email: '',
    phone: '',
    website: '',
    bio: '',
    debutYear: '',
    socialMedia: {
      instagram: '',
      twitter: '',
      facebook: '',
      youtube: '',
    },
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [currentProfileImage, setCurrentProfileImage] = useState<string | null>(null);

  // Load existing artist data
  useEffect(() => {
    const fetchArtist = async () => {
      if (!id || typeof id !== 'string') return;

      try {
        setIsLoadingData(true);
        const response = await axios.get(`${CONFIG.API_URL}/api/artists/${id}`);

        if (response.data?.success && response.data?.data) {
          const artist = response.data.data;
          setFormData({
            name: artist.name || '',
            genre: artist.genre || '',
            country: artist.country || '',
            email: artist.email || '',
            phone: artist.phone || '',
            website: artist.website || '',
            bio: artist.bio || '',
            debutYear: artist.debutYear || '',
            socialMedia: {
              instagram: artist.socialMedia?.instagram || '',
              twitter: artist.socialMedia?.twitter || '',
              facebook: artist.socialMedia?.facebook || '',
              youtube: artist.socialMedia?.youtube || '',
            },
          });
          if (artist.profileImage) {
            setCurrentProfileImage(`${CONFIG.API_URL}${artist.profileImage}`);
          }
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error?.message ||
          'Failed to load artist data.';
        error('Failed to Load Artist', msg);
        toast.error(msg);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchArtist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || typeof id !== 'string') return;

    setIsLoading(true);

    try {
      // Buat FormData untuk multipart/form-data
      const formDataToSend = new FormData();

      // Fields (semua optional untuk update)
      if (formData.name) formDataToSend.append('name', formData.name);
      if (formData.bio) formDataToSend.append('bio', formData.bio);
      if (formData.genre) formDataToSend.append('genre', formData.genre);
      if (formData.country) formDataToSend.append('country', formData.country);
      if (formData.debutYear) formDataToSend.append('debutYear', formData.debutYear);
      if (formData.email) formDataToSend.append('email', formData.email);
      if (formData.phone) formDataToSend.append('phone', formData.phone);
      if (formData.website) formDataToSend.append('website', formData.website);

      // Social Media sebagai JSON string
      const socialMediaObj: Record<string, string> = {};
      if (formData.socialMedia.instagram) {
        socialMediaObj.instagram = formData.socialMedia.instagram;
      }
      if (formData.socialMedia.twitter) {
        socialMediaObj.twitter = formData.socialMedia.twitter;
      }
      if (formData.socialMedia.facebook) {
        socialMediaObj.facebook = formData.socialMedia.facebook;
      }
      if (formData.socialMedia.youtube) {
        socialMediaObj.youtube = formData.socialMedia.youtube;
      }

      if (Object.keys(socialMediaObj).length > 0) {
        formDataToSend.append('socialMedia', JSON.stringify(socialMediaObj));
      }

      // Profile Image (binary) - hanya kirim jika ada file baru
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }

      const response = await axios.put(
        `${CONFIG.API_URL}/api/artists/${id}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.data?.success) {
        const errorMsg =
          response.data?.message ||
          'An error occurred while updating the artist.';
        error('Failed to Update Artist', errorMsg);
        toast.error(errorMsg);
        return;
      }

      success(
        'Artist Updated Successfully',
        `${formData.name} has been updated.`
      );
      toast.success('Artist berhasil diperbarui!');
      router.push('/artists');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        'An error occurred while updating the artist. Please try again.';
      error('Failed to Update Artist', msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
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

          {isLoadingData ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Memuat data artist...</p>
            </div>
          ) : (
            <>
              {/* Current Info Notice */}
              {currentProfileImage && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Current Profile Image</p>
                      <p className="text-xs text-blue-700 mt-1">Upload new image only if you want to replace the existing one</p>
                      {currentProfileImage && (
                        <img
                          src={currentProfileImage}
                          alt="Current profile"
                          className="mt-2 w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Images Upload */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Replace Profile Image (Optional)</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Photo
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors max-w-md">
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

                  {/* Debut Year */}
                  <div>
                    <label htmlFor="debutYear" className="block text-sm font-medium text-gray-700 mb-2">
                      Debut Year
                    </label>
                    <Input
                      id="debutYear"
                      name="debutYear"
                      type="text"
                      value={formData.debutYear}
                      onChange={handleChange}
                      placeholder="2020"
                      pattern="^\d{4}$"
                      maxLength={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: YYYY (e.g. 2020)</p>
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

                  {/* YouTube */}
                  <div>
                    <label htmlFor="social_youtube" className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube
                    </label>
                    <Input
                      id="social_youtube"
                      name="social_youtube"
                      type="text"
                      value={formData.socialMedia.youtube}
                      onChange={handleChange}
                      placeholder="@channel or channel name"
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
            </>
          )}
        </div>
      </Layout>
    </>
  );
}

