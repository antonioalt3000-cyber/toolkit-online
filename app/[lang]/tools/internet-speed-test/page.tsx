'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  runTest: { en: 'Run Speed Test', it: 'Avvia Test Velocità', es: 'Ejecutar Test de Velocidad', fr: 'Lancer le Test', de: 'Geschwindigkeitstest Starten', pt: 'Executar Teste de Velocidade' },
  running: { en: 'Testing...', it: 'Test in corso...', es: 'Probando...', fr: 'Test en cours...', de: 'Test läuft...', pt: 'Testando...' },
  connectionType: { en: 'Connection Type', it: 'Tipo Connessione', es: 'Tipo de Conexión', fr: 'Type de Connexion', de: 'Verbindungstyp', pt: 'Tipo de Conexão' },
  downlink: { en: 'Downlink Speed', it: 'Velocità Downlink', es: 'Velocidad Downlink', fr: 'Vitesse Descendante', de: 'Download-Geschwindigkeit', pt: 'Velocidade Downlink' },
  rtt: { en: 'Round-Trip Time', it: 'Tempo di Andata/Ritorno', es: 'Tiempo de Ida/Vuelta', fr: 'Temps Aller-Retour', de: 'Paketumlaufzeit', pt: 'Tempo de Ida/Volta' },
  saveData: { en: 'Data Saver', it: 'Risparmio Dati', es: 'Ahorro de Datos', fr: 'Économiseur de Données', de: 'Datensparmodus', pt: 'Economia de Dados' },
  onlineStatus: { en: 'Online Status', it: 'Stato Connessione', es: 'Estado de Conexión', fr: 'État de Connexion', de: 'Online-Status', pt: 'Status Online' },
  online: { en: 'Online', it: 'Online', es: 'En Línea', fr: 'En Ligne', de: 'Online', pt: 'Online' },
  offline: { en: 'Offline', it: 'Offline', es: 'Desconectado', fr: 'Hors Ligne', de: 'Offline', pt: 'Offline' },
  ipAddress: { en: 'IP Address', it: 'Indirizzo IP', es: 'Dirección IP', fr: 'Adresse IP', de: 'IP-Adresse', pt: 'Endereço IP' },
  latency: { en: 'Measured Latency', it: 'Latenza Misurata', es: 'Latencia Medida', fr: 'Latence Mesurée', de: 'Gemessene Latenz', pt: 'Latência Medida' },
  speedCategory: { en: 'Speed Category', it: 'Categoria Velocità', es: 'Categoría de Velocidad', fr: 'Catégorie de Vitesse', de: 'Geschwindigkeitskategorie', pt: 'Categoria de Velocidade' },
  connectionDetails: { en: 'Connection Details', it: 'Dettagli Connessione', es: 'Detalles de Conexión', fr: 'Détails de Connexion', de: 'Verbindungsdetails', pt: 'Detalhes da Conexão' },
  history: { en: 'Test History', it: 'Cronologia Test', es: 'Historial de Tests', fr: 'Historique des Tests', de: 'Testverlauf', pt: 'Histórico de Testes' },
  clearHistory: { en: 'Clear History', it: 'Cancella Cronologia', es: 'Borrar Historial', fr: 'Effacer l\'Historique', de: 'Verlauf Löschen', pt: 'Limpar Histórico' },
  noHistory: { en: 'No tests yet. Run a test to see results here.', it: 'Nessun test. Avvia un test per vedere i risultati.', es: 'Sin tests aún. Ejecuta un test para ver resultados.', fr: 'Aucun test. Lancez un test pour voir les résultats.', de: 'Noch keine Tests. Starten Sie einen Test.', pt: 'Nenhum teste ainda. Execute um teste para ver resultados.' },
  date: { en: 'Date', it: 'Data', es: 'Fecha', fr: 'Date', de: 'Datum', pt: 'Data' },
  na: { en: 'N/A', it: 'N/D', es: 'N/D', fr: 'N/D', de: 'k.A.', pt: 'N/D' },
  enabled: { en: 'Enabled', it: 'Attivo', es: 'Activado', fr: 'Activé', de: 'Aktiviert', pt: 'Ativado' },
  disabled: { en: 'Disabled', it: 'Disattivo', es: 'Desactivado', fr: 'Désactivé', de: 'Deaktiviert', pt: 'Desativado' },
  speedGauge: { en: 'Speed Gauge', it: 'Indicatore Velocità', es: 'Indicador de Velocidad', fr: 'Indicateur de Vitesse', de: 'Geschwindigkeitsanzeige', pt: 'Indicador de Velocidade' },
  copyResults: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier les Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  apiNotSupported: { en: 'Network Information API not supported in this browser', it: 'API Network Information non supportata in questo browser', es: 'API Network Information no soportada en este navegador', fr: 'API Network Information non supportée dans ce navigateur', de: 'Network Information API nicht unterstützt', pt: 'API Network Information não suportada neste navegador' },
  slow: { en: 'Slow', it: 'Lenta', es: 'Lenta', fr: 'Lente', de: 'Langsam', pt: 'Lenta' },
  moderate: { en: 'Moderate', it: 'Moderata', es: 'Moderada', fr: 'Modérée', de: 'Mittel', pt: 'Moderada' },
  fast: { en: 'Fast', it: 'Veloce', es: 'Rápida', fr: 'Rapide', de: 'Schnell', pt: 'Rápida' },
  veryFast: { en: 'Very Fast', it: 'Molto Veloce', es: 'Muy Rápida', fr: 'Très Rapide', de: 'Sehr Schnell', pt: 'Muito Rápida' },
  ultraFast: { en: 'Ultra Fast', it: 'Ultra Veloce', es: 'Ultra Rápida', fr: 'Ultra Rapide', de: 'Ultra Schnell', pt: 'Ultra Rápida' },
};

type NetworkInformation = {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
};

type NavigationType = Navigator & { connection?: NetworkInformation };

interface ConnectionInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface TestResult {
  date: string;
  ip: string;
  latency: number;
  downlink: number;
  effectiveType: string;
  speedCategory: string;
}

function getSpeedCategory(downlink: number, lang: string): string {
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;
  if (downlink <= 0.5) return t('slow');
  if (downlink <= 2) return t('moderate');
  if (downlink <= 10) return t('fast');
  if (downlink <= 50) return t('veryFast');
  return t('ultraFast');
}

function getSpeedColor(downlink: number): string {
  if (downlink <= 0.5) return '#ef4444';
  if (downlink <= 2) return '#f97316';
  if (downlink <= 10) return '#eab308';
  if (downlink <= 50) return '#22c55e';
  return '#06b6d4';
}

function getGaugePercent(downlink: number): number {
  // Map 0-100 Mbps to 0-100%, with logarithmic scaling for better visual
  if (downlink <= 0) return 0;
  const pct = Math.min(100, (Math.log10(downlink + 1) / Math.log10(101)) * 100);
  return Math.round(pct);
}

const HISTORY_KEY = 'internet-speed-test-history';

function loadHistory(): TestResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: TestResult[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
  } catch { /* ignore */ }
}

export default function InternetSpeedTest() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['internet-speed-test'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [isOnline, setIsOnline] = useState(true);
  const [ipAddress, setIpAddress] = useState('...');
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [hasNetworkApi, setHasNetworkApi] = useState(true);
  const [measuredLatency, setMeasuredLatency] = useState<number | null>(null);
  const [testing, setTesting] = useState(false);
  const [history, setHistory] = useState<TestResult[]>([]);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Read connection info from Network Information API
  const readConnectionInfo = useCallback(() => {
    const nav = navigator as NavigationType;
    if (nav.connection) {
      setConnectionInfo({
        effectiveType: nav.connection.effectiveType || 'unknown',
        downlink: nav.connection.downlink || 0,
        rtt: nav.connection.rtt || 0,
        saveData: nav.connection.saveData || false,
      });
      setHasNetworkApi(true);
    } else {
      setHasNetworkApi(false);
    }
  }, []);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    readConnectionInfo();
    setHistory(loadHistory());

    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    const nav = navigator as NavigationType;
    if (nav.connection) {
      nav.connection.addEventListener('change', readConnectionInfo);
    }

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      const n = navigator as NavigationType;
      if (n.connection) {
        n.connection.removeEventListener('change', readConnectionInfo);
      }
    };
  }, [readConnectionInfo]);

  const runTest = useCallback(async () => {
    setTesting(true);
    let ip = '...';
    let latency = 0;

    // Fetch IP
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
      const ipData = await ipRes.json();
      ip = ipData.ip || '...';
      setIpAddress(ip);
    } catch {
      setIpAddress('N/A');
    }

    // Measure latency by timing a small fetch
    try {
      const times: number[] = [];
      for (let i = 0; i < 3; i++) {
        const start = performance.now();
        await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
        const end = performance.now();
        times.push(end - start);
      }
      latency = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      setMeasuredLatency(latency);
    } catch {
      setMeasuredLatency(null);
    }

    // Read connection info again
    readConnectionInfo();

    // Build result
    const nav = navigator as NavigationType;
    const dl = nav.connection?.downlink || 0;
    const et = nav.connection?.effectiveType || 'unknown';
    const cat = getSpeedCategory(dl, lang);

    const result: TestResult = {
      date: new Date().toLocaleString(),
      ip,
      latency,
      downlink: dl,
      effectiveType: et,
      speedCategory: cat,
    };

    const newHistory = [result, ...loadHistory()].slice(0, 20);
    setHistory(newHistory);
    saveHistory(newHistory);
    setTesting(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, readConnectionInfo]);

  const clearHistoryHandler = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const handleCopy = () => {
    const dl = connectionInfo?.downlink ?? 0;
    const text = [
      `Online: ${isOnline ? t('online') : t('offline')}`,
      `IP: ${ipAddress}`,
      `Connection: ${connectionInfo?.effectiveType || t('na')}`,
      `Downlink: ${dl} Mbps`,
      `RTT: ${connectionInfo?.rtt ?? t('na')} ms`,
      `Latency: ${measuredLatency ?? t('na')} ms`,
      `Speed Category: ${getSpeedCategory(dl, lang)}`,
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const dl = connectionInfo?.downlink ?? 0;
  const gaugePercent = getGaugePercent(dl);
  const speedColor = getSpeedColor(dl);

  // SVG gauge
  const gaugeRadius = 80;
  const gaugeStroke = 12;
  const gaugeCircumference = Math.PI * gaugeRadius; // half circle
  const gaugeDashOffset = gaugeCircumference - (gaugePercent / 100) * gaugeCircumference;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Internet Speed Test & Connection Info: Check Your Network Performance',
      paragraphs: [
        'Understanding your internet connection is crucial for troubleshooting slow websites, buffering videos, and lag in online games. Our Internet Speed Test tool provides a comprehensive overview of your network connection by leveraging the browser\'s Network Information API, real-time latency measurements, and IP address detection.',
        'The tool displays your effective connection type (4G, 3G, 2G, or slow-2g), estimated downlink speed in Mbps, round-trip time (RTT) reported by the browser, and whether data saver mode is enabled. These metrics come directly from the Network Information API, which provides the browser\'s best estimate of actual network conditions.',
        'In addition to API-reported metrics, our tool performs a real latency test by timing multiple HTTP requests to measure actual response time. This gives you a practical measurement of network latency that accounts for DNS resolution, TLS handshake, and server response time — not just the theoretical values reported by the browser.',
        'Your IP address is fetched via a secure API call, and the visual speed gauge provides an intuitive, at-a-glance representation of your connection quality. All test results are saved locally in your browser, allowing you to track your connection performance over time without any data leaving your device.',
      ],
      faq: [
        { q: 'How accurate is this speed test?', a: 'This tool uses the browser\'s Network Information API for downlink and RTT estimates, which reflect the browser\'s best guess based on recent network activity. The latency test measures actual round-trip time to an external server. For a full bandwidth test, dedicated tools like Speedtest.net transfer large files to measure throughput.' },
        { q: 'What does "effective connection type" mean?', a: 'Effective connection type (4G, 3G, 2G, slow-2g) is the browser\'s classification of your network quality based on observed latency and throughput. Even on a Wi-Fi connection, you might see "3G" if network conditions are poor. It reflects actual performance, not the physical connection type.' },
        { q: 'Why is my IP address shown?', a: 'Your public IP address is fetched from a third-party API (ipify.org) to display your network identity. This is the IP address that websites see when you connect. It does not reveal your physical location precisely, but it can indicate your ISP and general region.' },
        { q: 'Is my test data stored anywhere?', a: 'All test results are stored exclusively in your browser\'s localStorage. No data is sent to our servers or any third party beyond the IP detection API. You can clear your history at any time using the Clear History button.' },
        { q: 'Why does the Network Information API show "not supported"?', a: 'The Network Information API is currently supported only in Chromium-based browsers (Chrome, Edge, Opera, Samsung Internet). Firefox and Safari do not support it. In unsupported browsers, you can still use the latency test and IP detection features.' },
      ],
    },
    it: {
      title: 'Test Velocità Internet e Info Connessione: Controlla le Prestazioni della Rete',
      paragraphs: [
        'Capire la propria connessione internet è fondamentale per risolvere problemi di siti lenti, video in buffering e lag nei giochi online. Il nostro strumento fornisce una panoramica completa della connessione di rete utilizzando la Network Information API del browser, misurazioni di latenza in tempo reale e rilevamento dell\'indirizzo IP.',
        'Lo strumento mostra il tipo di connessione effettiva (4G, 3G, 2G), la velocità downlink stimata in Mbps, il tempo di andata/ritorno (RTT) e se la modalità risparmio dati è attiva. Questi valori provengono direttamente dalla Network Information API.',
        'Oltre ai dati API, lo strumento esegue un test di latenza reale cronometrando più richieste HTTP. Questo fornisce una misurazione pratica che include risoluzione DNS, handshake TLS e tempo di risposta del server.',
        'L\'indirizzo IP viene rilevato tramite una chiamata API sicura e l\'indicatore visuale di velocità offre una rappresentazione intuitiva della qualità della connessione. Tutti i risultati vengono salvati localmente nel browser per monitorare le prestazioni nel tempo.',
      ],
      faq: [
        { q: 'Quanto è preciso questo test di velocità?', a: 'Lo strumento utilizza la Network Information API del browser per stime di downlink e RTT. Il test di latenza misura il tempo reale di andata/ritorno verso un server esterno. Per un test completo della banda, strumenti dedicati trasferiscono file di grandi dimensioni.' },
        { q: 'Cosa significa "tipo di connessione effettiva"?', a: 'Il tipo di connessione effettiva (4G, 3G, 2G) è la classificazione del browser basata sulla latenza e throughput osservati. Anche su Wi-Fi potresti vedere "3G" se le condizioni di rete sono scarse.' },
        { q: 'Perché viene mostrato il mio indirizzo IP?', a: 'L\'indirizzo IP pubblico viene recuperato da un\'API terza (ipify.org) per mostrare la tua identità di rete. È l\'IP che i siti web vedono quando ti connetti. Non rivela la posizione fisica precisa.' },
        { q: 'I miei dati di test vengono memorizzati da qualche parte?', a: 'Tutti i risultati sono salvati esclusivamente nel localStorage del browser. Nessun dato viene inviato ai nostri server. Puoi cancellare la cronologia in qualsiasi momento.' },
        { q: 'Perché la Network Information API mostra "non supportata"?', a: 'La Network Information API è supportata solo nei browser basati su Chromium (Chrome, Edge, Opera). Firefox e Safari non la supportano. Nei browser non supportati puoi comunque usare il test di latenza e il rilevamento IP.' },
      ],
    },
    es: {
      title: 'Test de Velocidad de Internet e Info de Conexión: Verifica el Rendimiento de tu Red',
      paragraphs: [
        'Comprender tu conexión a internet es crucial para solucionar problemas de sitios lentos, videos en buffering y lag en juegos online. Nuestra herramienta proporciona una visión completa de tu conexión utilizando la API de Información de Red del navegador, mediciones de latencia en tiempo real y detección de dirección IP.',
        'La herramienta muestra el tipo de conexión efectiva (4G, 3G, 2G), la velocidad de downlink estimada en Mbps, el tiempo de ida/vuelta (RTT) y si el modo de ahorro de datos está activado.',
        'Además de los datos de la API, la herramienta realiza un test de latencia real cronometrando múltiples solicitudes HTTP para medir el tiempo de respuesta real.',
        'Tu dirección IP se obtiene mediante una llamada API segura y el indicador visual de velocidad proporciona una representación intuitiva de la calidad de tu conexión. Todos los resultados se guardan localmente en tu navegador.',
      ],
      faq: [
        { q: '¿Qué tan preciso es este test de velocidad?', a: 'La herramienta usa la API de Información de Red del navegador para estimaciones de downlink y RTT. El test de latencia mide el tiempo real de ida/vuelta a un servidor externo. Para un test completo de ancho de banda, herramientas dedicadas transfieren archivos grandes.' },
        { q: '¿Qué significa "tipo de conexión efectiva"?', a: 'El tipo de conexión efectiva (4G, 3G, 2G) es la clasificación del navegador basada en la latencia y throughput observados. Incluso en Wi-Fi podrías ver "3G" si las condiciones de red son malas.' },
        { q: '¿Por qué se muestra mi dirección IP?', a: 'Tu dirección IP pública se obtiene de una API externa (ipify.org) para mostrar tu identidad de red. Es la IP que los sitios web ven cuando te conectas.' },
        { q: '¿Se almacenan mis datos de test en algún lugar?', a: 'Todos los resultados se almacenan exclusivamente en el localStorage del navegador. Ningún dato se envía a nuestros servidores. Puedes borrar el historial en cualquier momento.' },
        { q: '¿Por qué la API de Información de Red muestra "no soportada"?', a: 'La API de Información de Red solo es compatible con navegadores basados en Chromium (Chrome, Edge, Opera). Firefox y Safari no la soportan. En navegadores no compatibles aún puedes usar el test de latencia y la detección de IP.' },
      ],
    },
    fr: {
      title: 'Test de Vitesse Internet et Infos Connexion : Vérifiez les Performances de Votre Réseau',
      paragraphs: [
        'Comprendre votre connexion internet est essentiel pour résoudre les problèmes de sites lents, de vidéos en mise en mémoire tampon et de lag dans les jeux en ligne. Notre outil fournit un aperçu complet de votre connexion réseau en utilisant l\'API d\'Information Réseau du navigateur, des mesures de latence en temps réel et la détection d\'adresse IP.',
        'L\'outil affiche le type de connexion effective (4G, 3G, 2G), la vitesse descendante estimée en Mbps, le temps aller-retour (RTT) et si le mode économiseur de données est activé.',
        'En plus des données de l\'API, l\'outil effectue un test de latence réel en chronométrant plusieurs requêtes HTTP pour mesurer le temps de réponse réel.',
        'Votre adresse IP est récupérée via un appel API sécurisé et l\'indicateur visuel de vitesse offre une représentation intuitive de la qualité de votre connexion. Tous les résultats sont sauvegardés localement dans votre navigateur.',
      ],
      faq: [
        { q: 'Quelle est la précision de ce test de vitesse ?', a: 'L\'outil utilise l\'API d\'Information Réseau du navigateur pour les estimations de débit et RTT. Le test de latence mesure le temps réel aller-retour vers un serveur externe. Pour un test complet de bande passante, des outils dédiés transfèrent des fichiers volumineux.' },
        { q: 'Que signifie "type de connexion effective" ?', a: 'Le type de connexion effective (4G, 3G, 2G) est la classification du navigateur basée sur la latence et le débit observés. Même en Wi-Fi, vous pourriez voir "3G" si les conditions réseau sont mauvaises.' },
        { q: 'Pourquoi mon adresse IP est-elle affichée ?', a: 'Votre adresse IP publique est récupérée d\'une API tierce (ipify.org) pour afficher votre identité réseau. C\'est l\'IP que les sites web voient lors de votre connexion.' },
        { q: 'Mes données de test sont-elles stockées quelque part ?', a: 'Tous les résultats sont stockés exclusivement dans le localStorage du navigateur. Aucune donnée n\'est envoyée à nos serveurs. Vous pouvez effacer l\'historique à tout moment.' },
        { q: 'Pourquoi l\'API d\'Information Réseau affiche-t-elle "non supportée" ?', a: 'L\'API d\'Information Réseau n\'est compatible qu\'avec les navigateurs basés sur Chromium (Chrome, Edge, Opera). Firefox et Safari ne la supportent pas. Vous pouvez toujours utiliser le test de latence et la détection IP.' },
      ],
    },
    de: {
      title: 'Internet-Geschwindigkeitstest und Verbindungsinfo: Netzwerkleistung Prüfen',
      paragraphs: [
        'Das Verständnis Ihrer Internetverbindung ist entscheidend für die Fehlerbehebung bei langsamen Websites, puffernden Videos und Verzögerungen in Online-Spielen. Unser Tool bietet einen umfassenden Überblick über Ihre Netzwerkverbindung mithilfe der Network Information API, Echtzeit-Latenzmessungen und IP-Adresserkennung.',
        'Das Tool zeigt Ihren effektiven Verbindungstyp (4G, 3G, 2G), die geschätzte Download-Geschwindigkeit in Mbps, die Paketumlaufzeit (RTT) und ob der Datensparmodus aktiviert ist.',
        'Zusätzlich zu den API-Daten führt das Tool einen echten Latenztest durch, indem es mehrere HTTP-Anfragen zeitlich misst, um die tatsächliche Antwortzeit zu bestimmen.',
        'Ihre IP-Adresse wird über einen sicheren API-Aufruf abgerufen und die visuelle Geschwindigkeitsanzeige bietet eine intuitive Darstellung Ihrer Verbindungsqualität. Alle Ergebnisse werden lokal in Ihrem Browser gespeichert.',
      ],
      faq: [
        { q: 'Wie genau ist dieser Geschwindigkeitstest?', a: 'Das Tool verwendet die Network Information API des Browsers für Downlink- und RTT-Schätzungen. Der Latenztest misst die tatsächliche Umlaufzeit zu einem externen Server. Für einen vollständigen Bandbreitentest übertragen dedizierte Tools große Dateien.' },
        { q: 'Was bedeutet "effektiver Verbindungstyp"?', a: 'Der effektive Verbindungstyp (4G, 3G, 2G) ist die Browser-Klassifizierung basierend auf beobachteter Latenz und Durchsatz. Selbst bei WLAN können Sie "3G" sehen, wenn die Netzwerkbedingungen schlecht sind.' },
        { q: 'Warum wird meine IP-Adresse angezeigt?', a: 'Ihre öffentliche IP-Adresse wird von einer Drittanbieter-API (ipify.org) abgerufen. Es ist die IP-Adresse, die Websites bei Ihrer Verbindung sehen.' },
        { q: 'Werden meine Testdaten irgendwo gespeichert?', a: 'Alle Ergebnisse werden ausschließlich im localStorage Ihres Browsers gespeichert. Keine Daten werden an unsere Server gesendet. Sie können den Verlauf jederzeit löschen.' },
        { q: 'Warum zeigt die Network Information API "nicht unterstützt" an?', a: 'Die Network Information API wird derzeit nur in Chromium-basierten Browsern (Chrome, Edge, Opera) unterstützt. Firefox und Safari unterstützen sie nicht. Sie können trotzdem den Latenztest und die IP-Erkennung nutzen.' },
      ],
    },
    pt: {
      title: 'Teste de Velocidade da Internet e Info de Conexão: Verifique o Desempenho da Rede',
      paragraphs: [
        'Entender sua conexão com a internet é crucial para solucionar problemas com sites lentos, vídeos em buffering e lag em jogos online. Nossa ferramenta fornece uma visão abrangente da sua conexão de rede usando a API de Informações de Rede do navegador, medições de latência em tempo real e detecção de endereço IP.',
        'A ferramenta exibe o tipo de conexão efetiva (4G, 3G, 2G), a velocidade de downlink estimada em Mbps, o tempo de ida/volta (RTT) e se o modo de economia de dados está ativado.',
        'Além dos dados da API, a ferramenta realiza um teste de latência real cronometrando múltiplas requisições HTTP para medir o tempo de resposta real.',
        'Seu endereço IP é obtido via uma chamada API segura e o indicador visual de velocidade fornece uma representação intuitiva da qualidade da conexão. Todos os resultados são salvos localmente no navegador.',
      ],
      faq: [
        { q: 'Quão preciso é este teste de velocidade?', a: 'A ferramenta usa a API de Informações de Rede do navegador para estimativas de downlink e RTT. O teste de latência mede o tempo real de ida/volta a um servidor externo. Para um teste completo de largura de banda, ferramentas dedicadas transferem arquivos grandes.' },
        { q: 'O que significa "tipo de conexão efetiva"?', a: 'O tipo de conexão efetiva (4G, 3G, 2G) é a classificação do navegador baseada na latência e throughput observados. Mesmo em Wi-Fi você pode ver "3G" se as condições de rede forem ruins.' },
        { q: 'Por que meu endereço IP é mostrado?', a: 'Seu endereço IP público é obtido de uma API externa (ipify.org) para mostrar sua identidade de rede. É o IP que os sites veem quando você se conecta.' },
        { q: 'Meus dados de teste são armazenados em algum lugar?', a: 'Todos os resultados são armazenados exclusivamente no localStorage do navegador. Nenhum dado é enviado aos nossos servidores. Você pode limpar o histórico a qualquer momento.' },
        { q: 'Por que a API de Informações de Rede mostra "não suportada"?', a: 'A API de Informações de Rede é compatível apenas com navegadores baseados em Chromium (Chrome, Edge, Opera). Firefox e Safari não a suportam. Você ainda pode usar o teste de latência e a detecção de IP.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="internet-speed-test" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Speed Gauge */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 flex flex-col items-center">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">{t('speedGauge')}</h3>
          <svg width="200" height="120" viewBox="0 0 200 120">
            {/* Background arc */}
            <path
              d="M 10 110 A 80 80 0 0 1 190 110"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={gaugeStroke}
              strokeLinecap="round"
            />
            {/* Filled arc */}
            <path
              d="M 10 110 A 80 80 0 0 1 190 110"
              fill="none"
              stroke={speedColor}
              strokeWidth={gaugeStroke}
              strokeLinecap="round"
              strokeDasharray={`${gaugeCircumference}`}
              strokeDashoffset={gaugeDashOffset}
              style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.8s ease' }}
            />
            {/* Speed value */}
            <text x="100" y="90" textAnchor="middle" className="text-2xl font-bold" fill={speedColor} fontSize="28" fontWeight="bold">
              {dl > 0 ? dl.toFixed(1) : '—'}
            </text>
            <text x="100" y="110" textAnchor="middle" fill="#6b7280" fontSize="12">
              Mbps
            </text>
          </svg>
          <div className="mt-2 text-sm font-medium" style={{ color: speedColor }}>
            {dl > 0 ? getSpeedCategory(dl, lang) : '—'}
          </div>
        </div>

        {/* Run Test Button */}
        <button
          onClick={runTest}
          disabled={testing}
          className={`w-full mb-4 py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
            testing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {testing ? t('running') : t('runTest')}
        </button>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">{t('onlineStatus')}</div>
            <div className={`text-xl font-bold ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
              {isOnline ? t('online') : t('offline')}
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">{t('ipAddress')}</div>
            <div className="text-xl font-bold text-blue-900 truncate">{ipAddress}</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <div className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">{t('latency')}</div>
            <div className="text-xl font-bold text-purple-900">
              {measuredLatency !== null ? `${measuredLatency} ms` : '—'}
            </div>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <div className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">{t('speedCategory')}</div>
            <div className="text-xl font-bold text-indigo-900">
              {dl > 0 ? getSpeedCategory(dl, lang) : '—'}
            </div>
          </div>
        </div>

        {/* Connection Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('connectionDetails')}</h3>
          {!hasNetworkApi && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
              {t('apiNotSupported')}
            </div>
          )}
          <div className="space-y-2">
            {[
              { label: t('connectionType'), value: connectionInfo?.effectiveType?.toUpperCase() || t('na') },
              { label: t('downlink'), value: connectionInfo ? `${connectionInfo.downlink} Mbps` : t('na') },
              { label: t('rtt'), value: connectionInfo ? `${connectionInfo.rtt} ms` : t('na') },
              { label: t('saveData'), value: connectionInfo ? (connectionInfo.saveData ? t('enabled') : t('disabled')) : t('na') },
              { label: t('latency'), value: measuredLatency !== null ? `${measuredLatency} ms` : t('na') },
              { label: t('ipAddress'), value: ipAddress },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">{item.label}</span>
                <span className="font-semibold text-gray-900 text-sm">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Copy Results */}
        <button
          onClick={handleCopy}
          className="w-full mb-6 py-2.5 px-4 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
        >
          {copied ? t('copied') : t('copyResults')}
        </button>

        {/* History */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-700">{t('history')}</h3>
            {history.length > 0 && (
              <button
                onClick={clearHistoryHandler}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                {t('clearHistory')}
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400">{t('noHistory')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-3 font-medium text-gray-500">{t('date')}</th>
                    <th className="text-left py-2 pr-3 font-medium text-gray-500">{t('downlink')}</th>
                    <th className="text-left py-2 pr-3 font-medium text-gray-500">{t('latency')}</th>
                    <th className="text-right py-2 font-medium text-gray-500">{t('speedCategory')}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 pr-3 text-gray-600 text-xs">{entry.date}</td>
                      <td className="py-2 pr-3 text-gray-700">{entry.downlink} Mbps</td>
                      <td className="py-2 pr-3 text-gray-700">{entry.latency} ms</td>
                      <td className="py-2 text-right font-medium" style={{ color: getSpeedColor(entry.downlink) }}>
                        {entry.speedCategory}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
