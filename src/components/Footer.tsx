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

// `onImage`: white text/icons for sitting on top of a photo (the reading
// page's bottom bookmark) instead of the plain page background.
export default function Footer({ onImage = false }: { onImage?: boolean }) {
  const t = useTranslations(common)
  const year = new Date().getFullYear()

  return (
    <footer
      className={`mx-auto flex max-w-7xl flex-col items-center border-neutral-200 px-4 sm:px-6 lg:px-10 dark:border-neutral-700 ${
        onImage ? 'gap-1.5 py-1.5 xl:gap-3 xl:py-4' : 'gap-4 py-6'
      }`}
    >
      <div className={`flex items-center ${onImage ? 'gap-3 xl:gap-5' : 'gap-5'}`}>
        {SOCIAL_LINKS.map(({ href, label, Icon }) => (
          <a
            key={label}
            href={href}
            target='_blank'
            rel='noreferrer'
            aria-label={label}
            className={
              onImage
                ? 'text-white/80 transition-colors hover:text-white'
                : 'text-neutral-500 transition-colors hover:text-white dark:text-neutral-400 dark:hover:text-[#F6B45E]'
            }
          >
            {/* Smaller on a narrower photo (md–xl), where there's less
                room under the bookmark's text. */}
            <Icon className={onImage ? 'h-[18px] w-[18px] xl:h-7 xl:w-7' : 'h-7 w-7'} />
          </a>
        ))}
      </div>
      <p
        className={
          onImage
            ? 'text-[11px] text-white/80 xl:text-sm'
            : 'text-sm text-slate-600 dark:text-slate-400'
        }
      >
        {t.footer.copyright.replace('{year}', String(year))}
      </p>
    </footer>
  )
}
