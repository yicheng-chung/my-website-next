'use client'

import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react'
import { HTML_LANG, LANGUAGE_STORAGE_KEY } from '@/lib/languageCookie'

export type Lang = 'zh' | 'en'

type LanguageContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
)

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function writeCookie(value: Lang) {
  document.cookie = `${LANGUAGE_STORAGE_KEY}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: ReactNode
  initialLang: Lang
}) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  // One-time migration: a visitor from before this cookie-based fix existed
  // may have a 'zh' preference sitting only in localStorage, which the
  // server can't see. If so, adopt it and write the cookie so every future
  // load is correct from the server's very first HTML byte — this
  // useLayoutEffect flash only ever happens once, after which the cookie
  // takes over. Visitors who already have the cookie (initialLang reflects
  // it) never hit this branch at all.
  useLayoutEffect(() => {
    if (document.cookie.includes(`${LANGUAGE_STORAGE_KEY}=`)) return
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (stored === 'zh' || stored === 'en') {
      setLangState(stored)
      writeCookie(stored)
    }
  }, [])

  useLayoutEffect(() => {
    document.documentElement.lang = HTML_LANG[lang]
  }, [lang])

  const setLang = (next: Lang) => {
    setLangState(next)
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next)
    writeCookie(next)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return ctx
}
