'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  editor: { en: 'Markdown Editor', it: 'Editor Markdown', es: 'Editor Markdown', fr: 'Éditeur Markdown', de: 'Markdown-Editor', pt: 'Editor Markdown' },
  preview: { en: 'Preview', it: 'Anteprima', es: 'Vista Previa', fr: 'Aperçu', de: 'Vorschau', pt: 'Pré-visualização' },
  placeholder: { en: '# Hello World\n\nWrite some **markdown** here...\n\n- Item 1\n- Item 2\n\n> A blockquote\n\n`inline code`\n\n```\ncode block\n```', it: '# Ciao Mondo\n\nScrivi del **markdown** qui...', es: '# Hola Mundo\n\nEscribe algo de **markdown** aquí...', fr: '# Bonjour le Monde\n\nÉcrivez du **markdown** ici...', de: '# Hallo Welt\n\nSchreiben Sie hier **Markdown**...', pt: '# Olá Mundo\n\nEscreva algum **markdown** aqui...' },
};

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

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded my-2" />');

  // Paragraphs (double newlines)
  html = html.replace(/\n\n/g, '</p><p class="my-2">');
  html = '<p class="my-2">' + html + '</p>';

  // Single newlines -> <br>
  html = html.replace(/\n/g, '<br />');

  // Clean empty paragraphs
  html = html.replace(/<p class="my-2"><\/p>/g, '');

  return html;
}

export default function MarkdownPreview() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['markdown-preview'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [markdown, setMarkdown] = useState('');

  const rendered = useMemo(() => parseMarkdown(markdown || ''), [markdown]);

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
      title: 'Vista Previa de Markdown Online Gratis – Editor en Vivo con Renderizado Instantáneo',
      paragraphs: [
        'Markdown es un lenguaje de marcado ligero creado por John Gruber en 2004 que permite formatear texto usando una sintaxis simple e intuitiva. Es el formato estándar para archivos README de GitHub, sitios de documentación, generadores de sitios estáticos y apps de notas como Obsidian y Notion.',
        'Nuestra herramienta de vista previa Markdown gratuita proporciona un editor y una vista previa en vivo lado a lado, para que puedas ver exactamente cómo se renderizará tu Markdown mientras escribes.',
        'El editor soporta todas las características estándar de Markdown: encabezados, negrita, cursiva, tachado, enlaces, imágenes, citas, bloques de código, código en línea, listas ordenadas y no ordenadas, y líneas horizontales.',
        'Ya seas un desarrollador escribiendo documentación, un escritor técnico o un estudiante tomando notas, esta herramienta te ayuda a escribir y verificar tu Markdown sin instalar ningún software.',
      ],
      faq: [
        { q: '¿Qué es Markdown y por qué debería usarlo?', a: 'Markdown es una sintaxis de formato de texto plano que se convierte a HTML. Es más fácil de leer y escribir que HTML, independiente de plataforma y ampliamente soportado por herramientas como GitHub, Reddit y Stack Overflow.' },
        { q: '¿Esta vista previa soporta GitHub-Flavored Markdown (GFM)?', a: 'Esta herramienta soporta las características Markdown más comunes incluyendo encabezados, negrita, cursiva, tachado, listas, enlaces, imágenes, citas y bloques de código.' },
        { q: '¿Puedo usar esta herramienta para escribir archivos README?', a: 'Por supuesto. Escribe el contenido en el editor, verifica que se vea correcto en la vista previa, luego copia el Markdown a tu archivo README.md.' },
        { q: '¿El Markdown se procesa en un servidor?', a: 'No. Todo el análisis y renderizado ocurre localmente en tu navegador. Tu contenido nunca sale de tu dispositivo.' },
        { q: '¿Cuáles son los elementos de sintaxis Markdown más comunes?', a: 'Los más usados son: # para encabezados, **texto** para negrita, *texto* para cursiva, - para listas, [texto](url) para enlaces, ![alt](url) para imágenes, > para citas y backticks para código.' },
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('editor')}</label>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder={t('placeholder')}
              className="w-full h-96 border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('preview')}</label>
            <div
              className="h-96 overflow-y-auto border border-gray-300 rounded-lg px-4 py-2 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: rendered }}
            />
          </div>
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
