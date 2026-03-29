'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  editor: { en: 'Markdown Editor', it: 'Editor Markdown', es: 'Editor Markdown', fr: 'Éditeur Markdown', de: 'Markdown-Editor', pt: 'Editor Markdown' },
  preview: { en: 'Preview', it: 'Anteprima', es: 'Vista Previa', fr: 'Aperçu', de: 'Vorschau', pt: 'Pré-visualização' },
  placeholder: { en: '# Hello World\n\nWrite some **markdown** here...\n\n- Item 1\n- Item 2\n\n> A blockquote\n\n`inline code`\n\n```\ncode block\n```', it: '# Ciao Mondo\n\nScrivi del **markdown** qui...', es: '# Hola Mundo\n\nEscribe algo de **markdown** aquí...', fr: '# Bonjour le Monde\n\nÉcrivez du **markdown** ici...', de: '# Hallo Welt\n\nSchreiben Sie hier **Markdown**...', pt: '# Olá Mundo\n\nEscreva algum **markdown** aqui...' },
  words: { en: 'Words', it: 'Parole', es: 'Palabras', fr: 'Mots', de: 'Wörter', pt: 'Palavras' },
  characters: { en: 'Characters', it: 'Caratteri', es: 'Caracteres', fr: 'Caractères', de: 'Zeichen', pt: 'Caracteres' },
  lines: { en: 'Lines', it: 'Righe', es: 'Líneas', fr: 'Lignes', de: 'Zeilen', pt: 'Linhas' },
  copyHtml: { en: 'Copy HTML', it: 'Copia HTML', es: 'Copiar HTML', fr: 'Copier HTML', de: 'HTML kopieren', pt: 'Copiar HTML' },
  copyMarkdown: { en: 'Copy Markdown', it: 'Copia Markdown', es: 'Copiar Markdown', fr: 'Copier Markdown', de: 'Markdown kopieren', pt: 'Copiar Markdown' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  reset: { en: 'Reset', it: 'Cancella', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Limpar' },
  fullscreen: { en: 'Fullscreen', it: 'Schermo intero', es: 'Pantalla completa', fr: 'Plein écran', de: 'Vollbild', pt: 'Tela cheia' },
  exitFullscreen: { en: 'Exit Fullscreen', it: 'Esci', es: 'Salir', fr: 'Quitter', de: 'Beenden', pt: 'Sair' },
  templates: { en: 'Quick Insert', it: 'Inserimento rapido', es: 'Inserción rápida', fr: 'Insertion rapide', de: 'Schnell einfügen', pt: 'Inserção rápida' },
  history: { en: 'History', it: 'Cronologia', es: 'Historial', fr: 'Historique', de: 'Verlauf', pt: 'Histórico' },
  saveToHistory: { en: 'Save to History', it: 'Salva nella cronologia', es: 'Guardar en historial', fr: 'Sauvegarder', de: 'Speichern', pt: 'Salvar no histórico' },
  noHistory: { en: 'No saved snippets yet', it: 'Nessun frammento salvato', es: 'Sin fragmentos guardados', fr: 'Aucun extrait sauvegardé', de: 'Noch keine Snippets', pt: 'Nenhum trecho salvo' },
  clearHistory: { en: 'Clear', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Löschen', pt: 'Limpar' },
};

const TEMPLATES = [
  { label: 'H1', md: '# Heading 1\n' },
  { label: 'Bold', md: '**bold text**' },
  { label: 'Link', md: '[text](https://example.com)' },
  { label: 'Image', md: '![alt](https://example.com/image.png)' },
  { label: 'Table', md: '| Column 1 | Column 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n' },
  { label: 'Code', md: '```\ncode block\n```\n' },
];

function parseMarkdown(md: string): string {
  let html = md;

  // Escape HTML
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Code blocks (``` ... ```)
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 text-green-400 p-3 rounded-lg my-2 overflow-x-auto text-sm"><code>$1</code></pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-600 px-1 rounded text-sm">$1</code>');

  // Headers
  html = html.replace(/^######\s+(.+)$/gm, '<h6 class="text-sm font-bold mt-3 mb-1">$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5 class="text-base font-bold mt-3 mb-1">$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4 class="text-lg font-bold mt-3 mb-1">$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-2xl font-bold mt-4 mb-2">$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="text-3xl font-bold mt-4 mb-2">$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Blockquotes
  html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2">$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="my-4 border-gray-300" />');

  // Unordered lists
  html = html.replace(/^[-*]\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>');

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');

  // Images (MUST be before links since ![alt](url) contains [alt](url))
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded my-2" />');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>');

  // Paragraphs (double newlines)
  html = html.replace(/\n\n/g, '</p><p class="my-2">');
  html = '<p class="my-2">' + html + '</p>';

  // Single newlines -> <br>
  html = html.replace(/\n/g, '<br />');

  // Clean empty paragraphs
  html = html.replace(/<p class="my-2"><\/p>/g, '');

  return html;
}

interface HistoryItem {
  text: string;
  preview: string;
  timestamp: number;
}

export default function MarkdownPreview() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['markdown-preview'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [markdown, setMarkdown] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('md-preview-history');
      if (saved) setHistory(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const rendered = useMemo(() => parseMarkdown(markdown || ''), [markdown]);

  // Stats
  const wordCount = useMemo(() => {
    const trimmed = markdown.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [markdown]);
  const charCount = markdown.length;
  const lineCount = useMemo(() => {
    return markdown ? markdown.split('\n').length : 0;
  }, [markdown]);

  const copyToClipboard = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch { /* ignore */ }
  }, []);

  const handleReset = useCallback(() => {
    setMarkdown('');
  }, []);

  const insertTemplate = useCallback((md: string) => {
    setMarkdown(prev => prev ? prev + '\n' + md : md);
  }, []);

  const saveToHistory = useCallback(() => {
    if (!markdown.trim()) return;
    const item: HistoryItem = {
      text: markdown,
      preview: markdown.trim().slice(0, 30) + (markdown.trim().length > 30 ? '...' : ''),
      timestamp: Date.now(),
    };
    const newHistory = [item, ...history].slice(0, 5);
    setHistory(newHistory);
    try {
      localStorage.setItem('md-preview-history', JSON.stringify(newHistory));
    } catch { /* ignore */ }
  }, [markdown, history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try { localStorage.removeItem('md-preview-history'); } catch { /* ignore */ }
  }, []);

  const loadFromHistory = useCallback((item: HistoryItem) => {
    setMarkdown(item.text);
  }, []);

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Online Markdown Preview – Live Editor with Instant Rendering',
      paragraphs: [
        'Markdown is a lightweight markup language created by John Gruber in 2004 that lets you format text using simple, intuitive syntax. It is the standard writing format for GitHub README files, documentation sites, static site generators like Jekyll and Hugo, and note-taking apps like Obsidian and Notion.',
        'Our free Markdown preview tool provides a side-by-side editor and live preview, so you can see exactly how your Markdown will render as you type. This is invaluable when writing documentation, blog posts, or any content that will be published in Markdown format.',
        'The editor supports all standard Markdown features: headings (# through ######), bold (**text**), italic (*text*), strikethrough (~~text~~), links, images, blockquotes, code blocks, inline code, ordered and unordered lists, and horizontal rules. The preview updates instantly with every keystroke.',
        'Whether you are a developer writing documentation for an open-source project, a technical writer creating knowledge base articles, or a student taking notes, this tool helps you write and verify your Markdown without installing any software. Everything runs in your browser with zero latency.',
      ],
      faq: [
        { q: 'What is Markdown and why should I use it?', a: 'Markdown is a plain-text formatting syntax that converts to HTML. It is easier to read and write than HTML, platform-independent, and widely supported by tools like GitHub, GitLab, Reddit, Stack Overflow, and most modern CMS platforms. It lets you focus on content without worrying about complex formatting.' },
        { q: 'Does this Markdown preview support GitHub-Flavored Markdown (GFM)?', a: 'This tool supports the most commonly used Markdown features including headings, bold, italic, strikethrough, lists, links, images, blockquotes, code blocks, and inline code. It covers the core syntax that works across all Markdown processors.' },
        { q: 'Can I use this tool to write README files for GitHub?', a: 'Absolutely. Write your README content in the editor, verify it looks correct in the preview, then copy the Markdown source into your repository\'s README.md file. The rendering will match closely to how GitHub displays it.' },
        { q: 'Is the Markdown processed on a server?', a: 'No. All Markdown parsing and HTML rendering happens locally in your browser using JavaScript. Your content never leaves your device, making this tool completely private and working offline once the page is loaded.' },
        { q: 'What are the most common Markdown syntax elements?', a: 'The most used elements are: # for headings, **text** for bold, *text* for italic, - or * for bullet lists, [text](url) for links, ![alt](url) for images, > for blockquotes, and backticks for inline code or code blocks.' },
      ],
    },
    it: {
      title: 'Anteprima Markdown Online Gratuita – Editor Live con Rendering Istantaneo',
      paragraphs: [
        'Markdown è un linguaggio di markup leggero creato da John Gruber nel 2004 che permette di formattare il testo usando una sintassi semplice e intuitiva. È il formato di scrittura standard per i file README di GitHub, siti di documentazione, generatori di siti statici come Jekyll e Hugo, e app di note come Obsidian e Notion.',
        'Il nostro strumento di anteprima Markdown gratuito offre un editor e un\'anteprima live affiancati, così puoi vedere esattamente come il tuo Markdown verrà renderizzato mentre scrivi. Questo è prezioso quando si scrivono documentazioni, post del blog o qualsiasi contenuto in formato Markdown.',
        'L\'editor supporta tutte le funzionalità Markdown standard: intestazioni (da # a ######), grassetto (**testo**), corsivo (*testo*), barrato (~~testo~~), link, immagini, citazioni, blocchi di codice, codice inline, liste ordinate e non ordinate, e linee orizzontali.',
        'Che tu sia uno sviluppatore che scrive documentazione, un technical writer o uno studente che prende appunti, questo strumento ti aiuta a scrivere e verificare il tuo Markdown senza installare alcun software.',
      ],
      faq: [
        { q: 'Cos\'è Markdown e perché dovrei usarlo?', a: 'Markdown è una sintassi di formattazione in testo semplice che si converte in HTML. È più facile da leggere e scrivere rispetto all\'HTML, indipendente dalla piattaforma e ampiamente supportato da strumenti come GitHub, GitLab, Reddit e Stack Overflow.' },
        { q: 'Questa anteprima supporta il GitHub-Flavored Markdown (GFM)?', a: 'Questo strumento supporta le funzionalità Markdown più comuni incluse intestazioni, grassetto, corsivo, barrato, liste, link, immagini, citazioni e blocchi di codice.' },
        { q: 'Posso usare questo strumento per scrivere file README per GitHub?', a: 'Certamente. Scrivi il contenuto del README nell\'editor, verifica che appaia corretto nell\'anteprima, poi copia il sorgente Markdown nel file README.md del tuo repository.' },
        { q: 'Il Markdown viene elaborato su un server?', a: 'No. Tutto il parsing Markdown e il rendering HTML avvengono localmente nel browser usando JavaScript. Il tuo contenuto non lascia mai il tuo dispositivo.' },
        { q: 'Quali sono gli elementi di sintassi Markdown più comuni?', a: 'Gli elementi più usati sono: # per intestazioni, **testo** per grassetto, *testo* per corsivo, - o * per liste puntate, [testo](url) per link, ![alt](url) per immagini, > per citazioni e backtick per codice.' },
      ],
    },
    es: {
      title: 'Editor Markdown Online Gratis con Vista Previa en Tiempo Real',
      paragraphs: [
        '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">¿Qué es Markdown y por qué es el estándar en España y Latinoamérica?</h2><p>Markdown es un lenguaje de marcado ligero creado por John Gruber en 2004 que permite formatear texto usando una sintaxis simple e intuitiva. En los últimos años se ha convertido en el formato estándar para archivos README en GitHub, documentación técnica, generadores de sitios estáticos como Hugo, Jekyll y Astro, y aplicaciones de notas como Obsidian, Notion y Bear. Empresas tecnológicas españolas como Cabify, Glovo y Wallapop lo usan en sus flujos de documentación interna, y universidades como la UPM, la UPC y la Complutense lo incorporan en sus programas de ingeniería informática. Markdown es también la base de plataformas de blogging como Dev.to y Hashnode, lo que lo convierte en una habilidad imprescindible para cualquier profesional del sector digital en el mundo hispanohablante.</p>',
        '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">Cómo funciona nuestro editor Markdown con vista previa en vivo</h2><p>Nuestra herramienta gratuita de vista previa Markdown ofrece un editor y una vista previa en tiempo real lado a lado. Mientras escribes en el panel izquierdo, el panel derecho renderiza instantáneamente el resultado HTML, permitiéndote detectar errores de formato al momento. No necesitas instalar ningún software ni crear una cuenta: simplemente abre la página y empieza a escribir. Todo el procesamiento ocurre localmente en tu navegador, lo que garantiza total privacidad. Puedes copiar el HTML generado o el Markdown fuente con un solo clic, y el editor muestra estadísticas en vivo de palabras, caracteres y líneas.</p>',
        '<h3 class="text-lg font-semibold text-gray-800 mt-5 mb-2">Sintaxis Markdown completa soportada</h3><p>El editor soporta todas las características estándar de Markdown: encabezados de nivel 1 a 6 (# a ######), <strong>negrita</strong>, <em>cursiva</em>, ~~tachado~~, enlaces, imágenes, citas (blockquotes), bloques de código con resaltado de sintaxis, código en línea con backticks, listas ordenadas y no ordenadas, listas de tareas con casillas de verificación, tablas y líneas horizontales. Si trabajas con documentación técnica, puedes usar bloques de código multilínea con triple backtick e indicar el lenguaje para resaltado de sintaxis. Para crear un <a href="/es/tools/text-to-slug" class="text-blue-600 hover:underline">slug SEO-friendly</a> a partir de tus encabezados, prueba también nuestro conversor de texto a slug.</p>',
        '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">Casos de uso: desarrolladores, redactores y estudiantes</h2><p>Markdown es la herramienta preferida de miles de profesionales hispanohablantes. Los <strong>desarrolladores</strong> lo usan para escribir archivos README.md, documentación de APIs, guías de contribución y changelogs. Los <strong>redactores técnicos</strong> y content managers lo emplean para crear artículos de blog, newsletters y manuales que luego se convierten a HTML o PDF. Los <strong>estudiantes universitarios</strong> de informática, ingeniería y ciencias lo utilizan para tomar apuntes estructurados, escribir informes y preparar presentaciones con herramientas como Pandoc o Marp. Si necesitas contar las palabras de tu documento, combina esta herramienta con nuestro <a href="/es/tools/word-counter" class="text-blue-600 hover:underline">contador de palabras</a> para verificar la extensión.</p>',
        '<h3 class="text-lg font-semibold text-gray-800 mt-5 mb-2">Integración con flujos de trabajo profesionales</h3><p>El Markdown que escribas aquí es totalmente compatible con GitHub, GitLab, Bitbucket, Jira, Confluence, Slack y Discord. Puedes copiar el fuente Markdown directamente en un pull request, un issue o un comentario. Para documentación técnica avanzada, plataformas como Docusaurus, VitePress y MkDocs aceptan Markdown como formato nativo. Si gestionas documentos complejos y necesitas convertirlos a otros formatos, puedes complementar esta herramienta con nuestro <a href="/es/tools/csv-to-json" class="text-blue-600 hover:underline">conversor CSV a JSON</a> para datos tabulares o con <a href="https://parseflow.dev" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">ParseFlow</a> para procesamiento avanzado de documentos.</p>',
        '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">Ventajas frente a otros editores Markdown</h2><p>A diferencia de editores de escritorio como Typora o VS Code, nuestra herramienta no requiere instalación ni configuración. Funciona en cualquier navegador moderno (Chrome, Firefox, Safari, Edge) tanto en ordenadores como en tablets y móviles. La vista previa es instantánea, sin retardos de compilación. Al ser una aplicación web progresiva (PWA), puedes añadirla a tu pantalla de inicio y usarla offline. Además, al procesar todo en el cliente, tu contenido confidencial — borradores de artículos, documentación privada de empresa, apuntes de clase — nunca se envía a ningún servidor. Esta combinación de accesibilidad, velocidad y privacidad la convierte en la mejor opción para usuarios hispanohablantes que buscan un editor Markdown online fiable y gratuito.</p>',
      ],
      faq: [
        { q: '¿Qué es Markdown y por qué debería aprenderlo en 2026?', a: 'Markdown es una sintaxis de formato de texto plano creada en 2004 que se convierte a HTML. Es más fácil de leer y escribir que HTML puro, es independiente de plataforma y está soportado nativamente por GitHub, GitLab, Reddit, Stack Overflow, Notion, Obsidian y cientos de herramientas más. En 2026, Markdown es un requisito básico para desarrolladores, redactores técnicos y profesionales del marketing digital. Aprenderlo te permitirá crear documentación profesional, contribuir a proyectos open source y escribir contenido web de forma eficiente.' },
        { q: '¿Esta vista previa soporta GitHub-Flavored Markdown (GFM)?', a: 'Sí. Nuestra herramienta soporta las características Markdown más comunes incluyendo encabezados (H1-H6), negrita, cursiva, tachado, listas ordenadas y no ordenadas, listas de tareas con casillas, enlaces, imágenes, citas (blockquotes), bloques de código con triple backtick, código en línea, tablas y líneas horizontales. El renderizado es compatible con la especificación GFM utilizada por GitHub, lo que te permite previsualizar tus README.md y documentación exactamente como aparecerán en la plataforma.' },
        { q: '¿Puedo usar esta herramienta para escribir archivos README profesionales?', a: 'Por supuesto. Escribe tu contenido en el panel del editor, verifica en tiempo real que el formato sea correcto en el panel de vista previa, y luego copia el código Markdown fuente con el botón de copiar. Pégalo directamente en tu archivo README.md del repositorio. Muchos desarrolladores en España y Latinoamérica usan esta herramienta como paso previo antes de hacer commit en GitHub o GitLab, ya que permite detectar errores de sintaxis antes de publicar.' },
        { q: '¿Mi contenido es privado? ¿Se envía a algún servidor?', a: 'Tu contenido es 100% privado. Todo el análisis sintáctico (parsing) y el renderizado HTML ocurren localmente en tu navegador mediante JavaScript. Ningún dato se envía a servidores externos. Esto significa que puedes usar la herramienta con total confianza para documentación confidencial, borradores de artículos, contratos o cualquier texto sensible. Cumple con los requisitos de privacidad del RGPD europeo al no procesar datos personales en el servidor.' },
        { q: '¿Cuáles son los atajos de sintaxis Markdown más útiles?', a: 'Los elementos más utilizados son: # a ###### para encabezados de nivel 1 a 6, **texto** para negrita, *texto* para cursiva, ~~texto~~ para tachado, - o * para listas no ordenadas, 1. para listas ordenadas, [texto](url) para enlaces, ![alt](url) para imágenes, > para citas, triple backtick para bloques de código (indicando el lenguaje tras el primer backtick para resaltado de sintaxis), y --- para líneas horizontales. También puedes crear tablas con | para columnas y - para separadores de encabezado.' },
      ],
    },
    fr: {
      title: 'Aperçu Markdown en Ligne Gratuit – Éditeur Live avec Rendu Instantané',
      paragraphs: [
        'Markdown est un langage de balisage léger créé par John Gruber en 2004 qui permet de formater du texte avec une syntaxe simple et intuitive. C\'est le format d\'écriture standard pour les fichiers README GitHub, les sites de documentation, les générateurs de sites statiques et les apps de notes comme Obsidian et Notion.',
        'Notre outil d\'aperçu Markdown gratuit offre un éditeur et un aperçu en direct côte à côte, pour que vous puissiez voir exactement comment votre Markdown sera rendu en temps réel.',
        'L\'éditeur supporte toutes les fonctionnalités Markdown standard : titres, gras, italique, barré, liens, images, citations, blocs de code, code en ligne, listes ordonnées et non ordonnées, et lignes horizontales.',
        'Que vous soyez développeur, rédacteur technique ou étudiant, cet outil vous aide à écrire et vérifier votre Markdown sans installer de logiciel.',
      ],
      faq: [
        { q: 'Qu\'est-ce que Markdown et pourquoi l\'utiliser ?', a: 'Markdown est une syntaxe de formatage en texte brut qui se convertit en HTML. Plus facile à lire et écrire que le HTML, indépendant de la plateforme et largement supporté par GitHub, Reddit et Stack Overflow.' },
        { q: 'Cet aperçu supporte-t-il le GitHub-Flavored Markdown (GFM) ?', a: 'Cet outil supporte les fonctionnalités Markdown les plus courantes incluant titres, gras, italique, barré, listes, liens, images, citations et blocs de code.' },
        { q: 'Puis-je l\'utiliser pour écrire des fichiers README ?', a: 'Absolument. Écrivez dans l\'éditeur, vérifiez l\'aperçu, puis copiez le source Markdown dans votre fichier README.md.' },
        { q: 'Le Markdown est-il traité sur un serveur ?', a: 'Non. Tout le parsing et le rendu se font localement dans votre navigateur. Votre contenu ne quitte jamais votre appareil.' },
        { q: 'Quels sont les éléments Markdown les plus courants ?', a: 'Les plus utilisés sont : # pour titres, **texte** pour gras, *texte* pour italique, - pour listes, [texte](url) pour liens, ![alt](url) pour images, > pour citations et backticks pour le code.' },
      ],
    },
    de: {
      title: 'Kostenlose Online Markdown-Vorschau – Live-Editor mit Sofortigem Rendering',
      paragraphs: [
        'Markdown ist eine leichtgewichtige Auszeichnungssprache, die 2004 von John Gruber erstellt wurde und es ermöglicht, Text mit einfacher, intuitiver Syntax zu formatieren. Es ist das Standard-Schreibformat für GitHub README-Dateien, Dokumentationsseiten, statische Seitengeneratoren und Notiz-Apps wie Obsidian und Notion.',
        'Unser kostenloses Markdown-Vorschau-Tool bietet einen Editor und eine Live-Vorschau nebeneinander, damit Sie genau sehen können, wie Ihr Markdown gerendert wird, während Sie tippen.',
        'Der Editor unterstützt alle Standard-Markdown-Funktionen: Überschriften, Fettdruck, Kursiv, Durchgestrichen, Links, Bilder, Zitate, Codeblöcke, Inline-Code, geordnete und ungeordnete Listen sowie horizontale Linien.',
        'Ob Entwickler, technischer Redakteur oder Student – dieses Tool hilft Ihnen, Markdown zu schreiben und zu überprüfen, ohne Software zu installieren.',
      ],
      faq: [
        { q: 'Was ist Markdown und warum sollte ich es verwenden?', a: 'Markdown ist eine Klartext-Formatierungssyntax, die sich in HTML konvertiert. Es ist einfacher zu lesen und schreiben als HTML, plattformunabhängig und wird von GitHub, Reddit und Stack Overflow unterstützt.' },
        { q: 'Unterstützt diese Vorschau GitHub-Flavored Markdown (GFM)?', a: 'Dieses Tool unterstützt die am häufigsten verwendeten Markdown-Funktionen einschließlich Überschriften, Fettdruck, Kursiv, Durchgestrichen, Listen, Links, Bilder, Zitate und Codeblöcke.' },
        { q: 'Kann ich das Tool zum Schreiben von README-Dateien nutzen?', a: 'Auf jeden Fall. Schreiben Sie im Editor, überprüfen Sie die Vorschau und kopieren Sie dann den Markdown-Quelltext in Ihre README.md-Datei.' },
        { q: 'Wird das Markdown auf einem Server verarbeitet?', a: 'Nein. Alles Parsing und Rendering geschieht lokal in Ihrem Browser. Ihre Inhalte verlassen niemals Ihr Gerät.' },
        { q: 'Was sind die häufigsten Markdown-Syntaxelemente?', a: 'Die am meisten verwendeten sind: # für Überschriften, **Text** für Fettdruck, *Text* für Kursiv, - für Listen, [Text](URL) für Links, ![Alt](URL) für Bilder, > für Zitate und Backticks für Code.' },
      ],
    },
    pt: {
      title: 'Pré-visualização Markdown Online Grátis – Editor ao Vivo com Renderização Instantânea',
      paragraphs: [
        'Markdown é uma linguagem de marcação leve criada por John Gruber em 2004 que permite formatar texto usando sintaxe simples e intuitiva. É o formato padrão para arquivos README do GitHub, sites de documentação, geradores de sites estáticos e apps de notas como Obsidian e Notion.',
        'Nossa ferramenta de pré-visualização Markdown gratuita oferece um editor e uma visualização ao vivo lado a lado, para que você veja exatamente como seu Markdown será renderizado enquanto digita.',
        'O editor suporta todos os recursos padrão do Markdown: cabeçalhos, negrito, itálico, tachado, links, imagens, citações, blocos de código, código inline, listas ordenadas e não ordenadas e linhas horizontais.',
        'Seja desenvolvedor, redator técnico ou estudante, esta ferramenta ajuda a escrever e verificar Markdown sem instalar nenhum software.',
      ],
      faq: [
        { q: 'O que é Markdown e por que devo usá-lo?', a: 'Markdown é uma sintaxe de formatação de texto simples que se converte em HTML. É mais fácil de ler e escrever que HTML, independente de plataforma e amplamente suportado por GitHub, Reddit e Stack Overflow.' },
        { q: 'Esta pré-visualização suporta GitHub-Flavored Markdown (GFM)?', a: 'Esta ferramenta suporta os recursos Markdown mais comuns incluindo cabeçalhos, negrito, itálico, tachado, listas, links, imagens, citações e blocos de código.' },
        { q: 'Posso usar esta ferramenta para escrever arquivos README?', a: 'Com certeza. Escreva no editor, verifique na pré-visualização e copie o Markdown para seu arquivo README.md.' },
        { q: 'O Markdown é processado em um servidor?', a: 'Não. Todo o parsing e renderização acontecem localmente no navegador. Seu conteúdo nunca sai do seu dispositivo.' },
        { q: 'Quais são os elementos de sintaxe Markdown mais comuns?', a: 'Os mais usados são: # para cabeçalhos, **texto** para negrito, *texto* para itálico, - para listas, [texto](url) para links, ![alt](url) para imagens, > para citações e crases para código.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="markdown-preview" faqItems={seo.faq}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-700">{wordCount}</div>
            <div className="text-xs text-blue-600 font-medium">{t('words')}</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-700">{charCount}</div>
            <div className="text-xs text-green-600 font-medium">{t('characters')}</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-purple-700">{lineCount}</div>
            <div className="text-xs text-purple-600 font-medium">{t('lines')}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => copyToClipboard(rendered, 'html')}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {copiedKey === 'html' ? t('copied') : t('copyHtml')}
          </button>
          <button
            onClick={() => copyToClipboard(markdown, 'md')}
            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {copiedKey === 'md' ? t('copied') : t('copyMarkdown')}
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {t('reset')}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {isFullscreen ? t('exitFullscreen') : t('fullscreen')}
          </button>
        </div>

        {/* Sample Templates */}
        <div className="mb-4">
          <span className="text-xs font-medium text-gray-500 mr-2">{t('templates')}:</span>
          <div className="inline-flex flex-wrap gap-1.5">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                onClick={() => insertTemplate(tpl.md)}
                className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-mono"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Editor + Preview */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4 overflow-auto' : ''}`}>
          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-2 right-4 z-50 px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              {t('exitFullscreen')}
            </button>
          )}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('editor')}</label>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder={t('placeholder')}
              className={`w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-96'}`}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('preview')}</label>
            <div
              className={`overflow-y-auto border border-gray-300 rounded-lg px-4 py-2 prose prose-sm max-w-none ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-96'}`}
              dangerouslySetInnerHTML={{ __html: rendered }}
            />
          </div>
        </div>

        {/* History */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">{t('history')}</h3>
            <div className="flex gap-2">
              <button
                onClick={saveToHistory}
                disabled={!markdown.trim()}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t('saveToHistory')}
              </button>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t('clearHistory')}
                </button>
              )}
            </div>
          </div>
          {history.length === 0 ? (
            <p className="text-xs text-gray-400 italic">{t('noHistory')}</p>
          ) : (
            <div className="space-y-1.5">
              {history.map((item, i) => (
                <button
                  key={item.timestamp}
                  onClick={() => loadFromHistory(item)}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex justify-between items-center"
                >
                  <span className="font-mono text-gray-700 truncate">{item.preview}</span>
                  <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <div key={i} className="text-gray-700 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: p }} />)}
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
