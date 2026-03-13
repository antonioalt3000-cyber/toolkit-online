'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  startTest: { en: 'Start Test', it: 'Avvia Test', es: 'Iniciar Prueba', fr: 'Demarrer le Test', de: 'Test Starten', pt: 'Iniciar Teste' },
  stopTest: { en: 'Stop Test', it: 'Ferma Test', es: 'Detener Prueba', fr: 'Arreter le Test', de: 'Test Stoppen', pt: 'Parar Teste' },
  selectMic: { en: 'Select Microphone', it: 'Seleziona Microfono', es: 'Seleccionar Microfono', fr: 'Selectionner le Microphone', de: 'Mikrofon Auswahlen', pt: 'Selecionar Microfone' },
  volumeLevel: { en: 'Volume Level', it: 'Livello Volume', es: 'Nivel de Volumen', fr: 'Niveau de Volume', de: 'Lautstarkepegel', pt: 'Nivel de Volume' },
  waveform: { en: 'Waveform', it: 'Forma d\'Onda', es: 'Forma de Onda', fr: 'Forme d\'Onde', de: 'Wellenform', pt: 'Forma de Onda' },
  micInfo: { en: 'Microphone Info', it: 'Info Microfono', es: 'Info Microfono', fr: 'Info Microphone', de: 'Mikrofon-Info', pt: 'Info Microfone' },
  deviceName: { en: 'Device Name', it: 'Nome Dispositivo', es: 'Nombre del Dispositivo', fr: 'Nom de l\'Appareil', de: 'Geratename', pt: 'Nome do Dispositivo' },
  sampleRate: { en: 'Sample Rate', it: 'Frequenza di Campionamento', es: 'Frecuencia de Muestreo', fr: 'Taux d\'Echantillonnage', de: 'Abtastrate', pt: 'Taxa de Amostragem' },
  channels: { en: 'Channels', it: 'Canali', es: 'Canales', fr: 'Canaux', de: 'Kanale', pt: 'Canais' },
  recording: { en: 'Record Test Clip', it: 'Registra Clip di Test', es: 'Grabar Clip de Prueba', fr: 'Enregistrer un Clip Test', de: 'Testclip Aufnehmen', pt: 'Gravar Clip de Teste' },
  stopRecording: { en: 'Stop Recording', it: 'Ferma Registrazione', es: 'Detener Grabacion', fr: 'Arreter l\'Enregistrement', de: 'Aufnahme Stoppen', pt: 'Parar Gravacao' },
  playback: { en: 'Play Recording', it: 'Riproduci Registrazione', es: 'Reproducir Grabacion', fr: 'Lire l\'Enregistrement', de: 'Aufnahme Abspielen', pt: 'Reproduzir Gravacao' },
  listening: { en: 'Listening...', it: 'In Ascolto...', es: 'Escuchando...', fr: 'Ecoute en cours...', de: 'Hore zu...', pt: 'Ouvindo...' },
  ready: { en: 'Ready', it: 'Pronto', es: 'Listo', fr: 'Pret', de: 'Bereit', pt: 'Pronto' },
  privacyNote: { en: 'Your microphone is only accessed when you click "Start Test". No audio is sent to any server.', it: 'Il microfono viene utilizzato solo quando clicchi "Avvia Test". Nessun audio viene inviato a server.', es: 'Tu microfono solo se accede al hacer clic en "Iniciar Prueba". No se envia audio a ningun servidor.', fr: 'Votre microphone n\'est accede que lorsque vous cliquez sur "Demarrer". Aucun audio n\'est envoye.', de: 'Ihr Mikrofon wird nur verwendet wenn Sie "Test Starten" klicken. Kein Audio wird an Server gesendet.', pt: 'Seu microfone so e acessado quando voce clica em "Iniciar Teste". Nenhum audio e enviado a servidores.' },
  errorNotSupported: { en: 'Microphone access is not supported in this browser.', it: 'L\'accesso al microfono non e supportato in questo browser.', es: 'El acceso al microfono no es compatible con este navegador.', fr: 'L\'acces au microphone n\'est pas pris en charge dans ce navigateur.', de: 'Mikrofonzugriff wird in diesem Browser nicht unterstutzt.', pt: 'O acesso ao microfone nao e suportado neste navegador.' },
  errorPermission: { en: 'Microphone permission denied. Please allow access in your browser settings.', it: 'Permesso microfono negato. Consenti l\'accesso nelle impostazioni del browser.', es: 'Permiso de microfono denegado. Permite el acceso en la configuracion del navegador.', fr: 'Permission microphone refusee. Veuillez autoriser l\'acces dans les parametres.', de: 'Mikrofonberechtigung verweigert. Bitte erlauben Sie den Zugriff in den Browsereinstellungen.', pt: 'Permissao do microfone negada. Permita o acesso nas configuracoes do navegador.' },
  recordingClip: { en: 'Recording...', it: 'Registrando...', es: 'Grabando...', fr: 'Enregistrement...', de: 'Aufnahme...', pt: 'Gravando...' },
  noDevices: { en: 'No microphones found', it: 'Nessun microfono trovato', es: 'No se encontraron microfonos', fr: 'Aucun microphone trouve', de: 'Keine Mikrofone gefunden', pt: 'Nenhum microfone encontrado' },
};

export default function MicTest() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['mic-test'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [isActive, setIsActive] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [micInfo, setMicInfo] = useState<{ name: string; sampleRate: number; channels: number } | null>(null);
  const [isRecordingClip, setIsRecordingClip] = useState(false);
  const [clipUrl, setClipUrl] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const drawWaveform = useCallback(() => {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      // Calculate volume (RMS)
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const val = (dataArray[i] - 128) / 128;
        sum += val * val;
      }
      const rms = Math.sqrt(sum / bufferLength);
      setVolume(Math.min(100, Math.round(rms * 300)));

      // Draw waveform
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(0, 0, w, h);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath();

      const sliceWidth = w / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * h) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(w, h / 2);
      ctx.stroke();
    };

    draw();
  }, []);

  const startTest = useCallback(async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError(t('errorNotSupported'));
        return;
      }

      const constraints: MediaStreamConstraints = {
        audio: selectedDevice ? { deviceId: { exact: selectedDevice } } : true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Enumerate devices after permission
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices.filter(d => d.kind === 'audioinput');
      setDevices(audioInputs);
      if (!selectedDevice && audioInputs.length > 0) {
        setSelectedDevice(audioInputs[0].deviceId);
      }

      // Setup audio analysis
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Get mic info
      const track = stream.getAudioTracks()[0];
      const settings = track.getSettings();
      setMicInfo({
        name: track.label || 'Unknown',
        sampleRate: settings.sampleRate || audioCtx.sampleRate,
        channels: settings.channelCount || 1,
      });

      setIsActive(true);
      drawWaveform();
    } catch {
      setError(t('errorPermission'));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDevice, drawWaveform]);

  const stopTest = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setIsActive(false);
    setVolume(0);
    setIsRecordingClip(false);
  }, []);

  const startRecordingClip = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    if (clipUrl) URL.revokeObjectURL(clipUrl);
    setClipUrl(null);

    const mr = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mr;
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      setClipUrl(URL.createObjectURL(blob));
      setIsRecordingClip(false);
    };
    mr.start();
    setIsRecordingClip(true);

    // Auto-stop after 10 seconds
    setTimeout(() => {
      if (mr.state === 'recording') mr.stop();
    }, 10000);
  }, [clipUrl]);

  const stopRecordingClip = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Switch mic device
  const handleDeviceChange = useCallback(async (deviceId: string) => {
    setSelectedDevice(deviceId);
    if (isActive) {
      stopTest();
      // Small delay then restart with new device
      setTimeout(() => {
        startTest();
      }, 200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, stopTest]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (clipUrl) URL.revokeObjectURL(clipUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const volumeColor = volume > 70 ? 'bg-red-500' : volume > 40 ? 'bg-yellow-500' : 'bg-green-500';

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Online Microphone Test: Check Your Mic Instantly',
      paragraphs: [
        'Our free online microphone test tool lets you quickly verify that your microphone is working properly, right in your browser. Whether you are preparing for a video call, podcast recording, or online gaming session, this tool gives you instant feedback on your mic\'s audio input quality without installing any software.',
        'The tool provides a real-time volume level meter that visually shows the intensity of your audio input. A dynamic waveform visualization drawn on an HTML5 Canvas displays the actual sound wave pattern, helping you identify issues like background noise, clipping, or weak signal levels. The volume bar changes color from green (normal) to yellow (moderate) to red (loud) for easy reading.',
        'Select from all available microphone devices using the dropdown menu. The tool displays technical details including the device name, sample rate in Hz, and number of audio channels. You can also record a short test clip (up to 10 seconds) and play it back immediately to hear exactly how your microphone sounds to others.',
        'Privacy is a top priority: your microphone is only accessed when you explicitly click the Start Test button, and absolutely no audio data is transmitted to any server. All processing happens locally in your browser using the Web Audio API and MediaRecorder API. The tool works in Chrome, Firefox, Edge, and other modern browsers that support getUserMedia.',
      ],
      faq: [
        { q: 'How do I allow microphone access?', a: 'When you click "Start Test", your browser will show a permission dialog asking to use your microphone. Click "Allow" to grant access. If you previously denied access, you\'ll need to reset the permission in your browser settings (usually by clicking the lock icon in the address bar).' },
        { q: 'Why is the volume level showing zero?', a: 'This usually means your microphone is muted at the system level, the wrong device is selected, or the mic gain is set too low. Check your operating system sound settings, ensure the correct microphone is selected in the dropdown, and try speaking louder or moving closer to the mic.' },
        { q: 'Is my audio recorded or sent anywhere?', a: 'No. All audio processing happens entirely in your browser using the Web Audio API. No audio data is ever transmitted to any server. The optional test recording is stored only as a temporary blob in your browser memory and is cleared when you leave the page.' },
        { q: 'Can I test different microphones?', a: 'Yes. After starting the test, all detected audio input devices will appear in the dropdown menu. Select a different microphone to switch to it. The tool will automatically restart with the newly selected device.' },
        { q: 'What does the waveform visualization show?', a: 'The waveform shows the real-time amplitude of your audio signal over time. A flat line means silence, small waves mean quiet sound, and large waves mean loud sound. If the waves are consistently hitting the top and bottom edges, your input may be too loud and could cause distortion (clipping).' },
      ],
    },
    it: {
      title: 'Test Microfono Online Gratuito: Verifica il Tuo Microfono Istantaneamente',
      paragraphs: [
        'Il nostro strumento di test microfono online gratuito ti permette di verificare rapidamente che il tuo microfono funzioni correttamente, direttamente nel browser. Che tu stia preparando una videochiamata, una registrazione podcast o una sessione di gaming, questo strumento ti da un feedback istantaneo sulla qualita dell\'ingresso audio.',
        'Lo strumento fornisce un misuratore di livello volume in tempo reale che mostra visivamente l\'intensita del tuo input audio. Una visualizzazione della forma d\'onda dinamica disegnata su Canvas HTML5 mostra il pattern dell\'onda sonora, aiutandoti a identificare problemi come rumore di fondo, clipping o segnale debole.',
        'Seleziona tra tutti i dispositivi microfono disponibili usando il menu a discesa. Lo strumento mostra dettagli tecnici tra cui nome del dispositivo, frequenza di campionamento in Hz e numero di canali audio. Puoi anche registrare un breve clip di test (fino a 10 secondi) e riprodurlo immediatamente.',
        'La privacy e una priorita: il microfono viene utilizzato solo quando clicchi il pulsante Avvia Test, e nessun dato audio viene trasmesso a server. Tutta l\'elaborazione avviene localmente nel browser usando Web Audio API e MediaRecorder API.',
      ],
      faq: [
        { q: 'Come consento l\'accesso al microfono?', a: 'Quando clicchi "Avvia Test", il browser mostrera una finestra di dialogo che chiede di usare il microfono. Clicca "Consenti" per concedere l\'accesso. Se hai precedentemente negato, dovrai resettare il permesso nelle impostazioni del browser.' },
        { q: 'Perche il livello del volume mostra zero?', a: 'Questo di solito significa che il microfono e disattivato a livello di sistema, il dispositivo sbagliato e selezionato, o il guadagno del mic e troppo basso. Controlla le impostazioni audio del sistema operativo.' },
        { q: 'Il mio audio viene registrato o inviato da qualche parte?', a: 'No. Tutta l\'elaborazione audio avviene interamente nel browser usando la Web Audio API. Nessun dato audio viene mai trasmesso a server.' },
        { q: 'Posso testare microfoni diversi?', a: 'Si. Dopo aver avviato il test, tutti i dispositivi audio rilevati appariranno nel menu a discesa. Seleziona un microfono diverso per passare ad esso.' },
        { q: 'Cosa mostra la visualizzazione della forma d\'onda?', a: 'La forma d\'onda mostra l\'ampiezza in tempo reale del segnale audio. Una linea piatta significa silenzio, onde piccole significano suono basso, e onde grandi significano suono forte.' },
      ],
    },
    es: {
      title: 'Prueba de Microfono Online Gratuita: Verifica Tu Microfono al Instante',
      paragraphs: [
        'Nuestra herramienta de prueba de microfono online gratuita te permite verificar rapidamente que tu microfono funciona correctamente, directamente en tu navegador. Ya sea que estes preparando una videollamada, grabacion de podcast o sesion de juegos, esta herramienta te da retroalimentacion instantanea sobre la calidad de entrada de audio.',
        'La herramienta proporciona un medidor de nivel de volumen en tiempo real que muestra visualmente la intensidad de tu entrada de audio. Una visualizacion dinamica de forma de onda dibujada en Canvas HTML5 muestra el patron de onda sonora, ayudandote a identificar problemas como ruido de fondo, recorte o senal debil.',
        'Selecciona entre todos los dispositivos de microfono disponibles usando el menu desplegable. La herramienta muestra detalles tecnicos incluyendo nombre del dispositivo, frecuencia de muestreo en Hz y numero de canales. Tambien puedes grabar un clip de prueba corto (hasta 10 segundos) y reproducirlo inmediatamente.',
        'La privacidad es prioridad: tu microfono solo se accede cuando haces clic en Iniciar Prueba, y ningun dato de audio se transmite a servidores. Todo el procesamiento ocurre localmente en tu navegador usando Web Audio API y MediaRecorder API.',
      ],
      faq: [
        { q: 'Como permito el acceso al microfono?', a: 'Al hacer clic en "Iniciar Prueba", tu navegador mostrara un dialogo pidiendo usar tu microfono. Haz clic en "Permitir". Si previamente lo negaste, deberas resetear el permiso en la configuracion del navegador.' },
        { q: 'Por que el nivel de volumen muestra cero?', a: 'Esto generalmente significa que tu microfono esta silenciado a nivel de sistema, el dispositivo incorrecto esta seleccionado, o la ganancia del mic es muy baja.' },
        { q: 'Mi audio se graba o se envia a algun lugar?', a: 'No. Todo el procesamiento de audio ocurre enteramente en tu navegador usando la Web Audio API. Ningun dato de audio se transmite a servidores.' },
        { q: 'Puedo probar diferentes microfonos?', a: 'Si. Despues de iniciar la prueba, todos los dispositivos de audio detectados apareceran en el menu desplegable. Selecciona uno diferente para cambiar.' },
        { q: 'Que muestra la visualizacion de forma de onda?', a: 'La forma de onda muestra la amplitud en tiempo real de tu senal de audio. Una linea plana significa silencio, ondas pequenas significan sonido bajo y ondas grandes significan sonido fuerte.' },
      ],
    },
    fr: {
      title: 'Test de Microphone en Ligne Gratuit : Verifiez Votre Micro Instantanement',
      paragraphs: [
        'Notre outil de test de microphone en ligne gratuit vous permet de verifier rapidement que votre microphone fonctionne correctement, directement dans votre navigateur. Que vous prepariez un appel video, un enregistrement podcast ou une session de jeu, cet outil vous donne un retour instantane sur la qualite d\'entree audio.',
        'L\'outil fournit un vumetre en temps reel qui montre visuellement l\'intensite de votre entree audio. Une visualisation dynamique de forme d\'onde dessinee sur Canvas HTML5 affiche le motif de l\'onde sonore, vous aidant a identifier les problemes comme le bruit de fond, l\'ecretage ou un signal faible.',
        'Selectionnez parmi tous les microphones disponibles via le menu deroulant. L\'outil affiche les details techniques incluant le nom de l\'appareil, le taux d\'echantillonnage en Hz et le nombre de canaux audio. Vous pouvez egalement enregistrer un court clip test (jusqu\'a 10 secondes) et le rejouer immediatement.',
        'La confidentialite est une priorite : votre microphone n\'est accede que lorsque vous cliquez sur Demarrer, et aucune donnee audio n\'est transmise a un serveur. Tout le traitement se fait localement dans votre navigateur.',
      ],
      faq: [
        { q: 'Comment autoriser l\'acces au microphone ?', a: 'Lorsque vous cliquez sur "Demarrer le Test", votre navigateur affichera une boite de dialogue demandant d\'utiliser votre microphone. Cliquez sur "Autoriser". Si vous avez deja refuse, reintialisez la permission dans les parametres.' },
        { q: 'Pourquoi le niveau de volume affiche zero ?', a: 'Cela signifie generalement que votre microphone est coupe au niveau systeme, que le mauvais appareil est selectionne, ou que le gain est trop faible.' },
        { q: 'Mon audio est-il enregistre ou envoye quelque part ?', a: 'Non. Tout le traitement audio se fait entierement dans votre navigateur en utilisant la Web Audio API. Aucune donnee audio n\'est jamais transmise.' },
        { q: 'Puis-je tester differents microphones ?', a: 'Oui. Apres avoir demarre le test, tous les appareils audio detectes apparaitront dans le menu deroulant. Selectionnez-en un different pour changer.' },
        { q: 'Que montre la visualisation de forme d\'onde ?', a: 'La forme d\'onde montre l\'amplitude en temps reel de votre signal audio. Une ligne plate signifie le silence, de petites ondes signifient un son faible et de grandes ondes un son fort.' },
      ],
    },
    de: {
      title: 'Kostenloser Online-Mikrofontest: Prufen Sie Ihr Mikrofon Sofort',
      paragraphs: [
        'Unser kostenloses Online-Mikrofontest-Tool ermoglicht es Ihnen, schnell zu uberprufen, ob Ihr Mikrofon ordnungsgemas funktioniert, direkt im Browser. Ob Sie sich auf einen Videoanruf, eine Podcast-Aufnahme oder eine Gaming-Session vorbereiten, dieses Tool gibt Ihnen sofortiges Feedback zur Audioeingangsqualitat.',
        'Das Tool bietet einen Echtzeit-Lautstarkemesser, der die Intensitat Ihres Audioeingangs visuell anzeigt. Eine dynamische Wellenform-Visualisierung auf HTML5 Canvas zeigt das tatsachliche Schallwellenmuster und hilft Ihnen, Probleme wie Hintergrundgerausche, Clipping oder schwaches Signal zu erkennen.',
        'Wahlen Sie aus allen verfugbaren Mikrofongeraten uber das Dropdown-Menu. Das Tool zeigt technische Details einschliesslich Geratename, Abtastrate in Hz und Anzahl der Audiokanale. Sie konnen auch einen kurzen Testclip (bis 10 Sekunden) aufnehmen und sofort wiedergeben.',
        'Datenschutz hat Prioritat: Ihr Mikrofon wird nur verwendet, wenn Sie auf Test Starten klicken, und keinerlei Audiodaten werden an Server ubertragen. Die gesamte Verarbeitung erfolgt lokal in Ihrem Browser.',
      ],
      faq: [
        { q: 'Wie erlaube ich den Mikrofonzugriff?', a: 'Wenn Sie auf "Test Starten" klicken, zeigt Ihr Browser einen Berechtigungsdialog an. Klicken Sie auf "Zulassen". Falls Sie zuvor abgelehnt haben, mussen Sie die Berechtigung in den Browsereinstellungen zurucksetzen.' },
        { q: 'Warum zeigt der Lautstarkepegel Null an?', a: 'Dies bedeutet normalerweise, dass Ihr Mikrofon auf Systemebene stummgeschaltet ist, das falsche Gerat ausgewahlt ist oder die Mikrofonverstarkunng zu niedrig eingestellt ist.' },
        { q: 'Wird mein Audio aufgenommen oder irgendwohin gesendet?', a: 'Nein. Die gesamte Audioverarbeitung erfolgt vollstandig in Ihrem Browser mit der Web Audio API. Es werden keine Audiodaten an Server ubertragen.' },
        { q: 'Kann ich verschiedene Mikrofone testen?', a: 'Ja. Nach dem Start des Tests erscheinen alle erkannten Audiogerate im Dropdown-Menu. Wahlen Sie ein anderes aus, um zu wechseln.' },
        { q: 'Was zeigt die Wellenform-Visualisierung?', a: 'Die Wellenform zeigt die Echtzeit-Amplitude Ihres Audiosignals. Eine flache Linie bedeutet Stille, kleine Wellen bedeuten leisen Ton und grosse Wellen bedeuten lauten Ton.' },
      ],
    },
    pt: {
      title: 'Teste de Microfone Online Gratuito: Verifique Seu Microfone Instantaneamente',
      paragraphs: [
        'Nossa ferramenta de teste de microfone online gratuita permite verificar rapidamente se seu microfone esta funcionando corretamente, diretamente no navegador. Seja para preparar uma videochamada, gravacao de podcast ou sessao de jogos, esta ferramenta da feedback instantaneo sobre a qualidade de entrada de audio.',
        'A ferramenta fornece um medidor de nivel de volume em tempo real que mostra visualmente a intensidade da sua entrada de audio. Uma visualizacao dinamica de forma de onda desenhada em Canvas HTML5 exibe o padrao real da onda sonora, ajudando a identificar problemas como ruido de fundo, clipping ou sinal fraco.',
        'Selecione entre todos os dispositivos de microfone disponiveis usando o menu suspenso. A ferramenta exibe detalhes tecnicos incluindo nome do dispositivo, taxa de amostragem em Hz e numero de canais de audio. Voce tambem pode gravar um clip de teste curto (ate 10 segundos) e reproduzi-lo imediatamente.',
        'Privacidade e prioridade: seu microfone so e acessado quando voce clica em Iniciar Teste, e nenhum dado de audio e transmitido a servidores. Todo o processamento acontece localmente no navegador.',
      ],
      faq: [
        { q: 'Como permito o acesso ao microfone?', a: 'Ao clicar em "Iniciar Teste", seu navegador mostrara um dialogo pedindo para usar seu microfone. Clique em "Permitir". Se voce negou anteriormente, precisara redefinir a permissao nas configuracoes do navegador.' },
        { q: 'Por que o nivel de volume mostra zero?', a: 'Isso geralmente significa que seu microfone esta mudo no nivel do sistema, o dispositivo errado esta selecionado ou o ganho do mic esta muito baixo.' },
        { q: 'Meu audio e gravado ou enviado para algum lugar?', a: 'Nao. Todo o processamento de audio acontece inteiramente no seu navegador usando a Web Audio API. Nenhum dado de audio e transmitido a servidores.' },
        { q: 'Posso testar diferentes microfones?', a: 'Sim. Apos iniciar o teste, todos os dispositivos de audio detectados aparecerao no menu suspenso. Selecione um diferente para trocar.' },
        { q: 'O que a visualizacao de forma de onda mostra?', a: 'A forma de onda mostra a amplitude em tempo real do seu sinal de audio. Uma linha reta significa silencio, ondas pequenas significam som baixo e ondas grandes significam som alto.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="mic-test" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Privacy Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-700">{t('privacyNote')}</p>
        </div>

        {/* Device Selection */}
        {devices.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <label className="text-sm font-semibold text-gray-700 block mb-2">{t('selectMic')}</label>
            <select
              value={selectedDevice}
              onChange={(e) => handleDeviceChange(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
            >
              {devices.map(d => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Microphone ${d.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Start/Stop Button */}
        <div className="flex gap-3 mb-4">
          {!isActive ? (
            <button
              onClick={startTest}
              className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              {t('startTest')}
            </button>
          ) : (
            <button
              onClick={stopTest}
              className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors"
            >
              {t('stopTest')}
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Active State UI */}
        {isActive && (
          <>
            {/* Status Indicator */}
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-green-700">{t('listening')}</span>
            </div>

            {/* Volume Meter */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">{t('volumeLevel')}</h3>
                <span className="text-sm font-mono font-bold text-gray-900">{volume}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-75 ${volumeColor}`}
                  style={{ width: `${volume}%` }}
                />
              </div>
            </div>

            {/* Waveform */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">{t('waveform')}</h3>
              </div>
              <canvas ref={canvasRef} width={600} height={150} className="w-full bg-gray-50" />
            </div>

            {/* Mic Info */}
            {micInfo && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('micInfo')}</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">{t('deviceName')}</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{micInfo.name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">{t('sampleRate')}</p>
                    <p className="text-sm font-semibold text-gray-900">{micInfo.sampleRate} Hz</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">{t('channels')}</p>
                    <p className="text-sm font-semibold text-gray-900">{micInfo.channels}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recording Test Clip */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <div className="flex gap-3">
                {!isRecordingClip ? (
                  <button
                    onClick={startRecordingClip}
                    className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                    {t('recording')}
                  </button>
                ) : (
                  <button
                    onClick={stopRecordingClip}
                    className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="animate-pulse text-xs">{t('recordingClip')}</span>
                    {t('stopRecording')}
                  </button>
                )}
              </div>
              {clipUrl && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">{t('playback')}</p>
                  <audio src={clipUrl} controls className="w-full" />
                </div>
              )}
            </div>
          </>
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
