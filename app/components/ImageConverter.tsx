"use client";

import React, { useState, useRef } from "react";

type ImageFormat = "png" | "jpeg" | "webp";

export default function ImageConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<ImageFormat>("png");
  const [quality, setQuality] = useState<number>(0.9);
  const [converting, setConverting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleConvert = () => {
    if (!selectedFile || !canvasRef.current) return;

    setConverting(true);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image on canvas
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      // Convert to blob
      const mimeType = `image/${outputFormat}`;
      const qualityValue = outputFormat === "png" ? undefined : quality;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            alert("Conversion failed");
            setConverting(false);
            return;
          }

          // Create download link
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          const originalName = selectedFile.name.replace(/\.[^/.]+$/, "");
          a.href = url;
          a.download = `${originalName}.${outputFormat}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setConverting(false);
        },
        mimeType,
        qualityValue
      );
    };

    img.onerror = () => {
      alert("Failed to load image");
      setConverting(false);
    };

    img.src = previewUrl;
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setOutputFormat("png");
    setQuality(0.9);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Image Converter</h1>
        <p className="text-sm opacity-70 mt-2">
          Convert images between PNG, JPEG, and WebP formats
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Upload Section */}
        <div className="border rounded-lg p-6 bg-white/[0.02]">
          <h2 className="text-lg font-semibold mb-4">Upload Image</h2>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer cursor-pointer"
          />
          <p className="text-xs opacity-60 mt-2">
            Supported formats: PNG, JPEG, WebP, GIF, BMP, SVG
          </p>
        </div>

        {/* Preview Section */}
        {previewUrl && (
          <div className="border rounded-lg p-6 bg-white/[0.02]">
            <h2 className="text-lg font-semibold mb-4">Preview</h2>
            <div className="flex justify-center bg-black/20 rounded p-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-96 object-contain"
              />
            </div>
            <div className="mt-4 text-sm opacity-70">
              <p>File: {selectedFile?.name}</p>
              <p>Size: {(selectedFile!.size / 1024).toFixed(2)} KB</p>
              <p>Type: {selectedFile?.type}</p>
            </div>
          </div>
        )}

        {/* Conversion Options */}
        {selectedFile && (
          <div className="border rounded-lg p-6 bg-white/[0.02]">
            <h2 className="text-lg font-semibold mb-4">Conversion Options</h2>
            
            <div className="space-y-4">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Output Format
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setOutputFormat("png")}
                    className={`px-4 py-2 rounded border transition-colors ${
                      outputFormat === "png"
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "border-white/10 hover:bg-white/5"
                    }`}
                  >
                    PNG
                  </button>
                  <button
                    onClick={() => setOutputFormat("jpeg")}
                    className={`px-4 py-2 rounded border transition-colors ${
                      outputFormat === "jpeg"
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "border-white/10 hover:bg-white/5"
                    }`}
                  >
                    JPEG
                  </button>
                  <button
                    onClick={() => setOutputFormat("webp")}
                    className={`px-4 py-2 rounded border transition-colors ${
                      outputFormat === "webp"
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "border-white/10 hover:bg-white/5"
                    }`}
                  >
                    WebP
                  </button>
                </div>
              </div>

              {/* Quality Slider (for JPEG and WebP) */}
              {(outputFormat === "jpeg" || outputFormat === "webp") && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Quality: {Math.round(quality * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs opacity-60 mt-1">
                    Lower quality = smaller file size
                  </p>
                </div>
              )}

              {/* Format Info */}
              <div className="text-xs opacity-60 bg-white/5 p-3 rounded">
                <p className="font-semibold mb-1">Format Notes:</p>
                {outputFormat === "png" && (
                  <p>• PNG: Lossless compression, supports transparency, larger file size</p>
                )}
                {outputFormat === "jpeg" && (
                  <p>• JPEG: Lossy compression, no transparency, smaller file size</p>
                )}
                {outputFormat === "webp" && (
                  <p>• WebP: Modern format, better compression, supports transparency</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {selectedFile && (
          <div className="flex gap-3">
            <button
              onClick={handleConvert}
              disabled={converting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {converting ? "Converting..." : `Convert to ${outputFormat.toUpperCase()}`}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
            >
              Reset
            </button>
          </div>
        )}

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
