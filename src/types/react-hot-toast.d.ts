declare module "react-hot-toast" {
  import * as React from "react";

  export interface ToastOptions {
    id?: string;
    duration?: number;
    position?:
      | "top-left"
      | "top-center"
      | "top-right"
      | "bottom-left"
      | "bottom-center"
      | "bottom-right";
    // gaya tambahan untuk toast
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    style?: React.CSSProperties | Record<string, any>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type ToastFn = (message: string, options?: ToastOptions) => any;

  // Default export dengan helper methods (mirip API asli react-hot-toast)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toast: ToastFn & {
    success: ToastFn;
    error: ToastFn;
    loading: ToastFn;
  };

  export default toast;

  interface ToasterProps {
    position?: ToastOptions["position"];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toastOptions?: ToastOptions & { [key: string]: any };
  }

  export const Toaster: React.FC<ToasterProps>;
}



