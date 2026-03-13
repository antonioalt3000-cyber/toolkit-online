'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

function hexToRgb(hex: string): [number, number, number] | null {
  const match = hex.replace('#', '').match(/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
  if (!match) return null;
  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255),
  ];
}

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  if (r === 0 && g === 0 && b === 0) return [0, 0, 0, 100];
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const k = 1 - Math.max(rr, gg, bb);
  const c = (1 - rr - k) / (1 - k);
  const m = (1 - gg - k) / (1 - k);
  const y = (1 - bb - k) / (1 - k);
  return [Math.round(c * 100), Math.round(m * 100), Math.round(y * 100), Math.round(k * 100)];
}

const DEFAULT_HEX = 'FF5733';

export default function ColorConverter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['color-converter'][lang];

  const [mode, setMode] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  const [hexInput, setHexInput] = useState(DEFAULT_HEX);
  const [rInput, setRInput] = useState('255');
  const [gInput, setGInput] = useState('87');
  const [bInput, setBInput] = useState('51');
  const [hInput, setHInput] = useState('11');
  const [sInput, setSInput] = useState('100');
  const [lInput, setLInput] = useState('60');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const labels: Record<string, Record<Locale, string>> = {
    inputMode: { en: 'Input Format', it: 'Formato di Input', es: 'Formato de Entrada', fr: 'Format d\'Entr\u00e9e', de: 'Eingabeformat', pt: 'Formato de Entrada' },
    results: { en: 'Conversion Results', it: 'Risultati Conversione', es: 'Resultados de Conversi\u00f3n', fr: 'R\u00e9sultats de Conversion', de: 'Konvertierungsergebnisse', pt: 'Resultados da Convers\u00e3o' },
    preview: { en: 'Color Preview', it: 'Anteprima Colore', es: 'Vista Previa del Color', fr: 'Aper\u00e7u de la Couleur', de: 'Farbvorschau', pt: 'Pr\u00e9-visualiza\u00e7\u00e3o da Cor' },
    invalid: { en: 'Invalid color value', it: 'Valore colore non valido', es: 'Valor de color no v\u00e1lido', fr: 'Valeur de couleur invalide', de: 'Ung\u00fcltiger Farbwert', pt: 'Valor de cor inv\u00e1lido' },
    copied: { en: 'Copied!', it: 'Copiato!', es: '\u00a1Copiado!', fr: 'Copi\u00e9 !', de: 'Kopiert!', pt: 'Copiado!' },
    copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
    reset: { en: 'Reset', it: 'Ripristina', es: 'Restablecer', fr: 'R\u00e9initialiser', de: 'Zur\u00fccksetzen', pt: 'Redefinir' },
    history: { en: 'Recent Colors', it: 'Colori Recenti', es: 'Colores Recientes', fr: 'Couleurs R\u00e9centes', de: 'Letzte Farben', pt: 'Cores Recentes' },
    clearHistory: { en: 'Clear', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'L\u00f6schen', pt: 'Limpar' },
    invalidHex: { en: 'Enter a valid 6-digit HEX code', it: 'Inserisci un codice HEX valido a 6 cifre', es: 'Introduce un c\u00f3digo HEX v\u00e1lido de 6 d\u00edgitos', fr: 'Entrez un code HEX valide \u00e0 6 chiffres', de: 'Geben Sie einen g\u00fcltigen 6-stelligen HEX-Code ein', pt: 'Insira um c\u00f3digo HEX v\u00e1lido de 6 d\u00edgitos' },
    invalidRgb: { en: 'RGB values must be between 0 and 255', it: 'I valori RGB devono essere tra 0 e 255', es: 'Los valores RGB deben estar entre 0 y 255', fr: 'Les valeurs RGB doivent \u00eatre entre 0 et 255', de: 'RGB-Werte m\u00fcssen zwischen 0 und 255 liegen', pt: 'Os valores RGB devem estar entre 0 e 255' },
    invalidHsl: { en: 'H: 0-360, S: 0-100, L: 0-100', it: 'H: 0-360, S: 0-100, L: 0-100', es: 'H: 0-360, S: 0-100, L: 0-100', fr: 'H: 0-360, S: 0-100, L: 0-100', de: 'H: 0-360, S: 0-100, L: 0-100', pt: 'H: 0-360, S: 0-100, L: 0-100' },
  };

  const getColor = (): { hex: string; rgb: [number, number, number]; hsl: [number, number, number]; cmyk: [number, number, number, number] } | null => {
    try {
      if (mode === 'hex') {
        const rgb = hexToRgb(hexInput);
        if (!rgb) return null;
        const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
        const cmyk = rgbToCmyk(rgb[0], rgb[1], rgb[2]);
        return { hex: '#' + hexInput.replace('#', '').toUpperCase(), rgb, hsl, cmyk };
      } else if (mode === 'rgb') {
        const r = parseInt(rInput), g = parseInt(gInput), b = parseInt(bInput);
        if (isNaN(r) || isNaN(g) || isNaN(b) || r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) return null;
        const hex = rgbToHex(r, g, b);
        const hsl = rgbToHsl(r, g, b);
        const cmyk = rgbToCmyk(r, g, b);
        return { hex, rgb: [r, g, b], hsl, cmyk };
      } else {
        const h = parseInt(hInput), s = parseInt(sInput), l = parseInt(lInput);
        if (isNaN(h) || isNaN(s) || isNaN(l) || h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) return null;
        const rgb = hslToRgb(h, s, l);
        const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
        const cmyk = rgbToCmyk(rgb[0], rgb[1], rgb[2]);
        return { hex, rgb, hsl: [h, s, l], cmyk };
      }
    } catch {
      return null;
    }
  };

  const color = getColor();

  const getValidationMessage = (): string | null => {
    if (color) return null;
    if (mode === 'hex') {
      const cleaned = hexInput.replace('#', '');
      if (!cleaned) return null;
      if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return labels.invalidHex[lang];
    } else if (mode === 'rgb') {
      const r = parseInt(rInput), g = parseInt(gInput), b = parseInt(bInput);
      if ((rInput && (isNaN(r) || r < 0 || r > 255)) || (gInput && (isNaN(g) || g < 0 || g > 255)) || (bInput && (isNaN(b) || b < 0 || b > 255))) {
        return labels.invalidRgb[lang];
      }
    } else {
      const h = parseInt(hInput), s = parseInt(sInput), l = parseInt(lInput);
      if ((hInput && (isNaN(h) || h < 0 || h > 360)) || (sInput && (isNaN(s) || s < 0 || s > 100)) || (lInput && (isNaN(l) || l < 0 || l > 100))) {
        return labels.invalidHsl[lang];
      }
    }
    return null;
  };

  const validationMsg = getValidationMessage();

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const syncFromHex = (hex: string) => {
    setHexInput(hex.replace('#', ''));
    const rgb = hexToRgb(hex);
    if (rgb) {
      setRInput(String(rgb[0])); setGInput(String(rgb[1])); setBInput(String(rgb[2]));
      const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
      setHInput(String(hsl[0])); setSInput(String(hsl[1])); setLInput(String(hsl[2]));
    }
  };

  const addToHistory = useCallback((hexValue: string) => {
    setHistory(prev => {
      const normalized = hexValue.toUpperCase().replace('#', '');
      const filtered = prev.filter(h => h !== normalized);
      return [normalized, ...filtered].slice(0, 10);
    });
  }, []);

  const handleConvert = () => {
    if (color) {
      addToHistory(color.hex);
    }
  };

  const handleHistoryClick = (hex: string) => {
    setMode('hex');
    setHexInput(hex);
    syncFromHex(hex);
  };

  const handleReset = () => {
    setMode('hex');
    setHexInput(DEFAULT_HEX);
    setRInput('255'); setGInput('87'); setBInput('51');
    setHInput('11'); setSInput('100'); setLInput('60');
    setCopiedField(null);
  };

  // Determine text color for contrast on the preview swatch
  const getContrastColor = (hex: string): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return '#000000';
    const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  // Card border accent colors for each format
  const cardAccents: Record<string, string> = {
    hex: 'border-l-blue-500',
    rgb: 'border-l-green-500',
    hsl: 'border-l-purple-500',
    cmyk: 'border-l-amber-500',
  };

  const cardBgs: Record<string, string> = {
    hex: 'bg-blue-50',
    rgb: 'bg-green-50',
    hsl: 'bg-purple-50',
    cmyk: 'bg-amber-50',
  };

  const cardTextAccents: Record<string, string> = {
    hex: 'text-blue-700',
    rgb: 'text-green-700',
    hsl: 'text-purple-700',
    cmyk: 'text-amber-700',
  };

  const cardBtnBgs: Record<string, string> = {
    hex: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
    rgb: 'bg-green-100 hover:bg-green-200 text-green-700',
    hsl: 'bg-purple-100 hover:bg-purple-200 text-purple-700',
    cmyk: 'bg-amber-100 hover:bg-amber-200 text-amber-700',
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Color Converter \u2013 Convert Between HEX, RGB & HSL Color Formats',
      paragraphs: [
        'Color representation in digital design uses multiple formats, each suited for different contexts. HEX codes are the web standard, RGB is used in screens and programming, and HSL provides an intuitive way to describe colors by hue, saturation, and lightness. Understanding how to convert between these formats is essential for web developers, graphic designers, and UI/UX professionals.',
        'HEX (hexadecimal) colors use a 6-digit code preceded by a hash symbol, like #FF5733. Each pair of digits represents the red, green, and blue channels respectively, with values from 00 (0) to FF (255). This compact notation is the most common format in CSS and web design.',
        'RGB (Red, Green, Blue) defines colors by specifying the intensity of each primary color channel on a scale of 0 to 255. The format rgb(255, 87, 51) represents the same color as #FF5733. RGB is the native color model for screens and monitors, as each pixel physically emits red, green, and blue light.',
        'HSL (Hue, Saturation, Lightness) describes colors in a more human-intuitive way. Hue is the color angle on the color wheel (0-360 degrees), saturation is the color intensity (0-100%), and lightness is how light or dark the color is (0-100%). HSL makes it easy to create color variations \u2014 just adjust lightness for shades and tints, or saturation for muted versions.',
      ],
      faq: [
        { q: 'What is the difference between HEX and RGB?', a: 'HEX and RGB represent the same color model (red, green, blue channels) but in different notation. HEX uses hexadecimal digits (00-FF), while RGB uses decimal numbers (0-255). #FF5733 in HEX equals rgb(255, 87, 51) in RGB. HEX is more common in CSS, while RGB is used in programming and design software.' },
        { q: 'Why is HSL useful for designers?', a: 'HSL is intuitive because it separates color identity (hue) from its properties (saturation and lightness). To make a color darker, just decrease lightness. To make it more muted, decrease saturation. To find a complementary color, add 180 to the hue. This makes creating cohesive color palettes much easier than with RGB or HEX.' },
        { q: 'How do I find the complementary color?', a: 'In HSL, the complementary color is found by adding 180 degrees to the hue value. For example, if your color has a hue of 11 degrees (orange-red), the complementary color has a hue of 191 degrees (cyan-blue). Keep the same saturation and lightness values for a balanced complement.' },
        { q: 'Can I use these color formats in CSS?', a: 'Yes, all three formats work in CSS. HEX: color: #FF5733; RGB: color: rgb(255, 87, 51); HSL: color: hsl(11, 100%, 60%). Modern CSS also supports alpha transparency with rgba() and hsla() functions, where the fourth value (0-1) controls opacity.' },
        { q: 'What is a color wheel and how does hue relate to it?', a: 'The color wheel arranges colors in a circle based on their hue angle: 0/360 degrees is red, 60 is yellow, 120 is green, 180 is cyan, 240 is blue, and 300 is magenta. HSL uses this wheel as the basis for its hue component, making it easy to find harmonious color combinations by using geometric relationships on the wheel.' },
      ],
    },
    it: {
      title: 'Convertitore di Colori Gratuito \u2013 Converti tra Formati HEX, RGB e HSL',
      paragraphs: [
        'La rappresentazione dei colori nel design digitale utilizza molteplici formati, ognuno adatto a contesti diversi. I codici HEX sono lo standard web, RGB \u00e8 usato negli schermi e nella programmazione, e HSL offre un modo intuitivo per descrivere i colori tramite tonalit\u00e0, saturazione e luminosit\u00e0.',
        'I colori HEX (esadecimali) usano un codice a 6 cifre preceduto dal simbolo hash, come #FF5733. Ogni coppia di cifre rappresenta i canali rosso, verde e blu rispettivamente, con valori da 00 (0) a FF (255). Questa notazione compatta \u00e8 il formato pi\u00f9 comune in CSS e web design.',
        'RGB (Rosso, Verde, Blu) definisce i colori specificando l\'intensit\u00e0 di ogni canale primario su una scala da 0 a 255. Il formato rgb(255, 87, 51) rappresenta lo stesso colore di #FF5733. RGB \u00e8 il modello nativo per schermi e monitor.',
        'HSL (Tonalit\u00e0, Saturazione, Luminosit\u00e0) descrive i colori in modo pi\u00f9 intuitivo. La tonalit\u00e0 \u00e8 l\'angolo sulla ruota dei colori (0-360 gradi), la saturazione \u00e8 l\'intensit\u00e0 (0-100%) e la luminosit\u00e0 indica quanto chiaro o scuro \u00e8 il colore (0-100%).',
      ],
      faq: [
        { q: 'Qual \u00e8 la differenza tra HEX e RGB?', a: 'HEX e RGB rappresentano lo stesso modello colore ma con notazione diversa. HEX usa cifre esadecimali (00-FF), mentre RGB usa numeri decimali (0-255). #FF5733 in HEX equivale a rgb(255, 87, 51) in RGB.' },
        { q: 'Perch\u00e9 HSL \u00e8 utile per i designer?', a: 'HSL \u00e8 intuitivo perch\u00e9 separa l\'identit\u00e0 del colore (tonalit\u00e0) dalle sue propriet\u00e0 (saturazione e luminosit\u00e0). Per scurire un colore, basta diminuire la luminosit\u00e0. Per trovare il complementare, aggiungere 180 alla tonalit\u00e0.' },
        { q: 'Come trovo il colore complementare?', a: 'In HSL, il colore complementare si trova aggiungendo 180 gradi al valore della tonalit\u00e0. Per esempio, se il colore ha una tonalit\u00e0 di 11 gradi, il complementare ha una tonalit\u00e0 di 191 gradi.' },
        { q: 'Posso usare questi formati in CSS?', a: 'S\u00ec, tutti e tre i formati funzionano in CSS. HEX: color: #FF5733; RGB: color: rgb(255, 87, 51); HSL: color: hsl(11, 100%, 60%). Il CSS moderno supporta anche la trasparenza alpha con rgba() e hsla().' },
        { q: 'Cos\'\u00e8 la ruota dei colori?', a: 'La ruota dei colori dispone i colori in cerchio in base alla tonalit\u00e0: 0/360 gradi \u00e8 rosso, 60 \u00e8 giallo, 120 \u00e8 verde, 180 \u00e8 ciano, 240 \u00e8 blu e 300 \u00e8 magenta. HSL usa questa ruota come base per il componente tonalit\u00e0.' },
      ],
    },
    es: {
      title: 'Conversor de Colores Gratis \u2013 Convierte entre Formatos HEX, RGB y HSL',
      paragraphs: [
        'La representaci\u00f3n de colores en el dise\u00f1o digital utiliza m\u00faltiples formatos. Los c\u00f3digos HEX son el est\u00e1ndar web, RGB se usa en pantallas y programaci\u00f3n, y HSL proporciona una forma intuitiva de describir colores mediante tono, saturaci\u00f3n y luminosidad.',
        'Los colores HEX (hexadecimales) usan un c\u00f3digo de 6 d\u00edgitos precedido por el s\u00edmbolo hash, como #FF5733. Cada par de d\u00edgitos representa los canales rojo, verde y azul respectivamente, con valores de 00 (0) a FF (255).',
        'RGB (Rojo, Verde, Azul) define los colores especificando la intensidad de cada canal primario en una escala de 0 a 255. El formato rgb(255, 87, 51) representa el mismo color que #FF5733.',
        'HSL (Tono, Saturaci\u00f3n, Luminosidad) describe los colores de forma m\u00e1s intuitiva. El tono es el \u00e1ngulo en la rueda de colores (0-360 grados), la saturaci\u00f3n es la intensidad (0-100%) y la luminosidad indica qu\u00e9 tan claro u oscuro es el color.',
      ],
      faq: [
        { q: '\u00bfCu\u00e1l es la diferencia entre HEX y RGB?', a: 'HEX y RGB representan el mismo modelo de color pero con notaci\u00f3n diferente. HEX usa d\u00edgitos hexadecimales (00-FF), mientras que RGB usa n\u00fameros decimales (0-255). #FF5733 en HEX equivale a rgb(255, 87, 51) en RGB.' },
        { q: '\u00bfPor qu\u00e9 HSL es \u00fatil para dise\u00f1adores?', a: 'HSL es intuitivo porque separa la identidad del color (tono) de sus propiedades (saturaci\u00f3n y luminosidad). Para oscurecer un color, solo disminuye la luminosidad. Para encontrar el complementario, suma 180 al tono.' },
        { q: '\u00bfC\u00f3mo encuentro el color complementario?', a: 'En HSL, el color complementario se encuentra sumando 180 grados al valor del tono. Por ejemplo, si el color tiene un tono de 11 grados, el complementario tiene un tono de 191 grados.' },
        { q: '\u00bfPuedo usar estos formatos en CSS?', a: 'S\u00ed, los tres formatos funcionan en CSS. HEX: color: #FF5733; RGB: color: rgb(255, 87, 51); HSL: color: hsl(11, 100%, 60%).' },
        { q: '\u00bfQu\u00e9 es la rueda de colores?', a: 'La rueda de colores organiza los colores en c\u00edrculo seg\u00fan su tono: 0/360 grados es rojo, 60 es amarillo, 120 es verde, 180 es cian, 240 es azul y 300 es magenta.' },
      ],
    },
    fr: {
      title: 'Convertisseur de Couleurs Gratuit \u2013 Convertissez entre les Formats HEX, RGB et HSL',
      paragraphs: [
        'La repr\u00e9sentation des couleurs en design num\u00e9rique utilise plusieurs formats. Les codes HEX sont le standard web, RGB est utilis\u00e9 pour les \u00e9crans et la programmation, et HSL offre une fa\u00e7on intuitive de d\u00e9crire les couleurs par teinte, saturation et luminosit\u00e9.',
        'Les couleurs HEX (hexad\u00e9cimales) utilisent un code \u00e0 6 chiffres pr\u00e9c\u00e9d\u00e9 du symbole di\u00e8se, comme #FF5733. Chaque paire de chiffres repr\u00e9sente les canaux rouge, vert et bleu respectivement, avec des valeurs de 00 (0) \u00e0 FF (255).',
        'RGB (Rouge, Vert, Bleu) d\u00e9finit les couleurs en sp\u00e9cifiant l\'intensit\u00e9 de chaque canal primaire sur une \u00e9chelle de 0 \u00e0 255. Le format rgb(255, 87, 51) repr\u00e9sente la m\u00eame couleur que #FF5733.',
        'HSL (Teinte, Saturation, Luminosit\u00e9) d\u00e9crit les couleurs de mani\u00e8re plus intuitive. La teinte est l\'angle sur le cercle chromatique (0-360 degr\u00e9s), la saturation est l\'intensit\u00e9 (0-100%) et la luminosit\u00e9 indique \u00e0 quel point la couleur est claire ou fonc\u00e9e.',
      ],
      faq: [
        { q: 'Quelle est la diff\u00e9rence entre HEX et RGB ?', a: 'HEX et RGB repr\u00e9sentent le m\u00eame mod\u00e8le de couleur mais avec une notation diff\u00e9rente. HEX utilise des chiffres hexad\u00e9cimaux (00-FF), tandis que RGB utilise des nombres d\u00e9cimaux (0-255). #FF5733 en HEX \u00e9quivaut \u00e0 rgb(255, 87, 51) en RGB.' },
        { q: 'Pourquoi HSL est-il utile pour les designers ?', a: 'HSL est intuitif car il s\u00e9pare l\'identit\u00e9 de la couleur (teinte) de ses propri\u00e9t\u00e9s (saturation et luminosit\u00e9). Pour assombrir une couleur, diminuez la luminosit\u00e9. Pour trouver le compl\u00e9mentaire, ajoutez 180 \u00e0 la teinte.' },
        { q: 'Comment trouver la couleur compl\u00e9mentaire ?', a: 'En HSL, la couleur compl\u00e9mentaire se trouve en ajoutant 180 degr\u00e9s \u00e0 la valeur de teinte. Par exemple, si la couleur a une teinte de 11 degr\u00e9s, la compl\u00e9mentaire a une teinte de 191 degr\u00e9s.' },
        { q: 'Puis-je utiliser ces formats en CSS ?', a: 'Oui, les trois formats fonctionnent en CSS. HEX : color: #FF5733; RGB : color: rgb(255, 87, 51); HSL : color: hsl(11, 100%, 60%).' },
        { q: 'Qu\'est-ce que le cercle chromatique ?', a: 'Le cercle chromatique organise les couleurs en cercle selon leur teinte : 0/360 degr\u00e9s est rouge, 60 est jaune, 120 est vert, 180 est cyan, 240 est bleu et 300 est magenta.' },
      ],
    },
    de: {
      title: 'Kostenloser Farbkonverter \u2013 Zwischen HEX, RGB und HSL Farbformaten Konvertieren',
      paragraphs: [
        'Die Farbdarstellung im digitalen Design verwendet mehrere Formate. HEX-Codes sind der Web-Standard, RGB wird in Bildschirmen und Programmierung verwendet, und HSL bietet eine intuitive Beschreibung durch Farbton, S\u00e4ttigung und Helligkeit.',
        'HEX-Farben (hexadezimal) verwenden einen 6-stelligen Code mit vorangestelltem Hash-Symbol, wie #FF5733. Jedes Ziffernpaar repr\u00e4sentiert die Rot-, Gr\u00fcn- und Blau-Kan\u00e4le mit Werten von 00 (0) bis FF (255).',
        'RGB (Rot, Gr\u00fcn, Blau) definiert Farben durch Angabe der Intensit\u00e4t jedes Prim\u00e4rkanals auf einer Skala von 0 bis 255. Das Format rgb(255, 87, 51) repr\u00e4sentiert dieselbe Farbe wie #FF5733.',
        'HSL (Farbton, S\u00e4ttigung, Helligkeit) beschreibt Farben intuitiver. Der Farbton ist der Winkel auf dem Farbrad (0-360 Grad), die S\u00e4ttigung ist die Intensit\u00e4t (0-100%) und die Helligkeit gibt an, wie hell oder dunkel die Farbe ist.',
      ],
      faq: [
        { q: 'Was ist der Unterschied zwischen HEX und RGB?', a: 'HEX und RGB repr\u00e4sentieren dasselbe Farbmodell, aber mit unterschiedlicher Notation. HEX verwendet hexadezimale Ziffern (00-FF), w\u00e4hrend RGB Dezimalzahlen (0-255) verwendet. #FF5733 in HEX entspricht rgb(255, 87, 51) in RGB.' },
        { q: 'Warum ist HSL f\u00fcr Designer n\u00fctzlich?', a: 'HSL ist intuitiv, weil es die Farbidentit\u00e4t (Farbton) von ihren Eigenschaften (S\u00e4ttigung und Helligkeit) trennt. Um eine Farbe dunkler zu machen, verringern Sie die Helligkeit. F\u00fcr die Komplement\u00e4rfarbe addieren Sie 180 zum Farbton.' },
        { q: 'Wie finde ich die Komplement\u00e4rfarbe?', a: 'In HSL findet man die Komplement\u00e4rfarbe, indem man 180 Grad zum Farbtonwert addiert. Beispiel: Hat die Farbe einen Farbton von 11 Grad, hat die Komplement\u00e4rfarbe einen Farbton von 191 Grad.' },
        { q: 'Kann ich diese Formate in CSS verwenden?', a: 'Ja, alle drei Formate funktionieren in CSS. HEX: color: #FF5733; RGB: color: rgb(255, 87, 51); HSL: color: hsl(11, 100%, 60%).' },
        { q: 'Was ist das Farbrad?', a: 'Das Farbrad ordnet Farben im Kreis nach ihrem Farbton: 0/360 Grad ist Rot, 60 ist Gelb, 120 ist Gr\u00fcn, 180 ist Cyan, 240 ist Blau und 300 ist Magenta.' },
      ],
    },
    pt: {
      title: 'Conversor de Cores Gr\u00e1tis \u2013 Converta entre Formatos HEX, RGB e HSL',
      paragraphs: [
        'A representa\u00e7\u00e3o de cores no design digital utiliza m\u00faltiplos formatos. C\u00f3digos HEX s\u00e3o o padr\u00e3o web, RGB \u00e9 usado em telas e programa\u00e7\u00e3o, e HSL oferece uma forma intuitiva de descrever cores atrav\u00e9s de matiz, satura\u00e7\u00e3o e luminosidade.',
        'As cores HEX (hexadecimais) usam um c\u00f3digo de 6 d\u00edgitos precedido pelo s\u00edmbolo hash, como #FF5733. Cada par de d\u00edgitos representa os canais vermelho, verde e azul respectivamente, com valores de 00 (0) a FF (255).',
        'RGB (Vermelho, Verde, Azul) define cores especificando a intensidade de cada canal prim\u00e1rio em uma escala de 0 a 255. O formato rgb(255, 87, 51) representa a mesma cor que #FF5733.',
        'HSL (Matiz, Satura\u00e7\u00e3o, Luminosidade) descreve cores de forma mais intuitiva. O matiz \u00e9 o \u00e2ngulo na roda de cores (0-360 graus), a satura\u00e7\u00e3o \u00e9 a intensidade (0-100%) e a luminosidade indica qu\u00e3o clara ou escura a cor \u00e9.',
      ],
      faq: [
        { q: 'Qual a diferen\u00e7a entre HEX e RGB?', a: 'HEX e RGB representam o mesmo modelo de cor mas com nota\u00e7\u00e3o diferente. HEX usa d\u00edgitos hexadecimais (00-FF), enquanto RGB usa n\u00fameros decimais (0-255). #FF5733 em HEX equivale a rgb(255, 87, 51) em RGB.' },
        { q: 'Por que HSL \u00e9 \u00fatil para designers?', a: 'HSL \u00e9 intuitivo porque separa a identidade da cor (matiz) de suas propriedades (satura\u00e7\u00e3o e luminosidade). Para escurecer uma cor, diminua a luminosidade. Para encontrar a complementar, some 180 ao matiz.' },
        { q: 'Como encontro a cor complementar?', a: 'Em HSL, a cor complementar \u00e9 encontrada somando 180 graus ao valor do matiz. Por exemplo, se a cor tem matiz de 11 graus, a complementar tem matiz de 191 graus.' },
        { q: 'Posso usar esses formatos em CSS?', a: 'Sim, os tr\u00eas formatos funcionam em CSS. HEX: color: #FF5733; RGB: color: rgb(255, 87, 51); HSL: color: hsl(11, 100%, 60%).' },
        { q: 'O que \u00e9 a roda de cores?', a: 'A roda de cores organiza as cores em c\u00edrculo segundo seu matiz: 0/360 graus \u00e9 vermelho, 60 \u00e9 amarelo, 120 \u00e9 verde, 180 \u00e9 ciano, 240 \u00e9 azul e 300 \u00e9 magenta.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="color-converter" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {/* Input mode selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.inputMode[lang]}</label>
            <div className="grid grid-cols-3 gap-2">
              {(['hex', 'rgb', 'hsl'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${mode === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* HEX input */}
          {mode === 'hex' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HEX</label>
              <div className="flex items-center gap-2">
                <span className="text-lg text-gray-400">#</span>
                <input type="text" value={hexInput} onChange={(e) => { setHexInput(e.target.value); syncFromHex(e.target.value); }} placeholder="FF5733" maxLength={6} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>
            </div>
          )}

          {/* RGB input */}
          {mode === 'rgb' && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">R (0-255)</label>
                <input type="number" min="0" max="255" value={rInput} onChange={(e) => setRInput(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">G (0-255)</label>
                <input type="number" min="0" max="255" value={gInput} onChange={(e) => setGInput(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">B (0-255)</label>
                <input type="number" min="0" max="255" value={bInput} onChange={(e) => setBInput(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          )}

          {/* HSL input */}
          {mode === 'hsl' && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">H (0-360)</label>
                <input type="number" min="0" max="360" value={hInput} onChange={(e) => setHInput(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">S (0-100%)</label>
                <input type="number" min="0" max="100" value={sInput} onChange={(e) => setSInput(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">L (0-100%)</label>
                <input type="number" min="0" max="100" value={lInput} onChange={(e) => setLInput(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          )}

          {/* Action buttons: Convert + Reset */}
          <div className="flex gap-3">
            <button onClick={handleConvert} disabled={!color} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${color ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              {labels.results[lang].split(' ')[0]}
            </button>
            <button onClick={handleReset} className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              {labels.reset[lang]}
            </button>
          </div>

          {/* Validation message */}
          {validationMsg && (
            <div className="p-3 bg-red-50 rounded-lg text-red-600 text-center text-sm font-medium">{validationMsg}</div>
          )}

          {/* Large color preview */}
          {color && (
            <div className="relative">
              <div className="w-full h-32 rounded-xl border border-gray-200 shadow-inner flex items-center justify-center" style={{ backgroundColor: color.hex }}>
                <span className="font-mono text-lg font-bold px-3 py-1 rounded-md" style={{ color: getContrastColor(color.hex), backgroundColor: 'rgba(0,0,0,0.15)' }}>
                  {color.hex}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">{labels.preview[lang]}</p>
            </div>
          )}

          {/* Result cards */}
          {color && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">{labels.results[lang]}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  ['hex', 'HEX', color.hex],
                  ['rgb', 'RGB', `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`],
                  ['hsl', 'HSL', `hsl(${color.hsl[0]}, ${color.hsl[1]}%, ${color.hsl[2]}%)`],
                  ['cmyk', 'CMYK', `cmyk(${color.cmyk[0]}%, ${color.cmyk[1]}%, ${color.cmyk[2]}%, ${color.cmyk[3]}%)`],
                ] as [string, string, string][]).map(([key, label, value]) => (
                  <div key={key} className={`rounded-lg border-l-4 ${cardAccents[key]} ${cardBgs[key]} px-4 py-3 flex flex-col gap-1`}>
                    <div className={`text-xs font-semibold uppercase tracking-wide ${cardTextAccents[key]}`}>{label}</div>
                    <div className="font-mono text-sm font-bold text-gray-900 break-all">{value}</div>
                    <button
                      onClick={() => copyToClipboard(value, key)}
                      className={`mt-1 self-start text-xs px-3 py-1 rounded-md font-medium transition-colors ${cardBtnBgs[key]}`}
                    >
                      {copiedField === key ? labels.copied[lang] : labels.copy[lang]}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Color history */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">{labels.history[lang]}</h3>
              <button onClick={() => setHistory([])} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                {labels.clearHistory[lang]}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((hex) => (
                <button
                  key={hex}
                  onClick={() => handleHistoryClick(hex)}
                  title={`#${hex}`}
                  className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors shadow-sm hover:scale-110 transform"
                  style={{ backgroundColor: `#${hex}` }}
                />
              ))}
            </div>
          </div>
        )}

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
                  <span className="text-gray-400">{openFaq === i ? '\u2212' : '+'}</span>
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
