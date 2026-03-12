'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

export default function PasswordGenerator() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['password-generator'][lang];

  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const labels = {
    length: { en: 'Length', it: 'Lunghezza', es: 'Longitud', fr: 'Longueur', de: 'Länge', pt: 'Comprimento' },
    upper: { en: 'Uppercase (A-Z)', it: 'Maiuscole (A-Z)', es: 'Mayúsculas (A-Z)', fr: 'Majuscules (A-Z)', de: 'Großbuchstaben (A-Z)', pt: 'Maiúsculas (A-Z)' },
    lower: { en: 'Lowercase (a-z)', it: 'Minuscole (a-z)', es: 'Minúsculas (a-z)', fr: 'Minuscules (a-z)', de: 'Kleinbuchstaben (a-z)', pt: 'Minúsculas (a-z)' },
    nums: { en: 'Numbers (0-9)', it: 'Numeri (0-9)', es: 'Números (0-9)', fr: 'Chiffres (0-9)', de: 'Zahlen (0-9)', pt: 'Números (0-9)' },
    syms: { en: 'Symbols (!@#$)', it: 'Simboli (!@#$)', es: 'Símbolos (!@#$)', fr: 'Symboles (!@#$)', de: 'Symbole (!@#$)', pt: 'Símbolos (!@#$)' },
    gen: { en: 'Generate Password', it: 'Genera Password', es: 'Generar Contraseña', fr: 'Générer Mot de Passe', de: 'Passwort Generieren', pt: 'Gerar Senha' },
    copy: { en: 'Copy', it: 'Copia', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar' },
    copied: { en: 'Copied!', it: 'Copiato!', es: '¡Copiado!', fr: 'Copié !', de: 'Kopiert!', pt: 'Copiado!' },
  } as Record<string, Record<Locale, string>>;

  const generate = useCallback(() => {
    let chars = '';
    if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) chars += '0123456789';
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    setPassword(Array.from(array, (v) => chars[v % chars.length]).join(''));
  }, [length, uppercase, lowercase, numbers, symbols]);

  const copy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Secure Password Generator: Create Strong Random Passwords',
      paragraphs: [
        'Using strong, unique passwords is the single most important step you can take to protect your online accounts. Our free password generator creates cryptographically secure random passwords using your browser\'s built-in crypto.getRandomValues() function, ensuring true randomness that cannot be predicted or reproduced.',
        'You can customize your passwords by selecting the character types to include: uppercase letters (A-Z), lowercase letters (a-z), numbers (0-9), and special symbols (!@#$%^&*). You can also adjust the password length from 4 to 128 characters. Security experts recommend passwords of at least 12-16 characters with all character types enabled for maximum protection.',
        'A 16-character password using all character types has approximately 95^16 possible combinations, which is over 4.4 x 10^31 possibilities. Even at a rate of a trillion guesses per second, it would take billions of years to crack such a password through brute force. This is why length and character diversity are the two most important factors in password strength.',
        'Remember that each of your accounts should have a unique password. Reusing passwords means that a breach of one service exposes all your accounts. Use this generator to create a different strong password for each service, and store them in a reputable password manager like Bitwarden, 1Password, or KeePass.',
      ],
      faq: [
        { q: 'How long should my password be?', a: 'Security experts recommend at least 12-16 characters for important accounts. For maximum security, use 20+ characters. Our generator supports up to 128 characters. Longer passwords are exponentially harder to crack.' },
        { q: 'Is this password generator secure?', a: 'Yes, passwords are generated entirely in your browser using the Web Crypto API (crypto.getRandomValues), which provides cryptographically secure random numbers. No passwords are sent to or stored on any server.' },
        { q: 'Should I include special characters in my password?', a: 'Yes, including special characters significantly increases the number of possible combinations, making your password much harder to crack. A password with all character types (uppercase, lowercase, numbers, symbols) is the strongest.' },
        { q: 'How often should I change my passwords?', a: 'Current security best practice recommends changing passwords only when there is evidence of a breach, rather than on a fixed schedule. The most important practice is using unique, strong passwords for each account and enabling two-factor authentication.' },
        { q: 'Why should I not use the same password for multiple accounts?', a: 'If one service is breached, attackers test stolen credentials on other services (credential stuffing). Using unique passwords ensures that a single breach does not compromise all your accounts. Use a password manager to store unique passwords.' },
      ],
    },
    it: {
      title: 'Generatore di Password Sicure: Crea Password Casuali Robuste',
      paragraphs: [
        'Usare password forti e uniche è il passo più importante per proteggere i tuoi account online. Il nostro generatore di password gratuito crea password casuali crittograficamente sicure utilizzando la funzione crypto.getRandomValues() integrata nel browser, garantendo una vera casualità che non può essere prevista o riprodotta.',
        'Puoi personalizzare le tue password selezionando i tipi di caratteri da includere: lettere maiuscole (A-Z), lettere minuscole (a-z), numeri (0-9) e simboli speciali (!@#$%^&*). Puoi anche regolare la lunghezza della password da 4 a 128 caratteri. Gli esperti di sicurezza raccomandano password di almeno 12-16 caratteri con tutti i tipi di caratteri abilitati.',
        'Una password di 16 caratteri con tutti i tipi di caratteri ha circa 95^16 combinazioni possibili, ovvero oltre 4,4 x 10^31 possibilità. Anche a un miliardo di tentativi al secondo, ci vorrebbero miliardi di anni per violare una tale password tramite forza bruta.',
        'Ricorda che ogni tuo account dovrebbe avere una password unica. Riutilizzare le password significa che una violazione di un servizio espone tutti i tuoi account. Usa questo generatore per creare una password forte diversa per ogni servizio e conservale in un gestore di password affidabile.',
      ],
      faq: [
        { q: 'Quanto dovrebbe essere lunga la mia password?', a: 'Gli esperti di sicurezza raccomandano almeno 12-16 caratteri per gli account importanti. Per la massima sicurezza, usa 20+ caratteri. Il nostro generatore supporta fino a 128 caratteri.' },
        { q: 'Questo generatore di password è sicuro?', a: 'Sì, le password sono generate interamente nel tuo browser usando la Web Crypto API (crypto.getRandomValues), che fornisce numeri casuali crittograficamente sicuri. Nessuna password viene inviata o memorizzata su alcun server.' },
        { q: 'Devo includere caratteri speciali nella mia password?', a: 'Sì, includere caratteri speciali aumenta significativamente il numero di combinazioni possibili, rendendo la tua password molto più difficile da violare.' },
        { q: 'Ogni quanto devo cambiare le password?', a: 'La pratica di sicurezza attuale raccomanda di cambiare le password solo quando c\'è evidenza di una violazione, piuttosto che secondo un programma fisso. La pratica più importante è usare password uniche e forti per ogni account.' },
        { q: 'Perché non devo usare la stessa password per più account?', a: 'Se un servizio viene violato, gli attaccanti testano le credenziali rubate su altri servizi. Usare password uniche garantisce che una singola violazione non comprometta tutti i tuoi account.' },
      ],
    },
    es: {
      title: 'Generador de Contraseñas Seguras: Crea Contraseñas Aleatorias Fuertes',
      paragraphs: [
        'Usar contraseñas fuertes y únicas es el paso más importante para proteger tus cuentas en línea. Nuestro generador de contraseñas gratuito crea contraseñas aleatorias criptográficamente seguras usando la función crypto.getRandomValues() del navegador, garantizando verdadera aleatoriedad.',
        'Puedes personalizar tus contraseñas seleccionando los tipos de caracteres: mayúsculas (A-Z), minúsculas (a-z), números (0-9) y símbolos especiales. También puedes ajustar la longitud de 4 a 128 caracteres. Los expertos recomiendan al menos 12-16 caracteres con todos los tipos habilitados.',
        'Una contraseña de 16 caracteres con todos los tipos tiene aproximadamente 95^16 combinaciones posibles, más de 4,4 x 10^31 posibilidades. Incluso a un billón de intentos por segundo, tomaría miles de millones de años descifrarla por fuerza bruta.',
        'Recuerda que cada cuenta debe tener una contraseña única. Reutilizar contraseñas significa que una brecha en un servicio expone todas tus cuentas. Usa un gestor de contraseñas para almacenar contraseñas únicas.',
      ],
      faq: [
        { q: '¿Qué tan larga debe ser mi contraseña?', a: 'Los expertos recomiendan al menos 12-16 caracteres para cuentas importantes. Para máxima seguridad, usa 20+ caracteres. Nuestro generador soporta hasta 128 caracteres.' },
        { q: '¿Este generador de contraseñas es seguro?', a: 'Sí, las contraseñas se generan completamente en tu navegador usando la Web Crypto API. Ninguna contraseña se envía o almacena en ningún servidor.' },
        { q: '¿Debo incluir caracteres especiales en mi contraseña?', a: 'Sí, incluir caracteres especiales aumenta significativamente las combinaciones posibles, haciendo tu contraseña mucho más difícil de descifrar.' },
        { q: '¿Cada cuánto debo cambiar mis contraseñas?', a: 'La práctica actual recomienda cambiar contraseñas solo cuando hay evidencia de una brecha. Lo más importante es usar contraseñas únicas y fuertes para cada cuenta.' },
        { q: '¿Por qué no debo usar la misma contraseña para varias cuentas?', a: 'Si un servicio es vulnerado, los atacantes prueban las credenciales robadas en otros servicios. Usar contraseñas únicas evita que una brecha comprometa todas tus cuentas.' },
      ],
    },
    fr: {
      title: 'Générateur de Mots de Passe Sécurisés : Créez des Mots de Passe Aléatoires',
      paragraphs: [
        'Utiliser des mots de passe forts et uniques est l\'étape la plus importante pour protéger vos comptes en ligne. Notre générateur gratuit crée des mots de passe aléatoires cryptographiquement sécurisés en utilisant la fonction crypto.getRandomValues() du navigateur.',
        'Vous pouvez personnaliser vos mots de passe en sélectionnant les types de caractères : majuscules (A-Z), minuscules (a-z), chiffres (0-9) et symboles spéciaux. La longueur est réglable de 4 à 128 caractères. Les experts recommandent au moins 12-16 caractères avec tous les types activés.',
        'Un mot de passe de 16 caractères avec tous les types a environ 95^16 combinaisons possibles, soit plus de 4,4 x 10^31 possibilités. Même à un billion de tentatives par seconde, il faudrait des milliards d\'années pour le craquer par force brute.',
        'Chaque compte devrait avoir un mot de passe unique. Réutiliser les mots de passe signifie qu\'une faille dans un service expose tous vos comptes. Utilisez un gestionnaire de mots de passe pour stocker des mots de passe uniques.',
      ],
      faq: [
        { q: 'Quelle longueur doit avoir mon mot de passe ?', a: 'Les experts recommandent au moins 12-16 caractères pour les comptes importants. Pour une sécurité maximale, utilisez 20+ caractères.' },
        { q: 'Ce générateur est-il sécurisé ?', a: 'Oui, les mots de passe sont générés entièrement dans votre navigateur avec la Web Crypto API. Aucun mot de passe n\'est envoyé ou stocké sur un serveur.' },
        { q: 'Dois-je inclure des caractères spéciaux ?', a: 'Oui, les caractères spéciaux augmentent considérablement les combinaisons possibles, rendant votre mot de passe beaucoup plus difficile à craquer.' },
        { q: 'À quelle fréquence changer mes mots de passe ?', a: 'La pratique actuelle recommande de changer les mots de passe uniquement en cas de faille avérée. L\'essentiel est d\'utiliser des mots de passe uniques et forts.' },
        { q: 'Pourquoi ne pas utiliser le même mot de passe partout ?', a: 'Si un service est compromis, les attaquants testent les identifiants volés sur d\'autres services. Des mots de passe uniques empêchent qu\'une seule faille compromette tous vos comptes.' },
      ],
    },
    de: {
      title: 'Sicherer Passwort-Generator: Starke Zufallspasswörter Erstellen',
      paragraphs: [
        'Starke, einzigartige Passwörter zu verwenden ist der wichtigste Schritt zum Schutz Ihrer Online-Konten. Unser kostenloser Passwort-Generator erstellt kryptographisch sichere Zufallspasswörter mit der browsereigenen crypto.getRandomValues()-Funktion.',
        'Sie können Ihre Passwörter anpassen: Großbuchstaben (A-Z), Kleinbuchstaben (a-z), Zahlen (0-9) und Sonderzeichen. Die Länge ist von 4 bis 128 Zeichen einstellbar. Sicherheitsexperten empfehlen mindestens 12-16 Zeichen mit allen Zeichentypen.',
        'Ein 16-Zeichen-Passwort mit allen Zeichentypen hat etwa 95^16 mögliche Kombinationen, über 4,4 x 10^31 Möglichkeiten. Selbst bei einer Billion Versuche pro Sekunde würde das Knacken Milliarden von Jahren dauern.',
        'Jedes Konto sollte ein einzigartiges Passwort haben. Passwort-Wiederverwendung bedeutet, dass ein Datenleck bei einem Dienst alle Ihre Konten gefährdet. Verwenden Sie einen Passwort-Manager für einzigartige Passwörter.',
      ],
      faq: [
        { q: 'Wie lang sollte mein Passwort sein?', a: 'Sicherheitsexperten empfehlen mindestens 12-16 Zeichen für wichtige Konten. Für maximale Sicherheit verwenden Sie 20+ Zeichen.' },
        { q: 'Ist dieser Passwort-Generator sicher?', a: 'Ja, Passwörter werden vollständig in Ihrem Browser mit der Web Crypto API generiert. Keine Passwörter werden an Server gesendet oder gespeichert.' },
        { q: 'Sollte ich Sonderzeichen einschließen?', a: 'Ja, Sonderzeichen erhöhen die möglichen Kombinationen erheblich und machen Ihr Passwort deutlich schwerer zu knacken.' },
        { q: 'Wie oft sollte ich meine Passwörter ändern?', a: 'Aktuelle Best Practices empfehlen, Passwörter nur bei Hinweisen auf einen Datenleck zu ändern. Wichtiger ist die Verwendung einzigartiger, starker Passwörter.' },
        { q: 'Warum nicht dasselbe Passwort für mehrere Konten verwenden?', a: 'Bei einem Datenleck testen Angreifer gestohlene Zugangsdaten bei anderen Diensten. Einzigartige Passwörter verhindern, dass ein einzelnes Leck alle Konten gefährdet.' },
      ],
    },
    pt: {
      title: 'Gerador de Senhas Seguras: Crie Senhas Aleatórias Fortes',
      paragraphs: [
        'Usar senhas fortes e únicas é o passo mais importante para proteger suas contas online. Nosso gerador de senhas gratuito cria senhas aleatórias criptograficamente seguras usando a função crypto.getRandomValues() do navegador.',
        'Você pode personalizar suas senhas selecionando os tipos de caracteres: maiúsculas (A-Z), minúsculas (a-z), números (0-9) e símbolos especiais. O comprimento é ajustável de 4 a 128 caracteres. Especialistas recomendam pelo menos 12-16 caracteres com todos os tipos habilitados.',
        'Uma senha de 16 caracteres com todos os tipos tem aproximadamente 95^16 combinações possíveis, mais de 4,4 x 10^31 possibilidades. Mesmo a um trilhão de tentativas por segundo, levaria bilhões de anos para quebrá-la por força bruta.',
        'Cada conta deve ter uma senha única. Reutilizar senhas significa que uma violação em um serviço expõe todas as suas contas. Use um gerenciador de senhas para armazenar senhas únicas.',
      ],
      faq: [
        { q: 'Qual deve ser o comprimento da minha senha?', a: 'Especialistas recomendam pelo menos 12-16 caracteres para contas importantes. Para máxima segurança, use 20+ caracteres.' },
        { q: 'Este gerador de senhas é seguro?', a: 'Sim, as senhas são geradas inteiramente no seu navegador usando a Web Crypto API. Nenhuma senha é enviada ou armazenada em qualquer servidor.' },
        { q: 'Devo incluir caracteres especiais na minha senha?', a: 'Sim, caracteres especiais aumentam significativamente as combinações possíveis, tornando sua senha muito mais difícil de quebrar.' },
        { q: 'Com que frequência devo mudar minhas senhas?', a: 'A prática atual recomenda mudar senhas apenas quando há evidência de violação. O mais importante é usar senhas únicas e fortes para cada conta.' },
        { q: 'Por que não devo usar a mesma senha em várias contas?', a: 'Se um serviço for violado, atacantes testam as credenciais roubadas em outros serviços. Senhas únicas impedem que uma única violação comprometa todas as suas contas.' },
      ],
    },
  };

  const seo = seoContent[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ToolPageWrapper toolSlug="password-generator" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {password && (
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-900 text-green-400 px-4 py-3 rounded-lg text-lg font-mono break-all">{password}</code>
              <button onClick={copy} className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                {copied ? labels.copied[lang] : labels.copy[lang]}
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{labels.length[lang]}: {length}</label>
            <input type="range" min="4" max="128" value={length} onChange={(e) => setLength(+e.target.value)} className="w-full" />
          </div>

          {[
            { label: labels.upper[lang], checked: uppercase, set: setUppercase },
            { label: labels.lower[lang], checked: lowercase, set: setLowercase },
            { label: labels.nums[lang], checked: numbers, set: setNumbers },
            { label: labels.syms[lang], checked: symbols, set: setSymbols },
          ].map((opt) => (
            <label key={opt.label} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={opt.checked} onChange={(e) => opt.set(e.target.checked)} className="w-5 h-5 rounded text-blue-600" />
              <span className="text-gray-700">{opt.label}</span>
            </label>
          ))}

          <button onClick={generate} className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-lg">
            {labels.gen[lang]}
          </button>
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
