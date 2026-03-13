'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  startTest: { en: 'Start Test', it: 'Avvia Test', es: 'Iniciar Prueba', fr: 'Demarrer le Test', de: 'Test Starten', pt: 'Iniciar Teste' },
  stopTest: { en: 'Stop Test', it: 'Ferma Test', es: 'Detener Prueba', fr: 'Arreter le Test', de: 'Test Stoppen', pt: 'Parar Teste' },
  selectCamera: { en: 'Select Camera', it: 'Seleziona Fotocamera', es: 'Seleccionar Camara', fr: 'Selectionner la Camera', de: 'Kamera Auswahlen', pt: 'Selecionar Camera' },
  takeSnapshot: { en: 'Take Snapshot', it: 'Scatta Foto', es: 'Tomar Captura', fr: 'Prendre une Photo', de: 'Foto Aufnehmen', pt: 'Tirar Foto' },
  downloadSnapshot: { en: 'Download PNG', it: 'Scarica PNG', es: 'Descargar PNG', fr: 'Telecharger PNG', de: 'PNG Herunterladen', pt: 'Baixar PNG' },
  mirror: { en: 'Mirror', it: 'Specchia', es: 'Espejo', fr: 'Miroir', de: 'Spiegeln', pt: 'Espelhar' },
  cameraInfo: { en: 'Camera Info', it: 'Info Fotocamera', es: 'Info Camara', fr: 'Info Camera', de: 'Kamera-Info', pt: 'Info Camera' },
  deviceName: { en: 'Device Name', it: 'Nome Dispositivo', es: 'Nombre del Dispositivo', fr: 'Nom de l\'Appareil', de: 'Geratename', pt: 'Nome do Dispositivo' },
  resolution: { en: 'Resolution', it: 'Risoluzione', es: 'Resolucion', fr: 'Resolution', de: 'Auflosung', pt: 'Resolucao' },
  fps: { en: 'FPS', it: 'FPS', es: 'FPS', fr: 'IPS', de: 'FPS', pt: 'FPS' },
  livePreview: { en: 'Live Preview', it: 'Anteprima Live', es: 'Vista en Vivo', fr: 'Apercu en Direct', de: 'Live-Vorschau', pt: 'Visualizacao ao Vivo' },
  snapshot: { en: 'Snapshot', it: 'Foto', es: 'Captura', fr: 'Photo', de: 'Foto', pt: 'Foto' },
  privacyNote: { en: 'Your camera is only accessed when you click "Start Test". No video is sent to any server.', it: 'La fotocamera viene utilizzata solo quando clicchi "Avvia Test". Nessun video viene inviato a server.', es: 'Tu camara solo se accede al hacer clic en "Iniciar Prueba". No se envia video a ningun servidor.', fr: 'Votre camera n\'est accedee que lorsque vous cliquez sur "Demarrer". Aucune video n\'est envoyee.', de: 'Ihre Kamera wird nur verwendet wenn Sie "Test Starten" klicken. Kein Video wird an Server gesendet.', pt: 'Sua camera so e acessada quando voce clica em "Iniciar Teste". Nenhum video e enviado a servidores.' },
  errorNotSupported: { en: 'Camera access is not supported in this browser.', it: 'L\'accesso alla fotocamera non e supportato in questo browser.', es: 'El acceso a la camara no es compatible con este navegador.', fr: 'L\'acces a la camera n\'est pas pris en charge dans ce navigateur.', de: 'Kamerazugriff wird in diesem Browser nicht unterstutzt.', pt: 'O acesso a camera nao e suportado neste navegador.' },
  errorPermission: { en: 'Camera permission denied. Please allow access in your browser settings.', it: 'Permesso fotocamera negato. Consenti l\'accesso nelle impostazioni del browser.', es: 'Permiso de camara denegado. Permite el acceso en la configuracion del navegador.', fr: 'Permission camera refusee. Veuillez autoriser l\'acces dans les parametres.', de: 'Kameraberechtigung verweigert. Bitte erlauben Sie den Zugriff in den Browsereinstellungen.', pt: 'Permissao da camera negada. Permita o acesso nas configuracoes do navegador.' },
  on: { en: 'ON', it: 'ON', es: 'ON', fr: 'ON', de: 'AN', pt: 'ON' },
  off: { en: 'OFF', it: 'OFF', es: 'OFF', fr: 'OFF', de: 'AUS', pt: 'OFF' },
};

export default function WebcamTest() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['webcam-test'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [isActive, setIsActive] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [mirrored, setMirrored] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [camInfo, setCamInfo] = useState<{ name: string; width: number; height: number; frameRate: number } | null>(null);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [currentFps, setCurrentFps] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fpsFrameCount = useRef(0);
  const fpsLastTime = useRef(0);
  const fpsAnimRef = useRef<number | null>(null);

  const countFps = useCallback(() => {
    fpsFrameCount.current++;
    const now = performance.now();
    if (now - fpsLastTime.current >= 1000) {
      setCurrentFps(fpsFrameCount.current);
      fpsFrameCount.current = 0;
      fpsLastTime.current = now;
    }
    fpsAnimRef.current = requestAnimationFrame(countFps);
  }, []);

  const startTest = useCallback(async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError(t('errorNotSupported'));
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: selectedDevice ? { deviceId: { exact: selectedDevice } } : { facingMode: 'user' },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Enumerate devices after permission
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices.filter(d => d.kind === 'videoinput');
      setDevices(videoInputs);
      if (!selectedDevice && videoInputs.length > 0) {
        setSelectedDevice(videoInputs[0].deviceId);
      }

      // Get camera info
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      setCamInfo({
        name: track.label || 'Unknown',
        width: settings.width || 0,
        height: settings.height || 0,
        frameRate: settings.frameRate || 0,
      });

      setIsActive(true);

      // Start FPS counter
      fpsFrameCount.current = 0;
      fpsLastTime.current = performance.now();
      fpsAnimRef.current = requestAnimationFrame(countFps);
    } catch {
      setError(t('errorPermission'));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDevice, countFps]);

  const stopTest = useCallback(() => {
    if (fpsAnimRef.current) cancelAnimationFrame(fpsAnimRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setCurrentFps(0);
  }, []);

  const takeSnapshot = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (mirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    if (snapshotUrl) URL.revokeObjectURL(snapshotUrl);
    canvas.toBlob((blob) => {
      if (blob) setSnapshotUrl(URL.createObjectURL(blob));
    }, 'image/png');
  }, [mirrored, snapshotUrl]);

  const downloadSnapshot = useCallback(() => {
    if (!snapshotUrl) return;
    const a = document.createElement('a');
    a.href = snapshotUrl;
    a.download = `webcam-snapshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
    a.click();
  }, [snapshotUrl]);

  // Switch camera device
  const handleDeviceChange = useCallback(async (deviceId: string) => {
    setSelectedDevice(deviceId);
    if (isActive) {
      stopTest();
      setTimeout(() => {
        startTest();
      }, 200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, stopTest]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fpsAnimRef.current) cancelAnimationFrame(fpsAnimRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (snapshotUrl) URL.revokeObjectURL(snapshotUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Online Webcam Test: Check Your Camera Instantly',
      paragraphs: [
        'Our free online webcam test tool lets you quickly verify that your camera is working properly, directly in your browser. Whether you are about to join a video conference, set up a streaming session, or troubleshoot camera issues, this tool gives you an instant live preview of your webcam feed without installing any software or plugins.',
        'The tool displays a real-time video preview from your selected camera with the option to mirror (flip horizontally) the image, which is the default for a natural self-view experience. You can see your actual camera resolution, frame rate, and device name displayed in the info panel. A live FPS counter shows the real rendering performance.',
        'Take a high-quality snapshot at any moment by clicking the capture button. The snapshot is rendered at your camera\'s full native resolution and can be downloaded instantly as a PNG file. The mirror setting is applied to snapshots too, so what you see is what you get. You can switch between multiple cameras using the device dropdown.',
        'Privacy is our top priority: your camera is only activated when you explicitly click the Start Test button. No video data is ever transmitted to any server. All processing happens entirely in your browser using the native getUserMedia API. The tool works in Chrome, Firefox, Edge, Safari, and other modern browsers.',
      ],
      faq: [
        { q: 'How do I allow camera access?', a: 'When you click "Start Test", your browser will display a permission dialog requesting camera access. Click "Allow" to grant it. If you previously denied access, you can reset the permission by clicking the lock/camera icon in the address bar of your browser.' },
        { q: 'Can I test multiple cameras?', a: 'Yes. After granting camera permission, all detected video input devices will appear in the dropdown selector. Choose a different camera to switch to it. This is useful for testing external USB cameras, virtual cameras, or switching between front and rear cameras on tablets.' },
        { q: 'Is my video recorded or sent anywhere?', a: 'No. All video processing happens entirely in your browser using the getUserMedia API. No video frames, snapshots, or any data is ever transmitted to any server. Snapshots are generated as local blob URLs that exist only in your browser memory.' },
        { q: 'What does the mirror toggle do?', a: 'The mirror toggle flips the video horizontally, creating a mirror-image effect like looking in a mirror. This is enabled by default because most people prefer this natural self-view. Disable it to see the actual camera output as others would see you. The mirror setting also applies to snapshots.' },
        { q: 'Why is my camera showing a black screen?', a: 'A black screen usually means another application is currently using your camera (close Zoom, Teams, etc.), the camera driver needs updating, or the wrong camera is selected. Try selecting a different device from the dropdown, closing other video apps, or restarting your browser.' },
      ],
    },
    it: {
      title: 'Test Webcam Online Gratuito: Verifica la Tua Fotocamera Istantaneamente',
      paragraphs: [
        'Il nostro strumento di test webcam online gratuito ti permette di verificare rapidamente che la tua fotocamera funzioni correttamente, direttamente nel browser. Che tu stia per partecipare a una videoconferenza, configurare una sessione di streaming o risolvere problemi della fotocamera, questo strumento ti offre un\'anteprima live istantanea senza installare software.',
        'Lo strumento mostra un\'anteprima video in tempo reale dalla fotocamera selezionata con l\'opzione di specchiare (capovolgere orizzontalmente) l\'immagine. Puoi vedere la risoluzione effettiva, il frame rate e il nome del dispositivo nel pannello informazioni. Un contatore FPS in tempo reale mostra le prestazioni di rendering.',
        'Scatta una foto di alta qualita in qualsiasi momento cliccando il pulsante di cattura. La foto viene renderizzata alla risoluzione nativa completa e puo essere scaricata come file PNG. L\'impostazione specchio viene applicata anche alle foto. Puoi passare tra piu fotocamere usando il menu a discesa.',
        'La privacy e la nostra priorita: la fotocamera viene attivata solo quando clicchi Avvia Test. Nessun dato video viene mai trasmesso a server. Tutta l\'elaborazione avviene nel browser usando l\'API nativa getUserMedia.',
      ],
      faq: [
        { q: 'Come consento l\'accesso alla fotocamera?', a: 'Quando clicchi "Avvia Test", il browser mostrera una finestra di dialogo che richiede l\'accesso alla fotocamera. Clicca "Consenti". Se hai precedentemente negato, puoi reimpostare il permesso cliccando l\'icona del lucchetto nella barra degli indirizzi.' },
        { q: 'Posso testare piu fotocamere?', a: 'Si. Dopo aver concesso il permesso, tutti i dispositivi video rilevati appariranno nel selettore a discesa. Scegli una fotocamera diversa per passare ad essa.' },
        { q: 'Il mio video viene registrato o inviato da qualche parte?', a: 'No. Tutta l\'elaborazione video avviene interamente nel browser. Nessun frame video o dato viene mai trasmesso a server.' },
        { q: 'Cosa fa il toggle specchio?', a: 'Il toggle specchio capovolge il video orizzontalmente, creando un effetto specchio. E attivato per impostazione predefinita perche la maggior parte delle persone preferisce questa visualizzazione naturale.' },
        { q: 'Perche la mia fotocamera mostra uno schermo nero?', a: 'Uno schermo nero di solito significa che un\'altra applicazione sta usando la fotocamera, il driver necessita di aggiornamento, o la fotocamera sbagliata e selezionata. Prova a chiudere altre app video o riavvia il browser.' },
      ],
    },
    es: {
      title: 'Prueba de Webcam Online Gratuita: Verifica Tu Camara al Instante',
      paragraphs: [
        'Nuestra herramienta de prueba de webcam online gratuita te permite verificar rapidamente que tu camara funciona correctamente, directamente en tu navegador. Ya sea para una videoconferencia, configurar streaming o solucionar problemas, esta herramienta te ofrece una vista previa en vivo instantanea sin instalar software.',
        'La herramienta muestra una vista previa de video en tiempo real con la opcion de espejo (voltear horizontalmente). Puedes ver la resolucion real, tasa de cuadros y nombre del dispositivo en el panel de informacion. Un contador FPS en vivo muestra el rendimiento de renderizado.',
        'Toma una captura de alta calidad en cualquier momento. La captura se renderiza a la resolucion nativa completa y se puede descargar como archivo PNG. La configuracion de espejo tambien se aplica a las capturas. Puedes cambiar entre multiples camaras usando el menu desplegable.',
        'La privacidad es prioridad: tu camara solo se activa cuando haces clic en Iniciar Prueba. Ningun dato de video se transmite a servidores. Todo el procesamiento ocurre en el navegador usando la API nativa getUserMedia.',
      ],
      faq: [
        { q: 'Como permito el acceso a la camara?', a: 'Al hacer clic en "Iniciar Prueba", tu navegador mostrara un dialogo solicitando acceso a la camara. Haz clic en "Permitir". Si lo negaste antes, restablece el permiso desde el icono del candado en la barra de direcciones.' },
        { q: 'Puedo probar multiples camaras?', a: 'Si. Despues de otorgar permiso, todos los dispositivos de video detectados apareceran en el selector. Elige una camara diferente para cambiar.' },
        { q: 'Mi video se graba o se envia a algun lugar?', a: 'No. Todo el procesamiento de video ocurre enteramente en tu navegador. Ningun dato se transmite a servidores.' },
        { q: 'Que hace el boton de espejo?', a: 'El boton de espejo voltea el video horizontalmente. Esta activado por defecto porque la mayoria prefiere esta vista natural de si mismo.' },
        { q: 'Por que mi camara muestra pantalla negra?', a: 'Una pantalla negra generalmente significa que otra aplicacion esta usando la camara, el controlador necesita actualizacion, o la camara incorrecta esta seleccionada.' },
      ],
    },
    fr: {
      title: 'Test de Webcam en Ligne Gratuit : Verifiez Votre Camera Instantanement',
      paragraphs: [
        'Notre outil de test de webcam en ligne gratuit vous permet de verifier rapidement que votre camera fonctionne correctement, directement dans votre navigateur. Que vous prepariez une videoconference, configuriez un streaming ou resolviez des problemes, cet outil offre un apercu en direct instantane sans installation.',
        'L\'outil affiche un apercu video en temps reel avec l\'option miroir (retournement horizontal). Vous pouvez voir la resolution reelle, le taux d\'images et le nom de l\'appareil dans le panneau d\'information. Un compteur FPS en direct montre les performances de rendu.',
        'Prenez une capture de haute qualite a tout moment. La capture est rendue a la resolution native complete et peut etre telechargee en PNG. Le parametre miroir s\'applique aussi aux captures. Vous pouvez basculer entre plusieurs cameras via le menu deroulant.',
        'La confidentialite est notre priorite : votre camera n\'est activee que lorsque vous cliquez sur Demarrer. Aucune donnee video n\'est jamais transmise a un serveur. Tout le traitement se fait dans votre navigateur.',
      ],
      faq: [
        { q: 'Comment autoriser l\'acces a la camera ?', a: 'Lorsque vous cliquez sur "Demarrer le Test", votre navigateur affichera une boite de dialogue. Cliquez sur "Autoriser". Si vous avez refuse, reintialisez la permission depuis l\'icone de cadenas dans la barre d\'adresse.' },
        { q: 'Puis-je tester plusieurs cameras ?', a: 'Oui. Apres avoir accorde la permission, tous les appareils video detectes apparaitront dans le selecteur. Choisissez-en un different pour changer.' },
        { q: 'Ma video est-elle enregistree ou envoyee quelque part ?', a: 'Non. Tout le traitement video se fait entierement dans votre navigateur. Aucune donnee n\'est jamais transmise.' },
        { q: 'Que fait le bouton miroir ?', a: 'Le bouton miroir retourne la video horizontalement. Il est active par defaut car la plupart des gens preferent cette vue naturelle de soi-meme.' },
        { q: 'Pourquoi ma camera affiche un ecran noir ?', a: 'Un ecran noir signifie generalement qu\'une autre application utilise la camera, le pilote doit etre mis a jour, ou la mauvaise camera est selectionnee.' },
      ],
    },
    de: {
      title: 'Kostenloser Online-Webcam-Test: Prufen Sie Ihre Kamera Sofort',
      paragraphs: [
        'Unser kostenloses Online-Webcam-Test-Tool ermoglicht es Ihnen, schnell zu uberprufen, ob Ihre Kamera ordnungsgemas funktioniert, direkt im Browser. Ob fur eine Videokonferenz, Streaming-Setup oder Fehlerbehebung - dieses Tool bietet eine sofortige Live-Vorschau ohne Softwareinstallation.',
        'Das Tool zeigt eine Echtzeit-Videovorschau mit Spiegeloption (horizontales Umkehren). Sie sehen die tatsachliche Auflosung, Bildrate und den Geratenamen im Info-Panel. Ein Live-FPS-Zahler zeigt die Rendering-Leistung.',
        'Machen Sie jederzeit eine hochwertige Aufnahme. Das Foto wird in voller nativer Auflosung gerendert und kann als PNG heruntergeladen werden. Die Spiegeleinstellung wird auch auf Fotos angewendet. Sie konnen zwischen mehreren Kameras uber das Dropdown-Menu wechseln.',
        'Datenschutz hat Prioritat: Ihre Kamera wird nur aktiviert, wenn Sie auf Test Starten klicken. Keine Videodaten werden jemals an Server ubertragen. Die gesamte Verarbeitung erfolgt lokal in Ihrem Browser.',
      ],
      faq: [
        { q: 'Wie erlaube ich den Kamerazugriff?', a: 'Wenn Sie auf "Test Starten" klicken, zeigt Ihr Browser einen Berechtigungsdialog an. Klicken Sie auf "Zulassen". Falls zuvor abgelehnt, setzen Sie die Berechtigung uber das Schloss-Symbol in der Adressleiste zuruck.' },
        { q: 'Kann ich mehrere Kameras testen?', a: 'Ja. Nach Erteilung der Berechtigung erscheinen alle erkannten Videogerate im Dropdown. Wahlen Sie eine andere Kamera zum Wechseln.' },
        { q: 'Wird mein Video aufgenommen oder irgendwohin gesendet?', a: 'Nein. Die gesamte Videoverarbeitung erfolgt vollstandig in Ihrem Browser. Es werden keine Daten an Server ubertragen.' },
        { q: 'Was macht der Spiegel-Schalter?', a: 'Der Spiegel-Schalter kehrt das Video horizontal um. Er ist standardmasig aktiviert, da die meisten Menschen diese naturliche Selbstansicht bevorzugen.' },
        { q: 'Warum zeigt meine Kamera einen schwarzen Bildschirm?', a: 'Ein schwarzer Bildschirm bedeutet normalerweise, dass eine andere Anwendung die Kamera verwendet, der Treiber aktualisiert werden muss oder die falsche Kamera ausgewahlt ist.' },
      ],
    },
    pt: {
      title: 'Teste de Webcam Online Gratuito: Verifique Sua Camera Instantaneamente',
      paragraphs: [
        'Nossa ferramenta de teste de webcam online gratuita permite verificar rapidamente se sua camera esta funcionando corretamente, diretamente no navegador. Seja para uma videoconferencia, configuracao de streaming ou solucao de problemas, esta ferramenta oferece uma visualizacao ao vivo instantanea sem instalar software.',
        'A ferramenta exibe uma visualizacao de video em tempo real com opcao de espelho (inversao horizontal). Voce pode ver a resolucao real, taxa de quadros e nome do dispositivo no painel de informacoes. Um contador FPS ao vivo mostra o desempenho de renderizacao.',
        'Tire uma foto de alta qualidade a qualquer momento. A foto e renderizada na resolucao nativa completa e pode ser baixada como arquivo PNG. A configuracao de espelho tambem se aplica as fotos. Voce pode alternar entre multiplas cameras usando o menu suspenso.',
        'Privacidade e prioridade: sua camera so e ativada quando voce clica em Iniciar Teste. Nenhum dado de video e transmitido a servidores. Todo o processamento acontece localmente no navegador.',
      ],
      faq: [
        { q: 'Como permito o acesso a camera?', a: 'Ao clicar em "Iniciar Teste", seu navegador mostrara um dialogo solicitando acesso. Clique em "Permitir". Se voce negou antes, redefina a permissao clicando no icone do cadeado na barra de endereco.' },
        { q: 'Posso testar multiplas cameras?', a: 'Sim. Apos conceder permissao, todos os dispositivos de video detectados aparecerao no seletor. Escolha uma camera diferente para trocar.' },
        { q: 'Meu video e gravado ou enviado para algum lugar?', a: 'Nao. Todo o processamento de video acontece inteiramente no seu navegador. Nenhum dado e transmitido a servidores.' },
        { q: 'O que faz o botao espelho?', a: 'O botao espelho inverte o video horizontalmente. Esta ativado por padrao porque a maioria das pessoas prefere esta visualizacao natural de si mesmo.' },
        { q: 'Por que minha camera mostra tela preta?', a: 'Uma tela preta geralmente significa que outro aplicativo esta usando a camera, o driver precisa de atualizacao, ou a camera errada esta selecionada.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="webcam-test" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Hidden canvas for snapshots */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Privacy Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-700">{t('privacyNote')}</p>
        </div>

        {/* Device Selection */}
        {devices.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <label className="text-sm font-semibold text-gray-700 block mb-2">{t('selectCamera')}</label>
            <select
              value={selectedDevice}
              onChange={(e) => handleDeviceChange(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
            >
              {devices.map(d => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Camera ${d.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Start/Stop + Controls */}
        <div className="flex gap-3 mb-4">
          {!isActive ? (
            <button
              onClick={startTest}
              className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {t('startTest')}
            </button>
          ) : (
            <>
              <button
                onClick={stopTest}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors"
              >
                {t('stopTest')}
              </button>
              <button
                onClick={() => setMirrored(!mirrored)}
                className={`py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
                  mirrored ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('mirror')} {mirrored ? t('on') : t('off')}
              </button>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Video Preview */}
        {isActive && (
          <>
            <div className="bg-black rounded-xl overflow-hidden mb-4 relative">
              <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                <span className="bg-black/60 text-white text-xs font-mono px-2 py-1 rounded">
                  {currentFps} {t('fps')}
                </span>
                {camInfo && (
                  <span className="bg-black/60 text-white text-xs font-mono px-2 py-1 rounded">
                    {camInfo.width}x{camInfo.height}
                  </span>
                )}
              </div>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full aspect-video object-cover ${mirrored ? 'scale-x-[-1]' : ''}`}
              />
            </div>

            {/* Snapshot Button */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={takeSnapshot}
                className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t('takeSnapshot')}
              </button>
            </div>

            {/* Camera Info */}
            {camInfo && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('cameraInfo')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                    <p className="text-xs text-gray-500">{t('deviceName')}</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{camInfo.name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">{t('resolution')}</p>
                    <p className="text-sm font-semibold text-gray-900">{camInfo.width} x {camInfo.height}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">{t('fps')}</p>
                    <p className="text-sm font-semibold text-gray-900">{Math.round(camInfo.frameRate)} fps (reported) / {currentFps} fps (actual)</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Snapshot Preview */}
        {snapshotUrl && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">{t('snapshot')}</h3>
              <button onClick={downloadSnapshot} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                {t('downloadSnapshot')}
              </button>
            </div>
            <div className="bg-gray-100 flex items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={snapshotUrl} alt="Snapshot" className="max-h-60 object-contain rounded" />
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
