'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type ColorStop = { color: string; position: number; id: number };

export default function GradientGenerator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['gradient-generator'][lang];
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<ColorStop[]>([
    { color: '#667eea', position: 0, id: 1 },
    { color: '#764ba2', position: 100, id: 2 },
  ]);
  const [copied, setCopied] = useState(false);
  const [nextId, setNextId] = useState(3);

  const labels = {
    type: { en: 'Gradient type', it: 'Tipo di gradiente', es: 'Tipo de gradiente', fr: 'Type de dégradé', de: 'Verlaufstyp', pt: 'Tipo de gradiente' },
    linear: { en: 'Linear', it: 'Lineare', es: 'Lineal', fr: 'Linéaire', de: 'Linear', pt: 'Linear' },
    radial: { en: 'Radial', it: 'Radiale', es: 'Radial', fr: 'Radial', de: 'Radial', pt: 'Radial' },
    angle: { en: 'Angle', it: 'Angolo', es: 'Ángulo', fr: 'Angle', de: 'Winkel', pt: 'Ângulo' },
    colorStops: { en: 'Color Stops', it: 'Fermate colore', es: 'Paradas de color', fr: 'Arrêts de couleur', de: 'Farbstopps', pt: 'Paradas de cor' },
    addStop: { en: 'Add color stop', it: 'Aggiungi fermata', es: 'Agregar parada', fr: 'Ajouter un arrêt', de: 'Farbstopp hinzufügen', pt: 'Adicionar parada' },
    remove: { en: 'Remove', it: 'Rimuovi', es: 'Eliminar', fr: 'Supprimer', de: 'Entfernen', pt: 'Remover' },
    position: { en: 'Position', it: 'Posizione', es: 'Posición', fr: 'Position', de: 'Position', pt: 'Posição' },
    cssCode: { en: 'CSS Code', it: 'Codice CSS', es: 'Código CSS', fr: 'Code CSS', de: 'CSS-Code', pt: 'Código CSS' },
    copy: { en: 'Copy CSS', it: 'Copia CSS', es: 'Copiar CSS', fr: 'Copier CSS', de: 'CSS Kopieren', pt: 'Copiar CSS' },
    copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié!', de: 'Kopiert!', pt: 'Copiado!' },
    preview: { en: 'Preview', it: 'Anteprima', es: 'Vista previa', fr: 'Aperçu', de: 'Vorschau', pt: 'Pré-visualização' },
    withPrefixes: { en: 'With vendor prefixes', it: 'Con prefissi vendor', es: 'Con prefijos de proveedor', fr: 'Avec préfixes fournisseur', de: 'Mit Vendor-Präfixen', pt: 'Com prefixos de fornecedor' },
  } as Record<string, Record<Locale, string>>;

  const buildStopsStr = useCallback(() => {
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    return sorted.map(s => `${s.color} ${s.position}%`).join(', ');
  }, [stops]);

  const getGradientCSS = useCallback(() => {
    const stopsStr = buildStopsStr();
    if (gradientType === 'linear') {
      return `linear-gradient(${angle}deg, ${stopsStr})`;
    }
    return `radial-gradient(circle, ${stopsStr})`;
  }, [gradientType, angle, buildStopsStr]);

  const getFullCSS = useCallback(() => {
    const gradient = getGradientCSS();
    return `background: ${gradient};`;
  }, [getGradientCSS]);

  const getPrefixedCSS = useCallback(() => {
    const stopsStr = buildStopsStr();
    const lines: string[] = [];
    if (gradientType === 'linear') {
      lines.push(`background: -webkit-linear-gradient(${angle}deg, ${stopsStr});`);
      lines.push(`background: -moz-linear-gradient(${angle}deg, ${stopsStr});`);
      lines.push(`background: -o-linear-gradient(${angle}deg, ${stopsStr});`);
      lines.push(`background: linear-gradient(${angle}deg, ${stopsStr});`);
    } else {
      lines.push(`background: -webkit-radial-gradient(circle, ${stopsStr});`);
      lines.push(`background: -moz-radial-gradient(circle, ${stopsStr});`);
      lines.push(`background: -o-radial-gradient(circle, ${stopsStr});`);
      lines.push(`background: radial-gradient(circle, ${stopsStr});`);
    }
    return lines.join('\n');
  }, [gradientType, angle, buildStopsStr]);

  const addStop = () => {
    if (stops.length >= 8) return;
    const mid = Math.round(50 + Math.random() * 10 - 5);
    setStops(prev => [...prev, { color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'), position: mid, id: nextId }]);
    setNextId(prev => prev + 1);
  };

  const removeStop = (id: number) => {
    if (stops.length <= 2) return;
    setStops(prev => prev.filter(s => s.id !== id));
  };

  const updateStop = (id: number, field: 'color' | 'position', value: string | number) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const copyCSS = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'CSS Gradient Generator: Create Beautiful Gradients Instantly',
      paragraphs: [
        'CSS gradients allow you to display smooth transitions between two or more colors without needing image files. They reduce HTTP requests, scale perfectly on any screen resolution, and can be modified with a single line of code. Our gradient generator makes creating these effects effortless by providing a visual interface with real-time preview.',
        'The tool supports both linear and radial gradients. Linear gradients transition colors along a straight line defined by an angle, while radial gradients spread colors outward from a central point. You can add up to eight color stops, adjust their positions along the gradient axis, and fine-tune the angle for linear gradients from 0 to 360 degrees.',
        'Once you are satisfied with the preview, the tool generates clean CSS code ready to paste into your stylesheet. It also provides vendor-prefixed versions for maximum browser compatibility, including -webkit-, -moz-, and -o- prefixes that ensure the gradient renders correctly in older browsers.',
        'Designers and developers commonly use gradient backgrounds for hero sections, buttons, card overlays, and navigation bars. By combining multiple color stops at specific positions, you can create complex color blends, striped patterns, or subtle color shifts that add depth and visual interest to any web page.',
      ],
      faq: [
        { q: 'What is the difference between linear and radial gradients?', a: 'A linear gradient transitions colors along a straight line at a specified angle. A radial gradient transitions colors outward from a center point in a circular or elliptical shape. Both can have multiple color stops at different positions.' },
        { q: 'How many color stops can I add?', a: 'You can add up to 8 color stops. CSS itself has no hard limit, but for practical design purposes, 8 stops provide more than enough flexibility to create complex gradient effects.' },
        { q: 'Do I still need vendor prefixes for CSS gradients?', a: 'Modern browsers all support the standard syntax without prefixes. However, if you need to support older browsers (pre-2015), the vendor-prefixed version ensures compatibility. The tool provides both options so you can choose based on your needs.' },
        { q: 'Can I use the generated CSS in any framework?', a: 'Yes. The output is standard CSS that works in plain HTML, React, Vue, Angular, or any other framework. In React with inline styles, you would use the gradient value in the background property of a style object.' },
        { q: 'Is the gradient preview exactly what I will see on my website?', a: 'Yes. The preview uses the exact same CSS that is generated, so what you see in the preview box is precisely what will render in any modern browser on your site.' },
      ],
    },
    it: {
      title: 'Generatore di Gradienti CSS: Crea Gradienti Bellissimi Istantaneamente',
      paragraphs: [
        'I gradienti CSS permettono di visualizzare transizioni fluide tra due o più colori senza bisogno di file immagine. Riducono le richieste HTTP, si ridimensionano perfettamente su qualsiasi risoluzione e possono essere modificati con una singola riga di codice. Il nostro generatore rende la creazione di questi effetti semplicissima con un\'interfaccia visiva e anteprima in tempo reale.',
        'Lo strumento supporta sia gradienti lineari che radiali. I gradienti lineari trasformano i colori lungo una linea retta definita da un angolo, mentre quelli radiali diffondono i colori verso l\'esterno da un punto centrale. Puoi aggiungere fino a otto fermate colore, regolare le posizioni e perfezionare l\'angolo da 0 a 360 gradi.',
        'Una volta soddisfatto dell\'anteprima, lo strumento genera codice CSS pulito pronto per essere incollato nel tuo foglio di stile. Fornisce anche versioni con prefissi vendor per la massima compatibilità tra browser, inclusi i prefissi -webkit-, -moz- e -o-.',
        'Designer e sviluppatori usano comunemente sfondi gradienti per sezioni hero, pulsanti, overlay su card e barre di navigazione. Combinando più fermate colore in posizioni specifiche, puoi creare miscele complesse, pattern a strisce o sottili variazioni che aggiungono profondità a qualsiasi pagina web.',
      ],
      faq: [
        { q: 'Qual è la differenza tra gradiente lineare e radiale?', a: 'Un gradiente lineare trasforma i colori lungo una linea retta con un angolo specificato. Uno radiale li trasforma verso l\'esterno da un punto centrale in forma circolare. Entrambi possono avere più fermate colore.' },
        { q: 'Quante fermate colore posso aggiungere?', a: 'Puoi aggiungere fino a 8 fermate colore. CSS non ha un limite rigido, ma per scopi pratici di design, 8 fermate offrono sufficiente flessibilità per effetti gradienti complessi.' },
        { q: 'Servono ancora i prefissi vendor per i gradienti CSS?', a: 'I browser moderni supportano la sintassi standard senza prefissi. Tuttavia, per browser più vecchi, la versione con prefissi assicura la compatibilità. Lo strumento fornisce entrambe le opzioni.' },
        { q: 'Posso usare il CSS generato in qualsiasi framework?', a: 'Sì. L\'output è CSS standard che funziona in HTML, React, Vue, Angular o qualsiasi altro framework. In React con stili inline, useresti il valore del gradiente nella proprietà background.' },
        { q: 'L\'anteprima è esattamente ciò che vedrò sul mio sito?', a: 'Sì. L\'anteprima usa lo stesso CSS generato, quindi ciò che vedi nella casella di anteprima è esattamente ciò che verrà visualizzato in qualsiasi browser moderno.' },
      ],
    },
    es: {
      title: 'Generador de Gradientes CSS: Crea Gradientes Hermosos al Instante',
      paragraphs: [
        'Los gradientes CSS permiten mostrar transiciones suaves entre dos o más colores sin necesidad de archivos de imagen. Reducen las solicitudes HTTP, se escalan perfectamente en cualquier resolución y se pueden modificar con una sola línea de código. Nuestro generador facilita la creación de estos efectos con una interfaz visual y vista previa en tiempo real.',
        'La herramienta soporta gradientes lineales y radiales. Los lineales transicionan colores a lo largo de una línea recta definida por un ángulo, mientras los radiales expanden los colores hacia afuera desde un punto central. Puedes agregar hasta ocho paradas de color, ajustar posiciones y perfeccionar el ángulo de 0 a 360 grados.',
        'Una vez satisfecho con la vista previa, la herramienta genera código CSS limpio listo para pegar en tu hoja de estilos. También proporciona versiones con prefijos de proveedor para máxima compatibilidad, incluyendo -webkit-, -moz- y -o-.',
        'Diseñadores y desarrolladores usan comúnmente fondos con gradientes para secciones hero, botones, overlays en tarjetas y barras de navegación. Combinando múltiples paradas de color en posiciones específicas, puedes crear mezclas complejas que añaden profundidad a cualquier página web.',
      ],
      faq: [
        { q: '¿Cuál es la diferencia entre gradiente lineal y radial?', a: 'Un gradiente lineal transiciona colores a lo largo de una línea recta con un ángulo especificado. Uno radial transiciona los colores hacia afuera desde un punto central en forma circular. Ambos pueden tener múltiples paradas de color.' },
        { q: '¿Cuántas paradas de color puedo agregar?', a: 'Puedes agregar hasta 8 paradas de color. CSS no tiene un límite estricto, pero para propósitos prácticos de diseño, 8 paradas ofrecen suficiente flexibilidad para efectos complejos.' },
        { q: '¿Todavía necesito prefijos de proveedor para gradientes CSS?', a: 'Los navegadores modernos soportan la sintaxis estándar sin prefijos. Sin embargo, para navegadores más antiguos, la versión con prefijos asegura la compatibilidad. La herramienta proporciona ambas opciones.' },
        { q: '¿Puedo usar el CSS generado en cualquier framework?', a: 'Sí. El resultado es CSS estándar que funciona en HTML, React, Vue, Angular o cualquier otro framework.' },
        { q: '¿La vista previa es exactamente lo que veré en mi sitio?', a: 'Sí. La vista previa usa el mismo CSS generado, así que lo que ves es precisamente lo que se renderizará en cualquier navegador moderno.' },
      ],
    },
    fr: {
      title: 'Générateur de Dégradés CSS : Créez de Beaux Dégradés Instantanément',
      paragraphs: [
        'Les dégradés CSS permettent d\'afficher des transitions fluides entre deux couleurs ou plus sans fichiers image. Ils réduisent les requêtes HTTP, s\'adaptent parfaitement à toute résolution et peuvent être modifiés avec une seule ligne de code. Notre générateur facilite la création de ces effets avec une interface visuelle et un aperçu en temps réel.',
        'L\'outil supporte les dégradés linéaires et radiaux. Les linéaires transitionnent les couleurs le long d\'une ligne droite définie par un angle, tandis que les radiaux propagent les couleurs vers l\'extérieur depuis un point central. Vous pouvez ajouter jusqu\'à huit arrêts de couleur et ajuster l\'angle de 0 à 360 degrés.',
        'Une fois satisfait de l\'aperçu, l\'outil génère du code CSS propre prêt à coller dans votre feuille de style. Il fournit également des versions avec préfixes fournisseur pour une compatibilité maximale, incluant -webkit-, -moz- et -o-.',
        'Les designers et développeurs utilisent couramment des fonds dégradés pour les sections hero, boutons, overlays de cartes et barres de navigation. En combinant plusieurs arrêts de couleur, vous pouvez créer des mélanges complexes qui ajoutent de la profondeur à toute page web.',
      ],
      faq: [
        { q: 'Quelle est la différence entre dégradé linéaire et radial ?', a: 'Un dégradé linéaire transitionne les couleurs le long d\'une ligne droite à un angle spécifié. Un radial les transitionne vers l\'extérieur depuis un point central en forme circulaire. Les deux peuvent avoir plusieurs arrêts de couleur.' },
        { q: 'Combien d\'arrêts de couleur puis-je ajouter ?', a: 'Vous pouvez ajouter jusqu\'à 8 arrêts. CSS n\'a pas de limite stricte, mais 8 arrêts offrent suffisamment de flexibilité pour des effets complexes.' },
        { q: 'Ai-je encore besoin des préfixes fournisseur ?', a: 'Les navigateurs modernes supportent la syntaxe standard sans préfixes. Cependant, pour les navigateurs plus anciens, la version préfixée assure la compatibilité. L\'outil fournit les deux options.' },
        { q: 'Puis-je utiliser le CSS généré dans n\'importe quel framework ?', a: 'Oui. Le résultat est du CSS standard qui fonctionne en HTML, React, Vue, Angular ou tout autre framework.' },
        { q: 'L\'aperçu correspond-il exactement à ce que je verrai sur mon site ?', a: 'Oui. L\'aperçu utilise exactement le même CSS généré, donc ce que vous voyez est précisément ce qui sera rendu dans tout navigateur moderne.' },
      ],
    },
    de: {
      title: 'CSS-Verlaufsgenerator: Erstelle Schöne Verläufe Sofort',
      paragraphs: [
        'CSS-Verläufe ermöglichen die Darstellung fließender Übergänge zwischen zwei oder mehr Farben ohne Bilddateien. Sie reduzieren HTTP-Anfragen, skalieren perfekt auf jeder Bildschirmauflösung und können mit einer einzigen Codezeile geändert werden. Unser Generator macht die Erstellung dieser Effekte mühelos mit einer visuellen Oberfläche und Echtzeit-Vorschau.',
        'Das Tool unterstützt sowohl lineare als auch radiale Verläufe. Lineare Verläufe wechseln Farben entlang einer geraden Linie mit einem definierten Winkel, während radiale Verläufe Farben von einem zentralen Punkt nach außen verbreiten. Sie können bis zu acht Farbstopps hinzufügen und den Winkel von 0 bis 360 Grad anpassen.',
        'Sobald Sie mit der Vorschau zufrieden sind, generiert das Tool sauberen CSS-Code zum Einfügen in Ihr Stylesheet. Es bietet auch Versionen mit Vendor-Präfixen für maximale Browser-Kompatibilität, einschließlich -webkit-, -moz- und -o-.',
        'Designer und Entwickler verwenden häufig Verlaufshintergründe für Hero-Bereiche, Buttons, Karten-Overlays und Navigationsleisten. Durch Kombination mehrerer Farbstopps können Sie komplexe Farbmischungen erstellen, die jeder Webseite Tiefe verleihen.',
      ],
      faq: [
        { q: 'Was ist der Unterschied zwischen linearem und radialem Verlauf?', a: 'Ein linearer Verlauf wechselt Farben entlang einer geraden Linie mit einem bestimmten Winkel. Ein radialer Verlauf wechselt sie von einem Mittelpunkt kreisförmig nach außen. Beide können mehrere Farbstopps haben.' },
        { q: 'Wie viele Farbstopps kann ich hinzufügen?', a: 'Sie können bis zu 8 Farbstopps hinzufügen. CSS hat kein hartes Limit, aber 8 Stopps bieten genügend Flexibilität für komplexe Effekte.' },
        { q: 'Brauche ich noch Vendor-Präfixe für CSS-Verläufe?', a: 'Moderne Browser unterstützen die Standard-Syntax ohne Präfixe. Für ältere Browser sorgt die Version mit Präfixen für Kompatibilität. Das Tool bietet beide Optionen.' },
        { q: 'Kann ich das generierte CSS in jedem Framework verwenden?', a: 'Ja. Die Ausgabe ist Standard-CSS, das in HTML, React, Vue, Angular oder jedem anderen Framework funktioniert.' },
        { q: 'Entspricht die Vorschau genau dem, was ich auf meiner Website sehe?', a: 'Ja. Die Vorschau verwendet dasselbe generierte CSS, sodass das Angezeigte genau dem entspricht, was in jedem modernen Browser gerendert wird.' },
      ],
    },
    pt: {
      title: 'Gerador de Gradientes CSS: Crie Gradientes Lindos Instantaneamente',
      paragraphs: [
        'Gradientes CSS permitem exibir transições suaves entre duas ou mais cores sem precisar de arquivos de imagem. Eles reduzem requisições HTTP, escalam perfeitamente em qualquer resolução e podem ser modificados com uma única linha de código. Nosso gerador torna a criação desses efeitos fácil com uma interface visual e pré-visualização em tempo real.',
        'A ferramenta suporta gradientes lineares e radiais. Os lineares transicionam cores ao longo de uma linha reta definida por um ângulo, enquanto os radiais espalham cores para fora a partir de um ponto central. Você pode adicionar até oito paradas de cor e ajustar o ângulo de 0 a 360 graus.',
        'Uma vez satisfeito com a pré-visualização, a ferramenta gera código CSS limpo pronto para colar na sua folha de estilos. Também fornece versões com prefixos de fornecedor para máxima compatibilidade, incluindo -webkit-, -moz- e -o-.',
        'Designers e desenvolvedores usam frequentemente fundos com gradientes para seções hero, botões, overlays em cartões e barras de navegação. Combinando múltiplas paradas de cor, você pode criar misturas complexas que adicionam profundidade a qualquer página web.',
      ],
      faq: [
        { q: 'Qual é a diferença entre gradiente linear e radial?', a: 'Um gradiente linear transiciona cores ao longo de uma linha reta com um ângulo especificado. Um radial transiciona as cores para fora a partir de um ponto central em forma circular. Ambos podem ter múltiplas paradas de cor.' },
        { q: 'Quantas paradas de cor posso adicionar?', a: 'Você pode adicionar até 8 paradas de cor. CSS não tem um limite rígido, mas 8 paradas oferecem flexibilidade suficiente para efeitos complexos.' },
        { q: 'Ainda preciso de prefixos de fornecedor para gradientes CSS?', a: 'Navegadores modernos suportam a sintaxe padrão sem prefixos. Para navegadores mais antigos, a versão com prefixos garante a compatibilidade. A ferramenta fornece ambas as opções.' },
        { q: 'Posso usar o CSS gerado em qualquer framework?', a: 'Sim. A saída é CSS padrão que funciona em HTML, React, Vue, Angular ou qualquer outro framework.' },
        { q: 'A pré-visualização é exatamente o que verei no meu site?', a: 'Sim. A pré-visualização usa exatamente o mesmo CSS gerado, então o que você vê é precisamente o que será renderizado em qualquer navegador moderno.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="gradient-generator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{labels.preview[lang]}</label>
            <div
              className="w-full h-48 rounded-xl border border-gray-200 shadow-inner"
              style={{ background: getGradientCSS() }}
            />
          </div>

          {/* Type toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{labels.type[lang]}</label>
            <div className="flex gap-2">
              {(['linear', 'radial'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setGradientType(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    gradientType === t
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {labels[t][lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Angle slider (linear only) */}
          {gradientType === 'linear' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {labels.angle[lang]}: {angle}°
              </label>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={e => setAngle(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          )}

          {/* Color stops */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">{labels.colorStops[lang]}</label>
              {stops.length < 8 && (
                <button
                  onClick={addStop}
                  className="text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors"
                >
                  + {labels.addStop[lang]}
                </button>
              )}
            </div>
            <div className="space-y-2">
              {stops.map(stop => (
                <div key={stop.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={e => updateStop(stop.id, 'color', e.target.value)}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={stop.color}
                    onChange={e => updateStop(stop.id, 'color', e.target.value)}
                    className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm font-mono"
                  />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-0.5">{labels.position[lang]}: {stop.position}%</div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={stop.position}
                      onChange={e => updateStop(stop.id, 'position', Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>
                  {stops.length > 2 && (
                    <button
                      onClick={() => removeStop(stop.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      {labels.remove[lang]}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CSS Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{labels.cssCode[lang]}</label>
            <div className="bg-gray-900 rounded-lg p-4 relative">
              <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap break-all">{getFullCSS()}</pre>
              <button
                onClick={() => copyCSS(getFullCSS())}
                className="absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
              >
                {copied ? labels.copied[lang] : labels.copy[lang]}
              </button>
            </div>
          </div>

          {/* Prefixed CSS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{labels.withPrefixes[lang]}</label>
            <div className="bg-gray-900 rounded-lg p-4 relative">
              <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap break-all">{getPrefixedCSS()}</pre>
              <button
                onClick={() => copyCSS(getPrefixedCSS())}
                className="absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
              >
                {copied ? labels.copied[lang] : labels.copy[lang]}
              </button>
            </div>
          </div>
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
