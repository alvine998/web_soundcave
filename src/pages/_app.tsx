import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Setup axios interceptor untuk handle 401
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Remove token and user data
          if (typeof window !== "undefined") {
            localStorage.removeItem("soundcave_token");
            localStorage.removeItem("soundcave_user");
            // Redirect to login page
            window.location.href = "/";
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <ToastProvider>
      <>
        <Component {...pageProps} />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontSize: "0.875rem",
            },
          }}
        />
      </>
    </ToastProvider>
  );
}
