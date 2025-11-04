"use client";

import React, { useRef } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import artStorage from "../utils/artStorage";

export default function SketchPad(){
  const ref = useRef<any>(null);
  const [color, setColor] = React.useState('#0b6cff');
  const [palette, setPalette] = React.useState<string[]>(['#0b6cff','#ff6b6b','#3aff99','#ffd166']);
  const [savedSketches, setSavedSketches] = React.useState<any[]>([]);
  const [savedPalettes, setSavedPalettes] = React.useState<any[]>([]);
  const [selectedPaletteId, setSelectedPaletteId] = React.useState<string | null>(null);
  const [selectedColorIndex, setSelectedColorIndex] = React.useState<number>(0);

  React.useEffect(()=>{
    setSavedSketches(artStorage.listProjectsForApp('sketch'));
    setSavedPalettes(artStorage.listProjectsForApp('colorpicker'));
  },[]);

  async function saveImage(){
    try{
      const data = await ref.current.exportImage('png');
      artStorage.saveProject('sketch', 'Sketch ' + new Date().toLocaleString(), { dataUrl: data });
      setSavedSketches(artStorage.listProjectsForApp('sketch'));
    }catch(e){
      console.error(e);
      alert('Failed to save sketch');
    }
  }

  function clear(){
    ref.current.clearCanvas();
  }

  function applySavedPalette(id?: string){
    if(!id){
      setSelectedPaletteId(null);
      return;
    }
    const p = artStorage.getProject('colorpicker', id);
    if(p?.data?.colors){
      setPalette(p.data.colors.slice(0,8));
      setSelectedPaletteId(id);
      setSelectedColorIndex(0);
      setColor(p.data.colors[0] || '#000');
    }
  }

  function selectPaletteColor(idx:number){
    setSelectedColorIndex(idx);
    setColor(palette[idx] || '#000');
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Quick Sketch Pad</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="border rounded p-2 sketch-container">
            <ReactSketchCanvas ref={ref} strokeWidth={4} strokeColor={color} width="100%" height="100%" style={{ background: 'transparent' }} />
          </div>
          <div className="mt-2 flex gap-2">
            <button className="btn" onClick={saveImage}>Save Sketch</button>
            <button className="btn" onClick={clear}>Clear</button>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Saved Sketches</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {savedSketches.map(s => (
                <div key={s.id} className="border rounded overflow-hidden">
                  <img src={s.data?.dataUrl} alt={s.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              ))}
              {savedSketches.length === 0 && <div className="text-sm opacity-60">No saved sketches</div>}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3">
            <div className="font-semibold">Color</div>
            <input type="color" value={color} onChange={(e)=>setColor(e.target.value)} className="w-full h-10" />
          </div>

          <div className="mb-3">
            <div className="font-semibold">Palette</div>
            <div className="flex gap-2 flex-wrap mt-2">
              {palette.map((c, i) => (
                <button key={i} onClick={() => selectPaletteColor(i)} className={`w-10 h-10 rounded ${selectedColorIndex===i? 'ring-2 ring-indigo-400':''}`} style={{ background: c }} aria-label={`Palette color ${i}`} />
              ))}
            </div>
            <div className="mt-2">
              <select value={selectedPaletteId || ''} onChange={(e)=> applySavedPalette(e.target.value || undefined)} className="px-2 py-1 border rounded w-full">
                <option value="">Use saved palette...</option>
                {savedPalettes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
