"use client";

import React, { useMemo, useState } from "react";

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export default function ROICalculator() {
  const [cost, setCost] = useState<number>(5000);
  const [savingsPerPeriod, setSavingsPerPeriod] = useState<number>(200);
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");

  const { monthsToBreakEven, yearsToBreakEven } = useMemo(() => {
    const monthlySavings = period === "monthly" ? savingsPerPeriod : savingsPerPeriod / 12;
    const months = monthlySavings > 0 ? Math.ceil(cost / monthlySavings) : Infinity;
    return { monthsToBreakEven: months, yearsToBreakEven: months / 12 };
  }, [cost, savingsPerPeriod, period]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">ROI / Break-even Calculator</h2>
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        <label className="flex flex-col">
          <div className="text-sm opacity-70">Upfront cost</div>
          <input value={cost} onChange={(e) => setCost(Number(e.target.value))} type="number" className="p-2 rounded border" />
        </label>

        <label className="flex flex-col">
          <div className="text-sm opacity-70">Expected savings / returns</div>
          <input value={savingsPerPeriod} onChange={(e) => setSavingsPerPeriod(Number(e.target.value))} type="number" className="p-2 rounded border" />
        </label>

        <label className="flex flex-col">
          <div className="text-sm opacity-70">Period</div>
          <select value={period} onChange={(e) => setPeriod(e.target.value as 'monthly' | 'yearly')} className="p-2 rounded border">
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </label>

        <div />
      </div>

      <div className="mt-4">
        <div className="font-semibold">Break-even</div>
        <div className="mt-2 text-sm opacity-80">Approximately {monthsToBreakEven === Infinity ? '—' : `${monthsToBreakEven} months`} ({yearsToBreakEven === Infinity ? '—' : `${yearsToBreakEven.toFixed(1)} years`})</div>
      </div>

      <div className="mt-4">
        <div className="text-sm">Example: If cost is {formatMoney(cost)} and you save {period === 'monthly' ? formatMoney(savingsPerPeriod) + ' / month' : formatMoney(savingsPerPeriod) + ' / year'}, this shows how long until your investment pays for itself.</div>
      </div>
    </div>
  );
}
