export const locales = ['en', 'it', 'es', 'fr', 'de', 'pt'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  it: 'Italiano',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
};

type ToolTranslation = {
  name: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
};

type CommonTranslation = {
  siteTitle: string;
  siteDescription: string;
  toolsTitle: string;
  searchPlaceholder: string;
  categories: Record<string, string>;
  footer: string;
  calculate: string;
  result: string;
  copy: string;
  copied: string;
  clear: string;
  generate: string;
  convert: string;
};

export const common: Record<Locale, CommonTranslation> = {
  en: {
    siteTitle: 'ToolKit Online',
    siteDescription: 'Free online tools for everyday tasks. Calculators, converters, text tools and more.',
    toolsTitle: 'All Tools',
    searchPlaceholder: 'Search tools...',
    categories: {
      finance: 'Finance',
      text: 'Text',
      conversion: 'Conversion',
      health: 'Health & Lifestyle',
      dev: 'Developer',
      math: 'Math',
    },
    footer: 'Free online tools — no registration required.',
    calculate: 'Calculate',
    result: 'Result',
    copy: 'Copy',
    copied: 'Copied!',
    clear: 'Clear',
    generate: 'Generate',
    convert: 'Convert',
  },
  it: {
    siteTitle: 'ToolKit Online',
    siteDescription: 'Strumenti online gratuiti per le attività quotidiane. Calcolatori, convertitori, strumenti di testo e altro.',
    toolsTitle: 'Tutti gli Strumenti',
    searchPlaceholder: 'Cerca strumenti...',
    categories: {
      finance: 'Finanza',
      text: 'Testo',
      conversion: 'Conversione',
      health: 'Salute & Lifestyle',
      dev: 'Sviluppatori',
      math: 'Matematica',
    },
    footer: 'Strumenti online gratuiti — nessuna registrazione richiesta.',
    calculate: 'Calcola',
    result: 'Risultato',
    copy: 'Copia',
    copied: 'Copiato!',
    clear: 'Pulisci',
    generate: 'Genera',
    convert: 'Converti',
  },
  es: {
    siteTitle: 'ToolKit Online',
    siteDescription: 'Herramientas en línea gratuitas para tareas cotidianas. Calculadoras, convertidores, herramientas de texto y más.',
    toolsTitle: 'Todas las Herramientas',
    searchPlaceholder: 'Buscar herramientas...',
    categories: {
      finance: 'Finanzas',
      text: 'Texto',
      conversion: 'Conversión',
      health: 'Salud & Estilo de vida',
      dev: 'Desarrolladores',
      math: 'Matemáticas',
    },
    footer: 'Herramientas en línea gratuitas — sin registro.',
    calculate: 'Calcular',
    result: 'Resultado',
    copy: 'Copiar',
    copied: '¡Copiado!',
    clear: 'Limpiar',
    generate: 'Generar',
    convert: 'Convertir',
  },
  fr: {
    siteTitle: 'ToolKit Online',
    siteDescription: 'Outils en ligne gratuits pour les tâches quotidiennes. Calculatrices, convertisseurs, outils de texte et plus.',
    toolsTitle: 'Tous les Outils',
    searchPlaceholder: 'Rechercher des outils...',
    categories: {
      finance: 'Finance',
      text: 'Texte',
      conversion: 'Conversion',
      health: 'Santé & Mode de vie',
      dev: 'Développeurs',
      math: 'Mathématiques',
    },
    footer: 'Outils en ligne gratuits — aucune inscription requise.',
    calculate: 'Calculer',
    result: 'Résultat',
    copy: 'Copier',
    copied: 'Copié !',
    clear: 'Effacer',
    generate: 'Générer',
    convert: 'Convertir',
  },
  de: {
    siteTitle: 'ToolKit Online',
    siteDescription: 'Kostenlose Online-Tools für alltägliche Aufgaben. Rechner, Umrechner, Textwerkzeuge und mehr.',
    toolsTitle: 'Alle Werkzeuge',
    searchPlaceholder: 'Werkzeuge suchen...',
    categories: {
      finance: 'Finanzen',
      text: 'Text',
      conversion: 'Umrechnung',
      health: 'Gesundheit & Lifestyle',
      dev: 'Entwickler',
      math: 'Mathematik',
    },
    footer: 'Kostenlose Online-Tools — keine Registrierung erforderlich.',
    calculate: 'Berechnen',
    result: 'Ergebnis',
    copy: 'Kopieren',
    copied: 'Kopiert!',
    clear: 'Löschen',
    generate: 'Generieren',
    convert: 'Umrechnen',
  },
  pt: {
    siteTitle: 'ToolKit Online',
    siteDescription: 'Ferramentas online gratuitas para tarefas do dia a dia. Calculadoras, conversores, ferramentas de texto e mais.',
    toolsTitle: 'Todas as Ferramentas',
    searchPlaceholder: 'Pesquisar ferramentas...',
    categories: {
      finance: 'Finanças',
      text: 'Texto',
      conversion: 'Conversão',
      health: 'Saúde & Estilo de vida',
      dev: 'Desenvolvedores',
      math: 'Matemática',
    },
    footer: 'Ferramentas online gratuitas — sem registro necessário.',
    calculate: 'Calcular',
    result: 'Resultado',
    copy: 'Copiar',
    copied: 'Copiado!',
    clear: 'Limpar',
    generate: 'Gerar',
    convert: 'Converter',
  },
};

export const tools: Record<string, Record<Locale, ToolTranslation>> = {
  'vat-calculator': {
    en: { name: 'VAT Calculator', description: 'Calculate VAT (Value Added Tax) quickly. Add or remove VAT from any amount.', metaTitle: 'VAT Calculator — Add or Remove VAT Online', metaDescription: 'Free VAT calculator. Add or remove VAT from any amount instantly. Supports all VAT rates.' },
    it: { name: 'Calcolo IVA', description: 'Calcola l\'IVA velocemente. Aggiungi o scorporo IVA da qualsiasi importo.', metaTitle: 'Calcolo IVA Online — Scorporo e Aggiunta IVA', metaDescription: 'Calcolatore IVA gratuito. Aggiungi o scorporo l\'IVA da qualsiasi importo. Supporta tutte le aliquote.' },
    es: { name: 'Calculadora de IVA', description: 'Calcula el IVA rápidamente. Añade o quita el IVA de cualquier cantidad.', metaTitle: 'Calculadora de IVA Online — Añadir o Quitar IVA', metaDescription: 'Calculadora de IVA gratuita. Añade o quita el IVA de cualquier cantidad al instante.' },
    fr: { name: 'Calculateur de TVA', description: 'Calculez la TVA rapidement. Ajoutez ou retirez la TVA de n\'importe quel montant.', metaTitle: 'Calculateur de TVA en ligne — Ajouter ou Retirer la TVA', metaDescription: 'Calculateur de TVA gratuit. Ajoutez ou retirez la TVA de n\'importe quel montant.' },
    de: { name: 'MwSt-Rechner', description: 'Berechnen Sie die MwSt schnell. MwSt zu jedem Betrag hinzufügen oder entfernen.', metaTitle: 'MwSt-Rechner Online — MwSt Berechnen', metaDescription: 'Kostenloser MwSt-Rechner. MwSt sofort zu jedem Betrag hinzufügen oder entfernen.' },
    pt: { name: 'Calculadora de IVA', description: 'Calcule o IVA rapidamente. Adicione ou remova o IVA de qualquer valor.', metaTitle: 'Calculadora de IVA Online — Adicionar ou Remover IVA', metaDescription: 'Calculadora de IVA gratuita. Adicione ou remova o IVA de qualquer valor instantaneamente.' },
  },
  'word-counter': {
    en: { name: 'Word Counter', description: 'Count words, characters, sentences, and paragraphs in your text.', metaTitle: 'Word Counter — Count Words & Characters Online', metaDescription: 'Free word counter tool. Count words, characters, sentences and paragraphs instantly.' },
    it: { name: 'Conta Parole', description: 'Conta parole, caratteri, frasi e paragrafi nel tuo testo.', metaTitle: 'Conta Parole Online — Contatore di Parole e Caratteri', metaDescription: 'Contatore di parole gratuito. Conta parole, caratteri, frasi e paragrafi istantaneamente.' },
    es: { name: 'Contador de Palabras', description: 'Cuenta palabras, caracteres, oraciones y párrafos en tu texto.', metaTitle: 'Contador de Palabras Online — Contar Palabras y Caracteres', metaDescription: 'Contador de palabras gratuito. Cuenta palabras, caracteres, oraciones y párrafos al instante.' },
    fr: { name: 'Compteur de Mots', description: 'Comptez les mots, caractères, phrases et paragraphes dans votre texte.', metaTitle: 'Compteur de Mots en ligne — Compter Mots et Caractères', metaDescription: 'Compteur de mots gratuit. Comptez mots, caractères, phrases et paragraphes instantanément.' },
    de: { name: 'Wortzähler', description: 'Zählen Sie Wörter, Zeichen, Sätze und Absätze in Ihrem Text.', metaTitle: 'Wortzähler Online — Wörter und Zeichen Zählen', metaDescription: 'Kostenloser Wortzähler. Zählen Sie Wörter, Zeichen, Sätze und Absätze sofort.' },
    pt: { name: 'Contador de Palavras', description: 'Conte palavras, caracteres, frases e parágrafos no seu texto.', metaTitle: 'Contador de Palavras Online — Contar Palavras e Caracteres', metaDescription: 'Contador de palavras gratuito. Conte palavras, caracteres, frases e parágrafos instantaneamente.' },
  },
  'password-generator': {
    en: { name: 'Password Generator', description: 'Generate strong, secure passwords with custom length and character types.', metaTitle: 'Password Generator — Create Strong Passwords Online', metaDescription: 'Free password generator. Create strong, secure passwords with custom length and options.' },
    it: { name: 'Generatore Password', description: 'Genera password sicure e robuste con lunghezza e caratteri personalizzabili.', metaTitle: 'Generatore Password Online — Crea Password Sicure', metaDescription: 'Generatore di password gratuito. Crea password sicure con lunghezza e opzioni personalizzabili.' },
    es: { name: 'Generador de Contraseñas', description: 'Genera contraseñas seguras con longitud y tipos de caracteres personalizados.', metaTitle: 'Generador de Contraseñas — Crear Contraseñas Seguras', metaDescription: 'Generador de contraseñas gratuito. Crea contraseñas seguras con longitud y opciones personalizadas.' },
    fr: { name: 'Générateur de Mots de Passe', description: 'Générez des mots de passe forts et sécurisés avec longueur et caractères personnalisables.', metaTitle: 'Générateur de Mots de Passe — Créer des Mots de Passe Sécurisés', metaDescription: 'Générateur de mots de passe gratuit. Créez des mots de passe forts avec des options personnalisées.' },
    de: { name: 'Passwort-Generator', description: 'Generieren Sie starke, sichere Passwörter mit individueller Länge und Zeichentypen.', metaTitle: 'Passwort-Generator — Sichere Passwörter Erstellen', metaDescription: 'Kostenloser Passwort-Generator. Erstellen Sie starke Passwörter mit individueller Länge.' },
    pt: { name: 'Gerador de Senhas', description: 'Gere senhas fortes e seguras com comprimento e tipos de caracteres personalizados.', metaTitle: 'Gerador de Senhas — Criar Senhas Seguras Online', metaDescription: 'Gerador de senhas gratuito. Crie senhas fortes com comprimento e opções personalizadas.' },
  },
  'percentage-calculator': {
    en: { name: 'Percentage Calculator', description: 'Calculate percentages easily. Find percentage of a number, increase, decrease.', metaTitle: 'Percentage Calculator — Calculate Percentages Online', metaDescription: 'Free percentage calculator. Calculate percentage of a number, percentage increase and decrease.' },
    it: { name: 'Calcolo Percentuale', description: 'Calcola le percentuali facilmente. Trova percentuale di un numero, aumento, diminuzione.', metaTitle: 'Calcolo Percentuale Online — Calcolatore Percentuali', metaDescription: 'Calcolatore percentuale gratuito. Calcola la percentuale di un numero, aumento e diminuzione.' },
    es: { name: 'Calculadora de Porcentaje', description: 'Calcula porcentajes fácilmente. Encuentra el porcentaje de un número, aumento, disminución.', metaTitle: 'Calculadora de Porcentaje — Calcular Porcentajes Online', metaDescription: 'Calculadora de porcentaje gratuita. Calcula el porcentaje de un número, aumento y disminución.' },
    fr: { name: 'Calculateur de Pourcentage', description: 'Calculez les pourcentages facilement. Trouvez le pourcentage d\'un nombre, augmentation, diminution.', metaTitle: 'Calculateur de Pourcentage — Calculer Pourcentages en Ligne', metaDescription: 'Calculateur de pourcentage gratuit. Calculez le pourcentage d\'un nombre, augmentation et diminution.' },
    de: { name: 'Prozentrechner', description: 'Berechnen Sie Prozentsätze einfach. Prozent eines Betrags, Zunahme, Abnahme.', metaTitle: 'Prozentrechner — Prozent Online Berechnen', metaDescription: 'Kostenloser Prozentrechner. Berechnen Sie den Prozentsatz einer Zahl, Zunahme und Abnahme.' },
    pt: { name: 'Calculadora de Porcentagem', description: 'Calcule porcentagens facilmente. Encontre a porcentagem de um número, aumento, diminuição.', metaTitle: 'Calculadora de Porcentagem — Calcular Porcentagens Online', metaDescription: 'Calculadora de porcentagem gratuita. Calcule a porcentagem de um número, aumento e diminuição.' },
  },
  'bmi-calculator': {
    en: { name: 'BMI Calculator', description: 'Calculate your Body Mass Index (BMI) and find out your weight category.', metaTitle: 'BMI Calculator — Calculate Body Mass Index Online', metaDescription: 'Free BMI calculator. Calculate your Body Mass Index and find your weight category instantly.' },
    it: { name: 'Calcolo BMI', description: 'Calcola il tuo Indice di Massa Corporea (BMI) e scopri la tua categoria di peso.', metaTitle: 'Calcolo BMI Online — Indice Massa Corporea', metaDescription: 'Calcolatore BMI gratuito. Calcola il tuo indice di massa corporea e scopri la tua categoria.' },
    es: { name: 'Calculadora de IMC', description: 'Calcula tu Índice de Masa Corporal (IMC) y descubre tu categoría de peso.', metaTitle: 'Calculadora de IMC — Índice de Masa Corporal Online', metaDescription: 'Calculadora de IMC gratuita. Calcula tu índice de masa corporal y descubre tu categoría.' },
    fr: { name: 'Calculateur d\'IMC', description: 'Calculez votre Indice de Masse Corporelle (IMC) et découvrez votre catégorie de poids.', metaTitle: 'Calculateur IMC — Indice de Masse Corporelle en Ligne', metaDescription: 'Calculateur IMC gratuit. Calculez votre indice de masse corporelle et découvrez votre catégorie.' },
    de: { name: 'BMI-Rechner', description: 'Berechnen Sie Ihren Body-Mass-Index (BMI) und finden Sie Ihre Gewichtskategorie heraus.', metaTitle: 'BMI-Rechner — Body Mass Index Online Berechnen', metaDescription: 'Kostenloser BMI-Rechner. Berechnen Sie Ihren Body-Mass-Index und finden Sie Ihre Kategorie.' },
    pt: { name: 'Calculadora de IMC', description: 'Calcule seu Índice de Massa Corporal (IMC) e descubra sua categoria de peso.', metaTitle: 'Calculadora de IMC — Índice de Massa Corporal Online', metaDescription: 'Calculadora de IMC gratuita. Calcule seu índice de massa corporal e descubra sua categoria.' },
  },
  'unit-converter': {
    en: { name: 'Unit Converter', description: 'Convert between units of length, weight, temperature, speed and more.', metaTitle: 'Unit Converter — Convert Units Online Free', metaDescription: 'Free unit converter. Convert length, weight, temperature, speed and more units instantly.' },
    it: { name: 'Convertitore Unità', description: 'Converti tra unità di lunghezza, peso, temperatura, velocità e altro.', metaTitle: 'Convertitore Unità Online — Converti Unità di Misura', metaDescription: 'Convertitore di unità gratuito. Converti lunghezza, peso, temperatura, velocità e altro.' },
    es: { name: 'Conversor de Unidades', description: 'Convierte entre unidades de longitud, peso, temperatura, velocidad y más.', metaTitle: 'Conversor de Unidades Online — Convertir Unidades Gratis', metaDescription: 'Conversor de unidades gratuito. Convierte longitud, peso, temperatura, velocidad y más.' },
    fr: { name: 'Convertisseur d\'Unités', description: 'Convertissez entre les unités de longueur, poids, température, vitesse et plus.', metaTitle: 'Convertisseur d\'Unités en Ligne — Convertir Unités Gratuitement', metaDescription: 'Convertisseur d\'unités gratuit. Convertissez longueur, poids, température, vitesse et plus.' },
    de: { name: 'Einheitenumrechner', description: 'Rechnen Sie zwischen Einheiten für Länge, Gewicht, Temperatur, Geschwindigkeit und mehr um.', metaTitle: 'Einheitenumrechner — Einheiten Online Umrechnen', metaDescription: 'Kostenloser Einheitenumrechner. Rechnen Sie Länge, Gewicht, Temperatur und mehr um.' },
    pt: { name: 'Conversor de Unidades', description: 'Converta entre unidades de comprimento, peso, temperatura, velocidade e mais.', metaTitle: 'Conversor de Unidades Online — Converter Unidades Grátis', metaDescription: 'Conversor de unidades gratuito. Converta comprimento, peso, temperatura, velocidade e mais.' },
  },
  'json-formatter': {
    en: { name: 'JSON Formatter', description: 'Format, validate and beautify JSON data. Minify or pretty-print JSON.', metaTitle: 'JSON Formatter — Format & Validate JSON Online', metaDescription: 'Free JSON formatter. Format, validate and beautify JSON data online. Minify or pretty-print.' },
    it: { name: 'Formattatore JSON', description: 'Formatta, valida e abbellisci dati JSON. Minimizza o formatta JSON.', metaTitle: 'Formattatore JSON Online — Formatta e Valida JSON', metaDescription: 'Formattatore JSON gratuito. Formatta, valida e abbellisci dati JSON online.' },
    es: { name: 'Formateador JSON', description: 'Formatea, valida y embellece datos JSON. Minimiza o formatea JSON.', metaTitle: 'Formateador JSON — Formatear y Validar JSON Online', metaDescription: 'Formateador JSON gratuito. Formatea, valida y embellece datos JSON en línea.' },
    fr: { name: 'Formateur JSON', description: 'Formatez, validez et embellissez les données JSON. Minifiez ou formatez JSON.', metaTitle: 'Formateur JSON — Formater et Valider JSON en Ligne', metaDescription: 'Formateur JSON gratuit. Formatez, validez et embellissez les données JSON en ligne.' },
    de: { name: 'JSON-Formatierer', description: 'Formatieren, validieren und verschönern Sie JSON-Daten. JSON minimieren oder formatieren.', metaTitle: 'JSON-Formatierer — JSON Online Formatieren und Validieren', metaDescription: 'Kostenloser JSON-Formatierer. Formatieren und validieren Sie JSON-Daten online.' },
    pt: { name: 'Formatador JSON', description: 'Formate, valide e embeleze dados JSON. Minifique ou formate JSON.', metaTitle: 'Formatador JSON — Formatar e Validar JSON Online', metaDescription: 'Formatador JSON gratuito. Formate, valide e embeleze dados JSON online.' },
  },
  'base64-converter': {
    en: { name: 'Base64 Converter', description: 'Encode or decode Base64 strings instantly. Convert text to Base64 and back.', metaTitle: 'Base64 Encoder/Decoder — Convert Base64 Online', metaDescription: 'Free Base64 converter. Encode or decode Base64 strings instantly online.' },
    it: { name: 'Convertitore Base64', description: 'Codifica o decodifica stringhe Base64 istantaneamente.', metaTitle: 'Convertitore Base64 Online — Codifica e Decodifica Base64', metaDescription: 'Convertitore Base64 gratuito. Codifica o decodifica stringhe Base64 online.' },
    es: { name: 'Conversor Base64', description: 'Codifica o decodifica cadenas Base64 al instante.', metaTitle: 'Conversor Base64 — Codificar y Decodificar Base64 Online', metaDescription: 'Conversor Base64 gratuito. Codifica o decodifica cadenas Base64 en línea.' },
    fr: { name: 'Convertisseur Base64', description: 'Encodez ou décodez des chaînes Base64 instantanément.', metaTitle: 'Convertisseur Base64 — Encoder et Décoder Base64 en Ligne', metaDescription: 'Convertisseur Base64 gratuit. Encodez ou décodez des chaînes Base64 en ligne.' },
    de: { name: 'Base64-Konverter', description: 'Kodieren oder dekodieren Sie Base64-Zeichenketten sofort.', metaTitle: 'Base64-Konverter — Base64 Online Kodieren und Dekodieren', metaDescription: 'Kostenloser Base64-Konverter. Kodieren oder dekodieren Sie Base64 online.' },
    pt: { name: 'Conversor Base64', description: 'Codifique ou decodifique strings Base64 instantaneamente.', metaTitle: 'Conversor Base64 — Codificar e Decodificar Base64 Online', metaDescription: 'Conversor Base64 gratuito. Codifique ou decodifique strings Base64 online.' },
  },
  'color-picker': {
    en: { name: 'Color Picker', description: 'Pick colors and convert between HEX, RGB, and HSL formats.', metaTitle: 'Color Picker — HEX, RGB, HSL Color Converter Online', metaDescription: 'Free color picker tool. Pick colors and convert between HEX, RGB, and HSL formats.' },
    it: { name: 'Selettore Colori', description: 'Seleziona colori e converti tra formati HEX, RGB e HSL.', metaTitle: 'Selettore Colori Online — Convertitore HEX, RGB, HSL', metaDescription: 'Selettore colori gratuito. Seleziona colori e converti tra formati HEX, RGB e HSL.' },
    es: { name: 'Selector de Color', description: 'Selecciona colores y convierte entre formatos HEX, RGB y HSL.', metaTitle: 'Selector de Color — Convertidor HEX, RGB, HSL Online', metaDescription: 'Selector de color gratuito. Selecciona colores y convierte entre formatos HEX, RGB y HSL.' },
    fr: { name: 'Sélecteur de Couleurs', description: 'Choisissez des couleurs et convertissez entre les formats HEX, RGB et HSL.', metaTitle: 'Sélecteur de Couleurs — Convertisseur HEX, RGB, HSL en Ligne', metaDescription: 'Sélecteur de couleurs gratuit. Choisissez des couleurs et convertissez entre HEX, RGB et HSL.' },
    de: { name: 'Farbwähler', description: 'Wählen Sie Farben und konvertieren Sie zwischen HEX, RGB und HSL.', metaTitle: 'Farbwähler — HEX, RGB, HSL Farbkonverter Online', metaDescription: 'Kostenloser Farbwähler. Wählen Sie Farben und konvertieren Sie zwischen HEX, RGB und HSL.' },
    pt: { name: 'Seletor de Cores', description: 'Selecione cores e converta entre formatos HEX, RGB e HSL.', metaTitle: 'Seletor de Cores — Conversor HEX, RGB, HSL Online', metaDescription: 'Seletor de cores gratuito. Selecione cores e converta entre formatos HEX, RGB e HSL.' },
  },
  'age-calculator': {
    en: { name: 'Age Calculator', description: 'Calculate your exact age in years, months, and days from your birth date.', metaTitle: 'Age Calculator — Calculate Your Exact Age Online', metaDescription: 'Free age calculator. Calculate your exact age in years, months and days from your birth date.' },
    it: { name: 'Calcolo Età', description: 'Calcola la tua età esatta in anni, mesi e giorni dalla data di nascita.', metaTitle: 'Calcolo Età Online — Calcola la Tua Età Esatta', metaDescription: 'Calcolatore età gratuito. Calcola la tua età esatta in anni, mesi e giorni.' },
    es: { name: 'Calculadora de Edad', description: 'Calcula tu edad exacta en años, meses y días desde tu fecha de nacimiento.', metaTitle: 'Calculadora de Edad — Calcular Tu Edad Exacta Online', metaDescription: 'Calculadora de edad gratuita. Calcula tu edad exacta en años, meses y días.' },
    fr: { name: 'Calculateur d\'Âge', description: 'Calculez votre âge exact en années, mois et jours à partir de votre date de naissance.', metaTitle: 'Calculateur d\'Âge — Calculer Votre Âge Exact en Ligne', metaDescription: 'Calculateur d\'âge gratuit. Calculez votre âge exact en années, mois et jours.' },
    de: { name: 'Altersrechner', description: 'Berechnen Sie Ihr genaues Alter in Jahren, Monaten und Tagen ab Ihrem Geburtsdatum.', metaTitle: 'Altersrechner — Berechnen Sie Ihr Genaues Alter Online', metaDescription: 'Kostenloser Altersrechner. Berechnen Sie Ihr genaues Alter in Jahren, Monaten und Tagen.' },
    pt: { name: 'Calculadora de Idade', description: 'Calcule sua idade exata em anos, meses e dias a partir da sua data de nascimento.', metaTitle: 'Calculadora de Idade — Calcular Sua Idade Exata Online', metaDescription: 'Calculadora de idade gratuita. Calcule sua idade exata em anos, meses e dias.' },
  },
  'loan-calculator': {
    en: { name: 'Loan Calculator', description: 'Calculate monthly payments, total interest and amortization for any loan.', metaTitle: 'Loan Calculator — Calculate Monthly Payments Online', metaDescription: 'Free loan calculator. Calculate monthly payments, total interest and see amortization schedule.' },
    it: { name: 'Calcolo Prestito', description: 'Calcola rate mensili, interessi totali e ammortamento per qualsiasi prestito.', metaTitle: 'Calcolo Prestito Online — Calcola le Rate del Mutuo', metaDescription: 'Calcolatore prestito gratuito. Calcola rate mensili, interessi totali e piano di ammortamento.' },
    es: { name: 'Calculadora de Préstamos', description: 'Calcula pagos mensuales, interés total y amortización para cualquier préstamo.', metaTitle: 'Calculadora de Préstamos — Calcular Pagos Mensuales', metaDescription: 'Calculadora de préstamos gratuita. Calcula pagos mensuales, interés total y amortización.' },
    fr: { name: 'Calculateur de Prêt', description: 'Calculez les mensualités, les intérêts totaux et l\'amortissement pour tout prêt.', metaTitle: 'Calculateur de Prêt — Calculer les Mensualités en Ligne', metaDescription: 'Calculateur de prêt gratuit. Calculez les mensualités, intérêts et tableau d\'amortissement.' },
    de: { name: 'Kreditrechner', description: 'Berechnen Sie monatliche Raten, Gesamtzinsen und Tilgungsplan für jeden Kredit.', metaTitle: 'Kreditrechner — Monatliche Raten Online Berechnen', metaDescription: 'Kostenloser Kreditrechner. Berechnen Sie monatliche Raten, Gesamtzinsen und Tilgungsplan.' },
    pt: { name: 'Calculadora de Empréstimo', description: 'Calcule parcelas mensais, juros totais e amortização para qualquer empréstimo.', metaTitle: 'Calculadora de Empréstimo — Calcular Parcelas Online', metaDescription: 'Calculadora de empréstimo gratuita. Calcule parcelas mensais, juros totais e amortização.' },
  },
  'calorie-calculator': {
    en: { name: 'Calorie Calculator', description: 'Calculate your daily calorie needs based on age, gender, weight, height and activity level.', metaTitle: 'Calorie Calculator — Daily Calorie Needs Online', metaDescription: 'Free calorie calculator. Calculate your daily calorie needs based on BMR and activity level.' },
    it: { name: 'Calcolo Calorie', description: 'Calcola il fabbisogno calorico giornaliero in base a età, sesso, peso, altezza e attività.', metaTitle: 'Calcolo Calorie Online — Fabbisogno Calorico Giornaliero', metaDescription: 'Calcolatore calorie gratuito. Calcola il fabbisogno calorico in base al metabolismo basale.' },
    es: { name: 'Calculadora de Calorías', description: 'Calcula tus necesidades calóricas diarias según edad, género, peso, altura y actividad.', metaTitle: 'Calculadora de Calorías — Necesidades Calóricas Diarias', metaDescription: 'Calculadora de calorías gratuita. Calcula tus necesidades calóricas según tu metabolismo basal.' },
    fr: { name: 'Calculateur de Calories', description: 'Calculez vos besoins caloriques quotidiens selon l\'âge, le sexe, le poids, la taille et l\'activité.', metaTitle: 'Calculateur de Calories — Besoins Caloriques Quotidiens', metaDescription: 'Calculateur de calories gratuit. Calculez vos besoins caloriques selon votre métabolisme basal.' },
    de: { name: 'Kalorienrechner', description: 'Berechnen Sie Ihren täglichen Kalorienbedarf basierend auf Alter, Geschlecht, Gewicht, Größe und Aktivität.', metaTitle: 'Kalorienrechner — Täglicher Kalorienbedarf Online', metaDescription: 'Kostenloser Kalorienrechner. Berechnen Sie Ihren täglichen Kalorienbedarf.' },
    pt: { name: 'Calculadora de Calorias', description: 'Calcule suas necessidades calóricas diárias com base em idade, sexo, peso, altura e atividade.', metaTitle: 'Calculadora de Calorias — Necessidades Calóricas Diárias', metaDescription: 'Calculadora de calorias gratuita. Calcule suas necessidades calóricas diárias.' },
  },
  'salary-calculator': {
    en: { name: 'Salary Calculator', description: 'Calculate net salary from gross with tax bracket breakdown. See monthly and annual take-home pay.', metaTitle: 'Salary Calculator — Gross to Net Salary Online', metaDescription: 'Free salary calculator. Convert gross salary to net with detailed tax bracket breakdown.' },
    it: { name: 'Calcolo Stipendio', description: 'Calcola lo stipendio netto dal lordo con dettaglio degli scaglioni fiscali.', metaTitle: 'Calcolo Stipendio Online — Da Lordo a Netto', metaDescription: 'Calcolatore stipendio gratuito. Converti lo stipendio lordo in netto con dettaglio fiscale.' },
    es: { name: 'Calculadora de Salario', description: 'Calcula el salario neto desde el bruto con desglose de tramos fiscales.', metaTitle: 'Calculadora de Salario — De Bruto a Neto Online', metaDescription: 'Calculadora de salario gratuita. Convierte salario bruto a neto con desglose fiscal.' },
    fr: { name: 'Calculateur de Salaire', description: 'Calculez le salaire net à partir du brut avec détail des tranches fiscales.', metaTitle: 'Calculateur de Salaire — Brut vers Net en Ligne', metaDescription: 'Calculateur de salaire gratuit. Convertissez le salaire brut en net avec détail fiscal.' },
    de: { name: 'Gehaltsrechner', description: 'Berechnen Sie das Nettogehalt vom Brutto mit Steuerstufenaufschlüsselung.', metaTitle: 'Gehaltsrechner — Brutto zu Netto Online', metaDescription: 'Kostenloser Gehaltsrechner. Berechnen Sie das Nettogehalt vom Brutto mit Steuerdetails.' },
    pt: { name: 'Calculadora de Salário', description: 'Calcule o salário líquido a partir do bruto com detalhamento das faixas de imposto.', metaTitle: 'Calculadora de Salário — Bruto para Líquido Online', metaDescription: 'Calculadora de salário gratuita. Converta salário bruto em líquido com detalhes fiscais.' },
  },
  'tip-calculator': {
    en: { name: 'Tip Calculator', description: 'Calculate tip amount and split the bill between multiple people easily.', metaTitle: 'Tip Calculator — Calculate Tips & Split Bills Online', metaDescription: 'Free tip calculator. Calculate tip amount, total per person and split bills easily.' },
    it: { name: 'Calcolo Mancia', description: 'Calcola la mancia e dividi il conto tra più persone facilmente.', metaTitle: 'Calcolo Mancia Online — Calcola e Dividi il Conto', metaDescription: 'Calcolatore mancia gratuito. Calcola la mancia e dividi il conto tra più persone.' },
    es: { name: 'Calculadora de Propina', description: 'Calcula la propina y divide la cuenta entre varias personas fácilmente.', metaTitle: 'Calculadora de Propina — Calcular Propinas y Dividir Cuentas', metaDescription: 'Calculadora de propina gratuita. Calcula la propina y divide la cuenta fácilmente.' },
    fr: { name: 'Calculateur de Pourboire', description: 'Calculez le pourboire et partagez l\'addition entre plusieurs personnes facilement.', metaTitle: 'Calculateur de Pourboire — Calculer Pourboires et Partager', metaDescription: 'Calculateur de pourboire gratuit. Calculez le pourboire et partagez l\'addition facilement.' },
    de: { name: 'Trinkgeldrechner', description: 'Berechnen Sie das Trinkgeld und teilen Sie die Rechnung einfach auf mehrere Personen auf.', metaTitle: 'Trinkgeldrechner — Trinkgeld Berechnen und Rechnung Teilen', metaDescription: 'Kostenloser Trinkgeldrechner. Berechnen Sie Trinkgeld und teilen Sie die Rechnung auf.' },
    pt: { name: 'Calculadora de Gorjeta', description: 'Calcule a gorjeta e divida a conta entre várias pessoas facilmente.', metaTitle: 'Calculadora de Gorjeta — Calcular Gorjetas e Dividir Contas', metaDescription: 'Calculadora de gorjeta gratuita. Calcule a gorjeta e divida a conta facilmente.' },
  },
  'discount-calculator': {
    en: { name: 'Discount Calculator', description: 'Calculate the final price after discount and see how much you save.', metaTitle: 'Discount Calculator — Calculate Sale Prices Online', metaDescription: 'Free discount calculator. Calculate the final price after discount and your savings instantly.' },
    it: { name: 'Calcolo Sconto', description: 'Calcola il prezzo finale dopo lo sconto e scopri quanto risparmi.', metaTitle: 'Calcolo Sconto Online — Calcola Prezzi Scontati', metaDescription: 'Calcolatore sconto gratuito. Calcola il prezzo finale dopo lo sconto e il risparmio.' },
    es: { name: 'Calculadora de Descuento', description: 'Calcula el precio final después del descuento y cuánto ahorras.', metaTitle: 'Calculadora de Descuento — Calcular Precios con Descuento', metaDescription: 'Calculadora de descuento gratuita. Calcula el precio final y tu ahorro al instante.' },
    fr: { name: 'Calculateur de Remise', description: 'Calculez le prix final après remise et voyez combien vous économisez.', metaTitle: 'Calculateur de Remise — Calculer les Prix Soldés en Ligne', metaDescription: 'Calculateur de remise gratuit. Calculez le prix final après remise et vos économies.' },
    de: { name: 'Rabattrechner', description: 'Berechnen Sie den Endpreis nach Rabatt und sehen Sie Ihre Ersparnis.', metaTitle: 'Rabattrechner — Rabattierte Preise Online Berechnen', metaDescription: 'Kostenloser Rabattrechner. Berechnen Sie den Endpreis nach Rabatt und Ihre Ersparnis.' },
    pt: { name: 'Calculadora de Desconto', description: 'Calcule o preço final após o desconto e veja quanto você economiza.', metaTitle: 'Calculadora de Desconto — Calcular Preços com Desconto', metaDescription: 'Calculadora de desconto gratuita. Calcule o preço final e sua economia instantaneamente.' },
  },
  'time-zone-converter': {
    en: { name: 'Time Zone Converter', description: 'Convert time between different time zones worldwide. Quick and accurate.', metaTitle: 'Time Zone Converter — Convert Time Zones Online', metaDescription: 'Free time zone converter. Convert time between any time zones worldwide instantly.' },
    it: { name: 'Convertitore Fusi Orari', description: 'Converti l\'ora tra diversi fusi orari in tutto il mondo. Rapido e preciso.', metaTitle: 'Convertitore Fusi Orari Online — Converti Ore tra Fusi', metaDescription: 'Convertitore fusi orari gratuito. Converti l\'ora tra qualsiasi fuso orario istantaneamente.' },
    es: { name: 'Conversor de Zonas Horarias', description: 'Convierte la hora entre diferentes zonas horarias del mundo. Rápido y preciso.', metaTitle: 'Conversor de Zonas Horarias — Convertir Horas Online', metaDescription: 'Conversor de zonas horarias gratuito. Convierte la hora entre cualquier zona horaria.' },
    fr: { name: 'Convertisseur de Fuseaux Horaires', description: 'Convertissez l\'heure entre différents fuseaux horaires dans le monde. Rapide et précis.', metaTitle: 'Convertisseur de Fuseaux Horaires — Convertir l\'Heure en Ligne', metaDescription: 'Convertisseur de fuseaux horaires gratuit. Convertissez l\'heure entre tous les fuseaux.' },
    de: { name: 'Zeitzonen-Konverter', description: 'Konvertieren Sie die Uhrzeit zwischen verschiedenen Zeitzonen weltweit. Schnell und genau.', metaTitle: 'Zeitzonen-Konverter — Zeitzonen Online Umrechnen', metaDescription: 'Kostenloser Zeitzonen-Konverter. Rechnen Sie die Uhrzeit zwischen Zeitzonen sofort um.' },
    pt: { name: 'Conversor de Fuso Horário', description: 'Converta a hora entre diferentes fusos horários do mundo. Rápido e preciso.', metaTitle: 'Conversor de Fuso Horário — Converter Horas Online', metaDescription: 'Conversor de fuso horário gratuito. Converta a hora entre qualquer fuso horário.' },
  },
  'lorem-ipsum-generator': {
    en: { name: 'Lorem Ipsum Generator', description: 'Generate lorem ipsum placeholder text paragraphs for your designs and mockups.', metaTitle: 'Lorem Ipsum Generator — Generate Placeholder Text Online', metaDescription: 'Free lorem ipsum generator. Generate placeholder text paragraphs for designs and mockups.' },
    it: { name: 'Generatore Lorem Ipsum', description: 'Genera paragrafi di testo segnaposto lorem ipsum per i tuoi design e mockup.', metaTitle: 'Generatore Lorem Ipsum Online — Testo Segnaposto', metaDescription: 'Generatore lorem ipsum gratuito. Genera testo segnaposto per design e mockup.' },
    es: { name: 'Generador Lorem Ipsum', description: 'Genera párrafos de texto de relleno lorem ipsum para tus diseños y maquetas.', metaTitle: 'Generador Lorem Ipsum — Generar Texto de Relleno Online', metaDescription: 'Generador lorem ipsum gratuito. Genera texto de relleno para diseños y maquetas.' },
    fr: { name: 'Générateur Lorem Ipsum', description: 'Générez des paragraphes de texte lorem ipsum pour vos designs et maquettes.', metaTitle: 'Générateur Lorem Ipsum — Générer du Texte Fictif en Ligne', metaDescription: 'Générateur lorem ipsum gratuit. Générez du texte fictif pour designs et maquettes.' },
    de: { name: 'Lorem Ipsum Generator', description: 'Generieren Sie Lorem-Ipsum-Platzhaltertext für Ihre Designs und Mockups.', metaTitle: 'Lorem Ipsum Generator — Platzhaltertext Online Generieren', metaDescription: 'Kostenloser Lorem Ipsum Generator. Generieren Sie Platzhaltertext für Designs und Mockups.' },
    pt: { name: 'Gerador Lorem Ipsum', description: 'Gere parágrafos de texto lorem ipsum para seus designs e mockups.', metaTitle: 'Gerador Lorem Ipsum — Gerar Texto de Preenchimento Online', metaDescription: 'Gerador lorem ipsum gratuito. Gere texto de preenchimento para designs e mockups.' },
  },
  'qr-code-generator': {
    en: { name: 'QR Code Generator', description: 'Generate QR codes from text or URLs. Download as PNG image.', metaTitle: 'QR Code Generator — Create QR Codes Online Free', metaDescription: 'Free QR code generator. Create QR codes from text or URLs and download as PNG.' },
    it: { name: 'Generatore QR Code', description: 'Genera codici QR da testo o URL. Scarica come immagine PNG.', metaTitle: 'Generatore QR Code Online — Crea Codici QR Gratis', metaDescription: 'Generatore QR code gratuito. Crea codici QR da testo o URL e scarica come PNG.' },
    es: { name: 'Generador de Código QR', description: 'Genera códigos QR desde texto o URLs. Descarga como imagen PNG.', metaTitle: 'Generador de Código QR — Crear Códigos QR Online Gratis', metaDescription: 'Generador de código QR gratuito. Crea códigos QR desde texto o URLs y descarga como PNG.' },
    fr: { name: 'Générateur de Code QR', description: 'Générez des codes QR à partir de texte ou d\'URLs. Téléchargez en PNG.', metaTitle: 'Générateur de Code QR — Créer des Codes QR en Ligne', metaDescription: 'Générateur de code QR gratuit. Créez des codes QR et téléchargez en PNG.' },
    de: { name: 'QR-Code-Generator', description: 'Generieren Sie QR-Codes aus Text oder URLs. Als PNG-Bild herunterladen.', metaTitle: 'QR-Code-Generator — QR-Codes Online Erstellen', metaDescription: 'Kostenloser QR-Code-Generator. Erstellen Sie QR-Codes aus Text oder URLs.' },
    pt: { name: 'Gerador de QR Code', description: 'Gere códigos QR a partir de texto ou URLs. Baixe como imagem PNG.', metaTitle: 'Gerador de QR Code — Criar Códigos QR Online Grátis', metaDescription: 'Gerador de QR code gratuito. Crie códigos QR a partir de texto ou URLs.' },
  },
  'text-case-converter': {
    en: { name: 'Text Case Converter', description: 'Convert text between uppercase, lowercase, title case, camelCase, kebab-case and more.', metaTitle: 'Text Case Converter — Change Text Case Online', metaDescription: 'Free text case converter. Convert text to uppercase, lowercase, title case, camelCase and more.' },
    it: { name: 'Convertitore Maiuscole/Minuscole', description: 'Converti testo tra maiuscolo, minuscolo, title case, camelCase, kebab-case e altro.', metaTitle: 'Convertitore Maiuscole/Minuscole — Cambia Caso del Testo', metaDescription: 'Convertitore gratuito. Converti testo in maiuscolo, minuscolo, title case e altro.' },
    es: { name: 'Conversor de Mayúsculas', description: 'Convierte texto entre mayúsculas, minúsculas, title case, camelCase, kebab-case y más.', metaTitle: 'Conversor de Mayúsculas — Cambiar Caso del Texto Online', metaDescription: 'Conversor gratuito. Convierte texto a mayúsculas, minúsculas, title case y más.' },
    fr: { name: 'Convertisseur de Casse', description: 'Convertissez le texte entre majuscules, minuscules, title case, camelCase, kebab-case et plus.', metaTitle: 'Convertisseur de Casse — Changer la Casse du Texte en Ligne', metaDescription: 'Convertisseur de casse gratuit. Convertissez en majuscules, minuscules, title case et plus.' },
    de: { name: 'Groß-/Kleinschreibung', description: 'Text zwischen Großbuchstaben, Kleinbuchstaben, Title Case, camelCase, kebab-case und mehr konvertieren.', metaTitle: 'Groß-/Kleinschreibung — Textschreibweise Online Ändern', metaDescription: 'Kostenloser Konverter. Konvertieren Sie Text in Großbuchstaben, Kleinbuchstaben und mehr.' },
    pt: { name: 'Conversor de Maiúsculas', description: 'Converta texto entre maiúsculas, minúsculas, title case, camelCase, kebab-case e mais.', metaTitle: 'Conversor de Maiúsculas — Mudar Caixa do Texto Online', metaDescription: 'Conversor gratuito. Converta texto em maiúsculas, minúsculas, title case e mais.' },
  },
  'character-counter': {
    en: { name: 'Character Counter', description: 'Detailed character analysis: vowels, consonants, digits, spaces, special characters and more.', metaTitle: 'Character Counter — Detailed Text Analysis Online', metaDescription: 'Free character counter. Analyze text with vowels, consonants, digits, spaces and frequency.' },
    it: { name: 'Contatore Caratteri', description: 'Analisi dettagliata: vocali, consonanti, cifre, spazi, caratteri speciali e altro.', metaTitle: 'Contatore Caratteri Online — Analisi Dettagliata del Testo', metaDescription: 'Contatore caratteri gratuito. Analizza vocali, consonanti, cifre, spazi e frequenza.' },
    es: { name: 'Contador de Caracteres', description: 'Análisis detallado: vocales, consonantes, dígitos, espacios, caracteres especiales y más.', metaTitle: 'Contador de Caracteres — Análisis de Texto Detallado Online', metaDescription: 'Contador de caracteres gratuito. Analiza vocales, consonantes, dígitos, espacios y frecuencia.' },
    fr: { name: 'Compteur de Caractères', description: 'Analyse détaillée : voyelles, consonnes, chiffres, espaces, caractères spéciaux et plus.', metaTitle: 'Compteur de Caractères — Analyse de Texte Détaillée en Ligne', metaDescription: 'Compteur de caractères gratuit. Analysez voyelles, consonnes, chiffres, espaces et fréquence.' },
    de: { name: 'Zeichenzähler', description: 'Detaillierte Zeichenanalyse: Vokale, Konsonanten, Ziffern, Leerzeichen, Sonderzeichen und mehr.', metaTitle: 'Zeichenzähler — Detaillierte Textanalyse Online', metaDescription: 'Kostenloser Zeichenzähler. Analysieren Sie Vokale, Konsonanten, Ziffern und Häufigkeit.' },
    pt: { name: 'Contador de Caracteres', description: 'Análise detalhada: vogais, consoantes, dígitos, espaços, caracteres especiais e mais.', metaTitle: 'Contador de Caracteres — Análise de Texto Detalhada Online', metaDescription: 'Contador de caracteres gratuito. Analise vogais, consoantes, dígitos, espaços e frequência.' },
  },
  'speed-calculator': {
    en: { name: 'Speed Calculator', description: 'Calculate speed, distance or time from any two values. Simple and quick.', metaTitle: 'Speed Calculator — Calculate Speed, Distance, Time Online', metaDescription: 'Free speed calculator. Calculate speed, distance or time from any two values.' },
    it: { name: 'Calcolo Velocità', description: 'Calcola velocità, distanza o tempo da due valori qualsiasi. Semplice e veloce.', metaTitle: 'Calcolo Velocità Online — Calcola Velocità, Distanza, Tempo', metaDescription: 'Calcolatore velocità gratuito. Calcola velocità, distanza o tempo da due valori.' },
    es: { name: 'Calculadora de Velocidad', description: 'Calcula velocidad, distancia o tiempo a partir de dos valores. Simple y rápido.', metaTitle: 'Calculadora de Velocidad — Calcular Velocidad, Distancia, Tiempo', metaDescription: 'Calculadora de velocidad gratuita. Calcula velocidad, distancia o tiempo.' },
    fr: { name: 'Calculateur de Vitesse', description: 'Calculez la vitesse, la distance ou le temps à partir de deux valeurs. Simple et rapide.', metaTitle: 'Calculateur de Vitesse — Calculer Vitesse, Distance, Temps', metaDescription: 'Calculateur de vitesse gratuit. Calculez vitesse, distance ou temps.' },
    de: { name: 'Geschwindigkeitsrechner', description: 'Berechnen Sie Geschwindigkeit, Entfernung oder Zeit aus zwei beliebigen Werten.', metaTitle: 'Geschwindigkeitsrechner — Geschwindigkeit, Entfernung, Zeit Berechnen', metaDescription: 'Kostenloser Geschwindigkeitsrechner. Berechnen Sie Geschwindigkeit, Entfernung oder Zeit.' },
    pt: { name: 'Calculadora de Velocidade', description: 'Calcule velocidade, distância ou tempo a partir de dois valores. Simples e rápido.', metaTitle: 'Calculadora de Velocidade — Calcular Velocidade, Distância, Tempo', metaDescription: 'Calculadora de velocidade gratuita. Calcule velocidade, distância ou tempo.' },
  },
  'date-calculator': {
    en: { name: 'Date Calculator', description: 'Calculate days between two dates or add/subtract days from a date.', metaTitle: 'Date Calculator — Days Between Dates Online', metaDescription: 'Free date calculator. Calculate days between dates or add and subtract days from any date.' },
    it: { name: 'Calcolo Date', description: 'Calcola i giorni tra due date o aggiungi/sottrai giorni da una data.', metaTitle: 'Calcolo Date Online — Giorni tra Due Date', metaDescription: 'Calcolatore date gratuito. Calcola i giorni tra due date o aggiungi/sottrai giorni.' },
    es: { name: 'Calculadora de Fechas', description: 'Calcula los días entre dos fechas o suma/resta días a una fecha.', metaTitle: 'Calculadora de Fechas — Días entre Fechas Online', metaDescription: 'Calculadora de fechas gratuita. Calcula días entre fechas o suma/resta días.' },
    fr: { name: 'Calculateur de Dates', description: 'Calculez les jours entre deux dates ou ajoutez/soustrayez des jours à une date.', metaTitle: 'Calculateur de Dates — Jours entre Dates en Ligne', metaDescription: 'Calculateur de dates gratuit. Calculez les jours entre deux dates ou ajoutez/soustrayez des jours.' },
    de: { name: 'Datumsrechner', description: 'Berechnen Sie Tage zwischen zwei Daten oder addieren/subtrahieren Sie Tage.', metaTitle: 'Datumsrechner — Tage zwischen Daten Online Berechnen', metaDescription: 'Kostenloser Datumsrechner. Berechnen Sie Tage zwischen Daten oder addieren/subtrahieren Sie Tage.' },
    pt: { name: 'Calculadora de Datas', description: 'Calcule os dias entre duas datas ou adicione/subtraia dias de uma data.', metaTitle: 'Calculadora de Datas — Dias entre Datas Online', metaDescription: 'Calculadora de datas gratuita. Calcule dias entre datas ou adicione/subtraia dias.' },
  },
  'electricity-calculator': {
    en: { name: 'Electricity Calculator', description: 'Calculate electricity cost based on power consumption, usage time and rate.', metaTitle: 'Electricity Cost Calculator — Calculate Power Cost Online', metaDescription: 'Free electricity calculator. Calculate electricity cost from watts, hours and electricity rate.' },
    it: { name: 'Calcolo Costo Elettricità', description: 'Calcola il costo dell\'elettricità in base al consumo, tempo di utilizzo e tariffa.', metaTitle: 'Calcolo Costo Elettricità Online — Calcola Consumo Elettrico', metaDescription: 'Calcolatore elettricità gratuito. Calcola il costo elettrico da watt, ore e tariffa.' },
    es: { name: 'Calculadora de Electricidad', description: 'Calcula el costo de electricidad según consumo, tiempo de uso y tarifa.', metaTitle: 'Calculadora de Costo de Electricidad — Calcular Consumo Online', metaDescription: 'Calculadora de electricidad gratuita. Calcula el costo eléctrico desde vatios, horas y tarifa.' },
    fr: { name: 'Calculateur d\'Électricité', description: 'Calculez le coût de l\'électricité selon la consommation, le temps d\'utilisation et le tarif.', metaTitle: 'Calculateur de Coût d\'Électricité — Calculer la Consommation', metaDescription: 'Calculateur d\'électricité gratuit. Calculez le coût électrique à partir des watts, heures et tarif.' },
    de: { name: 'Stromkostenrechner', description: 'Berechnen Sie Stromkosten basierend auf Verbrauch, Nutzungszeit und Tarif.', metaTitle: 'Stromkostenrechner — Stromkosten Online Berechnen', metaDescription: 'Kostenloser Stromkostenrechner. Berechnen Sie Stromkosten aus Watt, Stunden und Tarif.' },
    pt: { name: 'Calculadora de Eletricidade', description: 'Calcule o custo de eletricidade com base no consumo, tempo de uso e tarifa.', metaTitle: 'Calculadora de Custo de Eletricidade — Calcular Consumo Online', metaDescription: 'Calculadora de eletricidade gratuita. Calcule o custo elétrico a partir de watts, horas e tarifa.' },
  },
  'screen-resolution': {
    en: { name: 'Screen Resolution', description: 'Display your screen resolution, viewport size, pixel ratio, orientation and more.', metaTitle: 'Screen Resolution Checker — Check Your Screen Info Online', metaDescription: 'Free screen resolution tool. Check your screen resolution, viewport size, pixel ratio and more.' },
    it: { name: 'Risoluzione Schermo', description: 'Visualizza risoluzione, dimensioni viewport, rapporto pixel, orientamento e altro.', metaTitle: 'Risoluzione Schermo — Controlla le Info del Tuo Schermo', metaDescription: 'Strumento gratuito. Controlla risoluzione, viewport, rapporto pixel e altro.' },
    es: { name: 'Resolución de Pantalla', description: 'Muestra tu resolución de pantalla, viewport, proporción de píxeles, orientación y más.', metaTitle: 'Resolución de Pantalla — Verifica Tu Pantalla Online', metaDescription: 'Herramienta gratuita. Verifica resolución de pantalla, viewport, píxeles y más.' },
    fr: { name: 'Résolution d\'Écran', description: 'Affichez votre résolution d\'écran, taille du viewport, ratio de pixels, orientation et plus.', metaTitle: 'Résolution d\'Écran — Vérifier les Infos de Votre Écran', metaDescription: 'Outil gratuit. Vérifiez résolution d\'écran, viewport, ratio de pixels et plus.' },
    de: { name: 'Bildschirmauflösung', description: 'Zeigen Sie Ihre Bildschirmauflösung, Viewport-Größe, Pixel-Verhältnis, Ausrichtung und mehr an.', metaTitle: 'Bildschirmauflösung — Bildschirminfos Online Prüfen', metaDescription: 'Kostenloses Tool. Prüfen Sie Bildschirmauflösung, Viewport, Pixel-Verhältnis und mehr.' },
    pt: { name: 'Resolução da Tela', description: 'Exiba sua resolução de tela, tamanho do viewport, proporção de pixels, orientação e mais.', metaTitle: 'Resolução da Tela — Verificar Informações da Tela Online', metaDescription: 'Ferramenta gratuita. Verifique resolução da tela, viewport, proporção de pixels e mais.' },
  },
  'random-number-generator': {
    en: { name: 'Random Number Generator', description: 'Generate random numbers with min, max, quantity options and no-duplicate mode.', metaTitle: 'Random Number Generator — Generate Random Numbers Online', metaDescription: 'Free random number generator. Generate random numbers with custom range and quantity.' },
    it: { name: 'Generatore Numeri Casuali', description: 'Genera numeri casuali con opzioni minimo, massimo, quantità e modalità senza duplicati.', metaTitle: 'Generatore Numeri Casuali — Genera Numeri Random Online', metaDescription: 'Generatore numeri casuali gratuito. Genera numeri con intervallo e quantità personalizzati.' },
    es: { name: 'Generador de Números Aleatorios', description: 'Genera números aleatorios con opciones de mínimo, máximo, cantidad y sin duplicados.', metaTitle: 'Generador de Números Aleatorios — Generar Números Random', metaDescription: 'Generador de números aleatorios gratuito. Genera números con rango y cantidad personalizados.' },
    fr: { name: 'Générateur de Nombres Aléatoires', description: 'Générez des nombres aléatoires avec options min, max, quantité et sans doublons.', metaTitle: 'Générateur de Nombres Aléatoires — Générer des Nombres en Ligne', metaDescription: 'Générateur de nombres aléatoires gratuit. Générez des nombres avec plage et quantité.' },
    de: { name: 'Zufallszahlengenerator', description: 'Generieren Sie Zufallszahlen mit Min, Max, Anzahl und ohne-Duplikate-Modus.', metaTitle: 'Zufallszahlengenerator — Zufallszahlen Online Generieren', metaDescription: 'Kostenloser Zufallszahlengenerator. Generieren Sie Zufallszahlen mit individuellem Bereich.' },
    pt: { name: 'Gerador de Números Aleatórios', description: 'Gere números aleatórios com opções de mínimo, máximo, quantidade e sem duplicatas.', metaTitle: 'Gerador de Números Aleatórios — Gerar Números Random Online', metaDescription: 'Gerador de números aleatórios gratuito. Gere números com intervalo e quantidade personalizados.' },
  },
};

export const toolList = Object.keys(tools);

export function getToolsByCategory(): Record<string, string[]> {
  return {
    finance: ['vat-calculator', 'percentage-calculator', 'loan-calculator', 'salary-calculator', 'tip-calculator', 'discount-calculator', 'electricity-calculator'],
    text: ['word-counter', 'lorem-ipsum-generator', 'text-case-converter', 'character-counter'],
    health: ['bmi-calculator', 'calorie-calculator'],
    conversion: ['unit-converter', 'base64-converter', 'time-zone-converter'],
    dev: ['json-formatter', 'color-picker', 'password-generator', 'qr-code-generator', 'screen-resolution'],
    math: ['age-calculator', 'speed-calculator', 'date-calculator', 'random-number-generator'],
  };
}
