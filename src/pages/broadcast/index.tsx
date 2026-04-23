import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { CONFIG } from "@/config";
import toast from "react-hot-toast";
import Layout from "@/components/Layout";

interface StreamData {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  ingest_url: string;
  stream_key: string;
  web_rtc_url: string;
  status: string;
}

export default function BroadcastPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [userRole, setUserRole] = useState("");

  const [formData, setFormData] = useState({
    stream_key: "",
    description: "",
    thumbnail: "",
    broadcastType: "now",
    scheduledAt: "",
    title: "",
  });

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [activeStream, setActiveStream] = useState<StreamData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [broadcastMode, setBroadcastMode] = useState<"web" | "obs">("web");

  const getAuthHeaders = () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("soundcave_token")
        : null;
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    };
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("soundcave_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRole(user.role);

      if (user.role !== "admin") {
        router.push("/main/dashboard");
        return;
      }
    } else {
      router.push("/");
      return;
    }

    setIsInitialized(true);

    return () => {
      // Cleanup camera on unmount
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: true,
      });
      setMediaStream(stream);
      return stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error(
        "Could not access camera/microphone. Please check permissions.",
      );
      return null;
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
  };

  const startWebBroadcast = async (
    streamId: number,
    web_rtc_url: string,
    stream: MediaStream,
  ): Promise<void> => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    peerConnectionRef.current = pc;

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // Force H.264 so SRS can transcode to HLS without needing VP8/VP9 support
    if (typeof RTCRtpSender.getCapabilities === "function") {
      const caps = RTCRtpSender.getCapabilities("video");
      if (caps) {
        const h264 = caps.codecs.filter(
          (c) => c.mimeType.toLowerCase() === "video/h264",
        );
        if (h264.length > 0) {
          const transceiver = pc
            .getTransceivers()
            .find((t) => t.sender.track?.kind === "video");
          if (transceiver) {
            transceiver.setCodecPreferences(h264);
          }
        }
      }
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Wait for ICE gathering to complete (max 3s)
    await new Promise<void>((resolve) => {
      if (pc.iceGatheringState === "complete") {
        resolve();
        return;
      }
      const timeout = setTimeout(resolve, 3000);
      pc.addEventListener("icegatheringstatechange", () => {
        if (pc.iceGatheringState === "complete") {
          clearTimeout(timeout);
          resolve();
        }
      });
    });

    console.log("Sending WHIP offer to:", web_rtc_url);
    const res = await fetch(web_rtc_url, {
      method: "POST",
      headers: { "Content-Type": "application/sdp" },
      body: pc.localDescription!.sdp,
    });

    if (!res.ok) {
      throw new Error(`WHIP error: ${res.status} ${res.statusText}`);
    }

    const answerSdp = await res.text();
    await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
    console.log("WHIP broadcast started for:", web_rtc_url);

    // Notify backend so it marks status as live
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("soundcave_token")
        : null;
    await fetch(`${CONFIG.API_URL}/api/artist-streams/${streamId}/mark-live`, {
      method: "POST",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    console.log("mark-live called for stream:", streamId);
  };

  const stopWebBroadcast = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    console.log("Web broadcast stopped.");
  };

  useEffect(() => {
    if (mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream, activeStream]);



  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailPreview(URL.createObjectURL(file));
      setIsUploadingThumbnail(true);

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "broadcast-thumbnails");

      try {
        const response = await axios.post(
          `${CONFIG.API_URL}/api/images/upload`,
          uploadData,
          {
            headers: {
              ...getAuthHeaders().headers,
              "Content-Type": "multipart/form-data",
            },
          },
        );
        if (response.data?.success) {
          setFormData((prev) => ({
            ...prev,
            thumbnail: response.data.data.file_url,
          }));
          toast.success("Thumbnail uploaded!");
        }
      } catch (err) {
        toast.error("Thumbnail upload failed.");
      } finally {
        setIsUploadingThumbnail(false);
      }
    }
  };

  const handleStartStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return toast.error("Please enter a title.");
    if (formData.broadcastType === "scheduled" && !formData.scheduledAt) {
      return toast.error(
        "Please select a date and time for the scheduled broadcast.",
      );
    }

    const isNow = formData.broadcastType === "now";

    let streamToUse = mediaStream;
    if (isNow && broadcastMode === "web") {
      if (!streamToUse) {
        streamToUse = await startCamera();
        if (!streamToUse) return;
      }
    }

    setIsLoading(true);
    try {
      // Extract host from API_URL for dynamic RTMP source
      let rtmpHost = "154.26.137.37";
      try {
        const u = new URL(CONFIG.API_URL);
        rtmpHost = u.hostname;
      } catch (e) {
        console.warn("Could not parse API_URL host, using fallback RTMP host");
      }

      const payload: any = {
        title: formData.title,
        description: formData.description || formData.stream_key,
        thumbnail: formData.thumbnail,
        stream_url: `rtmp://${rtmpHost}:1935/live`, // Dynamic based on API_URL
        live_from: "web",
      };

      if (!isNow) {
        payload.scheduled_at = new Date(formData.scheduledAt).toISOString();
      }

      console.log("Starting broadcast with payload:", payload);
      console.log("API URL:", `${CONFIG.API_URL}/api/artist-streams/start`);

      const response = await axios.post(
        `${CONFIG.API_URL}/api/artist-streams/start`,
        payload,
        getAuthHeaders(),
      );

      console.log("Start broadcast response:", response.data);

      if (response.data?.success) {
        if (isNow) {
          setActiveStream(response.data.data);
          console.log("Active stream set:", response.data.data);

          if (broadcastMode === "web") {
            // Fire WHIP without blocking isLoading so End button is usable immediately
            startWebBroadcast(
              response.data.data.id,
              response.data.data.web_rtc_url,
              streamToUse!,
            )
              .then(() => {
                setActiveStream((prev) =>
                  prev ? { ...prev, status: "live" } : prev,
                );
              })
              .catch((err: any) => {
                toast.error(err?.message || "WHIP connection failed.");
                stopCamera();
                setActiveStream(null);
              });
          }

          toast.success("Broadcast session generated!");
        } else {
          toast.success("Broadcast scheduled successfully!");
          setFormData((prev) => ({
            ...prev,
            stream_key: "",
            description: "",
            broadcastType: "now",
            scheduledAt: "",
          }));
          setThumbnailPreview(null);
        }
      } else {
        if (isNow) stopCamera();
      }
    } catch (err: any) {
      if (isNow) stopCamera();
      if (err?.response?.status === 409) {
        toast.error("An active stream already exists. Please end it first.");
      } else {
        toast.error(
          err?.response?.data?.message || "Failed to start broadcast.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndStreamInternal = async () => {
    if (!activeStream) return;
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${CONFIG.API_URL}/api/artist-streams/end/${activeStream.id}`,
        {},
        getAuthHeaders(),
      );
      if (response.data?.success) {
        stopWebBroadcast();
        stopCamera();
        setActiveStream(null);
        toast.success("Broadcast ended successfully.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to end broadcast.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndStream = async () => {
    if (!activeStream) return;
    if (!confirm("Are you sure you want to end this broadcast?")) return;
    await handleEndStreamInternal();
  };

  if (!isInitialized) return null;

  return (
    <>
      <Head>
        <title>Live Studio - SoundCave</title>
      </Head>
      <Layout>
        <div className="p-6 max-w-5xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => router.push("/broadcast/list")}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to Broadcasts
            </button>
          </div>
          <div className="mb-4 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Live Studio</h1>
              <p className="text-gray-600">
                Broadcast your talent directly from your browser.
              </p>
            </div>
            {activeStream && (
              <div className="flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-red-700 uppercase">
                  Live
                </span>
              </div>
            )}
          </div>

          {!activeStream ? (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <span className="text-2xl">📹</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Prepare Your Stream
                    </h2>
                    <p className="text-sm text-gray-600">
                      Set up your camera and broadcast details.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleStartStream} className="p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Broadcast Studio Mode
                      </label>
                      <div className="flex space-x-2 bg-gray-100 p-1 rounded-2xl mb-4">
                        <button
                          type="button"
                          onClick={() => setBroadcastMode("web")}
                          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                            broadcastMode === "web"
                              ? "bg-white text-indigo-600 shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          🌐 Browser Studio
                        </button>
                        <button
                          type="button"
                          onClick={() => setBroadcastMode("obs")}
                          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                            broadcastMode === "obs"
                              ? "bg-white text-indigo-600 shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          🎥 OBS / Professional
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Broadcast Time
                      </label>
                      <div className="flex space-x-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="broadcastType"
                            value="now"
                            checked={formData.broadcastType === "now"}
                            onChange={handleChange}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-gray-700 font-medium">
                            Go Live Now
                          </span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="broadcastType"
                            value="scheduled"
                            checked={formData.broadcastType === "scheduled"}
                            onChange={handleChange}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-gray-700 font-medium">
                            Schedule for Later
                          </span>
                        </label>
                      </div>
                    </div>

                    {formData.broadcastType === "scheduled" && (
                      <div className="animate-in fade-in duration-300">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Scheduled Date & Time *
                        </label>
                        <Input
                          type="datetime-local"
                          required={formData.broadcastType === "scheduled"}
                          name="scheduledAt"
                          value={formData.scheduledAt}
                          onChange={handleChange}
                          className="h-12 bg-gray-50 border-gray-200 focus:bg-white text-lg transition-all"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Stream Title *
                      </label>
                      <Input
                        required
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="E.g., Acoustic Friday Night"
                        className="h-12 bg-gray-50 border-gray-200 focus:bg-white text-lg transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Tell your viewers what to expect..."
                        className="w-full border border-gray-200 rounded-2xl p-4 h-40 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Cover Image
                    </label>
                    <div
                      className={`relative border-2 border-dashed rounded-3xl p-6 text-center transition-all min-h-[280px] flex flex-col items-center justify-center ${
                        thumbnailPreview
                          ? "border-indigo-400 bg-indigo-50/30"
                          : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                        id="thumb-input"
                      />
                      <label
                        htmlFor="thumb-input"
                        className="cursor-pointer w-full h-full flex flex-col items-center justify-center"
                      >
                        {thumbnailPreview ? (
                          <div className="relative group w-full">
                            <img
                              src={thumbnailPreview}
                              className="h-56 w-full object-cover rounded-2xl shadow-lg border border-white"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-opacity">
                              <span className="text-white text-sm font-bold bg-white/20 px-4 py-2 rounded-lg backdrop-blur-md">
                                Replace Image
                              </span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                              <span className="text-3xl">🖼️</span>
                            </div>
                            <span className="text-gray-800 font-bold mb-1">
                              Upload a cover
                            </span>
                            <p className="text-xs text-gray-500">
                              16:9 ratio recommended
                            </p>
                          </>
                        )}
                      </label>
                      {isUploadingThumbnail && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-10">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
                          <span className="text-sm font-bold text-indigo-600">
                            Uploading...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center text-gray-500 text-sm italic">
                    <span className="mr-2">💡</span>
                    Your browser will ask for camera permission when you click
                    start.
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || isUploadingThumbnail}
                    className="px-12 py-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 disabled:opacity-50 transition-all font-black text-lg flex items-center transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Processing...
                      </>
                    ) : formData.broadcastType === "scheduled" ? (
                      "SCHEDULE SESSION 📅"
                    ) : broadcastMode === "obs" ? (
                      "GENERATE OBS KEY 🎥"
                    ) : (
                      "START LIVE STUDIO 🚀"
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-500">
              {/* Main Preview */}
              <div className="lg:col-span-3 space-y-6">
                <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative border-4 border-gray-900 ring-1 ring-white/10">
                  {broadcastMode === "web" ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover mirror-mode"
                      style={{ transform: "scaleX(-1)" }}
                    />
                  ) : (
                    <iframe
                      src={`/watch/${activeStream.id}?preview=true`}
                      className="w-full h-full border-none"
                    />
                  )}

                  {/* Overlay UI */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
                    <div className="flex justify-between items-start">
                      <div
                        className={`text-white px-3 py-1.5 rounded-lg flex items-center space-x-2 shadow-lg scale-110 origin-top-left ${
                          activeStream.status === "live"
                            ? "bg-red-600"
                            : "bg-gray-600"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 bg-white rounded-full ${
                            activeStream.status === "live"
                              ? "animate-pulse"
                              : ""
                          }`}
                        ></div>
                        <span className="text-xs font-black uppercase tracking-tighter">
                          {activeStream.status === "live"
                            ? "LIVE"
                            : "WAITING FOR OBS"}
                        </span>
                      </div>
                      <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-[10px] font-bold border border-white/20">
                        HD Monitoring · Auto Detect
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 max-w-[70%]">
                        <h3 className="text-white font-black text-lg leading-tight truncate">
                          {activeStream.title}
                        </h3>
                        <p className="text-white/60 text-xs truncate">
                          {activeStream.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
                  {broadcastMode === "web" ? (
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <span className="text-lg">🎤</span>
                        <span className="text-xs font-bold">Audio Active</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <span className="text-lg">📷</span>
                        <span className="text-xs font-bold">Webcam Active</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl">
                      <span className="animate-bounce">🎥</span>
                      <span className="text-xs font-bold uppercase">
                        Ready to receive OBS stream
                      </span>
                    </div>
                  )}

                  <button
                    onClick={handleEndStream}
                    disabled={isLoading}
                    className="px-8 py-3 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 rounded-xl transition-all font-black text-sm flex items-center shadow-sm group"
                  >
                    <span className="mr-3 transition-transform group-hover:rotate-90">
                      ⏹️
                    </span>
                    {isLoading ? "Ending..." : "END SESSION"}
                  </button>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl">
                  <h3 className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-4">
                    Stream Info
                  </h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                      <p className="text-[10px] text-indigo-300 font-bold uppercase mb-1">
                        Status
                      </p>
                      <p className="text-sm font-bold capitalize">
                        {broadcastMode === "web"
                          ? "Broadcasting via Web"
                          : `External: ${activeStream.status}`}
                      </p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl border border-white/10 relative group">
                      <p className="text-[10px] text-indigo-300 font-bold uppercase mb-1 flex justify-between">
                        RTMP Server URL
                        <button
                          onClick={() => {
                            const url = activeStream.ingest_url.split(
                              "/" + activeStream.stream_key,
                            )[0];
                            navigator.clipboard.writeText(url);
                            toast.success("URL Copied!");
                          }}
                          className="hover:text-white transition-colors"
                        >
                          📋
                        </button>
                      </p>
                      <p className="text-[10px] font-mono break-all select-all pr-6">
                        {
                          activeStream.ingest_url.split(
                            "/" + activeStream.stream_key,
                          )[0]
                        }
                      </p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl border border-white/10 relative group">
                      <p className="text-[10px] text-indigo-300 font-bold uppercase mb-1 flex justify-between">
                        Stream Key
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              activeStream.stream_key,
                            );
                            toast.success("Key Copied!");
                          }}
                          className="hover:text-white transition-colors"
                        >
                          📋
                        </button>
                      </p>
                      <p className="text-[10px] font-mono break-all select-all text-yellow-300 font-bold pr-6">
                        {activeStream.stream_key}
                      </p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                      <p className="text-[10px] text-indigo-300 font-bold uppercase mb-1">
                        Platform
                      </p>
                      <p className="text-sm font-bold text-wrap truncate">
                        {broadcastMode === "web"
                          ? "SoundCave Web Studio"
                          : "OBS Studio / Pro"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-[10px] text-indigo-300 font-medium leading-relaxed italic">
                      Others can join your live stream from the mobile app or
                      web player.
                    </p>
                  </div>
                </div>

                {activeStream.thumbnail && (
                  <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3 px-1">
                      Session Cover
                    </p>
                    <img
                      src={activeStream.thumbnail}
                      className="w-full h-auto rounded-2xl shadow-sm border border-gray-50"
                      alt="Thumbnail"
                    />
                  </div>
                )}

                <div className="p-6 bg-yellow-50 rounded-3xl border border-yellow-100 text-yellow-800 text-[10px] font-bold leading-relaxed shadow-inner">
                  <span className="text-base mr-1">⚠️</span>
                  DO NOT REFRESH the page while live, or you may need to restart
                  the session.
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
