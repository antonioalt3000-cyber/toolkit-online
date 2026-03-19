import Link from 'next/link';
import type { Metadata } from 'next';
import { tools, common, locales, getToolsByCategory, type Locale } from '@/lib/translations';
import { BASE_URL } from '@/lib/seo';

const categories = ['finance', 'text', 'health', 'conversion', 'dev', 'math', 'images'] as const;
type Category = (typeof categories)[number];

const categoryIntros: Record<Category, Record<Locale, string>> = {
  finance: {
    en: 'Explore our complete collection of free financial calculators and tools. From mortgage and loan calculators to investment planners, tax estimators, and budgeting utilities — everything you need to make smarter financial decisions. Each tool runs entirely in your browser with no registration required, giving you instant results for all your personal finance calculations.',
    it: 'Esplora la nostra raccolta completa di calcolatori e strumenti finanziari gratuiti. Dai calcolatori di mutui e prestiti ai pianificatori di investimenti, stimatori fiscali e utilità di budgeting — tutto ciò che serve per prendere decisioni finanziarie più intelligenti. Ogni strumento funziona interamente nel browser senza registrazione, offrendoti risultati immediati.',
    es: 'Explora nuestra colección completa de calculadoras y herramientas financieras gratuitas. Desde calculadoras de hipotecas y préstamos hasta planificadores de inversiones, estimadores de impuestos y utilidades de presupuesto — todo lo que necesitas para tomar decisiones financieras más inteligentes. Cada herramienta funciona directamente en tu navegador sin registro.',
    fr: 'Explorez notre collection complète de calculateurs et outils financiers gratuits. Des calculateurs d\'hypothèques et de prêts aux planificateurs d\'investissements, estimateurs fiscaux et utilitaires de budget — tout ce dont vous avez besoin pour prendre des décisions financières plus éclairées. Chaque outil fonctionne directement dans votre navigateur sans inscription.',
    de: 'Entdecken Sie unsere komplette Sammlung kostenloser Finanzrechner und -tools. Von Hypotheken- und Kreditrechnern über Investitionsplaner bis hin zu Steuer-Schätzern und Budget-Tools — alles was Sie für klügere Finanzentscheidungen brauchen. Jedes Tool läuft direkt im Browser ohne Registrierung und liefert sofortige Ergebnisse.',
    pt: 'Explore nossa coleção completa de calculadoras e ferramentas financeiras gratuitas. De calculadoras de hipoteca e empréstimos a planejadores de investimentos, estimadores de impostos e utilitários de orçamento — tudo que você precisa para tomar decisões financeiras mais inteligentes. Cada ferramenta funciona diretamente no navegador sem registro.',
  },
  text: {
    en: 'Discover our free text tools and writing utilities. Count words and characters, convert text cases, generate Lorem Ipsum, compare text differences, check typing speed, and much more. Whether you are a writer, student, or developer, these browser-based tools help you work with text efficiently — no downloads or sign-ups needed.',
    it: 'Scopri i nostri strumenti di testo e utilità di scrittura gratuiti. Conta parole e caratteri, converti maiuscole e minuscole, genera Lorem Ipsum, confronta differenze di testo, verifica la velocità di digitazione e molto altro. Che tu sia scrittore, studente o sviluppatore, questi strumenti basati su browser ti aiutano a lavorare con il testo in modo efficiente.',
    es: 'Descubre nuestras herramientas de texto y utilidades de escritura gratuitas. Cuenta palabras y caracteres, convierte mayúsculas y minúsculas, genera Lorem Ipsum, compara diferencias de texto, verifica la velocidad de escritura y mucho más. Ya seas escritor, estudiante o desarrollador, estas herramientas te ayudan a trabajar con texto de forma eficiente.',
    fr: 'Découvrez nos outils de texte et utilitaires d\'écriture gratuits. Comptez les mots et caractères, convertissez la casse, générez du Lorem Ipsum, comparez les différences de texte, testez votre vitesse de frappe et bien plus. Que vous soyez écrivain, étudiant ou développeur, ces outils vous aident à travailler efficacement avec le texte.',
    de: 'Entdecken Sie unsere kostenlosen Text-Tools und Schreibhilfen. Zählen Sie Wörter und Zeichen, konvertieren Sie Groß-/Kleinschreibung, generieren Sie Lorem Ipsum, vergleichen Sie Textunterschiede, testen Sie Ihre Tippgeschwindigkeit und vieles mehr. Ob Autor, Student oder Entwickler — diese Browser-Tools helfen Ihnen effizient mit Text zu arbeiten.',
    pt: 'Descubra nossas ferramentas de texto e utilitários de escrita gratuitos. Conte palavras e caracteres, converta maiúsculas e minúsculas, gere Lorem Ipsum, compare diferenças de texto, verifique a velocidade de digitação e muito mais. Seja escritor, estudante ou desenvolvedor, essas ferramentas ajudam você a trabalhar com texto de forma eficiente.',
  },
  health: {
    en: 'Access our free health and wellness calculators. Calculate your BMI, daily calorie needs, body fat percentage, ideal weight, water intake, and more. These evidence-based tools help you track and understand key health metrics. All calculations happen in your browser — your data stays private and no account is required.',
    it: 'Accedi ai nostri calcolatori di salute e benessere gratuiti. Calcola il tuo IMC, il fabbisogno calorico giornaliero, la percentuale di grasso corporeo, il peso ideale, l\'assunzione di acqua e altro. Questi strumenti basati su evidenze scientifiche ti aiutano a monitorare e comprendere le metriche di salute. Tutti i calcoli avvengono nel browser — i tuoi dati restano privati.',
    es: 'Accede a nuestras calculadoras de salud y bienestar gratuitas. Calcula tu IMC, necesidades calóricas diarias, porcentaje de grasa corporal, peso ideal, ingesta de agua y más. Estas herramientas basadas en evidencia te ayudan a rastrear y comprender métricas clave de salud. Todos los cálculos se realizan en tu navegador — tus datos permanecen privados.',
    fr: 'Accédez à nos calculateurs de santé et bien-être gratuits. Calculez votre IMC, besoins caloriques quotidiens, pourcentage de graisse corporelle, poids idéal, apport en eau et plus. Ces outils basés sur des preuves vous aident à suivre et comprendre les métriques de santé clés. Tous les calculs se font dans votre navigateur — vos données restent privées.',
    de: 'Nutzen Sie unsere kostenlosen Gesundheits- und Wellness-Rechner. Berechnen Sie Ihren BMI, täglichen Kalorienbedarf, Körperfettanteil, Idealgewicht, Wasseraufnahme und mehr. Diese evidenzbasierten Tools helfen Ihnen, wichtige Gesundheitskennzahlen zu verfolgen und zu verstehen. Alle Berechnungen erfolgen im Browser — Ihre Daten bleiben privat.',
    pt: 'Acesse nossas calculadoras de saúde e bem-estar gratuitas. Calcule seu IMC, necessidades calóricas diárias, percentual de gordura corporal, peso ideal, ingestão de água e mais. Essas ferramentas baseadas em evidências ajudam você a rastrear e entender métricas-chave de saúde. Todos os cálculos acontecem no navegador — seus dados permanecem privados.',
  },
  conversion: {
    en: 'Use our free online conversion tools to transform files, data formats, and units instantly. Convert between CSV and JSON, encode URLs and Base64, merge and compress PDFs, convert images, and handle time zones. All conversions happen right in your browser — fast, private, and with no file size limits or uploads to external servers.',
    it: 'Usa i nostri strumenti di conversione online gratuiti per trasformare file, formati dati e unità istantaneamente. Converti tra CSV e JSON, codifica URL e Base64, unisci e comprimi PDF, converti immagini e gestisci fusi orari. Tutte le conversioni avvengono nel browser — veloci, private e senza limiti di dimensione file o upload su server esterni.',
    es: 'Usa nuestras herramientas de conversión en línea gratuitas para transformar archivos, formatos de datos y unidades al instante. Convierte entre CSV y JSON, codifica URLs y Base64, fusiona y comprime PDFs, convierte imágenes y gestiona zonas horarias. Todas las conversiones ocurren en tu navegador — rápidas, privadas y sin límites de tamaño.',
    fr: 'Utilisez nos outils de conversion en ligne gratuits pour transformer fichiers, formats de données et unités instantanément. Convertissez entre CSV et JSON, encodez URLs et Base64, fusionnez et compressez des PDFs, convertissez des images et gérez les fuseaux horaires. Toutes les conversions se font dans votre navigateur — rapides, privées et sans limites.',
    de: 'Nutzen Sie unsere kostenlosen Online-Konvertierungstools um Dateien, Datenformate und Einheiten sofort umzuwandeln. Konvertieren Sie zwischen CSV und JSON, kodieren Sie URLs und Base64, führen Sie PDFs zusammen, konvertieren Sie Bilder und verwalten Sie Zeitzonen. Alle Konvertierungen erfolgen direkt im Browser — schnell, privat und ohne Größenlimits.',
    pt: 'Use nossas ferramentas de conversão online gratuitas para transformar arquivos, formatos de dados e unidades instantaneamente. Converta entre CSV e JSON, codifique URLs e Base64, mescle e comprima PDFs, converta imagens e gerencie fusos horários. Todas as conversões acontecem no navegador — rápidas, privadas e sem limites de tamanho.',
  },
  dev: {
    en: 'Browse our free developer tools and utilities. Format JSON and XML, generate passwords and QR codes, test regex patterns, convert colors and hashes, check your screen resolution, and much more. Built for developers, designers, and IT professionals — all tools run client-side for maximum speed and privacy with no registration needed.',
    it: 'Esplora i nostri strumenti e utilità gratuiti per sviluppatori. Formatta JSON e XML, genera password e codici QR, testa pattern regex, converti colori e hash, controlla la risoluzione dello schermo e molto altro. Creati per sviluppatori, designer e professionisti IT — tutti gli strumenti funzionano lato client per massima velocità e privacy.',
    es: 'Explora nuestras herramientas y utilidades gratuitas para desarrolladores. Formatea JSON y XML, genera contraseñas y códigos QR, prueba patrones regex, convierte colores y hashes, verifica la resolución de pantalla y mucho más. Creadas para desarrolladores, diseñadores y profesionales de TI — todas las herramientas funcionan del lado del cliente.',
    fr: 'Parcourez nos outils et utilitaires gratuits pour développeurs. Formatez JSON et XML, générez des mots de passe et codes QR, testez des patterns regex, convertissez couleurs et hashes, vérifiez la résolution d\'écran et bien plus. Conçus pour les développeurs, designers et professionnels IT — tous les outils fonctionnent côté client.',
    de: 'Entdecken Sie unsere kostenlosen Entwickler-Tools und Utilities. Formatieren Sie JSON und XML, generieren Sie Passwörter und QR-Codes, testen Sie Regex-Muster, konvertieren Sie Farben und Hashes, prüfen Sie die Bildschirmauflösung und vieles mehr. Für Entwickler, Designer und IT-Profis — alle Tools laufen clientseitig für maximale Geschwindigkeit und Privatsphäre.',
    pt: 'Explore nossas ferramentas e utilitários gratuitos para desenvolvedores. Formate JSON e XML, gere senhas e códigos QR, teste padrões regex, converta cores e hashes, verifique a resolução da tela e muito mais. Criadas para desenvolvedores, designers e profissionais de TI — todas as ferramentas funcionam no lado do cliente.',
  },
  math: {
    en: 'Use our free math calculators and tools for everyday calculations and academic work. Calculate ages, dates, fractions, percentages, standard deviations, matrices, and probabilities. Create charts, use a scientific calculator, set timers, and track habits. Perfect for students, teachers, and professionals who need quick, accurate math results.',
    it: 'Usa i nostri calcolatori e strumenti matematici gratuiti per calcoli quotidiani e lavoro accademico. Calcola età, date, frazioni, percentuali, deviazioni standard, matrici e probabilità. Crea grafici, usa la calcolatrice scientifica, imposta timer e monitora abitudini. Perfetti per studenti, insegnanti e professionisti che hanno bisogno di risultati matematici rapidi e precisi.',
    es: 'Usa nuestras calculadoras y herramientas matemáticas gratuitas para cálculos cotidianos y trabajo académico. Calcula edades, fechas, fracciones, porcentajes, desviaciones estándar, matrices y probabilidades. Crea gráficos, usa la calculadora científica, configura temporizadores y rastrea hábitos. Perfectas para estudiantes, profesores y profesionales.',
    fr: 'Utilisez nos calculateurs et outils mathématiques gratuits pour les calculs quotidiens et le travail académique. Calculez âges, dates, fractions, pourcentages, écarts-types, matrices et probabilités. Créez des graphiques, utilisez la calculatrice scientifique, réglez des minuteries et suivez vos habitudes. Parfaits pour étudiants, enseignants et professionnels.',
    de: 'Nutzen Sie unsere kostenlosen Mathe-Rechner und -Tools für alltägliche Berechnungen und akademische Arbeit. Berechnen Sie Alter, Daten, Brüche, Prozentsätze, Standardabweichungen, Matrizen und Wahrscheinlichkeiten. Erstellen Sie Diagramme, nutzen Sie den wissenschaftlichen Taschenrechner, stellen Sie Timer und verfolgen Sie Gewohnheiten. Perfekt für Schüler, Lehrer und Profis.',
    pt: 'Use nossas calculadoras e ferramentas matemáticas gratuitas para cálculos do dia a dia e trabalho acadêmico. Calcule idades, datas, frações, porcentagens, desvios padrão, matrizes e probabilidades. Crie gráficos, use a calculadora científica, configure temporizadores e acompanhe hábitos. Perfeitas para estudantes, professores e profissionais.',
  },
  images: {
    en: 'Edit and transform your images with our free online image tools. Compress images to reduce file size, resize photos, remove backgrounds, convert between formats like SVG and PNG, create memes, design pixel art, and use the digital whiteboard. All processing happens locally in your browser — your images are never uploaded to any server.',
    it: 'Modifica e trasforma le tue immagini con i nostri strumenti gratuiti per immagini online. Comprimi immagini per ridurre le dimensioni, ridimensiona foto, rimuovi sfondi, converti tra formati come SVG e PNG, crea meme, progetta pixel art e usa la lavagna digitale. Tutta l\'elaborazione avviene localmente nel browser — le tue immagini non vengono mai caricate su server.',
    es: 'Edita y transforma tus imágenes con nuestras herramientas de imagen en línea gratuitas. Comprime imágenes para reducir el tamaño, redimensiona fotos, elimina fondos, convierte entre formatos como SVG y PNG, crea memes, diseña pixel art y usa la pizarra digital. Todo el procesamiento ocurre localmente en tu navegador.',
    fr: 'Éditez et transformez vos images avec nos outils d\'image en ligne gratuits. Compressez les images pour réduire la taille, redimensionnez les photos, supprimez les arrière-plans, convertissez entre formats comme SVG et PNG, créez des mèmes, concevez du pixel art et utilisez le tableau blanc numérique. Tout le traitement se fait localement dans votre navigateur.',
    de: 'Bearbeiten und transformieren Sie Ihre Bilder mit unseren kostenlosen Online-Bildtools. Komprimieren Sie Bilder, ändern Sie die Größe von Fotos, entfernen Sie Hintergründe, konvertieren Sie zwischen Formaten wie SVG und PNG, erstellen Sie Memes, gestalten Sie Pixel Art und nutzen Sie das digitale Whiteboard. Alle Verarbeitung erfolgt lokal im Browser.',
    pt: 'Edite e transforme suas imagens com nossas ferramentas de imagem online gratuitas. Comprima imagens para reduzir o tamanho, redimensione fotos, remova fundos, converta entre formatos como SVG e PNG, crie memes, projete pixel art e use o quadro branco digital. Todo o processamento acontece localmente no navegador — suas imagens nunca são enviadas a servidores.',
  },
};

const categoryIcons: Record<string, string> = {
  finance: '💰',
  text: '📝',
  conversion: '🔄',
  health: '❤️',
  dev: '💻',
  math: '🔢',
  images: '🖼️',
};

export function generateStaticParams() {
  const params: { lang: string; category: string }[] = [];
  for (const lang of locales) {
    for (const cat of categories) {
      params.push({ lang, category: cat });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}): Promise<Metadata> {
  const { lang, category } = await params;
  const locale = (lang as Locale) || 'en';
  const t = common[locale];
  const categoryName = t.categories[category] || category;

  const title = `${categoryName} Tools — Free Online ${categoryName} Calculators & Utilities`;
  const description = categoryIntros[category as Category]?.[locale] || '';

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/tools/category/${category}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${BASE_URL}/${l}/tools/category/${category}`])
      ),
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/tools/category/${category}`,
      siteName: 'ToolKit Online',
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}) {
  const { lang, category } = await params;
  const locale = (lang as Locale) || 'en';
  const t = common[locale];
  const allCategories = getToolsByCategory();
  const toolSlugs = allCategories[category] || [];
  const categoryName = t.categories[category] || category;
  const intro = categoryIntros[category as Category]?.[locale] || '';
  const icon = categoryIcons[category] || '🔧';

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: t.siteTitle || 'ToolKit Online',
        item: `${BASE_URL}/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t.footerAllTools || 'Tools',
        item: `${BASE_URL}/${locale}/tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: `${BASE_URL}/${locale}/tools/category/${category}`,
      },
    ],
  };

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryName} Tools`,
    description: intro,
    url: `${BASE_URL}/${locale}/tools/category/${category}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: toolSlugs.map((slug, index) => {
        const toolData = tools[slug]?.[locale];
        return {
          '@type': 'ListItem',
          position: index + 1,
          name: toolData?.name || slug,
          url: `${BASE_URL}/${locale}/tools/${slug}`,
        };
      }),
    },
  };

  return (
    <div className="max-w-6xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="mb-6 text-sm text-gray-500">
        <ol className="flex items-center gap-1.5 flex-wrap">
          <li>
            <Link href={`/${locale}`} className="hover:text-blue-600 transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/${locale}/tools`} className="hover:text-blue-600 transition-colors">
              Tools
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-800 font-medium">{categoryName}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">{icon}</div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {categoryName}
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {intro}
        </p>
        <p className="mt-3 text-sm text-gray-500">
          {toolSlugs.length} tools
        </p>
      </div>

      {/* Tool Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
        {toolSlugs.map((slug) => {
          const toolData = tools[slug]?.[locale];
          if (!toolData) return null;
          return (
            <Link
              key={slug}
              href={`/${locale}/tools/${slug}`}
              className="group block p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              <h2 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                {toolData.name}
              </h2>
              <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                {toolData.description}
              </p>
              <span className="inline-block mt-3 text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
                {t.categories[category] ? `→` : '→'}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Back to All Tools */}
      <div className="text-center mb-8">
        <Link
          href={`/${locale}/tools`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
        >
          ← {t.footerAllTools || 'All Tools'}
        </Link>
      </div>

      {/* Other Categories */}
      <div className="border-t border-gray-200 pt-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          {locale === 'it' ? 'Altre categorie' :
           locale === 'es' ? 'Otras categorías' :
           locale === 'fr' ? 'Autres catégories' :
           locale === 'de' ? 'Andere Kategorien' :
           locale === 'pt' ? 'Outras categorias' :
           'Other Categories'}
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {categories
            .filter((cat) => cat !== category)
            .map((cat) => (
              <Link
                key={cat}
                href={`/${locale}/tools/category/${cat}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span>{categoryIcons[cat]}</span>
                {t.categories[cat] || cat}
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
