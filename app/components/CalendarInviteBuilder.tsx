"use client";

import React, { useMemo, useState } from "react";

type ExportMode = "both" | "google" | "outlook";
type ButtonVariant = "solid" | "outline";

interface CalendarInviteForm {
  title: string;
  description: string;
  location: string;
  startDate: string;
  startTime: string;
  durationMinutes: number;
  buttonLabel: string;
}

const GOOGLE_BUTTON_COLOR = "#1a73e8";
const OUTLOOK_BUTTON_COLOR = "#0f6cbd";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toTimeInputValue(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function createDefaultStart() {
  const start = new Date();
  start.setHours(start.getHours() + 1, 0, 0, 0);
  return start;
}

function combineLocalDateTime(dateValue: string, timeValue: string) {
  if (!dateValue || !timeValue) {
    return null;
  }

  const combined = new Date(`${dateValue}T${timeValue}:00`);
  return Number.isNaN(combined.getTime()) ? null : combined;
}

function toGoogleDateToken(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function buildSearchText(title: string, description: string, location: string) {
  const bodyParts = [description.trim(), location.trim() ? `Location: ${location.trim()}` : ""]
    .filter(Boolean)
    .join("\n\n");

  return {
    subject: title.trim(),
    body: bodyParts,
    location: location.trim(),
  };
}

function buildGoogleUrl(title: string, description: string, location: string, timezone: string, startUtc: Date, endUtc: Date) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details: description,
    location,
    ctz: timezone,
    dates: `${toGoogleDateToken(startUtc)}/${toGoogleDateToken(endUtc)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildOutlookUrl(title: string, description: string, location: string, startUtc: Date, endUtc: Date) {
  const params = new URLSearchParams({
    subject: title,
    body: description,
    location,
    startdt: startUtc.toISOString(),
    enddt: endUtc.toISOString(),
  });

  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

function buildButtonHtml(options: {
  href: string;
  label: string;
  color: string;
  variant: ButtonVariant;
}) {
  const sharedStyles = [
    "display:inline-block",
    "padding:12px 18px",
    "border-radius:9999px",
    "font:600 14px/1.2 Arial, sans-serif",
    "text-decoration:none",
    "transition:transform 0.2s ease",
  ];

  if (options.variant === "outline") {
    sharedStyles.push(`color:${options.color}`);
    sharedStyles.push(`border:1px solid ${options.color}`);
    sharedStyles.push("background:transparent");
  } else {
    sharedStyles.push(`background:${options.color}`);
    sharedStyles.push("color:#ffffff");
    sharedStyles.push(`border:1px solid ${options.color}`);
  }

  return `<a href="${options.href}" target="_blank" rel="noopener noreferrer" style="${sharedStyles.join("; ")}">${options.label}</a>`;
}

function getInitialForm(): CalendarInviteForm {
  const start = createDefaultStart();

  return {
    title: "Team sync",
    description: "Add any agenda notes, meeting context, or links here.",
    location: "",
    startDate: toDateInputValue(start),
    startTime: toTimeInputValue(start),
    durationMinutes: 60,
    buttonLabel: "Add to calendar",
  };
}

export default function CalendarInviteBuilder() {
  const [form, setForm] = useState<CalendarInviteForm>(() => getInitialForm());
  const [exportMode, setExportMode] = useState<ExportMode>("both");
  const [buttonVariant, setButtonVariant] = useState<ButtonVariant>("solid");
  const [copiedType, setCopiedType] = useState<"google" | "outlook" | "html" | null>(null);

  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "Local timezone", []);

  const startLocal = useMemo(() => combineLocalDateTime(form.startDate, form.startTime), [form.startDate, form.startTime]);
  const endLocal = useMemo(() => {
    if (!startLocal || !Number.isFinite(form.durationMinutes) || form.durationMinutes <= 0) {
      return null;
    }

    return new Date(startLocal.getTime() + form.durationMinutes * 60000);
  }, [form.durationMinutes, startLocal]);

  const calendarPayload = useMemo(() => buildSearchText(form.title, form.description, form.location), [form.description, form.location, form.title]);

  const urls = useMemo(() => {
    if (!startLocal || !endLocal) {
      return { googleUrl: "", outlookUrl: "" };
    }

    return {
      googleUrl: buildGoogleUrl(calendarPayload.subject, calendarPayload.body, calendarPayload.location, timezone, startLocal, endLocal),
      outlookUrl: buildOutlookUrl(calendarPayload.subject, calendarPayload.body, calendarPayload.location, startLocal, endLocal),
    };
  }, [calendarPayload.body, calendarPayload.location, calendarPayload.subject, endLocal, startLocal, timezone]);

  const htmlSnippet = useMemo(() => {
    if (!urls.googleUrl || !urls.outlookUrl) {
      return "";
    }

    const googleButton = buildButtonHtml({
      href: urls.googleUrl,
      label: form.buttonLabel || "Add to Google Calendar",
      color: GOOGLE_BUTTON_COLOR,
      variant: buttonVariant,
    });

    const outlookButton = buildButtonHtml({
      href: urls.outlookUrl,
      label: form.buttonLabel || "Add to Outlook Calendar",
      color: OUTLOOK_BUTTON_COLOR,
      variant: buttonVariant,
    });

    if (exportMode === "google") {
      return googleButton;
    }

    if (exportMode === "outlook") {
      return outlookButton;
    }

    return `<div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">\n  ${googleButton}\n  ${outlookButton}\n</div>`;
  }, [buttonVariant, exportMode, form.buttonLabel, urls.googleUrl, urls.outlookUrl]);

  const canExport = Boolean(startLocal && endLocal && urls.googleUrl && urls.outlookUrl);

  const updateForm = (updates: Partial<CalendarInviteForm>) => {
    setForm((current) => ({ ...current, ...updates }));
  };

  const copyText = async (text: string, type: "google" | "outlook" | "html") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      window.setTimeout(() => setCopiedType(null), 1800);
    } catch {
      window.alert("Failed to copy to clipboard");
    }
  };

  const startPreview = startLocal
    ? startLocal.toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Select a valid start time";

  const endPreview = endLocal
    ? endLocal.toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Select a valid duration";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_28%),linear-gradient(180deg,_rgba(12,18,34,0.95),_rgba(8,11,22,0.98))] p-6 shadow-2xl">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -left-24 top-8 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative mb-6 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
            Web Development
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Calendar Invite Builder</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
            Build Google and Outlook calendar links from your own local time, then export the event as a clean HTML button for your site or template.
          </p>
        </div>

        <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 md:min-w-[280px]">
          <div className="flex items-center justify-between gap-4">
            <span className="text-white/55">Detected timezone</span>
            <span className="font-medium text-white">{timezone}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-white/55">Start preview</span>
            <span className="font-medium text-white">{startPreview}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-white/55">End preview</span>
            <span className="font-medium text-white">{endPreview}</span>
          </div>
        </div>
      </div>

      <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-4 rounded-2xl border border-white/10 bg-[rgba(10,15,28,0.78)] p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Event details</h2>
              <p className="text-sm text-white/60">Enter the event in your own timezone. The generated links are converted to UTC.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-white/75">Event title</span>
              <input
                value={form.title}
                onChange={(event) => updateForm({ title: event.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/50 focus:bg-white/10"
                placeholder="Product launch sync"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-white/75">Description</span>
              <textarea
                value={form.description}
                onChange={(event) => updateForm({ description: event.target.value })}
                className="min-h-28 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/50 focus:bg-white/10"
                placeholder="Agenda, links, or notes for the invite"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-white/75">Location</span>
              <input
                value={form.location}
                onChange={(event) => updateForm({ location: event.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/50 focus:bg-white/10"
                placeholder="Zoom, office address, or meeting room"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-white/75">Start date</span>
              <input
                type="date"
                value={form.startDate}
                onChange={(event) => updateForm({ startDate: event.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-300/50 focus:bg-white/10"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-white/75">Start time</span>
              <input
                type="time"
                value={form.startTime}
                onChange={(event) => updateForm({ startTime: event.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-300/50 focus:bg-white/10"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-white/75">Duration</span>
              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <input
                  type="range"
                  min="15"
                  max="480"
                  step="15"
                  value={form.durationMinutes}
                  onChange={(event) => updateForm({ durationMinutes: Number(event.target.value) })}
                  className="flex-1 accent-cyan-400"
                />
                <div className="min-w-20 text-right text-sm font-semibold text-white">
                  {form.durationMinutes} min
                </div>
              </div>
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-white/75">HTML button label</span>
              <input
                value={form.buttonLabel}
                onChange={(event) => updateForm({ buttonLabel: event.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/50 focus:bg-white/10"
                placeholder="Add to calendar"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-50">
            Google and Outlook links are generated from UTC timestamps, so they stay correct when shared across timezones.
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/10 bg-[rgba(10,15,28,0.78)] p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Output</h2>
              <p className="text-sm text-white/60">Share the links directly or copy a ready-to-use HTML snippet.</p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
              {exportMode === "both" ? "Dual button" : `${exportMode} button`}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-white/75">HTML output mode</span>
              <select
                value={exportMode}
                onChange={(event) => setExportMode(event.target.value as ExportMode)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-300/50 focus:bg-white/10"
              >
                <option value="both">Google and Outlook buttons</option>
                <option value="google">Google button only</option>
                <option value="outlook">Outlook button only</option>
              </select>
            </label>

            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-white/75">Button style</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setButtonVariant("solid")}
                  className={`rounded-xl border px-4 py-3 text-left transition ${buttonVariant === "solid" ? "border-cyan-300/60 bg-cyan-400/15 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"}`}
                >
                  <div className="font-semibold">Solid</div>
                  <div className="text-xs opacity-70">Filled call to action</div>
                </button>
                <button
                  type="button"
                  onClick={() => setButtonVariant("outline")}
                  className={`rounded-xl border px-4 py-3 text-left transition ${buttonVariant === "outline" ? "border-cyan-300/60 bg-cyan-400/15 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"}`}
                >
                  <div className="font-semibold">Outline</div>
                  <div className="text-xs opacity-70">Minimal button styling</div>
                </button>
              </div>
            </label>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 text-sm font-medium text-white/75">Preview buttons</div>
            <div className="flex flex-wrap gap-3">
              <a
                href={canExport ? urls.googleUrl : undefined}
                target="_blank"
                rel="noreferrer"
                className={`rounded-full px-4 py-3 text-sm font-semibold transition ${buttonVariant === "solid" ? "text-white" : "border"}`}
                style={{
                  backgroundColor: buttonVariant === "solid" ? GOOGLE_BUTTON_COLOR : "transparent",
                  borderColor: GOOGLE_BUTTON_COLOR,
                  color: buttonVariant === "solid" ? "#ffffff" : GOOGLE_BUTTON_COLOR,
                  pointerEvents: canExport ? "auto" : "none",
                  opacity: canExport ? 1 : 0.5,
                }}
              >
                Add to Google Calendar
              </a>
              <a
                href={canExport ? urls.outlookUrl : undefined}
                target="_blank"
                rel="noreferrer"
                className={`rounded-full px-4 py-3 text-sm font-semibold transition ${buttonVariant === "solid" ? "text-white" : "border"}`}
                style={{
                  backgroundColor: buttonVariant === "solid" ? OUTLOOK_BUTTON_COLOR : "transparent",
                  borderColor: OUTLOOK_BUTTON_COLOR,
                  color: buttonVariant === "solid" ? "#ffffff" : OUTLOOK_BUTTON_COLOR,
                  pointerEvents: canExport ? "auto" : "none",
                  opacity: canExport ? 1 : 0.5,
                }}
              >
                Add to Outlook Calendar
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-[#07101f] p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-white/75">Google Calendar URL</div>
                <button
                  type="button"
                  onClick={() => copyText(urls.googleUrl, "google")}
                  disabled={!canExport}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {copiedType === "google" ? "Copied" : "Copy"}
                </button>
              </div>
              <textarea
                readOnly
                value={urls.googleUrl}
                className="min-h-24 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/90 outline-none"
                placeholder="Select a start date and duration to generate the URL"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#07101f] p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-white/75">Outlook URL</div>
                <button
                  type="button"
                  onClick={() => copyText(urls.outlookUrl, "outlook")}
                  disabled={!canExport}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {copiedType === "outlook" ? "Copied" : "Copy"}
                </button>
              </div>
              <textarea
                readOnly
                value={urls.outlookUrl}
                className="min-h-24 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/90 outline-none"
                placeholder="Select a start date and duration to generate the URL"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#07101f] p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-white/75">HTML snippet</div>
                <button
                  type="button"
                  onClick={() => copyText(htmlSnippet, "html")}
                  disabled={!canExport}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {copiedType === "html" ? "Copied" : "Copy"}
                </button>
              </div>
              <textarea
                readOnly
                value={htmlSnippet}
                className="min-h-36 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 font-mono text-xs text-white/90 outline-none"
                placeholder="Choose an output mode to generate HTML"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
