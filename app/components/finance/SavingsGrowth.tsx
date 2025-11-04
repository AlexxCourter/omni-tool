"use client";

import React, { useMemo, useState } from "react";

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export default function SavingsGrowth() {
  const [start, setStart] = useState<number>(1000);
  const [monthly, setMonthly] = useState<number>(200);
  const [annualRate, setAnnualRate] = useState<number>(5);
  const [years, setYears] = useState<number>(10);

  const { balances, totalContributions, interestEarned } = useMemo(() => {
    const months = Math.max(0, Math.round(years * 12));
    const monthlyRate = Math.max(0, annualRate) / 100 / 12;
    const balances: number[] = [];
    let bal = Math.max(0, start);
    balances.push(bal);
    for (let i = 1; i <= months; i++) {
      bal = bal * (1 + monthlyRate) + Math.max(0, monthly);
      balances.push(bal);
    }
    const totalContributions = start + monthly * months;
    const interestEarned = balances[balances.length - 1] - totalContributions;
    return { balances, totalContributions, interestEarned };
  }, [start, monthly, annualRate, years]);

  const max = Math.max(...balances, 1);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Savings Growth Calculator</h2>
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        <label className="flex flex-col">
          <div className="text-sm opacity-70">Starting balance</div>
          <input value={start} onChange={(e) => setStart(Number(e.target.value))} type="number" className="p-2 rounded border" />
        </label>

        <label className="flex flex-col">
          <div className="text-sm opacity-70">Monthly contribution</div>
          <input value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} type="number" className="p-2 rounded border" />
        </label>

        <label className="flex flex-col">
          <div className="text-sm opacity-70">Annual interest rate (%)</div>
          <input value={annualRate} onChange={(e) => setAnnualRate(Number(e.target.value))} type="number" className="p-2 rounded border" />
        </label>

        <label className="flex flex-col">
          <div className="text-sm opacity-70">Time horizon (years)</div>
          <input value={years} onChange={(e) => setYears(Number(e.target.value))} type="number" className="p-2 rounded border" />
        </label>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-4">
          <div className="font-semibold">Final balance:</div>
          <div>{formatMoney(balances[balances.length - 1] ?? 0)}</div>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm opacity-80">
          <div>Total contributions: {formatMoney(totalContributions)}</div>
          <div>Interest earned: {formatMoney(interestEarned)}</div>
        </div>
      </div>

      <div className="mt-6">
        <svg viewBox={`0 0 ${balances.length} 60`} width="100%" height={120} preserveAspectRatio="none" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.03), transparent)' }}>
          {balances.map((v, i) => {
            const h = (v / max) * 60;
            const y = 60 - h;
            return <rect key={i} x={i} y={y} width={0.9} height={h} fill="#38bdf8" />;
          })}
        </svg>
      </div>
    </div>
  );
}
