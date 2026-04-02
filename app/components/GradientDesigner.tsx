"use client";

import React, { useState, useMemo } from "react";

interface GradientStop {
  color: string;
  position: number;
}

interface GradientStyle {
  type: "linear" | "radial" | "conic";
  angle: number;
  stops: GradientStop[];
  shape: "circle" | "ellipse";
  position: string;
  repeating: boolean;
}

const DEFAULT_GRADIENTS = [
  {
    name: "Blue Purple",
    stops: [
      { color: "#667eea", position: 0 },
      { color: "#764ba2", position: 100 },
    ],
  },
  {
    name: "Ocean",
    stops: [
      { color: "#2E3192", position: 0 },
      { color: "#1BFFFF", position: 100 },
    ],
  },
  {
    name: "Sunset",
    stops: [
      { color: "#FF512F", position: 0 },
      { color: "#F09819", position: 100 },
    ],
  },
  {
    name: "Forest",
    stops: [
      { color: "#134E5E", position: 0 },
      { color: "#71B280", position: 100 },
    ],
  },
  {
    name: "Rainbow",
    stops: [
      { color: "#ff0000", position: 0 },
      { color: "#ffff00", position: 25 },
      { color: "#00ff00", position: 50 },
      { color: "#0000ff", position: 75 },
      { color: "#ff00ff", position: 100 },
    ],
  },
];

export default function GradientDesigner() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importCssText, setImportCssText] = useState("");
  const [copiedCss, setCopiedCss] = useState(false);
  const [draggedStopIndex, setDraggedStopIndex] = useState<number | null>(null);
  const [reorderMode, setReorderMode] = useState(false);

  const [gradientStyle, setGradientStyle] = useState<GradientStyle>({
    type: "linear",
    angle: 135,
    stops: [
      { color: "#667eea", position: 0 },
      { color: "#764ba2", position: 100 },
    ],
    shape: "circle",
    position: "center",
    repeating: false,
  });

  const [sectionsOpen, setSectionsOpen] = useState({
    type: true,
    stops: true,
    settings: true,
  });

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateStyle = (updates: Partial<GradientStyle>) => {
    setGradientStyle((prev) => ({ ...prev, ...updates }));
  };

  const addGradientStop = () => {
    const newStop: GradientStop = { color: "#ffffff", position: 50 };
    updateStyle({
      stops: [...gradientStyle.stops, newStop].sort(
        (a, b) => a.position - b.position
      ),
    });
  };

  const removeGradientStop = (index: number) => {
    if (gradientStyle.stops.length > 2) {
      const newStops = gradientStyle.stops.filter((_, i) => i !== index);
      updateStyle({ stops: newStops });
    }
  };

  const updateGradientStop = (
    index: number,
    updates: Partial<GradientStop>
  ) => {
    const newStops = [...gradientStyle.stops];
    
    // If updating position, handle cascading updates
    if (updates.position !== undefined) {
      const oldPosition = newStops[index].position;
      let newPosition = updates.position;
      
      // Constrain to 0-100 range
      newPosition = Math.max(0, Math.min(100, newPosition));
      const delta = newPosition - oldPosition;
      
      // Update the target stop
      newStops[index] = { ...newStops[index], position: newPosition };
      
      // If moving right (increasing position), push stops above
      if (delta > 0) {
        for (let i = index + 1; i < newStops.length; i++) {
          // If the previous stop is touching or past this stop, push it forward
          if (newStops[i - 1].position >= newStops[i].position) {
            const pushTo = newStops[i - 1].position;
            const maxPos = 100; // Can go up to 100
            newStops[i] = { ...newStops[i], position: Math.min(pushTo, maxPos) };
          } else {
            break; // No more cascading needed
          }
        }
      } 
      // If moving left (decreasing position), push stops below
      else if (delta < 0) {
        for (let i = index - 1; i >= 0; i--) {
          // If the next stop is touching or before this stop, push it backward
          if (newStops[i + 1].position <= newStops[i].position) {
            const pushTo = newStops[i + 1].position;
            const minPos = 0; // Can go down to 0
            newStops[i] = { ...newStops[i], position: Math.max(pushTo, minPos) };
          } else {
            break; // No more cascading needed
          }
        }
      }
    }
    
    // Apply color updates
    if (updates.color !== undefined) {
      newStops[index] = { ...newStops[index], color: updates.color };
    }
    
    updateStyle({ stops: newStops });
  };

  const applyPreset = (preset: typeof DEFAULT_GRADIENTS[0]) => {
    updateStyle({ stops: [...preset.stops] });
  };

  const generateGradientCSS = () => {
    const stopsString = gradientStyle.stops
      .map((stop) => `${stop.color} ${stop.position}%`)
      .join(", ");

    const prefix = gradientStyle.repeating ? "repeating-" : "";

    switch (gradientStyle.type) {
      case "linear":
        return `${prefix}linear-gradient(${gradientStyle.angle}deg, ${stopsString})`;
      case "radial":
        return `${prefix}radial-gradient(${gradientStyle.shape} at ${gradientStyle.position}, ${stopsString})`;
      case "conic":
        return `${prefix}conic-gradient(from ${gradientStyle.angle}deg at ${gradientStyle.position}, ${stopsString})`;
      default:
        return "";
    }
  };

  const gradientCSS = useMemo(() => generateGradientCSS(), [gradientStyle]);

  const cssCode = useMemo(() => {
    const gradient = generateGradientCSS();
    return `.gradient-element {
  background: ${gradient};
  
  /* Alternative: Apply to background-image */
  /* background-image: ${gradient}; */
}`;
  }, [gradientCSS]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCss(true);
      setTimeout(() => setCopiedCss(false), 2000);
    } catch (err) {
      alert("Failed to copy to clipboard");
    }
  };

  const parseAndImportGradient = () => {
    try {
      const css = importCssText.trim();
      
      // Try to extract gradient from various CSS formats
      // Match linear-gradient, radial-gradient, conic-gradient, and repeating variants
      const gradientMatch = css.match(/(repeating-)?(linear|radial|conic)-gradient\s*\(([\s\S]+?)\)(?=\s*;|\s*$|$)/i);
      
      if (!gradientMatch) {
        alert("No valid gradient found. Please paste a gradient CSS property.");
        return;
      }

      const isRepeating = !!gradientMatch[1];
      const type = gradientMatch[2].toLowerCase() as "linear" | "radial" | "conic";
      const gradientContent = gradientMatch[3];

      const updates: Partial<GradientStyle> = {
        type,
        repeating: isRepeating,
      };

      // Parse based on gradient type
      if (type === "linear") {
        // Map directional keywords to degrees
        const directionMap: Record<string, number> = {
          "to top": 0,
          "to right": 90,
          "to bottom": 180,
          "to left": 270,
          "to top right": 45,
          "to right top": 45,
          "to bottom right": 135,
          "to right bottom": 135,
          "to bottom left": 225,
          "to left bottom": 225,
          "to top left": 315,
          "to left top": 315,
        };

        // Check for directional keywords first
        const directionMatch = gradientContent.match(/^(to\s+(?:top|bottom|left|right)(?:\s+(?:left|right|top|bottom))?)/i);
        if (directionMatch) {
          const direction = directionMatch[1].toLowerCase();
          updates.angle = directionMap[direction] ?? 180; // default to 180 (to bottom)
        } else {
          // Extract numeric angle
          const angleMatch = gradientContent.match(/^(\d+)deg/);
          if (angleMatch) {
            updates.angle = parseInt(angleMatch[1]);
          }
        }
      } else if (type === "conic") {
        // Extract starting angle for conic gradients
        const angleMatch = gradientContent.match(/from\s+(\d+)deg/i);
        if (angleMatch) {
          updates.angle = parseInt(angleMatch[1]);
        }
      }

      // Extract position for radial and conic gradients
      if (type === "radial" || type === "conic") {
        const posMatch = gradientContent.match(/at\s+([\w\s]+?)(?=,|\s+#|\s+rgb|\s+hsl)/i);
        if (posMatch) {
          updates.position = posMatch[1].trim();
        }
      }

      // Extract shape for radial gradients
      if (type === "radial") {
        const shapeMatch = gradientContent.match(/^(circle|ellipse)/i);
        if (shapeMatch) {
          updates.shape = shapeMatch[1].toLowerCase() as "circle" | "ellipse";
        }
      }

      // Parse color stops - try with percentages first
      const colorStopWithPercentRegex = /(#[0-9a-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-z]+)\s+(\d+(?:\.\d+)?)%/gi;
      const colorMatchesWithPercent = [...gradientContent.matchAll(colorStopWithPercentRegex)];
      
      if (colorMatchesWithPercent.length >= 2) {
        updates.stops = colorMatchesWithPercent.map(match => ({
          color: match[1],
          position: Math.round(parseFloat(match[2]))
        }));
      } else {
        // Try parsing color stops without explicit percentages
        // Colors are distributed evenly when percentages are omitted
        const colorOnlyRegex = /#[0-9a-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)/gi;
        const colorMatches = [...gradientContent.matchAll(colorOnlyRegex)];
        
        if (colorMatches.length >= 2) {
          // Distribute colors evenly across 0-100%
          updates.stops = colorMatches.map((match, index) => ({
            color: match[0],
            position: Math.round((index / (colorMatches.length - 1)) * 100)
          }));
        }
      }

      updateStyle(updates);
      setImportModalOpen(false);
      setImportCssText("");
    } catch (err) {
      alert("Failed to parse gradient. Please check the format and try again.");
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedStopIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedStopIndex !== null && draggedStopIndex !== dropIndex) {
      const newStops = [...gradientStyle.stops];
      const [removed] = newStops.splice(draggedStopIndex, 1);
      newStops.splice(dropIndex, 0, removed);
      updateStyle({ stops: newStops });
    }
    setDraggedStopIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedStopIndex(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4 flex items-center justify-between border-b border-white/10 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold">Gradient Designer</h1>
          <p className="text-sm opacity-70 mt-2">
            Create beautiful CSS gradients with live preview
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="px-4 py-2 border rounded flex items-center gap-2 hover:bg-white/5 transition-colors"
          >
            &#9776; Settings
          </button>
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-4 py-2 border border-blue-500 text-blue-400 rounded hover:bg-blue-600/10 transition-colors"
          >
            Import CSS
          </button>
          <button
            onClick={() => setExportModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Export CSS
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview Area */}
        <div
          className={`flex-1 p-6 flex items-center justify-center transition-all duration-300 ${
            drawerOpen ? "lg:pr-[400px]" : ""
          }`}
        >
          <div className="w-full h-[500px] max-w-4xl rounded-lg border-4 border-white/20 shadow-2xl overflow-hidden">
            <div
              className="w-full h-full"
              style={{
                background: gradientCSS,
              }}
            />
          </div>
        </div>
      </div>

      {/* Settings Drawer */}
      {drawerOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer */}
          <div
            className="fixed z-50 bg-[var(--background)] overflow-auto bottom-0 left-0 right-0 max-h-[70vh] rounded-t-2xl border-t border-white/10 lg:top-0 lg:right-0 lg:bottom-0 lg:left-auto lg:w-96 lg:max-h-none lg:rounded-none lg:border-t-0 lg:border-l"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag handle */}
            <div className="lg:hidden flex justify-center py-3 border-b border-white/10">
              <div className="w-12 h-1 bg-white/30 rounded-full" />
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Gradient Settings</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="px-3 py-1 border rounded hover:bg-white/5"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-3">
                {/* Gradient Type Section */}
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection("type")}
                    className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-semibold">Gradient Type</span>
                    <span className="text-xl">
                      {sectionsOpen.type ? "−" : "+"}
                    </span>
                  </button>
                  {sectionsOpen.type && (
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        {(["linear", "radial", "conic"] as const).map(
                          (type) => (
                            <button
                              key={type}
                              onClick={() => updateStyle({ type })}
                              className={`px-4 py-3 rounded border-2 transition-all capitalize ${
                                gradientStyle.type === type
                                  ? "border-blue-500 bg-blue-500/20"
                                  : "border-white/20 hover:border-white/40"
                              }`}
                            >
                              {type}
                            </button>
                          )
                        )}
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={gradientStyle.repeating}
                            onChange={(e) =>
                              updateStyle({ repeating: e.target.checked })
                            }
                            className="w-4 h-4"
                          />
                          Repeating Gradient
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gradient Settings Section */}
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection("settings")}
                    className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-semibold">Settings</span>
                    <span className="text-xl">
                      {sectionsOpen.settings ? "−" : "+"}
                    </span>
                  </button>
                  {sectionsOpen.settings && (
                    <div className="p-4 space-y-4">
                      {(gradientStyle.type === "linear" ||
                        gradientStyle.type === "conic") && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {gradientStyle.type === "linear"
                              ? "Angle"
                              : "Starting Angle"}
                            : {gradientStyle.angle}°
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            step="1"
                            value={gradientStyle.angle}
                            onChange={(e) =>
                              updateStyle({ angle: parseInt(e.target.value) })
                            }
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-white/50 mt-1">
                            <span>0°</span>
                            <span>90°</span>
                            <span>180°</span>
                            <span>270°</span>
                            <span>360°</span>
                          </div>
                        </div>
                      )}

                      {gradientStyle.type === "radial" && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Shape
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {(["circle", "ellipse"] as const).map((shape) => (
                                <button
                                  key={shape}
                                  onClick={() => updateStyle({ shape })}
                                  className={`px-4 py-2 rounded border-2 transition-all capitalize ${
                                    gradientStyle.shape === shape
                                      ? "border-blue-500 bg-blue-500/20"
                                      : "border-white/20 hover:border-white/40"
                                  }`}
                                >
                                  {shape}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {(gradientStyle.type === "radial" ||
                        gradientStyle.type === "conic") && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Position
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              "top left",
                              "top",
                              "top right",
                              "left",
                              "center",
                              "right",
                              "bottom left",
                              "bottom",
                              "bottom right",
                            ].map((pos) => (
                              <button
                                key={pos}
                                onClick={() => updateStyle({ position: pos })}
                                className={`px-2 py-2 text-xs rounded border transition-all ${
                                  gradientStyle.position === pos
                                    ? "border-blue-500 bg-blue-500/20"
                                    : "border-white/20 hover:border-white/40"
                                }`}
                              >
                                {pos}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Color Stops Section */}
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection("stops")}
                    className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-semibold">Color Stops</span>
                    <span className="text-xl">
                      {sectionsOpen.stops ? "−" : "+"}
                    </span>
                  </button>
                  {sectionsOpen.stops && (
                    <div className="p-4 space-y-4">
                      {/* Preset Gradients */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Presets
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {DEFAULT_GRADIENTS.map((preset) => (
                            <button
                              key={preset.name}
                              onClick={() => applyPreset(preset)}
                              className="h-12 rounded border-2 border-white/20 hover:border-white/40 transition-all overflow-hidden relative group"
                              style={{
                                background: `linear-gradient(135deg, ${preset.stops
                                  .map(
                                    (s) => `${s.color} ${s.position}%`
                                  )
                                  .join(", ")})`,
                              }}
                            >
                              <span className="absolute inset-0 bg-black/50 flex items-center justify-center text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                {preset.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Gradient Stops */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">Stops</label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setReorderMode(!reorderMode)}
                              className={`px-3 py-1 text-xs rounded transition-colors ${
                                reorderMode
                                  ? "bg-green-600 text-white hover:bg-green-700"
                                  : "border border-white/20 hover:bg-white/5"
                              }`}
                            >
                              {reorderMode ? "✓ Stop Reordering" : "Reorder"}
                            </button>
                            <button
                              onClick={addGradientStop}
                              disabled={reorderMode}
                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              + Add Stop
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {gradientStyle.stops.map((stop, index) => (
                            <div
                              key={index}
                              draggable={reorderMode}
                              onDragStart={reorderMode ? () => handleDragStart(index) : undefined}
                              onDragOver={reorderMode ? (e) => handleDragOver(e, index) : undefined}
                              onDrop={reorderMode ? (e) => handleDrop(e, index) : undefined}
                              onDragEnd={reorderMode ? handleDragEnd : undefined}
                              className={`p-3 bg-white/5 rounded border border-white/10 hover:border-white/30 transition-colors ${
                                reorderMode ? "cursor-grab active:cursor-grabbing" : ""
                              } ${
                                draggedStopIndex === index ? "opacity-50" : ""
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {reorderMode && (
                                  <div
                                    className="text-white/50 text-lg"
                                    title="Drag to reorder"
                                  >
                                    ⋮⋮
                                  </div>
                                )}
                                <div className="flex-1 text-xs font-medium">
                                  Stop {index + 1}
                                </div>
                                {gradientStyle.stops.length > 2 && (
                                  <button
                                    onClick={() => removeGradientStop(index)}
                                    disabled={reorderMode}
                                    className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>

                              <div className={`flex items-center gap-2 ${
                                reorderMode ? "pointer-events-none opacity-50" : ""
                              }`}>
                                <input
                                  type="color"
                                  value={stop.color}
                                  onChange={(e) =>
                                    updateGradientStop(index, {
                                      color: e.target.value,
                                    })
                                  }
                                  className="w-12 h-8 rounded cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={stop.color}
                                  onChange={(e) =>
                                    updateGradientStop(index, {
                                      color: e.target.value,
                                    })
                                  }
                                  className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded focus:outline-none focus:border-blue-500"
                                />
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={stop.position}
                                  onChange={(e) =>
                                    updateGradientStop(index, {
                                      position: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-16 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded focus:outline-none focus:border-blue-500"
                                />
                                <span className="text-xs">%</span>
                              </div>

                              {/* Color position slider */}
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={stop.position}
                                onChange={(e) =>
                                  updateGradientStop(index, {
                                    position: parseInt(e.target.value),
                                  })
                                }
                                className="w-full mt-2"
                                style={{
                                  background: `linear-gradient(to right, transparent ${stop.position}%, ${stop.color} ${stop.position}%)`,
                                }}
                                disabled={reorderMode}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Import CSS Modal */}
      {importModalOpen && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-6"
          onClick={() => setImportModalOpen(false)}
        >
          <div
            className="bg-[var(--background)] border border-white/15 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Import CSS</h2>
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-3 py-1 border rounded hover:bg-white/5"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Paste your gradient CSS below:
                </label>
                <textarea
                  value={importCssText}
                  onChange={(e) => setImportCssText(e.target.value)}
                  placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)\n\nOr:\n\nbackground: radial-gradient(circle at center, #ff0000 0%, #0000ff 100%);\n\nSupports linear, radial, conic, and repeating variants."
                  className="w-full h-64 bg-black/30 p-4 rounded border border-white/10 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 text-sm">
                <p className="text-blue-300 mb-1">💡 Tip: Paste any CSS gradient property</p>
                <p className="text-gray-400 text-xs">
                  Supports linear-gradient, radial-gradient, conic-gradient, and their repeating variants. The parser will extract type, angle/position, and color stops.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setImportModalOpen(false);
                    setImportCssText("");
                  }}
                  className="px-4 py-2 border rounded hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={parseAndImportGradient}
                  disabled={!importCssText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import & Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {exportModalOpen && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-6"
          onClick={() => setExportModalOpen(false)}
        >
          <div
            className="bg-[var(--background)] border border-white/15 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Export CSS</h2>
              <button
                onClick={() => setExportModalOpen(false)}
                className="px-3 py-1 border rounded hover:bg-white/5"
              >
                &times;
              </button>
            </div>

            <div className="space-y-6">
              {/* Description */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4">
                <h3 className="font-semibold mb-2 text-blue-400">
                  How to use this gradient:
                </h3>
                <ul className="text-sm space-y-1 opacity-90">
                  <li>
                    • Add the <code className="bg-white/10 px-1 rounded">background</code> property to any element
                  </li>
                  <li>
                    • Use <code className="bg-white/10 px-1 rounded">background-image</code> if you want to layer it with other backgrounds
                  </li>
                  <li>
                    • Works on divs, sections, buttons, and any HTML element
                  </li>
                </ul>
              </div>

              {/* CSS Code */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold">CSS Code</label>
                  <button
                    onClick={() => copyToClipboard(cssCode)}
                    className="px-3 py-1 text-sm border rounded hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    {copiedCss ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="bg-black/30 p-4 rounded border border-white/10 overflow-x-auto text-sm">
                  <code>{cssCode}</code>
                </pre>
              </div>

              {/* Gradient String Only */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold">
                    Gradient Value Only
                  </label>
                  <button
                    onClick={() => copyToClipboard(gradientCSS)}
                    className="px-3 py-1 text-sm border rounded hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    Copy Value
                  </button>
                </div>
                <pre className="bg-black/30 p-4 rounded border border-white/10 overflow-x-auto text-sm">
                  <code>{gradientCSS}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
