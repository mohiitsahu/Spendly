"use client";

import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2 } from "lucide-react";
import { GoalResponse } from "@/types/goal";
import { listGoals, createGoal, deleteGoal } from "@/lib/goal-api";
import { ApiClientError } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";

export default function GoalsPage() {
  const { showToast } = useToast();
  const [goals, setGoals] = useState<GoalResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      showToast("Failed to load goals", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createGoal({
        name,
        targetAmount: parseFloat(targetAmount),
        deadline: deadline || undefined,
      });
      const createdName = name;
      setName("");
      setTargetAmount("");
      setDeadline("");
      await loadGoals();
      showToast(`"${createdName}" goal created`, "success");
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Failed to create goal", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string, goalName: string) {
    try {
      await deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      showToast(`"${goalName}" deleted`, "success");
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Failed to delete goal", "error");
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="font-display text-2xl text-ink mb-6">Goals</h1>

      <form onSubmit={handleCreate} className="flex flex-wrap gap-2 mb-6">
        <input
          type="text"
          placeholder="Goal name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-[140px] rounded-md border border-line bg-surface px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
        />
        <input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Target amount"
          required
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          className="w-32 rounded-md border border-line bg-surface px-3 py-2 text-ink font-mono-figures focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="rounded-md border border-line bg-surface px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
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
      ) : goals.length === 0 ? (
        <p className="text-sm text-ink-soft">No goals yet.</p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {goals.map((g, i) => {
              const percent = g.targetAmount > 0 ? Math.min((g.savedAmount / g.targetAmount) * 100, 100) : 0;
              return (
                <motion.li
                  key={g.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className="bg-surface border-l-3 border-l-gold border-t border-r border-b border-line rounded-md pl-3 pr-3 py-2"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-ink font-medium">{g.name}</span>
                    <button
                      onClick={() => handleDelete(g.id, g.name)}
                      aria-label="Delete goal"
                      className="text-ink-soft hover:text-clay-dark transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="flex justify-between text-sm text-ink-soft mb-1">
                    <span className="font-mono-figures">
                      {g.savedAmount.toFixed(2)} / {g.targetAmount.toFixed(2)}
                    </span>
                    {g.deadline && <span>due {g.deadline}</span>}
                  </div>
                  <div className="h-1.5 rounded-full bg-line overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-1.5 rounded-full bg-gold"
                    />
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}