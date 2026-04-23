import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Hls from "hls.js";
import Layout from "@/components/Layout";
import axios from "axios";
import { CONFIG } from "@/config";

export default function WatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamData, setStreamData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    // 1. Fetch stream metadata from existing Go API
    const fetchStream = async () => {
      try {
        const response = await axios.get(`${CONFIG.API_URL}/api/artist-streams/${id}`);
        if (response.data?.success) {
          setStreamData(response.data.data);
          initializePlayer(response.data.data.stream_key);
        }
      } catch (err) {
        setError("Could not load stream details.");
      }
    };

    fetchStream();
  }, [id]);

  const initializePlayer = (streamKey: string) => {
    const video = videoRef.current;
    if (!video) return;

    // Use the base URL and ensure no double slashes
    const baseUrl = (process.env.NEXT_PUBLIC_HLS_URL || 'http://localhost:8080').replace(/\/$/, '');
    const token = typeof window !== "undefined" ? localStorage.getItem("soundcave_token") : "";
    
    // Construct the final HLS URL with token for authentication
    const hlsUrl = `${baseUrl}/${streamKey}.m3u8${token ? `?token=${token}` : ""}`;
    
    console.log("Loading HLS stream from:", hlsUrl);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => console.log("Autoplay blocked"));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Network error, trying to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Media error, trying to recover...");
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setError("Fatal playback error.");
              break;
          }
        }
      });
    } 
    // For Safari (Native HLS support)
    else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
    }
  };

  return (
    <Layout>
      <Head>
        <title>{streamData ? `${streamData.title} - SoundCave` : "Watch Live"}</title>
      </Head>
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative border-4 border-gray-900">
          <video
            ref={videoRef}
            controls
            className="w-full h-full object-contain"
          />
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-6 text-center">
              <div>
                <span className="text-4xl mb-4 block">📡</span>
                <p className="font-bold text-xl">{error}</p>
                <p className="text-gray-400 mt-2">The stream might be offline or still starting up.</p>
                <button 
                   onClick={() => router.reload()}
                   className="mt-6 px-6 py-2 bg-indigo-600 rounded-full font-bold"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          )}
        </div>

        {streamData && (
          <div className="mt-8 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-black text-gray-900 leading-tight">
                  {streamData.title}
                </h1>
                <p className="text-gray-600 mt-2">{streamData.description}</p>
                <div className="flex items-center mt-6 space-x-4">
                   <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black uppercase flex items-center">
                      <span className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></span>
                      Live
                   </div>
                   <span className="text-gray-400 text-sm font-medium">Broadcasted from Web Studio</span>
                </div>
              </div>
              
              <div className="hidden md:block">
                 <button className="bg-gray-50 hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-2xl font-bold transition-all border border-gray-200">
                    Share Stream
                 </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
