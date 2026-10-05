'use client'

import Link from 'next/link'
import { useTranslations } from '@/lib/useTranslations'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import content from '@/content/notFound.json'
import common from '@/content/common.json'

export default function NotFound() {
  const t = useTranslations(content)
  const { siteName } = useTranslations(common)
  useDocumentTitle(`404 · ${siteName}`)

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-medium tracking-[0.3em] text-neutral-500">404</p>
      <h1 className="text-2xl font-bold sm:text-3xl">{t.title}</h1>
      <p className="text-neutral-600 dark:text-neutral-400">{t.body}</p>
      <Link
        href="/"
        className="mt-2 text-sm font-medium underline underline-offset-4 hover:opacity-70"
      >
        {t.back}
      </Link>
    </div>
  )
}
