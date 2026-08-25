"use client";

import { useState, useEffect, FormEvent } from "react";
import { BudgetResponse } from "@/types/budget";
import { CategoryResponse } from "@/types/category";
import { listBudgets, createBudget, deleteBudget } from "@/lib/budget-api";
import { listCategories } from "@/lib/category-api";
import { ApiClientError } from "@/lib/api-client";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categoryId, setCategoryId] = useState("");
  const [limitAmount, setLimitAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [budgetList, cats] = await Promise.all([listBudgets(), listCategories()]);
      setBudgets(budgetList);
      setCategories(cats);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    } catch {
      setError("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createBudget({ categoryId, limitAmount: parseFloat(limitAmount) });
      setLimitAmount("");
      const budgetList = await listBudgets();
      setBudgets(budgetList);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to create budget");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteBudget(id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to delete budget");
    }
  }

  if (categories.length === 0 && !isLoading) {
    return (
      <div>
        <h1 className="font-display text-2xl text-ink mb-2">Budgets</h1>
        <p className="text-sm text-ink-soft">
          You need at least one category before setting a budget.{" "}
          <a href="/categories" className="text-forest font-medium hover:underline">
            Create one here
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <h1 className="font-display text-2xl text-ink mb-6">Budgets</h1>

      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-md border border-line bg-surface px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Monthly limit"
          required
          value={limitAmount}
          onChange={(e) => setLimitAmount(e.target.value)}
          className="w-32 rounded-md border border-line bg-surface px-3 py-2 text-ink font-mono-figures focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-forest text-white px-4 py-2 font-medium hover:bg-forest-dark transition-colors disabled:opacity-50"
        >
          Set
        </button>
      </form>

      {error && <p className="text-sm text-clay-dark mb-4">{error}</p>}

      {isLoading ? (
        <p className="text-sm text-ink-soft">Loading...</p>
      ) : budgets.length === 0 ? (
        <p className="text-sm text-ink-soft">No budgets set yet.</p>
      ) : (
        <ul className="space-y-2">
          {budgets.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between bg-surface border-l-3 border-l-gold border-t border-r border-b border-line rounded-md pl-3 pr-3 py-2"
            >
              <span className="text-ink">
                {b.category.name}:{" "}
                <span className="font-mono-figures font-medium">{b.limitAmount.toFixed(2)}</span>{" "}
                <span className="text-xs text-ink-soft">/ {b.period.toLowerCase()}</span>
              </span>
              <button
                onClick={() => handleDelete(b.id)}
                className="text-sm text-clay-dark hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}