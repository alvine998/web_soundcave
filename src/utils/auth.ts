import { useRouter } from "next/router";
import { useEffect, useState } from "react";

/**
 * Check if user is authenticated
 * @returns token string or null
 */
export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("soundcave_token");
  }
  return null;
};

/**
 * Check if user is authenticated and redirect to login if not
 * Use this hook in pages that require authentication
 */
export const useRequireAuth = () => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      // No token found, redirect to login
      router.push("/");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  return { isChecking };
};
