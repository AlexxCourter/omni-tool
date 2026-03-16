"use client";

import React, { useEffect, useState } from "react";

const TIMEZONES = [
  { value: "UTC", label: "UTC - Coordinated Universal Time" },
  { value: "America/New_York", label: "New York - Eastern Time" },
  { value: "America/Los_Angeles", label: "Los Angeles - Pacific Time" },
  { value: "America/Chicago", label: "Chicago - Central Time" },
  { value: "America/Denver", label: "Denver - Mountain Time" },
  { value: "Europe/London", label: "London - GMT/BST" },
  { value: "Europe/Paris", label: "Paris - Central European Time" },
  { value: "Europe/Berlin", label: "Berlin - Central European Time" },
  { value: "Asia/Tokyo", label: "Tokyo - Japan Standard Time" },
  { value: "Asia/Shanghai", label: "Shanghai - China Standard Time" },
  { value: "Asia/Dubai", label: "Dubai - Gulf Standard Time" },
  { value: "Asia/Kolkata", label: "India - Indian Standard Time" },
  { value: "Australia/Sydney", label: "Sydney - Australian Eastern Time" },
  { value: "Pacific/Auckland", label: "Auckland - New Zealand Time" },
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

function formatDate(date: Date, tz?: string) {
  try {
    return new Intl.DateTimeFormat([], {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: tz,
    }).format(date);
  } catch (e) {
    return date.toLocaleDateString();
  }
}

function getHourInTimezone(date: Date, tz?: string): number {
  try {
    const timeString = new Intl.DateTimeFormat([], {
      hour: "2-digit",
      hour12: false,
      timeZone: tz,
    }).format(date);
    return parseInt(timeString, 10);
  } catch (e) {
    return date.getHours();
  }
}

function getTimeOfDayIcon(hour: number): string {
  if (hour >= 6 && hour < 12) return "🌅"; // Morning
  if (hour >= 12 && hour < 18) return "☀️"; // Afternoon
  if (hour >= 18 && hour < 21) return "🌆"; // Evening
  return "🌙"; // Night
}

function getTimeOfDayColor(hour: number): string {
  if (hour >= 6 && hour < 12) return "var(--neon-green)"; // Morning - neon green
  if (hour >= 12 && hour < 18) return "#ffeb3b"; // Afternoon - neon yellow (readable)
  if (hour >= 18 && hour < 21) return "#ff9f43"; // Evening - neon orange
  return "#c084fc"; // Night - neon purple
}

export default function WorldClock() {
  const [now, setNow] = useState(new Date());
  const [zones, setZones] = useState<string[]>([]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  function addZone() {
    setZones((zs) => [...zs, TIMEZONES[0].value]);
  }

  function removeZone(index: number) {
    setZones((zs) => zs.filter((_, i) => i !== index));
  }

  function setZoneAt(index: number, tz: string) {
    setZones((zs) => zs.map((z, i) => (i === index ? tz : z)));
  }

  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localHour = now.getHours();
  const localIcon = getTimeOfDayIcon(localHour);
  const localColor = getTimeOfDayColor(localHour);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold" style={{ color: "var(--accent)" }}>
          🌍 World Clock
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          Track time across different timezones
        </p>
      </div>

      {/* Local Time - Prominent Display */}
      <div
        className="relative overflow-hidden rounded-2xl p-8 border-2 transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, rgba(123, 232, 255, 0.08) 0%, rgba(107, 212, 255, 0.05) 100%)",
          borderColor: localColor,
          boxShadow: `0 8px 32px ${localColor}20`,
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">{localIcon}</span>
            <span className="text-sm font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Local Time
            </span>
          </div>
          <div
            className="text-6xl md:text-7xl font-bold font-mono tracking-tight mb-2"
            style={{ color: localColor, textShadow: `0 0 20px ${localColor}40` }}
          >
            {formatTime(now)}
          </div>
          <div className="flex items-center gap-3 text-sm" style={{ color: "var(--muted)" }}>
            <span>{formatDate(now)}</span>
            <span>•</span>
            <span>{localTz}</span>
          </div>
        </div>
        
        {/* Decorative Background Element */}
        <div
          className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full opacity-10 blur-3xl"
          style={{ background: localColor }}
        />
      </div>

      {/* Add Timezone Button */}
      <div>
        <button
          onClick={addZone}
          className="px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide
            border-2 border-[var(--accent)] bg-[var(--btn-op-bg)] text-[var(--accent)]
            hover:scale-105 hover:shadow-[0_0_20px_rgba(123,232,255,0.5)] hover:border-[var(--neon-blue)]
            transition-all duration-300 ease-out flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Timezone
        </button>
      </div>

      {/* Timezone Cards Grid */}
      {zones.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {zones.map((tz, idx) => {
            const hour = getHourInTimezone(now, tz);
            const icon = getTimeOfDayIcon(hour);
            const color = getTimeOfDayColor(hour);
            const tzLabel = TIMEZONES.find((t) => t.value === tz)?.label || tz;

            return (
              <div
                key={idx}
                className="relative rounded-xl p-5 border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  borderColor: "var(--btn-op-bg)",
                }}
              >
                {/* Remove Button */}
                <button
                  onClick={() => removeZone(idx)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100
                    bg-[var(--btn-bg)] border border-[var(--neon-red)]
                    hover:shadow-[0_0_15px_rgba(255,107,107,0.6)] hover:scale-110 transition-all duration-200"
                  style={{ color: "var(--neon-red)" }}
                  title="Remove timezone"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Time Icon */}
                <div className="text-2xl mb-3">{icon}</div>

                {/* Timezone Selector */}
                <select
                  value={tz}
                  onChange={(e) => setZoneAt(idx, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg font-medium text-sm mb-4
                    border-2 border-[var(--btn-op-bg)]
                    focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-30
                    transition-all duration-200"
                  style={{
                    background: "var(--dropdown-bg, var(--dropdown-bg-fallback))",
                    color: "var(--foreground)",
                  }}
                >
                  {TIMEZONES.map((t) => (
                    <option
                      key={t.value}
                      value={t.value}
                      style={{ background: "var(--background)", color: "var(--foreground)" }}
                    >
                      {t.label}
                    </option>
                  ))}
                </select>

                {/* Time Display */}
                <div
                  className="text-4xl font-bold font-mono mb-2"
                  style={{ color, textShadow: `0 0 15px ${color}30` }}
                >
                  {formatTime(now, tz)}
                </div>

                {/* Date Display */}
                <div className="text-xs" style={{ color: "var(--muted)" }}>
                  {formatDate(now, tz)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {zones.length === 0 && (
        <div
          className="text-center py-12 rounded-xl border-2 border-dashed"
          style={{
            borderColor: "var(--btn-op-bg)",
            color: "var(--muted)",
          }}
        >
          <div className="text-5xl mb-3">🌐</div>
          <p className="text-sm">No timezones added yet. Click "Add Timezone" to start tracking!</p>
        </div>
      )}
    </div>
  );
}
