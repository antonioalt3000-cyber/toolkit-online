'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type NoiseType = 'white' | 'pink' | 'brown';

export default function NoiseGenerator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['noise-generator'][lang];
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [activeNoises, setActiveNoises] = useState<Set<NoiseType>>(new Set(['white']));
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [customTimer, setCustomTimer] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseNodesRef = useRef<Map<NoiseType, { source: AudioBufferSourceNode; gain: GainNode }>>(new Map());
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const FADE_DURATION = 0.3;

  const labels: Record<string, Record<Locale, string>> = {
    whiteNoise: { en: 'White Noise', it: 'Rumore Bianco', es: 'Ruido Blanco', fr: 'Bruit Blanc', de: 'Weißes Rauschen', pt: 'Ruído Branco' },
    pinkNoise: { en: 'Pink Noise', it: 'Rumore Rosa', es: 'Ruido Rosa', fr: 'Bruit Rose', de: 'Rosa Rauschen', pt: 'Ruído Rosa' },
    brownNoise: { en: 'Brown Noise', it: 'Rumore Marrone', es: 'Ruido Marrón', fr: 'Bruit Brun', de: 'Braunes Rauschen', pt: 'Ruído Marrom' },
    play: { en: 'Play', it: 'Riproduci', es: 'Reproducir', fr: 'Lire', de: 'Abspielen', pt: 'Reproduzir' },
    stop: { en: 'Stop', it: 'Ferma', es: 'Detener', fr: 'Arrêter', de: 'Stopp', pt: 'Parar' },
    volume: { en: 'Volume', it: 'Volume', es: 'Volumen', fr: 'Volume', de: 'Lautstärke', pt: 'Volume' },
    timer: { en: 'Auto-stop Timer', it: 'Timer Auto-stop', es: 'Temporizador Auto-stop', fr: 'Minuterie Auto-stop', de: 'Auto-Stopp Timer', pt: 'Temporizador Auto-parar' },
    noTimer: { en: 'No timer', it: 'Nessun timer', es: 'Sin temporizador', fr: 'Pas de minuterie', de: 'Kein Timer', pt: 'Sem temporizador' },
    minutes: { en: 'min', it: 'min', es: 'min', fr: 'min', de: 'Min', pt: 'min' },
    custom: { en: 'Custom', it: 'Personalizzato', es: 'Personalizado', fr: 'Personnalisé', de: 'Benutzerdefiniert', pt: 'Personalizado' },
    customPlaceholder: { en: 'Minutes...', it: 'Minuti...', es: 'Minutos...', fr: 'Minutes...', de: 'Minuten...', pt: 'Minutos...' },
    remaining: { en: 'Remaining', it: 'Rimanente', es: 'Restante', fr: 'Restant', de: 'Verbleibend', pt: 'Restante' },
    noiseTypes: { en: 'Noise Types', it: 'Tipi di Rumore', es: 'Tipos de Ruido', fr: 'Types de Bruit', de: 'Rauschtypen', pt: 'Tipos de Ruído' },
    selectNoise: { en: 'Select one or more noise types to mix', it: 'Seleziona uno o più tipi di rumore da mixare', es: 'Selecciona uno o más tipos de ruido para mezclar', fr: 'Sélectionnez un ou plusieurs types de bruit à mixer', de: 'Wählen Sie einen oder mehrere Rauschtypen zum Mischen', pt: 'Selecione um ou mais tipos de ruído para mixar' },
    playing: { en: 'Playing...', it: 'In riproduzione...', es: 'Reproduciendo...', fr: 'Lecture en cours...', de: 'Wird abgespielt...', pt: 'Reproduzindo...' },
    stopped: { en: 'Stopped', it: 'Fermo', es: 'Detenido', fr: 'Arrêté', de: 'Gestoppt', pt: 'Parado' },
    whiteDesc: { en: 'Equal intensity across all frequencies. Great for focus and masking sounds.', it: 'Intensità uguale su tutte le frequenze. Ottimo per concentrazione e mascheramento suoni.', es: 'Intensidad igual en todas las frecuencias. Genial para concentración y enmascarar sonidos.', fr: 'Intensité égale sur toutes les fréquences. Idéal pour la concentration et le masquage des sons.', de: 'Gleiche Intensität über alle Frequenzen. Toll für Fokus und Geräuschmaskierung.', pt: 'Intensidade igual em todas as frequências. Ótimo para foco e mascarar sons.' },
    pinkDesc: { en: 'Deeper, balanced sound. Mimics rainfall and is soothing for sleep.', it: 'Suono più profondo e bilanciato. Imita la pioggia, rilassante per dormire.', es: 'Sonido más profundo y equilibrado. Imita la lluvia y es relajante para dormir.', fr: 'Son plus profond et équilibré. Imite la pluie et favorise le sommeil.', de: 'Tieferer, ausgewogener Klang. Ahmt Regen nach und fördert den Schlaf.', pt: 'Som mais profundo e equilibrado. Imita chuva e é relaxante para dormir.' },
    brownDesc: { en: 'Deep, rumbling low frequencies. Like thunder or a waterfall.', it: 'Frequenze basse profonde e rombanti. Come un tuono o una cascata.', es: 'Frecuencias bajas profundas y retumbantes. Como un trueno o cascada.', fr: 'Fréquences basses profondes et grondantes. Comme le tonnerre ou une cascade.', de: 'Tiefe, grollende Frequenzen. Wie Donner oder ein Wasserfall.', pt: 'Frequências graves profundas e estrondosas. Como trovão ou cachoeira.' },
  };

  const generateWhiteNoise = useCallback((ctx: AudioContext, length: number): AudioBuffer => {
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }, []);

  const generatePinkNoise = useCallback((ctx: AudioContext, length: number): AudioBuffer => {
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }, []);

  const generateBrownNoise = useCallback((ctx: AudioContext, length: number): AudioBuffer => {
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + (0.02 * white)) / 1.02;
      data[i] = lastOut * 3.5;
    }
    return buffer;
  }, []);

  const createNoiseSource = useCallback((ctx: AudioContext, type: NoiseType, destination: AudioNode): { source: AudioBufferSourceNode; gain: GainNode } => {
    const bufferLength = ctx.sampleRate * 4;
    let buffer: AudioBuffer;
    switch (type) {
      case 'white': buffer = generateWhiteNoise(ctx, bufferLength); break;
      case 'pink': buffer = generatePinkNoise(ctx, bufferLength); break;
      case 'brown': buffer = generateBrownNoise(ctx, bufferLength); break;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    source.connect(gain);
    gain.connect(destination);
    return { source, gain };
  }, [generateWhiteNoise, generatePinkNoise, generateBrownNoise]);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgb(249, 250, 251)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(0.5, '#8b5cf6');
      gradient.addColorStop(1, '#a78bfa');
      ctx.strokeStyle = gradient;
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    draw();
  }, []);

  const handlePlay = useCallback(() => {
    const ctx = audioContextRef.current || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    audioContextRef.current = ctx;

    if (ctx.state === 'suspended') ctx.resume();

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + FADE_DURATION);
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    activeNoises.forEach((type) => {
      const node = createNoiseSource(ctx, type, masterGain);
      node.gain.gain.setValueAtTime(0, ctx.currentTime);
      node.gain.gain.linearRampToValueAtTime(1 / activeNoises.size, ctx.currentTime + FADE_DURATION);
      node.source.start();
      noiseNodesRef.current.set(type, node);
    });

    setIsPlaying(true);
    drawWaveform();

    if (timerMinutes > 0) {
      setRemainingSeconds(timerMinutes * 60);
    }
  }, [volume, activeNoises, timerMinutes, createNoiseSource, drawWaveform]);

  const handleStop = useCallback(() => {
    const ctx = audioContextRef.current;
    if (ctx && gainNodeRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_DURATION);
      setTimeout(() => {
        noiseNodesRef.current.forEach((node) => {
          try { node.source.stop(); } catch { /* already stopped */ }
        });
        noiseNodesRef.current.clear();
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        analyserRef.current = null;
        gainNodeRef.current = null;
      }, FADE_DURATION * 1000 + 50);
    }
    setIsPlaying(false);
    setRemainingSeconds(0);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Draw flat line
    const canvas = canvasRef.current;
    if (canvas) {
      const c = canvas.getContext('2d');
      if (c) {
        c.fillStyle = 'rgb(249, 250, 251)';
        c.fillRect(0, 0, canvas.width, canvas.height);
        c.strokeStyle = '#d1d5db';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(0, canvas.height / 2);
        c.lineTo(canvas.width, canvas.height / 2);
        c.stroke();
      }
    }
  }, []);

  // Volume changes while playing
  useEffect(() => {
    if (isPlaying && gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.1);
    }
  }, [volume, isPlaying]);

  // Timer countdown
  useEffect(() => {
    if (isPlaying && remainingSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            handleStop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      };
    }
  }, [isPlaying, remainingSeconds, handleStop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      noiseNodesRef.current.forEach((node) => {
        try { node.source.stop(); } catch { /* */ }
      });
      if (audioContextRef.current) audioContextRef.current.close();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const toggleNoise = (type: NoiseType) => {
    if (isPlaying) return;
    setActiveNoises((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timerPresets = [0, 15, 30, 45, 60];

  const handleCustomTimer = () => {
    const val = parseInt(customTimer);
    if (val > 0 && val <= 480) {
      setTimerMinutes(val);
      setCustomTimer('');
    }
  };

  const noiseCards: { type: NoiseType; label: string; desc: string; color: string; activeColor: string; borderColor: string }[] = [
    { type: 'white', label: labels.whiteNoise[lang], desc: labels.whiteDesc[lang], color: 'bg-gray-50', activeColor: 'bg-gray-200 ring-2 ring-gray-400', borderColor: 'border-gray-300' },
    { type: 'pink', label: labels.pinkNoise[lang], desc: labels.pinkDesc[lang], color: 'bg-pink-50', activeColor: 'bg-pink-200 ring-2 ring-pink-400', borderColor: 'border-pink-300' },
    { type: 'brown', label: labels.brownNoise[lang], desc: labels.brownDesc[lang], color: 'bg-amber-50', activeColor: 'bg-amber-200 ring-2 ring-amber-400', borderColor: 'border-amber-300' },
  ];

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Online Noise Generator – White, Pink & Brown Noise for Focus and Sleep',
      paragraphs: [
        'Ambient noise has been scientifically proven to improve focus, aid sleep, and reduce stress. Our free online noise generator creates high-quality white, pink, and brown noise directly in your browser using the Web Audio API — no downloads, no accounts, and complete privacy since all audio is generated locally on your device.',
        'White noise contains equal energy across all frequencies, making it excellent for masking distracting sounds in offices, dorms, or noisy environments. Pink noise emphasizes lower frequencies, producing a deeper, more balanced sound similar to steady rainfall or rustling leaves — research suggests it can enhance deep sleep and memory consolidation.',
        'Brown noise (also called Brownian or red noise) goes even deeper, with a rich rumbling quality reminiscent of thunder, strong wind, or a waterfall. Many people find it the most soothing of the three for relaxation and meditation. Our tool lets you mix multiple noise types together to create your perfect ambient soundscape.',
        'Features include an adjustable volume slider with smooth fade in/out transitions, a real-time waveform visualization, and an auto-stop timer with presets from 15 to 60 minutes or a custom duration. Whether you are studying, working, meditating, or trying to fall asleep, this noise generator provides the perfect audio backdrop for any situation.',
      ],
      faq: [
        { q: 'What is the difference between white, pink, and brown noise?', a: 'White noise has equal intensity across all frequencies (like TV static). Pink noise has more energy in lower frequencies, sounding deeper and more balanced (like rainfall). Brown noise emphasizes even lower frequencies, producing a deep rumbling sound (like thunder or a waterfall). Each type is suited to different purposes.' },
        { q: 'Can noise generators help with sleep?', a: 'Yes. Research shows that consistent ambient noise can help mask disruptive sounds and promote relaxation. Pink noise in particular has been studied for its ability to improve deep sleep quality and memory consolidation. Many users find brown noise especially calming for falling asleep.' },
        { q: 'Is the audio generated locally or sent to a server?', a: 'All audio is generated 100% locally in your browser using the Web Audio API. No sound data is sent to any server. Your session is completely private, and the tool works even without an internet connection once the page is loaded.' },
        { q: 'Can I mix different noise types together?', a: 'Yes. You can select multiple noise types simultaneously to create a custom blend. For example, combining white and brown noise creates a balanced soundscape with both high-frequency masking and deep low-frequency rumble.' },
        { q: 'How does the auto-stop timer work?', a: 'Select a preset duration (15, 30, 45, or 60 minutes) or enter a custom time up to 8 hours. The noise will automatically fade out and stop when the timer reaches zero, perfect for falling asleep without leaving noise playing all night.' },
      ],
    },
    it: {
      title: 'Generatore di Rumore Online Gratuito – Rumore Bianco, Rosa e Marrone per Concentrazione e Sonno',
      paragraphs: [
        'Il rumore ambientale è scientificamente dimostrato migliorare la concentrazione, favorire il sonno e ridurre lo stress. Il nostro generatore di rumore online gratuito crea rumore bianco, rosa e marrone di alta qualità direttamente nel browser usando la Web Audio API — nessun download, nessun account e completa privacy poiché tutto l\'audio è generato localmente sul dispositivo.',
        'Il rumore bianco contiene energia uguale su tutte le frequenze, rendendolo eccellente per mascherare suoni distraenti in uffici, dormitori o ambienti rumorosi. Il rumore rosa enfatizza le frequenze più basse, producendo un suono più profondo e bilanciato simile alla pioggia costante — la ricerca suggerisce che può migliorare il sonno profondo e il consolidamento della memoria.',
        'Il rumore marrone (chiamato anche browniano o rosso) è ancora più profondo, con una qualità rombante ricca che ricorda il tuono, il vento forte o una cascata. Molte persone lo trovano il più rilassante dei tre per rilassamento e meditazione. Il nostro strumento permette di mixare più tipi di rumore insieme per creare il tuo paesaggio sonoro ambientale perfetto.',
        'Le funzionalità includono un cursore del volume regolabile con transizioni fade in/out fluide, una visualizzazione della forma d\'onda in tempo reale e un timer di auto-stop con preset da 15 a 60 minuti o una durata personalizzata. Che tu stia studiando, lavorando, meditando o cercando di addormentarti, questo generatore di rumore fornisce lo sfondo audio perfetto.',
      ],
      faq: [
        { q: 'Qual è la differenza tra rumore bianco, rosa e marrone?', a: 'Il rumore bianco ha intensità uguale su tutte le frequenze (come la TV senza segnale). Il rumore rosa ha più energia nelle frequenze basse, suonando più profondo e bilanciato (come la pioggia). Il rumore marrone enfatizza frequenze ancora più basse, producendo un rombo profondo (come tuono o cascata).' },
        { q: 'I generatori di rumore possono aiutare con il sonno?', a: 'Sì. La ricerca mostra che il rumore ambientale costante può mascherare suoni disturbanti e promuovere il rilassamento. Il rumore rosa in particolare è stato studiato per la sua capacità di migliorare la qualità del sonno profondo e il consolidamento della memoria.' },
        { q: 'L\'audio viene generato localmente o inviato a un server?', a: 'Tutto l\'audio è generato al 100% localmente nel browser usando la Web Audio API. Nessun dato sonoro viene inviato a server. La sessione è completamente privata e lo strumento funziona anche senza connessione internet una volta caricata la pagina.' },
        { q: 'Posso mixare diversi tipi di rumore insieme?', a: 'Sì. Puoi selezionare più tipi di rumore simultaneamente per creare una miscela personalizzata. Ad esempio, combinare rumore bianco e marrone crea un paesaggio sonoro bilanciato con mascheramento ad alta frequenza e rombo profondo a bassa frequenza.' },
        { q: 'Come funziona il timer di auto-stop?', a: 'Seleziona una durata preimpostata (15, 30, 45 o 60 minuti) o inserisci un tempo personalizzato fino a 8 ore. Il rumore si spegnerà automaticamente con un fade out quando il timer raggiunge zero, perfetto per addormentarsi senza lasciare il rumore attivo tutta la notte.' },
      ],
    },
    es: {
      title: 'Generador de Ruido Online Gratis – Ruido Blanco, Rosa y Marrón para Concentración y Sueño',
      paragraphs: [
        'El ruido ambiental está científicamente probado para mejorar la concentración, ayudar al sueño y reducir el estrés. Nuestro generador de ruido online gratuito crea ruido blanco, rosa y marrón de alta calidad directamente en tu navegador usando la Web Audio API — sin descargas, sin cuentas y con completa privacidad ya que todo el audio se genera localmente en tu dispositivo.',
        'El ruido blanco contiene energía igual en todas las frecuencias, haciéndolo excelente para enmascarar sonidos molestos en oficinas, dormitorios o ambientes ruidosos. El ruido rosa enfatiza las frecuencias más bajas, produciendo un sonido más profundo y equilibrado similar a la lluvia constante — la investigación sugiere que puede mejorar el sueño profundo.',
        'El ruido marrón (también llamado browniano o rojo) es aún más profundo, con una cualidad retumbante que recuerda al trueno, el viento fuerte o una cascada. Muchas personas lo encuentran el más relajante de los tres para meditación y relajación. Nuestra herramienta permite mezclar múltiples tipos de ruido para crear tu paisaje sonoro perfecto.',
        'Las características incluyen un control de volumen ajustable con transiciones suaves de fade in/out, una visualización de forma de onda en tiempo real y un temporizador de auto-parada con presets de 15 a 60 minutos o duración personalizada. Ya sea que estés estudiando, trabajando, meditando o tratando de dormir, este generador proporciona el fondo sonoro perfecto.',
      ],
      faq: [
        { q: '¿Cuál es la diferencia entre ruido blanco, rosa y marrón?', a: 'El ruido blanco tiene intensidad igual en todas las frecuencias (como estática de TV). El ruido rosa tiene más energía en frecuencias bajas, sonando más profundo y equilibrado (como lluvia). El ruido marrón enfatiza frecuencias aún más bajas, produciendo un retumbo profundo (como trueno o cascada).' },
        { q: '¿Los generadores de ruido pueden ayudar con el sueño?', a: 'Sí. La investigación muestra que el ruido ambiental constante puede enmascarar sonidos molestos y promover la relajación. El ruido rosa en particular ha sido estudiado por su capacidad de mejorar la calidad del sueño profundo y la consolidación de la memoria.' },
        { q: '¿El audio se genera localmente o se envía a un servidor?', a: 'Todo el audio se genera 100% localmente en tu navegador usando la Web Audio API. No se envían datos de sonido a ningún servidor. Tu sesión es completamente privada y la herramienta funciona incluso sin conexión a internet una vez cargada la página.' },
        { q: '¿Puedo mezclar diferentes tipos de ruido?', a: 'Sí. Puedes seleccionar múltiples tipos de ruido simultáneamente para crear una mezcla personalizada. Por ejemplo, combinar ruido blanco y marrón crea un paisaje sonoro equilibrado con enmascaramiento de alta frecuencia y retumbo profundo de baja frecuencia.' },
        { q: '¿Cómo funciona el temporizador de auto-parada?', a: 'Selecciona una duración predeterminada (15, 30, 45 o 60 minutos) o ingresa un tiempo personalizado de hasta 8 horas. El ruido se detendrá automáticamente con un fade out cuando el temporizador llegue a cero.' },
      ],
    },
    fr: {
      title: 'Générateur de Bruit en Ligne Gratuit – Bruit Blanc, Rose et Brun pour la Concentration et le Sommeil',
      paragraphs: [
        'Le bruit ambiant est scientifiquement prouvé pour améliorer la concentration, favoriser le sommeil et réduire le stress. Notre générateur de bruit en ligne gratuit crée du bruit blanc, rose et brun de haute qualité directement dans votre navigateur via la Web Audio API — aucun téléchargement, aucun compte et une confidentialité totale puisque tout l\'audio est généré localement sur votre appareil.',
        'Le bruit blanc contient une énergie égale sur toutes les fréquences, ce qui le rend excellent pour masquer les sons distrayants dans les bureaux ou les environnements bruyants. Le bruit rose met l\'accent sur les fréquences plus basses, produisant un son plus profond et équilibré similaire à une pluie constante — la recherche suggère qu\'il peut améliorer le sommeil profond.',
        'Le bruit brun (également appelé brownien ou rouge) est encore plus profond, avec une qualité grondante riche rappelant le tonnerre, le vent fort ou une cascade. Beaucoup de gens le trouvent le plus apaisant des trois pour la relaxation et la méditation. Notre outil permet de mixer plusieurs types de bruit ensemble pour créer votre paysage sonore ambiant parfait.',
        'Les fonctionnalités incluent un curseur de volume réglable avec des transitions fade in/out douces, une visualisation de forme d\'onde en temps réel et une minuterie d\'arrêt automatique avec des préréglages de 15 à 60 minutes ou une durée personnalisée. Que vous étudiiez, travailliez, méditiez ou essayiez de vous endormir, ce générateur fournit le fond sonore parfait.',
      ],
      faq: [
        { q: 'Quelle est la différence entre le bruit blanc, rose et brun ?', a: 'Le bruit blanc a une intensité égale sur toutes les fréquences (comme la neige TV). Le bruit rose a plus d\'énergie dans les basses fréquences, sonnant plus profond et équilibré (comme la pluie). Le bruit brun accentue des fréquences encore plus basses, produisant un grondement profond (comme le tonnerre ou une cascade).' },
        { q: 'Les générateurs de bruit peuvent-ils aider à dormir ?', a: 'Oui. La recherche montre que le bruit ambiant constant peut masquer les sons perturbateurs et favoriser la relaxation. Le bruit rose en particulier a été étudié pour sa capacité à améliorer la qualité du sommeil profond et la consolidation de la mémoire.' },
        { q: 'L\'audio est-il généré localement ou envoyé à un serveur ?', a: 'Tout l\'audio est généré à 100% localement dans votre navigateur via la Web Audio API. Aucune donnée sonore n\'est envoyée à un serveur. Votre session est totalement privée et l\'outil fonctionne même sans connexion internet une fois la page chargée.' },
        { q: 'Puis-je mixer différents types de bruit ?', a: 'Oui. Vous pouvez sélectionner plusieurs types de bruit simultanément pour créer un mélange personnalisé. Par exemple, combiner le bruit blanc et brun crée un paysage sonore équilibré avec un masquage haute fréquence et un grondement profond basse fréquence.' },
        { q: 'Comment fonctionne la minuterie d\'arrêt automatique ?', a: 'Sélectionnez une durée prédéfinie (15, 30, 45 ou 60 minutes) ou entrez un temps personnalisé jusqu\'à 8 heures. Le bruit s\'arrêtera automatiquement avec un fondu quand la minuterie atteint zéro.' },
      ],
    },
    de: {
      title: 'Kostenloser Online Rauschgenerator – Weißes, Rosa & Braunes Rauschen für Fokus und Schlaf',
      paragraphs: [
        'Umgebungsgeräusche verbessern nachweislich die Konzentration, fördern den Schlaf und reduzieren Stress. Unser kostenloser Online-Rauschgenerator erzeugt hochwertiges weißes, rosa und braunes Rauschen direkt in Ihrem Browser mit der Web Audio API — keine Downloads, keine Konten und vollständige Privatsphäre, da alle Audiodaten lokal auf Ihrem Gerät erzeugt werden.',
        'Weißes Rauschen enthält gleichmäßige Energie über alle Frequenzen und eignet sich hervorragend zum Maskieren störender Geräusche in Büros, Wohnheimen oder lauten Umgebungen. Rosa Rauschen betont niedrigere Frequenzen und erzeugt einen tieferen, ausgewogeneren Klang ähnlich gleichmäßigem Regen — Forschung zeigt, dass es den Tiefschlaf verbessern kann.',
        'Braunes Rauschen (auch Brownsches oder rotes Rauschen genannt) geht noch tiefer, mit einer satten, grollenden Qualität, die an Donner, starken Wind oder einen Wasserfall erinnert. Viele Menschen finden es am beruhigendsten für Entspannung und Meditation. Unser Tool ermöglicht das Mischen mehrerer Rauschtypen für Ihre perfekte Klanglandschaft.',
        'Zu den Funktionen gehören ein einstellbarer Lautstärkeregler mit sanften Ein-/Ausblend-Übergängen, eine Echtzeit-Wellenform-Visualisierung und ein Auto-Stopp-Timer mit Voreinstellungen von 15 bis 60 Minuten oder einer benutzerdefinierten Dauer. Ob zum Studieren, Arbeiten, Meditieren oder Einschlafen — dieser Rauschgenerator bietet den perfekten Klanghintergrund.',
      ],
      faq: [
        { q: 'Was ist der Unterschied zwischen weißem, rosa und braunem Rauschen?', a: 'Weißes Rauschen hat gleiche Intensität über alle Frequenzen (wie TV-Rauschen). Rosa Rauschen hat mehr Energie in niedrigen Frequenzen, klingt tiefer und ausgewogener (wie Regen). Braunes Rauschen betont noch niedrigere Frequenzen und erzeugt ein tiefes Grollen (wie Donner oder Wasserfall).' },
        { q: 'Können Rauschgeneratoren beim Schlafen helfen?', a: 'Ja. Forschung zeigt, dass konstante Umgebungsgeräusche störende Geräusche maskieren und Entspannung fördern können. Besonders rosa Rauschen wurde auf seine Fähigkeit untersucht, die Tiefschlafqualität und Gedächtniskonsolidierung zu verbessern.' },
        { q: 'Wird das Audio lokal erzeugt oder an einen Server gesendet?', a: 'Alles Audio wird zu 100% lokal in Ihrem Browser über die Web Audio API erzeugt. Keine Klangdaten werden an einen Server gesendet. Ihre Sitzung ist völlig privat und das Tool funktioniert auch ohne Internetverbindung, sobald die Seite geladen ist.' },
        { q: 'Kann ich verschiedene Rauschtypen mischen?', a: 'Ja. Sie können mehrere Rauschtypen gleichzeitig auswählen, um eine individuelle Mischung zu erstellen. Zum Beispiel erzeugt die Kombination von weißem und braunem Rauschen eine ausgewogene Klanglandschaft.' },
        { q: 'Wie funktioniert der Auto-Stopp-Timer?', a: 'Wählen Sie eine voreingestellte Dauer (15, 30, 45 oder 60 Minuten) oder geben Sie eine benutzerdefinierte Zeit bis zu 8 Stunden ein. Das Rauschen stoppt automatisch mit einem Ausblenden, wenn der Timer null erreicht.' },
      ],
    },
    pt: {
      title: 'Gerador de Ruído Online Grátis – Ruído Branco, Rosa e Marrom para Foco e Sono',
      paragraphs: [
        'O ruído ambiente é cientificamente comprovado para melhorar o foco, auxiliar o sono e reduzir o estresse. Nosso gerador de ruído online gratuito cria ruído branco, rosa e marrom de alta qualidade diretamente no seu navegador usando a Web Audio API — sem downloads, sem contas e privacidade completa já que todo o áudio é gerado localmente no seu dispositivo.',
        'O ruído branco contém energia igual em todas as frequências, tornando-o excelente para mascarar sons distrativos em escritórios, dormitórios ou ambientes barulhentos. O ruído rosa enfatiza frequências mais baixas, produzindo um som mais profundo e equilibrado similar à chuva constante — pesquisas sugerem que pode melhorar o sono profundo e a consolidação da memória.',
        'O ruído marrom (também chamado browniano ou vermelho) é ainda mais profundo, com uma qualidade rica e estrondosa que lembra trovão, vento forte ou uma cachoeira. Muitas pessoas o consideram o mais relaxante dos três para relaxamento e meditação. Nossa ferramenta permite mixar múltiplos tipos de ruído juntos para criar sua paisagem sonora ambiente perfeita.',
        'Os recursos incluem um controle de volume ajustável com transições suaves de fade in/out, uma visualização de forma de onda em tempo real e um temporizador de auto-parada com presets de 15 a 60 minutos ou duração personalizada. Seja estudando, trabalhando, meditando ou tentando adormecer, este gerador de ruído fornece o pano de fundo sonoro perfeito.',
      ],
      faq: [
        { q: 'Qual é a diferença entre ruído branco, rosa e marrom?', a: 'O ruído branco tem intensidade igual em todas as frequências (como estática de TV). O ruído rosa tem mais energia em frequências baixas, soando mais profundo e equilibrado (como chuva). O ruído marrom enfatiza frequências ainda mais baixas, produzindo um estrondo profundo (como trovão ou cachoeira).' },
        { q: 'Geradores de ruído podem ajudar com o sono?', a: 'Sim. Pesquisas mostram que ruído ambiente constante pode mascarar sons perturbadores e promover relaxamento. O ruído rosa em particular foi estudado por sua capacidade de melhorar a qualidade do sono profundo e a consolidação da memória.' },
        { q: 'O áudio é gerado localmente ou enviado para um servidor?', a: 'Todo o áudio é gerado 100% localmente no seu navegador usando a Web Audio API. Nenhum dado de som é enviado para qualquer servidor. Sua sessão é completamente privada e a ferramenta funciona mesmo sem conexão com a internet após a página ser carregada.' },
        { q: 'Posso mixar diferentes tipos de ruído?', a: 'Sim. Você pode selecionar múltiplos tipos de ruído simultaneamente para criar uma mistura personalizada. Por exemplo, combinar ruído branco e marrom cria uma paisagem sonora equilibrada com mascaramento de alta frequência e estrondo profundo de baixa frequência.' },
        { q: 'Como funciona o temporizador de auto-parada?', a: 'Selecione uma duração predefinida (15, 30, 45 ou 60 minutos) ou insira um tempo personalizado de até 8 horas. O ruído parará automaticamente com um fade out quando o temporizador chegar a zero.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="noise-generator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Status Card */}
        <div className={`mb-4 rounded-lg p-4 border ${isPlaying ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className={`font-medium ${isPlaying ? 'text-green-700' : 'text-gray-600'}`}>
                {isPlaying ? labels.playing[lang] : labels.stopped[lang]}
              </span>
            </div>
            {isPlaying && remainingSeconds > 0 && (
              <span className="text-sm font-mono text-green-700">
                {labels.remaining[lang]}: {formatTime(remainingSeconds)}
              </span>
            )}
          </div>
        </div>

        {/* Waveform Canvas */}
        <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <canvas
            ref={canvasRef}
            width={600}
            height={100}
            className="w-full h-24 rounded"
          />
        </div>

        {/* Noise Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{labels.noiseTypes[lang]}</label>
          <p className="text-xs text-gray-400 mb-2">{labels.selectNoise[lang]}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {noiseCards.map((card) => (
              <button
                key={card.type}
                onClick={() => toggleNoise(card.type)}
                disabled={isPlaying}
                className={`text-left p-3 rounded-lg border transition-all ${
                  activeNoises.has(card.type) ? card.activeColor : card.color
                } ${card.borderColor} ${isPlaying ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}`}
              >
                <div className="font-medium text-gray-900 text-sm">{card.label}</div>
                <div className="text-xs text-gray-500 mt-1">{card.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Volume Control */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {labels.volume[lang]}: {Math.round(volume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Timer Selection */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">{labels.timer[lang]}</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {timerPresets.map((mins) => (
              <button
                key={mins}
                onClick={() => setTimerMinutes(mins)}
                disabled={isPlaying}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  timerMinutes === mins
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700 font-medium'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                } ${isPlaying ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {mins === 0 ? labels.noTimer[lang] : `${mins} ${labels.minutes[lang]}`}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="480"
              value={customTimer}
              onChange={(e) => setCustomTimer(e.target.value)}
              placeholder={labels.customPlaceholder[lang]}
              disabled={isPlaying}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-60"
            />
            <button
              onClick={handleCustomTimer}
              disabled={isPlaying || !customTimer}
              className="px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-300 hover:bg-indigo-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {labels.custom[lang]}
            </button>
          </div>
          {timerMinutes > 0 && !isPlaying && (
            <div className="text-xs text-indigo-600 mt-1">
              {timerMinutes} {labels.minutes[lang]}
            </div>
          )}
        </div>

        {/* Play / Stop Buttons */}
        <div className="flex gap-3 mb-6">
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-lg"
            >
              {labels.play[lang]}
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors text-lg"
            >
              {labels.stop[lang]}
            </button>
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
