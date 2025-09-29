"use client";

import React, { useState } from "react";
import Header from "./components/Header";
import Calculator from "./components/Calculator";
import NotebookApp from "./components/Notebook";
import Counter from "./components/Counter";
import Dice from "./components/Dice";
import WorldClock from "./components/WorldClock";

type View = "calculator" | "notebook" | "counter" | "dice" | "worldclock";

export default function ClientApp({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<View>("calculator");

  return (
    <div className="min-h-screen flex flex-col">
      <Header view={view} setView={setView} />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {view === "calculator" && <Calculator />}
          {view === "notebook" && <NotebookApp />}
          {view === "counter" && <Counter />}
          {view === "dice" && <Dice />}
          {view === "worldclock" && <WorldClock />}
          {/* fallback: show children when no view matched */}
          {!["calculator", "notebook"].includes(view) && children}
        </div>
      </main>
    </div>
  );
}
