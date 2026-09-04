"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: { theme: string; size: string; width: number }) => void;
        };
      };
    };
  }
}

export default function GoogleSignInButton() {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = initializeGoogleButton;
    document.body.appendChild(script);

    function initializeGoogleButton() {
      if (!window.google || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: async (response) => {
          try {
            await loginWithGoogle(response.credential);
            router.push("/dashboard");
          } catch (err) {
            console.error("Google sign-in failed:", err);
          }
        },
      });

      // Match the button's width to its actual container instead of a
      // hardcoded pixel value, so it lines up with the form above it
      // regardless of the container's max-width.
      const containerWidth = buttonRef.current.offsetWidth;

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: containerWidth,
      });
    }

    return () => {
      document.body.removeChild(script);
    };
  }, [loginWithGoogle, router]);

  return <div ref={buttonRef} className="w-full" />;
}