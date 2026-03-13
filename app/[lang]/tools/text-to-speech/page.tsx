'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface HistoryEntry {
  preview: string;
  chars: number;
  voice: string;
  timestamp: number;
}

export default function TextToSpeech() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['text-to-speech'][lang];
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tts-history');
        return saved ? JSON.parse(saved) : [];
      } catch { return []; }
    }
    return [];
  });
  const [detectedLang, setDetectedLang] = useState('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const MAX_CHARS = 5000;

  // Persist history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tts-history', JSON.stringify(history));
    } catch { /* storage full or unavailable */ }
  }, [history]);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
        if (!selectedVoice && available.length > 0) {
          const defaultVoice = available.find((v) => v.default) || available[0];
          setSelectedVoice(defaultVoice.name);
        }
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoice]);

  // Simple language detection
  const detectLanguage = useCallback((inputText: string) => {
    if (!inputText.trim()) { setDetectedLang(''); return; }
    const sample = inputText.slice(0, 200).toLowerCase();
    const patterns: [string, RegExp][] = [
      ['Italian', /\b(che|sono|della|questo|molto|anche|perch[eé]|nella|questo|come)\b/],
      ['Spanish', /\b(que|los|las|por|una|con|para|como|pero|m[aá]s)\b/],
      ['French', /\b(les|des|une|que|dans|pour|avec|est|pas|sur)\b/],
      ['German', /\b(und|der|die|das|ist|ein|eine|nicht|auf|mit)\b/],
      ['Portuguese', /\b(que|uma|para|com|n[aã]o|por|mais|como|dos|das)\b/],
      ['English', /\b(the|and|is|are|was|have|has|that|this|with)\b/],
    ];
    let bestMatch = '';
    let bestCount = 0;
    for (const [name, regex] of patterns) {
      const matches = sample.match(new RegExp(regex, 'g'));
      const count = matches ? matches.length : 0;
      if (count > bestCount) { bestCount = count; bestMatch = name; }
    }
    setDetectedLang(bestCount >= 2 ? bestMatch : '');
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => detectLanguage(text), 300);
    return () => clearTimeout(timeout);
  }, [text, detectLanguage]);

  // Estimated duration (avg 150 words/min at normal speed)
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estimatedDuration = wordCount > 0 ? Math.max(1, Math.ceil((wordCount / 150) * (1 / speed) * 60)) : 0;
  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const handlePlay = () => {
    if (!text.trim()) {
      setError(labels.emptyError[lang]);
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (text.length > MAX_CHARS) {
      setError(labels.maxLengthError[lang]);
      setTimeout(() => setError(''), 3000);
      return;
    }
    setError('');

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = speed;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Track progress via boundary events
    let charIndex = 0;
    utterance.onboundary = (event) => {
      charIndex = event.charIndex;
      setProgress(Math.round((charIndex / text.length) * 100));
    };
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      if (progressInterval.current) clearInterval(progressInterval.current);
      setTimeout(() => setProgress(0), 1500);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
      if (progressInterval.current) clearInterval(progressInterval.current);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);

    // Add to history
    const entry: HistoryEntry = {
      preview: text.slice(0, 40) + (text.length > 40 ? '...' : ''),
      chars: text.length,
      voice: selectedVoice.split(' ').slice(0, 2).join(' '),
      timestamp: Date.now(),
    };
    setHistory((prev) => [entry, ...prev].slice(0, 5));
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    if (progressInterval.current) clearInterval(progressInterval.current);
  };

  const handleCopy = async () => {
    if (!text.trim()) {
      setError(labels.emptyError[lang]);
      setTimeout(() => setError(''), 3000);
      return;
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    handleStop();
    setText('');
    setError('');
    setCopied(false);
    setSpeed(1);
    setPitch(1);
    setVolume(1);
    setProgress(0);
    setDetectedLang('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const labels: Record<string, Record<Locale, string>> = {
    placeholder: { en: 'Type or paste your text here (max 5000 characters)...', it: 'Scrivi o incolla il tuo testo qui (max 5000 caratteri)...', es: 'Escribe o pega tu texto aquí (máx. 5000 caracteres)...', fr: 'Tapez ou collez votre texte ici (max 5000 caractères)...', de: 'Geben Sie Ihren Text hier ein (max. 5000 Zeichen)...', pt: 'Digite ou cole seu texto aqui (máx. 5000 caracteres)...' },
    play: { en: 'Play', it: 'Riproduci', es: 'Reproducir', fr: 'Lire', de: 'Abspielen', pt: 'Reproduzir' },
    pause: { en: 'Pause', it: 'Pausa', es: 'Pausar', fr: 'Pause', de: 'Pause', pt: 'Pausar' },
    resume: { en: 'Resume', it: 'Riprendi', es: 'Reanudar', fr: 'Reprendre', de: 'Fortsetzen', pt: 'Retomar' },
    stop: { en: 'Stop', it: 'Ferma', es: 'Detener', fr: 'Arrêter', de: 'Stopp', pt: 'Parar' },
    voice: { en: 'Voice', it: 'Voce', es: 'Voz', fr: 'Voix', de: 'Stimme', pt: 'Voz' },
    speed: { en: 'Speed', it: 'Velocità', es: 'Velocidad', fr: 'Vitesse', de: 'Geschwindigkeit', pt: 'Velocidade' },
    pitch: { en: 'Pitch', it: 'Tono', es: 'Tono', fr: 'Tonalité', de: 'Tonhöhe', pt: 'Tom' },
    volume: { en: 'Volume', it: 'Volume', es: 'Volumen', fr: 'Volume', de: 'Lautstärke', pt: 'Volume' },
    characters: { en: 'Characters', it: 'Caratteri', es: 'Caracteres', fr: 'Caractères', de: 'Zeichen', pt: 'Caracteres' },
    estDuration: { en: 'Est. Duration', it: 'Durata Stimata', es: 'Duración Est.', fr: 'Durée Est.', de: 'Gesch. Dauer', pt: 'Duração Est.' },
    voiceInfo: { en: 'Voice Info', it: 'Info Voce', es: 'Info Voz', fr: 'Info Voix', de: 'Stimm-Info', pt: 'Info Voz' },
    words: { en: 'Words', it: 'Parole', es: 'Palabras', fr: 'Mots', de: 'Wörter', pt: 'Palavras' },
    copyText: { en: 'Copy Text', it: 'Copia Testo', es: 'Copiar Texto', fr: 'Copier Texte', de: 'Text Kopieren', pt: 'Copiar Texto' },
    copiedMsg: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    reset: { en: 'Reset', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Zurücksetzen', pt: 'Limpar' },
    emptyError: { en: 'Please enter some text first.', it: 'Inserisci prima del testo.', es: 'Por favor, ingresa texto primero.', fr: 'Veuillez d\'abord saisir du texte.', de: 'Bitte geben Sie zuerst einen Text ein.', pt: 'Por favor, insira algum texto primeiro.' },
    maxLengthError: { en: 'Text exceeds 5000 character limit.', it: 'Il testo supera il limite di 5000 caratteri.', es: 'El texto supera el límite de 5000 caracteres.', fr: 'Le texte dépasse la limite de 5000 caractères.', de: 'Der Text überschreitet das Limit von 5000 Zeichen.', pt: 'O texto excede o limite de 5000 caracteres.' },
    progress: { en: 'Progress', it: 'Progresso', es: 'Progreso', fr: 'Progression', de: 'Fortschritt', pt: 'Progresso' },
    history: { en: 'Recent Readings', it: 'Letture Recenti', es: 'Lecturas Recientes', fr: 'Lectures Récentes', de: 'Letzte Vorlesungen', pt: 'Leituras Recentes' },
    noHistory: { en: 'No recent readings yet.', it: 'Nessuna lettura recente.', es: 'Sin lecturas recientes.', fr: 'Aucune lecture récente.', de: 'Noch keine Vorlesungen.', pt: 'Nenhuma leitura recente.' },
    detectedLang: { en: 'Detected Language', it: 'Lingua Rilevata', es: 'Idioma Detectado', fr: 'Langue Détectée', de: 'Erkannte Sprache', pt: 'Idioma Detectado' },
    noVoices: { en: 'No voices available. Your browser may not support speech synthesis.', it: 'Nessuna voce disponibile. Il tuo browser potrebbe non supportare la sintesi vocale.', es: 'No hay voces disponibles. Tu navegador podría no soportar síntesis de voz.', fr: 'Aucune voix disponible. Votre navigateur ne supporte peut-être pas la synthèse vocale.', de: 'Keine Stimmen verfügbar. Ihr Browser unterstützt möglicherweise keine Sprachsynthese.', pt: 'Nenhuma voz disponível. Seu navegador pode não suportar síntese de voz.' },
    playing: { en: 'Playing...', it: 'In riproduzione...', es: 'Reproduciendo...', fr: 'Lecture en cours...', de: 'Wird abgespielt...', pt: 'Reproduzindo...' },
    paused: { en: 'Paused', it: 'In pausa', es: 'En pausa', fr: 'En pause', de: 'Pausiert', pt: 'Em pausa' },
  };

  const selectedVoiceObj = voices.find((v) => v.name === selectedVoice);

  const cardData = [
    { label: labels.characters[lang], value: `${text.length}/${MAX_CHARS}`, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    { label: labels.words[lang], value: wordCount, bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    { label: labels.estDuration[lang], value: formatDuration(estimatedDuration), bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    { label: labels.speed[lang], value: `${speed}x`, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  ];

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Online Text to Speech Tool – Convert Text to Audio Instantly',
      paragraphs: [
        'Text to speech technology has transformed the way we consume written content. Whether you need to listen to articles while commuting, proofread your writing by ear, or assist someone with visual impairments, our free online text to speech tool provides instant voice synthesis directly in your browser with zero installation required.',
        'Our tool leverages the Web Speech API built into modern browsers, offering access to dozens of high-quality voices across multiple languages and accents. You can fine-tune the experience with adjustable speed and pitch controls, making it perfect for language learning, accessibility needs, or simply hands-free content consumption.',
        'Unlike server-based TTS solutions that require uploading your text to remote servers, our tool processes everything locally in your browser. This means your text never leaves your device, ensuring complete privacy. The speech synthesis engine runs natively on your operating system, providing natural-sounding voices without any API keys or subscriptions.',
        'Content creators and writers find text to speech invaluable for catching errors that the eye might miss. Hearing your words spoken aloud reveals awkward phrasing, repetition, and rhythm issues that are difficult to spot when reading silently. Combined with our character count and estimated duration features, this tool is a comprehensive writing companion.',
      ],
      faq: [
        { q: 'Which browsers support text to speech?', a: 'The Web Speech API is supported by all major modern browsers including Chrome, Firefox, Safari, and Edge. Chrome typically offers the widest selection of voices. Mobile browsers on Android and iOS also support speech synthesis with system-installed voices.' },
        { q: 'Can I use text to speech in languages other than English?', a: 'Yes. The available voices depend on your operating system and browser. Most systems include voices for major languages including Spanish, French, German, Italian, Portuguese, Chinese, Japanese, and many more. Select a voice from the dropdown to see all available options.' },
        { q: 'Is there a character limit for text to speech?', a: 'Our tool supports up to 5,000 characters per session. This is approximately 750-1,000 words, which covers most articles, emails, and documents. For longer texts, you can split your content into sections.' },
        { q: 'Is my text sent to any server?', a: 'No. All processing happens entirely in your browser using the native Web Speech API. Your text never leaves your device, ensuring complete privacy and security. No data is collected or stored.' },
        { q: 'How do I adjust the voice speed and pitch?', a: 'Use the speed slider to adjust the reading rate from 0.5x (half speed) to 2x (double speed). The pitch slider controls the vocal tone from 0.5 (deeper) to 2 (higher). These settings let you customize the listening experience to your preference.' },
      ],
    },
    it: {
      title: 'Strumento Text to Speech Online Gratuito – Converti Testo in Audio Istantaneamente',
      paragraphs: [
        'La tecnologia text to speech ha trasformato il modo in cui fruiamo dei contenuti scritti. Che tu debba ascoltare articoli durante gli spostamenti, rileggere i tuoi scritti ad orecchio o assistere qualcuno con disabilità visive, il nostro strumento gratuito di sintesi vocale fornisce la conversione istantanea direttamente nel browser senza installazioni.',
        'Il nostro strumento sfrutta la Web Speech API integrata nei browser moderni, offrendo accesso a decine di voci di alta qualità in molteplici lingue e accenti. Puoi personalizzare l\'esperienza con controlli regolabili di velocità e tono, rendendolo perfetto per l\'apprendimento linguistico, le esigenze di accessibilità o il consumo di contenuti a mani libere.',
        'A differenza delle soluzioni TTS basate su server che richiedono il caricamento del testo su server remoti, il nostro strumento elabora tutto localmente nel browser. Questo significa che il tuo testo non lascia mai il dispositivo, garantendo completa privacy. Il motore di sintesi vocale funziona nativamente sul tuo sistema operativo.',
        'I creatori di contenuti e gli scrittori trovano il text to speech inestimabile per individuare errori che l\'occhio potrebbe non notare. Ascoltare le proprie parole ad alta voce rivela frasi goffe, ripetizioni e problemi di ritmo difficili da individuare nella lettura silenziosa. Combinato con il conteggio caratteri e la durata stimata, è un compagno di scrittura completo.',
      ],
      faq: [
        { q: 'Quali browser supportano il text to speech?', a: 'La Web Speech API è supportata da tutti i principali browser moderni tra cui Chrome, Firefox, Safari ed Edge. Chrome offre tipicamente la selezione più ampia di voci. Anche i browser mobile su Android e iOS supportano la sintesi vocale con le voci installate nel sistema.' },
        { q: 'Posso usare il text to speech in lingue diverse dall\'italiano?', a: 'Sì. Le voci disponibili dipendono dal sistema operativo e dal browser. La maggior parte dei sistemi include voci per le principali lingue tra cui inglese, spagnolo, francese, tedesco, portoghese, cinese, giapponese e molte altre.' },
        { q: 'C\'è un limite di caratteri per il text to speech?', a: 'Il nostro strumento supporta fino a 5.000 caratteri per sessione. Questo corrisponde a circa 750-1.000 parole, coprendo la maggior parte degli articoli, email e documenti. Per testi più lunghi, puoi dividere il contenuto in sezioni.' },
        { q: 'Il mio testo viene inviato a qualche server?', a: 'No. Tutta l\'elaborazione avviene interamente nel browser tramite la Web Speech API nativa. Il tuo testo non lascia mai il dispositivo, garantendo completa privacy e sicurezza.' },
        { q: 'Come regolo la velocità e il tono della voce?', a: 'Usa il cursore della velocità per regolare la velocità di lettura da 0,5x (metà velocità) a 2x (doppia velocità). Il cursore del tono controlla la tonalità vocale da 0,5 (più grave) a 2 (più acuto).' },
      ],
    },
    es: {
      title: 'Herramienta Text to Speech Online Gratis – Convierte Texto en Audio al Instante',
      paragraphs: [
        'La tecnología de texto a voz ha transformado la forma en que consumimos contenido escrito. Ya sea que necesites escuchar artículos mientras te desplazas, revisar tu escritura de oído o asistir a alguien con discapacidad visual, nuestra herramienta gratuita proporciona síntesis de voz instantánea directamente en tu navegador sin necesidad de instalación.',
        'Nuestra herramienta aprovecha la Web Speech API integrada en los navegadores modernos, ofreciendo acceso a docenas de voces de alta calidad en múltiples idiomas y acentos. Puedes ajustar la experiencia con controles de velocidad y tono, haciéndola perfecta para el aprendizaje de idiomas, necesidades de accesibilidad o consumo de contenido manos libres.',
        'A diferencia de las soluciones TTS basadas en servidor que requieren subir tu texto a servidores remotos, nuestra herramienta procesa todo localmente en tu navegador. Esto significa que tu texto nunca sale de tu dispositivo, garantizando privacidad completa. El motor de síntesis funciona nativamente en tu sistema operativo.',
        'Los creadores de contenido y escritores encuentran el texto a voz invaluable para detectar errores que el ojo podría pasar por alto. Escuchar tus palabras en voz alta revela frases torpes, repeticiones y problemas de ritmo difíciles de detectar al leer en silencio.',
      ],
      faq: [
        { q: '¿Qué navegadores soportan texto a voz?', a: 'La Web Speech API es compatible con todos los navegadores modernos principales, incluyendo Chrome, Firefox, Safari y Edge. Chrome típicamente ofrece la selección más amplia de voces. Los navegadores móviles en Android e iOS también soportan síntesis de voz.' },
        { q: '¿Puedo usar texto a voz en otros idiomas además del español?', a: 'Sí. Las voces disponibles dependen de tu sistema operativo y navegador. La mayoría de los sistemas incluyen voces para los principales idiomas como inglés, francés, alemán, italiano, portugués, chino, japonés y muchos más.' },
        { q: '¿Hay un límite de caracteres?', a: 'Nuestra herramienta soporta hasta 5.000 caracteres por sesión. Esto equivale aproximadamente a 750-1.000 palabras, cubriendo la mayoría de artículos, correos y documentos.' },
        { q: '¿Mi texto se envía a algún servidor?', a: 'No. Todo el procesamiento ocurre completamente en tu navegador usando la Web Speech API nativa. Tu texto nunca sale de tu dispositivo, garantizando privacidad y seguridad total.' },
        { q: '¿Cómo ajusto la velocidad y el tono de la voz?', a: 'Usa el control deslizante de velocidad para ajustar la velocidad de lectura de 0,5x a 2x. El control de tono ajusta la tonalidad vocal de 0,5 (más grave) a 2 (más agudo).' },
      ],
    },
    fr: {
      title: 'Outil Text to Speech en Ligne Gratuit – Convertissez du Texte en Audio Instantanément',
      paragraphs: [
        'La technologie de synthèse vocale a transformé la façon dont nous consommons le contenu écrit. Que vous ayez besoin d\'écouter des articles en déplacement, de relire vos écrits à l\'oreille ou d\'assister une personne malvoyante, notre outil gratuit fournit une synthèse vocale instantanée directement dans votre navigateur sans aucune installation.',
        'Notre outil exploite la Web Speech API intégrée aux navigateurs modernes, offrant l\'accès à des dizaines de voix de haute qualité dans de multiples langues et accents. Vous pouvez personnaliser l\'expérience avec des contrôles de vitesse et de tonalité réglables, le rendant parfait pour l\'apprentissage des langues, les besoins d\'accessibilité ou la consommation de contenu mains libres.',
        'Contrairement aux solutions TTS basées sur serveur qui nécessitent le téléchargement de votre texte vers des serveurs distants, notre outil traite tout localement dans votre navigateur. Cela signifie que votre texte ne quitte jamais votre appareil, garantissant une confidentialité totale. Le moteur de synthèse fonctionne nativement sur votre système d\'exploitation.',
        'Les créateurs de contenu et les rédacteurs trouvent la synthèse vocale inestimable pour repérer des erreurs que l\'œil pourrait manquer. Entendre vos mots prononcés à voix haute révèle les formulations maladroites, les répétitions et les problèmes de rythme difficiles à détecter en lecture silencieuse.',
      ],
      faq: [
        { q: 'Quels navigateurs supportent la synthèse vocale ?', a: 'La Web Speech API est prise en charge par tous les navigateurs modernes majeurs, dont Chrome, Firefox, Safari et Edge. Chrome offre généralement la sélection de voix la plus large. Les navigateurs mobiles sur Android et iOS supportent également la synthèse vocale.' },
        { q: 'Puis-je utiliser la synthèse vocale dans d\'autres langues que le français ?', a: 'Oui. Les voix disponibles dépendent de votre système d\'exploitation et de votre navigateur. La plupart des systèmes incluent des voix pour les langues principales comme l\'anglais, l\'espagnol, l\'allemand, l\'italien, le portugais, le chinois, le japonais et bien d\'autres.' },
        { q: 'Y a-t-il une limite de caractères ?', a: 'Notre outil supporte jusqu\'à 5 000 caractères par session. Cela représente environ 750 à 1 000 mots, couvrant la plupart des articles, emails et documents.' },
        { q: 'Mon texte est-il envoyé à un serveur ?', a: 'Non. Tout le traitement se fait entièrement dans votre navigateur via la Web Speech API native. Votre texte ne quitte jamais votre appareil, garantissant une confidentialité et une sécurité totales.' },
        { q: 'Comment ajuster la vitesse et la tonalité ?', a: 'Utilisez le curseur de vitesse pour régler la vitesse de lecture de 0,5x à 2x. Le curseur de tonalité contrôle le ton vocal de 0,5 (plus grave) à 2 (plus aigu).' },
      ],
    },
    de: {
      title: 'Kostenloses Online Text-to-Speech Tool – Text Sofort in Audio Umwandeln',
      paragraphs: [
        'Die Text-to-Speech-Technologie hat die Art und Weise verändert, wie wir geschriebene Inhalte konsumieren. Ob Sie Artikel beim Pendeln anhören, Ihre Texte per Ohr Korrektur lesen oder jemandem mit Sehbeeinträchtigung helfen möchten – unser kostenloses Online-Tool bietet sofortige Sprachsynthese direkt in Ihrem Browser ohne Installation.',
        'Unser Tool nutzt die in modernen Browsern integrierte Web Speech API und bietet Zugang zu Dutzenden hochwertiger Stimmen in mehreren Sprachen und Akzenten. Sie können das Erlebnis mit einstellbaren Geschwindigkeits- und Tonhöhenreglern anpassen, perfekt für Sprachlernen, Barrierefreiheit oder freihändigen Inhaltskonsum.',
        'Im Gegensatz zu serverbasierten TTS-Lösungen, die das Hochladen Ihres Textes auf Remote-Server erfordern, verarbeitet unser Tool alles lokal in Ihrem Browser. Das bedeutet, dass Ihr Text Ihr Gerät nie verlässt und vollständige Privatsphäre gewährleistet ist. Die Sprachsynthese-Engine läuft nativ auf Ihrem Betriebssystem.',
        'Content-Ersteller und Autoren finden Text-to-Speech unschätzbar wertvoll, um Fehler zu erkennen, die das Auge übersehen könnte. Wenn Sie Ihre Worte laut hören, werden unbeholfene Formulierungen, Wiederholungen und Rhythmusprobleme offenbart, die beim stillen Lesen schwer zu erkennen sind.',
      ],
      faq: [
        { q: 'Welche Browser unterstützen Text-to-Speech?', a: 'Die Web Speech API wird von allen wichtigen modernen Browsern unterstützt, darunter Chrome, Firefox, Safari und Edge. Chrome bietet in der Regel die breiteste Auswahl an Stimmen. Mobile Browser auf Android und iOS unterstützen ebenfalls Sprachsynthese.' },
        { q: 'Kann ich Text-to-Speech in anderen Sprachen als Deutsch verwenden?', a: 'Ja. Die verfügbaren Stimmen hängen von Ihrem Betriebssystem und Browser ab. Die meisten Systeme enthalten Stimmen für wichtige Sprachen wie Englisch, Spanisch, Französisch, Italienisch, Portugiesisch, Chinesisch, Japanisch und viele mehr.' },
        { q: 'Gibt es ein Zeichenlimit?', a: 'Unser Tool unterstützt bis zu 5.000 Zeichen pro Sitzung. Das entspricht etwa 750-1.000 Wörtern und deckt die meisten Artikel, E-Mails und Dokumente ab.' },
        { q: 'Wird mein Text an einen Server gesendet?', a: 'Nein. Die gesamte Verarbeitung erfolgt vollständig in Ihrem Browser über die native Web Speech API. Ihr Text verlässt niemals Ihr Gerät, was vollständige Privatsphäre und Sicherheit gewährleistet.' },
        { q: 'Wie passe ich Geschwindigkeit und Tonhöhe an?', a: 'Verwenden Sie den Geschwindigkeitsregler, um die Lesegeschwindigkeit von 0,5x bis 2x einzustellen. Der Tonhöhenregler steuert den Stimmton von 0,5 (tiefer) bis 2 (höher).' },
      ],
    },
    pt: {
      title: 'Ferramenta Text to Speech Online Grátis – Converta Texto em Áudio Instantaneamente',
      paragraphs: [
        'A tecnologia text to speech transformou a maneira como consumimos conteúdo escrito. Seja para ouvir artigos durante o deslocamento, revisar sua escrita pelo ouvido ou assistir alguém com deficiência visual, nossa ferramenta gratuita fornece síntese de voz instantânea diretamente no navegador sem necessidade de instalação.',
        'Nossa ferramenta utiliza a Web Speech API integrada nos navegadores modernos, oferecendo acesso a dezenas de vozes de alta qualidade em múltiplos idiomas e sotaques. Você pode personalizar a experiência com controles ajustáveis de velocidade e tom, tornando-a perfeita para aprendizado de idiomas, necessidades de acessibilidade ou consumo de conteúdo com as mãos livres.',
        'Diferentemente das soluções TTS baseadas em servidor que exigem o envio do texto para servidores remotos, nossa ferramenta processa tudo localmente no navegador. Isso significa que seu texto nunca sai do dispositivo, garantindo privacidade completa. O mecanismo de síntese de voz funciona nativamente no seu sistema operacional.',
        'Criadores de conteúdo e escritores consideram o text to speech inestimável para detectar erros que o olho pode não perceber. Ouvir suas palavras em voz alta revela frases desajeitadas, repetições e problemas de ritmo difíceis de detectar na leitura silenciosa.',
      ],
      faq: [
        { q: 'Quais navegadores suportam text to speech?', a: 'A Web Speech API é suportada por todos os principais navegadores modernos, incluindo Chrome, Firefox, Safari e Edge. O Chrome geralmente oferece a maior seleção de vozes. Navegadores móveis no Android e iOS também suportam síntese de voz.' },
        { q: 'Posso usar text to speech em outros idiomas além do português?', a: 'Sim. As vozes disponíveis dependem do seu sistema operacional e navegador. A maioria dos sistemas inclui vozes para os principais idiomas como inglês, espanhol, francês, alemão, italiano, chinês, japonês e muitos mais.' },
        { q: 'Há um limite de caracteres?', a: 'Nossa ferramenta suporta até 5.000 caracteres por sessão. Isso equivale a aproximadamente 750-1.000 palavras, cobrindo a maioria dos artigos, emails e documentos.' },
        { q: 'Meu texto é enviado para algum servidor?', a: 'Não. Todo o processamento acontece inteiramente no seu navegador usando a Web Speech API nativa. Seu texto nunca sai do seu dispositivo, garantindo privacidade e segurança total.' },
        { q: 'Como ajusto a velocidade e o tom da voz?', a: 'Use o controle deslizante de velocidade para ajustar a velocidade de leitura de 0,5x a 2x. O controle de tom ajusta a tonalidade vocal de 0,5 (mais grave) a 2 (mais agudo).' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="text-to-speech" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Result Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {cardData.map((stat) => (
            <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-lg p-3 text-center`}>
              <div className={`text-xl font-bold ${stat.text}`}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Voice Info Card */}
        {selectedVoiceObj && (
          <div className="mb-4 bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-500">{labels.voiceInfo[lang]}</div>
                <div className="text-base font-semibold text-cyan-700">{selectedVoiceObj.name}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">{selectedVoiceObj.lang}</div>
                {detectedLang && (
                  <div className="text-xs text-emerald-600 mt-1">
                    {labels.detectedLang[lang]}: {detectedLang}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {(isPlaying || isPaused || progress > 0) && (
          <div className="mb-4 bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">{labels.progress[lang]}</span>
              <span className="text-sm font-semibold text-blue-700">
                {isPlaying ? labels.playing[lang] : isPaused ? labels.paused[lang] : `${progress}%`}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Visual waveform indicator */}
            {isPlaying && (
              <div className="flex items-end justify-center gap-1 mt-3 h-8">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-blue-500 to-purple-400 rounded-full"
                    style={{
                      height: `${Math.random() * 100}%`,
                      animation: `pulse 0.5s ease-in-out ${i * 0.05}s infinite alternate`,
                      minHeight: '4px',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              setText(e.target.value);
              setError('');
            }
          }}
          placeholder={labels.placeholder[lang]}
          className="w-full h-48 border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1 mb-3">
          <span>{text.length > MAX_CHARS * 0.9 ? <span className="text-red-500">{text.length}/{MAX_CHARS}</span> : `${text.length}/${MAX_CHARS}`}</span>
          {detectedLang && <span className="text-emerald-600">{labels.detectedLang[lang]}: {detectedLang}</span>}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Voice selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{labels.voice[lang]}</label>
          {voices.length > 0 ? (
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          ) : (
            <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {labels.noVoices[lang]}
            </div>
          )}
        </div>

        {/* Speed, Pitch & Volume Controls */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.speed[lang]}: {speed}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0.5x</span>
              <span>2x</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.pitch[lang]}: {pitch}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0.5</span>
              <span>2</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.volume[lang]}: {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Playback Buttons */}
        <div className="flex gap-3 mb-4">
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {isPaused ? labels.resume[lang] : labels.play[lang]}
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex-1 bg-amber-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-amber-600 transition-colors"
            >
              {labels.pause[lang]}
            </button>
          )}
          <button
            onClick={handleStop}
            className="bg-red-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            {labels.stop[lang]}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            {copied ? labels.copiedMsg[lang] : labels.copyText[lang]}
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            {labels.reset[lang]}
          </button>
        </div>

        {/* History */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">{labels.history[lang]}</div>
          {history.length > 0 ? (
            <div className="space-y-2">
              {history.map((entry, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex justify-between items-center text-sm">
                  <span className="text-gray-600 truncate mr-3">&ldquo;{entry.preview}&rdquo;</span>
                  <span className="text-gray-500 whitespace-nowrap">
                    {entry.chars} {labels.characters[lang].toLowerCase()} &middot; {entry.voice}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">{labels.noHistory[lang]}</div>
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

        {/* Waveform animation keyframes */}
        <style jsx>{`
          @keyframes pulse {
            0% { height: 15%; }
            100% { height: 90%; }
          }
        `}</style>
      </div>
    </ToolPageWrapper>
  );
}
