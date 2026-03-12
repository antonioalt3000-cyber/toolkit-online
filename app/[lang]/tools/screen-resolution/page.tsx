'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

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

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Screen Resolution Checker: Detect Your Display Properties',
      paragraphs: [
        'Knowing your screen resolution and display properties is essential for web developers testing responsive designs, graphic designers creating assets at the right dimensions, and users troubleshooting display issues. Our screen resolution checker detects all key display properties of your current device in real time.',
        'The tool reports your full screen resolution (the total pixels your monitor can display), viewport size (the browser window area available for web content), device pixel ratio (how many physical pixels correspond to one CSS pixel on high-DPI displays), color depth (the number of bits used per pixel for color), screen orientation, and touch capability.',
        'Device pixel ratio (DPR) is particularly important for modern web development. A DPR of 2 means the device uses 4 physical pixels for every CSS pixel (2x width and 2x height), which is common on Retina displays and modern smartphones. Understanding DPR helps developers serve appropriately sized images and ensure crisp text rendering on high-resolution screens.',
        'The viewport dimensions update in real time as you resize your browser window, making this tool perfect for testing responsive breakpoints. Web developers can use these values to verify that their CSS media queries trigger at the correct viewport widths, ensuring their designs adapt properly to different screen sizes.',
      ],
      faq: [
        { q: 'What is the difference between screen resolution and viewport size?', a: 'Screen resolution is the total number of pixels your monitor can display (e.g., 1920x1080). Viewport size is the area within the browser window available for web content, which is smaller due to browser chrome (address bar, tabs, etc.) and operating system taskbars.' },
        { q: 'What is device pixel ratio (DPR)?', a: 'DPR indicates how many physical pixels the device uses for each CSS pixel. A DPR of 1 means 1:1 mapping. A DPR of 2 (Retina) means 4 physical pixels per CSS pixel, resulting in sharper text and images. Modern phones often have DPR of 3 or higher.' },
        { q: 'Why does my screen resolution look different from what I expected?', a: 'Your OS may use display scaling (e.g., 150% scaling on Windows). The reported CSS resolution reflects the scaled values, not the native panel resolution. To see the actual hardware resolution, multiply the CSS resolution by the device pixel ratio.' },
        { q: 'What does color depth mean?', a: 'Color depth indicates how many bits are used per pixel to represent color. 24-bit (8 bits per RGB channel) supports 16.7 million colors. 32-bit adds an alpha channel for transparency. Most modern displays use 24-bit or 32-bit color depth.' },
        { q: 'How can I use this tool for responsive web design testing?', a: 'Resize your browser window while watching the viewport dimensions update in real time. This helps you identify exact breakpoint values for your CSS media queries and verify that your responsive layout switches correctly at different widths.' },
      ],
    },
    it: {
      title: 'Verifica Risoluzione Schermo: Rileva le Proprietà del Tuo Display',
      paragraphs: [
        'Conoscere la risoluzione dello schermo e le proprietà del display è essenziale per sviluppatori web che testano design responsivi, designer grafici che creano risorse alle dimensioni giuste e utenti che risolvono problemi di visualizzazione. Il nostro strumento rileva tutte le proprietà chiave del display in tempo reale.',
        'Lo strumento riporta la risoluzione completa dello schermo, la dimensione del viewport (l\'area della finestra del browser disponibile per il contenuto web), il rapporto pixel del dispositivo, la profondità colore, l\'orientamento dello schermo e la capacità touch.',
        'Il rapporto pixel del dispositivo (DPR) è particolarmente importante per lo sviluppo web moderno. Un DPR di 2 significa che il dispositivo usa 4 pixel fisici per ogni pixel CSS, comune sui display Retina e smartphone moderni.',
        'Le dimensioni del viewport si aggiornano in tempo reale mentre ridimensioni la finestra del browser, rendendo questo strumento perfetto per testare i breakpoint responsivi.',
      ],
      faq: [
        { q: 'Qual è la differenza tra risoluzione dello schermo e dimensione del viewport?', a: 'La risoluzione dello schermo è il numero totale di pixel che il monitor può visualizzare. La dimensione del viewport è l\'area nella finestra del browser disponibile per il contenuto web, più piccola a causa della barra degli indirizzi, delle schede e delle barre delle applicazioni.' },
        { q: 'Cos\'è il rapporto pixel del dispositivo (DPR)?', a: 'Il DPR indica quanti pixel fisici il dispositivo usa per ogni pixel CSS. Un DPR di 2 (Retina) significa 4 pixel fisici per pixel CSS, risultando in testi e immagini più nitidi.' },
        { q: 'Perché la risoluzione del mio schermo sembra diversa da quella attesa?', a: 'Il sistema operativo potrebbe usare il ridimensionamento del display (es. 150% su Windows). La risoluzione CSS riportata riflette i valori scalati. Moltiplica per il DPR per ottenere la risoluzione hardware effettiva.' },
        { q: 'Cosa significa profondità colore?', a: 'La profondità colore indica quanti bit vengono usati per pixel per rappresentare il colore. 24 bit supportano 16,7 milioni di colori. 32 bit aggiungono un canale alfa per la trasparenza.' },
        { q: 'Come posso usare questo strumento per testare il design responsivo?', a: 'Ridimensiona la finestra del browser osservando le dimensioni del viewport aggiornarsi in tempo reale. Questo aiuta a identificare i valori esatti dei breakpoint per le media query CSS.' },
      ],
    },
    es: {
      title: 'Verificador de Resolución de Pantalla: Detecta las Propiedades de tu Display',
      paragraphs: [
        'Conocer la resolución de pantalla es esencial para desarrolladores web, diseñadores gráficos y usuarios que solucionan problemas de visualización. Nuestro verificador detecta todas las propiedades clave de tu pantalla en tiempo real.',
        'La herramienta reporta la resolución completa, el tamaño del viewport, la proporción de píxeles del dispositivo, la profundidad de color, la orientación y la capacidad táctil.',
        'La proporción de píxeles del dispositivo (DPR) es particularmente importante. Un DPR de 2 significa que el dispositivo usa 4 píxeles físicos por cada píxel CSS, común en pantallas Retina y smartphones modernos.',
        'Las dimensiones del viewport se actualizan en tiempo real al redimensionar la ventana del navegador, perfecto para probar breakpoints responsivos.',
      ],
      faq: [
        { q: '¿Cuál es la diferencia entre resolución de pantalla y tamaño del viewport?', a: 'La resolución de pantalla es el total de píxeles del monitor. El viewport es el área dentro del navegador disponible para contenido web, más pequeña por las barras del navegador y del sistema.' },
        { q: '¿Qué es la proporción de píxeles del dispositivo (DPR)?', a: 'El DPR indica cuántos píxeles físicos usa el dispositivo por cada píxel CSS. Un DPR de 2 (Retina) significa 4 píxeles físicos por píxel CSS.' },
        { q: '¿Por qué mi resolución parece diferente a la esperada?', a: 'El sistema operativo puede usar escalado de pantalla (ej. 150% en Windows). La resolución CSS reportada refleja los valores escalados.' },
        { q: '¿Qué significa profundidad de color?', a: 'La profundidad de color indica cuántos bits se usan por píxel para representar el color. 24 bits soportan 16,7 millones de colores.' },
        { q: '¿Cómo uso esta herramienta para probar diseño responsivo?', a: 'Redimensiona la ventana del navegador observando las dimensiones del viewport actualizarse en tiempo real para verificar tus breakpoints CSS.' },
      ],
    },
    fr: {
      title: 'Vérificateur de Résolution d\'Écran : Détectez les Propriétés de Votre Écran',
      paragraphs: [
        'Connaître la résolution et les propriétés de votre écran est essentiel pour les développeurs web, designers graphiques et utilisateurs résolvant des problèmes d\'affichage. Notre outil détecte toutes les propriétés clés en temps réel.',
        'L\'outil rapporte la résolution complète, la taille du viewport, le ratio de pixels, la profondeur de couleur, l\'orientation et la capacité tactile.',
        'Le ratio de pixels (DPR) est particulièrement important. Un DPR de 2 signifie 4 pixels physiques par pixel CSS, courant sur les écrans Retina et smartphones modernes.',
        'Les dimensions du viewport se mettent à jour en temps réel lors du redimensionnement de la fenêtre, parfait pour tester les breakpoints responsifs.',
      ],
      faq: [
        { q: 'Quelle est la différence entre résolution d\'écran et taille du viewport ?', a: 'La résolution d\'écran est le nombre total de pixels du moniteur. Le viewport est la zone dans la fenêtre du navigateur disponible pour le contenu web.' },
        { q: 'Qu\'est-ce que le ratio de pixels (DPR) ?', a: 'Le DPR indique combien de pixels physiques le dispositif utilise par pixel CSS. Un DPR de 2 (Retina) signifie 4 pixels physiques par pixel CSS.' },
        { q: 'Pourquoi ma résolution semble-t-elle différente de celle attendue ?', a: 'Votre OS peut utiliser un mise à l\'échelle (ex. 150% sur Windows). La résolution CSS reflète les valeurs mises à l\'échelle.' },
        { q: 'Que signifie la profondeur de couleur ?', a: 'La profondeur de couleur indique combien de bits sont utilisés par pixel. 24 bits supportent 16,7 millions de couleurs.' },
        { q: 'Comment utiliser cet outil pour tester le design responsive ?', a: 'Redimensionnez la fenêtre du navigateur et observez les dimensions du viewport se mettre à jour en temps réel pour vérifier vos breakpoints CSS.' },
      ],
    },
    de: {
      title: 'Bildschirmauflösung Prüfen: Display-Eigenschaften Erkennen',
      paragraphs: [
        'Die Kenntnis der Bildschirmauflösung und Display-Eigenschaften ist essentiell für Webentwickler, Grafikdesigner und Benutzer, die Anzeigeprobleme beheben. Unser Tool erkennt alle wichtigen Display-Eigenschaften in Echtzeit.',
        'Das Tool meldet die vollständige Auflösung, Viewport-Größe, Geräte-Pixelverhältnis, Farbtiefe, Bildschirmausrichtung und Touch-Fähigkeit.',
        'Das Geräte-Pixelverhältnis (DPR) ist besonders wichtig. Ein DPR von 2 bedeutet 4 physische Pixel pro CSS-Pixel, üblich bei Retina-Displays und modernen Smartphones.',
        'Die Viewport-Dimensionen aktualisieren sich in Echtzeit beim Ändern der Fenstergröße, ideal zum Testen von Responsive-Breakpoints.',
      ],
      faq: [
        { q: 'Was ist der Unterschied zwischen Bildschirmauflösung und Viewport?', a: 'Die Bildschirmauflösung ist die Gesamtzahl der Pixel des Monitors. Der Viewport ist der Bereich im Browserfenster für Webinhalte.' },
        { q: 'Was ist das Geräte-Pixelverhältnis (DPR)?', a: 'DPR gibt an, wie viele physische Pixel pro CSS-Pixel verwendet werden. Ein DPR von 2 (Retina) bedeutet 4 physische Pixel pro CSS-Pixel.' },
        { q: 'Warum sieht meine Auflösung anders aus als erwartet?', a: 'Ihr Betriebssystem kann Display-Skalierung verwenden (z.B. 150% unter Windows). Die CSS-Auflösung zeigt die skalierten Werte.' },
        { q: 'Was bedeutet Farbtiefe?', a: 'Farbtiefe gibt an, wie viele Bits pro Pixel für Farbdarstellung verwendet werden. 24 Bit unterstützen 16,7 Millionen Farben.' },
        { q: 'Wie nutze ich dieses Tool für Responsive-Tests?', a: 'Ändern Sie die Fenstergröße und beobachten Sie die Viewport-Dimensionen in Echtzeit, um Ihre CSS-Breakpoints zu überprüfen.' },
      ],
    },
    pt: {
      title: 'Verificador de Resolução de Tela: Detecte as Propriedades do Seu Display',
      paragraphs: [
        'Conhecer a resolução da tela é essencial para desenvolvedores web, designers gráficos e usuários resolvendo problemas de exibição. Nossa ferramenta detecta todas as propriedades-chave do display em tempo real.',
        'A ferramenta reporta a resolução completa, tamanho do viewport, proporção de pixels do dispositivo, profundidade de cor, orientação e capacidade touch.',
        'A proporção de pixels do dispositivo (DPR) é particularmente importante. Um DPR de 2 significa 4 pixels físicos por pixel CSS, comum em telas Retina e smartphones modernos.',
        'As dimensões do viewport se atualizam em tempo real ao redimensionar a janela do navegador, perfeito para testar breakpoints responsivos.',
      ],
      faq: [
        { q: 'Qual é a diferença entre resolução da tela e tamanho do viewport?', a: 'A resolução da tela é o total de pixels do monitor. O viewport é a área na janela do navegador disponível para conteúdo web.' },
        { q: 'O que é a proporção de pixels do dispositivo (DPR)?', a: 'DPR indica quantos pixels físicos o dispositivo usa por pixel CSS. Um DPR de 2 (Retina) significa 4 pixels físicos por pixel CSS.' },
        { q: 'Por que minha resolução parece diferente do esperado?', a: 'Seu SO pode usar escalonamento de tela (ex. 150% no Windows). A resolução CSS reportada reflete os valores escalonados.' },
        { q: 'O que significa profundidade de cor?', a: 'Profundidade de cor indica quantos bits são usados por pixel para representar cor. 24 bits suportam 16,7 milhões de cores.' },
        { q: 'Como uso esta ferramenta para testar design responsivo?', a: 'Redimensione a janela do navegador observando as dimensões do viewport se atualizarem em tempo real para verificar seus breakpoints CSS.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="screen-resolution" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
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
