"use client";

import React, { useMemo, useState } from "react";

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export default function LoanCalculator() {
  const [principal, setPrincipal] = useState<number>(20000);
  const [annualRate, setAnnualRate] = useState<number>(5);
  const [years, setYears] = useState<number>(5);

  const { monthlyPayment, schedule, totalInterest } = useMemo(() => {
    const P = Math.max(0, principal);
    const r = Math.max(0, annualRate) / 100 / 12;
    const n = Math.max(1, Math.round(years * 12));
    let monthlyPayment = 0;
    if (r === 0) monthlyPayment = P / n;
    else {
      const pow = Math.pow(1 + r, n);
      monthlyPayment = (P * r * pow) / (pow - 1);
    }

    let balance = P;
    const schedule: { month: number; payment: number; principal: number; interest: number; balance: number }[] = [];
    let totalInterest = 0;
    for (let m = 1; m <= n; m++) {
      const interest = balance * r;
      const principalPaid = Math.min(balance, monthlyPayment - interest);
      const payment = interest + principalPaid;
      balance = Math.max(0, balance - principalPaid);
      totalInterest += interest;
      schedule.push({ month: m, payment, principal: principalPaid, interest, balance });
    }

    return { monthlyPayment, schedule, totalInterest };
  }, [principal, annualRate, years]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Loan Calculator</h2>
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        <label className="flex flex-col">
          <div className="text-sm opacity-70">Loan amount</div>
          <input value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} type="number" className="p-2 rounded border" />
        </label>

        <label className="flex flex-col">
          <div className="text-sm opacity-70">Annual interest rate (%)</div>
          <input value={annualRate} onChange={(e) => setAnnualRate(Number(e.target.value))} type="number" className="p-2 rounded border" />
        </label>

        <label className="flex flex-col">
          <div className="text-sm opacity-70">Term (years)</div>
          <input value={years} onChange={(e) => setYears(Number(e.target.value))} type="number" className="p-2 rounded border" />
        </label>

        <div />
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-4">
          <div className="font-semibold">Monthly payment:</div>
          <div>{formatMoney(monthlyPayment)}</div>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm opacity-80">
          <div>Total interest: {formatMoney(totalInterest)}</div>
          <div>Term months: {schedule.length}</div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Amortization schedule (first 24 months)</h3>
        <div className="overflow-auto border rounded">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Month</th>
                <th className="text-right p-2">Payment</th>
                <th className="text-right p-2">Principal</th>
                <th className="text-right p-2">Interest</th>
                <th className="text-right p-2">Balance</th>
              </tr>
            </thead>
            <tbody>
              {schedule.slice(0, 24).map((row) => (
                <tr key={row.month}>
                  <td className="p-2">{row.month}</td>
                  <td className="p-2 text-right">{formatMoney(row.payment)}</td>
                  <td className="p-2 text-right">{formatMoney(row.principal)}</td>
                  <td className="p-2 text-right">{formatMoney(row.interest)}</td>
                  <td className="p-2 text-right">{formatMoney(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
