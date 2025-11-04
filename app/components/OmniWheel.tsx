"use client";

import React, { useRef, useState } from "react";

export default function OmniWheel() {
  const [options, setOptions] = useState<string[]>(["Option 1", "Option 2", "Option 3"]);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const wheelRef = useRef<SVGSVGElement | null>(null);

  function updateOption(index: number, value: string) {
    setOptions((s) => s.map((v, i) => (i === index ? value : v)));
  }

  function addOption() {
    setOptions((s) => [...s, `Option ${s.length + 1}`]);
  }

  function removeOption(i: number) {
    setOptions((s) => s.filter((_, idx) => idx !== i));
  }

  function spin() {
    if (options.length < 2 || spinning) return;
    const n = options.length;
    // RNG selection
    const chosenIndex = Math.floor(Math.random() * n);
    const wheel = wheelRef.current;
    if (!wheel) return;

    // compute degrees per slice and the target angle so chosen slice ends at top (0deg)
    const sliceDeg = 360 / n;
    // We want to rotate so that the chosen slice center aligns with 0deg.
    // If slice i starts at angle start = i * sliceDeg, its center is start + sliceDeg/2.
    const targetCenter = chosenIndex * sliceDeg + sliceDeg / 2;
    // We'll spin multiple full rotations plus land so that targetCenter is at top (0deg).
    const extraSpins = 3 + Math.floor(Math.random() * 3); // 3..5 full spins
    const finalAngle = 360 * extraSpins + (360 - targetCenter);

    setSpinning(true);
    setSpinResult(null);
    // Apply CSS transform with transition
    wheel.style.transition = "transform 3s cubic-bezier(.16,.84,.44,1)";
    wheel.style.transform = `rotate(${finalAngle}deg)`;

    // After animation ends, normalize the rotation and show result
    const onEnd = () => {
      wheel.style.transition = "none";
      // keep the wheel visually at (finalAngle % 360) so it doesn't jump
      const keep = finalAngle % 360;
      wheel.style.transform = `rotate(${keep}deg)`;
      setSpinning(false);
      setSpinResult(options[chosenIndex]);
      wheel.removeEventListener("transitionend", onEnd);
    };
    wheel.addEventListener("transitionend", onEnd);
  }

  // SVG wheel dimensions
  const size = 320; // px
  const radius = size / 2;
  const sliceDeg = 360 / Math.max(2, options.length);

  // helper: build path for a slice between angles (in degrees)
  function slicePath(startDeg: number, endDeg: number) {
    const startRad = (Math.PI / 180) * startDeg;
    const endRad = (Math.PI / 180) * endDeg;
    const x1 = radius + radius * Math.cos(startRad - Math.PI / 2);
    const y1 = radius + radius * Math.sin(startRad - Math.PI / 2);
    const x2 = radius + radius * Math.cos(endRad - Math.PI / 2);
    const y2 = radius + radius * Math.sin(endRad - Math.PI / 2);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Omni Wheel</h2>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-sm">
            <div className="relative mx-auto" style={{ width: size, height: size }}>
              <svg ref={wheelRef} viewBox={`0 0 ${size} ${size}`} style={{ transformOrigin: '50% 50%', transition: 'transform 0s' }}>
                <g className="wheel-group">
                  {options.map((opt, i) => {
                    const start = i * sliceDeg;
                    const end = start + sliceDeg;
                    const hue = Math.round((i / options.length) * 360);
                    const color = `hsl(${hue} 70% 60%)`;
                    return (
                      <g key={i}>
                        <path d={slicePath(start, end)} fill={color} stroke="#111" strokeWidth={0.5} />
                        {/* label */}
                        <text x={radius} y={radius} transform={`rotate(${start + sliceDeg / 2} ${radius} ${radius}) translate(0 ${-radius + 28})`} textAnchor="middle" fontSize={12} fill="#111">
                          {opt}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
              {/* indicator triangle placed outside the wheel (smaller, points down) */}
              <svg viewBox="0 0 16 10" style={{ position: 'absolute', left: '50%', top: -10, transform: 'translateX(-50%)', width: 15, height: 9 }} aria-hidden>
                <polygon points="0,0 16,0 8,10" fill="#fff" stroke="#222" strokeWidth={0.6} />
              </svg>
            </div>
          </div>

          <div className="mt-4">
            <button onClick={spin} disabled={spinning || options.length < 2} className={`px-4 py-2 rounded ${spinning ? 'opacity-60' : 'bg-var'}`}>
              {spinning ? 'Spinning…' : 'Spin'}
            </button>
          </div>

          {spinResult && (
            <div className="mt-4 w-56">
              <div className="p-3 bg-var rounded shadow-sm">
                <div className="text-sm opacity-70">Result</div>
                <div className="text-lg font-semibold mt-1">{spinResult}</div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full md:w-96">
          <div className="p-2 border rounded h-72 overflow-auto">
            <div className="text-sm opacity-70 mb-2">Options</div>
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input value={opt} onChange={(e) => updateOption(i, e.target.value)} className="flex-1 p-2 bg-black/10 rounded" />
                <button onClick={() => removeOption(i)} className="px-2 py-1 border rounded">Remove</button>
              </div>
            ))}
            <div className="mt-2">
              <button onClick={addOption} className="px-3 py-1 border rounded">Add option</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
