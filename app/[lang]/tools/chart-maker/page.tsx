'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type ChartType = 'bar' | 'line' | 'pie';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6'];

export default function ChartMaker() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['chart-maker'][lang];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataInput, setDataInput] = useState('January:45\nFebruary:80\nMarch:55\nApril:90\nMay:65');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [chartTitle, setChartTitle] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');

  const labels = {
    dataInput: { en: 'Data (label:value, one per line)', it: 'Dati (etichetta:valore, uno per riga)', es: 'Datos (etiqueta:valor, uno por linea)', fr: 'Donnees (etiquette:valeur, une par ligne)', de: 'Daten (Label:Wert, eins pro Zeile)', pt: 'Dados (rotulo:valor, um por linha)' },
    chartType: { en: 'Chart Type', it: 'Tipo di Grafico', es: 'Tipo de Grafico', fr: 'Type de Graphique', de: 'Diagrammtyp', pt: 'Tipo de Grafico' },
    bar: { en: 'Bar Chart', it: 'Grafico a Barre', es: 'Grafico de Barras', fr: 'Diagramme en Barres', de: 'Balkendiagramm', pt: 'Grafico de Barras' },
    line: { en: 'Line Chart', it: 'Grafico a Linee', es: 'Grafico de Lineas', fr: 'Graphique en Lignes', de: 'Liniendiagramm', pt: 'Grafico de Linhas' },
    pie: { en: 'Pie Chart', it: 'Grafico a Torta', es: 'Grafico Circular', fr: 'Diagramme Circulaire', de: 'Kreisdiagramm', pt: 'Grafico de Pizza' },
    title: { en: 'Chart Title (optional)', it: 'Titolo Grafico (opzionale)', es: 'Titulo del Grafico (opcional)', fr: 'Titre du Graphique (optionnel)', de: 'Diagrammtitel (optional)', pt: 'Titulo do Grafico (opcional)' },
    color: { en: 'Primary Color', it: 'Colore Primario', es: 'Color Primario', fr: 'Couleur Primaire', de: 'Primarfarbe', pt: 'Cor Primaria' },
    download: { en: 'Download PNG', it: 'Scarica PNG', es: 'Descargar PNG', fr: 'Telecharger PNG', de: 'PNG Herunterladen', pt: 'Baixar PNG' },
    preview: { en: 'Chart Preview', it: 'Anteprima Grafico', es: 'Vista Previa', fr: 'Apercu du Graphique', de: 'Diagrammvorschau', pt: 'Pre-visualizacao' },
    noData: { en: 'Enter data to generate chart', it: 'Inserisci dati per generare il grafico', es: 'Ingresa datos para generar el grafico', fr: 'Saisissez des donnees pour generer le graphique', de: 'Geben Sie Daten ein, um das Diagramm zu erstellen', pt: 'Insira dados para gerar o grafico' },
  } as Record<string, Record<Locale, string>>;

  const parseData = useCallback(() => {
    const lines = dataInput.trim().split('\n').filter(l => l.trim());
    const parsed: { label: string; value: number }[] = [];
    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const label = parts[0].trim();
        const value = parseFloat(parts[1].trim());
        if (label && !isNaN(value)) parsed.push({ label, value });
      }
    }
    return parsed;
  }, [dataInput]);

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = parseData();
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    if (data.length === 0) {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels.noData[lang], W / 2, H / 2);
      return;
    }

    // Title
    let titleOffset = 0;
    if (chartTitle) {
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(chartTitle, W / 2, 30);
      titleOffset = 30;
    }

    const maxVal = Math.max(...data.map(d => d.value));

    if (chartType === 'bar') {
      const padding = { top: 20 + titleOffset, right: 20, bottom: 60, left: 60 };
      const chartW = W - padding.left - padding.right;
      const chartH = H - padding.top - padding.bottom;
      const barW = chartW / data.length * 0.7;
      const gap = chartW / data.length * 0.3;

      // Y axis lines
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + chartH - (chartH / 4) * i;
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(W - padding.right, y);
        ctx.stroke();
        ctx.fillStyle = '#6B7280';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round((maxVal / 4) * i).toString(), padding.left - 8, y + 4);
      }

      // Bars
      data.forEach((d, i) => {
        const x = padding.left + (chartW / data.length) * i + gap / 2;
        const barH = (d.value / maxVal) * chartH;
        const y = padding.top + chartH - barH;

        ctx.fillStyle = COLORS[i % COLORS.length];
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
        ctx.fill();

        // Value on top
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.value.toString(), x + barW / 2, y - 6);

        // Label
        ctx.fillStyle = '#6B7280';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        const maxLabelLen = Math.floor(barW / 6);
        const lbl = d.label.length > maxLabelLen ? d.label.slice(0, maxLabelLen) + '..' : d.label;
        ctx.fillText(lbl, x + barW / 2, padding.top + chartH + 20);
      });
    } else if (chartType === 'line') {
      const padding = { top: 20 + titleOffset, right: 30, bottom: 60, left: 60 };
      const chartW = W - padding.left - padding.right;
      const chartH = H - padding.top - padding.bottom;

      // Grid
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + chartH - (chartH / 4) * i;
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(W - padding.right, y);
        ctx.stroke();
        ctx.fillStyle = '#6B7280';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round((maxVal / 4) * i).toString(), padding.left - 8, y + 4);
      }

      // Area fill
      const points = data.map((d, i) => ({
        x: padding.left + (chartW / (data.length - 1 || 1)) * i,
        y: padding.top + chartH - (d.value / maxVal) * chartH,
      }));

      ctx.beginPath();
      ctx.moveTo(points[0].x, padding.top + chartH);
      points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
      ctx.closePath();
      ctx.fillStyle = primaryColor + '20';
      ctx.fill();

      // Line
      ctx.beginPath();
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();

      // Points + labels
      points.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#374151';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(data[i].value.toString(), p.x, p.y - 12);

        ctx.fillStyle = '#6B7280';
        ctx.font = '11px sans-serif';
        ctx.fillText(data[i].label.slice(0, 10), p.x, padding.top + chartH + 20);
      });
    } else if (chartType === 'pie') {
      const total = data.reduce((s, d) => s + d.value, 0);
      const cx = W / 2;
      const cy = (H + titleOffset) / 2 + 10;
      const radius = Math.min(W, H - titleOffset) / 2 - 60;
      let startAngle = -Math.PI / 2;

      data.forEach((d, i) => {
        const sliceAngle = (d.value / total) * Math.PI * 2;
        const midAngle = startAngle + sliceAngle / 2;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = COLORS[i % COLORS.length];
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        const lx = cx + Math.cos(midAngle) * (radius + 25);
        const ly = cy + Math.sin(midAngle) * (radius + 25);
        ctx.fillStyle = '#374151';
        ctx.font = '11px sans-serif';
        ctx.textAlign = Math.cos(midAngle) > 0 ? 'left' : 'right';
        const pct = ((d.value / total) * 100).toFixed(1) + '%';
        ctx.fillText(`${d.label.slice(0, 12)} (${pct})`, lx, ly);

        startAngle += sliceAngle;
      });
    }
  }, [parseData, chartType, chartTitle, primaryColor, lang, labels.noData]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `chart-${chartType}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Create Beautiful Charts Online - Free Chart Maker Tool',
      paragraphs: [
        'Creating professional charts should not require expensive software or complex spreadsheet programs. Our free online chart maker lets you build bar charts, line charts, and pie charts directly in your browser with just a few clicks. Simply enter your data as label-value pairs and instantly see your chart rendered on screen.',
        'The tool supports three popular chart types. Bar charts are ideal for comparing discrete categories, line charts show trends over time, and pie charts display proportional data. Each chart type is rendered using the HTML5 Canvas API, ensuring crisp, high-quality output suitable for presentations, reports, and social media.',
        'Customization options include chart titles, primary color selection, and automatic color assignment for multi-data series. The tool intelligently scales axes, calculates grid lines, and positions labels to keep your charts clean and readable regardless of the data range.',
        'Once you are happy with your chart, download it as a high-resolution PNG image with a single click. All processing happens locally in your browser, so your data remains private and no uploads are required. Whether you are a student, business professional, or content creator, this chart maker gets the job done quickly.'
      ],
      faq: [
        { q: 'What chart types does this tool support?', a: 'The tool supports bar charts, line charts, and pie charts. Each type is rendered using the HTML5 Canvas API for crisp, high-quality output that can be downloaded as a PNG image.' },
        { q: 'How do I enter data for the chart?', a: 'Enter your data as label:value pairs, one per line. For example, "January:45" followed by "February:80" on the next line. The tool parses each line and creates your chart automatically.' },
        { q: 'Can I customize chart colors?', a: 'Yes. You can select a primary color using the color picker, which is used for line charts. Bar and pie charts automatically cycle through a built-in palette of 10 distinct colors for visual variety.' },
        { q: 'Is my data sent to a server?', a: 'No. All chart rendering happens entirely in your browser using the Canvas API. Your data never leaves your device and is not stored or transmitted anywhere.' },
        { q: 'What image format is the downloaded chart?', a: 'Charts are downloaded as PNG images at the canvas resolution (600x400 pixels). PNG provides lossless quality and transparent background support, making it ideal for presentations and documents.' }
      ]
    },
    it: {
      title: 'Crea Grafici Online Gratuitamente - Strumento Creazione Grafici',
      paragraphs: [
        'Creare grafici professionali non dovrebbe richiedere software costosi o programmi complessi. Il nostro creatore di grafici online gratuito ti permette di creare grafici a barre, a linee e a torta direttamente nel browser con pochi clic. Inserisci i dati come coppie etichetta-valore e visualizza istantaneamente il grafico.',
        'Lo strumento supporta tre tipi di grafici popolari. I grafici a barre sono ideali per confrontare categorie, i grafici a linee mostrano tendenze nel tempo e i grafici a torta visualizzano dati proporzionali. Ogni tipo viene renderizzato utilizzando l\'API Canvas HTML5, garantendo output nitido e di alta qualita.',
        'Le opzioni di personalizzazione includono titoli del grafico, selezione del colore primario e assegnazione automatica dei colori. Lo strumento ridimensiona intelligentemente gli assi, calcola le linee della griglia e posiziona le etichette per mantenere i grafici puliti e leggibili.',
        'Una volta soddisfatto del grafico, scaricalo come immagine PNG ad alta risoluzione con un solo clic. Tutta l\'elaborazione avviene localmente nel tuo browser, quindi i tuoi dati rimangono privati. Che tu sia uno studente, un professionista o un creatore di contenuti, questo strumento fa il lavoro velocemente.'
      ],
      faq: [
        { q: 'Quali tipi di grafici supporta questo strumento?', a: 'Lo strumento supporta grafici a barre, a linee e a torta. Ogni tipo viene renderizzato con l\'API Canvas HTML5 per un output nitido e di alta qualita scaricabile come PNG.' },
        { q: 'Come inserisco i dati per il grafico?', a: 'Inserisci i dati come coppie etichetta:valore, una per riga. Ad esempio "Gennaio:45" seguito da "Febbraio:80" nella riga successiva. Lo strumento analizza ogni riga e crea il grafico automaticamente.' },
        { q: 'Posso personalizzare i colori del grafico?', a: 'Si. Puoi selezionare un colore primario con il selettore colori, usato per i grafici a linee. I grafici a barre e a torta utilizzano automaticamente una palette di 10 colori distinti.' },
        { q: 'I miei dati vengono inviati a un server?', a: 'No. Tutto il rendering avviene interamente nel tuo browser tramite l\'API Canvas. I tuoi dati non lasciano mai il tuo dispositivo e non vengono memorizzati o trasmessi.' },
        { q: 'In che formato viene scaricato il grafico?', a: 'I grafici vengono scaricati come immagini PNG alla risoluzione del canvas (600x400 pixel). Il PNG fornisce qualita senza perdita, ideale per presentazioni e documenti.' }
      ]
    },
    es: {
      title: 'Crea Graficos Online Gratis - Herramienta de Creacion de Graficos',
      paragraphs: [
        'Crear graficos profesionales no deberia requerir software costoso ni programas complejos. Nuestro creador de graficos en linea gratuito te permite crear graficos de barras, lineas y circulares directamente en tu navegador con pocos clics. Ingresa tus datos como pares etiqueta-valor y visualiza tu grafico al instante.',
        'La herramienta soporta tres tipos de graficos populares. Los graficos de barras son ideales para comparar categorias, los de lineas muestran tendencias en el tiempo y los circulares muestran datos proporcionales. Cada tipo se renderiza usando la API Canvas de HTML5, garantizando una salida nitida y de alta calidad.',
        'Las opciones de personalizacion incluyen titulos del grafico, seleccion de color primario y asignacion automatica de colores. La herramienta escala inteligentemente los ejes, calcula lineas de cuadricula y posiciona etiquetas para mantener los graficos limpios y legibles.',
        'Una vez satisfecho con tu grafico, descargalo como imagen PNG de alta resolucion con un solo clic. Todo el procesamiento ocurre localmente en tu navegador, tus datos permanecen privados. Ya seas estudiante, profesional o creador de contenido, esta herramienta hace el trabajo rapidamente.'
      ],
      faq: [
        { q: 'Que tipos de graficos soporta esta herramienta?', a: 'La herramienta soporta graficos de barras, lineas y circulares. Cada tipo se renderiza con la API Canvas de HTML5 para una salida nitida descargable como PNG.' },
        { q: 'Como ingreso datos para el grafico?', a: 'Ingresa tus datos como pares etiqueta:valor, uno por linea. Por ejemplo "Enero:45" seguido de "Febrero:80" en la siguiente linea. La herramienta analiza cada linea y crea tu grafico automaticamente.' },
        { q: 'Puedo personalizar los colores del grafico?', a: 'Si. Puedes seleccionar un color primario con el selector de colores, usado para graficos de lineas. Los graficos de barras y circulares usan automaticamente una paleta de 10 colores distintos.' },
        { q: 'Mis datos se envian a un servidor?', a: 'No. Todo el renderizado ocurre completamente en tu navegador usando la API Canvas. Tus datos nunca salen de tu dispositivo ni se almacenan o transmiten.' },
        { q: 'En que formato se descarga el grafico?', a: 'Los graficos se descargan como imagenes PNG a la resolucion del canvas (600x400 pixeles). PNG proporciona calidad sin perdida, ideal para presentaciones y documentos.' }
      ]
    },
    fr: {
      title: 'Creez des Graphiques en Ligne Gratuitement - Outil de Creation de Graphiques',
      paragraphs: [
        'Creer des graphiques professionnels ne devrait pas necessiter de logiciels couteux. Notre createur de graphiques en ligne gratuit vous permet de creer des diagrammes en barres, en lignes et circulaires directement dans votre navigateur en quelques clics. Entrez vos donnees sous forme de paires etiquette-valeur et visualisez instantanement votre graphique.',
        'L\'outil prend en charge trois types de graphiques populaires. Les diagrammes en barres sont ideaux pour comparer des categories, les graphiques en lignes montrent les tendances et les diagrammes circulaires affichent des donnees proportionnelles. Chaque type est rendu a l\'aide de l\'API Canvas HTML5.',
        'Les options de personnalisation comprennent les titres de graphique, la selection de couleur primaire et l\'attribution automatique des couleurs. L\'outil met intelligemment a l\'echelle les axes, calcule les lignes de grille et positionne les etiquettes pour garder vos graphiques propres et lisibles.',
        'Une fois satisfait de votre graphique, telechargez-le en image PNG haute resolution en un seul clic. Tout le traitement se fait localement dans votre navigateur, vos donnees restent privees. Que vous soyez etudiant, professionnel ou createur de contenu, cet outil fait le travail rapidement.'
      ],
      faq: [
        { q: 'Quels types de graphiques cet outil prend-il en charge ?', a: 'L\'outil prend en charge les diagrammes en barres, les graphiques en lignes et les diagrammes circulaires. Chaque type est rendu avec l\'API Canvas HTML5 pour une sortie nette telechargeable en PNG.' },
        { q: 'Comment saisir les donnees pour le graphique ?', a: 'Entrez vos donnees sous forme de paires etiquette:valeur, une par ligne. Par exemple "Janvier:45" suivi de "Fevrier:80" a la ligne suivante. L\'outil analyse chaque ligne et cree votre graphique automatiquement.' },
        { q: 'Puis-je personnaliser les couleurs du graphique ?', a: 'Oui. Vous pouvez selectionner une couleur primaire avec le selecteur de couleurs, utilisee pour les graphiques en lignes. Les diagrammes en barres et circulaires utilisent automatiquement une palette de 10 couleurs distinctes.' },
        { q: 'Mes donnees sont-elles envoyees a un serveur ?', a: 'Non. Tout le rendu se fait entierement dans votre navigateur via l\'API Canvas. Vos donnees ne quittent jamais votre appareil et ne sont ni stockees ni transmises.' },
        { q: 'Quel format d\'image pour le graphique telecharge ?', a: 'Les graphiques sont telecharges en images PNG a la resolution du canvas (600x400 pixels). Le PNG offre une qualite sans perte, ideale pour les presentations et documents.' }
      ]
    },
    de: {
      title: 'Diagramme Online Erstellen - Kostenloses Diagramm-Erstellungstool',
      paragraphs: [
        'Professionelle Diagramme zu erstellen sollte keine teure Software erfordern. Unser kostenloser Online-Diagramm-Ersteller ermoglicht es Ihnen, Balken-, Linien- und Kreisdiagramme direkt im Browser mit wenigen Klicks zu erstellen. Geben Sie Ihre Daten als Label-Wert-Paare ein und sehen Sie Ihr Diagramm sofort.',
        'Das Tool unterstutzt drei beliebte Diagrammtypen. Balkendiagramme eignen sich ideal zum Vergleich von Kategorien, Liniendiagramme zeigen Trends und Kreisdiagramme stellen proportionale Daten dar. Jeder Typ wird mit der HTML5 Canvas API gerendert.',
        'Anpassungsoptionen umfassen Diagrammtitel, Primarfarbauswahl und automatische Farbzuweisung. Das Tool skaliert intelligent die Achsen, berechnet Gitterlinien und positioniert Beschriftungen, um Ihre Diagramme sauber und lesbar zu halten.',
        'Sobald Sie mit Ihrem Diagramm zufrieden sind, laden Sie es mit einem Klick als hochauflosendes PNG-Bild herunter. Die gesamte Verarbeitung erfolgt lokal in Ihrem Browser, Ihre Daten bleiben privat. Ob Student, Geschaftsprofi oder Content-Ersteller, dieses Tool erledigt die Aufgabe schnell.'
      ],
      faq: [
        { q: 'Welche Diagrammtypen unterstutzt dieses Tool?', a: 'Das Tool unterstutzt Balken-, Linien- und Kreisdiagramme. Jeder Typ wird mit der HTML5 Canvas API fur eine scharfe, hochwertige Ausgabe gerendert, die als PNG heruntergeladen werden kann.' },
        { q: 'Wie gebe ich Daten fur das Diagramm ein?', a: 'Geben Sie Ihre Daten als Label:Wert-Paare ein, eins pro Zeile. Zum Beispiel "Januar:45" gefolgt von "Februar:80" in der nachsten Zeile. Das Tool analysiert jede Zeile und erstellt Ihr Diagramm automatisch.' },
        { q: 'Kann ich die Diagrammfarben anpassen?', a: 'Ja. Sie konnen eine Primarfarbe mit dem Farbwahler auswahlen, die fur Liniendiagramme verwendet wird. Balken- und Kreisdiagramme verwenden automatisch eine Palette von 10 verschiedenen Farben.' },
        { q: 'Werden meine Daten an einen Server gesendet?', a: 'Nein. Das gesamte Rendering erfolgt vollstandig in Ihrem Browser uber die Canvas API. Ihre Daten verlassen nie Ihr Gerat und werden weder gespeichert noch ubertragen.' },
        { q: 'In welchem Format wird das Diagramm heruntergeladen?', a: 'Diagramme werden als PNG-Bilder in Canvas-Auflosung (600x400 Pixel) heruntergeladen. PNG bietet verlustfreie Qualitat, ideal fur Prasentationen und Dokumente.' }
      ]
    },
    pt: {
      title: 'Crie Graficos Online Gratis - Ferramenta de Criacao de Graficos',
      paragraphs: [
        'Criar graficos profissionais nao deveria exigir software caro ou programas complexos. Nosso criador de graficos online gratuito permite criar graficos de barras, linhas e pizza diretamente no navegador com poucos cliques. Insira seus dados como pares rotulo-valor e visualize seu grafico instantaneamente.',
        'A ferramenta suporta tres tipos de graficos populares. Graficos de barras sao ideais para comparar categorias, graficos de linhas mostram tendencias ao longo do tempo e graficos de pizza exibem dados proporcionais. Cada tipo e renderizado usando a API Canvas do HTML5.',
        'As opcoes de personalizacao incluem titulos de grafico, selecao de cor primaria e atribuicao automatica de cores. A ferramenta dimensiona inteligentemente os eixos, calcula linhas de grade e posiciona rotulos para manter seus graficos limpos e legiveis.',
        'Uma vez satisfeito com seu grafico, baixe-o como imagem PNG de alta resolucao com um unico clique. Todo o processamento acontece localmente no seu navegador, seus dados permanecem privados. Seja estudante, profissional ou criador de conteudo, esta ferramenta faz o trabalho rapidamente.'
      ],
      faq: [
        { q: 'Quais tipos de graficos esta ferramenta suporta?', a: 'A ferramenta suporta graficos de barras, linhas e pizza. Cada tipo e renderizado com a API Canvas do HTML5 para uma saida nitida que pode ser baixada como PNG.' },
        { q: 'Como insiro dados para o grafico?', a: 'Insira seus dados como pares rotulo:valor, um por linha. Por exemplo "Janeiro:45" seguido de "Fevereiro:80" na proxima linha. A ferramenta analisa cada linha e cria seu grafico automaticamente.' },
        { q: 'Posso personalizar as cores do grafico?', a: 'Sim. Voce pode selecionar uma cor primaria com o seletor de cores, usada para graficos de linhas. Graficos de barras e pizza usam automaticamente uma paleta de 10 cores distintas.' },
        { q: 'Meus dados sao enviados a um servidor?', a: 'Nao. Toda a renderizacao acontece inteiramente no seu navegador via API Canvas. Seus dados nunca saem do seu dispositivo e nao sao armazenados ou transmitidos.' },
        { q: 'Em que formato o grafico e baixado?', a: 'Os graficos sao baixados como imagens PNG na resolucao do canvas (600x400 pixels). PNG oferece qualidade sem perda, ideal para apresentacoes e documentos.' }
      ]
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="chart-maker" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Chart Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.chartType[lang]}</label>
            <div className="flex gap-2">
              {(['bar', 'line', 'pie'] as ChartType[]).map(t => (
                <button key={t} onClick={() => setChartType(t)} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${chartType === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {labels[t][lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Title + Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.title[lang]}</label>
              <input type="text" value={chartTitle} onChange={e => setChartTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="My Chart" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.color[lang]}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-9 w-12 rounded border border-gray-300 cursor-pointer" />
                <span className="text-sm text-gray-500">{primaryColor}</span>
              </div>
            </div>
          </div>

          {/* Data Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.dataInput[lang]}</label>
            <textarea value={dataInput} onChange={e => setDataInput(e.target.value)} rows={6} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500" placeholder="January:45&#10;February:80&#10;March:55" />
          </div>

          {/* Canvas Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{labels.preview[lang]}</label>
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <canvas ref={canvasRef} width={600} height={400} className="w-full h-auto" />
            </div>
          </div>

          {/* Download */}
          <button onClick={handleDownload} className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            {labels.download[lang]}
          </button>
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
