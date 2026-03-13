'use client';
import { useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { tools, common, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface HistoryEntry {
  input: string;
  preview: string;
  timestamp: number;
}

const ALGO_COLORS: Record<string, { bg: string; border: string; badge: string }> = {
  'MD5':     { bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-600' },
  'SHA-1':   { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-600' },
  'SHA-256': { bg: 'bg-purple-50',  border: 'border-purple-200',  badge: 'bg-purple-600' },
  'SHA-512': { bg: 'bg-amber-50',   border: 'border-amber-200',   badge: 'bg-amber-600' },
};

export default function HashGenerator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['hash-generator'][lang];
  const t = common[lang];

  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [copiedKey, setCopiedKey] = useState('');
  const [validationMsg, setValidationMsg] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [compareHash, setCompareHash] = useState('');
  const [compareResult, setCompareResult] = useState<null | { match: boolean; algo: string | null }>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const algorithms = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512'];

  const md5 = (str: string): string => {
    const utf8 = new TextEncoder().encode(str);
    const safeAdd = (x: number, y: number) => { const lsw = (x & 0xffff) + (y & 0xffff); return (((x >> 16) + (y >> 16) + (lsw >> 16)) << 16) | (lsw & 0xffff); };
    const bitRotateLeft = (num: number, cnt: number) => (num << cnt) | (num >>> (32 - cnt));
    const md5cmn = (q: number, a: number, b: number, x: number, s: number, t: number) => safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
    const md5ff = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => md5cmn((b & c) | (~b & d), a, b, x, s, t);
    const md5gg = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => md5cmn((b & d) | (c & ~d), a, b, x, s, t);
    const md5hh = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => md5cmn(b ^ c ^ d, a, b, x, s, t);
    const md5ii = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => md5cmn(c ^ (b | ~d), a, b, x, s, t);

    const n = utf8.length;
    const padLen = ((n + 8) >>> 6) + 1;
    const words = new Array(padLen * 16).fill(0);
    for (let i = 0; i < n; i++) words[i >> 2] |= utf8[i] << ((i % 4) * 8);
    words[n >> 2] |= 0x80 << ((n % 4) * 8);
    words[padLen * 16 - 2] = n * 8;

    let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
    for (let i = 0; i < words.length; i += 16) {
      const oa = a, ob = b, oc = c, od = d;
      const x = words.slice(i, i + 16);
      a = md5ff(a, b, c, d, x[0], 7, -680876936); d = md5ff(d, a, b, c, x[1], 12, -389564586); c = md5ff(c, d, a, b, x[2], 17, 606105819); b = md5ff(b, c, d, a, x[3], 22, -1044525330);
      a = md5ff(a, b, c, d, x[4], 7, -176418897); d = md5ff(d, a, b, c, x[5], 12, 1200080426); c = md5ff(c, d, a, b, x[6], 17, -1473231341); b = md5ff(b, c, d, a, x[7], 22, -45705983);
      a = md5ff(a, b, c, d, x[8], 7, 1770035416); d = md5ff(d, a, b, c, x[9], 12, -1958414417); c = md5ff(c, d, a, b, x[10], 17, -42063); b = md5ff(b, c, d, a, x[11], 22, -1990404162);
      a = md5ff(a, b, c, d, x[12], 7, 1804603682); d = md5ff(d, a, b, c, x[13], 12, -40341101); c = md5ff(c, d, a, b, x[14], 17, -1502002290); b = md5ff(b, c, d, a, x[15], 22, 1236535329);
      a = md5gg(a, b, c, d, x[1], 5, -165796510); d = md5gg(d, a, b, c, x[6], 9, -1069501632); c = md5gg(c, d, a, b, x[11], 14, 643717713); b = md5gg(b, c, d, a, x[0], 20, -373897302);
      a = md5gg(a, b, c, d, x[5], 5, -701558691); d = md5gg(d, a, b, c, x[10], 9, 38016083); c = md5gg(c, d, a, b, x[15], 14, -660478335); b = md5gg(b, c, d, a, x[4], 20, -405537848);
      a = md5gg(a, b, c, d, x[9], 5, 568446438); d = md5gg(d, a, b, c, x[14], 9, -1019803690); c = md5gg(c, d, a, b, x[3], 14, -187363961); b = md5gg(b, c, d, a, x[8], 20, 1163531501);
      a = md5gg(a, b, c, d, x[13], 5, -1444681467); d = md5gg(d, a, b, c, x[2], 9, -51403784); c = md5gg(c, d, a, b, x[7], 14, 1735328473); b = md5gg(b, c, d, a, x[12], 20, -1926607734);
      a = md5hh(a, b, c, d, x[5], 4, -378558); d = md5hh(d, a, b, c, x[8], 11, -2022574463); c = md5hh(c, d, a, b, x[11], 16, 1839030562); b = md5hh(b, c, d, a, x[14], 23, -35309556);
      a = md5hh(a, b, c, d, x[1], 4, -1530992060); d = md5hh(d, a, b, c, x[4], 11, 1272893353); c = md5hh(c, d, a, b, x[7], 16, -155497632); b = md5hh(b, c, d, a, x[10], 23, -1094730640);
      a = md5hh(a, b, c, d, x[13], 4, 681279174); d = md5hh(d, a, b, c, x[0], 11, -358537222); c = md5hh(c, d, a, b, x[3], 16, -722521979); b = md5hh(b, c, d, a, x[6], 23, 76029189);
      a = md5hh(a, b, c, d, x[9], 4, -640364487); d = md5hh(d, a, b, c, x[12], 11, -421815835); c = md5hh(c, d, a, b, x[15], 16, 530742520); b = md5hh(b, c, d, a, x[2], 23, -995338651);
      a = md5ii(a, b, c, d, x[0], 6, -198630844); d = md5ii(d, a, b, c, x[7], 10, 1126891415); c = md5ii(c, d, a, b, x[14], 15, -1416354905); b = md5ii(b, c, d, a, x[5], 21, -57434055);
      a = md5ii(a, b, c, d, x[12], 6, 1700485571); d = md5ii(d, a, b, c, x[3], 10, -1894986606); c = md5ii(c, d, a, b, x[10], 15, -1051523); b = md5ii(b, c, d, a, x[1], 21, -2054922799);
      a = md5ii(a, b, c, d, x[8], 6, 1873313359); d = md5ii(d, a, b, c, x[15], 10, -30611744); c = md5ii(c, d, a, b, x[6], 15, -1560198380); b = md5ii(b, c, d, a, x[13], 21, 1309151649);
      a = md5ii(a, b, c, d, x[4], 6, -145523070); d = md5ii(d, a, b, c, x[11], 10, -1120210379); c = md5ii(c, d, a, b, x[2], 15, 718787259); b = md5ii(b, c, d, a, x[9], 21, -343485551);
      a = safeAdd(a, oa); b = safeAdd(b, ob); c = safeAdd(c, oc); d = safeAdd(d, od);
    }

    const hex = (n: number) => { let s = ''; for (let i = 0; i < 4; i++) s += ((n >> (i * 8 + 4)) & 0xf).toString(16) + ((n >> (i * 8)) & 0xf).toString(16); return s; };
    return hex(a) + hex(b) + hex(c) + hex(d);
  };

  const generateHashes = useCallback(async (text: string) => {
    if (!text) { setHashes({}); return; }
    const result: Record<string, string> = {};
    result['MD5'] = md5(text);
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    for (const algo of ['SHA-1', 'SHA-256', 'SHA-512']) {
      try {
        const hashBuffer = await crypto.subtle.digest(algo, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        result[algo] = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch { result[algo] = 'Not supported'; }
    }
    setHashes(result);
    return result;
  }, []);

  const addToHistory = (text: string, hashResult: Record<string, string>) => {
    const preview = hashResult['SHA-256']?.slice(0, 16) || '';
    setHistory(prev => {
      const next = [{ input: text.slice(0, 100), preview, timestamp: Date.now() }, ...prev.filter(h => h.input !== text.slice(0, 100))];
      return next.slice(0, 5);
    });
  };

  const handleInputChange = async (text: string) => {
    setInput(text);
    setValidationMsg('');
    setCompareResult(null);
    const result = await generateHashes(text);
    if (result && text.trim()) {
      addToHistory(text, result);
    }
  };

  const handleReset = () => {
    setInput('');
    setHashes({});
    setValidationMsg('');
    setCompareHash('');
    setCompareResult(null);
    setFileName('');
  };

  const handleGenerate = () => {
    if (!input.trim()) {
      setValidationMsg(labels.emptyInput[lang]);
      return;
    }
    setValidationMsg('');
    generateHashes(input);
  };

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handleCompare = () => {
    if (!compareHash.trim() || Object.keys(hashes).length === 0) return;
    const normalized = compareHash.trim().toLowerCase();
    for (const algo of algorithms) {
      if (hashes[algo]?.toLowerCase() === normalized) {
        setCompareResult({ match: true, algo });
        return;
      }
    }
    setCompareResult({ match: false, algo: null });
  };

  const handleFileRead = async (file: File) => {
    setFileName(file.name);
    const text = await file.text();
    setInput(text);
    setValidationMsg('');
    setCompareResult(null);
    const result = await generateHashes(text);
    if (result) {
      addToHistory(`[${file.name}] ${text.slice(0, 80)}`, result);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileRead(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileRead(file);
  };

  const handleHistoryClick = (entry: HistoryEntry) => {
    handleInputChange(entry.input);
  };

  const labels = {
    input: { en: 'Enter text to hash', it: 'Inserisci il testo da hashare', es: 'Ingresa texto para hashear', fr: 'Entrez le texte à hacher', de: 'Text zum Hashen eingeben', pt: 'Digite o texto para hash' },
    chars: { en: 'characters', it: 'caratteri', es: 'caracteres', fr: 'caractères', de: 'Zeichen', pt: 'caracteres' },
    reset: { en: 'Reset', it: 'Ripristina', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
    generate: { en: 'Generate Hashes', it: 'Genera Hash', es: 'Generar Hashes', fr: 'Générer les Hashes', de: 'Hashes generieren', pt: 'Gerar Hashes' },
    emptyInput: { en: 'Please enter text or drop a file to generate hashes.', it: 'Inserisci un testo o trascina un file per generare gli hash.', es: 'Ingresa texto o arrastra un archivo para generar hashes.', fr: 'Veuillez saisir un texte ou déposer un fichier pour générer les hashes.', de: 'Bitte geben Sie Text ein oder legen Sie eine Datei ab, um Hashes zu generieren.', pt: 'Digite um texto ou arraste um arquivo para gerar hashes.' },
    compareLabel: { en: 'Compare / Verify Hash', it: 'Confronta / Verifica Hash', es: 'Comparar / Verificar Hash', fr: 'Comparer / Vérifier le Hash', de: 'Hash vergleichen / überprüfen', pt: 'Comparar / Verificar Hash' },
    comparePlaceholder: { en: 'Paste a hash to compare...', it: 'Incolla un hash da confrontare...', es: 'Pega un hash para comparar...', fr: 'Collez un hash à comparer...', de: 'Hash zum Vergleichen einfügen...', pt: 'Cole um hash para comparar...' },
    compareBtn: { en: 'Verify', it: 'Verifica', es: 'Verificar', fr: 'Vérifier', de: 'Überprüfen', pt: 'Verificar' },
    matchFound: { en: 'Match found', it: 'Corrispondenza trovata', es: 'Coincidencia encontrada', fr: 'Correspondance trouvée', de: 'Übereinstimmung gefunden', pt: 'Correspondência encontrada' },
    noMatch: { en: 'No match found', it: 'Nessuna corrispondenza', es: 'Sin coincidencia', fr: 'Aucune correspondance', de: 'Keine Übereinstimmung', pt: 'Sem correspondência' },
    history: { en: 'Recent Inputs', it: 'Input recenti', es: 'Entradas recientes', fr: 'Entrées récentes', de: 'Letzte Eingaben', pt: 'Entradas recentes' },
    clearHistory: { en: 'Clear', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Löschen', pt: 'Limpar' },
    fileHash: { en: 'Hash File Content', it: 'Hash contenuto file', es: 'Hash de contenido de archivo', fr: 'Hacher le contenu du fichier', de: 'Dateiinhalt hashen', pt: 'Hash de conteúdo de arquivo' },
    dropFile: { en: 'Drop file here or click to browse', it: 'Trascina un file qui o clicca per sfogliare', es: 'Arrastra un archivo aquí o haz clic para explorar', fr: 'Déposez un fichier ici ou cliquez pour parcourir', de: 'Datei hierher ziehen oder klicken zum Durchsuchen', pt: 'Arraste um arquivo aqui ou clique para procurar' },
    fileLoaded: { en: 'File loaded', it: 'File caricato', es: 'Archivo cargado', fr: 'Fichier chargé', de: 'Datei geladen', pt: 'Arquivo carregado' },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Hash Generator – Generate MD5, SHA-1, SHA-256, SHA-512 Hashes Online',
      paragraphs: [
        'Cryptographic hash functions are fundamental building blocks of modern computer security. A hash function takes an input of any size and produces a fixed-size output (the hash or digest) that uniquely represents the input data. Even a tiny change to the input produces a completely different hash, making these functions essential for data integrity verification, password storage, and digital signatures.',
        'Our hash generator supports four of the most widely used algorithms. MD5 (Message Digest 5) produces a 128-bit (32-character hex) hash. While fast and widely supported, MD5 is considered cryptographically broken and should not be used for security purposes. It remains useful for non-security checksums and file verification. SHA-1 (Secure Hash Algorithm 1) produces a 160-bit (40-character) hash and was the standard for many years, but collision attacks have been demonstrated, so it is being phased out.',
        'SHA-256 and SHA-512 are part of the SHA-2 family and are currently the recommended algorithms for security applications. SHA-256 produces a 256-bit (64-character) hash and is used in Bitcoin mining, SSL certificates, and many authentication systems. SHA-512 produces a 512-bit (128-character) hash and provides even greater security at the cost of slightly longer computation time.',
        'All hashing in this tool is performed entirely in your browser using the Web Crypto API (SubtleCrypto) for SHA algorithms and a JavaScript implementation for MD5. No data is ever sent to any server, ensuring complete privacy. Simply type or paste your text and all four hashes are generated simultaneously in real-time.',
      ],
      faq: [
        { q: 'What is a hash function?', a: 'A hash function is a mathematical algorithm that converts input data of any size into a fixed-size output string (the hash). It is deterministic (same input always produces same output), fast to compute, and practically irreversible — you cannot recover the original input from the hash. Even a single character change in the input produces a completely different hash.' },
        { q: 'What is the difference between MD5, SHA-1, SHA-256, and SHA-512?', a: 'MD5 produces a 128-bit hash (32 hex chars), SHA-1 produces 160-bit (40 chars), SHA-256 produces 256-bit (64 chars), and SHA-512 produces 512-bit (128 chars). Longer hashes are more resistant to collision attacks. MD5 and SHA-1 are considered weak for security. SHA-256 and SHA-512 are currently recommended for cryptographic use.' },
        { q: 'Can I reverse a hash to get the original text?', a: 'No, hash functions are designed to be one-way. You cannot mathematically reverse a hash to obtain the original input. However, common strings can be found using rainbow tables or brute force attacks, which is why passwords should be hashed with a salt (random data added before hashing) and use specialized algorithms like bcrypt.' },
        { q: 'Is my data safe when using this tool?', a: 'Yes, all hashing is performed entirely in your browser using the Web Crypto API. No data is sent to any server. You can verify this by using the tool offline or checking your browser\'s network tab. Your text never leaves your device.' },
        { q: 'Which hash algorithm should I use?', a: 'For security applications (passwords, digital signatures, integrity verification), use SHA-256 or SHA-512. For simple non-security checksums (file deduplication, cache keys), MD5 is acceptable due to its speed. Never use MD5 or SHA-1 for security-critical applications as they have known vulnerabilities.' },
      ],
    },
    it: {
      title: 'Generatore Hash Gratuito – Genera Hash MD5, SHA-1, SHA-256, SHA-512 Online',
      paragraphs: [
        'Le funzioni hash crittografiche sono elementi fondamentali della sicurezza informatica moderna. Una funzione hash prende un input di qualsiasi dimensione e produce un output di dimensione fissa (l\'hash o digest) che rappresenta univocamente i dati di input. Anche una minuscola modifica all\'input produce un hash completamente diverso.',
        'Il nostro generatore supporta quattro degli algoritmi più utilizzati. MD5 produce un hash a 128 bit (32 caratteri hex). SHA-1 produce un hash a 160 bit. Entrambi sono considerati deboli per scopi di sicurezza. SHA-256 e SHA-512 sono parte della famiglia SHA-2 e sono attualmente gli algoritmi raccomandati.',
        'SHA-256 produce un hash a 256 bit (64 caratteri) ed è usato nel mining di Bitcoin, certificati SSL e molti sistemi di autenticazione. SHA-512 produce un hash a 512 bit (128 caratteri) e offre sicurezza ancora maggiore.',
        'Tutto l\'hashing in questo strumento viene eseguito interamente nel tuo browser usando la Web Crypto API. Nessun dato viene mai inviato a server esterni, garantendo completa privacy.',
      ],
      faq: [
        { q: 'Cos\'è una funzione hash?', a: 'Una funzione hash è un algoritmo matematico che converte dati di input di qualsiasi dimensione in una stringa di output di dimensione fissa. È deterministica, veloce da calcolare e praticamente irreversibile.' },
        { q: 'Qual è la differenza tra MD5, SHA-1, SHA-256 e SHA-512?', a: 'MD5 produce un hash a 128 bit, SHA-1 a 160 bit, SHA-256 a 256 bit e SHA-512 a 512 bit. Hash più lunghi sono più resistenti agli attacchi. MD5 e SHA-1 sono deboli per la sicurezza. SHA-256 e SHA-512 sono raccomandati.' },
        { q: 'Posso invertire un hash per ottenere il testo originale?', a: 'No, le funzioni hash sono progettate per essere unidirezionali. Non è possibile invertire matematicamente un hash. Le password dovrebbero essere hashate con un salt e algoritmi specializzati come bcrypt.' },
        { q: 'I miei dati sono al sicuro?', a: 'Sì, tutto l\'hashing viene eseguito interamente nel browser usando la Web Crypto API. Nessun dato viene inviato a server esterni. Il testo non lascia mai il tuo dispositivo.' },
        { q: 'Quale algoritmo hash dovrei usare?', a: 'Per applicazioni di sicurezza usa SHA-256 o SHA-512. Per checksum non di sicurezza, MD5 è accettabile per la sua velocità. Mai usare MD5 o SHA-1 per applicazioni critiche.' },
      ],
    },
    es: {
      title: 'Generador de Hash Gratis – Genera Hashes MD5, SHA-1, SHA-256, SHA-512 Online',
      paragraphs: [
        'Las funciones hash criptográficas son bloques fundamentales de la seguridad informática moderna. Una función hash toma una entrada de cualquier tamaño y produce una salida de tamaño fijo que representa únicamente los datos de entrada. Incluso un cambio mínimo produce un hash completamente diferente.',
        'Nuestro generador soporta cuatro de los algoritmos más utilizados. MD5 produce un hash de 128 bits. SHA-1 produce uno de 160 bits. Ambos se consideran débiles para seguridad. SHA-256 y SHA-512 son parte de la familia SHA-2 y son los algoritmos recomendados actualmente.',
        'SHA-256 produce un hash de 256 bits y se usa en minería de Bitcoin, certificados SSL y sistemas de autenticación. SHA-512 produce un hash de 512 bits y ofrece mayor seguridad.',
        'Todo el hashing se realiza completamente en tu navegador usando la Web Crypto API. Ningún dato se envía a servidores externos, garantizando privacidad completa.',
      ],
      faq: [
        { q: '¿Qué es una función hash?', a: 'Una función hash es un algoritmo matemático que convierte datos de cualquier tamaño en una cadena de salida de tamaño fijo. Es determinista, rápida y prácticamente irreversible.' },
        { q: '¿Cuál es la diferencia entre MD5, SHA-1, SHA-256 y SHA-512?', a: 'MD5 produce 128 bits, SHA-1 160 bits, SHA-256 256 bits y SHA-512 512 bits. Hashes más largos son más resistentes. MD5 y SHA-1 son débiles. SHA-256 y SHA-512 son recomendados.' },
        { q: '¿Puedo revertir un hash?', a: 'No, las funciones hash son unidireccionales. Las contraseñas deben hashearse con salt y algoritmos especializados como bcrypt.' },
        { q: '¿Mis datos están seguros?', a: 'Sí, todo el hashing se realiza en tu navegador usando la Web Crypto API. Ningún dato se envía a servidores.' },
      ],
    },
    fr: {
      title: 'Générateur de Hash Gratuit – Générez des Hash MD5, SHA-1, SHA-256, SHA-512 en Ligne',
      paragraphs: [
        'Les fonctions de hachage cryptographiques sont des éléments fondamentaux de la sécurité informatique moderne. Une fonction de hachage prend une entrée de n\'importe quelle taille et produit une sortie de taille fixe qui représente uniquement les données. Même un minuscule changement produit un hash complètement différent.',
        'Notre générateur supporte quatre des algorithmes les plus utilisés. MD5 produit un hash de 128 bits. SHA-1 en produit un de 160 bits. Les deux sont considérés faibles pour la sécurité. SHA-256 et SHA-512 font partie de la famille SHA-2 et sont actuellement recommandés.',
        'SHA-256 produit un hash de 256 bits et est utilisé dans le minage de Bitcoin, les certificats SSL et les systèmes d\'authentification. SHA-512 produit un hash de 512 bits avec une sécurité encore plus grande.',
        'Tout le hachage est effectué entièrement dans votre navigateur via la Web Crypto API. Aucune donnée n\'est envoyée à un serveur, garantissant une confidentialité totale.',
      ],
      faq: [
        { q: 'Qu\'est-ce qu\'une fonction de hachage ?', a: 'Une fonction de hachage est un algorithme mathématique qui convertit des données de n\'importe quelle taille en une chaîne de taille fixe. Elle est déterministe, rapide et pratiquement irréversible.' },
        { q: 'Quelle est la différence entre MD5, SHA-1, SHA-256 et SHA-512 ?', a: 'MD5 produit 128 bits, SHA-1 160 bits, SHA-256 256 bits et SHA-512 512 bits. Les hash plus longs sont plus résistants. MD5 et SHA-1 sont faibles. SHA-256 et SHA-512 sont recommandés.' },
        { q: 'Puis-je inverser un hash ?', a: 'Non, les fonctions de hachage sont unidirectionnelles. Les mots de passe doivent être hachés avec un sel et des algorithmes spécialisés comme bcrypt.' },
        { q: 'Mes données sont-elles en sécurité ?', a: 'Oui, tout le hachage est effectué dans votre navigateur via la Web Crypto API. Aucune donnée n\'est envoyée à un serveur.' },
      ],
    },
    de: {
      title: 'Kostenloser Hash-Generator – MD5, SHA-1, SHA-256, SHA-512 Hashes Online Generieren',
      paragraphs: [
        'Kryptografische Hash-Funktionen sind grundlegende Bausteine der modernen Computersicherheit. Eine Hash-Funktion nimmt eine Eingabe beliebiger Größe und erzeugt eine Ausgabe fester Größe, die die Eingabedaten eindeutig repräsentiert. Selbst eine winzige Änderung erzeugt einen völlig anderen Hash.',
        'Unser Generator unterstützt vier der am weitesten verbreiteten Algorithmen. MD5 erzeugt einen 128-Bit-Hash. SHA-1 erzeugt einen 160-Bit-Hash. Beide gelten als schwach für Sicherheitszwecke. SHA-256 und SHA-512 gehören zur SHA-2-Familie und sind aktuell empfohlen.',
        'SHA-256 erzeugt einen 256-Bit-Hash und wird beim Bitcoin-Mining, SSL-Zertifikaten und Authentifizierungssystemen verwendet. SHA-512 erzeugt einen 512-Bit-Hash mit noch größerer Sicherheit.',
        'Alle Hashing-Operationen werden vollständig in Ihrem Browser über die Web Crypto API durchgeführt. Keine Daten werden an Server gesendet, was vollständige Privatsphäre gewährleistet.',
      ],
      faq: [
        { q: 'Was ist eine Hash-Funktion?', a: 'Eine Hash-Funktion ist ein mathematischer Algorithmus, der Eingabedaten beliebiger Größe in eine Zeichenkette fester Größe umwandelt. Sie ist deterministisch, schnell und praktisch irreversibel.' },
        { q: 'Was ist der Unterschied zwischen MD5, SHA-1, SHA-256 und SHA-512?', a: 'MD5 erzeugt 128 Bit, SHA-1 160 Bit, SHA-256 256 Bit und SHA-512 512 Bit. Längere Hashes sind widerstandsfähiger. MD5 und SHA-1 sind schwach. SHA-256 und SHA-512 werden empfohlen.' },
        { q: 'Kann ich einen Hash umkehren?', a: 'Nein, Hash-Funktionen sind Einwegfunktionen. Passwörter sollten mit einem Salt und spezialisierten Algorithmen wie bcrypt gehasht werden.' },
        { q: 'Sind meine Daten sicher?', a: 'Ja, alles Hashing wird vollständig in Ihrem Browser über die Web Crypto API durchgeführt. Keine Daten werden an Server gesendet.' },
      ],
    },
    pt: {
      title: 'Gerador de Hash Grátis – Gere Hashes MD5, SHA-1, SHA-256, SHA-512 Online',
      paragraphs: [
        'Funções hash criptográficas são blocos fundamentais da segurança computacional moderna. Uma função hash pega uma entrada de qualquer tamanho e produz uma saída de tamanho fixo que representa unicamente os dados. Mesmo uma mudança mínima produz um hash completamente diferente.',
        'Nosso gerador suporta quatro dos algoritmos mais utilizados. MD5 produz um hash de 128 bits. SHA-1 produz um de 160 bits. Ambos são considerados fracos para segurança. SHA-256 e SHA-512 fazem parte da família SHA-2 e são recomendados atualmente.',
        'SHA-256 produz um hash de 256 bits e é usado na mineração de Bitcoin, certificados SSL e sistemas de autenticação. SHA-512 produz um hash de 512 bits com segurança ainda maior.',
        'Todo o hashing é realizado inteiramente no seu navegador usando a Web Crypto API. Nenhum dado é enviado a servidores externos, garantindo privacidade completa.',
      ],
      faq: [
        { q: 'O que é uma função hash?', a: 'Uma função hash é um algoritmo matemático que converte dados de qualquer tamanho em uma string de tamanho fixo. É determinística, rápida e praticamente irreversível.' },
        { q: 'Qual a diferença entre MD5, SHA-1, SHA-256 e SHA-512?', a: 'MD5 produz 128 bits, SHA-1 160 bits, SHA-256 256 bits e SHA-512 512 bits. Hashes mais longos são mais resistentes. MD5 e SHA-1 são fracos. SHA-256 e SHA-512 são recomendados.' },
        { q: 'Posso reverter um hash?', a: 'Não, funções hash são unidirecionais. Senhas devem ser hasheadas com salt e algoritmos especializados como bcrypt.' },
        { q: 'Meus dados estão seguros?', a: 'Sim, todo o hashing é realizado no seu navegador usando a Web Crypto API. Nenhum dado é enviado a servidores.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="hash-generator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.input[lang]}</label>
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              rows={4}
              placeholder="Hello World"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <div className="flex justify-between items-center mt-1">
              {input ? <span className="text-xs text-gray-400">{input.length} {labels.chars[lang]}</span> : <span />}
              {fileName && <span className="text-xs text-green-600">{labels.fileLoaded[lang]}: {fileName}</span>}
            </div>
            {validationMsg && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {validationMsg}
              </div>
            )}
          </div>

          {/* File Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg px-4 py-4 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }`}
          >
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileInput} />
            <div className="text-sm text-gray-500">
              <svg className="mx-auto h-8 w-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {labels.dropFile[lang]}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              {labels.generate[lang]}
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg border border-gray-200 transition-colors"
            >
              {labels.reset[lang]}
            </button>
          </div>

          {/* Result Cards */}
          {Object.keys(hashes).length > 0 && (
            <div className="space-y-3">
              {algorithms.map(algo => hashes[algo] ? (
                <div key={algo} className={`rounded-lg p-4 border ${ALGO_COLORS[algo].bg} ${ALGO_COLORS[algo].border}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-bold text-white px-2 py-0.5 rounded ${ALGO_COLORS[algo].badge}`}>{algo}</span>
                    <button
                      onClick={() => handleCopy(algo, hashes[algo])}
                      className="text-xs bg-white hover:bg-gray-50 text-gray-700 px-3 py-1 rounded-md border border-gray-200 transition-colors flex items-center gap-1"
                    >
                      {copiedKey === algo ? (
                        <><svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> {t.copied}</>
                      ) : (
                        <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> {t.copy}</>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-xs break-all text-gray-800 select-all bg-white/60 rounded px-2 py-1.5">{hashes[algo]}</div>
                </div>
              ) : null)}
            </div>
          )}

          {/* Hash Comparison */}
          {Object.keys(hashes).length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">{labels.compareLabel[lang]}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={compareHash}
                  onChange={(e) => { setCompareHash(e.target.value); setCompareResult(null); }}
                  placeholder={labels.comparePlaceholder[lang]}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <button
                  onClick={handleCompare}
                  className="bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  {labels.compareBtn[lang]}
                </button>
              </div>
              {compareResult && (
                <div className={`mt-2 text-sm font-medium px-3 py-2 rounded-lg ${
                  compareResult.match
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {compareResult.match
                    ? `${labels.matchFound[lang]} (${compareResult.algo})`
                    : labels.noMatch[lang]
                  }
                </div>
              )}
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-700">{labels.history[lang]}</h3>
              <button
                onClick={() => setHistory([])}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                {labels.clearHistory[lang]}
              </button>
            </div>
            <div className="space-y-1.5">
              {history.map((entry, i) => (
                <button
                  key={entry.timestamp}
                  onClick={() => handleHistoryClick(entry)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 group"
                >
                  <div className="text-sm text-gray-800 truncate">{entry.input}</div>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">SHA-256: {entry.preview}...</div>
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
