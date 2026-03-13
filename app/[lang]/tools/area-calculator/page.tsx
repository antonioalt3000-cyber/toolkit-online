'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

/* ── Types ── */
type Shape = 'circle' | 'rectangle' | 'triangle' | 'trapezoid' | 'ellipse' | 'parallelogram';
type Unit = 'm²' | 'cm²' | 'ft²' | 'in²' | 'km²' | 'mi²';
interface HistoryEntry { shape: string; formula: string; result: string }

/* ── Labels (6 languages) ── */
const labels: Record<string, Record<string, string>> = {
  title: { en: 'Area Calculator', it: 'Calcolatore di Area', es: 'Calculadora de Área', fr: 'Calculateur de Surface', de: 'Flächenrechner', pt: 'Calculadora de Área' },
  shape: { en: 'Shape', it: 'Forma', es: 'Forma', fr: 'Forme', de: 'Form', pt: 'Forma' },
  circle: { en: 'Circle', it: 'Cerchio', es: 'Círculo', fr: 'Cercle', de: 'Kreis', pt: 'Círculo' },
  rectangle: { en: 'Rectangle', it: 'Rettangolo', es: 'Rectángulo', fr: 'Rectangle', de: 'Rechteck', pt: 'Retângulo' },
  triangle: { en: 'Triangle', it: 'Triangolo', es: 'Triángulo', fr: 'Triangle', de: 'Dreieck', pt: 'Triângulo' },
  trapezoid: { en: 'Trapezoid', it: 'Trapezio', es: 'Trapecio', fr: 'Trapèze', de: 'Trapez', pt: 'Trapézio' },
  ellipse: { en: 'Ellipse', it: 'Ellisse', es: 'Elipse', fr: 'Ellipse', de: 'Ellipse', pt: 'Elipse' },
  parallelogram: { en: 'Parallelogram', it: 'Parallelogramma', es: 'Paralelogramo', fr: 'Parallélogramme', de: 'Parallelogramm', pt: 'Paralelogramo' },
  radius: { en: 'Radius (r)', it: 'Raggio (r)', es: 'Radio (r)', fr: 'Rayon (r)', de: 'Radius (r)', pt: 'Raio (r)' },
  length: { en: 'Length (l)', it: 'Lunghezza (l)', es: 'Largo (l)', fr: 'Longueur (l)', de: 'Länge (l)', pt: 'Comprimento (l)' },
  width: { en: 'Width (w)', it: 'Larghezza (w)', es: 'Ancho (w)', fr: 'Largeur (w)', de: 'Breite (w)', pt: 'Largura (w)' },
  base: { en: 'Base (b)', it: 'Base (b)', es: 'Base (b)', fr: 'Base (b)', de: 'Basis (b)', pt: 'Base (b)' },
  height: { en: 'Height (h)', it: 'Altezza (h)', es: 'Altura (h)', fr: 'Hauteur (h)', de: 'Höhe (h)', pt: 'Altura (h)' },
  sideA: { en: 'Side a (top)', it: 'Lato a (sopra)', es: 'Lado a (arriba)', fr: 'Côté a (haut)', de: 'Seite a (oben)', pt: 'Lado a (topo)' },
  sideB: { en: 'Side b (bottom)', it: 'Lato b (sotto)', es: 'Lado b (abajo)', fr: 'Côté b (bas)', de: 'Seite b (unten)', pt: 'Lado b (base)' },
  semiA: { en: 'Semi-axis a', it: 'Semiasse a', es: 'Semieje a', fr: 'Demi-axe a', de: 'Halbachse a', pt: 'Semi-eixo a' },
  semiB: { en: 'Semi-axis b', it: 'Semiasse b', es: 'Semieje b', fr: 'Demi-axe b', de: 'Halbachse b', pt: 'Semi-eixo b' },
  unit: { en: 'Unit', it: 'Unità', es: 'Unidad', fr: 'Unité', de: 'Einheit', pt: 'Unidade' },
  result: { en: 'Result', it: 'Risultato', es: 'Resultado', fr: 'Résultat', de: 'Ergebnis', pt: 'Resultado' },
  formula: { en: 'Formula', it: 'Formula', es: 'Fórmula', fr: 'Formule', de: 'Formel', pt: 'Fórmula' },
  area: { en: 'Area', it: 'Area', es: 'Área', fr: 'Aire', de: 'Fläche', pt: 'Área' },
  reset: { en: 'Reset', it: 'Reset', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Reiniciar' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  history: { en: 'Recent Calculations', it: 'Calcoli Recenti', es: 'Cálculos Recientes', fr: 'Calculs Récents', de: 'Letzte Berechnungen', pt: 'Cálculos Recentes' },
  formulaUsed: { en: 'Formula used', it: 'Formula usata', es: 'Fórmula usada', fr: 'Formule utilisée', de: 'Verwendete Formel', pt: 'Fórmula usada' },
  clearHistory: { en: 'Clear', it: 'Cancella', es: 'Borrar', fr: 'Effacer', de: 'Löschen', pt: 'Limpar' },
  dimensions: { en: 'Dimensions', it: 'Dimensioni', es: 'Dimensiones', fr: 'Dimensions', de: 'Abmessungen', pt: 'Dimensões' },
};

/* ── SEO Content ── */
const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
  en: {
    title: 'Area Calculator: Compute Areas for Any Shape Instantly',
    paragraphs: [
      'Calculating the area of geometric shapes is a fundamental skill used across engineering, architecture, construction, interior design, landscaping, and everyday tasks such as painting a room or buying flooring material. While the formulas are straightforward, applying them correctly with the right units can be tricky, especially under time pressure. Our free online area calculator eliminates guesswork by handling six of the most common shapes: circle, rectangle, triangle, trapezoid, ellipse, and parallelogram.',
      'Each shape has its own well-known formula. A circle uses A = pi times r squared, a rectangle uses A = length times width, and a triangle uses A = one-half times base times height. For trapezoids the formula is A = one-half times the sum of the two parallel sides times the height, an ellipse uses A = pi times semi-axis a times semi-axis b, and a parallelogram is simply A = base times height. Our tool displays the formula alongside the result so you always know which equation was applied.',
      'One of the most useful features is the built-in unit selector. You can work in square meters, square centimeters, square feet, square inches, square kilometers, or square miles. This makes the calculator equally useful whether you are measuring a garden plot in Europe or a warehouse floor in the United States. The SVG shape preview updates in real time, providing a visual confirmation that your inputs are correct.',
      'Beyond one-off calculations, the history panel stores your last five results so you can compare areas quickly without re-entering data. Combined with the one-click copy button, the tool fits naturally into professional workflows where you need to paste results into reports, spreadsheets, or messaging apps. Try it now and see how much faster area calculations can be.',
    ],
    faq: [
      { q: 'How do I calculate the area of a circle?', a: 'Use the formula A = pi times r squared. Enter the radius in the calculator, select your preferred unit, and the area is computed instantly. For example, a circle with radius 5 m has an area of approximately 78.54 m squared.' },
      { q: 'What units can I use for area calculations?', a: 'The calculator supports square meters (m squared), square centimeters (cm squared), square feet (ft squared), square inches (in squared), square kilometers (km squared), and square miles (mi squared). Select the unit from the dropdown before or after entering values.' },
      { q: 'Can I calculate the area of a trapezoid?', a: 'Yes. Enter the lengths of the two parallel sides (a and b) and the height. The calculator applies the formula A = one-half times (a + b) times h and displays the result with the formula used.' },
      { q: 'How accurate are the results?', a: 'Results are computed using JavaScript double-precision floating point arithmetic and displayed to four decimal places, which is more than sufficient for most practical applications.' },
      { q: 'Is the calculation history saved permanently?', a: 'No. The history is stored only in your browser session. It holds the last five calculations and is cleared when you close the page or click the Clear button.' },
    ],
  },
  it: {
    title: 'Calcolatore di Area: Calcola l\'Area di Qualsiasi Forma Istantaneamente',
    paragraphs: [
      'Calcolare l\'area delle forme geometriche e una competenza fondamentale utilizzata in ingegneria, architettura, edilizia, design d\'interni, paesaggistica e attivita quotidiane come pitturare una stanza o acquistare materiale per pavimenti. Sebbene le formule siano semplici, applicarle correttamente con le unita giuste puo essere complicato. Il nostro calcolatore di area online gratuito gestisce sei delle forme piu comuni: cerchio, rettangolo, triangolo, trapezio, ellisse e parallelogramma.',
      'Ogni forma ha la propria formula ben nota. Il cerchio usa A = pi greco per r al quadrato, il rettangolo usa A = lunghezza per larghezza e il triangolo usa A = un mezzo per base per altezza. Per i trapezi la formula e A = un mezzo per la somma dei due lati paralleli per l\'altezza, l\'ellisse usa A = pi greco per semiasse a per semiasse b, e il parallelogramma e semplicemente A = base per altezza. Il nostro strumento mostra la formula accanto al risultato.',
      'Una delle funzionalita piu utili e il selettore di unita integrato. Puoi lavorare in metri quadrati, centimetri quadrati, piedi quadrati, pollici quadrati, chilometri quadrati o miglia quadrate. Questo rende il calcolatore ugualmente utile sia che tu stia misurando un giardino in Europa o un magazzino negli Stati Uniti. L\'anteprima della forma SVG si aggiorna in tempo reale.',
      'Oltre ai calcoli singoli, il pannello cronologia memorizza gli ultimi cinque risultati cosi puoi confrontare le aree rapidamente senza reinserire i dati. Combinato con il pulsante di copia con un clic, lo strumento si integra naturalmente nei flussi di lavoro professionali dove devi incollare risultati in report o fogli di calcolo.',
    ],
    faq: [
      { q: 'Come calcolo l\'area di un cerchio?', a: 'Usa la formula A = pi greco per r al quadrato. Inserisci il raggio nel calcolatore, seleziona l\'unita preferita e l\'area viene calcolata istantaneamente. Ad esempio, un cerchio con raggio 5 m ha un\'area di circa 78,54 m quadrati.' },
      { q: 'Quali unita posso usare per i calcoli dell\'area?', a: 'Il calcolatore supporta metri quadrati, centimetri quadrati, piedi quadrati, pollici quadrati, chilometri quadrati e miglia quadrate. Seleziona l\'unita dal menu a tendina.' },
      { q: 'Posso calcolare l\'area di un trapezio?', a: 'Si. Inserisci le lunghezze dei due lati paralleli (a e b) e l\'altezza. Il calcolatore applica la formula A = un mezzo per (a + b) per h e mostra il risultato con la formula usata.' },
      { q: 'Quanto sono accurati i risultati?', a: 'I risultati sono calcolati utilizzando l\'aritmetica a virgola mobile a doppia precisione di JavaScript e visualizzati con quattro cifre decimali, piu che sufficienti per la maggior parte delle applicazioni pratiche.' },
      { q: 'La cronologia dei calcoli viene salvata permanentemente?', a: 'No. La cronologia e memorizzata solo nella sessione del browser. Contiene gli ultimi cinque calcoli e viene cancellata quando chiudi la pagina o fai clic sul pulsante Cancella.' },
    ],
  },
  es: {
    title: 'Calculadora de Área: Calcula el Área de Cualquier Forma al Instante',
    paragraphs: [
      'Calcular el area de formas geometricas es una habilidad fundamental utilizada en ingenieria, arquitectura, construccion, diseno de interiores, paisajismo y tareas cotidianas como pintar una habitacion o comprar material para pisos. Aunque las formulas son sencillas, aplicarlas correctamente con las unidades adecuadas puede ser complicado. Nuestra calculadora de area en linea gratuita maneja seis de las formas mas comunes: circulo, rectangulo, triangulo, trapecio, elipse y paralelogramo.',
      'Cada forma tiene su propia formula conocida. El circulo usa A = pi por r al cuadrado, el rectangulo usa A = largo por ancho y el triangulo usa A = un medio por base por altura. Para los trapecios la formula es A = un medio por la suma de los dos lados paralelos por la altura, la elipse usa A = pi por semieje a por semieje b, y el paralelogramo es simplemente A = base por altura.',
      'Una de las caracteristicas mas utiles es el selector de unidades integrado. Puedes trabajar en metros cuadrados, centimetros cuadrados, pies cuadrados, pulgadas cuadradas, kilometros cuadrados o millas cuadradas. Esto hace que la calculadora sea igualmente util ya sea que estes midiendo un jardin en Europa o un almacen en Estados Unidos.',
      'Ademas de calculos individuales, el panel de historial almacena tus ultimos cinco resultados para que puedas comparar areas rapidamente sin volver a introducir datos. Combinado con el boton de copia con un clic, la herramienta se integra naturalmente en flujos de trabajo profesionales.',
    ],
    faq: [
      { q: 'Como calculo el area de un circulo?', a: 'Usa la formula A = pi por r al cuadrado. Ingresa el radio en la calculadora, selecciona tu unidad preferida y el area se calcula al instante. Por ejemplo, un circulo con radio 5 m tiene un area de aproximadamente 78,54 m cuadrados.' },
      { q: 'Que unidades puedo usar para calculos de area?', a: 'La calculadora soporta metros cuadrados, centimetros cuadrados, pies cuadrados, pulgadas cuadradas, kilometros cuadrados y millas cuadradas.' },
      { q: 'Puedo calcular el area de un trapecio?', a: 'Si. Ingresa las longitudes de los dos lados paralelos (a y b) y la altura. La calculadora aplica la formula A = un medio por (a + b) por h y muestra el resultado.' },
      { q: 'Que tan precisos son los resultados?', a: 'Los resultados se calculan usando aritmetica de punto flotante de doble precision de JavaScript y se muestran con cuatro decimales, mas que suficiente para la mayoria de aplicaciones practicas.' },
      { q: 'El historial de calculos se guarda permanentemente?', a: 'No. El historial se almacena solo en la sesion del navegador. Contiene los ultimos cinco calculos y se borra al cerrar la pagina o hacer clic en Borrar.' },
    ],
  },
  fr: {
    title: 'Calculateur de Surface: Calculez l\'Aire de N\'importe Quelle Forme Instantanement',
    paragraphs: [
      'Calculer l\'aire des formes geometriques est une competence fondamentale utilisee en ingenierie, architecture, construction, design d\'interieur, amenagement paysager et taches quotidiennes comme peindre une piece ou acheter du revetement de sol. Bien que les formules soient simples, les appliquer correctement avec les bonnes unites peut etre delicat. Notre calculateur de surface en ligne gratuit gere six des formes les plus courantes : cercle, rectangle, triangle, trapeze, ellipse et parallelogramme.',
      'Chaque forme a sa propre formule bien connue. Le cercle utilise A = pi fois r au carre, le rectangle utilise A = longueur fois largeur et le triangle utilise A = un demi fois base fois hauteur. Pour les trapezes la formule est A = un demi fois la somme des deux cotes paralleles fois la hauteur, l\'ellipse utilise A = pi fois demi-axe a fois demi-axe b, et le parallelogramme est simplement A = base fois hauteur.',
      'L\'une des fonctionnalites les plus utiles est le selecteur d\'unites integre. Vous pouvez travailler en metres carres, centimetres carres, pieds carres, pouces carres, kilometres carres ou miles carres. Cela rend le calculateur aussi utile que vous mesuriez un jardin en Europe ou un entrepot aux Etats-Unis. L\'apercu SVG de la forme se met a jour en temps reel.',
      'Au-dela des calculs ponctuels, le panneau d\'historique stocke vos cinq derniers resultats pour que vous puissiez comparer les surfaces rapidement. Combine avec le bouton de copie en un clic, l\'outil s\'integre naturellement dans les flux de travail professionnels.',
    ],
    faq: [
      { q: 'Comment calculer l\'aire d\'un cercle ?', a: 'Utilisez la formule A = pi fois r au carre. Entrez le rayon dans le calculateur, selectionnez votre unite preferee et l\'aire est calculee instantanement. Par exemple, un cercle de rayon 5 m a une aire d\'environ 78,54 m carres.' },
      { q: 'Quelles unites puis-je utiliser ?', a: 'Le calculateur prend en charge les metres carres, centimetres carres, pieds carres, pouces carres, kilometres carres et miles carres.' },
      { q: 'Puis-je calculer l\'aire d\'un trapeze ?', a: 'Oui. Entrez les longueurs des deux cotes paralleles (a et b) et la hauteur. Le calculateur applique la formule A = un demi fois (a + b) fois h et affiche le resultat.' },
      { q: 'Quelle est la precision des resultats ?', a: 'Les resultats sont calcules en arithmetique a virgule flottante double precision JavaScript et affiches avec quatre decimales, ce qui est plus que suffisant pour la plupart des applications pratiques.' },
      { q: 'L\'historique des calculs est-il sauvegarde definitivement ?', a: 'Non. L\'historique est stocke uniquement dans la session du navigateur. Il contient les cinq derniers calculs et est efface lorsque vous fermez la page ou cliquez sur Effacer.' },
    ],
  },
  de: {
    title: 'Flächenrechner: Berechnen Sie die Fläche Jeder Form Sofort',
    paragraphs: [
      'Die Berechnung der Flaeche geometrischer Formen ist eine grundlegende Faehigkeit, die in Ingenieurwesen, Architektur, Bauwesen, Innenarchitektur, Landschaftsgestaltung und alltaeglichen Aufgaben wie dem Streichen eines Zimmers oder dem Kauf von Bodenbelag verwendet wird. Obwohl die Formeln einfach sind, kann ihre korrekte Anwendung mit den richtigen Einheiten schwierig sein. Unser kostenloser Online-Flaechenrechner verarbeitet sechs der gaengigsten Formen: Kreis, Rechteck, Dreieck, Trapez, Ellipse und Parallelogramm.',
      'Jede Form hat ihre eigene bekannte Formel. Der Kreis verwendet A = Pi mal r zum Quadrat, das Rechteck verwendet A = Laenge mal Breite und das Dreieck verwendet A = ein halb mal Basis mal Hoehe. Fuer Trapeze lautet die Formel A = ein halb mal die Summe der beiden parallelen Seiten mal die Hoehe, die Ellipse verwendet A = Pi mal Halbachse a mal Halbachse b, und das Parallelogramm ist einfach A = Basis mal Hoehe.',
      'Eine der nuetzlichsten Funktionen ist der integrierte Einheitenwaehler. Sie koennen in Quadratmetern, Quadratzentimetern, Quadratfuss, Quadratzoll, Quadratkilometern oder Quadratmeilen arbeiten. Dies macht den Rechner gleichermassen nuetzlich, egal ob Sie einen Garten in Europa oder eine Lagerflaeche in den USA vermessen.',
      'Ueber Einzelberechnungen hinaus speichert das Verlaufspanel Ihre letzten fuenf Ergebnisse, damit Sie Flaechen schnell vergleichen koennen. In Kombination mit der Ein-Klick-Kopierschaltflaeche fuegt sich das Tool natuerlich in professionelle Arbeitsablaeufe ein.',
    ],
    faq: [
      { q: 'Wie berechne ich die Flaeche eines Kreises?', a: 'Verwenden Sie die Formel A = Pi mal r zum Quadrat. Geben Sie den Radius in den Rechner ein, waehlen Sie Ihre bevorzugte Einheit und die Flaeche wird sofort berechnet. Beispiel: Ein Kreis mit Radius 5 m hat eine Flaeche von etwa 78,54 m Quadrat.' },
      { q: 'Welche Einheiten kann ich verwenden?', a: 'Der Rechner unterstuetzt Quadratmeter, Quadratzentimeter, Quadratfuss, Quadratzoll, Quadratkilometer und Quadratmeilen.' },
      { q: 'Kann ich die Flaeche eines Trapezes berechnen?', a: 'Ja. Geben Sie die Laengen der beiden parallelen Seiten (a und b) und die Hoehe ein. Der Rechner wendet die Formel A = ein halb mal (a + b) mal h an und zeigt das Ergebnis.' },
      { q: 'Wie genau sind die Ergebnisse?', a: 'Die Ergebnisse werden mit JavaScript-Gleitkomma-Arithmetik mit doppelter Genauigkeit berechnet und mit vier Dezimalstellen angezeigt, was fuer die meisten praktischen Anwendungen mehr als ausreichend ist.' },
      { q: 'Wird der Berechnungsverlauf dauerhaft gespeichert?', a: 'Nein. Der Verlauf wird nur in der Browser-Sitzung gespeichert. Er enthaelt die letzten fuenf Berechnungen und wird beim Schliessen der Seite oder Klicken auf Loeschen geloescht.' },
    ],
  },
  pt: {
    title: 'Calculadora de Área: Calcule a Área de Qualquer Forma Instantaneamente',
    paragraphs: [
      'Calcular a area de formas geometricas e uma competencia fundamental utilizada em engenharia, arquitetura, construcao, design de interiores, paisagismo e tarefas do dia a dia como pintar um quarto ou comprar material para pisos. Embora as formulas sejam simples, aplica-las corretamente com as unidades certas pode ser complicado. A nossa calculadora de area online gratuita trata de seis das formas mais comuns: circulo, retangulo, triangulo, trapezio, elipse e paralelogramo.',
      'Cada forma tem a sua propria formula conhecida. O circulo usa A = pi vezes r ao quadrado, o retangulo usa A = comprimento vezes largura e o triangulo usa A = um meio vezes base vezes altura. Para trapezios a formula e A = um meio vezes a soma dos dois lados paralelos vezes a altura, a elipse usa A = pi vezes semi-eixo a vezes semi-eixo b, e o paralelogramo e simplesmente A = base vezes altura.',
      'Uma das funcionalidades mais uteis e o seletor de unidades integrado. Pode trabalhar em metros quadrados, centimetros quadrados, pes quadrados, polegadas quadradas, quilometros quadrados ou milhas quadradas. Isto torna a calculadora igualmente util quer esteja a medir um jardim na Europa ou um armazem nos Estados Unidos.',
      'Alem de calculos individuais, o painel de historico armazena os seus ultimos cinco resultados para que possa comparar areas rapidamente sem reintroduzir dados. Combinado com o botao de copia com um clique, a ferramenta integra-se naturalmente em fluxos de trabalho profissionais.',
    ],
    faq: [
      { q: 'Como calculo a area de um circulo?', a: 'Use a formula A = pi vezes r ao quadrado. Insira o raio na calculadora, selecione a unidade preferida e a area e calculada instantaneamente. Por exemplo, um circulo com raio 5 m tem uma area de aproximadamente 78,54 m quadrados.' },
      { q: 'Que unidades posso usar?', a: 'A calculadora suporta metros quadrados, centimetros quadrados, pes quadrados, polegadas quadradas, quilometros quadrados e milhas quadradas.' },
      { q: 'Posso calcular a area de um trapezio?', a: 'Sim. Insira os comprimentos dos dois lados paralelos (a e b) e a altura. A calculadora aplica a formula A = um meio vezes (a + b) vezes h e mostra o resultado.' },
      { q: 'Qual a precisao dos resultados?', a: 'Os resultados sao calculados usando aritmetica de ponto flutuante de dupla precisao JavaScript e exibidos com quatro casas decimais, mais do que suficiente para a maioria das aplicacoes praticas.' },
      { q: 'O historico de calculos e guardado permanentemente?', a: 'Nao. O historico e armazenado apenas na sessao do navegador. Contem os ultimos cinco calculos e e apagado ao fechar a pagina ou clicar em Limpar.' },
    ],
  },
};

/* ── Shape Configs ── */
const shapeFields: Record<Shape, string[]> = {
  circle: ['radius'],
  rectangle: ['length', 'width'],
  triangle: ['base', 'height'],
  trapezoid: ['sideA', 'sideB', 'height'],
  ellipse: ['semiA', 'semiB'],
  parallelogram: ['base', 'height'],
};

const formulaStrings: Record<Shape, string> = {
  circle: 'A = \u03C0 \u00D7 r\u00B2',
  rectangle: 'A = l \u00D7 w',
  triangle: 'A = \u00BD \u00D7 b \u00D7 h',
  trapezoid: 'A = \u00BD \u00D7 (a + b) \u00D7 h',
  ellipse: 'A = \u03C0 \u00D7 a \u00D7 b',
  parallelogram: 'A = b \u00D7 h',
};

function computeArea(shape: Shape, values: Record<string, number>): number | null {
  const { radius = 0, length = 0, width = 0, base = 0, height = 0, sideA = 0, sideB = 0, semiA = 0, semiB = 0 } = values;
  switch (shape) {
    case 'circle': return radius > 0 ? Math.PI * radius * radius : null;
    case 'rectangle': return length > 0 && width > 0 ? length * width : null;
    case 'triangle': return base > 0 && height > 0 ? 0.5 * base * height : null;
    case 'trapezoid': return sideA > 0 && sideB > 0 && height > 0 ? 0.5 * (sideA + sideB) * height : null;
    case 'ellipse': return semiA > 0 && semiB > 0 ? Math.PI * semiA * semiB : null;
    case 'parallelogram': return base > 0 && height > 0 ? base * height : null;
  }
}

/* ── SVG Shape Components ── */
function ShapeSVG({ shape, values }: { shape: Shape; values: Record<string, number> }) {
  const w = 220, h = 180, cx = w / 2, cy = h / 2;
  const stroke = 'currentColor';
  const fill = 'rgba(59,130,246,0.15)';
  const textClass = 'fill-gray-600 dark:fill-gray-300 text-[11px]';

  switch (shape) {
    case 'circle': {
      const r = 60;
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
          <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={2} />
          <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={stroke} strokeWidth={1} strokeDasharray="4" />
          <text x={cx + r / 2} y={cy - 6} textAnchor="middle" className={textClass}>r={values.radius || '?'}</text>
        </svg>
      );
    }
    case 'rectangle': {
      const rw = 140, rh = 90, rx = (w - rw) / 2, ry = (h - rh) / 2;
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
          <rect x={rx} y={ry} width={rw} height={rh} fill={fill} stroke={stroke} strokeWidth={2} />
          <text x={cx} y={ry - 6} textAnchor="middle" className={textClass}>l={values.length || '?'}</text>
          <text x={rx - 4} y={cy + 4} textAnchor="end" className={textClass}>w={values.width || '?'}</text>
        </svg>
      );
    }
    case 'triangle': {
      const bx1 = 30, bx2 = 190, by = 150, tx = 110, ty = 30;
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
          <polygon points={`${bx1},${by} ${bx2},${by} ${tx},${ty}`} fill={fill} stroke={stroke} strokeWidth={2} />
          <text x={(bx1 + bx2) / 2} y={by + 16} textAnchor="middle" className={textClass}>b={values.base || '?'}</text>
          <line x1={tx} y1={ty} x2={tx} y2={by} stroke={stroke} strokeWidth={1} strokeDasharray="4" />
          <text x={tx + 14} y={(ty + by) / 2 + 4} textAnchor="start" className={textClass}>h={values.height || '?'}</text>
        </svg>
      );
    }
    case 'trapezoid': {
      const topL = 70, topR = 150, botL = 30, botR = 190, top = 40, bot = 150;
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
          <polygon points={`${topL},${top} ${topR},${top} ${botR},${bot} ${botL},${bot}`} fill={fill} stroke={stroke} strokeWidth={2} />
          <text x={(topL + topR) / 2} y={top - 6} textAnchor="middle" className={textClass}>a={values.sideA || '?'}</text>
          <text x={(botL + botR) / 2} y={bot + 16} textAnchor="middle" className={textClass}>b={values.sideB || '?'}</text>
          <line x1={cx} y1={top} x2={cx} y2={bot} stroke={stroke} strokeWidth={1} strokeDasharray="4" />
          <text x={cx + 14} y={(top + bot) / 2 + 4} textAnchor="start" className={textClass}>h={values.height || '?'}</text>
        </svg>
      );
    }
    case 'ellipse': {
      const ea = 80, eb = 50;
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
          <ellipse cx={cx} cy={cy} rx={ea} ry={eb} fill={fill} stroke={stroke} strokeWidth={2} />
          <line x1={cx} y1={cy} x2={cx + ea} y2={cy} stroke={stroke} strokeWidth={1} strokeDasharray="4" />
          <text x={cx + ea / 2} y={cy - 6} textAnchor="middle" className={textClass}>a={values.semiA || '?'}</text>
          <line x1={cx} y1={cy} x2={cx} y2={cy - eb} stroke={stroke} strokeWidth={1} strokeDasharray="4" />
          <text x={cx + 12} y={cy - eb / 2} textAnchor="start" className={textClass}>b={values.semiB || '?'}</text>
        </svg>
      );
    }
    case 'parallelogram': {
      const off = 35, pl = 30, pr = 190, top2 = 40, bot2 = 150;
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
          <polygon points={`${pl + off},${top2} ${pr + off},${top2} ${pr - off},${bot2} ${pl - off},${bot2}`} fill={fill} stroke={stroke} strokeWidth={2} />
          <text x={cx} y={bot2 + 16} textAnchor="middle" className={textClass}>b={values.base || '?'}</text>
          <line x1={pl + off} y1={top2} x2={pl + off} y2={bot2} stroke={stroke} strokeWidth={1} strokeDasharray="4" />
          <text x={pl + off + 14} y={(top2 + bot2) / 2 + 4} textAnchor="start" className={textClass}>h={values.height || '?'}</text>
        </svg>
      );
    }
  }
}

/* ── Main Component ── */
export default function AreaCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['area-calculator']?.[lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [shape, setShape] = useState<Shape>('circle');
  const [values, setValues] = useState<Record<string, string>>({});
  const [unit, setUnit] = useState<Unit>('m²');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState(false);

  const numericValues: Record<string, number> = {};
  for (const k of Object.keys(values)) {
    numericValues[k] = parseFloat(values[k]) || 0;
  }

  const area = computeArea(shape, numericValues);
  const resultText = area !== null ? `${area.toFixed(4)} ${unit}` : '';

  // Auto-save to history
  const [prevResult, setPrevResult] = useState('');
  if (resultText && resultText !== prevResult) {
    setPrevResult(resultText);
    setHistory(prev => [{ shape: t(shape), formula: formulaStrings[shape], result: resultText }, ...prev].slice(0, 5));
  }

  const handleChange = (field: string, val: string) => {
    setValues(prev => ({ ...prev, [field]: val }));
  };

  const handleShapeChange = (s: Shape) => {
    setShape(s);
    setValues({});
    setPrevResult('');
  };

  const handleReset = () => {
    setValues({});
    setPrevResult('');
  };

  const handleCopy = () => {
    if (resultText) {
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const shapes: Shape[] = ['circle', 'rectangle', 'triangle', 'trapezoid', 'ellipse', 'parallelogram'];
  const units: Unit[] = ['m²', 'cm²', 'ft²', 'in²', 'km²', 'mi²'];

  const seo = seoContent[lang] || seoContent.en;
  const faq = seo.faq;

  return (
    <ToolPageWrapper toolSlug="area-calculator" faqItems={faq}>
      <div className="mx-auto max-w-2xl">
        {/* Title */}
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {toolT?.name || t('title')}
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          {toolT?.description || ''}
        </p>

        {/* Shape Selector */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('shape')}</label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {shapes.map(s => (
              <button
                key={s}
                onClick={() => handleShapeChange(s)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  shape === s
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {t(s)}
              </button>
            ))}
          </div>
        </div>

        {/* Unit Selector */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('unit')}</label>
          <select
            value={unit}
            onChange={e => setUnit(e.target.value as Unit)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            {units.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {/* SVG Preview */}
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          <ShapeSVG shape={shape} values={numericValues} />
        </div>

        {/* Dynamic Input Fields */}
        <div className="mb-4 space-y-3">
          {shapeFields[shape].map(field => (
            <div key={field}>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t(field)}</label>
              <input
                type="number"
                min="0"
                step="any"
                value={values[field] || ''}
                onChange={e => handleChange(field, e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
              />
            </div>
          ))}
        </div>

        {/* Formula Display */}
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('formula')}</span>
          <p className="mt-1 font-mono text-lg text-gray-800 dark:text-gray-200">{formulaStrings[shape]}</p>
        </div>

        {/* Result Card */}
        {resultText && (
          <div className="mb-4 rounded-xl border-2 border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">{t('result')}</span>
                <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">{resultText}</p>
                <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">
                  {t('formulaUsed')}: {formulaStrings[shape]}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-800/50"
              >
                {copied ? t('copied') : t('copy')}
              </button>
            </div>
          </div>
        )}

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="mb-6 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {t('reset')}
        </button>

        {/* History */}
        {history.length > 0 && (
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('history')}</h3>
              <button
                onClick={() => setHistory([])}
                className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                {t('clearHistory')}
              </button>
            </div>
            <ul className="space-y-2">
              {history.map((entry, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-700/50">
                  <span className="text-gray-600 dark:text-gray-400">
                    {entry.shape} <span className="mx-1 text-gray-400">|</span> <span className="font-mono text-xs">{entry.formula}</span>
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{entry.result}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* SEO Article */}
        <article className="prose prose-gray dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>

        {/* FAQ Accordion */}
        {faq.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">FAQ</h2>
            <div className="space-y-3">
              {faq.map((item, i) => (
                <details key={i} className="group rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                    {item.q}
                  </summary>
                  <p className="px-4 pb-3 text-sm text-gray-600 dark:text-gray-400">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageWrapper>
  );
}