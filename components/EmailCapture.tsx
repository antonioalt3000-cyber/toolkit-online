'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'

const translations: Record<string, {
  headline: string
  subtext: string
  placeholder: string
  button: string
  success: string
  alreadySubscribed: string
}> = {
  en: {
    headline: 'Get free tips & new tools',
    subtext: 'Join our newsletter. No spam, unsubscribe anytime.',
    placeholder: 'Your email',
    button: 'Subscribe',
    success: "You're in! We'll send you the best tips.",
    alreadySubscribed: 'Already subscribed. Thank you!',
  },
  it: {
    headline: 'Ricevi consigli e nuovi tool gratis',
    subtext: 'Iscriviti alla newsletter. Niente spam, cancellati quando vuoi.',
    placeholder: 'La tua email',
    button: 'Iscriviti',
    success: 'Ci sei! Ti invieremo i migliori consigli.',
    alreadySubscribed: 'Gi\u00e0 iscritto. Grazie!',
  },
  es: {
    headline: 'Recibe consejos y herramientas gratis',
    subtext: '\u00danete a nuestra newsletter. Sin spam, cancela cuando quieras.',
    placeholder: 'Tu email',
    button: 'Suscribirse',
    success: '\u00a1Listo! Te enviaremos los mejores consejos.',
    alreadySubscribed: 'Ya suscrito. \u00a1Gracias!',
  },
  fr: {
    headline: 'Recevez des astuces et outils gratuits',
    subtext: 'Rejoignez notre newsletter. Pas de spam, d\u00e9sinscription \u00e0 tout moment.',
    placeholder: 'Votre email',
    button: "S'inscrire",
    success: "C'est fait ! Nous vous enverrons les meilleurs conseils.",
    alreadySubscribed: 'D\u00e9j\u00e0 inscrit. Merci !',
  },
  de: {
    headline: 'Kostenlose Tipps & neue Tools erhalten',
    subtext: 'Abonniere unseren Newsletter. Kein Spam, jederzeit abbestellbar.',
    placeholder: 'Deine E-Mail',
    button: 'Abonnieren',
    success: 'Geschafft! Wir senden dir die besten Tipps.',
    alreadySubscribed: 'Bereits abonniert. Danke!',
  },
  pt: {
    headline: 'Receba dicas e ferramentas gr\u00e1tis',
    subtext: 'Junte-se \u00e0 nossa newsletter. Sem spam, cancele quando quiser.',
    placeholder: 'Seu email',
    button: 'Inscrever-se',
    success: 'Feito! Enviaremos as melhores dicas.',
    alreadySubscribed: 'J\u00e1 inscrito. Obrigado!',
  },
}

export default function EmailCapture() {
  const params = useParams()
  const lang = (params?.lang as string) || 'en'
  const t = translations[lang] || translations.en

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'subscribed' | 'dismissed'>('idle')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const emails: string[] = JSON.parse(localStorage.getItem('toolkit-emails') || '[]')
      if (emails.length > 0) {
        setStatus('subscribed')
        return
      }
      const dismissedAt = localStorage.getItem('toolkit-email-dismissed')
      if (dismissedAt) {
        const diff = Date.now() - Number(dismissedAt)
        if (diff < 7 * 24 * 60 * 60 * 1000) {
          setStatus('dismissed')
        } else {
          localStorage.removeItem('toolkit-email-dismissed')
        }
      }
    } catch {}
  }, [])

  if (!mounted || status === 'dismissed') return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    try {
      const emails: string[] = JSON.parse(localStorage.getItem('toolkit-emails') || '[]')
      if (!emails.includes(email.trim())) {
        emails.push(email.trim())
        localStorage.setItem('toolkit-emails', JSON.stringify(emails))
      }
    } catch {}
    setStatus('subscribed')
  }

  const handleDismiss = () => {
    try {
      localStorage.setItem('toolkit-email-dismissed', String(Date.now()))
    } catch {}
    setStatus('dismissed')
  }

  return (
    <div className="relative bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl px-4 py-3 my-4">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-emerald-400 hover:text-emerald-600 transition-colors"
        aria-label="Dismiss"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {status === 'subscribed' ? (
        <div className="flex items-center gap-2 py-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-emerald-700 text-sm font-medium">{t.success}</span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <h3 className="text-sm font-semibold text-emerald-800">{t.headline}</h3>
            </div>
            <p className="text-xs text-emerald-600 mt-0.5">{t.subtext}</p>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 flex-shrink-0">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.placeholder}
              className="px-3 py-1.5 text-sm border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-44"
            />
            <button
              type="submit"
              className="px-4 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              {t.button}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
