'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

const labels: Record<string, Record<string, string>> = {
  screenWidth: { en: 'Screen Width', it: 'Larghezza Schermo', es: 'Ancho de Pantalla', fr: 'Largeur Écran', de: 'Bildschirmbreite', pt: 'Largura da Tela' },
  screenHeight: { en: 'Screen Height', it: 'Altezza Schermo', es: 'Alto de Pantalla', fr: 'Hauteur Écran', de: 'Bildschirmhöhe', pt: 'Altura da Tela' },
  viewportWidth: { en: 'Viewport Width', it: 'Larghezza Viewport', es: 'Ancho del Viewport', fr: 'Largeur Viewport', de: 'Viewport-Breite', pt: 'Largura do Viewport' },
  viewportHeight: { en: 'Viewport Height', it: 'Altezza Viewport', es: 'Alto del Viewport', fr: 'Hauteur Viewport', de: 'Viewport-Höhe', pt: 'Altura do Viewport' },
  pixelRatio: { en: 'Device Pixel Ratio', it: 'Rapporto Pixel', es: 'Proporción de Píxeles', fr: 'Ratio de Pixels', de: 'Pixel-Verhältnis', pt: 'Proporção de Pixels' },
  colorDepth: { en: 'Color Depth', it: 'Profondità Colore', es: 'Profundidad de Color', fr: 'Profondeur Couleur', de: 'Farbtiefe', pt: 'Profundidade de Cor' },
  orientation: { en: 'Orientation', it: 'Orientamento', es: 'Orientación', fr: 'Orientation', de: 'Ausrichtung', pt: 'Orientação' },
  landscape: { en: 'Landscape', it: 'Orizzontale', es: 'Horizontal', fr: 'Paysage', de: 'Querformat', pt: 'Paisagem' },
  portrait: { en: 'Portrait', it: 'Verticale', es: 'Vertical', fr: 'Portrait', de: 'Hochformat', pt: 'Retrato' },
  bits: { en: 'bits', it: 'bit', es: 'bits', fr: 'bits', de: 'Bit', pt: 'bits' },
  pixels: { en: 'px', it: 'px', es: 'px', fr: 'px', de: 'px', pt: 'px' },
  screenResolution: { en: 'Screen Resolution', it: 'Risoluzione Schermo', es: 'Resolución de Pantalla', fr: 'Résolution Écran', de: 'Bildschirmauflösung', pt: 'Resolução da Tela' },
  availableArea: { en: 'Available Screen Area', it: 'Area Disponibile', es: 'Área Disponible', fr: 'Zone Disponible', de: 'Verfügbarer Bereich', pt: 'Área Disponível' },
  touchScreen: { en: 'Touch Screen', it: 'Schermo Touch', es: 'Pantalla Táctil', fr: 'Écran Tactile', de: 'Touchscreen', pt: 'Tela Sensível ao Toque' },
  yes: { en: 'Yes', it: 'Sì', es: 'Sí', fr: 'Oui', de: 'Ja', pt: 'Sim' },
  no: { en: 'No', it: 'No', es: 'No', fr: 'Non', de: 'Nein', pt: 'Não' },
};

export default function ScreenResolution() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['screen-resolution'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [info, setInfo] = useState<Record<string, string>>({});

  useEffect(() => {
    const update = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setInfo({
        screenWidth: `${window.screen.width} ${t('pixels')}`,
        screenHeight: `${window.screen.height} ${t('pixels')}`,
        screenResolution: `${window.screen.width} × ${window.screen.height}`,
        availableArea: `${window.screen.availWidth} × ${window.screen.availHeight}`,
        viewportWidth: `${window.innerWidth} ${t('pixels')}`,
        viewportHeight: `${window.innerHeight} ${t('pixels')}`,
        pixelRatio: `${window.devicePixelRatio}`,
        colorDepth: `${window.screen.colorDepth} ${t('bits')}`,
        orientation: isLandscape ? t('landscape') : t('portrait'),
        touchScreen: hasTouch ? t('yes') : t('no'),
      });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const displayItems = [
    'screenResolution', 'availableArea', 'viewportWidth', 'viewportHeight',
    'pixelRatio', 'colorDepth', 'orientation', 'touchScreen',
  ];

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
      <p className="text-gray-600 mb-6">{toolT.description}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-3">
          {displayItems.map((key) => (
            <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">{t(key)}</span>
              <span className="font-bold text-gray-900">{info[key] || '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
