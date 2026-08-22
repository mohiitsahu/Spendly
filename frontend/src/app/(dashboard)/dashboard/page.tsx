"use client";

import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-xl font-semibold">Welcome back{user ? `, ${user.email}` : ""}</h1>
      <p className="text-gray-600 mt-2">Your dashboard is coming together.</p>
    </div>
  );
}