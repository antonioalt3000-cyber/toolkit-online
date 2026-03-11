'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<Locale, string>> = {
  width: { en: 'Width (px)', it: 'Larghezza (px)', es: 'Ancho (px)', fr: 'Largeur (px)', de: 'Breite (px)', pt: 'Largura (px)' },
  height: { en: 'Height (px)', it: 'Altezza (px)', es: 'Alto (px)', fr: 'Hauteur (px)', de: 'Höhe (px)', pt: 'Altura (px)' },
  commonRatios: { en: 'Common Ratios', it: 'Rapporti Comuni', es: 'Proporciones Comunes', fr: 'Ratios Courants', de: 'Gängige Verhältnisse', pt: 'Proporções Comuns' },
  customRatio: { en: 'Custom Ratio', it: 'Rapporto Personalizzato', es: 'Proporción Personalizada', fr: 'Ratio Personnalisé', de: 'Eigenes Verhältnis', pt: 'Proporção Personalizada' },
  ratioW: { en: 'Ratio W', it: 'Rapporto L', es: 'Proporción A', fr: 'Ratio L', de: 'Verhältnis B', pt: 'Proporção L' },
  ratioH: { en: 'Ratio H', it: 'Rapporto A', es: 'Proporción Al', fr: 'Ratio H', de: 'Verhältnis H', pt: 'Proporção A' },
  results: { en: 'Calculated Dimensions', it: 'Dimensioni Calcolate', es: 'Dimensiones Calculadas', fr: 'Dimensions Calculées', de: 'Berechnete Maße', pt: 'Dimensões Calculadas' },
  ratio: { en: 'Ratio', it: 'Rapporto', es: 'Proporción', fr: 'Ratio', de: 'Verhältnis', pt: 'Proporção' },
};

const commonRatios = [
  { name: '16:9', w: 16, h: 9 },
  { name: '4:3', w: 4, h: 3 },
  { name: '1:1', w: 1, h: 1 },
  { name: '21:9', w: 21, h: 9 },
  { name: '3:2', w: 3, h: 2 },
  { name: '9:16', w: 9, h: 16 },
];

export default function AspectRatioCalculator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['aspect-ratio-calculator'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [width, setWidth] = useState('1920');
  const [customW, setCustomW] = useState('16');
  const [customH, setCustomH] = useState('9');

  const w = parseInt(width) || 0;
  const cw = parseInt(customW) || 1;
  const ch = parseInt(customH) || 1;

  const allRatios = [...commonRatios, { name: `${cw}:${ch}`, w: cw, h: ch }];

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Aspect Ratio Calculator: Resize Images and Videos Without Distortion',
      paragraphs: [
        'Aspect ratio is the proportional relationship between the width and height of an image or video. It is expressed as two numbers separated by a colon, such as 16:9 or 4:3. Maintaining the correct aspect ratio is critical when resizing media — if you change width without adjusting height proportionally, the image becomes stretched or squished.',
        'Our aspect ratio calculator takes a width value and instantly computes the corresponding height for all common aspect ratios. This is invaluable for web designers setting responsive image dimensions, video editors exporting at the right resolution, or social media managers preparing content for platforms with specific dimension requirements.',
        'The most widely used aspect ratio today is 16:9, the standard for HD and 4K displays, YouTube videos, and most streaming content. The 4:3 ratio was the old television standard and is still used in some presentations. The 1:1 square format is popular on Instagram, while 9:16 vertical is essential for Stories, Reels, and TikTok.',
        'You can also enter a custom ratio for specialized needs. Photographers often work with 3:2 (the standard 35mm film ratio) or 5:4 for print formats. Ultrawide monitors use 21:9 or even 32:9. Simply enter your desired width, and the calculator shows the exact pixel height for each ratio.'
      ],
      faq: [
        { q: 'What is the most common aspect ratio for YouTube videos?', a: '16:9 is the standard aspect ratio for YouTube. At 1920px width, this gives you 1080px height (Full HD). At 3840px width, you get 2160px height (4K UHD). YouTube will add black bars (letterboxing) if your video uses a different ratio.' },
        { q: 'How do I find the aspect ratio of an existing image?', a: 'Divide both the width and height by their greatest common divisor (GCD). For example, a 1920x1080 image: GCD of 1920 and 1080 is 120, so 1920/120 : 1080/120 = 16:9.' },
        { q: 'What aspect ratio should I use for Instagram posts?', a: 'Instagram supports 1:1 (square, 1080x1080), 4:5 (portrait, 1080x1350), and 1.91:1 (landscape, 1080x566). For Stories and Reels, use 9:16 (1080x1920).' },
        { q: 'Does changing the aspect ratio affect image quality?', a: 'Changing the ratio itself does not reduce quality, but cropping or stretching to fit a new ratio can degrade the image. It is better to crop to the target ratio than to stretch, as stretching introduces visible distortion.' },
        { q: 'What is the difference between 16:9 and 16:10?', a: '16:10 is slightly taller for the same width. It was common in older laptop displays and some tablets. At 1920px width, 16:9 gives 1080px height while 16:10 gives 1200px height. Most modern content targets 16:9.' }
      ]
    },
    it: {
      title: 'Calcolatore di Rapporto d\'Aspetto: Ridimensiona Immagini e Video Senza Distorsione',
      paragraphs: [
        'Il rapporto d\'aspetto è la relazione proporzionale tra larghezza e altezza di un\'immagine o video. Si esprime come due numeri separati da due punti, come 16:9 o 4:3. Mantenere il rapporto corretto è fondamentale nel ridimensionamento dei media — cambiare la larghezza senza regolare proporzionalmente l\'altezza distorce l\'immagine.',
        'Il nostro calcolatore prende un valore di larghezza e calcola istantaneamente l\'altezza corrispondente per tutti i rapporti d\'aspetto comuni. È prezioso per web designer, video editor e social media manager che preparano contenuti con requisiti dimensionali specifici.',
        'Il rapporto più usato oggi è 16:9, lo standard per display HD e 4K, video YouTube e streaming. Il 4:3 era lo standard televisivo vecchio. Il formato quadrato 1:1 è popolare su Instagram, mentre 9:16 verticale è essenziale per Stories, Reels e TikTok.',
        'Puoi anche inserire un rapporto personalizzato. I fotografi usano spesso 3:2 (il rapporto della pellicola 35mm) o 5:4 per formati di stampa. I monitor ultrawide usano 21:9 o anche 32:9. Inserisci la larghezza desiderata e il calcolatore mostra l\'altezza esatta in pixel per ogni rapporto.'
      ],
      faq: [
        { q: 'Qual è il rapporto d\'aspetto più comune per i video YouTube?', a: '16:9 è lo standard per YouTube. A 1920px di larghezza, ottieni 1080px di altezza (Full HD). A 3840px, ottieni 2160px (4K UHD). YouTube aggiunge bande nere se il video usa un rapporto diverso.' },
        { q: 'Come trovo il rapporto d\'aspetto di un\'immagine esistente?', a: 'Dividi larghezza e altezza per il loro massimo comune divisore (MCD). Per un\'immagine 1920x1080: MCD = 120, quindi 1920/120 : 1080/120 = 16:9.' },
        { q: 'Quale rapporto d\'aspetto devo usare per i post Instagram?', a: 'Instagram supporta 1:1 (quadrato, 1080x1080), 4:5 (verticale, 1080x1350) e 1,91:1 (orizzontale, 1080x566). Per Stories e Reels, usa 9:16 (1080x1920).' },
        { q: 'Cambiare il rapporto d\'aspetto influisce sulla qualità dell\'immagine?', a: 'Cambiare il rapporto in sé non riduce la qualità, ma ritagliare o stirare per adattarsi a un nuovo rapporto può degradare l\'immagine. È meglio ritagliare che stirare.' },
        { q: 'Qual è la differenza tra 16:9 e 16:10?', a: '16:10 è leggermente più alto per la stessa larghezza. Era comune nei vecchi display laptop. A 1920px, 16:9 dà 1080px mentre 16:10 dà 1200px. La maggior parte dei contenuti moderni usa 16:9.' }
      ]
    },
    es: {
      title: 'Calculadora de Relación de Aspecto: Redimensiona Imágenes y Videos Sin Distorsión',
      paragraphs: [
        'La relación de aspecto es la relación proporcional entre el ancho y alto de una imagen o video. Se expresa como dos números separados por dos puntos, como 16:9 o 4:3. Mantener la relación correcta es fundamental al redimensionar medios — cambiar el ancho sin ajustar proporcionalmente el alto distorsiona la imagen.',
        'Nuestra calculadora toma un valor de ancho y calcula instantáneamente la altura correspondiente para todas las relaciones de aspecto comunes. Es invaluable para diseñadores web, editores de video y gestores de redes sociales que preparan contenido con requisitos dimensionales específicos.',
        'La relación más usada hoy es 16:9, estándar para pantallas HD y 4K, videos de YouTube y streaming. 4:3 era el estándar televisivo antiguo. El formato cuadrado 1:1 es popular en Instagram, mientras 9:16 vertical es esencial para Stories, Reels y TikTok.',
        'También puedes ingresar una relación personalizada. Los fotógrafos usan 3:2 (relación de película 35mm) o 5:4 para formatos de impresión. Los monitores ultrawide usan 21:9 o incluso 32:9. Ingresa el ancho deseado y la calculadora muestra la altura exacta en píxeles.'
      ],
      faq: [
        { q: '¿Cuál es la relación de aspecto más común para videos de YouTube?', a: '16:9 es el estándar para YouTube. A 1920px de ancho, obtienes 1080px de alto (Full HD). YouTube agrega barras negras si tu video usa una relación diferente.' },
        { q: '¿Cómo encuentro la relación de aspecto de una imagen existente?', a: 'Divide el ancho y alto por su máximo común divisor (MCD). Para una imagen 1920x1080: MCD = 120, entonces 1920/120 : 1080/120 = 16:9.' },
        { q: '¿Qué relación de aspecto debo usar para publicaciones de Instagram?', a: 'Instagram soporta 1:1 (cuadrado, 1080x1080), 4:5 (vertical, 1080x1350) y 1.91:1 (horizontal, 1080x566). Para Stories y Reels, usa 9:16 (1080x1920).' },
        { q: '¿Cambiar la relación de aspecto afecta la calidad de la imagen?', a: 'Cambiar la relación en sí no reduce la calidad, pero recortar o estirar para ajustarse a una nueva relación puede degradar la imagen. Es mejor recortar que estirar.' },
        { q: '¿Cuál es la diferencia entre 16:9 y 16:10?', a: '16:10 es ligeramente más alto para el mismo ancho. Era común en pantallas de laptops antiguas. A 1920px, 16:9 da 1080px mientras 16:10 da 1200px.' }
      ]
    },
    fr: {
      title: 'Calculateur de Rapport d\'Aspect : Redimensionnez Images et Vidéos Sans Distorsion',
      paragraphs: [
        'Le rapport d\'aspect est la relation proportionnelle entre la largeur et la hauteur d\'une image ou vidéo. Il s\'exprime par deux nombres séparés par deux points, comme 16:9 ou 4:3. Maintenir le bon rapport est essentiel lors du redimensionnement — modifier la largeur sans ajuster la hauteur proportionnellement déforme l\'image.',
        'Notre calculateur prend une valeur de largeur et calcule instantanément la hauteur correspondante pour tous les rapports courants. Indispensable pour les web designers, monteurs vidéo et gestionnaires de réseaux sociaux préparant du contenu avec des exigences dimensionnelles spécifiques.',
        'Le rapport le plus utilisé aujourd\'hui est 16:9, standard pour les écrans HD et 4K, vidéos YouTube et streaming. Le 4:3 était l\'ancien standard TV. Le format carré 1:1 est populaire sur Instagram, tandis que 9:16 vertical est essentiel pour les Stories, Reels et TikTok.',
        'Vous pouvez aussi entrer un rapport personnalisé. Les photographes utilisent souvent 3:2 (ratio du film 35mm) ou 5:4 pour l\'impression. Les écrans ultralarges utilisent 21:9. Entrez la largeur souhaitée et le calculateur affiche la hauteur exacte en pixels.'
      ],
      faq: [
        { q: 'Quel est le rapport d\'aspect le plus courant pour les vidéos YouTube ?', a: '16:9 est le standard YouTube. À 1920px de largeur, vous obtenez 1080px de hauteur (Full HD). YouTube ajoute des bandes noires si votre vidéo utilise un rapport différent.' },
        { q: 'Comment trouver le rapport d\'aspect d\'une image existante ?', a: 'Divisez la largeur et la hauteur par leur PGCD. Pour une image 1920x1080 : PGCD = 120, donc 1920/120 : 1080/120 = 16:9.' },
        { q: 'Quel rapport d\'aspect utiliser pour les posts Instagram ?', a: 'Instagram supporte 1:1 (carré, 1080x1080), 4:5 (portrait, 1080x1350) et 1,91:1 (paysage, 1080x566). Pour les Stories et Reels, utilisez 9:16 (1080x1920).' },
        { q: 'Changer le rapport d\'aspect affecte-t-il la qualité de l\'image ?', a: 'Changer le rapport en soi ne réduit pas la qualité, mais recadrer ou étirer pour s\'adapter à un nouveau rapport peut dégrader l\'image. Mieux vaut recadrer qu\'étirer.' },
        { q: 'Quelle est la différence entre 16:9 et 16:10 ?', a: '16:10 est légèrement plus haut pour la même largeur. C\'était courant sur les anciens laptops. À 1920px, 16:9 donne 1080px tandis que 16:10 donne 1200px.' }
      ]
    },
    de: {
      title: 'Seitenverhältnis-Rechner: Bilder und Videos Ohne Verzerrung Skalieren',
      paragraphs: [
        'Das Seitenverhältnis ist die proportionale Beziehung zwischen Breite und Höhe eines Bildes oder Videos. Es wird als zwei durch einen Doppelpunkt getrennte Zahlen ausgedrückt, wie 16:9 oder 4:3. Das korrekte Verhältnis beizubehalten ist beim Skalieren von Medien entscheidend — eine Breitenänderung ohne proportionale Höhenanpassung verzerrt das Bild.',
        'Unser Rechner nimmt einen Breitenwert und berechnet sofort die entsprechende Höhe für alle gängigen Seitenverhältnisse. Unverzichtbar für Webdesigner, Video-Editoren und Social-Media-Manager, die Inhalte mit bestimmten Dimensionsanforderungen vorbereiten.',
        'Das heute am weitesten verbreitete Verhältnis ist 16:9, Standard für HD- und 4K-Displays, YouTube-Videos und Streaming. 4:3 war der alte TV-Standard. Das quadratische 1:1-Format ist auf Instagram beliebt, während 9:16 vertikal für Stories, Reels und TikTok essentiell ist.',
        'Sie können auch ein eigenes Verhältnis eingeben. Fotografen arbeiten oft mit 3:2 (35mm-Film-Standard) oder 5:4 für Druckformate. Ultrawide-Monitore verwenden 21:9 oder sogar 32:9. Geben Sie die gewünschte Breite ein und der Rechner zeigt die exakte Pixelhöhe.'
      ],
      faq: [
        { q: 'Was ist das gängigste Seitenverhältnis für YouTube-Videos?', a: '16:9 ist der YouTube-Standard. Bei 1920px Breite ergibt das 1080px Höhe (Full HD). YouTube fügt schwarze Balken hinzu, wenn Ihr Video ein anderes Verhältnis hat.' },
        { q: 'Wie finde ich das Seitenverhältnis eines vorhandenen Bildes?', a: 'Teilen Sie Breite und Höhe durch ihren größten gemeinsamen Teiler (ggT). Für ein 1920x1080-Bild: ggT = 120, also 1920/120 : 1080/120 = 16:9.' },
        { q: 'Welches Seitenverhältnis sollte ich für Instagram-Posts verwenden?', a: 'Instagram unterstützt 1:1 (Quadrat, 1080x1080), 4:5 (Hochformat, 1080x1350) und 1,91:1 (Querformat, 1080x566). Für Stories und Reels verwenden Sie 9:16 (1080x1920).' },
        { q: 'Beeinträchtigt das Ändern des Seitenverhältnisses die Bildqualität?', a: 'Die Änderung des Verhältnisses allein mindert nicht die Qualität, aber Zuschneiden oder Strecken kann das Bild verschlechtern. Zuschneiden ist besser als Strecken.' },
        { q: 'Was ist der Unterschied zwischen 16:9 und 16:10?', a: '16:10 ist bei gleicher Breite etwas höher. Es war bei älteren Laptops üblich. Bei 1920px ergibt 16:9 1080px Höhe, während 16:10 1200px ergibt.' }
      ]
    },
    pt: {
      title: 'Calculadora de Proporção: Redimensione Imagens e Vídeos Sem Distorção',
      paragraphs: [
        'A proporção de aspecto é a relação proporcional entre a largura e a altura de uma imagem ou vídeo. É expressa como dois números separados por dois pontos, como 16:9 ou 4:3. Manter a proporção correta é fundamental ao redimensionar mídia — alterar a largura sem ajustar a altura proporcionalmente distorce a imagem.',
        'Nossa calculadora recebe um valor de largura e calcula instantaneamente a altura correspondente para todas as proporções comuns. É inestimável para web designers, editores de vídeo e gerentes de mídias sociais preparando conteúdo com requisitos dimensionais específicos.',
        'A proporção mais usada hoje é 16:9, padrão para telas HD e 4K, vídeos do YouTube e streaming. 4:3 era o padrão de TV antigo. O formato quadrado 1:1 é popular no Instagram, enquanto 9:16 vertical é essencial para Stories, Reels e TikTok.',
        'Você também pode inserir uma proporção personalizada. Fotógrafos usam 3:2 (proporção de filme 35mm) ou 5:4 para formatos de impressão. Monitores ultrawide usam 21:9 ou até 32:9. Insira a largura desejada e a calculadora mostra a altura exata em pixels.'
      ],
      faq: [
        { q: 'Qual é a proporção mais comum para vídeos do YouTube?', a: '16:9 é o padrão do YouTube. Com 1920px de largura, você obtém 1080px de altura (Full HD). O YouTube adiciona barras pretas se seu vídeo usar uma proporção diferente.' },
        { q: 'Como encontro a proporção de uma imagem existente?', a: 'Divida a largura e a altura pelo MDC (máximo divisor comum). Para uma imagem 1920x1080: MDC = 120, então 1920/120 : 1080/120 = 16:9.' },
        { q: 'Qual proporção devo usar para posts do Instagram?', a: 'O Instagram suporta 1:1 (quadrado, 1080x1080), 4:5 (retrato, 1080x1350) e 1.91:1 (paisagem, 1080x566). Para Stories e Reels, use 9:16 (1080x1920).' },
        { q: 'Alterar a proporção afeta a qualidade da imagem?', a: 'Alterar a proporção em si não reduz a qualidade, mas cortar ou esticar para se ajustar a uma nova proporção pode degradar a imagem. É melhor cortar do que esticar.' },
        { q: 'Qual é a diferença entre 16:9 e 16:10?', a: '16:10 é ligeiramente mais alto para a mesma largura. Era comum em laptops antigos. Com 1920px, 16:9 dá 1080px enquanto 16:10 dá 1200px.' }
      ]
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="aspect-ratio-calculator">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('width')}</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('customRatio')}</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={customW}
                onChange={(e) => setCustomW(e.target.value)}
                min="1"
                className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-500 font-bold">:</span>
              <input
                type="number"
                value={customH}
                onChange={(e) => setCustomH(e.target.value)}
                min="1"
                className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {w > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('results')}</label>
              <div className="space-y-2">
                {allRatios.map((ratio) => {
                  const height = Math.round(w * ratio.h / ratio.w);
                  return (
                    <div key={ratio.name} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <span className="font-semibold text-gray-900">{ratio.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-blue-600 font-semibold">{w} x {height}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
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
