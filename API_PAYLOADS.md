# SoundCave - API Payloads & Data Structures

Dokumentasi lengkap untuk semua payload JSON yang digunakan dalam aplikasi SoundCave.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Music Management](#music-management)
3. [Artist Management](#artist-management)
4. [Album Management](#album-management)
5. [Genre Management](#genre-management)
6. [Playlist Management](#playlist-management)
7. [Music Videos](#music-videos)
8. [Podcasts](#podcasts)
9. [Subscription Plans](#subscription-plans)
10. [User Profile](#user-profile)
11. [Notifications](#notifications)
12. [About Apps](#about-apps)
13. [Analytics & Reports](#analytics--reports)

---

## Authentication

### Login
**Endpoint:** `POST /api/auth/login`

**Request Payload:**
```json
{
  "email": "string",
  "password": "string",
  "rememberMe": "boolean"
}
```

**Response:**
```json
{
  "success": true,
  "token": "string",
  "user": {
    "id": "number",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

---

## Music Management

### Create Music
**Endpoint:** `POST /api/music`

**Request Payload:**
```json
{
  "title": "string (required)",
  "artist": "string (required)",
  "artistId": "number (required)",
  "album": "string",
  "albumId": "number",
  "genre": "string (required)",
  "releaseDate": "string (YYYY-MM-DD, required)",
  "duration": "string (MM:SS, required)",
  "language": "string (required)",
  "explicit": "boolean",
  "lyrics": "string",
  "description": "string",
  "tags": "string (comma-separated)",
  "audioFileUrl": "string (Firebase Storage URL, required)",
  "coverImageUrl": "string (Firebase Storage URL)"
}
```

**Example:**
```json
{
  "title": "Beautiful Day",
  "artist": "John Doe",
  "artistId": 1,
  "album": "Summer Vibes",
  "albumId": 5,
  "genre": "Pop",
  "releaseDate": "2024-01-15",
  "duration": "03:45",
  "language": "Indonesian",
  "explicit": false,
  "lyrics": "Song lyrics here...",
  "description": "A beautiful song about summer",
  "tags": "pop, love, trending",
  "audioFileUrl": "https://firebasestorage.googleapis.com/v0/b/soundcave/o/audio%2Fsong123.mp3?alt=media",
  "coverImageUrl": "https://firebasestorage.googleapis.com/v0/b/soundcave/o/images%2Fcover123.jpg?alt=media"
}
```

**Note:** Upload files to Firebase Storage first, then send the download URLs in the request.

### Update Music
**Endpoint:** `PUT /api/music/:id`

**Request Payload:** (All fields optional except title)
```json
{
  "title": "string (required)",
  "artist": "string",
  "artistId": "number",
  "album": "string",
  "albumId": "number",
  "genre": "string",
  "releaseDate": "string (YYYY-MM-DD)",
  "duration": "string (MM:SS)",
  "language": "string",
  "explicit": "boolean",
  "lyrics": "string",
  "description": "string",
  "tags": "string",
  "audioFileUrl": "string (Firebase Storage URL, optional)",
  "coverImageUrl": "string (Firebase Storage URL, optional)"
}
```

### Delete Music
**Endpoint:** `DELETE /api/music/:id`

**Response:**
```json
{
  "success": true,
  "message": "Music deleted successfully"
}
```

---

## Artist Management

### Create Artist
**Endpoint:** `POST /api/artists`

**Request Payload:**
```json
{
  "name": "string (required)",
  "bio": "string (required)",
  "genre": "string (required)",
  "country": "string (required)",
  "debutYear": "string (YYYY, required)",
  "website": "string",
  "email": "string (required)",
  "phone": "string",
  "instagram": "string",
  "twitter": "string",
  "facebook": "string",
  "youtube": "string",
  "profileImageUrl": "string (Firebase Storage URL)"
}
```

**Example:**
```json
{
  "name": "John Doe",
  "bio": "A talented pop artist from Indonesia...",
  "genre": "Pop",
  "country": "Indonesia",
  "debutYear": "2020",
  "website": "https://johndoe.com",
  "email": "john@example.com",
  "phone": "+62 812-3456-7890",
  "instagram": "https://instagram.com/johndoe",
  "twitter": "https://twitter.com/johndoe",
  "facebook": "https://facebook.com/johndoe",
  "youtube": "https://youtube.com/johndoe",
  "profileImageUrl": "https://firebasestorage.googleapis.com/v0/b/soundcave/o/artists%2Fprofile123.jpg?alt=media"
}
```

### Update Artist
**Endpoint:** `PUT /api/artists/:id`

**Request Payload:** (Same as Create Artist, all fields optional except name)

### Delete Artist
**Endpoint:** `DELETE /api/artists/:id`

---

## Album Management

### Create Album
**Endpoint:** `POST /api/albums`

**Request Payload:**
```json
{
  "title": "string (required)",
  "artistId": "number (required)",
  "artist": "string (required)",
  "releaseDate": "string (YYYY-MM-DD, required)",
  "albumType": "string (required: single, EP, album, compilation)",
  "genre": "string (required)",
  "totalTracks": "number (required)",
  "recordLabel": "string"
}
```

**Example:**
```json
{
  "title": "Summer Vibes",
  "artistId": 1,
  "artist": "John Doe",
  "releaseDate": "2024-06-15",
  "albumType": "album",
  "genre": "Pop",
  "totalTracks": 12,
  "recordLabel": "Universal Music"
}
```

### Update Album
**Endpoint:** `PUT /api/albums/:id`

**Request Payload:** (Same as Create Album)

### Delete Album
**Endpoint:** `DELETE /api/albums/:id`

---

## Genre Management

### Create Genre
**Endpoint:** `POST /api/genres`

**Request Payload:**
```json
{
  "name": "string (required)",
  "description": "string (required)",
  "color": "string (hex color)"
}
```

**Example:**
```json
{
  "name": "K-Pop",
  "description": "Korean Pop Music",
  "color": "#FF69B4"
}
```

### Update Genre
**Endpoint:** `PUT /api/genres/:id`

**Request Payload:** (Same as Create Genre)

### Delete Genre
**Endpoint:** `DELETE /api/genres/:id`

---

## Playlist Management

### Create Playlist
**Endpoint:** `POST /api/playlists`

**Request Payload:**
```json
{
  "name": "string (required)",
  "description": "string",
  "isPublic": "boolean",
  "coverImageUrl": "string (Firebase Storage URL)"
}
```

**Example:**
```json
{
  "name": "My Chill Playlist",
  "description": "Relaxing songs for evening",
  "isPublic": true,
  "coverImageUrl": "https://firebasestorage.googleapis.com/v0/b/soundcave/o/playlists%2Fcover456.jpg?alt=media"
}
```

### Update Playlist
**Endpoint:** `PUT /api/playlists/:id`

**Request Payload:**
```json
{
  "name": "string",
  "description": "string",
  "isPublic": "boolean"
}
```

### Add Song to Playlist
**Endpoint:** `POST /api/playlists/:id/songs`

**Request Payload:**
```json
{
  "songId": "number (required)"
}
```

### Remove Song from Playlist
**Endpoint:** `DELETE /api/playlists/:playlistId/songs/:songId`

---

## Music Videos

### Create Music Video
**Endpoint:** `POST /api/music-videos`

**Request Payload:**
```json
{
  "title": "string (required)",
  "artistId": "number (required)",
  "artist": "string (required)",
  "releaseDate": "string (YYYY-MM-DD, required)",
  "duration": "string (MM:SS, required)",
  "genre": "string (required)",
  "description": "string",
  "videoUrl": "string (Firebase Storage URL or YouTube URL, required)",
  "thumbnailUrl": "string (Firebase Storage URL)"
}
```

**Example:**
```json
{
  "title": "Blinding Lights",
  "artistId": 1,
  "artist": "The Weeknd",
  "releaseDate": "2024-01-15",
  "duration": "04:30",
  "genre": "Pop",
  "description": "Official music video for Blinding Lights",
  "videoUrl": "https://firebasestorage.googleapis.com/v0/b/soundcave/o/videos%2Fvid123.mp4?alt=media",
  "thumbnailUrl": "https://firebasestorage.googleapis.com/v0/b/soundcave/o/thumbnails%2Fthumb123.jpg?alt=media"
}
```

### Update Music Video
**Endpoint:** `PUT /api/music-videos/:id`

**Request Payload:** (Same as Create Music Video)

### Delete Music Video
**Endpoint:** `DELETE /api/music-videos/:id`

---

## Podcasts

### Create Podcast
**Endpoint:** `POST /api/podcasts`

**Request Payload:**
```json
{
  "title": "string (required)",
  "host": "string (required)",
  "releaseDate": "string (YYYY-MM-DD, required)",
  "duration": "string (MM:SS, required)",
  "category": "string (required)",
  "description": "string (required)",
  "episodeNumber": "number",
  "season": "number",
  "audioUrl": "string (Firebase Storage URL, required)",
  "thumbnailUrl": "string (Firebase Storage URL)"
}
```

**Example:**
```json
{
  "title": "Tech Talk Episode 5",
  "host": "John Smith",
  "releaseDate": "2024-01-20",
  "duration": "45:30",
  "category": "Technology",
  "description": "Discussion about AI and machine learning...",
  "episodeNumber": 5,
  "season": 1,
  "audioUrl": "https://firebasestorage.googleapis.com/v0/b/soundcave/o/podcasts%2Fep5.mp3?alt=media",
  "thumbnailUrl": "https://firebasestorage.googleapis.com/v0/b/soundcave/o/podcasts%2Fthumb5.jpg?alt=media"
}
```

### Update Podcast
**Endpoint:** `PUT /api/podcasts/:id`

**Request Payload:** (Same as Create Podcast)

### Delete Podcast
**Endpoint:** `DELETE /api/podcasts/:id`

---

## Subscription Plans

### Create Subscription Plan
**Endpoint:** `POST /api/subscriptions`

**Request Payload:**
```json
{
  "name": "string (required)",
  "price": "string (required)",
  "duration": "string (required)",
  "features": "array of strings (required)",
  "maxDownloads": "number (required, -1 for unlimited)",
  "maxPlaylists": "number (required, -1 for unlimited)",
  "audioQuality": "string (required)",
  "adsEnabled": "boolean (required)",
  "offlineMode": "boolean (required)",
  "isPopular": "boolean",
  "description": "string (required)"
}
```

**Example:**
```json
{
  "name": "Premium",
  "price": "Rp 150.000",
  "duration": "1 Month",
  "features": [
    "Everything in Basic",
    "Highest quality audio",
    "Unlimited downloads",
    "Early access to new releases",
    "Exclusive content"
  ],
  "maxDownloads": -1,
  "maxPlaylists": -1,
  "audioQuality": "Lossless (320kbps)",
  "adsEnabled": false,
  "offlineMode": true,
  "isPopular": true,
  "description": "Best value for music enthusiasts"
}
```

### Update Subscription Plan
**Endpoint:** `PUT /api/subscriptions/:id`

**Request Payload:** (Same as Create Subscription Plan)

### Delete Subscription Plan
**Endpoint:** `DELETE /api/subscriptions/:id`

---

## User Profile

### Update Profile
**Endpoint:** `PUT /api/profile`

**Request Payload:**
```json
{
  "fullName": "string (required)",
  "email": "string (required)",
  "phone": "string",
  "department": "string",
  "location": "string",
  "bio": "string",
  "profileImageUrl": "string (Firebase Storage URL, optional)"
}
```

**Example:**
```json
{
  "fullName": "Admin User",
  "email": "admin@soundcave.com",
  "phone": "+62 812-3456-7890",
  "department": "Management",
  "location": "Jakarta, Indonesia",
  "bio": "Passionate about music and technology. Managing SoundCave platform operations.",
  "profileImageUrl": "https://firebasestorage.googleapis.com/v0/b/soundcave/o/profiles%2Fadmin.jpg?alt=media"
}
```

### Change Password
**Endpoint:** `PUT /api/profile/password`

**Request Payload:**
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 8 chars)",
  "confirmPassword": "string (required)"
}
```

**Validation Rules:**
- newPassword must match confirmPassword
- newPassword minimum 8 characters
- currentPassword must be correct

### Update Preferences
**Endpoint:** `PUT /api/profile/preferences`

**Request Payload:**
```json
{
  "language": "string (id or en)",
  "timezone": "string",
  "emailNotifications": "boolean",
  "pushNotifications": "boolean",
  "marketingEmails": "boolean",
  "weeklyReports": "boolean"
}
```

**Example:**
```json
{
  "language": "id",
  "timezone": "Asia/Jakarta",
  "emailNotifications": true,
  "pushNotifications": true,
  "marketingEmails": false,
  "weeklyReports": true
}
```

---

## Notifications

### Notification Object Structure
```json
{
  "id": "number",
  "title": "string",
  "message": "string",
  "time": "string (relative time)",
  "date": "string (YYYY-MM-DD)",
  "isRead": "boolean",
  "type": "string (info, success, warning, error)"
}
```

**Example:**
```json
{
  "id": 1,
  "title": "New Artist Registered",
  "message": "John Doe just created an artist account",
  "time": "2 min ago",
  "date": "2024-01-15",
  "isRead": false,
  "type": "info"
}
```

### Mark Notification as Read
**Endpoint:** `PUT /api/notifications/:id/read`

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### Mark All as Read
**Endpoint:** `PUT /api/notifications/read-all`

### Delete Notification
**Endpoint:** `DELETE /api/notifications/:id`

---

## About Apps

### Get App Information
**Endpoint:** `GET /api/about`

**Response:**
```json
{
  "appName": "string",
  "tagline": "string",
  "description": "string",
  "version": "string",
  "launchDate": "string (YYYY-MM-DD)",
  "email": "string",
  "phone": "string",
  "address": "string",
  "socialMedia": {
    "facebook": "string",
    "instagram": "string",
    "twitter": "string",
    "youtube": "string",
    "linkedin": "string"
  },
  "appLinks": {
    "playStoreUrl": "string",
    "appStoreUrl": "string"
  },
  "legal": {
    "privacyPolicyUrl": "string",
    "termsOfServiceUrl": "string",
    "supportUrl": "string"
  },
  "features": ["array of strings"],
  "stats": {
    "totalUsers": "string",
    "totalSongs": "string",
    "totalArtists": "string",
    "totalPodcasts": "string"
  }
}
```

### Update App Information
**Endpoint:** `PUT /api/about`

**Request Payload:**
```json
{
  "appName": "string (required)",
  "tagline": "string (required)",
  "description": "string (required)",
  "version": "string",
  "launchDate": "string (YYYY-MM-DD)",
  "email": "string (required)",
  "phone": "string (required)",
  "address": "string (required)",
  "facebook": "string",
  "instagram": "string",
  "twitter": "string",
  "youtube": "string",
  "linkedin": "string",
  "playStoreUrl": "string",
  "appStoreUrl": "string",
  "privacyPolicyUrl": "string",
  "termsOfServiceUrl": "string",
  "supportUrl": "string",
  "features": ["array of strings"],
  "totalUsers": "string",
  "totalSongs": "string",
  "totalArtists": "string",
  "totalPodcasts": "string"
}
```

**Full Example:**
```json
{
  "appName": "SoundCave",
  "tagline": "Your Ultimate Music Streaming Platform",
  "description": "SoundCave adalah platform streaming musik terlengkap di Indonesia...",
  "version": "1.0.0",
  "launchDate": "2024-01-01",
  "email": "support@soundcave.com",
  "phone": "+62 21-1234-5678",
  "address": "Jl. Sudirman No. 123, Jakarta Pusat 10220, Indonesia",
  "facebook": "https://facebook.com/soundcave",
  "instagram": "https://instagram.com/soundcave",
  "twitter": "https://twitter.com/soundcave",
  "youtube": "https://youtube.com/soundcave",
  "linkedin": "https://linkedin.com/company/soundcave",
  "playStoreUrl": "https://play.google.com/store/apps/details?id=com.soundcave",
  "appStoreUrl": "https://apps.apple.com/app/soundcave/id123456789",
  "privacyPolicyUrl": "/privacy-policy",
  "termsOfServiceUrl": "/terms-of-service",
  "supportUrl": "/support",
  "features": [
    "Streaming musik unlimited",
    "Kualitas audio lossless hingga 320kbps",
    "Offline mode untuk Premium users",
    "Playlist personal dan rekomendasi AI",
    "Music videos dan podcasts",
    "Lyrics sync dengan musik",
    "Cross-platform support",
    "Family sharing untuk paket keluarga"
  ],
  "totalUsers": "1,000,000+",
  "totalSongs": "50 juta+",
  "totalArtists": "500,000+",
  "totalPodcasts": "10,000+"
}
```

---

## Analytics & Reports

### Get Dashboard Stats
**Endpoint:** `GET /api/analytics/dashboard`

**Response:**
```json
{
  "totalUsers": "number",
  "activeUsers": "number",
  "totalStreams": "number",
  "revenue": "number",
  "streamData": [
    {
      "name": "string (date/month)",
      "streams": "number",
      "users": "number"
    }
  ],
  "genreDistribution": [
    {
      "name": "string (genre)",
      "value": "number (percentage)"
    }
  ],
  "topSongs": [
    {
      "id": "number",
      "title": "string",
      "artist": "string",
      "streams": "number"
    }
  ]
}
```

### Get Analytics Data
**Endpoint:** `GET /api/analytics`

**Query Parameters:**
```
?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&metric=streams|users|revenue
```

**Response:**
```json
{
  "dateRange": {
    "start": "string",
    "end": "string"
  },
  "metrics": {
    "totalStreams": "number",
    "totalRevenue": "number",
    "avgStreamDuration": "string",
    "newUsers": "number"
  },
  "chartData": [
    {
      "date": "string",
      "value": "number"
    }
  ],
  "topPerforming": {
    "songs": ["array of song objects"],
    "artists": ["array of artist objects"],
    "genres": ["array of genre objects"]
  }
}
```

### Get Customer Reports
**Endpoint:** `GET /api/reports/customers`

**Query Parameters:**
```
?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&status=active|inactive|all
```

**Response:**
```json
{
  "totalCustomers": "number",
  "activeCustomers": "number",
  "premiumUsers": "number",
  "churnRate": "number (percentage)",
  "customers": [
    {
      "id": "number",
      "name": "string",
      "email": "string",
      "subscriptionPlan": "string",
      "status": "string",
      "joinDate": "string",
      "lastActive": "string",
      "totalStreams": "number",
      "revenue": "number"
    }
  ],
  "subscriptionDistribution": [
    {
      "plan": "string",
      "count": "number",
      "percentage": "number"
    }
  ]
}
```

### Export Report
**Endpoint:** `GET /api/reports/export`

**Query Parameters:**
```
?type=pdf|csv|excel&report=analytics|customers|revenue&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

**Response:** File download

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "string",
  "data": "object or array"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (optional)"
  }
}
```

### Validation Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "field1": ["error message 1", "error message 2"],
      "field2": ["error message"]
    }
  }
}
```

### Pagination Response
```json
{
  "success": true,
  "data": ["array of items"],
  "pagination": {
    "currentPage": "number",
    "totalPages": "number",
    "pageSize": "number",
    "totalItems": "number",
    "hasNext": "boolean",
    "hasPrev": "boolean"
  }
}
```

---

## Firebase Storage Upload Flow

### Process Overview

1. **Client uploads file to Firebase Storage**
2. **Get download URL from Firebase**
3. **Send URL in API request**

### Supported File Types

**Audio Files:**
- MP3 (audio/mpeg)
- WAV (audio/wav)
- FLAC (audio/flac)
- AAC (audio/aac)
- Maximum size: 50MB

**Image Files:**
- JPEG/JPG (image/jpeg)
- PNG (image/png)
- WebP (image/webp)
- Maximum size: 5MB
- Recommended dimensions: 1000x1000px (square)

**Video Files:**
- MP4 (video/mp4)
- WebM (video/webm)
- Maximum size: 500MB

### Firebase Storage Structure

```
soundcave/
├── audio/
│   ├── {userId}/{timestamp}_{filename}.mp3
│   └── ...
├── images/
│   ├── covers/{musicId}_{timestamp}.jpg
│   ├── artists/{artistId}_{timestamp}.jpg
│   ├── playlists/{playlistId}_{timestamp}.jpg
│   └── profiles/{userId}_{timestamp}.jpg
├── videos/
│   ├── {videoId}_{timestamp}.mp4
│   └── ...
├── podcasts/
│   ├── audio/{podcastId}_{timestamp}.mp3
│   └── thumbnails/{podcastId}_{timestamp}.jpg
└── thumbnails/
    └── ...
```

### Upload Example (JavaScript/TypeScript)

```javascript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

// Upload file to Firebase Storage
const uploadFile = async (file: File, path: string): Promise<string> => {
  const timestamp = Date.now();
  const filename = `${timestamp}_${file.name}`;
  const storageRef = ref(storage, `${path}/${filename}`);
  
  // Upload file
  const snapshot = await uploadBytes(storageRef, file);
  
  // Get download URL
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
};

// Example: Upload audio file for music
const createMusic = async (musicData: MusicFormData, audioFile: File, coverImage?: File) => {
  // 1. Upload files to Firebase
  const audioFileUrl = await uploadFile(audioFile, 'audio');
  const coverImageUrl = coverImage 
    ? await uploadFile(coverImage, 'images/covers')
    : undefined;
  
  // 2. Create payload with URLs
  const payload = {
    ...musicData,
    audioFileUrl,
    coverImageUrl,
  };
  
  // 3. Send to API
  const response = await fetch('/api/music', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  
  return await response.json();
};
```

### Upload with Progress Tracking

```javascript
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const uploadWithProgress = (
  file: File, 
  path: string,
  onProgress: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `${path}/${filename}`);
    
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Progress tracking
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        // Error handling
        reject(error);
      },
      async () => {
        // Upload completed successfully
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

// Usage
const [uploadProgress, setUploadProgress] = useState(0);

const handleUpload = async (file: File) => {
  try {
    const url = await uploadWithProgress(
      file,
      'audio',
      (progress) => setUploadProgress(progress)
    );
    console.log('File uploaded:', url);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Security Rules (Firebase Storage)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Audio files
    match /audio/{userId}/{filename} {
      allow read: if true;
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && request.resource.size < 50 * 1024 * 1024 // 50MB
                   && request.resource.contentType.matches('audio/.*');
    }
    
    // Images
    match /images/{folder}/{filename} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024 // 5MB
                   && request.resource.contentType.matches('image/.*');
    }
    
    // Videos
    match /videos/{filename} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.size < 500 * 1024 * 1024 // 500MB
                   && request.resource.contentType.matches('video/.*');
    }
    
    // Podcasts
    match /podcasts/{folder}/{filename} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Authentication Headers

All authenticated requests must include:

```javascript
{
  'Authorization': 'Bearer {access_token}',
  'Content-Type': 'application/json'
}
```

---

## Rate Limiting

- **General API:** 100 requests per minute
- **File Upload:** 10 requests per minute
- **Auth Endpoints:** 5 requests per minute

Rate limit headers in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **204 No Content** - Request successful, no content to return
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **422 Unprocessable Entity** - Validation error
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server error

---

## WebSocket Events (Real-time Updates)

### Connect
```javascript
const socket = io('wss://api.soundcave.com', {
  auth: {
    token: 'bearer_token'
  }
});
```

### Events

**New Notification:**
```javascript
socket.on('notification:new', (data) => {
  // data structure matches Notification object
});
```

**Stream Update:**
```javascript
socket.on('stream:update', (data) => {
  {
    "songId": "number",
    "currentStreams": "number",
    "totalStreams": "number"
  }
});
```

**User Activity:**
```javascript
socket.on('user:activity', (data) => {
  {
    "userId": "number",
    "action": "string",
    "timestamp": "string"
  }
});
```

---

## Notes

1. **File Uploads:** All files must be uploaded to Firebase Storage first, then send the download URLs in API requests
2. **Dates:** All dates should be in ISO 8601 format (YYYY-MM-DD)
3. **Times:** All times should be in format (HH:MM:SS or MM:SS)
4. **Content Type:** All API requests use `application/json` (no multipart/form-data)
5. **Boolean Values:** Use `true`/`false` (not `"true"`/`"false"` strings)
6. **Optional Fields:** Use `null` or omit the field, not empty strings
7. **Arrays:** Use empty `[]` if no items, not `null`
8. **Monetary Values:** Indonesian Rupiah (IDR) format: `"Rp X.XXX.XXX"`
9. **Firebase URLs:** All file URLs must be valid Firebase Storage download URLs starting with `https://firebasestorage.googleapis.com/`
10. **URL Validation:** Backend should validate that file URLs are from authorized Firebase Storage buckets

---

**Last Updated:** 2024-01-15  
**API Version:** 1.0.0  
**Base URL:** https://api.soundcave.com/v1

