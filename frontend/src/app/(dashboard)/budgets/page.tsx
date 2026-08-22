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
        <h1 className="text-xl font-semibold mb-2">Budgets</h1>
        <p className="text-sm text-gray-600">
          You need at least one category before setting a budget.{" "}
          <a href="/categories" className="underline">Create one here</a>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-4">Budgets</h1>

      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2"
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
          className="w-32 rounded-md border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-black text-white px-4 py-2 disabled:opacity-50"
        >
          Set
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : budgets.length === 0 ? (
        <p className="text-sm text-gray-500">No budgets set yet.</p>
      ) : (
        <ul className="space-y-2">
          {budgets.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2"
            >
              <span>
                {b.category.name}: <span className="font-medium">{b.limitAmount.toFixed(2)}</span> / {b.period}
              </span>
              <button onClick={() => handleDelete(b.id)} className="text-sm text-red-600 underline">
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}