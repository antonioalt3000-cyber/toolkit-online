'use client';
import { useParams } from 'next/navigation';
import { type Locale } from '@/lib/translations';

const content: Record<Locale, { title: string; lastUpdated: string; sections: { heading: string; body: string }[] }> = {
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: March 2026',
    sections: [
      {
        heading: 'Introduction',
        body: 'Welcome to ToolKit Online. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect information when you visit our website at toolkitonline.vip. We comply with the EU General Data Protection Regulation (GDPR) and applicable privacy laws.',
      },
      {
        heading: 'Data Controller',
        body: 'The data controller for this website is ToolKit Online, reachable at info@toolkitonline.vip. ToolKit Online is an independent web project operated from the European Union. For any questions or requests regarding your personal data, you can contact us at the email address above.',
      },
      {
        heading: 'Data Protection Officer (DPO)',
        body: 'For any questions, concerns, or requests related to data protection and privacy, you can contact our Data Protection Officer at dpo@toolkitonline.vip. The DPO is responsible for overseeing our data protection strategy and ensuring compliance with GDPR and applicable privacy regulations.',
      },
      {
        heading: 'Information We Collect',
        body: 'We do not collect personal data such as names, email addresses, or phone numbers. Our tools run entirely in your browser, and the data you enter into our tools is never sent to our servers. Some tools may use your browser\'s local storage (localStorage) to save your preferences and tool settings locally on your device — this data never leaves your device.',
      },
      {
        heading: 'Tools That Use Third-Party Services',
        body: 'Some specific tools may make requests to third-party services to function. For example, the IP Lookup tool and Internet Speed Test may connect to external APIs (such as ipinfo.io and ipify.org) to retrieve your public IP address. These requests are only made when you explicitly click to use the tool, and we do not store the results on our servers. Please refer to the privacy policies of these third-party services for information on how they handle your data.',
      },
      {
        heading: 'Cookies and Third-Party Services',
        body: 'We use cookies only with your explicit consent via our cookie banner. We use Google Tag Manager and Google Analytics (only after consent) to understand how visitors interact with our website. Google Analytics collects anonymous data such as pages visited, time on site, and browser type. We also use Google AdSense (only after consent) to display advertisements. Google AdSense may use cookies to serve ads based on your prior visits. We implement Google Consent Mode v2 to ensure no tracking occurs without your consent. You can manage your preferences at any time via the Cookie Settings link in the footer.',
      },
      {
        heading: 'Legal Basis for Processing (GDPR)',
        body: 'We process data based on the following legal grounds: (a) Consent — for analytics and advertising cookies, which are only activated after your explicit opt-in; (b) Legitimate interest — for essential cookies necessary for the website to function; (c) No personal data is collected or processed by our servers for the operation of our tools.',
      },
      {
        heading: 'Your Rights Under GDPR',
        body: 'If you are located in the European Economic Area, you have the following rights: Right of Access — you may request information about data we process; Right to Rectification — you may request correction of inaccurate data; Right to Erasure — you may request deletion of your data; Right to Restrict Processing — you may request limitation of processing; Right to Data Portability — you may request your data in a portable format; Right to Object — you may object to processing based on legitimate interests. Since we do not collect personal data on our servers, most of these rights are automatically fulfilled. To exercise any right, contact us at info@toolkitonline.vip.',
      },
      {
        heading: 'Data Retention',
        body: 'We do not store personal data on our servers. Browser local storage data (tool preferences) remains on your device until you clear your browser data. Cookie consent preferences are stored locally and have no expiration until manually cleared.',
      },
      {
        heading: 'International Data Transfers',
        body: 'When you consent to analytics or advertising cookies, data may be transferred to Google servers located outside the EEA, including the United States. Google operates under Standard Contractual Clauses approved by the EU Commission to ensure adequate data protection.',
      },
      {
        heading: 'Third-Party Links',
        body: 'Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites.',
      },
      {
        heading: 'Data Security',
        body: 'Since we do not collect or store personal data on our servers, the risk of data breaches affecting your personal information is minimal. All tools operate client-side in your browser. Our website uses HTTPS encryption for all connections.',
      },
      {
        heading: 'Changes to This Policy',
        body: 'We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.',
      },
      {
        heading: 'Contact Us',
        body: 'If you have any questions about this Privacy Policy or wish to exercise your GDPR rights, please contact us at info@toolkitonline.vip.',
      },
    ],
  },
  it: {
    title: 'Informativa sulla Privacy',
    lastUpdated: 'Ultimo aggiornamento: Marzo 2026',
    sections: [
      {
        heading: 'Introduzione',
        body: 'Benvenuti su ToolKit Online. La tua privacy è importante per noi. Questa Informativa sulla Privacy spiega come raccogliamo, utilizziamo e proteggiamo le informazioni quando visiti il nostro sito web toolkitonline.vip. Rispettiamo il Regolamento Generale sulla Protezione dei Dati (GDPR) dell\'Unione Europea e le leggi sulla privacy applicabili.',
      },
      {
        heading: 'Titolare del Trattamento',
        body: 'Il titolare del trattamento dei dati per questo sito web e ToolKit Online, raggiungibile all\'indirizzo info@toolkitonline.vip. ToolKit Online e un progetto web indipendente operante dall\'Unione Europea. Per qualsiasi domanda o richiesta riguardante i tuoi dati personali, puoi contattarci all\'indirizzo email sopra indicato.',
      },
      {
        heading: 'Responsabile della Protezione dei Dati (DPO)',
        body: 'Per qualsiasi domanda, dubbio o richiesta relativa alla protezione dei dati e alla privacy, puoi contattare il nostro Responsabile della Protezione dei Dati all\'indirizzo dpo@toolkitonline.vip. Il DPO e responsabile della supervisione della nostra strategia di protezione dei dati e della conformita al GDPR e alle normative sulla privacy applicabili.',
      },
      {
        heading: 'Informazioni che Raccogliamo',
        body: 'Non raccogliamo dati personali come nomi, indirizzi email o numeri di telefono. I nostri strumenti funzionano interamente nel tuo browser e i dati che inserisci non vengono mai inviati ai nostri server. Alcuni strumenti possono utilizzare l\'archiviazione locale del browser (localStorage) per salvare le tue preferenze e le impostazioni degli strumenti localmente sul tuo dispositivo — questi dati non lasciano mai il tuo dispositivo.',
      },
      {
        heading: 'Strumenti che Utilizzano Servizi di Terze Parti',
        body: 'Alcuni strumenti specifici possono effettuare richieste a servizi di terze parti per funzionare. Ad esempio, lo strumento IP Lookup e l\'Internet Speed Test possono connettersi ad API esterne (come ipinfo.io e ipify.org) per recuperare il tuo indirizzo IP pubblico. Queste richieste vengono effettuate solo quando clicchi esplicitamente per utilizzare lo strumento, e non memorizziamo i risultati sui nostri server. Ti invitiamo a consultare le informative sulla privacy di questi servizi di terze parti per informazioni su come gestiscono i tuoi dati.',
      },
      {
        heading: 'Cookie e Servizi di Terze Parti',
        body: 'Utilizziamo i cookie solo con il tuo consenso esplicito tramite il nostro banner dei cookie. Utilizziamo Google Tag Manager e Google Analytics (solo dopo il consenso) per comprendere come i visitatori interagiscono con il nostro sito web. Google Analytics raccoglie dati anonimi come pagine visitate, tempo sul sito e tipo di browser. Utilizziamo inoltre Google AdSense (solo dopo il consenso) per visualizzare annunci pubblicitari. Google AdSense può utilizzare cookie per mostrare annunci basati sulle tue visite precedenti. Implementiamo Google Consent Mode v2 per garantire che nessun tracciamento avvenga senza il tuo consenso. Puoi gestire le tue preferenze in qualsiasi momento tramite il link Impostazioni Cookie nel footer.',
      },
      {
        heading: 'Base Giuridica del Trattamento (GDPR)',
        body: 'Trattiamo i dati sulla base dei seguenti fondamenti giuridici: (a) Consenso — per i cookie di analisi e pubblicitari, che vengono attivati solo dopo il tuo consenso esplicito; (b) Interesse legittimo — per i cookie essenziali necessari al funzionamento del sito web; (c) Nessun dato personale viene raccolto o trattato dai nostri server per il funzionamento dei nostri strumenti.',
      },
      {
        heading: 'I Tuoi Diritti ai Sensi del GDPR',
        body: 'Se ti trovi nello Spazio Economico Europeo, hai i seguenti diritti: Diritto di accesso — puoi richiedere informazioni sui dati che trattiamo; Diritto di rettifica — puoi richiedere la correzione di dati inesatti; Diritto alla cancellazione — puoi richiedere l\'eliminazione dei tuoi dati; Diritto di limitazione del trattamento — puoi richiedere la limitazione del trattamento; Diritto alla portabilità dei dati — puoi richiedere i tuoi dati in un formato portabile; Diritto di opposizione — puoi opporti al trattamento basato su interessi legittimi. Poiché non raccogliamo dati personali sui nostri server, la maggior parte di questi diritti è automaticamente garantita. Per esercitare qualsiasi diritto, contattaci a info@toolkitonline.vip.',
      },
      {
        heading: 'Conservazione dei Dati',
        body: 'Non memorizziamo dati personali sui nostri server. I dati dell\'archiviazione locale del browser (preferenze degli strumenti) rimangono sul tuo dispositivo fino a quando non cancelli i dati del browser. Le preferenze di consenso ai cookie sono memorizzate localmente e non hanno scadenza fino alla cancellazione manuale.',
      },
      {
        heading: 'Trasferimenti Internazionali di Dati',
        body: 'Quando acconsenti ai cookie di analisi o pubblicitari, i dati possono essere trasferiti a server di Google situati al di fuori del SEE, inclusi gli Stati Uniti. Google opera in base alle Clausole Contrattuali Standard approvate dalla Commissione Europea per garantire un\'adeguata protezione dei dati.',
      },
      {
        heading: 'Link di Terze Parti',
        body: 'Il nostro sito potrebbe contenere link a siti web di terze parti. Non siamo responsabili delle pratiche sulla privacy o dei contenuti di tali siti.',
      },
      {
        heading: 'Sicurezza dei Dati',
        body: 'Poiché non raccogliamo né memorizziamo dati personali sui nostri server, il rischio di violazioni dei dati che riguardano le tue informazioni personali è minimo. Tutti gli strumenti funzionano lato client nel tuo browser. Il nostro sito web utilizza la crittografia HTTPS per tutte le connessioni.',
      },
      {
        heading: 'Modifiche a Questa Informativa',
        body: 'Potremmo aggiornare questa Informativa sulla Privacy di tanto in tanto. Eventuali modifiche saranno pubblicate su questa pagina con una data di revisione aggiornata.',
      },
      {
        heading: 'Contattaci',
        body: 'Per qualsiasi domanda su questa Informativa sulla Privacy o per esercitare i tuoi diritti ai sensi del GDPR, contattaci a info@toolkitonline.vip.',
      },
    ],
  },
  es: {
    title: 'Política de Privacidad',
    lastUpdated: 'Última actualización: Marzo 2026',
    sections: [
      {
        heading: 'Introducción',
        body: 'Bienvenido a ToolKit Online. Tu privacidad es importante para nosotros. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos la información cuando visitas nuestro sitio web toolkitonline.vip. Cumplimos con el Reglamento General de Protección de Datos (RGPD) de la Unión Europea y las leyes de privacidad aplicables.',
      },
      {
        heading: 'Responsable del Tratamiento',
        body: 'El responsable del tratamiento de datos de este sitio web es ToolKit Online, contactable en info@toolkitonline.vip. ToolKit Online es un proyecto web independiente operado desde la Union Europea.',
      },
      {
        heading: 'Delegado de Proteccion de Datos (DPO)',
        body: 'Para cualquier pregunta, inquietud o solicitud relacionada con la proteccion de datos y la privacidad, puedes contactar a nuestro Delegado de Proteccion de Datos en dpo@toolkitonline.vip. El DPO es responsable de supervisar nuestra estrategia de proteccion de datos y garantizar el cumplimiento del RGPD y las normativas de privacidad aplicables.',
      },
      {
        heading: 'Información que Recopilamos',
        body: 'No recopilamos datos personales como nombres, direcciones de correo electrónico o números de teléfono. Nuestras herramientas funcionan completamente en tu navegador y los datos que introduces nunca se envían a nuestros servidores. Algunas herramientas pueden utilizar el almacenamiento local del navegador (localStorage) para guardar tus preferencias y configuraciones de herramientas localmente en tu dispositivo — estos datos nunca salen de tu dispositivo.',
      },
      {
        heading: 'Herramientas que Utilizan Servicios de Terceros',
        body: 'Algunas herramientas específicas pueden realizar solicitudes a servicios de terceros para funcionar. Por ejemplo, la herramienta IP Lookup y el Internet Speed Test pueden conectarse a APIs externas (como ipinfo.io e ipify.org) para obtener tu dirección IP pública. Estas solicitudes solo se realizan cuando haces clic explícitamente para usar la herramienta, y no almacenamos los resultados en nuestros servidores. Te recomendamos consultar las políticas de privacidad de estos servicios de terceros para obtener información sobre cómo manejan tus datos.',
      },
      {
        heading: 'Cookies y Servicios de Terceros',
        body: 'Utilizamos cookies solo con tu consentimiento explícito a través de nuestro banner de cookies. Usamos Google Tag Manager y Google Analytics (solo después del consentimiento) para comprender cómo los visitantes interactúan con nuestro sitio web. Google Analytics recopila datos anónimos como páginas visitadas, tiempo en el sitio y tipo de navegador. También usamos Google AdSense (solo después del consentimiento) para mostrar anuncios publicitarios. Google AdSense puede usar cookies para mostrar anuncios basados en tus visitas anteriores. Implementamos Google Consent Mode v2 para garantizar que no se realice ningún seguimiento sin tu consentimiento. Puedes gestionar tus preferencias en cualquier momento a través del enlace Configuración de Cookies en el pie de página.',
      },
      {
        heading: 'Base Legal del Tratamiento (RGPD)',
        body: 'Tratamos los datos en base a los siguientes fundamentos legales: (a) Consentimiento — para las cookies de análisis y publicidad, que solo se activan después de tu aceptación explícita; (b) Interés legítimo — para las cookies esenciales necesarias para el funcionamiento del sitio web; (c) Nuestros servidores no recopilan ni procesan datos personales para el funcionamiento de nuestras herramientas.',
      },
      {
        heading: 'Tus Derechos Bajo el RGPD',
        body: 'Si te encuentras en el Espacio Económico Europeo, tienes los siguientes derechos: Derecho de acceso — puedes solicitar información sobre los datos que tratamos; Derecho de rectificación — puedes solicitar la corrección de datos inexactos; Derecho de supresión — puedes solicitar la eliminación de tus datos; Derecho a la limitación del tratamiento — puedes solicitar la limitación del tratamiento; Derecho a la portabilidad de datos — puedes solicitar tus datos en un formato portátil; Derecho de oposición — puedes oponerte al tratamiento basado en intereses legítimos. Dado que no recopilamos datos personales en nuestros servidores, la mayoría de estos derechos se cumplen automáticamente. Para ejercer cualquier derecho, contáctanos en info@toolkitonline.vip.',
      },
      {
        heading: 'Retención de Datos',
        body: 'No almacenamos datos personales en nuestros servidores. Los datos del almacenamiento local del navegador (preferencias de herramientas) permanecen en tu dispositivo hasta que borres los datos de tu navegador. Las preferencias de consentimiento de cookies se almacenan localmente y no tienen fecha de caducidad hasta que se eliminen manualmente.',
      },
      {
        heading: 'Transferencias Internacionales de Datos',
        body: 'Cuando consientes a las cookies de análisis o publicidad, los datos pueden ser transferidos a servidores de Google ubicados fuera del EEE, incluidos los Estados Unidos. Google opera bajo las Cláusulas Contractuales Tipo aprobadas por la Comisión Europea para garantizar una protección de datos adecuada.',
      },
      {
        heading: 'Enlaces de Terceros',
        body: 'Nuestro sitio web puede contener enlaces a sitios de terceros. No somos responsables de las prácticas de privacidad o el contenido de esos sitios.',
      },
      {
        heading: 'Seguridad de los Datos',
        body: 'Dado que no recopilamos ni almacenamos datos personales en nuestros servidores, el riesgo de violaciones de datos que afecten tu información personal es mínimo. Todas las herramientas operan en el lado del cliente en tu navegador. Nuestro sitio web utiliza cifrado HTTPS para todas las conexiones.',
      },
      {
        heading: 'Cambios en Esta Política',
        body: 'Podemos actualizar esta Política de Privacidad de vez en cuando. Cualquier cambio será publicado en esta página con una fecha de revisión actualizada.',
      },
      {
        heading: 'Contáctanos',
        body: 'Si tienes alguna pregunta sobre esta Política de Privacidad o deseas ejercer tus derechos bajo el RGPD, contáctanos en info@toolkitonline.vip.',
      },
    ],
  },
  fr: {
    title: 'Politique de Confidentialité',
    lastUpdated: 'Dernière mise à jour : Mars 2026',
    sections: [
      {
        heading: 'Introduction',
        body: 'Bienvenue sur ToolKit Online. Votre vie privée est importante pour nous. Cette Politique de Confidentialité explique comment nous collectons, utilisons et protégeons les informations lorsque vous visitez notre site web toolkitonline.vip. Nous respectons le Règlement Général sur la Protection des Données (RGPD) de l\'Union Européenne et les lois applicables en matière de confidentialité.',
      },
      {
        heading: 'Responsable du Traitement',
        body: 'Le responsable du traitement des donnees de ce site web est ToolKit Online, joignable a info@toolkitonline.vip. ToolKit Online est un projet web independant opere depuis l\'Union Europeenne.',
      },
      {
        heading: 'Delegue a la Protection des Donnees (DPO)',
        body: 'Pour toute question, preoccupation ou demande relative a la protection des donnees et a la vie privee, vous pouvez contacter notre Delegue a la Protection des Donnees a dpo@toolkitonline.vip. Le DPO est charge de superviser notre strategie de protection des donnees et de garantir la conformite au RGPD et aux reglementations applicables en matiere de confidentialite.',
      },
      {
        heading: 'Informations que Nous Collectons',
        body: 'Nous ne collectons pas de données personnelles telles que noms, adresses e-mail ou numéros de téléphone. Nos outils fonctionnent entièrement dans votre navigateur et les données que vous saisissez ne sont jamais envoyées à nos serveurs. Certains outils peuvent utiliser le stockage local de votre navigateur (localStorage) pour enregistrer vos préférences et paramètres d\'outils localement sur votre appareil — ces données ne quittent jamais votre appareil.',
      },
      {
        heading: 'Outils Utilisant des Services Tiers',
        body: 'Certains outils spécifiques peuvent effectuer des requêtes vers des services tiers pour fonctionner. Par exemple, l\'outil IP Lookup et l\'Internet Speed Test peuvent se connecter à des API externes (telles que ipinfo.io et ipify.org) pour récupérer votre adresse IP publique. Ces requêtes ne sont effectuées que lorsque vous cliquez explicitement pour utiliser l\'outil, et nous ne stockons pas les résultats sur nos serveurs. Veuillez consulter les politiques de confidentialité de ces services tiers pour savoir comment ils traitent vos données.',
      },
      {
        heading: 'Cookies et Services Tiers',
        body: 'Nous utilisons les cookies uniquement avec votre consentement explicite via notre bannière de cookies. Nous utilisons Google Tag Manager et Google Analytics (uniquement après consentement) pour comprendre comment les visiteurs interagissent avec notre site web. Google Analytics collecte des données anonymes telles que les pages visitées, le temps passé sur le site et le type de navigateur. Nous utilisons également Google AdSense (uniquement après consentement) pour afficher des publicités. Google AdSense peut utiliser des cookies pour diffuser des annonces basées sur vos visites précédentes. Nous implémentons Google Consent Mode v2 pour garantir qu\'aucun suivi ne se produit sans votre consentement. Vous pouvez gérer vos préférences à tout moment via le lien Paramètres des Cookies dans le pied de page.',
      },
      {
        heading: 'Base Juridique du Traitement (RGPD)',
        body: 'Nous traitons les données sur les fondements juridiques suivants : (a) Consentement — pour les cookies d\'analyse et de publicité, qui ne sont activés qu\'après votre acceptation explicite ; (b) Intérêt légitime — pour les cookies essentiels nécessaires au fonctionnement du site web ; (c) Aucune donnée personnelle n\'est collectée ou traitée par nos serveurs pour le fonctionnement de nos outils.',
      },
      {
        heading: 'Vos Droits en Vertu du RGPD',
        body: 'Si vous vous trouvez dans l\'Espace Économique Européen, vous disposez des droits suivants : Droit d\'accès — vous pouvez demander des informations sur les données que nous traitons ; Droit de rectification — vous pouvez demander la correction de données inexactes ; Droit à l\'effacement — vous pouvez demander la suppression de vos données ; Droit à la limitation du traitement — vous pouvez demander la limitation du traitement ; Droit à la portabilité des données — vous pouvez demander vos données dans un format portable ; Droit d\'opposition — vous pouvez vous opposer au traitement fondé sur des intérêts légitimes. Puisque nous ne collectons pas de données personnelles sur nos serveurs, la plupart de ces droits sont automatiquement respectés. Pour exercer tout droit, contactez-nous à info@toolkitonline.vip.',
      },
      {
        heading: 'Conservation des Données',
        body: 'Nous ne stockons pas de données personnelles sur nos serveurs. Les données du stockage local du navigateur (préférences des outils) restent sur votre appareil jusqu\'à ce que vous effaciez les données de votre navigateur. Les préférences de consentement aux cookies sont stockées localement et n\'ont pas de date d\'expiration jusqu\'à leur suppression manuelle.',
      },
      {
        heading: 'Transferts Internationaux de Données',
        body: 'Lorsque vous consentez aux cookies d\'analyse ou de publicité, les données peuvent être transférées vers des serveurs Google situés en dehors de l\'EEE, y compris aux États-Unis. Google opère dans le cadre des Clauses Contractuelles Types approuvées par la Commission Européenne pour garantir une protection adéquate des données.',
      },
      {
        heading: 'Liens Tiers',
        body: 'Notre site web peut contenir des liens vers des sites tiers. Nous ne sommes pas responsables des pratiques de confidentialité ou du contenu de ces sites.',
      },
      {
        heading: 'Sécurité des Données',
        body: 'Puisque nous ne collectons ni ne stockons de données personnelles sur nos serveurs, le risque de violations de données affectant vos informations personnelles est minimal. Tous les outils fonctionnent côté client dans votre navigateur. Notre site web utilise le chiffrement HTTPS pour toutes les connexions.',
      },
      {
        heading: 'Modifications de Cette Politique',
        body: 'Nous pouvons mettre à jour cette Politique de Confidentialité de temps en temps. Toute modification sera publiée sur cette page avec une date de révision mise à jour.',
      },
      {
        heading: 'Nous Contacter',
        body: 'Si vous avez des questions concernant cette Politique de Confidentialité ou si vous souhaitez exercer vos droits en vertu du RGPD, contactez-nous à info@toolkitonline.vip.',
      },
    ],
  },
  de: {
    title: 'Datenschutzrichtlinie',
    lastUpdated: 'Letzte Aktualisierung: März 2026',
    sections: [
      {
        heading: 'Einleitung',
        body: 'Willkommen bei ToolKit Online. Ihre Privatsphäre ist uns wichtig. Diese Datenschutzrichtlinie erklärt, wie wir Informationen sammeln, verwenden und schützen, wenn Sie unsere Website toolkitonline.vip besuchen. Wir halten die Datenschutz-Grundverordnung (DSGVO) der Europäischen Union und geltende Datenschutzgesetze ein.',
      },
      {
        heading: 'Verantwortlicher',
        body: 'Der Verantwortliche fur die Datenverarbeitung dieser Website ist ToolKit Online, erreichbar unter info@toolkitonline.vip. ToolKit Online ist ein unabhangiges Webprojekt mit Sitz in der Europaischen Union.',
      },
      {
        heading: 'Datenschutzbeauftragter (DSB)',
        body: 'Bei Fragen, Bedenken oder Anfragen zum Datenschutz und zur Privatsphare konnen Sie unseren Datenschutzbeauftragten unter dpo@toolkitonline.vip kontaktieren. Der DSB ist fur die Uberwachung unserer Datenschutzstrategie und die Sicherstellung der Einhaltung der DSGVO und der geltenden Datenschutzvorschriften verantwortlich.',
      },
      {
        heading: 'Informationen, die wir Sammeln',
        body: 'Wir sammeln keine persönlichen Daten wie Namen, E-Mail-Adressen oder Telefonnummern. Unsere Werkzeuge laufen vollständig in Ihrem Browser und die von Ihnen eingegebenen Daten werden niemals an unsere Server gesendet. Einige Werkzeuge können den lokalen Speicher Ihres Browsers (localStorage) nutzen, um Ihre Einstellungen und Werkzeugkonfigurationen lokal auf Ihrem Gerät zu speichern — diese Daten verlassen niemals Ihr Gerät.',
      },
      {
        heading: 'Werkzeuge, die Drittanbieter-Dienste Nutzen',
        body: 'Einige spezifische Werkzeuge können Anfragen an Drittanbieter-Dienste stellen, um zu funktionieren. Zum Beispiel können das IP Lookup-Werkzeug und der Internet Speed Test sich mit externen APIs (wie ipinfo.io und ipify.org) verbinden, um Ihre öffentliche IP-Adresse abzurufen. Diese Anfragen werden nur ausgeführt, wenn Sie explizit klicken, um das Werkzeug zu verwenden, und wir speichern die Ergebnisse nicht auf unseren Servern. Bitte lesen Sie die Datenschutzrichtlinien dieser Drittanbieter-Dienste für Informationen darüber, wie sie Ihre Daten verarbeiten.',
      },
      {
        heading: 'Cookies und Drittanbieter-Dienste',
        body: 'Wir verwenden Cookies nur mit Ihrer ausdrücklichen Zustimmung über unser Cookie-Banner. Wir nutzen Google Tag Manager und Google Analytics (nur nach Zustimmung), um zu verstehen, wie Besucher mit unserer Website interagieren. Google Analytics sammelt anonyme Daten wie besuchte Seiten, Verweildauer und Browsertyp. Wir verwenden außerdem Google AdSense (nur nach Zustimmung) zur Anzeige von Werbung. Google AdSense kann Cookies verwenden, um Anzeigen basierend auf Ihren vorherigen Besuchen zu schalten. Wir implementieren Google Consent Mode v2, um sicherzustellen, dass ohne Ihre Zustimmung kein Tracking stattfindet. Sie können Ihre Einstellungen jederzeit über den Link Cookie-Einstellungen in der Fußzeile verwalten.',
      },
      {
        heading: 'Rechtsgrundlage der Verarbeitung (DSGVO)',
        body: 'Wir verarbeiten Daten auf folgenden Rechtsgrundlagen: (a) Einwilligung — für Analyse- und Werbe-Cookies, die erst nach Ihrer ausdrücklichen Zustimmung aktiviert werden; (b) Berechtigtes Interesse — für essenzielle Cookies, die für den Betrieb der Website erforderlich sind; (c) Für den Betrieb unserer Werkzeuge werden keine personenbezogenen Daten von unseren Servern erhoben oder verarbeitet.',
      },
      {
        heading: 'Ihre Rechte Gemäß der DSGVO',
        body: 'Wenn Sie sich im Europäischen Wirtschaftsraum befinden, haben Sie folgende Rechte: Recht auf Auskunft — Sie können Informationen über die von uns verarbeiteten Daten anfordern; Recht auf Berichtigung — Sie können die Korrektur unrichtiger Daten verlangen; Recht auf Löschung — Sie können die Löschung Ihrer Daten verlangen; Recht auf Einschränkung der Verarbeitung — Sie können die Einschränkung der Verarbeitung verlangen; Recht auf Datenübertragbarkeit — Sie können Ihre Daten in einem portablen Format anfordern; Widerspruchsrecht — Sie können der Verarbeitung auf Grundlage berechtigter Interessen widersprechen. Da wir keine personenbezogenen Daten auf unseren Servern speichern, werden die meisten dieser Rechte automatisch erfüllt. Um ein Recht auszuüben, kontaktieren Sie uns unter info@toolkitonline.vip.',
      },
      {
        heading: 'Datenspeicherung',
        body: 'Wir speichern keine personenbezogenen Daten auf unseren Servern. Daten im lokalen Browserspeicher (Werkzeugeinstellungen) verbleiben auf Ihrem Gerät, bis Sie Ihre Browserdaten löschen. Cookie-Einwilligungspräferenzen werden lokal gespeichert und haben kein Ablaufdatum bis zur manuellen Löschung.',
      },
      {
        heading: 'Internationale Datenübertragungen',
        body: 'Wenn Sie Analyse- oder Werbe-Cookies zustimmen, können Daten an Google-Server außerhalb des EWR übertragen werden, einschließlich in die Vereinigten Staaten. Google arbeitet gemäß den von der EU-Kommission genehmigten Standardvertragsklauseln, um einen angemessenen Datenschutz zu gewährleisten.',
      },
      {
        heading: 'Links zu Dritten',
        body: 'Unsere Website kann Links zu Websites Dritter enthalten. Wir sind nicht verantwortlich für die Datenschutzpraktiken oder Inhalte dieser Seiten.',
      },
      {
        heading: 'Datensicherheit',
        body: 'Da wir keine persönlichen Daten auf unseren Servern sammeln oder speichern, ist das Risiko von Datenschutzverletzungen, die Ihre persönlichen Informationen betreffen, minimal. Alle Werkzeuge arbeiten clientseitig in Ihrem Browser. Unsere Website verwendet HTTPS-Verschlüsselung für alle Verbindungen.',
      },
      {
        heading: 'Änderungen dieser Richtlinie',
        body: 'Wir können diese Datenschutzrichtlinie von Zeit zu Zeit aktualisieren. Änderungen werden auf dieser Seite mit einem aktualisierten Revisionsdatum veröffentlicht.',
      },
      {
        heading: 'Kontakt',
        body: 'Bei Fragen zu dieser Datenschutzrichtlinie oder zur Ausübung Ihrer Rechte gemäß der DSGVO kontaktieren Sie uns unter info@toolkitonline.vip.',
      },
    ],
  },
  pt: {
    title: 'Política de Privacidade',
    lastUpdated: 'Última atualização: Março 2026',
    sections: [
      {
        heading: 'Introdução',
        body: 'Bem-vindo ao ToolKit Online. Sua privacidade é importante para nós. Esta Política de Privacidade explica como coletamos, usamos e protegemos informações quando você visita nosso site toolkitonline.vip. Cumprimos o Regulamento Geral sobre a Proteção de Dados (RGPD) da União Europeia e as leis de privacidade aplicáveis.',
      },
      {
        heading: 'Responsavel pelo Tratamento',
        body: 'O responsavel pelo tratamento de dados deste site e ToolKit Online, contactavel em info@toolkitonline.vip. ToolKit Online e um projeto web independente operado a partir da Uniao Europeia.',
      },
      {
        heading: 'Encarregado de Protecao de Dados (DPO)',
        body: 'Para qualquer pergunta, preocupacao ou solicitacao relacionada a protecao de dados e privacidade, pode contactar o nosso Encarregado de Protecao de Dados em dpo@toolkitonline.vip. O DPO e responsavel por supervisionar a nossa estrategia de protecao de dados e garantir a conformidade com o RGPD e as regulamentacoes de privacidade aplicaveis.',
      },
      {
        heading: 'Informações que Coletamos',
        body: 'Não coletamos dados pessoais como nomes, endereços de e-mail ou números de telefone. Nossas ferramentas funcionam inteiramente no seu navegador e os dados que você insere nunca são enviados aos nossos servidores. Algumas ferramentas podem usar o armazenamento local do navegador (localStorage) para salvar suas preferências e configurações de ferramentas localmente no seu dispositivo — esses dados nunca saem do seu dispositivo.',
      },
      {
        heading: 'Ferramentas que Utilizam Serviços de Terceiros',
        body: 'Algumas ferramentas específicas podem fazer solicitações a serviços de terceiros para funcionar. Por exemplo, a ferramenta IP Lookup e o Internet Speed Test podem se conectar a APIs externas (como ipinfo.io e ipify.org) para obter seu endereço IP público. Essas solicitações são feitas apenas quando você clica explicitamente para usar a ferramenta, e não armazenamos os resultados em nossos servidores. Consulte as políticas de privacidade desses serviços de terceiros para informações sobre como eles tratam seus dados.',
      },
      {
        heading: 'Cookies e Serviços de Terceiros',
        body: 'Utilizamos cookies apenas com seu consentimento explícito por meio do nosso banner de cookies. Usamos o Google Tag Manager e o Google Analytics (apenas após consentimento) para entender como os visitantes interagem com nosso site. O Google Analytics coleta dados anônimos como páginas visitadas, tempo no site e tipo de navegador. Também usamos o Google AdSense (apenas após consentimento) para exibir anúncios. O Google AdSense pode usar cookies para exibir anúncios com base em suas visitas anteriores. Implementamos o Google Consent Mode v2 para garantir que nenhum rastreamento ocorra sem seu consentimento. Você pode gerenciar suas preferências a qualquer momento através do link Configurações de Cookies no rodapé.',
      },
      {
        heading: 'Base Legal do Tratamento (RGPD)',
        body: 'Tratamos os dados com base nos seguintes fundamentos legais: (a) Consentimento — para cookies de análise e publicidade, que são ativados apenas após sua aceitação explícita; (b) Interesse legítimo — para cookies essenciais necessários para o funcionamento do site; (c) Nenhum dado pessoal é coletado ou processado por nossos servidores para o funcionamento de nossas ferramentas.',
      },
      {
        heading: 'Seus Direitos ao Abrigo do RGPD',
        body: 'Se você está localizado no Espaço Econômico Europeu, você tem os seguintes direitos: Direito de acesso — você pode solicitar informações sobre os dados que tratamos; Direito de retificação — você pode solicitar a correção de dados imprecisos; Direito ao apagamento — você pode solicitar a exclusão dos seus dados; Direito à limitação do tratamento — você pode solicitar a limitação do tratamento; Direito à portabilidade dos dados — você pode solicitar seus dados em formato portátil; Direito de oposição — você pode se opor ao tratamento baseado em interesses legítimos. Como não coletamos dados pessoais em nossos servidores, a maioria desses direitos é automaticamente cumprida. Para exercer qualquer direito, entre em contato conosco em info@toolkitonline.vip.',
      },
      {
        heading: 'Retenção de Dados',
        body: 'Não armazenamos dados pessoais em nossos servidores. Os dados do armazenamento local do navegador (preferências de ferramentas) permanecem no seu dispositivo até que você limpe os dados do navegador. As preferências de consentimento de cookies são armazenadas localmente e não têm data de expiração até serem excluídas manualmente.',
      },
      {
        heading: 'Transferências Internacionais de Dados',
        body: 'Quando você consente com cookies de análise ou publicidade, os dados podem ser transferidos para servidores do Google localizados fora do EEE, incluindo os Estados Unidos. O Google opera sob as Cláusulas Contratuais Padrão aprovadas pela Comissão Europeia para garantir proteção adequada dos dados.',
      },
      {
        heading: 'Links de Terceiros',
        body: 'Nosso site pode conter links para sites de terceiros. Não somos responsáveis pelas práticas de privacidade ou conteúdo desses sites.',
      },
      {
        heading: 'Segurança dos Dados',
        body: 'Como não coletamos nem armazenamos dados pessoais em nossos servidores, o risco de violações de dados que afetem suas informações pessoais é mínimo. Todas as ferramentas operam no lado do cliente em seu navegador. Nosso site utiliza criptografia HTTPS para todas as conexões.',
      },
      {
        heading: 'Alterações nesta Política',
        body: 'Podemos atualizar esta Política de Privacidade de tempos em tempos. Quaisquer alterações serão publicadas nesta página com uma data de revisão atualizada.',
      },
      {
        heading: 'Fale Conosco',
        body: 'Se você tiver alguma dúvida sobre esta Política de Privacidade ou desejar exercer seus direitos ao abrigo do RGPD, entre em contato conosco em info@toolkitonline.vip.',
      },
    ],
  },
};

export default function PrivacyPage() {
  const params = useParams();
  const lang = (params?.lang as Locale) || 'en';
  const c = content[lang];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <article className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold mb-2">{c.title}</h1>
        <p className="text-sm text-gray-500 mb-8">{c.lastUpdated}</p>
        {c.sections.map((section, i) => (
          <div key={i} className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{section.heading}</h2>
            <p className="text-gray-700 leading-relaxed">{section.body}</p>
          </div>
        ))}
      </article>
    </div>
  );
}
