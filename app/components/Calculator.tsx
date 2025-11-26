"use client";

import React, { useState } from "react";

type HistoryItem = { expr: string; res: string };

export default function Calculator() {
  const [display, setDisplay] = useState<string>("0");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  function inputChar(char: string) {
    setDisplay((prev) => (prev === "0" ? char : prev + char));
  }

  function clearAll() {
    setDisplay("0");
  }

  function backspace() {
    setDisplay((prev) => {
      if (prev === "0" || prev === "Error") return "0";
      const newDisplay = prev.slice(0, -1);
      return newDisplay === "" ? "0" : newDisplay;
    });
  }

  function evaluate() {
    try {
      // Evaluate simple math expression. For safety and correctness we
      // trim trailing operators first.
      const expr = display.trim().replace(/[+\-*/\s]+$/g, "");
      // eslint-disable-next-line no-new-func
      const fn = new Function(`return (${expr})`);
      const result = fn();
      const resStr = String(result);
      setHistory((h) => [{ expr, res: resStr }, ...h].slice(0, 50));
      setDisplay(resStr);
    } catch (e) {
      setDisplay("Error");
    }
  }

  const keys = [
    "7",
    "8",
    "9",
    "/",
    "4",
    "5",
    "6",
    "*",
    "1",
    "2",
    "3",
    "-",
    "0",
    ".",
    "=",
    "+",
  ];

  return (
    <div className="calc-shell">
      <div className="calc-card">
        <div className="calc-display mb-3">{display}</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {keys.map((key) => {
            const isOp = ["/", "*", "+", "-"].includes(key);
            const isEq = key === "=";
            return (
              <button
                key={key}
                onClick={() => {
                  if (key === "=") return evaluate();
                  if (isOp) {
                    inputChar(` ${key} `);
                    return;
                  }
                  inputChar(key);
                }}
                className={`btn ${isOp ? "btn-op" : ""} ${isEq ? "btn-eq" : ""}`}
              >
                {key}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex gap-2">
          <button onClick={clearAll} className="btn">
            C
          </button>
          <button onClick={backspace} className="btn">
            ⌫
          </button>
        </div>
      </div>

      <div>
        <div className="history-card">
          <div style={{ fontWeight: 700, color: "var(--btn-text)", marginBottom: 8 }}>History</div>
          {history.length === 0 && <div className="text-sm opacity-60">No history yet</div>}
          {history.map((h, idx) => (
            <div className="history-item" key={idx}>
              <div className="history-expr">{h.expr}</div>
              <div className="history-res">{h.res}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
