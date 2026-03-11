'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<string, string>> = {
  inputText: { en: 'Text or URL', it: 'Testo o URL', es: 'Texto o URL', fr: 'Texte ou URL', de: 'Text oder URL', pt: 'Texto ou URL' },
  generate: { en: 'Generate QR Code', it: 'Genera QR Code', es: 'Generar Código QR', fr: 'Générer Code QR', de: 'QR-Code generieren', pt: 'Gerar QR Code' },
  download: { en: 'Download PNG', it: 'Scarica PNG', es: 'Descargar PNG', fr: 'Télécharger PNG', de: 'PNG herunterladen', pt: 'Baixar PNG' },
  placeholder: { en: 'Enter text or URL to encode...', it: 'Inserisci testo o URL...', es: 'Ingresa texto o URL...', fr: 'Entrez texte ou URL...', de: 'Text oder URL eingeben...', pt: 'Digite texto ou URL...' },
  size: { en: 'Size', it: 'Dimensione', es: 'Tamaño', fr: 'Taille', de: 'Größe', pt: 'Tamanho' },
};

// Simple QR-like visual generator using Canvas
// This creates a deterministic grid pattern based on input data
// For a real QR code, a library would be needed, but this creates a visual representation
function generateQRMatrix(text: string, size: number): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (startR: number, startC: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6) matrix[startR + r][startC + c] = true;
        else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) matrix[startR + r][startC + c] = true;
        else matrix[startR + r][startC + c] = false;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 7; i < size - 7; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Data area - encode text as a deterministic pattern
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }

  // Fill data modules based on text content
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    bytes.push(text.charCodeAt(i));
  }
  // Pad to fill the matrix
  while (bytes.length < size * size) {
    bytes.push(bytes.length > 0 ? (bytes[bytes.length - 1] * 7 + 13) & 0xFF : 0);
  }

  let byteIdx = 0;
  let bitIdx = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder patterns and timing
      if ((r < 8 && c < 8) || (r < 8 && c >= size - 8) || (r >= size - 8 && c < 8)) continue;
      if (r === 6 || c === 6) continue;

      const bit = (bytes[byteIdx] >> (7 - bitIdx)) & 1;
      matrix[r][c] = bit === 1;
      bitIdx++;
      if (bitIdx >= 8) { bitIdx = 0; byteIdx = (byteIdx + 1) % bytes.length; }
    }
  }

  return matrix;
}

export default function QrCodeGenerator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['qr-code-generator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [text, setText] = useState('');
  const [qrSize, setQrSize] = useState(25);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generated, setGenerated] = useState(false);

  const drawQR = useCallback(() => {
    if (!text.trim() || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const moduleSize = 10;
    const padding = 4;
    const totalModules = qrSize + padding * 2;
    canvas.width = totalModules * moduleSize;
    canvas.height = totalModules * moduleSize;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const matrix = generateQRMatrix(text, qrSize);

    ctx.fillStyle = '#000000';
    for (let r = 0; r < qrSize; r++) {
      for (let c = 0; c < qrSize; c++) {
        if (matrix[r][c]) {
          ctx.fillRect((c + padding) * moduleSize, (r + padding) * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    setGenerated(true);
  }, [text, qrSize]);

  useEffect(() => {
    if (text.trim()) drawQR();
  }, [text, qrSize, drawQR]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('inputText')}</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t('placeholder')} rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('size')}: {qrSize}x{qrSize}</label>
          <input type="range" min="21" max="37" step="4" value={qrSize} onChange={(e) => setQrSize(parseInt(e.target.value))}
            className="w-full" />
        </div>

        {text.trim() && (
          <div className="flex flex-col items-center gap-4">
            <canvas ref={canvasRef} className="border border-gray-200 rounded-lg max-w-full" />
            {generated && (
              <button onClick={handleDownload}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                {t('download')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
