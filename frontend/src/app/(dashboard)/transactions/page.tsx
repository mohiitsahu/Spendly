"use client";

import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2 } from "lucide-react";
import { TransactionResponse } from "@/types/transaction";
import { CategoryResponse } from "@/types/category";
import { listTransactions, createTransaction, deleteTransaction } from "@/lib/transaction-api";
import { listCategories } from "@/lib/category-api";
import { ApiClientError } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";

export default function TransactionsPage() {
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      showToast("Failed to load data", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
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
      showToast("Transaction added", "success");
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Failed to create transaction", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      showToast("Transaction deleted", "success");
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Failed to delete transaction", "error");
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
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-forest text-white px-4 py-2 font-medium hover:bg-forest-dark transition-colors disabled:opacity-50"
        >
          Add
        </motion.button>
      </form>

      {isLoading ? (
        <p className="text-sm text-ink-soft">Loading...</p>
      ) : transactions.length === 0 ? (
        <p className="text-sm text-ink-soft">No transactions yet.</p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {transactions.map((t, i) => {
              const isExpense = t.category.type === "EXPENSE";
              return (
                <motion.li
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
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
                    aria-label="Delete transaction"
                    className="text-ink-soft hover:text-clay-dark transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}