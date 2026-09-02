"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Wallet, PieChart, Target, ShieldCheck, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: Wallet,
    title: "Track every rupee",
    description: "Log income and expenses in seconds, organized into categories that make sense to you.",
  },
  {
    icon: PieChart,
    title: "See where it goes",
    description: "A real-time dashboard breaks down spending by category against the budgets you set.",
  },
  {
    icon: Target,
    title: "Hit your goals",
    description: "Set savings targets with deadlines and watch your progress fill in as you save.",
  },
  {
    icon: ShieldCheck,
    title: "Your data, private",
    description: "Every account's data is fully isolated. Sign in with email or Google — your call.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-paper">
      <nav className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto">
        <span className="font-display text-xl text-ink">Spendly</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-ink-soft hover:text-ink transition-colors">
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm rounded-md bg-forest text-white px-4 py-2 font-medium hover:bg-forest-dark transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="max-w-3xl mx-auto px-6 pt-20 pb-24 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-4xl sm:text-5xl text-ink leading-tight mb-5"
        >
          A clear ledger for your money.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-ink-soft text-lg mb-8 max-w-xl mx-auto"
        >
          Spendly keeps income, expenses, budgets, and savings goals in one
          simple place — so you always know exactly where you stand.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-md bg-forest text-white px-6 py-3 font-medium hover:bg-forest-dark transition-colors"
          >
            Start tracking, it&apos;s free
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                className="rounded-xl border border-line bg-surface p-6 shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-forest" />
                </div>
                <h3 className="font-display text-lg text-ink mb-1.5">{feature.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <footer className="border-t border-line px-6 py-8 text-center">
        <p className="text-sm text-ink-soft">Built by Mohit Sahu · Spendly</p>
      </footer>
    </main>
  );
}