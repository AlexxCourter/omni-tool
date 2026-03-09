"use client";

import React, { useState } from "react";

type LayoutMode = "grid" | "flex";

interface BoxItem {
  id: number;
  content: string;
  color: string;
}

interface FlexSettings {
  flexDirection: "row" | "row-reverse" | "column" | "column-reverse";
  justifyContent: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
  alignItems: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
  flexWrap: "nowrap" | "wrap" | "wrap-reverse";
  gap: number;
}

interface GridSettings {
  gridTemplateColumns: string;
  gridTemplateRows: string;
  justifyContent: "start" | "end" | "center" | "stretch" | "space-between" | "space-around" | "space-evenly";
  alignContent: "start" | "end" | "center" | "stretch" | "space-between" | "space-around" | "space-evenly";
  justifyItems: "start" | "end" | "center" | "stretch";
  alignItems: "start" | "end" | "center" | "stretch";
  gap: number;
  columnGap: number;
  rowGap: number;
}

const DEFAULT_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"
];

export default function GridFlexSandbox() {
  const [mode, setMode] = useState<LayoutMode>("flex");
  const [numItems, setNumItems] = useState(6);
  const [items, setItems] = useState<BoxItem[]>(
    Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      content: `${i + 1}`,
      color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    }))
  );

  const [flexSettings, setFlexSettings] = useState<FlexSettings>({
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "stretch",
    flexWrap: "wrap",
    gap: 16,
  });

  const [gridSettings, setGridSettings] = useState<GridSettings>({
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "auto",
    justifyContent: "start",
    alignContent: "start",
    justifyItems: "stretch",
    alignItems: "stretch",
    gap: 16,
    columnGap: 16,
    rowGap: 16,
  });

  const [showCode, setShowCode] = useState(false);
  const [copiedCss, setCopiedCss] = useState(false);

  const updateNumItems = (num: number) => {
    setNumItems(num);
    const newItems = Array.from({ length: num }, (_, i) => ({
      id: i + 1,
      content: `${i + 1}`,
      color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    }));
    setItems(newItems);
  };

  const updateFlexSetting = <K extends keyof FlexSettings>(
    key: K,
    value: FlexSettings[K]
  ) => {
    setFlexSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateGridSetting = <K extends keyof GridSettings>(
    key: K,
    value: GridSettings[K]
  ) => {
    setGridSettings((prev) => ({ ...prev, [key]: value }));
  };

  const containerStyle: React.CSSProperties =
    mode === "flex"
      ? {
          display: "flex",
          flexDirection: flexSettings.flexDirection,
          justifyContent: flexSettings.justifyContent,
          alignItems: flexSettings.alignItems,
          flexWrap: flexSettings.flexWrap,
          gap: `${flexSettings.gap}px`,
        }
      : {
          display: "grid",
          gridTemplateColumns: gridSettings.gridTemplateColumns,
          gridTemplateRows: gridSettings.gridTemplateRows,
          justifyContent: gridSettings.justifyContent,
          alignContent: gridSettings.alignContent,
          justifyItems: gridSettings.justifyItems,
          alignItems: gridSettings.alignItems,
          gap: `${gridSettings.gap}px`,
          columnGap: `${gridSettings.columnGap}px`,
          rowGap: `${gridSettings.rowGap}px`,
        };

  const generateCSS = () => {
    if (mode === "flex") {
      return `.container {
  display: flex;
  flex-direction: ${flexSettings.flexDirection};
  justify-content: ${flexSettings.justifyContent};
  align-items: ${flexSettings.alignItems};
  flex-wrap: ${flexSettings.flexWrap};
  gap: ${flexSettings.gap}px;
}`;
    } else {
      return `.container {
  display: grid;
  grid-template-columns: ${gridSettings.gridTemplateColumns};
  grid-template-rows: ${gridSettings.gridTemplateRows};
  justify-content: ${gridSettings.justifyContent};
  align-content: ${gridSettings.alignContent};
  justify-items: ${gridSettings.justifyItems};
  align-items: ${gridSettings.alignItems};
  gap: ${gridSettings.gap}px;
  column-gap: ${gridSettings.columnGap}px;
  row-gap: ${gridSettings.rowGap}px;
}`;
    }
  };

  const copyCSS = async () => {
    try {
      await navigator.clipboard.writeText(generateCSS());
      setCopiedCss(true);
      setTimeout(() => setCopiedCss(false), 2000);
    } catch (err) {
      alert("Failed to copy CSS");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Grid & Flex Sandbox
          </h1>
          <p className="text-gray-300">Visual learning environment for CSS Grid and Flexbox</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setMode("flex")}
            className={`px-8 py-3 rounded-lg font-semibold transition-all ${
              mode === "flex"
                ? "bg-blue-600 shadow-lg shadow-blue-500/50 scale-105"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            Flexbox
          </button>
          <button
            onClick={() => setMode("grid")}
            className={`px-8 py-3 rounded-lg font-semibold transition-all ${
              mode === "grid"
                ? "bg-purple-600 shadow-lg shadow-purple-500/50 scale-105"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            CSS Grid
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Controls Panel */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 h-fit">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Controls</h2>
              <button
                onClick={() => setShowCode(!showCode)}
                className="text-sm px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                {showCode ? "Hide" : "Show"} CSS
              </button>
            </div>

            {/* Number of Items */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Number of Items: {numItems}
              </label>
              <input
                type="range"
                min="1"
                max="12"
                value={numItems}
                onChange={(e) => updateNumItems(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Flexbox Controls */}
            {mode === "flex" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Flex Direction</label>
                  <select
                    value={flexSettings.flexDirection}
                    onChange={(e) =>
                      updateFlexSetting("flexDirection", e.target.value as FlexSettings["flexDirection"])
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="row">row</option>
                    <option value="row-reverse">row-reverse</option>
                    <option value="column">column</option>
                    <option value="column-reverse">column-reverse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Justify Content</label>
                  <select
                    value={flexSettings.justifyContent}
                    onChange={(e) =>
                      updateFlexSetting("justifyContent", e.target.value as FlexSettings["justifyContent"])
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="flex-start">flex-start</option>
                    <option value="flex-end">flex-end</option>
                    <option value="center">center</option>
                    <option value="space-between">space-between</option>
                    <option value="space-around">space-around</option>
                    <option value="space-evenly">space-evenly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Align Items</label>
                  <select
                    value={flexSettings.alignItems}
                    onChange={(e) =>
                      updateFlexSetting("alignItems", e.target.value as FlexSettings["alignItems"])
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="flex-start">flex-start</option>
                    <option value="flex-end">flex-end</option>
                    <option value="center">center</option>
                    <option value="stretch">stretch</option>
                    <option value="baseline">baseline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Flex Wrap</label>
                  <select
                    value={flexSettings.flexWrap}
                    onChange={(e) =>
                      updateFlexSetting("flexWrap", e.target.value as FlexSettings["flexWrap"])
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="nowrap">nowrap</option>
                    <option value="wrap">wrap</option>
                    <option value="wrap-reverse">wrap-reverse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Gap: {flexSettings.gap}px</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={flexSettings.gap}
                    onChange={(e) => updateFlexSetting("gap", Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Grid Controls */}
            {mode === "grid" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Grid Template Columns</label>
                  <input
                    type="text"
                    value={gridSettings.gridTemplateColumns}
                    onChange={(e) => updateGridSetting("gridTemplateColumns", e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    placeholder="repeat(3, 1fr)"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["repeat(3, 1fr)", "repeat(4, 1fr)", "1fr 2fr 1fr", "100px auto 100px"].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => updateGridSetting("gridTemplateColumns", preset)}
                        className="text-xs px-2 py-1 bg-purple-600/30 rounded hover:bg-purple-600/50 transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Grid Template Rows</label>
                  <input
                    type="text"
                    value={gridSettings.gridTemplateRows}
                    onChange={(e) => updateGridSetting("gridTemplateRows", e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    placeholder="auto"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["auto", "repeat(2, 100px)", "1fr 2fr"].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => updateGridSetting("gridTemplateRows", preset)}
                        className="text-xs px-2 py-1 bg-purple-600/30 rounded hover:bg-purple-600/50 transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Justify Content</label>
                  <select
                    value={gridSettings.justifyContent}
                    onChange={(e) =>
                      updateGridSetting("justifyContent", e.target.value as GridSettings["justifyContent"])
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="start">start</option>
                    <option value="end">end</option>
                    <option value="center">center</option>
                    <option value="stretch">stretch</option>
                    <option value="space-between">space-between</option>
                    <option value="space-around">space-around</option>
                    <option value="space-evenly">space-evenly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Align Content</label>
                  <select
                    value={gridSettings.alignContent}
                    onChange={(e) =>
                      updateGridSetting("alignContent", e.target.value as GridSettings["alignContent"])
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="start">start</option>
                    <option value="end">end</option>
                    <option value="center">center</option>
                    <option value="stretch">stretch</option>
                    <option value="space-between">space-between</option>
                    <option value="space-around">space-around</option>
                    <option value="space-evenly">space-evenly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Justify Items</label>
                  <select
                    value={gridSettings.justifyItems}
                    onChange={(e) =>
                      updateGridSetting("justifyItems", e.target.value as GridSettings["justifyItems"])
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="start">start</option>
                    <option value="end">end</option>
                    <option value="center">center</option>
                    <option value="stretch">stretch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Align Items</label>
                  <select
                    value={gridSettings.alignItems}
                    onChange={(e) =>
                      updateGridSetting("alignItems", e.target.value as GridSettings["alignItems"])
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="start">start</option>
                    <option value="end">end</option>
                    <option value="center">center</option>
                    <option value="stretch">stretch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Gap: {gridSettings.gap}px</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={gridSettings.gap}
                    onChange={(e) => updateGridSetting("gap", Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Column Gap: {gridSettings.columnGap}px</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={gridSettings.columnGap}
                    onChange={(e) => updateGridSetting("columnGap", Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Row Gap: {gridSettings.rowGap}px</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={gridSettings.rowGap}
                    onChange={(e) => updateGridSetting("rowGap", Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* CSS Code Display */}
            {showCode && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Generated CSS</label>
                  <button
                    onClick={copyCSS}
                    className={`text-xs px-3 py-1 rounded transition-colors ${
                      copiedCss ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {copiedCss ? "✓ Copied!" : "Copy CSS"}
                  </button>
                </div>
                <pre className="bg-black/30 rounded-lg p-4 text-sm font-mono overflow-x-auto border border-white/10">
                  <code>{generateCSS()}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">Preview</h2>
              <p className="text-sm text-gray-400">
                {mode === "flex" ? "Flexbox" : "CSS Grid"} container with {numItems} items
              </p>
            </div>

            {/* Container Preview */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 min-h-[500px] border-2 border-dashed border-white/20">
              <div style={containerStyle} className="h-full">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg p-6 flex items-center justify-center font-bold text-2xl shadow-lg transition-all hover:scale-105"
                    style={{
                      backgroundColor: item.color,
                      minWidth: mode === "flex" ? "100px" : "auto",
                      minHeight: "100px",
                    }}
                  >
                    {item.content}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-6 bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="font-semibold mb-2 text-sm">💡 Quick Tips</h3>
              <ul className="text-xs text-gray-300 space-y-1">
                {mode === "flex" ? (
                  <>
                    <li>• <strong>flex-direction:</strong> Defines the main axis direction</li>
                    <li>• <strong>justify-content:</strong> Aligns items along the main axis</li>
                    <li>• <strong>align-items:</strong> Aligns items along the cross axis</li>
                    <li>• <strong>flex-wrap:</strong> Controls whether items wrap to new lines</li>
                  </>
                ) : (
                  <>
                    <li>• <strong>grid-template-columns:</strong> Defines column structure (e.g., repeat(3, 1fr))</li>
                    <li>• <strong>justify-content:</strong> Aligns the grid along the inline (row) axis</li>
                    <li>• <strong>align-content:</strong> Aligns the grid along the block (column) axis</li>
                    <li>• <strong>justify/align-items:</strong> Aligns items within their grid cells</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
