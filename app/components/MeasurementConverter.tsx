"use client";

import React, { useState, useEffect } from "react";

type MeasurementCategory = "distance" | "volume" | "weight";

interface ConversionUnit {
  name: string;
  toBase: number; // conversion factor to base unit
}

const DISTANCE_UNITS: Record<string, ConversionUnit> = {
  millimeters: { name: "Millimeters", toBase: 0.001 },
  centimeters: { name: "Centimeters", toBase: 0.01 },
  meters: { name: "Meters", toBase: 1 },
  kilometers: { name: "Kilometers", toBase: 1000 },
  inches: { name: "Inches", toBase: 0.0254 },
  feet: { name: "Feet", toBase: 0.3048 },
  yards: { name: "Yards", toBase: 0.9144 },
  miles: { name: "Miles", toBase: 1609.34 },
};

const VOLUME_UNITS: Record<string, ConversionUnit> = {
  milliliters: { name: "Milliliters", toBase: 0.001 },
  liters: { name: "Liters", toBase: 1 },
  gallons: { name: "Gallons (US)", toBase: 3.78541 },
  quarts: { name: "Quarts (US)", toBase: 0.946353 },
  pints: { name: "Pints (US)", toBase: 0.473176 },
  cups: { name: "Cups (US)", toBase: 0.236588 },
  fluidOunces: { name: "Fluid Ounces (US)", toBase: 0.0295735 },
  tablespoons: { name: "Tablespoons", toBase: 0.0147868 },
  teaspoons: { name: "Teaspoons", toBase: 0.00492892 },
};

const WEIGHT_UNITS: Record<string, ConversionUnit> = {
  milligrams: { name: "Milligrams", toBase: 0.001 },
  grams: { name: "Grams", toBase: 1 },
  kilograms: { name: "Kilograms", toBase: 1000 },
  ounces: { name: "Ounces", toBase: 28.3495 },
  pounds: { name: "Pounds", toBase: 453.592 },
  tons: { name: "Tons (US)", toBase: 907185 },
  metricTons: { name: "Metric Tons", toBase: 1000000 },
};

export default function MeasurementConverter() {
  const [category, setCategory] = useState<MeasurementCategory>("distance");
  const [fromUnit, setFromUnit] = useState<string>("meters");
  const [toUnit, setToUnit] = useState<string>("feet");
  const [fromValue, setFromValue] = useState<string>("");
  const [toValue, setToValue] = useState<string>("");

  const getCurrentUnits = () => {
    switch (category) {
      case "distance":
        return DISTANCE_UNITS;
      case "volume":
        return VOLUME_UNITS;
      case "weight":
        return WEIGHT_UNITS;
    }
  };

  // Reset units when category changes
  useEffect(() => {
    const units = getCurrentUnits();
    const unitKeys = Object.keys(units);
    setFromUnit(unitKeys[0]);
    setToUnit(unitKeys[1]);
    setFromValue("");
    setToValue("");
  }, [category]);

  const convert = (value: string, from: string, to: string): string => {
    if (!value || value === "" || isNaN(Number(value))) return "";
    
    const units = getCurrentUnits();
    // Safety check: ensure the units exist in the current category
    if (!units[from] || !units[to]) return "";
    
    const fromFactor = units[from].toBase;
    const toFactor = units[to].toBase;
    
    const baseValue = Number(value) * fromFactor;
    const result = baseValue / toFactor;
    
    // Format result to reasonable precision
    return result.toFixed(6).replace(/\.?0+$/, "");
  };

  const handleCategoryChange = (newCategory: MeasurementCategory) => {
    // Clear values immediately to prevent conversion errors
    setFromValue("");
    setToValue("");
    setCategory(newCategory);
  };

  const handleFromChange = (value: string) => {
    setFromValue(value);
    setToValue(convert(value, fromUnit, toUnit));
  };

  const handleToChange = (value: string) => {
    setToValue(value);
    setFromValue(convert(value, toUnit, fromUnit));
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromValue(toValue);
    setToValue(fromValue);
  };

  const units = getCurrentUnits();
  const unitKeys = Object.keys(units);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold" style={{ color: "var(--accent)" }}>
          Measurement Converter
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          Convert between different units of measurement
        </p>
      </div>

      {/* Category Selection Buttons */}
      <div className="flex flex-wrap gap-3">
        {(["distance", "volume", "weight"] as MeasurementCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`
              px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide
              transition-all duration-300 ease-out
              border-2
              ${
                category === cat
                  ? "border-[var(--accent)] bg-[var(--btn-eq-bg)] text-white shadow-lg shadow-[var(--accent)]/30 scale-105"
                  : "border-[var(--btn-bg)] bg-[var(--btn-bg)] text-[var(--btn-text)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:shadow-md hover:shadow-[var(--accent)]/20 hover:scale-105"
              }
            `}
            style={{
              transform: category === cat ? "translateY(-2px)" : undefined,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Conversion Interface */}
      <div className="mt-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* From Box */}
          <div className="w-full lg:w-5/12 space-y-3">
            <label className="block text-sm font-medium" style={{ color: "var(--muted)" }}>
              From
            </label>
            <select
              value={fromUnit}
              onChange={(e) => {
                setFromUnit(e.target.value);
                setToValue(convert(fromValue, e.target.value, toUnit));
              }}
              className="w-full px-4 py-3 rounded-lg font-medium text-base
                border-2 border-[var(--btn-op-bg)]
                focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-30
                transition-all duration-200"
              style={{
                background: "var(--dropdown-bg, var(--dropdown-bg-fallback))",
                color: "var(--foreground)",
              }}
            >
              {unitKeys.map((key) => (
                <option key={key} value={key} style={{ background: "var(--background)", color: "var(--foreground)" }}>
                  {units[key].name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={fromValue}
              onChange={(e) => handleFromChange(e.target.value)}
              placeholder="Enter value"
              className="w-full px-4 py-4 rounded-lg text-2xl font-bold
                border-2 border-[var(--btn-op-bg)]
                focus:border-[var(--neon-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--neon-blue)] focus:ring-opacity-30
                transition-all duration-200
                placeholder-opacity-40"
              style={{
                background: "rgba(255,255,255,0.03)",
                color: "var(--accent)",
              }}
            />
          </div>

          {/* Swap Button */}
          <div className="flex lg:w-2/12 justify-center items-center">
            <button
              onClick={handleSwap}
              className="p-4 rounded-full
                bg-[var(--btn-op-bg)] border-2 border-[var(--accent)]
                hover:bg-[var(--accent)] hover:bg-opacity-20 hover:scale-110 hover:rotate-180
                transition-all duration-300 ease-out
                shadow-lg hover:shadow-[var(--accent)]/50"
              style={{ color: "var(--accent)" }}
              title="Swap units"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </button>
          </div>

          {/* To Box */}
          <div className="w-full lg:w-5/12 space-y-3">
            <label className="block text-sm font-medium" style={{ color: "var(--muted)" }}>
              To
            </label>
            <select
              value={toUnit}
              onChange={(e) => {
                setToUnit(e.target.value);
                setToValue(convert(fromValue, fromUnit, e.target.value));
              }}
              className="w-full px-4 py-3 rounded-lg font-medium text-base
                border-2 border-[var(--btn-op-bg)]
                focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-30
                transition-all duration-200"
              style={{
                background: "var(--dropdown-bg, var(--dropdown-bg-fallback))",
                color: "var(--foreground)",
              }}
            >
              {unitKeys.map((key) => (
                <option key={key} value={key} style={{ background: "var(--background)", color: "var(--foreground)" }}>
                  {units[key].name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={toValue}
              onChange={(e) => handleToChange(e.target.value)}
              placeholder="Result"
              className="w-full px-4 py-4 rounded-lg text-2xl font-bold
                border-2 border-[var(--btn-op-bg)]
                focus:border-[var(--neon-green)] focus:outline-none focus:ring-2 focus:ring-[var(--neon-green)] focus:ring-opacity-30
                transition-all duration-200
                placeholder-opacity-40"
              style={{
                background: "rgba(255,255,255,0.03)",
                color: "var(--neon-green)",
              }}
            />
          </div>
        </div>

        {/* Quick Reference Info */}
        {fromValue && toValue && (
          <div
            className="mt-6 p-4 rounded-lg border-2 border-[var(--btn-op-bg)]"
            style={{
              background: "rgba(123, 232, 255, 0.05)",
              color: "var(--foreground)",
            }}
          >
            <p className="text-center text-sm">
              <span className="font-bold" style={{ color: "var(--accent)" }}>
                {fromValue} {units[fromUnit].name}
              </span>
              {" = "}
              <span className="font-bold" style={{ color: "var(--neon-green)" }}>
                {toValue} {units[toUnit].name}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
