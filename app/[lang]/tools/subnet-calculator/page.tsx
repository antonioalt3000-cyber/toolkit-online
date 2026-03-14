'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  ipAddress: { en: 'IP Address', it: 'Indirizzo IP', es: 'Dirección IP', fr: 'Adresse IP', de: 'IP-Adresse', pt: 'Endereço IP' },
  subnetMask: { en: 'Subnet Mask (CIDR or Dotted)', it: 'Maschera di Sottorete (CIDR o Decimale)', es: 'Máscara de Subred (CIDR o Decimal)', fr: 'Masque de Sous-réseau (CIDR ou Décimal)', de: 'Subnetzmaske (CIDR oder Dezimal)', pt: 'Máscara de Sub-rede (CIDR ou Decimal)' },
  calculate: { en: 'Calculate', it: 'Calcola', es: 'Calcular', fr: 'Calculer', de: 'Berechnen', pt: 'Calcular' },
  reset: { en: 'Reset', it: 'Ripristina', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  results: { en: 'Results', it: 'Risultati', es: 'Resultados', fr: 'Résultats', de: 'Ergebnisse', pt: 'Resultados' },
  networkAddress: { en: 'Network Address', it: 'Indirizzo di Rete', es: 'Dirección de Red', fr: 'Adresse Réseau', de: 'Netzwerkadresse', pt: 'Endereço de Rede' },
  broadcastAddress: { en: 'Broadcast Address', it: 'Indirizzo di Broadcast', es: 'Dirección de Broadcast', fr: 'Adresse de Diffusion', de: 'Broadcast-Adresse', pt: 'Endereço de Broadcast' },
  firstHost: { en: 'First Usable Host', it: 'Primo Host Utilizzabile', es: 'Primer Host Utilizable', fr: 'Premier Hôte Utilisable', de: 'Erster nutzbarer Host', pt: 'Primeiro Host Utilizável' },
  lastHost: { en: 'Last Usable Host', it: 'Ultimo Host Utilizzabile', es: 'Último Host Utilizable', fr: 'Dernier Hôte Utilisable', de: 'Letzter nutzbarer Host', pt: 'Último Host Utilizável' },
  usableHosts: { en: 'Usable Hosts', it: 'Host Utilizzabili', es: 'Hosts Utilizables', fr: 'Hôtes Utilisables', de: 'Nutzbare Hosts', pt: 'Hosts Utilizáveis' },
  subnetMaskLabel: { en: 'Subnet Mask', it: 'Maschera di Sottorete', es: 'Máscara de Subred', fr: 'Masque de Sous-réseau', de: 'Subnetzmaske', pt: 'Máscara de Sub-rede' },
  wildcardMask: { en: 'Wildcard Mask', it: 'Maschera Wildcard', es: 'Máscara Wildcard', fr: 'Masque Wildcard', de: 'Wildcard-Maske', pt: 'Máscara Wildcard' },
  ipClass: { en: 'IP Class', it: 'Classe IP', es: 'Clase IP', fr: 'Classe IP', de: 'IP-Klasse', pt: 'Classe IP' },
  binaryMask: { en: 'Binary Subnet Mask', it: 'Maschera Binaria', es: 'Máscara Binaria', fr: 'Masque Binaire', de: 'Binäre Subnetzmaske', pt: 'Máscara Binária' },
  cidrNotation: { en: 'CIDR Notation', it: 'Notazione CIDR', es: 'Notación CIDR', fr: 'Notation CIDR', de: 'CIDR-Notation', pt: 'Notação CIDR' },
  quickSelect: { en: 'Quick Select CIDR', it: 'Selezione Rapida CIDR', es: 'Selección Rápida CIDR', fr: 'Sélection Rapide CIDR', de: 'Schnellauswahl CIDR', pt: 'Seleção Rápida CIDR' },
  copy: { en: 'Copy Results', it: 'Copia Risultati', es: 'Copiar Resultados', fr: 'Copier Résultats', de: 'Ergebnisse Kopieren', pt: 'Copiar Resultados' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
  clearHistory: { en: 'Clear History', it: 'Cancella Cronologia', es: 'Borrar Historial', fr: 'Effacer l\'Historique', de: 'Verlauf Löschen', pt: 'Limpar Histórico' },
  invalidIp: { en: 'Please enter a valid IPv4 address (e.g., 192.168.1.0)', it: 'Inserisci un indirizzo IPv4 valido (es. 192.168.1.0)', es: 'Ingresa una dirección IPv4 válida (ej. 192.168.1.0)', fr: 'Entrez une adresse IPv4 valide (ex. 192.168.1.0)', de: 'Geben Sie eine gültige IPv4-Adresse ein (z.B. 192.168.1.0)', pt: 'Insira um endereço IPv4 válido (ex. 192.168.1.0)' },
  invalidMask: { en: 'Please enter a valid subnet mask (CIDR /0-/32 or dotted decimal)', it: 'Inserisci una maschera valida (CIDR /0-/32 o decimale)', es: 'Ingresa una máscara válida (CIDR /0-/32 o decimal)', fr: 'Entrez un masque valide (CIDR /0-/32 ou décimal)', de: 'Geben Sie eine gültige Maske ein (CIDR /0-/32 oder Dezimal)', pt: 'Insira uma máscara válida (CIDR /0-/32 ou decimal)' },
  ipPlaceholder: { en: 'e.g., 192.168.1.0', it: 'es. 192.168.1.0', es: 'ej. 192.168.1.0', fr: 'ex. 192.168.1.0', de: 'z.B. 192.168.1.0', pt: 'ex. 192.168.1.0' },
  maskPlaceholder: { en: 'e.g., /24 or 255.255.255.0', it: 'es. /24 o 255.255.255.0', es: 'ej. /24 o 255.255.255.0', fr: 'ex. /24 ou 255.255.255.0', de: 'z.B. /24 oder 255.255.255.0', pt: 'ex. /24 ou 255.255.255.0' },
  totalAddresses: { en: 'Total Addresses', it: 'Indirizzi Totali', es: 'Direcciones Totales', fr: 'Adresses Totales', de: 'Gesamte Adressen', pt: 'Endereços Totais' },
};

interface SubnetResult {
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  usableHosts: number;
  totalAddresses: number;
  subnetMask: string;
  wildcardMask: string;
  ipClass: string;
  binaryMask: string;
  cidr: number;
}

interface HistoryEntry {
  ip: string;
  cidr: number;
  result: SubnetResult;
}

function isValidIp(ip: string): boolean {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return false;
  return parts.every(p => {
    const n = parseInt(p, 10);
    return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p.trim();
  });
}

function parseMask(mask: string): number | null {
  const trimmed = mask.trim();
  // CIDR notation: /24 or just 24
  const cidrMatch = trimmed.match(/^\/?(\d+)$/);
  if (cidrMatch) {
    const cidr = parseInt(cidrMatch[1], 10);
    if (cidr >= 0 && cidr <= 32) return cidr;
    return null;
  }
  // Dotted decimal: 255.255.255.0
  if (isValidIp(trimmed)) {
    const parts = trimmed.split('.').map(p => parseInt(p, 10));
    let binary = '';
    for (const part of parts) {
      binary += part.toString(2).padStart(8, '0');
    }
    // Validate it's a valid subnet mask (contiguous 1s followed by 0s)
    const firstZero = binary.indexOf('0');
    if (firstZero === -1) return 32;
    const afterZero = binary.slice(firstZero);
    if (afterZero.includes('1')) return null; // not a valid mask
    return firstZero;
  }
  return null;
}

function ipToInt(ip: string): number {
  const parts = ip.trim().split('.').map(p => parseInt(p, 10));
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function intToIp(int: number): string {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255,
  ].join('.');
}

function getIpClass(firstOctet: number): string {
  if (firstOctet < 128) return 'A';
  if (firstOctet < 192) return 'B';
  if (firstOctet < 224) return 'C';
  if (firstOctet < 240) return 'D (Multicast)';
  return 'E (Reserved)';
}

function calculateSubnet(ip: string, cidr: number): SubnetResult {
  const ipInt = ipToInt(ip);
  const maskInt = cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0;
  const wildcardInt = (~maskInt) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | wildcardInt) >>> 0;
  const totalAddresses = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : totalAddresses - 2;

  const firstHostInt = cidr >= 31 ? networkInt : (networkInt + 1) >>> 0;
  const lastHostInt = cidr >= 31 ? broadcastInt : (broadcastInt - 1) >>> 0;

  const maskOctets = [
    (maskInt >>> 24) & 255,
    (maskInt >>> 16) & 255,
    (maskInt >>> 8) & 255,
    maskInt & 255,
  ];
  const binaryMask = maskOctets.map(o => o.toString(2).padStart(8, '0')).join('.');

  const firstOctet = parseInt(ip.trim().split('.')[0], 10);

  return {
    networkAddress: intToIp(networkInt),
    broadcastAddress: intToIp(broadcastInt),
    firstHost: intToIp(firstHostInt),
    lastHost: intToIp(lastHostInt),
    usableHosts,
    totalAddresses,
    subnetMask: intToIp(maskInt),
    wildcardMask: intToIp(wildcardInt),
    ipClass: getIpClass(firstOctet),
    binaryMask,
    cidr,
  };
}

const QUICK_CIDRS = [
  { cidr: 8, label: '/8', desc: '16M hosts' },
  { cidr: 16, label: '/16', desc: '65K hosts' },
  { cidr: 24, label: '/24', desc: '254 hosts' },
  { cidr: 28, label: '/28', desc: '14 hosts' },
  { cidr: 30, label: '/30', desc: '2 hosts' },
];

export default function SubnetCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['subnet-calculator'][lang];

  const [ip, setIp] = useState('192.168.1.0');
  const [mask, setMask] = useState('/24');
  const [result, setResult] = useState<SubnetResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCalculate = () => {
    setError('');
    if (!isValidIp(ip)) {
      setError(labels.invalidIp[lang]);
      return;
    }
    const cidr = parseMask(mask);
    if (cidr === null) {
      setError(labels.invalidMask[lang]);
      return;
    }
    const res = calculateSubnet(ip, cidr);
    setResult(res);
    setHistory(prev => {
      const next = [{ ip: ip.trim(), cidr, result: res }, ...prev];
      return next.slice(0, 10);
    });
  };

  const handleQuickCidr = (cidr: number) => {
    setMask(`/${cidr}`);
    if (isValidIp(ip)) {
      const res = calculateSubnet(ip, cidr);
      setResult(res);
      setError('');
      setHistory(prev => {
        const next = [{ ip: ip.trim(), cidr, result: res }, ...prev];
        return next.slice(0, 10);
      });
    }
  };

  const handleReset = () => {
    setIp('192.168.1.0');
    setMask('/24');
    setResult(null);
    setError('');
  };

  const copyResults = () => {
    if (!result) return;
    const lines = [
      `IP: ${ip}`,
      `CIDR: /${result.cidr}`,
      `${labels.networkAddress[lang]}: ${result.networkAddress}`,
      `${labels.broadcastAddress[lang]}: ${result.broadcastAddress}`,
      `${labels.firstHost[lang]}: ${result.firstHost}`,
      `${labels.lastHost[lang]}: ${result.lastHost}`,
      `${labels.usableHosts[lang]}: ${result.usableHosts.toLocaleString()}`,
      `${labels.totalAddresses[lang]}: ${result.totalAddresses.toLocaleString()}`,
      `${labels.subnetMaskLabel[lang]}: ${result.subnetMask}`,
      `${labels.wildcardMask[lang]}: ${result.wildcardMask}`,
      `${labels.ipClass[lang]}: ${result.ipClass}`,
      `${labels.binaryMask[lang]}: ${result.binaryMask}`,
    ].join('\n');
    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    setIp(entry.ip);
    setMask(`/${entry.cidr}`);
    setResult(entry.result);
    setError('');
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Subnet Calculator – IPv4 Network Address Calculator Online',
      paragraphs: [
        'Subnetting is a fundamental networking concept that allows you to divide a larger network into smaller, more manageable sub-networks. Understanding subnets is essential for network engineers, system administrators, and anyone working with IP addressing. Our free subnet calculator makes it easy to compute all the key details of any IPv4 subnet in seconds, without needing to perform manual binary calculations.',
        'With this tool you can enter any valid IPv4 address along with a subnet mask in CIDR notation (such as /24) or dotted decimal format (such as 255.255.255.0). The calculator instantly determines the network address, broadcast address, first and last usable host addresses, total number of usable hosts, wildcard mask, IP class, and the full binary representation of the subnet mask.',
        'Quick-select buttons for the most commonly used CIDR prefixes — /8, /16, /24, /28, and /30 — let you rapidly switch between subnet sizes. This is particularly useful when planning network architectures or troubleshooting connectivity issues. Each prefix is annotated with its approximate host capacity so you can choose the right size at a glance.',
        'Whether you are studying for a networking certification like CCNA, designing a corporate LAN, or simply trying to understand how IP addressing works, this subnet calculator provides all the information you need in a clean, easy-to-read format. All calculations happen locally in your browser — no data is sent to any server.',
      ],
      faq: [
        { q: 'What is subnetting and why is it important?', a: 'Subnetting is the process of dividing a network into smaller sub-networks (subnets). It improves network performance by reducing broadcast traffic, enhances security by isolating network segments, and allows more efficient use of IP addresses. Organizations use subnetting to organize their networks logically and control traffic flow between departments or services.' },
        { q: 'What does CIDR notation mean?', a: 'CIDR (Classless Inter-Domain Routing) notation uses a slash followed by a number (e.g., /24) to indicate how many bits of the IP address are used for the network portion. A /24 prefix means the first 24 bits identify the network and the remaining 8 bits are available for host addresses, giving 254 usable hosts. The higher the number, the smaller the subnet.' },
        { q: 'How do I choose the right subnet size?', a: 'Count the number of devices that need IP addresses on the subnet, then choose a CIDR prefix that provides enough host addresses with some room for growth. For example, /24 supports 254 hosts, /28 supports 14 hosts, and /30 supports only 2 hosts (commonly used for point-to-point links between routers).' },
        { q: 'What is the difference between the network address and the broadcast address?', a: 'The network address is the first address in a subnet and identifies the subnet itself — it cannot be assigned to a host. The broadcast address is the last address and is used to send data to all hosts on the subnet simultaneously. All addresses between them are available for individual host devices.' },
        { q: 'What is a wildcard mask?', a: 'A wildcard mask is the inverse of a subnet mask. Where the subnet mask has a 1 bit, the wildcard mask has a 0 bit, and vice versa. Wildcard masks are commonly used in access control lists (ACLs) on Cisco routers and in OSPF routing configurations to specify which bits of an address should be matched.' },
      ],
    },
    it: {
      title: 'Calcolatore di Sottorete Gratuito – Calcola Indirizzi di Rete IPv4 Online',
      paragraphs: [
        'Il subnetting e una tecnica di rete fondamentale che permette di dividere una rete piu grande in sotto-reti piu piccole e gestibili. Comprendere le sottoreti e essenziale per ingegneri di rete, amministratori di sistema e chiunque lavori con gli indirizzi IP. Il nostro calcolatore di sottorete gratuito rende semplice calcolare tutti i dettagli chiave di qualsiasi sottorete IPv4 in pochi secondi.',
        'Con questo strumento puoi inserire qualsiasi indirizzo IPv4 valido insieme a una maschera di sottorete in notazione CIDR (come /24) o in formato decimale puntato (come 255.255.255.0). Il calcolatore determina istantaneamente indirizzo di rete, indirizzo di broadcast, primo e ultimo host utilizzabili, numero totale di host, maschera wildcard, classe IP e la rappresentazione binaria completa della maschera.',
        'I pulsanti di selezione rapida per i prefissi CIDR piu comuni — /8, /16, /24, /28 e /30 — ti permettono di passare rapidamente tra diverse dimensioni di sottorete. Questo e particolarmente utile quando si pianificano architetture di rete o si risolvono problemi di connettivita. Ogni prefisso e annotato con la capacita approssimativa di host.',
        'Che tu stia studiando per una certificazione di rete come CCNA, progettando una LAN aziendale o semplicemente cercando di capire come funziona l\'indirizzamento IP, questo calcolatore di sottorete fornisce tutte le informazioni necessarie. Tutti i calcoli avvengono localmente nel tuo browser — nessun dato viene inviato a server esterni.',
      ],
      faq: [
        { q: 'Cos\'e il subnetting e perche e importante?', a: 'Il subnetting e il processo di divisione di una rete in sotto-reti piu piccole. Migliora le prestazioni riducendo il traffico broadcast, aumenta la sicurezza isolando i segmenti di rete e permette un uso piu efficiente degli indirizzi IP. Le organizzazioni usano il subnetting per organizzare logicamente le loro reti.' },
        { q: 'Cosa significa la notazione CIDR?', a: 'La notazione CIDR usa una barra seguita da un numero (es. /24) per indicare quanti bit dell\'indirizzo IP sono usati per la parte di rete. Un prefisso /24 significa che i primi 24 bit identificano la rete e i restanti 8 bit sono disponibili per gli indirizzi host, dando 254 host utilizzabili.' },
        { q: 'Come scelgo la dimensione giusta della sottorete?', a: 'Conta il numero di dispositivi che necessitano di indirizzi IP nella sottorete, poi scegli un prefisso CIDR che fornisca abbastanza indirizzi host con margine di crescita. Ad esempio, /24 supporta 254 host, /28 supporta 14 host e /30 supporta solo 2 host.' },
        { q: 'Qual e la differenza tra indirizzo di rete e indirizzo di broadcast?', a: 'L\'indirizzo di rete e il primo indirizzo in una sottorete e identifica la sottorete stessa — non puo essere assegnato a un host. L\'indirizzo di broadcast e l\'ultimo e viene usato per inviare dati a tutti gli host della sottorete simultaneamente.' },
        { q: 'Cos\'e una maschera wildcard?', a: 'Una maschera wildcard e l\'inverso della maschera di sottorete. Dove la maschera di sottorete ha un bit 1, la wildcard ha un bit 0 e viceversa. Le maschere wildcard sono comunemente usate nelle ACL dei router Cisco e nelle configurazioni OSPF.' },
      ],
    },
    es: {
      title: 'Calculadora de Subredes Gratis – Calcula Direcciones de Red IPv4 Online',
      paragraphs: [
        'La division en subredes es un concepto fundamental de redes que permite dividir una red mas grande en subredes mas pequenas y manejables. Comprender las subredes es esencial para ingenieros de redes, administradores de sistemas y cualquier persona que trabaje con direccionamiento IP. Nuestra calculadora de subredes gratuita facilita el calculo de todos los detalles clave de cualquier subred IPv4 en segundos.',
        'Con esta herramienta puedes ingresar cualquier direccion IPv4 valida junto con una mascara de subred en notacion CIDR (como /24) o formato decimal con puntos (como 255.255.255.0). La calculadora determina instantaneamente la direccion de red, direccion de broadcast, primer y ultimo host utilizable, numero total de hosts, mascara wildcard, clase IP y la representacion binaria completa.',
        'Los botones de seleccion rapida para los prefijos CIDR mas comunes — /8, /16, /24, /28 y /30 — te permiten cambiar rapidamente entre tamanos de subred. Esto es particularmente util al planificar arquitecturas de red o solucionar problemas de conectividad. Cada prefijo esta anotado con su capacidad aproximada de hosts.',
        'Ya sea que estes estudiando para una certificacion de redes como CCNA, disenando una LAN corporativa o simplemente intentando entender como funciona el direccionamiento IP, esta calculadora de subredes proporciona toda la informacion necesaria. Todos los calculos ocurren localmente en tu navegador.',
      ],
      faq: [
        { q: 'Que es la division en subredes y por que es importante?', a: 'La division en subredes es el proceso de dividir una red en subredes mas pequenas. Mejora el rendimiento reduciendo el trafico broadcast, aumenta la seguridad aislando segmentos de red y permite un uso mas eficiente de las direcciones IP.' },
        { q: 'Que significa la notacion CIDR?', a: 'La notacion CIDR usa una barra seguida de un numero (ej. /24) para indicar cuantos bits de la direccion IP se usan para la porcion de red. Un prefijo /24 significa que los primeros 24 bits identifican la red y los 8 bits restantes estan disponibles para direcciones de host.' },
        { q: 'Como elijo el tamano correcto de subred?', a: 'Cuenta el numero de dispositivos que necesitan direcciones IP en la subred, luego elige un prefijo CIDR que proporcione suficientes direcciones de host con margen de crecimiento. Por ejemplo, /24 soporta 254 hosts, /28 soporta 14 y /30 solo 2.' },
        { q: 'Cual es la diferencia entre direccion de red y broadcast?', a: 'La direccion de red es la primera direccion en una subred e identifica la subred misma. La direccion de broadcast es la ultima y se usa para enviar datos a todos los hosts de la subred simultaneamente. Las direcciones entre ambas estan disponibles para dispositivos.' },
      ],
    },
    fr: {
      title: 'Calculateur de Sous-réseau Gratuit – Calculez les Adresses Réseau IPv4 en Ligne',
      paragraphs: [
        'Le sous-réseautage est un concept fondamental des réseaux qui permet de diviser un réseau plus grand en sous-réseaux plus petits et plus faciles a gérer. Comprendre les sous-réseaux est essentiel pour les ingénieurs réseau, les administrateurs systeme et toute personne travaillant avec l\'adressage IP. Notre calculateur gratuit facilite le calcul de tous les détails clés de n\'importe quel sous-réseau IPv4.',
        'Avec cet outil, vous pouvez saisir n\'importe quelle adresse IPv4 valide accompagnée d\'un masque de sous-réseau en notation CIDR (comme /24) ou en format décimal pointé (comme 255.255.255.0). Le calculateur détermine instantanément l\'adresse réseau, l\'adresse de diffusion, le premier et le dernier hôte utilisable, le nombre total d\'hôtes, le masque wildcard, la classe IP et la représentation binaire.',
        'Les boutons de sélection rapide pour les préfixes CIDR les plus courants — /8, /16, /24, /28 et /30 — vous permettent de basculer rapidement entre les tailles de sous-réseau. C\'est particulierement utile lors de la planification d\'architectures réseau ou du dépannage de problemes de connectivité.',
        'Que vous prépariez une certification réseau comme le CCNA, conceviez un LAN d\'entreprise ou cherchiez simplement a comprendre le fonctionnement de l\'adressage IP, ce calculateur fournit toutes les informations nécessaires. Tous les calculs s\'effectuent localement dans votre navigateur.',
      ],
      faq: [
        { q: 'Qu\'est-ce que le sous-réseautage et pourquoi est-il important ?', a: 'Le sous-réseautage est le processus de division d\'un réseau en sous-réseaux plus petits. Il améliore les performances en réduisant le trafic de diffusion, renforce la sécurité en isolant les segments réseau et permet une utilisation plus efficace des adresses IP.' },
        { q: 'Que signifie la notation CIDR ?', a: 'La notation CIDR utilise une barre oblique suivie d\'un nombre (ex. /24) pour indiquer combien de bits de l\'adresse IP sont utilisés pour la partie réseau. Un préfixe /24 signifie que les 24 premiers bits identifient le réseau et les 8 bits restants sont disponibles pour les adresses d\'hôtes.' },
        { q: 'Comment choisir la bonne taille de sous-réseau ?', a: 'Comptez le nombre d\'appareils nécessitant des adresses IP dans le sous-réseau, puis choisissez un préfixe CIDR qui fournit suffisamment d\'adresses avec une marge de croissance. Par exemple, /24 supporte 254 hôtes, /28 en supporte 14 et /30 seulement 2.' },
        { q: 'Quelle est la différence entre adresse réseau et adresse de diffusion ?', a: 'L\'adresse réseau est la premiere adresse d\'un sous-réseau et identifie le sous-réseau lui-même. L\'adresse de diffusion est la derniere et sert a envoyer des données a tous les hôtes du sous-réseau simultanément.' },
      ],
    },
    de: {
      title: 'Kostenloser Subnetz-Rechner – IPv4-Netzwerkadressen Online Berechnen',
      paragraphs: [
        'Subnetting ist ein grundlegendes Netzwerkkonzept, das es ermöglicht, ein grösseres Netzwerk in kleinere, besser verwaltbare Teilnetze aufzuteilen. Das Verständnis von Subnetzen ist für Netzwerkingenieure, Systemadministratoren und alle, die mit IP-Adressierung arbeiten, unerlässlich. Unser kostenloser Subnetz-Rechner macht es einfach, alle wichtigen Details eines IPv4-Subnetzes in Sekunden zu berechnen.',
        'Mit diesem Tool können Sie eine beliebige gültige IPv4-Adresse zusammen mit einer Subnetzmaske in CIDR-Notation (z.B. /24) oder im dezimalen Punkt-Format (z.B. 255.255.255.0) eingeben. Der Rechner bestimmt sofort Netzwerkadresse, Broadcast-Adresse, ersten und letzten nutzbaren Host, Gesamtzahl der nutzbaren Hosts, Wildcard-Maske, IP-Klasse und die vollständige binäre Darstellung.',
        'Schnellauswahl-Schaltflächen für die am häufigsten verwendeten CIDR-Präfixe — /8, /16, /24, /28 und /30 — ermöglichen schnelles Wechseln zwischen Subnetzgrössen. Dies ist besonders nützlich bei der Planung von Netzwerkarchitekturen oder der Fehlersuche bei Verbindungsproblemen. Jedes Präfix ist mit seiner ungefähren Host-Kapazität beschriftet.',
        'Ob Sie für eine Netzwerkzertifizierung wie CCNA lernen, ein Unternehmens-LAN entwerfen oder einfach verstehen möchten, wie IP-Adressierung funktioniert — dieser Subnetz-Rechner liefert alle benötigten Informationen. Alle Berechnungen erfolgen lokal in Ihrem Browser — keine Daten werden an Server gesendet.',
      ],
      faq: [
        { q: 'Was ist Subnetting und warum ist es wichtig?', a: 'Subnetting ist der Prozess der Aufteilung eines Netzwerks in kleinere Teilnetze. Es verbessert die Leistung durch Reduzierung des Broadcast-Verkehrs, erhöht die Sicherheit durch Isolation von Netzwerksegmenten und ermöglicht eine effizientere Nutzung von IP-Adressen.' },
        { q: 'Was bedeutet CIDR-Notation?', a: 'Die CIDR-Notation verwendet einen Schrägstrich gefolgt von einer Zahl (z.B. /24), um anzugeben, wie viele Bits der IP-Adresse für den Netzwerkteil verwendet werden. Ein /24-Präfix bedeutet, dass die ersten 24 Bits das Netzwerk identifizieren und die verbleibenden 8 Bits für Host-Adressen verfügbar sind.' },
        { q: 'Wie wähle ich die richtige Subnetzgrösse?', a: 'Zählen Sie die Anzahl der Geräte, die IP-Adressen im Subnetz benötigen, und wählen Sie dann ein CIDR-Präfix, das genügend Host-Adressen mit Wachstumsspielraum bietet. Zum Beispiel unterstützt /24 254 Hosts, /28 unterstützt 14 und /30 nur 2.' },
        { q: 'Was ist der Unterschied zwischen Netzwerk- und Broadcast-Adresse?', a: 'Die Netzwerkadresse ist die erste Adresse in einem Subnetz und identifiziert das Subnetz selbst. Die Broadcast-Adresse ist die letzte und wird verwendet, um Daten gleichzeitig an alle Hosts im Subnetz zu senden.' },
        { q: 'Was ist eine Wildcard-Maske?', a: 'Eine Wildcard-Maske ist die Umkehrung der Subnetzmaske. Wo die Subnetzmaske ein 1-Bit hat, hat die Wildcard ein 0-Bit und umgekehrt. Wildcard-Masken werden häufig in ACLs auf Cisco-Routern und in OSPF-Konfigurationen verwendet.' },
      ],
    },
    pt: {
      title: 'Calculadora de Sub-rede Grátis – Calcule Endereços de Rede IPv4 Online',
      paragraphs: [
        'A sub-divisao de redes e um conceito fundamental de redes que permite dividir uma rede maior em sub-redes menores e mais gerenciaveis. Compreender sub-redes e essencial para engenheiros de rede, administradores de sistemas e qualquer pessoa que trabalhe com enderecamento IP. Nossa calculadora de sub-rede gratuita facilita o calculo de todos os detalhes importantes de qualquer sub-rede IPv4 em segundos.',
        'Com esta ferramenta voce pode inserir qualquer endereco IPv4 valido junto com uma mascara de sub-rede em notacao CIDR (como /24) ou formato decimal pontilhado (como 255.255.255.0). A calculadora determina instantaneamente o endereco de rede, endereco de broadcast, primeiro e ultimo host utilizavel, numero total de hosts, mascara wildcard, classe IP e a representacao binaria completa.',
        'Botoes de selecao rapida para os prefixos CIDR mais comuns — /8, /16, /24, /28 e /30 — permitem alternar rapidamente entre tamanhos de sub-rede. Isso e particularmente util ao planejar arquiteturas de rede ou solucionar problemas de conectividade. Cada prefixo e anotado com sua capacidade aproximada de hosts.',
        'Seja voce estudando para uma certificacao de rede como CCNA, projetando uma LAN corporativa ou simplesmente tentando entender como funciona o enderecamento IP, esta calculadora de sub-rede fornece todas as informacoes necessarias. Todos os calculos acontecem localmente no seu navegador — nenhum dado e enviado a servidores.',
      ],
      faq: [
        { q: 'O que e sub-divisao de redes e por que e importante?', a: 'A sub-divisao de redes e o processo de dividir uma rede em sub-redes menores. Melhora o desempenho reduzindo o trafego de broadcast, aumenta a seguranca isolando segmentos de rede e permite um uso mais eficiente dos enderecos IP.' },
        { q: 'O que significa notacao CIDR?', a: 'A notacao CIDR usa uma barra seguida de um numero (ex. /24) para indicar quantos bits do endereco IP sao usados para a porcao de rede. Um prefixo /24 significa que os primeiros 24 bits identificam a rede e os 8 bits restantes estao disponiveis para enderecos de host.' },
        { q: 'Como escolho o tamanho correto da sub-rede?', a: 'Conte o numero de dispositivos que precisam de enderecos IP na sub-rede, depois escolha um prefixo CIDR que forneca enderecos suficientes com margem de crescimento. Por exemplo, /24 suporta 254 hosts, /28 suporta 14 e /30 apenas 2.' },
        { q: 'Qual a diferenca entre endereco de rede e endereco de broadcast?', a: 'O endereco de rede e o primeiro endereco em uma sub-rede e identifica a sub-rede em si. O endereco de broadcast e o ultimo e e usado para enviar dados a todos os hosts da sub-rede simultaneamente. Os enderecos entre eles estao disponiveis para dispositivos.' },
      ],
    },
  };

  const seo = seoContent[lang];

  const resultRows = result ? [
    { label: labels.networkAddress[lang], value: result.networkAddress, color: 'text-blue-700' },
    { label: labels.broadcastAddress[lang], value: result.broadcastAddress, color: 'text-purple-700' },
    { label: labels.firstHost[lang], value: result.firstHost, color: 'text-green-700' },
    { label: labels.lastHost[lang], value: result.lastHost, color: 'text-green-700' },
    { label: labels.usableHosts[lang], value: result.usableHosts.toLocaleString(), color: 'text-orange-700' },
    { label: labels.totalAddresses[lang], value: result.totalAddresses.toLocaleString(), color: 'text-orange-700' },
    { label: labels.subnetMaskLabel[lang], value: result.subnetMask, color: 'text-gray-900' },
    { label: labels.wildcardMask[lang], value: result.wildcardMask, color: 'text-gray-900' },
    { label: labels.ipClass[lang], value: result.ipClass, color: 'text-indigo-700' },
    { label: labels.cidrNotation[lang], value: `/${result.cidr}`, color: 'text-indigo-700' },
  ] : [];

  return (
    <ToolPageWrapper toolSlug="subnet-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {/* IP Address Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.ipAddress[lang]}</label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder={labels.ipPlaceholder[lang]}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
            />
          </div>

          {/* Subnet Mask Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.subnetMask[lang]}</label>
            <input
              type="text"
              value={mask}
              onChange={(e) => setMask(e.target.value)}
              placeholder={labels.maskPlaceholder[lang]}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
            />
          </div>

          {/* Quick CIDR Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{labels.quickSelect[lang]}</label>
            <div className="flex flex-wrap gap-2">
              {QUICK_CIDRS.map((item) => (
                <button
                  key={item.cidr}
                  onClick={() => handleQuickCidr(item.cidr)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    mask === `/${item.cidr}`
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  {item.label} <span className="text-xs opacity-75">({item.desc})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCalculate}
              className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {labels.calculate[lang]}
            </button>
            <button
              onClick={handleReset}
              className="py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              {labels.reset[lang]}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">{labels.results[lang]}</h3>

              {/* Key results cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-blue-50">
                  <div className="text-xs text-gray-500 mb-1">{labels.networkAddress[lang]}</div>
                  <div className="text-lg font-bold text-blue-700 font-mono">{result.networkAddress}</div>
                </div>
                <div className="p-4 rounded-lg bg-purple-50">
                  <div className="text-xs text-gray-500 mb-1">{labels.broadcastAddress[lang]}</div>
                  <div className="text-lg font-bold text-purple-700 font-mono">{result.broadcastAddress}</div>
                </div>
                <div className="p-4 rounded-lg bg-green-50">
                  <div className="text-xs text-gray-500 mb-1">{labels.firstHost[lang]}</div>
                  <div className="text-lg font-bold text-green-700 font-mono">{result.firstHost}</div>
                </div>
                <div className="p-4 rounded-lg bg-green-50">
                  <div className="text-xs text-gray-500 mb-1">{labels.lastHost[lang]}</div>
                  <div className="text-lg font-bold text-green-700 font-mono">{result.lastHost}</div>
                </div>
                <div className="p-4 rounded-lg bg-orange-50">
                  <div className="text-xs text-gray-500 mb-1">{labels.usableHosts[lang]}</div>
                  <div className="text-lg font-bold text-orange-700">{result.usableHosts.toLocaleString()}</div>
                </div>
                <div className="p-4 rounded-lg bg-orange-50">
                  <div className="text-xs text-gray-500 mb-1">{labels.totalAddresses[lang]}</div>
                  <div className="text-lg font-bold text-orange-700">{result.totalAddresses.toLocaleString()}</div>
                </div>
              </div>

              {/* Detail rows */}
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">{labels.subnetMaskLabel[lang]}</span>
                  <span className="text-sm font-medium text-gray-900 font-mono">{result.subnetMask}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">{labels.wildcardMask[lang]}</span>
                  <span className="text-sm font-medium text-gray-900 font-mono">{result.wildcardMask}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">{labels.ipClass[lang]}</span>
                  <span className="text-sm font-medium text-indigo-700">{result.ipClass}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">{labels.cidrNotation[lang]}</span>
                  <span className="text-sm font-medium text-indigo-700 font-mono">/{result.cidr}</span>
                </div>
              </div>

              {/* Binary Mask */}
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="text-xs text-gray-500 mb-1">{labels.binaryMask[lang]}</div>
                <div className="text-sm font-bold text-gray-800 font-mono break-all">{result.binaryMask}</div>
              </div>

              {/* Copy Button */}
              <button
                onClick={copyResults}
                className="w-full py-2.5 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                {copied ? labels.copied[lang] : labels.copy[lang]}
              </button>
            </div>
          )}
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{labels.history[lang]}</h3>
              <button
                onClick={() => setHistory([])}
                className="text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                {labels.clearHistory[lang]}
              </button>
            </div>
            <div className="space-y-2">
              {history.map((entry, i) => (
                <button
                  key={i}
                  onClick={() => loadFromHistory(entry)}
                  className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors flex justify-between items-center"
                >
                  <span className="font-mono text-sm text-gray-700">{entry.ip}/{entry.cidr}</span>
                  <span className="text-xs text-gray-500">
                    {entry.result.networkAddress} — {entry.result.usableHosts.toLocaleString()} hosts
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

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
