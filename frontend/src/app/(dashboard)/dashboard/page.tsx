"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useAuth } from "@/lib/auth-context";
import { getDashboardSummary } from "@/lib/analytics-api";
import { DashboardSummary } from "@/types/analytics";

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch(() => setError("Failed to load dashboard summary"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <p className="text-sm text-ink-soft">Loading...</p>;
  }

  if (error || !summary) {
    return <p className="text-sm text-clay-dark">{error || "Something went wrong"}</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-1">
        Welcome back{user ? `, ${user.email}` : ""}
      </h1>
      <p className="text-sm text-ink-soft mb-8">This month at a glance</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <SummaryCard label="Income" value={summary.totalIncome} tone="forest" delay={0} />
        <SummaryCard label="Expenses" value={summary.totalExpense} tone="clay" delay={0.08} />
        <SummaryCard
          label="Net Savings"
          value={summary.netSavings}
          tone={summary.netSavings >= 0 ? "forest" : "clay"}
          delay={0.16}
        />
      </div>

      <h2 className="font-display text-lg text-ink mb-4">Spending by category</h2>
      {summary.categoryBreakdown.length === 0 ? (
        <p className="text-sm text-ink-soft">No expense categories yet.</p>
      ) : (
        <div className="space-y-3 max-w-lg">
          {summary.categoryBreakdown.map((c, i) => (
            <CategoryBar key={c.categoryId} category={c} delay={i * 0.06} />
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  delay,
}: {
  label: string;
  value: number;
  tone: "forest" | "clay";
  delay: number;
}) {
  const textColor = tone === "forest" ? "text-forest" : "text-clay-dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-lg border border-line bg-surface p-4 shadow-sm"
    >
      <p className="text-sm text-ink-soft mb-1">{label}</p>
      <CountUpValue value={value} className={`font-mono-figures text-2xl font-medium ${textColor}`} delay={delay} />
    </motion.div>
  );
}

function CountUpValue({ value, className, delay }: { value: number; className: string; delay: number }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => v.toFixed(2));

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.8, delay, ease: "easeOut" });
    return () => controls.stop();
  }, [value, delay, motionValue]);

  return <motion.p className={className}>{rounded}</motion.p>;
}

function CategoryBar({
  category,
  delay,
}: {
  category: { categoryName: string; spent: number; budgetLimit: number | null };
  delay: number;
}) {
  const { categoryName, spent, budgetLimit } = category;
  const hasBudget = budgetLimit !== null && budgetLimit > 0;
  const percent = hasBudget ? Math.min((spent / budgetLimit!) * 100, 100) : 0;
  const isOverBudget = hasBudget && spent > budgetLimit!;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="ledger-row ledger-row--expense pl-3"
    >
      <div className="flex justify-between text-sm mb-1">
        <span className="text-ink">{categoryName}</span>
        <span className="font-mono-figures text-ink-soft">
          {spent.toFixed(2)}
          {hasBudget && ` / ${budgetLimit!.toFixed(2)}`}
        </span>
      </div>
      {hasBudget ? (
        <div className="h-1.5 rounded-full bg-line overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.6, delay: delay + 0.1, ease: "easeOut" }}
            className={`h-1.5 rounded-full ${isOverBudget ? "bg-clay" : "bg-forest"}`}
          />
        </div>
      ) : (
        <p className="text-xs text-ink-soft/70">No budget set</p>
      )}
    </motion.div>
  );
}