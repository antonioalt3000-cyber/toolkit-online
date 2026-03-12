'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import type { Locale } from '@/lib/translations';
import { getConsent, setConsent, CONSENT_KEY, type ConsentState } from './ConsentManager';

type ConsentTranslations = {
  title: string;
  description: string;
  essential: string;
  essentialDesc: string;
  analytics: string;
  analyticsDesc: string;
  advertising: string;
  advertisingDesc: string;
  acceptAll: string;
  essentialOnly: string;
  savePreferences: string;
  managePreferences: string;
  alwaysOn: string;
};

const translations: Record<string, ConsentTranslations> = {
  en: {
    title: 'Cookie Preferences',
    description: 'We use cookies to improve your experience. You can choose which types of cookies to allow. Essential cookies are always active as they are necessary for the site to function.',
    essential: 'Essential',
    essentialDesc: 'Required for basic site functionality, security, and accessibility.',
    analytics: 'Analytics',
    analyticsDesc: 'Help us understand how visitors use our site to improve it.',
    advertising: 'Advertising',
    advertisingDesc: 'Used to show relevant ads and measure ad campaign effectiveness.',
    acceptAll: 'Accept All',
    essentialOnly: 'Essential Only',
    savePreferences: 'Save Preferences',
    managePreferences: 'Cookie Settings',
    alwaysOn: 'Always on',
  },
  it: {
    title: 'Preferenze Cookie',
    description: 'Utilizziamo i cookie per migliorare la tua esperienza. Puoi scegliere quali tipi di cookie consentire. I cookie essenziali sono sempre attivi perché necessari al funzionamento del sito.',
    essential: 'Essenziali',
    essentialDesc: 'Necessari per il funzionamento di base, la sicurezza e l\'accessibilità del sito.',
    analytics: 'Analitici',
    analyticsDesc: 'Ci aiutano a capire come i visitatori utilizzano il sito per migliorarlo.',
    advertising: 'Pubblicitari',
    advertisingDesc: 'Utilizzati per mostrare annunci pertinenti e misurare l\'efficacia delle campagne.',
    acceptAll: 'Accetta Tutti',
    essentialOnly: 'Solo Essenziali',
    savePreferences: 'Salva Preferenze',
    managePreferences: 'Impostazioni Cookie',
    alwaysOn: 'Sempre attivo',
  },
  es: {
    title: 'Preferencias de Cookies',
    description: 'Usamos cookies para mejorar tu experiencia. Puedes elegir qué tipos de cookies permitir. Las cookies esenciales siempre están activas ya que son necesarias para el funcionamiento del sitio.',
    essential: 'Esenciales',
    essentialDesc: 'Necesarias para la funcionalidad básica, seguridad y accesibilidad del sitio.',
    analytics: 'Analíticas',
    analyticsDesc: 'Nos ayudan a entender cómo los visitantes usan el sitio para mejorarlo.',
    advertising: 'Publicitarias',
    advertisingDesc: 'Se usan para mostrar anuncios relevantes y medir la efectividad de las campañas.',
    acceptAll: 'Aceptar Todas',
    essentialOnly: 'Solo Esenciales',
    savePreferences: 'Guardar Preferencias',
    managePreferences: 'Configuración de Cookies',
    alwaysOn: 'Siempre activo',
  },
  fr: {
    title: 'Préférences de Cookies',
    description: 'Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez choisir les types de cookies à autoriser. Les cookies essentiels sont toujours actifs car nécessaires au fonctionnement du site.',
    essential: 'Essentiels',
    essentialDesc: 'Requis pour le fonctionnement de base, la sécurité et l\'accessibilité du site.',
    analytics: 'Analytiques',
    analyticsDesc: 'Nous aident à comprendre comment les visiteurs utilisent le site pour l\'améliorer.',
    advertising: 'Publicitaires',
    advertisingDesc: 'Utilisés pour afficher des annonces pertinentes et mesurer l\'efficacité des campagnes.',
    acceptAll: 'Tout Accepter',
    essentialOnly: 'Essentiels Uniquement',
    savePreferences: 'Enregistrer les Préférences',
    managePreferences: 'Paramètres des Cookies',
    alwaysOn: 'Toujours actif',
  },
  de: {
    title: 'Cookie-Einstellungen',
    description: 'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Sie können wählen, welche Arten von Cookies Sie zulassen möchten. Essentielle Cookies sind immer aktiv, da sie für die Funktion der Website notwendig sind.',
    essential: 'Essentiell',
    essentialDesc: 'Erforderlich für die grundlegende Funktionalität, Sicherheit und Barrierefreiheit.',
    analytics: 'Analytisch',
    analyticsDesc: 'Helfen uns zu verstehen, wie Besucher die Website nutzen, um sie zu verbessern.',
    advertising: 'Werbung',
    advertisingDesc: 'Werden verwendet, um relevante Anzeigen zu zeigen und die Wirksamkeit von Kampagnen zu messen.',
    acceptAll: 'Alle Akzeptieren',
    essentialOnly: 'Nur Essentielle',
    savePreferences: 'Einstellungen Speichern',
    managePreferences: 'Cookie-Einstellungen',
    alwaysOn: 'Immer aktiv',
  },
  pt: {
    title: 'Preferências de Cookies',
    description: 'Usamos cookies para melhorar sua experiência. Você pode escolher quais tipos de cookies permitir. Cookies essenciais estão sempre ativos pois são necessários para o funcionamento do site.',
    essential: 'Essenciais',
    essentialDesc: 'Necessários para a funcionalidade básica, segurança e acessibilidade do site.',
    analytics: 'Analíticos',
    analyticsDesc: 'Nos ajudam a entender como os visitantes usam o site para melhorá-lo.',
    advertising: 'Publicitários',
    advertisingDesc: 'Usados para exibir anúncios relevantes e medir a eficácia das campanhas.',
    acceptAll: 'Aceitar Todos',
    essentialOnly: 'Apenas Essenciais',
    savePreferences: 'Salvar Preferências',
    managePreferences: 'Configurações de Cookies',
    alwaysOn: 'Sempre ativo',
  },
};

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-gray-300'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        } mt-0.5`}
      />
    </button>
  );
}

export default function CookieConsent() {
  const params = useParams();
  const lang = ((params?.lang as string) || 'en') as Locale;
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(false);
  const [advertisingOn, setAdvertisingOn] = useState(false);

  const t = translations[lang] || translations.en;

  useEffect(() => {
    const consent = getConsent();
    if (!consent) {
      setShow(true);
    } else {
      setAnalyticsOn(consent.analytics);
      setAdvertisingOn(consent.advertising);
    }

    // Listen for "reopen" events from footer
    const handler = () => {
      const consent = getConsent();
      if (consent) {
        setAnalyticsOn(consent.analytics);
        setAdvertisingOn(consent.advertising);
      }
      setShowDetails(true);
      setShow(true);
    };
    window.addEventListener('open-cookie-settings', handler);
    return () => window.removeEventListener('open-cookie-settings', handler);
  }, []);

  const saveConsent = useCallback((analytics: boolean, advertising: boolean) => {
    const state: ConsentState = {
      essential: true,
      analytics,
      advertising,
      timestamp: new Date().toISOString(),
    };
    setConsent(state);
    setShow(false);
    setShowDetails(false);
  }, []);

  const handleAcceptAll = () => {
    setAnalyticsOn(true);
    setAdvertisingOn(true);
    saveConsent(true, true);
  };

  const handleEssentialOnly = () => {
    setAnalyticsOn(false);
    setAdvertisingOn(false);
    saveConsent(false, false);
  };

  const handleSavePreferences = () => {
    saveConsent(analyticsOn, advertisingOn);
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" />

      {/* Dialog */}
      <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{t.title}</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{t.description}</p>
          </div>

          {/* Cookie categories */}
          {showDetails && (
            <div className="px-6 pb-2 space-y-3">
              {/* Essential */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex-1 mr-4">
                  <div className="font-medium text-sm text-gray-900">{t.essential}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{t.essentialDesc}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-600 font-medium">{t.alwaysOn}</span>
                  <Toggle checked={true} onChange={() => {}} disabled />
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex-1 mr-4">
                  <div className="font-medium text-sm text-gray-900">{t.analytics}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{t.analyticsDesc}</div>
                </div>
                <Toggle checked={analyticsOn} onChange={setAnalyticsOn} />
              </div>

              {/* Advertising */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex-1 mr-4">
                  <div className="font-medium text-sm text-gray-900">{t.advertising}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{t.advertisingDesc}</div>
                </div>
                <Toggle checked={advertisingOn} onChange={setAdvertisingOn} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            {showDetails ? (
              <div className="flex gap-3">
                <button
                  onClick={handleEssentialOnly}
                  className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {t.essentialOnly}
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  {t.savePreferences}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-3">
                  <button
                    onClick={handleEssentialOnly}
                    className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {t.essentialOnly}
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    {t.acceptAll}
                  </button>
                </div>
                <button
                  onClick={() => setShowDetails(true)}
                  className="w-full px-4 py-2 text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors"
                >
                  {t.managePreferences}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
