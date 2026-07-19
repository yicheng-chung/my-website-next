'use client'

import { FaGithub, FaLinkedin, FaFacebook, FaInstagram } from 'react-icons/fa'
import { useTranslations } from '@/lib/useTranslations'
import common from '@/content/common.json'
import links from '@/content/links.json'

const SOCIAL_LINKS = [
  { href: links.instagram, label: 'Instagram', Icon: FaInstagram },
  { href: links.facebook, label: 'Facebook', Icon: FaFacebook },
  { href: links.github, label: 'GitHub', Icon: FaGithub },
  { href: links.linkedin, label: 'LinkedIn', Icon: FaLinkedin },
]

export default function Footer() {
  const t = useTranslations(common)
  const year = new Date().getFullYear()

  return (
    <footer className='mx-auto flex max-w-7xl flex-col items-center gap-4  border-neutral-200 px-4 py-6 sm:px-6 lg:px-10 dark:border-neutral-700'>
      <div className='flex items-center gap-5'>
        {SOCIAL_LINKS.map(({ href, label, Icon }) => (
          <a
            key={label}
            href={href}
            target='_blank'
            rel='noreferrer'
            aria-label={label}
            className='text-neutral-500 transition-colors hover:text-[#577E89] dark:text-neutral-400 dark:hover:text-[#9BB8C2]'
          >
            <Icon size={28} />
          </a>
        ))}
      </div>
      <p className='text-sm text-slate-600 dark:text-slate-400'>
        {t.footer.copyright.replace('{year}', String(year))}
      </p>
    </footer>
  )
}
