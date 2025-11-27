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

interface MusicVideo {
  id: number;
  title: string;
  artist: string;
  director: string;
  duration: string;
  releaseDate: string;
  views: number;
  description: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export default function MusicVideos() {
  const { success, error, warning } = useToast();
  
  const [videos, setVideos] = useState<MusicVideo[]>([
    {
      id: 1,
      title: 'Summer Vibes',
      artist: 'The Waves',
      director: 'John Smith',
      duration: '3:45',
      releaseDate: '2024-01-15',
      views: 1250000,
      description: 'Official music video for Summer Vibes featuring beach scenes',
    },
    {
      id: 2,
      title: 'Midnight Dreams',
      artist: 'Luna Echo',
      duration: '4:12',
      director: 'Sarah Johnson',
      releaseDate: '2024-02-10',
      views: 890000,
      description: 'A visual journey through neon-lit cityscapes',
    },
    {
      id: 3,
      title: 'Ocean Waves',
      artist: 'Nature Sounds',
      director: 'Mike Chen',
      duration: '3:28',
      releaseDate: '2024-01-20',
      views: 650000,
      description: 'Calming visuals paired with ambient ocean sounds',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<MusicVideo | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    director: '',
    duration: '',
    releaseDate: '',
    description: '',
  });

  // Available artists
  const availableArtists = [
    'The Waves',
    'Luna Echo',
    'Nature Sounds',
    'Urban Beats',
    'Classical Masters',
    'Thunder Strike',
  ];

  const handleAddClick = () => {
    setFormData({
      title: '',
      artist: '',
      director: '',
      duration: '',
      releaseDate: '',
      description: '',
    });
    setIsAddModalOpen(true);
  };

  const handleEditClick = (video: MusicVideo) => {
    setSelectedVideo(video);
    setFormData({
      title: video.title,
      artist: video.artist,
      director: video.director,
      duration: video.duration,
      releaseDate: video.releaseDate,
      description: video.description,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (video: MusicVideo) => {
    setSelectedVideo(video);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newVideo: MusicVideo = {
        id: videos.length + 1,
        title: formData.title,
        artist: formData.artist,
        director: formData.director,
        duration: formData.duration,
        releaseDate: formData.releaseDate,
        views: 0,
        description: formData.description,
      };
      setVideos([...videos, newVideo]);
      setIsAddModalOpen(false);
      setFormData({
        title: '',
        artist: '',
        director: '',
        duration: '',
        releaseDate: '',
        description: '',
      });
      success('Music Video Added', `${formData.title} has been added successfully.`);
    } catch (err) {
      error('Failed to Add Video', 'An error occurred. Please try again.');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVideo) {
      try {
        setVideos(
          videos.map((video) =>
            video.id === selectedVideo.id
              ? {
                  ...video,
                  title: formData.title,
                  artist: formData.artist,
                  director: formData.director,
                  duration: formData.duration,
                  releaseDate: formData.releaseDate,
                  description: formData.description,
                }
              : video
          )
        );
        setIsEditModalOpen(false);
        setSelectedVideo(null);
        success('Video Updated', `${formData.title} has been updated.`);
      } catch (err) {
        error('Failed to Update', 'An error occurred. Please try again.');
      }
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedVideo) {
      try {
        const videoTitle = selectedVideo.title;
        setVideos(videos.filter((video) => video.id !== selectedVideo.id));
        setIsDeleteModalOpen(false);
        setSelectedVideo(null);
        warning('Video Deleted', `${videoTitle} has been removed.`);
      } catch (err) {
        error('Failed to Delete', 'An error occurred. Please try again.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Music Videos - SoundCave</title>
        <meta name="description" content="Manage music videos" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Music Videos</h1>
            <p className="text-gray-600">Kelola semua music video di platform Anda</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🎬</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
              <p className="text-sm text-gray-600">Total Videos</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">👁️</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {(videos.reduce((acc, v) => acc + v.views, 0) / 1000000).toFixed(1)}M
              </p>
              <p className="text-sm text-gray-600">Total Views</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🎤</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(videos.map((v) => v.artist)).size}
              </p>
              <p className="text-sm text-gray-600">Artists</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {new Date().getFullYear()}
              </p>
              <p className="text-sm text-gray-600">Current Year</p>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Cari video atau artist..."
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
                + Add Video
              </button>
            </div>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div className="h-48 bg-linear-to-br from-red-400 to-pink-600 flex items-center justify-center">
                  <span className="text-6xl">🎬</span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{video.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{video.artist}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span>👁️ {(video.views / 1000).toFixed(0)}K views</span>
                    <span>⏱️ {video.duration}</span>
                  </div>

                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{video.description}</p>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditClick(video)}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(video)}
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
          {filteredVideos.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <span className="text-6xl mb-4 block">🎬</span>
              <p className="text-gray-600">No music videos found</p>
            </div>
          )}
        </div>
      </Layout>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>Add Music Video</DialogTitle>
              <DialogDescription>Upload a new music video to your platform</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div>
                <label htmlFor="add-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Video Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="add-title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Summer Vibes"
                />
              </div>

              <div>
                <label htmlFor="add-artist" className="block text-sm font-medium text-gray-700 mb-2">
                  Artist <span className="text-red-500">*</span>
                </label>
                <select
                  id="add-artist"
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

              <div>
                <label htmlFor="add-director" className="block text-sm font-medium text-gray-700 mb-2">
                  Director <span className="text-red-500">*</span>
                </label>
                <Input
                  id="add-director"
                  name="director"
                  required
                  value={formData.director}
                  onChange={handleChange}
                  placeholder="e.g. John Smith"
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
                  placeholder="e.g. 3:45"
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
                  placeholder="Enter video description..."
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
                Add Video
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
              <DialogTitle>Edit Music Video</DialogTitle>
              <DialogDescription>Update music video information</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Video Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Summer Vibes"
                />
              </div>

              <div>
                <label htmlFor="edit-artist" className="block text-sm font-medium text-gray-700 mb-2">
                  Artist <span className="text-red-500">*</span>
                </label>
                <select
                  id="edit-artist"
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

              <div>
                <label htmlFor="edit-director" className="block text-sm font-medium text-gray-700 mb-2">
                  Director <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-director"
                  name="director"
                  required
                  value={formData.director}
                  onChange={handleChange}
                  placeholder="e.g. John Smith"
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
                  placeholder="e.g. 3:45"
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
                  placeholder="Enter video description..."
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
                Update Video
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Music Video</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this music video?
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

            {selectedVideo && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Video: <span className="font-medium text-gray-900">{selectedVideo.title}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Artist: <span className="font-medium text-gray-900">{selectedVideo.artist}</span>
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
              Delete Video
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

