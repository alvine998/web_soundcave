# Firebase Storage Setup Guide

Panduan lengkap untuk setup dan integrasi Firebase Storage di aplikasi SoundCave.

---

## 1. Install Firebase SDK

```bash
npm install firebase
# or
yarn add firebase
# or
pnpm add firebase
```

---

## 2. Firebase Configuration

### Create Firebase Config File

**File:** `/src/lib/firebase.ts`

```typescript
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Firebase Auth (optional)
export const auth = getAuth(app);

export default app;
```

### Environment Variables

**File:** `.env.local`

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**File:** `.env.example` (for repository)

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

---

## 3. Firebase Storage Helper Functions

**File:** `/src/lib/firebase-storage.ts`

```typescript
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  UploadTask,
  StorageReference 
} from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload file to Firebase Storage with progress tracking
 */
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

/**
 * Delete file from Firebase Storage
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Upload multiple files
 */
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

/**
 * Get file path from Firebase Storage URL
 */
export const getFilePathFromUrl = (url: string): string | null => {
  try {
    const match = url.match(/\/o\/(.+?)\?/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
};

/**
 * Validate file before upload
 */
export const validateFile = (
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

/**
 * Validate Firebase Storage URL
 */
export const isValidFirebaseUrl = (url: string): boolean => {
  return url.startsWith('https://firebasestorage.googleapis.com/');
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Get MIME type from file extension
 */
export const getMimeType = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    // Audio
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    flac: 'audio/flac',
    aac: 'audio/aac',
    ogg: 'audio/ogg',
    
    // Image
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    
    // Video
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
  };
  
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};
```

---

## 4. React Hook for File Upload

**File:** `/src/hooks/useFileUpload.ts`

```typescript
import { useState, useCallback } from 'react';
import { uploadFile, validateFile } from '@/lib/firebase-storage';

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
    const validation = validateFile(file, {
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
```

---

## 5. Usage Examples

### Example 1: Upload Music File

```typescript
import { useState } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/components/ui/toast';

const MusicUploadForm = () => {
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: '',
  });
  
  const audioUpload = useFileUpload({
    path: 'audio',
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/flac'],
    onSuccess: (url) => {
      console.log('Audio uploaded:', url);
    },
    onError: (error) => {
      showError('Upload Failed', error.message);
    },
  });
  
  const coverUpload = useFileUpload({
    path: 'images/covers',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  });
  
  const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await audioUpload.upload(file);
    }
  };
  
  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await coverUpload.upload(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!audioUpload.url) {
      showError('Missing File', 'Please upload an audio file');
      return;
    }
    
    const payload = {
      ...formData,
      audioFileUrl: audioUpload.url,
      coverImageUrl: coverUpload.url,
    };
    
    try {
      const response = await fetch('/api/music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        success('Success', 'Music uploaded successfully!');
        // Reset form
        audioUpload.reset();
        coverUpload.reset();
        setFormData({ title: '', artist: '', genre: '' });
      }
    } catch (err) {
      showError('Error', 'Failed to create music');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
      
      <input
        type="text"
        placeholder="Artist"
        value={formData.artist}
        onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
        required
      />
      
      <div>
        <label>Audio File *</label>
        <input
          type="file"
          accept="audio/*"
          onChange={handleAudioChange}
          disabled={audioUpload.uploading}
          required
        />
        {audioUpload.uploading && (
          <div>
            <progress value={audioUpload.progress} max={100} />
            <span>{audioUpload.progress.toFixed(0)}%</span>
          </div>
        )}
        {audioUpload.error && <p className="error">{audioUpload.error.message}</p>}
      </div>
      
      <div>
        <label>Cover Image (Optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          disabled={coverUpload.uploading}
        />
        {coverUpload.uploading && (
          <div>
            <progress value={coverUpload.progress} max={100} />
            <span>{coverUpload.progress.toFixed(0)}%</span>
          </div>
        )}
      </div>
      
      <button 
        type="submit" 
        disabled={audioUpload.uploading || coverUpload.uploading}
      >
        Create Music
      </button>
    </form>
  );
};
```

### Example 2: Drag & Drop File Upload

```typescript
import { useState, useCallback } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';

const DragDropUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  
  const fileUpload = useFileUpload({
    path: 'audio',
    maxSize: 50 * 1024 * 1024,
    allowedTypes: ['audio/mpeg', 'audio/wav'],
  });
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      await fileUpload.upload(file);
    }
  }, [fileUpload]);
  
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed p-8 text-center ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
    >
      {fileUpload.uploading ? (
        <div>
          <p>Uploading...</p>
          <progress value={fileUpload.progress} max={100} />
          <p>{fileUpload.progress.toFixed(0)}%</p>
        </div>
      ) : fileUpload.url ? (
        <div>
          <p>✓ Upload complete!</p>
          <button onClick={fileUpload.reset}>Upload another</button>
        </div>
      ) : (
        <p>Drag & drop audio file here or click to browse</p>
      )}
    </div>
  );
};
```

---

## 6. Firebase Storage Security Rules

**Firebase Console → Storage → Rules**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isValidSize(maxSize) {
      return request.resource.size <= maxSize;
    }
    
    function isValidAudioType() {
      return request.resource.contentType.matches('audio/.*');
    }
    
    function isValidImageType() {
      return request.resource.contentType.matches('image/.*');
    }
    
    function isValidVideoType() {
      return request.resource.contentType.matches('video/.*');
    }
    
    // Audio files (50MB max)
    match /audio/{userId}/{filename} {
      allow read: if true;
      allow write: if isAuthenticated() 
                   && isOwner(userId)
                   && isValidSize(50 * 1024 * 1024)
                   && isValidAudioType();
      allow delete: if isAuthenticated() && isOwner(userId);
    }
    
    // Audio files (global, for admin uploads)
    match /audio/{filename} {
      allow read: if true;
      allow write: if isAuthenticated()
                   && isValidSize(50 * 1024 * 1024)
                   && isValidAudioType();
      allow delete: if isAuthenticated();
    }
    
    // Cover images (5MB max)
    match /images/covers/{filename} {
      allow read: if true;
      allow write: if isAuthenticated()
                   && isValidSize(5 * 1024 * 1024)
                   && isValidImageType();
      allow delete: if isAuthenticated();
    }
    
    // Artist profile images (5MB max)
    match /images/artists/{filename} {
      allow read: if true;
      allow write: if isAuthenticated()
                   && isValidSize(5 * 1024 * 1024)
                   && isValidImageType();
      allow delete: if isAuthenticated();
    }
    
    // Playlist covers (5MB max)
    match /images/playlists/{filename} {
      allow read: if true;
      allow write: if isAuthenticated()
                   && isValidSize(5 * 1024 * 1024)
                   && isValidImageType();
      allow delete: if isAuthenticated();
    }
    
    // User profile images (5MB max)
    match /images/profiles/{userId}/{filename} {
      allow read: if true;
      allow write: if isAuthenticated()
                   && isOwner(userId)
                   && isValidSize(5 * 1024 * 1024)
                   && isValidImageType();
      allow delete: if isAuthenticated() && isOwner(userId);
    }
    
    // Music videos (500MB max)
    match /videos/{filename} {
      allow read: if true;
      allow write: if isAuthenticated()
                   && isValidSize(500 * 1024 * 1024)
                   && isValidVideoType();
      allow delete: if isAuthenticated();
    }
    
    // Podcast audio files
    match /podcasts/audio/{filename} {
      allow read: if true;
      allow write: if isAuthenticated()
                   && isValidSize(100 * 1024 * 1024)
                   && isValidAudioType();
      allow delete: if isAuthenticated();
    }
    
    // Podcast thumbnails
    match /podcasts/thumbnails/{filename} {
      allow read: if true;
      allow write: if isAuthenticated()
                   && isValidSize(5 * 1024 * 1024)
                   && isValidImageType();
      allow delete: if isAuthenticated();
    }
    
    // Video thumbnails
    match /thumbnails/{filename} {
      allow read: if true;
      allow write: if isAuthenticated()
                   && isValidSize(5 * 1024 * 1024)
                   && isValidImageType();
      allow delete: if isAuthenticated();
    }
  }
}
```

---

## 7. Backend URL Validation

### Validate Firebase URLs on Backend

```typescript
// Server-side validation (Node.js/Express)
const validateFirebaseUrl = (url: string): boolean => {
  const allowedBuckets = [
    process.env.FIREBASE_STORAGE_BUCKET,
    // Add other allowed buckets if needed
  ];
  
  const isFirebaseUrl = url.startsWith('https://firebasestorage.googleapis.com/');
  
  if (!isFirebaseUrl) {
    return false;
  }
  
  // Extract bucket from URL
  const bucketMatch = url.match(/\/v0\/b\/([^/]+)\/o\//);
  const bucket = bucketMatch ? bucketMatch[1] : null;
  
  return bucket ? allowedBuckets.includes(bucket) : false;
};

// Middleware to validate URLs in request body
const validateFileUrls = (req, res, next) => {
  const urlFields = ['audioFileUrl', 'coverImageUrl', 'profileImageUrl', 'videoUrl', 'thumbnailUrl'];
  
  for (const field of urlFields) {
    if (req.body[field] && !validateFirebaseUrl(req.body[field])) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE_URL',
          message: `Invalid Firebase Storage URL for field: ${field}`,
        },
      });
    }
  }
  
  next();
};
```

---

## 8. Error Handling

### Common Firebase Storage Errors

```typescript
import { FirebaseError } from 'firebase/app';

export const handleFirebaseError = (error: FirebaseError): string => {
  switch (error.code) {
    case 'storage/unauthorized':
      return 'You do not have permission to upload files';
    
    case 'storage/canceled':
      return 'Upload was cancelled';
    
    case 'storage/unknown':
      return 'An unknown error occurred. Please try again';
    
    case 'storage/object-not-found':
      return 'File not found';
    
    case 'storage/bucket-not-found':
      return 'Storage bucket not found';
    
    case 'storage/quota-exceeded':
      return 'Storage quota exceeded';
    
    case 'storage/unauthenticated':
      return 'Please sign in to upload files';
    
    case 'storage/retry-limit-exceeded':
      return 'Upload failed after multiple retries. Check your connection';
    
    case 'storage/invalid-checksum':
      return 'File upload failed validation. Please try again';
    
    default:
      return error.message || 'Upload failed. Please try again';
  }
};

// Usage
try {
  await uploadFile(file, 'audio');
} catch (error) {
  if (error instanceof FirebaseError) {
    const message = handleFirebaseError(error);
    console.error(message);
  }
}
```

---

## 9. Best Practices

### ✅ DO:
- Always validate files on client-side before uploading
- Show upload progress to users
- Implement proper error handling
- Use meaningful file paths and names
- Sanitize filenames before upload
- Validate URLs on backend before saving to database
- Implement proper security rules in Firebase
- Use environment variables for configuration
- Delete old files when updating (avoid orphaned files)
- Compress images before upload when possible

### ❌ DON'T:
- Upload files without validation
- Store sensitive information in file paths
- Use user-provided filenames directly
- Skip error handling
- Upload files larger than necessary
- Forget to clean up unused files
- Expose Firebase configuration in client code without protection
- Allow unlimited file sizes
- Skip URL validation on backend

---

**Last Updated:** 2024-01-15  
**Firebase SDK Version:** 10.x

