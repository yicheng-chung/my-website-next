'use client'

import Image from 'next/image'
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

export default function Profile() {
  const t = useTranslations(common)

  return (
    <div className='flex w-full flex-col items-center rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800'>
      <div className='mb-4'>
        <Image
          src='/images/yc.jpg'
          alt='Yi-Cheng Chung'
          width={150}
          height={150}
          className='rounded-full border-2 border-[#F2A341]/40 object-cover'
        />
      </div>
      <div className='flex flex-col items-center text-center'>
        <span className='text-2xl font-extrabold'>{t.profile.name}</span>
        <h6 className='mt-1 text-lg'>{t.profile.role}</h6>
        <h6 className='text-lg'>{t.profile.school}</h6>
        <h6 className='text-lg'>{t.profile.years}</h6>
      </div>
      <p className='mt-6 rounded-xl rounded-br-none bg-[#F2A341]/30 p-3 text-base font-normal dark:bg-[#F2A341]/25 dark:text-neutral-100'>
        {t.profile.intro}
      </p>
      <nav className='mt-4 flex gap-4'>
        {SOCIAL_LINKS.map(({ href, label, Icon }) => (
          <a
            key={label}
            href={href}
            target='_blank'
            rel='noreferrer'
            aria-label={label}
            className='text-[#3a2709]/70 hover:text-[#F2A341] transition-colors dark:text-neutral-400 dark:hover:text-[#F6B45E]'
          >
            <Icon size={32} />
          </a>
        ))}
      </nav>
    </div>
  )
}
