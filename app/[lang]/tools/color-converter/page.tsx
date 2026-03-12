'use client';
import { useState } from 'react';
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

export default function ColorConverter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['color-converter'][lang];

  const [mode, setMode] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  const [hexInput, setHexInput] = useState('FF5733');
  const [rInput, setRInput] = useState('255');
  const [gInput, setGInput] = useState('87');
  const [bInput, setBInput] = useState('51');
  const [hInput, setHInput] = useState('11');
  const [sInput, setSInput] = useState('100');
  const [lInput, setLInput] = useState('60');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const labels = {
    inputMode: { en: 'Input Format', it: 'Formato di Input', es: 'Formato de Entrada', fr: 'Format d\'Entrée', de: 'Eingabeformat', pt: 'Formato de Entrada' },
    results: { en: 'Conversion Results', it: 'Risultati Conversione', es: 'Resultados de Conversión', fr: 'Résultats de Conversion', de: 'Konvertierungsergebnisse', pt: 'Resultados da Conversão' },
    preview: { en: 'Color Preview', it: 'Anteprima Colore', es: 'Vista Previa del Color', fr: 'Aperçu de la Couleur', de: 'Farbvorschau', pt: 'Pré-visualização da Cor' },
    invalid: { en: 'Invalid color value', it: 'Valore colore non valido', es: 'Valor de color no válido', fr: 'Valeur de couleur invalide', de: 'Ungültiger Farbwert', pt: 'Valor de cor inválido' },
    copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  } as Record<string, Record<Locale, string>>;

  const getColor = (): { hex: string; rgb: [number, number, number]; hsl: [number, number, number] } | null => {
    try {
      if (mode === 'hex') {
        const rgb = hexToRgb(hexInput);
        if (!rgb) return null;
        const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
        return { hex: '#' + hexInput.replace('#', '').toUpperCase(), rgb, hsl };
      } else if (mode === 'rgb') {
        const r = parseInt(rInput), g = parseInt(gInput), b = parseInt(bInput);
        if (isNaN(r) || isNaN(g) || isNaN(b) || r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) return null;
        const hex = rgbToHex(r, g, b);
        const hsl = rgbToHsl(r, g, b);
        return { hex, rgb: [r, g, b], hsl };
      } else {
        const h = parseInt(hInput), s = parseInt(sInput), l = parseInt(lInput);
        if (isNaN(h) || isNaN(s) || isNaN(l) || h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) return null;
        const rgb = hslToRgb(h, s, l);
        const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
        return { hex, rgb, hsl: [h, s, l] };
      }
    } catch {
      return null;
    }
  };

  const color = getColor();

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

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Color Converter – Convert Between HEX, RGB & HSL Color Formats',
      paragraphs: [
        'Color representation in digital design uses multiple formats, each suited for different contexts. HEX codes are the web standard, RGB is used in screens and programming, and HSL provides an intuitive way to describe colors by hue, saturation, and lightness. Understanding how to convert between these formats is essential for web developers, graphic designers, and UI/UX professionals.',
        'HEX (hexadecimal) colors use a 6-digit code preceded by a hash symbol, like #FF5733. Each pair of digits represents the red, green, and blue channels respectively, with values from 00 (0) to FF (255). This compact notation is the most common format in CSS and web design.',
        'RGB (Red, Green, Blue) defines colors by specifying the intensity of each primary color channel on a scale of 0 to 255. The format rgb(255, 87, 51) represents the same color as #FF5733. RGB is the native color model for screens and monitors, as each pixel physically emits red, green, and blue light.',
        'HSL (Hue, Saturation, Lightness) describes colors in a more human-intuitive way. Hue is the color angle on the color wheel (0-360 degrees), saturation is the color intensity (0-100%), and lightness is how light or dark the color is (0-100%). HSL makes it easy to create color variations — just adjust lightness for shades and tints, or saturation for muted versions.',
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
      title: 'Convertitore di Colori Gratuito – Converti tra Formati HEX, RGB e HSL',
      paragraphs: [
        'La rappresentazione dei colori nel design digitale utilizza molteplici formati, ognuno adatto a contesti diversi. I codici HEX sono lo standard web, RGB è usato negli schermi e nella programmazione, e HSL offre un modo intuitivo per descrivere i colori tramite tonalità, saturazione e luminosità.',
        'I colori HEX (esadecimali) usano un codice a 6 cifre preceduto dal simbolo hash, come #FF5733. Ogni coppia di cifre rappresenta i canali rosso, verde e blu rispettivamente, con valori da 00 (0) a FF (255). Questa notazione compatta è il formato più comune in CSS e web design.',
        'RGB (Rosso, Verde, Blu) definisce i colori specificando l\'intensità di ogni canale primario su una scala da 0 a 255. Il formato rgb(255, 87, 51) rappresenta lo stesso colore di #FF5733. RGB è il modello nativo per schermi e monitor.',
        'HSL (Tonalità, Saturazione, Luminosità) descrive i colori in modo più intuitivo. La tonalità è l\'angolo sulla ruota dei colori (0-360 gradi), la saturazione è l\'intensità (0-100%) e la luminosità indica quanto chiaro o scuro è il colore (0-100%).',
      ],
      faq: [
        { q: 'Qual è la differenza tra HEX e RGB?', a: 'HEX e RGB rappresentano lo stesso modello colore ma con notazione diversa. HEX usa cifre esadecimali (00-FF), mentre RGB usa numeri decimali (0-255). #FF5733 in HEX equivale a rgb(255, 87, 51) in RGB.' },
        { q: 'Perché HSL è utile per i designer?', a: 'HSL è intuitivo perché separa l\'identità del colore (tonalità) dalle sue proprietà (saturazione e luminosità). Per scurire un colore, basta diminuire la luminosità. Per trovare il complementare, aggiungere 180 alla tonalità.' },
        { q: 'Come trovo il colore complementare?', a: 'In HSL, il colore complementare si trova aggiungendo 180 gradi al valore della tonalità. Per esempio, se il colore ha una tonalità di 11 gradi, il complementare ha una tonalità di 191 gradi.' },
        { q: 'Posso usare questi formati in CSS?', a: 'Sì, tutti e tre i formati funzionano in CSS. HEX: color: #FF5733; RGB: color: rgb(255, 87, 51); HSL: color: hsl(11, 100%, 60%). Il CSS moderno supporta anche la trasparenza alpha con rgba() e hsla().' },
        { q: 'Cos\'è la ruota dei colori?', a: 'La ruota dei colori dispone i colori in cerchio in base alla tonalità: 0/360 gradi è rosso, 60 è giallo, 120 è verde, 180 è ciano, 240 è blu e 300 è magenta. HSL usa questa ruota come base per il componente tonalità.' },
      ],
    },
    es: {
      title: 'Conversor de Colores Gratis – Convierte entre Formatos HEX, RGB y HSL',
      paragraphs: [
        'La representación de colores en el diseño digital utiliza múltiples formatos. Los códigos HEX son el estándar web, RGB se usa en pantallas y programación, y HSL proporciona una forma intuitiva de describir colores mediante tono, saturación y luminosidad.',
        'Los colores HEX (hexadecimales) usan un código de 6 dígitos precedido por el símbolo hash, como #FF5733. Cada par de dígitos representa los canales rojo, verde y azul respectivamente, con valores de 00 (0) a FF (255).',
        'RGB (Rojo, Verde, Azul) define los colores especificando la intensidad de cada canal primario en una escala de 0 a 255. El formato rgb(255, 87, 51) representa el mismo color que #FF5733.',
        'HSL (Tono, Saturación, Luminosidad) describe los colores de forma más intuitiva. El tono es el ángulo en la rueda de colores (0-360 grados), la saturación es la intensidad (0-100%) y la luminosidad indica qué tan claro u oscuro es el color.',
      ],
      faq: [
        { q: '¿Cuál es la diferencia entre HEX y RGB?', a: 'HEX y RGB representan el mismo modelo de color pero con notación diferente. HEX usa dígitos hexadecimales (00-FF), mientras que RGB usa números decimales (0-255). #FF5733 en HEX equivale a rgb(255, 87, 51) en RGB.' },
        { q: '¿Por qué HSL es útil para diseñadores?', a: 'HSL es intuitivo porque separa la identidad del color (tono) de sus propiedades (saturación y luminosidad). Para oscurecer un color, solo disminuye la luminosidad. Para encontrar el complementario, suma 180 al tono.' },
        { q: '¿Cómo encuentro el color complementario?', a: 'En HSL, el color complementario se encuentra sumando 180 grados al valor del tono. Por ejemplo, si el color tiene un tono de 11 grados, el complementario tiene un tono de 191 grados.' },
        { q: '¿Puedo usar estos formatos en CSS?', a: 'Sí, los tres formatos funcionan en CSS. HEX: color: #FF5733; RGB: color: rgb(255, 87, 51); HSL: color: hsl(11, 100%, 60%).' },
        { q: '¿Qué es la rueda de colores?', a: 'La rueda de colores organiza los colores en círculo según su tono: 0/360 grados es rojo, 60 es amarillo, 120 es verde, 180 es cian, 240 es azul y 300 es magenta.' },
      ],
    },
    fr: {
      title: 'Convertisseur de Couleurs Gratuit – Convertissez entre les Formats HEX, RGB et HSL',
      paragraphs: [
        'La représentation des couleurs en design numérique utilise plusieurs formats. Les codes HEX sont le standard web, RGB est utilisé pour les écrans et la programmation, et HSL offre une façon intuitive de décrire les couleurs par teinte, saturation et luminosité.',
        'Les couleurs HEX (hexadécimales) utilisent un code à 6 chiffres précédé du symbole dièse, comme #FF5733. Chaque paire de chiffres représente les canaux rouge, vert et bleu respectivement, avec des valeurs de 00 (0) à FF (255).',
        'RGB (Rouge, Vert, Bleu) définit les couleurs en spécifiant l\'intensité de chaque canal primaire sur une échelle de 0 à 255. Le format rgb(255, 87, 51) représente la même couleur que #FF5733.',
        'HSL (Teinte, Saturation, Luminosité) décrit les couleurs de manière plus intuitive. La teinte est l\'angle sur le cercle chromatique (0-360 degrés), la saturation est l\'intensité (0-100%) et la luminosité indique à quel point la couleur est claire ou foncée.',
      ],
      faq: [
        { q: 'Quelle est la différence entre HEX et RGB ?', a: 'HEX et RGB représentent le même modèle de couleur mais avec une notation différente. HEX utilise des chiffres hexadécimaux (00-FF), tandis que RGB utilise des nombres décimaux (0-255). #FF5733 en HEX équivaut à rgb(255, 87, 51) en RGB.' },
        { q: 'Pourquoi HSL est-il utile pour les designers ?', a: 'HSL est intuitif car il sépare l\'identité de la couleur (teinte) de ses propriétés (saturation et luminosité). Pour assombrir une couleur, diminuez la luminosité. Pour trouver le complémentaire, ajoutez 180 à la teinte.' },
        { q: 'Comment trouver la couleur complémentaire ?', a: 'En HSL, la couleur complémentaire se trouve en ajoutant 180 degrés à la valeur de teinte. Par exemple, si la couleur a une teinte de 11 degrés, la complémentaire a une teinte de 191 degrés.' },
        { q: 'Puis-je utiliser ces formats en CSS ?', a: 'Oui, les trois formats fonctionnent en CSS. HEX : color: #FF5733; RGB : color: rgb(255, 87, 51); HSL : color: hsl(11, 100%, 60%).' },
        { q: 'Qu\'est-ce que le cercle chromatique ?', a: 'Le cercle chromatique organise les couleurs en cercle selon leur teinte : 0/360 degrés est rouge, 60 est jaune, 120 est vert, 180 est cyan, 240 est bleu et 300 est magenta.' },
      ],
    },
    de: {
      title: 'Kostenloser Farbkonverter – Zwischen HEX, RGB und HSL Farbformaten Konvertieren',
      paragraphs: [
        'Die Farbdarstellung im digitalen Design verwendet mehrere Formate. HEX-Codes sind der Web-Standard, RGB wird in Bildschirmen und Programmierung verwendet, und HSL bietet eine intuitive Beschreibung durch Farbton, Sättigung und Helligkeit.',
        'HEX-Farben (hexadezimal) verwenden einen 6-stelligen Code mit vorangestelltem Hash-Symbol, wie #FF5733. Jedes Ziffernpaar repräsentiert die Rot-, Grün- und Blau-Kanäle mit Werten von 00 (0) bis FF (255).',
        'RGB (Rot, Grün, Blau) definiert Farben durch Angabe der Intensität jedes Primärkanals auf einer Skala von 0 bis 255. Das Format rgb(255, 87, 51) repräsentiert dieselbe Farbe wie #FF5733.',
        'HSL (Farbton, Sättigung, Helligkeit) beschreibt Farben intuitiver. Der Farbton ist der Winkel auf dem Farbrad (0-360 Grad), die Sättigung ist die Intensität (0-100%) und die Helligkeit gibt an, wie hell oder dunkel die Farbe ist.',
      ],
      faq: [
        { q: 'Was ist der Unterschied zwischen HEX und RGB?', a: 'HEX und RGB repräsentieren dasselbe Farbmodell, aber mit unterschiedlicher Notation. HEX verwendet hexadezimale Ziffern (00-FF), während RGB Dezimalzahlen (0-255) verwendet. #FF5733 in HEX entspricht rgb(255, 87, 51) in RGB.' },
        { q: 'Warum ist HSL für Designer nützlich?', a: 'HSL ist intuitiv, weil es die Farbidentität (Farbton) von ihren Eigenschaften (Sättigung und Helligkeit) trennt. Um eine Farbe dunkler zu machen, verringern Sie die Helligkeit. Für die Komplementärfarbe addieren Sie 180 zum Farbton.' },
        { q: 'Wie finde ich die Komplementärfarbe?', a: 'In HSL findet man die Komplementärfarbe, indem man 180 Grad zum Farbtonwert addiert. Beispiel: Hat die Farbe einen Farbton von 11 Grad, hat die Komplementärfarbe einen Farbton von 191 Grad.' },
        { q: 'Kann ich diese Formate in CSS verwenden?', a: 'Ja, alle drei Formate funktionieren in CSS. HEX: color: #FF5733; RGB: color: rgb(255, 87, 51); HSL: color: hsl(11, 100%, 60%).' },
        { q: 'Was ist das Farbrad?', a: 'Das Farbrad ordnet Farben im Kreis nach ihrem Farbton: 0/360 Grad ist Rot, 60 ist Gelb, 120 ist Grün, 180 ist Cyan, 240 ist Blau und 300 ist Magenta.' },
      ],
    },
    pt: {
      title: 'Conversor de Cores Grátis – Converta entre Formatos HEX, RGB e HSL',
      paragraphs: [
        'A representação de cores no design digital utiliza múltiplos formatos. Códigos HEX são o padrão web, RGB é usado em telas e programação, e HSL oferece uma forma intuitiva de descrever cores através de matiz, saturação e luminosidade.',
        'As cores HEX (hexadecimais) usam um código de 6 dígitos precedido pelo símbolo hash, como #FF5733. Cada par de dígitos representa os canais vermelho, verde e azul respectivamente, com valores de 00 (0) a FF (255).',
        'RGB (Vermelho, Verde, Azul) define cores especificando a intensidade de cada canal primário em uma escala de 0 a 255. O formato rgb(255, 87, 51) representa a mesma cor que #FF5733.',
        'HSL (Matiz, Saturação, Luminosidade) descreve cores de forma mais intuitiva. O matiz é o ângulo na roda de cores (0-360 graus), a saturação é a intensidade (0-100%) e a luminosidade indica quão clara ou escura a cor é.',
      ],
      faq: [
        { q: 'Qual a diferença entre HEX e RGB?', a: 'HEX e RGB representam o mesmo modelo de cor mas com notação diferente. HEX usa dígitos hexadecimais (00-FF), enquanto RGB usa números decimais (0-255). #FF5733 em HEX equivale a rgb(255, 87, 51) em RGB.' },
        { q: 'Por que HSL é útil para designers?', a: 'HSL é intuitivo porque separa a identidade da cor (matiz) de suas propriedades (saturação e luminosidade). Para escurecer uma cor, diminua a luminosidade. Para encontrar a complementar, some 180 ao matiz.' },
        { q: 'Como encontro a cor complementar?', a: 'Em HSL, a cor complementar é encontrada somando 180 graus ao valor do matiz. Por exemplo, se a cor tem matiz de 11 graus, a complementar tem matiz de 191 graus.' },
        { q: 'Posso usar esses formatos em CSS?', a: 'Sim, os três formatos funcionam em CSS. HEX: color: #FF5733; RGB: color: rgb(255, 87, 51); HSL: color: hsl(11, 100%, 60%).' },
        { q: 'O que é a roda de cores?', a: 'A roda de cores organiza as cores em círculo segundo seu matiz: 0/360 graus é vermelho, 60 é amarelo, 120 é verde, 180 é ciano, 240 é azul e 300 é magenta.' },
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

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.inputMode[lang]}</label>
            <div className="grid grid-cols-3 gap-2">
              {(['hex', 'rgb', 'hsl'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)} className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${mode === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {mode === 'hex' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HEX</label>
              <div className="flex items-center gap-2">
                <span className="text-lg text-gray-400">#</span>
                <input type="text" value={hexInput} onChange={(e) => { setHexInput(e.target.value); syncFromHex(e.target.value); }} placeholder="FF5733" maxLength={6} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>
            </div>
          )}

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

          {!color && hexInput && (
            <div className="p-3 bg-red-50 rounded-lg text-red-600 text-center font-medium">{labels.invalid[lang]}</div>
          )}

          {color && (
            <>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl border border-gray-200 shadow-sm" style={{ backgroundColor: color.hex }} />
                <div className="text-sm text-gray-500">{labels.preview[lang]}</div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">{labels.results[lang]}</h3>
                {([
                  ['hex', 'HEX', color.hex],
                  ['rgb', 'RGB', `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`],
                  ['hsl', 'HSL', `hsl(${color.hsl[0]}, ${color.hsl[1]}%, ${color.hsl[2]}%)`],
                ] as [string, string, string][]).map(([key, label, value]) => (
                  <div key={key} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                    <div>
                      <div className="text-xs text-gray-500">{label}</div>
                      <div className="font-mono text-lg font-bold text-gray-900">{value}</div>
                    </div>
                    <button onClick={() => copyToClipboard(value, key)} className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition">
                      {copiedField === key ? labels.copied[lang] : '📋'}
                    </button>
                  </div>
                ))}
              </div>
            </>
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
