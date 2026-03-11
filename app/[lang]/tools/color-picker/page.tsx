'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export default function ColorPicker() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['color-picker'][lang];
  const [color, setColor] = useState('#3b82f6');
  const [copied, setCopied] = useState('');

  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const formats = [
    { label: 'HEX', value: color.toUpperCase() },
    { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
  ];

  const copy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(val);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex gap-4 items-center">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-20 h-20 rounded-lg cursor-pointer border-0" />
          <div className="w-full h-20 rounded-lg" style={{ backgroundColor: color }} />
        </div>

        <div className="space-y-2">
          {formats.map((f) => (
            <div key={f.label} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
              <span className="text-sm font-medium text-gray-500 w-10">{f.label}</span>
              <code className="flex-1 font-mono text-gray-900">{f.value}</code>
              <button onClick={() => copy(f.value)} className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                {copied === f.value ? '✓' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
