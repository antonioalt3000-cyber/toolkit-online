'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  startRecording: { en: 'Start Recording', it: 'Avvia Registrazione', es: 'Iniciar Grabación', fr: 'Démarrer l\'Enregistrement', de: 'Aufnahme Starten', pt: 'Iniciar Gravação' },
  stopRecording: { en: 'Stop Recording', it: 'Ferma Registrazione', es: 'Detener Grabación', fr: 'Arrêter l\'Enregistrement', de: 'Aufnahme Stoppen', pt: 'Parar Gravação' },
  pauseRecording: { en: 'Pause', it: 'Pausa', es: 'Pausar', fr: 'Pause', de: 'Pause', pt: 'Pausar' },
  resumeRecording: { en: 'Resume', it: 'Riprendi', es: 'Reanudar', fr: 'Reprendre', de: 'Fortsetzen', pt: 'Retomar' },
  downloadVideo: { en: 'Download Video', it: 'Scarica Video', es: 'Descargar Video', fr: 'Télécharger la Vidéo', de: 'Video Herunterladen', pt: 'Baixar Vídeo' },
  recording: { en: 'Recording', it: 'Registrazione', es: 'Grabando', fr: 'Enregistrement', de: 'Aufnahme', pt: 'Gravando' },
  paused: { en: 'Paused', it: 'In Pausa', es: 'Pausado', fr: 'En Pause', de: 'Pausiert', pt: 'Pausado' },
  stopped: { en: 'Stopped', it: 'Fermato', es: 'Detenido', fr: 'Arrêté', de: 'Gestoppt', pt: 'Parado' },
  ready: { en: 'Ready', it: 'Pronto', es: 'Listo', fr: 'Prêt', de: 'Bereit', pt: 'Pronto' },
  includeAudio: { en: 'Include System Audio', it: 'Includi Audio di Sistema', es: 'Incluir Audio del Sistema', fr: 'Inclure l\'Audio Système', de: 'Systemaudio Einschließen', pt: 'Incluir Áudio do Sistema' },
  videoQuality: { en: 'Video Quality', it: 'Qualità Video', es: 'Calidad de Video', fr: 'Qualité Vidéo', de: 'Videoqualität', pt: 'Qualidade do Vídeo' },
  low: { en: 'Low', it: 'Bassa', es: 'Baja', fr: 'Basse', de: 'Niedrig', pt: 'Baixa' },
  medium: { en: 'Medium', it: 'Media', es: 'Media', fr: 'Moyenne', de: 'Mittel', pt: 'Média' },
  high: { en: 'High', it: 'Alta', es: 'Alta', fr: 'Haute', de: 'Hoch', pt: 'Alta' },
  preview: { en: 'Recording Preview', it: 'Anteprima Registrazione', es: 'Vista Previa', fr: 'Aperçu de l\'Enregistrement', de: 'Aufnahmevorschau', pt: 'Pré-visualização' },
  maxDuration: { en: 'Max 5 minutes', it: 'Max 5 minuti', es: 'Máx 5 minutos', fr: 'Max 5 minutes', de: 'Max 5 Minuten', pt: 'Máx 5 minutos' },
  settings: { en: 'Settings', it: 'Impostazioni', es: 'Configuración', fr: 'Paramètres', de: 'Einstellungen', pt: 'Configurações' },
  errorNotSupported: { en: 'Screen recording is not supported in this browser.', it: 'La registrazione schermo non è supportata in questo browser.', es: 'La grabación de pantalla no es compatible con este navegador.', fr: 'L\'enregistrement d\'écran n\'est pas pris en charge dans ce navigateur.', de: 'Bildschirmaufnahme wird in diesem Browser nicht unterstützt.', pt: 'A gravação de tela não é suportada neste navegador.' },
  errorPermission: { en: 'Permission denied or recording cancelled.', it: 'Permesso negato o registrazione annullata.', es: 'Permiso denegado o grabación cancelada.', fr: 'Permission refusée ou enregistrement annulé.', de: 'Berechtigung verweigert oder Aufnahme abgebrochen.', pt: 'Permissão negada ou gravação cancelada.' },
  newRecording: { en: 'New Recording', it: 'Nuova Registrazione', es: 'Nueva Grabación', fr: 'Nouvel Enregistrement', de: 'Neue Aufnahme', pt: 'Nova Gravação' },
  autoStopped: { en: 'Recording auto-stopped (5 min limit)', it: 'Registrazione fermata automaticamente (limite 5 min)', es: 'Grabación detenida automáticamente (límite 5 min)', fr: 'Enregistrement arrêté automatiquement (limite 5 min)', de: 'Aufnahme automatisch gestoppt (5 Min. Limit)', pt: 'Gravação parada automaticamente (limite 5 min)' },
};

type RecordingStatus = 'idle' | 'recording' | 'paused' | 'stopped';

const QUALITY_MAP: Record<string, number> = {
  low: 1_000_000,
  medium: 2_500_000,
  high: 5_000_000,
};

const MAX_DURATION = 5 * 60; // 5 minutes in seconds

export default function ScreenRecorder() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['screen-recorder'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [includeAudio, setIncludeAudio] = useState(false);
  const [quality, setQuality] = useState('medium');
  const [elapsed, setElapsed] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoStopMsg, setAutoStopMsg] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setElapsed(prev => {
        if (prev + 1 >= MAX_DURATION) {
          stopRecording(true);
          return MAX_DURATION;
        }
        return prev + 1;
      });
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const stopRecording = useCallback((auto = false) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    stopTimer();
    cleanupStream();
    setStatus('stopped');
    if (auto) setAutoStopMsg(true);
  }, []);

  const startRecording = async () => {
    setError(null);
    setAutoStopMsg(false);
    setVideoUrl(null);
    chunksRef.current = [];
    setElapsed(0);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setError(t('errorNotSupported'));
      return;
    }

    try {
      const displayOptions: MediaStreamConstraints & { video: { displaySurface?: string } } = {
        video: { displaySurface: 'monitor' },
        audio: includeAudio,
      };
      const stream = await navigator.mediaDevices.getDisplayMedia(displayOptions as DisplayMediaStreamOptions);
      streamRef.current = stream;

      // Show live preview
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        previewRef.current.play().catch(() => {});
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: QUALITY_MAP[quality],
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        if (previewRef.current) {
          previewRef.current.srcObject = null;
        }
      };

      // Handle user stopping share via browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopRecording(false);
      };

      recorder.start(1000); // collect data every second
      mediaRecorderRef.current = recorder;
      setStatus('recording');
      startTimer();
    } catch {
      setError(t('errorPermission'));
      cleanupStream();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      stopTimer();
      setStatus('paused');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setStatus('recording');
      startTimer();
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `screen-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
    a.click();
  };

  const handleNewRecording = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setStatus('idle');
    setElapsed(0);
    setError(null);
    setAutoStopMsg(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      cleanupStream();
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusLabel = status === 'recording' ? t('recording') : status === 'paused' ? t('paused') : status === 'stopped' ? t('stopped') : t('ready');
  const isRecording = status === 'recording';
  const isPaused = status === 'paused';
  const isActive = isRecording || isPaused;

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Screen Recorder: Capture Your Screen Online',
      paragraphs: [
        'Our free online screen recorder lets you capture your entire screen, a specific application window, or a browser tab directly from your browser — no software installation required. It uses the modern MediaRecorder API and getDisplayMedia for high-quality, browser-native screen recording.',
        'Choose from three quality presets (low, medium, high) that control the video bitrate for optimal file size. You can optionally include system audio in your recordings, making it perfect for tutorials, presentations, bug reports, and video demos. All recordings stay entirely on your device — nothing is uploaded to any server.',
        'The recorder supports pause and resume functionality so you can skip irrelevant sections. A live timer shows your recording duration with a maximum limit of 5 minutes per session. Once stopped, you get an instant video preview and can download the recording as a standard WebM file compatible with all major video players and editors.',
        'Whether you need to create quick tutorials, record bug reproductions for development teams, capture gameplay moments, or save important video calls, this tool provides a fast, private, and completely free solution. The recording indicator with a red dot clearly shows when capture is active so you never accidentally record without knowing.',
      ],
      faq: [
        { q: 'What format are the recordings saved in?', a: 'Recordings are saved in WebM format using the VP9 codec (or VP8 as fallback). WebM is supported by all modern browsers and can be played in VLC, converted with FFmpeg, or uploaded directly to platforms like YouTube.' },
        { q: 'Is there a time limit for recordings?', a: 'Yes, recordings are limited to 5 minutes per session to ensure browser stability and manageable file sizes. For longer recordings, you can start multiple sessions and join them later with a video editor.' },
        { q: 'Can I record audio along with the screen?', a: 'Yes, you can toggle system audio on before starting the recording. Note that audio capture availability depends on your browser and operating system. Chrome on Windows typically offers the best audio capture support.' },
        { q: 'Are my recordings uploaded anywhere?', a: 'No. All recording and processing happens entirely in your browser using local APIs. Your video data never leaves your device. The download is generated from a local blob URL.' },
        { q: 'Which browsers support screen recording?', a: 'Screen recording via getDisplayMedia is supported in Chrome, Edge, Firefox, and Opera on desktop. Safari has partial support. Mobile browsers generally do not support screen capture for security reasons.' },
      ],
    },
    it: {
      title: 'Registratore Schermo Gratuito: Cattura il Tuo Schermo Online',
      paragraphs: [
        'Il nostro registratore schermo online gratuito ti permette di catturare l\'intero schermo, una finestra specifica o una scheda del browser direttamente dal browser — senza installare software. Utilizza le API moderne MediaRecorder e getDisplayMedia per registrazioni di alta qualità native del browser.',
        'Scegli tra tre livelli di qualità (bassa, media, alta) che controllano il bitrate video per dimensioni file ottimali. Puoi opzionalmente includere l\'audio di sistema, perfetto per tutorial, presentazioni, segnalazioni bug e demo video. Tutte le registrazioni rimangono sul tuo dispositivo.',
        'Il registratore supporta pausa e ripresa per saltare sezioni irrilevanti. Un timer mostra la durata con un limite massimo di 5 minuti. Una volta fermato, ottieni un\'anteprima istantanea e puoi scaricare come file WebM standard.',
        'Che tu debba creare tutorial veloci, registrare bug per team di sviluppo o catturare momenti importanti, questo strumento offre una soluzione rapida, privata e completamente gratuita.',
      ],
      faq: [
        { q: 'In quale formato vengono salvate le registrazioni?', a: 'Le registrazioni vengono salvate in formato WebM con codec VP9 (o VP8 come fallback). WebM è supportato da tutti i browser moderni e può essere riprodotto in VLC o convertito con FFmpeg.' },
        { q: 'C\'è un limite di tempo per le registrazioni?', a: 'Sì, le registrazioni sono limitate a 5 minuti per sessione per garantire stabilità del browser e dimensioni file gestibili.' },
        { q: 'Posso registrare l\'audio insieme allo schermo?', a: 'Sì, puoi attivare l\'audio di sistema prima di iniziare. La disponibilità dipende dal browser e dal sistema operativo. Chrome su Windows offre il miglior supporto.' },
        { q: 'Le mie registrazioni vengono caricate da qualche parte?', a: 'No. Tutta la registrazione avviene nel tuo browser usando API locali. I dati video non lasciano mai il tuo dispositivo.' },
        { q: 'Quali browser supportano la registrazione schermo?', a: 'La registrazione via getDisplayMedia è supportata su Chrome, Edge, Firefox e Opera desktop. Safari ha supporto parziale. I browser mobili generalmente non supportano la cattura schermo.' },
      ],
    },
    es: {
      title: 'Grabador de Pantalla Gratuito: Captura Tu Pantalla Online',
      paragraphs: [
        'Nuestro grabador de pantalla online gratuito te permite capturar toda la pantalla, una ventana específica o una pestaña del navegador directamente desde tu navegador — sin instalar software. Utiliza las APIs modernas MediaRecorder y getDisplayMedia para grabaciones nativas de alta calidad.',
        'Elige entre tres niveles de calidad (baja, media, alta) que controlan el bitrate de video. Puedes incluir opcionalmente el audio del sistema, perfecto para tutoriales, presentaciones, reportes de errores y demos. Todas las grabaciones permanecen en tu dispositivo.',
        'El grabador soporta pausa y reanudación para saltar secciones irrelevantes. Un temporizador muestra la duración con un límite máximo de 5 minutos. Al detenerse, obtienes una vista previa instantánea y puedes descargar como archivo WebM.',
        'Ya sea para crear tutoriales rápidos, grabar errores para equipos de desarrollo o capturar momentos importantes, esta herramienta ofrece una solución rápida, privada y completamente gratuita.',
      ],
      faq: [
        { q: '¿En qué formato se guardan las grabaciones?', a: 'Las grabaciones se guardan en formato WebM con codec VP9 (o VP8 como respaldo). WebM es compatible con todos los navegadores modernos y puede reproducirse en VLC o convertirse con FFmpeg.' },
        { q: '¿Hay un límite de tiempo para las grabaciones?', a: 'Sí, las grabaciones están limitadas a 5 minutos por sesión para garantizar estabilidad del navegador y tamaños de archivo manejables.' },
        { q: '¿Puedo grabar audio junto con la pantalla?', a: 'Sí, puedes activar el audio del sistema antes de comenzar. La disponibilidad depende del navegador y sistema operativo. Chrome en Windows ofrece el mejor soporte.' },
        { q: '¿Mis grabaciones se suben a algún lugar?', a: 'No. Toda la grabación ocurre en tu navegador usando APIs locales. Los datos de video nunca salen de tu dispositivo.' },
        { q: '¿Qué navegadores soportan la grabación de pantalla?', a: 'La grabación vía getDisplayMedia es compatible con Chrome, Edge, Firefox y Opera en escritorio. Safari tiene soporte parcial. Los navegadores móviles generalmente no soportan captura de pantalla.' },
      ],
    },
    fr: {
      title: 'Enregistreur d\'Écran Gratuit : Capturez Votre Écran en Ligne',
      paragraphs: [
        'Notre enregistreur d\'écran en ligne gratuit vous permet de capturer tout l\'écran, une fenêtre spécifique ou un onglet de navigateur directement depuis votre navigateur — sans installation de logiciel. Il utilise les API modernes MediaRecorder et getDisplayMedia pour des enregistrements natifs de haute qualité.',
        'Choisissez parmi trois niveaux de qualité (basse, moyenne, haute) qui contrôlent le débit vidéo. Vous pouvez inclure l\'audio système, parfait pour les tutoriels, présentations, rapports de bugs et démos. Tous les enregistrements restent sur votre appareil.',
        'L\'enregistreur prend en charge la pause et la reprise pour sauter les sections non pertinentes. Un minuteur affiche la durée avec une limite de 5 minutes. Une fois arrêté, vous obtenez un aperçu instantané et pouvez télécharger en format WebM.',
        'Que vous ayez besoin de créer des tutoriels rapides, enregistrer des bugs pour les équipes de développement ou capturer des moments importants, cet outil offre une solution rapide, privée et entièrement gratuite.',
      ],
      faq: [
        { q: 'Dans quel format les enregistrements sont-ils sauvegardés ?', a: 'Les enregistrements sont sauvegardés en format WebM avec le codec VP9 (ou VP8 en secours). WebM est pris en charge par tous les navigateurs modernes et peut être lu dans VLC ou converti avec FFmpeg.' },
        { q: 'Y a-t-il une limite de temps pour les enregistrements ?', a: 'Oui, les enregistrements sont limités à 5 minutes par session pour garantir la stabilité du navigateur et des tailles de fichiers gérables.' },
        { q: 'Puis-je enregistrer l\'audio avec l\'écran ?', a: 'Oui, vous pouvez activer l\'audio système avant de commencer. La disponibilité dépend du navigateur et du système d\'exploitation. Chrome sur Windows offre le meilleur support.' },
        { q: 'Mes enregistrements sont-ils téléchargés quelque part ?', a: 'Non. Tout l\'enregistrement se fait dans votre navigateur en utilisant des API locales. Vos données vidéo ne quittent jamais votre appareil.' },
        { q: 'Quels navigateurs prennent en charge l\'enregistrement d\'écran ?', a: 'L\'enregistrement via getDisplayMedia est pris en charge sur Chrome, Edge, Firefox et Opera sur bureau. Safari a un support partiel. Les navigateurs mobiles ne prennent généralement pas en charge la capture d\'écran.' },
      ],
    },
    de: {
      title: 'Kostenloser Bildschirmrekorder: Nehmen Sie Ihren Bildschirm Online Auf',
      paragraphs: [
        'Unser kostenloser Online-Bildschirmrekorder ermöglicht es Ihnen, den gesamten Bildschirm, ein bestimmtes Anwendungsfenster oder einen Browser-Tab direkt aus Ihrem Browser aufzunehmen — ohne Softwareinstallation. Er nutzt die modernen MediaRecorder und getDisplayMedia APIs für hochwertige, browsernative Aufnahmen.',
        'Wählen Sie aus drei Qualitätsstufen (niedrig, mittel, hoch), die die Video-Bitrate steuern. Sie können optional Systemaudio einschließen, perfekt für Tutorials, Präsentationen, Fehlerberichte und Video-Demos. Alle Aufnahmen bleiben auf Ihrem Gerät.',
        'Der Rekorder unterstützt Pause und Fortsetzen zum Überspringen irrelevanter Abschnitte. Ein Timer zeigt die Aufnahmedauer mit einem Maximum von 5 Minuten. Nach dem Stoppen erhalten Sie eine sofortige Vorschau und können als WebM-Datei herunterladen.',
        'Ob Sie schnelle Tutorials erstellen, Fehler für Entwicklungsteams aufnehmen oder wichtige Momente festhalten möchten — dieses Tool bietet eine schnelle, private und völlig kostenlose Lösung.',
      ],
      faq: [
        { q: 'In welchem Format werden die Aufnahmen gespeichert?', a: 'Aufnahmen werden im WebM-Format mit VP9-Codec (oder VP8 als Fallback) gespeichert. WebM wird von allen modernen Browsern unterstützt und kann in VLC abgespielt oder mit FFmpeg konvertiert werden.' },
        { q: 'Gibt es ein Zeitlimit für Aufnahmen?', a: 'Ja, Aufnahmen sind auf 5 Minuten pro Sitzung begrenzt, um Browserstabilität und handhabbare Dateigrößen zu gewährleisten.' },
        { q: 'Kann ich Audio zusammen mit dem Bildschirm aufnehmen?', a: 'Ja, Sie können Systemaudio vor dem Start aktivieren. Die Verfügbarkeit hängt von Browser und Betriebssystem ab. Chrome unter Windows bietet die beste Unterstützung.' },
        { q: 'Werden meine Aufnahmen irgendwo hochgeladen?', a: 'Nein. Die gesamte Aufnahme erfolgt in Ihrem Browser mit lokalen APIs. Ihre Videodaten verlassen nie Ihr Gerät.' },
        { q: 'Welche Browser unterstützen Bildschirmaufnahmen?', a: 'Bildschirmaufnahme über getDisplayMedia wird in Chrome, Edge, Firefox und Opera auf dem Desktop unterstützt. Safari hat teilweise Unterstützung. Mobile Browser unterstützen generell keine Bildschirmaufnahme.' },
      ],
    },
    pt: {
      title: 'Gravador de Tela Gratuito: Capture Sua Tela Online',
      paragraphs: [
        'Nosso gravador de tela online gratuito permite capturar toda a tela, uma janela específica ou uma aba do navegador diretamente do seu navegador — sem instalar software. Utiliza as APIs modernas MediaRecorder e getDisplayMedia para gravações nativas de alta qualidade.',
        'Escolha entre três níveis de qualidade (baixa, média, alta) que controlam o bitrate do vídeo. Você pode opcionalmente incluir áudio do sistema, perfeito para tutoriais, apresentações, relatórios de bugs e demos. Todas as gravações permanecem no seu dispositivo.',
        'O gravador suporta pausa e retomada para pular seções irrelevantes. Um temporizador mostra a duração com limite máximo de 5 minutos. Ao parar, você obtém uma pré-visualização instantânea e pode baixar como arquivo WebM.',
        'Seja para criar tutoriais rápidos, gravar bugs para equipes de desenvolvimento ou capturar momentos importantes, esta ferramenta oferece uma solução rápida, privada e completamente gratuita.',
      ],
      faq: [
        { q: 'Em qual formato as gravações são salvas?', a: 'As gravações são salvas em formato WebM com codec VP9 (ou VP8 como fallback). WebM é suportado por todos os navegadores modernos e pode ser reproduzido no VLC ou convertido com FFmpeg.' },
        { q: 'Existe um limite de tempo para as gravações?', a: 'Sim, as gravações são limitadas a 5 minutos por sessão para garantir estabilidade do navegador e tamanhos de arquivo gerenciáveis.' },
        { q: 'Posso gravar áudio junto com a tela?', a: 'Sim, você pode ativar o áudio do sistema antes de começar. A disponibilidade depende do navegador e sistema operacional. Chrome no Windows oferece o melhor suporte.' },
        { q: 'Minhas gravações são enviadas para algum lugar?', a: 'Não. Toda a gravação acontece no seu navegador usando APIs locais. Seus dados de vídeo nunca saem do seu dispositivo.' },
        { q: 'Quais navegadores suportam gravação de tela?', a: 'A gravação via getDisplayMedia é suportada no Chrome, Edge, Firefox e Opera no desktop. Safari tem suporte parcial. Navegadores móveis geralmente não suportam captura de tela.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="screen-recorder" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
          <div className="flex items-center gap-3">
            {isRecording && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
            {isPaused && <span className="inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>}
            {status === 'stopped' && <span className="inline-flex rounded-full h-3 w-3 bg-gray-400"></span>}
            {status === 'idle' && <span className="inline-flex rounded-full h-3 w-3 bg-green-500"></span>}
            <span className="font-semibold text-gray-900">{statusLabel}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-bold text-gray-800">{formatTime(elapsed)}</span>
            <span className="text-xs text-gray-400">/ 05:00</span>
          </div>
        </div>

        {/* Settings */}
        {status === 'idle' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">{t('settings')}</h3>
            <div className="space-y-4">
              {/* Audio Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">{t('includeAudio')}</label>
                <button
                  onClick={() => setIncludeAudio(!includeAudio)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${includeAudio ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${includeAudio ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Quality Selector */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">{t('videoQuality')}</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map(q => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        quality === q
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t(q)}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-400">{t('maxDuration')}</p>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-3 mb-4">
          {status === 'idle' && (
            <button
              onClick={startRecording}
              className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <span className="inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              {t('startRecording')}
            </button>
          )}
          {isActive && (
            <>
              <button
                onClick={() => stopRecording(false)}
                className="flex-1 py-3 px-4 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
              >
                {t('stopRecording')}
              </button>
              {isRecording ? (
                <button
                  onClick={pauseRecording}
                  className="py-3 px-4 bg-yellow-500 text-white rounded-lg font-medium text-sm hover:bg-yellow-600 transition-colors"
                >
                  {t('pauseRecording')}
                </button>
              ) : (
                <button
                  onClick={resumeRecording}
                  className="py-3 px-4 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
                >
                  {t('resumeRecording')}
                </button>
              )}
            </>
          )}
          {status === 'stopped' && (
            <button
              onClick={handleNewRecording}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
            >
              {t('newRecording')}
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Auto-stop Message */}
        {autoStopMsg && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-700">{t('autoStopped')}</p>
          </div>
        )}

        {/* Live Preview (during recording) */}
        {isActive && (
          <div className="bg-black rounded-xl overflow-hidden mb-4">
            <video
              ref={previewRef}
              autoPlay
              muted
              playsInline
              className="w-full aspect-video object-contain"
            />
          </div>
        )}

        {/* Recorded Video Preview */}
        {videoUrl && status === 'stopped' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">{t('preview')}</h3>
            </div>
            <div className="bg-black">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                playsInline
                className="w-full aspect-video object-contain"
              />
            </div>
            <div className="p-4">
              <button
                onClick={handleDownload}
                className="w-full py-2.5 px-4 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
              >
                {t('downloadVideo')}
              </button>
            </div>
          </div>
        )}

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
