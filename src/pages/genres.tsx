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

interface Genre {
  id: number;
  name: string;
  description: string;
  songCount: number;
  createdAt: string;
}

export default function Genres() {
  const { success, error, warning } = useToast();
  const [genres, setGenres] = useState<Genre[]>([
    {
      id: 1,
      name: 'Pop',
      description: 'Popular music with catchy melodies',
      songCount: 1234,
      createdAt: '2023-01-15',
    },
    {
      id: 2,
      name: 'Rock',
      description: 'Electric guitar driven music',
      songCount: 892,
      createdAt: '2023-01-15',
    },
    {
      id: 3,
      name: 'Jazz',
      description: 'Improvisational music style',
      songCount: 456,
      createdAt: '2023-01-15',
    },
    {
      id: 4,
      name: 'Electronic',
      description: 'Computer-generated sounds and beats',
      songCount: 678,
      createdAt: '2023-01-15',
    },
    {
      id: 5,
      name: 'Hip Hop',
      description: 'Rhythmic music with rap vocals',
      songCount: 945,
      createdAt: '2023-01-15',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleAddClick = () => {
    setFormData({ name: '', description: '' });
    setIsAddModalOpen(true);
  };

  const handleEditClick = (genre: Genre) => {
    setSelectedGenre(genre);
    setFormData({
      name: genre.name,
      description: genre.description,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (genre: Genre) => {
    setSelectedGenre(genre);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newGenre: Genre = {
        id: genres.length + 1,
        name: formData.name,
        description: formData.description,
        songCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setGenres([...genres, newGenre]);
      setIsAddModalOpen(false);
      setFormData({ name: '', description: '' });
      success('Genre Added Successfully', `${formData.name} has been added to your genre list.`);
    } catch (err) {
      error('Failed to Add Genre', 'An error occurred while adding the genre. Please try again.');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGenre) {
      try {
        setGenres(
          genres.map((genre) =>
            genre.id === selectedGenre.id
              ? { ...genre, name: formData.name, description: formData.description }
              : genre
          )
        );
        setIsEditModalOpen(false);
        setSelectedGenre(null);
        setFormData({ name: '', description: '' });
        success('Genre Updated Successfully', `${formData.name} has been updated.`);
      } catch (err) {
        error('Failed to Update Genre', 'An error occurred while updating the genre. Please try again.');
      }
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedGenre) {
      try {
        const genreName = selectedGenre.name;
        setGenres(genres.filter((genre) => genre.id !== selectedGenre.id));
        setIsDeleteModalOpen(false);
        setSelectedGenre(null);
        warning('Genre Deleted', `${genreName} has been removed from your genre list.`);
      } catch (err) {
        error('Failed to Delete Genre', 'An error occurred while deleting the genre. Please try again.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const filteredGenres = genres.filter((genre) =>
    genre.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Genres - SoundCave</title>
        <meta name="description" content="Manage music genres" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Genre Management</h1>
            <p className="text-gray-600">Kelola semua genre musik di platform Anda</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🎵</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{genres.length}</p>
              <p className="text-sm text-gray-600">Total Genres</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🎼</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {genres.reduce((acc, genre) => acc + genre.songCount, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Songs</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">⭐</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {genres.length > 0
                  ? genres.reduce((max, genre) => (genre.songCount > max.songCount ? genre : max))
                      .name
                  : '-'}
              </p>
              <p className="text-sm text-gray-600">Most Popular</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {genres.length > 0
                  ? Math.round(
                      genres.reduce((acc, genre) => acc + genre.songCount, 0) / genres.length
                    ).toLocaleString()
                  : 0}
              </p>
              <p className="text-sm text-gray-600">Avg Songs/Genre</p>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Cari genre..."
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

              {/* Add Button */}
              <button
                onClick={handleAddClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                + Add Genre
              </button>
            </div>
          </div>

          {/* Genres Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Genre Name
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Songs
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredGenres.map((genre) => (
                    <tr key={genre.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-sm text-gray-900">#{genre.id}</td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded">
                          {genre.name}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">{genre.description}</td>
                      <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                        {genre.songCount.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">{genre.createdAt}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleEditClick(genre)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(genre)}
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
            {filteredGenres.length === 0 && (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🎵</span>
                <p className="text-gray-600">No genres found</p>
              </div>
            )}
          </div>
        </div>
      </Layout>

      {/* Add Genre Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>Add New Genre</DialogTitle>
              <DialogDescription>
                Tambahkan genre musik baru ke platform Anda
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
              <div>
                <label htmlFor="add-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Genre Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="add-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Pop, Rock, Jazz"
                />
              </div>

              <div>
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
                  placeholder="Enter genre description..."
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
                Add Genre
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Genre Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Genre</DialogTitle>
              <DialogDescription>
                Update informasi genre musik
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Genre Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Pop, Rock, Jazz"
                />
              </div>

              <div>
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
                  placeholder="Enter genre description..."
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
                Update Genre
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Genre</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus genre ini?
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
                    This action cannot be undone. All songs associated with this genre will be
                    affected.
                  </p>
                </div>
              </div>
            </div>

            {selectedGenre && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Genre: <span className="font-medium text-gray-900">{selectedGenre.name}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Songs: <span className="font-medium text-gray-900">{selectedGenre.songCount}</span>
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
              Delete Genre
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

