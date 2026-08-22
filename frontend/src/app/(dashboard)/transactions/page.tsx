"use client";

import { useState, useEffect, FormEvent } from "react";
import { TransactionResponse } from "@/types/transaction";
import { CategoryResponse } from "@/types/category";
import { listTransactions, createTransaction, deleteTransaction } from "@/lib/transaction-api";
import { listCategories } from "@/lib/category-api";
import { ApiClientError } from "@/lib/api-client";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [txPage, cats] = await Promise.all([listTransactions(), listCategories()]);
      setTransactions(txPage.content);
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
      await createTransaction({
        categoryId,
        amount: parseFloat(amount),
        note: note || undefined,
        occurredAt: new Date().toISOString(),
      });
      setAmount("");
      setNote("");
      const txPage = await listTransactions();
      setTransactions(txPage.content);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to create transaction");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to delete transaction");
    }
  }

  if (categories.length === 0 && !isLoading) {
    return (
      <div>
        <h1 className="text-xl font-semibold mb-2">Transactions</h1>
        <p className="text-sm text-gray-600">
          You need at least one category before adding transactions.{" "}
          <a href="/categories" className="underline">Create one here</a>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold mb-4">Transactions</h1>

      <form onSubmit={handleCreate} className="flex flex-wrap gap-2 mb-6">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.type})
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Amount"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-28 rounded-md border border-gray-300 px-3 py-2"
        />
        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="flex-1 min-w-[150px] rounded-md border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-black text-white px-4 py-2 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : transactions.length === 0 ? (
        <p className="text-sm text-gray-500">No transactions yet.</p>
      ) : (
        <ul className="space-y-2">
          {transactions.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2"
            >
              <div>
                <span className="font-medium">
                  {t.category.type === "EXPENSE" ? "-" : "+"}
                  {t.currency} {t.amount.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 ml-2">{t.category.name}</span>
                {t.note && <span className="text-sm text-gray-400 ml-2">{t.note}</span>}
              </div>
              <button onClick={() => handleDelete(t.id)} className="text-sm text-red-600 underline">
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}