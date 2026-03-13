'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'toolkit-notepad-notes';

export default function NoteTaking() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['note-taking'][lang];
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkEditor, setDarkEditor] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: Note[] = JSON.parse(saved);
        setNotes(parsed);
        if (parsed.length > 0) setActiveId(parsed[0].id);
      } else {
        const first: Note = { id: crypto.randomUUID(), title: labels.untitled[lang], content: '', createdAt: Date.now(), updatedAt: Date.now() };
        setNotes([first]);
        setActiveId(first.id);
      }
    } catch {
      const first: Note = { id: crypto.randomUUID(), title: labels.untitled[lang], content: '', createdAt: Date.now(), updatedAt: Date.now() };
      setNotes([first]);
      setActiveId(first.id);
    }
    setLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (loaded && notes.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes, loaded]);

  const activeNote = notes.find((n) => n.id === activeId) || null;

  const wordsCount = useCallback((text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, []);

  const charsCount = useCallback((text: string) => text.length, []);

  const handleNewNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: labels.untitled[lang],
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveId(newNote.id);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => {
      const filtered = prev.filter((n) => n.id !== id);
      if (filtered.length === 0) {
        const fallback: Note = { id: crypto.randomUUID(), title: labels.untitled[lang], content: '', createdAt: Date.now(), updatedAt: Date.now() };
        setActiveId(fallback.id);
        return [fallback];
      }
      if (activeId === id) setActiveId(filtered[0].id);
      return filtered;
    });
  };

  const handleTitleChange = (val: string) => {
    setNotes((prev) => prev.map((n) => n.id === activeId ? { ...n, title: val, updatedAt: Date.now() } : n));
  };

  const handleContentChange = (val: string) => {
    setNotes((prev) => prev.map((n) => n.id === activeId ? { ...n, content: val, updatedAt: Date.now() } : n));
  };

  const handleExportAll = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = (note: Note) => {
    const blob = new Blob([`${note.title}\n\n${note.content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-zA-Z0-9-_ ]/g, '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredNotes = searchQuery.trim()
    ? notes.filter((n) =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes;

  const labels: Record<string, Record<Locale, string>> = {
    newNote: { en: 'New Note', it: 'Nuova Nota', es: 'Nueva Nota', fr: 'Nouvelle Note', de: 'Neue Notiz', pt: 'Nova Nota' },
    deleteNote: { en: 'Delete', it: 'Elimina', es: 'Eliminar', fr: 'Supprimer', de: 'Löschen', pt: 'Excluir' },
    searchPlaceholder: { en: 'Search notes...', it: 'Cerca note...', es: 'Buscar notas...', fr: 'Rechercher des notes...', de: 'Notizen suchen...', pt: 'Buscar notas...' },
    untitled: { en: 'Untitled', it: 'Senza titolo', es: 'Sin título', fr: 'Sans titre', de: 'Ohne Titel', pt: 'Sem título' },
    titlePlaceholder: { en: 'Note title...', it: 'Titolo nota...', es: 'Título de la nota...', fr: 'Titre de la note...', de: 'Notiz-Titel...', pt: 'Título da nota...' },
    contentPlaceholder: { en: 'Start writing...', it: 'Inizia a scrivere...', es: 'Empieza a escribir...', fr: 'Commencez à écrire...', de: 'Beginnen Sie zu schreiben...', pt: 'Comece a escrever...' },
    words: { en: 'words', it: 'parole', es: 'palabras', fr: 'mots', de: 'Wörter', pt: 'palavras' },
    chars: { en: 'chars', it: 'caratteri', es: 'caracteres', fr: 'caractères', de: 'Zeichen', pt: 'caracteres' },
    exportAll: { en: 'Export All (JSON)', it: 'Esporta Tutto (JSON)', es: 'Exportar Todo (JSON)', fr: 'Tout Exporter (JSON)', de: 'Alle Exportieren (JSON)', pt: 'Exportar Tudo (JSON)' },
    downloadTxt: { en: 'Download .txt', it: 'Scarica .txt', es: 'Descargar .txt', fr: 'Télécharger .txt', de: 'Als .txt herunterladen', pt: 'Baixar .txt' },
    darkMode: { en: 'Dark Editor', it: 'Editor Scuro', es: 'Editor Oscuro', fr: 'Éditeur Sombre', de: 'Dunkler Editor', pt: 'Editor Escuro' },
    lightMode: { en: 'Light Editor', it: 'Editor Chiaro', es: 'Editor Claro', fr: 'Éditeur Clair', de: 'Heller Editor', pt: 'Editor Claro' },
    noNotes: { en: 'No notes found.', it: 'Nessuna nota trovata.', es: 'No se encontraron notas.', fr: 'Aucune note trouvée.', de: 'Keine Notizen gefunden.', pt: 'Nenhuma nota encontrada.' },
    autoSaved: { en: 'Auto-saved', it: 'Salvato automaticamente', es: 'Guardado automáticamente', fr: 'Sauvegardé automatiquement', de: 'Automatisch gespeichert', pt: 'Salvo automaticamente' },
    notes: { en: 'Notes', it: 'Note', es: 'Notas', fr: 'Notes', de: 'Notizen', pt: 'Notas' },
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Online Notepad – Take Notes Instantly in Your Browser',
      paragraphs: [
        'Need a quick place to jot down ideas, to-do lists, or meeting notes? Our free online notepad lets you create, organize, and manage multiple notes right in your browser — no account or download required. With tabbed navigation, you can switch between notes effortlessly.',
        'Every note is automatically saved to your browser\'s localStorage, so your work persists even after you close the tab. This means zero data loss for your drafts, brainstorms, and quick reminders. No cloud, no server — your notes stay completely private on your device.',
        'The built-in search feature lets you find any note instantly by typing a keyword. Whether you have 5 or 50 notes, locating the right one takes seconds. Each note also shows a live word and character count, which is useful for writers, students, and content creators who need to track length.',
        'You can export all your notes as a single JSON file for backup or migration, or download any individual note as a plain .txt file. The dark/light editor toggle reduces eye strain during late-night writing sessions, making this notepad a versatile tool for everyday productivity.',
      ],
      faq: [
        { q: 'Are my notes saved automatically?', a: 'Yes. Every change you make is instantly saved to your browser\'s localStorage. You don\'t need to press a save button — the notepad auto-saves as you type.' },
        { q: 'Will I lose my notes if I close the browser?', a: 'No. Notes are stored in localStorage, which persists across browser sessions. However, clearing your browser data or using incognito/private mode will erase them.' },
        { q: 'Can I export my notes?', a: 'Yes. You can export all notes at once as a JSON file, or download any individual note as a .txt file. This is useful for backups or transferring notes to another device.' },
        { q: 'Is there a limit to how many notes I can create?', a: 'There is no hard limit imposed by the tool. However, localStorage typically has a 5-10 MB limit per domain, which is enough for thousands of text notes.' },
        { q: 'Are my notes private and secure?', a: 'Absolutely. All data stays in your browser — nothing is sent to any server. Your notes are as private as anything stored locally on your device.' },
      ],
    },
    it: {
      title: 'Blocco Note Online Gratuito – Prendi Appunti nel Browser',
      paragraphs: [
        'Hai bisogno di un posto rapido per annotare idee, liste di cose da fare o appunti di riunioni? Il nostro blocco note online gratuito ti permette di creare, organizzare e gestire più note direttamente nel browser — senza account né download. Con le schede di navigazione, puoi passare da una nota all\'altra senza sforzo.',
        'Ogni nota viene salvata automaticamente nel localStorage del browser, così il tuo lavoro persiste anche dopo aver chiuso la scheda. Questo significa zero perdita di dati per bozze, brainstorm e promemoria rapidi. Nessun cloud, nessun server — le tue note rimangono completamente private sul tuo dispositivo.',
        'La funzione di ricerca integrata ti permette di trovare qualsiasi nota istantaneamente digitando una parola chiave. Che tu abbia 5 o 50 note, individuare quella giusta richiede pochi secondi. Ogni nota mostra anche il conteggio di parole e caratteri in tempo reale, utile per scrittori e studenti.',
        'Puoi esportare tutte le tue note come un unico file JSON per backup o migrazione, oppure scaricare singole note come file .txt. Il toggle editor chiaro/scuro riduce l\'affaticamento visivo durante le sessioni di scrittura notturne, rendendo questo blocco note uno strumento versatile per la produttività quotidiana.',
      ],
      faq: [
        { q: 'Le mie note vengono salvate automaticamente?', a: 'Sì. Ogni modifica viene salvata istantaneamente nel localStorage del browser. Non devi premere alcun pulsante di salvataggio — il blocco note salva automaticamente mentre scrivi.' },
        { q: 'Perderò le mie note se chiudo il browser?', a: 'No. Le note sono memorizzate nel localStorage, che persiste tra le sessioni del browser. Tuttavia, cancellare i dati del browser o usare la modalità incognito le cancellerà.' },
        { q: 'Posso esportare le mie note?', a: 'Sì. Puoi esportare tutte le note in un file JSON, oppure scaricare una singola nota come file .txt. Utile per backup o trasferimento su un altro dispositivo.' },
        { q: 'C\'è un limite al numero di note che posso creare?', a: 'Non c\'è un limite imposto dallo strumento. Tuttavia, il localStorage ha tipicamente un limite di 5-10 MB per dominio, sufficiente per migliaia di note testuali.' },
        { q: 'Le mie note sono private e sicure?', a: 'Assolutamente. Tutti i dati rimangono nel tuo browser — nulla viene inviato a nessun server. Le tue note sono private quanto qualsiasi dato memorizzato localmente sul tuo dispositivo.' },
      ],
    },
    es: {
      title: 'Bloc de Notas Online Gratis – Toma Notas al Instante en tu Navegador',
      paragraphs: [
        '¿Necesitas un lugar rápido para anotar ideas, listas de tareas o notas de reuniones? Nuestro bloc de notas online gratuito te permite crear, organizar y gestionar múltiples notas directamente en tu navegador — sin cuenta ni descarga. Con pestañas de navegación, puedes cambiar entre notas sin esfuerzo.',
        'Cada nota se guarda automáticamente en el localStorage de tu navegador, así que tu trabajo persiste incluso después de cerrar la pestaña. Esto significa cero pérdida de datos para tus borradores, lluvias de ideas y recordatorios rápidos. Sin nube, sin servidor — tus notas permanecen completamente privadas en tu dispositivo.',
        'La función de búsqueda integrada te permite encontrar cualquier nota al instante escribiendo una palabra clave. Ya tengas 5 o 50 notas, localizar la correcta toma segundos. Cada nota también muestra un conteo en vivo de palabras y caracteres, útil para escritores, estudiantes y creadores de contenido.',
        'Puedes exportar todas tus notas como un único archivo JSON para respaldo o migración, o descargar cualquier nota individual como archivo .txt. El cambio de editor oscuro/claro reduce la fatiga visual durante sesiones de escritura nocturnas.',
      ],
      faq: [
        { q: '¿Mis notas se guardan automáticamente?', a: 'Sí. Cada cambio se guarda instantáneamente en el localStorage de tu navegador. No necesitas presionar un botón de guardar — el bloc de notas guarda automáticamente mientras escribes.' },
        { q: '¿Perderé mis notas si cierro el navegador?', a: 'No. Las notas se almacenan en localStorage, que persiste entre sesiones del navegador. Sin embargo, borrar los datos del navegador o usar el modo incógnito las eliminará.' },
        { q: '¿Puedo exportar mis notas?', a: 'Sí. Puedes exportar todas las notas a la vez como un archivo JSON, o descargar cualquier nota individual como archivo .txt. Útil para respaldos o transferir notas a otro dispositivo.' },
        { q: '¿Hay un límite de notas que puedo crear?', a: 'No hay un límite impuesto por la herramienta. Sin embargo, el localStorage normalmente tiene un límite de 5-10 MB por dominio, suficiente para miles de notas de texto.' },
        { q: '¿Mis notas son privadas y seguras?', a: 'Absolutamente. Todos los datos permanecen en tu navegador — nada se envía a ningún servidor. Tus notas son tan privadas como cualquier dato almacenado localmente en tu dispositivo.' },
      ],
    },
    fr: {
      title: 'Bloc-Notes en Ligne Gratuit – Prenez des Notes dans Votre Navigateur',
      paragraphs: [
        'Besoin d\'un endroit rapide pour noter des idées, des listes de tâches ou des notes de réunion ? Notre bloc-notes en ligne gratuit vous permet de créer, organiser et gérer plusieurs notes directement dans votre navigateur — sans compte ni téléchargement. Avec les onglets de navigation, vous pouvez passer d\'une note à l\'autre facilement.',
        'Chaque note est automatiquement sauvegardée dans le localStorage de votre navigateur, donc votre travail persiste même après la fermeture de l\'onglet. Cela signifie zéro perte de données pour vos brouillons, brainstormings et rappels rapides. Pas de cloud, pas de serveur — vos notes restent entièrement privées sur votre appareil.',
        'La fonction de recherche intégrée vous permet de trouver n\'importe quelle note instantanément en tapant un mot-clé. Que vous ayez 5 ou 50 notes, trouver la bonne prend quelques secondes. Chaque note affiche également un compteur de mots et de caractères en temps réel, utile pour les rédacteurs et étudiants.',
        'Vous pouvez exporter toutes vos notes en un seul fichier JSON pour sauvegarde ou migration, ou télécharger une note individuelle en fichier .txt. Le basculement éditeur sombre/clair réduit la fatigue oculaire lors des sessions d\'écriture nocturnes.',
      ],
      faq: [
        { q: 'Mes notes sont-elles sauvegardées automatiquement ?', a: 'Oui. Chaque modification est instantanément sauvegardée dans le localStorage de votre navigateur. Vous n\'avez pas besoin d\'appuyer sur un bouton — le bloc-notes sauvegarde automatiquement pendant que vous tapez.' },
        { q: 'Vais-je perdre mes notes si je ferme le navigateur ?', a: 'Non. Les notes sont stockées dans le localStorage, qui persiste entre les sessions du navigateur. Cependant, effacer les données du navigateur ou utiliser le mode incognito les supprimera.' },
        { q: 'Puis-je exporter mes notes ?', a: 'Oui. Vous pouvez exporter toutes les notes en fichier JSON, ou télécharger une note individuelle en fichier .txt. Pratique pour les sauvegardes ou le transfert vers un autre appareil.' },
        { q: 'Y a-t-il une limite au nombre de notes ?', a: 'Il n\'y a pas de limite imposée par l\'outil. Cependant, le localStorage a généralement une limite de 5 à 10 Mo par domaine, ce qui suffit pour des milliers de notes textuelles.' },
        { q: 'Mes notes sont-elles privées et sécurisées ?', a: 'Absolument. Toutes les données restent dans votre navigateur — rien n\'est envoyé à aucun serveur. Vos notes sont aussi privées que tout ce qui est stocké localement sur votre appareil.' },
      ],
    },
    de: {
      title: 'Kostenloses Online-Notizbuch – Notizen Direkt im Browser Erstellen',
      paragraphs: [
        'Brauchen Sie einen schnellen Ort, um Ideen, Aufgabenlisten oder Besprechungsnotizen festzuhalten? Unser kostenloses Online-Notizbuch ermöglicht es Ihnen, mehrere Notizen direkt im Browser zu erstellen, zu organisieren und zu verwalten — ohne Konto oder Download. Mit Tabs können Sie mühelos zwischen Notizen wechseln.',
        'Jede Notiz wird automatisch im localStorage Ihres Browsers gespeichert, sodass Ihre Arbeit auch nach dem Schließen des Tabs erhalten bleibt. Das bedeutet null Datenverlust für Ihre Entwürfe, Brainstormings und schnellen Erinnerungen. Keine Cloud, kein Server — Ihre Notizen bleiben vollständig privat auf Ihrem Gerät.',
        'Die integrierte Suchfunktion ermöglicht es Ihnen, jede Notiz sofort durch Eingabe eines Stichworts zu finden. Ob Sie 5 oder 50 Notizen haben, die richtige zu finden dauert nur Sekunden. Jede Notiz zeigt auch eine Live-Wort- und Zeichenzählung an, nützlich für Autoren und Studenten.',
        'Sie können alle Notizen als einzelne JSON-Datei zur Sicherung oder Migration exportieren, oder jede einzelne Notiz als .txt-Datei herunterladen. Der Dunkel/Hell-Editor-Umschalter reduziert die Augenbelastung bei nächtlichen Schreibsitzungen.',
      ],
      faq: [
        { q: 'Werden meine Notizen automatisch gespeichert?', a: 'Ja. Jede Änderung wird sofort im localStorage Ihres Browsers gespeichert. Sie müssen keinen Speichern-Button drücken — das Notizbuch speichert automatisch, während Sie tippen.' },
        { q: 'Verliere ich meine Notizen, wenn ich den Browser schließe?', a: 'Nein. Notizen werden im localStorage gespeichert, der über Browsersitzungen hinweg bestehen bleibt. Das Löschen von Browserdaten oder die Verwendung des Inkognito-Modus löscht sie jedoch.' },
        { q: 'Kann ich meine Notizen exportieren?', a: 'Ja. Sie können alle Notizen als JSON-Datei exportieren oder einzelne Notizen als .txt-Datei herunterladen. Nützlich für Backups oder die Übertragung auf ein anderes Gerät.' },
        { q: 'Gibt es ein Limit für die Anzahl der Notizen?', a: 'Es gibt kein vom Tool auferlegtes Limit. Der localStorage hat jedoch typischerweise ein Limit von 5-10 MB pro Domain, was für Tausende von Textnotizen ausreicht.' },
        { q: 'Sind meine Notizen privat und sicher?', a: 'Absolut. Alle Daten bleiben in Ihrem Browser — nichts wird an einen Server gesendet. Ihre Notizen sind so privat wie alles, was lokal auf Ihrem Gerät gespeichert ist.' },
      ],
    },
    pt: {
      title: 'Bloco de Notas Online Gratis – Tome Notas no Navegador',
      paragraphs: [
        'Precisa de um lugar rapido para anotar ideias, listas de tarefas ou notas de reunioes? Nosso bloco de notas online gratuito permite criar, organizar e gerenciar multiplas notas diretamente no navegador — sem conta ou download. Com abas de navegacao, voce pode alternar entre notas sem esforco.',
        'Cada nota e automaticamente salva no localStorage do seu navegador, entao seu trabalho persiste mesmo apos fechar a aba. Isso significa zero perda de dados para seus rascunhos, brainstorms e lembretes rapidos. Sem nuvem, sem servidor — suas notas permanecem completamente privadas no seu dispositivo.',
        'O recurso de busca integrado permite encontrar qualquer nota instantaneamente digitando uma palavra-chave. Seja com 5 ou 50 notas, localizar a correta leva segundos. Cada nota tambem mostra contagem de palavras e caracteres em tempo real, util para escritores e estudantes.',
        'Voce pode exportar todas as suas notas como um unico arquivo JSON para backup ou migracao, ou baixar qualquer nota individual como arquivo .txt. O alternador de editor escuro/claro reduz a fadiga ocular durante sessoes de escrita noturnas.',
      ],
      faq: [
        { q: 'Minhas notas sao salvas automaticamente?', a: 'Sim. Cada alteracao e instantaneamente salva no localStorage do seu navegador. Voce nao precisa pressionar um botao de salvar — o bloco de notas salva automaticamente enquanto voce digita.' },
        { q: 'Vou perder minhas notas se fechar o navegador?', a: 'Nao. As notas sao armazenadas no localStorage, que persiste entre sessoes do navegador. No entanto, limpar os dados do navegador ou usar o modo anonimo as apagara.' },
        { q: 'Posso exportar minhas notas?', a: 'Sim. Voce pode exportar todas as notas de uma vez como arquivo JSON, ou baixar qualquer nota individual como arquivo .txt. Util para backups ou transferencia de notas para outro dispositivo.' },
        { q: 'Ha um limite de notas que posso criar?', a: 'Nao ha limite imposto pela ferramenta. No entanto, o localStorage normalmente tem um limite de 5-10 MB por dominio, suficiente para milhares de notas de texto.' },
        { q: 'Minhas notas sao privadas e seguras?', a: 'Absolutamente. Todos os dados permanecem no seu navegador — nada e enviado a nenhum servidor. Suas notas sao tao privadas quanto qualquer dado armazenado localmente no seu dispositivo.' },
      ],
    },
  };

  const seo = seoContent[lang];

  if (!loaded) {
    return (
      <ToolPageWrapper toolSlug="note-taking" faqItems={seo.faq}>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
          <p className="text-gray-600 mb-6">{toolT.description}</p>
          <div className="text-center py-12 text-gray-400">Loading...</div>
        </div>
      </ToolPageWrapper>
    );
  }

  return (
    <ToolPageWrapper toolSlug="note-taking" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={handleNewNote}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            + {labels.newNote[lang]}
          </button>
          <button
            onClick={handleExportAll}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
          >
            {labels.exportAll[lang]}
          </button>
          <button
            onClick={() => setDarkEditor(!darkEditor)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
          >
            {darkEditor ? labels.lightMode[lang] : labels.darkMode[lang]}
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={labels.searchPlaceholder[lang]}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-4 border-b border-gray-200 pb-2">
          {filteredNotes.length === 0 && (
            <div className="text-sm text-gray-400 py-2">{labels.noNotes[lang]}</div>
          )}
          {filteredNotes.map((note) => (
            <div key={note.id} className="flex items-center">
              <button
                onClick={() => setActiveId(note.id)}
                className={`px-3 py-1.5 text-sm rounded-t-lg font-medium transition-colors truncate max-w-[150px] ${
                  activeId === note.id
                    ? 'bg-blue-100 text-blue-700 border border-b-0 border-blue-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-b-0 border-gray-200'
                }`}
                title={note.title}
              >
                {note.title || labels.untitled[lang]}
              </button>
              {notes.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                  className="text-gray-400 hover:text-red-500 text-xs ml-0.5 px-1 transition-colors"
                  title={labels.deleteNote[lang]}
                >
                  x
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Editor */}
        {activeNote && (
          <div className={`rounded-xl border ${darkEditor ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} p-4`}>
            <input
              type="text"
              value={activeNote.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={labels.titlePlaceholder[lang]}
              className={`w-full text-lg font-semibold mb-3 px-2 py-1 rounded border-b focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                darkEditor
                  ? 'bg-gray-800 text-gray-100 border-gray-600 placeholder-gray-500'
                  : 'bg-gray-50 text-gray-900 border-gray-200 placeholder-gray-400'
              }`}
            />
            <textarea
              value={activeNote.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={labels.contentPlaceholder[lang]}
              className={`w-full h-64 px-3 py-2 rounded-lg resize-y text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                darkEditor
                  ? 'bg-gray-800 text-gray-100 placeholder-gray-500'
                  : 'bg-gray-50 text-gray-900 placeholder-gray-400'
              }`}
            />

            {/* Stats bar */}
            <div className="flex flex-wrap items-center justify-between mt-3 pt-3 border-t border-gray-200 gap-2">
              <div className="flex gap-4 text-xs">
                <span className={darkEditor ? 'text-gray-400' : 'text-gray-500'}>
                  {wordsCount(activeNote.content)} {labels.words[lang]}
                </span>
                <span className={darkEditor ? 'text-gray-400' : 'text-gray-500'}>
                  {charsCount(activeNote.content)} {labels.chars[lang]}
                </span>
                <span className={`${darkEditor ? 'text-green-400' : 'text-green-600'} text-xs`}>
                  {labels.autoSaved[lang]}
                </span>
              </div>
              <button
                onClick={() => handleDownloadTxt(activeNote)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition-colors"
              >
                {labels.downloadTxt[lang]}
              </button>
            </div>
          </div>
        )}

        {/* Notes count */}
        <div className="mt-4 text-sm text-gray-500 text-center">
          {notes.length} {labels.notes[lang]}
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
