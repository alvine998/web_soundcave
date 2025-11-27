import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

export default function Profile() {
  const { success, error } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

  const [profileData, setProfileData] = useState({
    fullName: 'Admin User',
    email: 'admin@soundcave.com',
    phone: '+62 812-3456-7890',
    role: 'Super Admin',
    department: 'Management',
    location: 'Jakarta, Indonesia',
    bio: 'Passionate about music and technology. Managing SoundCave platform operations.',
    joinDate: '2024-01-01',
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferencesData, setPreferencesData] = useState({
    language: 'id',
    timezone: 'Asia/Jakarta',
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    weeklyReports: true,
  });

  const [tempProfileData, setTempProfileData] = useState(profileData);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTempProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecurityData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setPreferencesData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setPreferencesData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveProfile = () => {
    try {
      setProfileData(tempProfileData);
      setIsEditing(false);
      success('Profile Updated', 'Your profile information has been saved successfully.');
    } catch (err) {
      error('Update Failed', 'Failed to update profile. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setTempProfileData(profileData);
    setIsEditing(false);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      error('Password Mismatch', 'New password and confirmation do not match.');
      return;
    }
    if (securityData.newPassword.length < 8) {
      error('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }
    try {
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      success('Password Changed', 'Your password has been updated successfully.');
    } catch (err) {
      error('Update Failed', 'Failed to change password. Please try again.');
    }
  };

  const handleSavePreferences = () => {
    try {
      success('Preferences Saved', 'Your preferences have been updated successfully.');
    } catch (err) {
      error('Update Failed', 'Failed to save preferences. Please try again.');
    }
  };

  return (
    <>
      <Head>
        <title>Profile - SoundCave</title>
        <meta name="description" content="Manage your profile" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
            <p className="text-gray-600">Kelola informasi pribadi dan preferensi Anda</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Profile Card - Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Profile Image */}
                <div className="text-center mb-6">
                  <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                    A
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{profileData.fullName}</h2>
                  <p className="text-sm text-gray-600 mb-1">{profileData.role}</p>
                  <p className="text-xs text-gray-500">{profileData.email}</p>
                </div>

                {/* Upload Photo Button */}
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium mb-4">
                  Change Photo
                </button>

                {/* Stats */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium text-gray-900">Jan 2024</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Login</span>
                    <span className="font-medium text-gray-900">Today</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === 'profile'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    👤 Profile Information
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === 'security'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    🔒 Security
                  </button>
                  <button
                    onClick={() => setActiveTab('preferences')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === 'preferences'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    ⚙️ Preferences
                  </button>
                </div>
              </div>

              {/* Profile Information Tab */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        name="fullName"
                        value={tempProfileData.fullName}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={tempProfileData.email}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={tempProfileData.phone}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <Input
                        type="text"
                        name="role"
                        value={tempProfileData.role}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <Input
                        type="text"
                        name="department"
                        value={tempProfileData.department}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <Input
                        type="text"
                        name="location"
                        value={tempProfileData.location}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>

                    {/* Bio */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        rows={4}
                        value={tempProfileData.bio}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400 ${
                          !isEditing ? 'bg-gray-50' : ''
                        }`}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>

                  <form onSubmit={handleSavePassword}>
                    <div className="space-y-6 max-w-md">
                      {/* Current Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="password"
                          name="currentPassword"
                          value={securityData.currentPassword}
                          onChange={handleSecurityChange}
                          required
                          placeholder="Enter current password"
                        />
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="password"
                          name="newPassword"
                          value={securityData.newPassword}
                          onChange={handleSecurityChange}
                          required
                          placeholder="Enter new password"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Minimum 8 characters
                        </p>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="password"
                          name="confirmPassword"
                          value={securityData.confirmPassword}
                          onChange={handleSecurityChange}
                          required
                          placeholder="Confirm new password"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>

                  {/* Two-Factor Authentication */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h4 className="text-base font-semibold text-gray-900 mb-4">
                      Two-Factor Authentication
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Settings & Preferences</h3>

                  <div className="space-y-6">
                    {/* Language */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        name="language"
                        value={preferencesData.language}
                        onChange={handlePreferenceChange}
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                      >
                        <option value="id">Bahasa Indonesia</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    {/* Timezone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        name="timezone"
                        value={preferencesData.timezone}
                        onChange={handlePreferenceChange}
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                      >
                        <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                        <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                        <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>

                    {/* Notifications */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">Notifications</h4>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between cursor-pointer">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                            <p className="text-xs text-gray-500">Receive notifications via email</p>
                          </div>
                          <input
                            type="checkbox"
                            name="emailNotifications"
                            checked={preferencesData.emailNotifications}
                            onChange={handlePreferenceChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Push Notifications</p>
                            <p className="text-xs text-gray-500">Receive push notifications in browser</p>
                          </div>
                          <input
                            type="checkbox"
                            name="pushNotifications"
                            checked={preferencesData.pushNotifications}
                            onChange={handlePreferenceChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Marketing Emails</p>
                            <p className="text-xs text-gray-500">Receive promotional emails</p>
                          </div>
                          <input
                            type="checkbox"
                            name="marketingEmails"
                            checked={preferencesData.marketingEmails}
                            onChange={handlePreferenceChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Weekly Reports</p>
                            <p className="text-xs text-gray-500">Receive weekly performance reports</p>
                          </div>
                          <input
                            type="checkbox"
                            name="weeklyReports"
                            checked={preferencesData.weeklyReports}
                            onChange={handlePreferenceChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={handleSavePreferences}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

