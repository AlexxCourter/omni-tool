"use client";

import React, { useState, useMemo } from "react";

interface ButtonStyle {
  text: string;
  buttonStyleType: "default" | "negative";
  borderWidth: number;
  bgColor: string;
  textColor: string;
  fontSize: string;
  fontWeight: number;
  borderRadius: number;
  shadowEnabled: boolean;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowColor: string;
  hoverBgColor: string;
  hoverTextColor: string;
  padding: string;
  canvasColor: string;
  hoverEffect: string;
  isCustomGradient: boolean;
  gradientStops: { color: string; position: number }[];
  gradientAngle: number;
}

type HoverEffect = {
  name: string;
  value: string;
  description: string;
};

const DEFAULT_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Red", value: "#ef4444" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Orange", value: "#f97316" },
  { name: "Black", value: "#000000" },
  { name: "White", value: "#ffffff" },
];

const DEFAULT_GRADIENTS = [
  { name: "Blue Purple", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Ocean", value: "linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)" },
  { name: "Sunset", value: "linear-gradient(135deg, #FF512F 0%, #F09819 100%)" },
  { name: "Forest", value: "linear-gradient(135deg, #134E5E 0%, #71B280 100%)" },
];

const HOVER_EFFECTS: HoverEffect[] = [
  { name: "Lift", value: "lift", description: "Moves button up with enhanced shadow" },
  { name: "Glow", value: "glow", description: "Adds a glowing shadow effect" },
  { name: "Grow", value: "grow", description: "Scales button larger" },
  { name: "Lava Lamp", value: "lavaLamp", description: "Animated gradient flow" },
  { name: "Brightness", value: "brightness", description: "Brightens the button" },
  { name: "Slide", value: "slide", description: "Slides background gradient" },
];

const CANVAS_COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Grey", value: "#6b7280" },
  { name: "Muted Red", value: "#c17979" },
];

const SHAPE_PRESETS = [
  { name: "Square", radius: 0 },
  { name: "Rounded", radius: 8 },
  { name: "Squircle", radius: 16 },
  { name: "Pill", radius: 999 },
];

export default function ButtonGenerator() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedCss, setCopiedCss] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState({
    text: true,
    colors: true,
    shape: true,
    shadow: true,
    hover: true,
    canvas: true,
  });

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>({
    text: "Click Me",
    buttonStyleType: "default",
    borderWidth: 2,
    bgColor: "#3b82f6",
    textColor: "#ffffff",
    fontSize: "16px",
    fontWeight: 600,
    borderRadius: 4,
    shadowEnabled: true,
    shadowX: 0,
    shadowY: 4,
    shadowBlur: 6,
    shadowSpread: 0,
    shadowColor: "#000000",
    hoverBgColor: "#2563eb",
    hoverTextColor: "#ffffff",
    padding: "12px 24px",
    canvasColor: "#ffffff",
    hoverEffect: "lift",
    isCustomGradient: false,
    gradientStops: [
      { color: "#667eea", position: 0 },
      { color: "#764ba2", position: 100 },
    ],
    gradientAngle: 135,
  });

  const updateStyle = (updates: Partial<ButtonStyle>) => {
    setButtonStyle((prev) => ({ ...prev, ...updates }));
  };

  const addGradientStop = () => {
    const newStop = { color: "#ffffff", position: 50 };
    updateStyle({ gradientStops: [...buttonStyle.gradientStops, newStop].sort((a, b) => a.position - b.position) });
  };

  const removeGradientStop = (index: number) => {
    if (buttonStyle.gradientStops.length > 2) {
      const newStops = buttonStyle.gradientStops.filter((_, i) => i !== index);
      updateStyle({ gradientStops: newStops });
    }
  };

  const updateGradientStop = (index: number, updates: Partial<{ color: string; position: number }>) => {
    const newStops = [...buttonStyle.gradientStops];
    newStops[index] = { ...newStops[index], ...updates };
    updateStyle({ gradientStops: newStops.sort((a, b) => a.position - b.position) });
  };

  const generateGradientString = () => {
    const stops = buttonStyle.gradientStops
      .map(stop => `${stop.color} ${stop.position}%`)
      .join(", ");
    return `linear-gradient(${buttonStyle.gradientAngle}deg, ${stops})`;
  };

  const currentBgValue = useMemo(() => {
    if (buttonStyle.isCustomGradient) {
      return generateGradientString();
    }
    return buttonStyle.bgColor;
  }, [buttonStyle.bgColor, buttonStyle.isCustomGradient, buttonStyle.gradientStops, buttonStyle.gradientAngle]);

  const { htmlCode, cssCode } = useMemo(() => {
    const html = `<button class="custom-button">${buttonStyle.text}</button>`;
    
    const bgValue = buttonStyle.isCustomGradient ? generateGradientString() : buttonStyle.bgColor;
    const isGradient = bgValue.includes("gradient") || buttonStyle.isCustomGradient;
    const shadowValue = buttonStyle.shadowEnabled
      ? `${buttonStyle.shadowX}px ${buttonStyle.shadowY}px ${buttonStyle.shadowBlur}px ${buttonStyle.shadowSpread}px ${buttonStyle.shadowColor}`
      : "none";

    // Generate hover effect CSS based on selected effect
    let hoverTransform = "";
    let hoverBoxShadow = shadowValue;
    let additionalBaseStyles = "";
    let additionalHoverStyles = "";
    let keyframes = "";

    switch (buttonStyle.hoverEffect) {
      case "lift":
        hoverTransform = "transform: translateY(-2px);";
        hoverBoxShadow = buttonStyle.shadowEnabled 
          ? `${buttonStyle.shadowX}px ${buttonStyle.shadowY + 2}px ${buttonStyle.shadowBlur + 4}px ${buttonStyle.shadowSpread}px ${buttonStyle.shadowColor}` 
          : "none";
        break;
      case "glow":
        hoverBoxShadow = `0 0 20px ${bgValue}, 0 0 30px ${bgValue}`;
        break;
      case "grow":
        hoverTransform = "transform: scale(1.05);";
        break;
      case "lavaLamp":
        additionalBaseStyles = `\n  background-size: 100% 350%;\n  background-position: 0% 100%;`;
        additionalHoverStyles = `\n  background-position: 0% 0%;`;
        hoverTransform = "transform: translateY(-1px);";
        break;
      case "brightness":
        additionalHoverStyles = `\n  filter: brightness(1.2);`;
        break;
      case "slide":
        additionalBaseStyles = `\n  background-size: 200% 100%;\n  background-position: left;`;
        additionalHoverStyles = `\n  background-position: right;`;
        break;
    }

    // Handle negative button style
    const isNegative = buttonStyle.buttonStyleType === "negative";
    const borderColor = isGradient ? buttonStyle.gradientStops[0].color : bgValue;
    
    const css = `.custom-button {
  ${isNegative ? `background-color: transparent;` : (isGradient ? `background-image: ${bgValue};` : `background-color: ${bgValue};`)}
  color: ${isNegative ? borderColor : buttonStyle.textColor};
  border: ${isNegative ? `${buttonStyle.borderWidth}px solid ${borderColor}` : 'none'};
  border-radius: ${buttonStyle.borderRadius}px;
  padding: ${buttonStyle.padding};
  font-size: ${buttonStyle.fontSize};
  font-weight: ${buttonStyle.fontWeight};
  cursor: pointer;
  box-shadow: ${shadowValue};
  transition: all 0.3s ease;${additionalBaseStyles}
}

.custom-button:hover {
  ${isNegative ? `background-color: ${borderColor};
  color: ${buttonStyle.textColor};` : (isGradient && buttonStyle.hoverEffect !== "lavaLamp" && buttonStyle.hoverEffect !== "slide" ? `background-image: ${buttonStyle.hoverBgColor};` : !isGradient ? `background-color: ${buttonStyle.hoverBgColor};` : "")}
  color: ${buttonStyle.hoverTextColor};
  ${hoverTransform}
  box-shadow: ${hoverBoxShadow};${additionalHoverStyles}
}${keyframes}`;

    return { htmlCode: html, cssCode: css };
  }, [buttonStyle, currentBgValue]);

  const copyToClipboard = async (text: string, type: "html" | "css") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "html") {
        setCopiedHtml(true);
        setTimeout(() => setCopiedHtml(false), 2000);
      } else {
        setCopiedCss(true);
        setTimeout(() => setCopiedCss(false), 2000);
      }
    } catch (err) {
      alert("Failed to copy to clipboard");
    }
  };

  const previewStyle: React.CSSProperties = useMemo(() => {
    const bgValue = buttonStyle.isCustomGradient ? generateGradientString() : buttonStyle.bgColor;
    const isGradient = bgValue.includes("gradient") || buttonStyle.isCustomGradient;
    const isNegative = buttonStyle.buttonStyleType === "negative";
    const borderColor = isGradient ? buttonStyle.gradientStops[0].color : bgValue;
    
    const baseStyle: React.CSSProperties = {
      color: isNegative ? borderColor : buttonStyle.textColor,
      borderRadius: `${buttonStyle.borderRadius}px`,
      padding: buttonStyle.padding,
      border: isNegative ? `${buttonStyle.borderWidth}px solid ${borderColor}` : "none",
      fontSize: buttonStyle.fontSize,
      fontWeight: buttonStyle.fontWeight,
      cursor: "pointer",
      boxShadow: buttonStyle.shadowEnabled
        ? `${buttonStyle.shadowX}px ${buttonStyle.shadowY}px ${buttonStyle.shadowBlur}px ${buttonStyle.shadowSpread}px ${buttonStyle.shadowColor}`
        : "none",
      transition: "all 0.3s ease",
    };

    if (isNegative) {
      baseStyle.backgroundColor = "transparent";
    } else if (isGradient) {
      baseStyle.backgroundImage = bgValue;
      if (buttonStyle.hoverEffect === "lavaLamp") {
        baseStyle.backgroundSize = "100% 350%";
        baseStyle.backgroundPosition = "0% 100%";
      } else if (buttonStyle.hoverEffect === "slide") {
        baseStyle.backgroundSize = "200% 100%";
        baseStyle.backgroundPosition = "left";
      }
    } else {
      baseStyle.backgroundColor = bgValue;
    }

    return baseStyle;
  }, [buttonStyle, currentBgValue]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4 flex items-center justify-between border-b border-white/10 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold">Button Generator</h1>
          <p className="text-sm opacity-70 mt-2">
            Create custom CSS buttons with live preview
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
            onClick={() => setExportModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Export Code
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview Area - adjusts based on drawer state */}
        <div className={`flex-1 p-6 flex items-center justify-center transition-all duration-300 ${
          drawerOpen ? 'lg:pr-[340px]' : ''
        }`}>
          <div 
            className="border rounded-lg p-12 flex items-center justify-center min-h-[300px] max-w-4xl w-full transition-colors"
            style={{ backgroundColor: buttonStyle.canvasColor }}
          >
            <button style={previewStyle} className="preview-button">
              {buttonStyle.text}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Drawer - Side on Desktop, Bottom on Mobile */}
      {drawerOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
            onClick={() => setDrawerOpen(false)}
          />
          
          {/* Drawer */}
          <div
            className="fixed z-50 bg-[var(--background)] overflow-auto bottom-0 left-0 right-0 max-h-[70vh] rounded-t-2xl border-t border-white/10 lg:top-0 lg:right-0 lg:bottom-0 lg:left-auto lg:w-80 lg:max-h-none lg:rounded-none lg:border-t-0 lg:border-l"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag handle */}
            <div className="lg:hidden flex justify-center py-3 border-b border-white/10">
              <div className="w-12 h-1 bg-white/30 rounded-full" />
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Button Settings</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="px-3 py-1 border rounded hover:bg-white/5"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-3">
                {/* Button Style Section */}
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  <div className="p-4">
                    <label className="block text-sm font-medium mb-3">Button Style</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => updateStyle({ buttonStyleType: "default" })}
                        className={`px-4 py-3 rounded border-2 transition-all ${
                          buttonStyle.buttonStyleType === "default"
                            ? "border-blue-500 bg-blue-500/20"
                            : "border-white/20 hover:border-white/40"
                        }`}
                      >
                        <div className="text-sm font-semibold mb-1">Default</div>
                        <div className="text-xs opacity-70">Filled background</div>
                      </button>
                      <button
                        onClick={() => updateStyle({ buttonStyleType: "negative" })}
                        className={`px-4 py-3 rounded border-2 transition-all ${
                          buttonStyle.buttonStyleType === "negative"
                            ? "border-blue-500 bg-blue-500/20"
                            : "border-white/20 hover:border-white/40"
                        }`}
                      >
                        <div className="text-sm font-semibold mb-1">Negative</div>
                        <div className="text-xs opacity-70">Outline style</div>
                      </button>
                    </div>
                    
                    {/* Border Width Slider - Only shown for Negative style */}
                    {buttonStyle.buttonStyleType === "negative" && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">Border Width: {buttonStyle.borderWidth}px</label>
                        <input
                          type="range"
                          min="1"
                          max="8"
                          step="1"
                          value={buttonStyle.borderWidth}
                          onChange={(e) => updateStyle({ borderWidth: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Text Section */}
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('text')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-semibold">Text</span>
                    <span className="text-xl">{sectionsOpen.text ? '−' : '+'}</span>
                  </button>
                  {sectionsOpen.text && (
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Button Text</label>
                        <input
                          type="text"
                          value={buttonStyle.text}
                          onChange={(e) => updateStyle({ text: e.target.value })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Font Size: {buttonStyle.fontSize}</label>
                        <input
                          type="range"
                          min="12"
                          max="32"
                          step="1"
                          value={parseInt(buttonStyle.fontSize)}
                          onChange={(e) => updateStyle({ fontSize: `${e.target.value}px` })}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Font Weight: {buttonStyle.fontWeight}</label>
                        <input
                          type="range"
                          min="100"
                          max="900"
                          step="100"
                          value={buttonStyle.fontWeight}
                          onChange={(e) => updateStyle({ fontWeight: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-white/50 mt-1">
                          <span>Thin</span>
                          <span>Regular</span>
                          <span>Bold</span>
                          <span>Heavy</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Colors Section */}
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('colors')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-semibold">Colors</span>
                    <span className="text-xl">{sectionsOpen.colors ? '−' : '+'}</span>
                  </button>
                  {sectionsOpen.colors && (
                    <div className="p-4 space-y-4">
                      {/* Text Color */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Text Color</label>
                        <div className="grid grid-cols-4 gap-2 mb-2">
                          {[
                            { name: "White", value: "#ffffff" },
                            { name: "Black", value: "#000000" },
                            ...DEFAULT_COLORS.filter(c => c.value !== "#ffffff" && c.value !== "#000000").slice(0, 2),
                          ].map((color) => (
                            <button
                              key={color.value}
                              onClick={() => updateStyle({ textColor: color.value })}
                              className={`h-10 rounded border-2 transition-all ${
                                buttonStyle.textColor === color.value
                                  ? "border-white scale-105"
                                  : "border-transparent hover:border-white/30"
                              }`}
                              style={{ background: color.value }}
                              title={color.name}
                            />
                          ))}
                        </div>
                        <input
                          type="color"
                          value={buttonStyle.textColor}
                          onChange={(e) => updateStyle({ textColor: e.target.value })}
                          className="w-full h-10 rounded cursor-pointer"
                        />
                      </div>

                      {/* Background Color */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Background Color</label>
                        <div className="grid grid-cols-4 gap-2 mb-2">
                          {DEFAULT_COLORS.slice(0, 4).map((color) => (
                            <button
                              key={color.value}
                              onClick={() => {
                                updateStyle({ bgColor: color.value, hoverBgColor: color.value });
                              }}
                              className={`h-10 rounded border-2 transition-all ${
                                buttonStyle.bgColor === color.value
                                  ? "border-white scale-105"
                                  : "border-transparent hover:border-white/30"
                              }`}
                              style={{ background: color.value }}
                              title={color.name}
                            />
                          ))}
                        </div>
                        <input
                          type="color"
                          value={buttonStyle.isCustomGradient ? "#3b82f6" : (buttonStyle.bgColor.includes("gradient") ? "#3b82f6" : buttonStyle.bgColor)}
                          onChange={(e) => {
                            updateStyle({ bgColor: e.target.value, hoverBgColor: e.target.value, isCustomGradient: false });
                          }}
                          className="w-full h-10 rounded cursor-pointer"
                        />
                        <div className="mt-4 mb-2">
                          <p className="text-xs opacity-60 mb-2">Gradients</p>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            {/* Custom Gradient Button */}
                            <button
                              onClick={() => {
                                updateStyle({ isCustomGradient: true });
                              }}
                              className={`h-10 rounded border-2 transition-all relative ${
                                buttonStyle.isCustomGradient
                                  ? "border-white scale-105"
                                  : "border-transparent hover:border-white/30"
                              }`}
                              style={{ 
                                backgroundImage: generateGradientString(),
                              }}
                              title="Custom Gradient"
                            >
                              <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold bg-black/30 rounded">
                                Custom
                              </span>
                            </button>
                            
                            {/* Preset Gradients */}
                            {DEFAULT_GRADIENTS.map((gradient) => (
                              <button
                                key={gradient.name}
                                onClick={() => {
                                  updateStyle({ bgColor: gradient.value, hoverBgColor: gradient.value, isCustomGradient: false });
                                }}
                                className={`h-10 rounded border-2 transition-all ${
                                  !buttonStyle.isCustomGradient && buttonStyle.bgColor === gradient.value
                                    ? "border-white scale-105"
                                    : "border-transparent hover:border-white/30"
                                }`}
                                style={{ backgroundImage: gradient.value }}
                                title={gradient.name}
                              />
                            ))}
                          </div>
                          
                          {/* Custom Gradient Editor */}
                          {buttonStyle.isCustomGradient && (
                            <div className="space-y-3 mt-3">
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Gradient Angle: {buttonStyle.gradientAngle}&deg;
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="360"
                                  value={buttonStyle.gradientAngle}
                                  onChange={(e) => updateStyle({ gradientAngle: Number(e.target.value) })}
                                  className="w-full"
                                />
                              </div>
                              
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-sm font-medium">Color Stops</label>
                                  <button
                                    onClick={addGradientStop}
                                    className="text-xs px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                                  >
                                    + Add Stop
                                  </button>
                                </div>
                                
                                <div className="space-y-3">
                                  {buttonStyle.gradientStops.map((stop, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <input
                                        type="color"
                                        value={stop.color}
                                        onChange={(e) => updateGradientStop(index, { color: e.target.value })}
                                        className="w-16 h-10 rounded cursor-pointer flex-shrink-0"
                                        title={`Color ${index + 1}`}
                                      />
                                      <div className="flex-1 relative">
                                        <input
                                          type="range"
                                          min="0"
                                          max="100"
                                          value={stop.position}
                                          onChange={(e) => updateGradientStop(index, { position: Number(e.target.value) })}
                                          className="w-full gradient-slider"
                                          style={{
                                            background: `linear-gradient(to right, ${buttonStyle.gradientStops.map(s => `${s.color} ${s.position}%`).join(', ')})`,
                                          }}
                                        />
                                      </div>
                                      {buttonStyle.gradientStops.length > 2 && (
                                        <button
                                          onClick={() => removeGradientStop(index)}
                                          className="w-6 h-6 flex items-center justify-center bg-red-600 rounded hover:bg-red-700 transition-colors text-sm flex-shrink-0"
                                          title="Remove stop"
                                        >
                                          &times;
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Shape Section */}
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('shape')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-semibold">Shape</span>
                    <span className="text-xl">{sectionsOpen.shape ? '−' : '+'}</span>
                  </button>
                  {sectionsOpen.shape && (
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Border Radius: {buttonStyle.borderRadius}px
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={buttonStyle.borderRadius}
                          onChange={(e) => updateStyle({ borderRadius: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Shape Presets</label>
                        <div className="grid grid-cols-4 gap-2">
                          {SHAPE_PRESETS.map((shape) => (
                            <button
                              key={shape.name}
                              onClick={() => updateStyle({ borderRadius: shape.radius })}
                              className={`h-16 border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                                buttonStyle.borderRadius === shape.radius
                                  ? "border-white bg-white/10"
                                  : "border-white/20 hover:border-white/40 hover:bg-white/5"
                              }`}
                              style={{ borderRadius: `${Math.min(shape.radius, 8)}px` }}
                              title={shape.name}
                            >
                              <div 
                                className={`border-2 border-white/60 ${
                                  shape.name === "Pill" ? "w-10 h-6" : "w-8 h-8"
                                }`}
                                style={{ 
                                  borderRadius: shape.radius === 999 ? '999px' : `${shape.radius}px`
                                }}
                              />
                              <span className="text-[10px] font-medium">{shape.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Shadow Section */}
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('shadow')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-semibold">Shadow</span>
                    <span className="text-xl">{sectionsOpen.shadow ? '−' : '+'}</span>
                  </button>
                  {sectionsOpen.shadow && (
                    <div className="p-4 space-y-4">
                      <label className="flex items-center justify-between">
                        <span className="text-sm font-medium">Enable Shadow</span>
                        <input
                          type="checkbox"
                          checked={buttonStyle.shadowEnabled}
                          onChange={(e) => updateStyle({ shadowEnabled: e.target.checked })}
                          className="w-5 h-5 cursor-pointer"
                        />
                      </label>

                      {buttonStyle.shadowEnabled && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-2">Shadow Color</label>
                            <input
                              type="color"
                              value={buttonStyle.shadowColor}
                              onChange={(e) => updateStyle({ shadowColor: e.target.value })}
                              className="w-full h-10 rounded cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block text-xs opacity-70 mb-1">
                              Horizontal: {buttonStyle.shadowX}px
                            </label>
                            <input
                              type="range"
                              min="-20"
                              max="20"
                              value={buttonStyle.shadowX}
                              onChange={(e) => updateStyle({ shadowX: Number(e.target.value) })}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-xs opacity-70 mb-1">
                              Vertical: {buttonStyle.shadowY}px
                            </label>
                            <input
                              type="range"
                              min="-20"
                              max="20"
                              value={buttonStyle.shadowY}
                              onChange={(e) => updateStyle({ shadowY: Number(e.target.value) })}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-xs opacity-70 mb-1">
                              Blur: {buttonStyle.shadowBlur}px
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="50"
                              value={buttonStyle.shadowBlur}
                              onChange={(e) => updateStyle({ shadowBlur: Number(e.target.value) })}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-xs opacity-70 mb-1">
                              Spread: {buttonStyle.shadowSpread}px
                            </label>
                            <input
                              type="range"
                              min="-10"
                              max="10"
                              value={buttonStyle.shadowSpread}
                              onChange={(e) => updateStyle({ shadowSpread: Number(e.target.value) })}
                              className="w-full"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Hover Effects Section */}
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('hover')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-semibold">Hover Effects</span>
                    <span className="text-xl">{sectionsOpen.hover ? '−' : '+'}</span>
                  </button>
                  {sectionsOpen.hover && (
                    <div className="p-4">
                      <label className="block text-sm font-medium mb-2">Effect Type</label>
                      <select
                        value={buttonStyle.hoverEffect}
                        onChange={(e) => updateStyle({ hoverEffect: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        {HOVER_EFFECTS.map((effect) => (
                          <option key={effect.value} value={effect.value}>
                            {effect.name} - {effect.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Canvas Color Section */}
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('canvas')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-semibold">Canvas Background</span>
                    <span className="text-xl">{sectionsOpen.canvas ? '−' : '+'}</span>
                  </button>
                  {sectionsOpen.canvas && (
                    <div className="p-4">
                      <label className="block text-sm font-medium mb-2">Canvas Color</label>
                      <div className="grid grid-cols-3 gap-2">
                        {CANVAS_COLORS.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => updateStyle({ canvasColor: color.value })}
                            className={`h-12 rounded border-2 transition-all ${
                              buttonStyle.canvasColor === color.value
                                ? "border-white scale-105"
                                : "border-transparent hover:border-white/30"
                            }`}
                            style={{ background: color.value }}
                            title={color.name}
                          >
                            <span className="text-xs font-medium drop-shadow-lg">{color.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
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
              <h2 className="text-2xl font-bold">Export Code</h2>
              <button
                onClick={() => setExportModalOpen(false)}
                className="px-3 py-1 border rounded hover:bg-white/5"
              >
                &times;
              </button>
            </div>

            <div className="space-y-6">
              {/* HTML */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold">HTML</label>
                  <button
                    onClick={() => copyToClipboard(htmlCode, "html")}
                    className="px-3 py-1 text-sm border rounded hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    {copiedHtml ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="bg-black/30 p-4 rounded border border-white/10 overflow-x-auto text-sm">
                  <code>{htmlCode}</code>
                </pre>
              </div>

              {/* CSS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold">CSS</label>
                  <button
                    onClick={() => copyToClipboard(cssCode, "css")}
                    className="px-3 py-1 text-sm border rounded hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    {copiedCss ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="bg-black/30 p-4 rounded border border-white/10 overflow-x-auto text-sm">
                  <code>{cssCode}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .preview-button:hover {
          ${buttonStyle.buttonStyleType === "negative" ? `
            background-color: ${(currentBgValue.includes("gradient") || buttonStyle.isCustomGradient) ? buttonStyle.gradientStops[0].color : currentBgValue} !important;
            color: ${buttonStyle.textColor} !important;
          ` : `
            ${(buttonStyle.hoverEffect !== "lavaLamp" && buttonStyle.hoverEffect !== "slide") ? `
              ${(currentBgValue.includes("gradient") || buttonStyle.isCustomGradient) ? `background-image: ${buttonStyle.hoverBgColor} !important;` : `background-color: ${buttonStyle.hoverBgColor} !important;`}
            ` : ""}
            color: ${buttonStyle.hoverTextColor} !important;
          `}
          ${buttonStyle.hoverEffect === "lift" ? `
            transform: translateY(-2px);
            box-shadow: ${buttonStyle.shadowEnabled
              ? `${buttonStyle.shadowX}px ${buttonStyle.shadowY + 2}px ${buttonStyle.shadowBlur + 4}px ${buttonStyle.shadowSpread}px ${buttonStyle.shadowColor}`
              : "none"} !important;
          ` : ""}
          ${buttonStyle.hoverEffect === "glow" ? `
            box-shadow: 0 0 20px ${currentBgValue}, 0 0 30px ${currentBgValue} !important;
          ` : ""}
          ${buttonStyle.hoverEffect === "grow" ? `
            transform: scale(1.05);
          ` : ""}
          ${buttonStyle.hoverEffect === "lavaLamp" ? `
            background-position: 0% 0% !important;
            transform: translateY(-1px);
          ` : ""}
          ${buttonStyle.hoverEffect === "brightness" ? `
            filter: brightness(1.2);
          ` : ""}
          ${buttonStyle.hoverEffect === "slide" ? `
            background-position: right !important;
          ` : ""}
        }

        .gradient-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 4px;
          outline: none;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .gradient-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          border: 2px solid rgba(0, 0, 0, 0.5);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .gradient-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          border: 2px solid rgba(0, 0, 0, 0.5);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .gradient-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        .gradient-slider::-moz-range-thumb:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
