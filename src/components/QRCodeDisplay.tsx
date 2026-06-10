import { useState, useRef } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Download, Check, RefreshCw } from "lucide-react";

interface QRCodeDisplayProps {
  url: string;
}

export default function QRCodeDisplay({ url }: QRCodeDisplayProps) {
  const [fgColor, setFgColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#000000");
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  const downloadPNG = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `scissor-qr-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadSVG = () => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current.querySelector("svg");
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `scissor-qr-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetColors = () => {
    setFgColor("#ffffff");
    setBgColor("#000000");
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6 glass-card rounded-2xl border border-slate-800">
      <h3 className="text-lg font-bold text-white tracking-wide">Customize QR Code</h3>

      {/* Hidden SVG for downloading, visible Canvas for screen */}
      <div className="relative p-4 rounded-xl bg-white/5 border border-white/10 shadow-inner flex items-center justify-center">
        {/* Render canvas for UI and PNG download */}
        <div ref={canvasRef}>
          <QRCodeCanvas
            value={url}
            size={180}
            bgColor={bgColor}
            fgColor={fgColor}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* Render SVG off-screen or hidden for SVG download */}
        <div ref={svgRef} className="hidden">
          <QRCodeSVG
            value={url}
            size={256}
            bgColor={bgColor}
            fgColor={fgColor}
            level="H"
            includeMargin={true}
          />
        </div>
      </div>

      {/* Color Customizers */}
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">Foreground</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded-md border-0 bg-transparent"
              title="Foreground Color"
            />
            <span className="text-xs font-mono text-slate-300 uppercase">{fgColor}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">Background</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded-md border-0 bg-transparent"
              title="Background Color"
            />
            <span className="text-xs font-mono text-slate-300 uppercase">{bgColor}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
        <button
          onClick={downloadPNG}
          className="flex-1 flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-2 px-3 text-sm font-semibold transition active:scale-95 border border-slate-700"
        >
          <Download className="h-4 w-4" />
          <span>PNG</span>
        </button>

        <button
          onClick={downloadSVG}
          className="flex-1 flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-2 px-3 text-sm font-semibold transition active:scale-95 border border-slate-700"
        >
          <Download className="h-4 w-4" />
          <span>SVG</span>
        </button>

        <button
          onClick={resetColors}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95"
          title="Reset Colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
