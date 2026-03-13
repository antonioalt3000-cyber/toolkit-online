'use client';
import { useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type Unit = 'px' | 'cm' | 'in';
interface Measurement { w: number; h: number; d: number; unit: Unit }

const PX_PER_INCH = 96;
const PX_PER_CM = PX_PER_INCH / 2.54;

function convertFromPx(px: number, unit: Unit): number {
  if (unit === 'cm') return px / PX_PER_CM;
  if (unit === 'in') return px / PX_PER_INCH;
  return px;
}

function fmtVal(v: number, unit: Unit): string {
  if (unit === 'px') return Math.round(v).toString();
  return v.toFixed(2);
}

function unitSuffix(unit: Unit): string {
  if (unit === 'cm') return 'cm';
  if (unit === 'in') return 'in';
  return 'px';
}

const PRESETS = [
  { name: 'Favicon', w: 16, h: 16 },
  { name: 'App Icon', w: 64, h: 64 },
  { name: 'Thumbnail', w: 150, h: 150 },
  { name: 'Avatar', w: 256, h: 256 },
  { name: 'Banner', w: 728, h: 90 },
  { name: 'HD 720p', w: 1280, h: 720 },
  { name: 'Full HD', w: 1920, h: 1080 },
  { name: 'OG Image', w: 1200, h: 630 },
];

export default function PixelRuler() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['pixel-ruler'][lang];

  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [endPoint, setEndPoint] = useState<{ x: number; y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [manualW, setManualW] = useState('');
  const [manualH, setManualH] = useState('');
  const [unit, setUnit] = useState<Unit>('px');
  const [history, setHistory] = useState<Measurement[]>([]);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const labels = {
    startMeasuring: { en: 'Click and drag to measure', it: 'Clicca e trascina per misurare', es: 'Haz clic y arrastra para medir', fr: 'Cliquez et glissez pour mesurer', de: 'Klicken und ziehen zum Messen', pt: 'Clique e arraste para medir' },
    width: { en: 'Width', it: 'Larghezza', es: 'Ancho', fr: 'Largeur', de: 'Breite', pt: 'Largura' },
    height: { en: 'Height', it: 'Altezza', es: 'Alto', fr: 'Hauteur', de: 'Höhe', pt: 'Altura' },
    diagonal: { en: 'Diagonal', it: 'Diagonale', es: 'Diagonal', fr: 'Diagonale', de: 'Diagonale', pt: 'Diagonal' },
    manualMode: { en: 'Manual Pixel Calculator', it: 'Calcolatore Pixel Manuale', es: 'Calculadora de Píxeles Manual', fr: 'Calculateur de Pixels Manuel', de: 'Manueller Pixel-Rechner', pt: 'Calculadora de Pixels Manual' },
    reset: { en: 'Reset', it: 'Resetta', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
    measureArea: { en: 'Measurement Area', it: 'Area di Misurazione', es: 'Área de Medición', fr: 'Zone de Mesure', de: 'Messbereich', pt: 'Área de Medição' },
    copyResult: { en: 'Copy Result', it: 'Copia Risultato', es: 'Copiar Resultado', fr: 'Copier le Résultat', de: 'Ergebnis Kopieren', pt: 'Copiar Resultado' },
    copiedMsg: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    history: { en: 'History', it: 'Cronologia', es: 'Historial', fr: 'Historique', de: 'Verlauf', pt: 'Histórico' },
    clearHistory: { en: 'Clear', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Löschen', pt: 'Limpar' },
    noHistory: { en: 'No measurements yet', it: 'Nessuna misurazione', es: 'Sin mediciones aún', fr: 'Aucune mesure', de: 'Noch keine Messungen', pt: 'Nenhuma medição ainda' },
    unitLabel: { en: 'Unit', it: 'Unità', es: 'Unidad', fr: 'Unité', de: 'Einheit', pt: 'Unidade' },
    presets: { en: 'Preset Sizes', it: 'Dimensioni Predefinite', es: 'Tamaños Predefinidos', fr: 'Tailles Prédéfinies', de: 'Voreingestellte Größen', pt: 'Tamanhos Predefinidos' },
    currentMeasurement: { en: 'Current Measurement', it: 'Misurazione Attuale', es: 'Medición Actual', fr: 'Mesure Actuelle', de: 'Aktuelle Messung', pt: 'Medição Atual' },
  } as Record<string, Record<Locale, string>>;

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setStartPoint({ x, y });
    setEndPoint({ x, y });
    setIsDrawing(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setEndPoint({ x, y });
  }, [isDrawing]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing && startPoint && endPoint) {
      const w = Math.abs(endPoint.x - startPoint.x);
      const h = Math.abs(endPoint.y - startPoint.y);
      if (w + h > 0) {
        const d = Math.sqrt(w * w + h * h);
        setHistory(prev => [{ w, h, d, unit: 'px' as Unit }, ...prev].slice(0, 5));
      }
    }
    setIsDrawing(false);
  }, [isDrawing, startPoint, endPoint]);

  const dx = startPoint && endPoint ? Math.abs(endPoint.x - startPoint.x) : 0;
  const dy = startPoint && endPoint ? Math.abs(endPoint.y - startPoint.y) : 0;
  const diag = Math.sqrt(dx * dx + dy * dy);

  const dxDisplay = convertFromPx(dx, unit);
  const dyDisplay = convertFromPx(dy, unit);
  const diagDisplay = convertFromPx(diag, unit);

  const mW = parseFloat(manualW) || 0;
  const mH = parseFloat(manualH) || 0;
  const manualDiag = Math.sqrt(mW * mW + mH * mH);
  const manualDiagDisplay = convertFromPx(manualDiag, unit);
  const mWDisplay = convertFromPx(mW, unit);
  const mHDisplay = convertFromPx(mH, unit);

  const selectionStyle = startPoint && endPoint ? {
    left: Math.min(startPoint.x, endPoint.x),
    top: Math.min(startPoint.y, endPoint.y),
    width: dx,
    height: dy,
  } : null;

  const hasMeasurement = startPoint && endPoint && !isDrawing && dx + dy > 0;

  const handleCopy = useCallback(() => {
    const s = unitSuffix(unit);
    const text = `${fmtVal(dxDisplay, unit)} x ${fmtVal(dyDisplay, unit)} ${s} (diagonal: ${fmtVal(diagDisplay, unit)} ${s})`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [dxDisplay, dyDisplay, diagDisplay, unit]);

  const handleReset = () => {
    setStartPoint(null);
    setEndPoint(null);
  };

  const handlePreset = (w: number, h: number) => {
    setManualW(w.toString());
    setManualH(h.toString());
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Pixel Ruler — Measure Pixel Distances On Screen Online',
      paragraphs: [
        'A pixel ruler is an essential tool for web designers, UI developers, and digital artists who need to measure exact pixel distances on their screens. Whether you are aligning elements in a layout, checking spacing between components, or verifying dimensions of design mockups, precise pixel measurement saves time and reduces errors.',
        'Our online pixel ruler provides two ways to measure: an interactive canvas where you click and drag to measure any rectangular area, and a manual calculator where you enter width and height values to compute the diagonal distance. The interactive mode shows real-time dimensions as you drag, making it easy to measure elements directly on screen.',
        'The diagonal measurement uses the Pythagorean theorem: diagonal = sqrt(width^2 + height^2). This is particularly useful when you need to know the true distance between two points that are not aligned horizontally or vertically. Designers often use diagonal measurements to ensure consistent visual spacing across different screen orientations.',
        'Unlike browser extensions or downloadable software, our pixel ruler works entirely in the browser with no installation required. It is responsive, works on any screen resolution, and provides instant results. Bookmark this tool for quick access whenever you need precise pixel measurements during your design workflow.',
      ],
      faq: [
        { q: 'How do I measure pixels on screen?', a: 'Click and drag within the measurement area to draw a rectangle. The tool instantly shows the width, height, and diagonal distance in pixels. You can also use the manual calculator by entering width and height values directly.' },
        { q: 'What is the diagonal pixel measurement?', a: 'The diagonal is the straight-line distance between two opposite corners of a rectangle, calculated using the Pythagorean theorem: diagonal = sqrt(width^2 + height^2). This gives you the true pixel distance between any two points.' },
        { q: 'Can I measure elements on a webpage?', a: 'The pixel ruler measures distances within its own canvas area. To measure webpage elements, you can compare their known dimensions or use the manual calculator. For more advanced webpage measurement, consider browser developer tools (F12).' },
        { q: 'Is the pixel measurement accurate on all screens?', a: 'Yes, the tool measures in CSS pixels, which are consistent across devices. However, on high-DPI (Retina) displays, one CSS pixel may correspond to multiple physical pixels. The measurements are always accurate in terms of CSS layout pixels.' },
      ],
    },
    it: {
      title: 'Righello Pixel Gratuito — Misura Distanze in Pixel sullo Schermo',
      paragraphs: [
        'Un righello pixel è uno strumento essenziale per web designer, sviluppatori UI e artisti digitali che devono misurare distanze esatte in pixel sui loro schermi. Che tu stia allineando elementi in un layout, verificando la spaziatura tra componenti o controllando le dimensioni di un mockup, la misurazione precisa dei pixel fa risparmiare tempo e riduce gli errori.',
        'Il nostro righello pixel online offre due modi per misurare: un\'area interattiva dove clicchi e trascini per misurare qualsiasi area rettangolare, e un calcolatore manuale dove inserisci larghezza e altezza per calcolare la distanza diagonale. La modalità interattiva mostra le dimensioni in tempo reale mentre trascini.',
        'La misurazione diagonale usa il teorema di Pitagora: diagonale = sqrt(larghezza^2 + altezza^2). Questo è particolarmente utile quando devi conoscere la vera distanza tra due punti non allineati orizzontalmente o verticalmente.',
        'A differenza delle estensioni browser o del software scaricabile, il nostro righello pixel funziona interamente nel browser senza installazione. È responsive, funziona su qualsiasi risoluzione e fornisce risultati istantanei.',
      ],
      faq: [
        { q: 'Come misuro i pixel sullo schermo?', a: 'Clicca e trascina nell\'area di misurazione per disegnare un rettangolo. Lo strumento mostra istantaneamente larghezza, altezza e distanza diagonale in pixel. Puoi anche usare il calcolatore manuale inserendo i valori direttamente.' },
        { q: 'Cos\'è la misurazione diagonale in pixel?', a: 'La diagonale è la distanza in linea retta tra due angoli opposti di un rettangolo, calcolata con il teorema di Pitagora: diagonale = sqrt(larghezza^2 + altezza^2).' },
        { q: 'Posso misurare elementi su una pagina web?', a: 'Il righello pixel misura le distanze nella propria area. Per misurare elementi di pagine web, puoi confrontare le dimensioni note o usare il calcolatore manuale. Per misurazioni avanzate, usa gli strumenti sviluppatore del browser (F12).' },
        { q: 'La misurazione dei pixel è accurata su tutti gli schermi?', a: 'Sì, lo strumento misura in pixel CSS, che sono coerenti tra i dispositivi. Su display ad alta densità (Retina), un pixel CSS può corrispondere a più pixel fisici, ma le misurazioni sono sempre accurate in termini di pixel CSS.' },
      ],
    },
    es: {
      title: 'Regla de Píxeles Gratis — Mide Distancias en Píxeles en Pantalla',
      paragraphs: [
        'Una regla de píxeles es una herramienta esencial para diseñadores web, desarrolladores de UI y artistas digitales que necesitan medir distancias exactas en píxeles en sus pantallas. Ya sea que estés alineando elementos, verificando espaciado o comprobando dimensiones de maquetas, la medición precisa ahorra tiempo y reduce errores.',
        'Nuestra regla de píxeles online ofrece dos formas de medir: un área interactiva donde haces clic y arrastras para medir cualquier área rectangular, y una calculadora manual donde introduces ancho y alto para calcular la distancia diagonal. El modo interactivo muestra las dimensiones en tiempo real.',
        'La medición diagonal usa el teorema de Pitágoras: diagonal = sqrt(ancho^2 + alto^2). Esto es útil cuando necesitas la distancia real entre dos puntos no alineados horizontal o verticalmente.',
        'A diferencia de extensiones o software descargable, nuestra regla funciona directamente en el navegador sin instalación. Es responsiva, funciona en cualquier resolución y proporciona resultados instantáneos.',
      ],
      faq: [
        { q: '¿Cómo mido píxeles en pantalla?', a: 'Haz clic y arrastra en el área de medición para dibujar un rectángulo. La herramienta muestra instantáneamente ancho, alto y distancia diagonal en píxeles. También puedes usar la calculadora manual ingresando valores directamente.' },
        { q: '¿Qué es la medición diagonal de píxeles?', a: 'La diagonal es la distancia en línea recta entre dos esquinas opuestas de un rectángulo, calculada con el teorema de Pitágoras: diagonal = sqrt(ancho^2 + alto^2).' },
        { q: '¿Puedo medir elementos en una página web?', a: 'La regla mide distancias dentro de su propia área. Para medir elementos web, usa la calculadora manual o las herramientas de desarrollador del navegador (F12).' },
        { q: '¿La medición es precisa en todas las pantallas?', a: 'Sí, la herramienta mide en píxeles CSS, que son consistentes entre dispositivos. En pantallas de alta densidad (Retina), un píxel CSS puede corresponder a varios píxeles físicos.' },
      ],
    },
    fr: {
      title: 'Règle de Pixels Gratuite — Mesurez les Distances en Pixels à l\'Écran',
      paragraphs: [
        'Une règle de pixels est un outil essentiel pour les designers web, développeurs UI et artistes numériques qui doivent mesurer des distances exactes en pixels sur leurs écrans. Que vous aligniez des éléments, vérifiez l\'espacement ou contrôliez les dimensions d\'une maquette, la mesure précise fait gagner du temps.',
        'Notre règle de pixels en ligne offre deux modes de mesure : une zone interactive où vous cliquez et glissez pour mesurer n\'importe quelle zone rectangulaire, et un calculateur manuel où vous entrez largeur et hauteur pour calculer la distance diagonale. Le mode interactif affiche les dimensions en temps réel.',
        'La mesure diagonale utilise le théorème de Pythagore : diagonale = sqrt(largeur^2 + hauteur^2). C\'est particulièrement utile lorsque vous devez connaître la vraie distance entre deux points non alignés horizontalement ou verticalement.',
        'Contrairement aux extensions ou logiciels téléchargeables, notre règle fonctionne entièrement dans le navigateur sans installation. Elle est responsive et fournit des résultats instantanés.',
      ],
      faq: [
        { q: 'Comment mesurer des pixels à l\'écran ?', a: 'Cliquez et glissez dans la zone de mesure pour dessiner un rectangle. L\'outil affiche instantanément largeur, hauteur et distance diagonale en pixels. Vous pouvez aussi utiliser le calculateur manuel.' },
        { q: 'Qu\'est-ce que la mesure diagonale en pixels ?', a: 'La diagonale est la distance en ligne droite entre deux coins opposés d\'un rectangle, calculée avec le théorème de Pythagore : diagonale = sqrt(largeur^2 + hauteur^2).' },
        { q: 'Puis-je mesurer des éléments d\'une page web ?', a: 'La règle mesure les distances dans sa propre zone. Pour mesurer des éléments web, utilisez le calculateur manuel ou les outils développeur du navigateur (F12).' },
        { q: 'La mesure est-elle précise sur tous les écrans ?', a: 'Oui, l\'outil mesure en pixels CSS, cohérents entre les appareils. Sur les écrans haute densité (Retina), un pixel CSS peut correspondre à plusieurs pixels physiques.' },
      ],
    },
    de: {
      title: 'Kostenloses Pixel-Lineal — Pixelabstände auf dem Bildschirm Messen',
      paragraphs: [
        'Ein Pixel-Lineal ist ein unverzichtbares Werkzeug für Webdesigner, UI-Entwickler und digitale Künstler, die genaue Pixelabstände auf ihren Bildschirmen messen müssen. Ob Sie Elemente ausrichten, Abstände überprüfen oder Abmessungen von Mockups kontrollieren — präzise Pixelmessung spart Zeit und reduziert Fehler.',
        'Unser Online-Pixel-Lineal bietet zwei Messmethoden: einen interaktiven Bereich, in dem Sie klicken und ziehen, um beliebige rechteckige Bereiche zu messen, und einen manuellen Rechner, in dem Sie Breite und Höhe eingeben, um die Diagonale zu berechnen. Der interaktive Modus zeigt Abmessungen in Echtzeit.',
        'Die Diagonalmessung verwendet den Satz des Pythagoras: Diagonale = sqrt(Breite^2 + Höhe^2). Dies ist besonders nützlich, wenn Sie den wahren Abstand zwischen zwei nicht horizontal oder vertikal ausgerichteten Punkten kennen müssen.',
        'Im Gegensatz zu Browser-Erweiterungen oder herunterladbarer Software funktioniert unser Pixel-Lineal vollständig im Browser ohne Installation. Es ist responsiv und liefert sofortige Ergebnisse.',
      ],
      faq: [
        { q: 'Wie messe ich Pixel auf dem Bildschirm?', a: 'Klicken und ziehen Sie im Messbereich, um ein Rechteck zu zeichnen. Das Tool zeigt sofort Breite, Höhe und Diagonalabstand in Pixeln an. Sie können auch den manuellen Rechner verwenden.' },
        { q: 'Was ist die diagonale Pixelmessung?', a: 'Die Diagonale ist der gerade Abstand zwischen zwei gegenüberliegenden Ecken eines Rechtecks, berechnet mit dem Satz des Pythagoras: Diagonale = sqrt(Breite^2 + Höhe^2).' },
        { q: 'Kann ich Elemente auf einer Webseite messen?', a: 'Das Pixel-Lineal misst Abstände in seinem eigenen Bereich. Für Webseiten-Elemente verwenden Sie den manuellen Rechner oder die Browser-Entwicklertools (F12).' },
        { q: 'Ist die Messung auf allen Bildschirmen genau?', a: 'Ja, das Tool misst in CSS-Pixeln, die geräteübergreifend konsistent sind. Auf hochauflösenden (Retina) Displays kann ein CSS-Pixel mehreren physischen Pixeln entsprechen.' },
      ],
    },
    pt: {
      title: 'Régua de Pixels Grátis — Meça Distâncias em Pixels na Tela',
      paragraphs: [
        'Uma régua de pixels é uma ferramenta essencial para web designers, desenvolvedores de UI e artistas digitais que precisam medir distâncias exatas em pixels em suas telas. Seja alinhando elementos, verificando espaçamento ou conferindo dimensões de mockups, a medição precisa economiza tempo e reduz erros.',
        'Nossa régua de pixels online oferece duas formas de medir: uma área interativa onde você clica e arrasta para medir qualquer área retangular, e uma calculadora manual onde você insere largura e altura para calcular a distância diagonal. O modo interativo mostra as dimensões em tempo real.',
        'A medição diagonal usa o teorema de Pitágoras: diagonal = sqrt(largura^2 + altura^2). Isso é útil quando você precisa da distância real entre dois pontos não alinhados horizontal ou verticalmente.',
        'Diferente de extensões ou software para download, nossa régua funciona diretamente no navegador sem instalação. É responsiva, funciona em qualquer resolução e fornece resultados instantâneos.',
      ],
      faq: [
        { q: 'Como meço pixels na tela?', a: 'Clique e arraste na área de medição para desenhar um retângulo. A ferramenta mostra instantaneamente largura, altura e distância diagonal em pixels. Você também pode usar a calculadora manual.' },
        { q: 'O que é a medição diagonal de pixels?', a: 'A diagonal é a distância em linha reta entre dois cantos opostos de um retângulo, calculada com o teorema de Pitágoras: diagonal = sqrt(largura^2 + altura^2).' },
        { q: 'Posso medir elementos em uma página web?', a: 'A régua mede distâncias na sua própria área. Para medir elementos web, use a calculadora manual ou as ferramentas de desenvolvedor do navegador (F12).' },
        { q: 'A medição é precisa em todas as telas?', a: 'Sim, a ferramenta mede em pixels CSS, que são consistentes entre dispositivos. Em telas de alta densidade (Retina), um pixel CSS pode corresponder a vários pixels físicos.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const s = unitSuffix(unit);

  return (
    <ToolPageWrapper toolSlug="pixel-ruler" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Unit Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-700">{labels.unitLabel[lang]}:</span>
          {(['px', 'cm', 'in'] as Unit[]).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
                unit === u
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {u}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">{labels.measureArea[lang]}</h2>
          <p className="text-sm text-gray-500">{labels.startMeasuring[lang]}</p>

          <div
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="relative w-full h-64 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair select-none overflow-hidden"
            style={{ touchAction: 'none' }}
          >
            {/* Grid lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {selectionStyle && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-30"
                style={{
                  left: selectionStyle.left,
                  top: selectionStyle.top,
                  width: selectionStyle.width,
                  height: selectionStyle.height,
                }}
              >
                <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-mono bg-blue-500 text-white px-1 rounded">
                  {dx}px
                </span>
                <span className="absolute -right-10 top-1/2 transform -translate-y-1/2 text-xs font-mono bg-blue-500 text-white px-1 rounded">
                  {dy}px
                </span>
              </div>
            )}
          </div>

          {/* Result Cards */}
          {hasMeasurement && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{labels.currentMeasurement[lang]}</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center">
                  <div className="text-xs text-blue-600 font-medium">{labels.width[lang]}</div>
                  <div className="text-xl font-bold text-gray-900">{fmtVal(dxDisplay, unit)}</div>
                  <div className="text-xs text-blue-400">{s}</div>
                </div>
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center">
                  <div className="text-xs text-green-600 font-medium">{labels.height[lang]}</div>
                  <div className="text-xl font-bold text-gray-900">{fmtVal(dyDisplay, unit)}</div>
                  <div className="text-xs text-green-400">{s}</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg text-center">
                  <div className="text-xs text-purple-600 font-medium">{labels.diagonal[lang]}</div>
                  <div className="text-xl font-bold text-gray-900">{fmtVal(diagDisplay, unit)}</div>
                  <div className="text-xs text-purple-400">{s}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {labels.reset[lang]}
            </button>
            {hasMeasurement && (
              <button
                onClick={handleCopy}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? labels.copiedMsg[lang] : labels.copyResult[lang]}
              </button>
            )}
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">{labels.history[lang]}</h2>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                {labels.clearHistory[lang]}
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400">{labels.noHistory[lang]}</p>
          ) : (
            <div className="space-y-2">
              {history.map((m, i) => {
                const hw = convertFromPx(m.w, unit);
                const hh = convertFromPx(m.h, unit);
                const hd = convertFromPx(m.d, unit);
                return (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2 text-sm">
                    <span className="text-gray-500 font-mono">#{history.length - i}</span>
                    <span className="text-gray-800 font-medium">
                      {fmtVal(hw, unit)} x {fmtVal(hh, unit)} {s}
                    </span>
                    <span className="text-purple-600 font-medium">
                      diag: {fmtVal(hd, unit)} {s}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Preset Sizes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3 mt-6">
          <h2 className="text-lg font-semibold text-gray-800">{labels.presets[lang]}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePreset(preset.w, preset.h)}
                className="px-3 py-2 text-sm bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors text-left"
              >
                <div className="font-medium text-gray-800">{preset.name}</div>
                <div className="text-xs text-gray-500">{preset.w} x {preset.h} px</div>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Calculator */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 mt-6">
          <h2 className="text-lg font-semibold text-gray-800">{labels.manualMode[lang]}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.width[lang]} (px)</label>
              <input type="number" value={manualW} onChange={(e) => setManualW(e.target.value)} placeholder="1920" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.height[lang]} (px)</label>
              <input type="number" value={manualH} onChange={(e) => setManualH(e.target.value)} placeholder="1080" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {(mW > 0 || mH > 0) && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center">
                <div className="text-xs text-blue-600 font-medium">{labels.width[lang]}</div>
                <div className="text-xl font-bold text-gray-900">{fmtVal(mWDisplay, unit)}</div>
                <div className="text-xs text-blue-400">{s}</div>
              </div>
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center">
                <div className="text-xs text-green-600 font-medium">{labels.height[lang]}</div>
                <div className="text-xl font-bold text-gray-900">{fmtVal(mHDisplay, unit)}</div>
                <div className="text-xs text-green-400">{s}</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg text-center">
                <div className="text-xs text-purple-600 font-medium">{labels.diagonal[lang]}</div>
                <div className="text-xl font-bold text-gray-900">{fmtVal(manualDiagDisplay, unit)}</div>
                <div className="text-xs text-purple-400">{s}</div>
              </div>
            </div>
          )}
        </div>

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>)}
        </article>

        {/* FAQ Accordion */}
        <section className="mt-10 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">FAQ</h2>
          <div className="space-y-2">
            {seo.faq.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left px-4 py-3 font-medium text-gray-900 flex justify-between items-center">
                  {item.q}
                  <span className="text-gray-400">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <div className="px-4 pb-3 text-gray-600">{item.a}</div>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </ToolPageWrapper>
  );
}
