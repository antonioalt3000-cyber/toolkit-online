'use client';
import { useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<Locale, string>> = {
  upload: { en: 'Upload Image', it: 'Carica Immagine', es: 'Subir Imagen', fr: 'Télécharger Image', de: 'Bild Hochladen', pt: 'Enviar Imagem' },
  quality: { en: 'Quality', it: 'Qualità', es: 'Calidad', fr: 'Qualité', de: 'Qualität', pt: 'Qualidade' },
  download: { en: 'Download Compressed', it: 'Scarica Compressa', es: 'Descargar Comprimida', fr: 'Télécharger Compressée', de: 'Komprimiert Herunterladen', pt: 'Baixar Comprimida' },
  original: { en: 'Original', it: 'Originale', es: 'Original', fr: 'Original', de: 'Original', pt: 'Original' },
  compressed: { en: 'Compressed', it: 'Compressa', es: 'Comprimida', fr: 'Compressée', de: 'Komprimiert', pt: 'Comprimida' },
  size: { en: 'Size', it: 'Dimensione', es: 'Tamaño', fr: 'Taille', de: 'Größe', pt: 'Tamanho' },
  reduction: { en: 'Reduction', it: 'Riduzione', es: 'Reducción', fr: 'Réduction', de: 'Reduktion', pt: 'Redução' },
  dragDrop: { en: 'Drag & drop or click to upload', it: 'Trascina o clicca per caricare', es: 'Arrastra o haz clic para subir', fr: 'Glissez ou cliquez pour télécharger', de: 'Ziehen oder klicken zum Hochladen', pt: 'Arraste ou clique para enviar' },
  format: { en: 'Output Format', it: 'Formato Output', es: 'Formato de Salida', fr: 'Format de Sortie', de: 'Ausgabeformat', pt: 'Formato de Saída' },
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function ImageCompressor() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['image-compressor'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [quality, setQuality] = useState(70);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressedUrl, setCompressedUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [format, setFormat] = useState('image/jpeg');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const compress = useCallback((img: HTMLImageElement, q: number, fmt: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCompressedSize(blob.size);
          const url = URL.createObjectURL(blob);
          setCompressedUrl(url);
        }
      },
      fmt,
      q / 100
    );
  }, []);

  const handleFile = (file: File) => {
    setOriginalSize(file.size);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      compress(img, quality, format);
    };
    img.src = url;
  };

  const handleQualityChange = (q: number) => {
    setQuality(q);
    if (imgRef.current) compress(imgRef.current, q, format);
  };

  const handleFormatChange = (fmt: string) => {
    setFormat(fmt);
    if (imgRef.current) compress(imgRef.current, quality, fmt);
  };

  const reduction = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
        >
          <p className="text-gray-500">{t('dragDrop')}</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        </div>

        {previewUrl && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('quality')}: {quality}%</label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={quality}
                  onChange={(e) => handleQualityChange(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('format')}</label>
                <select
                  value={format}
                  onChange={(e) => handleFormatChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/webp">WebP</option>
                  <option value="image/png">PNG</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500">{t('original')}</p>
                  <p className="font-semibold">{formatBytes(originalSize)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('compressed')}</p>
                  <p className="font-semibold">{formatBytes(compressedSize)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('reduction')}</p>
                  <p className="font-semibold text-blue-600">{reduction}%</p>
                </div>
              </div>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="w-full rounded-lg max-h-64 object-contain" />

            {compressedUrl && (
              <a
                href={compressedUrl}
                download={`compressed.${format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png'}`}
                className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {t('download')}
              </a>
            )}
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
