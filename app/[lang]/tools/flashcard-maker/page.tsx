'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

const labels: Record<string, Record<string, string>> = {
  front: { en: 'Front', it: 'Fronte', es: 'Frente', fr: 'Recto', de: 'Vorderseite', pt: 'Frente' },
  back: { en: 'Back', it: 'Retro', es: 'Reverso', fr: 'Verso', de: 'Rückseite', pt: 'Verso' },
  addCard: { en: 'Add Card', it: 'Aggiungi Carta', es: 'Agregar Tarjeta', fr: 'Ajouter une Carte', de: 'Karte Hinzufügen', pt: 'Adicionar Cartão' },
  editCard: { en: 'Edit Card', it: 'Modifica Carta', es: 'Editar Tarjeta', fr: 'Modifier la Carte', de: 'Karte Bearbeiten', pt: 'Editar Cartão' },
  deleteCard: { en: 'Delete', it: 'Elimina', es: 'Eliminar', fr: 'Supprimer', de: 'Löschen', pt: 'Excluir' },
  save: { en: 'Save', it: 'Salva', es: 'Guardar', fr: 'Enregistrer', de: 'Speichern', pt: 'Salvar' },
  cancel: { en: 'Cancel', it: 'Annulla', es: 'Cancelar', fr: 'Annuler', de: 'Abbrechen', pt: 'Cancelar' },
  study: { en: 'Study Mode', it: 'Modalità Studio', es: 'Modo Estudio', fr: 'Mode Étude', de: 'Lernmodus', pt: 'Modo Estudo' },
  manage: { en: 'Manage Cards', it: 'Gestisci Carte', es: 'Gestionar Tarjetas', fr: 'Gérer les Cartes', de: 'Karten Verwalten', pt: 'Gerenciar Cartões' },
  clickToReveal: { en: 'Click to reveal answer', it: 'Clicca per rivelare la risposta', es: 'Haz clic para revelar la respuesta', fr: 'Cliquez pour révéler la réponse', de: 'Klicken Sie, um die Antwort zu zeigen', pt: 'Clique para revelar a resposta' },
  known: { en: 'Known', it: 'Conosciuta', es: 'Conocida', fr: 'Connue', de: 'Gewusst', pt: 'Conhecida' },
  unknown: { en: 'Unknown', it: 'Sconosciuta', es: 'Desconocida', fr: 'Inconnue', de: 'Nicht gewusst', pt: 'Desconhecida' },
  shuffle: { en: 'Shuffle', it: 'Mescola', es: 'Mezclar', fr: 'Mélanger', de: 'Mischen', pt: 'Embaralhar' },
  restart: { en: 'Restart', it: 'Ricomincia', es: 'Reiniciar', fr: 'Recommencer', de: 'Neustart', pt: 'Reiniciar' },
  next: { en: 'Next', it: 'Prossima', es: 'Siguiente', fr: 'Suivante', de: 'Nächste', pt: 'Próxima' },
  prev: { en: 'Previous', it: 'Precedente', es: 'Anterior', fr: 'Précédente', de: 'Vorherige', pt: 'Anterior' },
  totalCards: { en: 'Total Cards', it: 'Carte Totali', es: 'Tarjetas Totales', fr: 'Cartes Totales', de: 'Karten Gesamt', pt: 'Cartões Totais' },
  mastered: { en: 'Mastered', it: 'Acquisite', es: 'Dominadas', fr: 'Maîtrisées', de: 'Gemeistert', pt: 'Dominados' },
  progress: { en: 'Progress', it: 'Progresso', es: 'Progreso', fr: 'Progrès', de: 'Fortschritt', pt: 'Progresso' },
  noCards: { en: 'No cards yet. Add some cards to start studying!', it: 'Nessuna carta ancora. Aggiungi delle carte per iniziare a studiare!', es: '¡Aún no hay tarjetas. Agrega algunas para empezar a estudiar!', fr: 'Pas encore de cartes. Ajoutez des cartes pour commencer à étudier !', de: 'Noch keine Karten. Fügen Sie Karten hinzu, um zu lernen!', pt: 'Nenhum cartão ainda. Adicione cartões para começar a estudar!' },
  deck: { en: 'Deck', it: 'Mazzo', es: 'Mazo', fr: 'Paquet', de: 'Stapel', pt: 'Baralho' },
  newDeck: { en: 'New Deck', it: 'Nuovo Mazzo', es: 'Nuevo Mazo', fr: 'Nouveau Paquet', de: 'Neuer Stapel', pt: 'Novo Baralho' },
  deckName: { en: 'Deck Name', it: 'Nome Mazzo', es: 'Nombre del Mazo', fr: 'Nom du Paquet', de: 'Stapelname', pt: 'Nome do Baralho' },
  deleteDeck: { en: 'Delete Deck', it: 'Elimina Mazzo', es: 'Eliminar Mazo', fr: 'Supprimer le Paquet', de: 'Stapel Löschen', pt: 'Excluir Baralho' },
  importJson: { en: 'Import JSON', it: 'Importa JSON', es: 'Importar JSON', fr: 'Importer JSON', de: 'JSON Importieren', pt: 'Importar JSON' },
  exportJson: { en: 'Export JSON', it: 'Esporta JSON', es: 'Exportar JSON', fr: 'Exporter JSON', de: 'JSON Exportieren', pt: 'JSON Exportieren' },
  cardOf: { en: 'of', it: 'di', es: 'de', fr: 'de', de: 'von', pt: 'de' },
  complete: { en: 'Session Complete!', it: 'Sessione Completata!', es: '¡Sesión Completada!', fr: 'Session Terminée !', de: 'Sitzung Abgeschlossen!', pt: 'Sessão Completa!' },
  defaultDeck: { en: 'My Flashcards', it: 'Le Mie Carte', es: 'Mis Tarjetas', fr: 'Mes Cartes', de: 'Meine Karten', pt: 'Meus Cartões' },
  edit: { en: 'Edit', it: 'Modifica', es: 'Editar', fr: 'Modifier', de: 'Bearbeiten', pt: 'Editar' },
  renameDeck: { en: 'Rename', it: 'Rinomina', es: 'Renombrar', fr: 'Renommer', de: 'Umbenennen', pt: 'Renomear' },
};

interface Flashcard {
  id: string;
  front: string;
  back: string;
  known: boolean;
}

interface Deck {
  id: string;
  name: string;
  cards: Flashcard[];
}

const STORAGE_KEY = 'flashcard-maker-decks';

export default function FlashcardMaker() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['flashcard-maker'][lang];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string>('');
  const [mode, setMode] = useState<'manage' | 'study'>('manage');
  const [frontInput, setFrontInput] = useState('');
  const [backInput, setBackInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [studyIndex, setStudyIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [showNewDeck, setShowNewDeck] = useState(false);
  const [renamingDeckId, setRenamingDeckId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: Deck[] = JSON.parse(saved);
        setDecks(parsed);
        if (parsed.length > 0) setActiveDeckId(parsed[0].id);
      } else {
        const defaultDeck: Deck = { id: crypto.randomUUID(), name: t('defaultDeck'), cards: [] };
        setDecks([defaultDeck]);
        setActiveDeckId(defaultDeck.id);
      }
    } catch {
      const defaultDeck: Deck = { id: crypto.randomUUID(), name: t('defaultDeck'), cards: [] };
      setDecks([defaultDeck]);
      setActiveDeckId(defaultDeck.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (decks.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
    }
  }, [decks]);

  const activeDeck = decks.find(d => d.id === activeDeckId);
  const cards = activeDeck?.cards || [];

  const updateDeckCards = useCallback((deckId: string, updater: (cards: Flashcard[]) => Flashcard[]) => {
    setDecks(prev => prev.map(d => d.id === deckId ? { ...d, cards: updater(d.cards) } : d));
  }, []);

  const handleAddCard = () => {
    if (!frontInput.trim() || !backInput.trim() || !activeDeckId) return;
    if (editingId) {
      updateDeckCards(activeDeckId, cards =>
        cards.map(c => c.id === editingId ? { ...c, front: frontInput.trim(), back: backInput.trim() } : c)
      );
      setEditingId(null);
    } else {
      const newCard: Flashcard = { id: crypto.randomUUID(), front: frontInput.trim(), back: backInput.trim(), known: false };
      updateDeckCards(activeDeckId, cards => [...cards, newCard]);
    }
    setFrontInput('');
    setBackInput('');
  };

  const handleEditCard = (card: Flashcard) => {
    setFrontInput(card.front);
    setBackInput(card.back);
    setEditingId(card.id);
  };

  const handleDeleteCard = (id: string) => {
    updateDeckCards(activeDeckId, cards => cards.filter(c => c.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setFrontInput('');
      setBackInput('');
    }
  };

  const startStudy = (shuffle: boolean) => {
    if (cards.length === 0) return;
    let ordered = [...cards];
    if (shuffle) {
      for (let i = ordered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
      }
    }
    setStudyCards(ordered);
    setStudyIndex(0);
    setRevealed(false);
    setSessionComplete(false);
    setMode('study');
  };

  const markCard = (known: boolean) => {
    const cardId = studyCards[studyIndex].id;
    updateDeckCards(activeDeckId, cards =>
      cards.map(c => c.id === cardId ? { ...c, known } : c)
    );
    setStudyCards(prev => prev.map(c => c.id === cardId ? { ...c, known } : c));
    if (studyIndex < studyCards.length - 1) {
      setStudyIndex(studyIndex + 1);
      setRevealed(false);
    } else {
      setSessionComplete(true);
    }
  };

  const handleCreateDeck = () => {
    if (!newDeckName.trim()) return;
    const newDeck: Deck = { id: crypto.randomUUID(), name: newDeckName.trim(), cards: [] };
    setDecks(prev => [...prev, newDeck]);
    setActiveDeckId(newDeck.id);
    setNewDeckName('');
    setShowNewDeck(false);
  };

  const handleDeleteDeck = (deckId: string) => {
    setDecks(prev => {
      const next = prev.filter(d => d.id !== deckId);
      if (next.length === 0) {
        const defaultDeck: Deck = { id: crypto.randomUUID(), name: t('defaultDeck'), cards: [] };
        setActiveDeckId(defaultDeck.id);
        return [defaultDeck];
      }
      if (activeDeckId === deckId) setActiveDeckId(next[0].id);
      return next;
    });
  };

  const handleRenameDeck = (deckId: string) => {
    if (!renameInput.trim()) return;
    setDecks(prev => prev.map(d => d.id === deckId ? { ...d, name: renameInput.trim() } : d));
    setRenamingDeckId(null);
    setRenameInput('');
  };

  const handleExport = () => {
    if (!activeDeck) return;
    const data = JSON.stringify(activeDeck, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDeck.name.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.name && Array.isArray(data.cards)) {
          const importedDeck: Deck = {
            id: crypto.randomUUID(),
            name: data.name,
            cards: data.cards.map((c: { front?: string; back?: string; known?: boolean }) => ({
              id: crypto.randomUUID(),
              front: c.front || '',
              back: c.back || '',
              known: c.known || false,
            })),
          };
          setDecks(prev => [...prev, importedDeck]);
          setActiveDeckId(importedDeck.id);
        }
      } catch { /* invalid JSON */ }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const knownCount = cards.filter(c => c.known).length;
  const progressPct = cards.length > 0 ? Math.round((knownCount / cards.length) * 100) : 0;

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Flashcard Maker: Create, Study, and Master Any Subject',
      paragraphs: [
        'Flashcards are one of the most effective study techniques, backed by decades of cognitive science research. Our free Flashcard Maker lets you create digital flashcards with a front (question or term) and back (answer or definition), organize them into multiple decks, and study using an interactive review mode.',
        'The tool supports active recall, the learning strategy where you actively try to remember information before checking the answer. By clicking to reveal the back of each card, you engage your memory more deeply than passive reading. You can mark each card as "known" or "unknown" to track your mastery progress in real time.',
        'Multiple decks let you organize your flashcards by subject, chapter, or difficulty level. The shuffle feature ensures you do not memorize cards by position, which is a common pitfall in sequential study. Your progress statistics — total cards, mastered count, and percentage — provide motivation and help you identify areas that need more review.',
        'All your decks and cards are saved automatically to your browser\'s localStorage, so your data persists between sessions without any account or signup. You can also export any deck as a JSON file for backup or sharing, and import JSON files to load decks from other sources. This makes the tool perfect for collaborative study groups.'
      ],
      faq: [
        { q: 'Where are my flashcards saved?', a: 'All flashcards are saved in your browser\'s localStorage. They persist between sessions on the same browser and device. No account is needed. For backup, use the Export JSON feature.' },
        { q: 'Can I share my flashcard decks with others?', a: 'Yes! Use the Export JSON button to download your deck as a file. Share that file with others, and they can use Import JSON to load it into their own Flashcard Maker.' },
        { q: 'Is there a limit to how many cards I can create?', a: 'There is no hard limit from the tool itself. However, localStorage typically allows around 5-10 MB of data per site, which is enough for thousands of flashcards.' },
        { q: 'What is the best way to study with flashcards?', a: 'Use the shuffle feature so you don\'t memorize card order. Mark cards as "known" when you answer correctly, and review unknown cards repeatedly. Spaced repetition — studying at increasing intervals — is the most effective technique.' },
        { q: 'Can I create flashcards for different subjects?', a: 'Yes, you can create multiple decks, each with its own name. Use separate decks for different subjects, chapters, languages, or any other categorization that works for your study needs.' }
      ]
    },
    it: {
      title: 'Creatore di Flashcard: Crea, Studia e Padroneggia Ogni Materia',
      paragraphs: [
        'Le flashcard sono una delle tecniche di studio più efficaci, supportate da decenni di ricerca in scienze cognitive. Il nostro Creatore di Flashcard gratuito ti permette di creare carte digitali con un fronte (domanda o termine) e un retro (risposta o definizione), organizzarle in mazzi multipli e studiare con una modalità di revisione interattiva.',
        'Lo strumento supporta il richiamo attivo, la strategia di apprendimento in cui provi attivamente a ricordare le informazioni prima di controllare la risposta. Cliccando per rivelare il retro di ogni carta, coinvolgi la tua memoria più profondamente della lettura passiva. Puoi segnare ogni carta come "conosciuta" o "sconosciuta" per monitorare il tuo progresso.',
        'I mazzi multipli ti permettono di organizzare le flashcard per materia, capitolo o livello di difficoltà. La funzione mescola assicura che non memorizzi le carte per posizione. Le statistiche di progresso — carte totali, acquisite e percentuale — forniscono motivazione e ti aiutano a identificare le aree da rivedere.',
        'Tutti i tuoi mazzi e carte vengono salvati automaticamente nel localStorage del browser, quindi i dati persistono tra le sessioni senza account. Puoi anche esportare qualsiasi mazzo come file JSON per backup o condivisione, e importare file JSON per caricare mazzi da altre fonti.'
      ],
      faq: [
        { q: 'Dove vengono salvate le mie flashcard?', a: 'Tutte le flashcard sono salvate nel localStorage del browser. Persistono tra le sessioni sullo stesso browser e dispositivo. Non serve un account. Per il backup, usa la funzione Esporta JSON.' },
        { q: 'Posso condividere i miei mazzi con altri?', a: 'Sì! Usa il pulsante Esporta JSON per scaricare il mazzo come file. Condividilo con altri, e possono usare Importa JSON per caricarlo nel loro Creatore di Flashcard.' },
        { q: 'C\'è un limite al numero di carte che posso creare?', a: 'Non c\'è un limite rigido dallo strumento. Il localStorage consente tipicamente circa 5-10 MB di dati per sito, sufficiente per migliaia di flashcard.' },
        { q: 'Qual è il modo migliore per studiare con le flashcard?', a: 'Usa la funzione mescola per non memorizzare l\'ordine. Segna le carte come "conosciute" quando rispondi correttamente e rivedi le carte sconosciute ripetutamente. La ripetizione dilazionata è la tecnica più efficace.' },
        { q: 'Posso creare flashcard per materie diverse?', a: 'Sì, puoi creare mazzi multipli, ciascuno con il suo nome. Usa mazzi separati per diverse materie, capitoli, lingue o qualsiasi altra categorizzazione.' }
      ]
    },
    es: {
      title: 'Creador de Flashcards: Crea, Estudia y Domina Cualquier Tema',
      paragraphs: [
        'Las flashcards son una de las técnicas de estudio más efectivas, respaldadas por décadas de investigación en ciencia cognitiva. Nuestro Creador de Flashcards gratuito te permite crear tarjetas digitales con un frente (pregunta o término) y un reverso (respuesta o definición), organizarlas en múltiples mazos y estudiar con un modo de revisión interactivo.',
        'La herramienta soporta el recuerdo activo, la estrategia de aprendizaje donde intentas activamente recordar información antes de verificar la respuesta. Al hacer clic para revelar el reverso de cada tarjeta, involucras tu memoria más profundamente que la lectura pasiva. Puedes marcar cada tarjeta como "conocida" o "desconocida" para seguir tu progreso.',
        'Los múltiples mazos te permiten organizar tus flashcards por tema, capítulo o nivel de dificultad. La función de mezcla asegura que no memorices las tarjetas por posición. Las estadísticas de progreso — tarjetas totales, dominadas y porcentaje — proporcionan motivación y te ayudan a identificar áreas que necesitan más repaso.',
        'Todos tus mazos y tarjetas se guardan automáticamente en el localStorage del navegador, así tus datos persisten entre sesiones sin cuenta. También puedes exportar cualquier mazo como archivo JSON para respaldo o compartir, e importar archivos JSON para cargar mazos de otras fuentes.'
      ],
      faq: [
        { q: '¿Dónde se guardan mis flashcards?', a: 'Todas las flashcards se guardan en el localStorage del navegador. Persisten entre sesiones en el mismo navegador y dispositivo. No se necesita cuenta. Para respaldo, usa la función Exportar JSON.' },
        { q: '¿Puedo compartir mis mazos con otros?', a: '¡Sí! Usa el botón Exportar JSON para descargar tu mazo como archivo. Compártelo con otros, y pueden usar Importar JSON para cargarlo en su propio Creador de Flashcards.' },
        { q: '¿Hay un límite de tarjetas que puedo crear?', a: 'No hay un límite estricto de la herramienta. El localStorage permite típicamente alrededor de 5-10 MB de datos por sitio, suficiente para miles de flashcards.' },
        { q: '¿Cuál es la mejor forma de estudiar con flashcards?', a: 'Usa la función de mezcla para no memorizar el orden. Marca las tarjetas como "conocidas" cuando respondas correctamente y repasa las desconocidas repetidamente. La repetición espaciada es la técnica más efectiva.' },
        { q: '¿Puedo crear flashcards para diferentes materias?', a: 'Sí, puedes crear múltiples mazos, cada uno con su propio nombre. Usa mazos separados para diferentes materias, capítulos, idiomas u otra categorización.' }
      ]
    },
    fr: {
      title: 'Créateur de Flashcards : Créez, Étudiez et Maîtrisez Tout Sujet',
      paragraphs: [
        'Les flashcards sont l\'une des techniques d\'étude les plus efficaces, soutenues par des décennies de recherche en sciences cognitives. Notre Créateur de Flashcards gratuit vous permet de créer des cartes numériques avec un recto (question ou terme) et un verso (réponse ou définition), de les organiser en paquets multiples et d\'étudier avec un mode de révision interactif.',
        'L\'outil soutient le rappel actif, la stratégie d\'apprentissage où vous essayez activement de vous souvenir des informations avant de vérifier la réponse. En cliquant pour révéler le verso de chaque carte, vous engagez votre mémoire plus profondément que la lecture passive. Vous pouvez marquer chaque carte comme "connue" ou "inconnue" pour suivre votre progression.',
        'Les paquets multiples vous permettent d\'organiser vos flashcards par sujet, chapitre ou niveau de difficulté. La fonction mélanger garantit que vous ne mémorisez pas les cartes par position. Les statistiques de progression — cartes totales, maîtrisées et pourcentage — fournissent de la motivation et vous aident à identifier les domaines nécessitant plus de révision.',
        'Tous vos paquets et cartes sont sauvegardés automatiquement dans le localStorage du navigateur, vos données persistent entre les sessions sans compte. Vous pouvez aussi exporter n\'importe quel paquet en fichier JSON pour sauvegarde ou partage, et importer des fichiers JSON pour charger des paquets d\'autres sources.'
      ],
      faq: [
        { q: 'Où sont sauvegardées mes flashcards ?', a: 'Toutes les flashcards sont sauvegardées dans le localStorage du navigateur. Elles persistent entre les sessions sur le même navigateur et appareil. Aucun compte nécessaire. Pour la sauvegarde, utilisez la fonction Exporter JSON.' },
        { q: 'Puis-je partager mes paquets avec d\'autres ?', a: 'Oui ! Utilisez le bouton Exporter JSON pour télécharger votre paquet en fichier. Partagez-le avec d\'autres, et ils peuvent utiliser Importer JSON pour le charger.' },
        { q: 'Y a-t-il une limite au nombre de cartes ?', a: 'Il n\'y a pas de limite stricte de l\'outil. Le localStorage permet typiquement environ 5-10 Mo de données par site, suffisant pour des milliers de flashcards.' },
        { q: 'Quelle est la meilleure façon d\'étudier avec des flashcards ?', a: 'Utilisez la fonction mélanger pour ne pas mémoriser l\'ordre. Marquez les cartes "connues" quand vous répondez correctement et révisez les inconnues. La répétition espacée est la technique la plus efficace.' },
        { q: 'Puis-je créer des flashcards pour différentes matières ?', a: 'Oui, vous pouvez créer des paquets multiples, chacun avec son propre nom. Utilisez des paquets séparés pour différentes matières, chapitres, langues ou toute autre catégorisation.' }
      ]
    },
    de: {
      title: 'Flashcard-Ersteller: Erstellen, Lernen und Jedes Fach Meistern',
      paragraphs: [
        'Flashcards gehören zu den effektivsten Lerntechniken, gestützt durch jahrzehntelange kognitionswissenschaftliche Forschung. Unser kostenloser Flashcard-Ersteller ermöglicht es Ihnen, digitale Karten mit einer Vorderseite (Frage oder Begriff) und einer Rückseite (Antwort oder Definition) zu erstellen, sie in mehrere Stapel zu organisieren und im interaktiven Überprüfungsmodus zu lernen.',
        'Das Tool unterstützt aktives Erinnern, die Lernstrategie, bei der Sie aktiv versuchen, sich an Informationen zu erinnern, bevor Sie die Antwort überprüfen. Durch Klicken zum Aufdecken der Rückseite jeder Karte binden Sie Ihr Gedächtnis tiefer ein als beim passiven Lesen. Sie können jede Karte als "gewusst" oder "nicht gewusst" markieren, um Ihren Fortschritt zu verfolgen.',
        'Mehrere Stapel ermöglichen es Ihnen, Ihre Flashcards nach Fach, Kapitel oder Schwierigkeitsgrad zu organisieren. Die Mischfunktion stellt sicher, dass Sie Karten nicht nach Position auswendig lernen. Ihre Fortschrittsstatistiken — Gesamtkarten, gemeisterte Anzahl und Prozentsatz — bieten Motivation und helfen Ihnen, Bereiche zu identifizieren, die mehr Überprüfung benötigen.',
        'Alle Ihre Stapel und Karten werden automatisch im localStorage des Browsers gespeichert, sodass Ihre Daten ohne Konto zwischen Sitzungen bestehen bleiben. Sie können auch jeden Stapel als JSON-Datei exportieren und JSON-Dateien importieren, um Stapel aus anderen Quellen zu laden.'
      ],
      faq: [
        { q: 'Wo werden meine Flashcards gespeichert?', a: 'Alle Flashcards werden im localStorage des Browsers gespeichert. Sie bleiben zwischen Sitzungen auf demselben Browser und Gerät bestehen. Kein Konto nötig. Für Backup nutzen Sie die JSON-Export-Funktion.' },
        { q: 'Kann ich meine Stapel mit anderen teilen?', a: 'Ja! Nutzen Sie den JSON-Export-Button, um Ihren Stapel als Datei herunterzuladen. Teilen Sie die Datei, und andere können sie über JSON importieren laden.' },
        { q: 'Gibt es ein Limit für die Anzahl der Karten?', a: 'Es gibt kein striktes Limit vom Tool. Der localStorage erlaubt typischerweise etwa 5-10 MB Daten pro Seite, genug für Tausende von Flashcards.' },
        { q: 'Was ist die beste Art, mit Flashcards zu lernen?', a: 'Nutzen Sie die Mischfunktion, um die Reihenfolge nicht auswendig zu lernen. Markieren Sie Karten als "gewusst" bei richtiger Antwort und wiederholen Sie unbekannte Karten. Verteiltes Wiederholen ist die effektivste Technik.' },
        { q: 'Kann ich Flashcards für verschiedene Fächer erstellen?', a: 'Ja, Sie können mehrere Stapel erstellen, jeder mit eigenem Namen. Nutzen Sie separate Stapel für verschiedene Fächer, Kapitel, Sprachen oder andere Kategorisierungen.' }
      ]
    },
    pt: {
      title: 'Criador de Flashcards: Crie, Estude e Domine Qualquer Matéria',
      paragraphs: [
        'Os flashcards são uma das técnicas de estudo mais eficazes, apoiadas por décadas de pesquisa em ciência cognitiva. Nosso Criador de Flashcards gratuito permite criar cartões digitais com uma frente (pergunta ou termo) e um verso (resposta ou definição), organizá-los em múltiplos baralhos e estudar usando um modo de revisão interativo.',
        'A ferramenta suporta a recordação ativa, a estratégia de aprendizagem em que você tenta ativamente lembrar informações antes de verificar a resposta. Ao clicar para revelar o verso de cada cartão, você envolve sua memória mais profundamente do que a leitura passiva. Você pode marcar cada cartão como "conhecido" ou "desconhecido" para acompanhar seu progresso.',
        'Múltiplos baralhos permitem organizar seus flashcards por matéria, capítulo ou nível de dificuldade. A função embaralhar garante que você não memorize os cartões pela posição. Suas estatísticas de progresso — cartões totais, dominados e porcentagem — fornecem motivação e ajudam a identificar áreas que precisam de mais revisão.',
        'Todos os seus baralhos e cartões são salvos automaticamente no localStorage do navegador, então seus dados persistem entre sessões sem conta. Você também pode exportar qualquer baralho como arquivo JSON para backup ou compartilhamento, e importar arquivos JSON para carregar baralhos de outras fontes.'
      ],
      faq: [
        { q: 'Onde meus flashcards são salvos?', a: 'Todos os flashcards são salvos no localStorage do navegador. Persistem entre sessões no mesmo navegador e dispositivo. Nenhuma conta necessária. Para backup, use a função Exportar JSON.' },
        { q: 'Posso compartilhar meus baralhos com outros?', a: 'Sim! Use o botão Exportar JSON para baixar seu baralho como arquivo. Compartilhe com outros, e eles podem usar Importar JSON para carregá-lo.' },
        { q: 'Há um limite de cartões que posso criar?', a: 'Não há limite rígido da ferramenta. O localStorage permite tipicamente cerca de 5-10 MB de dados por site, suficiente para milhares de flashcards.' },
        { q: 'Qual é a melhor forma de estudar com flashcards?', a: 'Use a função embaralhar para não memorizar a ordem. Marque cartões como "conhecidos" quando responder corretamente e revise os desconhecidos repetidamente. A repetição espaçada é a técnica mais eficaz.' },
        { q: 'Posso criar flashcards para matérias diferentes?', a: 'Sim, você pode criar múltiplos baralhos, cada um com seu próprio nome. Use baralhos separados para diferentes matérias, capítulos, idiomas ou qualquer outra categorização.' }
      ]
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="flashcard-maker" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xs text-blue-600 font-medium">{t('totalCards')}</div>
            <div className="text-lg font-bold text-blue-800">{cards.length}</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xs text-green-600 font-medium">{t('mastered')}</div>
            <div className="text-lg font-bold text-green-800">{knownCount}</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-xs text-purple-600 font-medium">{t('progress')}</div>
            <div className="text-lg font-bold text-purple-800">{progressPct}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        {cards.length > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
        )}

        {/* Deck Selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">{t('deck')}</h3>
            <div className="flex gap-2">
              <button onClick={() => setShowNewDeck(!showNewDeck)}
                className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium">
                + {t('newDeck')}
              </button>
              <label className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium cursor-pointer">
                {t('importJson')}
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
          </div>

          {showNewDeck && (
            <div className="flex gap-2 mb-3">
              <input type="text" value={newDeckName} onChange={e => setNewDeckName(e.target.value)}
                placeholder={t('deckName')}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={e => e.key === 'Enter' && handleCreateDeck()} />
              <button onClick={handleCreateDeck}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                {t('save')}
              </button>
              <button onClick={() => { setShowNewDeck(false); setNewDeckName(''); }}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">
                {t('cancel')}
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {decks.map(deck => (
              <div key={deck.id} className="flex items-center gap-1">
                {renamingDeckId === deck.id ? (
                  <div className="flex gap-1">
                    <input type="text" value={renameInput} onChange={e => setRenameInput(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-xs w-28 focus:ring-2 focus:ring-blue-500"
                      onKeyDown={e => e.key === 'Enter' && handleRenameDeck(deck.id)} autoFocus />
                    <button onClick={() => handleRenameDeck(deck.id)} className="text-xs text-blue-600 hover:text-blue-800">{t('save')}</button>
                    <button onClick={() => setRenamingDeckId(null)} className="text-xs text-gray-500 hover:text-gray-700">{t('cancel')}</button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => { setActiveDeckId(deck.id); setMode('manage'); }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        activeDeckId === deck.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}>
                      {deck.name} ({deck.cards.length})
                    </button>
                    {activeDeckId === deck.id && (
                      <div className="flex gap-1">
                        <button onClick={() => { setRenamingDeckId(deck.id); setRenameInput(deck.name); }}
                          className="text-xs text-gray-400 hover:text-blue-600" title={t('renameDeck')}>
                          &#9998;
                        </button>
                        <button onClick={handleExport}
                          className="text-xs text-gray-400 hover:text-green-600" title={t('exportJson')}>
                          &#8681;
                        </button>
                        {decks.length > 1 && (
                          <button onClick={() => handleDeleteDeck(deck.id)}
                            className="text-xs text-gray-400 hover:text-red-600" title={t('deleteDeck')}>
                            &#10005;
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setMode('manage')}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              mode === 'manage' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}>
            {t('manage')}
          </button>
          <button onClick={() => startStudy(false)} disabled={cards.length === 0}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              mode === 'study' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}>
            {t('study')}
          </button>
        </div>

        {/* MANAGE MODE */}
        {mode === 'manage' && (
          <div className="space-y-4">
            {/* Add/Edit Card Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">{editingId ? t('editCard') : t('addCard')}</h3>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('front')}</label>
                <input type="text" value={frontInput} onChange={e => setFrontInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('front')}
                  onKeyDown={e => e.key === 'Enter' && handleAddCard()} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('back')}</label>
                <input type="text" value={backInput} onChange={e => setBackInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('back')}
                  onKeyDown={e => e.key === 'Enter' && handleAddCard()} />
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddCard}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  {editingId ? t('save') : t('addCard')}
                </button>
                {editingId && (
                  <button onClick={() => { setEditingId(null); setFrontInput(''); setBackInput(''); }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                    {t('cancel')}
                  </button>
                )}
              </div>
            </div>

            {/* Card List */}
            {cards.length === 0 ? (
              <div className="text-center py-8 text-gray-500">{t('noCards')}</div>
            ) : (
              <div className="space-y-2">
                {cards.map(card => (
                  <div key={card.id} className={`bg-white rounded-lg border p-3 flex items-center justify-between ${card.known ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{card.front}</div>
                      <div className="text-sm text-gray-500 truncate">{card.back}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      {card.known && <span className="text-xs text-green-600 font-medium">{t('known')}</span>}
                      <button onClick={() => handleEditCard(card)}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                        {t('edit')}
                      </button>
                      <button onClick={() => handleDeleteCard(card.id)}
                        className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors">
                        {t('deleteCard')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STUDY MODE */}
        {mode === 'study' && (
          <div className="space-y-4">
            {sessionComplete ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('complete')}</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">{t('known')}</div>
                    <div className="text-2xl font-bold text-green-700">{studyCards.filter(c => c.known).length}</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-sm text-red-600 font-medium">{t('unknown')}</div>
                    <div className="text-2xl font-bold text-red-700">{studyCards.filter(c => !c.known).length}</div>
                  </div>
                </div>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => startStudy(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    {t('shuffle')} & {t('restart')}
                  </button>
                  <button onClick={() => setMode('manage')}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                    {t('manage')}
                  </button>
                </div>
              </div>
            ) : studyCards.length > 0 ? (
              <>
                {/* Controls */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {studyIndex + 1} {t('cardOf')} {studyCards.length}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => startStudy(true)}
                      className="text-xs px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium">
                      {t('shuffle')}
                    </button>
                    <button onClick={() => startStudy(false)}
                      className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                      {t('restart')}
                    </button>
                  </div>
                </div>

                {/* Flashcard */}
                <div onClick={() => !revealed && setRevealed(true)}
                  className={`bg-white rounded-xl border-2 p-8 min-h-[200px] flex flex-col items-center justify-center cursor-pointer transition-all ${
                    revealed ? 'border-blue-300' : 'border-gray-200 hover:border-blue-200 hover:shadow-md'
                  }`}>
                  <div className="text-center">
                    <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">{t('front')}</div>
                    <div className="text-xl font-bold text-gray-900 mb-4">{studyCards[studyIndex].front}</div>
                    {revealed ? (
                      <>
                        <div className="border-t border-gray-200 pt-4 mt-2">
                          <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">{t('back')}</div>
                          <div className="text-lg text-gray-700">{studyCards[studyIndex].back}</div>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-400 italic mt-4">{t('clickToReveal')}</div>
                    )}
                  </div>
                </div>

                {/* Mark Buttons */}
                {revealed && (
                  <div className="flex gap-3">
                    <button onClick={() => markCard(false)}
                      className="flex-1 py-3 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors">
                      {t('unknown')}
                    </button>
                    <button onClick={() => markCard(true)}
                      className="flex-1 py-3 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors">
                      {t('known')}
                    </button>
                  </div>
                )}

                {/* Nav Buttons */}
                <div className="flex gap-2">
                  <button onClick={() => { setStudyIndex(Math.max(0, studyIndex - 1)); setRevealed(false); }}
                    disabled={studyIndex === 0}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {t('prev')}
                  </button>
                  <button onClick={() => { if (studyIndex < studyCards.length - 1) { setStudyIndex(studyIndex + 1); setRevealed(false); } }}
                    disabled={studyIndex >= studyCards.length - 1}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {t('next')}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">{t('noCards')}</div>
            )}
          </div>
        )}

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