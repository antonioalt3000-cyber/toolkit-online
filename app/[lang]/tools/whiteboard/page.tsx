'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

/* ───────── types ───────── */
interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  size: number;
  eraser: boolean;
}

/* ───────── labels ───────── */
const labels: Record<string, Record<Locale, string>> = {
  brush: { en: 'Brush', it: 'Pennello', es: 'Pincel', fr: 'Pinceau', de: 'Pinsel', pt: 'Pincel' },
  eraser: { en: 'Eraser', it: 'Gomma', es: 'Borrador', fr: 'Gomme', de: 'Radierer', pt: 'Borracha' },
  size: { en: 'Size', it: 'Dimensione', es: 'Tamaño', fr: 'Taille', de: 'Größe', pt: 'Tamanho' },
  color: { en: 'Color', it: 'Colore', es: 'Color', fr: 'Couleur', de: 'Farbe', pt: 'Cor' },
  clearAll: { en: 'Clear All', it: 'Cancella tutto', es: 'Borrar todo', fr: 'Tout effacer', de: 'Alles löschen', pt: 'Limpar tudo' },
  undo: { en: 'Undo', it: 'Annulla', es: 'Deshacer', fr: 'Annuler', de: 'Rückgängig', pt: 'Desfazer' },
  download: { en: 'Download PNG', it: 'Scarica PNG', es: 'Descargar PNG', fr: 'Télécharger PNG', de: 'PNG herunterladen', pt: 'Baixar PNG' },
  background: { en: 'Background', it: 'Sfondo', es: 'Fondo', fr: 'Arrière-plan', de: 'Hintergrund', pt: 'Fundo' },
  white: { en: 'White', it: 'Bianco', es: 'Blanco', fr: 'Blanc', de: 'Weiß', pt: 'Branco' },
  grid: { en: 'Grid', it: 'Griglia', es: 'Cuadrícula', fr: 'Grille', de: 'Raster', pt: 'Grade' },
  custom: { en: 'Custom', it: 'Personalizzato', es: 'Personalizado', fr: 'Personnalisé', de: 'Benutzerdefiniert', pt: 'Personalizado' },
};

/* ───────── SEO content ───────── */
const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'Free Online Whiteboard: Draw, Sketch & Create Instantly',
    paragraphs: [
      'The ToolKit Online Whiteboard is a free, browser-based drawing tool that lets you sketch ideas, create diagrams, and draw illustrations without installing any software. Whether you are brainstorming for a project, teaching a concept to students, or simply doodling during a break, this whiteboard provides a clean and responsive canvas ready for your creativity.',
      'Our whiteboard tool features a versatile brush with adjustable size ranging from 1 to 50 pixels, a rich color palette with both preset colors and a custom color picker, and a dedicated eraser tool for precise corrections. The undo feature saves up to 20 strokes, so you can experiment freely without fear of making irreversible mistakes. When you are done, simply download your creation as a high-quality PNG image.',
      'Touch support is built in from the ground up, making this whiteboard equally powerful on desktop computers, tablets, and smartphones. You can switch between a clean white background and a grid background to help align your drawings or create structured diagrams. The grid mode is especially useful for wireframing, technical sketches, and geometry exercises.',
      'Unlike many online whiteboard applications, this tool works entirely in your browser. No data is uploaded to any server, your drawings remain completely private and local. There is no account registration required, no watermarks on your exports, and no usage limits. It is the perfect lightweight alternative to heavy drawing software when you need a quick canvas for visual thinking.',
      'Educators can use this tool to explain concepts visually during online lessons. Designers can quickly sketch wireframes or UI ideas before moving to dedicated design tools. Students can solve math problems step by step or draw diagrams for their assignments. The possibilities are endless when you have a blank canvas at your fingertips.',
      'The whiteboard is optimized for performance, handling smooth brush strokes even on lower-end devices. Each stroke is recorded individually, enabling the undo system to work precisely at the stroke level rather than pixel level. This approach gives you full control over your creative process while keeping the interface simple and distraction-free.',
    ],
    faq: [
      { q: 'Is the whiteboard completely free to use?', a: 'Yes, the whiteboard is 100% free with no limits, no watermarks, and no sign-up required. You can draw and download as many images as you want.' },
      { q: 'Does it work on mobile and tablet devices?', a: 'Absolutely. The whiteboard has full touch support optimized for mobile phones and tablets. You can draw with your finger or a stylus on any touch-enabled device.' },
      { q: 'Can I undo my drawing mistakes?', a: 'Yes, the undo feature supports up to 20 previous strokes. Click the Undo button or use it multiple times to step back through your recent drawing history.' },
      { q: 'What format is the downloaded image?', a: 'Your drawing is exported as a PNG image at the full resolution of the canvas. PNG is a lossless format that preserves quality and supports transparency.' },
      { q: 'Is my drawing data private?', a: 'Yes. Everything happens locally in your browser. No drawing data is sent to any server. Your sketches are completely private and never stored online.' },
    ],
  },
  it: {
    title: 'Lavagna Online Gratuita: Disegna, Schizza e Crea Istantaneamente',
    paragraphs: [
      'La Lavagna Online di ToolKit Online è uno strumento di disegno gratuito basato su browser che ti permette di schizzare idee, creare diagrammi e disegnare illustrazioni senza installare alcun software. Che tu stia facendo brainstorming per un progetto, insegnando un concetto agli studenti o semplicemente scarabocchiando durante una pausa, questa lavagna offre un canvas pulito e reattivo pronto per la tua creatività.',
      'Il nostro strumento lavagna presenta un pennello versatile con dimensione regolabile da 1 a 50 pixel, una ricca palette di colori con colori preimpostati e un selettore personalizzato, e uno strumento gomma dedicato per correzioni precise. La funzione annulla salva fino a 20 tratti, così puoi sperimentare liberamente senza paura di fare errori irreversibili. Quando hai finito, scarica semplicemente la tua creazione come immagine PNG di alta qualità.',
      'Il supporto touch è integrato nativamente, rendendo questa lavagna ugualmente potente su computer desktop, tablet e smartphone. Puoi passare da uno sfondo bianco pulito a uno sfondo a griglia per aiutare ad allineare i tuoi disegni o creare diagrammi strutturati. La modalità griglia è particolarmente utile per wireframing, schizzi tecnici ed esercizi di geometria.',
      'A differenza di molte applicazioni lavagna online, questo strumento funziona interamente nel tuo browser. Nessun dato viene caricato su alcun server, i tuoi disegni rimangono completamente privati e locali. Non è richiesta alcuna registrazione, nessuna filigrana sulle esportazioni e nessun limite di utilizzo. È l\'alternativa leggera perfetta ai software di disegno pesanti quando hai bisogno di un canvas veloce per il pensiero visivo.',
      'Gli educatori possono usare questo strumento per spiegare concetti visivamente durante le lezioni online. I designer possono schizzare rapidamente wireframe o idee UI prima di passare a strumenti di design dedicati. Gli studenti possono risolvere problemi di matematica passo dopo passo o disegnare diagrammi per i loro compiti. Le possibilità sono infinite quando hai una tela bianca a portata di mano.',
      'La lavagna è ottimizzata per le prestazioni, gestendo tratti fluidi anche su dispositivi di fascia bassa. Ogni tratto è registrato individualmente, consentendo al sistema di annullamento di funzionare precisamente a livello di tratto piuttosto che di pixel. Questo approccio ti dà il pieno controllo sul tuo processo creativo mantenendo l\'interfaccia semplice e priva di distrazioni.',
    ],
    faq: [
      { q: 'La lavagna è completamente gratuita?', a: 'Sì, la lavagna è gratuita al 100% senza limiti, filigrane o registrazione. Puoi disegnare e scaricare tutte le immagini che vuoi.' },
      { q: 'Funziona su dispositivi mobili e tablet?', a: 'Assolutamente. La lavagna ha supporto touch completo ottimizzato per telefoni e tablet. Puoi disegnare con il dito o con uno stilo su qualsiasi dispositivo touch.' },
      { q: 'Posso annullare i miei errori di disegno?', a: 'Sì, la funzione annulla supporta fino a 20 tratti precedenti. Clicca il pulsante Annulla o usalo più volte per tornare indietro nella cronologia recente.' },
      { q: 'In quale formato viene scaricata l\'immagine?', a: 'Il tuo disegno viene esportato come immagine PNG alla risoluzione completa del canvas. PNG è un formato senza perdita che preserva la qualità e supporta la trasparenza.' },
      { q: 'I miei dati di disegno sono privati?', a: 'Sì. Tutto avviene localmente nel tuo browser. Nessun dato di disegno viene inviato a nessun server. I tuoi schizzi sono completamente privati e mai salvati online.' },
    ],
  },
  es: {
    title: 'Pizarra Online Gratis: Dibuja, Bosqueja y Crea al Instante',
    paragraphs: [
      'La Pizarra Online de ToolKit Online es una herramienta de dibujo gratuita basada en navegador que te permite bosquejar ideas, crear diagramas y dibujar ilustraciones sin instalar ningún software. Ya sea que estés haciendo lluvia de ideas para un proyecto, enseñando un concepto a estudiantes o simplemente garabateando durante un descanso, esta pizarra proporciona un lienzo limpio y receptivo listo para tu creatividad.',
      'Nuestra herramienta de pizarra cuenta con un pincel versátil con tamaño ajustable de 1 a 50 píxeles, una rica paleta de colores con colores predefinidos y un selector personalizado, y una herramienta de borrador dedicada para correcciones precisas. La función deshacer guarda hasta 20 trazos, para que puedas experimentar libremente sin miedo a cometer errores irreversibles. Cuando termines, simplemente descarga tu creación como una imagen PNG de alta calidad.',
      'El soporte táctil está integrado desde el principio, haciendo que esta pizarra sea igualmente poderosa en computadoras de escritorio, tabletas y teléfonos inteligentes. Puedes alternar entre un fondo blanco limpio y un fondo de cuadrícula para ayudar a alinear tus dibujos o crear diagramas estructurados. El modo cuadrícula es especialmente útil para wireframing, bocetos técnicos y ejercicios de geometría.',
      'A diferencia de muchas aplicaciones de pizarra en línea, esta herramienta funciona completamente en tu navegador. No se sube ningún dato a ningún servidor, tus dibujos permanecen completamente privados y locales. No se requiere registro, no hay marcas de agua en tus exportaciones y no hay límites de uso. Es la alternativa ligera perfecta al software de dibujo pesado cuando necesitas un lienzo rápido para el pensamiento visual.',
      'Los educadores pueden usar esta herramienta para explicar conceptos visualmente durante las clases en línea. Los diseñadores pueden bosquejar rápidamente wireframes o ideas de UI antes de pasar a herramientas de diseño dedicadas. Los estudiantes pueden resolver problemas matemáticos paso a paso o dibujar diagramas para sus tareas. Las posibilidades son infinitas cuando tienes un lienzo en blanco al alcance de tu mano.',
      'La pizarra está optimizada para el rendimiento, manejando trazos suaves incluso en dispositivos de gama baja. Cada trazo se registra individualmente, permitiendo que el sistema de deshacer funcione precisamente a nivel de trazo en lugar de nivel de píxel. Este enfoque te da control total sobre tu proceso creativo mientras mantiene la interfaz simple y libre de distracciones.',
    ],
    faq: [
      { q: '¿La pizarra es completamente gratis?', a: 'Sí, la pizarra es 100% gratis sin límites, marcas de agua ni registro. Puedes dibujar y descargar tantas imágenes como quieras.' },
      { q: '¿Funciona en dispositivos móviles y tabletas?', a: 'Absolutamente. La pizarra tiene soporte táctil completo optimizado para teléfonos y tabletas. Puedes dibujar con tu dedo o un lápiz óptico en cualquier dispositivo táctil.' },
      { q: '¿Puedo deshacer mis errores de dibujo?', a: 'Sí, la función deshacer soporta hasta 20 trazos anteriores. Haz clic en el botón Deshacer o úsalo varias veces para retroceder en tu historial reciente de dibujo.' },
      { q: '¿En qué formato se descarga la imagen?', a: 'Tu dibujo se exporta como imagen PNG a la resolución completa del lienzo. PNG es un formato sin pérdida que preserva la calidad y soporta transparencia.' },
      { q: '¿Mis datos de dibujo son privados?', a: 'Sí. Todo sucede localmente en tu navegador. Ningún dato de dibujo se envía a ningún servidor. Tus bocetos son completamente privados y nunca se almacenan en línea.' },
    ],
  },
  fr: {
    title: 'Tableau Blanc en Ligne Gratuit : Dessinez, Esquissez et Créez Instantanément',
    paragraphs: [
      'Le Tableau Blanc de ToolKit Online est un outil de dessin gratuit basé sur navigateur qui vous permet d\'esquisser des idées, créer des diagrammes et dessiner des illustrations sans installer aucun logiciel. Que vous fassiez du brainstorming pour un projet, enseigniez un concept à des étudiants ou griffonniez simplement pendant une pause, ce tableau blanc offre un canevas propre et réactif prêt pour votre créativité.',
      'Notre outil tableau blanc dispose d\'un pinceau polyvalent avec une taille ajustable de 1 à 50 pixels, une palette de couleurs riche avec des couleurs prédéfinies et un sélecteur personnalisé, et un outil gomme dédié pour des corrections précises. La fonction annuler sauvegarde jusqu\'à 20 traits, vous pouvez donc expérimenter librement sans crainte de faire des erreurs irréversibles. Quand vous avez terminé, téléchargez simplement votre création en image PNG haute qualité.',
      'Le support tactile est intégré nativement, rendant ce tableau blanc aussi puissant sur ordinateurs de bureau, tablettes et smartphones. Vous pouvez basculer entre un fond blanc propre et un fond quadrillé pour aider à aligner vos dessins ou créer des diagrammes structurés. Le mode grille est particulièrement utile pour le wireframing, les croquis techniques et les exercices de géométrie.',
      'Contrairement à de nombreuses applications de tableau blanc en ligne, cet outil fonctionne entièrement dans votre navigateur. Aucune donnée n\'est téléchargée sur aucun serveur, vos dessins restent complètement privés et locaux. Aucune inscription requise, aucun filigrane sur vos exports et aucune limite d\'utilisation. C\'est l\'alternative légère parfaite aux logiciels de dessin lourds quand vous avez besoin d\'un canevas rapide pour la pensée visuelle.',
      'Les éducateurs peuvent utiliser cet outil pour expliquer visuellement des concepts pendant les cours en ligne. Les designers peuvent rapidement esquisser des wireframes ou des idées d\'interface avant de passer à des outils de design dédiés. Les étudiants peuvent résoudre des problèmes mathématiques étape par étape ou dessiner des diagrammes pour leurs devoirs. Les possibilités sont infinies quand vous avez un canevas vierge à portée de main.',
      'Le tableau blanc est optimisé pour les performances, gérant des traits fluides même sur des appareils moins puissants. Chaque trait est enregistré individuellement, permettant au système d\'annulation de fonctionner précisément au niveau du trait plutôt qu\'au niveau du pixel. Cette approche vous donne un contrôle total sur votre processus créatif tout en gardant l\'interface simple et sans distraction.',
    ],
    faq: [
      { q: 'Le tableau blanc est-il entièrement gratuit ?', a: 'Oui, le tableau blanc est 100% gratuit sans limites, filigranes ni inscription. Vous pouvez dessiner et télécharger autant d\'images que vous le souhaitez.' },
      { q: 'Fonctionne-t-il sur les appareils mobiles et tablettes ?', a: 'Absolument. Le tableau blanc dispose d\'un support tactile complet optimisé pour téléphones et tablettes. Vous pouvez dessiner avec votre doigt ou un stylet sur tout appareil tactile.' },
      { q: 'Puis-je annuler mes erreurs de dessin ?', a: 'Oui, la fonction annuler prend en charge jusqu\'à 20 traits précédents. Cliquez sur le bouton Annuler ou utilisez-le plusieurs fois pour revenir dans votre historique récent.' },
      { q: 'Quel format pour l\'image téléchargée ?', a: 'Votre dessin est exporté en image PNG à la résolution complète du canevas. PNG est un format sans perte qui préserve la qualité et supporte la transparence.' },
      { q: 'Mes données de dessin sont-elles privées ?', a: 'Oui. Tout se passe localement dans votre navigateur. Aucune donnée de dessin n\'est envoyée à aucun serveur. Vos croquis sont complètement privés et jamais stockés en ligne.' },
    ],
  },
  de: {
    title: 'Kostenloses Online-Whiteboard: Zeichnen, Skizzieren und Sofort Erstellen',
    paragraphs: [
      'Das ToolKit Online Whiteboard ist ein kostenloses, browserbasiertes Zeichenwerkzeug, mit dem Sie Ideen skizzieren, Diagramme erstellen und Illustrationen zeichnen können, ohne Software zu installieren. Ob Sie für ein Projekt brainstormen, Schülern ein Konzept erklären oder einfach in einer Pause kritzeln – dieses Whiteboard bietet eine saubere und reaktionsfähige Leinwand, die für Ihre Kreativität bereit ist.',
      'Unser Whiteboard-Tool bietet einen vielseitigen Pinsel mit einstellbarer Größe von 1 bis 50 Pixel, eine reichhaltige Farbpalette mit voreingestellten Farben und einem benutzerdefinierten Farbwähler sowie ein spezielles Radiergummi-Tool für präzise Korrekturen. Die Rückgängig-Funktion speichert bis zu 20 Striche, sodass Sie frei experimentieren können, ohne Angst vor irreversiblen Fehlern. Wenn Sie fertig sind, laden Sie Ihre Kreation einfach als hochwertige PNG-Datei herunter.',
      'Touch-Unterstützung ist von Grund auf eingebaut, wodurch dieses Whiteboard auf Desktop-Computern, Tablets und Smartphones gleichermaßen leistungsfähig ist. Sie können zwischen einem sauberen weißen Hintergrund und einem Rasterhintergrund wechseln, um Ihre Zeichnungen auszurichten oder strukturierte Diagramme zu erstellen. Der Rastermodus ist besonders nützlich für Wireframing, technische Skizzen und Geometrieübungen.',
      'Im Gegensatz zu vielen Online-Whiteboard-Anwendungen funktioniert dieses Tool vollständig in Ihrem Browser. Keine Daten werden auf einen Server hochgeladen, Ihre Zeichnungen bleiben vollständig privat und lokal. Keine Kontoregistrierung erforderlich, keine Wasserzeichen auf Ihren Exporten und keine Nutzungsbeschränkungen. Es ist die perfekte leichte Alternative zu schwerer Zeichensoftware, wenn Sie eine schnelle Leinwand für visuelles Denken benötigen.',
      'Pädagogen können dieses Tool nutzen, um Konzepte während Online-Unterricht visuell zu erklären. Designer können schnell Wireframes oder UI-Ideen skizzieren, bevor sie zu dedizierten Design-Tools wechseln. Schüler können mathematische Probleme Schritt für Schritt lösen oder Diagramme für ihre Aufgaben zeichnen. Die Möglichkeiten sind endlos, wenn Sie eine leere Leinwand zur Hand haben.',
      'Das Whiteboard ist auf Leistung optimiert und verarbeitet flüssige Pinselstriche auch auf leistungsschwächeren Geräten. Jeder Strich wird einzeln aufgezeichnet, sodass das Rückgängig-System präzise auf Strichebene statt auf Pixelebene arbeitet. Dieser Ansatz gibt Ihnen die volle Kontrolle über Ihren kreativen Prozess und hält gleichzeitig die Oberfläche einfach und ablenkungsfrei.',
    ],
    faq: [
      { q: 'Ist das Whiteboard komplett kostenlos?', a: 'Ja, das Whiteboard ist 100% kostenlos ohne Limits, Wasserzeichen oder Registrierung. Sie können so viele Bilder zeichnen und herunterladen, wie Sie möchten.' },
      { q: 'Funktioniert es auf Mobilgeräten und Tablets?', a: 'Absolut. Das Whiteboard bietet volle Touch-Unterstützung, optimiert für Smartphones und Tablets. Sie können mit dem Finger oder einem Stift auf jedem Touch-Gerät zeichnen.' },
      { q: 'Kann ich meine Zeichenfehler rückgängig machen?', a: 'Ja, die Rückgängig-Funktion unterstützt bis zu 20 vorherige Striche. Klicken Sie auf Rückgängig oder verwenden Sie es mehrmals, um in Ihrer letzten Zeichenhistorie zurückzugehen.' },
      { q: 'In welchem Format wird das Bild heruntergeladen?', a: 'Ihre Zeichnung wird als PNG-Bild in voller Auflösung der Leinwand exportiert. PNG ist ein verlustfreies Format, das die Qualität bewahrt und Transparenz unterstützt.' },
      { q: 'Sind meine Zeichnungsdaten privat?', a: 'Ja. Alles geschieht lokal in Ihrem Browser. Keine Zeichnungsdaten werden an einen Server gesendet. Ihre Skizzen sind vollständig privat und werden nie online gespeichert.' },
    ],
  },
  pt: {
    title: 'Quadro Branco Online Grátis: Desenhe, Esboce e Crie Instantaneamente',
    paragraphs: [
      'O Quadro Branco do ToolKit Online é uma ferramenta de desenho gratuita baseada em navegador que permite esboçar ideias, criar diagramas e desenhar ilustrações sem instalar nenhum software. Esteja você fazendo brainstorming para um projeto, ensinando um conceito a alunos ou simplesmente rabiscando durante uma pausa, este quadro branco oferece uma tela limpa e responsiva pronta para sua criatividade.',
      'Nossa ferramenta de quadro branco possui um pincel versátil com tamanho ajustável de 1 a 50 pixels, uma rica paleta de cores com cores predefinidas e um seletor personalizado, e uma ferramenta borracha dedicada para correções precisas. A função desfazer salva até 20 traços, para que você possa experimentar livremente sem medo de cometer erros irreversíveis. Quando terminar, basta baixar sua criação como uma imagem PNG de alta qualidade.',
      'O suporte ao toque é integrado nativamente, tornando este quadro branco igualmente poderoso em computadores desktop, tablets e smartphones. Você pode alternar entre um fundo branco limpo e um fundo de grade para ajudar a alinhar seus desenhos ou criar diagramas estruturados. O modo grade é especialmente útil para wireframing, esboços técnicos e exercícios de geometria.',
      'Diferente de muitas aplicações de quadro branco online, esta ferramenta funciona inteiramente no seu navegador. Nenhum dado é enviado para nenhum servidor, seus desenhos permanecem completamente privados e locais. Não é necessário registro, sem marcas d\'água nas exportações e sem limites de uso. É a alternativa leve perfeita para software de desenho pesado quando você precisa de uma tela rápida para pensamento visual.',
      'Educadores podem usar esta ferramenta para explicar conceitos visualmente durante aulas online. Designers podem rapidamente esboçar wireframes ou ideias de UI antes de passar para ferramentas de design dedicadas. Estudantes podem resolver problemas matemáticos passo a passo ou desenhar diagramas para seus trabalhos. As possibilidades são infinitas quando você tem uma tela em branco ao seu alcance.',
      'O quadro branco é otimizado para desempenho, lidando com traços suaves mesmo em dispositivos menos potentes. Cada traço é gravado individualmente, permitindo que o sistema de desfazer funcione precisamente no nível do traço em vez do nível do pixel. Esta abordagem lhe dá controle total sobre seu processo criativo enquanto mantém a interface simples e livre de distrações.',
    ],
    faq: [
      { q: 'O quadro branco é completamente grátis?', a: 'Sim, o quadro branco é 100% grátis sem limites, marcas d\'água ou registro. Você pode desenhar e baixar quantas imagens quiser.' },
      { q: 'Funciona em dispositivos móveis e tablets?', a: 'Absolutamente. O quadro branco tem suporte touch completo otimizado para celulares e tablets. Você pode desenhar com o dedo ou uma caneta stylus em qualquer dispositivo touch.' },
      { q: 'Posso desfazer meus erros de desenho?', a: 'Sim, a função desfazer suporta até 20 traços anteriores. Clique no botão Desfazer ou use-o várias vezes para voltar no seu histórico recente de desenho.' },
      { q: 'Em qual formato a imagem é baixada?', a: 'Seu desenho é exportado como imagem PNG na resolução completa da tela. PNG é um formato sem perdas que preserva a qualidade e suporta transparência.' },
      { q: 'Meus dados de desenho são privados?', a: 'Sim. Tudo acontece localmente no seu navegador. Nenhum dado de desenho é enviado a nenhum servidor. Seus esboços são completamente privados e nunca armazenados online.' },
    ],
  },
};

/* ───────── preset colors ───────── */
const PRESET_COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
  '#164e63', '#7c2d12', '#1e3a5f', '#4a1d96',
];

const CANVAS_W = 800;
const CANVAS_H = 600;

/* ───────── component ───────── */
export default function Whiteboard() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['whiteboard']?.[lang];
  const t = useCallback((key: string) => labels[key]?.[lang] ?? labels[key]?.en ?? key, [lang]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [bgMode, setBgMode] = useState<'white' | 'grid'>('white');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const seo = seoContent[lang] || seoContent.en;

  /* ── draw grid helper ── */
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    const step = 20;
    for (let x = step; x < CANVAS_W; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_H);
      ctx.stroke();
    }
    for (let y = step; y < CANVAS_H; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_W, y);
      ctx.stroke();
    }
  }, []);

  /* ── redraw all strokes ── */
  const redraw = useCallback((strokesToDraw: Stroke[], extra?: Stroke | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (bgMode === 'grid') {
      drawGrid(ctx);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    const all = extra ? [...strokesToDraw, extra] : strokesToDraw;
    for (const s of all) {
      if (s.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = s.eraser ? '#ffffff' : s.color;
      ctx.lineWidth = s.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = s.eraser ? 'destination-out' : 'source-over';
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) {
        ctx.lineTo(s.points[i].x, s.points[i].y);
      }
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }, [bgMode, drawGrid]);

  /* ── init canvas ── */
  useEffect(() => {
    redraw(strokes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgMode]);

  /* ── get position from event ── */
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  /* ── drawing handlers ── */
  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getPos(e);
    const newStroke: Stroke = {
      points: [pos],
      color: brushColor,
      size: brushSize,
      eraser: tool === 'eraser',
    };
    setCurrentStroke(newStroke);
    setIsDrawing(true);
  };

  const moveDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentStroke) return;
    e.preventDefault();
    const pos = getPos(e);
    const updated: Stroke = {
      ...currentStroke,
      points: [...currentStroke.points, pos],
    };
    setCurrentStroke(updated);
    redraw(strokes, updated);
  };

  const endDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentStroke) return;
    e.preventDefault();
    const finalStrokes = [...strokes, currentStroke].slice(-20);
    setStrokes(finalStrokes);
    setCurrentStroke(null);
    setIsDrawing(false);
    redraw(finalStrokes);
  };

  /* ── actions ── */
  const handleUndo = () => {
    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);
    redraw(newStrokes);
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke(null);
    redraw([]);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // For download, redraw on a temp canvas with background
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = CANVAS_W;
    tmpCanvas.height = CANVAS_H;
    const tmpCtx = tmpCanvas.getContext('2d');
    if (!tmpCtx) return;

    // Draw background
    if (bgMode === 'grid') {
      tmpCtx.fillStyle = '#ffffff';
      tmpCtx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      tmpCtx.strokeStyle = '#e5e7eb';
      tmpCtx.lineWidth = 1;
      const step = 20;
      for (let x = step; x < CANVAS_W; x += step) {
        tmpCtx.beginPath();
        tmpCtx.moveTo(x, 0);
        tmpCtx.lineTo(x, CANVAS_H);
        tmpCtx.stroke();
      }
      for (let y = step; y < CANVAS_H; y += step) {
        tmpCtx.beginPath();
        tmpCtx.moveTo(0, y);
        tmpCtx.lineTo(CANVAS_W, y);
        tmpCtx.stroke();
      }
    } else {
      tmpCtx.fillStyle = '#ffffff';
      tmpCtx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    // Draw strokes
    for (const s of strokes) {
      if (s.points.length < 2) continue;
      tmpCtx.beginPath();
      tmpCtx.strokeStyle = s.eraser ? '#ffffff' : s.color;
      tmpCtx.lineWidth = s.size;
      tmpCtx.lineCap = 'round';
      tmpCtx.lineJoin = 'round';
      tmpCtx.globalCompositeOperation = s.eraser ? 'destination-out' : 'source-over';
      tmpCtx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) {
        tmpCtx.lineTo(s.points[i].x, s.points[i].y);
      }
      tmpCtx.stroke();
    }
    tmpCtx.globalCompositeOperation = 'source-over';

    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = tmpCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <ToolPageWrapper toolSlug="whiteboard" faqItems={seo.faq}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT?.name ?? 'Whiteboard'}</h1>
        <p className="text-gray-600 mb-6">{toolT?.description ?? ''}</p>

        {/* ── Toolbar ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
          {/* Tool buttons */}
          <div className="flex gap-1">
            <button
              onClick={() => setTool('brush')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${tool === 'brush' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                {t('brush')}
              </span>
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${tool === 'eraser' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                {t('eraser')}
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200 hidden sm:block" />

          {/* Size slider */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">{t('size')}</label>
            <input
              type="range"
              min={1}
              max={50}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-24 accent-blue-600"
            />
            <span className="text-xs text-gray-600 font-mono w-8 text-right">{brushSize}px</span>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200 hidden sm:block" />

          {/* Color palette */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <label className="text-xs text-gray-500 font-medium mr-1">{t('color')}</label>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => { setBrushColor(c); setTool('brush'); }}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${brushColor === c && tool === 'brush' ? 'border-blue-600 scale-110 ring-2 ring-blue-300' : 'border-gray-300'}`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
            {/* Custom color */}
            <div className="relative">
              <input
                type="color"
                value={brushColor}
                onChange={(e) => { setBrushColor(e.target.value); setTool('brush'); }}
                className="w-6 h-6 rounded-full cursor-pointer border-2 border-gray-300 appearance-none bg-transparent"
                title={t('custom')}
                style={{ padding: 0 }}
              />
            </div>
          </div>
        </div>

        {/* ── Action buttons row ── */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4" /></svg>
            {t('undo')}
          </button>
          <button
            onClick={handleClear}
            disabled={strokes.length === 0}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            {t('clearAll')}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            {t('download')}
          </button>

          {/* Background toggle */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium">{t('background')}:</span>
            <button
              onClick={() => setBgMode('white')}
              className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${bgMode === 'white' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {t('white')}
            </button>
            <button
              onClick={() => setBgMode('grid')}
              className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${bgMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {t('grid')}
            </button>
          </div>
        </div>

        {/* ── Canvas ── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="w-full cursor-crosshair touch-none"
            style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
            onMouseDown={startDraw}
            onMouseMove={moveDraw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={moveDraw}
            onTouchEnd={endDraw}
            onTouchCancel={endDraw}
          />
        </div>

        {/* ── Stroke count indicator ── */}
        <div className="mt-2 text-xs text-gray-400 text-right">
          {strokes.length}/20 strokes
        </div>

        {/* ── SEO Article ── */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => (
            <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>
          ))}
        </article>

        {/* ── FAQ Accordion ── */}
        <section className="mt-10 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">FAQ</h2>
          <div className="space-y-2">
            {seo.faq.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-4 py-3 font-medium text-gray-900 flex justify-between items-center"
                >
                  {item.q}
                  <span className="text-gray-400">{openFaq === i ? '\u2212' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-3 text-gray-600">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </ToolPageWrapper>
  );
}
