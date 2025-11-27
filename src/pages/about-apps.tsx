import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

export default function AboutApps() {
  const { success, error } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const [appData, setAppData] = useState({
    appName: 'SoundCave',
    tagline: 'Your Ultimate Music Streaming Platform',
    description: 'SoundCave adalah platform streaming musik terlengkap di Indonesia. Nikmati jutaan lagu dari berbagai genre, artis lokal dan internasional, podcast eksklusif, dan video musik berkualitas tinggi. Dengan fitur playlist personal, rekomendasi AI, dan audio berkualitas lossless.',
    version: '1.0.0',
    launchDate: '2024-01-01',
    
    // Contact Information
    email: 'support@soundcave.com',
    phone: '+62 21-1234-5678',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat 10220, Indonesia',
    
    // Social Media
    facebook: 'https://facebook.com/soundcave',
    instagram: 'https://instagram.com/soundcave',
    twitter: 'https://twitter.com/soundcave',
    youtube: 'https://youtube.com/soundcave',
    linkedin: 'https://linkedin.com/company/soundcave',
    
    // App Links
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.soundcave',
    appStoreUrl: 'https://apps.apple.com/app/soundcave/id123456789',
    
    // Legal & Support
    privacyPolicyUrl: '/privacy-policy',
    termsOfServiceUrl: '/terms-of-service',
    supportUrl: '/support',
    
    // Features
    features: [
      'Streaming musik unlimited',
      'Kualitas audio lossless hingga 320kbps',
      'Offline mode untuk Premium users',
      'Playlist personal dan rekomendasi AI',
      'Music videos dan podcasts',
      'Lyrics sync dengan musik',
      'Cross-platform support',
      'Family sharing untuk paket keluarga',
    ],
    
    // Stats
    totalUsers: '1,000,000+',
    totalSongs: '50 juta+',
    totalArtists: '500,000+',
    totalPodcasts: '10,000+',
  });

  const [tempAppData, setTempAppData] = useState(appData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTempAppData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...tempAppData.features];
    newFeatures[index] = value;
    setTempAppData((prev) => ({ ...prev, features: newFeatures }));
  };

  const handleAddFeature = () => {
    setTempAppData((prev) => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = tempAppData.features.filter((_, i) => i !== index);
    setTempAppData((prev) => ({ ...prev, features: newFeatures }));
  };

  const handleSave = () => {
    try {
      setAppData(tempAppData);
      setIsEditing(false);
      success('App Info Updated', 'Application information has been saved successfully.');
    } catch (err) {
      error('Update Failed', 'Failed to update app information. Please try again.');
    }
  };

  const handleCancel = () => {
    setTempAppData(appData);
    setIsEditing(false);
  };

  return (
    <>
      <Head>
        <title>About Apps - SoundCave</title>
        <meta name="description" content="Manage application information" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">About Application</h1>
            <p className="text-gray-600">Kelola informasi dan deskripsi aplikasi SoundCave</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">👥</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{appData.totalUsers}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🎵</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{appData.totalSongs}</p>
              <p className="text-sm text-gray-600">Total Songs</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🎤</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{appData.totalArtists}</p>
              <p className="text-sm text-gray-600">Total Artists</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🎙️</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{appData.totalPodcasts}</p>
              <p className="text-sm text-gray-600">Total Podcasts</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Edit Information
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* App Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    App Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="appName"
                    value={tempAppData.appName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tagline <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="tagline"
                    value={tempAppData.tagline}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>

                {/* Version */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Version
                  </label>
                  <Input
                    type="text"
                    name="version"
                    value={tempAppData.version}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>

                {/* Launch Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Launch Date
                  </label>
                  <Input
                    type="date"
                    name="launchDate"
                    value={tempAppData.launchDate}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    value={tempAppData.description}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400 ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                    placeholder="Enter app description..."
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={tempAppData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={tempAppData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="address"
                    value={tempAppData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Social Media Links</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Facebook */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📘 Facebook
                  </label>
                  <Input
                    type="url"
                    name="facebook"
                    value={tempAppData.facebook}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="https://facebook.com/..."
                  />
                </div>

                {/* Instagram */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📸 Instagram
                  </label>
                  <Input
                    type="url"
                    name="instagram"
                    value={tempAppData.instagram}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="https://instagram.com/..."
                  />
                </div>

                {/* Twitter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🐦 Twitter/X
                  </label>
                  <Input
                    type="url"
                    name="twitter"
                    value={tempAppData.twitter}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="https://twitter.com/..."
                  />
                </div>

                {/* YouTube */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🎥 YouTube
                  </label>
                  <Input
                    type="url"
                    name="youtube"
                    value={tempAppData.youtube}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="https://youtube.com/..."
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💼 LinkedIn
                  </label>
                  <Input
                    type="url"
                    name="linkedin"
                    value={tempAppData.linkedin}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
              </div>
            </div>

            {/* App Download Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">App Download Links</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Play Store */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📱 Google Play Store
                  </label>
                  <Input
                    type="url"
                    name="playStoreUrl"
                    value={tempAppData.playStoreUrl}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="https://play.google.com/..."
                  />
                </div>

                {/* App Store */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🍎 Apple App Store
                  </label>
                  <Input
                    type="url"
                    name="appStoreUrl"
                    value={tempAppData.appStoreUrl}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="https://apps.apple.com/..."
                  />
                </div>
              </div>
            </div>

            {/* Legal & Support Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Legal & Support</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Privacy Policy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🔒 Privacy Policy URL
                  </label>
                  <Input
                    type="text"
                    name="privacyPolicyUrl"
                    value={tempAppData.privacyPolicyUrl}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="/privacy-policy"
                  />
                </div>

                {/* Terms of Service */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📄 Terms of Service URL
                  </label>
                  <Input
                    type="text"
                    name="termsOfServiceUrl"
                    value={tempAppData.termsOfServiceUrl}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="/terms-of-service"
                  />
                </div>

                {/* Support */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💬 Support URL
                  </label>
                  <Input
                    type="text"
                    name="supportUrl"
                    value={tempAppData.supportUrl}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="/support"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Key Features</h3>
                {isEditing && (
                  <button
                    onClick={handleAddFeature}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    + Add Feature
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {tempAppData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-blue-600 font-bold shrink-0">✓</span>
                    <Input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      disabled={!isEditing}
                      className={`flex-1 ${!isEditing ? 'bg-gray-50' : ''}`}
                      placeholder="Enter feature..."
                    />
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveFeature(index)}
                        className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm shrink-0"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Statistics</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Users */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Users
                  </label>
                  <Input
                    type="text"
                    name="totalUsers"
                    value={tempAppData.totalUsers}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="e.g. 1,000,000+"
                  />
                </div>

                {/* Total Songs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Songs
                  </label>
                  <Input
                    type="text"
                    name="totalSongs"
                    value={tempAppData.totalSongs}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="e.g. 50 juta+"
                  />
                </div>

                {/* Total Artists */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Artists
                  </label>
                  <Input
                    type="text"
                    name="totalArtists"
                    value={tempAppData.totalArtists}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="e.g. 500,000+"
                  />
                </div>

                {/* Total Podcasts */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Podcasts
                  </label>
                  <Input
                    type="text"
                    name="totalPodcasts"
                    value={tempAppData.totalPodcasts}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="e.g. 10,000+"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

