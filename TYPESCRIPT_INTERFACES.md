# SoundCave - TypeScript Interfaces & Types

Dokumentasi TypeScript interfaces untuk semua data structures di aplikasi SoundCave.

---

## Authentication

```typescript
// Login
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}
```

---

## Music Management

```typescript
interface Music {
  id: number;
  title: string;
  artist: string;
  artistId: number;
  album?: string;
  albumId?: number;
  genre: string;
  releaseDate: string; // YYYY-MM-DD
  duration: string; // MM:SS
  language: string;
  explicit: boolean;
  lyrics?: string;
  description?: string;
  tags?: string;
  audioFileUrl: string;
  coverImageUrl?: string;
  streams?: number;
  likes?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateMusicRequest {
  title: string;
  artist: string;
  artistId: number;
  album?: string;
  albumId?: number;
  genre: string;
  releaseDate: string;
  duration: string;
  language: string;
  explicit: boolean;
  lyrics?: string;
  description?: string;
  tags?: string;
  audioFileUrl: string; // Firebase Storage URL
  coverImageUrl?: string; // Firebase Storage URL
}

interface UpdateMusicRequest extends Partial<CreateMusicRequest> {
  title: string; // Required
}

interface MusicFormData {
  title: string;
  artist: string;
  album: string;
  genre: string;
  releaseDate: string;
  duration: string;
  language: string;
  explicit: string; // "true" or "false"
  lyrics: string;
  description: string;
  tags: string;
}
```

---

## Artist Management

```typescript
interface Artist {
  id: number;
  name: string;
  bio: string;
  genre: string;
  country: string;
  debutYear: string;
  website?: string;
  email: string;
  phone?: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
  };
  profileImageUrl?: string;
  totalSongs?: number;
  totalAlbums?: number;
  followers?: number;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateArtistRequest {
  name: string;
  bio: string;
  genre: string;
  country: string;
  debutYear: string;
  website?: string;
  email: string;
  phone?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
  profileImageUrl?: string; // Firebase Storage URL
}

interface UpdateArtistRequest extends Partial<CreateArtistRequest> {
  name: string; // Required
}

interface ArtistFormData {
  name: string;
  bio: string;
  genre: string;
  country: string;
  debutYear: string;
  website: string;
  email: string;
  phone: string;
  instagram: string;
  twitter: string;
  facebook: string;
  youtube: string;
}
```

---

## Album Management

```typescript
interface Album {
  id: number;
  title: string;
  artistId: number;
  artist: string;
  releaseDate: string;
  albumType: 'single' | 'EP' | 'album' | 'compilation';
  genre: string;
  totalTracks: number;
  recordLabel?: string;
  coverImageUrl?: string;
  streams?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateAlbumRequest {
  title: string;
  artistId: number;
  artist: string;
  releaseDate: string;
  albumType: 'single' | 'EP' | 'album' | 'compilation';
  genre: string;
  totalTracks: number;
  recordLabel?: string;
}

interface UpdateAlbumRequest extends Partial<CreateAlbumRequest> {
  title: string; // Required
}

interface AlbumFormData {
  title: string;
  artist: string;
  releaseDate: string;
  albumType: string;
  genre: string;
  totalTracks: string;
  recordLabel: string;
}
```

---

## Genre Management

```typescript
interface Genre {
  id: number;
  name: string;
  description: string;
  color?: string; // Hex color
  totalSongs?: number;
  totalArtists?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateGenreRequest {
  name: string;
  description: string;
  color?: string;
}

interface UpdateGenreRequest extends Partial<CreateGenreRequest> {
  name: string; // Required
}

interface GenreFormData {
  name: string;
  description: string;
  color: string;
}
```

---

## Playlist Management

```typescript
interface Playlist {
  id: number;
  name: string;
  description?: string;
  userId: number;
  userName: string;
  isPublic: boolean;
  coverImageUrl?: string;
  totalSongs: number;
  totalDuration?: string;
  followers?: number;
  songs?: Music[];
  createdAt?: string;
  updatedAt?: string;
}

interface CreatePlaylistRequest {
  name: string;
  description?: string;
  isPublic: boolean;
  coverImageUrl?: string; // Firebase Storage URL
}

interface UpdatePlaylistRequest extends Partial<CreatePlaylistRequest> {}

interface AddSongToPlaylistRequest {
  songId: number;
}

interface PlaylistFormData {
  name: string;
  description: string;
  isPublic: string; // "true" or "false"
}
```

---

## Music Videos

```typescript
interface MusicVideo {
  id: number;
  title: string;
  artistId: number;
  artist: string;
  releaseDate: string;
  duration: string;
  genre: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  views?: number;
  likes?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateMusicVideoRequest {
  title: string;
  artistId: number;
  artist: string;
  releaseDate: string;
  duration: string;
  genre: string;
  description?: string;
  videoUrl: string; // Firebase Storage URL or YouTube URL
  thumbnailUrl?: string; // Firebase Storage URL
}

interface UpdateMusicVideoRequest extends Partial<CreateMusicVideoRequest> {
  title: string; // Required
}

interface MusicVideoFormData {
  title: string;
  artist: string;
  releaseDate: string;
  duration: string;
  genre: string;
  description: string;
  videoUrl: string;
}
```

---

## Podcasts

```typescript
interface Podcast {
  id: number;
  title: string;
  host: string;
  releaseDate: string;
  duration: string;
  category: string;
  description: string;
  episodeNumber?: number;
  season?: number;
  audioUrl: string;
  thumbnailUrl?: string;
  listens?: number;
  likes?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CreatePodcastRequest {
  title: string;
  host: string;
  releaseDate: string;
  duration: string;
  category: string;
  description: string;
  episodeNumber?: number;
  season?: number;
  audioUrl: string; // Firebase Storage URL
  thumbnailUrl?: string; // Firebase Storage URL
}

interface UpdatePodcastRequest extends Partial<CreatePodcastRequest> {
  title: string; // Required
}

interface PodcastFormData {
  title: string;
  host: string;
  releaseDate: string;
  duration: string;
  category: string;
  description: string;
  episodeNumber: string;
  season: string;
  audioUrl: string;
}
```

---

## Subscription Plans

```typescript
interface Subscription {
  id: number;
  name: string;
  price: string; // Format: "Rp X.XXX.XXX"
  duration: string; // e.g., "1 Month", "Forever"
  features: string[];
  maxDownloads: number; // -1 for unlimited
  maxPlaylists: number; // -1 for unlimited
  audioQuality: string;
  adsEnabled: boolean;
  offlineMode: boolean;
  isPopular: boolean;
  description: string;
  activeUsers?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateSubscriptionRequest {
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

interface UpdateSubscriptionRequest extends Partial<CreateSubscriptionRequest> {
  name: string; // Required
}

interface SubscriptionFormData {
  name: string;
  price: string;
  duration: string;
  features: string; // Comma-separated
  maxDownloads: string;
  maxPlaylists: string;
  audioQuality: string;
  adsEnabled: string; // "true" or "false"
  offlineMode: string; // "true" or "false"
  isPopular: string; // "true" or "false"
  description: string;
}
```

---

## User Profile

```typescript
interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  location?: string;
  bio?: string;
  profileImageUrl?: string;
  joinDate: string;
  lastLogin?: string;
  isActive: boolean;
}

interface UpdateProfileRequest {
  fullName: string;
  email: string;
  phone?: string;
  department?: string;
  location?: string;
  bio?: string;
  profileImageUrl?: string; // Firebase Storage URL
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UserPreferences {
  language: 'id' | 'en';
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  weeklyReports: boolean;
}

interface UpdatePreferencesRequest extends UserPreferences {}

interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  location: string;
  bio: string;
  joinDate: string;
}

interface SecurityFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PreferencesFormData {
  language: string;
  timezone: string;
  emailNotifications: string; // "true" or "false"
  pushNotifications: string; // "true" or "false"
  marketingEmails: string; // "true" or "false"
  weeklyReports: string; // "true" or "false"
}
```

---

## Notifications

```typescript
type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string; // Relative time, e.g., "2 min ago"
  date: string; // YYYY-MM-DD
  isRead: boolean;
  type: NotificationType;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
}

interface MarkAsReadRequest {
  notificationIds: number[];
}
```

---

## About Apps

```typescript
interface AboutApps {
  appName: string;
  tagline: string;
  description: string;
  version: string;
  launchDate: string;
  email: string;
  phone: string;
  address: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
  playStoreUrl?: string;
  appStoreUrl?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
  supportUrl?: string;
  features: string[];
  totalUsers: string;
  totalSongs: string;
  totalArtists: string;
  totalPodcasts: string;
}

interface UpdateAboutAppsRequest extends AboutApps {}

interface AboutAppsFormData {
  appName: string;
  tagline: string;
  description: string;
  version: string;
  launchDate: string;
  email: string;
  phone: string;
  address: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  linkedin: string;
  playStoreUrl: string;
  appStoreUrl: string;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
  supportUrl: string;
  totalUsers: string;
  totalSongs: string;
  totalArtists: string;
  totalPodcasts: string;
}
```

---

## Analytics & Reports

```typescript
interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalStreams: number;
  revenue: number;
  userGrowth: number; // Percentage
  streamGrowth: number; // Percentage
  revenueGrowth: number; // Percentage
}

interface StreamData {
  name: string; // Date or month
  streams: number;
  users: number;
  revenue?: number;
}

interface GenreDistribution {
  name: string;
  value: number; // Percentage
  count?: number;
}

interface TopSong {
  id: number;
  title: string;
  artist: string;
  streams: number;
  revenue?: number;
}

interface DashboardResponse {
  stats: DashboardStats;
  streamData: StreamData[];
  genreDistribution: GenreDistribution[];
  topSongs: TopSong[];
  recentActivity: Activity[];
}

interface Activity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  user?: string;
}

interface AnalyticsQuery {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  metric?: 'streams' | 'users' | 'revenue';
  groupBy?: 'day' | 'week' | 'month';
}

interface AnalyticsResponse {
  dateRange: {
    start: string;
    end: string;
  };
  metrics: {
    totalStreams: number;
    totalRevenue: number;
    avgStreamDuration: string;
    newUsers: number;
    bounceRate: number;
  };
  chartData: {
    date: string;
    value: number;
  }[];
  topPerforming: {
    songs: TopSong[];
    artists: Artist[];
    genres: GenreDistribution[];
  };
}

interface CustomerReport {
  id: number;
  name: string;
  email: string;
  subscriptionPlan: string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastActive: string;
  totalStreams: number;
  revenue: number;
}

interface CustomerReportResponse {
  totalCustomers: number;
  activeCustomers: number;
  premiumUsers: number;
  churnRate: number;
  customers: CustomerReport[];
  subscriptionDistribution: {
    plan: string;
    count: number;
    percentage: number;
  }[];
}

interface ExportReportQuery {
  type: 'pdf' | 'csv' | 'excel';
  report: 'analytics' | 'customers' | 'revenue';
  startDate: string;
  endDate: string;
}
```

---

## Common Types

```typescript
// API Response wrapper
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// Pagination
interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter options
interface FilterOptions {
  search?: string;
  genre?: string;
  year?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Firebase file upload with progress
interface FileUploadState {
  file: File;
  preview?: string;
  progress: number;
  uploading: boolean;
  error?: string;
  url?: string; // Firebase Storage download URL
}

// Select option
interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// Chart data point
interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}

// Stats card
interface StatsCard {
  title: string;
  value: string | number;
  icon: string;
  change?: number; // Percentage change
  trend?: 'up' | 'down';
}
```

---

## Form Validation Rules

```typescript
// Validation rules type
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

interface ValidationRules {
  [field: string]: ValidationRule;
}

// Example validation rules
const musicValidationRules: ValidationRules = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 200,
  },
  artist: {
    required: true,
    minLength: 1,
    maxLength: 100,
  },
  genre: {
    required: true,
  },
  releaseDate: {
    required: true,
    pattern: /^\d{4}-\d{2}-\d{2}$/,
  },
  duration: {
    required: true,
    pattern: /^\d{1,2}:\d{2}$/,
  },
  audioFileUrl: {
    required: true,
    pattern: /^https:\/\/firebasestorage\.googleapis\.com\/.+/,
    custom: (url: string) => {
      if (!url.startsWith('https://firebasestorage.googleapis.com/')) {
        return 'Invalid Firebase Storage URL';
      }
      return true;
    },
  },
};

// File validation (before upload to Firebase)
const validateFile = (file: File, type: 'audio' | 'image' | 'video'): string | true => {
  const validations = {
    audio: {
      types: ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac'],
      maxSize: 50 * 1024 * 1024, // 50MB
    },
    image: {
      types: ['image/jpeg', 'image/png', 'image/webp'],
      maxSize: 5 * 1024 * 1024, // 5MB
    },
    video: {
      types: ['video/mp4', 'video/webm'],
      maxSize: 500 * 1024 * 1024, // 500MB
    },
  };
  
  const validation = validations[type];
  
  if (!validation.types.includes(file.type)) {
    return `Invalid file type. Allowed: ${validation.types.join(', ')}`;
  }
  
  if (file.size > validation.maxSize) {
    const sizeMB = Math.round(validation.maxSize / (1024 * 1024));
    return `File size exceeds ${sizeMB}MB limit.`;
  }
  
  return true;
};
```

---

## Utility Types

```typescript
// Make all properties optional except specified keys
type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Make all properties required except specified keys
type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>;

// Extract form data type from interface
type FormDataType<T> = {
  [K in keyof T]: T[K] extends File ? File : string;
};

// API request with pagination
type PaginatedRequest<T> = T & PaginationParams;

// API request with filters
type FilteredRequest<T> = T & FilterOptions;

// Omit timestamps from type
type WithoutTimestamps<T> = Omit<T, 'createdAt' | 'updatedAt'>;

// Extract IDs only
type IdOnly<T extends { id: number }> = Pick<T, 'id'>;

// Make all nested properties optional
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

---

## Redux/State Management Types (Optional)

```typescript
// Action types
interface Action<T = any> {
  type: string;
  payload?: T;
}

// Async action states
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Root state example
interface RootState {
  auth: {
    user: UserProfile | null;
    token: string | null;
    isAuthenticated: boolean;
  };
  music: AsyncState<Music[]>;
  artists: AsyncState<Artist[]>;
  albums: AsyncState<Album[]>;
  notifications: Notification[];
  // ... other slices
}
```

---

## Environment Variables Types

```typescript
interface EnvironmentVariables {
  // API
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_WS_URL: string;
  
  // Storage
  NEXT_PUBLIC_STORAGE_URL: string;
  NEXT_PUBLIC_CDN_URL: string;
  
  // Auth
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  
  // External Services
  STRIPE_PUBLIC_KEY: string;
  STRIPE_SECRET_KEY: string;
  
  // Analytics
  GOOGLE_ANALYTICS_ID: string;
  
  // Other
  NODE_ENV: 'development' | 'production' | 'test';
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvironmentVariables {}
  }
}
```

---

## Usage Examples

### Create Music with Firebase Storage

```typescript
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

// Upload file to Firebase Storage
const uploadToFirebase = async (
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const timestamp = Date.now();
  const filename = `${timestamp}_${file.name}`;
  const storageRef = ref(storage, `${path}/${filename}`);
  
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

// Create music with Firebase URLs
const createMusic = async (
  data: MusicFormData,
  files: {
    audioFile: File;
    coverImage?: File;
  },
  onUploadProgress?: (progress: number) => void
) => {
  try {
    // 1. Upload audio file to Firebase
    const audioFileUrl = await uploadToFirebase(
      files.audioFile,
      'audio',
      onUploadProgress
    );
    
    // 2. Upload cover image if provided
    let coverImageUrl: string | undefined;
    if (files.coverImage) {
      coverImageUrl = await uploadToFirebase(
        files.coverImage,
        'images/covers'
      );
    }
    
    // 3. Create payload with Firebase URLs
    const payload: CreateMusicRequest = {
      ...data,
      artistId: Number(data.artist), // Convert to artistId
      explicit: data.explicit === 'true',
      audioFileUrl,
      coverImageUrl,
    };
    
    // 4. Send to API
    const response = await fetch('/api/music', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    return await response.json() as ApiResponse<Music>;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};
```

### Type-safe API call

```typescript
const fetchMusicList = async (
  filters: FilterOptions,
  pagination: PaginationParams
): Promise<PaginatedResponse<Music>> => {
  const queryParams = new URLSearchParams({
    ...filters,
    page: pagination.page.toString(),
    pageSize: pagination.pageSize.toString(),
  });
  
  const response = await fetch(`/api/music?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  return await response.json();
};
```

### Form handling with React Hook Form & Firebase Upload

```typescript
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface MusicFormInputs extends MusicFormData {
  audioFile: FileList;
  coverImage?: FileList;
}

const MusicForm: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { register, handleSubmit, formState: { errors } } = useForm<MusicFormInputs>({
    defaultValues: {
      title: '',
      artist: '',
      genre: '',
      explicit: 'false',
      // ... other fields
    },
  });
  
  const onSubmit = async (data: MusicFormInputs) => {
    if (!data.audioFile?.[0]) {
      alert('Please select an audio file');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Upload to Firebase and create music
      await createMusic(
        data,
        {
          audioFile: data.audioFile[0],
          coverImage: data.coverImage?.[0],
        },
        (progress) => setUploadProgress(progress)
      );
      
      alert('Music uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title', { required: true })} />
      <input {...register('artist', { required: true })} />
      <input {...register('genre', { required: true })} />
      
      <input 
        type="file" 
        accept="audio/*"
        {...register('audioFile', { required: true })} 
      />
      
      <input 
        type="file" 
        accept="image/*"
        {...register('coverImage')} 
      />
      
      {uploading && (
        <div>
          <p>Uploading: {uploadProgress.toFixed(0)}%</p>
          <progress value={uploadProgress} max={100} />
        </div>
      )}
      
      <button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Music'}
      </button>
    </form>
  );
};
```

---

## Firebase Storage Helper Functions

### Complete Upload Utilities

```typescript
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  UploadTask 
} from 'firebase/storage';
import { storage } from '@/lib/firebase';

// Upload file with progress tracking
export const uploadFile = async (
  file: File,
  path: string,
  onProgress?: (progress: number) => void,
  onError?: (error: Error) => void
): Promise<string> => {
  const timestamp = Date.now();
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}_${sanitizedFilename}`;
  const storageRef = ref(storage, `${path}/${filename}`);
  
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => {
        onError?.(error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

// Delete file from Firebase Storage
export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Upload multiple files
export const uploadMultipleFiles = async (
  files: File[],
  path: string,
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<string[]> => {
  const uploadPromises = files.map((file, index) =>
    uploadFile(
      file,
      path,
      (progress) => onProgress?.(index, progress)
    )
  );
  
  return Promise.all(uploadPromises);
};

// Get file path from Firebase Storage URL
export const getFilePathFromUrl = (url: string): string | null => {
  try {
    const match = url.match(/\/o\/(.+?)\?/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
};

// Validate file before upload
export const validateFileForUpload = (
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
  }
): { valid: boolean; error?: string } => {
  const { maxSize = 50 * 1024 * 1024, allowedTypes } = options;
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds limit (${(maxSize / (1024 * 1024)).toFixed(0)}MB)`,
    };
  }
  
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }
  
  return { valid: true };
};
```

### React Hook for File Upload

```typescript
import { useState, useCallback } from 'react';

interface UseFileUploadOptions {
  path: string;
  maxSize?: number;
  allowedTypes?: string[];
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

interface UseFileUploadReturn {
  upload: (file: File) => Promise<string | null>;
  uploading: boolean;
  progress: number;
  error: Error | null;
  url: string | null;
  reset: () => void;
}

export const useFileUpload = (options: UseFileUploadOptions): UseFileUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  
  const upload = useCallback(async (file: File): Promise<string | null> => {
    // Validate file
    const validation = validateFileForUpload(file, {
      maxSize: options.maxSize,
      allowedTypes: options.allowedTypes,
    });
    
    if (!validation.valid) {
      const err = new Error(validation.error);
      setError(err);
      options.onError?.(err);
      return null;
    }
    
    setUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      const downloadUrl = await uploadFile(
        file,
        options.path,
        setProgress,
        setError
      );
      
      setUrl(downloadUrl);
      options.onSuccess?.(downloadUrl);
      return downloadUrl;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      return null;
    } finally {
      setUploading(false);
    }
  }, [options]);
  
  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setUrl(null);
  }, []);
  
  return { upload, uploading, progress, error, url, reset };
};

// Usage example
const MusicUploadComponent = () => {
  const audioUpload = useFileUpload({
    path: 'audio',
    maxSize: 50 * 1024 * 1024,
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/flac'],
    onSuccess: (url) => console.log('Audio uploaded:', url),
    onError: (error) => console.error('Upload failed:', error),
  });
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await audioUpload.upload(file);
    }
  };
  
  return (
    <div>
      <input type="file" accept="audio/*" onChange={handleFileSelect} />
      {audioUpload.uploading && (
        <div>
          <p>Uploading: {audioUpload.progress.toFixed(0)}%</p>
          <progress value={audioUpload.progress} max={100} />
        </div>
      )}
      {audioUpload.error && <p>Error: {audioUpload.error.message}</p>}
      {audioUpload.url && <p>Upload successful!</p>}
    </div>
  );
};
```

---

**Last Updated:** 2024-01-15  
**TypeScript Version:** 5.0+  
**Firebase Storage:** v10+

