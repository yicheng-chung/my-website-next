"use client";

import Image from "next/image";
import { useTranslations } from "@/lib/useTranslations";
import content from "@/content/skills.json";
import skillsData from "@/content/skills-data.json";

export default function Skills() {
  const t = useTranslations(content);

  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">
      <h1 className="mb-6 text-3xl font-bold text-[#ca4141]">{t.heading}</h1>

      <div className="flex flex-col gap-4">
        {skillsData.map((skill) => (
          <div key={skill.name}>
            <span className="text-lg font-medium">{skill.name}</span>
            <div className="mt-1 h-5 w-full overflow-hidden rounded-full bg-neutral-200">
              <div
                className="flex h-full items-center justify-center rounded-full bg-[#ca4141] text-xs font-semibold text-white transition-all"
                style={{ width: `${skill.level}%` }}
              >
                {skill.level}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <Image
        src="/images/skills/skills.png"
        alt="skills"
        width={400}
        height={300}
        className="mx-auto mt-8"
      />
    </div>
  );
}
