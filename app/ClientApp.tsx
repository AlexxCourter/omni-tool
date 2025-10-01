"use client";

import React, { useState } from "react";
import Header from "./components/Header";
import Calculator from "./components/Calculator";
import NotebookApp from "./components/Notebook";
import Counter from "./components/Counter";
import Dice from "./components/Dice";
import WorldClock from "./components/WorldClock";
import Dashboard from "./components/Dashboard";
import Quickmarks from "./components/Quickmarks";
import BottomQuickMenu from "./components/BottomQuickMenu";
import Soundboard from "./components/Soundboard";
import Memoji from "./components/Memoji";
import Budget from "./components/Budget";
import Checkers from "./components/Checkers";
import ChessComponent from "./components/Chess";
import type { View } from "./types";

export default function ClientApp({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<View>("dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      <Header view={view} setView={setView} />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {view === "dashboard" && <Dashboard setView={setView} />}
          {view === "calculator" && <Calculator />}
          {view === "notebook" && <NotebookApp />}
          {view === "counter" && <Counter />}
          {view === "dice" && <Dice />}
          {view === "quickmarks" && <Quickmarks />}
          {view === "soundboard" && <Soundboard />}
          {view === "memoji" && <Memoji />}
          {view === "budget" && <Budget />}
          {view === "checkers" && <Checkers />}
          {view === "chess" && <ChessComponent />}
          {view === "worldclock" && <WorldClock />}
          {/* fallback: show children when no view matched */}
          {!["calculator", "notebook"].includes(view) && children}
        </div>
      </main>
      <BottomQuickMenu setView={setView} />
    </div>
  );
}
