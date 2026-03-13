'use client';
import { useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const MORSE_MAP: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': '/',
};

const REVERSE_MORSE: Record<string, string> = {};
for (const [char, code] of Object.entries(MORSE_MAP)) {
  if (char !== ' ') REVERSE_MORSE[code] = char;
}

interface HistoryEntry {
  mode: 'encode' | 'decode';
  input: string;
  output: string;
  timestamp: number;
}

export default function TextToMorse() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['text-to-morse'][lang];

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [speed, setSpeed] = useState(15); // WPM
  const [isPlaying, setIsPlaying] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stopRef = useRef(false);

  const labels = {
    encode: { en: 'Text to Morse', it: 'Testo a Morse', es: 'Texto a Morse', fr: 'Texte en Morse', de: 'Text zu Morse', pt: 'Texto para Morse' },
    decode: { en: 'Morse to Text', it: 'Morse a Testo', es: 'Morse a Texto', fr: 'Morse en Texte', de: 'Morse zu Text', pt: 'Morse para Texto' },
    inputPhEncode: { en: 'Enter text to convert to Morse code...', it: 'Inserisci il testo da convertire in codice Morse...', es: 'Ingresa texto para convertir a código Morse...', fr: 'Entrez le texte à convertir en code Morse...', de: 'Text eingeben, um in Morsecode zu konvertieren...', pt: 'Digite o texto para converter em código Morse...' },
    inputPhDecode: { en: 'Enter Morse code (use . and - separated by spaces, / for word breaks)...', it: 'Inserisci codice Morse (usa . e - separati da spazi, / per separare parole)...', es: 'Ingresa código Morse (usa . y - separados por espacios, / para separar palabras)...', fr: 'Entrez le code Morse (utilisez . et - séparés par des espaces, / pour séparer les mots)...', de: 'Morsecode eingeben (verwende . und - getrennt durch Leerzeichen, / für Worttrennung)...', pt: 'Digite código Morse (use . e - separados por espaços, / para separar palavras)...' },
    convert: { en: 'Convert', it: 'Converti', es: 'Convertir', fr: 'Convertir', de: 'Konvertieren', pt: 'Converter' },
    copyResult: { en: 'Copy Result', it: 'Copia Risultato', es: 'Copiar Resultado', fr: 'Copier le Résultat', de: 'Ergebnis Kopieren', pt: 'Copiar Resultado' },
    copiedLabel: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    reset: { en: 'Reset', it: 'Ripristina', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
    history: { en: 'History', it: 'Cronologia', es: 'Historial', fr: 'Historique', de: 'Verlauf', pt: 'Histórico' },
    clearHistory: { en: 'Clear', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Löschen', pt: 'Limpar' },
    noHistory: { en: 'No conversions yet', it: 'Nessuna conversione', es: 'Sin conversiones', fr: 'Aucune conversion', de: 'Keine Konvertierungen', pt: 'Sem conversões' },
    playAudio: { en: 'Play Audio', it: 'Riproduci Audio', es: 'Reproducir Audio', fr: 'Lire Audio', de: 'Audio Abspielen', pt: 'Reproduzir Áudio' },
    stopAudio: { en: 'Stop', it: 'Ferma', es: 'Detener', fr: 'Arrêter', de: 'Stopp', pt: 'Parar' },
    speed: { en: 'Speed (WPM)', it: 'Velocità (PPM)', es: 'Velocidad (PPM)', fr: 'Vitesse (MPM)', de: 'Geschwindigkeit (WPM)', pt: 'Velocidade (PPM)' },
    visualDisplay: { en: 'Visual Display', it: 'Display Visuale', es: 'Visualización', fr: 'Affichage Visuel', de: 'Visuelle Anzeige', pt: 'Exibição Visual' },
    invalidMorse: { en: 'Invalid Morse code detected. Use dots (.), dashes (-), spaces between letters, and / between words.', it: 'Codice Morse non valido. Usa punti (.), linee (-), spazi tra le lettere e / tra le parole.', es: 'Código Morse no válido. Usa puntos (.), guiones (-), espacios entre letras y / entre palabras.', fr: 'Code Morse invalide. Utilisez des points (.), des tirets (-), des espaces entre les lettres et / entre les mots.', de: 'Ungültiger Morsecode. Verwenden Sie Punkte (.), Striche (-), Leerzeichen zwischen Buchstaben und / zwischen Wörtern.', pt: 'Código Morse inválido. Use pontos (.), traços (-), espaços entre letras e / entre palavras.' },
    unsupportedChar: { en: 'Unsupported characters skipped: ', it: 'Caratteri non supportati ignorati: ', es: 'Caracteres no soportados omitidos: ', fr: 'Caractères non supportés ignorés : ', de: 'Nicht unterstützte Zeichen übersprungen: ', pt: 'Caracteres não suportados ignorados: ' },
    morseOutput: { en: 'Morse Code Output', it: 'Output Codice Morse', es: 'Salida Código Morse', fr: 'Sortie Code Morse', de: 'Morsecode Ausgabe', pt: 'Saída Código Morse' },
    textOutput: { en: 'Text Output', it: 'Output Testo', es: 'Salida Texto', fr: 'Sortie Texte', de: 'Text Ausgabe', pt: 'Saída Texto' },
  } as Record<string, Record<Locale, string>>;

  const textToMorse = useCallback((text: string): { result: string; skipped: string[] } => {
    const upper = text.toUpperCase();
    const skipped: string[] = [];
    const morseChars: string[] = [];

    for (const char of upper) {
      if (MORSE_MAP[char] !== undefined) {
        morseChars.push(MORSE_MAP[char]);
      } else {
        if (!skipped.includes(char) && char.trim()) skipped.push(char);
      }
    }

    // Join with spaces; MORSE_MAP[' '] = '/' so words are separated by ' / '
    let result = '';
    let i = 0;
    for (const char of upper) {
      if (MORSE_MAP[char] !== undefined) {
        if (char === ' ') {
          result += ' / ';
        } else {
          if (i > 0 && result.length > 0 && !result.endsWith(' / ')) {
            result += ' ';
          }
          result += MORSE_MAP[char];
        }
        i++;
      }
    }

    return { result: result.trim(), skipped };
  }, []);

  const morseToText = useCallback((morse: string): { result: string; hasError: boolean } => {
    const words = morse.trim().split(/\s*\/\s*/);
    let result = '';
    let hasError = false;

    for (let w = 0; w < words.length; w++) {
      if (w > 0) result += ' ';
      const letters = words[w].trim().split(/\s+/);
      for (const code of letters) {
        if (!code) continue;
        if (REVERSE_MORSE[code]) {
          result += REVERSE_MORSE[code];
        } else {
          hasError = true;
          result += '?';
        }
      }
    }

    return { result, hasError };
  }, []);

  const convert = useCallback(() => {
    setError('');
    if (!input.trim()) return;

    let resultText: string;
    if (mode === 'encode') {
      const { result, skipped } = textToMorse(input);
      resultText = result;
      if (skipped.length > 0) {
        setError(labels.unsupportedChar[lang] + skipped.join(', '));
      }
    } else {
      const { result, hasError } = morseToText(input);
      resultText = result;
      if (hasError) {
        setError(labels.invalidMorse[lang]);
      }
    }

    setOutput(resultText);

    const entry: HistoryEntry = {
      mode,
      input: input.length > 50 ? input.slice(0, 50) + '...' : input,
      output: resultText.length > 50 ? resultText.slice(0, 50) + '...' : resultText,
      timestamp: Date.now(),
    };
    setHistory(prev => [entry, ...prev].slice(0, 5));
  }, [input, mode, lang, textToMorse, morseToText, labels.unsupportedChar, labels.invalidMorse]);

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setInput('');
    setOutput('');
    setError('');
    setCopied(false);
  };

  const getMorseForAudio = (): string => {
    if (mode === 'encode' && output) return output;
    if (mode === 'decode' && input) return input;
    return '';
  };

  const playMorse = async () => {
    const morseStr = getMorseForAudio();
    if (!morseStr || isPlaying) return;

    stopRef.current = false;
    setIsPlaying(true);

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;

    const dotDuration = 1.2 / speed; // seconds per dot unit
    const freq = 600; // Hz

    const playTone = (duration: number): Promise<void> => {
      return new Promise((resolve) => {
        if (stopRef.current) { resolve(); return; }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.value = 0.5;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
        osc.onended = () => resolve();
      });
    };

    const pause = (duration: number): Promise<void> => {
      return new Promise((resolve) => {
        if (stopRef.current) { resolve(); return; }
        setTimeout(resolve, duration * 1000);
      });
    };

    const symbols = morseStr.split('');
    for (let i = 0; i < symbols.length; i++) {
      if (stopRef.current) break;
      const s = symbols[i];
      if (s === '.') {
        await playTone(dotDuration);
        await pause(dotDuration); // inter-element gap
      } else if (s === '-') {
        await playTone(dotDuration * 3);
        await pause(dotDuration); // inter-element gap
      } else if (s === ' ') {
        // Check if next char is / (word gap) or just letter gap
        if (symbols[i + 1] === '/' || symbols[i - 1] === '/') {
          // Part of word separator, handled by /
        } else {
          await pause(dotDuration * 3); // inter-letter gap
        }
      } else if (s === '/') {
        await pause(dotDuration * 7); // inter-word gap
      }
    }

    setIsPlaying(false);
  };

  const stopMorse = () => {
    stopRef.current = true;
    setIsPlaying(false);
  };

  // Generate visual dots/dashes display
  const renderVisualMorse = (morseStr: string) => {
    if (!morseStr) return null;
    const parts = morseStr.split(' ');
    return (
      <div className="flex flex-wrap items-center gap-1.5 p-4 bg-gray-50 rounded-lg min-h-[60px]">
        {parts.map((part, i) => {
          if (part === '/') {
            return <span key={i} className="w-6" />;
          }
          return (
            <span key={i} className="flex items-center gap-0.5">
              {part.split('').map((sym, j) => {
                if (sym === '.') {
                  return <span key={j} className="inline-block w-3 h-3 rounded-full bg-blue-600" title="dot" />;
                } else if (sym === '-') {
                  return <span key={j} className="inline-block w-8 h-3 rounded-full bg-blue-600" title="dash" />;
                }
                return null;
              })}
            </span>
          );
        })}
      </div>
    );
  };

  const morseForVisual = mode === 'encode' ? output : input;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Morse Code Translator: Encode and Decode Text to Morse Online',
      paragraphs: [
        'Morse code is a method of transmitting text information as a series of on-off signals using dots and dashes. Invented by Samuel Morse in the 1830s for use with the electric telegraph, it became one of the most important communication systems in history. Our free online Morse code translator lets you convert any text to Morse code and decode Morse back to readable text instantly.',
        'Each letter of the alphabet, each numeral, and several punctuation marks are represented by a unique sequence of dots (short signals) and dashes (long signals). A dash is three times the duration of a dot. Letters within a word are separated by short pauses, while words are separated by longer pauses. This elegant system allowed messages to be sent across telegraph wires and, later, via radio waves.',
        'Morse code played a critical role in maritime communication, military operations, and early aviation. The famous SOS distress signal (... --- ...) became universally recognized. Even today, Morse code remains relevant in amateur radio (ham radio), emergency signaling, and accessibility tools for people with limited mobility who can communicate using simple binary inputs.',
        'Our Morse code tool supports the full International Morse Code standard, including all 26 letters, digits 0-9, and common punctuation marks. The built-in audio playback feature uses the Web Audio API to generate authentic beep tones at your chosen speed, measured in words per minute (WPM). The visual display shows each dot and dash graphically, making it easy to learn and verify Morse code patterns.',
        'Whether you are studying for a ham radio license, teaching students about communication history, building an escape room puzzle, or simply curious about this timeless encoding system, our tool provides everything you need. Convert text to Morse, decode Morse to text, listen to the audio output, and explore the visual representation of each character — all for free, with no signup required.',
      ],
      faq: [
        { q: 'What is Morse code and how does it work?', a: 'Morse code is a character encoding system that represents letters and numbers as sequences of dots (short signals) and dashes (long signals). A dash is three times the length of a dot. Letters are separated by gaps equal to three dots, and words are separated by gaps equal to seven dots.' },
        { q: 'How do I type Morse code into the decoder?', a: 'Use a period (.) for dots and a hyphen (-) for dashes. Separate individual letters with a single space, and separate words with a forward slash (/) or three spaces. For example, ".... . .-.. .-.. ---" decodes to "HELLO".' },
        { q: 'What characters are supported by Morse code?', a: 'International Morse Code supports all 26 English letters (A-Z), digits (0-9), and common punctuation including period, comma, question mark, exclamation mark, slash, parentheses, colon, semicolon, equals, plus, hyphen, underscore, quotation marks, dollar sign, and at sign.' },
        { q: 'What does WPM mean in Morse code speed?', a: 'WPM stands for Words Per Minute. It measures how fast Morse code is transmitted. The standard reference word is "PARIS" (which has 50 dot-units). At 15 WPM, each dot lasts about 80 milliseconds. Beginners typically start at 5-10 WPM, while experienced operators work at 20-30 WPM or faster.' },
        { q: 'Is Morse code still used today?', a: 'Yes. Morse code is widely used in amateur (ham) radio worldwide. It is also used in aviation navigation aids (VOR, NDB), as an accessibility input method for people with disabilities, and in emergency signaling. The SOS distress signal (... --- ...) remains universally recognized.' },
      ],
    },
    it: {
      title: 'Traduttore Codice Morse: Codifica e Decodifica Testo in Morse Online',
      paragraphs: [
        'Il codice Morse è un metodo di trasmissione di informazioni testuali come una serie di segnali on-off utilizzando punti e linee. Inventato da Samuel Morse negli anni 1830 per l\'uso con il telegrafo elettrico, è diventato uno dei sistemi di comunicazione più importanti della storia. Il nostro traduttore di codice Morse online gratuito ti permette di convertire qualsiasi testo in codice Morse e decodificare il Morse in testo leggibile istantaneamente.',
        'Ogni lettera dell\'alfabeto, ogni numero e diversi segni di punteggiatura sono rappresentati da una sequenza unica di punti (segnali brevi) e linee (segnali lunghi). Una linea dura tre volte la durata di un punto. Le lettere all\'interno di una parola sono separate da brevi pause, mentre le parole sono separate da pause più lunghe. Questo elegante sistema permetteva di inviare messaggi attraverso i fili del telegrafo e, successivamente, via onde radio.',
        'Il codice Morse ha avuto un ruolo critico nelle comunicazioni marittime, nelle operazioni militari e nell\'aviazione. Il famoso segnale di soccorso SOS (... --- ...) è diventato universalmente riconosciuto. Ancora oggi, il codice Morse resta rilevante nella radio amatoriale, nella segnalazione di emergenza e negli strumenti di accessibilità per persone con mobilità limitata.',
        'Il nostro strumento supporta lo standard completo del Codice Morse Internazionale, incluse tutte le 26 lettere, le cifre 0-9 e i segni di punteggiatura comuni. La funzione di riproduzione audio integrata utilizza la Web Audio API per generare toni autentici alla velocità scelta, misurata in parole al minuto (PPM). Il display visuale mostra ogni punto e linea graficamente.',
        'Che tu stia studiando per una licenza di radioamatore, insegnando la storia delle comunicazioni, creando un puzzle per una escape room, o semplicemente curioso di questo sistema di codifica senza tempo, il nostro strumento fornisce tutto ciò di cui hai bisogno. Converti, decodifica, ascolta e visualizza — tutto gratis, senza registrazione.',
      ],
      faq: [
        { q: 'Cos\'è il codice Morse e come funziona?', a: 'Il codice Morse è un sistema di codifica che rappresenta lettere e numeri come sequenze di punti (segnali brevi) e linee (segnali lunghi). Una linea dura tre volte la lunghezza di un punto. Le lettere sono separate da pause di tre unità punto, le parole da pause di sette unità punto.' },
        { q: 'Come si digita il codice Morse nel decodificatore?', a: 'Usa un punto (.) per i punti e un trattino (-) per le linee. Separa le lettere con uno spazio singolo e le parole con una barra (/) o tre spazi. Ad esempio, ".... . .-.. .-.. ---" decodifica in "HELLO".' },
        { q: 'Quali caratteri supporta il codice Morse?', a: 'Il Codice Morse Internazionale supporta tutte le 26 lettere inglesi (A-Z), le cifre (0-9) e la punteggiatura comune inclusi punto, virgola, punto interrogativo, punto esclamativo, barra, parentesi, due punti, punto e virgola, segno uguale, più, trattino, underscore, virgolette, dollaro e chiocciola.' },
        { q: 'Cosa significa PPM nella velocità del codice Morse?', a: 'PPM significa Parole Per Minuto. Misura la velocità di trasmissione del Morse. La parola di riferimento standard è "PARIS" (che ha 50 unità punto). A 15 PPM, ogni punto dura circa 80 millisecondi. I principianti iniziano a 5-10 PPM, gli operatori esperti a 20-30 PPM o più.' },
        { q: 'Il codice Morse è ancora usato oggi?', a: 'Sì. Il codice Morse è ampiamente usato nella radio amatoriale (ham radio) in tutto il mondo. È usato anche negli aiuti alla navigazione aerea (VOR, NDB), come metodo di input accessibile per persone con disabilità e nella segnalazione di emergenza. Il segnale SOS (... --- ...) resta universalmente riconosciuto.' },
      ],
    },
    es: {
      title: 'Traductor de Código Morse: Codifica y Decodifica Texto a Morse Online',
      paragraphs: [
        'El código Morse es un método de transmisión de información textual como una serie de señales de encendido y apagado usando puntos y rayas. Inventado por Samuel Morse en la década de 1830 para uso con el telégrafo eléctrico, se convirtió en uno de los sistemas de comunicación más importantes de la historia. Nuestro traductor de código Morse gratuito te permite convertir cualquier texto a código Morse y decodificar Morse a texto legible al instante.',
        'Cada letra del alfabeto, cada número y varios signos de puntuación están representados por una secuencia única de puntos (señales cortas) y rayas (señales largas). Una raya dura tres veces la duración de un punto. Las letras dentro de una palabra se separan por pausas cortas, mientras que las palabras se separan por pausas más largas. Este elegante sistema permitía enviar mensajes a través de cables telegráficos y, más tarde, por ondas de radio.',
        'El código Morse jugó un papel crítico en las comunicaciones marítimas, operaciones militares y la aviación temprana. La famosa señal de socorro SOS (... --- ...) se volvió universalmente reconocida. Hoy en día, el código Morse sigue siendo relevante en la radio amateur, señalización de emergencia y herramientas de accesibilidad para personas con movilidad limitada.',
        'Nuestra herramienta soporta el estándar completo del Código Morse Internacional, incluyendo las 26 letras, dígitos 0-9 y signos de puntuación comunes. La función de reproducción de audio usa la Web Audio API para generar tonos auténticos a la velocidad elegida, medida en palabras por minuto (PPM). La visualización muestra cada punto y raya gráficamente.',
        'Ya sea que estés estudiando para una licencia de radioaficionado, enseñando historia de las comunicaciones, creando un acertijo para una escape room, o simplemente curioso sobre este sistema de codificación atemporal, nuestra herramienta proporciona todo lo que necesitas. Convierte, decodifica, escucha y visualiza — todo gratis, sin registro.',
      ],
      faq: [
        { q: '¿Qué es el código Morse y cómo funciona?', a: 'El código Morse es un sistema de codificación que representa letras y números como secuencias de puntos (señales cortas) y rayas (señales largas). Una raya tiene tres veces la longitud de un punto. Las letras se separan por pausas de tres unidades punto, las palabras por pausas de siete unidades punto.' },
        { q: '¿Cómo escribo código Morse en el decodificador?', a: 'Usa un punto (.) para los puntos y un guión (-) para las rayas. Separa las letras con un espacio simple y las palabras con una barra (/) o tres espacios. Por ejemplo, ".... . .-.. .-.. ---" decodifica como "HELLO".' },
        { q: '¿Qué caracteres soporta el código Morse?', a: 'El Código Morse Internacional soporta las 26 letras inglesas (A-Z), dígitos (0-9) y puntuación común incluyendo punto, coma, signo de interrogación, signo de exclamación, barra, paréntesis, dos puntos, punto y coma, igual, más, guión, guión bajo, comillas, dólar y arroba.' },
        { q: '¿Qué significa PPM en la velocidad del código Morse?', a: 'PPM significa Palabras Por Minuto. Mide la velocidad de transmisión del Morse. La palabra de referencia es "PARIS" (que tiene 50 unidades punto). A 15 PPM, cada punto dura unos 80 milisegundos. Los principiantes empiezan a 5-10 PPM, los operadores expertos a 20-30 PPM o más.' },
        { q: '¿El código Morse todavía se usa hoy?', a: 'Sí. El código Morse se usa ampliamente en la radio amateur en todo el mundo. También se usa en ayudas a la navegación aérea (VOR, NDB), como método de entrada accesible para personas con discapacidades y en señalización de emergencia. La señal SOS (... --- ...) sigue siendo universalmente reconocida.' },
      ],
    },
    fr: {
      title: 'Traducteur de Code Morse : Encodez et Décodez du Texte en Morse en Ligne',
      paragraphs: [
        'Le code Morse est une méthode de transmission d\'informations textuelles sous forme de signaux marche-arrêt utilisant des points et des tirets. Inventé par Samuel Morse dans les années 1830 pour le télégraphe électrique, il est devenu l\'un des systèmes de communication les plus importants de l\'histoire. Notre traducteur de code Morse en ligne gratuit vous permet de convertir n\'importe quel texte en code Morse et de décoder le Morse en texte lisible instantanément.',
        'Chaque lettre de l\'alphabet, chaque chiffre et plusieurs signes de ponctuation sont représentés par une séquence unique de points (signaux courts) et de tirets (signaux longs). Un tiret dure trois fois la durée d\'un point. Les lettres d\'un mot sont séparées par de courtes pauses, tandis que les mots sont séparés par des pauses plus longues. Ce système élégant permettait d\'envoyer des messages par fils télégraphiques puis par ondes radio.',
        'Le code Morse a joué un rôle critique dans les communications maritimes, les opérations militaires et l\'aviation. Le célèbre signal de détresse SOS (... --- ...) est devenu universellement reconnu. Aujourd\'hui encore, le code Morse reste pertinent dans la radio amateur, la signalisation d\'urgence et les outils d\'accessibilité pour les personnes à mobilité réduite.',
        'Notre outil supporte le standard complet du Code Morse International, incluant les 26 lettres, les chiffres 0-9 et les signes de ponctuation courants. La fonction de lecture audio utilise la Web Audio API pour générer des tonalités authentiques à la vitesse choisie, mesurée en mots par minute (MPM). L\'affichage visuel montre chaque point et tiret graphiquement.',
        'Que vous prépariez une licence de radioamateur, enseigniez l\'histoire des communications, créiez une énigme pour une escape room, ou soyez simplement curieux de ce système de codage intemporel, notre outil fournit tout ce dont vous avez besoin. Convertissez, décodez, écoutez et visualisez — le tout gratuitement, sans inscription.',
      ],
      faq: [
        { q: 'Qu\'est-ce que le code Morse et comment fonctionne-t-il ?', a: 'Le code Morse est un système de codage qui représente les lettres et les chiffres comme des séquences de points (signaux courts) et de tirets (signaux longs). Un tiret fait trois fois la longueur d\'un point. Les lettres sont séparées par des pauses de trois unités point, les mots par des pauses de sept unités point.' },
        { q: 'Comment saisir du code Morse dans le décodeur ?', a: 'Utilisez un point (.) pour les points et un tiret (-) pour les tirets. Séparez les lettres par un espace simple et les mots par une barre oblique (/) ou trois espaces. Par exemple, ".... . .-.. .-.. ---" se décode en "HELLO".' },
        { q: 'Quels caractères le code Morse supporte-t-il ?', a: 'Le Code Morse International supporte les 26 lettres anglaises (A-Z), les chiffres (0-9) et la ponctuation courante incluant point, virgule, point d\'interrogation, point d\'exclamation, barre oblique, parenthèses, deux-points, point-virgule, égal, plus, tiret, underscore, guillemets, dollar et arobase.' },
        { q: 'Que signifie MPM dans la vitesse du code Morse ?', a: 'MPM signifie Mots Par Minute. Cela mesure la vitesse de transmission du Morse. Le mot de référence est "PARIS" (qui a 50 unités point). À 15 MPM, chaque point dure environ 80 millisecondes. Les débutants commencent à 5-10 MPM, les opérateurs expérimentés à 20-30 MPM ou plus.' },
        { q: 'Le code Morse est-il encore utilisé aujourd\'hui ?', a: 'Oui. Le code Morse est largement utilisé dans la radio amateur dans le monde entier. Il est aussi utilisé dans les aides à la navigation aérienne (VOR, NDB), comme méthode de saisie accessible pour les personnes handicapées et dans la signalisation d\'urgence. Le signal SOS (... --- ...) reste universellement reconnu.' },
      ],
    },
    de: {
      title: 'Morsecode Übersetzer: Text zu Morse Kodieren und Dekodieren Online',
      paragraphs: [
        'Morsecode ist eine Methode zur Übertragung von Textinformationen als Serie von Ein-Aus-Signalen mit Punkten und Strichen. In den 1830er Jahren von Samuel Morse für den elektrischen Telegrafen erfunden, wurde er zu einem der wichtigsten Kommunikationssysteme der Geschichte. Unser kostenloser Online-Morsecode-Übersetzer ermöglicht es Ihnen, jeden Text in Morsecode umzuwandeln und Morse sofort in lesbaren Text zu dekodieren.',
        'Jeder Buchstabe des Alphabets, jede Ziffer und mehrere Satzzeichen werden durch eine einzigartige Sequenz von Punkten (kurze Signale) und Strichen (lange Signale) dargestellt. Ein Strich dauert dreimal so lang wie ein Punkt. Buchstaben innerhalb eines Wortes werden durch kurze Pausen getrennt, während Wörter durch längere Pausen getrennt werden. Dieses elegante System ermöglichte es, Nachrichten über Telegrafendrähte und später per Funkwellen zu senden.',
        'Morsecode spielte eine kritische Rolle in der Schifffahrtskommunikation, bei militärischen Operationen und in der frühen Luftfahrt. Das berühmte SOS-Notsignal (... --- ...) wurde weltweit anerkannt. Auch heute bleibt Morsecode im Amateurfunk, bei Notfallsignalen und bei Barrierefreiheits-Tools für Menschen mit eingeschränkter Mobilität relevant.',
        'Unser Tool unterstützt den vollständigen internationalen Morsecode-Standard, einschließlich aller 26 Buchstaben, Ziffern 0-9 und gängiger Satzzeichen. Die integrierte Audiowiedergabe nutzt die Web Audio API, um authentische Pieptöne in der gewählten Geschwindigkeit zu erzeugen, gemessen in Wörtern pro Minute (WPM). Die visuelle Anzeige zeigt jeden Punkt und Strich grafisch an.',
        'Ob Sie für eine Amateurfunklizenz lernen, Schülern Kommunikationsgeschichte beibringen, ein Escape-Room-Rätsel erstellen oder einfach neugierig auf dieses zeitlose Codiersystem sind — unser Tool bietet alles, was Sie brauchen. Konvertieren, dekodieren, anhören und visualisieren — alles kostenlos, ohne Anmeldung.',
      ],
      faq: [
        { q: 'Was ist Morsecode und wie funktioniert er?', a: 'Morsecode ist ein Zeichenkodierungssystem, das Buchstaben und Zahlen als Sequenzen von Punkten (kurze Signale) und Strichen (lange Signale) darstellt. Ein Strich ist dreimal so lang wie ein Punkt. Buchstaben werden durch Pausen von drei Punkteinheiten getrennt, Wörter durch Pausen von sieben Punkteinheiten.' },
        { q: 'Wie gebe ich Morsecode in den Dekoder ein?', a: 'Verwenden Sie einen Punkt (.) für Punkte und einen Bindestrich (-) für Striche. Trennen Sie Buchstaben mit einem einfachen Leerzeichen und Wörter mit einem Schrägstrich (/) oder drei Leerzeichen. Zum Beispiel dekodiert ".... . .-.. .-.. ---" zu "HELLO".' },
        { q: 'Welche Zeichen unterstützt Morsecode?', a: 'Der internationale Morsecode unterstützt alle 26 englischen Buchstaben (A-Z), Ziffern (0-9) und gängige Satzzeichen einschließlich Punkt, Komma, Fragezeichen, Ausrufezeichen, Schrägstrich, Klammern, Doppelpunkt, Semikolon, Gleichheitszeichen, Plus, Bindestrich, Unterstrich, Anführungszeichen, Dollar und At-Zeichen.' },
        { q: 'Was bedeutet WPM bei der Morsecode-Geschwindigkeit?', a: 'WPM steht für Wörter Pro Minute. Es misst die Übertragungsgeschwindigkeit von Morse. Das Standardreferenzwort ist "PARIS" (mit 50 Punkteinheiten). Bei 15 WPM dauert jeder Punkt etwa 80 Millisekunden. Anfänger beginnen bei 5-10 WPM, erfahrene Funker arbeiten mit 20-30 WPM oder schneller.' },
        { q: 'Wird Morsecode heute noch verwendet?', a: 'Ja. Morsecode wird weltweit im Amateurfunk (Ham Radio) genutzt. Er wird auch bei Flugnavigationshilfen (VOR, NDB), als barrierefreie Eingabemethode für Menschen mit Behinderungen und bei Notfallsignalen verwendet. Das SOS-Signal (... --- ...) bleibt weltweit anerkannt.' },
      ],
    },
    pt: {
      title: 'Tradutor de Código Morse: Codifique e Decodifique Texto em Morse Online',
      paragraphs: [
        'O código Morse é um método de transmissão de informações textuais como uma série de sinais liga-desliga usando pontos e traços. Inventado por Samuel Morse na década de 1830 para uso com o telégrafo elétrico, tornou-se um dos sistemas de comunicação mais importantes da história. Nosso tradutor de código Morse online gratuito permite converter qualquer texto em código Morse e decodificar Morse em texto legível instantaneamente.',
        'Cada letra do alfabeto, cada número e vários sinais de pontuação são representados por uma sequência única de pontos (sinais curtos) e traços (sinais longos). Um traço dura três vezes a duração de um ponto. Letras dentro de uma palavra são separadas por pausas curtas, enquanto palavras são separadas por pausas mais longas. Este sistema elegante permitia enviar mensagens por fios telegráficos e, mais tarde, por ondas de rádio.',
        'O código Morse desempenhou um papel crítico nas comunicações marítimas, operações militares e aviação. O famoso sinal de socorro SOS (... --- ...) tornou-se universalmente reconhecido. Ainda hoje, o código Morse permanece relevante no rádio amador, sinalização de emergência e ferramentas de acessibilidade para pessoas com mobilidade limitada.',
        'Nossa ferramenta suporta o padrão completo do Código Morse Internacional, incluindo todas as 26 letras, dígitos 0-9 e sinais de pontuação comuns. A função de reprodução de áudio usa a Web Audio API para gerar tons autênticos na velocidade escolhida, medida em palavras por minuto (PPM). A exibição visual mostra cada ponto e traço graficamente.',
        'Seja estudando para uma licença de radioamador, ensinando história das comunicações, criando um enigma para uma escape room, ou simplesmente curioso sobre este sistema de codificação atemporal, nossa ferramenta fornece tudo que você precisa. Converta, decodifique, ouça e visualize — tudo grátis, sem registro.',
      ],
      faq: [
        { q: 'O que é código Morse e como funciona?', a: 'O código Morse é um sistema de codificação que representa letras e números como sequências de pontos (sinais curtos) e traços (sinais longos). Um traço tem três vezes o comprimento de um ponto. Letras são separadas por pausas de três unidades ponto, palavras por pausas de sete unidades ponto.' },
        { q: 'Como digitar código Morse no decodificador?', a: 'Use um ponto (.) para pontos e um hífen (-) para traços. Separe letras com um espaço simples e palavras com uma barra (/) ou três espaços. Por exemplo, ".... . .-.. .-.. ---" decodifica como "HELLO".' },
        { q: 'Quais caracteres o código Morse suporta?', a: 'O Código Morse Internacional suporta todas as 26 letras inglesas (A-Z), dígitos (0-9) e pontuação comum incluindo ponto, vírgula, interrogação, exclamação, barra, parênteses, dois pontos, ponto e vírgula, igual, mais, hífen, underscore, aspas, cifrão e arroba.' },
        { q: 'O que significa PPM na velocidade do código Morse?', a: 'PPM significa Palavras Por Minuto. Mede a velocidade de transmissão do Morse. A palavra de referência é "PARIS" (que tem 50 unidades ponto). A 15 PPM, cada ponto dura cerca de 80 milissegundos. Iniciantes começam a 5-10 PPM, operadores experientes a 20-30 PPM ou mais.' },
        { q: 'O código Morse ainda é usado hoje?', a: 'Sim. O código Morse é amplamente usado no rádio amador em todo o mundo. Também é usado em auxílios à navegação aérea (VOR, NDB), como método de entrada acessível para pessoas com deficiências e em sinalização de emergência. O sinal SOS (... --- ...) permanece universalmente reconhecido.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="text-to-morse" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button onClick={() => { setMode('encode'); setOutput(''); setError(''); }} className={`flex-1 py-2 rounded-lg font-medium transition-colors ${mode === 'encode' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {labels.encode[lang]}
            </button>
            <button onClick={() => { setMode('decode'); setOutput(''); setError(''); }} className={`flex-1 py-2 rounded-lg font-medium transition-colors ${mode === 'decode' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {labels.decode[lang]}
            </button>
          </div>

          {/* Input */}
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); }}
            placeholder={mode === 'encode' ? labels.inputPhEncode[lang] : labels.inputPhDecode[lang]}
            className="w-full h-32 border border-gray-300 rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500"
          />

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button onClick={convert} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              {labels.convert[lang]}
            </button>
            <button onClick={reset} className="px-5 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
              {labels.reset[lang]}
            </button>
          </div>

          {/* Output */}
          {output && (
            <>
              <div className="relative">
                <div className="text-xs text-gray-500 font-medium mb-1">
                  {mode === 'encode' ? labels.morseOutput[lang] : labels.textOutput[lang]}
                </div>
                <button
                  onClick={copy}
                  className="absolute top-0 right-0 px-3 py-1.5 bg-gray-700 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                >
                  {copied ? labels.copiedLabel[lang] : labels.copyResult[lang]}
                </button>
                <pre className="bg-gray-900 text-green-400 p-4 pt-8 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap break-all">{output}</pre>
              </div>

              {/* Visual Display */}
              {morseForVisual && (
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">{labels.visualDisplay[lang]}</div>
                  {renderVisualMorse(morseForVisual)}
                </div>
              )}

              {/* Audio Controls */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{labels.speed[lang]}:</label>
                  <input
                    type="range"
                    min={5}
                    max={30}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-bold text-gray-900 w-8 text-right">{speed}</span>
                </div>
                <div className="flex gap-2">
                  {!isPlaying ? (
                    <button onClick={playMorse} className="flex-1 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                      {labels.playAudio[lang]}
                    </button>
                  ) : (
                    <button onClick={stopMorse} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
                      {labels.stopAudio[lang]}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* History section */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">{labels.history[lang]}</h3>
            {history.length > 0 && (
              <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:text-red-700 transition-colors">
                {labels.clearHistory[lang]}
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 italic">{labels.noHistory[lang]}</p>
          ) : (
            <div className="space-y-2">
              {history.map((entry) => (
                <div
                  key={entry.timestamp}
                  className="flex items-center gap-3 text-sm border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setMode(entry.mode);
                    if (!entry.input.endsWith('...')) setInput(entry.input);
                    if (!entry.output.endsWith('...')) setOutput(entry.output);
                  }}
                >
                  <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${entry.mode === 'encode' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {labels[entry.mode][lang]}
                  </span>
                  <span className="text-gray-600 truncate flex-1 font-mono text-xs">{entry.input}</span>
                  <span className="shrink-0 text-gray-400 text-xs font-mono">{entry.output.slice(0, 20)}{entry.output.length > 20 ? '...' : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>)}
        </article>

        {/* FAQ */}
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
