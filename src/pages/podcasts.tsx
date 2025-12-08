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

interface Podcast {
  id: number;
  title: string;
  host: string;
  category: string;
  duration: string;
  releaseDate: string;
  listens: number;
  season?: number;
  episode?: number;
  description: string;
}

export default function Podcasts() {
  const { success, error, warning } = useToast();
  
  const [podcasts, setPodcasts] = useState<Podcast[]>([
    {
      id: 1,
      title: 'The Music Industry Today',
      host: 'Sarah Mitchell',
      category: 'Music Business',
      duration: '45:30',
      releaseDate: '2024-01-15',
      listens: 45000,
      season: 1,
      episode: 1,
      description: 'Discussion about the current state of music industry',
    },
    {
      id: 2,
      title: 'Behind the Beats',
      host: 'DJ Mike',
      category: 'Production',
      duration: '52:15',
      releaseDate: '2024-02-01',
      listens: 38000,
      season: 2,
      episode: 5,
      description: 'How producers create chart-topping hits',
    },
    {
      id: 3,
      title: 'Artist Spotlight: Luna Echo',
      host: 'Emma Johnson',
      category: 'Interview',
      duration: '38:45',
      releaseDate: '2024-02-15',
      listens: 52000,
      season: 1,
      episode: 12,
      description: 'Exclusive interview with rising star Luna Echo',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    host: '',
    category: '',
    duration: '',
    releaseDate: '',
    season: '',
    episode: '',
    description: '',
  });

  // Categories
  const categories = [
    'Music Business',
    'Production',
    'Interview',
    'Reviews',
    'Education',
    'News & Updates',
    'Live Sessions',
  ];

  const handleAddClick = () => {
    setFormData({
      title: '',
      host: '',
      category: '',
      duration: '',
      releaseDate: '',
      season: '',
      episode: '',
      description: '',
    });
    setIsAddModalOpen(true);
  };

  const handleEditClick = (podcast: Podcast) => {
    setSelectedPodcast(podcast);
    setFormData({
      title: podcast.title,
      host: podcast.host,
      category: podcast.category,
      duration: podcast.duration,
      releaseDate: podcast.releaseDate,
      season: podcast.season?.toString() || '',
      episode: podcast.episode?.toString() || '',
      description: podcast.description,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (podcast: Podcast) => {
    setSelectedPodcast(podcast);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPodcast: Podcast = {
        id: podcasts.length + 1,
        title: formData.title,
        host: formData.host,
        category: formData.category,
        duration: formData.duration,
        releaseDate: formData.releaseDate,
        season: formData.season ? parseInt(formData.season) : undefined,
        episode: formData.episode ? parseInt(formData.episode) : undefined,
        listens: 0,
        description: formData.description,
      };
      setPodcasts([...podcasts, newPodcast]);
      setIsAddModalOpen(false);
      success('Podcast Added', `${formData.title} has been added successfully.`);
    } catch (err) {
      error('Failed to Add Podcast', 'An error occurred. Please try again.');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPodcast) {
      try {
        setPodcasts(
          podcasts.map((podcast) =>
            podcast.id === selectedPodcast.id
              ? {
                  ...podcast,
                  title: formData.title,
                  host: formData.host,
                  category: formData.category,
                  duration: formData.duration,
                  releaseDate: formData.releaseDate,
                  season: formData.season ? parseInt(formData.season) : undefined,
                  episode: formData.episode ? parseInt(formData.episode) : undefined,
                  description: formData.description,
                }
              : podcast
          )
        );
        setIsEditModalOpen(false);
        setSelectedPodcast(null);
        success('Podcast Updated', `${formData.title} has been updated.`);
      } catch (err) {
        error('Failed to Update', 'An error occurred. Please try again.');
      }
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedPodcast) {
      try {
        const podcastTitle = selectedPodcast.title;
        setPodcasts(podcasts.filter((podcast) => podcast.id !== selectedPodcast.id));
        setIsDeleteModalOpen(false);
        setSelectedPodcast(null);
        warning('Podcast Deleted', `${podcastTitle} has been removed.`);
      } catch (err) {
        error('Failed to Delete', 'An error occurred. Please try again.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const filteredPodcasts = podcasts.filter((podcast) => {
    const matchesSearch =
      podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      podcast.host.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || podcast.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Head>
        <title>Podcasts - SoundCave</title>
        <meta name="description" content="Manage podcasts" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Podcasts</h1>
            <p className="text-gray-600">Kelola semua podcast di platform Anda</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Input
                    type="text"
                    placeholder="Cari podcast atau host..."
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

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                + Add Podcast
              </button>
            </div>
          </div>

          {/* Podcasts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPodcasts.map((podcast) => (
              <div
                key={podcast.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Cover */}
                <div className="h-48 bg-linear-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
                  <span className="text-6xl">🎙️</span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{podcast.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">by {podcast.host}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                      {podcast.category}
                    </span>
                    {podcast.season && podcast.episode && (
                      <span className="text-xs text-gray-500">
                        S{podcast.season} E{podcast.episode}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span>👂 {(podcast.listens / 1000).toFixed(0)}K listens</span>
                    <span>⏱️ {podcast.duration}</span>
                  </div>

                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{podcast.description}</p>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditClick(podcast)}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(podcast)}
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
          {filteredPodcasts.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <span className="text-6xl mb-4 block">🎙️</span>
              <p className="text-gray-600">No podcasts found</p>
            </div>
          )}
        </div>
      </Layout>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>Add Podcast Episode</DialogTitle>
              <DialogDescription>Upload a new podcast episode</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div className="md:col-span-2">
                <label htmlFor="add-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Episode Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="add-title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. The Music Industry Today"
                />
              </div>

              <div>
                <label htmlFor="add-host" className="block text-sm font-medium text-gray-700 mb-2">
                  Host <span className="text-red-500">*</span>
                </label>
                <Input
                  id="add-host"
                  name="host"
                  required
                  value={formData.host}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label htmlFor="add-category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="add-category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="add-season" className="block text-sm font-medium text-gray-700 mb-2">
                  Season
                </label>
                <Input
                  id="add-season"
                  name="season"
                  type="number"
                  value={formData.season}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                />
              </div>

              <div>
                <label htmlFor="add-episode" className="block text-sm font-medium text-gray-700 mb-2">
                  Episode
                </label>
                <Input
                  id="add-episode"
                  name="episode"
                  type="number"
                  value={formData.episode}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                />
              </div>

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
                  placeholder="e.g. 45:30"
                />
              </div>

              <div>
                <label htmlFor="add-date" className="block text-sm font-medium text-gray-700 mb-2">
                  Release Date <span className="text-red-500">*</span>
                </label>
                <Input
                  id="add-date"
                  name="releaseDate"
                  type="date"
                  required
                  value={formData.releaseDate}
                  onChange={handleChange}
                />
              </div>

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
                  rows={3}
                  placeholder="Enter episode description..."
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
                Add Podcast
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Podcast Episode</DialogTitle>
              <DialogDescription>Update podcast episode information</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div className="md:col-span-2">
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Episode Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. The Music Industry Today"
                />
              </div>

              <div>
                <label htmlFor="edit-host" className="block text-sm font-medium text-gray-700 mb-2">
                  Host <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-host"
                  name="host"
                  required
                  value={formData.host}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="edit-category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edit-season" className="block text-sm font-medium text-gray-700 mb-2">
                  Season
                </label>
                <Input
                  id="edit-season"
                  name="season"
                  type="number"
                  value={formData.season}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                />
              </div>

              <div>
                <label htmlFor="edit-episode" className="block text-sm font-medium text-gray-700 mb-2">
                  Episode
                </label>
                <Input
                  id="edit-episode"
                  name="episode"
                  type="number"
                  value={formData.episode}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                />
              </div>

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
                  placeholder="e.g. 45:30"
                />
              </div>

              <div>
                <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 mb-2">
                  Release Date <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-date"
                  name="releaseDate"
                  type="date"
                  required
                  value={formData.releaseDate}
                  onChange={handleChange}
                />
              </div>

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
                  rows={3}
                  placeholder="Enter episode description..."
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
                Update Podcast
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Podcast</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this podcast episode?
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
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            {selectedPodcast && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Episode: <span className="font-medium text-gray-900">{selectedPodcast.title}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Host: <span className="font-medium text-gray-900">{selectedPodcast.host}</span>
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
              Delete Podcast
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

