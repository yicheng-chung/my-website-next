'use client'

import { FaGithub, FaLinkedin, FaFacebook, FaInstagram } from 'react-icons/fa'
import { useTranslations } from '@/lib/useTranslations'
import content from '@/content/contact.json'
import links from '@/content/links.json'

const iconClass = 'h-7 w-7 flex-shrink-0 sm:h-8 sm:w-8'

export default function Contact() {
  const t = useTranslations(content)

  return (
    <div className='rounded-2xl bg-[#6F9F9C] p-6 text-white sm:p-8'>
      <h1 className='mb-6 border-b-2 border-white pb-1 text-xl font-bold sm:text-2xl'>
        {t.linksHeading}
      </h1>
      <div className='flex items-center gap-4'>
        <a
          href={links.instagram}
          target='_blank'
          rel='noreferrer'
          aria-label='GitHub'
        >
          <FaInstagram className={iconClass} />
        </a>
        <a
          href={links.facebook}
          target='_blank'
          rel='noreferrer'
          aria-label='Facebook'
        >
          <FaFacebook className={iconClass} />
        </a>
        <a
          href={links.github}
          target='_blank'
          rel='noreferrer'
          aria-label='GitHub'
        >
          <FaGithub className={iconClass} />
        </a>
        <a
          href={links.linkedin}
          target='_blank'
          rel='noreferrer'
          aria-label='LinkedIn'
        >
          <FaLinkedin className={iconClass} />
        </a>
      </div>
    </div>
  )
}
