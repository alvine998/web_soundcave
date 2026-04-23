# Web Broadcast - Mobile App Streaming Issue

## Problem Analysis

Mobile apps can see broadcasts from React Native (RTMP), but NOT from web browser (Socket.io WebM chunks).

### Root Causes:

1. **Different Streaming Protocols**
   - Mobile app (React Native): RTMP → HLS endpoint
   - Web browser: Socket.io WebM chunks → needs backend processing

2. **HLS Stream Not Generated/Available**
   - Mobile apps try to connect to HLS URL: `http://154.26.137.37:8080/hls/{stream_id}.m3u8`
   - Error `-875574520` = Connection failed or stream unavailable
   - When mobile gets RTMP stream, HLS is properly generated
   - When web sends Socket.io chunks, HLS processing may fail

3. **Possible Backend Issues**
   - FFmpeg not properly receiving/processing WebM chunks from Socket.io
   - HLS segments not being generated
   - CORS or authentication issues accessing the HLS endpoint

## Solutions to Try

### Option 1: Use RTMP Instead of Socket.io (Recommended)
Send RTMP stream from web browser instead of Socket.io chunks.

**Changes needed in `/src/pages/broadcast/index.tsx`:**
- Replace Socket.io WebM streaming with RTMP-capable encoder
- Use `ingest_url` provided by backend: `rtmp://154.26.137.37:1935/live`
- Include stream key in RTMP URL: `rtmp://154.26.137.37:1935/live/{stream_key}`

### Option 2: Fix Backend WebM Processing
Ensure backend properly handles Socket.io WebM chunks:
- Verify FFmpeg is receiving chunks
- Check chunk assembly and conversion to HLS
- Verify HLS segments are being written to correct path
- Check file permissions on HLS output directory

### Option 3: Debug WebM Stream
```typescript
// Add these logs to diagnose what's being sent:
mediaRecorder.ondataavailable = async (e) => {
  console.log('Chunk size:', e.data.size, 'bytes');
  console.log('Chunk type:', e.data.type);
  console.log('Is empty:', e.data.size === 0);
  
  // Send to backend
  socketRef.current.emit("web_broadcast_chunk", {
    streamKey: strmKey,
    chunk: await e.data.arrayBuffer(),
    size: e.data.size,
    timestamp: Date.now()
  });
};
```

## Recommended Fix: Use RTMP Protocol

Replace the Socket.io approach with RTMP streaming which is proven to work:

1. **Frontend change**: Remove Socket.io WebM streaming
2. **Use system audio/video encoder**: Convert browser stream to RTMP
3. **RTMP URL format**: `rtmp://154.26.137.37:1935/live/{stream_key}`

This approach:
- Works consistently across platforms
- Generates proper HLS automatically
- Mobile apps can access the same HLS endpoint
- No special backend processing needed

## Additional Checks

1. **Verify backend is running FFmpeg and HLS server**
2. **Check if HLS path exists**: `/hls/{stream_id}.m3u8`
3. **Test RTMP directly** (from any RTMP client)
4. **Check network logs** in browser DevTools to see if backend is receiving chunks
5. **Verify stream_key format** matches between web and mobile

## Implementation Priority

1. First: Check backend logs for WebM stream reception
2. Second: Implement RTMP from browser (easier, more compatible)
3. Third: Fix backend HLS generation if using Socket.io
