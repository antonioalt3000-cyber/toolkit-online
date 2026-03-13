'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type GridSize = 8 | 16 | 32;
type Tool = 'draw' | 'eraser' | 'fill';

const GRID_SIZES: GridSize[] = [8, 16, 32];

function createGrid(size: GridSize): string[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => ''));
}

function floodFill(grid: string[][], row: number, col: number, newColor: string): string[][] {
  const size = grid.length;
  const target = grid[row][col];
  if (target === newColor) return grid;
  const copy = grid.map(r => [...r]);
  const stack: [number, number][] = [[row, col]];
  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    if (r < 0 || r >= size || c < 0 || c >= size) continue;
    if (copy[r][c] !== target) continue;
    copy[r][c] = newColor;
    stack.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
  }
  return copy;
}

const labels: Record<string, Record<Locale, string>> = {
  gridSize: { en: 'Grid Size', it: 'Dimensione griglia', es: 'Tamaño de cuadrícula', fr: 'Taille de grille', de: 'Rastergröße', pt: 'Tamanho da grade' },
  draw: { en: 'Draw', it: 'Disegna', es: 'Dibujar', fr: 'Dessiner', de: 'Zeichnen', pt: 'Desenhar' },
  eraser: { en: 'Eraser', it: 'Gomma', es: 'Borrador', fr: 'Gomme', de: 'Radierer', pt: 'Borracha' },
  fill: { en: 'Fill', it: 'Riempi', es: 'Rellenar', fr: 'Remplir', de: 'Füllen', pt: 'Preencher' },
  clear: { en: 'Clear', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Löschen', pt: 'Limpar' },
  undo: { en: 'Undo', it: 'Annulla', es: 'Deshacer', fr: 'Annuler', de: 'Rückgängig', pt: 'Desfazer' },
  download: { en: 'Download PNG', it: 'Scarica PNG', es: 'Descargar PNG', fr: 'Télécharger PNG', de: 'PNG herunterladen', pt: 'Baixar PNG' },
  showGrid: { en: 'Show Grid', it: 'Mostra griglia', es: 'Mostrar cuadrícula', fr: 'Afficher grille', de: 'Raster anzeigen', pt: 'Mostrar grade' },
  zoomIn: { en: 'Zoom In', it: 'Ingrandisci', es: 'Acercar', fr: 'Zoom +', de: 'Vergrößern', pt: 'Ampliar' },
  zoomOut: { en: 'Zoom Out', it: 'Riduci', es: 'Alejar', fr: 'Zoom −', de: 'Verkleinern', pt: 'Reduzir' },
  color: { en: 'Color', it: 'Colore', es: 'Color', fr: 'Couleur', de: 'Farbe', pt: 'Cor' },
};

export default function PixelArtMaker() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['pixel-art-maker'][lang];
  const t = useCallback((key: string) => labels[key]?.[lang] ?? labels[key]?.en ?? key, [lang]);

  const [gridSize, setGridSize] = useState<GridSize>(16);
  const [grid, setGrid] = useState(() => createGrid(16));
  const [color, setColor] = useState('#000000');
  const [activeTool, setActiveTool] = useState<Tool>('draw');
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [history, setHistory] = useState<string[][][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pushHistory = useCallback((g: string[][]) => {
    setHistory(prev => [...prev.slice(-30), g.map(r => [...r])]);
  }, []);

  const handleGridSizeChange = (size: GridSize) => {
    const newGrid = createGrid(size);
    pushHistory(grid);
    setGridSize(size);
    setGrid(newGrid);
  };

  const paintPixel = useCallback((row: number, col: number, skipHistory = false) => {
    setGrid(prev => {
      if (activeTool === 'fill') {
        if (!skipHistory) pushHistory(prev);
        return floodFill(prev, row, col, activeTool === 'fill' ? color : '');
      }
      const newVal = activeTool === 'eraser' ? '' : color;
      if (prev[row][col] === newVal) return prev;
      if (!skipHistory) pushHistory(prev);
      const copy = prev.map(r => [...r]);
      copy[row][col] = newVal;
      return copy;
    });
  }, [activeTool, color, pushHistory]);

  const handleMouseDown = (row: number, col: number) => {
    if (activeTool === 'fill') {
      paintPixel(row, col);
    } else {
      pushHistory(grid);
      setIsDrawing(true);
      setGrid(prev => {
        const newVal = activeTool === 'eraser' ? '' : color;
        if (prev[row][col] === newVal) return prev;
        const copy = prev.map(r => [...r]);
        copy[row][col] = newVal;
        return copy;
      });
    }
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isDrawing || activeTool === 'fill') return;
    setGrid(prev => {
      const newVal = activeTool === 'eraser' ? '' : color;
      if (prev[row][col] === newVal) return prev;
      const copy = prev.map(r => [...r]);
      copy[row][col] = newVal;
      return copy;
    });
  };

  const handleMouseUp = () => setIsDrawing(false);

  useEffect(() => {
    const up = () => setIsDrawing(false);
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setGrid(prev);
  };

  const handleClear = () => {
    pushHistory(grid);
    setGrid(createGrid(gridSize));
  };

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    const pixelSize = 16;
    canvas.width = gridSize * pixelSize;
    canvas.height = gridSize * pixelSize;
    const ctx = canvas.getContext('2d')!;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c]) {
          ctx.fillStyle = grid[r][c];
          ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    const link = document.createElement('a');
    link.download = `pixel-art-${gridSize}x${gridSize}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const cellSize = Math.max(8, Math.floor((zoom / 100) * (320 / gridSize)));

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Online Pixel Art Maker: Create Retro Pixel Art in Your Browser',
      paragraphs: [
        'Pixel art is a digital art form where images are created by editing individual pixels on a grid. Originating from early video game graphics of the 1970s and 1980s, pixel art has experienced a massive resurgence thanks to indie games, NFT culture, and retro-inspired design trends. Our free Pixel Art Maker lets you create pixel art directly in your browser with no software installation required.',
        'The tool offers three grid sizes — 8x8, 16x16, and 32x32 — covering everything from simple icons and emoji-style sprites to more detailed character designs and tile art. Use the draw tool to paint individual pixels, the fill tool for flood-filling entire regions, and the eraser to correct mistakes. The undo feature keeps a generous history so you can experiment freely.',
        'Grid lines help maintain alignment and can be toggled off for a clean preview. Zoom controls let you work comfortably at any grid size, making it easy to place pixels precisely. When your artwork is complete, download it as a transparent PNG — perfect for game assets, social media avatars, or creative projects.',
        'Whether you are a game developer prototyping sprites, a designer exploring retro aesthetics, or a hobbyist looking for a creative outlet, this tool provides everything you need to start making pixel art immediately. All processing happens locally in your browser, so your creations stay private.',
      ],
      faq: [
        { q: 'What grid sizes are available for pixel art?', a: 'The tool offers 8x8, 16x16, and 32x32 grid sizes. 8x8 is great for simple icons and small sprites, 16x16 is the most popular size for game characters and tiles, and 32x32 allows for more detailed artwork.' },
        { q: 'Can I download my pixel art as an image?', a: 'Yes, click the Download PNG button to save your pixel art as a PNG file with transparency. Empty pixels remain transparent, making it easy to use your art in games, websites, or design projects.' },
        { q: 'How does the flood fill tool work?', a: 'The fill tool colors an entire connected region of same-colored pixels with your current color. Click on any pixel to fill all adjacent pixels that share the same color. This is useful for quickly coloring large areas.' },
        { q: 'Is there an undo feature?', a: 'Yes, the tool maintains a history of your recent actions. Click the Undo button to revert to the previous state. You can undo up to 30 steps back.' },
        { q: 'Is my pixel art saved or uploaded anywhere?', a: 'No. All processing happens entirely in your browser. Your artwork is never uploaded to any server. Use the Download PNG button to save your work locally.' },
      ],
    },
    it: {
      title: 'Pixel Art Maker Online Gratis: Crea Arte in Pixel nel Browser',
      paragraphs: [
        'La pixel art è una forma d\'arte digitale in cui le immagini vengono create modificando singoli pixel su una griglia. Nata dalla grafica dei videogiochi degli anni \'70 e \'80, la pixel art ha vissuto una rinascita grazie ai giochi indie e alle tendenze retro. Il nostro Pixel Art Maker gratuito ti permette di creare pixel art direttamente nel browser senza installare software.',
        'Lo strumento offre tre dimensioni di griglia — 8x8, 16x16 e 32x32 — per coprire tutto, da semplici icone a design più dettagliati. Usa lo strumento disegno per dipingere pixel singoli, il riempimento per colorare intere regioni e la gomma per correggere errori. La funzione annulla mantiene uno storico generoso per sperimentare liberamente.',
        'Le linee della griglia aiutano a mantenere l\'allineamento e possono essere disattivate per un\'anteprima pulita. I controlli zoom permettono di lavorare comodamente a qualsiasi dimensione. Quando la tua opera è completa, scaricala come PNG trasparente — perfetto per asset di gioco, avatar social o progetti creativi.',
        'Che tu sia uno sviluppatore di giochi, un designer o un hobbyista, questo strumento fornisce tutto il necessario per iniziare a creare pixel art immediatamente. Tutto il processing avviene localmente nel browser.',
      ],
      faq: [
        { q: 'Quali dimensioni di griglia sono disponibili?', a: 'Lo strumento offre griglie 8x8, 16x16 e 32x32. 8x8 è ottimo per icone semplici, 16x16 è la dimensione più popolare per personaggi e tile, e 32x32 permette artwork più dettagliato.' },
        { q: 'Posso scaricare la mia pixel art come immagine?', a: 'Sì, clicca il pulsante Scarica PNG per salvare la tua pixel art come file PNG con trasparenza. I pixel vuoti restano trasparenti.' },
        { q: 'Come funziona lo strumento riempimento?', a: 'Lo strumento riempimento colora un\'intera regione connessa di pixel dello stesso colore con il colore corrente. Clicca su un pixel per riempire tutti i pixel adiacenti dello stesso colore.' },
        { q: 'C\'è una funzione annulla?', a: 'Sì, lo strumento mantiene uno storico delle azioni recenti. Clicca Annulla per tornare allo stato precedente. Puoi annullare fino a 30 passaggi.' },
        { q: 'La mia pixel art viene salvata o caricata da qualche parte?', a: 'No. Tutto il processing avviene interamente nel browser. Le tue creazioni non vengono mai caricate su server. Usa Scarica PNG per salvare il lavoro localmente.' },
      ],
    },
    es: {
      title: 'Creador de Pixel Art Online Gratis: Crea Arte en Píxeles en tu Navegador',
      paragraphs: [
        'El pixel art es una forma de arte digital donde las imágenes se crean editando píxeles individuales en una cuadrícula. Originario de los gráficos de videojuegos de los años 70 y 80, el pixel art ha resurgido gracias a los juegos indie y las tendencias retro. Nuestro Pixel Art Maker gratuito te permite crear pixel art directamente en tu navegador sin instalar software.',
        'La herramienta ofrece tres tamaños de cuadrícula — 8x8, 16x16 y 32x32 — cubriendo desde iconos simples hasta diseños más detallados. Usa la herramienta de dibujo para pintar píxeles individuales, el relleno para colorear regiones enteras y el borrador para corregir errores. La función deshacer mantiene un historial generoso para experimentar libremente.',
        'Las líneas de cuadrícula ayudan a mantener la alineación y pueden desactivarse para una vista previa limpia. Los controles de zoom permiten trabajar cómodamente en cualquier tamaño. Cuando tu obra esté completa, descárgala como PNG transparente — perfecto para assets de juego, avatares o proyectos creativos.',
        'Ya seas desarrollador de juegos, diseñador o aficionado, esta herramienta proporciona todo lo necesario para empezar a crear pixel art inmediatamente. Todo el procesamiento ocurre localmente en tu navegador.',
      ],
      faq: [
        { q: '¿Qué tamaños de cuadrícula están disponibles?', a: 'La herramienta ofrece cuadrículas de 8x8, 16x16 y 32x32. 8x8 es ideal para iconos simples, 16x16 es el tamaño más popular para personajes y tiles, y 32x32 permite arte más detallado.' },
        { q: '¿Puedo descargar mi pixel art como imagen?', a: 'Sí, haz clic en Descargar PNG para guardar tu pixel art como archivo PNG con transparencia. Los píxeles vacíos permanecen transparentes.' },
        { q: '¿Cómo funciona la herramienta de relleno?', a: 'La herramienta de relleno colorea toda una región conectada de píxeles del mismo color con tu color actual. Haz clic en cualquier píxel para rellenar todos los adyacentes del mismo color.' },
        { q: '¿Hay función de deshacer?', a: 'Sí, la herramienta mantiene un historial de acciones recientes. Haz clic en Deshacer para volver al estado anterior. Puedes deshacer hasta 30 pasos.' },
        { q: '¿Mi pixel art se guarda o sube a algún servidor?', a: 'No. Todo el procesamiento ocurre completamente en tu navegador. Tus creaciones nunca se suben a ningún servidor. Usa Descargar PNG para guardar tu trabajo localmente.' },
      ],
    },
    fr: {
      title: 'Créateur de Pixel Art en Ligne Gratuit : Créez du Pixel Art dans Votre Navigateur',
      paragraphs: [
        'Le pixel art est une forme d\'art numérique où les images sont créées en modifiant des pixels individuels sur une grille. Issu des graphismes de jeux vidéo des années 70 et 80, le pixel art a connu un renouveau grâce aux jeux indépendants et aux tendances rétro. Notre Pixel Art Maker gratuit vous permet de créer du pixel art directement dans votre navigateur sans installer de logiciel.',
        'L\'outil propose trois tailles de grille — 8x8, 16x16 et 32x32 — couvrant des icônes simples aux designs plus détaillés. Utilisez l\'outil dessin pour peindre des pixels individuels, le remplissage pour colorer des régions entières et la gomme pour corriger les erreurs. La fonction annuler garde un historique généreux pour expérimenter librement.',
        'Les lignes de grille aident à maintenir l\'alignement et peuvent être désactivées pour un aperçu propre. Les contrôles de zoom permettent de travailler confortablement. Lorsque votre œuvre est terminée, téléchargez-la en PNG transparent — parfait pour les assets de jeux, avatars ou projets créatifs.',
        'Que vous soyez développeur de jeux, designer ou amateur, cet outil fournit tout le nécessaire pour commencer à créer du pixel art immédiatement. Tout le traitement se fait localement dans votre navigateur.',
      ],
      faq: [
        { q: 'Quelles tailles de grille sont disponibles ?', a: 'L\'outil propose des grilles 8x8, 16x16 et 32x32. 8x8 est idéal pour les icônes simples, 16x16 est la taille la plus populaire pour les personnages et tuiles, et 32x32 permet un art plus détaillé.' },
        { q: 'Puis-je télécharger mon pixel art en image ?', a: 'Oui, cliquez sur Télécharger PNG pour sauvegarder votre pixel art en fichier PNG avec transparence. Les pixels vides restent transparents.' },
        { q: 'Comment fonctionne l\'outil de remplissage ?', a: 'L\'outil de remplissage colore une région entière de pixels connectés de même couleur avec votre couleur actuelle. Cliquez sur un pixel pour remplir tous les pixels adjacents de même couleur.' },
        { q: 'Y a-t-il une fonction annuler ?', a: 'Oui, l\'outil maintient un historique des actions récentes. Cliquez sur Annuler pour revenir à l\'état précédent. Vous pouvez annuler jusqu\'à 30 étapes.' },
        { q: 'Mon pixel art est-il sauvegardé ou envoyé quelque part ?', a: 'Non. Tout le traitement se fait entièrement dans votre navigateur. Vos créations ne sont jamais envoyées à un serveur. Utilisez Télécharger PNG pour sauvegarder localement.' },
      ],
    },
    de: {
      title: 'Kostenloser Online Pixel Art Maker: Erstellen Sie Retro-Pixelkunst im Browser',
      paragraphs: [
        'Pixel Art ist eine digitale Kunstform, bei der Bilder durch Bearbeitung einzelner Pixel auf einem Raster erstellt werden. Ursprünglich aus den Videospielgrafiken der 70er und 80er Jahre stammend, erlebt Pixel Art dank Indie-Spielen und Retro-Trends eine massive Wiederbelebung. Unser kostenloser Pixel Art Maker ermöglicht es Ihnen, Pixel Art direkt im Browser zu erstellen.',
        'Das Tool bietet drei Rastergrößen — 8x8, 16x16 und 32x32 — von einfachen Icons bis zu detaillierteren Designs. Verwenden Sie das Zeichenwerkzeug für einzelne Pixel, das Füllwerkzeug für ganze Bereiche und den Radierer zum Korrigieren. Die Rückgängig-Funktion behält einen großzügigen Verlauf zum freien Experimentieren.',
        'Rasterlinien helfen bei der Ausrichtung und können für eine saubere Vorschau ausgeblendet werden. Zoom-Steuerungen ermöglichen komfortables Arbeiten bei jeder Größe. Wenn Ihr Kunstwerk fertig ist, laden Sie es als transparentes PNG herunter — perfekt für Spiel-Assets, Social-Media-Avatare oder kreative Projekte.',
        'Ob Spieleentwickler, Designer oder Hobbyist — dieses Tool bietet alles, was Sie brauchen, um sofort mit Pixel Art zu beginnen. Die gesamte Verarbeitung erfolgt lokal in Ihrem Browser.',
      ],
      faq: [
        { q: 'Welche Rastergrößen sind verfügbar?', a: 'Das Tool bietet 8x8, 16x16 und 32x32 Raster. 8x8 eignet sich für einfache Icons, 16x16 ist die beliebteste Größe für Charaktere und Kacheln, und 32x32 ermöglicht detailliertere Kunst.' },
        { q: 'Kann ich meine Pixel Art als Bild herunterladen?', a: 'Ja, klicken Sie auf PNG herunterladen, um Ihre Pixel Art als PNG-Datei mit Transparenz zu speichern. Leere Pixel bleiben transparent.' },
        { q: 'Wie funktioniert das Füllwerkzeug?', a: 'Das Füllwerkzeug färbt einen gesamten zusammenhängenden Bereich gleichfarbiger Pixel mit Ihrer aktuellen Farbe. Klicken Sie auf einen Pixel, um alle angrenzenden gleichfarbigen Pixel zu füllen.' },
        { q: 'Gibt es eine Rückgängig-Funktion?', a: 'Ja, das Tool speichert einen Verlauf Ihrer letzten Aktionen. Klicken Sie auf Rückgängig, um zum vorherigen Zustand zurückzukehren. Sie können bis zu 30 Schritte rückgängig machen.' },
        { q: 'Wird meine Pixel Art gespeichert oder irgendwo hochgeladen?', a: 'Nein. Die gesamte Verarbeitung findet ausschließlich in Ihrem Browser statt. Ihre Kreationen werden nie auf einen Server hochgeladen. Nutzen Sie PNG herunterladen zum lokalen Speichern.' },
      ],
    },
    pt: {
      title: 'Criador de Pixel Art Online Grátis: Crie Arte em Pixels no Navegador',
      paragraphs: [
        'Pixel art é uma forma de arte digital onde as imagens são criadas editando pixels individuais em uma grade. Originada dos gráficos de videogames dos anos 70 e 80, a pixel art ressurgiu graças aos jogos indie e tendências retrô. Nosso Pixel Art Maker gratuito permite criar pixel art diretamente no navegador sem instalar software.',
        'A ferramenta oferece três tamanhos de grade — 8x8, 16x16 e 32x32 — cobrindo desde ícones simples até designs mais detalhados. Use a ferramenta de desenho para pintar pixels individuais, o preenchimento para colorir regiões inteiras e a borracha para corrigir erros. A função desfazer mantém um histórico generoso para experimentar livremente.',
        'As linhas da grade ajudam a manter o alinhamento e podem ser desativadas para uma visualização limpa. Os controles de zoom permitem trabalhar confortavelmente em qualquer tamanho. Quando sua obra estiver completa, baixe-a como PNG transparente — perfeito para assets de jogos, avatares ou projetos criativos.',
        'Seja você desenvolvedor de jogos, designer ou hobbyista, esta ferramenta fornece tudo o necessário para começar a criar pixel art imediatamente. Todo o processamento acontece localmente no seu navegador.',
      ],
      faq: [
        { q: 'Quais tamanhos de grade estão disponíveis?', a: 'A ferramenta oferece grades de 8x8, 16x16 e 32x32. 8x8 é ótimo para ícones simples, 16x16 é o tamanho mais popular para personagens e tiles, e 32x32 permite arte mais detalhada.' },
        { q: 'Posso baixar minha pixel art como imagem?', a: 'Sim, clique em Baixar PNG para salvar sua pixel art como arquivo PNG com transparência. Pixels vazios permanecem transparentes.' },
        { q: 'Como funciona a ferramenta de preenchimento?', a: 'A ferramenta de preenchimento colore uma região inteira conectada de pixels da mesma cor com sua cor atual. Clique em qualquer pixel para preencher todos os adjacentes da mesma cor.' },
        { q: 'Existe função de desfazer?', a: 'Sim, a ferramenta mantém um histórico de ações recentes. Clique em Desfazer para voltar ao estado anterior. Você pode desfazer até 30 passos.' },
        { q: 'Minha pixel art é salva ou enviada para algum lugar?', a: 'Não. Todo o processamento acontece inteiramente no seu navegador. Suas criações nunca são enviadas para nenhum servidor. Use Baixar PNG para salvar seu trabalho localmente.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="pixel-art-maker" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Top controls row */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Grid size */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">{t('gridSize')}:</span>
              {GRID_SIZES.map(s => (
                <button
                  key={s}
                  onClick={() => handleGridSizeChange(s)}
                  className={`px-3 py-1 text-sm rounded-lg border transition-colors ${gridSize === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                >
                  {s}x{s}
                </button>
              ))}
            </div>

            {/* Color picker */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">{t('color')}:</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0"
              />
              <span className="text-xs font-mono text-gray-500">{color.toUpperCase()}</span>
            </div>
          </div>

          {/* Tool buttons */}
          <div className="flex flex-wrap gap-2">
            {(['draw', 'eraser', 'fill'] as Tool[]).map(tool => (
              <button
                key={tool}
                onClick={() => setActiveTool(tool)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${activeTool === tool ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'}`}
              >
                {tool === 'draw' ? '✏️' : tool === 'eraser' ? '🧹' : '🪣'} {t(tool)}
              </button>
            ))}
            <div className="w-px bg-gray-300 mx-1 self-stretch" />
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className="px-4 py-2 text-sm font-medium rounded-lg border bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ↩ {t('undo')}
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium rounded-lg border bg-red-50 text-red-700 border-red-300 hover:bg-red-100 transition-colors"
            >
              {t('clear')}
            </button>
          </div>

          {/* Grid toggle + Zoom */}
          <div className="flex flex-wrap gap-3 items-center">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded border-gray-300"
              />
              {t('showGrid')}
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(z => Math.max(50, z - 25))}
                className="px-2 py-1 text-sm rounded border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                −
              </button>
              <span className="text-sm font-mono text-gray-600 w-12 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(z => Math.min(200, z + 25))}
                className="px-2 py-1 text-sm rounded border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Canvas grid */}
          <div className="overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-2">
            <div
              className="mx-auto select-none"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
                width: gridSize * cellSize,
                gap: showGrid ? '1px' : '0px',
                backgroundColor: showGrid ? '#d1d5db' : 'transparent',
              }}
              onMouseLeave={() => setIsDrawing(false)}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    onMouseDown={(e) => { e.preventDefault(); handleMouseDown(r, c); }}
                    onMouseEnter={() => handleMouseEnter(r, c)}
                    onMouseUp={handleMouseUp}
                    className="cursor-crosshair"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: cell || '#ffffff',
                      backgroundImage: !cell ? 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%), linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%)' : 'none',
                      backgroundSize: `${cellSize / 2}px ${cellSize / 2}px`,
                      backgroundPosition: !cell ? `0 0, ${cellSize / 4}px ${cellSize / 4}px` : undefined,
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="w-full px-4 py-3 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            ⬇ {t('download')}
          </button>
        </div>

        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>)}
        </article>

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
