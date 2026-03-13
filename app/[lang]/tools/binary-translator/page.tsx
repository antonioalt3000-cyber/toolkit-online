'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  textToBinary: { en: 'Text to Binary', it: 'Testo a Binario', es: 'Texto a Binario', fr: 'Texte en Binaire', de: 'Text zu Binär', pt: 'Texto para Binário' },
  binaryToText: { en: 'Binary to Text', it: 'Binario a Testo', es: 'Binario a Texto', fr: 'Binaire en Texte', de: 'Binär zu Text', pt: 'Binário para Texto' },
  inputPlaceholderText: { en: 'Type or paste text here...', it: 'Scrivi o incolla il testo qui...', es: 'Escribe o pega texto aquí...', fr: 'Tapez ou collez du texte ici...', de: 'Text hier eingeben oder einfügen...', pt: 'Digite ou cole o texto aqui...' },
  inputPlaceholderBinary: { en: 'Paste binary code here (e.g. 01001000 01101001)', it: 'Incolla il codice binario qui (es. 01001000 01101001)', es: 'Pega código binario aquí (ej. 01001000 01101001)', fr: 'Collez le code binaire ici (ex. 01001000 01101001)', de: 'Binärcode hier einfügen (z.B. 01001000 01101001)', pt: 'Cole o código binário aqui (ex. 01001000 01101001)' },
  binary: { en: 'Binary', it: 'Binario', es: 'Binario', fr: 'Binaire', de: 'Binär', pt: 'Binário' },
  octal: { en: 'Octal', it: 'Ottale', es: 'Octal', fr: 'Octal', de: 'Oktal', pt: 'Octal' },
  decimal: { en: 'Decimal', it: 'Decimale', es: 'Decimal', fr: 'Décimal', de: 'Dezimal', pt: 'Decimal' },
  text: { en: 'Text', it: 'Testo', es: 'Texto', fr: 'Texte', de: 'Text', pt: 'Texto' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  swap: { en: 'Swap Direction', it: 'Inverti direzione', es: 'Invertir dirección', fr: 'Inverser direction', de: 'Richtung wechseln', pt: 'Inverter direção' },
  reset: { en: 'Reset', it: 'Ripristina', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  results: { en: 'Results', it: 'Risultati', es: 'Resultados', fr: 'Résultats', de: 'Ergebnisse', pt: 'Resultados' },
  autoDetected: { en: 'Auto-detected:', it: 'Rilevato automaticamente:', es: 'Detectado automáticamente:', fr: 'Détecté automatiquement :', de: 'Automatisch erkannt:', pt: 'Detectado automaticamente:' },
  invalidBinary: { en: 'Invalid binary input. Use only 0 and 1, separated by spaces.', it: 'Input binario non valido. Usa solo 0 e 1, separati da spazi.', es: 'Entrada binaria inválida. Usa solo 0 y 1, separados por espacios.', fr: 'Entrée binaire invalide. Utilisez uniquement 0 et 1, séparés par des espaces.', de: 'Ungültige Binäreingabe. Verwenden Sie nur 0 und 1, getrennt durch Leerzeichen.', pt: 'Entrada binária inválida. Use apenas 0 e 1, separados por espaços.' },
};

type Mode = 'text-to-binary' | 'binary-to-text';

function isBinaryString(str: string): boolean {
  const cleaned = str.trim();
  if (!cleaned) return false;
  return /^[01\s]+$/.test(cleaned);
}

function textToBinary(text: string): string {
  return Array.from(text)
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(' ');
}

function textToOctal(text: string): string {
  return Array.from(text)
    .map(char => char.charCodeAt(0).toString(8).padStart(3, '0'))
    .join(' ');
}

function textToDecimal(text: string): string {
  return Array.from(text)
    .map(char => char.charCodeAt(0).toString(10))
    .join(' ');
}

function binaryToText(binary: string): string | null {
  const cleaned = binary.trim().replace(/\s+/g, ' ');
  if (!cleaned) return null;
  const bytes = cleaned.split(' ');
  try {
    return bytes.map(b => {
      if (!/^[01]+$/.test(b)) return null;
      const code = parseInt(b, 2);
      if (isNaN(code) || code > 0x10FFFF) return null;
      return String.fromCharCode(code);
    }).join('');
  } catch {
    return null;
  }
}

function binaryToOctal(binary: string): string {
  const cleaned = binary.trim().replace(/\s+/g, ' ');
  if (!cleaned) return '';
  const bytes = cleaned.split(' ');
  return bytes.map(b => {
    const num = parseInt(b, 2);
    return isNaN(num) ? '?' : num.toString(8).padStart(3, '0');
  }).join(' ');
}

function binaryToDecimalRepr(binary: string): string {
  const cleaned = binary.trim().replace(/\s+/g, ' ');
  if (!cleaned) return '';
  const bytes = cleaned.split(' ');
  return bytes.map(b => {
    const num = parseInt(b, 2);
    return isNaN(num) ? '?' : num.toString(10);
  }).join(' ');
}

export default function BinaryTranslator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['binary-translator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('text-to-binary');
  const [copiedField, setCopiedField] = useState('');

  // Auto-detect mode
  const detectedMode: Mode = isBinaryString(input) ? 'binary-to-text' : 'text-to-binary';
  const activeMode = input.trim() ? detectedMode : mode;

  const hasInput = input.trim().length > 0;

  // Compute results
  let binaryResult = '';
  let octalResult = '';
  let decimalResult = '';
  let textResult = '';
  let isValidBinary = true;

  if (hasInput) {
    if (activeMode === 'text-to-binary') {
      binaryResult = textToBinary(input);
      octalResult = textToOctal(input);
      decimalResult = textToDecimal(input);
      textResult = input;
    } else {
      const decoded = binaryToText(input);
      if (decoded !== null) {
        textResult = decoded;
        binaryResult = input.trim().replace(/\s+/g, ' ');
        octalResult = binaryToOctal(input);
        decimalResult = binaryToDecimalRepr(input);
      } else {
        isValidBinary = false;
      }
    }
  }

  const copyValue = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleSwap = () => {
    if (hasInput && activeMode === 'text-to-binary' && binaryResult) {
      setInput(binaryResult);
    } else if (hasInput && activeMode === 'binary-to-text' && textResult) {
      setInput(textResult);
    }
    setMode(activeMode === 'text-to-binary' ? 'binary-to-text' : 'text-to-binary');
  };

  const handleReset = () => {
    setInput('');
    setMode('text-to-binary');
    setCopiedField('');
  };

  const resultCards = [
    { key: 'binary', label: t('binary'), value: binaryResult, color: 'bg-purple-50 border-purple-200', labelColor: 'text-purple-600' },
    { key: 'octal', label: t('octal'), value: octalResult, color: 'bg-amber-50 border-amber-200', labelColor: 'text-amber-600' },
    { key: 'decimal', label: t('decimal'), value: decimalResult, color: 'bg-green-50 border-green-200', labelColor: 'text-green-600' },
    { key: 'text', label: t('text'), value: textResult, color: 'bg-blue-50 border-blue-200', labelColor: 'text-blue-600' },
  ];

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Binary Translator: Convert Text to Binary and Binary to Text',
      paragraphs: [
        'Our free binary translator instantly converts text to binary code and binary code back to readable text. Binary is the fundamental language of all computers, representing data using only two digits: 0 and 1. Every character you type, every image you see, and every file on your computer is ultimately stored as a sequence of binary digits (bits).',
        'The tool auto-detects whether your input is plain text or binary code. When you type regular text, it converts each character to its 8-bit binary representation (one byte per character), with spaces between bytes for readability. When you paste binary code, it decodes it back to human-readable text instantly.',
        'In addition to binary, the translator also shows octal (base 8) and decimal (base 10) representations of your text. Octal groups binary digits into sets of three, while decimal shows the standard ASCII/Unicode code point for each character. These alternative representations are useful for programming, debugging, and understanding how computers encode information.',
        'Whether you are a student learning about number systems, a developer debugging data encoding issues, or just curious about how computers store text, this binary translator makes the conversion process simple and educational. Use the swap button to quickly toggle between text-to-binary and binary-to-text modes.',
      ],
      faq: [
        { q: 'How does text to binary conversion work?', a: 'Each character in text has a numeric code (ASCII or Unicode). The binary translator converts each character to its binary equivalent using 8 bits (one byte). For example, the letter "A" has ASCII code 65, which is 01000001 in binary. Spaces between bytes make the output readable.' },
        { q: 'What is the binary code for common letters?', a: 'Some common ASCII values in binary: A = 01000001, B = 01000010, a = 01100001, b = 01100010, 0 = 00110000, space = 00100000. Each character uses 8 binary digits (bits), forming one byte.' },
        { q: 'Can this tool handle special characters and Unicode?', a: 'Yes, the translator handles standard ASCII characters (codes 0-127) and extended characters. Each character is converted to its binary representation based on its Unicode code point. For characters beyond basic ASCII, the binary representation may use more than 8 bits.' },
        { q: 'What is the difference between binary, octal, and decimal representations?', a: 'Binary uses base 2 (digits 0-1), octal uses base 8 (digits 0-7), and decimal uses base 10 (digits 0-9). They are all ways to represent the same numeric values. For example, the letter "A" (65) is 01000001 in binary, 101 in octal, and 65 in decimal.' },
        { q: 'How do I read binary code?', a: 'Each group of 8 binary digits (separated by spaces) represents one character. Read each byte from right to left, where each position represents a power of 2: 1, 2, 4, 8, 16, 32, 64, 128. Add up the positions that have a 1. For example, 01001000 = 64+8 = 72 = "H".' },
      ],
    },
    it: {
      title: 'Traduttore Binario: Converti Testo in Binario e Binario in Testo',
      paragraphs: [
        'Il nostro traduttore binario gratuito converte istantaneamente il testo in codice binario e viceversa. Il binario è il linguaggio fondamentale di tutti i computer, rappresentando i dati usando solo due cifre: 0 e 1. Ogni carattere digitato, ogni immagine visualizzata e ogni file sul computer è memorizzato come una sequenza di cifre binarie (bit).',
        'Lo strumento rileva automaticamente se l\'input è testo normale o codice binario. Quando digiti testo normale, converte ogni carattere nella sua rappresentazione binaria a 8 bit (un byte per carattere), con spazi tra i byte per la leggibilità. Quando incolli codice binario, lo decodifica immediatamente in testo leggibile.',
        'Oltre al binario, il traduttore mostra anche le rappresentazioni ottale (base 8) e decimale (base 10) del tuo testo. L\'ottale raggruppa le cifre binarie in insiemi di tre, mentre il decimale mostra il codice ASCII/Unicode standard per ogni carattere.',
        'Che tu sia uno studente che studia i sistemi numerici, uno sviluppatore che debugga problemi di codifica o semplicemente curioso di sapere come i computer memorizzano il testo, questo traduttore binario rende il processo di conversione semplice e istruttivo.',
      ],
      faq: [
        { q: 'Come funziona la conversione da testo a binario?', a: 'Ogni carattere nel testo ha un codice numerico (ASCII o Unicode). Il traduttore binario converte ogni carattere nel suo equivalente binario usando 8 bit (un byte). Per esempio, la lettera "A" ha codice ASCII 65, che è 01000001 in binario.' },
        { q: 'Qual è il codice binario per le lettere comuni?', a: 'Alcuni valori ASCII comuni in binario: A = 01000001, B = 01000010, a = 01100001, b = 01100010, 0 = 00110000, spazio = 00100000. Ogni carattere usa 8 cifre binarie (bit).' },
        { q: 'Questo strumento gestisce caratteri speciali e Unicode?', a: 'Sì, il traduttore gestisce i caratteri ASCII standard (codici 0-127) e i caratteri estesi. Ogni carattere viene convertito nella sua rappresentazione binaria basata sul suo code point Unicode.' },
        { q: 'Qual è la differenza tra rappresentazione binaria, ottale e decimale?', a: 'Il binario usa base 2 (cifre 0-1), l\'ottale usa base 8 (cifre 0-7) e il decimale usa base 10 (cifre 0-9). Sono tutti modi per rappresentare gli stessi valori numerici. Per esempio, la lettera "A" (65) è 01000001 in binario, 101 in ottale e 65 in decimale.' },
        { q: 'Come si legge il codice binario?', a: 'Ogni gruppo di 8 cifre binarie (separato da spazi) rappresenta un carattere. Leggi ogni byte da destra a sinistra, dove ogni posizione rappresenta una potenza di 2: 1, 2, 4, 8, 16, 32, 64, 128. Somma le posizioni che hanno un 1.' },
      ],
    },
    es: {
      title: 'Traductor Binario: Convierte Texto a Binario y Binario a Texto',
      paragraphs: [
        'Nuestro traductor binario gratuito convierte instantáneamente texto a código binario y viceversa. El binario es el lenguaje fundamental de todas las computadoras, representando datos usando solo dos dígitos: 0 y 1. Cada carácter que escribes, cada imagen que ves y cada archivo en tu computadora se almacena como una secuencia de dígitos binarios (bits).',
        'La herramienta detecta automáticamente si tu entrada es texto normal o código binario. Cuando escribes texto normal, convierte cada carácter a su representación binaria de 8 bits (un byte por carácter), con espacios entre bytes para legibilidad.',
        'Además del binario, el traductor también muestra las representaciones octal (base 8) y decimal (base 10) de tu texto. El octal agrupa dígitos binarios en conjuntos de tres, mientras que el decimal muestra el código ASCII/Unicode estándar para cada carácter.',
        'Ya seas un estudiante aprendiendo sobre sistemas numéricos, un desarrollador depurando problemas de codificación o simplemente curioso sobre cómo las computadoras almacenan texto, este traductor binario hace el proceso de conversión simple y educativo.',
      ],
      faq: [
        { q: '¿Cómo funciona la conversión de texto a binario?', a: 'Cada carácter en el texto tiene un código numérico (ASCII o Unicode). El traductor convierte cada carácter a su equivalente binario usando 8 bits (un byte). Por ejemplo, la letra "A" tiene código ASCII 65, que es 01000001 en binario.' },
        { q: '¿Cuál es el código binario para letras comunes?', a: 'Algunos valores ASCII comunes en binario: A = 01000001, B = 01000010, a = 01100001, b = 01100010, 0 = 00110000, espacio = 00100000.' },
        { q: '¿Puede esta herramienta manejar caracteres especiales y Unicode?', a: 'Sí, el traductor maneja caracteres ASCII estándar (códigos 0-127) y caracteres extendidos. Cada carácter se convierte a su representación binaria basada en su code point Unicode.' },
        { q: '¿Cuál es la diferencia entre representación binaria, octal y decimal?', a: 'El binario usa base 2 (dígitos 0-1), el octal usa base 8 (dígitos 0-7) y el decimal usa base 10 (dígitos 0-9). Son diferentes formas de representar los mismos valores numéricos.' },
        { q: '¿Cómo se lee el código binario?', a: 'Cada grupo de 8 dígitos binarios (separados por espacios) representa un carácter. Lee cada byte de derecha a izquierda, donde cada posición representa una potencia de 2: 1, 2, 4, 8, 16, 32, 64, 128. Suma las posiciones que tienen un 1.' },
      ],
    },
    fr: {
      title: 'Traducteur Binaire : Convertir du Texte en Binaire et du Binaire en Texte',
      paragraphs: [
        'Notre traducteur binaire gratuit convertit instantanément le texte en code binaire et inversement. Le binaire est le langage fondamental de tous les ordinateurs, représentant les données avec seulement deux chiffres : 0 et 1. Chaque caractère que vous tapez, chaque image que vous voyez et chaque fichier sur votre ordinateur est stocké sous forme de séquence de chiffres binaires (bits).',
        'L\'outil détecte automatiquement si votre entrée est du texte normal ou du code binaire. Lorsque vous tapez du texte normal, il convertit chaque caractère en sa représentation binaire sur 8 bits (un octet par caractère), avec des espaces entre les octets pour la lisibilité.',
        'En plus du binaire, le traducteur affiche également les représentations octale (base 8) et décimale (base 10) de votre texte. L\'octal regroupe les chiffres binaires par ensembles de trois, tandis que le décimal affiche le code ASCII/Unicode standard de chaque caractère.',
        'Que vous soyez un étudiant apprenant les systèmes numériques, un développeur déboguant des problèmes d\'encodage ou simplement curieux de savoir comment les ordinateurs stockent le texte, ce traducteur binaire rend le processus de conversion simple et éducatif.',
      ],
      faq: [
        { q: 'Comment fonctionne la conversion texte en binaire ?', a: 'Chaque caractère du texte a un code numérique (ASCII ou Unicode). Le traducteur convertit chaque caractère en son équivalent binaire sur 8 bits (un octet). Par exemple, la lettre "A" a le code ASCII 65, soit 01000001 en binaire.' },
        { q: 'Quel est le code binaire des lettres courantes ?', a: 'Quelques valeurs ASCII courantes en binaire : A = 01000001, B = 01000010, a = 01100001, b = 01100010, 0 = 00110000, espace = 00100000.' },
        { q: 'Cet outil gère-t-il les caractères spéciaux et Unicode ?', a: 'Oui, le traducteur gère les caractères ASCII standard (codes 0-127) et les caractères étendus. Chaque caractère est converti en sa représentation binaire basée sur son code point Unicode.' },
        { q: 'Quelle est la différence entre les représentations binaire, octale et décimale ?', a: 'Le binaire utilise la base 2 (chiffres 0-1), l\'octal la base 8 (chiffres 0-7) et le décimal la base 10 (chiffres 0-9). Ce sont différentes façons de représenter les mêmes valeurs numériques.' },
        { q: 'Comment lire le code binaire ?', a: 'Chaque groupe de 8 chiffres binaires (séparés par des espaces) représente un caractère. Lisez chaque octet de droite à gauche, où chaque position représente une puissance de 2 : 1, 2, 4, 8, 16, 32, 64, 128. Additionnez les positions ayant un 1.' },
      ],
    },
    de: {
      title: 'Binär-Übersetzer: Text zu Binär und Binär zu Text Konvertieren',
      paragraphs: [
        'Unser kostenloser Binär-Übersetzer konvertiert sofort Text in Binärcode und umgekehrt. Binär ist die grundlegende Sprache aller Computer und stellt Daten mit nur zwei Ziffern dar: 0 und 1. Jedes Zeichen, das Sie eingeben, jedes Bild, das Sie sehen, und jede Datei auf Ihrem Computer wird als Folge von Binärziffern (Bits) gespeichert.',
        'Das Tool erkennt automatisch, ob Ihre Eingabe normaler Text oder Binärcode ist. Bei normalem Text wird jedes Zeichen in seine 8-Bit-Binärdarstellung (ein Byte pro Zeichen) konvertiert, mit Leerzeichen zwischen den Bytes für bessere Lesbarkeit.',
        'Neben Binär zeigt der Übersetzer auch die Oktal- (Basis 8) und Dezimaldarstellung (Basis 10) Ihres Textes an. Oktal gruppiert Binärziffern in Dreiergruppen, während Dezimal den Standard-ASCII/Unicode-Codepunkt für jedes Zeichen anzeigt.',
        'Ob Sie ein Student sind, der Zahlensysteme lernt, ein Entwickler, der Kodierungsprobleme debuggt, oder einfach neugierig, wie Computer Text speichern – dieser Binär-Übersetzer macht den Konvertierungsprozess einfach und lehrreich.',
      ],
      faq: [
        { q: 'Wie funktioniert die Text-zu-Binär-Konvertierung?', a: 'Jedes Zeichen im Text hat einen numerischen Code (ASCII oder Unicode). Der Übersetzer konvertiert jedes Zeichen in sein binäres Äquivalent mit 8 Bit (ein Byte). Zum Beispiel hat der Buchstabe "A" den ASCII-Code 65, was 01000001 in Binär ist.' },
        { q: 'Was ist der Binärcode für häufige Buchstaben?', a: 'Einige häufige ASCII-Werte in Binär: A = 01000001, B = 01000010, a = 01100001, b = 01100010, 0 = 00110000, Leerzeichen = 00100000.' },
        { q: 'Kann dieses Tool Sonderzeichen und Unicode verarbeiten?', a: 'Ja, der Übersetzer verarbeitet Standard-ASCII-Zeichen (Codes 0-127) und erweiterte Zeichen. Jedes Zeichen wird basierend auf seinem Unicode-Codepunkt in seine Binärdarstellung konvertiert.' },
        { q: 'Was ist der Unterschied zwischen Binär-, Oktal- und Dezimaldarstellung?', a: 'Binär verwendet Basis 2 (Ziffern 0-1), Oktal Basis 8 (Ziffern 0-7) und Dezimal Basis 10 (Ziffern 0-9). Es sind verschiedene Wege, dieselben numerischen Werte darzustellen.' },
        { q: 'Wie liest man Binärcode?', a: 'Jede Gruppe von 8 Binärziffern (durch Leerzeichen getrennt) stellt ein Zeichen dar. Lesen Sie jedes Byte von rechts nach links, wobei jede Position eine Zweierpotenz darstellt: 1, 2, 4, 8, 16, 32, 64, 128. Addieren Sie die Positionen mit einer 1.' },
      ],
    },
    pt: {
      title: 'Tradutor Binário: Converta Texto para Binário e Binário para Texto',
      paragraphs: [
        'Nosso tradutor binário gratuito converte instantaneamente texto em código binário e vice-versa. O binário é a linguagem fundamental de todos os computadores, representando dados usando apenas dois dígitos: 0 e 1. Cada caractere que você digita, cada imagem que vê e cada arquivo no seu computador é armazenado como uma sequência de dígitos binários (bits).',
        'A ferramenta detecta automaticamente se sua entrada é texto normal ou código binário. Quando você digita texto normal, converte cada caractere em sua representação binária de 8 bits (um byte por caractere), com espaços entre bytes para legibilidade.',
        'Além do binário, o tradutor também mostra as representações octal (base 8) e decimal (base 10) do seu texto. O octal agrupa dígitos binários em conjuntos de três, enquanto o decimal mostra o código ASCII/Unicode padrão para cada caractere.',
        'Seja você um estudante aprendendo sobre sistemas numéricos, um desenvolvedor depurando problemas de codificação ou apenas curioso sobre como os computadores armazenam texto, este tradutor binário torna o processo de conversão simples e educativo.',
      ],
      faq: [
        { q: 'Como funciona a conversão de texto para binário?', a: 'Cada caractere no texto tem um código numérico (ASCII ou Unicode). O tradutor converte cada caractere em seu equivalente binário usando 8 bits (um byte). Por exemplo, a letra "A" tem código ASCII 65, que é 01000001 em binário.' },
        { q: 'Qual é o código binário para letras comuns?', a: 'Alguns valores ASCII comuns em binário: A = 01000001, B = 01000010, a = 01100001, b = 01100010, 0 = 00110000, espaço = 00100000.' },
        { q: 'Esta ferramenta lida com caracteres especiais e Unicode?', a: 'Sim, o tradutor lida com caracteres ASCII padrão (códigos 0-127) e caracteres estendidos. Cada caractere é convertido em sua representação binária baseada em seu code point Unicode.' },
        { q: 'Qual é a diferença entre representação binária, octal e decimal?', a: 'O binário usa base 2 (dígitos 0-1), o octal usa base 8 (dígitos 0-7) e o decimal usa base 10 (dígitos 0-9). São diferentes formas de representar os mesmos valores numéricos.' },
        { q: 'Como se lê o código binário?', a: 'Cada grupo de 8 dígitos binários (separados por espaços) representa um caractere. Leia cada byte da direita para a esquerda, onde cada posição representa uma potência de 2: 1, 2, 4, 8, 16, 32, 64, 128. Some as posições que têm um 1.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="binary-translator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Mode indicator */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => { setMode('text-to-binary'); setInput(''); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeMode === 'text-to-binary' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('textToBinary')}
            </button>
            <button
              onClick={() => { setMode('binary-to-text'); setInput(''); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeMode === 'binary-to-text' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('binaryToText')}
            </button>
            {hasInput && (
              <span className="text-xs text-gray-400 ml-2">
                {t('autoDetected')} {activeMode === 'text-to-binary' ? t('textToBinary') : t('binaryToText')}
              </span>
            )}
          </div>

          {/* Input textarea */}
          <div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={activeMode === 'text-to-binary' ? t('inputPlaceholderText') : t('inputPlaceholderBinary')}
              rows={4}
              className={`w-full border rounded-lg px-4 py-3 text-base font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y ${
                hasInput && activeMode === 'binary-to-text' && !isValidBinary ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {hasInput && activeMode === 'binary-to-text' && !isValidBinary && (
              <p className="text-red-500 text-sm mt-1">{t('invalidBinary')}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSwap}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
              title={t('swap')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              {t('swap')}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('reset')}
            </button>
          </div>

          {/* Result cards */}
          {hasInput && isValidBinary && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{t('results')}</h3>
              <div className="grid grid-cols-1 gap-3">
                {resultCards.map((card) => (
                  <div key={card.key} className={`p-4 rounded-xl border ${card.color}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wide ${card.labelColor}`}>{card.label}</span>
                      <button
                        onClick={() => copyValue(card.value, card.key)}
                        className={`text-xs font-medium px-2 py-0.5 rounded transition-colors ${
                          copiedField === card.key
                            ? 'bg-green-100 text-green-700'
                            : 'bg-white/60 text-gray-600 hover:bg-white hover:text-gray-900'
                        }`}
                      >
                        {copiedField === card.key ? t('copied') : t('copy')}
                      </button>
                    </div>
                    <p className="font-mono text-gray-900 text-sm break-all leading-relaxed">
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
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
