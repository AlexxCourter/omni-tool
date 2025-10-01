"use client";

import React, { useEffect, useMemo, useState } from "react";

type Expense = { id: string; name: string; amount: number };

const STORAGE_KEY = "omni_budget_v1";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function Budget() {
  const [income, setIncome] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      return parsed.income ?? 0;
    } catch (e) {
      return 0;
    }
  });

  const [savings, setSavings] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      return parsed.savings ?? 0;
    } catch (e) {
      return 0;
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return parsed.expenses ?? [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const payload = { income, savings, expenses };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      /* ignore */
    }
  }, [income, savings, expenses]);

  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount || 0), 0), [expenses]);
  const balance = useMemo(() => Number(income || 0) - Number(savings || 0) - Number(totalExpenses || 0), [income, savings, totalExpenses]);

  function addExpense() {
    setExpenses((prev) => [...prev, { id: uid(), name: "New expense", amount: 0 }]);
  }

  function updateExpense(id: string, patch: Partial<Expense>) {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function removeExpense(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="budget-root">
      <div className="budget-topbar p-4 rounded mb-4">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold">Balance: <span className={balance >= 0 ? "text-green-300" : "text-red-300"}>{balance.toFixed(2)}</span></div>
            <div className="text-sm opacity-80 mt-1">
              <span className="text-neon-green">Income: ${Number(income || 0).toFixed(2)}</span>
              <span className="mx-3 text-neon-blue">Savings: ${Number(savings || 0).toFixed(2)}</span>
              <span className="text-neon-red">Expenses: ${Number(totalExpenses || 0).toFixed(2)}</span>
            </div>
          </div>
          <div>
            <button className="px-3 py-1 border rounded" onClick={() => { setIncome(0); setSavings(0); setExpenses([]); }}>
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="budget-form grid gap-4">
        <div>
          <label className="block text-sm opacity-80">Monthly Income</label>
          <input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} className="mt-1 p-2 rounded w-full budget-input" />
        </div>

        <div>
          <label className="block text-sm opacity-80">Monthly Savings</label>
          <input type="number" value={savings} onChange={(e) => setSavings(Number(e.target.value))} className="mt-1 p-2 rounded w-full budget-input" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Expenses</div>
            <button className="px-2 py-1 border rounded text-sm" onClick={addExpense}>Add Expense</button>
          </div>

          <div className="expenses-list max-h-64 overflow-auto p-2 border rounded">
            {expenses.length === 0 && <div className="text-sm opacity-70">No expenses yet. Add one.</div>}
            {expenses.map((exp) => (
              <div key={exp.id} className="expense-row flex items-center gap-2 mb-2">
                <input value={exp.name} onChange={(e) => updateExpense(exp.id, { name: e.target.value })} className="p-2 rounded flex-1 expense-name" />
                <input type="number" value={exp.amount} onChange={(e) => updateExpense(exp.id, { amount: Number(e.target.value) })} className="p-2 rounded expense-amount" />
                <button className="px-2 py-1 border rounded" onClick={() => removeExpense(exp.id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
