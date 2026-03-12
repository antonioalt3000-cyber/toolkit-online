'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function BinaryConverter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['binary-converter'][lang];

  const [inputValue, setInputValue] = useState('');
  const [inputBase, setInputBase] = useState<'bin' | 'dec' | 'hex' | 'oct'>('dec');

  const labels = {
    inputLabel: { en: 'Enter Value', it: 'Inserisci Valore', es: 'Ingresa Valor', fr: 'Entrer la Valeur', de: 'Wert Eingeben', pt: 'Inserir Valor' },
    fromBase: { en: 'From Base', it: 'Da Base', es: 'Desde Base', fr: 'De la Base', de: 'Von Basis', pt: 'Da Base' },
    binary: { en: 'Binary (2)', it: 'Binario (2)', es: 'Binario (2)', fr: 'Binaire (2)', de: 'Binär (2)', pt: 'Binário (2)' },
    decimal: { en: 'Decimal (10)', it: 'Decimale (10)', es: 'Decimal (10)', fr: 'Décimal (10)', de: 'Dezimal (10)', pt: 'Decimal (10)' },
    hexadecimal: { en: 'Hexadecimal (16)', it: 'Esadecimale (16)', es: 'Hexadecimal (16)', fr: 'Hexadécimal (16)', de: 'Hexadezimal (16)', pt: 'Hexadecimal (16)' },
    octal: { en: 'Octal (8)', it: 'Ottale (8)', es: 'Octal (8)', fr: 'Octal (8)', de: 'Oktal (8)', pt: 'Octal (8)' },
    results: { en: 'Conversion Results', it: 'Risultati Conversione', es: 'Resultados de Conversión', fr: 'Résultats de Conversion', de: 'Konvertierungsergebnisse', pt: 'Resultados da Conversão' },
    invalid: { en: 'Invalid input', it: 'Input non valido', es: 'Entrada no válida', fr: 'Entrée invalide', de: 'Ungültige Eingabe', pt: 'Entrada inválida' },
    copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  } as Record<string, Record<Locale, string>>;

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const parseInput = (): number | null => {
    const val = inputValue.trim();
    if (!val) return null;
    try {
      let num: number;
      switch (inputBase) {
        case 'bin': num = parseInt(val, 2); break;
        case 'dec': num = parseInt(val, 10); break;
        case 'hex': num = parseInt(val, 16); break;
        case 'oct': num = parseInt(val, 8); break;
      }
      return isNaN(num) ? null : num;
    } catch {
      return null;
    }
  };

  const num = parseInput();
  const isValid = num !== null && num >= 0;

  const results = isValid ? {
    bin: num.toString(2),
    dec: num.toString(10),
    hex: num.toString(16).toUpperCase(),
    oct: num.toString(8),
  } : null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Binary Converter – Convert Between Binary, Decimal, Hex & Octal',
      paragraphs: [
        'Number system conversion is an essential skill in computer science and digital electronics. Different number bases serve different purposes: binary (base 2) is the foundation of all digital computing, decimal (base 10) is what we use daily, hexadecimal (base 16) provides compact representation of binary data, and octal (base 8) was historically important in early computing systems.',
        'Our binary converter handles all four major number systems seamlessly. Enter a value in any base and instantly see its representation in all other bases. This is invaluable for programmers working with memory addresses, color codes, file permissions, network configurations, and low-level system operations.',
        'Binary numbers use only 0 and 1, making them perfect for digital circuits that operate on two voltage levels. Hexadecimal condenses every 4 binary digits into a single character (0-9, A-F), which is why programmers prefer it for representing memory addresses and color values like #FF5733.',
        'Understanding number systems helps developers debug code, work with bitwise operations, interpret machine code, configure network settings (subnet masks, IP addresses), set Unix file permissions, and understand how data is stored and transmitted at the hardware level.',
      ],
      faq: [
        { q: 'How do I convert binary to decimal?', a: 'To convert binary to decimal, multiply each digit by 2 raised to its position power (starting from 0 on the right) and sum the results. For example, binary 1101 = 1x8 + 1x4 + 0x2 + 1x1 = 13 in decimal. Our converter does this automatically.' },
        { q: 'Why is hexadecimal used in programming?', a: 'Hexadecimal is popular because each hex digit represents exactly 4 binary digits (bits), making it a compact way to represent binary data. A single byte (8 bits) can be written as just 2 hex digits. This is much easier to read than long binary strings, especially for memory addresses and color codes.' },
        { q: 'What is the difference between binary and decimal?', a: 'Binary (base 2) uses only digits 0 and 1, while decimal (base 10) uses digits 0-9. Computers use binary because digital circuits have two states (on/off). Humans use decimal because we have 10 fingers. The same number can be expressed in both: decimal 255 = binary 11111111.' },
        { q: 'How is octal used in computing?', a: 'Octal (base 8) is commonly used in Unix/Linux file permissions. Each permission set (read=4, write=2, execute=1) fits in one octal digit. For example, chmod 755 means owner has full access (7=rwx), group and others have read+execute (5=r-x).' },
        { q: 'Can this converter handle large numbers?', a: 'This converter works with JavaScript integers, which can safely represent values up to 2^53 - 1 (9,007,199,254,740,991 in decimal). For most programming and educational purposes, this range is more than sufficient.' },
      ],
    },
    it: {
      title: 'Convertitore Binario Gratuito – Converti tra Binario, Decimale, Esadecimale e Ottale',
      paragraphs: [
        'La conversione tra sistemi numerici è una competenza essenziale nell\'informatica e nell\'elettronica digitale. Diversi sistemi servono scopi diversi: il binario (base 2) è il fondamento di tutto il calcolo digitale, il decimale (base 10) è quello che usiamo quotidianamente, l\'esadecimale (base 16) fornisce una rappresentazione compatta dei dati binari.',
        'Il nostro convertitore gestisce tutti e quattro i principali sistemi numerici. Inserisci un valore in qualsiasi base e vedi istantaneamente la sua rappresentazione in tutte le altre basi. Questo è prezioso per i programmatori che lavorano con indirizzi di memoria, codici colore e operazioni di sistema.',
        'I numeri binari usano solo 0 e 1, rendendoli perfetti per i circuiti digitali. L\'esadecimale condensa ogni 4 cifre binarie in un singolo carattere (0-9, A-F), motivo per cui i programmatori lo preferiscono per rappresentare indirizzi di memoria e colori come #FF5733.',
        'Comprendere i sistemi numerici aiuta gli sviluppatori a eseguire il debug del codice, lavorare con operazioni bit a bit, interpretare il codice macchina e configurare le impostazioni di rete.',
      ],
      faq: [
        { q: 'Come si converte il binario in decimale?', a: 'Per convertire il binario in decimale, moltiplica ogni cifra per 2 elevato alla potenza della sua posizione e somma i risultati. Per esempio, binario 1101 = 1x8 + 1x4 + 0x2 + 1x1 = 13 in decimale.' },
        { q: 'Perché si usa l\'esadecimale nella programmazione?', a: 'L\'esadecimale è popolare perché ogni cifra hex rappresenta esattamente 4 cifre binarie. Un byte (8 bit) può essere scritto come sole 2 cifre hex, molto più leggibile delle lunghe stringhe binarie.' },
        { q: 'Qual è la differenza tra binario e decimale?', a: 'Il binario (base 2) usa solo le cifre 0 e 1, mentre il decimale (base 10) usa le cifre 0-9. I computer usano il binario perché i circuiti digitali hanno due stati. Il decimale 255 = binario 11111111.' },
        { q: 'Come si usa l\'ottale nell\'informatica?', a: 'L\'ottale (base 8) è comunemente usato nei permessi dei file Unix/Linux. Ogni set di permessi (lettura=4, scrittura=2, esecuzione=1) sta in una cifra ottale. Per esempio, chmod 755.' },
        { q: 'Questo convertitore gestisce numeri grandi?', a: 'Questo convertitore funziona con numeri interi JavaScript, che possono rappresentare valori fino a 2^53 - 1 (9.007.199.254.740.991 in decimale).' },
      ],
    },
    es: {
      title: 'Conversor Binario Gratis – Convierte entre Binario, Decimal, Hex y Octal',
      paragraphs: [
        'La conversión entre sistemas numéricos es una habilidad esencial en informática y electrónica digital. Diferentes bases sirven diferentes propósitos: binario (base 2) es la base de toda la computación digital, decimal (base 10) es lo que usamos diariamente, hexadecimal (base 16) proporciona representación compacta de datos binarios.',
        'Nuestro conversor maneja los cuatro sistemas numéricos principales. Ingresa un valor en cualquier base y ve instantáneamente su representación en todas las demás bases. Esto es invaluable para programadores que trabajan con direcciones de memoria y códigos de color.',
        'Los números binarios usan solo 0 y 1, haciéndolos perfectos para circuitos digitales. El hexadecimal condensa cada 4 dígitos binarios en un solo carácter (0-9, A-F), por eso los programadores lo prefieren para representar colores como #FF5733.',
        'Entender los sistemas numéricos ayuda a los desarrolladores a depurar código, trabajar con operaciones bit a bit e interpretar código máquina.',
      ],
      faq: [
        { q: '¿Cómo se convierte binario a decimal?', a: 'Multiplica cada dígito por 2 elevado a la potencia de su posición y suma los resultados. Por ejemplo, binario 1101 = 1x8 + 1x4 + 0x2 + 1x1 = 13 en decimal.' },
        { q: '¿Por qué se usa hexadecimal en programación?', a: 'Cada dígito hex representa exactamente 4 dígitos binarios. Un byte (8 bits) se puede escribir como solo 2 dígitos hex, mucho más legible que largas cadenas binarias.' },
        { q: '¿Cuál es la diferencia entre binario y decimal?', a: 'Binario (base 2) usa solo 0 y 1, mientras que decimal (base 10) usa 0-9. Las computadoras usan binario porque los circuitos tienen dos estados. Decimal 255 = binario 11111111.' },
        { q: '¿Cómo se usa el octal en computación?', a: 'El octal (base 8) se usa comúnmente en permisos de archivos Unix/Linux. Cada conjunto de permisos (lectura=4, escritura=2, ejecución=1) cabe en un dígito octal.' },
        { q: '¿Maneja números grandes?', a: 'Este conversor trabaja con enteros JavaScript que pueden representar valores hasta 2^53 - 1 (9,007,199,254,740,991 en decimal).' },
      ],
    },
    fr: {
      title: 'Convertisseur Binaire Gratuit – Convertissez entre Binaire, Décimal, Hex et Octal',
      paragraphs: [
        'La conversion entre systèmes numériques est une compétence essentielle en informatique et électronique numérique. Différentes bases servent différents objectifs : binaire (base 2) est le fondement du calcul numérique, décimal (base 10) est notre système quotidien, hexadécimal (base 16) offre une représentation compacte des données binaires.',
        'Notre convertisseur gère les quatre principaux systèmes numériques. Entrez une valeur dans n\'importe quelle base et voyez instantanément sa représentation dans toutes les autres. C\'est précieux pour les programmeurs travaillant avec des adresses mémoire et des codes couleur.',
        'Les nombres binaires n\'utilisent que 0 et 1, les rendant parfaits pour les circuits numériques. L\'hexadécimal condense chaque 4 chiffres binaires en un seul caractère (0-9, A-F), c\'est pourquoi les programmeurs le préfèrent.',
        'Comprendre les systèmes numériques aide les développeurs à déboguer le code, travailler avec des opérations bit à bit et interpréter le code machine.',
      ],
      faq: [
        { q: 'Comment convertir du binaire en décimal ?', a: 'Multipliez chaque chiffre par 2 élevé à la puissance de sa position et additionnez les résultats. Par exemple, binaire 1101 = 1x8 + 1x4 + 0x2 + 1x1 = 13 en décimal.' },
        { q: 'Pourquoi utilise-t-on l\'hexadécimal ?', a: 'Chaque chiffre hex représente exactement 4 chiffres binaires. Un octet (8 bits) s\'écrit en seulement 2 chiffres hex, beaucoup plus lisible que de longues chaînes binaires.' },
        { q: 'Quelle est la différence entre binaire et décimal ?', a: 'Le binaire (base 2) n\'utilise que 0 et 1, tandis que le décimal (base 10) utilise 0-9. Les ordinateurs utilisent le binaire car les circuits ont deux états. Décimal 255 = binaire 11111111.' },
        { q: 'Comment l\'octal est-il utilisé ?', a: 'L\'octal (base 8) est couramment utilisé pour les permissions de fichiers Unix/Linux. Chaque ensemble de permissions (lecture=4, écriture=2, exécution=1) tient dans un chiffre octal.' },
        { q: 'Ce convertisseur gère-t-il les grands nombres ?', a: 'Ce convertisseur fonctionne avec les entiers JavaScript pouvant représenter des valeurs jusqu\'à 2^53 - 1 (9 007 199 254 740 991 en décimal).' },
      ],
    },
    de: {
      title: 'Kostenloser Binärkonverter – Zwischen Binär, Dezimal, Hex und Oktal Konvertieren',
      paragraphs: [
        'Die Umrechnung zwischen Zahlensystemen ist eine wesentliche Fähigkeit in der Informatik und Digitalelektronik. Verschiedene Basen dienen verschiedenen Zwecken: Binär (Basis 2) ist die Grundlage aller digitalen Berechnungen, Dezimal (Basis 10) verwenden wir täglich, Hexadezimal (Basis 16) bietet kompakte Darstellung binärer Daten.',
        'Unser Konverter verarbeitet alle vier wichtigen Zahlensysteme. Geben Sie einen Wert in einer beliebigen Basis ein und sehen Sie sofort seine Darstellung in allen anderen Basen. Dies ist für Programmierer bei der Arbeit mit Speicheradressen und Farbcodes unverzichtbar.',
        'Binärzahlen verwenden nur 0 und 1, perfekt für digitale Schaltkreise. Hexadezimal fasst jeweils 4 Binärziffern in ein einzelnes Zeichen (0-9, A-F) zusammen, weshalb Programmierer es für Farbwerte wie #FF5733 bevorzugen.',
        'Das Verständnis von Zahlensystemen hilft Entwicklern beim Debuggen, bei Bitoperationen und beim Interpretieren von Maschinencode.',
      ],
      faq: [
        { q: 'Wie konvertiert man Binär in Dezimal?', a: 'Multiplizieren Sie jede Ziffer mit 2 hoch der Positionsnummer und addieren Sie die Ergebnisse. Beispiel: Binär 1101 = 1x8 + 1x4 + 0x2 + 1x1 = 13 dezimal.' },
        { q: 'Warum wird Hexadezimal in der Programmierung verwendet?', a: 'Jede Hex-Ziffer repräsentiert genau 4 Binärziffern. Ein Byte (8 Bits) lässt sich als nur 2 Hex-Ziffern schreiben, viel lesbarer als lange Binärzeichenfolgen.' },
        { q: 'Was ist der Unterschied zwischen Binär und Dezimal?', a: 'Binär (Basis 2) verwendet nur 0 und 1, während Dezimal (Basis 10) 0-9 verwendet. Computer nutzen Binär, weil Schaltkreise zwei Zustände haben. Dezimal 255 = Binär 11111111.' },
        { q: 'Wie wird Oktal in der Informatik verwendet?', a: 'Oktal (Basis 8) wird häufig für Unix/Linux-Dateiberechtigungen verwendet. Jeder Berechtigungssatz (Lesen=4, Schreiben=2, Ausführen=1) passt in eine Oktalziffer.' },
        { q: 'Verarbeitet dieser Konverter große Zahlen?', a: 'Dieser Konverter arbeitet mit JavaScript-Ganzzahlen, die Werte bis 2^53 - 1 (9.007.199.254.740.991 dezimal) sicher darstellen können.' },
      ],
    },
    pt: {
      title: 'Conversor Binário Grátis – Converta entre Binário, Decimal, Hex e Octal',
      paragraphs: [
        'A conversão entre sistemas numéricos é uma habilidade essencial em ciência da computação e eletrônica digital. Diferentes bases servem diferentes propósitos: binário (base 2) é a base de toda computação digital, decimal (base 10) é o que usamos diariamente, hexadecimal (base 16) fornece representação compacta de dados binários.',
        'Nosso conversor lida com os quatro principais sistemas numéricos. Insira um valor em qualquer base e veja instantaneamente sua representação em todas as outras. Isso é valioso para programadores trabalhando com endereços de memória e códigos de cores.',
        'Números binários usam apenas 0 e 1, perfeitos para circuitos digitais. O hexadecimal condensa cada 4 dígitos binários em um único caractere (0-9, A-F), por isso programadores o preferem para representar cores como #FF5733.',
        'Entender sistemas numéricos ajuda desenvolvedores a depurar código, trabalhar com operações bit a bit e interpretar código de máquina.',
      ],
      faq: [
        { q: 'Como converter binário para decimal?', a: 'Multiplique cada dígito por 2 elevado à potência de sua posição e some os resultados. Por exemplo, binário 1101 = 1x8 + 1x4 + 0x2 + 1x1 = 13 em decimal.' },
        { q: 'Por que se usa hexadecimal na programação?', a: 'Cada dígito hex representa exatamente 4 dígitos binários. Um byte (8 bits) pode ser escrito como apenas 2 dígitos hex, muito mais legível que longas strings binárias.' },
        { q: 'Qual a diferença entre binário e decimal?', a: 'Binário (base 2) usa apenas 0 e 1, enquanto decimal (base 10) usa 0-9. Computadores usam binário porque circuitos têm dois estados. Decimal 255 = binário 11111111.' },
        { q: 'Como o octal é usado na computação?', a: 'O octal (base 8) é comumente usado em permissões de arquivos Unix/Linux. Cada conjunto de permissões (leitura=4, escrita=2, execução=1) cabe em um dígito octal.' },
        { q: 'Este conversor lida com números grandes?', a: 'Este conversor trabalha com inteiros JavaScript que podem representar valores até 2^53 - 1 (9.007.199.254.740.991 em decimal).' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="binary-converter" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.fromBase[lang]}</label>
            <select value={inputBase} onChange={(e) => { setInputBase(e.target.value as 'bin' | 'dec' | 'hex' | 'oct'); setInputValue(''); }} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500">
              <option value="bin">{labels.binary[lang]}</option>
              <option value="dec">{labels.decimal[lang]}</option>
              <option value="hex">{labels.hexadecimal[lang]}</option>
              <option value="oct">{labels.octal[lang]}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.inputLabel[lang]}</label>
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={inputBase === 'bin' ? '10110' : inputBase === 'dec' ? '42' : inputBase === 'hex' ? 'FF' : '77'} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 font-mono" />
          </div>

          {inputValue && !isValid && (
            <div className="p-3 bg-red-50 rounded-lg text-red-600 text-center font-medium">{labels.invalid[lang]}</div>
          )}

          {results && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">{labels.results[lang]}</h3>
              {([
                ['bin', labels.binary[lang], results.bin],
                ['dec', labels.decimal[lang], results.dec],
                ['hex', labels.hexadecimal[lang], results.hex],
                ['oct', labels.octal[lang], results.oct],
              ] as [string, string, string][]).map(([key, label, value]) => (
                <div key={key} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                  <div>
                    <div className="text-xs text-gray-500">{label}</div>
                    <div className="font-mono text-lg font-bold text-gray-900">{value}</div>
                  </div>
                  <button onClick={() => copyToClipboard(value, key)} className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition">
                    {copiedField === key ? labels.copied[lang] : '📋'}
                  </button>
                </div>
              ))}
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
