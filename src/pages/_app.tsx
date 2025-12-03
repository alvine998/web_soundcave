import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
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
