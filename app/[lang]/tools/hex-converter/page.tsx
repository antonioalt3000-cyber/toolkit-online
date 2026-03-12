'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  decimal: { en: 'Decimal', it: 'Decimale', es: 'Decimal', fr: 'Décimal', de: 'Dezimal', pt: 'Decimal' },
  hexadecimal: { en: 'Hexadecimal', it: 'Esadecimale', es: 'Hexadecimal', fr: 'Hexadécimal', de: 'Hexadezimal', pt: 'Hexadecimal' },
  binary: { en: 'Binary', it: 'Binario', es: 'Binario', fr: 'Binaire', de: 'Binär', pt: 'Binário' },
  octal: { en: 'Octal', it: 'Ottale', es: 'Octal', fr: 'Octal', de: 'Oktal', pt: 'Octal' },
  inputAs: { en: 'Input as', it: 'Inserisci come', es: 'Entrada como', fr: 'Entrée en', de: 'Eingabe als', pt: 'Entrada como' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  invalid: { en: 'Invalid input', it: 'Input non valido', es: 'Entrada inválida', fr: 'Entrée invalide', de: 'Ungültige Eingabe', pt: 'Entrada inválida' },
};

type Base = 'decimal' | 'hexadecimal' | 'binary' | 'octal';

function parseInput(value: string, base: Base): number | null {
  if (!value.trim()) return null;
  try {
    let num: number;
    switch (base) {
      case 'decimal': num = parseInt(value, 10); break;
      case 'hexadecimal': num = parseInt(value.replace(/^0x/i, ''), 16); break;
      case 'binary': num = parseInt(value.replace(/^0b/i, ''), 2); break;
      case 'octal': num = parseInt(value.replace(/^0o/i, ''), 8); break;
    }
    return isNaN(num) ? null : num;
  } catch {
    return null;
  }
}

function formatOutput(num: number, base: Base): string {
  switch (base) {
    case 'decimal': return num.toString(10);
    case 'hexadecimal': return num.toString(16).toUpperCase();
    case 'binary': return num.toString(2);
    case 'octal': return num.toString(8);
  }
}

export default function HexConverter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['hex-converter'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [inputBase, setInputBase] = useState<Base>('decimal');
  const [input, setInput] = useState('255');
  const [copiedField, setCopiedField] = useState('');

  const num = parseInput(input, inputBase);
  const isValid = num !== null;

  const bases: Base[] = ['decimal', 'hexadecimal', 'binary', 'octal'];
  const prefixes: Record<Base, string> = {
    decimal: '',
    hexadecimal: '0x',
    binary: '0b',
    octal: '0o',
  };

  const copyValue = (base: Base) => {
    if (num === null) return;
    const val = prefixes[base] + formatOutput(num, base);
    navigator.clipboard.writeText(val);
    setCopiedField(base);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Hex Converter: Convert Between Decimal, Hexadecimal, Binary & Octal',
      paragraphs: [
        'Number base conversion is a fundamental skill in programming, computer science, and digital electronics. Our free hex converter lets you instantly convert between decimal (base 10), hexadecimal (base 16), binary (base 2), and octal (base 8) number systems. Simply enter a number in any base and see all four representations simultaneously.',
        'Hexadecimal is widely used in programming because it provides a compact way to represent binary data. Each hex digit maps to exactly 4 binary digits (bits), so a byte (8 bits) can be represented as exactly 2 hex digits. This makes hex ideal for representing memory addresses, color codes, MAC addresses, and raw binary data in a human-readable format.',
        'Binary is the fundamental language of computers, where all data is ultimately represented as sequences of 0s and 1s. Understanding binary helps with bit manipulation, network subnet masks, file permissions in Unix systems, and low-level programming. Octal (base 8) is commonly used for Unix file permissions (chmod) and was historically used in some computing contexts.',
        'The converter supports standard prefixes: 0x for hexadecimal (e.g., 0xFF), 0b for binary (e.g., 0b11111111), and 0o for octal (e.g., 0o377). Each converted value includes a copy button for quick clipboard access, making it easy to use the results in your code, documentation, or calculations.',
      ],
      faq: [
        { q: 'How do I convert decimal to hexadecimal?', a: 'Divide the decimal number by 16 repeatedly, recording remainders. The hex digits are the remainders read bottom-to-top. For example, 255 / 16 = 15 remainder 15 = FF in hex. Our tool does this conversion instantly for you.' },
        { q: 'Why do programmers use hexadecimal?', a: 'Hex is compact (2 digits per byte vs 8 binary digits), easy to convert to/from binary (each hex digit = 4 bits), and widely used for memory addresses, color codes (#FF0000), MAC addresses, and debugging raw data. It strikes a balance between binary precision and human readability.' },
        { q: 'What is the binary representation of common decimal numbers?', a: 'Some common values: 0 = 0, 1 = 1, 10 = 1010, 100 = 1100100, 255 = 11111111, 256 = 100000000. Powers of 2 are especially clean in binary: 1, 10, 100, 1000, etc.' },
        { q: 'How are octal numbers used in Unix file permissions?', a: 'Unix permissions use 3 octal digits for owner, group, and others. Each digit represents read (4), write (2), and execute (1) permissions. For example, chmod 755 means rwxr-xr-x (owner: full, group: read+execute, others: read+execute).' },
        { q: 'What is the maximum value of a single byte in each number system?', a: 'A byte (8 bits) can hold values from 0 to 255 in decimal, 00 to FF in hexadecimal, 00000000 to 11111111 in binary, and 000 to 377 in octal.' },
      ],
    },
    it: {
      title: 'Convertitore Esadecimale: Converti tra Decimale, Esadecimale, Binario e Ottale',
      paragraphs: [
        'La conversione tra basi numeriche è una competenza fondamentale nella programmazione, nell\'informatica e nell\'elettronica digitale. Il nostro convertitore esadecimale gratuito permette di convertire istantaneamente tra decimale (base 10), esadecimale (base 16), binario (base 2) e ottale (base 8).',
        'L\'esadecimale è ampiamente usato nella programmazione perché offre un modo compatto per rappresentare dati binari. Ogni cifra esadecimale corrisponde a esattamente 4 cifre binarie (bit), quindi un byte (8 bit) può essere rappresentato come esattamente 2 cifre esadecimali.',
        'Il binario è il linguaggio fondamentale dei computer, dove tutti i dati sono rappresentati come sequenze di 0 e 1. Comprendere il binario aiuta con la manipolazione dei bit, le maschere di sottorete, i permessi dei file Unix e la programmazione a basso livello.',
        'Il convertitore supporta i prefissi standard: 0x per esadecimale, 0b per binario e 0o per ottale. Ogni valore convertito include un pulsante di copia per un rapido accesso agli appunti.',
      ],
      faq: [
        { q: 'Come converto decimale in esadecimale?', a: 'Dividi il numero decimale per 16 ripetutamente, registrando i resti. Le cifre esadecimali sono i resti letti dal basso verso l\'alto. Per esempio, 255 / 16 = 15 resto 15 = FF in esadecimale.' },
        { q: 'Perché i programmatori usano l\'esadecimale?', a: 'L\'esadecimale è compatto (2 cifre per byte vs 8 cifre binarie), facile da convertire in/da binario e ampiamente usato per indirizzi di memoria, codici colore, indirizzi MAC e debugging.' },
        { q: 'Qual è la rappresentazione binaria dei numeri decimali comuni?', a: 'Alcuni valori comuni: 0 = 0, 1 = 1, 10 = 1010, 100 = 1100100, 255 = 11111111, 256 = 100000000.' },
        { q: 'Come si usano i numeri ottali nei permessi Unix?', a: 'I permessi Unix usano 3 cifre ottali. Ogni cifra rappresenta lettura (4), scrittura (2) ed esecuzione (1). Per esempio, chmod 755 significa rwxr-xr-x.' },
        { q: 'Qual è il valore massimo di un singolo byte in ogni sistema numerico?', a: 'Un byte può contenere valori da 0 a 255 in decimale, 00 a FF in esadecimale, 00000000 a 11111111 in binario e 000 a 377 in ottale.' },
      ],
    },
    es: {
      title: 'Convertidor Hexadecimal: Convierte entre Decimal, Hexadecimal, Binario y Octal',
      paragraphs: [
        'La conversión entre bases numéricas es una habilidad fundamental en programación, ciencias de la computación y electrónica digital. Nuestro convertidor hexadecimal gratuito permite convertir instantáneamente entre decimal (base 10), hexadecimal (base 16), binario (base 2) y octal (base 8).',
        'El hexadecimal se usa ampliamente en programación porque ofrece una forma compacta de representar datos binarios. Cada dígito hexadecimal corresponde a exactamente 4 dígitos binarios.',
        'El binario es el lenguaje fundamental de las computadoras. Entender binario ayuda con manipulación de bits, máscaras de subred, permisos de archivos Unix y programación de bajo nivel.',
        'El convertidor soporta prefijos estándar: 0x para hexadecimal, 0b para binario y 0o para octal. Cada valor incluye un botón de copia.',
      ],
      faq: [
        { q: '¿Cómo convierto decimal a hexadecimal?', a: 'Divide el número decimal entre 16 repetidamente, registrando los restos. Los dígitos hex son los restos leídos de abajo hacia arriba.' },
        { q: '¿Por qué los programadores usan hexadecimal?', a: 'Es compacto (2 dígitos por byte), fácil de convertir a/desde binario y ampliamente usado para direcciones de memoria, códigos de color y direcciones MAC.' },
        { q: '¿Cuál es la representación binaria de números decimales comunes?', a: '0 = 0, 1 = 1, 10 = 1010, 100 = 1100100, 255 = 11111111, 256 = 100000000.' },
        { q: '¿Cómo se usan los números octales en permisos Unix?', a: 'Los permisos Unix usan 3 dígitos octales. Cada dígito representa lectura (4), escritura (2) y ejecución (1). chmod 755 significa rwxr-xr-x.' },
        { q: '¿Cuál es el valor máximo de un byte en cada sistema?', a: 'Un byte: 0-255 en decimal, 00-FF en hexadecimal, 00000000-11111111 en binario, 000-377 en octal.' },
      ],
    },
    fr: {
      title: 'Convertisseur Hexadécimal : Convertir entre Décimal, Hexadécimal, Binaire et Octal',
      paragraphs: [
        'La conversion entre bases numériques est une compétence fondamentale en programmation, informatique et électronique numérique. Notre convertisseur hexadécimal gratuit permet de convertir instantanément entre décimal (base 10), hexadécimal (base 16), binaire (base 2) et octal (base 8).',
        'L\'hexadécimal est largement utilisé en programmation car il offre un moyen compact de représenter des données binaires. Chaque chiffre hexadécimal correspond à exactement 4 chiffres binaires.',
        'Le binaire est le langage fondamental des ordinateurs. Comprendre le binaire aide avec la manipulation de bits, les masques de sous-réseau, les permissions de fichiers Unix et la programmation bas niveau.',
        'Le convertisseur supporte les préfixes standard : 0x pour hexadécimal, 0b pour binaire et 0o pour octal.',
      ],
      faq: [
        { q: 'Comment convertir décimal en hexadécimal ?', a: 'Divisez le nombre décimal par 16 de manière répétée en enregistrant les restes. Les chiffres hex sont les restes lus de bas en haut.' },
        { q: 'Pourquoi les programmeurs utilisent-ils l\'hexadécimal ?', a: 'C\'est compact (2 chiffres par octet), facile à convertir en/depuis binaire et largement utilisé pour les adresses mémoire, codes couleur et adresses MAC.' },
        { q: 'Quelle est la représentation binaire des nombres décimaux courants ?', a: '0 = 0, 1 = 1, 10 = 1010, 100 = 1100100, 255 = 11111111, 256 = 100000000.' },
        { q: 'Comment les nombres octaux sont-ils utilisés dans les permissions Unix ?', a: 'Les permissions Unix utilisent 3 chiffres octaux. Chaque chiffre représente lecture (4), écriture (2) et exécution (1). chmod 755 signifie rwxr-xr-x.' },
        { q: 'Quelle est la valeur maximale d\'un octet dans chaque système ?', a: 'Un octet : 0-255 en décimal, 00-FF en hexadécimal, 00000000-11111111 en binaire, 000-377 en octal.' },
      ],
    },
    de: {
      title: 'Hex-Konverter: Zwischen Dezimal, Hexadezimal, Binär und Oktal Konvertieren',
      paragraphs: [
        'Die Konvertierung zwischen Zahlensystemen ist eine grundlegende Fähigkeit in Programmierung, Informatik und digitaler Elektronik. Unser kostenloser Hex-Konverter ermöglicht sofortige Konvertierung zwischen Dezimal (Basis 10), Hexadezimal (Basis 16), Binär (Basis 2) und Oktal (Basis 8).',
        'Hexadezimal wird in der Programmierung häufig verwendet, da es eine kompakte Darstellung von Binärdaten bietet. Jede Hex-Ziffer entspricht genau 4 Binärziffern.',
        'Binär ist die Grundsprache der Computer. Das Verständnis von Binär hilft bei Bit-Manipulation, Subnetzmasken, Unix-Dateiberechtigungen und Low-Level-Programmierung.',
        'Der Konverter unterstützt Standardpräfixe: 0x für Hexadezimal, 0b für Binär und 0o für Oktal.',
      ],
      faq: [
        { q: 'Wie konvertiere ich Dezimal in Hexadezimal?', a: 'Teilen Sie die Dezimalzahl wiederholt durch 16 und notieren Sie die Reste. Die Hex-Ziffern sind die Reste von unten nach oben gelesen.' },
        { q: 'Warum verwenden Programmierer Hexadezimal?', a: 'Es ist kompakt (2 Ziffern pro Byte), einfach in/aus Binär zu konvertieren und wird häufig für Speicheradressen, Farbcodes und MAC-Adressen verwendet.' },
        { q: 'Was ist die Binärdarstellung gängiger Dezimalzahlen?', a: '0 = 0, 1 = 1, 10 = 1010, 100 = 1100100, 255 = 11111111, 256 = 100000000.' },
        { q: 'Wie werden Oktalzahlen in Unix-Berechtigungen verwendet?', a: 'Unix-Berechtigungen verwenden 3 Oktalziffern. Jede Ziffer steht für Lesen (4), Schreiben (2) und Ausführen (1). chmod 755 bedeutet rwxr-xr-x.' },
        { q: 'Was ist der maximale Wert eines Bytes in jedem System?', a: 'Ein Byte: 0-255 dezimal, 00-FF hexadezimal, 00000000-11111111 binär, 000-377 oktal.' },
      ],
    },
    pt: {
      title: 'Conversor Hexadecimal: Converta entre Decimal, Hexadecimal, Binário e Octal',
      paragraphs: [
        'A conversão entre bases numéricas é uma habilidade fundamental em programação, ciência da computação e eletrônica digital. Nosso conversor hexadecimal gratuito permite converter instantaneamente entre decimal (base 10), hexadecimal (base 16), binário (base 2) e octal (base 8).',
        'O hexadecimal é amplamente usado em programação porque oferece uma forma compacta de representar dados binários. Cada dígito hexadecimal corresponde a exatamente 4 dígitos binários.',
        'O binário é a linguagem fundamental dos computadores. Entender binário ajuda com manipulação de bits, máscaras de sub-rede, permissões de arquivos Unix e programação de baixo nível.',
        'O conversor suporta prefixos padrão: 0x para hexadecimal, 0b para binário e 0o para octal.',
      ],
      faq: [
        { q: 'Como converto decimal para hexadecimal?', a: 'Divida o número decimal por 16 repetidamente, registrando os restos. Os dígitos hex são os restos lidos de baixo para cima.' },
        { q: 'Por que programadores usam hexadecimal?', a: 'É compacto (2 dígitos por byte), fácil de converter de/para binário e amplamente usado para endereços de memória, códigos de cor e endereços MAC.' },
        { q: 'Qual é a representação binária de números decimais comuns?', a: '0 = 0, 1 = 1, 10 = 1010, 100 = 1100100, 255 = 11111111, 256 = 100000000.' },
        { q: 'Como os números octais são usados em permissões Unix?', a: 'Permissões Unix usam 3 dígitos octais. Cada dígito representa leitura (4), escrita (2) e execução (1). chmod 755 significa rwxr-xr-x.' },
        { q: 'Qual é o valor máximo de um byte em cada sistema?', a: 'Um byte: 0-255 em decimal, 00-FF em hexadecimal, 00000000-11111111 em binário, 000-377 em octal.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="hex-converter" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('inputAs')}</label>
            <div className="flex gap-2 flex-wrap">
              {bases.map((base) => (
                <button
                  key={base}
                  onClick={() => {
                    if (num !== null) setInput(formatOutput(num, base));
                    setInputBase(base);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    inputBase === base ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t(base)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={inputBase === 'decimal' ? '255' : inputBase === 'hexadecimal' ? 'FF' : inputBase === 'binary' ? '11111111' : '377'}
              className={`w-full border rounded-lg px-4 py-2 text-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                input && !isValid ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {input && !isValid && <p className="text-red-500 text-sm mt-1">{t('invalid')}</p>}
          </div>

          {isValid && (
            <div className="space-y-2">
              {bases.map((base) => (
                <div key={base} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">{t(base)}</span>
                    <p className="font-mono font-semibold text-gray-900">
                      <span className="text-gray-400">{prefixes[base]}</span>
                      {formatOutput(num, base)}
                    </p>
                  </div>
                  <button
                    onClick={() => copyValue(base)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {copiedField === base ? t('copied') : t('copy')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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
