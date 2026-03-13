'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  htmlInput: { en: 'HTML Input', it: 'Input HTML', es: 'Entrada HTML', fr: 'Entr\u00e9e HTML', de: 'HTML-Eingabe', pt: 'Entrada HTML' },
  markdownOutput: { en: 'Markdown Output', it: 'Output Markdown', es: 'Salida Markdown', fr: 'Sortie Markdown', de: 'Markdown-Ausgabe', pt: 'Sa\u00edda Markdown' },
  preview: { en: 'Preview', it: 'Anteprima', es: 'Vista previa', fr: 'Aper\u00e7u', de: 'Vorschau', pt: 'Pr\u00e9-visualiza\u00e7\u00e3o' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '\u00a1Copiado!', fr: 'Copi\u00e9 !', de: 'Kopiert!', pt: 'Copiado!' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Restablecer', fr: 'R\u00e9initialiser', de: 'Zur\u00fccksetzen', pt: 'Redefinir' },
  copyResult: { en: 'Copy Markdown', it: 'Copia Markdown', es: 'Copiar Markdown', fr: 'Copier Markdown', de: 'Markdown kopieren', pt: 'Copiar Markdown' },
  downloadMd: { en: 'Download .md', it: 'Scarica .md', es: 'Descargar .md', fr: 'T\u00e9l\u00e9charger .md', de: '.md herunterladen', pt: 'Baixar .md' },
  sampleHtml: { en: 'Load Sample HTML', it: 'Carica HTML di esempio', es: 'Cargar HTML de ejemplo', fr: 'Charger un exemple HTML', de: 'Beispiel-HTML laden', pt: 'Carregar HTML de exemplo' },
  history: { en: 'History', it: 'Cronologia', es: 'Historial', fr: 'Historique', de: 'Verlauf', pt: 'Hist\u00f3rico' },
  noHistory: { en: 'No conversions yet', it: 'Nessuna conversione', es: 'Sin conversiones a\u00fan', fr: 'Aucune conversion', de: 'Noch keine Konvertierungen', pt: 'Nenhuma convers\u00e3o ainda' },
  clearHistory: { en: 'Clear history', it: 'Cancella cronologia', es: 'Borrar historial', fr: 'Effacer l\'historique', de: 'Verlauf l\u00f6schen', pt: 'Limpar hist\u00f3rico' },
  htmlPlaceholder: { en: 'Paste your HTML here...', it: 'Incolla il tuo HTML qui...', es: 'Pega tu HTML aqu\u00ed...', fr: 'Collez votre HTML ici...', de: 'HTML hier einf\u00fcgen...', pt: 'Cole seu HTML aqui...' },
  previewTab: { en: 'Rendered Preview', it: 'Anteprima Renderizzata', es: 'Vista Previa Renderizada', fr: 'Aper\u00e7u Rendu', de: 'Gerenderte Vorschau', pt: 'Pr\u00e9-visualiza\u00e7\u00e3o Renderizada' },
  markdownTab: { en: 'Markdown Code', it: 'Codice Markdown', es: 'C\u00f3digo Markdown', fr: 'Code Markdown', de: 'Markdown-Code', pt: 'C\u00f3digo Markdown' },
  characters: { en: 'Characters', it: 'Caratteri', es: 'Caracteres', fr: 'Caract\u00e8res', de: 'Zeichen', pt: 'Caracteres' },
  lines: { en: 'Lines', it: 'Righe', es: 'L\u00edneas', fr: 'Lignes', de: 'Zeilen', pt: 'Linhas' },
};

const SAMPLE_HTML = `<h1>Welcome to HTML to Markdown</h1>
<p>This is a <strong>bold</strong> and <em>italic</em> text example.</p>
<h2>Features</h2>
<ul>
  <li>Convert <code>HTML</code> to Markdown</li>
  <li>Support for <a href="https://example.com">links</a></li>
  <li>Handle images, lists, and tables</li>
</ul>
<h3>Code Example</h3>
<pre><code>const greeting = "Hello, World!";
console.log(greeting);</code></pre>
<blockquote>This is a blockquote with <strong>formatted</strong> text.</blockquote>
<p>Here is a horizontal rule:</p>
<hr>
<h3>A Simple Table</h3>
<table>
  <thead>
    <tr><th>Name</th><th>Age</th><th>City</th></tr>
  </thead>
  <tbody>
    <tr><td>Alice</td><td>30</td><td>New York</td></tr>
    <tr><td>Bob</td><td>25</td><td>London</td></tr>
  </tbody>
</table>
<ol>
  <li>First ordered item</li>
  <li>Second ordered item</li>
  <li>Third ordered item</li>
</ol>
<p>An image example: <img src="https://example.com/image.png" alt="Example Image"></p>`;

interface HistoryEntry {
  input: string;
  output: string;
  timestamp: number;
}

function htmlToMarkdown(html: string): string {
  if (!html.trim()) return '';

  let md = html;

  // Normalize line endings
  md = md.replace(/\r\n/g, '\n');

  // Handle pre/code blocks first (preserve content)
  const codeBlocks: string[] = [];
  md = md.replace(/<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi, (_, content) => {
    const decoded = decodeHtmlEntities(content.trim());
    const placeholder = `__CODEBLOCK_${codeBlocks.length}__`;
    codeBlocks.push(decoded);
    return placeholder;
  });

  // Handle inline code
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, content) => {
    return '`' + decodeHtmlEntities(content) + '`';
  });

  // Handle headings h1-h6
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, content) => '\n# ' + cleanInline(content).trim() + '\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, content) => '\n## ' + cleanInline(content).trim() + '\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, content) => '\n### ' + cleanInline(content).trim() + '\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, content) => '\n#### ' + cleanInline(content).trim() + '\n');
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_, content) => '\n##### ' + cleanInline(content).trim() + '\n');
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, (_, content) => '\n###### ' + cleanInline(content).trim() + '\n');

  // Handle blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
    const text = cleanInline(content).trim();
    const lines = text.split('\n').map((l: string) => '> ' + l.trim()).join('\n');
    return '\n' + lines + '\n';
  });

  // Handle tables
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent) => {
    const rows: string[][] = [];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
      const cells: string[] = [];
      const cellRegex = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        cells.push(cleanInline(cellMatch[1]).trim());
      }
      if (cells.length > 0) rows.push(cells);
    }
    if (rows.length === 0) return '';

    const colCount = Math.max(...rows.map(r => r.length));
    const normalizedRows = rows.map(r => {
      while (r.length < colCount) r.push('');
      return r;
    });

    let table = '\n| ' + normalizedRows[0].join(' | ') + ' |\n';
    table += '| ' + normalizedRows[0].map(() => '---').join(' | ') + ' |\n';
    for (let i = 1; i < normalizedRows.length; i++) {
      table += '| ' + normalizedRows[i].join(' | ') + ' |\n';
    }
    return table;
  });

  // Handle unordered lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
    let result = '\n';
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let liMatch;
    while ((liMatch = liRegex.exec(content)) !== null) {
      result += '- ' + cleanInline(liMatch[1]).trim() + '\n';
    }
    return result;
  });

  // Handle ordered lists
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
    let result = '\n';
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let liMatch;
    let idx = 1;
    while ((liMatch = liRegex.exec(content)) !== null) {
      result += idx + '. ' + cleanInline(liMatch[1]).trim() + '\n';
      idx++;
    }
    return result;
  });

  // Handle images (before links to avoid nested issues)
  md = md.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, (_, src, alt) => {
    return `![${alt}](${src})`;
  });
  md = md.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*\/?>/gi, (_, alt, src) => {
    return `![${alt}](${src})`;
  });
  md = md.replace(/<img[^>]*src=["']([^"']*)["'][^>]*\/?>/gi, (_, src) => {
    return `![](${src})`;
  });

  // Handle links
  md = md.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    return `[${cleanInline(text).trim()}](${href})`;
  });

  // Handle bold/strong
  md = md.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, (_, content) => '**' + content + '**');

  // Handle italic/em
  md = md.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, (_, content) => '*' + content + '*');

  // Handle strikethrough
  md = md.replace(/<(?:del|s|strike)[^>]*>([\s\S]*?)<\/(?:del|s|strike)>/gi, (_, content) => '~~' + content + '~~');

  // Handle horizontal rules
  md = md.replace(/<hr[^>]*\/?>/gi, '\n---\n');

  // Handle line breaks
  md = md.replace(/<br[^>]*\/?>/gi, '  \n');

  // Handle paragraphs
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, content) => '\n' + cleanInline(content).trim() + '\n');

  // Handle div as paragraph
  md = md.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, (_, content) => '\n' + content.trim() + '\n');

  // Remove remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Restore code blocks
  codeBlocks.forEach((block, i) => {
    md = md.replace(`__CODEBLOCK_${i}__`, '\n```\n' + block + '\n```\n');
  });

  // Decode HTML entities
  md = decodeHtmlEntities(md);

  // Clean up excessive newlines
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim();

  return md;
}

function cleanInline(html: string): string {
  // Process inline elements within already-processed content
  let text = html;
  text = text.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, (_, c) => '**' + c + '**');
  text = text.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, (_, c) => '*' + c + '*');
  text = text.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, c) => '`' + c + '`');
  text = text.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, t) => `[${t}](${href})`);
  text = text.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, (_, src, alt) => `![${alt}](${src})`);
  text = text.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*\/?>/gi, (_, alt, src) => `![${alt}](${src})`);
  text = text.replace(/<br[^>]*\/?>/gi, '  \n');
  text = text.replace(/<[^>]+>/g, '');
  return text;
}

function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'",
    '&nbsp;': ' ', '&copy;': '\u00a9', '&reg;': '\u00ae', '&trade;': '\u2122',
    '&mdash;': '\u2014', '&ndash;': '\u2013', '&laquo;': '\u00ab', '&raquo;': '\u00bb',
    '&bull;': '\u2022', '&hellip;': '\u2026', '&prime;': '\u2032', '&Prime;': '\u2033',
  };
  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.split(entity).join(char);
  }
  // Handle numeric entities
  result = result.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  return result;
}

function markdownToSimpleHtml(md: string): string {
  if (!md.trim()) return '';
  let html = md;

  // Escape HTML in the markdown first
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Code blocks
  html = html.replace(/```\n?([\s\S]*?)```/g, '<pre style="background:#f3f4f6;padding:12px;border-radius:8px;overflow-x:auto;font-size:13px"><code>$1</code></pre>');

  // Headings
  html = html.replace(/^###### (.+)$/gm, '<h6 style="font-size:14px;font-weight:700;margin:8px 0">$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5 style="font-size:15px;font-weight:700;margin:8px 0">$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h4 style="font-size:16px;font-weight:700;margin:8px 0">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 style="font-size:18px;font-weight:700;margin:10px 0">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 style="font-size:20px;font-weight:700;margin:12px 0">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 style="font-size:24px;font-weight:700;margin:14px 0">$1</h1>');

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote style="border-left:4px solid #d1d5db;padding-left:12px;color:#6b7280;margin:8px 0">$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #d1d5db;margin:16px 0">');

  // Tables
  html = html.replace(/(\|.+\|\n\|[\s\-:|]+\|\n(?:\|.+\|\n?)*)/g, (table) => {
    const rows = table.trim().split('\n').filter(r => !r.match(/^\|[\s\-:|]+\|$/));
    if (rows.length === 0) return table;
    let t = '<table style="border-collapse:collapse;width:100%;margin:12px 0">';
    rows.forEach((row, idx) => {
      const cells = row.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(c => c.trim());
      const tag = idx === 0 ? 'th' : 'td';
      const style = idx === 0 ? 'font-weight:700;background:#f9fafb;' : '';
      t += '<tr>' + cells.map(c => `<${tag} style="${style}border:1px solid #d1d5db;padding:6px 10px">${c}</${tag}>`).join('') + '</tr>';
    });
    t += '</table>';
    return t;
  });

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background:#f3f4f6;padding:2px 5px;border-radius:3px;font-size:13px">$1</code>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:8px 0">');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#2563eb;text-decoration:underline" target="_blank" rel="noopener">$1</a>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li style="margin-left:20px;list-style:disc">$1</li>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li style="margin-left:20px;list-style:decimal">$1</li>');

  // Wrap consecutive li in ul/ol
  html = html.replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul style="margin:8px 0;padding:0">$1</ul>');

  // Paragraphs: lines that aren't wrapped in a tag
  html = html.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<')) return trimmed;
    return `<p style="margin:6px 0;line-height:1.6">${trimmed}</p>`;
  }).join('\n');

  // Clean up empty lines
  html = html.replace(/\n{2,}/g, '\n');
  return html;
}

export default function HtmlToMarkdown() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['html-to-markdown'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'markdown' | 'preview'>('markdown');
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const markdown = htmlToMarkdown(input);
  const previewHtml = markdownToSimpleHtml(markdown);

  const charCount = markdown.length;
  const lineCount = markdown ? markdown.split('\n').length : 0;

  const copyOutput = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInput('');
    setCopied(false);
  };

  const loadSample = () => {
    setInput(SAMPLE_HTML);
  };

  const downloadMd = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveToHistory = useCallback(() => {
    if (!markdown) return;
    setHistory((prev) => {
      const entry: HistoryEntry = { input, output: markdown, timestamp: Date.now() };
      const updated = [entry, ...prev.filter(h => h.input !== input)].slice(0, 5);
      return updated;
    });
  }, [markdown, input]);

  const prevOutputRef = useState<string>('');
  if (markdown && markdown !== prevOutputRef[0]) {
    prevOutputRef[0] = markdown;
    queueMicrotask(() => saveToHistory());
  }

  const loadFromHistory = (entry: HistoryEntry) => {
    setInput(entry.input);
  };

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'HTML to Markdown Converter: Transform Markup Instantly',
      paragraphs: [
        'Converting HTML to Markdown is essential for developers, writers, and content managers who work across platforms. HTML is the foundation of web content, but Markdown offers a simpler, more readable syntax for documentation, README files, blogs, and wikis. Our free HTML to Markdown converter handles the transformation instantly in your browser, with no data sent to any server.',
        'The converter supports all common HTML elements: headings (h1 through h6), paragraphs, bold and italic text, hyperlinks, images, ordered and unordered lists, code blocks, inline code, blockquotes, tables, horizontal rules, and line breaks. The regex-based parsing engine processes your HTML in real time, producing clean Markdown that follows standard conventions.',
        'Content migration is one of the primary use cases. When moving a website from a CMS like WordPress to a static site generator like Hugo, Jekyll, or Gatsby, you need to convert thousands of HTML pages to Markdown. This tool lets you test conversions quickly, verify formatting, and ensure nothing is lost. The rendered preview tab shows exactly how the Markdown will look when parsed back.',
        'Developers also use this converter to extract readable content from web pages, generate documentation from HTML templates, convert email templates to plain-text Markdown versions, and prepare content for platforms like GitHub, GitLab, or Notion that use Markdown natively. The download feature saves your converted content as a .md file ready for use.',
        'The tool runs entirely client-side using JavaScript regex patterns and string manipulation. Your HTML never leaves your browser, making it safe for sensitive or proprietary content. The conversion history keeps track of your recent conversions for quick reference and re-use.',
      ],
      faq: [
        { q: 'What HTML tags does this converter support?', a: 'The converter supports h1-h6 headings, p paragraphs, strong/b bold, em/i italic, a links, img images, ul/ol/li lists, code and pre code blocks, blockquote, table with thead/tbody/tr/th/td, hr horizontal rules, and br line breaks.' },
        { q: 'Is my HTML data safe when using this tool?', a: 'Yes, completely. The conversion runs entirely in your browser using JavaScript. No data is sent to any server. You can verify this by using the tool offline after the page loads.' },
        { q: 'Can I convert complex nested HTML structures?', a: 'The converter handles common nesting patterns like bold text inside links, code inside list items, and formatted text inside blockquotes. Very deeply nested or unusual HTML structures may require manual cleanup.' },
        { q: 'What is Markdown and why would I use it instead of HTML?', a: 'Markdown is a lightweight markup language that is easier to read and write than HTML. It is widely used for documentation (README files), blogs, wikis, and note-taking. Markdown files are plain text and can be version-controlled with Git.' },
        { q: 'How do I handle HTML tables in Markdown?', a: 'The converter transforms HTML tables into GitHub Flavored Markdown (GFM) table syntax with pipe characters and dashes. The first row is treated as the header row with a separator line below it.' },
      ],
    },
    it: {
      title: 'Convertitore HTML a Markdown: Trasforma il Markup Istantaneamente',
      paragraphs: [
        'Convertire HTML in Markdown \u00e8 essenziale per sviluppatori, scrittori e content manager che lavorano su pi\u00f9 piattaforme. HTML \u00e8 la base dei contenuti web, ma Markdown offre una sintassi pi\u00f9 semplice e leggibile per documentazione, file README, blog e wiki. Il nostro convertitore gratuito gestisce la trasformazione istantaneamente nel tuo browser, senza inviare dati a nessun server.',
        'Il convertitore supporta tutti gli elementi HTML comuni: intestazioni (h1-h6), paragrafi, testo in grassetto e corsivo, link, immagini, liste ordinate e non ordinate, blocchi di codice, codice inline, citazioni, tabelle, linee orizzontali e interruzioni di riga. Il motore di parsing basato su regex elabora il tuo HTML in tempo reale.',
        'La migrazione dei contenuti \u00e8 uno dei casi d\'uso principali. Quando si sposta un sito da un CMS come WordPress a un generatore di siti statici come Hugo o Jekyll, \u00e8 necessario convertire centinaia di pagine HTML in Markdown. Questo strumento permette di testare le conversioni rapidamente e verificare la formattazione.',
        'Gli sviluppatori usano questo convertitore anche per estrarre contenuti leggibili da pagine web, generare documentazione da template HTML e preparare contenuti per piattaforme come GitHub o Notion che usano Markdown nativamente. La funzione di download salva il contenuto convertito come file .md pronto all\'uso.',
        'Lo strumento funziona interamente lato client usando pattern regex JavaScript. Il tuo HTML non lascia mai il browser, rendendolo sicuro per contenuti sensibili. La cronologia tiene traccia delle conversioni recenti per un rapido riferimento.',
      ],
      faq: [
        { q: 'Quali tag HTML supporta questo convertitore?', a: 'Il convertitore supporta intestazioni h1-h6, paragrafi p, grassetto strong/b, corsivo em/i, link a, immagini img, liste ul/ol/li, blocchi di codice code e pre, citazioni blockquote, tabelle con thead/tbody/tr/th/td, linee orizzontali hr e interruzioni di riga br.' },
        { q: 'I miei dati HTML sono al sicuro usando questo strumento?', a: 'S\u00ec, completamente. La conversione avviene interamente nel browser usando JavaScript. Nessun dato viene inviato a server esterni. Puoi verificarlo usando lo strumento offline dopo il caricamento.' },
        { q: 'Posso convertire strutture HTML nidificate complesse?', a: 'Il convertitore gestisce i pattern di nidificazione comuni come testo in grassetto dentro link, codice dentro elementi lista e testo formattato dentro citazioni. Strutture molto nidificate potrebbero richiedere correzioni manuali.' },
        { q: 'Cos\'\u00e8 Markdown e perch\u00e9 dovrei usarlo al posto di HTML?', a: 'Markdown \u00e8 un linguaggio di markup leggero, pi\u00f9 facile da leggere e scrivere rispetto all\'HTML. \u00c8 ampiamente usato per documentazione, blog, wiki e appunti. I file Markdown sono testo puro e possono essere versionati con Git.' },
        { q: 'Come vengono gestite le tabelle HTML in Markdown?', a: 'Il convertitore trasforma le tabelle HTML nella sintassi delle tabelle GitHub Flavored Markdown (GFM) con pipe e trattini. La prima riga viene trattata come intestazione con una riga separatrice sotto.' },
      ],
    },
    es: {
      title: 'Convertidor HTML a Markdown: Transforma el Marcado al Instante',
      paragraphs: [
        'Convertir HTML a Markdown es esencial para desarrolladores, escritores y gestores de contenido que trabajan en m\u00faltiples plataformas. HTML es la base del contenido web, pero Markdown ofrece una sintaxis m\u00e1s simple y legible para documentaci\u00f3n, archivos README, blogs y wikis. Nuestro convertidor gratuito maneja la transformaci\u00f3n instant\u00e1neamente en tu navegador.',
        'El convertidor soporta todos los elementos HTML comunes: encabezados (h1-h6), p\u00e1rrafos, texto en negrita y cursiva, enlaces, im\u00e1genes, listas ordenadas y no ordenadas, bloques de c\u00f3digo, c\u00f3digo en l\u00ednea, citas, tablas, l\u00edneas horizontales y saltos de l\u00ednea. El motor de an\u00e1lisis basado en regex procesa tu HTML en tiempo real.',
        'La migraci\u00f3n de contenido es uno de los casos de uso principales. Al mover un sitio web desde un CMS como WordPress a un generador de sitios est\u00e1ticos como Hugo o Jekyll, necesitas convertir cientos de p\u00e1ginas HTML a Markdown. Esta herramienta te permite probar conversiones r\u00e1pidamente.',
        'Los desarrolladores tambi\u00e9n usan este convertidor para extraer contenido legible de p\u00e1ginas web, generar documentaci\u00f3n desde plantillas HTML y preparar contenido para plataformas como GitHub o Notion. La funci\u00f3n de descarga guarda tu contenido convertido como archivo .md.',
        'La herramienta funciona completamente del lado del cliente usando patrones regex de JavaScript. Tu HTML nunca sale de tu navegador, haci\u00e9ndolo seguro para contenido sensible. El historial mantiene un registro de tus conversiones recientes.',
      ],
      faq: [
        { q: '\u00bfQu\u00e9 etiquetas HTML soporta este convertidor?', a: 'El convertidor soporta encabezados h1-h6, p\u00e1rrafos p, negrita strong/b, cursiva em/i, enlaces a, im\u00e1genes img, listas ul/ol/li, bloques de c\u00f3digo code y pre, citas blockquote, tablas con thead/tbody/tr/th/td, l\u00edneas horizontales hr y saltos de l\u00ednea br.' },
        { q: '\u00bfMis datos HTML est\u00e1n seguros al usar esta herramienta?', a: 'S\u00ed, completamente. La conversi\u00f3n se ejecuta enteramente en tu navegador usando JavaScript. No se env\u00edan datos a ning\u00fan servidor.' },
        { q: '\u00bfPuedo convertir estructuras HTML anidadas complejas?', a: 'El convertidor maneja patrones de anidamiento comunes como texto en negrita dentro de enlaces, c\u00f3digo dentro de elementos de lista y texto formateado dentro de citas. Estructuras muy anidadas pueden requerir ajustes manuales.' },
        { q: '\u00bfQu\u00e9 es Markdown y por qu\u00e9 deber\u00eda usarlo en lugar de HTML?', a: 'Markdown es un lenguaje de marcado ligero m\u00e1s f\u00e1cil de leer y escribir que HTML. Se usa ampliamente para documentaci\u00f3n, blogs, wikis y notas. Los archivos Markdown son texto plano y se pueden versionar con Git.' },
        { q: '\u00bfC\u00f3mo se manejan las tablas HTML en Markdown?', a: 'El convertidor transforma tablas HTML a la sintaxis de tablas GitHub Flavored Markdown (GFM) con barras verticales y guiones. La primera fila se trata como encabezado con una l\u00ednea separadora debajo.' },
      ],
    },
    fr: {
      title: 'Convertisseur HTML vers Markdown : Transformez le Balisage Instantan\u00e9ment',
      paragraphs: [
        'Convertir du HTML en Markdown est essentiel pour les d\u00e9veloppeurs, r\u00e9dacteurs et gestionnaires de contenu travaillant sur plusieurs plateformes. Le HTML est la base du contenu web, mais Markdown offre une syntaxe plus simple et lisible pour la documentation, les fichiers README, les blogs et les wikis. Notre convertisseur gratuit g\u00e8re la transformation instantan\u00e9ment dans votre navigateur.',
        'Le convertisseur prend en charge tous les \u00e9l\u00e9ments HTML courants : titres (h1-h6), paragraphes, texte en gras et italique, liens, images, listes ordonn\u00e9es et non ordonn\u00e9es, blocs de code, code en ligne, citations, tableaux, lignes horizontales et sauts de ligne. Le moteur d\'analyse bas\u00e9 sur les regex traite votre HTML en temps r\u00e9el.',
        'La migration de contenu est l\'un des principaux cas d\'utilisation. Lors du d\u00e9placement d\'un site web d\'un CMS comme WordPress vers un g\u00e9n\u00e9rateur de sites statiques comme Hugo ou Jekyll, vous devez convertir des centaines de pages HTML en Markdown. Cet outil permet de tester les conversions rapidement.',
        'Les d\u00e9veloppeurs utilisent \u00e9galement ce convertisseur pour extraire du contenu lisible de pages web, g\u00e9n\u00e9rer de la documentation \u00e0 partir de mod\u00e8les HTML et pr\u00e9parer du contenu pour des plateformes comme GitHub ou Notion. La fonction de t\u00e9l\u00e9chargement enregistre votre contenu converti en fichier .md.',
        'L\'outil fonctionne enti\u00e8rement c\u00f4t\u00e9 client en utilisant des expressions r\u00e9guli\u00e8res JavaScript. Votre HTML ne quitte jamais votre navigateur, le rendant s\u00fbr pour le contenu sensible. L\'historique garde trace de vos conversions r\u00e9centes.',
      ],
      faq: [
        { q: 'Quelles balises HTML ce convertisseur prend-il en charge ?', a: 'Le convertisseur prend en charge les titres h1-h6, paragraphes p, gras strong/b, italique em/i, liens a, images img, listes ul/ol/li, blocs de code code et pre, citations blockquote, tableaux avec thead/tbody/tr/th/td, lignes horizontales hr et sauts de ligne br.' },
        { q: 'Mes donn\u00e9es HTML sont-elles s\u00e9curis\u00e9es avec cet outil ?', a: 'Oui, compl\u00e8tement. La conversion s\'ex\u00e9cute enti\u00e8rement dans votre navigateur en JavaScript. Aucune donn\u00e9e n\'est envoy\u00e9e \u00e0 un serveur.' },
        { q: 'Puis-je convertir des structures HTML imbriqu\u00e9es complexes ?', a: 'Le convertisseur g\u00e8re les sch\u00e9mas d\'imbrication courants comme le texte en gras dans les liens, le code dans les \u00e9l\u00e9ments de liste et le texte format\u00e9 dans les citations. Les structures tr\u00e8s imbriqu\u00e9es peuvent n\u00e9cessiter des ajustements manuels.' },
        { q: 'Qu\'est-ce que Markdown et pourquoi l\'utiliser au lieu de HTML ?', a: 'Markdown est un langage de balisage l\u00e9ger plus facile \u00e0 lire et \u00e9crire que le HTML. Il est largement utilis\u00e9 pour la documentation, les blogs, les wikis et la prise de notes. Les fichiers Markdown sont du texte brut et peuvent \u00eatre versionn\u00e9s avec Git.' },
        { q: 'Comment les tableaux HTML sont-ils g\u00e9r\u00e9s en Markdown ?', a: 'Le convertisseur transforme les tableaux HTML en syntaxe de tableaux GitHub Flavored Markdown (GFM) avec des barres verticales et des tirets. La premi\u00e8re ligne est trait\u00e9e comme en-t\u00eate avec une ligne de s\u00e9paration en dessous.' },
      ],
    },
    de: {
      title: 'HTML zu Markdown Konverter: Markup Sofort Umwandeln',
      paragraphs: [
        'Die Konvertierung von HTML zu Markdown ist f\u00fcr Entwickler, Autoren und Content-Manager, die plattform\u00fcbergreifend arbeiten, unerl\u00e4sslich. HTML ist die Grundlage von Webinhalten, aber Markdown bietet eine einfachere, lesbarere Syntax f\u00fcr Dokumentation, README-Dateien, Blogs und Wikis. Unser kostenloser Konverter erledigt die Umwandlung sofort in Ihrem Browser.',
        'Der Konverter unterst\u00fctzt alle g\u00e4ngigen HTML-Elemente: \u00dcberschriften (h1-h6), Abs\u00e4tze, fetten und kursiven Text, Links, Bilder, geordnete und ungeordnete Listen, Codebl\u00f6cke, Inline-Code, Blockzitate, Tabellen, horizontale Linien und Zeilenumbr\u00fcche. Die regex-basierte Parsing-Engine verarbeitet Ihr HTML in Echtzeit.',
        'Content-Migration ist einer der Hauptanwendungsf\u00e4lle. Beim Umzug einer Website von einem CMS wie WordPress zu einem statischen Seitengenerator wie Hugo oder Jekyll m\u00fcssen Hunderte von HTML-Seiten in Markdown konvertiert werden. Dieses Tool erm\u00f6glicht es, Konvertierungen schnell zu testen.',
        'Entwickler verwenden diesen Konverter auch, um lesbaren Inhalt aus Webseiten zu extrahieren, Dokumentation aus HTML-Vorlagen zu generieren und Inhalte f\u00fcr Plattformen wie GitHub oder Notion vorzubereiten. Die Download-Funktion speichert Ihren konvertierten Inhalt als .md-Datei.',
        'Das Tool l\u00e4uft vollst\u00e4ndig clientseitig mit JavaScript-Regex-Mustern. Ihr HTML verl\u00e4sst nie Ihren Browser, was es sicher f\u00fcr sensible Inhalte macht. Der Verlauf verfolgt Ihre letzten Konvertierungen f\u00fcr schnelle Referenz.',
      ],
      faq: [
        { q: 'Welche HTML-Tags unterst\u00fctzt dieser Konverter?', a: 'Der Konverter unterst\u00fctzt \u00dcberschriften h1-h6, Abs\u00e4tze p, Fettdruck strong/b, Kursiv em/i, Links a, Bilder img, Listen ul/ol/li, Codebl\u00f6cke code und pre, Blockzitate blockquote, Tabellen mit thead/tbody/tr/th/td, horizontale Linien hr und Zeilenumbr\u00fcche br.' },
        { q: 'Sind meine HTML-Daten bei der Nutzung dieses Tools sicher?', a: 'Ja, vollst\u00e4ndig. Die Konvertierung l\u00e4uft komplett in Ihrem Browser mit JavaScript. Es werden keine Daten an einen Server gesendet.' },
        { q: 'Kann ich komplexe verschachtelte HTML-Strukturen konvertieren?', a: 'Der Konverter verarbeitet g\u00e4ngige Verschachtelungsmuster wie fetten Text in Links, Code in Listenelementen und formatierten Text in Blockzitaten. Sehr tief verschachtelte Strukturen k\u00f6nnen manuelle Korrekturen erfordern.' },
        { q: 'Was ist Markdown und warum sollte ich es statt HTML verwenden?', a: 'Markdown ist eine leichtgewichtige Auszeichnungssprache, die einfacher zu lesen und zu schreiben ist als HTML. Sie wird h\u00e4ufig f\u00fcr Dokumentation, Blogs, Wikis und Notizen verwendet. Markdown-Dateien sind reiner Text und k\u00f6nnen mit Git versioniert werden.' },
        { q: 'Wie werden HTML-Tabellen in Markdown umgewandelt?', a: 'Der Konverter wandelt HTML-Tabellen in die GitHub Flavored Markdown (GFM) Tabellensyntax mit Pipe-Zeichen und Strichen um. Die erste Zeile wird als Kopfzeile mit einer Trennlinie darunter behandelt.' },
      ],
    },
    pt: {
      title: 'Conversor HTML para Markdown: Transforme Marca\u00e7\u00e3o Instantaneamente',
      paragraphs: [
        'Converter HTML para Markdown \u00e9 essencial para desenvolvedores, escritores e gerentes de conte\u00fado que trabalham em m\u00faltiplas plataformas. HTML \u00e9 a base do conte\u00fado web, mas Markdown oferece uma sintaxe mais simples e leg\u00edvel para documenta\u00e7\u00e3o, arquivos README, blogs e wikis. Nosso conversor gratuito realiza a transforma\u00e7\u00e3o instantaneamente no seu navegador.',
        'O conversor suporta todos os elementos HTML comuns: t\u00edtulos (h1-h6), par\u00e1grafos, texto em negrito e it\u00e1lico, links, imagens, listas ordenadas e n\u00e3o ordenadas, blocos de c\u00f3digo, c\u00f3digo inline, cita\u00e7\u00f5es, tabelas, linhas horizontais e quebras de linha. O motor de an\u00e1lise baseado em regex processa seu HTML em tempo real.',
        'A migra\u00e7\u00e3o de conte\u00fado \u00e9 um dos principais casos de uso. Ao mover um site de um CMS como WordPress para um gerador de sites est\u00e1ticos como Hugo ou Jekyll, \u00e9 necess\u00e1rio converter centenas de p\u00e1ginas HTML para Markdown. Esta ferramenta permite testar convers\u00f5es rapidamente.',
        'Desenvolvedores tamb\u00e9m usam este conversor para extrair conte\u00fado leg\u00edvel de p\u00e1ginas web, gerar documenta\u00e7\u00e3o a partir de templates HTML e preparar conte\u00fado para plataformas como GitHub ou Notion. A fun\u00e7\u00e3o de download salva seu conte\u00fado convertido como arquivo .md.',
        'A ferramenta funciona inteiramente no lado do cliente usando padr\u00f5es regex JavaScript. Seu HTML nunca sai do navegador, tornando-o seguro para conte\u00fado sens\u00edvel. O hist\u00f3rico mant\u00e9m registro das suas convers\u00f5es recentes.',
      ],
      faq: [
        { q: 'Quais tags HTML este conversor suporta?', a: 'O conversor suporta t\u00edtulos h1-h6, par\u00e1grafos p, negrito strong/b, it\u00e1lico em/i, links a, imagens img, listas ul/ol/li, blocos de c\u00f3digo code e pre, cita\u00e7\u00f5es blockquote, tabelas com thead/tbody/tr/th/td, linhas horizontais hr e quebras de linha br.' },
        { q: 'Meus dados HTML est\u00e3o seguros ao usar esta ferramenta?', a: 'Sim, completamente. A convers\u00e3o \u00e9 executada inteiramente no seu navegador usando JavaScript. Nenhum dado \u00e9 enviado a qualquer servidor.' },
        { q: 'Posso converter estruturas HTML aninhadas complexas?', a: 'O conversor lida com padr\u00f5es de aninhamento comuns como texto em negrito dentro de links, c\u00f3digo dentro de itens de lista e texto formatado dentro de cita\u00e7\u00f5es. Estruturas muito aninhadas podem requerer ajustes manuais.' },
        { q: 'O que \u00e9 Markdown e por que devo us\u00e1-lo em vez de HTML?', a: 'Markdown \u00e9 uma linguagem de marca\u00e7\u00e3o leve mais f\u00e1cil de ler e escrever que HTML. \u00c9 amplamente usado para documenta\u00e7\u00e3o, blogs, wikis e anota\u00e7\u00f5es. Arquivos Markdown s\u00e3o texto puro e podem ser versionados com Git.' },
        { q: 'Como as tabelas HTML s\u00e3o tratadas em Markdown?', a: 'O conversor transforma tabelas HTML na sintaxe de tabelas GitHub Flavored Markdown (GFM) com barras verticais e tra\u00e7os. A primeira linha \u00e9 tratada como cabe\u00e7alho com uma linha separadora abaixo.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="html-to-markdown" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* HTML Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                {t('htmlInput')}
              </label>
              <button
                onClick={loadSample}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                {t('sampleHtml')}
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('htmlPlaceholder')}
              rows={8}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Stats */}
          {markdown && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-700">{charCount}</p>
                <p className="text-sm text-blue-600">{t('characters')}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-700">{lineCount}</p>
                <p className="text-sm text-green-600">{t('lines')}</p>
              </div>
            </div>
          )}

          {/* Output tabs */}
          {markdown && (
            <div>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setActiveTab('markdown')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'markdown' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('markdownTab')}
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('previewTab')}
                </button>
              </div>

              {activeTab === 'markdown' ? (
                <textarea
                  value={markdown}
                  readOnly
                  rows={10}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm"
                />
              ) : (
                <div
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm min-h-[200px] overflow-auto prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {markdown && (
              <>
                <button
                  onClick={copyOutput}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {copied ? t('copied') : t('copyResult')}
                </button>
                <button
                  onClick={downloadMd}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  {t('downloadMd')}
                </button>
              </>
            )}
            {input && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                {t('reset')}
              </button>
            )}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-700">{t('history')}</h3>
              <button
                onClick={() => setHistory([])}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                {t('clearHistory')}
              </button>
            </div>
            <div className="space-y-2">
              {history.map((entry) => (
                <button
                  key={entry.timestamp}
                  onClick={() => loadFromHistory(entry)}
                  className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-blue-600">
                      HTML → Markdown
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate font-mono">
                    {entry.input.slice(0, 80)}{entry.input.length > 80 ? '...' : ''}
                  </p>
                </button>
              ))}
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
