'use client';

import CategoryHubPage from '@/components/CategoryHubPage';
import { getToolsByCategory } from '@/lib/translations';

const toolSlugs = getToolsByCategory().conversion;

const translations: Record<string, { title: string; metaTitle: string; description: string; article: string; toolsHeading: string; exploreOther: string }> = {
  en: {
    title: 'Free Online Converters & Conversion Tools',
    metaTitle: 'Free Online Converters & Conversion Tools | ToolKit Online',
    description: 'Unit converter, Base64 encoder, time zone converter, PDF tools, CSV to JSON and more free conversion tools.',
    toolsHeading: 'All Conversion Tools',
    exploreOther: 'Explore Other Categories',
    article: `<h2>Convert Anything, Anywhere, Instantly</h2>
<p>In our increasingly connected world, the need to convert between different formats, units, and standards arises constantly. Whether you are a developer working with data formats, a traveler dealing with time zones, a student converting units for a physics problem, or a professional preparing documents in different file formats, having reliable conversion tools at your fingertips is essential. ToolKit Online provides a comprehensive set of free converters that handle everything from units and encodings to file formats and time zones.</p>

<h3>Unit and Measurement Conversion</h3>
<p>Our unit converter handles conversions across length, weight, volume, area, speed, temperature, and many more categories. Whether you need to convert miles to kilometers, pounds to kilograms, or gallons to liters, the tool provides instant, accurate results. The temperature converter specifically handles Celsius, Fahrenheit, and Kelvin conversions with clear explanations of the formulas used. The cooking converter is designed for the kitchen, translating between cups, tablespoons, milliliters, ounces, and grams for common cooking ingredients.</p>

<h3>Data and Encoding Converters</h3>
<p>Working with data often requires format conversions. Our Base64 converter encodes and decodes Base64 strings instantly, essential for web development, email attachments, and API integrations. The URL encoder handles percent-encoding for safe URL transmission of special characters. The CSV to JSON converter transforms spreadsheet data into structured JSON format, while JSON to CSV does the reverse — both invaluable for data processing workflows. The HTML to Markdown converter helps you migrate content between formats efficiently.</p>

<h3>Document and File Converters</h3>
<p>Document format conversion is one of the most common needs in both personal and professional settings. Our JPG to PDF converter combines images into professional PDF documents. The PDF to JPG tool extracts pages from PDF files as high-quality images. The Word to PDF converter creates portable documents from word processing files. The PDF merge tool combines multiple PDF files into a single document, while PDF compress reduces file sizes for easier sharing and storage. The image to text tool uses OCR technology to extract text from images and scanned documents.</p>

<h3>Time and Location Tools</h3>
<p>Coordinating across time zones is a daily challenge for remote teams and international businesses. Our time zone converter lets you quickly see what time it is anywhere in the world and convert between zones. The world clock displays current times across multiple cities simultaneously, making scheduling international meetings straightforward.</p>

<h3>Specialized Converters</h3>
<p>Some conversions require specialized tools. Our number to words converter transforms digits into written text in multiple languages, useful for checks, legal documents, and formal writing. The text to Morse code converter translates text into Morse code and back, serving both educational and practical purposes. The shoe size converter handles international shoe sizing standards across US, UK, EU, and other systems.</p>

<p>All conversion tools run in your browser with no file uploads to external servers, ensuring your data stays private and conversions happen instantly regardless of file size or internet speed.</p>`,
  },
  it: {
    title: 'Convertitori Online Gratuiti',
    metaTitle: 'Convertitori Online Gratuiti | ToolKit Online',
    description: 'Convertitore di unita, codificatore Base64, convertitore fuso orario, strumenti PDF, CSV in JSON e altri strumenti di conversione.',
    toolsHeading: 'Tutti gli Strumenti di Conversione',
    exploreOther: 'Esplora Altre Categorie',
    article: `<h2>Converti Qualsiasi Cosa, Ovunque, Istantaneamente</h2>
<p>Nel nostro mondo sempre piu connesso, la necessita di convertire tra diversi formati, unita e standard si presenta costantemente. Che tu sia uno sviluppatore che lavora con formati dati, un viaggiatore che affronta fusi orari, uno studente che converte unita per un problema di fisica o un professionista che prepara documenti in diversi formati, avere strumenti di conversione affidabili a portata di mano e essenziale. ToolKit Online offre un set completo di convertitori gratuiti che gestiscono tutto, dalle unita alle codifiche, dai formati file ai fusi orari.</p>

<h3>Conversione di Unita e Misure</h3>
<p>Il nostro convertitore di unita gestisce conversioni tra lunghezza, peso, volume, area, velocita, temperatura e molte altre categorie. Che tu debba convertire miglia in chilometri, libbre in chilogrammi o galloni in litri, lo strumento fornisce risultati istantanei e precisi. Il convertitore di temperatura gestisce specificamente le conversioni Celsius, Fahrenheit e Kelvin. Il convertitore da cucina e progettato per la cucina, traducendo tra tazze, cucchiai, millilitri, once e grammi.</p>

<h3>Convertitori di Dati e Codifica</h3>
<p>Lavorare con i dati richiede spesso conversioni di formato. Il nostro convertitore Base64 codifica e decodifica stringhe Base64 istantaneamente, essenziale per lo sviluppo web e le integrazioni API. Il codificatore URL gestisce la codifica percentuale per la trasmissione sicura di caratteri speciali. Il convertitore CSV in JSON trasforma i dati dei fogli di calcolo in formato JSON strutturato, mentre JSON in CSV fa il contrario. Il convertitore HTML in Markdown ti aiuta a migrare contenuti tra formati in modo efficiente.</p>

<h3>Convertitori di Documenti e File</h3>
<p>La conversione di formati documentali e una delle necessita piu comuni. Il nostro convertitore JPG in PDF combina immagini in documenti PDF professionali. Lo strumento PDF in JPG estrae pagine da file PDF come immagini di alta qualita. Il convertitore Word in PDF crea documenti portabili. Lo strumento di unione PDF combina piu file PDF in un unico documento, mentre la compressione PDF riduce le dimensioni dei file. Lo strumento immagine in testo utilizza la tecnologia OCR per estrarre testo da immagini e documenti scansionati.</p>

<h3>Strumenti per Tempo e Posizione</h3>
<p>Coordinarsi attraverso i fusi orari e una sfida quotidiana per team remoti e aziende internazionali. Il nostro convertitore di fuso orario ti permette di vedere rapidamente che ora e in qualsiasi parte del mondo. L orologio mondiale visualizza gli orari correnti in piu citta simultaneamente.</p>

<h3>Convertitori Specializzati</h3>
<p>Alcune conversioni richiedono strumenti specializzati. Il nostro convertitore numeri in parole trasforma le cifre in testo scritto in piu lingue. Il convertitore testo in codice Morse traduce il testo in codice Morse e viceversa. Il convertitore di taglie scarpe gestisce gli standard internazionali di misure tra sistemi US, UK, EU e altri.</p>

<p>Tutti gli strumenti di conversione funzionano nel tuo browser senza caricamento di file su server esterni, garantendo che i tuoi dati restino privati e le conversioni avvengano istantaneamente.</p>`,
  },
  es: {
    title: 'Conversores Online Gratuitos',
    metaTitle: 'Conversores Online Gratuitos | ToolKit Online',
    description: 'Conversor de unidades, codificador Base64, conversor de zona horaria, herramientas PDF, CSV a JSON y mas.',
    toolsHeading: 'Todas las Herramientas de Conversion',
    exploreOther: 'Explorar Otras Categorias',
    article: `<h2>Convierte Cualquier Cosa, En Cualquier Lugar, Al Instante</h2>
<p>En nuestro mundo cada vez mas conectado, la necesidad de convertir entre diferentes formatos, unidades y estandares surge constantemente. Ya seas un desarrollador trabajando con formatos de datos, un viajero lidiando con zonas horarias, un estudiante convirtiendo unidades para un problema de fisica o un profesional preparando documentos en diferentes formatos, tener herramientas de conversion confiables a tu alcance es esencial. ToolKit Online proporciona un conjunto completo de conversores gratuitos que manejan todo, desde unidades y codificaciones hasta formatos de archivo y zonas horarias.</p>

<h3>Conversion de Unidades y Medidas</h3>
<p>Nuestro conversor de unidades maneja conversiones de longitud, peso, volumen, area, velocidad, temperatura y muchas mas categorias. Ya sea que necesites convertir millas a kilometros, libras a kilogramos o galones a litros, la herramienta proporciona resultados instantaneos y precisos. El conversor de temperatura maneja conversiones Celsius, Fahrenheit y Kelvin. El conversor de cocina esta disenado para la cocina, traduciendo entre tazas, cucharadas, mililitros, onzas y gramos.</p>

<h3>Conversores de Datos y Codificacion</h3>
<p>Trabajar con datos a menudo requiere conversiones de formato. Nuestro conversor Base64 codifica y decodifica cadenas Base64 instantaneamente, esencial para el desarrollo web y las integraciones API. El codificador URL maneja la codificacion porcentual para la transmision segura de caracteres especiales. El conversor CSV a JSON transforma datos de hojas de calculo en formato JSON estructurado, mientras que JSON a CSV hace lo contrario. El conversor HTML a Markdown te ayuda a migrar contenido entre formatos eficientemente.</p>

<h3>Conversores de Documentos y Archivos</h3>
<p>La conversion de formatos de documentos es una de las necesidades mas comunes. Nuestro conversor JPG a PDF combina imagenes en documentos PDF profesionales. La herramienta PDF a JPG extrae paginas de archivos PDF como imagenes de alta calidad. El conversor Word a PDF crea documentos portables. La herramienta de fusion PDF combina multiples archivos PDF en uno solo, mientras que la compresion PDF reduce el tamano de los archivos. La herramienta de imagen a texto usa tecnologia OCR para extraer texto de imagenes y documentos escaneados.</p>

<h3>Herramientas de Tiempo y Ubicacion</h3>
<p>Coordinarse a traves de zonas horarias es un desafio diario para equipos remotos y negocios internacionales. Nuestro conversor de zona horaria te permite ver rapidamente que hora es en cualquier parte del mundo. El reloj mundial muestra las horas actuales en multiples ciudades simultaneamente.</p>

<h3>Conversores Especializados</h3>
<p>Algunas conversiones requieren herramientas especializadas. Nuestro conversor de numeros a palabras transforma digitos en texto escrito en multiples idiomas. El conversor de texto a codigo Morse traduce texto en codigo Morse y viceversa. El conversor de tallas de zapatos maneja los estandares internacionales entre sistemas US, UK, EU y otros.</p>

<p>Todas las herramientas de conversion funcionan en tu navegador sin subir archivos a servidores externos, asegurando privacidad y conversiones instantaneas.</p>`,
  },
  fr: {
    title: 'Convertisseurs en Ligne Gratuits',
    metaTitle: 'Convertisseurs en Ligne Gratuits | ToolKit Online',
    description: 'Convertisseur d unites, encodeur Base64, convertisseur de fuseau horaire, outils PDF, CSV vers JSON et plus.',
    toolsHeading: 'Tous les Outils de Conversion',
    exploreOther: 'Explorer les Autres Categories',
    article: `<h2>Convertissez Tout, Partout, Instantanement</h2>
<p>Dans notre monde de plus en plus connecte, le besoin de convertir entre differents formats, unites et standards se presente constamment. Que vous soyez un developpeur travaillant avec des formats de donnees, un voyageur gerant les fuseaux horaires, un etudiant convertissant des unites pour un probleme de physique ou un professionnel preparant des documents dans differents formats, disposer d outils de conversion fiables est essentiel. ToolKit Online fournit un ensemble complet de convertisseurs gratuits qui gerent tout, des unites aux encodages, des formats de fichiers aux fuseaux horaires.</p>

<h3>Conversion d Unites et de Mesures</h3>
<p>Notre convertisseur d unites gere les conversions de longueur, poids, volume, surface, vitesse, temperature et bien d autres categories. Que vous ayez besoin de convertir des miles en kilometres, des livres en kilogrammes ou des gallons en litres, l outil fournit des resultats instantanes et precis. Le convertisseur de temperature gere specifiquement les conversions Celsius, Fahrenheit et Kelvin. Le convertisseur de cuisine est concu pour la cuisine, traduisant entre tasses, cuilleres, millilitres, onces et grammes.</p>

<h3>Convertisseurs de Donnees et d Encodage</h3>
<p>Travailler avec des donnees necessite souvent des conversions de format. Notre convertisseur Base64 encode et decode instantanement les chaines Base64, essentiel pour le developpement web et les integrations API. L encodeur URL gere l encodage en pourcentage pour la transmission securisee des caracteres speciaux. Le convertisseur CSV vers JSON transforme les donnees de tableur en format JSON structure, tandis que JSON vers CSV fait l inverse. Le convertisseur HTML vers Markdown vous aide a migrer du contenu entre formats efficacement.</p>

<h3>Convertisseurs de Documents et Fichiers</h3>
<p>La conversion de formats de documents est l un des besoins les plus courants. Notre convertisseur JPG en PDF combine des images en documents PDF professionnels. L outil PDF en JPG extrait des pages de fichiers PDF en images haute qualite. Le convertisseur Word en PDF cree des documents portables. L outil de fusion PDF combine plusieurs fichiers PDF en un seul document, tandis que la compression PDF reduit la taille des fichiers. L outil image vers texte utilise la technologie OCR pour extraire du texte a partir d images et de documents numerises.</p>

<h3>Outils de Temps et de Localisation</h3>
<p>Se coordonner entre les fuseaux horaires est un defi quotidien pour les equipes distantes et les entreprises internationales. Notre convertisseur de fuseau horaire vous permet de voir rapidement quelle heure il est n importe ou dans le monde. L horloge mondiale affiche les heures actuelles dans plusieurs villes simultanement.</p>

<h3>Convertisseurs Specialises</h3>
<p>Certaines conversions necessitent des outils specialises. Notre convertisseur nombres en mots transforme les chiffres en texte ecrit dans plusieurs langues. Le convertisseur texte en code Morse traduit du texte en code Morse et inversement. Le convertisseur de pointures gere les standards internationaux entre les systemes US, UK, EU et autres.</p>

<p>Tous les outils de conversion fonctionnent dans votre navigateur sans televersement de fichiers vers des serveurs externes, garantissant confidentialite et conversions instantanees.</p>`,
  },
  de: {
    title: 'Kostenlose Online-Umrechner & Konvertierungstools',
    metaTitle: 'Kostenlose Online-Umrechner & Konvertierungstools | ToolKit Online',
    description: 'Einheitenumrechner, Base64-Konverter, Zeitzonen-Umrechner, PDF-Tools, CSV zu JSON und weitere kostenlose Konvertierungstools.',
    toolsHeading: 'Alle Konvertierungstools',
    exploreOther: 'Andere Kategorien Entdecken',
    article: `<h2>Konvertieren Sie Alles, Ueberall, Sofort</h2>
<p>In unserer zunehmend vernetzten Welt entsteht staendig die Notwendigkeit, zwischen verschiedenen Formaten, Einheiten und Standards zu konvertieren. Ob Sie ein Entwickler sind, der mit Datenformaten arbeitet, ein Reisender, der mit Zeitzonen umgeht, ein Student, der Einheiten fuer ein Physikproblem umrechnet, oder ein Profi, der Dokumente in verschiedenen Dateiformaten vorbereitet — zuverlaessige Konvertierungstools sind unerlaeesslich. ToolKit Online bietet einen umfassenden Satz kostenloser Konverter fuer alles von Einheiten und Kodierungen bis hin zu Dateiformaten und Zeitzonen.</p>

<h3>Einheiten- und Massumrechnung</h3>
<p>Unser Einheitenumrechner verarbeitet Umrechnungen fuer Laenge, Gewicht, Volumen, Flaeche, Geschwindigkeit, Temperatur und viele weitere Kategorien. Ob Sie Meilen in Kilometer, Pfund in Kilogramm oder Gallonen in Liter umrechnen muessen — das Tool liefert sofortige, praezise Ergebnisse. Der Temperaturumrechner verarbeitet speziell Celsius-, Fahrenheit- und Kelvin-Umrechnungen. Der Kochumrechner ist fuer die Kueche konzipiert und uebersetzt zwischen Tassen, Essloeffeln, Millilitern, Unzen und Gramm.</p>

<h3>Daten- und Kodierungskonverter</h3>
<p>Die Arbeit mit Daten erfordert oft Formatkonvertierungen. Unser Base64-Konverter kodiert und dekodiert Base64-Strings sofort, unverzichtbar fuer Webentwicklung und API-Integrationen. Der URL-Encoder verarbeitet Prozent-Kodierung fuer die sichere URL-Uebertragung von Sonderzeichen. Der CSV-zu-JSON-Konverter wandelt Tabellendaten in strukturiertes JSON-Format um, waehrend JSON-zu-CSV das Gegenteil tut. Der HTML-zu-Markdown-Konverter hilft Ihnen, Inhalte effizient zwischen Formaten zu migrieren.</p>

<h3>Dokument- und Dateikonverter</h3>
<p>Die Konvertierung von Dokumentformaten ist einer der haeufigsten Beduerfnisse. Unser JPG-zu-PDF-Konverter kombiniert Bilder zu professionellen PDF-Dokumenten. Das PDF-zu-JPG-Tool extrahiert Seiten aus PDF-Dateien als hochwertige Bilder. Der Word-zu-PDF-Konverter erstellt portable Dokumente. Das PDF-Zusammenfuehrungs-Tool kombiniert mehrere PDF-Dateien zu einem einzigen Dokument, waehrend PDF-Komprimierung die Dateigroesse reduziert. Das Bild-zu-Text-Tool verwendet OCR-Technologie zur Textextraktion aus Bildern und gescannten Dokumenten.</p>

<h3>Zeit- und Standort-Tools</h3>
<p>Die Koordination ueber Zeitzonen hinweg ist eine taegliche Herausforderung fuer Remote-Teams und internationale Unternehmen. Unser Zeitzonen-Umrechner zeigt Ihnen schnell, wie spaet es ueberall auf der Welt ist. Die Weltuhr zeigt aktuelle Zeiten in mehreren Staedten gleichzeitig an.</p>

<h3>Spezialisierte Konverter</h3>
<p>Manche Konvertierungen erfordern spezialisierte Tools. Unser Zahlen-zu-Woerter-Konverter wandelt Ziffern in geschriebenen Text in mehreren Sprachen um. Der Text-zu-Morse-Code-Konverter uebersetzt Text in Morsecode und zurueck. Der Schuhgroessen-Konverter verarbeitet internationale Schuhgroessenstandards zwischen US-, UK-, EU- und anderen Systemen.</p>

<p>Alle Konvertierungstools laufen in Ihrem Browser ohne Datei-Uploads auf externe Server, wodurch Ihre Daten privat bleiben und Konvertierungen sofort erfolgen.</p>`,
  },
  pt: {
    title: 'Conversores Online Gratuitos',
    metaTitle: 'Conversores Online Gratuitos | ToolKit Online',
    description: 'Conversor de unidades, codificador Base64, conversor de fuso horario, ferramentas PDF, CSV para JSON e mais.',
    toolsHeading: 'Todas as Ferramentas de Conversao',
    exploreOther: 'Explorar Outras Categorias',
    article: `<h2>Converta Qualquer Coisa, Em Qualquer Lugar, Instantaneamente</h2>
<p>Em nosso mundo cada vez mais conectado, a necessidade de converter entre diferentes formatos, unidades e padroes surge constantemente. Seja voce um desenvolvedor trabalhando com formatos de dados, um viajante lidando com fusos horarios, um estudante convertendo unidades para um problema de fisica ou um profissional preparando documentos em diferentes formatos, ter ferramentas de conversao confiaveis ao seu alcance e essencial. O ToolKit Online fornece um conjunto completo de conversores gratuitos que lidam com tudo, desde unidades e codificacoes ate formatos de arquivo e fusos horarios.</p>

<h3>Conversao de Unidades e Medidas</h3>
<p>Nosso conversor de unidades lida com conversoes de comprimento, peso, volume, area, velocidade, temperatura e muitas outras categorias. Seja convertendo milhas para quilometros, libras para quilogramas ou galoes para litros, a ferramenta fornece resultados instantaneos e precisos. O conversor de temperatura lida especificamente com conversoes Celsius, Fahrenheit e Kelvin. O conversor de cozinha e projetado para a cozinha, traduzindo entre xicaras, colheres, mililitros, oncas e gramas.</p>

<h3>Conversores de Dados e Codificacao</h3>
<p>Trabalhar com dados frequentemente requer conversoes de formato. Nosso conversor Base64 codifica e decodifica strings Base64 instantaneamente, essencial para desenvolvimento web e integracoes API. O codificador URL lida com codificacao percentual para transmissao segura de caracteres especiais. O conversor CSV para JSON transforma dados de planilhas em formato JSON estruturado, enquanto JSON para CSV faz o inverso. O conversor HTML para Markdown ajuda a migrar conteudo entre formatos eficientemente.</p>

<h3>Conversores de Documentos e Arquivos</h3>
<p>A conversao de formatos de documentos e uma das necessidades mais comuns. Nosso conversor JPG para PDF combina imagens em documentos PDF profissionais. A ferramenta PDF para JPG extrai paginas de arquivos PDF como imagens de alta qualidade. O conversor Word para PDF cria documentos portaveis. A ferramenta de mesclagem PDF combina multiplos arquivos PDF em um unico documento, enquanto a compressao PDF reduz o tamanho dos arquivos. A ferramenta de imagem para texto usa tecnologia OCR para extrair texto de imagens e documentos digitalizados.</p>

<h3>Ferramentas de Tempo e Localizacao</h3>
<p>Coordenar entre fusos horarios e um desafio diario para equipes remotas e negocios internacionais. Nosso conversor de fuso horario permite ver rapidamente que horas sao em qualquer lugar do mundo. O relogio mundial exibe horarios atuais em multiplas cidades simultaneamente.</p>

<h3>Conversores Especializados</h3>
<p>Algumas conversoes requerem ferramentas especializadas. Nosso conversor de numeros para palavras transforma digitos em texto escrito em multiplos idiomas. O conversor de texto para codigo Morse traduz texto em codigo Morse e vice-versa. O conversor de tamanho de sapato lida com padroes internacionais entre sistemas US, UK, EU e outros.</p>

<p>Todas as ferramentas de conversao funcionam no seu navegador sem upload de arquivos para servidores externos, garantindo privacidade e conversoes instantaneas.</p>`,
  },
};

export default function ConversionToolsPage() {
  return (
    <CategoryHubPage
      config={{
        categoryKey: 'conversion',
        slug: 'conversion-tools',
        toolSlugs: toolSlugs,
        otherCategories: [
          { key: 'finance', slug: 'finance-tools' },
          { key: 'text', slug: 'text-tools' },
          { key: 'health', slug: 'health-tools' },
          { key: 'dev', slug: 'developer-tools' },
          { key: 'math', slug: 'math-tools' },
          { key: 'images', slug: 'image-tools' },
        ],
        translations,
      }}
    />
  );
}
