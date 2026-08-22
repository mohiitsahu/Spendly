"use client";

import { useState, useEffect, FormEvent } from "react";
import { CategoryResponse, CategoryType } from "@/types/category";
import { listCategories, createCategory, deleteCategory } from "@/lib/category-api";
import { ApiClientError } from "@/lib/api-client";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("EXPENSE");
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
      setError("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createCategory({ name, type });
      setName("");
      await loadCategories(); // refetch to show the new one
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to delete category");
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-4">Categories</h1>

      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Category name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as CategoryType)}
          className="rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
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
      ) : categories.length === 0 ? (
        <p className="text-sm text-gray-500">No categories yet.</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2"
            >
              <span>
                {category.name}{" "}
                <span className="text-xs text-gray-500">({category.type})</span>
              </span>
              <button onClick={() => handleDelete(category.id)} className="text-sm text-red-600 underline">
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}