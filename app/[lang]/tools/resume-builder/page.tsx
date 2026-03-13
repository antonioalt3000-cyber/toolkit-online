'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface Experience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: string[];
}

const emptyResume: ResumeData = {
  name: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  summary: '',
  experience: [],
  education: [],
  skills: [],
  languages: [],
};

type Template = 'classic' | 'modern' | 'minimal';
type ThemeColor = string;

const themeColors: { name: string; value: ThemeColor }[] = [
  { name: 'Blue', value: '#2563eb' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Slate', value: '#475569' },
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function ResumeBuilder() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['resume-builder']?.[lang] || tools['resume-builder']?.en;
  const previewRef = useRef<HTMLDivElement>(null);

  const [resume, setResume] = useState<ResumeData>(emptyResume);
  const [template, setTemplate] = useState<Template>('classic');
  const [color, setColor] = useState<ThemeColor>('#2563eb');
  const [skillInput, setSkillInput] = useState('');
  const [langInput, setLangInput] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const labels: Record<string, Record<Locale, string>> = {
    personalInfo: { en: 'Personal Information', it: 'Informazioni Personali', es: 'Informacion Personal', fr: 'Informations Personnelles', de: 'Persoenliche Daten', pt: 'Informacoes Pessoais' },
    fullName: { en: 'Full Name', it: 'Nome Completo', es: 'Nombre Completo', fr: 'Nom Complet', de: 'Vollstaendiger Name', pt: 'Nome Completo' },
    email: { en: 'Email', it: 'Email', es: 'Email', fr: 'Email', de: 'E-Mail', pt: 'Email' },
    phone: { en: 'Phone', it: 'Telefono', es: 'Telefono', fr: 'Telephone', de: 'Telefon', pt: 'Telefone' },
    location: { en: 'Location', it: 'Localita', es: 'Ubicacion', fr: 'Localisation', de: 'Standort', pt: 'Localizacao' },
    linkedin: { en: 'LinkedIn URL', it: 'URL LinkedIn', es: 'URL LinkedIn', fr: 'URL LinkedIn', de: 'LinkedIn URL', pt: 'URL LinkedIn' },
    summary: { en: 'Professional Summary', it: 'Riepilogo Professionale', es: 'Resumen Profesional', fr: 'Resume Professionnel', de: 'Berufsprofil', pt: 'Resumo Profissional' },
    experience: { en: 'Work Experience', it: 'Esperienza Lavorativa', es: 'Experiencia Laboral', fr: 'Experience Professionnelle', de: 'Berufserfahrung', pt: 'Experiencia Profissional' },
    company: { en: 'Company', it: 'Azienda', es: 'Empresa', fr: 'Entreprise', de: 'Unternehmen', pt: 'Empresa' },
    jobTitle: { en: 'Job Title', it: 'Ruolo', es: 'Cargo', fr: 'Poste', de: 'Position', pt: 'Cargo' },
    startDate: { en: 'Start Date', it: 'Data Inizio', es: 'Fecha Inicio', fr: 'Date Debut', de: 'Anfangsdatum', pt: 'Data Inicio' },
    endDate: { en: 'End Date', it: 'Data Fine', es: 'Fecha Fin', fr: 'Date Fin', de: 'Enddatum', pt: 'Data Fim' },
    description: { en: 'Description', it: 'Descrizione', es: 'Descripcion', fr: 'Description', de: 'Beschreibung', pt: 'Descricao' },
    education: { en: 'Education', it: 'Istruzione', es: 'Educacion', fr: 'Formation', de: 'Ausbildung', pt: 'Educacao' },
    institution: { en: 'Institution', it: 'Istituto', es: 'Institucion', fr: 'Etablissement', de: 'Einrichtung', pt: 'Instituicao' },
    degree: { en: 'Degree', it: 'Titolo di Studio', es: 'Titulo', fr: 'Diplome', de: 'Abschluss', pt: 'Diploma' },
    skills: { en: 'Skills', it: 'Competenze', es: 'Habilidades', fr: 'Competences', de: 'Faehigkeiten', pt: 'Habilidades' },
    languages: { en: 'Languages', it: 'Lingue', es: 'Idiomas', fr: 'Langues', de: 'Sprachen', pt: 'Idiomas' },
    addExperience: { en: 'Add Experience', it: 'Aggiungi Esperienza', es: 'Agregar Experiencia', fr: 'Ajouter Experience', de: 'Erfahrung Hinzufuegen', pt: 'Adicionar Experiencia' },
    addEducation: { en: 'Add Education', it: 'Aggiungi Istruzione', es: 'Agregar Educacion', fr: 'Ajouter Formation', de: 'Ausbildung Hinzufuegen', pt: 'Adicionar Educacao' },
    remove: { en: 'Remove', it: 'Rimuovi', es: 'Eliminar', fr: 'Supprimer', de: 'Entfernen', pt: 'Remover' },
    addSkill: { en: 'Add', it: 'Aggiungi', es: 'Agregar', fr: 'Ajouter', de: 'Hinzufuegen', pt: 'Adicionar' },
    templateStyle: { en: 'Template Style', it: 'Stile Template', es: 'Estilo de Plantilla', fr: 'Style de Modele', de: 'Vorlagenstil', pt: 'Estilo de Modelo' },
    classic: { en: 'Classic', it: 'Classico', es: 'Clasico', fr: 'Classique', de: 'Klassisch', pt: 'Classico' },
    modern: { en: 'Modern', it: 'Moderno', es: 'Moderno', fr: 'Moderne', de: 'Modern', pt: 'Moderno' },
    minimal: { en: 'Minimal', it: 'Minimale', es: 'Minimalista', fr: 'Minimal', de: 'Minimal', pt: 'Minimalista' },
    colorTheme: { en: 'Color Theme', it: 'Tema Colore', es: 'Tema de Color', fr: 'Theme Couleur', de: 'Farbthema', pt: 'Tema de Cor' },
    editTab: { en: 'Edit', it: 'Modifica', es: 'Editar', fr: 'Modifier', de: 'Bearbeiten', pt: 'Editar' },
    previewTab: { en: 'Preview', it: 'Anteprima', es: 'Vista Previa', fr: 'Apercu', de: 'Vorschau', pt: 'Visualizar' },
    exportHtml: { en: 'Export HTML', it: 'Esporta HTML', es: 'Exportar HTML', fr: 'Exporter HTML', de: 'HTML Exportieren', pt: 'Exportar HTML' },
    print: { en: 'Print', it: 'Stampa', es: 'Imprimir', fr: 'Imprimer', de: 'Drucken', pt: 'Imprimir' },
    copyText: { en: 'Copy as Text', it: 'Copia come Testo', es: 'Copiar como Texto', fr: 'Copier en Texte', de: 'Als Text Kopieren', pt: 'Copiar como Texto' },
    copiedMsg: { en: 'Copied!', it: 'Copiato!', es: 'Copiado!', fr: 'Copie!', de: 'Kopiert!', pt: 'Copiado!' },
    save: { en: 'Save', it: 'Salva', es: 'Guardar', fr: 'Sauvegarder', de: 'Speichern', pt: 'Salvar' },
    load: { en: 'Load', it: 'Carica', es: 'Cargar', fr: 'Charger', de: 'Laden', pt: 'Carregar' },
    savedMsg: { en: 'Saved!', it: 'Salvato!', es: 'Guardado!', fr: 'Sauvegarde!', de: 'Gespeichert!', pt: 'Salvo!' },
    clear: { en: 'Clear All', it: 'Cancella Tutto', es: 'Borrar Todo', fr: 'Tout Effacer', de: 'Alles Loeschen', pt: 'Limpar Tudo' },
    present: { en: 'Present', it: 'Presente', es: 'Presente', fr: 'Present', de: 'Aktuell', pt: 'Presente' },
    skillPlaceholder: { en: 'Type a skill and press Add', it: 'Scrivi una competenza e premi Aggiungi', es: 'Escribe una habilidad y presiona Agregar', fr: 'Tapez une competence et appuyez Ajouter', de: 'Faehigkeit eingeben und Hinzufuegen druecken', pt: 'Digite uma habilidade e pressione Adicionar' },
    langPlaceholder: { en: 'Type a language and press Add', it: 'Scrivi una lingua e premi Aggiungi', es: 'Escribe un idioma y presiona Agregar', fr: 'Tapez une langue et appuyez Ajouter', de: 'Sprache eingeben und Hinzufuegen druecken', pt: 'Digite um idioma e pressione Adicionar' },
  };

  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('resume-builder-data');
      if (stored) {
        const parsed = JSON.parse(stored);
        setResume(parsed.resume || emptyResume);
        if (parsed.template) setTemplate(parsed.template);
        if (parsed.color) setColor(parsed.color);
      }
    } catch { /* ignore */ }
  }, []);

  const handleSave = useCallback(() => {
    localStorage.setItem('resume-builder-data', JSON.stringify({ resume, template, color }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [resume, template, color]);

  const handleLoad = useCallback(() => {
    try {
      const stored = localStorage.getItem('resume-builder-data');
      if (stored) {
        const parsed = JSON.parse(stored);
        setResume(parsed.resume || emptyResume);
        if (parsed.template) setTemplate(parsed.template);
        if (parsed.color) setColor(parsed.color);
      }
    } catch { /* ignore */ }
  }, []);

  const handleClear = useCallback(() => {
    setResume(emptyResume);
    setSkillInput('');
    setLangInput('');
  }, []);

  const updateField = (field: keyof ResumeData, value: string) => {
    setResume((prev) => ({ ...prev, [field]: value }));
  };

  // Experience handlers
  const addExperience = () => {
    setResume((prev) => ({
      ...prev,
      experience: [...prev.experience, { id: generateId(), company: '', title: '', startDate: '', endDate: '', description: '' }],
    }));
  };

  const removeExperience = (id: string) => {
    setResume((prev) => ({ ...prev, experience: prev.experience.filter((e) => e.id !== id) }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  };

  // Education handlers
  const addEducation = () => {
    setResume((prev) => ({
      ...prev,
      education: [...prev.education, { id: generateId(), institution: '', degree: '', startDate: '', endDate: '' }],
    }));
  };

  const removeEducation = (id: string) => {
    setResume((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  };

  // Skills handlers
  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !resume.skills.includes(trimmed)) {
      setResume((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setResume((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  // Language handlers
  const addLanguage = () => {
    const trimmed = langInput.trim();
    if (trimmed && !resume.languages.includes(trimmed)) {
      setResume((prev) => ({ ...prev, languages: [...prev.languages, trimmed] }));
      setLangInput('');
    }
  };

  const removeLanguage = (l: string) => {
    setResume((prev) => ({ ...prev, languages: prev.languages.filter((x) => x !== l) }));
  };

  // Generate plain text
  const toPlainText = useCallback((): string => {
    const lines: string[] = [];
    if (resume.name) lines.push(resume.name.toUpperCase());
    const contact = [resume.email, resume.phone, resume.location, resume.linkedin].filter(Boolean).join(' | ');
    if (contact) lines.push(contact);
    if (resume.summary) { lines.push('', t('summary').toUpperCase(), resume.summary); }
    if (resume.experience.length > 0) {
      lines.push('', t('experience').toUpperCase());
      resume.experience.forEach((exp) => {
        lines.push(`${exp.title} - ${exp.company} (${exp.startDate} - ${exp.endDate || t('present')})`);
        if (exp.description) lines.push(exp.description);
        lines.push('');
      });
    }
    if (resume.education.length > 0) {
      lines.push(t('education').toUpperCase());
      resume.education.forEach((edu) => {
        lines.push(`${edu.degree} - ${edu.institution} (${edu.startDate} - ${edu.endDate || t('present')})`);
      });
    }
    if (resume.skills.length > 0) { lines.push('', t('skills').toUpperCase(), resume.skills.join(', ')); }
    if (resume.languages.length > 0) { lines.push('', t('languages').toUpperCase(), resume.languages.join(', ')); }
    return lines.join('\n');
  }, [resume, lang]);

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(toPlainText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate HTML for export
  const generateResumeHtml = useCallback((): string => {
    const c = color;
    const fontFamily = template === 'modern' ? "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" : template === 'minimal' ? "'Courier New', monospace" : "'Georgia', 'Times New Roman', serif";
    const headerBg = template === 'modern' ? c : 'transparent';
    const headerColor = template === 'modern' ? '#ffffff' : c;
    const borderStyle = template === 'classic' ? `border-bottom: 3px solid ${c}` : template === 'modern' ? 'border: none' : `border-bottom: 1px solid #e5e7eb`;
    const sectionBorder = template === 'classic' ? `border-left: 3px solid ${c}; padding-left: 12px` : template === 'modern' ? `border-bottom: 2px solid ${c}; padding-bottom: 4px` : `border-bottom: 1px solid #d1d5db; padding-bottom: 4px`;

    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${resume.name || 'Resume'}</title>
<style>
  @media print { body { margin: 0; } .no-print { display: none; } }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: ${fontFamily}; color: #1f2937; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 30px; }
  .header { ${borderStyle}; padding: 20px; margin-bottom: 20px; background: ${headerBg}; color: ${headerColor}; ${template === 'modern' ? 'border-radius: 8px;' : ''} }
  .header h1 { font-size: 28px; margin-bottom: 8px; ${template === 'minimal' ? 'font-weight: 400; text-transform: uppercase; letter-spacing: 3px;' : ''} }
  .header .contact { font-size: 14px; ${template === 'modern' ? 'opacity: 0.9;' : `color: #6b7280;`} }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 18px; font-weight: 700; color: ${c}; margin-bottom: 10px; ${sectionBorder}; text-transform: uppercase; letter-spacing: 1px; ${template === 'minimal' ? 'font-size: 14px; font-weight: 400;' : ''} }
  .entry { margin-bottom: 14px; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; }
  .entry-title { font-weight: 700; font-size: 16px; }
  .entry-subtitle { color: #6b7280; font-size: 14px; }
  .entry-date { color: #9ca3af; font-size: 13px; }
  .entry-desc { margin-top: 4px; font-size: 14px; color: #374151; }
  .tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .tag { background: ${c}15; color: ${c}; padding: 4px 12px; border-radius: ${template === 'modern' ? '20px' : '4px'}; font-size: 13px; border: 1px solid ${c}30; }
</style></head><body>`;

    html += `<div class="header"><h1>${resume.name}</h1>`;
    const contact = [resume.email, resume.phone, resume.location, resume.linkedin].filter(Boolean).join(' &middot; ');
    if (contact) html += `<div class="contact">${contact}</div>`;
    html += `</div>`;

    if (resume.summary) {
      html += `<div class="section"><div class="section-title">${t('summary')}</div><p style="font-size:14px;color:#374151">${resume.summary}</p></div>`;
    }

    if (resume.experience.length > 0) {
      html += `<div class="section"><div class="section-title">${t('experience')}</div>`;
      resume.experience.forEach((exp) => {
        html += `<div class="entry"><div class="entry-header"><div><span class="entry-title">${exp.title}</span> <span class="entry-subtitle">- ${exp.company}</span></div><span class="entry-date">${exp.startDate} - ${exp.endDate || t('present')}</span></div>`;
        if (exp.description) html += `<div class="entry-desc">${exp.description}</div>`;
        html += `</div>`;
      });
      html += `</div>`;
    }

    if (resume.education.length > 0) {
      html += `<div class="section"><div class="section-title">${t('education')}</div>`;
      resume.education.forEach((edu) => {
        html += `<div class="entry"><div class="entry-header"><div><span class="entry-title">${edu.degree}</span> <span class="entry-subtitle">- ${edu.institution}</span></div><span class="entry-date">${edu.startDate} - ${edu.endDate || t('present')}</span></div></div>`;
      });
      html += `</div>`;
    }

    if (resume.skills.length > 0) {
      html += `<div class="section"><div class="section-title">${t('skills')}</div><div class="tags">`;
      resume.skills.forEach((s) => { html += `<span class="tag">${s}</span>`; });
      html += `</div></div>`;
    }

    if (resume.languages.length > 0) {
      html += `<div class="section"><div class="section-title">${t('languages')}</div><div class="tags">`;
      resume.languages.forEach((l) => { html += `<span class="tag">${l}</span>`; });
      html += `</div></div>`;
    }

    html += `</body></html>`;
    return html;
  }, [resume, template, color, lang]);

  const handleExportHtml = () => {
    const html = generateResumeHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.name || 'resume'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const html = generateResumeHtml();
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); }, 500);
    }
  };

  // SEO Content
  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Online Resume Builder -- Create Professional Resumes Instantly',
      paragraphs: [
        'Creating a professional resume can be the difference between landing your dream job and getting lost in the application pile. Our free online resume builder gives you all the tools you need to craft a polished, professional CV in minutes -- no sign-up required.',
        'The tool supports multiple sections including personal information, professional summary, work experience, education, skills, and languages. You can add as many experience and education entries as you need, making it suitable for both entry-level candidates and seasoned professionals.',
        'Choose from three distinct template styles -- Classic (traditional serif fonts), Modern (clean sans-serif with color header), and Minimal (monospace, understated elegance). Each template can be customized with six different color themes to match your personal brand.',
        'Your resume data is processed entirely in your browser. Nothing is sent to any server, ensuring complete privacy. You can save your progress to local storage and come back to it later. When you are ready, export as HTML for pixel-perfect formatting, print directly from the browser, or copy as plain text for job application forms.',
      ],
      faq: [
        { q: 'Is this resume builder really free?', a: 'Yes, 100% free with no hidden costs, no watermarks, and no registration required. All features including export, print, and all templates are available at no charge.' },
        { q: 'Can I save my resume and edit it later?', a: 'Yes. Click the Save button to store your resume data in your browser local storage. When you return to the page, click Load to restore your progress. Your data never leaves your device.' },
        { q: 'What export formats are available?', a: 'You can export your resume as an HTML file (which can be opened in any browser and printed to PDF), print it directly using your browser print dialog, or copy it as plain text for pasting into online application forms.' },
        { q: 'Is my personal data secure?', a: 'Absolutely. All processing happens in your browser using JavaScript. No data is sent to any server. Your resume information stays on your device at all times.' },
        { q: 'Which template should I choose?', a: 'Classic is ideal for traditional industries like finance, law, and academia. Modern works well for tech, marketing, and creative roles. Minimal is great for design-focused roles or when you want a clean, understated look.' },
      ],
    },
    it: {
      title: 'Generatore di Curriculum Online Gratuito -- Crea CV Professionali Istantaneamente',
      paragraphs: [
        'Creare un curriculum professionale puo fare la differenza tra ottenere il lavoro dei tuoi sogni e perdersi nella pila di candidature. Il nostro generatore di curriculum online gratuito ti offre tutti gli strumenti per creare un CV professionale in pochi minuti, senza registrazione.',
        'Lo strumento supporta diverse sezioni: informazioni personali, riepilogo professionale, esperienza lavorativa, istruzione, competenze e lingue. Puoi aggiungere quante esperienze e titoli di studio desideri, rendendolo adatto sia a candidati junior che a professionisti esperti.',
        'Scegli tra tre stili di template: Classico (font serif tradizionali), Moderno (sans-serif pulito con header colorato) e Minimale (monospace, eleganza discreta). Ogni template puo essere personalizzato con sei temi di colore diversi per adattarsi al tuo brand personale.',
        'I dati del tuo curriculum vengono elaborati interamente nel tuo browser. Nulla viene inviato a nessun server, garantendo completa privacy. Puoi salvare i tuoi progressi nella memoria locale e tornarci in seguito. Quando sei pronto, esporta in HTML, stampa direttamente dal browser o copia come testo semplice per i moduli di candidatura.',
      ],
      faq: [
        { q: 'Questo generatore di curriculum e davvero gratuito?', a: 'Si, 100% gratuito senza costi nascosti, senza filigrane e senza registrazione. Tutte le funzionalita, inclusi esportazione, stampa e tutti i template, sono disponibili gratuitamente.' },
        { q: 'Posso salvare il mio curriculum e modificarlo dopo?', a: 'Si. Clicca il pulsante Salva per memorizzare i dati del tuo CV nella memoria locale del browser. Quando torni alla pagina, clicca Carica per ripristinare i tuoi progressi.' },
        { q: 'Quali formati di esportazione sono disponibili?', a: 'Puoi esportare il tuo curriculum come file HTML (apribile in qualsiasi browser e stampabile in PDF), stamparlo direttamente dalla finestra di stampa del browser, o copiarlo come testo semplice per i moduli online.' },
        { q: 'I miei dati personali sono al sicuro?', a: 'Assolutamente. Tutta l\'elaborazione avviene nel tuo browser tramite JavaScript. Nessun dato viene inviato a nessun server. Le informazioni del tuo curriculum restano sempre sul tuo dispositivo.' },
        { q: 'Quale template dovrei scegliere?', a: 'Classico e ideale per settori tradizionali come finanza, legge e accademia. Moderno funziona bene per tech, marketing e ruoli creativi. Minimale e ottimo per ruoli orientati al design.' },
      ],
    },
    es: {
      title: 'Generador de Curriculum Online Gratis -- Crea CVs Profesionales al Instante',
      paragraphs: [
        'Crear un curriculum profesional puede ser la diferencia entre conseguir el trabajo de tus suenos y perderte en la pila de solicitudes. Nuestro generador de curriculum online gratuito te da todas las herramientas para crear un CV pulido y profesional en minutos, sin registro.',
        'La herramienta soporta multiples secciones: informacion personal, resumen profesional, experiencia laboral, educacion, habilidades e idiomas. Puedes agregar tantas experiencias y titulos como necesites, haciendolo adecuado tanto para candidatos principiantes como para profesionales experimentados.',
        'Elige entre tres estilos de plantilla: Clasico (fuentes serif tradicionales), Moderno (sans-serif limpio con encabezado de color) y Minimalista (monospace, elegancia discreta). Cada plantilla puede personalizarse con seis temas de color diferentes.',
        'Los datos de tu curriculum se procesan completamente en tu navegador. Nada se envia a ningun servidor, garantizando completa privacidad. Puedes guardar tu progreso en almacenamiento local y volver despues. Cuando estes listo, exporta como HTML, imprime directamente o copia como texto plano.',
      ],
      faq: [
        { q: 'Es realmente gratis este generador de curriculum?', a: 'Si, 100% gratis sin costos ocultos, sin marcas de agua y sin registro requerido. Todas las funciones estan disponibles sin cargo.' },
        { q: 'Puedo guardar mi curriculum y editarlo despues?', a: 'Si. Haz clic en el boton Guardar para almacenar los datos de tu CV en el almacenamiento local del navegador. Cuando regreses, haz clic en Cargar para restaurar tu progreso.' },
        { q: 'Que formatos de exportacion estan disponibles?', a: 'Puedes exportar tu curriculum como archivo HTML, imprimirlo directamente desde el navegador, o copiarlo como texto plano para formularios de solicitud en linea.' },
        { q: 'Mis datos personales estan seguros?', a: 'Absolutamente. Todo el procesamiento ocurre en tu navegador usando JavaScript. Ningun dato se envia a ningun servidor.' },
        { q: 'Que plantilla deberia elegir?', a: 'Clasico es ideal para industrias tradicionales como finanzas, derecho y academia. Moderno funciona bien para tecnologia, marketing y roles creativos. Minimalista es genial para roles orientados al diseno.' },
      ],
    },
    fr: {
      title: 'Generateur de CV en Ligne Gratuit -- Creez des CV Professionnels Instantanement',
      paragraphs: [
        'Creer un CV professionnel peut faire la difference entre decrocher l\'emploi de vos reves et se perdre dans la pile de candidatures. Notre generateur de CV en ligne gratuit vous donne tous les outils pour creer un CV soigne et professionnel en quelques minutes, sans inscription.',
        'L\'outil prend en charge plusieurs sections: informations personnelles, resume professionnel, experience professionnelle, formation, competences et langues. Vous pouvez ajouter autant d\'experiences et de formations que necessaire.',
        'Choisissez parmi trois styles de modeles: Classique (polices serif traditionnelles), Moderne (sans-serif epure avec en-tete colore) et Minimal (monospace, elegance discrete). Chaque modele peut etre personnalise avec six themes de couleurs differents.',
        'Les donnees de votre CV sont traitees entierement dans votre navigateur. Rien n\'est envoye a aucun serveur, garantissant une confidentialite complete. Vous pouvez sauvegarder votre progression et y revenir plus tard. Exportez en HTML, imprimez directement ou copiez en texte brut.',
      ],
      faq: [
        { q: 'Ce generateur de CV est-il vraiment gratuit?', a: 'Oui, 100% gratuit sans couts caches, sans filigrane et sans inscription requise. Toutes les fonctionnalites sont disponibles gratuitement.' },
        { q: 'Puis-je sauvegarder mon CV et le modifier plus tard?', a: 'Oui. Cliquez sur le bouton Sauvegarder pour stocker vos donnees dans le stockage local du navigateur. Cliquez sur Charger pour restaurer votre progression.' },
        { q: 'Quels formats d\'exportation sont disponibles?', a: 'Vous pouvez exporter votre CV en fichier HTML, l\'imprimer directement depuis le navigateur, ou le copier en texte brut pour les formulaires en ligne.' },
        { q: 'Mes donnees personnelles sont-elles securisees?', a: 'Absolument. Tout le traitement se fait dans votre navigateur via JavaScript. Aucune donnee n\'est envoyee a un serveur.' },
        { q: 'Quel modele devrais-je choisir?', a: 'Classique est ideal pour les secteurs traditionnels comme la finance et le droit. Moderne convient au tech et marketing. Minimal est parfait pour les roles orientes design.' },
      ],
    },
    de: {
      title: 'Kostenloser Online-Lebenslauf-Generator -- Erstellen Sie Professionelle Lebenslaeufe Sofort',
      paragraphs: [
        'Einen professionellen Lebenslauf zu erstellen kann den Unterschied ausmachen zwischen Ihrem Traumjob und dem Verlust in der Bewerbungsflut. Unser kostenloser Online-Lebenslauf-Generator gibt Ihnen alle Werkzeuge, um in Minuten einen polierten, professionellen CV zu erstellen -- ohne Registrierung.',
        'Das Tool unterstuetzt mehrere Abschnitte: persoenliche Daten, berufliches Profil, Berufserfahrung, Ausbildung, Faehigkeiten und Sprachen. Sie koennen beliebig viele Erfahrungs- und Ausbildungseintraege hinzufuegen.',
        'Waehlen Sie aus drei verschiedenen Vorlagenstilen: Klassisch (traditionelle Serif-Schriften), Modern (saubere Sans-Serif mit farbigem Header) und Minimal (Monospace, dezente Eleganz). Jede Vorlage kann mit sechs verschiedenen Farbthemen angepasst werden.',
        'Ihre Lebenslaufdaten werden vollstaendig in Ihrem Browser verarbeitet. Nichts wird an einen Server gesendet, was vollstaendige Privatsphaere gewaehrleistet. Sie koennen Ihren Fortschritt im lokalen Speicher speichern. Exportieren Sie als HTML, drucken Sie direkt oder kopieren Sie als Klartext.',
      ],
      faq: [
        { q: 'Ist dieser Lebenslauf-Generator wirklich kostenlos?', a: 'Ja, 100% kostenlos ohne versteckte Kosten, ohne Wasserzeichen und ohne Registrierung. Alle Funktionen sind kostenlos verfuegbar.' },
        { q: 'Kann ich meinen Lebenslauf speichern und spaeter bearbeiten?', a: 'Ja. Klicken Sie auf Speichern, um Ihre Daten im lokalen Speicher des Browsers zu speichern. Klicken Sie auf Laden, um Ihren Fortschritt wiederherzustellen.' },
        { q: 'Welche Exportformate sind verfuegbar?', a: 'Sie koennen Ihren Lebenslauf als HTML-Datei exportieren, direkt aus dem Browser drucken oder als Klartext fuer Online-Bewerbungsformulare kopieren.' },
        { q: 'Sind meine persoenlichen Daten sicher?', a: 'Absolut. Die gesamte Verarbeitung erfolgt in Ihrem Browser mittels JavaScript. Keine Daten werden an einen Server gesendet.' },
        { q: 'Welche Vorlage sollte ich waehlen?', a: 'Klassisch ist ideal fuer traditionelle Branchen wie Finanzen und Recht. Modern eignet sich fuer Tech und Marketing. Minimal ist perfekt fuer designorientierte Rollen.' },
      ],
    },
    pt: {
      title: 'Gerador de Curriculo Online Gratuito -- Crie CVs Profissionais Instantaneamente',
      paragraphs: [
        'Criar um curriculo profissional pode ser a diferenca entre conseguir o emprego dos seus sonhos e se perder na pilha de candidaturas. Nosso gerador de curriculo online gratuito oferece todas as ferramentas para criar um CV profissional em minutos, sem registro.',
        'A ferramenta suporta multiplas secoes: informacoes pessoais, resumo profissional, experiencia profissional, educacao, habilidades e idiomas. Voce pode adicionar quantas experiencias e formacoes precisar.',
        'Escolha entre tres estilos de modelo: Classico (fontes serif tradicionais), Moderno (sans-serif limpo com cabecalho colorido) e Minimalista (monospace, elegancia discreta). Cada modelo pode ser personalizado com seis temas de cores diferentes.',
        'Os dados do seu curriculo sao processados inteiramente no seu navegador. Nada e enviado a nenhum servidor, garantindo privacidade completa. Voce pode salvar seu progresso no armazenamento local e voltar depois. Exporte como HTML, imprima diretamente ou copie como texto simples.',
      ],
      faq: [
        { q: 'Este gerador de curriculo e realmente gratuito?', a: 'Sim, 100% gratuito sem custos ocultos, sem marcas d\'agua e sem registro necessario. Todos os recursos estao disponiveis gratuitamente.' },
        { q: 'Posso salvar meu curriculo e edita-lo depois?', a: 'Sim. Clique no botao Salvar para armazenar os dados do seu CV no armazenamento local do navegador. Clique em Carregar para restaurar seu progresso.' },
        { q: 'Quais formatos de exportacao estao disponiveis?', a: 'Voce pode exportar seu curriculo como arquivo HTML, imprimi-lo diretamente do navegador, ou copia-lo como texto simples para formularios de candidatura online.' },
        { q: 'Meus dados pessoais estao seguros?', a: 'Absolutamente. Todo o processamento acontece no seu navegador usando JavaScript. Nenhum dado e enviado a qualquer servidor.' },
        { q: 'Qual modelo devo escolher?', a: 'Classico e ideal para setores tradicionais como financas e direito. Moderno funciona bem para tecnologia e marketing. Minimalista e otimo para funcoes orientadas ao design.' },
      ],
    },
  };

  const seo = seoContent[lang];

  const faqItems = seo.faq;

  // Input field component
  const InputField = ({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );

  // Preview component
  const ResumePreview = () => {
    const fontClass = template === 'modern' ? 'font-sans' : template === 'minimal' ? 'font-mono' : 'font-serif';

    return (
      <div ref={previewRef} className={`bg-white border border-gray-200 rounded-lg p-6 ${fontClass} text-sm`}>
        {/* Header */}
        <div
          className={`pb-4 mb-4 ${template === 'modern' ? 'rounded-lg p-4 text-white' : ''}`}
          style={{
            borderBottom: template !== 'modern' ? `3px solid ${color}` : 'none',
            backgroundColor: template === 'modern' ? color : 'transparent',
          }}
        >
          <h2 className={`text-2xl font-bold ${template === 'modern' ? 'text-white' : ''} ${template === 'minimal' ? 'font-normal uppercase tracking-widest' : ''}`} style={{ color: template === 'modern' ? '#fff' : color }}>
            {resume.name || t('fullName')}
          </h2>
          <div className={`text-xs mt-1 ${template === 'modern' ? 'text-white/80' : 'text-gray-500'}`}>
            {[resume.email, resume.phone, resume.location, resume.linkedin].filter(Boolean).join(' | ') || 'email@example.com | +1 234 567 890'}
          </div>
        </div>

        {/* Summary */}
        {resume.summary && (
          <div className="mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color, borderBottom: template === 'classic' ? 'none' : `2px solid ${color}`, borderLeft: template === 'classic' ? `3px solid ${color}` : 'none', paddingLeft: template === 'classic' ? '8px' : '0', paddingBottom: template !== 'classic' ? '2px' : '0' }}>
              {t('summary')}
            </h3>
            <p className="text-gray-600 text-xs leading-relaxed">{resume.summary}</p>
          </div>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color, borderBottom: template === 'classic' ? 'none' : `2px solid ${color}`, borderLeft: template === 'classic' ? `3px solid ${color}` : 'none', paddingLeft: template === 'classic' ? '8px' : '0', paddingBottom: template !== 'classic' ? '2px' : '0' }}>
              {t('experience')}
            </h3>
            {resume.experience.map((exp) => (
              <div key={exp.id} className="mb-3">
                <div className="flex justify-between items-baseline flex-wrap">
                  <div>
                    <span className="font-bold text-xs">{exp.title}</span>
                    {exp.company && <span className="text-gray-500 text-xs"> - {exp.company}</span>}
                  </div>
                  <span className="text-gray-400 text-xs">{exp.startDate} - {exp.endDate || t('present')}</span>
                </div>
                {exp.description && <p className="text-gray-600 text-xs mt-1">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color, borderBottom: template === 'classic' ? 'none' : `2px solid ${color}`, borderLeft: template === 'classic' ? `3px solid ${color}` : 'none', paddingLeft: template === 'classic' ? '8px' : '0', paddingBottom: template !== 'classic' ? '2px' : '0' }}>
              {t('education')}
            </h3>
            {resume.education.map((edu) => (
              <div key={edu.id} className="mb-2">
                <div className="flex justify-between items-baseline flex-wrap">
                  <div>
                    <span className="font-bold text-xs">{edu.degree}</span>
                    {edu.institution && <span className="text-gray-500 text-xs"> - {edu.institution}</span>}
                  </div>
                  <span className="text-gray-400 text-xs">{edu.startDate} - {edu.endDate || t('present')}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color, borderBottom: template === 'classic' ? 'none' : `2px solid ${color}`, borderLeft: template === 'classic' ? `3px solid ${color}` : 'none', paddingLeft: template === 'classic' ? '8px' : '0', paddingBottom: template !== 'classic' ? '2px' : '0' }}>
              {t('skills')}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {resume.skills.map((s) => (
                <span key={s} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30`, borderRadius: template === 'modern' ? '20px' : '4px' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {resume.languages.length > 0 && (
          <div className="mb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color, borderBottom: template === 'classic' ? 'none' : `2px solid ${color}`, borderLeft: template === 'classic' ? `3px solid ${color}` : 'none', paddingLeft: template === 'classic' ? '8px' : '0', paddingBottom: template !== 'classic' ? '2px' : '0' }}>
              {t('languages')}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {resume.languages.map((l) => (
                <span key={l} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30`, borderRadius: template === 'modern' ? '20px' : '4px' }}>
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <ToolPageWrapper toolSlug="resume-builder" faqItems={faqItems}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT?.name || 'Resume Builder'}</h1>
        <p className="text-gray-600 mb-6">{toolT?.description || ''}</p>

        {/* Template & Color Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Template */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('templateStyle')}</label>
              <div className="flex gap-2">
                {(['classic', 'modern', 'minimal'] as Template[]).map((tmpl) => (
                  <button
                    key={tmpl}
                    onClick={() => setTemplate(tmpl)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${template === tmpl ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {t(tmpl)}
                  </button>
                ))}
              </div>
            </div>
            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('colorTheme')}</label>
              <div className="flex gap-2">
                {themeColors.map((tc) => (
                  <button
                    key={tc.value}
                    onClick={() => setColor(tc.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${color === tc.value ? 'border-gray-900 scale-110' : 'border-gray-300'}`}
                    style={{ backgroundColor: tc.value }}
                    title={tc.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex gap-2 mb-4 sm:hidden">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${activeTab === 'edit' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('editTab')}
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${activeTab === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('previewTab')}
          </button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Edit Panel */}
          <div className={`space-y-4 ${activeTab === 'preview' ? 'hidden sm:block' : ''}`}>

            {/* Personal Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('personalInfo')}</h2>
              <div className="space-y-3">
                <InputField label={t('fullName')} value={resume.name} onChange={(v) => updateField('name', v)} />
                <InputField label={t('email')} value={resume.email} onChange={(v) => updateField('email', v)} type="email" />
                <InputField label={t('phone')} value={resume.phone} onChange={(v) => updateField('phone', v)} type="tel" />
                <InputField label={t('location')} value={resume.location} onChange={(v) => updateField('location', v)} />
                <InputField label={t('linkedin')} value={resume.linkedin} onChange={(v) => updateField('linkedin', v)} type="url" />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('summary')}</h2>
              <textarea
                value={resume.summary}
                onChange={(e) => updateField('summary', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              />
            </div>

            {/* Experience */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-900">{t('experience')}</h2>
                <button onClick={addExperience} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                  + {t('addExperience')}
                </button>
              </div>
              {resume.experience.map((exp) => (
                <div key={exp.id} className="border border-gray-100 rounded-lg p-3 mb-3 bg-gray-50">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <InputField label={t('company')} value={exp.company} onChange={(v) => updateExperience(exp.id, 'company', v)} />
                      <InputField label={t('jobTitle')} value={exp.title} onChange={(v) => updateExperience(exp.id, 'title', v)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <InputField label={t('startDate')} value={exp.startDate} onChange={(v) => updateExperience(exp.id, 'startDate', v)} placeholder="2020-01" />
                      <InputField label={t('endDate')} value={exp.endDate} onChange={(v) => updateExperience(exp.id, 'endDate', v)} placeholder={t('present')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('description')}</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                      />
                    </div>
                    <button onClick={() => removeExperience(exp.id)} className="text-xs text-red-600 hover:text-red-700">
                      {t('remove')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-900">{t('education')}</h2>
                <button onClick={addEducation} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                  + {t('addEducation')}
                </button>
              </div>
              {resume.education.map((edu) => (
                <div key={edu.id} className="border border-gray-100 rounded-lg p-3 mb-3 bg-gray-50">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <InputField label={t('institution')} value={edu.institution} onChange={(v) => updateEducation(edu.id, 'institution', v)} />
                      <InputField label={t('degree')} value={edu.degree} onChange={(v) => updateEducation(edu.id, 'degree', v)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <InputField label={t('startDate')} value={edu.startDate} onChange={(v) => updateEducation(edu.id, 'startDate', v)} placeholder="2016-09" />
                      <InputField label={t('endDate')} value={edu.endDate} onChange={(v) => updateEducation(edu.id, 'endDate', v)} placeholder="2020-06" />
                    </div>
                    <button onClick={() => removeEducation(edu.id)} className="text-xs text-red-600 hover:text-red-700">
                      {t('remove')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('skills')}</h2>
              <div className="flex gap-2 mb-3">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  placeholder={t('skillPlaceholder')}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button onClick={addSkill} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  {t('addSkill')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map((s) => (
                  <span key={s} className="inline-flex items-center bg-blue-50 border border-blue-200 text-blue-700 text-sm px-3 py-1 rounded-full">
                    {s}
                    <button onClick={() => removeSkill(s)} className="ml-1.5 text-blue-400 hover:text-red-500">&times;</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('languages')}</h2>
              <div className="flex gap-2 mb-3">
                <input
                  value={langInput}
                  onChange={(e) => setLangInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLanguage(); } }}
                  placeholder={t('langPlaceholder')}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button onClick={addLanguage} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  {t('addSkill')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {resume.languages.map((l) => (
                  <span key={l} className="inline-flex items-center bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-1 rounded-full">
                    {l}
                    <button onClick={() => removeLanguage(l)} className="ml-1.5 text-green-400 hover:text-red-500">&times;</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className={`${activeTab === 'edit' ? 'hidden sm:block' : ''}`}>
            <div className="sticky top-4">
              <ResumePreview />

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button onClick={handleExportHtml} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  {t('exportHtml')}
                </button>
                <button onClick={handlePrint} className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                  {t('print')}
                </button>
                <button onClick={handleCopyText} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                  {copied ? t('copiedMsg') : t('copyText')}
                </button>
                <button onClick={handleSave} className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                  {saved ? t('savedMsg') : t('save')}
                </button>
                <button onClick={handleLoad} className="bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
                  {t('load')}
                </button>
                <button onClick={handleClear} className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                  {t('clear')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>)}
        </article>

        {/* FAQ Accordion */}
        <section className="mt-10 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">FAQ</h2>
          <div className="space-y-2">
            {seo.faq.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left px-4 py-3 font-medium text-gray-900 flex justify-between items-center">
                  {item.q}
                  <span className="text-gray-400">{openFaq === i ? '\u2212' : '+'}</span>
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
