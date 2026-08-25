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
        <h1 className="font-display text-2xl text-ink mb-2">Transactions</h1>
        <p className="text-sm text-ink-soft">
          You need at least one category before adding transactions.{" "}
          <a href="/categories" className="text-forest font-medium hover:underline">
            Create one here
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl text-ink mb-6">Transactions</h1>

      <form onSubmit={handleCreate} className="flex flex-wrap gap-2 mb-6">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-md border border-line bg-surface px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.type.toLowerCase()})
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
          className="w-28 rounded-md border border-line bg-surface px-3 py-2 text-ink font-mono-figures focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
        />
        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="flex-1 min-w-[150px] rounded-md border border-line bg-surface px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-forest text-white px-4 py-2 font-medium hover:bg-forest-dark transition-colors disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {error && <p className="text-sm text-clay-dark mb-4">{error}</p>}

      {isLoading ? (
        <p className="text-sm text-ink-soft">Loading...</p>
      ) : transactions.length === 0 ? (
        <p className="text-sm text-ink-soft">No transactions yet.</p>
      ) : (
        <ul className="space-y-2">
          {transactions.map((t) => {
            const isExpense = t.category.type === "EXPENSE";
            return (
              <li
                key={t.id}
                className={`ledger-row ${
                  isExpense ? "ledger-row--expense" : "ledger-row--income"
                } flex items-center justify-between bg-surface border border-line rounded-md pl-3 pr-3 py-2`}
              >
                <div>
                  <span
                    className={`font-mono-figures font-medium ${
                      isExpense ? "text-clay-dark" : "text-forest"
                    }`}
                  >
                    {isExpense ? "-" : "+"}
                    {t.currency} {t.amount.toFixed(2)}
                  </span>
                  <span className="text-sm text-ink-soft ml-2">{t.category.name}</span>
                  {t.note && <span className="text-sm text-ink-soft/70 ml-2">{t.note}</span>}
                </div>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-sm text-clay-dark hover:underline"
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}