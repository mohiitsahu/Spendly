"use client";

import { useState, useEffect, FormEvent } from "react";
import { GoalResponse } from "@/types/goal";
import { listGoals, createGoal, deleteGoal } from "@/lib/goal-api";
import { ApiClientError } from "@/lib/api-client";

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    setIsLoading(true);
    try {
      const data = await listGoals();
      setGoals(data);
    } catch {
      setError("Failed to load goals");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createGoal({
        name,
        targetAmount: parseFloat(targetAmount),
        deadline: deadline || undefined,
      });
      setName("");
      setTargetAmount("");
      setDeadline("");
      await loadGoals();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to create goal");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to delete goal");
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-4">Goals</h1>

      <form onSubmit={handleCreate} className="flex flex-wrap gap-2 mb-6">
        <input
          type="text"
          placeholder="Goal name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-[140px] rounded-md border border-gray-300 px-3 py-2"
        />
        <input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Target amount"
          required
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          className="w-32 rounded-md border border-gray-300 px-3 py-2"
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2"
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
      ) : goals.length === 0 ? (
        <p className="text-sm text-gray-500">No goals yet.</p>
      ) : (
        <ul className="space-y-2">
          {goals.map((g) => (
            <li key={g.id} className="rounded-md border border-gray-200 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{g.name}</span>
                <button onClick={() => handleDelete(g.id)} className="text-sm text-red-600 underline">
                  Delete
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {g.savedAmount.toFixed(2)} / {g.targetAmount.toFixed(2)}
                {g.deadline && ` · due ${g.deadline}`}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}