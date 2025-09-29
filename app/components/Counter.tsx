"use client";

import React, { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState<number>(0);

  function increment() {
    setCount((c) => c + 1);
  }

  function reset() {
    setCount(0);
  }

  return (
    <div className="max-w-md mx-auto p-6 border rounded flex flex-col items-stretch gap-4">
      <div className="flex justify-end">
        <button onClick={reset} className="px-3 py-1 border rounded text-sm">Reset</button>
      </div>

      <div className="text-center text-6xl font-mono p-6 border rounded bg-white/5">{count}</div>

      <button onClick={increment} className="px-6 py-6 bg-blue-600 text-white rounded text-4xl">+</button>
    </div>
  );
}
