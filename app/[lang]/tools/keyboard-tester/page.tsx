'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type KeyLog = { key: string; code: string; which: number; location: number; time: number };

const KEYBOARD_ROWS = [
  ['Escape','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'],
  ['Backquote','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0','Minus','Equal','Backspace'],
  ['Tab','KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP','BracketLeft','BracketRight','Backslash'],
  ['CapsLock','KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL','Semicolon','Quote','Enter'],
  ['ShiftLeft','KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM','Comma','Period','Slash','ShiftRight'],
  ['ControlLeft','MetaLeft','AltLeft','Space','AltRight','MetaRight','ContextMenu','ControlRight'],
];

const KEY_LABELS: Record<string, string> = {
  Escape: 'Esc', Backquote: '`', Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4', Digit5: '5',
  Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9', Digit0: '0', Minus: '-', Equal: '=',
  Backspace: '⌫', Tab: 'Tab', BracketLeft: '[', BracketRight: ']', Backslash: '\\',
  CapsLock: 'Caps', Semicolon: ';', Quote: "'", Enter: 'Enter', ShiftLeft: 'Shift',
  ShiftRight: 'Shift', Comma: ',', Period: '.', Slash: '/', ControlLeft: 'Ctrl',
  ControlRight: 'Ctrl', MetaLeft: 'Win', MetaRight: 'Win', AltLeft: 'Alt', AltRight: 'Alt',
  Space: 'Space', ContextMenu: 'Menu',
  KeyQ: 'Q', KeyW: 'W', KeyE: 'E', KeyR: 'R', KeyT: 'T', KeyY: 'Y', KeyU: 'U', KeyI: 'I',
  KeyO: 'O', KeyP: 'P', KeyA: 'A', KeyS: 'S', KeyD: 'D', KeyF: 'F', KeyG: 'G', KeyH: 'H',
  KeyJ: 'J', KeyK: 'K', KeyL: 'L', KeyZ: 'Z', KeyX: 'X', KeyC: 'C', KeyV: 'V', KeyB: 'B',
  KeyN: 'N', KeyM: 'M',
  F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4', F5: 'F5', F6: 'F6',
  F7: 'F7', F8: 'F8', F9: 'F9', F10: 'F10', F11: 'F11', F12: 'F12',
};

const WIDE_KEYS = new Set(['Backspace','Tab','CapsLock','Enter','ShiftLeft','ShiftRight','ControlLeft','ControlRight','Space']);

export default function KeyboardTester() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['keyboard-tester'][lang];
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [everPressed, setEverPressed] = useState<Set<string>>(new Set());
  const [keyLog, setKeyLog] = useState<KeyLog[]>([]);
  const [totalPresses, setTotalPresses] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const labels = {
    pressAnyKey: { en: 'Press any key to test', it: 'Premi un tasto per testare', es: 'Presiona cualquier tecla', fr: 'Appuyez sur une touche', de: 'Drücke eine Taste', pt: 'Pressione qualquer tecla' },
    keyName: { en: 'Key', it: 'Tasto', es: 'Tecla', fr: 'Touche', de: 'Taste', pt: 'Tecla' },
    keyCode: { en: 'Code', it: 'Codice', es: 'Código', fr: 'Code', de: 'Code', pt: 'Código' },
    location: { en: 'Location', it: 'Posizione', es: 'Ubicación', fr: 'Emplacement', de: 'Position', pt: 'Localização' },
    totalPressed: { en: 'Total keypresses', it: 'Pressioni totali', es: 'Pulsaciones totales', fr: 'Appuis totaux', de: 'Gesamte Tastenanschläge', pt: 'Pressionamentos totais' },
    uniqueKeys: { en: 'Unique keys pressed', it: 'Tasti unici premuti', es: 'Teclas únicas presionadas', fr: 'Touches uniques appuyées', de: 'Einzigartige Tasten', pt: 'Teclas únicas pressionadas' },
    recentLog: { en: 'Recent keypresses', it: 'Pressioni recenti', es: 'Pulsaciones recientes', fr: 'Appuis récents', de: 'Letzte Tastenanschläge', pt: 'Pressionamentos recentes' },
    reset: { en: 'Reset', it: 'Resetta', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
    locationNames: {
      en: ['Standard', 'Left', 'Right', 'Numpad'],
      it: ['Standard', 'Sinistra', 'Destra', 'Tastierino'],
      es: ['Estándar', 'Izquierda', 'Derecha', 'Teclado numérico'],
      fr: ['Standard', 'Gauche', 'Droite', 'Pavé numérique'],
      de: ['Standard', 'Links', 'Rechts', 'Nummernblock'],
      pt: ['Padrão', 'Esquerda', 'Direita', 'Teclado numérico'],
    },
  } as Record<string, Record<Locale, string | string[]>>;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    const code = e.code;
    setPressedKeys(prev => new Set(prev).add(code));
    setEverPressed(prev => new Set(prev).add(code));
    setTotalPresses(prev => prev + 1);
    setKeyLog(prev => [
      { key: e.key, code: e.code, which: e.which, location: e.location, time: Date.now() },
      ...prev,
    ].slice(0, 10));
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    setPressedKeys(prev => {
      const next = new Set(prev);
      next.delete(e.code);
      return next;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const handleReset = () => {
    setPressedKeys(new Set());
    setEverPressed(new Set());
    setKeyLog([]);
    setTotalPresses(0);
  };

  const locNames = labels.locationNames[lang] as string[];

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Online Keyboard Tester: Check Every Key on Your Keyboard',
      paragraphs: [
        'A keyboard tester is an essential diagnostic tool for anyone who relies on their keyboard daily. Whether you have just purchased a new mechanical keyboard, are troubleshooting a sticky key, or want to verify that every key registers correctly, an online keyboard tester gives you instant, visual feedback without installing any software.',
        'This tool displays a full QWERTY keyboard layout on screen. When you press a key, it highlights in real time, showing you the key name, JavaScript key code, and location value. Keys that have been pressed at least once remain marked, so you can systematically work through every key to confirm full functionality.',
        'Mechanical keyboard enthusiasts often use keyboard testers after building or modifying a board to make sure every switch is soldered correctly and recognized by the firmware. Gamers also use these tools to check for ghosting or key rollover issues — situations where pressing multiple keys simultaneously causes some to not register.',
        'All processing happens locally in your browser using standard keyboard events. No data is sent to any server, and no plugins or downloads are required. The tool tracks total keypresses, unique keys pressed, and maintains a log of your last ten keystrokes for quick reference.',
      ],
      faq: [
        { q: 'Can this tool detect key ghosting?', a: 'Yes. Press multiple keys at the same time and check whether all of them highlight on the visual keyboard. If a key does not highlight, your keyboard may not support that particular key combination due to ghosting limitations.' },
        { q: 'Does the keyboard tester work with non-QWERTY layouts?', a: 'The visual layout shown is QWERTY, but the tool detects keys by their physical scan code, not the character they produce. So even on AZERTY or Dvorak layouts, every physical key press will be correctly detected and highlighted.' },
        { q: 'Why does the F-key or Windows key not register?', a: 'Some browsers intercept certain keys (like F5 for refresh or the Windows/Meta key). The tool attempts to prevent default browser actions, but some system-level shortcuts may still be captured by the OS before reaching the browser.' },
        { q: 'Is my keypress data stored anywhere?', a: 'No. All detection and logging happens entirely in your browser using JavaScript keyboard events. Nothing is transmitted to any server or stored persistently.' },
        { q: 'Can I use this on a tablet or phone?', a: 'The tool is designed for physical keyboards. On-screen mobile keyboards may not fire the same key events, so results on touch devices will be limited or inconsistent.' },
      ],
    },
    it: {
      title: 'Tester Tastiera Online: Verifica Ogni Tasto della Tua Tastiera',
      paragraphs: [
        'Un tester per tastiera è uno strumento diagnostico essenziale per chiunque utilizzi la tastiera quotidianamente. Che tu abbia appena acquistato una nuova tastiera meccanica, stia risolvendo un problema con un tasto bloccato o voglia verificare che ogni tasto venga registrato correttamente, un tester online ti offre un feedback visivo istantaneo senza installare alcun software.',
        'Questo strumento mostra un layout completo della tastiera QWERTY sullo schermo. Quando premi un tasto, si illumina in tempo reale, mostrandoti il nome del tasto, il codice JavaScript e il valore di posizione. I tasti premuti almeno una volta rimangono evidenziati, così puoi verificare sistematicamente ogni tasto.',
        'Gli appassionati di tastiere meccaniche usano spesso i tester dopo aver costruito o modificato una scheda per assicurarsi che ogni switch sia saldato correttamente e riconosciuto dal firmware. I gamer usano questi strumenti per verificare problemi di ghosting o key rollover.',
        'Tutta l\'elaborazione avviene localmente nel tuo browser usando eventi tastiera standard. Nessun dato viene inviato a server, e non sono richiesti plugin o download. Lo strumento tiene traccia delle pressioni totali, dei tasti unici premuti e mantiene un registro delle ultime dieci pressioni.',
      ],
      faq: [
        { q: 'Questo strumento può rilevare il ghosting dei tasti?', a: 'Sì. Premi più tasti contemporaneamente e controlla se tutti si illuminano sulla tastiera visuale. Se un tasto non si illumina, la tua tastiera potrebbe non supportare quella combinazione.' },
        { q: 'Il tester funziona con layout non-QWERTY?', a: 'Il layout visualizzato è QWERTY, ma lo strumento rileva i tasti tramite il codice fisico, non il carattere prodotto. Quindi anche su layout AZERTY o Dvorak, ogni pressione viene rilevata correttamente.' },
        { q: 'Perché il tasto F o Windows non viene registrato?', a: 'Alcuni browser intercettano certi tasti (come F5 per aggiornare). Lo strumento tenta di prevenire le azioni predefinite, ma alcune scorciatoie di sistema potrebbero essere catturate dal sistema operativo.' },
        { q: 'I miei dati di pressione vengono salvati?', a: 'No. Tutto il rilevamento avviene interamente nel browser usando eventi tastiera JavaScript. Nulla viene trasmesso a server o memorizzato in modo persistente.' },
        { q: 'Posso usarlo su tablet o telefono?', a: 'Lo strumento è progettato per tastiere fisiche. Le tastiere su schermo dei dispositivi mobili potrebbero non generare gli stessi eventi, quindi i risultati saranno limitati.' },
      ],
    },
    es: {
      title: 'Probador de Teclado Online: Verifica Cada Tecla de Tu Teclado',
      paragraphs: [
        'Un probador de teclado es una herramienta de diagnóstico esencial para cualquier persona que dependa de su teclado a diario. Ya sea que hayas comprado un nuevo teclado mecánico, estés solucionando una tecla atascada o quieras verificar que cada tecla se registre correctamente, un probador online te da retroalimentación visual instantánea sin instalar software.',
        'Esta herramienta muestra un diseño completo de teclado QWERTY en pantalla. Cuando presionas una tecla, se resalta en tiempo real, mostrándote el nombre de la tecla, el código JavaScript y el valor de ubicación. Las teclas presionadas al menos una vez permanecen marcadas para verificación sistemática.',
        'Los entusiastas de teclados mecánicos frecuentemente usan probadores después de construir o modificar una placa para asegurarse de que cada switch esté soldado correctamente. Los gamers también usan estas herramientas para verificar problemas de ghosting o key rollover.',
        'Todo el procesamiento ocurre localmente en tu navegador usando eventos de teclado estándar. No se envían datos a ningún servidor y no se requieren plugins ni descargas. La herramienta rastrea presiones totales, teclas únicas y mantiene un registro de las últimas diez pulsaciones.',
      ],
      faq: [
        { q: '¿Puede esta herramienta detectar el ghosting de teclas?', a: 'Sí. Presiona varias teclas al mismo tiempo y verifica si todas se resaltan en el teclado visual. Si una tecla no se resalta, tu teclado podría no soportar esa combinación.' },
        { q: '¿Funciona con diseños no-QWERTY?', a: 'El diseño visual es QWERTY, pero la herramienta detecta teclas por su código físico, no por el carácter que producen. Así que incluso en diseños AZERTY o Dvorak, cada pulsación será detectada correctamente.' },
        { q: '¿Por qué la tecla F o Windows no se registra?', a: 'Algunos navegadores interceptan ciertas teclas. La herramienta intenta prevenir acciones predeterminadas del navegador, pero algunos atajos del sistema pueden ser capturados por el SO.' },
        { q: '¿Se almacenan mis datos de pulsación?', a: 'No. Toda la detección ocurre completamente en tu navegador usando eventos de teclado JavaScript. Nada se transmite a servidores ni se almacena de forma persistente.' },
        { q: '¿Puedo usarlo en una tablet o teléfono?', a: 'La herramienta está diseñada para teclados físicos. Los teclados en pantalla de dispositivos móviles pueden no generar los mismos eventos, por lo que los resultados serán limitados.' },
      ],
    },
    fr: {
      title: 'Testeur de Clavier en Ligne : Vérifiez Chaque Touche de Votre Clavier',
      paragraphs: [
        'Un testeur de clavier est un outil de diagnostic essentiel pour quiconque utilise son clavier quotidiennement. Que vous veniez d\'acheter un nouveau clavier mécanique, que vous diagnostiquiez une touche bloquée ou que vous vouliez vérifier que chaque touche s\'enregistre correctement, un testeur en ligne vous offre un retour visuel instantané sans installer de logiciel.',
        'Cet outil affiche une disposition complète de clavier QWERTY à l\'écran. Lorsque vous appuyez sur une touche, elle se met en surbrillance en temps réel, vous montrant le nom de la touche, le code JavaScript et la valeur de position. Les touches appuyées au moins une fois restent marquées pour une vérification systématique.',
        'Les passionnés de claviers mécaniques utilisent souvent les testeurs après avoir construit ou modifié une carte pour s\'assurer que chaque switch est correctement soudé. Les joueurs utilisent aussi ces outils pour vérifier les problèmes de ghosting ou de key rollover.',
        'Tout le traitement se fait localement dans votre navigateur en utilisant les événements clavier standard. Aucune donnée n\'est envoyée à un serveur et aucun plugin n\'est requis. L\'outil suit les appuis totaux, les touches uniques et maintient un journal des dix derniers appuis.',
      ],
      faq: [
        { q: 'Cet outil peut-il détecter le ghosting des touches ?', a: 'Oui. Appuyez sur plusieurs touches simultanément et vérifiez si toutes se mettent en surbrillance sur le clavier visuel. Si une touche ne s\'allume pas, votre clavier pourrait ne pas supporter cette combinaison.' },
        { q: 'Le testeur fonctionne-t-il avec des dispositions non-QWERTY ?', a: 'La disposition affichée est QWERTY, mais l\'outil détecte les touches par leur code physique, pas par le caractère produit. Même sur AZERTY ou Dvorak, chaque appui sera correctement détecté.' },
        { q: 'Pourquoi la touche F ou Windows ne s\'enregistre-t-elle pas ?', a: 'Certains navigateurs interceptent certaines touches. L\'outil tente de prévenir les actions par défaut du navigateur, mais certains raccourcis système peuvent être capturés par le SE.' },
        { q: 'Mes données de frappe sont-elles stockées ?', a: 'Non. Toute la détection se fait entièrement dans votre navigateur via les événements clavier JavaScript. Rien n\'est transmis à un serveur ni stocké de manière persistante.' },
        { q: 'Puis-je l\'utiliser sur une tablette ou un téléphone ?', a: 'L\'outil est conçu pour les claviers physiques. Les claviers virtuels des appareils mobiles peuvent ne pas générer les mêmes événements, les résultats seront donc limités.' },
      ],
    },
    de: {
      title: 'Online Tastatur-Tester: Überprüfe Jede Taste Deiner Tastatur',
      paragraphs: [
        'Ein Tastatur-Tester ist ein unverzichtbares Diagnosewerkzeug für jeden, der täglich auf seine Tastatur angewiesen ist. Ob Sie gerade eine neue mechanische Tastatur gekauft haben, eine klemmende Taste diagnostizieren oder überprüfen möchten, ob jede Taste korrekt registriert wird — ein Online-Tester gibt Ihnen sofortiges visuelles Feedback ohne Softwareinstallation.',
        'Dieses Tool zeigt ein vollständiges QWERTY-Tastaturlayout auf dem Bildschirm an. Wenn Sie eine Taste drücken, wird sie in Echtzeit hervorgehoben und zeigt den Tastennamen, den JavaScript-Tastencode und den Positionswert. Einmal gedrückte Tasten bleiben markiert für eine systematische Überprüfung.',
        'Mechanische Tastatur-Enthusiasten verwenden häufig Tester nach dem Bau oder der Modifikation einer Platine, um sicherzustellen, dass jeder Switch korrekt verlötet ist. Gamer nutzen diese Tools auch, um Ghosting- oder Key-Rollover-Probleme zu überprüfen.',
        'Die gesamte Verarbeitung erfolgt lokal in Ihrem Browser mit Standard-Tastaturereignissen. Es werden keine Daten an Server gesendet und keine Plugins benötigt. Das Tool verfolgt Gesamtanschläge, einzigartige Tasten und führt ein Protokoll der letzten zehn Anschläge.',
      ],
      faq: [
        { q: 'Kann dieses Tool Tasten-Ghosting erkennen?', a: 'Ja. Drücken Sie mehrere Tasten gleichzeitig und prüfen Sie, ob alle auf der visuellen Tastatur hervorgehoben werden. Wenn eine Taste nicht aufleuchtet, unterstützt Ihre Tastatur möglicherweise diese Kombination nicht.' },
        { q: 'Funktioniert der Tester mit Nicht-QWERTY-Layouts?', a: 'Das angezeigte Layout ist QWERTY, aber das Tool erkennt Tasten anhand ihres physischen Codes, nicht des erzeugten Zeichens. Selbst bei QWERTZ- oder Dvorak-Layouts wird jeder Tastendruck korrekt erkannt.' },
        { q: 'Warum wird die F-Taste oder Windows-Taste nicht registriert?', a: 'Einige Browser fangen bestimmte Tasten ab. Das Tool versucht, Standard-Browseraktionen zu verhindern, aber einige Systemkürzel können vom Betriebssystem abgefangen werden.' },
        { q: 'Werden meine Tastenanschlagdaten gespeichert?', a: 'Nein. Die gesamte Erkennung erfolgt vollständig in Ihrem Browser über JavaScript-Tastaturereignisse. Nichts wird an Server übertragen oder dauerhaft gespeichert.' },
        { q: 'Kann ich es auf einem Tablet oder Telefon verwenden?', a: 'Das Tool ist für physische Tastaturen konzipiert. Bildschirmtastaturen mobiler Geräte erzeugen möglicherweise nicht dieselben Ereignisse, sodass die Ergebnisse begrenzt sind.' },
      ],
    },
    pt: {
      title: 'Testador de Teclado Online: Verifique Cada Tecla do Seu Teclado',
      paragraphs: [
        'Um testador de teclado é uma ferramenta de diagnóstico essencial para qualquer pessoa que dependa do teclado diariamente. Seja para testar um novo teclado mecânico, diagnosticar uma tecla travada ou verificar se cada tecla registra corretamente, um testador online oferece feedback visual instantâneo sem instalar software.',
        'Esta ferramenta exibe um layout completo de teclado QWERTY na tela. Quando você pressiona uma tecla, ela é destacada em tempo real, mostrando o nome da tecla, o código JavaScript e o valor de localização. Teclas pressionadas pelo menos uma vez permanecem marcadas para verificação sistemática.',
        'Entusiastas de teclados mecânicos frequentemente usam testadores após construir ou modificar uma placa para garantir que cada switch esteja soldado corretamente. Gamers também usam essas ferramentas para verificar problemas de ghosting ou key rollover.',
        'Todo o processamento acontece localmente no seu navegador usando eventos de teclado padrão. Nenhum dado é enviado a servidores e nenhum plugin é necessário. A ferramenta rastreia pressionamentos totais, teclas únicas e mantém um registro dos últimos dez pressionamentos.',
      ],
      faq: [
        { q: 'Esta ferramenta pode detectar ghosting de teclas?', a: 'Sim. Pressione várias teclas ao mesmo tempo e verifique se todas são destacadas no teclado visual. Se uma tecla não acender, seu teclado pode não suportar essa combinação.' },
        { q: 'O testador funciona com layouts não-QWERTY?', a: 'O layout visual é QWERTY, mas a ferramenta detecta teclas pelo código físico, não pelo caractere produzido. Mesmo em layouts AZERTY ou Dvorak, cada pressionamento será detectado corretamente.' },
        { q: 'Por que a tecla F ou Windows não registra?', a: 'Alguns navegadores interceptam certas teclas. A ferramenta tenta prevenir ações padrão do navegador, mas alguns atalhos do sistema podem ser capturados pelo SO.' },
        { q: 'Meus dados de digitação são armazenados?', a: 'Não. Toda a detecção acontece inteiramente no seu navegador via eventos de teclado JavaScript. Nada é transmitido a servidores ou armazenado de forma persistente.' },
        { q: 'Posso usar em um tablet ou celular?', a: 'A ferramenta é projetada para teclados físicos. Teclados na tela de dispositivos móveis podem não gerar os mesmos eventos, então os resultados serão limitados.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="keyboard-tester" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto" ref={containerRef}>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <div className="text-xs text-blue-600 font-medium">{labels.totalPressed[lang] as string}</div>
              <div className="text-2xl font-bold text-gray-900">{totalPresses}</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <div className="text-xs text-green-600 font-medium">{labels.uniqueKeys[lang] as string}</div>
              <div className="text-2xl font-bold text-gray-900">{everPressed.size}</div>
            </div>
          </div>

          {/* Last key info */}
          {keyLog.length > 0 ? (
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xs text-gray-500">{labels.keyName[lang] as string}</div>
                <div className="text-lg font-bold text-gray-900">{keyLog[0].key}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">{labels.keyCode[lang] as string}</div>
                <div className="text-lg font-bold text-gray-900">{keyLog[0].code}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">{labels.location[lang] as string}</div>
                <div className="text-lg font-bold text-gray-900">{locNames[keyLog[0].location] || keyLog[0].location}</div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-400">
              {labels.pressAnyKey[lang] as string}
            </div>
          )}

          {/* Visual Keyboard */}
          <div className="space-y-1 overflow-x-auto">
            {KEYBOARD_ROWS.map((row, ri) => (
              <div key={ri} className="flex gap-1 justify-center">
                {row.map((code) => {
                  const isActive = pressedKeys.has(code);
                  const wasPressed = everPressed.has(code);
                  const isWide = WIDE_KEYS.has(code);
                  const isSpace = code === 'Space';
                  return (
                    <div
                      key={code}
                      className={`
                        flex items-center justify-center rounded-md border text-xs font-medium select-none transition-all duration-100
                        ${isSpace ? 'min-w-[180px]' : isWide ? 'min-w-[64px]' : 'min-w-[36px]'}
                        h-9
                        ${isActive
                          ? 'bg-blue-500 border-blue-600 text-white scale-95 shadow-inner'
                          : wasPressed
                            ? 'bg-green-100 border-green-300 text-green-800'
                            : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      {KEY_LABELS[code] || code}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Key log */}
          {keyLog.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">{labels.recentLog[lang] as string}</h3>
                <button onClick={handleReset} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                  {labels.reset[lang] as string}
                </button>
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {keyLog.map((entry, i) => (
                  <div key={entry.time + '-' + i} className="flex justify-between text-xs bg-gray-50 rounded px-3 py-1.5">
                    <span className="font-mono font-medium text-gray-900">{entry.key}</span>
                    <span className="text-gray-500">{entry.code}</span>
                    <span className="text-gray-400">{locNames[entry.location]}</span>
                  </div>
                ))}
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
