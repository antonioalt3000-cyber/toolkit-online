'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';

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

  return (
    <div className="max-w-lg mx-auto">
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
    </div>
  );
}
