'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

/* ── WCAG contrast helpers ── */
function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '').match(/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function linearize(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(fg: [number, number, number], bg: [number, number, number]): number {
  const l1 = relativeLuminance(...fg);
  const l2 = relativeLuminance(...bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function formatRatio(r: number): string {
  return r.toFixed(2) + ':1';
}

/* thresholds */
const WCAG = {
  aaNormal: 4.5,
  aaLarge: 3,
  aaaNormal: 7,
  aaaLarge: 4.5,
};

/* suggest accessible alternative by adjusting lightness */
function suggestAlternative(fgHex: string, bgHex: string, target: number): string | null {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  if (!fg || !bg) return null;
  const bgLum = relativeLuminance(...bg);
  // try darkening or lightening fg
  for (let step = 1; step <= 255; step++) {
    // darken
    const dark: [number, number, number] = [Math.max(0, fg[0] - step), Math.max(0, fg[1] - step), Math.max(0, fg[2] - step)];
    const darkLum = relativeLuminance(...dark);
    const darkRatio = (Math.max(darkLum, bgLum) + 0.05) / (Math.min(darkLum, bgLum) + 0.05);
    if (darkRatio >= target) return rgbToHex(...dark);
    // lighten
    const light: [number, number, number] = [Math.min(255, fg[0] + step), Math.min(255, fg[1] + step), Math.min(255, fg[2] + step)];
    const lightLum = relativeLuminance(...light);
    const lightRatio = (Math.max(lightLum, bgLum) + 0.05) / (Math.min(lightLum, bgLum) + 0.05);
    if (lightRatio >= target) return rgbToHex(...light);
  }
  return null;
}

/* ── Translations ── */
const labels: Record<string, Record<Locale, string>> = {
  foreground: { en: 'Foreground Color', it: 'Colore Primo Piano', es: 'Color de Primer Plano', fr: 'Couleur de Premier Plan', de: 'Vordergrundfarbe', pt: 'Cor do Primeiro Plano' },
  background: { en: 'Background Color', it: 'Colore Sfondo', es: 'Color de Fondo', fr: 'Couleur d\'Arrière-plan', de: 'Hintergrundfarbe', pt: 'Cor de Fundo' },
  contrastRatio: { en: 'Contrast Ratio', it: 'Rapporto di Contrasto', es: 'Relación de Contraste', fr: 'Rapport de Contraste', de: 'Kontrastverhältnis', pt: 'Taxa de Contraste' },
  preview: { en: 'Live Preview', it: 'Anteprima dal Vivo', es: 'Vista Previa en Vivo', fr: 'Aperçu en Direct', de: 'Live-Vorschau', pt: 'Pré-visualização ao Vivo' },
  sampleText: { en: 'The quick brown fox jumps over the lazy dog.', it: 'La volpe marrone veloce salta sopra il cane pigro.', es: 'El zorro marrón rápido salta sobre el perro perezoso.', fr: 'Le renard brun rapide saute par-dessus le chien paresseux.', de: 'Der schnelle braune Fuchs springt über den faulen Hund.', pt: 'A rápida raposa marrom salta sobre o cão preguiçoso.' },
  sampleLarge: { en: 'Large Text (18pt+)', it: 'Testo Grande (18pt+)', es: 'Texto Grande (18pt+)', fr: 'Grand Texte (18pt+)', de: 'Großer Text (18pt+)', pt: 'Texto Grande (18pt+)' },
  wcagResults: { en: 'WCAG 2.1 Results', it: 'Risultati WCAG 2.1', es: 'Resultados WCAG 2.1', fr: 'Résultats WCAG 2.1', de: 'WCAG 2.1 Ergebnisse', pt: 'Resultados WCAG 2.1' },
  aaNormal: { en: 'AA Normal Text', it: 'AA Testo Normale', es: 'AA Texto Normal', fr: 'AA Texte Normal', de: 'AA Normaler Text', pt: 'AA Texto Normal' },
  aaLarge: { en: 'AA Large Text', it: 'AA Testo Grande', es: 'AA Texto Grande', fr: 'AA Grand Texte', de: 'AA Großer Text', pt: 'AA Texto Grande' },
  aaaNormal: { en: 'AAA Normal Text', it: 'AAA Testo Normale', es: 'AAA Texto Normal', fr: 'AAA Texte Normal', de: 'AAA Normaler Text', pt: 'AAA Texto Normal' },
  aaaLarge: { en: 'AAA Large Text', it: 'AAA Testo Grande', es: 'AAA Texto Grande', fr: 'AAA Grand Texte', de: 'AAA Großer Text', pt: 'AAA Texto Grande' },
  pass: { en: 'Pass', it: 'Superato', es: 'Aprobado', fr: 'Réussi', de: 'Bestanden', pt: 'Aprovado' },
  fail: { en: 'Fail', it: 'Non superato', es: 'No aprobado', fr: 'Échoué', de: 'Nicht bestanden', pt: 'Reprovado' },
  swap: { en: 'Swap Colors', it: 'Scambia Colori', es: 'Intercambiar Colores', fr: 'Échanger les Couleurs', de: 'Farben Tauschen', pt: 'Trocar Cores' },
  copy: { en: 'Copy Ratio', it: 'Copia Rapporto', es: 'Copiar Relación', fr: 'Copier le Rapport', de: 'Verhältnis Kopieren', pt: 'Copiar Taxa' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  reset: { en: 'Reset', it: 'Ripristina', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  suggestion: { en: 'Suggested Accessible Foreground', it: 'Primo Piano Accessibile Suggerito', es: 'Primer Plano Accesible Sugerido', fr: 'Premier Plan Accessible Suggéré', de: 'Vorgeschlagene Barrierefreie Vordergrundfarbe', pt: 'Primeiro Plano Acessível Sugerido' },
  minRequired: { en: 'Min. required', it: 'Min. richiesto', es: 'Mín. requerido', fr: 'Min. requis', de: 'Min. erforderlich', pt: 'Mín. necessário' },
  invalidHex: { en: 'Enter a valid HEX color (e.g. #333333)', it: 'Inserisci un colore HEX valido (es. #333333)', es: 'Introduce un color HEX válido (ej. #333333)', fr: 'Entrez une couleur HEX valide (ex. #333333)', de: 'Geben Sie eine gültige HEX-Farbe ein (z.B. #333333)', pt: 'Insira uma cor HEX válida (ex. #333333)' },
};

const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'Free Color Contrast Checker – WCAG 2.1 Accessibility Compliance Tool',
    paragraphs: [
      'Color contrast is one of the most critical factors in web accessibility. The Web Content Accessibility Guidelines (WCAG) 2.1, maintained by the W3C, establish minimum contrast ratios between text and background colors to ensure content is readable by everyone, including people with low vision or color blindness. Our free Color Contrast Checker instantly calculates the contrast ratio between any two colors and tells you whether your color combination passes or fails WCAG AA and AAA standards.',
      'The WCAG 2.1 guidelines define four levels of compliance. Level AA requires a minimum contrast ratio of 4.5:1 for normal-sized text (under 18pt or 14pt bold) and 3:1 for large text (18pt and above, or 14pt bold and above). Level AAA, the highest standard, requires 7:1 for normal text and 4.5:1 for large text. Meeting AA is considered the baseline for accessibility, while AAA provides the best possible experience for users with visual impairments.',
      'The contrast ratio is calculated using relative luminance, a measure of how bright a color appears to the human eye. The formula converts sRGB color values to linear light values, then weights them according to human perception: green contributes most to perceived brightness (71.52%), followed by red (21.26%) and blue (7.22%). The resulting luminance values are used to compute the ratio, which ranges from 1:1 (no contrast, identical colors) to 21:1 (maximum contrast, black on white).',
      'Poor color contrast affects a significant portion of web users. Approximately 8% of men and 0.5% of women have some form of color vision deficiency. Additionally, older adults naturally experience reduced contrast sensitivity. Environmental factors like screen glare, low brightness settings, or outdoor usage further reduce effective contrast. Designing with sufficient contrast ratios ensures your content remains accessible in all conditions.',
      'Beyond compliance, good contrast improves the overall user experience. Text that is easy to read reduces eye strain, increases reading speed, and improves comprehension. Brands that prioritize accessible design also benefit from better SEO, as search engines increasingly factor accessibility into ranking algorithms. Our tool makes it simple to verify your color choices before implementation, saving development time and avoiding costly redesigns.',
      'If your color combination fails WCAG standards, our tool automatically suggests an accessible alternative. It adjusts the foreground color to the nearest shade that meets the AA Normal requirement (4.5:1), preserving your design intent as closely as possible. Simply click the suggested color to apply it and instantly see the improved contrast ratio. This feature is invaluable for designers and developers working to meet accessibility requirements efficiently.',
    ],
    faq: [
      { q: 'What is a good contrast ratio for web accessibility?', a: 'WCAG 2.1 Level AA requires at least 4.5:1 for normal text and 3:1 for large text (18pt+ or 14pt+ bold). Level AAA requires 7:1 for normal text and 4.5:1 for large text. A ratio of 4.5:1 or higher is considered good for most use cases.' },
      { q: 'What counts as "large text" in WCAG guidelines?', a: 'Large text is defined as text that is at least 18 points (24px) in regular weight, or at least 14 points (approximately 18.66px) in bold weight. Large text has a lower contrast requirement because its increased size makes it inherently more readable.' },
      { q: 'How is the contrast ratio calculated?', a: 'The contrast ratio uses relative luminance of both colors. Each RGB component is linearized from sRGB, then weighted (R × 0.2126 + G × 0.7152 + B × 0.0722). The ratio is (L1 + 0.05) / (L2 + 0.05) where L1 is the lighter color\'s luminance and L2 is the darker color\'s luminance.' },
      { q: 'Does this tool work for colorblind users?', a: 'This tool checks luminance-based contrast, which is the WCAG standard. While it does not simulate specific color blindness types, sufficient luminance contrast ensures readability regardless of color vision deficiency, since contrast perception depends primarily on brightness difference rather than color difference.' },
      { q: 'Can I use this for mobile app design?', a: 'Yes. WCAG 2.1 guidelines apply to all digital content, including mobile apps, web apps, and desktop software. The same contrast ratios should be followed for text on colored backgrounds in any digital interface to ensure accessibility compliance.' },
    ],
  },
  it: {
    title: 'Verificatore Contrasto Colori Gratuito – Strumento di Conformità Accessibilità WCAG 2.1',
    paragraphs: [
      'Il contrasto dei colori è uno dei fattori più critici nell\'accessibilità web. Le Linee Guida per l\'Accessibilità dei Contenuti Web (WCAG) 2.1, mantenute dal W3C, stabiliscono rapporti di contrasto minimi tra colori di testo e sfondo per garantire che i contenuti siano leggibili da tutti, comprese le persone con problemi di vista o daltonismo. Il nostro Verificatore di Contrasto Colori gratuito calcola istantaneamente il rapporto di contrasto tra due colori qualsiasi e indica se la combinazione supera o meno gli standard WCAG AA e AAA.',
      'Le linee guida WCAG 2.1 definiscono quattro livelli di conformità. Il livello AA richiede un rapporto minimo di 4.5:1 per il testo di dimensioni normali (sotto 18pt o 14pt grassetto) e 3:1 per il testo grande (18pt e oltre, o 14pt grassetto e oltre). Il livello AAA, lo standard più elevato, richiede 7:1 per il testo normale e 4.5:1 per il testo grande. Il livello AA è considerato la base per l\'accessibilità.',
      'Il rapporto di contrasto viene calcolato utilizzando la luminanza relativa, una misura di quanto luminoso appare un colore all\'occhio umano. La formula converte i valori sRGB in valori lineari, poi li pesa secondo la percezione umana: il verde contribuisce maggiormente alla luminosità percepita (71,52%), seguito dal rosso (21,26%) e dal blu (7,22%). I valori risultanti producono un rapporto che va da 1:1 (nessun contrasto) a 21:1 (contrasto massimo).',
      'Un contrasto cromatico insufficiente colpisce una porzione significativa degli utenti web. Circa l\'8% degli uomini e lo 0,5% delle donne hanno qualche forma di deficit della visione dei colori. Inoltre, gli adulti più anziani sperimentano naturalmente una ridotta sensibilità al contrasto. Fattori ambientali come il riflesso dello schermo riducono ulteriormente il contrasto effettivo.',
      'Oltre alla conformità, un buon contrasto migliora l\'esperienza utente complessiva. Il testo facile da leggere riduce l\'affaticamento degli occhi, aumenta la velocità di lettura e migliora la comprensione. I brand che danno priorità al design accessibile beneficiano anche di un migliore SEO. Il nostro strumento semplifica la verifica delle scelte cromatiche prima dell\'implementazione.',
      'Se la combinazione di colori non supera gli standard WCAG, il nostro strumento suggerisce automaticamente un\'alternativa accessibile. Regola il colore di primo piano alla tonalità più vicina che soddisfa il requisito AA Normale (4.5:1), preservando il più possibile l\'intento del design. Questa funzionalità è preziosa per designer e sviluppatori che lavorano per soddisfare i requisiti di accessibilità.',
    ],
    faq: [
      { q: 'Qual è un buon rapporto di contrasto per l\'accessibilità web?', a: 'Il WCAG 2.1 Livello AA richiede almeno 4.5:1 per il testo normale e 3:1 per il testo grande (18pt+ o 14pt+ grassetto). Il Livello AAA richiede 7:1 per il testo normale e 4.5:1 per il testo grande. Un rapporto di 4.5:1 o superiore è considerato buono per la maggior parte dei casi.' },
      { q: 'Cosa si intende per "testo grande" nelle linee guida WCAG?', a: 'Il testo grande è definito come testo di almeno 18 punti (24px) in peso normale, o almeno 14 punti (circa 18.66px) in grassetto. Il testo grande ha un requisito di contrasto inferiore perché la sua dimensione maggiore lo rende intrinsecamente più leggibile.' },
      { q: 'Come viene calcolato il rapporto di contrasto?', a: 'Il rapporto di contrasto utilizza la luminanza relativa di entrambi i colori. Ogni componente RGB viene linearizzato da sRGB, poi pesato (R × 0.2126 + G × 0.7152 + B × 0.0722). Il rapporto è (L1 + 0.05) / (L2 + 0.05) dove L1 è la luminanza del colore più chiaro.' },
      { q: 'Questo strumento funziona per utenti daltonici?', a: 'Questo strumento verifica il contrasto basato sulla luminanza, lo standard WCAG. Un contrasto di luminanza sufficiente garantisce la leggibilità indipendentemente dal deficit di visione dei colori, poiché la percezione del contrasto dipende principalmente dalla differenza di luminosità.' },
      { q: 'Posso usarlo per il design di app mobile?', a: 'Sì. Le linee guida WCAG 2.1 si applicano a tutti i contenuti digitali, incluse app mobile, web app e software desktop. Gli stessi rapporti di contrasto dovrebbero essere seguiti per il testo su sfondi colorati in qualsiasi interfaccia digitale.' },
    ],
  },
  es: {
    title: 'Verificador de Contraste de Colores Gratis – Herramienta de Conformidad WCAG 2.1',
    paragraphs: [
      'El contraste de colores es uno de los factores más críticos en la accesibilidad web. Las Pautas de Accesibilidad para el Contenido Web (WCAG) 2.1, mantenidas por el W3C, establecen relaciones de contraste mínimas entre colores de texto y fondo para garantizar que el contenido sea legible por todos, incluidas personas con baja visión o daltonismo. Nuestro Verificador de Contraste de Colores gratuito calcula instantáneamente la relación de contraste entre dos colores cualesquiera.',
      'Las pautas WCAG 2.1 definen cuatro niveles de conformidad. El nivel AA requiere una relación mínima de 4.5:1 para texto de tamaño normal (menos de 18pt o 14pt negrita) y 3:1 para texto grande (18pt o más, o 14pt negrita o más). El nivel AAA, el estándar más alto, requiere 7:1 para texto normal y 4.5:1 para texto grande.',
      'La relación de contraste se calcula usando la luminancia relativa, una medida de cuán brillante aparece un color al ojo humano. La fórmula convierte los valores sRGB a valores lineales, luego los pondera según la percepción humana: el verde contribuye más a la luminosidad percibida (71,52%), seguido del rojo (21,26%) y el azul (7,22%).',
      'Un contraste de color deficiente afecta a una porción significativa de usuarios web. Aproximadamente el 8% de los hombres y el 0,5% de las mujeres tienen alguna forma de deficiencia en la visión del color. Los adultos mayores experimentan naturalmente una sensibilidad al contraste reducida. Factores ambientales como el brillo de la pantalla reducen aún más el contraste efectivo.',
      'Más allá del cumplimiento, un buen contraste mejora la experiencia del usuario. El texto fácil de leer reduce la fatiga visual, aumenta la velocidad de lectura y mejora la comprensión. Las marcas que priorizan el diseño accesible también se benefician de un mejor SEO. Nuestra herramienta simplifica la verificación de las opciones de color antes de la implementación.',
      'Si su combinación de colores no cumple los estándares WCAG, nuestra herramienta sugiere automáticamente una alternativa accesible. Ajusta el color de primer plano al tono más cercano que cumple el requisito AA Normal (4.5:1), preservando la intención del diseño. Esta función es invaluable para diseñadores y desarrolladores que trabajan para cumplir requisitos de accesibilidad.',
    ],
    faq: [
      { q: '¿Cuál es una buena relación de contraste para accesibilidad web?', a: 'WCAG 2.1 Nivel AA requiere al menos 4.5:1 para texto normal y 3:1 para texto grande (18pt+ o 14pt+ negrita). El Nivel AAA requiere 7:1 para texto normal y 4.5:1 para texto grande. Una relación de 4.5:1 o superior se considera buena.' },
      { q: '¿Qué cuenta como "texto grande" en las pautas WCAG?', a: 'Texto grande se define como texto de al menos 18 puntos (24px) en peso normal, o al menos 14 puntos (aproximadamente 18.66px) en negrita. El texto grande tiene un requisito de contraste menor porque su tamaño mayor lo hace inherentemente más legible.' },
      { q: '¿Cómo se calcula la relación de contraste?', a: 'La relación de contraste usa la luminancia relativa de ambos colores. Cada componente RGB se linealiza desde sRGB, luego se pondera (R × 0.2126 + G × 0.7152 + B × 0.0722). La relación es (L1 + 0.05) / (L2 + 0.05) donde L1 es la luminancia del color más claro.' },
      { q: '¿Funciona esta herramienta para usuarios daltónicos?', a: 'Esta herramienta verifica el contraste basado en luminancia, el estándar WCAG. Un contraste de luminancia suficiente garantiza la legibilidad independientemente de la deficiencia de visión del color.' },
      { q: '¿Puedo usarlo para diseño de apps móviles?', a: 'Sí. Las pautas WCAG 2.1 se aplican a todo contenido digital, incluyendo apps móviles, apps web y software de escritorio. Las mismas relaciones de contraste deben seguirse para texto sobre fondos de color en cualquier interfaz digital.' },
    ],
  },
  fr: {
    title: 'Vérificateur de Contraste de Couleurs Gratuit – Outil de Conformité WCAG 2.1',
    paragraphs: [
      'Le contraste des couleurs est l\'un des facteurs les plus critiques en accessibilité web. Les Directives pour l\'Accessibilité du Contenu Web (WCAG) 2.1, maintenues par le W3C, établissent des rapports de contraste minimaux entre les couleurs de texte et d\'arrière-plan pour garantir que le contenu soit lisible par tous, y compris les personnes malvoyantes ou daltoniennes. Notre Vérificateur de Contraste de Couleurs gratuit calcule instantanément le rapport de contraste entre deux couleurs.',
      'Les directives WCAG 2.1 définissent quatre niveaux de conformité. Le niveau AA exige un rapport minimum de 4.5:1 pour le texte de taille normale (moins de 18pt ou 14pt gras) et 3:1 pour le grand texte (18pt et plus, ou 14pt gras et plus). Le niveau AAA, le standard le plus élevé, exige 7:1 pour le texte normal et 4.5:1 pour le grand texte.',
      'Le rapport de contraste est calculé en utilisant la luminance relative, une mesure de la luminosité perçue d\'une couleur par l\'œil humain. La formule convertit les valeurs sRGB en valeurs linéaires, puis les pondère selon la perception humaine : le vert contribue le plus à la luminosité perçue (71,52%), suivi du rouge (21,26%) et du bleu (7,22%).',
      'Un mauvais contraste de couleurs affecte une proportion significative des utilisateurs web. Environ 8% des hommes et 0,5% des femmes ont une forme de déficience de la vision des couleurs. Les adultes plus âgés connaissent naturellement une sensibilité au contraste réduite. Les facteurs environnementaux comme l\'éblouissement de l\'écran réduisent davantage le contraste effectif.',
      'Au-delà de la conformité, un bon contraste améliore l\'expérience utilisateur globale. Un texte facile à lire réduit la fatigue oculaire, augmente la vitesse de lecture et améliore la compréhension. Les marques qui priorisent le design accessible bénéficient aussi d\'un meilleur SEO. Notre outil simplifie la vérification de vos choix de couleurs.',
      'Si votre combinaison de couleurs ne respecte pas les standards WCAG, notre outil suggère automatiquement une alternative accessible. Il ajuste la couleur de premier plan à la nuance la plus proche qui satisfait l\'exigence AA Normal (4.5:1), en préservant au maximum l\'intention du design. Cette fonctionnalité est précieuse pour les designers et développeurs.',
    ],
    faq: [
      { q: 'Quel est un bon rapport de contraste pour l\'accessibilité web ?', a: 'WCAG 2.1 Niveau AA exige au moins 4.5:1 pour le texte normal et 3:1 pour le grand texte (18pt+ ou 14pt+ gras). Le Niveau AAA exige 7:1 pour le texte normal et 4.5:1 pour le grand texte. Un rapport de 4.5:1 ou plus est considéré bon.' },
      { q: 'Qu\'est-ce qui compte comme "grand texte" dans les directives WCAG ?', a: 'Le grand texte est défini comme un texte d\'au moins 18 points (24px) en poids normal, ou au moins 14 points (environ 18.66px) en gras. Le grand texte a une exigence de contraste plus faible car sa taille accrue le rend intrinsèquement plus lisible.' },
      { q: 'Comment le rapport de contraste est-il calculé ?', a: 'Le rapport de contraste utilise la luminance relative des deux couleurs. Chaque composante RGB est linéarisée depuis sRGB, puis pondérée (R × 0.2126 + G × 0.7152 + B × 0.0722). Le rapport est (L1 + 0.05) / (L2 + 0.05) où L1 est la luminance de la couleur la plus claire.' },
      { q: 'Cet outil fonctionne-t-il pour les utilisateurs daltoniens ?', a: 'Cet outil vérifie le contraste basé sur la luminance, le standard WCAG. Un contraste de luminance suffisant garantit la lisibilité indépendamment de la déficience de vision des couleurs.' },
      { q: 'Puis-je l\'utiliser pour le design d\'applications mobiles ?', a: 'Oui. Les directives WCAG 2.1 s\'appliquent à tout contenu numérique, y compris les applications mobiles, web et de bureau. Les mêmes rapports de contraste doivent être respectés pour le texte sur des fonds colorés dans toute interface numérique.' },
    ],
  },
  de: {
    title: 'Kostenloser Farbkontrast-Checker – WCAG 2.1 Barrierefreiheits-Tool',
    paragraphs: [
      'Farbkontrast ist einer der kritischsten Faktoren der Web-Barrierefreiheit. Die Richtlinien für barrierefreie Webinhalte (WCAG) 2.1, gepflegt vom W3C, legen Mindest-Kontrastverhältnisse zwischen Text- und Hintergrundfarben fest, um sicherzustellen, dass Inhalte von allen lesbar sind, einschließlich Menschen mit Sehschwäche oder Farbenblindheit. Unser kostenloser Farbkontrast-Checker berechnet sofort das Kontrastverhältnis zwischen zwei beliebigen Farben.',
      'Die WCAG 2.1 Richtlinien definieren vier Konformitätsstufen. Stufe AA erfordert ein Mindestverhältnis von 4.5:1 für normalgroßen Text (unter 18pt oder 14pt fett) und 3:1 für großen Text (18pt und mehr, oder 14pt fett und mehr). Stufe AAA, der höchste Standard, erfordert 7:1 für normalen Text und 4.5:1 für großen Text.',
      'Das Kontrastverhältnis wird anhand der relativen Luminanz berechnet, einem Maß dafür, wie hell eine Farbe dem menschlichen Auge erscheint. Die Formel wandelt sRGB-Farbwerte in lineare Lichtwerte um und gewichtet sie dann nach der menschlichen Wahrnehmung: Grün trägt am meisten zur wahrgenommenen Helligkeit bei (71,52%), gefolgt von Rot (21,26%) und Blau (7,22%).',
      'Schlechter Farbkontrast betrifft einen erheblichen Teil der Webnutzer. Etwa 8% der Männer und 0,5% der Frauen haben eine Form von Farbsehschwäche. Ältere Erwachsene erleben natürlich eine verminderte Kontrastempfindlichkeit. Umgebungsfaktoren wie Bildschirmblendung reduzieren den effektiven Kontrast zusätzlich.',
      'Über die Konformität hinaus verbessert guter Kontrast das gesamte Benutzererlebnis. Leicht lesbarer Text reduziert Augenbelastung, erhöht die Lesegeschwindigkeit und verbessert das Verständnis. Marken, die barrierefreies Design priorisieren, profitieren auch von besserem SEO. Unser Tool vereinfacht die Überprüfung Ihrer Farbwahl vor der Implementierung.',
      'Wenn Ihre Farbkombination die WCAG-Standards nicht erfüllt, schlägt unser Tool automatisch eine barrierefreie Alternative vor. Es passt die Vordergrundfarbe an den nächstliegenden Farbton an, der die AA-Normal-Anforderung (4.5:1) erfüllt, und bewahrt dabei Ihre Designabsicht so weit wie möglich.',
    ],
    faq: [
      { q: 'Was ist ein gutes Kontrastverhältnis für Web-Barrierefreiheit?', a: 'WCAG 2.1 Stufe AA erfordert mindestens 4.5:1 für normalen Text und 3:1 für großen Text (18pt+ oder 14pt+ fett). Stufe AAA erfordert 7:1 für normalen Text und 4.5:1 für großen Text. Ein Verhältnis von 4.5:1 oder höher gilt als gut.' },
      { q: 'Was zählt als "großer Text" in den WCAG-Richtlinien?', a: 'Großer Text ist definiert als Text von mindestens 18 Punkt (24px) in normalem Gewicht oder mindestens 14 Punkt (ca. 18.66px) in Fettschrift. Großer Text hat eine niedrigere Kontrastanforderung, da seine größere Größe ihn inhärent lesbarer macht.' },
      { q: 'Wie wird das Kontrastverhältnis berechnet?', a: 'Das Kontrastverhältnis verwendet die relative Luminanz beider Farben. Jede RGB-Komponente wird von sRGB linearisiert, dann gewichtet (R × 0.2126 + G × 0.7152 + B × 0.0722). Das Verhältnis ist (L1 + 0.05) / (L2 + 0.05), wobei L1 die Luminanz der helleren Farbe ist.' },
      { q: 'Funktioniert dieses Tool für farbenblinde Benutzer?', a: 'Dieses Tool prüft den luminanzbasierten Kontrast, den WCAG-Standard. Ausreichender Luminanzkontrast gewährleistet Lesbarkeit unabhängig von Farbsehschwäche.' },
      { q: 'Kann ich es für das Design von mobilen Apps verwenden?', a: 'Ja. Die WCAG 2.1 Richtlinien gelten für alle digitalen Inhalte, einschließlich mobiler Apps, Web-Apps und Desktop-Software. Die gleichen Kontrastverhältnisse sollten für Text auf farbigen Hintergründen in jeder digitalen Oberfläche eingehalten werden.' },
    ],
  },
  pt: {
    title: 'Verificador de Contraste de Cores Grátis – Ferramenta de Conformidade WCAG 2.1',
    paragraphs: [
      'O contraste de cores é um dos fatores mais críticos na acessibilidade web. As Diretrizes de Acessibilidade para Conteúdo Web (WCAG) 2.1, mantidas pelo W3C, estabelecem taxas de contraste mínimas entre cores de texto e fundo para garantir que o conteúdo seja legível por todos, incluindo pessoas com baixa visão ou daltonismo. Nosso Verificador de Contraste de Cores gratuito calcula instantaneamente a taxa de contraste entre quaisquer duas cores.',
      'As diretrizes WCAG 2.1 definem quatro níveis de conformidade. O nível AA requer uma taxa mínima de 4.5:1 para texto de tamanho normal (abaixo de 18pt ou 14pt negrito) e 3:1 para texto grande (18pt ou mais, ou 14pt negrito ou mais). O nível AAA, o padrão mais alto, requer 7:1 para texto normal e 4.5:1 para texto grande.',
      'A taxa de contraste é calculada usando a luminância relativa, uma medida de quão brilhante uma cor aparece ao olho humano. A fórmula converte valores sRGB em valores lineares, depois os pondera segundo a percepção humana: o verde contribui mais para a luminosidade percebida (71,52%), seguido pelo vermelho (21,26%) e azul (7,22%).',
      'Contraste de cor insuficiente afeta uma porção significativa dos usuários web. Aproximadamente 8% dos homens e 0,5% das mulheres têm alguma forma de deficiência na visão de cores. Adultos mais velhos experimentam naturalmente uma sensibilidade ao contraste reduzida. Fatores ambientais como brilho da tela reduzem ainda mais o contraste efetivo.',
      'Além da conformidade, bom contraste melhora a experiência geral do usuário. Texto fácil de ler reduz a fadiga ocular, aumenta a velocidade de leitura e melhora a compreensão. Marcas que priorizam design acessível também se beneficiam de melhor SEO. Nossa ferramenta simplifica a verificação de suas escolhas de cores antes da implementação.',
      'Se sua combinação de cores não atende aos padrões WCAG, nossa ferramenta sugere automaticamente uma alternativa acessível. Ela ajusta a cor do primeiro plano para o tom mais próximo que atende o requisito AA Normal (4.5:1), preservando ao máximo a intenção do design. Este recurso é inestimável para designers e desenvolvedores.',
    ],
    faq: [
      { q: 'Qual é uma boa taxa de contraste para acessibilidade web?', a: 'WCAG 2.1 Nível AA requer pelo menos 4.5:1 para texto normal e 3:1 para texto grande (18pt+ ou 14pt+ negrito). O Nível AAA requer 7:1 para texto normal e 4.5:1 para texto grande. Uma taxa de 4.5:1 ou superior é considerada boa.' },
      { q: 'O que conta como "texto grande" nas diretrizes WCAG?', a: 'Texto grande é definido como texto de pelo menos 18 pontos (24px) em peso normal, ou pelo menos 14 pontos (aproximadamente 18.66px) em negrito. Texto grande tem um requisito de contraste menor porque seu tamanho maior o torna inerentemente mais legível.' },
      { q: 'Como a taxa de contraste é calculada?', a: 'A taxa de contraste usa a luminância relativa de ambas as cores. Cada componente RGB é linearizado de sRGB, depois ponderado (R × 0.2126 + G × 0.7152 + B × 0.0722). A taxa é (L1 + 0.05) / (L2 + 0.05) onde L1 é a luminância da cor mais clara.' },
      { q: 'Esta ferramenta funciona para usuários daltônicos?', a: 'Esta ferramenta verifica o contraste baseado em luminância, o padrão WCAG. Contraste de luminância suficiente garante legibilidade independentemente da deficiência de visão de cores.' },
      { q: 'Posso usá-la para design de apps móveis?', a: 'Sim. As diretrizes WCAG 2.1 se aplicam a todo conteúdo digital, incluindo apps móveis, apps web e software desktop. As mesmas taxas de contraste devem ser seguidas para texto sobre fundos coloridos em qualquer interface digital.' },
    ],
  },
};

const DEFAULT_FG = '#333333';
const DEFAULT_BG = '#FFFFFF';

export default function ColorContrastChecker() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['color-contrast-checker'][lang];

  const [fgHex, setFgHex] = useState(DEFAULT_FG);
  const [bgHex, setBgHex] = useState(DEFAULT_BG);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const normalizeHex = (v: string): string => {
    let h = v.trim();
    if (!h.startsWith('#')) h = '#' + h;
    return h;
  };

  const isValidHex = (h: string): boolean => /^#[0-9a-fA-F]{6}$/.test(h);

  const fgValid = isValidHex(fgHex);
  const bgValid = isValidHex(bgHex);
  const bothValid = fgValid && bgValid;

  const fgRgb = fgValid ? hexToRgb(fgHex) : null;
  const bgRgb = bgValid ? hexToRgb(bgHex) : null;

  const ratio = bothValid && fgRgb && bgRgb ? contrastRatio(fgRgb, bgRgb) : null;

  const passes = (threshold: number) => ratio !== null && ratio >= threshold;

  const handleSwap = () => {
    setFgHex(bgHex);
    setBgHex(fgHex);
  };

  const handleReset = () => {
    setFgHex(DEFAULT_FG);
    setBgHex(DEFAULT_BG);
    setCopied(false);
  };

  const handleCopyRatio = () => {
    if (ratio !== null) {
      navigator.clipboard.writeText(formatRatio(ratio));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleFgChange = (v: string) => {
    setFgHex(normalizeHex(v));
  };

  const handleBgChange = (v: string) => {
    setBgHex(normalizeHex(v));
  };

  // suggestion for AA Normal if failing
  const suggestion = bothValid && ratio !== null && ratio < WCAG.aaNormal
    ? suggestAlternative(fgHex, bgHex, WCAG.aaNormal)
    : null;

  const seo = seoContent[lang];

  const Badge = ({ pass }: { pass: boolean }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${pass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {pass ? labels.pass[lang] : labels.fail[lang]}
    </span>
  );

  return (
    <ToolPageWrapper toolSlug="color-contrast-checker" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {/* Color inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Foreground */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.foreground[lang]}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgValid ? fgHex : '#333333'}
                  onChange={(e) => setFgHex(e.target.value.toUpperCase())}
                  className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={fgHex}
                  onChange={(e) => handleFgChange(e.target.value)}
                  placeholder="#333333"
                  maxLength={7}
                  className={`flex-1 border rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 ${fgValid ? 'border-gray-300' : 'border-red-400 bg-red-50'}`}
                />
              </div>
              {!fgValid && fgHex.length > 1 && <p className="text-xs text-red-500 mt-1">{labels.invalidHex[lang]}</p>}
            </div>

            {/* Background */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.background[lang]}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgValid ? bgHex : '#FFFFFF'}
                  onChange={(e) => setBgHex(e.target.value.toUpperCase())}
                  className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={bgHex}
                  onChange={(e) => handleBgChange(e.target.value)}
                  placeholder="#FFFFFF"
                  maxLength={7}
                  className={`flex-1 border rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 ${bgValid ? 'border-gray-300' : 'border-red-400 bg-red-50'}`}
                />
              </div>
              {!bgValid && bgHex.length > 1 && <p className="text-xs text-red-500 mt-1">{labels.invalidHex[lang]}</p>}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 flex-wrap">
            <button onClick={handleSwap} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              ⇄ {labels.swap[lang]}
            </button>
            <button onClick={handleReset} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              {labels.reset[lang]}
            </button>
            {ratio !== null && (
              <button onClick={handleCopyRatio} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                {copied ? labels.copied[lang] : labels.copy[lang]}
              </button>
            )}
          </div>

          {/* Live preview */}
          {bothValid && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{labels.preview[lang]}</label>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6" style={{ backgroundColor: bgHex }}>
                  <p className="text-base mb-3" style={{ color: fgHex }}>{labels.sampleText[lang]}</p>
                  <p className="text-2xl font-bold" style={{ color: fgHex }}>{labels.sampleLarge[lang]}</p>
                </div>
              </div>
            </div>
          )}

          {/* Contrast ratio display */}
          {ratio !== null && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-1">{labels.contrastRatio[lang]}</p>
              <p className={`text-5xl font-black ${ratio >= WCAG.aaNormal ? 'text-green-600' : ratio >= WCAG.aaLarge ? 'text-yellow-600' : 'text-red-600'}`}>
                {formatRatio(ratio)}
              </p>
            </div>
          )}

          {/* WCAG results grid */}
          {ratio !== null && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">{labels.wcagResults[lang]}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  ['aaNormal', labels.aaNormal[lang], WCAG.aaNormal],
                  ['aaLarge', labels.aaLarge[lang], WCAG.aaLarge],
                  ['aaaNormal', labels.aaaNormal[lang], WCAG.aaaNormal],
                  ['aaaLarge', labels.aaaLarge[lang], WCAG.aaaLarge],
                ] as [string, string, number][]).map(([key, label, threshold]) => {
                  const pass = passes(threshold);
                  return (
                    <div key={key} className={`rounded-lg border-l-4 px-4 py-3 ${pass ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{label}</span>
                        <Badge pass={pass} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{labels.minRequired[lang]}: {threshold}:1</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggestion */}
          {suggestion && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h4 className="text-sm font-semibold text-amber-800 mb-2">{labels.suggestion[lang]}</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg border border-gray-300" style={{ backgroundColor: suggestion }} />
                <button
                  onClick={() => setFgHex(suggestion)}
                  className="font-mono text-sm font-bold text-amber-900 hover:underline cursor-pointer"
                >
                  {suggestion}
                </button>
                <span className="text-xs text-amber-700 ml-auto">
                  {formatRatio(contrastRatio(hexToRgb(suggestion)!, bgRgb!))}
                </span>
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
