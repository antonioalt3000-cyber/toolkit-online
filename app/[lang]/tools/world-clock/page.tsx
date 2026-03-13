'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

interface ClockZone {
  id: string;
  timezone: string;
}

const DEFAULT_ZONES: ClockZone[] = [
  { id: 'utc', timezone: 'UTC' },
  { id: 'new-york', timezone: 'America/New_York' },
  { id: 'london', timezone: 'Europe/London' },
  { id: 'tokyo', timezone: 'Asia/Tokyo' },
  { id: 'sydney', timezone: 'Australia/Sydney' },
  { id: 'berlin', timezone: 'Europe/Berlin' },
  { id: 'sao-paulo', timezone: 'America/Sao_Paulo' },
  { id: 'dubai', timezone: 'Asia/Dubai' },
];

const labels: Record<string, Record<Locale, string>> = {
  title: { en: 'World Clock', it: 'Orologio Mondiale', es: 'Reloj Mundial', fr: 'Horloge Mondiale', de: 'Weltuhr', pt: 'Relógio Mundial' },
  addTimezone: { en: 'Add Timezone', it: 'Aggiungi Fuso Orario', es: 'Agregar Zona Horaria', fr: 'Ajouter un Fuseau', de: 'Zeitzone Hinzufügen', pt: 'Adicionar Fuso Horário' },
  remove: { en: 'Remove', it: 'Rimuovi', es: 'Eliminar', fr: 'Supprimer', de: 'Entfernen', pt: 'Remover' },
  reset: { en: 'Reset', it: 'Reimposta', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', pt: 'Redefinir' },
  format12h: { en: '12h', it: '12h', es: '12h', fr: '12h', de: '12h', pt: '12h' },
  format24h: { en: '24h', it: '24h', es: '24h', fr: '24h', de: '24h', pt: '24h' },
  yourTimezone: { en: 'Your Timezone', it: 'Il Tuo Fuso Orario', es: 'Tu Zona Horaria', fr: 'Votre Fuseau Horaire', de: 'Ihre Zeitzone', pt: 'Seu Fuso Horário' },
  selectTimezone: { en: 'Select a timezone...', it: 'Seleziona un fuso orario...', es: 'Selecciona una zona horaria...', fr: 'Sélectionnez un fuseau horaire...', de: 'Zeitzone auswählen...', pt: 'Selecione um fuso horário...' },
  searchTimezone: { en: 'Search timezone...', it: 'Cerca fuso orario...', es: 'Buscar zona horaria...', fr: 'Rechercher un fuseau...', de: 'Zeitzone suchen...', pt: 'Buscar fuso horário...' },
  cancel: { en: 'Cancel', it: 'Annulla', es: 'Cancelar', fr: 'Annuler', de: 'Abbrechen', pt: 'Cancelar' },
  add: { en: 'Add', it: 'Aggiungi', es: 'Agregar', fr: 'Ajouter', de: 'Hinzufügen', pt: 'Adicionar' },
  utcOffset: { en: 'UTC Offset', it: 'Offset UTC', es: 'Desfase UTC', fr: 'Décalage UTC', de: 'UTC-Offset', pt: 'Deslocamento UTC' },
  liveUpdating: { en: 'Live updating every second', it: 'Aggiornamento in tempo reale ogni secondo', es: 'Actualización en vivo cada segundo', fr: 'Mise à jour en direct chaque seconde', de: 'Live-Aktualisierung jede Sekunde', pt: 'Atualização ao vivo a cada segundo' },
  noZones: { en: 'No timezones added. Click "Add Timezone" to get started.', it: 'Nessun fuso orario aggiunto. Clicca "Aggiungi Fuso Orario" per iniziare.', es: 'Sin zonas horarias. Haz clic en "Agregar Zona Horaria" para comenzar.', fr: 'Aucun fuseau ajouté. Cliquez sur "Ajouter un Fuseau" pour commencer.', de: 'Keine Zeitzonen hinzugefügt. Klicken Sie auf "Zeitzone Hinzufügen".', pt: 'Nenhum fuso horário adicionado. Clique em "Adicionar Fuso Horário".' },
  alreadyAdded: { en: 'This timezone is already in the list.', it: 'Questo fuso orario è già nella lista.', es: 'Esta zona horaria ya está en la lista.', fr: 'Ce fuseau horaire est déjà dans la liste.', de: 'Diese Zeitzone ist bereits in der Liste.', pt: 'Este fuso horário já está na lista.' },
};

function getFormattedTime(timezone: string, use24h: boolean, locale: string): string {
  try {
    const now = new Date();
    return new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: !use24h,
    }).format(now);
  } catch {
    return '--:--:--';
  }
}

function getFormattedDate(timezone: string, locale: string): string {
  try {
    const now = new Date();
    return new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(now);
  } catch {
    return '---';
  }
}

function getUTCOffset(timezone: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    });
    const parts = formatter.formatToParts(now);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    return tzPart?.value || 'UTC';
  } catch {
    return 'UTC';
  }
}

function getCityName(timezone: string): string {
  return timezone.replace(/_/g, ' ').split('/').pop() || timezone;
}

function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

function getAllTimezones(): string[] {
  try {
    return Intl.supportedValuesOf('timeZone');
  } catch {
    return [
      'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
      'America/Sao_Paulo', 'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Europe/Rome',
      'Europe/Madrid', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Dubai', 'Asia/Kolkata',
      'Australia/Sydney', 'Pacific/Auckland',
    ];
  }
}

export default function WorldClock() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['world-clock']?.[lang] || tools['world-clock']?.['en'];
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  const [zones, setZones] = useState<ClockZone[]>(DEFAULT_ZONES);
  const [use24h, setUse24h] = useState(true);
  const [now, setNow] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTz, setSelectedTz] = useState('');
  const [duplicateError, setDuplicateError] = useState('');

  const userTimezone = getUserTimezone();
  const allTimezones = getAllTimezones();

  // Live clock update every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAddTimezone = useCallback(() => {
    if (!selectedTz) return;
    if (zones.some(z => z.timezone === selectedTz)) {
      setDuplicateError(t('alreadyAdded'));
      return;
    }
    setZones(prev => [...prev, { id: `custom-${Date.now()}`, timezone: selectedTz }]);
    setSelectedTz('');
    setSearchQuery('');
    setShowAddModal(false);
    setDuplicateError('');
  }, [selectedTz, zones]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRemoveZone = (id: string) => {
    setZones(prev => prev.filter(z => z.id !== id));
  };

  const handleReset = () => {
    setZones(DEFAULT_ZONES);
    setUse24h(true);
  };

  const filteredTimezones = allTimezones.filter(tz =>
    tz.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const localeMap: Record<Locale, string> = {
    en: 'en-US', it: 'it-IT', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', pt: 'pt-BR',
  };
  const dateLocale = localeMap[lang] || 'en-US';

  const cardColors = [
    { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', accent: 'text-blue-600 dark:text-blue-400' },
    { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', accent: 'text-purple-600 dark:text-purple-400' },
    { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', accent: 'text-amber-600 dark:text-amber-400' },
    { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', accent: 'text-emerald-600 dark:text-emerald-400' },
    { bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-800', accent: 'text-rose-600 dark:text-rose-400' },
    { bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-cyan-200 dark:border-cyan-800', accent: 'text-cyan-600 dark:text-cyan-400' },
    { bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-800', accent: 'text-indigo-600 dark:text-indigo-400' },
    { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800', accent: 'text-orange-600 dark:text-orange-400' },
  ];

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'World Clock: View Current Time in Multiple Time Zones Simultaneously',
      paragraphs: [
        'A world clock is an essential tool for anyone who works across multiple time zones. Whether you are coordinating international meetings, tracking business hours in different cities, or simply staying connected with friends and family abroad, seeing the current time in several locations at once eliminates confusion and prevents scheduling mistakes. Our world clock displays real-time information for eight default cities spanning every major time zone, and you can customize it further by adding any timezone recognized by the IANA database.',
        'Unlike basic clock widgets, this tool provides a comprehensive view of each timezone. Every clock card shows the current time with seconds precision, the full date including the day of the week, and the UTC offset. This level of detail is critical for professionals in finance, logistics, software development, and customer support who need to be aware of exact time differences when planning cross-border communications or deployments.',
        'The interface offers both 12-hour and 24-hour time formats to suit your preference. Users in the United States, United Kingdom, and other countries that favor the 12-hour format can toggle instantly, while those accustomed to the 24-hour military or European format can keep the default. The toggle applies to all displayed clocks simultaneously, so you always see a consistent format across all timezones.',
        'Adding a custom timezone is straightforward. Click the "Add Timezone" button, search through the complete list of IANA timezones, and select the one you need. The tool prevents duplicates, ensuring your dashboard stays clean and organized. You can also remove any timezone with a single click. If you ever want to return to the default setup, the reset button restores the original eight cities instantly. Your current local timezone is highlighted with a subtle badge so you can quickly identify your home time among all the displayed clocks.',
      ],
      faq: [
        { q: 'How often does the world clock update?', a: 'The world clock updates every second in real time using your device\'s system clock. Each clock card refreshes simultaneously, showing hours, minutes, and seconds. The update happens through a JavaScript interval timer, so the display stays accurate as long as the page is open.' },
        { q: 'Can I add any timezone in the world?', a: 'Yes, you can add any timezone from the IANA Time Zone Database. This includes over 400 timezones covering every region of the world. Simply click "Add Timezone," search for the city or region name, and select it from the filtered list. The tool uses the browser\'s built-in Intl.supportedValuesOf API to provide the complete list.' },
        { q: 'Does the world clock account for daylight saving time?', a: 'Yes, the clock automatically handles daylight saving time (DST) transitions. It uses the Intl.DateTimeFormat API, which is aware of DST rules for each timezone. When a region transitions to or from DST, the displayed time and UTC offset will update accordingly without any manual adjustment needed.' },
        { q: 'What is the difference between 12h and 24h format?', a: 'The 12-hour format displays time from 1:00 to 12:00 with AM/PM indicators, commonly used in the US and UK. The 24-hour format displays time from 00:00 to 23:59 without AM/PM, used in most of Europe, Latin America, and in military and aviation contexts. You can switch between them using the toggle button at the top of the tool.' },
        { q: 'Why is my timezone highlighted?', a: 'Your local timezone is automatically detected using your browser settings and highlighted with a badge labeled "Your Timezone." This makes it easy to compare your local time with other cities at a glance. The detection uses the Intl.DateTimeFormat API to identify your system\'s configured timezone.' },
      ],
    },
    it: {
      title: 'Orologio Mondiale: Visualizza l\'Ora Corrente in Più Fusi Orari Contemporaneamente',
      paragraphs: [
        'Un orologio mondiale è uno strumento essenziale per chiunque lavori attraverso più fusi orari. Che tu stia coordinando riunioni internazionali, monitorando gli orari lavorativi in diverse città o semplicemente restando connesso con amici e familiari all\'estero, vedere l\'ora corrente in diverse località simultaneamente elimina la confusione e previene errori di programmazione. Il nostro orologio mondiale mostra informazioni in tempo reale per otto città predefinite che coprono ogni fuso orario principale, e puoi personalizzarlo aggiungendo qualsiasi fuso orario riconosciuto dal database IANA.',
        'A differenza dei widget orologio basilari, questo strumento fornisce una vista completa di ogni fuso orario. Ogni scheda orologio mostra l\'ora corrente con precisione al secondo, la data completa incluso il giorno della settimana e l\'offset UTC. Questo livello di dettaglio è fondamentale per i professionisti della finanza, logistica, sviluppo software e assistenza clienti che devono essere consapevoli delle differenze orarie esatte quando pianificano comunicazioni o distribuzioni transfrontaliere.',
        'L\'interfaccia offre sia il formato 12 ore che quello 24 ore per adattarsi alle tue preferenze. Gli utenti che preferiscono il formato 12 ore possono passare istantaneamente, mentre chi è abituato al formato 24 ore europeo può mantenere l\'impostazione predefinita. L\'interruttore si applica a tutti gli orologi visualizzati simultaneamente, garantendo sempre un formato coerente in tutti i fusi orari.',
        'Aggiungere un fuso orario personalizzato è semplice. Clicca il pulsante "Aggiungi Fuso Orario", cerca nella lista completa dei fusi orari IANA e seleziona quello che ti serve. Lo strumento previene i duplicati, mantenendo la tua dashboard pulita e organizzata. Puoi anche rimuovere qualsiasi fuso orario con un solo clic. Se vuoi tornare alla configurazione predefinita, il pulsante di ripristino ripristina le otto città originali istantaneamente. Il tuo fuso orario locale è evidenziato con un badge sottile per identificare rapidamente il tuo orario locale.',
      ],
      faq: [
        { q: 'Quanto spesso si aggiorna l\'orologio mondiale?', a: 'L\'orologio mondiale si aggiorna ogni secondo in tempo reale utilizzando l\'orologio di sistema del tuo dispositivo. Ogni scheda orologio si aggiorna simultaneamente, mostrando ore, minuti e secondi. L\'aggiornamento avviene tramite un timer JavaScript, quindi il display resta preciso finché la pagina è aperta.' },
        { q: 'Posso aggiungere qualsiasi fuso orario del mondo?', a: 'Sì, puoi aggiungere qualsiasi fuso orario dal database IANA Time Zone. Questo include oltre 400 fusi orari che coprono ogni regione del mondo. Basta cliccare "Aggiungi Fuso Orario", cercare il nome della città o regione e selezionarlo dalla lista filtrata.' },
        { q: 'L\'orologio mondiale gestisce l\'ora legale?', a: 'Sì, l\'orologio gestisce automaticamente le transizioni dell\'ora legale (DST). Utilizza l\'API Intl.DateTimeFormat, che conosce le regole DST per ogni fuso orario. Quando una regione passa all\'ora legale o ne esce, l\'ora visualizzata e l\'offset UTC si aggiornano di conseguenza senza alcun intervento manuale.' },
        { q: 'Qual è la differenza tra formato 12h e 24h?', a: 'Il formato 12 ore mostra l\'ora da 1:00 a 12:00 con indicatori AM/PM, comunemente usato negli USA e nel Regno Unito. Il formato 24 ore mostra l\'ora da 00:00 a 23:59 senza AM/PM, usato nella maggior parte d\'Europa e in America Latina. Puoi passare dall\'uno all\'altro con il pulsante in alto nello strumento.' },
        { q: 'Perché il mio fuso orario è evidenziato?', a: 'Il tuo fuso orario locale viene rilevato automaticamente usando le impostazioni del browser ed evidenziato con un badge "Il Tuo Fuso Orario". Questo rende facile confrontare il tuo orario locale con altre città a colpo d\'occhio.' },
      ],
    },
    es: {
      title: 'Reloj Mundial: Ver la Hora Actual en Múltiples Zonas Horarias Simultáneamente',
      paragraphs: [
        'Un reloj mundial es una herramienta esencial para cualquier persona que trabaje en múltiples zonas horarias. Ya sea que estés coordinando reuniones internacionales, rastreando horarios comerciales en diferentes ciudades o simplemente manteniéndote conectado con amigos y familiares en el extranjero, ver la hora actual en varias ubicaciones simultáneamente elimina la confusión y previene errores de programación. Nuestro reloj mundial muestra información en tiempo real para ocho ciudades predeterminadas que abarcan cada zona horaria principal, y puedes personalizarlo agregando cualquier zona horaria reconocida por la base de datos IANA.',
        'A diferencia de los widgets de reloj básicos, esta herramienta proporciona una vista completa de cada zona horaria. Cada tarjeta de reloj muestra la hora actual con precisión de segundos, la fecha completa incluyendo el día de la semana y el desfase UTC. Este nivel de detalle es fundamental para profesionales de finanzas, logística, desarrollo de software y soporte al cliente que necesitan conocer las diferencias horarias exactas al planificar comunicaciones o despliegues internacionales.',
        'La interfaz ofrece formatos de hora de 12 y 24 horas para adaptarse a tus preferencias. Los usuarios que prefieren el formato de 12 horas pueden cambiar instantáneamente, mientras que los acostumbrados al formato europeo de 24 horas pueden mantener la configuración predeterminada. El interruptor se aplica a todos los relojes mostrados simultáneamente, garantizando siempre un formato consistente en todas las zonas horarias.',
        'Agregar una zona horaria personalizada es sencillo. Haz clic en el botón "Agregar Zona Horaria", busca en la lista completa de zonas horarias IANA y selecciona la que necesites. La herramienta previene duplicados, manteniendo tu panel limpio y organizado. También puedes eliminar cualquier zona horaria con un solo clic. Si quieres volver a la configuración predeterminada, el botón de restablecimiento restaura las ocho ciudades originales instantáneamente. Tu zona horaria local se resalta con una insignia sutil para identificar rápidamente tu hora local.',
      ],
      faq: [
        { q: '¿Con qué frecuencia se actualiza el reloj mundial?', a: 'El reloj mundial se actualiza cada segundo en tiempo real usando el reloj del sistema de tu dispositivo. Cada tarjeta de reloj se refresca simultáneamente, mostrando horas, minutos y segundos. La actualización ocurre a través de un temporizador JavaScript, por lo que la visualización permanece precisa mientras la página esté abierta.' },
        { q: '¿Puedo agregar cualquier zona horaria del mundo?', a: 'Sí, puedes agregar cualquier zona horaria de la base de datos IANA Time Zone. Esto incluye más de 400 zonas horarias que cubren cada región del mundo. Simplemente haz clic en "Agregar Zona Horaria", busca el nombre de la ciudad o región y selecciónalo de la lista filtrada.' },
        { q: '¿El reloj mundial tiene en cuenta el horario de verano?', a: 'Sí, el reloj maneja automáticamente las transiciones del horario de verano (DST). Utiliza la API Intl.DateTimeFormat, que conoce las reglas DST para cada zona horaria. Cuando una región transiciona al o desde el horario de verano, la hora mostrada y el desfase UTC se actualizan automáticamente.' },
        { q: '¿Cuál es la diferencia entre el formato 12h y 24h?', a: 'El formato de 12 horas muestra la hora de 1:00 a 12:00 con indicadores AM/PM, comúnmente usado en EE.UU. y Reino Unido. El formato de 24 horas muestra la hora de 00:00 a 23:59 sin AM/PM, usado en la mayor parte de Europa y América Latina. Puedes alternar entre ellos con el botón en la parte superior de la herramienta.' },
        { q: '¿Por qué mi zona horaria está resaltada?', a: 'Tu zona horaria local se detecta automáticamente usando la configuración de tu navegador y se resalta con una insignia "Tu Zona Horaria". Esto facilita comparar tu hora local con otras ciudades de un vistazo.' },
      ],
    },
    fr: {
      title: 'Horloge Mondiale : Afficher l\'Heure Actuelle dans Plusieurs Fuseaux Horaires Simultanément',
      paragraphs: [
        'Une horloge mondiale est un outil essentiel pour quiconque travaille à travers plusieurs fuseaux horaires. Que vous coordonniez des réunions internationales, suiviez les heures d\'ouverture dans différentes villes ou restiez simplement connecté avec des amis et de la famille à l\'étranger, voir l\'heure actuelle dans plusieurs endroits simultanément élimine la confusion et prévient les erreurs de planification. Notre horloge mondiale affiche des informations en temps réel pour huit villes par défaut couvrant chaque fuseau horaire principal, et vous pouvez la personnaliser en ajoutant n\'importe quel fuseau horaire reconnu par la base de données IANA.',
        'Contrairement aux widgets d\'horloge basiques, cet outil fournit une vue complète de chaque fuseau horaire. Chaque carte d\'horloge affiche l\'heure actuelle avec une précision à la seconde, la date complète incluant le jour de la semaine et le décalage UTC. Ce niveau de détail est essentiel pour les professionnels de la finance, de la logistique, du développement logiciel et du support client qui doivent connaître les différences horaires exactes lors de la planification de communications ou de déploiements internationaux.',
        'L\'interface propose des formats d\'heure de 12 et 24 heures pour s\'adapter à vos préférences. Les utilisateurs qui préfèrent le format 12 heures peuvent basculer instantanément, tandis que ceux habitués au format européen de 24 heures peuvent conserver le paramètre par défaut. Le commutateur s\'applique à toutes les horloges affichées simultanément, garantissant toujours un format cohérent dans tous les fuseaux horaires.',
        'Ajouter un fuseau horaire personnalisé est simple. Cliquez sur le bouton "Ajouter un Fuseau", recherchez dans la liste complète des fuseaux IANA et sélectionnez celui dont vous avez besoin. L\'outil empêche les doublons, gardant votre tableau de bord propre et organisé. Vous pouvez également supprimer n\'importe quel fuseau en un seul clic. Si vous souhaitez revenir à la configuration par défaut, le bouton de réinitialisation restaure les huit villes originales instantanément. Votre fuseau horaire local est mis en évidence avec un badge pour identifier rapidement votre heure locale.',
      ],
      faq: [
        { q: 'À quelle fréquence l\'horloge mondiale se met-elle à jour ?', a: 'L\'horloge mondiale se met à jour chaque seconde en temps réel en utilisant l\'horloge système de votre appareil. Chaque carte d\'horloge se rafraîchit simultanément, affichant heures, minutes et secondes. La mise à jour se fait via un timer JavaScript, donc l\'affichage reste précis tant que la page est ouverte.' },
        { q: 'Puis-je ajouter n\'importe quel fuseau horaire du monde ?', a: 'Oui, vous pouvez ajouter n\'importe quel fuseau horaire de la base de données IANA. Cela inclut plus de 400 fuseaux couvrant chaque région du monde. Cliquez simplement sur "Ajouter un Fuseau", recherchez le nom de la ville ou région et sélectionnez-le dans la liste filtrée.' },
        { q: 'L\'horloge mondiale gère-t-elle l\'heure d\'été ?', a: 'Oui, l\'horloge gère automatiquement les transitions d\'heure d\'été (DST). Elle utilise l\'API Intl.DateTimeFormat, qui connaît les règles DST pour chaque fuseau. Lorsqu\'une région passe à l\'heure d\'été ou en revient, l\'heure affichée et le décalage UTC se mettent à jour automatiquement.' },
        { q: 'Quelle est la différence entre le format 12h et 24h ?', a: 'Le format 12 heures affiche l\'heure de 1:00 à 12:00 avec des indicateurs AM/PM, couramment utilisé aux États-Unis et au Royaume-Uni. Le format 24 heures affiche l\'heure de 00:00 à 23:59 sans AM/PM, utilisé dans la plupart de l\'Europe et en Amérique latine. Vous pouvez basculer entre les deux avec le bouton en haut de l\'outil.' },
        { q: 'Pourquoi mon fuseau horaire est-il mis en évidence ?', a: 'Votre fuseau horaire local est automatiquement détecté via les paramètres de votre navigateur et mis en évidence avec un badge "Votre Fuseau Horaire". Cela facilite la comparaison de votre heure locale avec d\'autres villes en un coup d\'œil.' },
      ],
    },
    de: {
      title: 'Weltuhr: Aktuelle Uhrzeit in Mehreren Zeitzonen Gleichzeitig Anzeigen',
      paragraphs: [
        'Eine Weltuhr ist ein unverzichtbares Werkzeug für jeden, der über mehrere Zeitzonen hinweg arbeitet. Ob Sie internationale Meetings koordinieren, Geschäftszeiten in verschiedenen Städten verfolgen oder einfach mit Freunden und Familie im Ausland in Kontakt bleiben möchten – die aktuelle Uhrzeit an mehreren Orten gleichzeitig zu sehen, beseitigt Verwirrung und verhindert Planungsfehler. Unsere Weltuhr zeigt Echtzeit-Informationen für acht Standardstädte an, die jede wichtige Zeitzone abdecken, und Sie können sie weiter anpassen, indem Sie jede von der IANA-Datenbank anerkannte Zeitzone hinzufügen.',
        'Im Gegensatz zu einfachen Uhr-Widgets bietet dieses Tool eine umfassende Ansicht jeder Zeitzone. Jede Uhrkarte zeigt die aktuelle Uhrzeit mit Sekundengenauigkeit, das vollständige Datum einschließlich des Wochentags und den UTC-Offset. Dieses Detailniveau ist entscheidend für Fachleute in Finanzen, Logistik, Softwareentwicklung und Kundensupport, die sich der genauen Zeitunterschiede bewusst sein müssen, wenn sie grenzüberschreitende Kommunikation oder Bereitstellungen planen.',
        'Die Oberfläche bietet sowohl das 12-Stunden- als auch das 24-Stunden-Zeitformat, um Ihren Vorlieben gerecht zu werden. Benutzer, die das 12-Stunden-Format bevorzugen, können sofort umschalten, während diejenigen, die an das europäische 24-Stunden-Format gewöhnt sind, die Standardeinstellung beibehalten können. Der Schalter gilt für alle angezeigten Uhren gleichzeitig, sodass Sie immer ein einheitliches Format über alle Zeitzonen hinweg sehen.',
        'Das Hinzufügen einer benutzerdefinierten Zeitzone ist unkompliziert. Klicken Sie auf "Zeitzone Hinzufügen", suchen Sie in der vollständigen Liste der IANA-Zeitzonen und wählen Sie die gewünschte aus. Das Tool verhindert Duplikate und hält Ihr Dashboard sauber und organisiert. Sie können jede Zeitzone auch mit einem einzigen Klick entfernen. Wenn Sie zur Standardkonfiguration zurückkehren möchten, stellt die Zurücksetzen-Schaltfläche die ursprünglichen acht Städte sofort wieder her. Ihre lokale Zeitzone wird mit einem dezenten Badge hervorgehoben, damit Sie Ihre Ortszeit schnell identifizieren können.',
      ],
      faq: [
        { q: 'Wie oft aktualisiert sich die Weltuhr?', a: 'Die Weltuhr aktualisiert sich jede Sekunde in Echtzeit unter Verwendung der Systemuhr Ihres Geräts. Jede Uhrkarte wird gleichzeitig aktualisiert und zeigt Stunden, Minuten und Sekunden an. Die Aktualisierung erfolgt über einen JavaScript-Timer, sodass die Anzeige genau bleibt, solange die Seite geöffnet ist.' },
        { q: 'Kann ich jede Zeitzone der Welt hinzufügen?', a: 'Ja, Sie können jede Zeitzone aus der IANA-Zeitzonendatenbank hinzufügen. Dies umfasst über 400 Zeitzonen, die jede Region der Welt abdecken. Klicken Sie einfach auf "Zeitzone Hinzufügen", suchen Sie nach dem Stadt- oder Regionsnamen und wählen Sie ihn aus der gefilterten Liste aus.' },
        { q: 'Berücksichtigt die Weltuhr die Sommerzeit?', a: 'Ja, die Uhr behandelt automatisch Sommerzeitübergänge (DST). Sie verwendet die Intl.DateTimeFormat-API, die die DST-Regeln für jede Zeitzone kennt. Wenn eine Region zur Sommerzeit wechselt oder davon zurückkehrt, werden die angezeigte Zeit und der UTC-Offset automatisch aktualisiert.' },
        { q: 'Was ist der Unterschied zwischen 12h- und 24h-Format?', a: 'Das 12-Stunden-Format zeigt die Uhrzeit von 1:00 bis 12:00 mit AM/PM-Indikatoren an, üblicherweise in den USA und Großbritannien verwendet. Das 24-Stunden-Format zeigt die Uhrzeit von 00:00 bis 23:59 ohne AM/PM an, verwendet in den meisten europäischen Ländern und Lateinamerika. Sie können mit der Schaltfläche oben im Tool zwischen beiden wechseln.' },
        { q: 'Warum ist meine Zeitzone hervorgehoben?', a: 'Ihre lokale Zeitzone wird automatisch über Ihre Browsereinstellungen erkannt und mit einem Badge "Ihre Zeitzone" hervorgehoben. Dies erleichtert den Vergleich Ihrer Ortszeit mit anderen Städten auf einen Blick.' },
      ],
    },
    pt: {
      title: 'Relógio Mundial: Veja a Hora Atual em Múltiplos Fusos Horários Simultaneamente',
      paragraphs: [
        'Um relógio mundial é uma ferramenta essencial para qualquer pessoa que trabalhe em múltiplos fusos horários. Seja coordenando reuniões internacionais, acompanhando horários comerciais em diferentes cidades ou simplesmente mantendo contato com amigos e familiares no exterior, ver a hora atual em vários locais simultaneamente elimina confusão e previne erros de agendamento. Nosso relógio mundial exibe informações em tempo real para oito cidades padrão abrangendo cada fuso horário principal, e você pode personalizá-lo adicionando qualquer fuso horário reconhecido pelo banco de dados IANA.',
        'Diferentemente de widgets de relógio básicos, esta ferramenta fornece uma visão abrangente de cada fuso horário. Cada cartão de relógio mostra a hora atual com precisão de segundos, a data completa incluindo o dia da semana e o deslocamento UTC. Este nível de detalhe é fundamental para profissionais de finanças, logística, desenvolvimento de software e suporte ao cliente que precisam estar cientes das diferenças horárias exatas ao planejar comunicações ou implantações internacionais.',
        'A interface oferece formatos de hora de 12 e 24 horas para atender às suas preferências. Usuários que preferem o formato de 12 horas podem alternar instantaneamente, enquanto os acostumados ao formato europeu de 24 horas podem manter a configuração padrão. O botão de alternância se aplica a todos os relógios exibidos simultaneamente, garantindo sempre um formato consistente em todos os fusos horários.',
        'Adicionar um fuso horário personalizado é simples. Clique no botão "Adicionar Fuso Horário", pesquise na lista completa de fusos IANA e selecione o que você precisa. A ferramenta previne duplicatas, mantendo seu painel limpo e organizado. Você também pode remover qualquer fuso horário com um único clique. Se quiser voltar à configuração padrão, o botão de redefinição restaura as oito cidades originais instantaneamente. Seu fuso horário local é destacado com um badge sutil para identificar rapidamente seu horário local.',
      ],
      faq: [
        { q: 'Com que frequência o relógio mundial é atualizado?', a: 'O relógio mundial se atualiza a cada segundo em tempo real usando o relógio do sistema do seu dispositivo. Cada cartão de relógio é atualizado simultaneamente, mostrando horas, minutos e segundos. A atualização acontece através de um timer JavaScript, então a exibição permanece precisa enquanto a página estiver aberta.' },
        { q: 'Posso adicionar qualquer fuso horário do mundo?', a: 'Sim, você pode adicionar qualquer fuso horário do banco de dados IANA Time Zone. Isso inclui mais de 400 fusos horários cobrindo cada região do mundo. Basta clicar em "Adicionar Fuso Horário", pesquisar o nome da cidade ou região e selecioná-lo da lista filtrada.' },
        { q: 'O relógio mundial leva em conta o horário de verão?', a: 'Sim, o relógio lida automaticamente com as transições de horário de verão (DST). Ele usa a API Intl.DateTimeFormat, que conhece as regras de DST para cada fuso horário. Quando uma região transiciona para ou do horário de verão, a hora exibida e o deslocamento UTC são atualizados automaticamente.' },
        { q: 'Qual é a diferença entre o formato 12h e 24h?', a: 'O formato de 12 horas exibe a hora de 1:00 a 12:00 com indicadores AM/PM, comumente usado nos EUA e Reino Unido. O formato de 24 horas exibe a hora de 00:00 a 23:59 sem AM/PM, usado na maior parte da Europa e América Latina. Você pode alternar entre eles com o botão no topo da ferramenta.' },
        { q: 'Por que meu fuso horário está destacado?', a: 'Seu fuso horário local é detectado automaticamente usando as configurações do seu navegador e destacado com um badge "Seu Fuso Horário". Isso facilita comparar seu horário local com outras cidades rapidamente.' },
      ],
    },
  };

  const seo = seoContent[lang] || seoContent.en;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Force re-render key based on time to keep clocks updating
  const _tick = now.getTime();

  return (
    <ToolPageWrapper toolSlug="world-clock" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{toolT?.name || 'World Clock'}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{toolT?.description || ''}</p>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* 12h/24h toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setUse24h(false)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  !use24h
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t('format12h')}
              </button>
              <button
                onClick={() => setUse24h(true)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  use24h
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t('format24h')}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setShowAddModal(true); setDuplicateError(''); setSearchQuery(''); setSelectedTz(''); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                + {t('addTimezone')}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {t('reset')}
              </button>
            </div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            {t('liveUpdating')}
          </div>

          {/* Clock Grid */}
          {zones.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <p>{t('noZones')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {zones.map((zone, index) => {
                const color = cardColors[index % cardColors.length];
                const isUserTz = zone.timezone === userTimezone;
                const time = getFormattedTime(zone.timezone, use24h, dateLocale);
                const date = getFormattedDate(zone.timezone, dateLocale);
                const offset = getUTCOffset(zone.timezone);
                const cityName = getCityName(zone.timezone);

                return (
                  <div
                    key={zone.id}
                    className={`relative ${color.bg} border ${color.border} rounded-xl p-4 transition-all ${
                      isUserTz ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''
                    }`}
                  >
                    {/* User timezone badge */}
                    {isUserTz && (
                      <span className="absolute -top-2 left-3 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {t('yourTimezone')}
                      </span>
                    )}

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveZone(zone.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors p-1"
                      title={t('remove')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* City / Timezone name */}
                    <div className="mb-1">
                      <h3 className={`text-sm font-semibold ${color.accent}`}>{cityName}</h3>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{zone.timezone}</p>
                    </div>

                    {/* Digital Clock */}
                    <div className={`text-3xl font-bold font-mono ${color.accent} tracking-wider my-2`}>
                      {time}
                    </div>

                    {/* Date & day */}
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{date}</p>

                    {/* UTC offset */}
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">{t('utcOffset')}:</span>
                      <span className={`text-xs font-mono font-semibold ${color.accent}`}>{offset}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Timezone Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
            <div
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{t('addTimezone')}</h3>

              {/* Search input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setDuplicateError(''); }}
                placeholder={t('searchTimezone')}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                autoFocus
              />

              {duplicateError && (
                <p className="text-sm text-red-500 mb-2">{duplicateError}</p>
              )}

              {/* Timezone list */}
              <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg mb-4 min-h-0" style={{ maxHeight: '300px' }}>
                {filteredTimezones.length === 0 ? (
                  <p className="text-center text-gray-400 py-4">No results</p>
                ) : (
                  filteredTimezones.map(tz => {
                    const isAlready = zones.some(z => z.timezone === tz);
                    return (
                      <button
                        key={tz}
                        onClick={() => { setSelectedTz(tz); setDuplicateError(''); }}
                        className={`w-full text-left px-3 py-2 text-sm border-b border-gray-100 dark:border-gray-800 transition-colors ${
                          selectedTz === tz
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                            : isAlready
                              ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="font-medium">{getCityName(tz)}</span>
                        <span className="text-gray-400 dark:text-gray-500 ml-2 text-xs">{tz}</span>
                        {isAlready && <span className="text-xs text-gray-400 ml-1">(added)</span>}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Modal actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleAddTimezone}
                  disabled={!selectedTz}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedTz
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {t('add')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{p}</p>)}
        </article>

        {/* FAQ */}
        <section className="mt-10 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">FAQ</h2>
          <div className="space-y-2">
            {seo.faq.map((item, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left px-4 py-3 font-medium text-gray-900 dark:text-gray-100 flex justify-between items-center">
                  {item.q}
                  <span className="text-gray-400">{openFaq === i ? '\u2212' : '+'}</span>
                </button>
                {openFaq === i && <div className="px-4 pb-3 text-gray-600 dark:text-gray-400">{item.a}</div>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </ToolPageWrapper>
  );
}
