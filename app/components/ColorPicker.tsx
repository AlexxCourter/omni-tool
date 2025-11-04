"use client";

import React, { useEffect, useState } from "react";
import artStorage from "../utils/artStorage";

function hexToRgb(hex: string) {
  const cleaned = hex.replace('#','');
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function rgbToHsl(r:number,g:number,b:number){
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h=0,s=0,l=(max+min)/2;
  if(max !== min){
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max){
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
}

export default function ColorPicker() {
  const [color, setColor] = useState<string>('#7be8ff');
  const [paletteName, setPaletteName] = useState('My Palette');
  // Palette should have 6 selectable colors
  const [palette, setPalette] = useState<string[]>(['#7be8ff','#ff6b6b','#3aff99','#ffd166','#c084fc','#ffd1d1']);
  const [saved, setSaved] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(()=>{
    setSaved(artStorage.listProjectsForApp('colorpicker'));
  },[]);

  // Dynamically load react-colorful's HexColorPicker if available at runtime.
  const [Picker, setPicker] = useState<any>(null);
  useEffect(()=>{
    let mounted = true;
    import('react-colorful').then(mod => {
      if(mounted) setPicker(() => mod?.HexColorPicker || mod?.default || null);
    }).catch(() => {
      // not installed — we'll fall back to native color input
    });
    return () => { mounted = false; };
  },[]);

  // when color input changes, only update the selected color in the palette
  function onColorChange(hex:string){
    setColor(hex);
    setPalette((p)=>{
      const next = [...p];
      next[selectedIndex] = hex;
      return next;
    });
  }

  function addToPalette(){
    setPalette((p)=>{
      const next = [...p];
      if(next.length < 6) next.push(color);
      else next[selectedIndex] = color;
      return next.slice(0,6);
    });
  }

  function savePalette(){
    artStorage.saveProject('colorpicker', paletteName, { colors: palette });
    setSaved(artStorage.listProjectsForApp('colorpicker'));
    setPaletteName('My Palette');
  }

  function exportPalette(p:string[]){
    const txt = p.join('\n');
    navigator.clipboard?.writeText(txt);
    alert('Palette copied to clipboard (HEX lines)');
  }

  function copyHex(){ navigator.clipboard?.writeText(color); }
  function copyRgb(){ const {r,g,b}=hexToRgb(color); navigator.clipboard?.writeText(`rgb(${r}, ${g}, ${b})`); }
  function copyHsl(){ const {r,g,b}=hexToRgb(color); const hsl=rgbToHsl(r,g,b); navigator.clipboard?.writeText(`hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`); }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Color Picker & Palette Generator</h2>
      <div className="flex gap-6 flex-wrap">
        <div>
          {/* color picker control */}
          <div className="mb-2">
            <div className="inline-block">
              {Picker ? (
                <Picker color={color} onChange={(v:any) => onColorChange(v)} />
              ) : (
                <input type="color" value={color} onChange={(e)=> onColorChange(e.target.value)} className="w-20 h-10 p-0 border-0" />
              )}
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center gap-2">HEX: <strong>{color}</strong> <button className="btn ml-2" onClick={copyHex}>Copy</button></div>
            <div className="flex items-center gap-2">RGB: <strong>{(() => { const {r,g,b}=hexToRgb(color); return `rgb(${r}, ${g}, ${b})`; })()}</strong> <button className="btn ml-2" onClick={copyRgb}>Copy</button></div>
            <div className="flex items-center gap-2">HSL: <strong>{(() => { const {r,g,b}=hexToRgb(color); const hsl=rgbToHsl(r,g,b); return `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`; })()}</strong> <button className="btn ml-2" onClick={copyHsl}>Copy</button></div>
            <button className="btn mt-2" onClick={addToPalette}>Add to palette</button>
          </div>
        </div>

        <div className="flex-1 min-w-[220px]">
          <div className="mb-2">Current Palette (select a color to edit)</div>
          <div className="flex gap-2 flex-wrap mb-2">
            {palette.map((c, i)=> (
              <button key={`${c}-${i}`} onClick={() => { setSelectedIndex(i); setColor(c); }} className={`p-1 rounded border ${selectedIndex===i? 'ring-2 ring-indigo-400':''}`} title={c} style={{ background: 'transparent' }}>
                <div style={{ width: 56, height:56, background: c }} />
              </button>
            ))}
          </div>
          <div className="mb-2">
            <input value={paletteName} onChange={(e)=>setPaletteName(e.target.value)} className="px-2 py-1 border rounded mr-2" />
            <button className="btn" onClick={savePalette}>Save Palette</button>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold">Saved Palettes</h3>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {saved.length === 0 && <div className="text-sm opacity-60">No palettes yet</div>}
              {saved.map((s:any)=>(
                <div key={s.id} className="flex flex-col items-center">
                  <div className="palette-tile">
                    {(s.data?.colors||[]).slice(0,6).map((c:string, idx:number)=> (
                      <div key={idx} style={{ background: c }} />
                    ))}
                  </div>
                  <div className="mt-1 text-sm font-medium">{s.name}</div>
                  <button className="btn mt-2" onClick={()=>exportPalette(s.data?.colors||[])}>Export</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
