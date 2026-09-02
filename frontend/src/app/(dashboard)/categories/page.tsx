"use client";

import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2 } from "lucide-react";
import { CategoryResponse, CategoryType } from "@/types/category";
import { listCategories, createCategory, deleteCategory } from "@/lib/category-api";
import { ApiClientError } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";

const ICON_OPTIONS = [
  "🍔", "🛒", "🏠", "🚗", "✈️", "🎬", "💊", "📚",
  "👕", "💡", "📱", "🎁", "💰", "💼", "🏦", "🐾",
];

export default function CategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [icon, setIcon] = useState<string>(ICON_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setIsLoading(true);
    try {
      const data = await listCategories();
      setCategories(data);
    } catch {
      showToast("Failed to load categories", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createCategory({ name, type, icon });
      const createdName = name;
      setName("");
      await loadCategories();
      showToast(`"${createdName}" added`, "success");
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Failed to create category", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string, categoryName: string) {
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast(`"${categoryName}" deleted`, "success");
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Failed to delete category", "error");
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="font-display text-2xl text-ink mb-6">Categories</h1>

      <form onSubmit={handleCreate} className="mb-6 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Category name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-md border border-line bg-surface px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CategoryType)}
            className="rounded-md border border-line bg-surface px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </div>

        <div>
          <p className="text-xs text-ink-soft mb-2">Icon</p>
          <div className="flex flex-wrap gap-1.5">
            {ICON_OPTIONS.map((option) => (
              <motion.button
                key={option}
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setIcon(option)}
                aria-label={`Choose icon ${option}`}
                className={`w-9 h-9 rounded-md border text-lg flex items-center justify-center transition-colors ${
                  icon === option
                    ? "border-forest bg-forest/10"
                    : "border-line bg-surface hover:border-forest/50"
                }`}
              >
                {option}
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-forest text-white px-4 py-2 font-medium hover:bg-forest-dark transition-colors disabled:opacity-50"
        >
          Add category
        </motion.button>
      </form>

      {isLoading ? (
        <p className="text-sm text-ink-soft">Loading...</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-ink-soft">No categories yet — add your first one above.</p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {categories.map((category, i) => (
              <motion.li
                key={category.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className={`ledger-row ${
                  category.type === "INCOME" ? "ledger-row--income" : "ledger-row--expense"
                } flex items-center justify-between bg-surface border border-line rounded-md pl-3 pr-3 py-2`}
              >
                <span className="text-ink flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  {category.name}{" "}
                  <span className="text-xs text-ink-soft">({category.type.toLowerCase()})</span>
                </span>
                <button
                  onClick={() => handleDelete(category.id, category.name)}
                  aria-label="Delete category"
                  className="text-ink-soft hover:text-clay-dark transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}