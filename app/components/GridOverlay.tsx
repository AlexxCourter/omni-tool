"use client";

import React, { useRef, useState, useEffect } from "react";
import artStorage from "../utils/artStorage";

export default function GridOverlay(){
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [grid, setGrid] = useState<'none'|'thirds'|'golden'|'perspective'|'square'>('thirds');
  const [gridColor, setGridColor] = useState<string>('#3aff99'); // default neon green
  const [gridLineWidth, setGridLineWidth] = useState<number>(2);
  const [squareGridFactor, setSquareGridFactor] = useState<number>(1); // 1 = 1/10 of image size
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // grid rectangle in image pixel coordinates
  const [gridRect, setGridRect] = useState<{x:number,y:number,w:number,h:number} | null>(null);
  const resizingRef = useRef<{ active: boolean; startX:number; startY:number; startW:number; startH:number }>({ active:false, startX:0, startY:0, startW:0, startH:0 });

  useEffect(()=>{
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[fileUrl, grid, gridColor, gridRect, gridLineWidth, squareGridFactor]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0];
    if(!f) return;
    const url = URL.createObjectURL(f);
    setFileUrl(url);
    setFileName(f.name);
  }

  function onImageLoad(){
    const img = imgRef.current;
    if(!img) return;
    // initialize gridRect to cover most of the image
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    // start at the top-left corner and cover the full image by default
    setGridRect({ x: 0, y: 0, w: Math.round(w), h: Math.round(h) });
  }

  function draw(){
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if(!img || !canvas) return;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;
    // use natural image pixel sizes when possible
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    canvas.width = w;
    canvas.height = h;
    // scale the canvas element visually to match displayed image size
    try{
      const imgCW = img.clientWidth;
      const imgCH = img.clientHeight;
      canvas.style.width = imgCW + 'px';
      canvas.style.height = imgCH + 'px';
    }catch(e){}
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(!gridRect) return;

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = gridLineWidth;

    const rx = gridRect.x, ry = gridRect.y, rw = gridRect.w, rh = gridRect.h;

    // draw border
    ctx.beginPath();
    ctx.rect(rx, ry, rw, rh);
    ctx.stroke();

  if(grid === 'none') return;

  ctx.beginPath();
    if(grid === 'thirds'){
      ctx.moveTo(rx + rw/3, ry); ctx.lineTo(rx + rw/3, ry + rh);
      ctx.moveTo(rx + 2*rw/3, ry); ctx.lineTo(rx + 2*rw/3, ry + rh);
      ctx.moveTo(rx, ry + rh/3); ctx.lineTo(rx + rw, ry + rh/3);
      ctx.moveTo(rx, ry + 2*rh/3); ctx.lineTo(rx + rw, ry + 2*rh/3);
    } else if(grid === 'golden'){
      ctx.moveTo(rx + rw*0.618, ry); ctx.lineTo(rx + rw*0.618, ry + rh);
      ctx.moveTo(rx, ry + rh*0.618); ctx.lineTo(rx + rw, ry + rh*0.618);
    } else if(grid === 'perspective'){
      // simple perspective: cross lines from corners to center of rect
      const cx = rx + rw/2, cy = ry + rh/2;
      ctx.moveTo(rx, ry + rh); ctx.lineTo(cx, cy);
      ctx.moveTo(rx + rw, ry + rh); ctx.lineTo(cx, cy);
      ctx.moveTo(rx, ry); ctx.lineTo(cx, cy);
      ctx.moveTo(rx + rw, ry); ctx.lineTo(cx, cy);
      // center vertical
      ctx.moveTo(cx, ry); ctx.lineTo(cx, ry + rh);
    } else if(grid === 'square'){
      // Square grid: base square size is 1/10 of the smaller dimension, multiplied by factor
      const baseDimension = Math.min(rw, rh);
      const squareSize = (baseDimension / 10) * squareGridFactor;
      
      // Draw vertical lines
      for (let x = rx + squareSize; x < rx + rw; x += squareSize) {
        ctx.moveTo(x, ry);
        ctx.lineTo(x, ry + rh);
      }
      
      // Draw horizontal lines
      for (let y = ry + squareSize; y < ry + rh; y += squareSize) {
        ctx.moveTo(rx, y);
        ctx.lineTo(rx + rw, y);
      }
    }
    ctx.stroke();
  }

  // Helpers for resizing via a lower-right handle
  function startResize(clientX:number, clientY:number){
    const img = imgRef.current; if(!img || !gridRect) return;
    const rect = img.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;
    resizingRef.current = { active: true, startX: offsetX, startY: offsetY, startW: gridRect.w, startH: gridRect.h };
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', stopResize);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.addEventListener('touchmove', onTouchMove, { passive: false } as any);
    window.addEventListener('touchend', stopResize);
  }

  function onPointerMove(e:MouseEvent){
    if(!resizingRef.current.active) return;
    const img = imgRef.current; if(!img || !gridRect) return;
    const rectImg = img.getBoundingClientRect();
    const offsetX = e.clientX - rectImg.left;
    const offsetY = e.clientY - rectImg.top;
    const dx = offsetX - resizingRef.current.startX;
    const dy = offsetY - resizingRef.current.startY;
    const newW = Math.max(40, Math.round(resizingRef.current.startW + dx));
    const newH = Math.max(40, Math.round(resizingRef.current.startH + dy));
    // clamp to image bounds
    const maxW = (img.naturalWidth || img.width) - (gridRect.x);
    const maxH = (img.naturalHeight || img.height) - (gridRect.y);
    setGridRect({ ...gridRect, w: Math.min(newW, maxW), h: Math.min(newH, maxH) });
  }

  function onTouchMove(ev: TouchEvent){
    if(!resizingRef.current.active) return;
    ev.preventDefault();
    const t = ev.touches[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onPointerMove({ clientX: t.clientX, clientY: t.clientY } as any);
  }

  function stopResize(){
    resizingRef.current.active = false;
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('mouseup', stopResize);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.removeEventListener('touchmove', onTouchMove as any);
    window.removeEventListener('touchend', stopResize);
  }

  async function saveProject(){
    if(!fileUrl) return alert('No image loaded');
    artStorage.saveProject('gridoverlay', 'Grid ' + new Date().toLocaleString(), { image: fileUrl, gridType: grid, gridColor, gridRect, gridLineWidth, squareGridFactor });
    alert('Saved grid project');
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Grid & Composition Overlay</h2>
      <div className="mb-2">
        <label className="btn">
          Choose file
          <input type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
        </label>
        {fileName && <div className="text-sm opacity-60 mt-2">{fileName}</div>}
      </div>
      <div className="flex gap-4">
        <div>
          <div className="mb-2">Grid</div>
          <select value={grid} onChange={(e)=>setGrid(e.target.value as 'none'|'thirds'|'golden'|'perspective'|'square')} className="px-2 py-1 border rounded">
            <option value="thirds">Rule of Thirds</option>
            <option value="golden">Golden Ratio</option>
            <option value="perspective">Perspective</option>
            <option value="square">Square Grid</option>
            <option value="none">None</option>
          </select>
          
          {grid === 'square' && (
            <div className="mt-3">
              <label className="block mb-1">Square size factor: <span className="font-medium">{squareGridFactor}x</span></label>
              <input 
                type="range" 
                min={1} 
                max={10} 
                step={0.5}
                value={squareGridFactor} 
                onChange={(e)=>setSquareGridFactor(parseFloat(e.target.value || '1'))} 
              />
              <div className="text-xs opacity-60 mt-1">
                Base: 1/10 of image × {squareGridFactor}
              </div>
            </div>
          )}
          
          <div className="mt-3">
            <div className="mb-1">Grid color</div>
            <div className="flex gap-2 flex-wrap">
              {['#3aff99','#6bd4ff','#ff6b6b','#ffd166','#000000','#ffffff'].map(c=> (
                <button key={c} onClick={()=>setGridColor(c)} className="w-8 h-8 rounded" style={{ background: c, border: c === '#ffffff' ? '1px solid rgba(0,0,0,0.2)' : undefined }} aria-label={`Set grid color ${c}`} />
              ))}
            </div>
          </div>
          <div className="mt-3">
            <label className="block mb-1">Line width: <span className="font-medium">{gridLineWidth}px</span></label>
            <input type="range" min={1} max={12} value={gridLineWidth} onChange={(e)=>setGridLineWidth(parseInt(e.target.value || '2'))} />
          </div>
          <div className="mt-2">
            <button className="btn" onClick={saveProject}>Save Project</button>
          </div>
        </div>
        <div style={{ maxWidth: 640 }}>
          {fileUrl ? (
            <div ref={containerRef} style={{ position: 'relative' }}>
              <img ref={imgRef} src={fileUrl} alt="upload preview" onLoad={()=>{ onImageLoad(); }} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
              <canvas ref={canvasRef} style={{ position: 'absolute', left:0, top:0, pointerEvents: 'none' }} />
              {/* resize handle: absolute positioned over image; compute position from gridRect and image scaling */}
              {gridRect && imgRef.current && (
                <div
                  onMouseDown={(e)=>{ e.preventDefault(); startResize(e.clientX, e.clientY); }}
                  onTouchStart={(e)=>{ e.preventDefault(); const t=e.touches[0]; startResize(t.clientX, t.clientY); }}
                  style={(() => {
                    try{
                      const img = imgRef.current!;
                      const bounds = img.getBoundingClientRect();
                      // compute scale from natural pixels to displayed size
                      const scaleX = (img.clientWidth) / (img.naturalWidth || img.width);
                      const scaleY = (img.clientHeight) / (img.naturalHeight || img.height);
                      const left = bounds.left + (gridRect.x * scaleX);
                      const top = bounds.top + (gridRect.y * scaleY);
                      const rr = { left: left + gridRect.w * scaleX - bounds.left, top: top + gridRect.h * scaleY - bounds.top };
                      return {
                        position: 'absolute' as const,
                        left: rr.left - 12 + 'px',
                        top: rr.top - 12 + 'px',
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: gridColor,
                        border: '2px solid rgba(255,255,255,0.9)',
                        cursor: 'nwse-resize',
                        zIndex: 40,
                      };
                    }catch(err){
                      return { display: 'none' };
                    }
                  })()}
                />
              )}
            </div>
          ) : (
            <div className="p-4 border rounded">No image loaded</div>
          )}
        </div>
      </div>
    </div>
  );
}
