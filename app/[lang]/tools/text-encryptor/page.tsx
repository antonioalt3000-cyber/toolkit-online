'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, common, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function TextEncryptor() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['text-encryptor'][lang];
  const t = common[lang];

  const [inputText, setInputText] = useState('');
  const [password, setPassword] = useState('');
  const [outputText, setOutputText] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const labels: Record<string, Record<Locale, string>> = {
    inputLabel: {
      en: 'Text to encrypt or decrypt',
      it: 'Testo da cifrare o decifrare',
      es: 'Texto a cifrar o descifrar',
      fr: 'Texte à chiffrer ou déchiffrer',
      de: 'Text zum Ver- oder Entschlüsseln',
      pt: 'Texto para criptografar ou descriptografar',
    },
    passwordLabel: {
      en: 'Password / Encryption Key',
      it: 'Password / Chiave di cifratura',
      es: 'Contraseña / Clave de cifrado',
      fr: 'Mot de passe / Clé de chiffrement',
      de: 'Passwort / Verschlüsselungsschlüssel',
      pt: 'Senha / Chave de criptografia',
    },
    passwordPlaceholder: {
      en: 'Enter a strong password...',
      it: 'Inserisci una password sicura...',
      es: 'Ingresa una contraseña segura...',
      fr: 'Entrez un mot de passe fort...',
      de: 'Geben Sie ein starkes Passwort ein...',
      pt: 'Digite uma senha forte...',
    },
    encrypt: {
      en: 'Encrypt',
      it: 'Cifra',
      es: 'Cifrar',
      fr: 'Chiffrer',
      de: 'Verschlüsseln',
      pt: 'Criptografar',
    },
    decrypt: {
      en: 'Decrypt',
      it: 'Decifra',
      es: 'Descifrar',
      fr: 'Déchiffrer',
      de: 'Entschlüsseln',
      pt: 'Descriptografar',
    },
    reset: {
      en: 'Reset',
      it: 'Ripristina',
      es: 'Restablecer',
      fr: 'Réinitialiser',
      de: 'Zurücksetzen',
      pt: 'Redefinir',
    },
    outputLabel: {
      en: 'Result',
      it: 'Risultato',
      es: 'Resultado',
      fr: 'Résultat',
      de: 'Ergebnis',
      pt: 'Resultado',
    },
    showPassword: {
      en: 'Show',
      it: 'Mostra',
      es: 'Mostrar',
      fr: 'Afficher',
      de: 'Anzeigen',
      pt: 'Mostrar',
    },
    hidePassword: {
      en: 'Hide',
      it: 'Nascondi',
      es: 'Ocultar',
      fr: 'Masquer',
      de: 'Verbergen',
      pt: 'Ocultar',
    },
    securityNote: {
      en: 'Encryption happens entirely in your browser. No data is sent to any server.',
      it: 'La cifratura avviene interamente nel tuo browser. Nessun dato viene inviato a server esterni.',
      es: 'El cifrado ocurre completamente en tu navegador. No se envían datos a ningún servidor.',
      fr: 'Le chiffrement se fait entièrement dans votre navigateur. Aucune donnée n\'est envoyée à un serveur.',
      de: 'Die Verschlüsselung erfolgt vollständig in Ihrem Browser. Es werden keine Daten an Server gesendet.',
      pt: 'A criptografia acontece inteiramente no seu navegador. Nenhum dado é enviado a servidores.',
    },
    emptyInput: {
      en: 'Please enter text and a password.',
      it: 'Inserisci un testo e una password.',
      es: 'Ingresa texto y una contraseña.',
      fr: 'Veuillez entrer du texte et un mot de passe.',
      de: 'Bitte geben Sie Text und ein Passwort ein.',
      pt: 'Por favor, insira texto e uma senha.',
    },
    decryptError: {
      en: 'Decryption failed. Wrong password or corrupted data.',
      it: 'Decifratura fallita. Password errata o dati corrotti.',
      es: 'Descifrado fallido. Contraseña incorrecta o datos corruptos.',
      fr: 'Échec du déchiffrement. Mot de passe incorrect ou données corrompues.',
      de: 'Entschlüsselung fehlgeschlagen. Falsches Passwort oder beschädigte Daten.',
      pt: 'Falha na descriptografia. Senha errada ou dados corrompidos.',
    },
    inputPlaceholder: {
      en: 'Enter text to encrypt, or paste encrypted base64 to decrypt...',
      it: 'Inserisci testo da cifrare, o incolla base64 cifrato per decifrare...',
      es: 'Ingresa texto a cifrar, o pega base64 cifrado para descifrar...',
      fr: 'Entrez du texte à chiffrer, ou collez du base64 chiffré pour déchiffrer...',
      de: 'Text zum Verschlüsseln eingeben, oder verschlüsseltes Base64 zum Entschlüsseln einfügen...',
      pt: 'Digite texto para criptografar, ou cole base64 criptografado para descriptografar...',
    },
    chars: {
      en: 'characters',
      it: 'caratteri',
      es: 'caracteres',
      fr: 'caractères',
      de: 'Zeichen',
      pt: 'caracteres',
    },
    algorithm: {
      en: 'AES-256-GCM with PBKDF2 key derivation',
      it: 'AES-256-GCM con derivazione chiave PBKDF2',
      es: 'AES-256-GCM con derivación de clave PBKDF2',
      fr: 'AES-256-GCM avec dérivation de clé PBKDF2',
      de: 'AES-256-GCM mit PBKDF2-Schlüsselableitung',
      pt: 'AES-256-GCM com derivação de chave PBKDF2',
    },
  };

  async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  const handleEncrypt = async () => {
    if (!inputText.trim() || !password.trim()) {
      setError(labels.emptyInput[lang]);
      return;
    }
    setError('');
    setProcessing(true);
    try {
      const encoder = new TextEncoder();
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveKey(password, salt);
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(inputText)
      );
      // Combine salt (16) + iv (12) + ciphertext
      const combined = new Uint8Array(salt.length + iv.length + new Uint8Array(encrypted).length);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encrypted), salt.length + iv.length);
      setOutputText(arrayBufferToBase64(combined.buffer));
    } catch {
      setError(labels.decryptError[lang]);
    } finally {
      setProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!inputText.trim() || !password.trim()) {
      setError(labels.emptyInput[lang]);
      return;
    }
    setError('');
    setProcessing(true);
    try {
      const data = new Uint8Array(base64ToArrayBuffer(inputText.trim()));
      const salt = data.slice(0, 16);
      const iv = data.slice(16, 28);
      const ciphertext = data.slice(28);
      const key = await deriveKey(password, salt);
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );
      const decoder = new TextDecoder();
      setOutputText(decoder.decode(decrypted));
    } catch {
      setError(labels.decryptError[lang]);
      setOutputText('');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setInputText('');
    setPassword('');
    setOutputText('');
    setError('');
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Text Encryptor — Encrypt & Decrypt Text Online with AES-256',
      paragraphs: [
        'Text encryption is one of the most important tools in modern digital privacy. Whether you need to protect sensitive messages, store confidential notes, or share private information securely, encryption transforms readable text (plaintext) into an unreadable format (ciphertext) that can only be decoded with the correct password. Our free text encryptor uses military-grade AES-256-GCM encryption, the same standard trusted by governments and financial institutions worldwide.',
        'AES (Advanced Encryption Standard) is a symmetric block cipher adopted by the U.S. government in 2001 after an extensive five-year evaluation process. The "256" refers to the key length in bits, providing 2^256 possible key combinations — a number so astronomically large that brute-force attacks are computationally infeasible even with the most powerful supercomputers. GCM (Galois/Counter Mode) adds authenticated encryption, meaning it not only encrypts your data but also verifies its integrity, detecting any tampering or corruption during transmission.',
        'Key derivation is a critical component of password-based encryption. Our tool uses PBKDF2 (Password-Based Key Derivation Function 2) with 100,000 iterations and SHA-256 hashing to transform your password into a cryptographic key. This process, known as key stretching, deliberately slows down key generation to make dictionary attacks and brute-force attempts against weak passwords much more expensive. A random 16-byte salt is generated for each encryption operation, ensuring that identical passwords produce different encryption keys.',
        'The encryption output consists of a random salt (16 bytes), a random initialization vector (12 bytes), and the AES-GCM ciphertext with authentication tag, all concatenated and encoded in Base64 for easy copying and sharing. The IV ensures that encrypting the same plaintext with the same password produces different ciphertext each time, preventing pattern analysis attacks. All cryptographic operations are performed entirely in your browser using the Web Crypto API (SubtleCrypto), meaning your text and password never leave your device.',
      ],
      faq: [
        { q: 'How secure is AES-256-GCM encryption?', a: 'AES-256-GCM is considered one of the strongest encryption standards available. It is approved by the U.S. National Security Agency (NSA) for protecting top-secret information. With a 256-bit key, there are 2^256 possible combinations, making brute-force attacks practically impossible. The GCM mode also provides authentication, ensuring encrypted data has not been tampered with.' },
        { q: 'Can someone decrypt my text without the password?', a: 'No, without the correct password, it is computationally infeasible to decrypt AES-256-GCM encrypted text. However, the security of your encrypted data depends entirely on the strength of your password. Use a long, unique password with a mix of letters, numbers, and symbols for maximum protection.' },
        { q: 'Is my data sent to any server?', a: 'No, all encryption and decryption operations happen entirely in your browser using the Web Crypto API (SubtleCrypto). Your text and password never leave your device. You can verify this by disconnecting from the internet and using the tool offline, or by checking the network tab in your browser developer tools.' },
        { q: 'What is PBKDF2 and why is it used?', a: 'PBKDF2 (Password-Based Key Derivation Function 2) is an algorithm that converts a human-readable password into a cryptographic key. It applies SHA-256 hashing 100,000 times with a random salt, making it extremely slow for attackers to try many password guesses. This protects even relatively short passwords against dictionary and brute-force attacks.' },
        { q: 'Can I decrypt on a different device?', a: 'Yes, as long as you have the encrypted Base64 string and the same password used for encryption, you can decrypt on any device using this tool. The salt and IV are included in the encrypted output, so no additional information is needed beyond the password.' },
      ],
    },
    it: {
      title: 'Cifratore di Testo Gratuito — Cifra e Decifra Testo Online con AES-256',
      paragraphs: [
        'La cifratura del testo e uno degli strumenti piu importanti per la privacy digitale moderna. Che tu debba proteggere messaggi sensibili, conservare appunti riservati o condividere informazioni private in modo sicuro, la cifratura trasforma il testo leggibile (testo in chiaro) in un formato illeggibile (testo cifrato) decodificabile solo con la password corretta. Il nostro cifratore gratuito utilizza la crittografia AES-256-GCM di livello militare, lo stesso standard adottato da governi e istituzioni finanziarie in tutto il mondo.',
        'AES (Advanced Encryption Standard) e un cifrario a blocchi simmetrico adottato dal governo degli Stati Uniti nel 2001 dopo un processo di valutazione durato cinque anni. Il "256" indica la lunghezza della chiave in bit, offrendo 2^256 combinazioni possibili — un numero cosi astronomicamente grande che gli attacchi a forza bruta sono computazionalmente impossibili anche con i supercomputer piu potenti. La modalita GCM (Galois/Counter Mode) aggiunge la crittografia autenticata, verificando sia la riservatezza che l\'integrita dei dati.',
        'La derivazione della chiave e un componente critico della cifratura basata su password. Il nostro strumento utilizza PBKDF2 con 100.000 iterazioni e hashing SHA-256 per trasformare la tua password in una chiave crittografica. Un salt casuale di 16 byte viene generato per ogni operazione di cifratura, garantendo che password identiche producano chiavi di cifratura diverse.',
        'L\'output cifrato consiste in un salt casuale (16 byte), un vettore di inizializzazione casuale (12 byte) e il testo cifrato AES-GCM con tag di autenticazione, tutto concatenato e codificato in Base64 per facile copia e condivisione. Tutte le operazioni crittografiche vengono eseguite interamente nel tuo browser tramite la Web Crypto API, il che significa che il tuo testo e la tua password non lasciano mai il tuo dispositivo.',
      ],
      faq: [
        { q: 'Quanto e sicura la crittografia AES-256-GCM?', a: 'AES-256-GCM e considerato uno degli standard di crittografia piu robusti disponibili. E approvato dalla NSA per proteggere informazioni top-secret. Con una chiave a 256 bit, gli attacchi a forza bruta sono praticamente impossibili. La modalita GCM fornisce anche autenticazione dei dati.' },
        { q: 'Qualcuno puo decifrare il mio testo senza la password?', a: 'No, senza la password corretta e computazionalmente impossibile decifrare un testo cifrato con AES-256-GCM. Tuttavia, la sicurezza dipende dalla robustezza della password. Usa una password lunga e unica con mix di lettere, numeri e simboli.' },
        { q: 'I miei dati vengono inviati a qualche server?', a: 'No, tutte le operazioni di cifratura e decifratura avvengono interamente nel tuo browser tramite la Web Crypto API. Il testo e la password non lasciano mai il tuo dispositivo. Puoi verificarlo disconnettendoti da internet e usando lo strumento offline.' },
        { q: 'Cos\'e il PBKDF2 e perche viene utilizzato?', a: 'PBKDF2 e un algoritmo che converte una password leggibile in una chiave crittografica. Applica l\'hashing SHA-256 100.000 volte con un salt casuale, rendendo estremamente lento per gli attaccanti provare molte password. Questo protegge anche password relativamente corte.' },
        { q: 'Posso decifrare su un dispositivo diverso?', a: 'Si, purche tu abbia la stringa Base64 cifrata e la stessa password usata per la cifratura, puoi decifrare su qualsiasi dispositivo usando questo strumento. Il salt e l\'IV sono inclusi nell\'output cifrato.' },
      ],
    },
    es: {
      title: 'Encriptador de Texto Gratis — Cifra y Descifra Texto Online con AES-256',
      paragraphs: [
        'El cifrado de texto es una de las herramientas mas importantes para la privacidad digital moderna. Ya sea que necesites proteger mensajes sensibles, almacenar notas confidenciales o compartir informacion privada de forma segura, el cifrado transforma el texto legible (texto plano) en un formato ilegible (texto cifrado) que solo puede decodificarse con la contrasena correcta. Nuestro encriptador gratuito utiliza cifrado AES-256-GCM de grado militar, el mismo estandar utilizado por gobiernos e instituciones financieras en todo el mundo.',
        'AES (Advanced Encryption Standard) es un cifrado de bloques simetrico adoptado por el gobierno de EE.UU. en 2001 tras un proceso de evaluacion de cinco anos. El "256" se refiere a la longitud de la clave en bits, proporcionando 2^256 combinaciones posibles — un numero tan astronomicamente grande que los ataques de fuerza bruta son computacionalmente inviables. El modo GCM (Galois/Counter Mode) agrega cifrado autenticado, verificando tanto la confidencialidad como la integridad de los datos.',
        'La derivacion de claves es un componente critico del cifrado basado en contrasenas. Nuestra herramienta utiliza PBKDF2 con 100.000 iteraciones y hash SHA-256 para transformar tu contrasena en una clave criptografica. Un salt aleatorio de 16 bytes se genera para cada operacion de cifrado, asegurando que contrasenas identicas produzcan claves de cifrado diferentes.',
        'La salida cifrada consiste en un salt aleatorio (16 bytes), un vector de inicializacion aleatorio (12 bytes) y el texto cifrado AES-GCM con etiqueta de autenticacion, todo concatenado y codificado en Base64. Todas las operaciones criptograficas se realizan completamente en tu navegador mediante la Web Crypto API, lo que significa que tu texto y contrasena nunca salen de tu dispositivo.',
      ],
      faq: [
        { q: 'Que tan seguro es el cifrado AES-256-GCM?', a: 'AES-256-GCM se considera uno de los estandares de cifrado mas fuertes disponibles. Esta aprobado por la NSA para proteger informacion ultra-secreta. Con una clave de 256 bits, los ataques de fuerza bruta son practicamente imposibles. El modo GCM tambien proporciona autenticacion de datos.' },
        { q: 'Alguien puede descifrar mi texto sin la contrasena?', a: 'No, sin la contrasena correcta es computacionalmente imposible descifrar texto cifrado con AES-256-GCM. Sin embargo, la seguridad depende de la fortaleza de tu contrasena. Usa una contrasena larga y unica con mezcla de letras, numeros y simbolos.' },
        { q: 'Mis datos se envian a algun servidor?', a: 'No, todas las operaciones de cifrado y descifrado ocurren completamente en tu navegador mediante la Web Crypto API. Tu texto y contrasena nunca salen de tu dispositivo.' },
        { q: 'Que es PBKDF2 y por que se usa?', a: 'PBKDF2 es un algoritmo que convierte una contrasena legible en una clave criptografica. Aplica hash SHA-256 100.000 veces con un salt aleatorio, haciendo extremadamente lento para los atacantes probar muchas contrasenas.' },
        { q: 'Puedo descifrar en un dispositivo diferente?', a: 'Si, siempre que tengas la cadena Base64 cifrada y la misma contrasena usada para el cifrado, puedes descifrar en cualquier dispositivo usando esta herramienta.' },
      ],
    },
    fr: {
      title: 'Chiffreur de Texte Gratuit — Chiffrez et Dechiffrez du Texte en Ligne avec AES-256',
      paragraphs: [
        'Le chiffrement de texte est l\'un des outils les plus importants pour la confidentialite numerique moderne. Que vous ayez besoin de proteger des messages sensibles, de stocker des notes confidentielles ou de partager des informations privees de maniere securisee, le chiffrement transforme le texte lisible (texte clair) en un format illisible (texte chiffre) qui ne peut etre decode qu\'avec le bon mot de passe. Notre chiffreur gratuit utilise le chiffrement AES-256-GCM de niveau militaire, le meme standard utilise par les gouvernements et institutions financieres du monde entier.',
        'AES (Advanced Encryption Standard) est un chiffrement par blocs symetrique adopte par le gouvernement americain en 2001 apres un processus d\'evaluation de cinq ans. Le "256" fait reference a la longueur de la cle en bits, offrant 2^256 combinaisons possibles — un nombre si astronomiquement grand que les attaques par force brute sont impossibles meme avec les superordinateurs les plus puissants. Le mode GCM (Galois/Counter Mode) ajoute un chiffrement authentifie, verifiant a la fois la confidentialite et l\'integrite des donnees.',
        'La derivation de cle est un composant critique du chiffrement base sur mot de passe. Notre outil utilise PBKDF2 avec 100 000 iterations et hachage SHA-256 pour transformer votre mot de passe en cle cryptographique. Un sel aleatoire de 16 octets est genere pour chaque operation de chiffrement, garantissant que des mots de passe identiques produisent des cles differentes.',
        'La sortie chiffree se compose d\'un sel aleatoire (16 octets), d\'un vecteur d\'initialisation aleatoire (12 octets) et du texte chiffre AES-GCM avec etiquette d\'authentification, le tout concatene et encode en Base64. Toutes les operations cryptographiques sont effectuees entierement dans votre navigateur via la Web Crypto API, ce qui signifie que votre texte et mot de passe ne quittent jamais votre appareil.',
      ],
      faq: [
        { q: 'Quelle est la securite du chiffrement AES-256-GCM ?', a: 'AES-256-GCM est considere comme l\'un des standards de chiffrement les plus robustes. Il est approuve par la NSA pour proteger les informations top-secret. Avec une cle de 256 bits, les attaques par force brute sont pratiquement impossibles. Le mode GCM fournit egalement l\'authentification des donnees.' },
        { q: 'Quelqu\'un peut-il dechiffrer mon texte sans le mot de passe ?', a: 'Non, sans le bon mot de passe, il est computationnellement impossible de dechiffrer un texte chiffre en AES-256-GCM. Cependant, la securite depend de la robustesse de votre mot de passe. Utilisez un mot de passe long et unique.' },
        { q: 'Mes donnees sont-elles envoyees a un serveur ?', a: 'Non, toutes les operations de chiffrement et dechiffrement se font entierement dans votre navigateur via la Web Crypto API. Votre texte et mot de passe ne quittent jamais votre appareil.' },
        { q: 'Qu\'est-ce que PBKDF2 et pourquoi est-il utilise ?', a: 'PBKDF2 est un algorithme qui convertit un mot de passe lisible en cle cryptographique. Il applique le hachage SHA-256 100 000 fois avec un sel aleatoire, rendant extremement lent pour les attaquants de tester de nombreux mots de passe.' },
        { q: 'Puis-je dechiffrer sur un autre appareil ?', a: 'Oui, tant que vous disposez de la chaine Base64 chiffree et du meme mot de passe utilise pour le chiffrement, vous pouvez dechiffrer sur n\'importe quel appareil avec cet outil.' },
      ],
    },
    de: {
      title: 'Kostenloser Text-Verschluesseler — Text Online mit AES-256 Ver- und Entschluesseln',
      paragraphs: [
        'Textverschluesselung ist eines der wichtigsten Werkzeuge fuer den modernen digitalen Datenschutz. Ob Sie sensible Nachrichten schuetzen, vertrauliche Notizen speichern oder private Informationen sicher teilen muessen — Verschluesselung verwandelt lesbaren Text (Klartext) in ein unlesbares Format (Chiffretext), das nur mit dem richtigen Passwort entschluesselt werden kann. Unser kostenloser Verschluesseler verwendet AES-256-GCM-Verschluesselung auf Militaerniveau, denselben Standard, dem Regierungen und Finanzinstitute weltweit vertrauen.',
        'AES (Advanced Encryption Standard) ist eine symmetrische Blockverschluesselung, die 2001 von der US-Regierung nach einem fuenfjaehrigen Evaluierungsprozess uebernommen wurde. Die "256" bezieht sich auf die Schluessellange in Bit und bietet 2^256 moegliche Kombinationen — eine so astronomisch grosse Zahl, dass Brute-Force-Angriffe selbst mit den leistungsfaehigsten Supercomputern rechnerisch unmoeglich sind. Der GCM-Modus (Galois/Counter Mode) fuegt authentifizierte Verschluesselung hinzu und verifiziert sowohl Vertraulichkeit als auch Integritaet der Daten.',
        'Die Schluesselableitung ist eine kritische Komponente der passwortbasierten Verschluesselung. Unser Tool verwendet PBKDF2 mit 100.000 Iterationen und SHA-256-Hashing, um Ihr Passwort in einen kryptographischen Schluessel umzuwandeln. Ein zufaelliges 16-Byte-Salt wird fuer jede Verschluesselungsoperation generiert, sodass identische Passwoerter unterschiedliche Verschluesselungsschluessel erzeugen.',
        'Die verschluesselte Ausgabe besteht aus einem zufaelligen Salt (16 Byte), einem zufaelligen Initialisierungsvektor (12 Byte) und dem AES-GCM-Chiffretext mit Authentifizierungs-Tag, alles verkettet und in Base64 kodiert. Alle kryptographischen Operationen werden vollstaendig in Ihrem Browser ueber die Web Crypto API ausgefuehrt, sodass Ihr Text und Passwort niemals Ihr Geraet verlassen.',
      ],
      faq: [
        { q: 'Wie sicher ist die AES-256-GCM-Verschluesselung?', a: 'AES-256-GCM gilt als einer der staerksten verfuegbaren Verschluesselungsstandards. Er ist von der NSA zum Schutz von Verschlusssachen zugelassen. Mit einem 256-Bit-Schluessel sind Brute-Force-Angriffe praktisch unmoeglich. Der GCM-Modus bietet zusaetzlich Datenauthentifizierung.' },
        { q: 'Kann jemand meinen Text ohne Passwort entschluesseln?', a: 'Nein, ohne das richtige Passwort ist es rechnerisch unmoeglich, AES-256-GCM-verschluesselten Text zu entschluesseln. Die Sicherheit haengt jedoch von der Staerke Ihres Passworts ab. Verwenden Sie ein langes, einzigartiges Passwort mit Buchstaben, Zahlen und Symbolen.' },
        { q: 'Werden meine Daten an einen Server gesendet?', a: 'Nein, alle Ver- und Entschluesselungsoperationen finden vollstaendig in Ihrem Browser ueber die Web Crypto API statt. Ihr Text und Passwort verlassen niemals Ihr Geraet.' },
        { q: 'Was ist PBKDF2 und warum wird es verwendet?', a: 'PBKDF2 ist ein Algorithmus, der ein lesbares Passwort in einen kryptographischen Schluessel umwandelt. Er wendet SHA-256-Hashing 100.000-mal mit einem zufaelligen Salt an, was es fuer Angreifer extrem langsam macht, viele Passwoerter auszuprobieren.' },
        { q: 'Kann ich auf einem anderen Geraet entschluesseln?', a: 'Ja, solange Sie die verschluesselte Base64-Zeichenkette und dasselbe Passwort haben, koennen Sie auf jedem Geraet mit diesem Tool entschluesseln.' },
      ],
    },
    pt: {
      title: 'Criptografador de Texto Gratis — Criptografe e Descriptografe Texto Online com AES-256',
      paragraphs: [
        'A criptografia de texto e uma das ferramentas mais importantes para a privacidade digital moderna. Seja para proteger mensagens sensiveis, armazenar notas confidenciais ou compartilhar informacoes privadas com seguranca, a criptografia transforma texto legivel (texto simples) em um formato ilegivel (texto cifrado) que so pode ser decodificado com a senha correta. Nosso criptografador gratuito utiliza criptografia AES-256-GCM de nivel militar, o mesmo padrao utilizado por governos e instituicoes financeiras em todo o mundo.',
        'AES (Advanced Encryption Standard) e uma cifra de blocos simetrica adotada pelo governo dos EUA em 2001 apos um processo de avaliacao de cinco anos. O "256" refere-se ao comprimento da chave em bits, fornecendo 2^256 combinacoes possiveis — um numero tao astronomicamente grande que ataques de forca bruta sao computacionalmente inviaveis. O modo GCM (Galois/Counter Mode) adiciona criptografia autenticada, verificando tanto a confidencialidade quanto a integridade dos dados.',
        'A derivacao de chave e um componente critico da criptografia baseada em senha. Nossa ferramenta utiliza PBKDF2 com 100.000 iteracoes e hash SHA-256 para transformar sua senha em uma chave criptografica. Um salt aleatorio de 16 bytes e gerado para cada operacao de criptografia, garantindo que senhas identicas produzam chaves de criptografia diferentes.',
        'A saida criptografada consiste em um salt aleatorio (16 bytes), um vetor de inicializacao aleatorio (12 bytes) e o texto cifrado AES-GCM com tag de autenticacao, tudo concatenado e codificado em Base64. Todas as operacoes criptograficas sao realizadas inteiramente no seu navegador atraves da Web Crypto API, o que significa que seu texto e senha nunca saem do seu dispositivo.',
      ],
      faq: [
        { q: 'Quao segura e a criptografia AES-256-GCM?', a: 'AES-256-GCM e considerado um dos padroes de criptografia mais fortes disponiveis. E aprovado pela NSA para proteger informacoes ultra-secretas. Com uma chave de 256 bits, ataques de forca bruta sao praticamente impossiveis. O modo GCM tambem fornece autenticacao de dados.' },
        { q: 'Alguem pode descriptografar meu texto sem a senha?', a: 'Nao, sem a senha correta e computacionalmente impossivel descriptografar texto cifrado com AES-256-GCM. Porem, a seguranca depende da forca da sua senha. Use uma senha longa e unica com letras, numeros e simbolos.' },
        { q: 'Meus dados sao enviados a algum servidor?', a: 'Nao, todas as operacoes de criptografia e descriptografia acontecem inteiramente no seu navegador atraves da Web Crypto API. Seu texto e senha nunca saem do seu dispositivo.' },
        { q: 'O que e PBKDF2 e por que e usado?', a: 'PBKDF2 e um algoritmo que converte uma senha legivel em uma chave criptografica. Aplica hash SHA-256 100.000 vezes com um salt aleatorio, tornando extremamente lento para atacantes tentarem muitas senhas.' },
        { q: 'Posso descriptografar em um dispositivo diferente?', a: 'Sim, desde que voce tenha a string Base64 criptografada e a mesma senha usada para criptografia, voce pode descriptografar em qualquer dispositivo usando esta ferramenta.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="text-encryptor" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {/* Security Note */}
          <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <p className="text-sm text-green-800 font-medium">{labels.securityNote[lang]}</p>
              <p className="text-xs text-green-600 mt-0.5">{labels.algorithm[lang]}</p>
            </div>
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.inputLabel[lang]}</label>
            <textarea
              value={inputText}
              onChange={(e) => { setInputText(e.target.value); setError(''); }}
              rows={5}
              placeholder={labels.inputPlaceholder[lang]}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
            />
            <div className="flex justify-end mt-1">
              {inputText && <span className="text-xs text-gray-400">{inputText.length} {labels.chars[lang]}</span>}
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.passwordLabel[lang]}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder={labels.passwordPlaceholder[lang]}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-20 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-md border border-gray-200 transition-colors"
              >
                {showPassword ? labels.hidePassword[lang] : labels.showPassword[lang]}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleEncrypt}
              disabled={processing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {labels.encrypt[lang]}
            </button>
            <button
              onClick={handleDecrypt}
              disabled={processing}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              {labels.decrypt[lang]}
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg border border-gray-200 transition-colors"
            >
              {labels.reset[lang]}
            </button>
          </div>

          {/* Output */}
          {outputText && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">{labels.outputLabel[lang]}</label>
                <button
                  onClick={handleCopy}
                  className="text-xs bg-white hover:bg-gray-50 text-gray-700 px-3 py-1 rounded-md border border-gray-200 transition-colors flex items-center gap-1"
                >
                  {copied ? (
                    <><svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> {t.copied}</>
                  ) : (
                    <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> {t.copy}</>
                  )}
                </button>
              </div>
              <textarea
                readOnly
                value={outputText}
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm bg-gray-50 select-all resize-y outline-none"
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-gray-400">{outputText.length} {labels.chars[lang]}</span>
              </div>
            </div>
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
