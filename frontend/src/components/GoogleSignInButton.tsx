"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

// Minimal typing for the parts of Google's Identity Services API we use -
// the real library doesn't ship its own TypeScript types.
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

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
      });
    }

    return () => {
      document.body.removeChild(script);
    };
  }, [loginWithGoogle, router]);

  return <div ref={buttonRef} />;
}