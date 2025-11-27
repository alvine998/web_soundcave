import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Subscription {
  id: number;
  name: string;
  price: string;
  duration: string;
  features: string[];
  maxDownloads: number;
  maxPlaylists: number;
  audioQuality: string;
  adsEnabled: boolean;
  offlineMode: boolean;
  isPopular: boolean;
  description: string;
}

export default function Subscriptions() {
  const { success, error, warning } = useToast();
  
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: 1,
      name: 'Free',
      price: 'Rp 0',
      duration: 'Forever',
      features: ['Basic streaming', 'Limited skips', 'Standard quality'],
      maxDownloads: 0,
      maxPlaylists: 5,
      audioQuality: 'Standard (128kbps)',
      adsEnabled: true,
      offlineMode: false,
      isPopular: false,
      description: 'Perfect for casual listeners',
    },
    {
      id: 2,
      name: 'Basic',
      price: 'Rp 50.000',
      duration: '1 Month',
      features: ['Ad-free listening', 'Unlimited skips', 'High quality audio', 'Offline downloads'],
      maxDownloads: 50,
      maxPlaylists: 20,
      audioQuality: 'High (256kbps)',
      adsEnabled: false,
      offlineMode: true,
      isPopular: false,
      description: 'Great for regular listeners',
    },
    {
      id: 3,
      name: 'Premium',
      price: 'Rp 150.000',
      duration: '1 Month',
      features: ['Everything in Basic', 'Highest quality audio', 'Unlimited downloads', 'Early access to new releases', 'Exclusive content'],
      maxDownloads: -1,
      maxPlaylists: -1,
      audioQuality: 'Lossless (320kbps)',
      adsEnabled: false,
      offlineMode: true,
      isPopular: true,
      description: 'Best value for music enthusiasts',
    },
    {
      id: 4,
      name: 'Family',
      price: 'Rp 250.000',
      duration: '1 Month',
      features: ['Up to 6 accounts', 'All Premium features', 'Family mix playlist', 'Parental controls'],
      maxDownloads: -1,
      maxPlaylists: -1,
      audioQuality: 'Lossless (320kbps)',
      adsEnabled: false,
      offlineMode: true,
      isPopular: false,
      description: 'Perfect for the whole family',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    features: '',
    maxDownloads: '',
    maxPlaylists: '',
    audioQuality: '',
    adsEnabled: 'false',
    offlineMode: 'false',
    isPopular: 'false',
    description: '',
  });

  const handleAddClick = () => {
    setFormData({
      name: '',
      price: '',
      duration: '',
      features: '',
      maxDownloads: '',
      maxPlaylists: '',
      audioQuality: '',
      adsEnabled: 'false',
      offlineMode: 'false',
      isPopular: 'false',
      description: '',
    });
    setIsAddModalOpen(true);
  };

  const handleEditClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setFormData({
      name: subscription.name,
      price: subscription.price,
      duration: subscription.duration,
      features: subscription.features.join(', '),
      maxDownloads: subscription.maxDownloads.toString(),
      maxPlaylists: subscription.maxPlaylists.toString(),
      audioQuality: subscription.audioQuality,
      adsEnabled: subscription.adsEnabled.toString(),
      offlineMode: subscription.offlineMode.toString(),
      isPopular: subscription.isPopular.toString(),
      description: subscription.description,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newSubscription: Subscription = {
        id: subscriptions.length + 1,
        name: formData.name,
        price: formData.price,
        duration: formData.duration,
        features: formData.features.split(',').map((f) => f.trim()),
        maxDownloads: parseInt(formData.maxDownloads),
        maxPlaylists: parseInt(formData.maxPlaylists),
        audioQuality: formData.audioQuality,
        adsEnabled: formData.adsEnabled === 'true',
        offlineMode: formData.offlineMode === 'true',
        isPopular: formData.isPopular === 'true',
        description: formData.description,
      };
      setSubscriptions([...subscriptions, newSubscription]);
      setIsAddModalOpen(false);
      success('Subscription Added', `${formData.name} plan has been created successfully.`);
    } catch (err) {
      error('Failed to Add Subscription', 'An error occurred. Please try again.');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubscription) {
      try {
        setSubscriptions(
          subscriptions.map((subscription) =>
            subscription.id === selectedSubscription.id
              ? {
                  ...subscription,
                  name: formData.name,
                  price: formData.price,
                  duration: formData.duration,
                  features: formData.features.split(',').map((f) => f.trim()),
                  maxDownloads: parseInt(formData.maxDownloads),
                  maxPlaylists: parseInt(formData.maxPlaylists),
                  audioQuality: formData.audioQuality,
                  adsEnabled: formData.adsEnabled === 'true',
                  offlineMode: formData.offlineMode === 'true',
                  isPopular: formData.isPopular === 'true',
                  description: formData.description,
                }
              : subscription
          )
        );
        setIsEditModalOpen(false);
        setSelectedSubscription(null);
        success('Subscription Updated', `${formData.name} plan has been updated.`);
      } catch (err) {
        error('Failed to Update', 'An error occurred. Please try again.');
      }
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedSubscription) {
      try {
        const subName = selectedSubscription.name;
        setSubscriptions(subscriptions.filter((sub) => sub.id !== selectedSubscription.id));
        setIsDeleteModalOpen(false);
        setSelectedSubscription(null);
        warning('Subscription Deleted', `${subName} plan has been removed.`);
      } catch (err) {
        error('Failed to Delete', 'An error occurred. Please try again.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const filteredSubscriptions = subscriptions.filter((sub) =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Subscriptions - SoundCave</title>
        <meta name="description" content="Manage subscription plans" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Plans</h1>
            <p className="text-gray-600">Kelola semua paket langganan di platform Anda</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">💳</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{subscriptions.length}</p>
              <p className="text-sm text-gray-600">Total Plans</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">⭐</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {subscriptions.filter((s) => s.isPopular).length}
              </p>
              <p className="text-sm text-gray-600">Popular Plans</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🎵</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {subscriptions.filter((s) => !s.adsEnabled).length}
              </p>
              <p className="text-sm text-gray-600">Ad-Free Plans</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {subscriptions.filter((s) => s.price !== 'Rp 0').length}
              </p>
              <p className="text-sm text-gray-600">Paid Plans</p>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Cari subscription plan..."
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

              <button
                onClick={handleAddClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                + Add Plan
              </button>
            </div>
          </div>

          {/* Subscription Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredSubscriptions.map((sub) => (
              <div
                key={sub.id}
                className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden hover:shadow-lg transition-all ${
                  sub.isPopular ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                {/* Popular Badge */}
                {sub.isPopular && (
                  <div className="bg-blue-600 text-white text-center py-2 text-xs font-semibold">
                    ⭐ MOST POPULAR
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{sub.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-blue-600">{sub.price}</span>
                    <span className="text-sm text-gray-600">/{sub.duration}</span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{sub.description}</p>

                  {/* Features List */}
                  <div className="space-y-2 mb-6">
                    {sub.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <svg
                          className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-6 text-xs text-gray-600">
                    <p>🎵 Audio: {sub.audioQuality}</p>
                    <p>
                      📥 Downloads:{' '}
                      {sub.maxDownloads === -1 ? 'Unlimited' : sub.maxDownloads}
                    </p>
                    <p>
                      📝 Playlists:{' '}
                      {sub.maxPlaylists === -1 ? 'Unlimited' : sub.maxPlaylists}
                    </p>
                    <p>
                      {sub.adsEnabled ? '⚠️ Contains Ads' : '✓ Ad-Free'}
                    </p>
                    <p>
                      {sub.offlineMode ? '✓ Offline Mode' : '✕ Online Only'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditClick(sub)}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(sub)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredSubscriptions.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <span className="text-6xl mb-4 block">💳</span>
              <p className="text-gray-600">No subscription plans found</p>
            </div>
          )}
        </div>
      </Layout>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>Add Subscription Plan</DialogTitle>
              <DialogDescription>Create a new subscription plan</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              {/* Plan Name */}
              <div>
                <label htmlFor="add-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="add-name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Premium"
                />
              </div>

              {/* Price */}
              <div>
                <label htmlFor="add-price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <Input
                  id="add-price"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. Rp 150.000"
                />
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="add-duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration <span className="text-red-500">*</span>
                </label>
                <Input
                  id="add-duration"
                  name="duration"
                  required
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 1 Month"
                />
              </div>

              {/* Audio Quality */}
              <div>
                <label htmlFor="add-quality" className="block text-sm font-medium text-gray-700 mb-2">
                  Audio Quality <span className="text-red-500">*</span>
                </label>
                <select
                  id="add-quality"
                  name="audioQuality"
                  required
                  value={formData.audioQuality}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="">Select quality</option>
                  <option value="Standard (128kbps)">Standard (128kbps)</option>
                  <option value="High (256kbps)">High (256kbps)</option>
                  <option value="Lossless (320kbps)">Lossless (320kbps)</option>
                </select>
              </div>

              {/* Max Downloads */}
              <div>
                <label htmlFor="add-downloads" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Downloads <span className="text-red-500">*</span>
                </label>
                <Input
                  id="add-downloads"
                  name="maxDownloads"
                  type="number"
                  required
                  value={formData.maxDownloads}
                  onChange={handleChange}
                  placeholder="-1 for unlimited"
                />
              </div>

              {/* Max Playlists */}
              <div>
                <label htmlFor="add-playlists" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Playlists <span className="text-red-500">*</span>
                </label>
                <Input
                  id="add-playlists"
                  name="maxPlaylists"
                  type="number"
                  required
                  value={formData.maxPlaylists}
                  onChange={handleChange}
                  placeholder="-1 for unlimited"
                />
              </div>

              {/* Ads Enabled */}
              <div>
                <label htmlFor="add-ads" className="block text-sm font-medium text-gray-700 mb-2">
                  Ads Enabled <span className="text-red-500">*</span>
                </label>
                <select
                  id="add-ads"
                  name="adsEnabled"
                  required
                  value={formData.adsEnabled}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              {/* Offline Mode */}
              <div>
                <label htmlFor="add-offline" className="block text-sm font-medium text-gray-700 mb-2">
                  Offline Mode <span className="text-red-500">*</span>
                </label>
                <select
                  id="add-offline"
                  name="offlineMode"
                  required
                  value={formData.offlineMode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              {/* Is Popular */}
              <div>
                <label htmlFor="add-popular" className="block text-sm font-medium text-gray-700 mb-2">
                  Mark as Popular
                </label>
                <select
                  id="add-popular"
                  name="isPopular"
                  value={formData.isPopular}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              {/* Features */}
              <div className="md:col-span-2">
                <label htmlFor="add-features" className="block text-sm font-medium text-gray-700 mb-2">
                  Features <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(comma-separated)</span>
                </label>
                <textarea
                  id="add-features"
                  name="features"
                  required
                  value={formData.features}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. Ad-free listening, Unlimited skips, High quality"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="add-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="add-description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Enter plan description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Add Plan
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Subscription Plan</DialogTitle>
              <DialogDescription>Update subscription plan details</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              {/* Plan Name */}
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Premium"
                />
              </div>

              {/* Price */}
              <div>
                <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-price"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. Rp 150.000"
                />
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="edit-duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-duration"
                  name="duration"
                  required
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 1 Month"
                />
              </div>

              {/* Audio Quality */}
              <div>
                <label htmlFor="edit-quality" className="block text-sm font-medium text-gray-700 mb-2">
                  Audio Quality <span className="text-red-500">*</span>
                </label>
                <select
                  id="edit-quality"
                  name="audioQuality"
                  required
                  value={formData.audioQuality}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="">Select quality</option>
                  <option value="Standard (128kbps)">Standard (128kbps)</option>
                  <option value="High (256kbps)">High (256kbps)</option>
                  <option value="Lossless (320kbps)">Lossless (320kbps)</option>
                </select>
              </div>

              {/* Max Downloads */}
              <div>
                <label htmlFor="edit-downloads" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Downloads <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-downloads"
                  name="maxDownloads"
                  type="number"
                  required
                  value={formData.maxDownloads}
                  onChange={handleChange}
                  placeholder="-1 for unlimited"
                />
              </div>

              {/* Max Playlists */}
              <div>
                <label htmlFor="edit-playlists" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Playlists <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-playlists"
                  name="maxPlaylists"
                  type="number"
                  required
                  value={formData.maxPlaylists}
                  onChange={handleChange}
                  placeholder="-1 for unlimited"
                />
              </div>

              {/* Ads Enabled */}
              <div>
                <label htmlFor="edit-ads" className="block text-sm font-medium text-gray-700 mb-2">
                  Ads Enabled <span className="text-red-500">*</span>
                </label>
                <select
                  id="edit-ads"
                  name="adsEnabled"
                  required
                  value={formData.adsEnabled}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              {/* Offline Mode */}
              <div>
                <label htmlFor="edit-offline" className="block text-sm font-medium text-gray-700 mb-2">
                  Offline Mode <span className="text-red-500">*</span>
                </label>
                <select
                  id="edit-offline"
                  name="offlineMode"
                  required
                  value={formData.offlineMode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              {/* Is Popular */}
              <div>
                <label htmlFor="edit-popular" className="block text-sm font-medium text-gray-700 mb-2">
                  Mark as Popular
                </label>
                <select
                  id="edit-popular"
                  name="isPopular"
                  value={formData.isPopular}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              {/* Features */}
              <div className="md:col-span-2">
                <label htmlFor="edit-features" className="block text-sm font-medium text-gray-700 mb-2">
                  Features <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(comma-separated)</span>
                </label>
                <textarea
                  id="edit-features"
                  name="features"
                  required
                  value={formData.features}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. Ad-free listening, Unlimited skips, High quality"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Enter plan description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Update Plan
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subscription Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subscription plan?
            </DialogDescription>
          </DialogHeader>

          <div className="my-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-600 mt-0.5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-900">Warning</p>
                  <p className="text-sm text-red-700 mt-1">
                    Deleting this plan will affect all users subscribed to it.
                  </p>
                </div>
              </div>
            </div>

            {selectedSubscription && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Plan: <span className="font-medium text-gray-900">{selectedSubscription.name}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Price: <span className="font-medium text-gray-900">{selectedSubscription.price}</span>
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Delete Plan
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

