'use client'

import Image from 'next/image'
import { Mountain } from 'lucide-react'
import { FaGithub, FaLinkedin, FaFacebook } from 'react-icons/fa'
import { useTranslations } from '@/lib/useTranslations'
import common from '@/content/common.json'
import links from '@/content/links.json'

const SOCIAL_LINKS = [
  { href: links.github, label: 'GitHub', Icon: FaGithub },
  { href: links.linkedin, label: 'LinkedIn', Icon: FaLinkedin },
  { href: links.facebook, label: 'Facebook', Icon: FaFacebook },
  { href: links.helpx, label: 'HelpX', Icon: Mountain },
]

export default function Profile() {
  const t = useTranslations(common)

  return (
    <div className='flex w-full flex-col items-center rounded-2xl border border-neutral-200 bg-white p-6'>
      <div className='mb-4'>
        <Image
          src='/images/yc.jpg'
          alt='Yi-Cheng Chung'
          width={150}
          height={150}
          className='rounded-full border-2 border-[#577E89]/40 object-cover'
        />
      </div>
      <div className='flex flex-col items-center text-center'>
        <span className='text-2xl font-extrabold'>{t.profile.name}</span>
        <h6 className='mt-1 text-lg'>{t.profile.role}</h6>
        <h6 className='text-lg'>{t.profile.school}</h6>
        <h6 className='text-lg'>{t.profile.years}</h6>
      </div>
      <p className='mt-6 rounded-xl rounded-br-none bg-[#577E89]/30 p-3 text-base font-normal'>
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
            className='text-[#3a2709]/70 hover:text-[#577E89] transition-colors'
          >
            <Icon size={32} />
          </a>
        ))}
      </nav>
    </div>
  )
}
