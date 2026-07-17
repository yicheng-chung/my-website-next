"use client";

import Image from "next/image";
import { Mail, Smartphone } from "lucide-react";
import { FaGithub, FaLinkedin, FaFacebook } from "react-icons/fa";
import { useTranslations } from "@/lib/useTranslations";
import content from "@/content/contact.json";
import links from "@/content/links.json";

export default function Contact() {
  const t = useTranslations(content);

  return (
    <div className="rounded-2xl bg-[#4f884a] p-8 text-white">
      <h1 className="mb-6 border-b-2 border-white pb-1 text-2xl font-bold">
        {t.contactHeading}
      </h1>

      <div className="mb-3 flex items-center gap-3">
        <Mail size={32} />
        <span className="text-xl">
          {t.email}
          {links.email}
        </span>
      </div>
      <div className="mb-10 flex items-center gap-3">
        <Smartphone size={32} />
        <span className="text-xl">
          {t.mobile}
          {links.phone}
        </span>
      </div>

      <h1 className="mb-6 border-b-2 border-white pb-1 text-2xl font-bold">
        {t.linksHeading}
      </h1>
      <div className="flex items-center gap-4">
        <a href={links.github} target="_blank" rel="noreferrer" aria-label="GitHub">
          <FaGithub size={32} />
        </a>
        <a href={links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
          <FaLinkedin size={32} />
        </a>
        <a href={links.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
          <FaFacebook size={32} />
        </a>
      </div>

      <Image
        src="/images/contact/contact.png"
        alt="contact"
        width={300}
        height={300}
        className="mx-auto mt-8"
      />
    </div>
  );
}
