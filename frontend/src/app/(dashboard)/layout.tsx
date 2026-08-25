"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/categories", label: "Categories" },
  { href: "/transactions", label: "Transactions" },
  { href: "/budgets", label: "Budgets" },
  { href: "/goals", label: "Goals" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-sm text-ink-soft">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-paper">
      <nav className="border-b border-line bg-surface px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-display text-lg text-ink">Spendly</span>
          <div className="flex items-center gap-5">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm pb-1 border-b-2 transition-colors ${
                    isActive
                      ? "text-ink border-forest font-medium"
                      : "text-ink-soft border-transparent hover:text-ink"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-ink-soft">{user.email}</span>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="text-clay-dark hover:underline"
          >
            Log out
          </button>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto p-6">{children}</main>
    </div>
  );
}