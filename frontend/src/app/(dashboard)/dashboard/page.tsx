"use client";

import { useState, useEffect } from "react";
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
        <SummaryCard label="Income" value={summary.totalIncome} tone="forest" />
        <SummaryCard label="Expenses" value={summary.totalExpense} tone="clay" />
        <SummaryCard
          label="Net Savings"
          value={summary.netSavings}
          tone={summary.netSavings >= 0 ? "forest" : "clay"}
        />
      </div>

      <h2 className="font-display text-lg text-ink mb-4">Spending by category</h2>
      {summary.categoryBreakdown.length === 0 ? (
        <p className="text-sm text-ink-soft">No expense categories yet.</p>
      ) : (
        <div className="space-y-3 max-w-lg">
          {summary.categoryBreakdown.map((c) => (
            <CategoryBar key={c.categoryId} category={c} />
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
}: {
  label: string;
  value: number;
  tone: "forest" | "clay";
}) {
  const textColor = tone === "forest" ? "text-forest" : "text-clay-dark";
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-sm text-ink-soft mb-1">{label}</p>
      <p className={`font-mono-figures text-2xl font-medium ${textColor}`}>{value.toFixed(2)}</p>
    </div>
  );
}

function CategoryBar({
  category,
}: {
  category: { categoryName: string; spent: number; budgetLimit: number | null };
}) {
  const { categoryName, spent, budgetLimit } = category;
  const hasBudget = budgetLimit !== null && budgetLimit > 0;
  const percent = hasBudget ? Math.min((spent / budgetLimit!) * 100, 100) : 0;
  const isOverBudget = hasBudget && spent > budgetLimit!;

  return (
    <div className="ledger-row ledger-row--expense pl-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-ink">{categoryName}</span>
        <span className="font-mono-figures text-ink-soft">
          {spent.toFixed(2)}
          {hasBudget && ` / ${budgetLimit!.toFixed(2)}`}
        </span>
      </div>
      {hasBudget ? (
        <div className="h-1.5 rounded-full bg-line">
          <div
            className={`h-1.5 rounded-full ${isOverBudget ? "bg-clay" : "bg-forest"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      ) : (
        <p className="text-xs text-ink-soft/70">No budget set</p>
      )}
    </div>
  );
}