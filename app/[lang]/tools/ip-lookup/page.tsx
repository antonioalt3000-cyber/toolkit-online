'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface IpInfo {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  timezone?: string;
  postal?: string;
}

export default function IpLookup() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['ip-lookup'][lang];

  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const labels = {
    yourIp: { en: 'Your IP Address', it: 'Il Tuo Indirizzo IP', es: 'Tu Dirección IP', fr: 'Votre Adresse IP', de: 'Ihre IP-Adresse', pt: 'Seu Endereço IP' },
    city: { en: 'City', it: 'Città', es: 'Ciudad', fr: 'Ville', de: 'Stadt', pt: 'Cidade' },
    region: { en: 'Region', it: 'Regione', es: 'Región', fr: 'Région', de: 'Region', pt: 'Região' },
    country: { en: 'Country', it: 'Paese', es: 'País', fr: 'Pays', de: 'Land', pt: 'País' },
    location: { en: 'Coordinates', it: 'Coordinate', es: 'Coordenadas', fr: 'Coordonnées', de: 'Koordinaten', pt: 'Coordenadas' },
    isp: { en: 'ISP / Organization', it: 'ISP / Organizzazione', es: 'ISP / Organización', fr: 'FAI / Organisation', de: 'ISP / Organisation', pt: 'ISP / Organização' },
    timezone: { en: 'Timezone', it: 'Fuso Orario', es: 'Zona Horaria', fr: 'Fuseau Horaire', de: 'Zeitzone', pt: 'Fuso Horário' },
    postalCode: { en: 'Postal Code', it: 'CAP', es: 'Código Postal', fr: 'Code Postal', de: 'Postleitzahl', pt: 'CEP' },
    loading: { en: 'Detecting your IP address...', it: 'Rilevamento indirizzo IP...', es: 'Detectando tu dirección IP...', fr: 'Détection de votre adresse IP...', de: 'IP-Adresse wird erkannt...', pt: 'Detectando seu endereço IP...' },
    errorMsg: { en: 'Could not detect IP address. Please try again.', it: 'Impossibile rilevare l\'indirizzo IP. Riprova.', es: 'No se pudo detectar la dirección IP. Inténtalo de nuevo.', fr: 'Impossible de détecter l\'adresse IP. Réessayez.', de: 'IP-Adresse konnte nicht erkannt werden. Versuchen Sie es erneut.', pt: 'Não foi possível detectar o endereço IP. Tente novamente.' },
    retry: { en: 'Retry', it: 'Riprova', es: 'Reintentar', fr: 'Réessayer', de: 'Erneut versuchen', pt: 'Tentar novamente' },
    copy: { en: 'Copy IP', it: 'Copia IP', es: 'Copiar IP', fr: 'Copier IP', de: 'IP kopieren', pt: 'Copiar IP' },
    copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
    na: { en: 'N/A', it: 'N/D', es: 'N/D', fr: 'N/D', de: 'K.A.', pt: 'N/D' },
    copyAll: { en: 'Copy All Info', it: 'Copia Tutte le Info', es: 'Copiar Toda la Info', fr: 'Copier Toutes les Infos', de: 'Alle Infos Kopieren', pt: 'Copiar Todas as Infos' },
    reset: { en: 'Reset', it: 'Resetta', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
    networkInfo: { en: 'Network Information', it: 'Informazioni di Rete', es: 'Información de Red', fr: 'Informations Réseau', de: 'Netzwerkinformationen', pt: 'Informações de Rede' },
    locationInfo: { en: 'Location Details', it: 'Dettagli Posizione', es: 'Detalles de Ubicación', fr: 'Détails de Localisation', de: 'Standortdetails', pt: 'Detalhes de Localização' },
    refresh: { en: 'Refresh', it: 'Aggiorna', es: 'Actualizar', fr: 'Actualiser', de: 'Aktualisieren', pt: 'Atualizar' },
    lookupBtn: { en: 'Lookup My IP', it: 'Cerca il Mio IP', es: 'Buscar Mi IP', fr: 'Rechercher Mon IP', de: 'Meine IP Suchen', pt: 'Buscar Meu IP' },
    privacyNote: { en: 'This tool will send a request to external services (ipinfo.io) to retrieve your public IP address. No data is stored on our servers.', it: 'Questo strumento invierà una richiesta a servizi esterni (ipinfo.io) per recuperare il tuo indirizzo IP pubblico. Nessun dato viene memorizzato sui nostri server.', es: 'Esta herramienta enviará una solicitud a servicios externos (ipinfo.io) para obtener tu dirección IP pública. No se almacenan datos en nuestros servidores.', fr: 'Cet outil enverra une requête à des services externes (ipinfo.io) pour récupérer votre adresse IP publique. Aucune donnée n\'est stockée sur nos serveurs.', de: 'Dieses Tool sendet eine Anfrage an externe Dienste (ipinfo.io), um Ihre öffentliche IP-Adresse abzurufen. Keine Daten werden auf unseren Servern gespeichert.', pt: 'Esta ferramenta enviará uma solicitação a serviços externos (ipinfo.io) para recuperar seu endereço IP público. Nenhum dado é armazenado em nossos servidores.' },
  } as Record<string, Record<Locale, string>>;

  const fetchIpInfo = async () => {
    setHasStarted(true);
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://ipinfo.io/json?token=');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setIpInfo(data);
    } catch {
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setIpInfo({ ip: data.ip });
      } catch {
        setError(labels.errorMsg[lang]);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyIp = () => {
    if (ipInfo?.ip) {
      navigator.clipboard.writeText(ipInfo.ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyAllInfo = () => {
    if (!ipInfo) return;
    const lines = [
      `IP: ${ipInfo.ip}`,
      ipInfo.city ? `${labels.city[lang]}: ${ipInfo.city}` : null,
      ipInfo.region ? `${labels.region[lang]}: ${ipInfo.region}` : null,
      ipInfo.country ? `${labels.country[lang]}: ${ipInfo.country}` : null,
      ipInfo.postal ? `${labels.postalCode[lang]}: ${ipInfo.postal}` : null,
      ipInfo.loc ? `${labels.location[lang]}: ${ipInfo.loc}` : null,
      ipInfo.timezone ? `${labels.timezone[lang]}: ${ipInfo.timezone}` : null,
      ipInfo.org ? `${labels.isp[lang]}: ${ipInfo.org}` : null,
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(lines);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const resetResults = () => {
    setIpInfo(null);
    setError('');
    setLoading(false);
  };

  const networkRows = ipInfo ? [
    { label: labels.isp[lang], value: ipInfo.org },
  ] : [];

  const locationRows = ipInfo ? [
    { label: labels.city[lang], value: ipInfo.city },
    { label: labels.region[lang], value: ipInfo.region },
    { label: labels.country[lang], value: ipInfo.country },
    { label: labels.postalCode[lang], value: ipInfo.postal },
    { label: labels.location[lang], value: ipInfo.loc },
    { label: labels.timezone[lang], value: ipInfo.timezone },
  ] : [];

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free IP Lookup Tool – Find Your IP Address and Location Online',
      paragraphs: [
        'Every device connected to the internet has an IP (Internet Protocol) address — a unique numerical identifier that enables communication between devices. Knowing your IP address is useful for troubleshooting network issues, configuring firewalls, setting up remote access, or simply understanding how you appear online.',
        'Our free IP lookup tool instantly detects your public IP address and displays associated geolocation information including city, region, country, timezone, and Internet Service Provider (ISP). The detection happens automatically when you visit the page — no buttons to click or forms to fill out.',
        'Your public IP address is different from your local (private) IP address. The public IP is assigned by your ISP and is visible to websites and services you connect to. If you use a VPN, the tool will show the VPN server\'s IP address instead, which is a good way to verify that your VPN is working correctly.',
        'All data is fetched from public IP geolocation services and displayed in your browser. No personal information is stored or tracked by our tool. The geolocation data is approximate and typically accurate to the city level, not to a specific street address.',
      ],
      faq: [
        { q: 'What is an IP address?', a: 'An IP address (Internet Protocol address) is a numerical label assigned to every device connected to a computer network. It serves two main purposes: identifying the host or network interface, and providing the location of the host in the network for routing purposes.' },
        { q: 'What is the difference between IPv4 and IPv6?', a: 'IPv4 addresses are 32-bit numbers written as four decimal octets (e.g., 192.168.1.1), providing about 4.3 billion unique addresses. IPv6 addresses are 128-bit numbers written in hexadecimal (e.g., 2001:0db8::1), providing virtually unlimited addresses to accommodate the growing number of internet-connected devices.' },
        { q: 'Can someone find my exact location from my IP address?', a: 'No. IP geolocation is approximate and typically identifies your city or metropolitan area, not your exact street address. The accuracy depends on your ISP and how they allocate IP addresses. For precise location, separate GPS or device-level permissions would be required.' },
        { q: 'Why does the tool show a different location when I use a VPN?', a: 'A VPN routes your internet traffic through a server in another location, making websites see the VPN server\'s IP address instead of yours. The tool correctly displays the VPN server\'s location, which is a useful way to verify your VPN is active and functioning.' },
        { q: 'Is my IP address static or dynamic?', a: 'Most residential internet connections use dynamic IP addresses, which change periodically (usually when your router reconnects). Businesses often use static IP addresses that remain constant. You can check by visiting this tool on different days to see if your IP changes.' },
      ],
    },
    it: {
      title: 'Strumento IP Lookup Gratuito – Trova il Tuo Indirizzo IP e Posizione Online',
      paragraphs: [
        'Ogni dispositivo connesso a internet ha un indirizzo IP — un identificatore numerico unico che permette la comunicazione tra dispositivi. Conoscere il proprio indirizzo IP è utile per risolvere problemi di rete, configurare firewall o verificare il funzionamento di una VPN.',
        'Il nostro strumento gratuito rileva istantaneamente il tuo indirizzo IP pubblico e mostra informazioni di geolocalizzazione associate, tra cui città, regione, paese, fuso orario e provider internet (ISP). Il rilevamento avviene automaticamente quando visiti la pagina.',
        'Il tuo indirizzo IP pubblico è diverso dal tuo IP locale (privato). L\'IP pubblico è assegnato dal tuo ISP ed è visibile ai siti web che visiti. Se usi una VPN, lo strumento mostrerà l\'IP del server VPN.',
        'Tutti i dati vengono recuperati da servizi pubblici di geolocalizzazione IP e mostrati nel tuo browser. Nessuna informazione personale viene memorizzata dal nostro strumento.',
      ],
      faq: [
        { q: 'Cos\'è un indirizzo IP?', a: 'Un indirizzo IP è un\'etichetta numerica assegnata a ogni dispositivo connesso a una rete. Serve per identificare il dispositivo e instradare il traffico di rete.' },
        { q: 'Qual è la differenza tra IPv4 e IPv6?', a: 'IPv4 usa indirizzi a 32 bit (es. 192.168.1.1) con circa 4,3 miliardi di indirizzi. IPv6 usa 128 bit (es. 2001:0db8::1) con indirizzi praticamente illimitati.' },
        { q: 'Qualcuno può trovare la mia posizione esatta dal mio IP?', a: 'No. La geolocalizzazione IP è approssimativa e tipicamente identifica la tua città, non l\'indirizzo esatto. Per la posizione precisa servirebbero permessi GPS.' },
        { q: 'Perché con la VPN la posizione è diversa?', a: 'Una VPN instrada il traffico attraverso un server in un\'altra località, mostrando l\'IP del server VPN. Questo è utile per verificare che la VPN funzioni correttamente.' },
        { q: 'Il mio IP è statico o dinamico?', a: 'La maggior parte delle connessioni residenziali usa IP dinamici che cambiano periodicamente. Le aziende spesso usano IP statici. Puoi verificare visitando questo strumento in giorni diversi.' },
      ],
    },
    es: {
      title: 'Herramienta de Búsqueda de IP Gratis – Encuentra Tu Dirección IP y Ubicación',
      paragraphs: [
        'Cada dispositivo conectado a internet tiene una dirección IP — un identificador numérico único que permite la comunicación entre dispositivos. Conocer tu dirección IP es útil para solucionar problemas de red, configurar firewalls o verificar una VPN.',
        'Nuestra herramienta gratuita detecta instantáneamente tu dirección IP pública y muestra información de geolocalización incluyendo ciudad, región, país, zona horaria y proveedor de internet (ISP).',
        'Tu dirección IP pública es diferente de tu IP local (privada). La IP pública es asignada por tu ISP y es visible para los sitios web. Si usas VPN, la herramienta mostrará la IP del servidor VPN.',
        'Todos los datos se obtienen de servicios públicos de geolocalización IP. Ninguna información personal es almacenada por nuestra herramienta.',
      ],
      faq: [
        { q: '¿Qué es una dirección IP?', a: 'Una dirección IP es una etiqueta numérica asignada a cada dispositivo conectado a una red. Sirve para identificar el dispositivo y enrutar el tráfico de red.' },
        { q: '¿Cuál es la diferencia entre IPv4 e IPv6?', a: 'IPv4 usa direcciones de 32 bits (ej. 192.168.1.1) con unos 4.300 millones de direcciones. IPv6 usa 128 bits con direcciones prácticamente ilimitadas.' },
        { q: '¿Alguien puede encontrar mi ubicación exacta con mi IP?', a: 'No. La geolocalización IP es aproximada e identifica tu ciudad, no tu dirección exacta. Para ubicación precisa se necesitarían permisos GPS.' },
        { q: '¿Por qué con VPN la ubicación es diferente?', a: 'Una VPN enruta el tráfico a través de un servidor en otra ubicación, mostrando la IP del servidor VPN en lugar de la tuya.' },
      ],
    },
    fr: {
      title: 'Outil de Recherche IP Gratuit – Trouvez Votre Adresse IP et Localisation',
      paragraphs: [
        'Chaque appareil connecté à internet a une adresse IP — un identifiant numérique unique qui permet la communication entre appareils. Connaître votre adresse IP est utile pour résoudre des problèmes réseau, configurer des pare-feu ou vérifier votre VPN.',
        'Notre outil gratuit détecte instantanément votre adresse IP publique et affiche les informations de géolocalisation associées, incluant ville, région, pays, fuseau horaire et fournisseur d\'accès internet (FAI).',
        'Votre adresse IP publique est différente de votre IP locale (privée). L\'IP publique est attribuée par votre FAI et visible par les sites web. Si vous utilisez un VPN, l\'outil affichera l\'IP du serveur VPN.',
        'Toutes les données proviennent de services publics de géolocalisation IP. Aucune information personnelle n\'est stockée par notre outil.',
      ],
      faq: [
        { q: 'Qu\'est-ce qu\'une adresse IP ?', a: 'Une adresse IP est un label numérique attribué à chaque appareil connecté à un réseau. Elle sert à identifier l\'appareil et à router le trafic réseau.' },
        { q: 'Quelle différence entre IPv4 et IPv6 ?', a: 'IPv4 utilise des adresses 32 bits (ex. 192.168.1.1) avec environ 4,3 milliards d\'adresses. IPv6 utilise 128 bits avec des adresses pratiquement illimitées.' },
        { q: 'Quelqu\'un peut-il trouver ma position exacte avec mon IP ?', a: 'Non. La géolocalisation IP est approximative et identifie généralement votre ville, pas votre adresse exacte.' },
        { q: 'Pourquoi la localisation est différente avec un VPN ?', a: 'Un VPN route votre trafic via un serveur distant, affichant l\'IP de ce serveur au lieu de la vôtre.' },
      ],
    },
    de: {
      title: 'Kostenloses IP-Lookup-Tool – Finden Sie Ihre IP-Adresse und Standort Online',
      paragraphs: [
        'Jedes mit dem Internet verbundene Gerät hat eine IP-Adresse — eine eindeutige numerische Kennung, die Kommunikation zwischen Geräten ermöglicht. Ihre IP-Adresse zu kennen ist nützlich für Netzwerk-Fehlerbehebung, Firewall-Konfiguration oder VPN-Überprüfung.',
        'Unser kostenloses Tool erkennt sofort Ihre öffentliche IP-Adresse und zeigt zugehörige Geolokalisierungsinformationen an, einschließlich Stadt, Region, Land, Zeitzone und Internetanbieter (ISP).',
        'Ihre öffentliche IP-Adresse unterscheidet sich von Ihrer lokalen (privaten) IP. Die öffentliche IP wird von Ihrem ISP zugewiesen und ist für Websites sichtbar. Bei VPN-Nutzung zeigt das Tool die IP des VPN-Servers.',
        'Alle Daten stammen von öffentlichen IP-Geolokalisierungsdiensten. Keine persönlichen Informationen werden von unserem Tool gespeichert.',
      ],
      faq: [
        { q: 'Was ist eine IP-Adresse?', a: 'Eine IP-Adresse ist eine numerische Kennung, die jedem mit einem Netzwerk verbundenen Gerät zugewiesen wird. Sie dient zur Geräteidentifikation und Verkehrsrouting.' },
        { q: 'Was ist der Unterschied zwischen IPv4 und IPv6?', a: 'IPv4 verwendet 32-Bit-Adressen (z.B. 192.168.1.1) mit ca. 4,3 Milliarden Adressen. IPv6 verwendet 128 Bit mit praktisch unbegrenzten Adressen.' },
        { q: 'Kann jemand meinen genauen Standort über meine IP finden?', a: 'Nein. IP-Geolokalisierung ist ungefähr und identifiziert typischerweise Ihre Stadt, nicht Ihre genaue Adresse.' },
        { q: 'Warum zeigt das Tool mit VPN einen anderen Standort?', a: 'Ein VPN leitet Ihren Datenverkehr über einen Server an einem anderen Standort, sodass die IP des VPN-Servers angezeigt wird.' },
      ],
    },
    pt: {
      title: 'Ferramenta de Busca de IP Grátis – Encontre Seu Endereço IP e Localização',
      paragraphs: [
        'Cada dispositivo conectado à internet tem um endereço IP — um identificador numérico único que permite a comunicação entre dispositivos. Conhecer seu endereço IP é útil para solucionar problemas de rede, configurar firewalls ou verificar sua VPN.',
        'Nossa ferramenta gratuita detecta instantaneamente seu endereço IP público e exibe informações de geolocalização incluindo cidade, região, país, fuso horário e provedor de internet (ISP).',
        'Seu endereço IP público é diferente do seu IP local (privado). O IP público é atribuído pelo seu ISP e é visível para os sites que você visita. Se usar VPN, a ferramenta mostrará o IP do servidor VPN.',
        'Todos os dados vêm de serviços públicos de geolocalização IP. Nenhuma informação pessoal é armazenada pela nossa ferramenta.',
      ],
      faq: [
        { q: 'O que é um endereço IP?', a: 'Um endereço IP é um rótulo numérico atribuído a cada dispositivo conectado a uma rede. Serve para identificar o dispositivo e rotear o tráfego de rede.' },
        { q: 'Qual a diferença entre IPv4 e IPv6?', a: 'IPv4 usa endereços de 32 bits (ex. 192.168.1.1) com cerca de 4,3 bilhões de endereços. IPv6 usa 128 bits com endereços praticamente ilimitados.' },
        { q: 'Alguém pode encontrar minha localização exata pelo meu IP?', a: 'Não. A geolocalização IP é aproximada e identifica sua cidade, não seu endereço exato.' },
        { q: 'Por que com VPN a localização é diferente?', a: 'Uma VPN roteia seu tráfego através de um servidor em outro local, mostrando o IP do servidor VPN em vez do seu.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="ip-lookup" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {!hasStarted && !loading && (
            <div className="text-center py-8 space-y-4">
              <p className="text-sm text-gray-500 max-w-md mx-auto">{labels.privacyNote[lang]}</p>
              <button
                onClick={fetchIpInfo}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {labels.lookupBtn[lang]}
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
              <p className="text-gray-500">{labels.loading[lang]}</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-3">{error}</p>
              <button onClick={fetchIpInfo} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                {labels.retry[lang]}
              </button>
            </div>
          )}

          {ipInfo && !loading && (
            <>
              {/* IP Address Card */}
              <div className="p-5 rounded-lg bg-blue-50 text-center">
                <div className="text-sm text-gray-500 mb-1">{labels.yourIp[lang]}</div>
                <div className="text-3xl font-bold text-blue-700 font-mono">{ipInfo.ip}</div>
                <button
                  onClick={copyIp}
                  className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {copied ? labels.copied[lang] : labels.copy[lang]}
                </button>
              </div>

              {/* Result Cards Grid */}
              <div className="grid grid-cols-2 gap-3">
                {ipInfo.city && (
                  <div className="p-4 rounded-lg bg-green-50">
                    <div className="text-xs text-gray-500 mb-1">{labels.city[lang]}</div>
                    <div className="text-lg font-bold text-green-700">{ipInfo.city}</div>
                  </div>
                )}
                {ipInfo.country && (
                  <div className="p-4 rounded-lg bg-purple-50">
                    <div className="text-xs text-gray-500 mb-1">{labels.country[lang]}</div>
                    <div className="text-lg font-bold text-purple-700">{ipInfo.country}</div>
                  </div>
                )}
                {ipInfo.region && (
                  <div className="p-4 rounded-lg bg-orange-50">
                    <div className="text-xs text-gray-500 mb-1">{labels.region[lang]}</div>
                    <div className="text-lg font-bold text-orange-700">{ipInfo.region}</div>
                  </div>
                )}
                {ipInfo.timezone && (
                  <div className="p-4 rounded-lg bg-yellow-50">
                    <div className="text-xs text-gray-500 mb-1">{labels.timezone[lang]}</div>
                    <div className="text-lg font-bold text-yellow-700">{ipInfo.timezone}</div>
                  </div>
                )}
              </div>

              {/* Network Information Section */}
              {ipInfo.org && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{labels.networkInfo[lang]}</h3>
                  <div className="p-4 rounded-lg bg-indigo-50">
                    <div className="text-xs text-gray-500 mb-1">{labels.isp[lang]}</div>
                    <div className="text-sm font-medium text-indigo-700">{ipInfo.org}</div>
                  </div>
                </div>
              )}

              {/* Location Details Section */}
              {locationRows.some(r => r.value) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{labels.locationInfo[lang]}</h3>
                  <div className="space-y-2">
                    {locationRows.map((row, i) => row.value ? (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">{row.label}</span>
                        <span className="text-sm font-medium text-gray-900">{row.value}</span>
                      </div>
                    ) : null)}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={copyAllInfo}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  {copiedAll ? labels.copied[lang] : labels.copyAll[lang]}
                </button>
                <button
                  onClick={fetchIpInfo}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  {labels.refresh[lang]}
                </button>
                <button
                  onClick={resetResults}
                  className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  {labels.reset[lang]}
                </button>
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
