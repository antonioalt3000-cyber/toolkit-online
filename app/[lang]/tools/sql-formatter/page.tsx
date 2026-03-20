'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

function formatSQL(sql: string, indent: number): string {
  const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'UNION ALL', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'AS', 'IN', 'NOT', 'NULL', 'IS', 'BETWEEN', 'LIKE', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'ASC', 'DESC', 'DISTINCT'];
  const spaces = ' '.repeat(indent);
  let result = sql.replace(/\s+/g, ' ').trim();
  const majorKeywords = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'UNION ALL', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE'];
  majorKeywords.forEach(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    result = result.replace(regex, `\n${kw}`);
  });
  ['AND', 'OR'].forEach(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    result = result.replace(regex, `\n${spaces}${kw}`);
  });
  const joinTypes = ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN', 'JOIN'];
  joinTypes.forEach(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    result = result.replace(regex, `\n${kw}`);
  });
  result = result.replace(/,\s*/g, ',\n' + spaces);
  keywords.forEach(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    result = result.replace(regex, kw);
  });
  return result.trim();
}

export default function SqlFormatter() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['sql-formatter'][lang];

  const [input, setInput] = useState('');
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatted = input.trim() ? formatSQL(input, indent) : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const labels = {
    inputLabel: { en: 'Paste your SQL query', it: 'Incolla la tua query SQL', es: 'Pega tu consulta SQL', fr: 'Collez votre requ\u00eate SQL', de: 'F\u00fcgen Sie Ihre SQL-Abfrage ein', pt: 'Cole sua consulta SQL' },
    outputLabel: { en: 'Formatted SQL', it: 'SQL Formattato', es: 'SQL Formateado', fr: 'SQL Format\u00e9', de: 'Formatiertes SQL', pt: 'SQL Formatado' },
    indentSize: { en: 'Indent Size', it: 'Dimensione Indentazione', es: 'Tama\u00f1o de Indentaci\u00f3n', fr: 'Taille d\'Indentation', de: 'Einr\u00fcckungsgr\u00f6\u00dfe', pt: 'Tamanho da Indenta\u00e7\u00e3o' },
    copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
    copied: { en: 'Copied!', it: 'Copiato!', es: '\u00a1Copiado!', fr: 'Copi\u00e9!', de: 'Kopiert!', pt: 'Copiado!' },
    placeholder: { en: 'SELECT * FROM users WHERE age > 18 AND status = \'active\' ORDER BY name ASC', it: 'SELECT * FROM utenti WHERE eta > 18 AND stato = \'attivo\' ORDER BY nome ASC', es: 'SELECT * FROM usuarios WHERE edad > 18 AND estado = \'activo\' ORDER BY nombre ASC', fr: 'SELECT * FROM utilisateurs WHERE age > 18 AND statut = \'actif\' ORDER BY nom ASC', de: 'SELECT * FROM benutzer WHERE alter > 18 AND status = \'aktiv\' ORDER BY name ASC', pt: 'SELECT * FROM usuarios WHERE idade > 18 AND status = \'ativo\' ORDER BY nome ASC' },
  } as Record<string, Record<Locale, string>>;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free SQL Formatter \u2014 Format & Beautify SQL Queries Online',
      paragraphs: [
        'The SQL Formatter helps you format, indent, and beautify messy SQL queries in seconds. Whether you\'re working with SELECT statements, complex JOINs, or nested subqueries, this tool makes your SQL readable and well-structured.',
        'Simply paste your unformatted SQL query and the tool automatically adds proper line breaks, indentation, and keyword capitalization. All major SQL keywords are recognized and properly formatted.',
        'Clean, well-formatted SQL is easier to read, debug, and maintain. This is especially important when working in teams or reviewing pull requests that contain database queries.',
        'The formatter works entirely in your browser \u2014 no data is sent to any server. Your SQL queries stay private and secure.',
      ],
      faq: [
        { q: 'What SQL dialects does this formatter support?', a: 'This formatter supports standard SQL syntax that works with MySQL, PostgreSQL, SQLite, SQL Server, Oracle, and most other SQL databases. It formats all common keywords and clauses.' },
        { q: 'Is my SQL query sent to a server?', a: 'No! The formatting happens entirely in your browser using JavaScript. No data is transmitted to any server, so your queries remain completely private.' },
        { q: 'Can I customize the indentation?', a: 'Yes, you can adjust the indent size from 2 to 8 spaces using the slider. This lets you match your team\'s code style preferences.' },
        { q: 'Does the formatter change my query logic?', a: 'No, the formatter only changes whitespace and capitalization. It never modifies the logic or structure of your SQL query.' },
      ],
    },
    it: {
      title: 'Formattatore SQL Gratuito \u2014 Formatta e Abbellisci Query SQL Online',
      paragraphs: [
        'Il Formattatore SQL ti aiuta a formattare e abbellire query SQL disordinate in pochi secondi.',
        'Incolla la tua query SQL e lo strumento aggiunge automaticamente interruzioni di riga, indentazione e maiuscole per le keyword.',
        'SQL ben formattato \u00e8 pi\u00f9 facile da leggere, debuggare e mantenere.',
        'Il formattatore funziona interamente nel browser \u2014 nessun dato viene inviato a server esterni.',
      ],
      faq: [
        { q: 'Quali dialetti SQL supporta?', a: 'Supporta la sintassi SQL standard compatibile con MySQL, PostgreSQL, SQLite, SQL Server e altri.' },
        { q: 'La mia query viene inviata a un server?', a: 'No! La formattazione avviene interamente nel browser. Nessun dato viene trasmesso.' },
        { q: 'Posso personalizzare l\'indentazione?', a: 'S\u00ec, puoi regolare la dimensione dell\'indentazione da 2 a 8 spazi.' },
        { q: 'Il formattatore cambia la logica della query?', a: 'No, cambia solo spazi e maiuscole. Non modifica mai la logica.' },
      ],
    },
    es: {
      title: 'Formateador SQL Gratis \u2014 Formatear Consultas SQL Online',
      paragraphs: ['El Formateador SQL te ayuda a formatear consultas desordenadas en segundos.', 'Pega tu consulta y el formato se aplica autom\u00e1ticamente.', 'SQL bien formateado es m\u00e1s f\u00e1cil de leer y mantener.', 'Todo funciona en tu navegador, sin enviar datos a servidores.'],
      faq: [
        { q: '\u00bfQu\u00e9 dialectos SQL soporta?', a: 'Soporta SQL est\u00e1ndar compatible con MySQL, PostgreSQL, SQLite y otros.' },
        { q: '\u00bfMi consulta se env\u00eda a un servidor?', a: 'No, todo funciona en tu navegador.' },
        { q: '\u00bfPuedo personalizar la indentaci\u00f3n?', a: 'S\u00ed, de 2 a 8 espacios.' },
        { q: '\u00bfEl formateador cambia la l\u00f3gica?', a: 'No, solo cambia espacios y may\u00fasculas.' },
      ],
    },
    fr: {
      title: 'Formateur SQL Gratuit \u2014 Formatez vos Requ\u00eates SQL en Ligne',
      paragraphs: ['Le Formateur SQL vous aide \u00e0 formater et embellir vos requ\u00eates SQL.', 'Collez votre requ\u00eate et le formatage s\'applique automatiquement.', 'Du SQL bien format\u00e9 est plus facile \u00e0 lire et maintenir.', 'Tout fonctionne dans votre navigateur, aucune donn\u00e9e n\'est envoy\u00e9e.'],
      faq: [
        { q: 'Quels dialectes SQL sont support\u00e9s ?', a: 'SQL standard compatible avec MySQL, PostgreSQL, SQLite et autres.' },
        { q: 'Ma requ\u00eate est-elle envoy\u00e9e \u00e0 un serveur ?', a: 'Non, tout se passe dans votre navigateur.' },
        { q: 'Puis-je personnaliser l\'indentation ?', a: 'Oui, de 2 \u00e0 8 espaces.' },
        { q: 'Le formateur change-t-il la logique ?', a: 'Non, seulement les espaces et majuscules.' },
      ],
    },
    de: {
      title: 'Kostenloser SQL-Formatierer \u2014 SQL-Abfragen Online Formatieren',
      paragraphs: ['Der SQL-Formatierer hilft Ihnen, unordentliche SQL-Abfragen zu formatieren.', 'F\u00fcgen Sie Ihre Abfrage ein und die Formatierung wird automatisch angewendet.', 'Gut formatiertes SQL ist einfacher zu lesen und zu pflegen.', 'Alles funktioniert im Browser, keine Daten werden gesendet.'],
      faq: [
        { q: 'Welche SQL-Dialekte werden unterst\u00fctzt?', a: 'Standard-SQL kompatibel mit MySQL, PostgreSQL, SQLite und anderen.' },
        { q: 'Wird meine Abfrage an einen Server gesendet?', a: 'Nein, alles passiert in Ihrem Browser.' },
        { q: 'Kann ich die Einr\u00fcckung anpassen?', a: 'Ja, von 2 bis 8 Leerzeichen.' },
        { q: '\u00c4ndert der Formatierer die Logik?', a: 'Nein, nur Leerzeichen und Gro\u00dfschreibung.' },
      ],
    },
    pt: {
      title: 'Formatador SQL Gr\u00e1tis \u2014 Formate Consultas SQL Online',
      paragraphs: ['O Formatador SQL ajuda a formatar consultas desordenadas em segundos.', 'Cole sua consulta e a formata\u00e7\u00e3o \u00e9 aplicada automaticamente.', 'SQL bem formatado \u00e9 mais f\u00e1cil de ler e manter.', 'Tudo funciona no navegador, sem enviar dados a servidores.'],
      faq: [
        { q: 'Quais dialetos SQL s\u00e3o suportados?', a: 'SQL padr\u00e3o compat\u00edvel com MySQL, PostgreSQL, SQLite e outros.' },
        { q: 'Minha consulta \u00e9 enviada a um servidor?', a: 'N\u00e3o, tudo funciona no seu navegador.' },
        { q: 'Posso personalizar a indenta\u00e7\u00e3o?', a: 'Sim, de 2 a 8 espa\u00e7os.' },
        { q: 'O formatador muda a l\u00f3gica?', a: 'N\u00e3o, apenas espa\u00e7os e mai\u00fasculas.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="sql-formatter" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.inputLabel[lang]}</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={labels.placeholder[lang]} rows={6} className="w-full border border-gray-300 rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 resize-y" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.indentSize[lang]}: {indent}</label>
            <input type="range" min={2} max={8} value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="w-full" />
          </div>

          {formatted && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">{labels.outputLabel[lang]}</label>
                <button onClick={handleCopy} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  {copied ? labels.copied[lang] : labels.copy[lang]}
                </button>
              </div>
              <pre className="bg-gray-900 text-green-400 rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre">{formatted}</pre>
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
