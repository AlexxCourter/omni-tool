"use client";

import React, { useRef, useState } from "react";
import artStorage from "../utils/artStorage";

export default function ValueChecker(){
  const [fileUrl,setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0];
    if(!f) return;
    const url = URL.createObjectURL(f);
    setFileUrl(url);
    setFileName(f.name);
  }

  // generate grayscale when image loads and keep canvas display size matching the image element
  function generateGrayscale(){
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if(!img || !canvas) return;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;
    // use natural size for pixel-perfect conversion
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0,0,canvas.width,canvas.height);
    for(let i=0;i<data.data.length;i+=4){
      const r = data.data[i], g = data.data[i+1], b = data.data[i+2];
      const lum = 0.299*r + 0.587*g + 0.114*b;
      data.data[i] = data.data[i+1] = data.data[i+2] = lum;
    }
    ctx.putImageData(data,0,0);
    // Don't set explicit width/height - let CSS handle it to maintain aspect ratio
  }

  function save(){
    if(!fileUrl) return alert('No image');
    const dataUrl = canvasRef.current?.toDataURL('image/png') || fileUrl;
    artStorage.saveProject('value', fileName || ('Value ' + new Date().toLocaleString()), { image: fileUrl, grayscale: dataUrl });
    alert('Saved value-check project');
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Value Checker (Grayscale)</h2>
      <div className="mb-3">
        <label className="btn">
          Choose file
          <input type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
        </label>
        {fileName && <div className="text-sm opacity-60 mt-2">{fileName}</div>}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="w-full md:max-w-[540px]">
          <div className="mb-2 font-semibold">Original</div>
          {fileUrl ? (
            <img src={fileUrl} alt="original" ref={imgRef} onLoad={generateGrayscale} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
          ) : (
            <div className="p-4 border rounded">No image selected</div>
          )}
        </div>

        <div className="w-full md:max-w-[540px]">
          <div className="mb-2 font-semibold">Grayscale Preview</div>
          <div style={{ border: '1px solid rgba(255,255,255,0.04)', display: 'inline-block', maxWidth: '100%' }}>
            <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
          </div>
          <div className="mt-3">
            <button className="btn" onClick={save}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
