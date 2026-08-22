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
    return <p className="text-sm text-gray-500">Loading...</p>;
  }

  if (error || !summary) {
    return <p className="text-sm text-red-600">{error || "Something went wrong"}</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Welcome back{user ? `, ${user.email}` : ""}</h1>
      <p className="text-sm text-gray-500 mb-6">This month at a glance</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <SummaryCard label="Income" value={summary.totalIncome} color="text-green-600" />
        <SummaryCard label="Expenses" value={summary.totalExpense} color="text-red-600" />
        <SummaryCard
          label="Net Savings"
          value={summary.netSavings}
          color={summary.netSavings >= 0 ? "text-green-600" : "text-red-600"}
        />
      </div>

      <h2 className="text-lg font-semibold mb-3">Spending by category</h2>
      {summary.categoryBreakdown.length === 0 ? (
        <p className="text-sm text-gray-500">No expense categories yet.</p>
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

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value.toFixed(2)}</p>
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
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{categoryName}</span>
        <span className="text-gray-500">
          {spent.toFixed(2)}
          {hasBudget && ` / ${budgetLimit!.toFixed(2)}`}
        </span>
      </div>
      {hasBudget ? (
        <div className="h-2 rounded-full bg-gray-100">
          <div
            className={`h-2 rounded-full ${isOverBudget ? "bg-red-500" : "bg-black"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      ) : (
        <p className="text-xs text-gray-400">No budget set</p>
      )}
    </div>
  );
}