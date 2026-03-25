'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { common, tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface CountryRate {
  rate: number;
  reduced: number;
  superReduced?: number;
  name: string;
  currency: string;
}

const countryRates: Record<string, CountryRate> = {
  spain: { rate: 21, reduced: 10, superReduced: 4, name: 'Spain', currency: 'EUR' },
  germany: { rate: 19, reduced: 7, name: 'Germany', currency: 'EUR' },
  france: { rate: 20, reduced: 10, superReduced: 5.5, name: 'France', currency: 'EUR' },
  italy: { rate: 22, reduced: 10, superReduced: 4, name: 'Italy', currency: 'EUR' },
  uk: { rate: 20, reduced: 5, name: 'United Kingdom', currency: 'GBP' },
  netherlands: { rate: 21, reduced: 9, name: 'Netherlands', currency: 'EUR' },
  belgium: { rate: 21, reduced: 12, superReduced: 6, name: 'Belgium', currency: 'EUR' },
  portugal: { rate: 23, reduced: 13, superReduced: 6, name: 'Portugal', currency: 'EUR' },
  austria: { rate: 20, reduced: 10, superReduced: 13, name: 'Austria', currency: 'EUR' },
  sweden: { rate: 25, reduced: 12, superReduced: 6, name: 'Sweden', currency: 'SEK' },
};

const countryNames: Record<string, Record<string, string>> = {
  spain: { en: 'Spain', it: 'Spagna', es: 'España', fr: 'Espagne', de: 'Spanien', pt: 'Espanha' },
  germany: { en: 'Germany', it: 'Germania', es: 'Alemania', fr: 'Allemagne', de: 'Deutschland', pt: 'Alemanha' },
  france: { en: 'France', it: 'Francia', es: 'Francia', fr: 'France', de: 'Frankreich', pt: 'França' },
  italy: { en: 'Italy', it: 'Italia', es: 'Italia', fr: 'Italie', de: 'Italien', pt: 'Itália' },
  uk: { en: 'United Kingdom', it: 'Regno Unito', es: 'Reino Unido', fr: 'Royaume-Uni', de: 'Vereinigtes Königreich', pt: 'Reino Unido' },
  netherlands: { en: 'Netherlands', it: 'Paesi Bassi', es: 'Países Bajos', fr: 'Pays-Bas', de: 'Niederlande', pt: 'Países Baixos' },
  belgium: { en: 'Belgium', it: 'Belgio', es: 'Bélgica', fr: 'Belgique', de: 'Belgien', pt: 'Bélgica' },
  portugal: { en: 'Portugal', it: 'Portogallo', es: 'Portugal', fr: 'Portugal', de: 'Portugal', pt: 'Portugal' },
  austria: { en: 'Austria', it: 'Austria', es: 'Austria', fr: 'Autriche', de: 'Österreich', pt: 'Áustria' },
  sweden: { en: 'Sweden', it: 'Svezia', es: 'Suecia', fr: 'Suède', de: 'Schweden', pt: 'Suécia' },
};

const vatLabels: Record<string, Record<string, string>> = {
  addVat: { en: 'Add VAT', it: 'Aggiungi IVA', es: 'Añadir IVA', fr: 'Ajouter TVA', de: 'MwSt hinzufügen', pt: 'Adicionar IVA' },
  removeVat: { en: 'Remove VAT', it: 'Scorporo IVA', es: 'Quitar IVA', fr: 'Retirer TVA', de: 'MwSt entfernen', pt: 'Remover IVA' },
  amount: { en: 'Amount', it: 'Importo', es: 'Cantidad', fr: 'Montant', de: 'Betrag', pt: 'Valor' },
  vatRate: { en: 'VAT Rate', it: 'Aliquota IVA', es: 'Tipo de IVA', fr: 'Taux TVA', de: 'MwSt-Satz', pt: 'Taxa IVA' },
  netAmount: { en: 'Net amount', it: 'Importo netto', es: 'Importe neto', fr: 'Montant HT', de: 'Nettobetrag', pt: 'Valor líquido' },
  grossAmount: { en: 'Amount with VAT', it: 'Importo con IVA', es: 'Importe con IVA', fr: 'Montant TTC', de: 'Bruttobetrag', pt: 'Valor com IVA' },
  vat: { en: 'VAT', it: 'IVA', es: 'IVA', fr: 'TVA', de: 'MwSt', pt: 'IVA' },
  totalWithVat: { en: 'Total with VAT', it: 'Totale con IVA', es: 'Total con IVA', fr: 'Total TTC', de: 'Gesamt mit MwSt', pt: 'Total com IVA' },
  reset: { en: 'Reset', it: 'Reset', es: 'Reiniciar', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Reiniciar' },
  copied: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
  invalidAmount: { en: 'Enter a valid amount', it: 'Inserisci un importo valido', es: 'Ingresa un monto válido', fr: 'Entrez un montant valide', de: 'Geben Sie einen gültigen Betrag ein', pt: 'Insira um valor válido' },
  standardRate: { en: 'Standard rate', it: 'Aliquota ordinaria', es: 'Tipo general', fr: 'Taux normal', de: 'Regelsteuersatz', pt: 'Taxa normal' },
  reducedRate: { en: 'Reduced rate', it: 'Aliquota ridotta', es: 'Tipo reducido', fr: 'Taux réduit', de: 'Ermäßigter Satz', pt: 'Taxa reduzida' },
  superReducedRate: { en: 'Super-reduced rate', it: 'Aliquota super-ridotta', es: 'Tipo superreducido', fr: 'Taux super-réduit', de: 'Stark ermäßigter Satz', pt: 'Taxa super-reduzida' },
  otherCountries: { en: 'VAT Calculator for Other Countries', it: 'Calcolatore IVA per Altri Paesi', es: 'Calculadora de IVA para Otros Países', fr: 'Calculateur TVA pour Autres Pays', de: 'MwSt-Rechner für Andere Länder', pt: 'Calculadora de IVA para Outros Países' },
  backToMain: { en: 'Back to VAT Calculator', it: 'Torna al Calcolatore IVA', es: 'Volver a Calculadora de IVA', fr: 'Retour au Calculateur TVA', de: 'Zurück zum MwSt-Rechner', pt: 'Voltar à Calculadora de IVA' },
};

const vatTermByLang: Record<string, string> = {
  en: 'VAT', it: 'IVA', es: 'IVA', fr: 'TVA', de: 'MwSt', pt: 'IVA',
};

const seoContent: Record<string, Record<string, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }>> = {
  spain: {
    en: {
      title: 'VAT in Spain: Rates, Rules & How to Calculate IVA',
      paragraphs: [
        'Spain applies three Value Added Tax (IVA) rates. The standard rate is 21%, applicable to most goods and services including electronics, clothing, and professional services. The reduced rate of 10% covers food products, water supply, hotel accommodation, restaurant services, and passenger transport. The super-reduced rate of 4% applies to essential goods such as bread, milk, eggs, fruit, vegetables, books, newspapers, medicines, and wheelchairs.',
        'Spanish VAT is administered by the Agencia Tributaria (AEAT). Businesses must register for IVA if their annual turnover exceeds thresholds set by law, though in practice most B2B and B2C transactions require VAT registration from the first sale. VAT returns (Modelo 303) are filed quarterly, and an annual summary (Modelo 390) is required. The Canary Islands, Ceuta, and Melilla have their own indirect tax systems (IGIC and IPSI) and are excluded from the mainland IVA regime.',
        'For cross-border transactions within the EU, Spain follows the One Stop Shop (OSS) system. Businesses selling to consumers in other EU countries can register for OSS to simplify VAT compliance. Intra-community supplies of goods between VAT-registered businesses are generally zero-rated, provided the goods physically leave Spain. Use our calculator to instantly compute IVA on any amount using Spain\'s official rates. For invoice preparation, pair this tool with our <a href="/en/tools/invoice-calculator">invoice calculator</a> or check general percentages with our <a href="/en/tools/percentage-calculator">percentage calculator</a>.',
      ],
      faq: [
        { q: 'What is the standard VAT rate in Spain?', a: 'The standard IVA rate in Spain is 21%, applied to most goods and services. There is also a reduced rate of 10% and a super-reduced rate of 4% for essential items.' },
        { q: 'Which goods have 4% IVA in Spain?', a: 'The 4% super-reduced rate applies to bread, milk, eggs, fruit, vegetables, cereals, cheese, books, newspapers, magazines, prescription medicines, wheelchairs, and prosthetics.' },
        { q: 'Do the Canary Islands use Spanish VAT?', a: 'No. The Canary Islands use IGIC (Impuesto General Indirecto Canario) with a general rate of 7%, not the mainland IVA system. Ceuta and Melilla use IPSI instead.' },
        { q: 'How often must I file VAT returns in Spain?', a: 'Most businesses file quarterly VAT returns (Modelo 303) by the 20th of the month following the quarter. Large companies with turnover above 6 million euros must file monthly.' },
      ],
    },
    it: {
      title: 'IVA in Spagna: Aliquote, Regole e Come Calcolare',
      paragraphs: [
        'La Spagna applica tre aliquote IVA. L\'aliquota ordinaria e del 21%, applicabile alla maggior parte di beni e servizi. L\'aliquota ridotta del 10% copre prodotti alimentari, servizi alberghieri, ristorazione e trasporto passeggeri. L\'aliquota super-ridotta del 4% si applica a beni essenziali come pane, latte, uova, frutta, verdura, libri e medicinali.',
        'L\'IVA spagnola e amministrata dall\'Agencia Tributaria (AEAT). Le dichiarazioni IVA (Modelo 303) vengono presentate trimestralmente. Le Isole Canarie, Ceuta e Melilla hanno sistemi fiscali indiretti propri (IGIC e IPSI) e sono escluse dal regime IVA della penisola.',
        'Usa il nostro calcolatore per calcolare istantaneamente l\'IVA spagnola su qualsiasi importo. Per la preparazione delle fatture, abbina questo strumento al nostro <a href="/it/tools/invoice-calculator">calcolatore fatture</a> o controlla le percentuali generali con la nostra <a href="/it/tools/percentage-calculator">calcolatrice percentuali</a>.',
      ],
      faq: [
        { q: 'Qual e l\'aliquota IVA standard in Spagna?', a: 'L\'aliquota IVA standard in Spagna e del 21%. Esistono anche un\'aliquota ridotta del 10% e una super-ridotta del 4%.' },
        { q: 'Quali beni hanno il 4% di IVA in Spagna?', a: 'Il 4% si applica a pane, latte, uova, frutta, verdura, libri, giornali, medicinali su prescrizione e sedie a rotelle.' },
        { q: 'Le Isole Canarie usano l\'IVA spagnola?', a: 'No. Le Isole Canarie usano l\'IGIC con aliquota generale del 7%, non il sistema IVA della penisola.' },
        { q: 'Ogni quanto si presenta la dichiarazione IVA in Spagna?', a: 'La maggior parte delle imprese presenta dichiarazioni trimestrali (Modelo 303). Le grandi aziende con fatturato superiore a 6 milioni devono presentare mensilmente.' },
      ],
    },
    es: {
      title: 'IVA en España: Tipos, Normas y Como Calcularlo',
      paragraphs: [
        'España aplica tres tipos de IVA. El tipo general es del 21%, aplicable a la mayoria de bienes y servicios. El tipo reducido del 10% cubre productos alimentarios, alojamiento hotelero, restauracion y transporte de pasajeros. El tipo superreducido del 4% se aplica a bienes esenciales como pan, leche, huevos, frutas, verduras, libros y medicamentos.',
        'El IVA español es gestionado por la Agencia Tributaria (AEAT). Las declaraciones de IVA (Modelo 303) se presentan trimestralmente y un resumen anual (Modelo 390) es obligatorio. Las Islas Canarias, Ceuta y Melilla tienen sus propios sistemas impositivos indirectos (IGIC e IPSI) y estan excluidos del regimen de IVA peninsular.',
        'Utiliza nuestra calculadora para calcular al instante el IVA sobre cualquier importe con los tipos oficiales de España. Para preparar facturas, combina esta herramienta con nuestra <a href="/es/tools/invoice-calculator">calculadora de facturas</a> o consulta porcentajes generales con nuestra <a href="/es/tools/percentage-calculator">calculadora de porcentaje</a>.',
      ],
      faq: [
        { q: 'Cual es el tipo de IVA general en España?', a: 'El tipo general de IVA en España es del 21%. Tambien existe un tipo reducido del 10% y un tipo superreducido del 4%.' },
        { q: 'Que productos tienen el 4% de IVA?', a: 'El 4% se aplica a pan, leche, huevos, frutas, verduras, cereales, queso, libros, periodicos, medicamentos con receta y sillas de ruedas.' },
        { q: 'Las Islas Canarias usan el IVA español?', a: 'No. Las Islas Canarias usan el IGIC con un tipo general del 7%, no el sistema de IVA peninsular.' },
        { q: 'Cada cuanto se presenta la declaracion de IVA?', a: 'La mayoria de empresas presentan declaraciones trimestrales (Modelo 303). Las grandes empresas con facturacion superior a 6 millones deben presentar mensualmente.' },
      ],
    },
    fr: {
      title: 'TVA en Espagne: Taux, Regles et Comment Calculer',
      paragraphs: [
        'L\'Espagne applique trois taux de TVA (IVA). Le taux normal est de 21%, applicable a la plupart des biens et services. Le taux reduit de 10% couvre les produits alimentaires, l\'hebergement hotelier, la restauration et le transport de passagers. Le taux super-reduit de 4% s\'applique aux biens essentiels comme le pain, le lait, les oeufs, les fruits, les legumes, les livres et les medicaments.',
        'La TVA espagnole est administree par l\'Agencia Tributaria (AEAT). Les declarations sont trimestrielles (Modelo 303). Les iles Canaries, Ceuta et Melilla ont leurs propres systemes fiscaux indirects.',
        'Utilisez notre calculateur pour calculer instantanement la TVA espagnole. Combinez avec notre <a href="/fr/tools/invoice-calculator">calculateur de factures</a> ou notre <a href="/fr/tools/percentage-calculator">calculateur de pourcentage</a>.',
      ],
      faq: [
        { q: 'Quel est le taux de TVA standard en Espagne?', a: 'Le taux normal de TVA en Espagne est de 21%. Il existe aussi un taux reduit de 10% et un taux super-reduit de 4%.' },
        { q: 'Quels produits ont 4% de TVA en Espagne?', a: 'Le 4% s\'applique au pain, lait, oeufs, fruits, legumes, livres, journaux et medicaments sur ordonnance.' },
        { q: 'Les Canaries utilisent-elles la TVA espagnole?', a: 'Non. Les iles Canaries utilisent l\'IGIC avec un taux general de 7%.' },
        { q: 'A quelle frequence declare-t-on la TVA en Espagne?', a: 'La plupart des entreprises declarent trimestriellement (Modelo 303). Les grandes entreprises declarent mensuellement.' },
      ],
    },
    de: {
      title: 'MwSt in Spanien: Saetze, Regeln und Berechnung',
      paragraphs: [
        'Spanien wendet drei MwSt-Saetze (IVA) an. Der Regelsatz betraegt 21% fuer die meisten Waren und Dienstleistungen. Der ermaessigte Satz von 10% gilt fuer Lebensmittel, Hotelunterkuenfte, Gastronomie und Personentransport. Der stark ermaessigte Satz von 4% gilt fuer Grundbedarfgueter wie Brot, Milch, Eier, Obst, Gemuese, Buecher und Medikamente.',
        'Die spanische MwSt wird von der Agencia Tributaria (AEAT) verwaltet. MwSt-Erklaerungen (Modelo 303) werden vierteljaehrlich eingereicht. Die Kanarischen Inseln, Ceuta und Melilla haben eigene indirekte Steuersysteme.',
        'Verwenden Sie unseren Rechner, um die spanische MwSt sofort zu berechnen. Kombinieren Sie ihn mit unserem <a href="/de/tools/invoice-calculator">Rechnungsrechner</a> oder unserem <a href="/de/tools/percentage-calculator">Prozentrechner</a>.',
      ],
      faq: [
        { q: 'Wie hoch ist der MwSt-Regelsatz in Spanien?', a: 'Der MwSt-Regelsatz in Spanien betraegt 21%. Es gibt auch einen ermaessigten Satz von 10% und einen stark ermaessigten Satz von 4%.' },
        { q: 'Welche Gueter haben 4% MwSt in Spanien?', a: 'Der 4%-Satz gilt fuer Brot, Milch, Eier, Obst, Gemuese, Buecher, Zeitungen und verschreibungspflichtige Medikamente.' },
        { q: 'Verwenden die Kanarischen Inseln die spanische MwSt?', a: 'Nein. Die Kanarischen Inseln verwenden die IGIC mit einem allgemeinen Satz von 7%.' },
        { q: 'Wie oft muss man in Spanien MwSt-Erklaerungen abgeben?', a: 'Die meisten Unternehmen geben vierteljaehrlich ab (Modelo 303). Grossunternehmen muessen monatlich abgeben.' },
      ],
    },
    pt: {
      title: 'IVA em Espanha: Taxas, Regras e Como Calcular',
      paragraphs: [
        'A Espanha aplica tres taxas de IVA. A taxa normal e de 21%, aplicavel a maioria dos bens e servicos. A taxa reduzida de 10% cobre produtos alimentares, alojamento hoteleiro, restauracao e transporte de passageiros. A taxa super-reduzida de 4% aplica-se a bens essenciais como pao, leite, ovos, frutas, legumes, livros e medicamentos.',
        'O IVA espanhol e administrado pela Agencia Tributaria (AEAT). As declaracoes de IVA (Modelo 303) sao apresentadas trimestralmente. As Ilhas Canarias, Ceuta e Melilla tem sistemas fiscais indiretos proprios.',
        'Use a nossa calculadora para calcular instantaneamente o IVA espanhol. Combine com a nossa <a href="/pt/tools/invoice-calculator">calculadora de faturas</a> ou a nossa <a href="/pt/tools/percentage-calculator">calculadora de percentagem</a>.',
      ],
      faq: [
        { q: 'Qual e a taxa de IVA normal em Espanha?', a: 'A taxa normal de IVA em Espanha e de 21%. Existem tambem uma taxa reduzida de 10% e uma super-reduzida de 4%.' },
        { q: 'Que produtos tem 4% de IVA em Espanha?', a: 'Os 4% aplicam-se a pao, leite, ovos, frutas, legumes, livros, jornais e medicamentos com receita.' },
        { q: 'As Ilhas Canarias usam o IVA espanhol?', a: 'Nao. As Ilhas Canarias usam o IGIC com uma taxa geral de 7%.' },
        { q: 'Com que frequencia se declara o IVA em Espanha?', a: 'A maioria das empresas declara trimestralmente (Modelo 303). Grandes empresas declaram mensalmente.' },
      ],
    },
  },
  germany: {
    en: {
      title: 'VAT in Germany: Rates, Rules & How to Calculate Mehrwertsteuer',
      paragraphs: [
        'Germany applies two VAT (Mehrwertsteuer/MwSt) rates. The standard rate is 19%, covering most goods and services. The reduced rate of 7% applies to food, books, newspapers, public transport, hotel accommodation, and cultural events. Germany temporarily reduced its standard rate to 16% and reduced rate to 5% from July to December 2020 as a COVID-19 stimulus measure, but rates have since returned to normal.',
        'The German Federal Central Tax Office (BZSt) oversees VAT administration. Businesses must register for VAT if their annual revenue exceeds 22,000 euros (Kleinunternehmerregelung threshold). VAT returns are filed monthly or quarterly depending on the prior year\'s VAT liability, and an annual return (Umsatzsteuererklarung) is mandatory. Germany uses the reverse charge mechanism for many cross-border B2B services.',
        'Use our calculator to compute German MwSt instantly. For invoice preparation, try our <a href="/en/tools/invoice-calculator">invoice calculator</a>, and for general percentage calculations, use our <a href="/en/tools/percentage-calculator">percentage calculator</a>.',
      ],
      faq: [
        { q: 'What is the standard VAT rate in Germany?', a: 'The standard MwSt rate in Germany is 19%. The reduced rate is 7% for essentials like food, books, and public transport.' },
        { q: 'Which goods have reduced VAT in Germany?', a: 'The 7% reduced rate applies to most food products, books, newspapers, magazines, public transport tickets, hotel stays (short-term), and admission to cultural events.' },
        { q: 'What is the Kleinunternehmerregelung?', a: 'The small business exemption (Kleinunternehmerregelung) allows businesses with annual revenue under 22,000 euros to be exempt from charging VAT, though they cannot reclaim input VAT either.' },
        { q: 'How often must I file VAT returns in Germany?', a: 'Filing frequency depends on VAT liability: monthly if over 7,500 euros annually, quarterly if between 1,000 and 7,500 euros. An annual return is always required.' },
      ],
    },
    it: {
      title: 'IVA in Germania: Aliquote, Regole e Come Calcolare',
      paragraphs: [
        'La Germania applica due aliquote IVA (Mehrwertsteuer/MwSt). L\'aliquota ordinaria e del 19%, applicabile alla maggior parte dei beni e servizi. L\'aliquota ridotta del 7% si applica a prodotti alimentari, libri, giornali, trasporto pubblico, alloggio alberghiero ed eventi culturali.',
        'L\'Ufficio Federale Centrale delle Imposte (BZSt) supervisiona l\'amministrazione dell\'IVA. Le imprese devono registrarsi se il fatturato annuo supera i 22.000 euro (soglia Kleinunternehmerregelung).',
        'Usa il nostro calcolatore per calcolare la MwSt tedesca istantaneamente. Abbinalo al nostro <a href="/it/tools/invoice-calculator">calcolatore fatture</a> o alla <a href="/it/tools/percentage-calculator">calcolatrice percentuali</a>.',
      ],
      faq: [
        { q: 'Qual e l\'aliquota IVA standard in Germania?', a: 'L\'aliquota MwSt standard in Germania e del 19%. L\'aliquota ridotta e del 7%.' },
        { q: 'Quali beni hanno l\'IVA ridotta in Germania?', a: 'Il 7% si applica a prodotti alimentari, libri, giornali, trasporto pubblico, soggiorni in hotel e eventi culturali.' },
        { q: 'Cos\'e la Kleinunternehmerregelung?', a: 'E l\'esenzione per piccole imprese con fatturato annuo inferiore a 22.000 euro, che non devono addebitare IVA.' },
        { q: 'Ogni quanto si presenta la dichiarazione IVA in Germania?', a: 'Mensile se oltre 7.500 euro di IVA annuale, trimestrale se tra 1.000 e 7.500 euro. La dichiarazione annuale e sempre obbligatoria.' },
      ],
    },
    es: {
      title: 'IVA en Alemania: Tipos, Normas y Como Calcularlo',
      paragraphs: [
        'Alemania aplica dos tipos de IVA (Mehrwertsteuer/MwSt). El tipo general es del 19%, aplicable a la mayoria de bienes y servicios. El tipo reducido del 7% cubre alimentos, libros, periodicos, transporte publico y alojamiento hotelero.',
        'La Oficina Federal Central de Impuestos (BZSt) supervisa la administracion del IVA. Las empresas deben registrarse si su facturacion anual supera los 22.000 euros (umbral Kleinunternehmerregelung).',
        'Utiliza nuestra calculadora para calcular la MwSt alemana al instante. Combinala con nuestra <a href="/es/tools/invoice-calculator">calculadora de facturas</a> o nuestra <a href="/es/tools/percentage-calculator">calculadora de porcentaje</a>.',
      ],
      faq: [
        { q: 'Cual es el tipo de IVA general en Alemania?', a: 'El tipo general de MwSt en Alemania es del 19%. El tipo reducido es del 7%.' },
        { q: 'Que productos tienen IVA reducido en Alemania?', a: 'El 7% se aplica a alimentos, libros, periodicos, transporte publico, estancias en hotel y eventos culturales.' },
        { q: 'Que es la Kleinunternehmerregelung?', a: 'Es la exencion para pequeñas empresas con facturacion anual inferior a 22.000 euros.' },
        { q: 'Cada cuanto se declara el IVA en Alemania?', a: 'Mensual si supera 7.500 euros de IVA anual, trimestral si esta entre 1.000 y 7.500 euros.' },
      ],
    },
    fr: {
      title: 'TVA en Allemagne: Taux, Regles et Comment Calculer',
      paragraphs: [
        'L\'Allemagne applique deux taux de TVA (Mehrwertsteuer/MwSt). Le taux normal est de 19% pour la plupart des biens et services. Le taux reduit de 7% s\'applique aux produits alimentaires, livres, journaux, transports publics et hebergement hotelier.',
        'Le Bureau Federal Central des Impots (BZSt) supervise l\'administration de la TVA. Les entreprises doivent s\'enregistrer si leur chiffre d\'affaires annuel depasse 22 000 euros.',
        'Utilisez notre calculateur pour calculer la MwSt allemande instantanement. Combinez avec notre <a href="/fr/tools/invoice-calculator">calculateur de factures</a> ou notre <a href="/fr/tools/percentage-calculator">calculateur de pourcentage</a>.',
      ],
      faq: [
        { q: 'Quel est le taux de TVA standard en Allemagne?', a: 'Le taux normal de MwSt en Allemagne est de 19%. Le taux reduit est de 7%.' },
        { q: 'Quels produits ont la TVA reduite en Allemagne?', a: 'Le 7% s\'applique aux produits alimentaires, livres, journaux, transports publics et hebergement hotelier.' },
        { q: 'Qu\'est-ce que la Kleinunternehmerregelung?', a: 'C\'est l\'exemption pour les petites entreprises dont le chiffre d\'affaires annuel est inferieur a 22 000 euros.' },
        { q: 'A quelle frequence declare-t-on la TVA en Allemagne?', a: 'Mensuellement si plus de 7 500 euros de TVA annuelle, trimestriellement si entre 1 000 et 7 500 euros.' },
      ],
    },
    de: {
      title: 'Mehrwertsteuer in Deutschland: Saetze, Regeln und Berechnung',
      paragraphs: [
        'Deutschland wendet zwei MwSt-Saetze an. Der Regelsatz betraegt 19% fuer die meisten Waren und Dienstleistungen. Der ermaessigte Satz von 7% gilt fuer Lebensmittel, Buecher, Zeitungen, oeffentlichen Nahverkehr, Hotelunterkuenfte und kulturelle Veranstaltungen.',
        'Das Bundeszentralamt fuer Steuern (BZSt) ueberwacht die MwSt-Verwaltung. Unternehmen muessen sich registrieren, wenn ihr Jahresumsatz 22.000 Euro uebersteigt (Kleinunternehmerregelung-Schwelle).',
        'Verwenden Sie unseren Rechner, um die deutsche MwSt sofort zu berechnen. Kombinieren Sie ihn mit unserem <a href="/de/tools/invoice-calculator">Rechnungsrechner</a> oder unserem <a href="/de/tools/percentage-calculator">Prozentrechner</a>.',
      ],
      faq: [
        { q: 'Wie hoch ist der MwSt-Regelsatz in Deutschland?', a: 'Der MwSt-Regelsatz in Deutschland betraegt 19%. Der ermaessigte Satz betraegt 7%.' },
        { q: 'Welche Gueter haben ermaessigte MwSt?', a: 'Der 7%-Satz gilt fuer Lebensmittel, Buecher, Zeitungen, oeffentlichen Nahverkehr, Hotelaufenthalte und Kulturveranstaltungen.' },
        { q: 'Was ist die Kleinunternehmerregelung?', a: 'Die Befreiung fuer Kleinunternehmer mit einem Jahresumsatz unter 22.000 Euro, die keine MwSt berechnen muessen.' },
        { q: 'Wie oft muss man MwSt-Erklaerungen abgeben?', a: 'Monatlich bei ueber 7.500 Euro jaehrlicher MwSt-Schuld, vierteljaehrlich bei 1.000 bis 7.500 Euro. Die Jahreserklaerung ist immer Pflicht.' },
      ],
    },
    pt: {
      title: 'IVA na Alemanha: Taxas, Regras e Como Calcular',
      paragraphs: [
        'A Alemanha aplica duas taxas de IVA (Mehrwertsteuer/MwSt). A taxa normal e de 19% para a maioria dos bens e servicos. A taxa reduzida de 7% aplica-se a produtos alimentares, livros, jornais, transporte publico e alojamento hoteleiro.',
        'O Gabinete Federal Central de Impostos (BZSt) supervisiona a administracao do IVA. As empresas devem registar-se se a faturacao anual ultrapassar 22.000 euros.',
        'Use a nossa calculadora para calcular a MwSt alema instantaneamente. Combine com a nossa <a href="/pt/tools/invoice-calculator">calculadora de faturas</a> ou a nossa <a href="/pt/tools/percentage-calculator">calculadora de percentagem</a>.',
      ],
      faq: [
        { q: 'Qual e a taxa de IVA normal na Alemanha?', a: 'A taxa normal de MwSt na Alemanha e de 19%. A taxa reduzida e de 7%.' },
        { q: 'Que produtos tem IVA reduzido na Alemanha?', a: 'Os 7% aplicam-se a produtos alimentares, livros, jornais, transporte publico e alojamento hoteleiro.' },
        { q: 'O que e a Kleinunternehmerregelung?', a: 'E a isencao para pequenas empresas com faturacao anual inferior a 22.000 euros.' },
        { q: 'Com que frequencia se declara o IVA na Alemanha?', a: 'Mensalmente se mais de 7.500 euros de IVA anual, trimestralmente se entre 1.000 e 7.500 euros.' },
      ],
    },
  },
  france: {
    en: {
      title: 'VAT in France: Rates, Rules & How to Calculate TVA',
      paragraphs: [
        'France applies four VAT (TVA) rates. The standard rate is 20%, covering most goods and services. The intermediate rate of 10% applies to restaurant meals, prepared food, passenger transport, home renovation works, and certain accommodation services. The reduced rate of 5.5% covers essential food products, books, energy supplies (gas, electricity), equipment for disabled persons, and cultural venues. The super-reduced rate of 2.1% applies to reimbursable medicines, press publications, and live performances in certain venues.',
        'The French tax authority (Direction Generale des Finances Publiques, DGFiP) administers VAT. Businesses must register from their first taxable transaction. TVA declarations can be monthly (regime reel normal) or quarterly (regime reel simplifie) depending on annual turnover. France actively participates in the EU\'s One Stop Shop scheme for cross-border e-commerce sales.',
        'Use our calculator to compute French TVA instantly on any amount. For invoice management, pair this with our <a href="/en/tools/invoice-calculator">invoice calculator</a> or use our <a href="/en/tools/sales-tax-calculator">sales tax calculator</a> for US comparisons.',
      ],
      faq: [
        { q: 'What is the standard VAT rate in France?', a: 'The standard TVA rate in France is 20%. There are also rates of 10%, 5.5%, and 2.1%.' },
        { q: 'Which goods have 5.5% TVA in France?', a: 'The 5.5% rate applies to most food products, books, energy supplies, equipment for disabled persons, and cultural admissions.' },
        { q: 'What is the 2.1% super-reduced rate for?', a: 'The 2.1% rate applies to reimbursable prescription medicines, press publications (newspapers, magazines), and certain live cultural performances.' },
        { q: 'How often must I file VAT returns in France?', a: 'Monthly under regime reel normal, or quarterly/semi-annually under regime reel simplifie, depending on your annual turnover.' },
      ],
    },
    it: {
      title: 'IVA in Francia: Aliquote, Regole e Come Calcolare la TVA',
      paragraphs: [
        'La Francia applica quattro aliquote IVA (TVA). L\'aliquota ordinaria e del 20%. L\'aliquota intermedia del 10% si applica a ristorazione, trasporto passeggeri e ristrutturazioni. L\'aliquota ridotta del 5,5% copre prodotti alimentari essenziali, libri e forniture energetiche. L\'aliquota super-ridotta del 2,1% si applica a medicinali rimborsabili e pubblicazioni stampa.',
        'L\'autorita fiscale francese (DGFiP) amministra l\'IVA. Le dichiarazioni possono essere mensili o trimestrali a seconda del fatturato.',
        'Usa il nostro calcolatore per calcolare la TVA francese istantaneamente. Abbinalo al nostro <a href="/it/tools/invoice-calculator">calcolatore fatture</a> o alla <a href="/it/tools/percentage-calculator">calcolatrice percentuali</a>.',
      ],
      faq: [
        { q: 'Qual e l\'aliquota IVA standard in Francia?', a: 'L\'aliquota TVA standard in Francia e del 20%. Esistono anche aliquote del 10%, 5,5% e 2,1%.' },
        { q: 'Quali beni hanno il 5,5% di TVA?', a: 'Il 5,5% si applica a prodotti alimentari, libri, forniture energetiche e attrezzature per disabili.' },
        { q: 'A cosa si applica il 2,1%?', a: 'Il 2,1% si applica a medicinali rimborsabili, pubblicazioni stampa e alcuni spettacoli dal vivo.' },
        { q: 'Ogni quanto si dichiara l\'IVA in Francia?', a: 'Mensilmente con il regime reel normal, o trimestralmente con il regime reel simplifie.' },
      ],
    },
    es: {
      title: 'IVA en Francia: Tipos, Normas y Como Calcularlo',
      paragraphs: [
        'Francia aplica cuatro tipos de IVA (TVA). El tipo general es del 20%. El tipo intermedio del 10% se aplica a restauracion, transporte de pasajeros y obras de renovacion. El tipo reducido del 5,5% cubre productos alimentarios esenciales, libros y suministros energeticos. El tipo superreducido del 2,1% se aplica a medicamentos reembolsables y publicaciones de prensa.',
        'La autoridad fiscal francesa (DGFiP) administra el IVA. Las declaraciones pueden ser mensuales o trimestrales segun la facturacion.',
        'Utiliza nuestra calculadora para calcular la TVA francesa al instante. Combinala con nuestra <a href="/es/tools/invoice-calculator">calculadora de facturas</a> o nuestra <a href="/es/tools/percentage-calculator">calculadora de porcentaje</a>.',
      ],
      faq: [
        { q: 'Cual es el tipo de IVA general en Francia?', a: 'El tipo general de TVA en Francia es del 20%. Existen tambien tipos del 10%, 5,5% y 2,1%.' },
        { q: 'Que productos tienen el 5,5% de TVA?', a: 'El 5,5% se aplica a productos alimentarios, libros, suministros energeticos y equipamiento para discapacitados.' },
        { q: 'Para que es el tipo del 2,1%?', a: 'El 2,1% se aplica a medicamentos reembolsables, publicaciones de prensa y ciertos espectaculos en vivo.' },
        { q: 'Cada cuanto se declara el IVA en Francia?', a: 'Mensualmente con el regime reel normal, o trimestralmente con el regime reel simplifie.' },
      ],
    },
    fr: {
      title: 'TVA en France: Taux, Regles et Comment Calculer',
      paragraphs: [
        'La France applique quatre taux de TVA. Le taux normal est de 20%, couvrant la plupart des biens et services. Le taux intermediaire de 10% s\'applique a la restauration, aux transports de voyageurs, aux travaux de renovation et a certains hebergements. Le taux reduit de 5,5% couvre les produits alimentaires de premiere necessite, les livres, les fournitures d\'energie et les equipements pour personnes handicapees. Le taux super-reduit de 2,1% s\'applique aux medicaments remboursables, aux publications de presse et a certains spectacles vivants.',
        'La Direction Generale des Finances Publiques (DGFiP) administre la TVA. Les declarations peuvent etre mensuelles (regime reel normal) ou trimestrielles (regime reel simplifie) selon le chiffre d\'affaires annuel.',
        'Utilisez notre calculateur pour calculer la TVA francaise instantanement. Combinez avec notre <a href="/fr/tools/invoice-calculator">calculateur de factures</a> ou notre <a href="/fr/tools/percentage-calculator">calculateur de pourcentage</a>.',
      ],
      faq: [
        { q: 'Quel est le taux de TVA normal en France?', a: 'Le taux normal de TVA en France est de 20%. Il existe aussi des taux de 10%, 5,5% et 2,1%.' },
        { q: 'Quels produits beneficient du taux de 5,5%?', a: 'Le 5,5% s\'applique aux produits alimentaires de premiere necessite, livres, fournitures d\'energie et equipements pour handicapes.' },
        { q: 'A quoi s\'applique le taux de 2,1%?', a: 'Le 2,1% s\'applique aux medicaments remboursables, publications de presse et certains spectacles vivants.' },
        { q: 'A quelle frequence declare-t-on la TVA en France?', a: 'Mensuellement en regime reel normal, trimestriellement en regime reel simplifie, selon le chiffre d\'affaires.' },
      ],
    },
    de: {
      title: 'MwSt in Frankreich: Saetze, Regeln und Berechnung',
      paragraphs: [
        'Frankreich wendet vier MwSt-Saetze (TVA) an. Der Regelsatz betraegt 20%. Der Zwischensatz von 10% gilt fuer Gastronomie, Personentransport und Renovierungsarbeiten. Der ermaessigte Satz von 5,5% umfasst Grundnahrungsmittel, Buecher und Energieversorgung. Der stark ermaessigte Satz von 2,1% gilt fuer erstattungsfaehige Medikamente und Presseveroeffentlichungen.',
        'Die franzoesische Steuerbehoerde (DGFiP) verwaltet die MwSt. Erklaerungen koennen monatlich oder vierteljaehrlich erfolgen.',
        'Verwenden Sie unseren Rechner fuer die franzoesische TVA. Kombinieren Sie ihn mit unserem <a href="/de/tools/invoice-calculator">Rechnungsrechner</a> oder unserem <a href="/de/tools/percentage-calculator">Prozentrechner</a>.',
      ],
      faq: [
        { q: 'Wie hoch ist der MwSt-Regelsatz in Frankreich?', a: 'Der Regelsatz der TVA in Frankreich betraegt 20%. Es gibt auch Saetze von 10%, 5,5% und 2,1%.' },
        { q: 'Welche Produkte haben 5,5% TVA?', a: 'Der 5,5%-Satz gilt fuer Grundnahrungsmittel, Buecher, Energieversorgung und Behindertenausstattung.' },
        { q: 'Wofuer gilt der 2,1%-Satz?', a: 'Der 2,1% gilt fuer erstattungsfaehige Medikamente, Presseveroeffentlichungen und bestimmte Live-Auffuehrungen.' },
        { q: 'Wie oft muss man in Frankreich MwSt erklaeren?', a: 'Monatlich im regime reel normal, vierteljaehrlich im regime reel simplifie.' },
      ],
    },
    pt: {
      title: 'IVA em Franca: Taxas, Regras e Como Calcular',
      paragraphs: [
        'A Franca aplica quatro taxas de IVA (TVA). A taxa normal e de 20%. A taxa intermedia de 10% aplica-se a restauracao, transporte de passageiros e obras de renovacao. A taxa reduzida de 5,5% cobre produtos alimentares essenciais, livros e fornecimento de energia. A taxa super-reduzida de 2,1% aplica-se a medicamentos reembolsaveis e publicacoes de imprensa.',
        'A autoridade fiscal francesa (DGFiP) administra o IVA. As declaracoes podem ser mensais ou trimestrais conforme a faturacao.',
        'Use a nossa calculadora para calcular a TVA francesa instantaneamente. Combine com a nossa <a href="/pt/tools/invoice-calculator">calculadora de faturas</a> ou a nossa <a href="/pt/tools/percentage-calculator">calculadora de percentagem</a>.',
      ],
      faq: [
        { q: 'Qual e a taxa de IVA normal em Franca?', a: 'A taxa normal de TVA em Franca e de 20%. Existem tambem taxas de 10%, 5,5% e 2,1%.' },
        { q: 'Que produtos tem 5,5% de TVA?', a: 'Os 5,5% aplicam-se a produtos alimentares essenciais, livros, fornecimento de energia e equipamentos para deficientes.' },
        { q: 'Para que serve a taxa de 2,1%?', a: 'Os 2,1% aplicam-se a medicamentos reembolsaveis, publicacoes de imprensa e certos espetaculos ao vivo.' },
        { q: 'Com que frequencia se declara o IVA em Franca?', a: 'Mensalmente no regime reel normal, trimestralmente no regime reel simplifie.' },
      ],
    },
  },
  italy: {
    en: {
      title: 'VAT in Italy: Rates, Rules & How to Calculate IVA',
      paragraphs: [
        'Italy applies four VAT (IVA) rates. The standard rate is 22%, one of the highest in the EU, applicable to most goods and services. The reduced rate of 10% covers restaurant services, hotel accommodation, certain food products, renovation works, and some energy supplies. A further reduced rate of 5% applies to specific items including certain herbs, spices, and social cooperative services. The super-reduced rate of 4% covers essential goods such as bread, milk, butter, fresh fruit, fresh vegetables, olive oil, books, newspapers, and first-home purchases.',
        'The Agenzia delle Entrate administers Italian VAT. Businesses must register from their first taxable transaction using the Partita IVA system. VAT returns are filed quarterly for smaller businesses or monthly for larger ones. Italy\'s electronic invoicing system (fattura elettronica) has been mandatory since 2019 for most domestic B2B and B2C transactions, making it one of the most digitized VAT systems in Europe.',
        'Use our calculator to compute Italian IVA instantly. For invoice preparation, try our <a href="/en/tools/invoice-calculator">invoice calculator</a> or use our <a href="/en/tools/percentage-calculator">percentage calculator</a> for general computations.',
      ],
      faq: [
        { q: 'What is the standard VAT rate in Italy?', a: 'The standard IVA rate in Italy is 22%. There are also rates of 10%, 5%, and 4% for reduced categories.' },
        { q: 'Which goods have 4% IVA in Italy?', a: 'The 4% super-reduced rate applies to bread, milk, butter, fresh fruit, fresh vegetables, olive oil, books, newspapers, and first-home purchases.' },
        { q: 'Is electronic invoicing mandatory in Italy?', a: 'Yes. Since 2019, fattura elettronica (electronic invoicing) is mandatory for most domestic B2B and B2C transactions through the SDI (Sistema di Interscambio) platform.' },
        { q: 'How often must I file VAT returns in Italy?', a: 'Quarterly for businesses with annual turnover below the threshold, monthly for larger businesses. Annual VAT declaration is mandatory for all.' },
      ],
    },
    it: {
      title: 'IVA in Italia: Aliquote, Regole e Come Calcolare',
      paragraphs: [
        'L\'Italia applica quattro aliquote IVA. L\'aliquota ordinaria e del 22%, una delle piu alte nell\'UE. L\'aliquota ridotta del 10% copre ristorazione, alloggio alberghiero, alcuni prodotti alimentari e lavori di ristrutturazione. L\'aliquota del 5% si applica a erbe aromatiche e servizi di cooperative sociali. L\'aliquota super-ridotta del 4% copre beni di prima necessita come pane, latte, burro, frutta fresca, verdura fresca, olio d\'oliva, libri e giornali.',
        'L\'Agenzia delle Entrate amministra l\'IVA italiana tramite il sistema della Partita IVA. La fatturazione elettronica (fattura elettronica) e obbligatoria dal 2019 per la maggior parte delle transazioni B2B e B2C domestiche attraverso il SDI (Sistema di Interscambio).',
        'Usa il nostro calcolatore per calcolare l\'IVA italiana istantaneamente. Per le fatture, usa il nostro <a href="/it/tools/invoice-calculator">calcolatore fatture</a> o la <a href="/it/tools/percentage-calculator">calcolatrice percentuali</a>.',
      ],
      faq: [
        { q: 'Qual e l\'aliquota IVA ordinaria in Italia?', a: 'L\'aliquota IVA ordinaria in Italia e del 22%. Esistono anche aliquote del 10%, 5% e 4%.' },
        { q: 'Quali beni hanno il 4% di IVA?', a: 'Il 4% si applica a pane, latte, burro, frutta e verdura fresche, olio d\'oliva, libri, giornali e acquisto prima casa.' },
        { q: 'La fatturazione elettronica e obbligatoria?', a: 'Si. Dal 2019 la fattura elettronica e obbligatoria per la maggior parte delle transazioni domestiche tramite il SDI.' },
        { q: 'Ogni quanto si presenta la dichiarazione IVA?', a: 'Trimestralmente per imprese sotto soglia, mensilmente per quelle piu grandi. La dichiarazione annuale e sempre obbligatoria.' },
      ],
    },
    es: {
      title: 'IVA en Italia: Tipos, Normas y Como Calcularlo',
      paragraphs: [
        'Italia aplica cuatro tipos de IVA. El tipo general es del 22%. El tipo reducido del 10% cubre restauracion, alojamiento hotelero y ciertos alimentos. El tipo del 5% se aplica a hierbas aromaticas y servicios de cooperativas sociales. El tipo superreducido del 4% cubre bienes esenciales como pan, leche, mantequilla, frutas, verduras, aceite de oliva y libros.',
        'La Agencia Tributaria italiana (Agenzia delle Entrate) administra el IVA. La facturacion electronica es obligatoria desde 2019.',
        'Utiliza nuestra calculadora para calcular el IVA italiano. Combinala con nuestra <a href="/es/tools/invoice-calculator">calculadora de facturas</a> o nuestra <a href="/es/tools/percentage-calculator">calculadora de porcentaje</a>.',
      ],
      faq: [
        { q: 'Cual es el tipo de IVA general en Italia?', a: 'El tipo general de IVA en Italia es del 22%. Existen tambien tipos del 10%, 5% y 4%.' },
        { q: 'Que productos tienen el 4% de IVA?', a: 'El 4% se aplica a pan, leche, mantequilla, frutas y verduras frescas, aceite de oliva y libros.' },
        { q: 'La facturacion electronica es obligatoria en Italia?', a: 'Si. Desde 2019, la fattura elettronica es obligatoria para la mayoria de transacciones domesticas.' },
        { q: 'Cada cuanto se declara el IVA en Italia?', a: 'Trimestralmente para empresas pequenas, mensualmente para las grandes. La declaracion anual es siempre obligatoria.' },
      ],
    },
    fr: {
      title: 'TVA en Italie: Taux, Regles et Comment Calculer',
      paragraphs: [
        'L\'Italie applique quatre taux de TVA (IVA). Le taux normal est de 22%. Le taux reduit de 10% couvre la restauration, l\'hebergement et certains aliments. Le taux de 5% s\'applique aux herbes aromatiques et services de cooperatives sociales. Le taux super-reduit de 4% couvre le pain, le lait, le beurre, les fruits et legumes frais, l\'huile d\'olive et les livres.',
        'L\'Agenzia delle Entrate administre la TVA italienne. La facturation electronique est obligatoire depuis 2019.',
        'Utilisez notre calculateur pour la TVA italienne. Combinez avec notre <a href="/fr/tools/invoice-calculator">calculateur de factures</a> ou notre <a href="/fr/tools/percentage-calculator">calculateur de pourcentage</a>.',
      ],
      faq: [
        { q: 'Quel est le taux de TVA normal en Italie?', a: 'Le taux normal de TVA en Italie est de 22%. Il existe aussi des taux de 10%, 5% et 4%.' },
        { q: 'Quels produits ont 4% de TVA?', a: 'Le 4% s\'applique au pain, lait, beurre, fruits et legumes frais, huile d\'olive et livres.' },
        { q: 'La facturation electronique est-elle obligatoire?', a: 'Oui. Depuis 2019, la fattura elettronica est obligatoire pour la plupart des transactions domestiques.' },
        { q: 'A quelle frequence declare-t-on la TVA en Italie?', a: 'Trimestriellement pour les petites entreprises, mensuellement pour les grandes.' },
      ],
    },
    de: {
      title: 'MwSt in Italien: Saetze, Regeln und Berechnung',
      paragraphs: [
        'Italien wendet vier MwSt-Saetze (IVA) an. Der Regelsatz betraegt 22%. Der ermaessigte Satz von 10% gilt fuer Gastronomie, Unterkuenfte und bestimmte Lebensmittel. Der 5%-Satz gilt fuer Kraeuter und Sozialkooperativen. Der stark ermaessigte Satz von 4% umfasst Brot, Milch, Butter, frisches Obst und Gemuese, Olivenoel und Buecher.',
        'Die Agenzia delle Entrate verwaltet die italienische MwSt. Die elektronische Rechnungsstellung ist seit 2019 Pflicht.',
        'Verwenden Sie unseren Rechner fuer die italienische IVA. Kombinieren Sie ihn mit unserem <a href="/de/tools/invoice-calculator">Rechnungsrechner</a> oder unserem <a href="/de/tools/percentage-calculator">Prozentrechner</a>.',
      ],
      faq: [
        { q: 'Wie hoch ist der MwSt-Regelsatz in Italien?', a: 'Der Regelsatz der IVA in Italien betraegt 22%. Es gibt auch Saetze von 10%, 5% und 4%.' },
        { q: 'Welche Gueter haben 4% MwSt?', a: 'Der 4% gilt fuer Brot, Milch, Butter, frisches Obst und Gemuese, Olivenoel und Buecher.' },
        { q: 'Ist die elektronische Rechnungsstellung Pflicht?', a: 'Ja. Seit 2019 ist die fattura elettronica fuer die meisten inlaendischen Transaktionen obligatorisch.' },
        { q: 'Wie oft muss man in Italien MwSt erklaeren?', a: 'Vierteljaehrlich fuer kleinere Unternehmen, monatlich fuer groessere.' },
      ],
    },
    pt: {
      title: 'IVA em Italia: Taxas, Regras e Como Calcular',
      paragraphs: [
        'A Italia aplica quatro taxas de IVA. A taxa normal e de 22%. A taxa reduzida de 10% cobre restauracao, alojamento e certos alimentos. A taxa de 5% aplica-se a ervas aromaticas e servicos de cooperativas sociais. A taxa super-reduzida de 4% cobre pao, leite, manteiga, frutas e legumes frescos, azeite e livros.',
        'A Agenzia delle Entrate administra o IVA italiano. A faturacao eletronica e obrigatoria desde 2019.',
        'Use a nossa calculadora para o IVA italiano. Combine com a nossa <a href="/pt/tools/invoice-calculator">calculadora de faturas</a> ou a nossa <a href="/pt/tools/percentage-calculator">calculadora de percentagem</a>.',
      ],
      faq: [
        { q: 'Qual e a taxa de IVA normal em Italia?', a: 'A taxa normal de IVA em Italia e de 22%. Existem tambem taxas de 10%, 5% e 4%.' },
        { q: 'Que produtos tem 4% de IVA?', a: 'Os 4% aplicam-se a pao, leite, manteiga, frutas e legumes frescos, azeite e livros.' },
        { q: 'A faturacao eletronica e obrigatoria?', a: 'Sim. Desde 2019, a fattura elettronica e obrigatoria para a maioria das transacoes domesticas.' },
        { q: 'Com que frequencia se declara o IVA em Italia?', a: 'Trimestralmente para empresas menores, mensalmente para as maiores.' },
      ],
    },
  },
  uk: {
    en: {
      title: 'VAT in the United Kingdom: Rates, Rules & How to Calculate',
      paragraphs: [
        'The United Kingdom applies three VAT rates. The standard rate is 20%, covering most goods and services. The reduced rate of 5% applies to domestic fuel and power, children\'s car seats, certain energy-saving materials, and sanitary products. A zero rate (0%) applies to most food items, children\'s clothing, books, newspapers, public transport, and new residential construction. Some supplies are exempt from VAT entirely, including financial services, insurance, education, and healthcare.',
        'HMRC (His Majesty\'s Revenue and Customs) administers UK VAT. Businesses must register for VAT when their taxable turnover exceeds 90,000 pounds (2024-25 threshold). VAT returns are generally filed quarterly through the Making Tax Digital (MTD) system. The UK uses the flat rate scheme for small businesses, allowing simplified VAT accounting at a fixed percentage of gross turnover.',
        'Use our calculator to compute UK VAT instantly. For invoicing, try our <a href="/en/tools/invoice-calculator">invoice calculator</a>. If you deal with US sales tax, use our <a href="/en/tools/sales-tax-calculator">sales tax calculator</a>.',
      ],
      faq: [
        { q: 'What is the standard VAT rate in the UK?', a: 'The standard UK VAT rate is 20%. There is also a reduced rate of 5% and a zero rate for essential items.' },
        { q: 'What is zero-rated VAT?', a: 'Zero-rated goods are technically subject to VAT but at 0%. This includes most food, children\'s clothing, books, and public transport. Businesses selling zero-rated goods can still reclaim input VAT.' },
        { q: 'When must I register for VAT in the UK?', a: 'You must register when your taxable turnover exceeds 90,000 pounds in a rolling 12-month period, or when you expect it to exceed this threshold in the next 30 days alone.' },
        { q: 'What is Making Tax Digital?', a: 'MTD is HMRC\'s system requiring businesses to keep digital records and submit VAT returns using compatible software. It has been mandatory for VAT-registered businesses since April 2022.' },
      ],
    },
    it: {
      title: 'IVA nel Regno Unito: Aliquote, Regole e Come Calcolare',
      paragraphs: [
        'Il Regno Unito applica tre aliquote IVA. L\'aliquota standard e del 20%. L\'aliquota ridotta del 5% si applica a combustibili domestici, seggiolini per bambini e prodotti sanitari. L\'aliquota zero (0%) si applica alla maggior parte degli alimenti, abbigliamento per bambini, libri e trasporto pubblico.',
        'HMRC amministra l\'IVA del Regno Unito. Le imprese devono registrarsi quando il fatturato imponibile supera le 90.000 sterline. Le dichiarazioni sono generalmente trimestrali tramite il sistema Making Tax Digital.',
        'Usa il nostro calcolatore per l\'IVA del Regno Unito. Abbinalo al nostro <a href="/it/tools/invoice-calculator">calcolatore fatture</a>.',
      ],
      faq: [
        { q: 'Qual e l\'aliquota IVA standard nel Regno Unito?', a: 'L\'aliquota IVA standard nel Regno Unito e del 20%. Esiste anche un\'aliquota ridotta del 5% e un\'aliquota zero.' },
        { q: 'Cos\'e l\'IVA a tasso zero?', a: 'I beni a tasso zero sono soggetti a IVA allo 0%. Include la maggior parte degli alimenti, abbigliamento per bambini e libri.' },
        { q: 'Quando bisogna registrarsi per l\'IVA nel Regno Unito?', a: 'Quando il fatturato imponibile supera le 90.000 sterline in 12 mesi.' },
        { q: 'Cos\'e il Making Tax Digital?', a: 'E il sistema HMRC che richiede registri digitali e invio elettronico delle dichiarazioni IVA.' },
      ],
    },
    es: {
      title: 'IVA en el Reino Unido: Tipos, Normas y Como Calcularlo',
      paragraphs: [
        'El Reino Unido aplica tres tipos de IVA. El tipo general es del 20%. El tipo reducido del 5% se aplica a combustibles domesticos, sillas de coche para niños y productos sanitarios. El tipo cero (0%) se aplica a la mayoria de alimentos, ropa infantil, libros y transporte publico.',
        'HMRC administra el IVA del Reino Unido. Las empresas deben registrarse cuando la facturacion imponible supera las 90.000 libras.',
        'Utiliza nuestra calculadora para el IVA del Reino Unido. Combinala con nuestra <a href="/es/tools/invoice-calculator">calculadora de facturas</a>.',
      ],
      faq: [
        { q: 'Cual es el tipo de IVA general en el Reino Unido?', a: 'El tipo general de IVA en el Reino Unido es del 20%. Existen tambien un tipo reducido del 5% y un tipo cero.' },
        { q: 'Que es el IVA tipo cero?', a: 'Los bienes tipo cero estan sujetos a IVA al 0%. Incluye la mayoria de alimentos, ropa infantil y libros.' },
        { q: 'Cuando hay que registrarse para el IVA en el Reino Unido?', a: 'Cuando la facturacion imponible supera las 90.000 libras en 12 meses.' },
        { q: 'Que es Making Tax Digital?', a: 'Es el sistema de HMRC que exige registros digitales y envio electronico de declaraciones de IVA.' },
      ],
    },
    fr: {
      title: 'TVA au Royaume-Uni: Taux, Regles et Comment Calculer',
      paragraphs: [
        'Le Royaume-Uni applique trois taux de TVA. Le taux normal est de 20%. Le taux reduit de 5% s\'applique aux combustibles domestiques et sieges auto pour enfants. Le taux zero (0%) s\'applique a la plupart des aliments, vetements pour enfants, livres et transports publics.',
        'HMRC administre la TVA du Royaume-Uni. Les entreprises doivent s\'enregistrer quand le chiffre d\'affaires imposable depasse 90 000 livres.',
        'Utilisez notre calculateur pour la TVA du Royaume-Uni. Combinez avec notre <a href="/fr/tools/invoice-calculator">calculateur de factures</a>.',
      ],
      faq: [
        { q: 'Quel est le taux de TVA standard au Royaume-Uni?', a: 'Le taux standard est de 20%. Il existe aussi un taux reduit de 5% et un taux zero.' },
        { q: 'Qu\'est-ce que la TVA a taux zero?', a: 'Les biens a taux zero sont soumis a la TVA a 0%. Cela inclut la plupart des aliments, vetements pour enfants et livres.' },
        { q: 'Quand faut-il s\'enregistrer pour la TVA au Royaume-Uni?', a: 'Quand le chiffre d\'affaires imposable depasse 90 000 livres sur 12 mois.' },
        { q: 'Qu\'est-ce que Making Tax Digital?', a: 'C\'est le systeme de HMRC exigeant des registres numeriques et la soumission electronique des declarations de TVA.' },
      ],
    },
    de: {
      title: 'MwSt im Vereinigten Koenigreich: Saetze, Regeln und Berechnung',
      paragraphs: [
        'Das Vereinigte Koenigreich wendet drei MwSt-Saetze an. Der Regelsatz betraegt 20%. Der ermaessigte Satz von 5% gilt fuer haeusliche Brennstoffe und Kindersitze. Der Nullsatz (0%) gilt fuer die meisten Lebensmittel, Kinderkleidung, Buecher und oeffentlichen Nahverkehr.',
        'HMRC verwaltet die MwSt des Vereinigten Koenigreichs. Unternehmen muessen sich registrieren, wenn der steuerpflichtige Umsatz 90.000 Pfund uebersteigt.',
        'Verwenden Sie unseren Rechner fuer die britische MwSt. Kombinieren Sie ihn mit unserem <a href="/de/tools/invoice-calculator">Rechnungsrechner</a>.',
      ],
      faq: [
        { q: 'Wie hoch ist der MwSt-Regelsatz im Vereinigten Koenigreich?', a: 'Der Regelsatz betraegt 20%. Es gibt auch einen ermaessigten Satz von 5% und einen Nullsatz.' },
        { q: 'Was ist der MwSt-Nullsatz?', a: 'Nullsatz-Gueter unterliegen der MwSt mit 0%. Dazu gehoeren die meisten Lebensmittel, Kinderkleidung und Buecher.' },
        { q: 'Wann muss man sich im Vereinigten Koenigreich fuer die MwSt registrieren?', a: 'Wenn der steuerpflichtige Umsatz 90.000 Pfund in 12 Monaten uebersteigt.' },
        { q: 'Was ist Making Tax Digital?', a: 'Das HMRC-System, das digitale Aufzeichnungen und elektronische MwSt-Erklaerungen erfordert.' },
      ],
    },
    pt: {
      title: 'IVA no Reino Unido: Taxas, Regras e Como Calcular',
      paragraphs: [
        'O Reino Unido aplica tres taxas de IVA. A taxa normal e de 20%. A taxa reduzida de 5% aplica-se a combustiveis domesticos e cadeiras de carro para criancas. A taxa zero (0%) aplica-se a maioria dos alimentos, roupa infantil, livros e transporte publico.',
        'HMRC administra o IVA do Reino Unido. As empresas devem registar-se quando a faturacao tributavel ultrapassa as 90.000 libras.',
        'Use a nossa calculadora para o IVA do Reino Unido. Combine com a nossa <a href="/pt/tools/invoice-calculator">calculadora de faturas</a>.',
      ],
      faq: [
        { q: 'Qual e a taxa de IVA normal no Reino Unido?', a: 'A taxa normal e de 20%. Existem tambem uma taxa reduzida de 5% e uma taxa zero.' },
        { q: 'O que e o IVA taxa zero?', a: 'Bens taxa zero estao sujeitos a IVA a 0%. Inclui a maioria dos alimentos, roupa infantil e livros.' },
        { q: 'Quando e preciso registar-se para o IVA no Reino Unido?', a: 'Quando a faturacao tributavel ultrapassa 90.000 libras em 12 meses.' },
        { q: 'O que e Making Tax Digital?', a: 'E o sistema do HMRC que exige registos digitais e envio eletronico das declaracoes de IVA.' },
      ],
    },
  },
  netherlands: {
    en: {
      title: 'VAT in the Netherlands: Rates, Rules & How to Calculate BTW',
      paragraphs: [
        'The Netherlands applies two VAT (BTW - Belasting over de Toegevoegde Waarde) rates. The standard rate is 21%, covering most goods and services. The reduced rate of 9% applies to food and beverages, water, agricultural products, medicines, books, newspapers, hotel accommodation, passenger transport, admission to cultural and sports events, hairdressing, and repair of bicycles, shoes, leather goods, clothing, and household linen.',
        'The Dutch Tax Administration (Belastingdienst) oversees VAT. Businesses must register from their first taxable transaction. VAT returns are filed quarterly by default, though monthly filing is available upon request or required for larger businesses. The Netherlands follows EU VAT directives and participates in the One Stop Shop (OSS) scheme for cross-border e-commerce.',
        'Use our calculator to compute Dutch BTW instantly. For invoicing, try our <a href="/en/tools/invoice-calculator">invoice calculator</a> or use our <a href="/en/tools/percentage-calculator">percentage calculator</a>.',
      ],
      faq: [
        { q: 'What is the standard VAT rate in the Netherlands?', a: 'The standard BTW rate in the Netherlands is 21%. The reduced rate is 9%.' },
        { q: 'Which goods have 9% BTW?', a: 'The 9% rate applies to food, drinks, medicines, books, newspapers, hotel stays, passenger transport, cultural and sports events, hairdressing, and bicycle/shoe/clothing repairs.' },
        { q: 'When must I register for VAT in the Netherlands?', a: 'You must register from your first taxable transaction. There is no turnover threshold for mandatory registration in the Netherlands, though the KOR scheme provides simplified treatment for small businesses.' },
        { q: 'How often must I file VAT returns?', a: 'Quarterly by default. Monthly filing is available upon request or required if your VAT liability exceeds certain thresholds.' },
      ],
    },
    it: { title: 'IVA nei Paesi Bassi: Aliquote e Regole BTW', paragraphs: ['I Paesi Bassi applicano due aliquote IVA (BTW). L\'aliquota ordinaria e del 21%. L\'aliquota ridotta del 9% copre alimenti, bevande, medicinali, libri, giornali, alloggio alberghiero e trasporto passeggeri.', 'Il Belastingdienst amministra l\'IVA olandese. Le dichiarazioni sono trimestrali per impostazione predefinita.', 'Usa il nostro calcolatore per la BTW olandese. Abbinalo al nostro <a href="/it/tools/invoice-calculator">calcolatore fatture</a>.'], faq: [{ q: 'Qual e l\'aliquota IVA standard nei Paesi Bassi?', a: 'L\'aliquota BTW standard e del 21%. L\'aliquota ridotta e del 9%.' }, { q: 'Quali beni hanno il 9% di BTW?', a: 'Il 9% si applica ad alimenti, bevande, medicinali, libri, giornali e trasporto passeggeri.' }, { q: 'Ogni quanto si dichiara l\'IVA nei Paesi Bassi?', a: 'Trimestralmente per impostazione predefinita, mensilmente su richiesta.' }, { q: 'Come funziona il regime KOR?', a: 'Il KOR e il regime semplificato per piccole imprese con IVA annuale sotto i 20.000 euro.' }] },
    es: { title: 'IVA en Paises Bajos: Tipos y Reglas BTW', paragraphs: ['Los Paises Bajos aplican dos tipos de IVA (BTW). El tipo general es del 21%. El tipo reducido del 9% cubre alimentos, bebidas, medicamentos, libros, periodicos, alojamiento hotelero y transporte de pasajeros.', 'El Belastingdienst administra el IVA holandes. Las declaraciones son trimestrales por defecto.', 'Utiliza nuestra calculadora para la BTW holandesa. Combinala con nuestra <a href="/es/tools/invoice-calculator">calculadora de facturas</a>.'], faq: [{ q: 'Cual es el tipo de IVA general en Paises Bajos?', a: 'El tipo BTW general es del 21%. El tipo reducido es del 9%.' }, { q: 'Que productos tienen el 9% de BTW?', a: 'El 9% se aplica a alimentos, bebidas, medicamentos, libros, periodicos y transporte de pasajeros.' }, { q: 'Cada cuanto se declara el IVA?', a: 'Trimestralmente por defecto, mensualmente bajo solicitud.' }, { q: 'Como funciona el regimen KOR?', a: 'El KOR es el regimen simplificado para pequenas empresas con IVA anual inferior a 20.000 euros.' }] },
    fr: { title: 'TVA aux Pays-Bas: Taux et Regles BTW', paragraphs: ['Les Pays-Bas appliquent deux taux de TVA (BTW). Le taux normal est de 21%. Le taux reduit de 9% couvre les aliments, boissons, medicaments, livres, journaux, hebergement hotelier et transports de voyageurs.', 'Le Belastingdienst administre la TVA neerlandaise. Les declarations sont trimestrielles par defaut.', 'Utilisez notre calculateur pour la BTW neerlandaise. Combinez avec notre <a href="/fr/tools/invoice-calculator">calculateur de factures</a>.'], faq: [{ q: 'Quel est le taux de TVA standard aux Pays-Bas?', a: 'Le taux BTW standard est de 21%. Le taux reduit est de 9%.' }, { q: 'Quels produits ont 9% de BTW?', a: 'Le 9% s\'applique aux aliments, boissons, medicaments, livres, journaux et transports de voyageurs.' }, { q: 'A quelle frequence declare-t-on la TVA?', a: 'Trimestriellement par defaut, mensuellement sur demande.' }, { q: 'Comment fonctionne le regime KOR?', a: 'Le KOR est le regime simplifie pour les petites entreprises avec TVA annuelle inferieure a 20 000 euros.' }] },
    de: { title: 'MwSt in den Niederlanden: Saetze und Regeln BTW', paragraphs: ['Die Niederlande wenden zwei MwSt-Saetze (BTW) an. Der Regelsatz betraegt 21%. Der ermaessigte Satz von 9% gilt fuer Lebensmittel, Getraenke, Medikamente, Buecher, Zeitungen, Hotelunterkuenfte und Personentransport.', 'Der Belastingdienst verwaltet die niederlaendische MwSt. Erklaerungen sind standardmaessig vierteljaehrlich.', 'Verwenden Sie unseren Rechner fuer die niederlaendische BTW. Kombinieren Sie ihn mit unserem <a href="/de/tools/invoice-calculator">Rechnungsrechner</a>.'], faq: [{ q: 'Wie hoch ist der MwSt-Regelsatz in den Niederlanden?', a: 'Der BTW-Regelsatz betraegt 21%. Der ermaessigte Satz betraegt 9%.' }, { q: 'Welche Gueter haben 9% BTW?', a: 'Der 9%-Satz gilt fuer Lebensmittel, Getraenke, Medikamente, Buecher, Zeitungen und Personentransport.' }, { q: 'Wie oft muss man MwSt erklaeren?', a: 'Vierteljaehrlich standardmaessig, monatlich auf Antrag.' }, { q: 'Wie funktioniert das KOR-Regime?', a: 'Das KOR ist das vereinfachte Regime fuer Kleinunternehmer mit jaehrlicher MwSt unter 20.000 Euro.' }] },
    pt: { title: 'IVA nos Paises Baixos: Taxas e Regras BTW', paragraphs: ['Os Paises Baixos aplicam duas taxas de IVA (BTW). A taxa normal e de 21%. A taxa reduzida de 9% cobre alimentos, bebidas, medicamentos, livros, jornais, alojamento hoteleiro e transporte de passageiros.', 'O Belastingdienst administra o IVA holandes. As declaracoes sao trimestrais por defeito.', 'Use a nossa calculadora para a BTW holandesa. Combine com a nossa <a href="/pt/tools/invoice-calculator">calculadora de faturas</a>.'], faq: [{ q: 'Qual e a taxa de IVA normal nos Paises Baixos?', a: 'A taxa BTW normal e de 21%. A taxa reduzida e de 9%.' }, { q: 'Que produtos tem 9% de BTW?', a: 'Os 9% aplicam-se a alimentos, bebidas, medicamentos, livros, jornais e transporte de passageiros.' }, { q: 'Com que frequencia se declara o IVA?', a: 'Trimestralmente por defeito, mensalmente sob pedido.' }, { q: 'Como funciona o regime KOR?', a: 'O KOR e o regime simplificado para pequenas empresas com IVA anual inferior a 20.000 euros.' }] },
  },
  belgium: {
    en: {
      title: 'VAT in Belgium: Rates, Rules & How to Calculate BTW/TVA',
      paragraphs: [
        'Belgium applies three VAT rates (BTW in Dutch, TVA in French). The standard rate is 21%, covering most goods and services. The reduced rate of 12% applies to social housing, restaurant meals (food only, not drinks), margarine, and certain energy products. The super-reduced rate of 6% covers basic necessities including food, water, pharmaceuticals, books, newspapers, passenger transport, hotel accommodation, and renovation of private dwellings older than 10 years.',
        'The Belgian Federal Public Service Finance administers VAT. Businesses must register if they carry out taxable activities. VAT returns are filed monthly for businesses with annual turnover above 2.5 million euros, and quarterly for others. Belgium uses a unique VAT number format (BE followed by 10 digits) and participates in the EU\'s VIES system for verifying intra-community VAT numbers.',
        'Use our calculator to compute Belgian BTW/TVA instantly. For invoicing, try our <a href="/en/tools/invoice-calculator">invoice calculator</a> or use our <a href="/en/tools/percentage-calculator">percentage calculator</a>.',
      ],
      faq: [
        { q: 'What is the standard VAT rate in Belgium?', a: 'The standard rate is 21%. Belgium also has a 12% intermediate rate and a 6% reduced rate.' },
        { q: 'Which goods have 6% VAT in Belgium?', a: 'The 6% rate applies to food, water, pharmaceuticals, books, newspapers, passenger transport, hotel stays, and home renovations for dwellings over 10 years old.' },
        { q: 'What is the 12% rate for?', a: 'The 12% rate applies to social housing, restaurant meals (food portion only), margarine, and certain energy products like coal and lignite.' },
        { q: 'How often must I file VAT returns in Belgium?', a: 'Monthly if annual turnover exceeds 2.5 million euros, quarterly otherwise.' },
      ],
    },
    it: { title: 'IVA in Belgio: Aliquote e Regole BTW/TVA', paragraphs: ['Il Belgio applica tre aliquote IVA. L\'aliquota ordinaria e del 21%. L\'aliquota del 12% si applica ad alloggi sociali e pasti al ristorante (solo cibo). L\'aliquota ridotta del 6% copre alimenti, acqua, farmaci, libri, giornali, trasporto passeggeri e ristrutturazioni di abitazioni con piu di 10 anni.', 'Le dichiarazioni IVA sono mensili per imprese con fatturato sopra i 2,5 milioni, trimestrali per le altre.', 'Usa il nostro calcolatore per la BTW/TVA belga. Abbinalo al nostro <a href="/it/tools/invoice-calculator">calcolatore fatture</a>.'], faq: [{ q: 'Qual e l\'aliquota IVA standard in Belgio?', a: 'L\'aliquota standard e del 21%. Il Belgio ha anche un\'aliquota intermedia del 12% e una ridotta del 6%.' }, { q: 'Quali beni hanno il 6% di IVA?', a: 'Il 6% si applica ad alimenti, acqua, farmaci, libri, giornali, trasporto passeggeri e ristrutturazioni di case vecchie.' }, { q: 'A cosa si applica il 12%?', a: 'Il 12% si applica ad alloggi sociali, pasti al ristorante (solo cibo) e margarina.' }, { q: 'Ogni quanto si dichiara l\'IVA in Belgio?', a: 'Mensilmente se il fatturato supera i 2,5 milioni, trimestralmente altrimenti.' }] },
    es: { title: 'IVA en Belgica: Tipos y Reglas BTW/TVA', paragraphs: ['Belgica aplica tres tipos de IVA. El tipo general es del 21%. El tipo del 12% se aplica a viviendas sociales y comidas en restaurantes (solo comida). El tipo reducido del 6% cubre alimentos, agua, farmacos, libros, periodicos, transporte de pasajeros y renovaciones de viviendas de mas de 10 años.', 'Las declaraciones son mensuales para empresas con facturacion superior a 2,5 millones, trimestrales para las demas.', 'Utiliza nuestra calculadora para la BTW/TVA belga. Combinala con nuestra <a href="/es/tools/invoice-calculator">calculadora de facturas</a>.'], faq: [{ q: 'Cual es el tipo de IVA general en Belgica?', a: 'El tipo general es del 21%. Belgica tiene tambien un tipo intermedio del 12% y uno reducido del 6%.' }, { q: 'Que productos tienen el 6% de IVA?', a: 'El 6% se aplica a alimentos, agua, farmacos, libros, periodicos, transporte de pasajeros y renovaciones.' }, { q: 'Para que es el tipo del 12%?', a: 'El 12% se aplica a viviendas sociales, comidas en restaurantes (solo comida) y margarina.' }, { q: 'Cada cuanto se declara el IVA en Belgica?', a: 'Mensualmente si la facturacion supera los 2,5 millones, trimestralmente en caso contrario.' }] },
    fr: { title: 'TVA en Belgique: Taux et Regles', paragraphs: ['La Belgique applique trois taux de TVA. Le taux normal est de 21%. Le taux de 12% s\'applique aux logements sociaux et repas au restaurant (nourriture uniquement). Le taux reduit de 6% couvre les aliments, l\'eau, les medicaments, les livres, les journaux, les transports de voyageurs et les renovations de logements de plus de 10 ans.', 'Les declarations sont mensuelles pour les entreprises depassant 2,5 millions de chiffre d\'affaires, trimestrielles sinon.', 'Utilisez notre calculateur pour la TVA belge. Combinez avec notre <a href="/fr/tools/invoice-calculator">calculateur de factures</a>.'], faq: [{ q: 'Quel est le taux de TVA standard en Belgique?', a: 'Le taux standard est de 21%. La Belgique a aussi un taux intermediaire de 12% et un taux reduit de 6%.' }, { q: 'Quels produits ont 6% de TVA?', a: 'Le 6% s\'applique aux aliments, eau, medicaments, livres, journaux, transports de voyageurs et renovations.' }, { q: 'A quoi sert le taux de 12%?', a: 'Le 12% s\'applique aux logements sociaux, repas au restaurant (nourriture uniquement) et margarine.' }, { q: 'A quelle frequence declare-t-on la TVA en Belgique?', a: 'Mensuellement si le chiffre d\'affaires depasse 2,5 millions, trimestriellement sinon.' }] },
    de: { title: 'MwSt in Belgien: Saetze und Regeln BTW/TVA', paragraphs: ['Belgien wendet drei MwSt-Saetze an. Der Regelsatz betraegt 21%. Der 12%-Satz gilt fuer Sozialwohnungen und Restaurantmahlzeiten (nur Essen). Der ermaessigte Satz von 6% umfasst Lebensmittel, Wasser, Medikamente, Buecher, Zeitungen, Personentransport und Renovierungen von Wohnungen ueber 10 Jahre.', 'Erklaerungen sind monatlich fuer Unternehmen ueber 2,5 Millionen Umsatz, vierteljaehrlich fuer andere.', 'Verwenden Sie unseren Rechner fuer die belgische BTW/TVA. Kombinieren Sie ihn mit unserem <a href="/de/tools/invoice-calculator">Rechnungsrechner</a>.'], faq: [{ q: 'Wie hoch ist der MwSt-Regelsatz in Belgien?', a: 'Der Regelsatz betraegt 21%. Belgien hat auch einen Zwischensatz von 12% und einen ermaessigten Satz von 6%.' }, { q: 'Welche Gueter haben 6% MwSt?', a: 'Der 6% gilt fuer Lebensmittel, Wasser, Medikamente, Buecher, Zeitungen und Renovierungen.' }, { q: 'Wofuer gilt der 12%-Satz?', a: 'Der 12% gilt fuer Sozialwohnungen, Restaurantmahlzeiten (nur Essen) und Margarine.' }, { q: 'Wie oft muss man in Belgien MwSt erklaeren?', a: 'Monatlich bei ueber 2,5 Millionen Umsatz, vierteljaehrlich sonst.' }] },
    pt: { title: 'IVA na Belgica: Taxas e Regras BTW/TVA', paragraphs: ['A Belgica aplica tres taxas de IVA. A taxa normal e de 21%. A taxa de 12% aplica-se a habitacao social e refeicoes em restaurante (so comida). A taxa reduzida de 6% cobre alimentos, agua, medicamentos, livros, jornais, transporte de passageiros e renovacoes de habitacoes com mais de 10 anos.', 'As declaracoes sao mensais para empresas acima de 2,5 milhoes, trimestrais para as restantes.', 'Use a nossa calculadora para a BTW/TVA belga. Combine com a nossa <a href="/pt/tools/invoice-calculator">calculadora de faturas</a>.'], faq: [{ q: 'Qual e a taxa de IVA normal na Belgica?', a: 'A taxa normal e de 21%. A Belgica tem tambem uma taxa intermedia de 12% e uma reduzida de 6%.' }, { q: 'Que produtos tem 6% de IVA?', a: 'Os 6% aplicam-se a alimentos, agua, medicamentos, livros, jornais, transporte de passageiros e renovacoes.' }, { q: 'Para que serve a taxa de 12%?', a: 'Os 12% aplicam-se a habitacao social, refeicoes em restaurante (so comida) e margarina.' }, { q: 'Com que frequencia se declara o IVA na Belgica?', a: 'Mensalmente acima de 2,5 milhoes, trimestralmente caso contrario.' }] },
  },
  portugal: {
    en: {
      title: 'VAT in Portugal: Rates, Rules & How to Calculate IVA',
      paragraphs: [
        'Portugal applies three VAT (IVA) rates on the mainland. The standard rate is 23%, one of the highest in Europe. The intermediate rate of 13% applies to certain food products (canned goods, margarine), wine, agricultural inputs, and admission to cultural events. The reduced rate of 6% covers essential food products (milk, bread, fruit, vegetables, cereals, meat, fish), water, pharmaceuticals, books, newspapers, hotel accommodation, passenger transport, and energy supplies for domestic use.',
        'The Portuguese Tax Authority (Autoridade Tributaria e Aduaneira, AT) administers VAT. The Azores and Madeira autonomous regions have lower rates: the Azores applies 16%, 9%, and 4%, while Madeira applies 22%, 12%, and 5%. VAT returns are filed monthly for businesses with annual turnover above 650,000 euros, and quarterly for smaller businesses. Portugal uses the e-fatura electronic invoicing system for tax compliance.',
        'Use our calculator to compute Portuguese IVA instantly. For invoicing, try our <a href="/en/tools/invoice-calculator">invoice calculator</a> or use our <a href="/en/tools/percentage-calculator">percentage calculator</a>.',
      ],
      faq: [
        { q: 'What is the standard VAT rate in Portugal?', a: 'The standard IVA rate in mainland Portugal is 23%. The intermediate rate is 13% and the reduced rate is 6%.' },
        { q: 'Which goods have 6% IVA in Portugal?', a: 'The 6% rate applies to essential foods (bread, milk, fruit, vegetables, meat, fish), water, pharmaceuticals, books, newspapers, hotels, and public transport.' },
        { q: 'Do the Azores and Madeira have different rates?', a: 'Yes. The Azores applies 16%, 9%, and 4%. Madeira applies 22%, 12%, and 5%.' },
        { q: 'How often must I file VAT returns in Portugal?', a: 'Monthly if annual turnover exceeds 650,000 euros, quarterly otherwise.' },
      ],
    },
    it: { title: 'IVA in Portogallo: Aliquote e Regole', paragraphs: ['Il Portogallo applica tre aliquote IVA sulla terraferma. L\'aliquota ordinaria e del 23%. L\'aliquota intermedia del 13% si applica a certi prodotti alimentari e vino. L\'aliquota ridotta del 6% copre alimenti essenziali, acqua, farmaci, libri e trasporto passeggeri.', 'Le Azzorre e Madeira hanno aliquote ridotte. Le dichiarazioni sono mensili per imprese sopra i 650.000 euro, trimestrali per le altre.', 'Usa il nostro calcolatore per l\'IVA portoghese. Abbinalo al nostro <a href="/it/tools/invoice-calculator">calcolatore fatture</a>.'], faq: [{ q: 'Qual e l\'aliquota IVA standard in Portogallo?', a: 'L\'aliquota standard e del 23%. L\'intermedia e del 13% e la ridotta del 6%.' }, { q: 'Quali beni hanno il 6% di IVA?', a: 'Il 6% si applica a pane, latte, frutta, verdura, carne, pesce, acqua, farmaci e libri.' }, { q: 'Le Azzorre e Madeira hanno aliquote diverse?', a: 'Si. Le Azzorre applicano 16%, 9% e 4%. Madeira applica 22%, 12% e 5%.' }, { q: 'Ogni quanto si dichiara l\'IVA?', a: 'Mensilmente se il fatturato supera 650.000 euro, trimestralmente altrimenti.' }] },
    es: { title: 'IVA en Portugal: Tipos y Reglas', paragraphs: ['Portugal aplica tres tipos de IVA en el continente. El tipo general es del 23%. El tipo intermedio del 13% se aplica a ciertos alimentos y vino. El tipo reducido del 6% cubre alimentos esenciales, agua, farmacos, libros y transporte de pasajeros.', 'Azores y Madeira tienen tipos reducidos. Las declaraciones son mensuales para empresas sobre 650.000 euros, trimestrales para las demas.', 'Utiliza nuestra calculadora para el IVA portugues. Combinala con nuestra <a href="/es/tools/invoice-calculator">calculadora de facturas</a>.'], faq: [{ q: 'Cual es el tipo de IVA general en Portugal?', a: 'El tipo general es del 23%. El intermedio es del 13% y el reducido del 6%.' }, { q: 'Que productos tienen el 6% de IVA?', a: 'El 6% se aplica a pan, leche, frutas, verduras, carne, pescado, agua, farmacos y libros.' }, { q: 'Azores y Madeira tienen tipos diferentes?', a: 'Si. Azores aplica 16%, 9% y 4%. Madeira aplica 22%, 12% y 5%.' }, { q: 'Cada cuanto se declara el IVA?', a: 'Mensualmente si supera 650.000 euros, trimestralmente en caso contrario.' }] },
    fr: { title: 'TVA au Portugal: Taux et Regles', paragraphs: ['Le Portugal applique trois taux de TVA sur le continent. Le taux normal est de 23%. Le taux intermediaire de 13% s\'applique a certains aliments et au vin. Le taux reduit de 6% couvre les aliments essentiels, l\'eau, les medicaments, les livres et les transports de voyageurs.', 'Les Acores et Madere ont des taux reduits. Les declarations sont mensuelles au-dessus de 650 000 euros, trimestrielles sinon.', 'Utilisez notre calculateur pour la TVA portugaise. Combinez avec notre <a href="/fr/tools/invoice-calculator">calculateur de factures</a>.'], faq: [{ q: 'Quel est le taux de TVA standard au Portugal?', a: 'Le taux standard est de 23%. L\'intermediaire est de 13% et le reduit de 6%.' }, { q: 'Quels produits ont 6% de TVA?', a: 'Le 6% s\'applique au pain, lait, fruits, legumes, viande, poisson, eau, medicaments et livres.' }, { q: 'Les Acores et Madere ont-ils des taux differents?', a: 'Oui. Les Acores appliquent 16%, 9% et 4%. Madere applique 22%, 12% et 5%.' }, { q: 'A quelle frequence declare-t-on la TVA?', a: 'Mensuellement au-dessus de 650 000 euros, trimestriellement sinon.' }] },
    de: { title: 'MwSt in Portugal: Saetze und Regeln', paragraphs: ['Portugal wendet drei MwSt-Saetze auf dem Festland an. Der Regelsatz betraegt 23%. Der Zwischensatz von 13% gilt fuer bestimmte Lebensmittel und Wein. Der ermaessigte Satz von 6% umfasst Grundnahrungsmittel, Wasser, Medikamente, Buecher und Personentransport.', 'Die Azoren und Madeira haben niedrigere Saetze. Erklaerungen sind monatlich ueber 650.000 Euro, vierteljaehrlich sonst.', 'Verwenden Sie unseren Rechner fuer die portugiesische MwSt. Kombinieren Sie ihn mit unserem <a href="/de/tools/invoice-calculator">Rechnungsrechner</a>.'], faq: [{ q: 'Wie hoch ist der MwSt-Regelsatz in Portugal?', a: 'Der Regelsatz betraegt 23%. Der Zwischensatz ist 13%, der ermaessigte 6%.' }, { q: 'Welche Gueter haben 6% MwSt?', a: 'Der 6% gilt fuer Brot, Milch, Obst, Gemuese, Fleisch, Fisch, Wasser, Medikamente und Buecher.' }, { q: 'Haben die Azoren und Madeira andere Saetze?', a: 'Ja. Die Azoren wenden 16%, 9% und 4% an. Madeira wendet 22%, 12% und 5% an.' }, { q: 'Wie oft muss man MwSt erklaeren?', a: 'Monatlich ueber 650.000 Euro, vierteljaehrlich sonst.' }] },
    pt: { title: 'IVA em Portugal: Taxas e Regras', paragraphs: ['Portugal aplica tres taxas de IVA no continente. A taxa normal e de 23%, uma das mais altas da Europa. A taxa intermedia de 13% aplica-se a certos produtos alimentares e vinho. A taxa reduzida de 6% cobre alimentos essenciais (pao, leite, fruta, legumes, carne, peixe), agua, medicamentos, livros, jornais e transporte de passageiros.', 'Os Acores e a Madeira tem taxas mais baixas: Acores aplica 16%, 9% e 4%; Madeira aplica 22%, 12% e 5%. As declaracoes sao mensais acima de 650.000 euros, trimestrais para as restantes. Portugal utiliza o sistema e-fatura para conformidade fiscal.', 'Use a nossa calculadora para o IVA portugues. Combine com a nossa <a href="/pt/tools/invoice-calculator">calculadora de faturas</a> ou a nossa <a href="/pt/tools/percentage-calculator">calculadora de percentagem</a>.'], faq: [{ q: 'Qual e a taxa de IVA normal em Portugal?', a: 'A taxa normal e de 23% no continente. A taxa intermedia e de 13% e a reduzida de 6%.' }, { q: 'Que produtos tem 6% de IVA?', a: 'Os 6% aplicam-se a pao, leite, fruta, legumes, carne, peixe, agua, medicamentos, livros e jornais.' }, { q: 'Os Acores e a Madeira tem taxas diferentes?', a: 'Sim. Os Acores aplicam 16%, 9% e 4%. A Madeira aplica 22%, 12% e 5%.' }, { q: 'Com que frequencia se declara o IVA?', a: 'Mensalmente acima de 650.000 euros, trimestralmente caso contrario.' }] },
  },
  austria: {
    en: {
      title: 'VAT in Austria: Rates, Rules & How to Calculate USt',
      paragraphs: [
        'Austria applies three VAT (Umsatzsteuer/USt) rates. The standard rate is 20%, covering most goods and services. The reduced rate of 10% applies to food, books, newspapers, passenger transport, accommodation, cultural admissions, and domestic waste removal. A special reduced rate of 13% applies to admission to sporting events, live theatrical and musical performances, wine from the producer, firewood, plants, and certain agricultural products.',
        'The Austrian Federal Ministry of Finance (BMF) administers VAT. Businesses must register if annual turnover exceeds 35,000 euros (Kleinunternehmerregelung threshold). VAT returns are filed monthly for businesses with prior-year turnover above 100,000 euros, and quarterly for smaller businesses. An annual return (Umsatzsteuererklarung) is always required.',
        'Use our calculator to compute Austrian USt instantly. For invoicing, try our <a href="/en/tools/invoice-calculator">invoice calculator</a> or use our <a href="/en/tools/percentage-calculator">percentage calculator</a>.',
      ],
      faq: [
        { q: 'What is the standard VAT rate in Austria?', a: 'The standard USt rate in Austria is 20%. Reduced rates are 10% and 13%.' },
        { q: 'Which goods have 10% USt?', a: 'The 10% rate applies to food, books, newspapers, passenger transport, accommodation, cultural admissions, and waste removal.' },
        { q: 'What is the 13% rate for?', a: 'The 13% rate applies to sporting events, live performances, wine from the producer, firewood, plants, and certain agricultural products.' },
        { q: 'When must I register for VAT in Austria?', a: 'When annual turnover exceeds 35,000 euros. Below this threshold, the Kleinunternehmerregelung exemption applies.' },
      ],
    },
    it: { title: 'IVA in Austria: Aliquote e Regole USt', paragraphs: ['L\'Austria applica tre aliquote IVA (Umsatzsteuer/USt). L\'aliquota ordinaria e del 20%. L\'aliquota ridotta del 10% si applica a prodotti alimentari, libri, giornali, trasporto passeggeri e alloggi. L\'aliquota speciale del 13% si applica a eventi sportivi, spettacoli dal vivo, vino del produttore e legna da ardere.', 'Le imprese devono registrarsi se il fatturato annuo supera i 35.000 euro. Le dichiarazioni sono mensili sopra i 100.000 euro, trimestrali sotto.', 'Usa il nostro calcolatore per l\'USt austriaca. Abbinalo al nostro <a href="/it/tools/invoice-calculator">calcolatore fatture</a>.'], faq: [{ q: 'Qual e l\'aliquota IVA standard in Austria?', a: 'L\'aliquota USt standard e del 20%. Le aliquote ridotte sono 10% e 13%.' }, { q: 'Quali beni hanno il 10% di USt?', a: 'Il 10% si applica a prodotti alimentari, libri, giornali, trasporto passeggeri e alloggi.' }, { q: 'A cosa si applica il 13%?', a: 'Il 13% si applica a eventi sportivi, spettacoli dal vivo, vino del produttore e legna da ardere.' }, { q: 'Quando registrarsi per l\'IVA in Austria?', a: 'Quando il fatturato annuo supera i 35.000 euro.' }] },
    es: { title: 'IVA en Austria: Tipos y Reglas USt', paragraphs: ['Austria aplica tres tipos de IVA (Umsatzsteuer/USt). El tipo general es del 20%. El tipo reducido del 10% se aplica a alimentos, libros, periodicos, transporte de pasajeros y alojamiento. El tipo especial del 13% se aplica a eventos deportivos, espectaculos en vivo, vino del productor y leña.', 'Las empresas deben registrarse si la facturacion anual supera los 35.000 euros.', 'Utiliza nuestra calculadora para la USt austriaca. Combinala con nuestra <a href="/es/tools/invoice-calculator">calculadora de facturas</a>.'], faq: [{ q: 'Cual es el tipo de IVA general en Austria?', a: 'El tipo USt general es del 20%. Los tipos reducidos son 10% y 13%.' }, { q: 'Que productos tienen el 10% de USt?', a: 'El 10% se aplica a alimentos, libros, periodicos, transporte de pasajeros y alojamiento.' }, { q: 'Para que es el tipo del 13%?', a: 'El 13% se aplica a eventos deportivos, espectaculos en vivo, vino del productor y leña.' }, { q: 'Cuando registrarse para el IVA en Austria?', a: 'Cuando la facturacion anual supera los 35.000 euros.' }] },
    fr: { title: 'TVA en Autriche: Taux et Regles USt', paragraphs: ['L\'Autriche applique trois taux de TVA (Umsatzsteuer/USt). Le taux normal est de 20%. Le taux reduit de 10% s\'applique aux aliments, livres, journaux, transports de voyageurs et hebergement. Le taux special de 13% s\'applique aux evenements sportifs, spectacles vivants, vin du producteur et bois de chauffage.', 'Les entreprises doivent s\'enregistrer si le chiffre d\'affaires annuel depasse 35 000 euros.', 'Utilisez notre calculateur pour la USt autrichienne. Combinez avec notre <a href="/fr/tools/invoice-calculator">calculateur de factures</a>.'], faq: [{ q: 'Quel est le taux de TVA standard en Autriche?', a: 'Le taux USt standard est de 20%. Les taux reduits sont 10% et 13%.' }, { q: 'Quels produits ont 10% de USt?', a: 'Le 10% s\'applique aux aliments, livres, journaux, transports de voyageurs et hebergement.' }, { q: 'A quoi sert le taux de 13%?', a: 'Le 13% s\'applique aux evenements sportifs, spectacles vivants, vin du producteur et bois de chauffage.' }, { q: 'Quand faut-il s\'enregistrer pour la TVA en Autriche?', a: 'Quand le chiffre d\'affaires annuel depasse 35 000 euros.' }] },
    de: { title: 'Umsatzsteuer in Oesterreich: Saetze, Regeln und Berechnung', paragraphs: ['Oesterreich wendet drei USt-Saetze an. Der Regelsatz betraegt 20% fuer die meisten Waren und Dienstleistungen. Der ermaessigte Satz von 10% gilt fuer Lebensmittel, Buecher, Zeitungen, Personentransport, Unterkuenfte und kulturelle Eintritte. Der besondere ermaessigte Satz von 13% gilt fuer Sportveranstaltungen, Live-Auffuehrungen, Wein ab Hof, Brennholz, Pflanzen und bestimmte landwirtschaftliche Produkte.', 'Unternehmen muessen sich registrieren, wenn der Jahresumsatz 35.000 Euro uebersteigt (Kleinunternehmerregelung-Schwelle). USt-Erklaerungen sind monatlich bei Vorjahresumsatz ueber 100.000 Euro, vierteljaehrlich bei kleineren Unternehmen.', 'Verwenden Sie unseren Rechner fuer die oesterreichische USt. Kombinieren Sie ihn mit unserem <a href="/de/tools/invoice-calculator">Rechnungsrechner</a> oder unserem <a href="/de/tools/percentage-calculator">Prozentrechner</a>.'], faq: [{ q: 'Wie hoch ist der USt-Regelsatz in Oesterreich?', a: 'Der USt-Regelsatz in Oesterreich betraegt 20%. Die ermaessigten Saetze sind 10% und 13%.' }, { q: 'Welche Gueter haben 10% USt?', a: 'Der 10%-Satz gilt fuer Lebensmittel, Buecher, Zeitungen, Personentransport, Unterkuenfte und kulturelle Eintritte.' }, { q: 'Wofuer gilt der 13%-Satz?', a: 'Der 13% gilt fuer Sportveranstaltungen, Live-Auffuehrungen, Wein ab Hof, Brennholz und bestimmte landwirtschaftliche Produkte.' }, { q: 'Wann muss man sich in Oesterreich fuer die USt registrieren?', a: 'Wenn der Jahresumsatz 35.000 Euro uebersteigt.' }] },
    pt: { title: 'IVA na Austria: Taxas e Regras USt', paragraphs: ['A Austria aplica tres taxas de IVA (Umsatzsteuer/USt). A taxa normal e de 20%. A taxa reduzida de 10% aplica-se a alimentos, livros, jornais, transporte de passageiros e alojamento. A taxa especial de 13% aplica-se a eventos desportivos, espetaculos ao vivo, vinho do produtor e lenha.', 'As empresas devem registar-se se a faturacao anual ultrapassar 35.000 euros.', 'Use a nossa calculadora para a USt austriaca. Combine com a nossa <a href="/pt/tools/invoice-calculator">calculadora de faturas</a>.'], faq: [{ q: 'Qual e a taxa de IVA normal na Austria?', a: 'A taxa USt normal e de 20%. As taxas reduzidas sao 10% e 13%.' }, { q: 'Que produtos tem 10% de USt?', a: 'Os 10% aplicam-se a alimentos, livros, jornais, transporte de passageiros e alojamento.' }, { q: 'Para que serve a taxa de 13%?', a: 'Os 13% aplicam-se a eventos desportivos, espetaculos ao vivo, vinho do produtor e lenha.' }, { q: 'Quando e preciso registar-se na Austria?', a: 'Quando a faturacao anual ultrapassa 35.000 euros.' }] },
  },
  sweden: {
    en: {
      title: 'VAT in Sweden: Rates, Rules & How to Calculate Moms',
      paragraphs: [
        'Sweden applies three VAT (Moms - Mervardeskatt) rates. The standard rate is 25%, one of the highest in the world. The reduced rate of 12% applies to food and beverages (excluding alcohol), restaurant and catering services, hotel accommodation, and camping. The super-reduced rate of 6% covers newspapers, magazines, books, public transport, admission to cultural events, concerts, cinemas, zoos, and sports events.',
        'The Swedish Tax Agency (Skatteverket) administers VAT. All businesses conducting taxable activities must register for VAT regardless of turnover. VAT returns are filed monthly for businesses with annual turnover above 40 million SEK, quarterly for turnover between 1 million and 40 million SEK, and annually for smaller businesses. Sweden was one of the first EU countries to implement real-time digital tax reporting.',
        'Use our calculator to compute Swedish Moms instantly. The currency used is Swedish Krona (SEK). For invoicing, try our <a href="/en/tools/invoice-calculator">invoice calculator</a> or use our <a href="/en/tools/percentage-calculator">percentage calculator</a>.',
      ],
      faq: [
        { q: 'What is the standard VAT rate in Sweden?', a: 'The standard Moms rate in Sweden is 25%. Reduced rates are 12% and 6%.' },
        { q: 'Which goods have 12% Moms?', a: 'The 12% rate applies to food and non-alcoholic beverages, restaurant and catering services, hotel accommodation, and camping.' },
        { q: 'What is the 6% rate for?', a: 'The 6% rate applies to newspapers, magazines, books, public transport, cultural events, concerts, cinemas, and sports events.' },
        { q: 'How often must I file VAT returns in Sweden?', a: 'Monthly above 40 million SEK turnover, quarterly between 1-40 million SEK, annually below 1 million SEK.' },
      ],
    },
    it: { title: 'IVA in Svezia: Aliquote e Regole Moms', paragraphs: ['La Svezia applica tre aliquote IVA (Moms). L\'aliquota ordinaria e del 25%, una delle piu alte al mondo. L\'aliquota ridotta del 12% si applica a prodotti alimentari, ristorazione e alloggi. L\'aliquota super-ridotta del 6% copre giornali, riviste, libri, trasporto pubblico e eventi culturali.', 'Lo Skatteverket amministra l\'IVA svedese. La valuta e la Corona Svedese (SEK).', 'Usa il nostro calcolatore per la Moms svedese. Abbinalo al nostro <a href="/it/tools/invoice-calculator">calcolatore fatture</a>.'], faq: [{ q: 'Qual e l\'aliquota IVA standard in Svezia?', a: 'L\'aliquota Moms standard e del 25%. Le aliquote ridotte sono 12% e 6%.' }, { q: 'Quali beni hanno il 12% di Moms?', a: 'Il 12% si applica ad alimenti, bevande non alcoliche, ristorazione e alloggi.' }, { q: 'A cosa si applica il 6%?', a: 'Il 6% si applica a giornali, riviste, libri, trasporto pubblico e eventi culturali.' }, { q: 'Ogni quanto si dichiara l\'IVA in Svezia?', a: 'Mensilmente sopra 40 milioni SEK, trimestralmente tra 1-40 milioni, annualmente sotto 1 milione.' }] },
    es: { title: 'IVA en Suecia: Tipos y Reglas Moms', paragraphs: ['Suecia aplica tres tipos de IVA (Moms). El tipo general es del 25%, uno de los mas altos del mundo. El tipo reducido del 12% se aplica a alimentos, restauracion y alojamiento. El tipo superreducido del 6% cubre periodicos, revistas, libros, transporte publico y eventos culturales.', 'El Skatteverket administra el IVA sueco. La moneda es la Corona Sueca (SEK).', 'Utiliza nuestra calculadora para la Moms sueca. Combinala con nuestra <a href="/es/tools/invoice-calculator">calculadora de facturas</a>.'], faq: [{ q: 'Cual es el tipo de IVA general en Suecia?', a: 'El tipo Moms general es del 25%. Los tipos reducidos son 12% y 6%.' }, { q: 'Que productos tienen el 12% de Moms?', a: 'El 12% se aplica a alimentos, bebidas no alcoholicas, restauracion y alojamiento.' }, { q: 'Para que es el tipo del 6%?', a: 'El 6% se aplica a periodicos, revistas, libros, transporte publico y eventos culturales.' }, { q: 'Cada cuanto se declara el IVA en Suecia?', a: 'Mensualmente sobre 40 millones SEK, trimestralmente entre 1-40 millones, anualmente bajo 1 millon.' }] },
    fr: { title: 'TVA en Suede: Taux et Regles Moms', paragraphs: ['La Suede applique trois taux de TVA (Moms). Le taux normal est de 25%, l\'un des plus eleves au monde. Le taux reduit de 12% s\'applique aux aliments, restauration et hebergement. Le taux super-reduit de 6% couvre les journaux, magazines, livres, transports publics et evenements culturels.', 'Le Skatteverket administre la TVA suedoise. La monnaie est la Couronne Suedoise (SEK).', 'Utilisez notre calculateur pour la Moms suedoise. Combinez avec notre <a href="/fr/tools/invoice-calculator">calculateur de factures</a>.'], faq: [{ q: 'Quel est le taux de TVA standard en Suede?', a: 'Le taux Moms standard est de 25%. Les taux reduits sont 12% et 6%.' }, { q: 'Quels produits ont 12% de Moms?', a: 'Le 12% s\'applique aux aliments, boissons non alcoolisees, restauration et hebergement.' }, { q: 'A quoi sert le taux de 6%?', a: 'Le 6% s\'applique aux journaux, magazines, livres, transports publics et evenements culturels.' }, { q: 'A quelle frequence declare-t-on la TVA en Suede?', a: 'Mensuellement au-dessus de 40 millions SEK, trimestriellement entre 1-40 millions, annuellement en dessous.' }] },
    de: { title: 'MwSt in Schweden: Saetze und Regeln Moms', paragraphs: ['Schweden wendet drei MwSt-Saetze (Moms) an. Der Regelsatz betraegt 25%, einer der hoechsten weltweit. Der ermaessigte Satz von 12% gilt fuer Lebensmittel, Gastronomie und Unterkuenfte. Der stark ermaessigte Satz von 6% umfasst Zeitungen, Zeitschriften, Buecher, oeffentlichen Nahverkehr und Kulturveranstaltungen.', 'Das Skatteverket verwaltet die schwedische MwSt. Die Waehrung ist die Schwedische Krone (SEK).', 'Verwenden Sie unseren Rechner fuer die schwedische Moms. Kombinieren Sie ihn mit unserem <a href="/de/tools/invoice-calculator">Rechnungsrechner</a>.'], faq: [{ q: 'Wie hoch ist der MwSt-Regelsatz in Schweden?', a: 'Der Moms-Regelsatz betraegt 25%. Die ermaessigten Saetze sind 12% und 6%.' }, { q: 'Welche Gueter haben 12% Moms?', a: 'Der 12% gilt fuer Lebensmittel, alkoholfreie Getraenke, Gastronomie und Unterkuenfte.' }, { q: 'Wofuer gilt der 6%-Satz?', a: 'Der 6% gilt fuer Zeitungen, Zeitschriften, Buecher, oeffentlichen Nahverkehr und Kulturveranstaltungen.' }, { q: 'Wie oft muss man in Schweden MwSt erklaeren?', a: 'Monatlich ueber 40 Millionen SEK, vierteljaehrlich zwischen 1-40 Millionen, jaehrlich unter 1 Million.' }] },
    pt: { title: 'IVA na Suecia: Taxas e Regras Moms', paragraphs: ['A Suecia aplica tres taxas de IVA (Moms). A taxa normal e de 25%, uma das mais altas do mundo. A taxa reduzida de 12% aplica-se a alimentos, restauracao e alojamento. A taxa super-reduzida de 6% cobre jornais, revistas, livros, transporte publico e eventos culturais.', 'O Skatteverket administra o IVA sueco. A moeda e a Coroa Sueca (SEK).', 'Use a nossa calculadora para a Moms sueca. Combine com a nossa <a href="/pt/tools/invoice-calculator">calculadora de faturas</a>.'], faq: [{ q: 'Qual e a taxa de IVA normal na Suecia?', a: 'A taxa Moms normal e de 25%. As taxas reduzidas sao 12% e 6%.' }, { q: 'Que produtos tem 12% de Moms?', a: 'Os 12% aplicam-se a alimentos, bebidas nao alcolicas, restauracao e alojamento.' }, { q: 'Para que serve a taxa de 6%?', a: 'Os 6% aplicam-se a jornais, revistas, livros, transporte publico e eventos culturais.' }, { q: 'Com que frequencia se declara o IVA na Suecia?', a: 'Mensalmente acima de 40 milhoes SEK, trimestralmente entre 1-40 milhoes, anualmente abaixo.' }] },
  },
};

const countries = Object.keys(countryRates);

function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'GBP': return '£';
    case 'SEK': return 'kr';
    default: return '€';
  }
}

export default function VatCalculatorCountry() {
  const { lang, country } = useParams() as { lang: Locale; country: string };
  const toolT = tools['vat-calculator'][lang];

  const countryData = countryRates[country];
  if (!countryData) return null;

  const localizedName = countryNames[country]?.[lang] || countryData.name;
  const currencySymbol = getCurrencySymbol(countryData.currency);
  const vt = (key: string) => vatLabels[key]?.[lang] || vatLabels[key]?.en || key;
  const vatTerm = vatTermByLang[lang] || 'VAT';

  const allRates: number[] = [countryData.rate, countryData.reduced];
  if (countryData.superReduced !== undefined) allRates.push(countryData.superReduced);

  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(countryData.rate);
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [copied, setCopied] = useState(false);
  const [touched, setTouched] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const num = parseFloat(amount) || 0;
  const amountError = touched && amount !== '' && num <= 0;
  const vatAmount = mode === 'add' ? num * (rate / 100) : num - num / (1 + rate / 100);
  const total = mode === 'add' ? num + num * (rate / 100) : num / (1 + rate / 100);

  const handleReset = () => {
    setAmount('');
    setRate(countryData.rate);
    setMode('add');
    setTouched(false);
  };

  const copyResult = () => {
    if (num > 0) {
      const text = `${vatTerm}: ${currencySymbol}${vatAmount.toFixed(2)} | ${mode === 'add' ? vt('totalWithVat') : vt('netAmount')}: ${currencySymbol}${total.toFixed(2)}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const seo = seoContent[country]?.[lang] || seoContent[country]?.en;
  if (!seo) return null;

  const otherCountries = countries.filter(c => c !== country);

  return (
    <ToolPageWrapper toolSlug="vat-calculator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <nav className="text-sm text-gray-500 mb-4">
          <Link href={`/${lang}/tools/vat-calculator`} className="hover:text-blue-600 transition-colors">
            {toolT.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{localizedName}</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {vatTerm} Calculator — {localizedName} ({countryData.rate}%)
        </h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Rate info cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="text-xs text-blue-600 font-medium">{vt('standardRate')}</div>
            <div className="text-2xl font-bold text-blue-700">{countryData.rate}%</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-xs text-green-600 font-medium">{vt('reducedRate')}</div>
            <div className="text-2xl font-bold text-green-700">{countryData.reduced}%</div>
          </div>
          {countryData.superReduced !== undefined && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
              <div className="text-xs text-orange-600 font-medium">{vt('superReducedRate')}</div>
              <div className="text-2xl font-bold text-orange-700">{countryData.superReduced}%</div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('add')}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${mode === 'add' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              + {vt('addVat')}
            </button>
            <button
              onClick={() => setMode('remove')}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${mode === 'remove' ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              - {vt('removeVat')}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{vt('amount')} ({currencySymbol})</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">{currencySymbol}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="0.00"
                className={`w-full border rounded-lg pl-8 pr-4 py-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${amountError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
            </div>
            {amountError && <p className="text-red-500 text-xs mt-1">{vt('invalidAmount')}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{vt('vatRate')}</label>
            <div className="flex gap-2 flex-wrap">
              {allRates.map((r) => (
                <button
                  key={r}
                  onClick={() => setRate(r)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${r === rate ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleReset} className="w-full py-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
            {vt('reset')}
          </button>

          {num > 0 && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <div className="text-xs text-gray-500">{mode === 'add' ? vt('netAmount') : vt('grossAmount')}</div>
                  <div className="text-xl font-bold text-gray-700">{currencySymbol}{num.toFixed(2)}</div>
                </div>
                <div className={`p-4 rounded-xl text-center ${mode === 'add' ? 'bg-green-50 border border-green-100' : 'bg-orange-50 border border-orange-100'}`}>
                  <div className="text-xs text-gray-500">{vatTerm} ({rate}%)</div>
                  <div className={`text-xl font-bold ${mode === 'add' ? 'text-green-700' : 'text-orange-700'}`}>{currencySymbol}{vatAmount.toFixed(2)}</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                  <div className="text-xs text-gray-500">{mode === 'add' ? vt('totalWithVat') : vt('netAmount')}</div>
                  <div className="text-xl font-bold text-blue-700">{currencySymbol}{total.toFixed(2)}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  {mode === 'add' ? (
                    <div className="h-full flex">
                      <div className="bg-blue-500 h-full" style={{ width: `${(num / (num + vatAmount)) * 100}%` }} />
                      <div className="bg-green-500 h-full" style={{ width: `${(vatAmount / (num + vatAmount)) * 100}%` }} />
                    </div>
                  ) : (
                    <div className="h-full flex">
                      <div className="bg-blue-500 h-full" style={{ width: `${(total / num) * 100}%` }} />
                      <div className="bg-orange-500 h-full" style={{ width: `${(vatAmount / num) * 100}%` }} />
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{vt('netAmount')}</span>
                  <span>{vatTerm}</span>
                </div>
              </div>

              <button onClick={copyResult} className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">
                {copied ? vt('copied') : vt('copy')}
              </button>
            </div>
          )}
        </div>

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => (
            <p key={i} className="text-gray-700 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: p }} />
          ))}
        </article>

        {/* FAQ */}
        <section className="mt-10 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">FAQ</h2>
          <div className="space-y-2">
            {seo.faq.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left px-4 py-3 font-medium text-gray-900 flex justify-between items-center">
                  {item.q}
                  <span className="text-gray-400">{openFaq === i ? '\u2212' : '+'}</span>
                </button>
                {openFaq === i && <div className="px-4 pb-3 text-gray-600" dangerouslySetInnerHTML={{ __html: item.a }} />}
              </div>
            ))}
          </div>
        </section>

        {/* Other countries links */}
        <section className="mt-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{vt('otherCountries')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {otherCountries.map(c => (
              <Link
                key={c}
                href={`/${lang}/tools/vat-calculator/${c}`}
                className="px-3 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:text-blue-700 transition-colors text-center"
              >
                {countryNames[c]?.[lang] || countryRates[c].name} ({countryRates[c].rate}%)
              </Link>
            ))}
          </div>
          <div className="mt-4">
            <Link href={`/${lang}/tools/vat-calculator`} className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
              &larr; {vt('backToMain')}
            </Link>
          </div>
        </section>
      </div>
    </ToolPageWrapper>
  );
}
