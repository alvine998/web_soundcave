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

interface Album {
  id: number;
  title: string;
  artist: string;
  genre: string;
  type: string;
  releaseYear: string;
  trackCount: number;
  duration: string;
  description: string;
  coverImage?: string;
}

export default function Albums() {
  const { success, error, warning } = useToast();
  
  const [albums, setAlbums] = useState<Album[]>([
    {
      id: 1,
      title: 'Beach Season',
      artist: 'The Waves',
      genre: 'Pop',
      type: 'Album',
      releaseYear: '2023',
      trackCount: 12,
      duration: '45:30',
      description: 'A summer collection of beach-inspired melodies',
    },
    {
      id: 2,
      title: 'Night Tales',
      artist: 'Luna Echo',
      genre: 'Electronic',
      type: 'Album',
      releaseYear: '2024',
      trackCount: 10,
      duration: '42:15',
      description: 'Electronic soundscapes for midnight listening',
    },
    {
      id: 3,
      title: 'Calm Collection',
      artist: 'Nature Sounds',
      genre: 'Ambient',
      type: 'Compilation',
      releaseYear: '2023',
      trackCount: 15,
      duration: '52:20',
      description: 'Peaceful ambient tracks for relaxation',
    },
    {
      id: 4,
      title: 'Street Life',
      artist: 'Urban Beats',
      genre: 'Hip Hop',
      type: 'Album',
      releaseYear: '2024',
      trackCount: 14,
      duration: '48:45',
      description: 'Urban stories told through beats and rhymes',
    },
    {
      id: 5,
      title: 'Timeless Classics',
      artist: 'Classical Masters',
      genre: 'Classical',
      type: 'Album',
      releaseYear: '2023',
      trackCount: 20,
      duration: '78:30',
      description: 'A collection of classical masterpieces',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterArtist, setFilterArtist] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: '',
    type: '',
    releaseYear: '',
    trackCount: '',
    duration: '',
    description: '',
  });

  // Get unique artists for filter
  const uniqueArtists = ['all', ...new Set(albums.map((album) => album.artist))];
  const genres = ['Pop', 'Rock', 'Jazz', 'Electronic', 'Hip Hop', 'Classical', 'Ambient', 'R&B'];
  
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

  // Album types
  const albumTypes = ['Single', 'EP', 'Album', 'Compilation', 'Live Album', 'Remix Album'];

  const handleAddClick = () => {
    setFormData({
      title: '',
      artist: '',
      genre: '',
      type: '',
      releaseYear: '',
      trackCount: '',
      duration: '',
      description: '',
    });
    setIsAddModalOpen(true);
  };

  const handleEditClick = (album: Album) => {
    setSelectedAlbum(album);
    setFormData({
      title: album.title,
      artist: album.artist,
      genre: album.genre,
      type: album.type,
      releaseYear: album.releaseYear,
      trackCount: album.trackCount.toString(),
      duration: album.duration,
      description: album.description,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (album: Album) => {
    setSelectedAlbum(album);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newAlbum: Album = {
        id: albums.length + 1,
        title: formData.title,
        artist: formData.artist,
        genre: formData.genre,
        type: formData.type,
        releaseYear: formData.releaseYear,
        trackCount: parseInt(formData.trackCount),
        duration: formData.duration,
        description: formData.description,
      };
      setAlbums([...albums, newAlbum]);
      setIsAddModalOpen(false);
      setFormData({
        title: '',
        artist: '',
        genre: '',
        type: '',
        releaseYear: '',
        trackCount: '',
        duration: '',
        description: '',
      });
      success('Album Added Successfully', `${formData.title} by ${formData.artist} has been added.`);
    } catch (err) {
      error('Failed to Add Album', 'An error occurred while adding the album. Please try again.');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAlbum) {
      try {
        setAlbums(
          albums.map((album) =>
            album.id === selectedAlbum.id
              ? {
                  ...album,
                  title: formData.title,
                  artist: formData.artist,
                  genre: formData.genre,
                  type: formData.type,
                  releaseYear: formData.releaseYear,
                  trackCount: parseInt(formData.trackCount),
                  duration: formData.duration,
                  description: formData.description,
                }
              : album
          )
        );
        setIsEditModalOpen(false);
        setSelectedAlbum(null);
        setFormData({
          title: '',
          artist: '',
          genre: '',
          type: '',
          releaseYear: '',
          trackCount: '',
          duration: '',
          description: '',
        });
        success('Album Updated Successfully', `${formData.title} has been updated.`);
      } catch (err) {
        error('Failed to Update Album', 'An error occurred while updating the album. Please try again.');
      }
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedAlbum) {
      try {
        const albumTitle = selectedAlbum.title;
        setAlbums(albums.filter((album) => album.id !== selectedAlbum.id));
        setIsDeleteModalOpen(false);
        setSelectedAlbum(null);
        warning('Album Deleted', `${albumTitle} has been removed from your album list.`);
      } catch (err) {
        error('Failed to Delete Album', 'An error occurred while deleting the album. Please try again.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const filteredAlbums = albums.filter((album) => {
    const matchesSearch =
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArtist = filterArtist === 'all' || album.artist === filterArtist;
    return matchesSearch && matchesArtist;
  });

  return (
    <>
      <Head>
        <title>Albums - SoundCave</title>
        <meta name="description" content="Manage music albums" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Album Management</h1>
            <p className="text-gray-600">Kelola semua album dari berbagai artist</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">💿</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{albums.length}</p>
              <p className="text-sm text-gray-600">Total Albums</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🎤</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(albums.map((a) => a.artist)).size}
              </p>
              <p className="text-sm text-gray-600">Artists</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🎵</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {albums.reduce((acc, album) => acc + album.trackCount, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Tracks</p>
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

          {/* Filters and Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Input
                    type="text"
                    placeholder="Cari album atau artist..."
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
                  value={filterArtist}
                  onChange={(e) => setFilterArtist(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="all">All Artists</option>
                  {uniqueArtists.slice(1).map((artist) => (
                    <option key={artist} value={artist}>
                      {artist}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                + Add Album
              </button>
            </div>
          </div>

          {/* Albums Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Album
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Genre
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tracks
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAlbums.map((album) => (
                    <tr key={album.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center shrink-0">
                            <span className="text-xl">💿</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{album.title}</p>
                            <p className="text-xs text-gray-500">{album.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">{album.artist}</td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          {album.genre}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                          {album.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">{album.releaseYear}</td>
                      <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                        {album.trackCount}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">{album.duration}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleEditClick(album)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(album)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredAlbums.length === 0 && (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">💿</span>
                <p className="text-gray-600">No albums found</p>
              </div>
            )}
          </div>
        </div>
      </Layout>

      {/* Add Album Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>Add New Album</DialogTitle>
              <DialogDescription>Tambahkan album baru ke platform Anda</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div>
                <label htmlFor="add-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Album Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="add-title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Beach Season"
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
                <label htmlFor="add-genre" className="block text-sm font-medium text-gray-700 mb-2">
                  Genre <span className="text-red-500">*</span>
                </label>
                <select
                  id="add-genre"
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

              <div>
                <label htmlFor="add-type" className="block text-sm font-medium text-gray-700 mb-2">
                  Album Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="add-type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="">Select type</option>
                  {albumTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="add-year" className="block text-sm font-medium text-gray-700 mb-2">
                  Release Year <span className="text-red-500">*</span>
                </label>
                <Input
                  id="add-year"
                  name="releaseYear"
                  type="text"
                  required
                  value={formData.releaseYear}
                  onChange={handleChange}
                  placeholder="e.g. 2024"
                />
              </div>

              <div>
                <label htmlFor="add-tracks" className="block text-sm font-medium text-gray-700 mb-2">
                  Track Count <span className="text-red-500">*</span>
                </label>
                <Input
                  id="add-tracks"
                  name="trackCount"
                  type="number"
                  required
                  value={formData.trackCount}
                  onChange={handleChange}
                  placeholder="e.g. 12"
                />
              </div>

              <div>
                <label htmlFor="add-duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration <span className="text-red-500">*</span>
                </label>
                <Input
                  id="add-duration"
                  name="duration"
                  type="text"
                  required
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 45:30"
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
                  placeholder="Enter album description..."
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
                Add Album
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Album Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Album</DialogTitle>
              <DialogDescription>Update informasi album</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Album Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Beach Season"
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
                <label htmlFor="edit-genre" className="block text-sm font-medium text-gray-700 mb-2">
                  Genre <span className="text-red-500">*</span>
                </label>
                <select
                  id="edit-genre"
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

              <div>
                <label htmlFor="edit-type" className="block text-sm font-medium text-gray-700 mb-2">
                  Album Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="edit-type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="">Select type</option>
                  {albumTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edit-year" className="block text-sm font-medium text-gray-700 mb-2">
                  Release Year <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-year"
                  name="releaseYear"
                  type="text"
                  required
                  value={formData.releaseYear}
                  onChange={handleChange}
                  placeholder="e.g. 2024"
                />
              </div>

              <div>
                <label htmlFor="edit-tracks" className="block text-sm font-medium text-gray-700 mb-2">
                  Track Count <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-tracks"
                  name="trackCount"
                  type="number"
                  required
                  value={formData.trackCount}
                  onChange={handleChange}
                  placeholder="e.g. 12"
                />
              </div>

              <div>
                <label htmlFor="edit-duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-duration"
                  name="duration"
                  type="text"
                  required
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 45:30"
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
                  placeholder="Enter album description..."
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
                Update Album
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Album</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus album ini?
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
                    This action cannot be undone. All tracks in this album will be affected.
                  </p>
                </div>
              </div>
            </div>

            {selectedAlbum && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Album: <span className="font-medium text-gray-900">{selectedAlbum.title}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Artist: <span className="font-medium text-gray-900">{selectedAlbum.artist}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Tracks: <span className="font-medium text-gray-900">{selectedAlbum.trackCount}</span>
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
              Delete Album
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

