'use client';
import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type HarmonyMode = 'random' | 'analogous' | 'complementary' | 'triadic' | 'monochromatic';

interface PaletteColor {
  hex: string;
  locked: boolean;
}

interface SavedPalette {
  id: string;
  colors: string[];
  name: string;
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function randomHex(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getTextColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return getLuminance(r, g, b) > 0.5 ? '#000000' : '#ffffff';
}

function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

function generateHarmonyPalette(baseHex: string, mode: HarmonyMode): string[] {
  const { r, g, b } = hexToRgb(baseHex);
  const hsl = rgbToHsl(r, g, b);

  switch (mode) {
    case 'analogous':
      return [
        hslToHex((hsl.h + 330) % 360, hsl.s, hsl.l),
        hslToHex((hsl.h + 345) % 360, hsl.s, hsl.l),
        baseHex,
        hslToHex((hsl.h + 15) % 360, hsl.s, hsl.l),
        hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
      ];
    case 'complementary':
      return [
        hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 15, 10)),
        baseHex,
        hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 15, 90)),
        hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
        hslToHex((hsl.h + 180) % 360, hsl.s, Math.min(hsl.l + 15, 90)),
      ];
    case 'triadic':
      return [
        baseHex,
        hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 15, 90)),
        hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
        hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
        hslToHex((hsl.h + 240) % 360, hsl.s, Math.max(hsl.l - 15, 10)),
      ];
    case 'monochromatic':
      return [
        hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 30, 5)),
        hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 15, 10)),
        baseHex,
        hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 15, 90)),
        hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 30, 95)),
      ];
    case 'random':
    default:
      return [randomHex(), randomHex(), randomHex(), randomHex(), randomHex()];
  }
}

const labels: Record<string, Record<Locale, string>> = {
  generate: { en: 'Generate Palette', it: 'Genera Palette', es: 'Generar Paleta', fr: 'Générer Palette', de: 'Palette Generieren', pt: 'Gerar Paleta' },
  harmonyMode: { en: 'Harmony Mode', it: 'Modalità Armonia', es: 'Modo de Armonía', fr: 'Mode Harmonie', de: 'Harmoniemodus', pt: 'Modo de Harmonia' },
  random: { en: 'Random', it: 'Casuale', es: 'Aleatorio', fr: 'Aléatoire', de: 'Zufällig', pt: 'Aleatório' },
  analogous: { en: 'Analogous', it: 'Analogo', es: 'Análogo', fr: 'Analogue', de: 'Analog', pt: 'Análogo' },
  complementary: { en: 'Complementary', it: 'Complementare', es: 'Complementario', fr: 'Complémentaire', de: 'Komplementär', pt: 'Complementar' },
  triadic: { en: 'Triadic', it: 'Triadico', es: 'Triádico', fr: 'Triadique', de: 'Triadisch', pt: 'Triádico' },
  monochromatic: { en: 'Monochromatic', it: 'Monocromatico', es: 'Monocromático', fr: 'Monochromatique', de: 'Monochromatisch', pt: 'Monocromático' },
  baseColor: { en: 'Base Color', it: 'Colore Base', es: 'Color Base', fr: 'Couleur de Base', de: 'Grundfarbe', pt: 'Cor Base' },
  lock: { en: 'Lock', it: 'Blocca', es: 'Bloquear', fr: 'Verrouiller', de: 'Sperren', pt: 'Bloquear' },
  unlock: { en: 'Unlock', it: 'Sblocca', es: 'Desbloquear', fr: 'Déverrouiller', de: 'Entsperren', pt: 'Desbloquear' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  copyAll: { en: 'Copy All', it: 'Copia Tutto', es: 'Copiar Todo', fr: 'Tout Copier', de: 'Alle Kopieren', pt: 'Copiar Tudo' },
  exportCss: { en: 'Export CSS Variables', it: 'Esporta Variabili CSS', es: 'Exportar Variables CSS', fr: 'Exporter Variables CSS', de: 'CSS-Variablen Exportieren', pt: 'Exportar Variáveis CSS' },
  savedPalettes: { en: 'Saved Palettes', it: 'Palette Salvate', es: 'Paletas Guardadas', fr: 'Palettes Enregistrées', de: 'Gespeicherte Paletten', pt: 'Paletas Salvas' },
  save: { en: 'Save Palette', it: 'Salva Palette', es: 'Guardar Paleta', fr: 'Enregistrer Palette', de: 'Palette Speichern', pt: 'Salvar Paleta' },
  delete: { en: 'Delete', it: 'Elimina', es: 'Eliminar', fr: 'Supprimer', de: 'Löschen', pt: 'Excluir' },
  load: { en: 'Load', it: 'Carica', es: 'Cargar', fr: 'Charger', de: 'Laden', pt: 'Carregar' },
  noSaved: { en: 'No saved palettes yet.', it: 'Nessuna palette salvata.', es: 'Aún no hay paletas guardadas.', fr: 'Aucune palette enregistrée.', de: 'Noch keine Paletten gespeichert.', pt: 'Nenhuma paleta salva ainda.' },
  contrastCheck: { en: 'Contrast Check', it: 'Verifica Contrasto', es: 'Verificación de Contraste', fr: 'Vérification de Contraste', de: 'Kontrastprüfung', pt: 'Verificação de Contraste' },
  textOnBg: { en: 'Text on Background', it: 'Testo su Sfondo', es: 'Texto sobre Fondo', fr: 'Texte sur Fond', de: 'Text auf Hintergrund', pt: 'Texto sobre Fundo' },
  passAA: { en: 'AA Pass', it: 'AA Superato', es: 'AA Aprobado', fr: 'AA Réussi', de: 'AA Bestanden', pt: 'AA Aprovado' },
  failAA: { en: 'AA Fail', it: 'AA Non Superato', es: 'AA No Aprobado', fr: 'AA Échoué', de: 'AA Nicht Bestanden', pt: 'AA Reprovado' },
  pressSpace: { en: 'Press Space to generate', it: 'Premi Spazio per generare', es: 'Pulsa Espacio para generar', fr: 'Appuyez sur Espace pour générer', de: 'Leertaste drücken zum Generieren', pt: 'Pressione Espaço para gerar' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'Color Palette Generator: Create Beautiful Color Schemes',
    paragraphs: [
      'Creating harmonious color palettes is one of the most challenging aspects of design. Our free Color Palette Generator takes the guesswork out of color selection by offering multiple harmony modes — Analogous, Complementary, Triadic, Monochromatic, and Random — so you can quickly discover beautiful color combinations for any project.',
      'Each palette generates five colors that work well together. You can lock individual colors you like and regenerate the rest, allowing you to iteratively refine your palette until it is perfect. Every color displays its value in HEX, RGB, and HSL formats, making it easy to use in CSS, design tools, or any application.',
      'The built-in contrast checker helps ensure your color choices are accessible. It tests text readability against each background color using WCAG guidelines, showing whether black or white text meets AA accessibility standards. This is crucial for creating inclusive web designs that everyone can read.',
      'Save your favorite palettes to local storage so you never lose a great combination. Export your palette as CSS custom properties (variables) ready to paste into your stylesheet. Whether you are a web developer, graphic designer, or just exploring color theory, this tool streamlines the process of finding the perfect color scheme.',
    ],
    faq: [
      { q: 'What is a color harmony and why does it matter?', a: 'Color harmony refers to aesthetically pleasing color combinations based on their positions on the color wheel. Harmonious palettes create visual balance and are more appealing to viewers. Different harmony types (analogous, complementary, triadic, monochromatic) produce different moods and effects in design.' },
      { q: 'How do I choose the right harmony mode for my project?', a: 'Analogous colors (neighboring on the color wheel) create calm, unified designs. Complementary colors (opposite on the wheel) offer high contrast and energy. Triadic provides vibrant variety with balance. Monochromatic uses a single hue with varying lightness for subtle, elegant designs. Random is great for experimentation.' },
      { q: 'What does locking a color in the palette do?', a: 'Locking a color keeps it fixed while all unlocked colors are regenerated. This lets you keep colors you love and find new ones that complement them, making it easy to build a palette around a brand color or specific shade you need to use.' },
      { q: 'How do I export my palette for use in CSS?', a: 'Click the "Export CSS Variables" button to copy CSS custom properties to your clipboard. The output includes variables like --color-1 through --color-5 that you can paste directly into your :root selector in CSS, making them available throughout your stylesheet.' },
      { q: 'What is WCAG contrast and why should I check it?', a: 'WCAG (Web Content Accessibility Guidelines) defines minimum contrast ratios between text and background colors to ensure readability. A ratio of 4.5:1 is needed for normal text (AA level). This tool checks each palette color as a background against black and white text, helping you create accessible designs.' },
    ],
  },
  it: {
    title: 'Generatore di Palette Colori: Crea Combinazioni Armoniose',
    paragraphs: [
      'Creare palette di colori armoniose è una delle sfide più grandi nel design. Il nostro Generatore di Palette Colori gratuito elimina le incertezze nella selezione dei colori offrendo diverse modalità di armonia — Analogo, Complementare, Triadico, Monocromatico e Casuale — per scoprire rapidamente belle combinazioni di colori.',
      'Ogni palette genera cinque colori che funzionano bene insieme. Puoi bloccare i colori che ti piacciono e rigenerare gli altri, perfezionando iterativamente la tua palette. Ogni colore mostra il suo valore in formato HEX, RGB e HSL, facile da usare in CSS, strumenti di design o qualsiasi applicazione.',
      'Il verificatore di contrasto integrato assicura che le tue scelte cromatiche siano accessibili. Testa la leggibilità del testo contro ogni colore di sfondo seguendo le linee guida WCAG, mostrando se il testo nero o bianco soddisfa gli standard di accessibilità AA.',
      'Salva le tue palette preferite nella memoria locale per non perdere mai una grande combinazione. Esporta la palette come variabili CSS personalizzate pronte da incollare nel tuo foglio di stile.',
    ],
    faq: [
      { q: 'Cos\'è l\'armonia dei colori e perché è importante?', a: 'L\'armonia dei colori si riferisce a combinazioni esteticamente piacevoli basate sulle posizioni nella ruota dei colori. Le palette armoniose creano equilibrio visivo e sono più attraenti. Diversi tipi di armonia producono effetti e atmosfere differenti nel design.' },
      { q: 'Come scelgo la modalità di armonia giusta?', a: 'I colori analoghi creano design calmi e unificati. I colori complementari offrono alto contrasto ed energia. Il triadico fornisce varietà vibrante con equilibrio. Il monocromatico usa una singola tonalità per design sottili ed eleganti. Il casuale è ottimo per sperimentare.' },
      { q: 'Cosa fa il blocco di un colore nella palette?', a: 'Bloccare un colore lo mantiene fisso mentre tutti gli altri colori sbloccati vengono rigenerati. Questo ti permette di mantenere i colori che ami e trovarne di nuovi che li complementino.' },
      { q: 'Come esporto la mia palette per usarla in CSS?', a: 'Clicca "Esporta Variabili CSS" per copiare le proprietà personalizzate CSS negli appunti. L\'output include variabili come --color-1 fino a --color-5 da incollare direttamente nel selettore :root del tuo CSS.' },
      { q: 'Cos\'è il contrasto WCAG e perché dovrei verificarlo?', a: 'Le WCAG definiscono rapporti minimi di contrasto tra testo e sfondo per garantire la leggibilità. Un rapporto di 4.5:1 è necessario per il testo normale (livello AA). Questo strumento controlla ogni colore della palette come sfondo contro testo nero e bianco.' },
    ],
  },
  es: {
    title: 'Generador de Paletas de Color: Crea Esquemas Armoniosos',
    paragraphs: [
      'Crear paletas de colores armoniosas es uno de los aspectos más desafiantes del diseño. Nuestro Generador de Paletas de Color gratuito elimina las conjeturas en la selección de colores ofreciendo múltiples modos de armonía — Análogo, Complementario, Triádico, Monocromático y Aleatorio.',
      'Cada paleta genera cinco colores que combinan bien juntos. Puedes bloquear colores individuales y regenerar el resto, refinando iterativamente tu paleta. Cada color muestra su valor en formatos HEX, RGB y HSL, fácil de usar en CSS o herramientas de diseño.',
      'El verificador de contraste integrado ayuda a garantizar que tus elecciones de color sean accesibles. Prueba la legibilidad del texto contra cada color de fondo usando las directrices WCAG, mostrando si el texto negro o blanco cumple con los estándares de accesibilidad AA.',
      'Guarda tus paletas favoritas en almacenamiento local para nunca perder una gran combinación. Exporta tu paleta como variables CSS personalizadas listas para pegar en tu hoja de estilos.',
    ],
    faq: [
      { q: '¿Qué es la armonía del color y por qué importa?', a: 'La armonía del color se refiere a combinaciones estéticamente agradables basadas en sus posiciones en el círculo cromático. Las paletas armoniosas crean equilibrio visual y son más atractivas. Diferentes tipos de armonía producen diferentes estados de ánimo y efectos en el diseño.' },
      { q: '¿Cómo elijo el modo de armonía correcto?', a: 'Los colores análogos crean diseños calmados y unificados. Los complementarios ofrecen alto contraste y energía. El triádico proporciona variedad vibrante con equilibrio. El monocromático usa un solo tono para diseños sutiles y elegantes. El aleatorio es excelente para experimentar.' },
      { q: '¿Qué hace bloquear un color en la paleta?', a: 'Bloquear un color lo mantiene fijo mientras todos los colores desbloqueados se regeneran. Esto te permite mantener los colores que te gustan y encontrar nuevos que los complementen.' },
      { q: '¿Cómo exporto mi paleta para usar en CSS?', a: 'Haz clic en "Exportar Variables CSS" para copiar las propiedades personalizadas CSS al portapapeles. La salida incluye variables como --color-1 hasta --color-5 que puedes pegar directamente en tu selector :root en CSS.' },
      { q: '¿Qué es el contraste WCAG y por qué debo verificarlo?', a: 'Las WCAG definen ratios mínimos de contraste entre texto y colores de fondo para asegurar la legibilidad. Se necesita un ratio de 4.5:1 para texto normal (nivel AA). Esta herramienta verifica cada color de la paleta como fondo contra texto negro y blanco.' },
    ],
  },
  fr: {
    title: 'Générateur de Palettes de Couleurs : Créez de Belles Combinaisons',
    paragraphs: [
      'Créer des palettes de couleurs harmonieuses est l\'un des aspects les plus difficiles du design. Notre Générateur de Palettes de Couleurs gratuit élimine les conjectures dans la sélection des couleurs en offrant plusieurs modes d\'harmonie — Analogue, Complémentaire, Triadique, Monochromatique et Aléatoire.',
      'Chaque palette génère cinq couleurs qui fonctionnent bien ensemble. Vous pouvez verrouiller les couleurs individuelles et régénérer le reste, affinant itérativement votre palette. Chaque couleur affiche sa valeur en formats HEX, RGB et HSL, facile à utiliser en CSS ou outils de design.',
      'Le vérificateur de contraste intégré aide à garantir que vos choix de couleurs sont accessibles. Il teste la lisibilité du texte contre chaque couleur de fond en utilisant les directives WCAG, montrant si le texte noir ou blanc respecte les standards d\'accessibilité AA.',
      'Enregistrez vos palettes favorites dans le stockage local pour ne jamais perdre une bonne combinaison. Exportez votre palette en propriétés personnalisées CSS prêtes à coller dans votre feuille de style.',
    ],
    faq: [
      { q: 'Qu\'est-ce que l\'harmonie des couleurs et pourquoi est-ce important ?', a: 'L\'harmonie des couleurs désigne des combinaisons esthétiquement agréables basées sur leurs positions sur le cercle chromatique. Les palettes harmonieuses créent un équilibre visuel et sont plus attrayantes. Différents types d\'harmonie produisent différentes ambiances dans le design.' },
      { q: 'Comment choisir le bon mode d\'harmonie ?', a: 'Les couleurs analogues créent des designs calmes et unifiés. Les complémentaires offrent un contraste élevé et de l\'énergie. Le triadique fournit une variété vibrante avec équilibre. Le monochromatique utilise une seule teinte pour des designs subtils et élégants.' },
      { q: 'Que fait le verrouillage d\'une couleur dans la palette ?', a: 'Verrouiller une couleur la maintient fixe tandis que toutes les couleurs déverrouillées sont régénérées. Cela vous permet de garder les couleurs que vous aimez et d\'en trouver de nouvelles qui les complètent.' },
      { q: 'Comment exporter ma palette pour l\'utiliser en CSS ?', a: 'Cliquez sur "Exporter Variables CSS" pour copier les propriétés personnalisées CSS dans le presse-papiers. La sortie inclut des variables comme --color-1 à --color-5 à coller dans votre sélecteur :root.' },
      { q: 'Qu\'est-ce que le contraste WCAG et pourquoi le vérifier ?', a: 'Les WCAG définissent des ratios minimaux de contraste entre texte et couleurs de fond pour assurer la lisibilité. Un ratio de 4.5:1 est nécessaire pour le texte normal (niveau AA). Cet outil vérifie chaque couleur de la palette comme fond contre le texte noir et blanc.' },
    ],
  },
  de: {
    title: 'Farbpaletten-Generator: Erstellen Sie Harmonische Farbschemata',
    paragraphs: [
      'Harmonische Farbpaletten zu erstellen ist eine der größten Herausforderungen im Design. Unser kostenloser Farbpaletten-Generator nimmt das Rätselraten bei der Farbauswahl ab, indem er mehrere Harmoniemodi bietet — Analog, Komplementär, Triadisch, Monochromatisch und Zufällig.',
      'Jede Palette generiert fünf Farben, die gut zusammenpassen. Sie können einzelne Farben sperren und den Rest neu generieren, um Ihre Palette iterativ zu verfeinern. Jede Farbe zeigt ihren Wert in HEX, RGB und HSL Formaten, einfach in CSS oder Design-Tools zu verwenden.',
      'Der integrierte Kontrastprüfer hilft sicherzustellen, dass Ihre Farbwahlen barrierefrei sind. Er testet die Textlesbarkeit gegen jede Hintergrundfarbe anhand der WCAG-Richtlinien und zeigt, ob schwarzer oder weißer Text die AA-Barrierefreiheitsstandards erfüllt.',
      'Speichern Sie Ihre Lieblingspaletten im lokalen Speicher, um nie eine tolle Kombination zu verlieren. Exportieren Sie Ihre Palette als CSS-Variablen, die Sie direkt in Ihr Stylesheet einfügen können.',
    ],
    faq: [
      { q: 'Was ist Farbharmonie und warum ist sie wichtig?', a: 'Farbharmonie bezieht sich auf ästhetisch ansprechende Farbkombinationen basierend auf ihren Positionen im Farbkreis. Harmonische Paletten schaffen visuelles Gleichgewicht und sind ansprechender. Verschiedene Harmonietypen erzeugen unterschiedliche Stimmungen und Effekte im Design.' },
      { q: 'Wie wähle ich den richtigen Harmoniemodus?', a: 'Analoge Farben schaffen ruhige, einheitliche Designs. Komplementärfarben bieten hohen Kontrast und Energie. Triadisch bietet lebhafte Vielfalt mit Balance. Monochromatisch verwendet einen einzelnen Farbton für subtile, elegante Designs. Zufällig eignet sich zum Experimentieren.' },
      { q: 'Was bewirkt das Sperren einer Farbe in der Palette?', a: 'Das Sperren einer Farbe hält sie fest, während alle nicht gesperrten Farben neu generiert werden. So können Sie Farben behalten, die Ihnen gefallen, und neue finden, die dazu passen.' },
      { q: 'Wie exportiere ich meine Palette für CSS?', a: 'Klicken Sie auf "CSS-Variablen Exportieren", um die benutzerdefinierten CSS-Eigenschaften in die Zwischenablage zu kopieren. Die Ausgabe enthält Variablen wie --color-1 bis --color-5 zum direkten Einfügen in Ihren :root-Selektor.' },
      { q: 'Was ist WCAG-Kontrast und warum sollte ich ihn prüfen?', a: 'Die WCAG definieren minimale Kontrastverhältnisse zwischen Text und Hintergrundfarben für Lesbarkeit. Ein Verhältnis von 4.5:1 wird für normalen Text benötigt (AA-Level). Dieses Tool prüft jede Palettenfarbe als Hintergrund gegen schwarzen und weißen Text.' },
    ],
  },
  pt: {
    title: 'Gerador de Paletas de Cores: Crie Combinações Harmoniosas',
    paragraphs: [
      'Criar paletas de cores harmoniosas é um dos aspectos mais desafiadores do design. Nosso Gerador de Paletas de Cores gratuito elimina as adivinhações na seleção de cores oferecendo múltiplos modos de harmonia — Análogo, Complementar, Triádico, Monocromático e Aleatório.',
      'Cada paleta gera cinco cores que combinam bem juntas. Você pode bloquear cores individuais e regenerar o resto, refinando iterativamente sua paleta. Cada cor mostra seu valor nos formatos HEX, RGB e HSL, fácil de usar em CSS ou ferramentas de design.',
      'O verificador de contraste integrado ajuda a garantir que suas escolhas de cores sejam acessíveis. Ele testa a legibilidade do texto contra cada cor de fundo usando as diretrizes WCAG, mostrando se o texto preto ou branco atende aos padrões de acessibilidade AA.',
      'Salve suas paletas favoritas no armazenamento local para nunca perder uma boa combinação. Exporte sua paleta como variáveis CSS personalizadas prontas para colar na sua folha de estilos.',
    ],
    faq: [
      { q: 'O que é harmonia de cores e por que é importante?', a: 'Harmonia de cores refere-se a combinações esteticamente agradáveis baseadas em suas posições no círculo cromático. Paletas harmoniosas criam equilíbrio visual e são mais atraentes. Diferentes tipos de harmonia produzem diferentes humores e efeitos no design.' },
      { q: 'Como escolho o modo de harmonia certo?', a: 'Cores análogas criam designs calmos e unificados. Complementares oferecem alto contraste e energia. Triádico fornece variedade vibrante com equilíbrio. Monocromático usa um único matiz para designs sutis e elegantes. Aleatório é ótimo para experimentar.' },
      { q: 'O que faz o bloqueio de uma cor na paleta?', a: 'Bloquear uma cor a mantém fixa enquanto todas as cores desbloqueadas são regeneradas. Isso permite manter as cores que você gosta e encontrar novas que as complementem.' },
      { q: 'Como exporto minha paleta para usar em CSS?', a: 'Clique em "Exportar Variáveis CSS" para copiar as propriedades CSS personalizadas para a área de transferência. A saída inclui variáveis como --color-1 até --color-5 para colar diretamente no seu seletor :root.' },
      { q: 'O que é contraste WCAG e por que devo verificá-lo?', a: 'As WCAG definem proporções mínimas de contraste entre texto e cores de fundo para garantir a legibilidade. Uma proporção de 4.5:1 é necessária para texto normal (nível AA). Esta ferramenta verifica cada cor da paleta como fundo contra texto preto e branco.' },
    ],
  },
};

export default function ColorPaletteGenerator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['color-palette-generator'][lang];

  const t = useCallback((key: string) => labels[key]?.[lang] ?? labels[key]?.en ?? key, [lang]);

  const [mode, setMode] = useState<HarmonyMode>('random');
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [baseInput, setBaseInput] = useState('#3b82f6');
  const [palette, setPalette] = useState<PaletteColor[]>(() =>
    [randomHex(), randomHex(), randomHex(), randomHex(), randomHex()].map(hex => ({ hex, locked: false }))
  );
  const [copied, setCopied] = useState('');
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Load saved palettes from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('colorPalettes');
      if (stored) setSavedPalettes(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const savePalettesToStorage = useCallback((palettes: SavedPalette[]) => {
    setSavedPalettes(palettes);
    try { localStorage.setItem('colorPalettes', JSON.stringify(palettes)); } catch { /* ignore */ }
  }, []);

  const generatePalette = useCallback(() => {
    if (mode === 'random') {
      setPalette(prev => prev.map(c => c.locked ? c : { hex: randomHex(), locked: false }));
    } else {
      const newColors = generateHarmonyPalette(baseColor, mode);
      setPalette(prev => prev.map((c, i) => c.locked ? c : { hex: newColors[i], locked: false }));
    }
  }, [mode, baseColor]);

  // Keyboard shortcut: space to generate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        generatePalette();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [generatePalette]);

  const toggleLock = (index: number) => {
    setPalette(prev => prev.map((c, i) => i === index ? { ...c, locked: !c.locked } : c));
  };

  const copy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(val);
    setTimeout(() => setCopied(''), 2000);
  };

  const copyAll = () => {
    const allHex = palette.map(c => c.hex.toUpperCase()).join(', ');
    copy(allHex);
  };

  const exportCss = () => {
    const css = `:root {\n${palette.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`;
    copy(css);
  };

  const savePalette = () => {
    const newPalette: SavedPalette = {
      id: Date.now().toString(),
      colors: palette.map(c => c.hex),
      name: `Palette ${savedPalettes.length + 1}`,
    };
    savePalettesToStorage([newPalette, ...savedPalettes].slice(0, 20));
  };

  const deleteSavedPalette = (id: string) => {
    savePalettesToStorage(savedPalettes.filter(p => p.id !== id));
  };

  const loadPalette = (colors: string[]) => {
    setPalette(colors.map(hex => ({ hex, locked: false })));
  };

  const handleBaseInput = (val: string) => {
    let v = val;
    if (!v.startsWith('#')) v = '#' + v;
    setBaseInput(v);
    if (isValidHex(v)) {
      setBaseColor(v.toLowerCase());
    }
  };

  const seo = seoContent[lang];
  const modes: HarmonyMode[] = ['random', 'analogous', 'complementary', 'triadic', 'monochromatic'];

  return (
    <ToolPageWrapper toolSlug="color-palette-generator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Harmony Mode Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('harmonyMode')}</label>
            <div className="flex flex-wrap gap-2">
              {modes.map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    mode === m
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t(m)}
                </button>
              ))}
            </div>
          </div>

          {/* Base Color Input (shown for non-random modes) */}
          {mode !== 'random' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('baseColor')}</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => { setBaseColor(e.target.value); setBaseInput(e.target.value); }}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={baseInput}
                  onChange={(e) => handleBaseInput(e.target.value)}
                  placeholder="#3B82F6"
                  maxLength={7}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generatePalette}
            className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('generate')}
          </button>
          <p className="text-xs text-center text-gray-400 -mt-3">{t('pressSpace')}</p>

          {/* Palette Display */}
          <div className="grid grid-cols-5 gap-2 rounded-xl overflow-hidden">
            {palette.map((c, i) => {
              const rgb = hexToRgb(c.hex);
              const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
              const textCol = getTextColor(c.hex);
              return (
                <div key={i} className="flex flex-col">
                  <div
                    className="h-32 sm:h-40 relative group cursor-pointer flex flex-col items-center justify-center rounded-t-lg"
                    style={{ backgroundColor: c.hex }}
                    onClick={() => copy(c.hex.toUpperCase())}
                  >
                    <span className="font-mono text-xs sm:text-sm font-bold" style={{ color: textCol }}>
                      {c.hex.toUpperCase()}
                    </span>
                    <span className="text-[10px] mt-1 opacity-70" style={{ color: textCol }}>
                      {copied === c.hex.toUpperCase() ? t('copied') : t('copy')}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleLock(i)}
                    className={`py-1.5 text-xs font-medium transition-colors rounded-b-lg ${
                      c.locked
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {c.locked ? '🔒' : '🔓'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Color Details */}
          <div className="space-y-2">
            {palette.map((c, i) => {
              const rgb = hexToRgb(c.hex);
              const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
              return (
                <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2 bg-gray-50 border border-gray-200 text-sm">
                  <div className="w-6 h-6 rounded border border-gray-300 flex-shrink-0" style={{ backgroundColor: c.hex }} />
                  <span className="font-mono text-gray-700 flex-1 text-xs sm:text-sm">
                    {c.hex.toUpperCase()} &middot; rgb({rgb.r},{rgb.g},{rgb.b}) &middot; hsl({hsl.h},{hsl.s}%,{hsl.l}%)
                  </span>
                  <button
                    onClick={() => copy(c.hex.toUpperCase())}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-shrink-0"
                  >
                    {copied === c.hex.toUpperCase() ? t('copied') : t('copy')}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button onClick={copyAll} className="flex-1 px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              {t('copyAll')}
            </button>
            <button onClick={exportCss} className="flex-1 px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              {t('exportCss')}
            </button>
            <button onClick={savePalette} className="flex-1 px-3 py-2 text-sm font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
              {t('save')}
            </button>
          </div>
        </div>

        {/* Contrast Check */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">{t('contrastCheck')}</h2>
          <div className="space-y-3">
            {palette.map((c, i) => {
              const rgb = hexToRgb(c.hex);
              const lum = getLuminance(rgb.r, rgb.g, rgb.b);
              const blackRatio = getContrastRatio(lum, 0);
              const whiteRatio = getContrastRatio(lum, 1);
              const blackPass = blackRatio >= 4.5;
              const whitePass = whiteRatio >= 4.5;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-full flex gap-2">
                    <div className="flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium" style={{ backgroundColor: c.hex, color: '#000' }}>
                      Aa <span className={`ml-1 text-xs px-1.5 py-0.5 rounded ${blackPass ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {blackPass ? t('passAA') : t('failAA')}
                      </span>
                    </div>
                    <div className="flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium" style={{ backgroundColor: c.hex, color: '#fff' }}>
                      Aa <span className={`ml-1 text-xs px-1.5 py-0.5 rounded ${whitePass ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {whitePass ? t('passAA') : t('failAA')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Saved Palettes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">{t('savedPalettes')}</h2>
          {savedPalettes.length === 0 ? (
            <p className="text-sm text-gray-500">{t('noSaved')}</p>
          ) : (
            <div className="space-y-3">
              {savedPalettes.map(sp => (
                <div key={sp.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex gap-1 flex-1">
                    {sp.colors.map((c, ci) => (
                      <div
                        key={ci}
                        className="w-8 h-8 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                        title={c.toUpperCase()}
                        onClick={() => copy(c.toUpperCase())}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => loadPalette(sp.colors)}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    {t('load')}
                  </button>
                  <button
                    onClick={() => deleteSavedPalette(sp.id)}
                    className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    {t('delete')}
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
