"use client";

import React, { useState } from "react";
import { HexColorPicker } from "react-colorful";

function hexToRgb(hex: string) {
  const cleaned = hex.replace('#','');
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function linearizeChannel(c:number){
  const s = c/255;
  return s <= 0.03928 ? s/12.92 : Math.pow((s+0.055)/1.055, 2.4);
}

function luminance(hex:string){
  const {r,g,b} = hexToRgb(hex);
  const R = linearizeChannel(r);
  const G = linearizeChannel(g);
  const B = linearizeChannel(b);
  return 0.2126*R + 0.7152*G + 0.0722*B;
}

export default function ContrastChecker(){
  const [a,setA] = useState('#071028');
  const [b,setB] = useState('#9be7ff');

  const la = luminance(a);
  const lb = luminance(b);
  const L1 = Math.max(la,lb);
  const L2 = Math.min(la,lb);
  const ratio = +( (L1 + 0.05) / (L2 + 0.05) ).toFixed(2);

  const passNormal = ratio >= 4.5;
  const passLarge = ratio >= 3;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Contrast & Accessibility Checker</h2>
      <div className="flex gap-6 flex-wrap">
        <div>
          <div className="mb-1">Color A</div>
          <HexColorPicker color={a} onChange={setA} />
        </div>
        <div>
          <div className="mb-1">Color B</div>
          <HexColorPicker color={b} onChange={setB} />
        </div>
        <div className="flex-1 min-w-[220px]">
          <div className="p-4 border rounded">
            <div className="mb-2">Contrast ratio</div>
            <div className="text-2xl font-bold">{ratio}:1</div>
            <div className="mt-2">Normal text: <strong style={{ color: passNormal ? 'var(--neon-green)' : 'var(--neon-red)' }}>{passNormal ? 'PASS' : 'FAIL'}</strong></div>
            <div>Large text: <strong style={{ color: passLarge ? 'var(--neon-green)' : 'var(--neon-red)' }}>{passLarge ? 'PASS' : 'FAIL'}</strong></div>
            <div className="mt-4 p-2 rounded" style={{ background: a, color: b }}>Sample text (A bg, B fg)</div>
            <div className="mt-2 p-2 rounded" style={{ background: b, color: a }}>Sample text (B bg, A fg)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
