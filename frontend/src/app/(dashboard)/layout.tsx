"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return null; // brief flash before the redirect above kicks in
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <span className="font-semibold">Spendly</span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">{user.email}</span>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="underline"
          >
            Log out
          </button>
        </div>
      </nav>
      <main className="p-4">{children}</main>
    </div>
  );
}