"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Tags,
  ArrowLeftRight,
  PiggyBank,
  Target,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/goals", label: "Goals", icon: Target },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-paper">
      <nav className="border-b border-line bg-surface px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-display text-lg text-ink">Spendly</span>

            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative px-3 py-2 flex items-center gap-1.5 text-sm"
                  >
                    <Icon size={15} className={isActive ? "text-forest" : "text-ink-soft"} />
                    <span className={isActive ? "text-ink font-medium" : "text-ink-soft"}>
                      {link.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute left-0 right-0 -bottom-[13px] h-0.5 bg-forest"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 text-sm">
            <span className="text-ink-soft">{user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-clay-dark hover:underline"
            >
              <LogOut size={14} />
              Log out
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="md:hidden text-ink p-1"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-4 pb-2 flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm ${
                        isActive ? "bg-forest/10 text-forest font-medium" : "text-ink-soft"
                      }`}
                    >
                      <Icon size={16} />
                      {link.label}
                    </Link>
                  );
                })}
                <div className="border-t border-line mt-2 pt-3 flex items-center justify-between px-3">
                  <span className="text-sm text-ink-soft">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-clay-dark"
                  >
                    <LogOut size={14} />
                    Log out
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="max-w-4xl mx-auto p-4 sm:p-6"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}