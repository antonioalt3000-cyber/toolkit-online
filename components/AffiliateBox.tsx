'use client';

import { useParams } from 'next/navigation';
import type { Locale } from '@/lib/translations';

interface AffiliateBoxProps {
  toolSlug: string;
}

interface AffiliateItem {
  emoji: string;
  headline: Record<Locale, string>;
  description: Record<Locale, string>;
  cta: Record<Locale, string>;
  url: string;
}

type CategoryKey = 'finance' | 'security' | 'text' | 'health' | 'image' | 'math' | 'conversion' | 'developer';

const categorySlugs: Record<CategoryKey, string[]> = {
  finance: [
    'vat-calculator', 'percentage-calculator', 'loan-calculator', 'salary-calculator',
    'tip-calculator', 'discount-calculator', 'electricity-calculator', 'invoice-generator',
    'invoice-calculator', 'mortgage-calculator', 'currency-converter', 'fuel-cost-calculator',
    'profit-margin-calculator', 'sales-tax-calculator', 'mortgage-amortization',
    'compound-interest-calculator', 'investment-calculator', 'roi-calculator',
    'paycheck-calculator', 'inflation-calculator', 'retirement-calculator', 'debt-payoff-calculator',
  ],
  security: [
    'password-generator', 'hash-generator', 'ip-lookup',
  ],
  text: [
    'word-counter', 'lorem-ipsum-generator', 'text-case-converter', 'character-counter',
    'text-to-slug', 'markdown-preview', 'html-encoder', 'text-diff', 'character-map',
    'text-to-speech', 'grammar-checker', 'resume-builder', 'ai-text-detector',
    'text-repeater', 'emoji-picker', 'word-frequency-counter', 'line-counter',
    'note-taking', 'flashcard-maker', 'font-identifier', 'typing-speed-test',
  ],
  health: [
    'bmi-calculator', 'calorie-calculator', 'body-fat-calculator', 'ideal-weight-calculator',
    'water-intake-calculator', 'pregnancy-calculator', 'sleep-calculator', 'pace-calculator',
    'breathing-exercise', 'noise-generator',
  ],
  image: [
    'image-compressor', 'image-resizer', 'photo-editor', 'pixel-ruler',
    'meme-generator', 'pixel-art-maker', 'background-remover',
    'color-picker', 'color-converter', 'color-palette-generator', 'gradient-generator',
  ],
  math: [
    'age-calculator', 'speed-calculator', 'date-calculator', 'random-number-generator',
    'aspect-ratio-calculator', 'grade-calculator', 'countdown-timer', 'stopwatch',
    'scientific-calculator', 'percentage-change-calculator', 'fraction-calculator',
    'gpa-calculator', 'pomodoro-timer', 'habit-tracker', 'standard-deviation-calculator',
    'matrix-calculator', 'probability-calculator', 'chart-maker',
  ],
  conversion: [
    'unit-converter', 'base64-converter', 'time-zone-converter', 'cooking-converter',
    'csv-to-json', 'url-encoder', 'jpg-to-pdf', 'pdf-to-jpg', 'word-to-pdf',
    'number-to-words', 'temperature-converter', 'pdf-merge', 'pdf-compress', 'image-to-text',
  ],
  developer: [
    'json-formatter', 'qr-code-generator', 'barcode-generator', 'screen-resolution',
    'screen-recorder', 'regex-tester', 'hex-converter', 'binary-converter',
    'binary-translator', 'cron-expression-generator', 'timestamp-converter',
    'internet-speed-test', 'keyboard-tester', 'mic-test', 'webcam-test',
  ],
};

const affiliates: Record<CategoryKey, AffiliateItem[]> = {
  finance: [
    {
      emoji: '🛍️',
      headline: {
        en: 'Start your online business with Shopify',
        it: 'Avvia il tuo business online con Shopify',
        es: 'Inicia tu negocio online con Shopify',
        fr: 'Lancez votre boutique en ligne avec Shopify',
        de: 'Starten Sie Ihr Online-Geschäft mit Shopify',
        pt: 'Comece seu negócio online com Shopify',
      },
      description: {
        en: 'Build, manage, and grow your e-commerce store with the platform trusted by millions.',
        it: 'Crea, gestisci e fai crescere il tuo negozio e-commerce con la piattaforma scelta da milioni.',
        es: 'Crea, gestiona y haz crecer tu tienda online con la plataforma de confianza de millones.',
        fr: 'Créez, gérez et développez votre boutique en ligne avec la plateforme de confiance.',
        de: 'Erstellen, verwalten und erweitern Sie Ihren Online-Shop mit der Plattform, der Millionen vertrauen.',
        pt: 'Crie, gerencie e expanda sua loja virtual com a plataforma confiada por milhões.',
      },
      cta: {
        en: 'Try Shopify Free',
        it: 'Prova Shopify Gratis',
        es: 'Prueba Shopify Gratis',
        fr: 'Essayer Shopify Gratuitement',
        de: 'Shopify Kostenlos Testen',
        pt: 'Experimente Shopify Grátis',
      },
      url: 'https://affiliate.placeholder.com/shopify',
    },
    {
      emoji: '🌐',
      headline: {
        en: 'Get a professional domain for your business',
        it: 'Ottieni un dominio professionale per il tuo business',
        es: 'Obtén un dominio profesional para tu negocio',
        fr: 'Obtenez un domaine professionnel pour votre entreprise',
        de: 'Holen Sie sich eine professionelle Domain für Ihr Unternehmen',
        pt: 'Obtenha um domínio profissional para o seu negócio',
      },
      description: {
        en: 'Register your domain name with Namecheap — affordable, reliable, and easy to manage.',
        it: 'Registra il tuo dominio con Namecheap — economico, affidabile e facile da gestire.',
        es: 'Registra tu dominio con Namecheap — asequible, fiable y fácil de gestionar.',
        fr: 'Enregistrez votre domaine avec Namecheap — abordable, fiable et facile à gérer.',
        de: 'Registrieren Sie Ihre Domain bei Namecheap — günstig, zuverlässig und einfach zu verwalten.',
        pt: 'Registre seu domínio com Namecheap — acessível, confiável e fácil de gerenciar.',
      },
      cta: {
        en: 'Get Your Domain',
        it: 'Ottieni il Tuo Dominio',
        es: 'Obtén Tu Dominio',
        fr: 'Obtenez Votre Domaine',
        de: 'Domain Sichern',
        pt: 'Obtenha Seu Domínio',
      },
      url: 'https://affiliate.placeholder.com/namecheap',
    },
  ],
  security: [
    {
      emoji: '🔒',
      headline: {
        en: 'Protect your privacy online with NordVPN',
        it: 'Proteggi la tua privacy online con NordVPN',
        es: 'Protege tu privacidad en línea con NordVPN',
        fr: 'Protégez votre vie privée en ligne avec NordVPN',
        de: 'Schützen Sie Ihre Privatsphäre online mit NordVPN',
        pt: 'Proteja sua privacidade online com NordVPN',
      },
      description: {
        en: 'Browse securely with military-grade encryption. Fast, reliable, and easy to use.',
        it: 'Naviga in sicurezza con crittografia di livello militare. Veloce, affidabile e facile da usare.',
        es: 'Navega de forma segura con encriptación de grado militar. Rápido, fiable y fácil de usar.',
        fr: 'Naviguez en toute sécurité avec un chiffrement de niveau militaire. Rapide, fiable et facile.',
        de: 'Surfen Sie sicher mit militärischer Verschlüsselung. Schnell, zuverlässig und einfach.',
        pt: 'Navegue com segurança com criptografia de nível militar. Rápido, confiável e fácil de usar.',
      },
      cta: {
        en: 'Get NordVPN',
        it: 'Ottieni NordVPN',
        es: 'Obtener NordVPN',
        fr: 'Obtenir NordVPN',
        de: 'NordVPN Holen',
        pt: 'Obter NordVPN',
      },
      url: 'https://affiliate.placeholder.com/nordvpn',
    },
    {
      emoji: '🖥️',
      headline: {
        en: 'Host your projects with Namecheap',
        it: 'Ospita i tuoi progetti con Namecheap',
        es: 'Aloja tus proyectos con Namecheap',
        fr: 'Hébergez vos projets avec Namecheap',
        de: 'Hosten Sie Ihre Projekte mit Namecheap',
        pt: 'Hospede seus projetos com Namecheap',
      },
      description: {
        en: 'Reliable hosting, domains, and SSL certificates at great prices.',
        it: 'Hosting affidabile, domini e certificati SSL a ottimi prezzi.',
        es: 'Alojamiento fiable, dominios y certificados SSL a excelentes precios.',
        fr: 'Hébergement fiable, domaines et certificats SSL à des prix imbattables.',
        de: 'Zuverlässiges Hosting, Domains und SSL-Zertifikate zu günstigen Preisen.',
        pt: 'Hospedagem confiável, domínios e certificados SSL a ótimos preços.',
      },
      cta: {
        en: 'Explore Namecheap',
        it: 'Scopri Namecheap',
        es: 'Explorar Namecheap',
        fr: 'Découvrir Namecheap',
        de: 'Namecheap Entdecken',
        pt: 'Explorar Namecheap',
      },
      url: 'https://affiliate.placeholder.com/namecheap-hosting',
    },
  ],
  text: [
    {
      emoji: '✍️',
      headline: {
        en: 'Perfect your writing with Grammarly',
        it: 'Perfeziona la tua scrittura con Grammarly',
        es: 'Perfecciona tu escritura con Grammarly',
        fr: 'Perfectionnez votre écriture avec Grammarly',
        de: 'Perfektionieren Sie Ihr Schreiben mit Grammarly',
        pt: 'Aperfeiçoe sua escrita com Grammarly',
      },
      description: {
        en: 'AI-powered writing assistant for grammar, clarity, and tone. Free to start.',
        it: 'Assistente di scrittura basato su IA per grammatica, chiarezza e tono. Gratis per iniziare.',
        es: 'Asistente de escritura con IA para gramática, claridad y tono. Gratis para empezar.',
        fr: 'Assistant d\'écriture IA pour la grammaire, la clarté et le ton. Gratuit pour commencer.',
        de: 'KI-Schreibassistent für Grammatik, Klarheit und Ton. Kostenlos starten.',
        pt: 'Assistente de escrita com IA para gramática, clareza e tom. Grátis para começar.',
      },
      cta: {
        en: 'Try Grammarly Free',
        it: 'Prova Grammarly Gratis',
        es: 'Prueba Grammarly Gratis',
        fr: 'Essayer Grammarly Gratuitement',
        de: 'Grammarly Kostenlos Testen',
        pt: 'Experimente Grammarly Grátis',
      },
      url: 'https://affiliate.placeholder.com/grammarly',
    },
    {
      emoji: '🎨',
      headline: {
        en: 'Create stunning designs with Canva',
        it: 'Crea design straordinari con Canva',
        es: 'Crea diseños impresionantes con Canva',
        fr: 'Créez des designs époustouflants avec Canva',
        de: 'Erstellen Sie beeindruckende Designs mit Canva',
        pt: 'Crie designs impressionantes com Canva',
      },
      description: {
        en: 'Design presentations, social media graphics, and more — no design skills needed.',
        it: 'Crea presentazioni, grafiche per social media e altro — nessuna competenza di design richiesta.',
        es: 'Diseña presentaciones, gráficos para redes sociales y más — sin necesidad de habilidades de diseño.',
        fr: 'Créez des présentations, des visuels pour les réseaux sociaux et plus — aucune compétence requise.',
        de: 'Erstellen Sie Präsentationen, Social-Media-Grafiken und mehr — keine Designkenntnisse nötig.',
        pt: 'Crie apresentações, gráficos para redes sociais e mais — sem necessidade de habilidades de design.',
      },
      cta: {
        en: 'Try Canva Free',
        it: 'Prova Canva Gratis',
        es: 'Prueba Canva Gratis',
        fr: 'Essayer Canva Gratuitement',
        de: 'Canva Kostenlos Testen',
        pt: 'Experimente Canva Grátis',
      },
      url: 'https://affiliate.placeholder.com/canva',
    },
  ],
  health: [
    {
      emoji: '💪',
      headline: {
        en: 'Take your fitness to the next level',
        it: 'Porta il tuo fitness al livello successivo',
        es: 'Lleva tu fitness al siguiente nivel',
        fr: 'Passez votre forme physique au niveau supérieur',
        de: 'Bringen Sie Ihre Fitness auf das nächste Level',
        pt: 'Leve seu fitness ao próximo nível',
      },
      description: {
        en: 'Track workouts, nutrition, and progress with top-rated fitness apps and tools.',
        it: 'Monitora allenamenti, nutrizione e progressi con le migliori app e strumenti fitness.',
        es: 'Registra entrenamientos, nutrición y progreso con las mejores apps y herramientas fitness.',
        fr: 'Suivez vos entraînements, nutrition et progrès avec les meilleures apps fitness.',
        de: 'Verfolgen Sie Workouts, Ernährung und Fortschritte mit den besten Fitness-Apps.',
        pt: 'Acompanhe treinos, nutrição e progresso com os melhores apps e ferramentas fitness.',
      },
      cta: {
        en: 'Explore Fitness Tools',
        it: 'Scopri Strumenti Fitness',
        es: 'Explorar Herramientas Fitness',
        fr: 'Découvrir les Outils Fitness',
        de: 'Fitness-Tools Entdecken',
        pt: 'Explorar Ferramentas Fitness',
      },
      url: 'https://affiliate.placeholder.com/fitness',
    },
    {
      emoji: '🥗',
      headline: {
        en: 'Track nutrition and calories with MyFitnessPal',
        it: 'Monitora nutrizione e calorie con MyFitnessPal',
        es: 'Registra nutrición y calorías con MyFitnessPal',
        fr: 'Suivez nutrition et calories avec MyFitnessPal',
        de: 'Ernährung und Kalorien tracken mit MyFitnessPal',
        pt: 'Acompanhe nutrição e calorias com MyFitnessPal',
      },
      description: {
        en: 'The world\'s largest food database with over 14 million foods. Track meals, exercise, and reach your health goals.',
        it: 'Il più grande database alimentare al mondo con oltre 14 milioni di alimenti. Monitora pasti, esercizio e raggiungi i tuoi obiettivi di salute.',
        es: 'La mayor base de datos de alimentos del mundo con más de 14 millones de alimentos. Registra comidas, ejercicio y alcanza tus metas de salud.',
        fr: 'La plus grande base de données alimentaires au monde avec plus de 14 millions d\'aliments. Suivez repas, exercice et atteignez vos objectifs santé.',
        de: 'Die weltweit größte Lebensmitteldatenbank mit über 14 Millionen Lebensmitteln. Mahlzeiten, Sport und Gesundheitsziele tracken.',
        pt: 'O maior banco de dados de alimentos do mundo com mais de 14 milhões de alimentos. Acompanhe refeições, exercícios e alcance seus objetivos de saúde.',
      },
      cta: {
        en: 'Try MyFitnessPal',
        it: 'Prova MyFitnessPal',
        es: 'Prueba MyFitnessPal',
        fr: 'Essayer MyFitnessPal',
        de: 'MyFitnessPal Testen',
        pt: 'Experimente MyFitnessPal',
      },
      url: 'https://affiliate.placeholder.com/myfitnesspal',
    },
  ],
  image: [
    {
      emoji: '🎨',
      headline: {
        en: 'Professional design made easy with Canva',
        it: 'Design professionale reso facile con Canva',
        es: 'Diseño profesional fácil con Canva',
        fr: 'Le design professionnel simplifié avec Canva',
        de: 'Professionelles Design leicht gemacht mit Canva',
        pt: 'Design profissional facilitado com Canva',
      },
      description: {
        en: 'Create logos, social posts, presentations, and more with drag-and-drop simplicity.',
        it: 'Crea loghi, post social, presentazioni e altro con la semplicità del drag-and-drop.',
        es: 'Crea logos, publicaciones sociales, presentaciones y más con la simplicidad de arrastrar y soltar.',
        fr: 'Créez des logos, publications sociales, présentations et plus avec un simple glisser-déposer.',
        de: 'Erstellen Sie Logos, Social-Media-Posts, Präsentationen und mehr per Drag-and-Drop.',
        pt: 'Crie logos, posts sociais, apresentações e mais com a simplicidade de arrastar e soltar.',
      },
      cta: {
        en: 'Try Canva Free',
        it: 'Prova Canva Gratis',
        es: 'Prueba Canva Gratis',
        fr: 'Essayer Canva Gratuitement',
        de: 'Canva Kostenlos Testen',
        pt: 'Experimente Canva Grátis',
      },
      url: 'https://affiliate.placeholder.com/canva',
    },
  ],
  math: [
    {
      emoji: '🧮',
      headline: {
        en: 'Advanced computation with Wolfram Alpha Pro',
        it: 'Calcoli avanzati con Wolfram Alpha Pro',
        es: 'Computación avanzada con Wolfram Alpha Pro',
        fr: 'Calculs avancés avec Wolfram Alpha Pro',
        de: 'Erweiterte Berechnungen mit Wolfram Alpha Pro',
        pt: 'Computação avançada com Wolfram Alpha Pro',
      },
      description: {
        en: 'Access powerful computational tools for math, science, and data analysis. Step-by-step solutions included.',
        it: 'Accedi a potenti strumenti di calcolo per matematica, scienze e analisi dati. Soluzioni passo-passo incluse.',
        es: 'Accede a potentes herramientas de cálculo para matemáticas, ciencias y análisis de datos. Soluciones paso a paso incluidas.',
        fr: 'Accédez à des outils de calcul puissants pour les maths, les sciences et l\'analyse de données. Solutions étape par étape incluses.',
        de: 'Zugriff auf leistungsstarke Berechnungstools für Mathematik, Wissenschaft und Datenanalyse. Schritt-für-Schritt-Lösungen inklusive.',
        pt: 'Acesse ferramentas computacionais poderosas para matemática, ciências e análise de dados. Soluções passo a passo incluídas.',
      },
      cta: {
        en: 'Try Wolfram Alpha Pro',
        it: 'Prova Wolfram Alpha Pro',
        es: 'Prueba Wolfram Alpha Pro',
        fr: 'Essayer Wolfram Alpha Pro',
        de: 'Wolfram Alpha Pro Testen',
        pt: 'Experimente Wolfram Alpha Pro',
      },
      url: 'https://affiliate.placeholder.com/wolfram',
    },
    {
      emoji: '📊',
      headline: {
        en: 'Professional graphing with Desmos',
        it: 'Grafici professionali con Desmos',
        es: 'Gráficos profesionales con Desmos',
        fr: 'Graphiques professionnels avec Desmos',
        de: 'Professionelle Grafiken mit Desmos',
        pt: 'Gráficos profissionais com Desmos',
      },
      description: {
        en: 'Beautiful, interactive math visualizations. Graph functions, plot data, and explore math concepts effortlessly.',
        it: 'Visualizzazioni matematiche interattive e belle. Crea grafici di funzioni, traccia dati ed esplora concetti matematici facilmente.',
        es: 'Visualizaciones matemáticas interactivas y hermosas. Grafica funciones, traza datos y explora conceptos matemáticos fácilmente.',
        fr: 'Visualisations mathématiques interactives et élégantes. Tracez des fonctions, des données et explorez les concepts mathématiques facilement.',
        de: 'Wunderschöne, interaktive Mathe-Visualisierungen. Funktionen zeichnen, Daten plotten und Mathe-Konzepte mühelos erkunden.',
        pt: 'Visualizações matemáticas interativas e bonitas. Plote funções, trace dados e explore conceitos matemáticos facilmente.',
      },
      cta: {
        en: 'Try Desmos',
        it: 'Prova Desmos',
        es: 'Prueba Desmos',
        fr: 'Essayer Desmos',
        de: 'Desmos Testen',
        pt: 'Experimente Desmos',
      },
      url: 'https://affiliate.placeholder.com/desmos',
    },
  ],
  conversion: [
    {
      emoji: '📄',
      headline: {
        en: 'Work smarter with PDF tools by Adobe',
        it: 'Lavora in modo intelligente con gli strumenti PDF di Adobe',
        es: 'Trabaja de forma inteligente con las herramientas PDF de Adobe',
        fr: 'Travaillez plus intelligemment avec les outils PDF d\'Adobe',
        de: 'Arbeiten Sie smarter mit Adobe PDF-Tools',
        pt: 'Trabalhe de forma inteligente com ferramentas PDF da Adobe',
      },
      description: {
        en: 'Convert, edit, sign, and share PDFs from anywhere. The industry standard for document management.',
        it: 'Converti, modifica, firma e condividi PDF ovunque. Lo standard del settore per la gestione documenti.',
        es: 'Convierte, edita, firma y comparte PDF desde cualquier lugar. El estándar de la industria.',
        fr: 'Convertissez, modifiez, signez et partagez des PDF partout. Le standard de l\'industrie.',
        de: 'Konvertieren, bearbeiten, signieren und teilen Sie PDFs von überall. Der Branchenstandard.',
        pt: 'Converta, edite, assine e compartilhe PDFs de qualquer lugar. O padrão da indústria.',
      },
      cta: {
        en: 'Try Adobe Acrobat',
        it: 'Prova Adobe Acrobat',
        es: 'Prueba Adobe Acrobat',
        fr: 'Essayer Adobe Acrobat',
        de: 'Adobe Acrobat Testen',
        pt: 'Experimente Adobe Acrobat',
      },
      url: 'https://affiliate.placeholder.com/adobe-acrobat',
    },
  ],
  developer: [
    {
      emoji: '🚀',
      headline: {
        en: 'Deploy your projects instantly with Hostinger',
        it: 'Pubblica i tuoi progetti istantaneamente con Hostinger',
        es: 'Despliega tus proyectos al instante con Hostinger',
        fr: 'Déployez vos projets instantanément avec Hostinger',
        de: 'Stellen Sie Ihre Projekte sofort mit Hostinger bereit',
        pt: 'Implante seus projetos instantaneamente com Hostinger',
      },
      description: {
        en: 'Fast, secure hosting with free SSL, domain, and 24/7 support. Starting at just $2.99/mo.',
        it: 'Hosting veloce e sicuro con SSL gratuito, dominio e supporto 24/7. Da soli 2,99$/mese.',
        es: 'Hosting rápido y seguro con SSL gratis, dominio y soporte 24/7. Desde solo $2.99/mes.',
        fr: 'Hébergement rapide et sécurisé avec SSL gratuit, domaine et support 24/7. À partir de 2,99$/mois.',
        de: 'Schnelles, sicheres Hosting mit kostenlosem SSL, Domain und 24/7-Support. Ab nur 2,99$/Monat.',
        pt: 'Hospedagem rápida e segura com SSL grátis, domínio e suporte 24/7. A partir de apenas $2,99/mês.',
      },
      cta: {
        en: 'Get Hostinger',
        it: 'Ottieni Hostinger',
        es: 'Obtener Hostinger',
        fr: 'Obtenir Hostinger',
        de: 'Hostinger Holen',
        pt: 'Obter Hostinger',
      },
      url: 'https://affiliate.placeholder.com/hostinger',
    },
  ],
};

const disclosureText: Record<Locale, string> = {
  en: 'Ad',
  it: 'Annuncio',
  es: 'Anuncio',
  fr: 'Publicité',
  de: 'Anzeige',
  pt: 'Anúncio',
};

const sponsoredText: Record<Locale, string> = {
  en: 'Sponsored',
  it: 'Sponsorizzato',
  es: 'Patrocinado',
  fr: 'Sponsorisé',
  de: 'Gesponsert',
  pt: 'Patrocinado',
};

function getCategory(slug: string): CategoryKey | null {
  for (const [cat, slugs] of Object.entries(categorySlugs)) {
    if (slugs.includes(slug)) return cat as CategoryKey;
  }
  return null;
}

export default function AffiliateBox({ toolSlug }: AffiliateBoxProps) {
  const { lang } = useParams() as { lang: Locale };
  const locale = lang || 'en';

  const category = getCategory(toolSlug);
  if (!category) return null;

  const items = affiliates[category];
  if (!items || items.length === 0) return null;

  // Pick affiliate based on toolSlug hash for consistent per-tool rotation
  const hash = toolSlug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const item = items[hash % items.length];

  return (
    <div className="relative w-full max-w-2xl mx-auto my-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 sm:p-5">
        {/* Sponsored label */}
        <div className="absolute top-3 right-4 flex items-center gap-1.5">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
            {sponsoredText[locale]}
          </span>
          <span className="text-[9px] bg-gray-200 text-gray-500 rounded px-1 py-0.5 font-medium uppercase">
            {disclosureText[locale]}
          </span>
        </div>

        <div className="flex items-start gap-3 sm:gap-4">
          {/* Emoji icon */}
          <div className="text-2xl sm:text-3xl flex-shrink-0 mt-0.5" aria-hidden="true">
            {item.emoji}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm sm:text-base font-semibold text-gray-800 leading-snug pr-20">
              {item.headline[locale]}
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
              {item.description[locale]}
            </p>
            <div className="mt-3">
              <a
                href={item.url}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg px-4 py-2 transition-colors duration-200"
              >
                {item.cta[locale]}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
