"use client";

import React, { useEffect, useState } from "react";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Kolkata",
  "Australia/Sydney",
];

function formatTime(date: Date, tz?: string) {
  try {
    return new Intl.DateTimeFormat([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: tz,
    }).format(date);
  } catch (e) {
    return date.toLocaleTimeString();
  }
}

export default function WorldClock() {
  const [now, setNow] = useState(new Date());
  const [zones, setZones] = useState<string[]>([]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  function addZone() {
    setZones((zs) => [...zs, TIMEZONES[0]]);
  }

  function setZoneAt(index: number, tz: string) {
    setZones((zs) => zs.map((z, i) => (i === index ? tz : z)));
  }

  return (
    <div className="p-6 world-clock-root">
      <div className="mb-4 border rounded p-4 max-w-lg world-clock-card">
        <div className="text-sm opacity-60">Local time</div>
        <div className="text-5xl font-mono mt-2 world-clock-local">{formatTime(now)}</div>
        <div className="text-xs opacity-60 mt-1">{Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
      </div>

      <div className="mb-4">
        <button onClick={addZone} className="px-3 py-1 border rounded bg-blue-600 text-white">Add timezone</button>
      </div>

      <div className="world-clock-grid">
        {zones.map((tz, idx) => (
          <div key={idx} className="p-3 border rounded world-clock-card">
            <div className="flex justify-between items-center mb-2">
              <select value={tz} onChange={(e) => setZoneAt(idx, e.target.value)} className="px-2 py-1 border rounded">
                {TIMEZONES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <div className="text-sm opacity-60 tz-label">{tz}</div>
            </div>
            <div className="text-3xl font-mono text-center world-clock-time">{formatTime(now, tz)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
