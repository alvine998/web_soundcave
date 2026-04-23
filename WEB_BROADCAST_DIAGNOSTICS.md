# Quick Diagnostics for Web Broadcast Issue

## What's Happening

**Mobile (Works)**: RTMP → Backend FFmpeg → HLS → Mobile can access
**Web (Broken)**: Socket.io WebM → Backend??? → HLS (not generated)

The mobile app can see the stream URL pattern and successfully connect to the HLS endpoint when broadcasting from mobile. But when you broadcast from the web, the same HLS endpoint isn't available or has no stream data.

## Immediate Checks (Do These First)

### 1. Check Backend Logs
When you broadcast from web:
```bash
# Look for these in backend logs:
- "web_broadcast_ready" - Socket connection accepted?
- "web_broadcast_chunk" - Chunks being received?
- FFmpeg process started?
- HLS segments being generated?
```

### 2. Check Network Request
In browser DevTools → Network tab when streaming:
- Is Socket.io connected? (look for Socket.IO messages)
- Are chunks being sent? (size > 0?)
- Is backend acknowledging receipt?

### 3. Test HLS Endpoint
While broadcasting from web, try:
```
http://154.26.137.37:8080/hls/{stream_id}.m3u8
```
- Does it exist?
- Does it have content?
- Is it valid M3U8?

## Most Likely Solution

The problem is probably that **Socket.io WebM streaming doesn't trigger proper HLS generation on your backend**.

### Quick Fix Options:

**Option A: Force RTMP Instead (Easiest)**
- Your backend expects RTMP input for proper HLS generation
- WebM via Socket.io might not be fully implemented on backend
- Solution: Use an RTMP encoder for web browser

**Option B: Check Backend Media Processing**
- Verify your backend can receive WebM chunks
- Verify FFmpeg is configured to read from Socket.io
- Verify HLS output directory is accessible

**Option C: Add Debugging**
Add this to see if chunks reach backend:

```typescript
// In broadcast/index.tsx
const startWebBroadcast = (strmKey: string, stream: MediaStream) => {
  // ... existing code ...
  
  mediaRecorder.ondataavailable = async (e) => {
    if (e.data && e.data.size > 0 && socketRef.current) {
      console.log(`📤 Sending chunk: ${e.data.size} bytes`);
      const arrayBuffer = await e.data.arrayBuffer();
      socketRef.current.emit("web_broadcast_chunk", {
        streamKey: strmKey,
        chunk: arrayBuffer,
      });
    } else {
      console.warn(`⚠️ Empty chunk or socket not ready: ${e.data?.size}`);
    }
  };
  
  socketRef.current.on("chunk_received", (data: any) => {
    console.log("✅ Backend acknowledged chunk:", data);
  });
};
```

Then check browser console to see if chunks are being sent.

## Backend Configuration Needed

For web Socket.io streaming to work with mobile HLS viewing, your backend needs:

1. **Socket.io WebM receiver** - accepts chunks on `web_broadcast_chunk` event
2. **WebM-to-RTMP converter** OR **WebM-to-HLS converter**
3. **HLS segment generator** that writes to accessible path
4. **Stream key mapping** so mobile knows which HLS stream to access

If your backend only has RTMP → HLS pipeline, you need to either:
- Add WebM → RTMP converter, OR
- Add WebM → HLS converter

## Next Steps

1. **Check backend logs** while broadcasting from web
2. **Verify HLS endpoint exists** during web broadcast
3. **Enable debugging** in both frontend and backend
4. **Share backend setup** - how does it handle WebM vs RTMP?

If backend only supports RTMP, we should modify the web broadcast to use RTMP instead of Socket.io WebM.
