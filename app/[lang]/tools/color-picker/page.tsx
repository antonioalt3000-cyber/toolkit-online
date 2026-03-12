'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const DEFAULT_COLOR = '#3b82f6';

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

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getWcagGrade(ratio: number): { aa: string; aaLarge: string; aaa: string; aaaLarge: string } {
  return {
    aa: ratio >= 4.5 ? 'Pass' : 'Fail',
    aaLarge: ratio >= 3 ? 'Pass' : 'Fail',
    aaa: ratio >= 7 ? 'Pass' : 'Fail',
    aaaLarge: ratio >= 4.5 ? 'Pass' : 'Fail',
  };
}

const labels: Record<string, Record<Locale, string>> = {
  reset: { en: 'Reset', it: 'Ripristina', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  hexInput: { en: 'Enter HEX', it: 'Inserisci HEX', es: 'Ingresa HEX', fr: 'Entrez HEX', de: 'HEX eingeben', pt: 'Digite HEX' },
  invalidHex: { en: 'Invalid HEX', it: 'HEX non valido', es: 'HEX inválido', fr: 'HEX invalide', de: 'Ungültiges HEX', pt: 'HEX inválido' },
  history: { en: 'Color History', it: 'Cronologia colori', es: 'Historial de colores', fr: 'Historique des couleurs', de: 'Farbverlauf', pt: 'Histórico de cores' },
  clearHistory: { en: 'Clear', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Löschen', pt: 'Limpar' },
  palette: { en: 'Color Palette', it: 'Palette colori', es: 'Paleta de colores', fr: 'Palette de couleurs', de: 'Farbpalette', pt: 'Paleta de cores' },
  complementary: { en: 'Complementary', it: 'Complementare', es: 'Complementario', fr: 'Complémentaire', de: 'Komplementär', pt: 'Complementar' },
  analogous: { en: 'Analogous', it: 'Analogo', es: 'Análogo', fr: 'Analogue', de: 'Analog', pt: 'Análogo' },
  triadic: { en: 'Triadic', it: 'Triadico', es: 'Triádico', fr: 'Triadique', de: 'Triadisch', pt: 'Triádico' },
  contrast: { en: 'Contrast Checker', it: 'Verifica contrasto', es: 'Verificador de contraste', fr: 'Vérificateur de contraste', de: 'Kontrastprüfer', pt: 'Verificador de contraste' },
  withBlack: { en: 'With Black Text', it: 'Con testo nero', es: 'Con texto negro', fr: 'Avec texte noir', de: 'Mit schwarzem Text', pt: 'Com texto preto' },
  withWhite: { en: 'With White Text', it: 'Con testo bianco', es: 'Con texto blanco', fr: 'Avec texte blanc', de: 'Mit weißem Text', pt: 'Com texto branco' },
  ratio: { en: 'Ratio', it: 'Rapporto', es: 'Ratio', fr: 'Ratio', de: 'Verhältnis', pt: 'Razão' },
  normalText: { en: 'Normal Text', it: 'Testo normale', es: 'Texto normal', fr: 'Texte normal', de: 'Normaler Text', pt: 'Texto normal' },
  largeText: { en: 'Large Text', it: 'Testo grande', es: 'Texto grande', fr: 'Grand texte', de: 'Großer Text', pt: 'Texto grande' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
};

export default function ColorPicker() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['color-picker'][lang];
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [hexInput, setHexInput] = useState(DEFAULT_COLOR);
  const [hexError, setHexError] = useState(false);
  const [copied, setCopied] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const t = useCallback((key: string) => labels[key]?.[lang] ?? labels[key]?.en ?? key, [lang]);

  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const formats = [
    { label: 'HEX', value: color.toUpperCase(), bg: 'bg-blue-50 border-blue-200' },
    { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, bg: 'bg-green-50 border-green-200' },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, bg: 'bg-purple-50 border-purple-200' },
  ];

  const copy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(val);
    setTimeout(() => setCopied(''), 2000);
  };

  const updateColor = (newColor: string) => {
    setColor(newColor);
    setHexInput(newColor);
    setHexError(false);
    setHistory(prev => {
      const filtered = prev.filter(c => c !== newColor);
      return [newColor, ...filtered].slice(0, 10);
    });
  };

  const handleHexInput = (val: string) => {
    let v = val;
    if (!v.startsWith('#')) v = '#' + v;
    setHexInput(v);
    if (isValidHex(v)) {
      setColor(v.toLowerCase());
      setHexError(false);
      setHistory(prev => {
        const filtered = prev.filter(c => c !== v.toLowerCase());
        return [v.toLowerCase(), ...filtered].slice(0, 10);
      });
    } else {
      setHexError(v.length >= 4);
    }
  };

  const handleReset = () => {
    setColor(DEFAULT_COLOR);
    setHexInput(DEFAULT_COLOR);
    setHexError(false);
  };

  // Palette generation
  const complementary = hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l);
  const analogous1 = hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l);
  const analogous2 = hslToHex((hsl.h + 330) % 360, hsl.s, hsl.l);
  const triadic1 = hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l);
  const triadic2 = hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l);

  const paletteGroups = [
    { name: t('complementary'), colors: [color, complementary] },
    { name: t('analogous'), colors: [analogous2, color, analogous1] },
    { name: t('triadic'), colors: [color, triadic1, triadic2] },
  ];

  // Contrast checker
  const colorLum = getLuminance(rgb.r, rgb.g, rgb.b);
  const blackLum = getLuminance(0, 0, 0);
  const whiteLum = getLuminance(255, 255, 255);
  const blackRatio = getContrastRatio(colorLum, blackLum);
  const whiteRatio = getContrastRatio(colorLum, whiteLum);
  const blackGrade = getWcagGrade(blackRatio);
  const whiteGrade = getWcagGrade(whiteRatio);

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Color Picker Tool: Find HEX, RGB & HSL Color Codes',
      paragraphs: [
        'Choosing the right colors is essential for web design, graphic design, and UI development. Our free online color picker lets you visually select any color and instantly get its code in HEX, RGB, and HSL formats. Simply click the color wheel, find the perfect shade, and copy the color code you need.',
        'The tool displays three industry-standard color formats simultaneously. HEX codes (like #3B82F6) are the most common format in CSS and HTML. RGB values specify the red, green, and blue components on a 0-255 scale, widely used in CSS and design software. HSL (Hue, Saturation, Lightness) provides an intuitive way to understand and manipulate colors.',
        'Understanding color formats is key to professional design work. HEX is compact and widely supported, making it the default choice for web stylesheets. RGB gives you direct control over individual color channels, which is useful for programmatic color manipulation. HSL is the most human-friendly format, letting you adjust hue (the color itself), saturation (how vivid it is), and lightness (how bright or dark it is) independently.',
        'Each color value can be copied to your clipboard with a single click, ready to paste into your CSS, design tool, or documentation. Whether you are building a website, creating a brand color palette, or matching colors for a presentation, this tool gives you instant access to all the color codes you need.',
      ],
      faq: [
        { q: 'What is the difference between HEX, RGB, and HSL color formats?', a: 'HEX uses a 6-character hexadecimal code (#RRGGBB). RGB specifies red, green, and blue values from 0-255. HSL uses hue (0-360 degrees), saturation (0-100%), and lightness (0-100%). All three describe the same colors, just in different mathematical representations.' },
        { q: 'How do I convert a HEX color to RGB?', a: 'Split the HEX code into pairs (e.g., #3B82F6 becomes 3B, 82, F6) and convert each pair from hexadecimal to decimal. So #3B82F6 = rgb(59, 130, 246). This tool does this conversion automatically.' },
        { q: 'What is the best color format for CSS?', a: 'HEX is the most commonly used format in CSS and is supported everywhere. However, HSL is increasingly popular because it is easier to create color variations by adjusting saturation and lightness. RGB is useful when you need to set opacity with rgba().' },
        { q: 'How do I find the exact color code from a website?', a: 'Use your browser\'s developer tools (F12) to inspect elements and find color values in the CSS. You can also use browser extensions like ColorZilla. Once you have the color, paste it into this tool to get all format conversions.' },
        { q: 'What does HSL stand for and when should I use it?', a: 'HSL stands for Hue, Saturation, Lightness. Use HSL when you want to create color palettes with consistent saturation and lightness, or when you need to programmatically generate lighter/darker variations of a base color.' },
      ],
    },
    it: {
      title: 'Strumento Selettore Colori: Trova Codici Colore HEX, RGB e HSL',
      paragraphs: [
        'Scegliere i colori giusti è essenziale per il web design, il graphic design e lo sviluppo UI. Il nostro selettore colori online gratuito ti permette di selezionare visivamente qualsiasi colore e ottenere istantaneamente il suo codice in formato HEX, RGB e HSL.',
        'Lo strumento mostra simultaneamente tre formati colore standard dell\'industria. I codici HEX (come #3B82F6) sono il formato più comune in CSS e HTML. I valori RGB specificano le componenti rosso, verde e blu su una scala 0-255. HSL (Tonalità, Saturazione, Luminosità) fornisce un modo intuitivo per capire e manipolare i colori.',
        'Comprendere i formati colore è fondamentale per il lavoro di design professionale. HEX è compatto e ampiamente supportato. RGB offre controllo diretto sui singoli canali colore. HSL è il formato più intuitivo, permettendo di regolare tonalità, saturazione e luminosità indipendentemente.',
        'Ogni valore colore può essere copiato negli appunti con un solo clic, pronto per essere incollato nel tuo CSS, strumento di design o documentazione.',
      ],
      faq: [
        { q: 'Qual è la differenza tra i formati colore HEX, RGB e HSL?', a: 'HEX usa un codice esadecimale a 6 caratteri (#RRGGBB). RGB specifica i valori rosso, verde e blu da 0-255. HSL usa tonalità (0-360 gradi), saturazione (0-100%) e luminosità (0-100%). Tutti e tre descrivono gli stessi colori in rappresentazioni matematiche diverse.' },
        { q: 'Come converto un colore HEX in RGB?', a: 'Dividi il codice HEX in coppie (es. #3B82F6 diventa 3B, 82, F6) e converti ogni coppia da esadecimale a decimale. Quindi #3B82F6 = rgb(59, 130, 246). Questo strumento esegue la conversione automaticamente.' },
        { q: 'Qual è il miglior formato colore per CSS?', a: 'HEX è il formato più usato in CSS ed è supportato ovunque. Tuttavia, HSL è sempre più popolare perché è più facile creare variazioni di colore regolando saturazione e luminosità.' },
        { q: 'Come trovo il codice colore esatto di un sito web?', a: 'Usa gli strumenti per sviluppatori del browser (F12) per ispezionare gli elementi e trovare i valori colore nel CSS. Puoi anche usare estensioni come ColorZilla.' },
        { q: 'Cosa significa HSL e quando dovrei usarlo?', a: 'HSL sta per Tonalità, Saturazione, Luminosità. Usalo quando vuoi creare palette di colori con saturazione e luminosità coerenti, o quando devi generare programmaticamente variazioni più chiare/scure di un colore base.' },
      ],
    },
    es: {
      title: 'Herramienta Selector de Color: Encuentra Códigos de Color HEX, RGB y HSL',
      paragraphs: [
        'Elegir los colores correctos es esencial para el diseño web, diseño gráfico y desarrollo de interfaces. Nuestro selector de color online gratuito te permite seleccionar visualmente cualquier color y obtener al instante su código en formatos HEX, RGB y HSL.',
        'La herramienta muestra simultáneamente tres formatos de color estándar de la industria. Los códigos HEX (como #3B82F6) son el formato más común en CSS y HTML. Los valores RGB especifican los componentes rojo, verde y azul en escala 0-255. HSL proporciona una forma intuitiva de entender y manipular colores.',
        'Entender los formatos de color es clave para el trabajo de diseño profesional. HEX es compacto y ampliamente soportado. RGB ofrece control directo sobre canales individuales. HSL es el formato más intuitivo, permitiendo ajustar tono, saturación y luminosidad independientemente.',
        'Cada valor de color puede copiarse al portapapeles con un solo clic, listo para pegar en tu CSS, herramienta de diseño o documentación.',
      ],
      faq: [
        { q: '¿Cuál es la diferencia entre los formatos HEX, RGB y HSL?', a: 'HEX usa un código hexadecimal de 6 caracteres (#RRGGBB). RGB especifica valores rojo, verde y azul de 0-255. HSL usa tono (0-360 grados), saturación (0-100%) y luminosidad (0-100%).' },
        { q: '¿Cómo convierto un color HEX a RGB?', a: 'Divide el código HEX en pares (ej. #3B82F6 se convierte en 3B, 82, F6) y convierte cada par de hexadecimal a decimal. Así #3B82F6 = rgb(59, 130, 246).' },
        { q: '¿Cuál es el mejor formato de color para CSS?', a: 'HEX es el más usado en CSS. Sin embargo, HSL es cada vez más popular porque facilita crear variaciones de color ajustando saturación y luminosidad.' },
        { q: '¿Cómo encuentro el código de color exacto de un sitio web?', a: 'Usa las herramientas de desarrollador del navegador (F12) para inspeccionar elementos y encontrar valores de color en el CSS.' },
        { q: '¿Qué significa HSL y cuándo debo usarlo?', a: 'HSL significa Tono, Saturación, Luminosidad. Úsalo cuando quieras crear paletas de color con saturación y luminosidad consistentes.' },
      ],
    },
    fr: {
      title: 'Sélecteur de Couleur : Trouvez les Codes HEX, RGB et HSL',
      paragraphs: [
        'Choisir les bonnes couleurs est essentiel pour le design web, le design graphique et le développement d\'interfaces. Notre sélecteur de couleur en ligne gratuit vous permet de sélectionner visuellement n\'importe quelle couleur et d\'obtenir instantanément son code en formats HEX, RGB et HSL.',
        'L\'outil affiche simultanément trois formats de couleur standard. Les codes HEX (comme #3B82F6) sont le format le plus courant en CSS et HTML. Les valeurs RGB spécifient les composantes rouge, vert et bleu sur une échelle 0-255. HSL fournit une manière intuitive de comprendre et manipuler les couleurs.',
        'Comprendre les formats de couleur est essentiel pour le travail de design professionnel. HEX est compact et largement supporté. RGB offre un contrôle direct sur les canaux individuels. HSL est le format le plus intuitif.',
        'Chaque valeur de couleur peut être copiée dans le presse-papiers en un clic, prête à être collée dans votre CSS, outil de design ou documentation.',
      ],
      faq: [
        { q: 'Quelle est la différence entre les formats HEX, RGB et HSL ?', a: 'HEX utilise un code hexadécimal à 6 caractères (#RRGGBB). RGB spécifie les valeurs rouge, vert et bleu de 0 à 255. HSL utilise la teinte (0-360 degrés), la saturation (0-100%) et la luminosité (0-100%).' },
        { q: 'Comment convertir une couleur HEX en RGB ?', a: 'Divisez le code HEX en paires et convertissez chaque paire d\'hexadécimal en décimal. #3B82F6 = rgb(59, 130, 246). Cet outil fait la conversion automatiquement.' },
        { q: 'Quel est le meilleur format de couleur pour CSS ?', a: 'HEX est le plus utilisé en CSS. Cependant, HSL est de plus en plus populaire car il facilite la création de variations de couleur.' },
        { q: 'Comment trouver le code couleur exact d\'un site web ?', a: 'Utilisez les outils de développement du navigateur (F12) pour inspecter les éléments et trouver les valeurs de couleur dans le CSS.' },
        { q: 'Que signifie HSL et quand l\'utiliser ?', a: 'HSL signifie Teinte, Saturation, Luminosité. Utilisez-le pour créer des palettes de couleurs avec une saturation et luminosité cohérentes.' },
      ],
    },
    de: {
      title: 'Farbwähler-Tool: HEX, RGB & HSL Farbcodes Finden',
      paragraphs: [
        'Die richtigen Farben zu wählen ist essentiell für Webdesign, Grafikdesign und UI-Entwicklung. Unser kostenloser Online-Farbwähler ermöglicht es Ihnen, visuell jede Farbe auszuwählen und sofort deren Code in HEX, RGB und HSL Formaten zu erhalten.',
        'Das Tool zeigt gleichzeitig drei branchenübliche Farbformate an. HEX-Codes (wie #3B82F6) sind das gängigste Format in CSS und HTML. RGB-Werte geben die Rot-, Grün- und Blau-Komponenten auf einer Skala von 0-255 an. HSL bietet einen intuitiven Weg, Farben zu verstehen und zu manipulieren.',
        'Das Verständnis von Farbformaten ist der Schlüssel zu professioneller Designarbeit. HEX ist kompakt und weit verbreitet. RGB gibt direkte Kontrolle über einzelne Farbkanäle. HSL ist das intuitivste Format.',
        'Jeder Farbwert kann mit einem Klick in die Zwischenablage kopiert werden, bereit zum Einfügen in Ihr CSS, Design-Tool oder Dokumentation.',
      ],
      faq: [
        { q: 'Was ist der Unterschied zwischen HEX, RGB und HSL?', a: 'HEX verwendet einen 6-stelligen Hexadezimalcode (#RRGGBB). RGB gibt Rot-, Grün- und Blauwerte von 0-255 an. HSL verwendet Farbton (0-360 Grad), Sättigung (0-100%) und Helligkeit (0-100%).' },
        { q: 'Wie konvertiere ich eine HEX-Farbe in RGB?', a: 'Teilen Sie den HEX-Code in Paare auf und konvertieren Sie jedes Paar von Hexadezimal in Dezimal. #3B82F6 = rgb(59, 130, 246). Dieses Tool führt die Konvertierung automatisch durch.' },
        { q: 'Welches Farbformat ist am besten für CSS?', a: 'HEX ist das am häufigsten verwendete Format in CSS. HSL wird jedoch immer beliebter, da es einfacher ist, Farbvariationen zu erstellen.' },
        { q: 'Wie finde ich den genauen Farbcode einer Website?', a: 'Verwenden Sie die Entwicklertools des Browsers (F12), um Elemente zu inspizieren und Farbwerte im CSS zu finden.' },
        { q: 'Was bedeutet HSL und wann sollte ich es verwenden?', a: 'HSL steht für Farbton, Sättigung, Helligkeit. Verwenden Sie es, um Farbpaletten mit konsistenter Sättigung und Helligkeit zu erstellen.' },
      ],
    },
    pt: {
      title: 'Seletor de Cores: Encontre Códigos de Cor HEX, RGB e HSL',
      paragraphs: [
        'Escolher as cores certas é essencial para design web, design gráfico e desenvolvimento de interfaces. Nosso seletor de cores online gratuito permite selecionar visualmente qualquer cor e obter instantaneamente seu código nos formatos HEX, RGB e HSL.',
        'A ferramenta exibe simultaneamente três formatos de cor padrão da indústria. Códigos HEX (como #3B82F6) são o formato mais comum em CSS e HTML. Valores RGB especificam os componentes vermelho, verde e azul na escala 0-255. HSL fornece uma forma intuitiva de entender e manipular cores.',
        'Entender formatos de cor é fundamental para trabalho de design profissional. HEX é compacto e amplamente suportado. RGB oferece controle direto sobre canais individuais. HSL é o formato mais intuitivo.',
        'Cada valor de cor pode ser copiado para a área de transferência com um único clique, pronto para colar no seu CSS, ferramenta de design ou documentação.',
      ],
      faq: [
        { q: 'Qual é a diferença entre os formatos HEX, RGB e HSL?', a: 'HEX usa um código hexadecimal de 6 caracteres (#RRGGBB). RGB especifica valores vermelho, verde e azul de 0-255. HSL usa matiz (0-360 graus), saturação (0-100%) e luminosidade (0-100%).' },
        { q: 'Como converto uma cor HEX para RGB?', a: 'Divida o código HEX em pares e converta cada par de hexadecimal para decimal. #3B82F6 = rgb(59, 130, 246). Esta ferramenta faz a conversão automaticamente.' },
        { q: 'Qual é o melhor formato de cor para CSS?', a: 'HEX é o mais usado em CSS. No entanto, HSL é cada vez mais popular por facilitar a criação de variações de cor.' },
        { q: 'Como encontro o código de cor exato de um site?', a: 'Use as ferramentas de desenvolvedor do navegador (F12) para inspecionar elementos e encontrar valores de cor no CSS.' },
        { q: 'O que significa HSL e quando devo usá-lo?', a: 'HSL significa Matiz, Saturação, Luminosidade. Use quando quiser criar paletas de cores com saturação e luminosidade consistentes.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="color-picker" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Color picker + preview + reset */}
          <div className="flex gap-4 items-center">
            <input type="color" value={color} onChange={(e) => updateColor(e.target.value)} className="w-20 h-20 rounded-lg cursor-pointer border-0" />
            <div className="w-full h-20 rounded-lg border border-gray-200" style={{ backgroundColor: color }} />
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              {t('reset')}
            </button>
          </div>

          {/* Manual HEX input with validation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('hexInput')}</label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleHexInput(e.target.value)}
                placeholder="#3B82F6"
                maxLength={7}
                className={`flex-1 px-4 py-2 rounded-lg border font-mono text-sm ${hexError ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'} focus:outline-none focus:ring-2`}
              />
              {hexError && <span className="text-red-500 text-xs font-medium whitespace-nowrap">{t('invalidHex')}</span>}
            </div>
          </div>

          {/* Result cards with colored backgrounds */}
          <div className="grid gap-3">
            {formats.map((f) => (
              <div key={f.label} className={`flex items-center gap-3 rounded-lg px-4 py-3 border ${f.bg}`}>
                <span className="text-sm font-semibold text-gray-600 w-10">{f.label}</span>
                <code className="flex-1 font-mono text-gray-900">{f.value}</code>
                <button
                  onClick={() => copy(f.value)}
                  className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {copied === f.value ? t('copied') : t('copy')}
                </button>
              </div>
            ))}
          </div>

          {/* Color History */}
          {history.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">{t('history')}</h3>
                <button
                  onClick={() => setHistory([])}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {t('clearHistory')}
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {history.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setColor(c); setHexInput(c); setHexError(false); }}
                    title={c.toUpperCase()}
                    className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Color Palette Generator */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">{t('palette')}</h2>
          {paletteGroups.map((group) => (
            <div key={group.name}>
              <p className="text-sm font-medium text-gray-600 mb-2">{group.name}</p>
              <div className="flex gap-2">
                {group.colors.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => { copy(c.toUpperCase()); }}
                    title={c.toUpperCase()}
                    className="flex-1 h-12 rounded-lg border border-gray-200 cursor-pointer hover:scale-105 transition-transform relative group"
                    style={{ backgroundColor: c }}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: getLuminance(...Object.values(hexToRgb(c)) as [number, number, number]) > 0.5 ? '#000' : '#fff' }}>
                      {c.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contrast Checker */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">{t('contrast')}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Black text on color */}
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <div className="px-4 py-6 text-center" style={{ backgroundColor: color }}>
                <span className="text-lg font-bold" style={{ color: '#000000' }}>{t('withBlack')}</span>
              </div>
              <div className="px-4 py-3 bg-gray-50 space-y-1 text-sm">
                <p className="font-medium">{t('ratio')}: <span className="font-mono">{blackRatio.toFixed(2)}:1</span></p>
                <p>AA {t('normalText')}: <span className={blackGrade.aa === 'Pass' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{blackGrade.aa}</span></p>
                <p>AA {t('largeText')}: <span className={blackGrade.aaLarge === 'Pass' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{blackGrade.aaLarge}</span></p>
                <p>AAA {t('normalText')}: <span className={blackGrade.aaa === 'Pass' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{blackGrade.aaa}</span></p>
                <p>AAA {t('largeText')}: <span className={blackGrade.aaaLarge === 'Pass' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{blackGrade.aaaLarge}</span></p>
              </div>
            </div>

            {/* White text on color */}
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <div className="px-4 py-6 text-center" style={{ backgroundColor: color }}>
                <span className="text-lg font-bold" style={{ color: '#ffffff' }}>{t('withWhite')}</span>
              </div>
              <div className="px-4 py-3 bg-gray-50 space-y-1 text-sm">
                <p className="font-medium">{t('ratio')}: <span className="font-mono">{whiteRatio.toFixed(2)}:1</span></p>
                <p>AA {t('normalText')}: <span className={whiteGrade.aa === 'Pass' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{whiteGrade.aa}</span></p>
                <p>AA {t('largeText')}: <span className={whiteGrade.aaLarge === 'Pass' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{whiteGrade.aaLarge}</span></p>
                <p>AAA {t('normalText')}: <span className={whiteGrade.aaa === 'Pass' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{whiteGrade.aaa}</span></p>
                <p>AAA {t('largeText')}: <span className={whiteGrade.aaaLarge === 'Pass' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{whiteGrade.aaaLarge}</span></p>
              </div>
            </div>
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
