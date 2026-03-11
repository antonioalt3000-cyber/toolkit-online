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
};

export const toolList = Object.keys(tools);

export function getToolsByCategory(): Record<string, string[]> {
  return {
    finance: ['vat-calculator', 'percentage-calculator'],
    text: ['word-counter'],
    health: ['bmi-calculator'],
    conversion: ['unit-converter', 'base64-converter'],
    dev: ['json-formatter', 'color-picker', 'password-generator'],
    math: ['age-calculator'],
  };
}
