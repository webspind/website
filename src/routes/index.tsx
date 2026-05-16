import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jakob Munch-Brandt — AI, web & communication" },
      {
        name: "description",
        content:
          "AI Student Assistant. MSc Information Studies, Aarhus University. Web, content, automation.",
      },
      { property: "og:title", content: "Jakob Munch-Brandt" },
      {
        property: "og:description",
        content:
          "AI · web · communication. Aarhus / UT Austin alum. MSc 2026.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  component: Resume,
});

/* ------------------------------------------------------------------ */
/* i18n                                                                */
/* ------------------------------------------------------------------ */

type Lang = "da" | "en";

const T = {
  da: {
    nav: [
      ["01", "Om", "about"],
      ["02", "Erfaring", "work"],
      ["03", "Uddannelse", "projects"],
      ["04", "Værktøjer", "studio"],
      ["05", "Kontakt", "contact"],
    ],
    statusDot: "Aarhus · UT Austin alum · MSc 2026",
    name1: "Jakob",
    name2: "Munch-Brandt",
    tagline: "AI, web & kommunikation — bygger ting der virker, og som folk faktisk bruger.",
    intro:
      "Bachelor i Informationsvidenskab fra Aarhus Universitet med 6. semester på udveksling ved University of Texas at Austin. Kandidatstuderende fra september 2026. Arbejder i dag som AI Student Assistant.",
    ctaContact: "Tag fat i mig",
    ctaWork: "Se erfaring",
    metaBased: "Bosat",
    metaBasedV: "Aarhus C, 8000",
    metaFocus: "Fokus",
    metaFocusV: "AI · web · automation",
    metaYears: "Erfaring",
    metaYearsV: "5+ år digital praksis",
    metaStatus: "Status",
    metaStatusV: "Kandidatstuderende, AU",
    marquee: ["AI", "Web", "Indhold", "Strategi", "Automation", "Prompt-engineering"],
    aboutLabel: "01 / Om",
    aboutSub: "Kort fortalt",
    aboutBody: (
      <>
        Jeg arbejder i krydsfeltet mellem{" "}
        <span className="font-italic text-accent">AI, web og mennesker</span> —
        fra prompt-design og automatisering til e-handel, indhold og teknisk
        formidling. Et semester ved UT Austin har formet hvordan jeg tænker
        tværfagligt og internationalt.
      </>
    ),
    aboutCards: [
      ["Hvad jeg laver", "AI-arbejdsprocesser, web, indhold."],
      ["Hvordan jeg arbejder", "Selvkørende. Tværfagligt."],
      ["Hvad jeg læser", "Informationsvidenskab, AU."],
      ["Hvad jeg vil", "Bygge ting der bliver brugt."],
    ],
    workHeading1: "Erhvervs",
    workHeadingItalic: "erfaring",
    workLabel: "02 / Roller",
    eduLabel: "03 / Uddannelse & projekter",
    eduHeading1: "Læst, lavet, ",
    eduHeadingItalic: "leveret",
    skillsLabel: "04 / Værktøjskasse",
    skillsHeading1: "Evner & ",
    skillsHeadingItalic: "værktøjer",
    skillsIntro:
      "AI-integration i arbejdsprocesser, tværfagligt samarbejde og teknisk formidling. Jeg er den, der oversætter mellem koden, designet og dem, der ikke har siddet med det før.",
    contactLabel: "05 / Kontakt",
    contactHeading: (
      <>
        Skal vi
        <br />
        <span className="font-italic text-accent">bygge noget</span>
        <br />
        sammen?
      </>
    ),
    email: "E-mail",
    phone: "Telefon",
    elsewhere: "Andetsteds",
    footer: "Bygget i Aarhus. Sat i Inter Tight & Instrument Serif.",
    backTop: "↑ Til toppen",
    portraitCaption: "Portræt — indsæt billede her",
    portraitMeta: "/ JMB · 2026",
  },
  en: {
    nav: [
      ["01", "About", "about"],
      ["02", "Work", "work"],
      ["03", "Education", "projects"],
      ["04", "Toolkit", "studio"],
      ["05", "Contact", "contact"],
    ],
    statusDot: "Aarhus · UT Austin alum · MSc 2026",
    name1: "Jakob",
    name2: "Munch-Brandt",
    tagline: "AI, web & communication — building things that work, and that people actually use.",
    intro:
      "BSc Information Studies, Aarhus University, with my 6th semester on exchange at the University of Texas at Austin. Starting my MSc in September 2026. Currently working as an AI Student Assistant.",
    ctaContact: "Get in touch",
    ctaWork: "See work",
    metaBased: "Based",
    metaBasedV: "Aarhus, DK",
    metaFocus: "Focus",
    metaFocusV: "AI · web · automation",
    metaYears: "Experience",
    metaYearsV: "5+ yrs in digital",
    metaStatus: "Status",
    metaStatusV: "MSc student, AU",
    marquee: ["AI", "Web", "Content", "Strategy", "Automation", "Prompt-engineering"],
    aboutLabel: "01 / About",
    aboutSub: "In short",
    aboutBody: (
      <>
        I work at the intersection of{" "}
        <span className="font-italic text-accent">AI, the web and people</span>{" "}
        — from prompt design and automation to e-commerce, content and
        technical communication. A semester at UT Austin shaped how I think
        across disciplines and across borders.
      </>
    ),
    aboutCards: [
      ["What I do", "AI workflows, web, content."],
      ["How I work", "Self-driving. Cross-disciplinary."],
      ["What I study", "Information Studies, AU."],
      ["What I want", "Build things people actually use."],
    ],
    workHeading1: "Selected ",
    workHeadingItalic: "work",
    workLabel: "02 / Roles",
    eduLabel: "03 / Education & projects",
    eduHeading1: "Studied, made, ",
    eduHeadingItalic: "shipped",
    skillsLabel: "04 / Toolkit",
    skillsHeading1: "Skills & ",
    skillsHeadingItalic: "tools",
    skillsIntro:
      "AI integration in real workflows, cross-disciplinary collaboration and technical communication. I'm the one translating between the code, the design and the people who haven't sat with it before.",
    contactLabel: "05 / Contact",
    contactHeading: (
      <>
        Let's
        <br />
        <span className="font-italic text-accent">build something</span>
        <br />
        together.
      </>
    ),
    email: "Email",
    phone: "Phone",
    elsewhere: "Elsewhere",
    footer: "Built in Aarhus. Set in Inter Tight & Instrument Serif.",
    backTop: "↑ Back to top",
    portraitCaption: "Portrait — drop your photo here",
    portraitMeta: "/ JMB · 2026",
  },
} as const;

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

type Role = {
  period: string;
  title: { da: string; en: string };
  org: string;
  bullets: { da: string[]; en: string[] };
  current?: boolean;
};

const ROLES: Role[] = [
  {
    period: "2026 — Now",
    current: true,
    title: { da: "AI Student Assistant", en: "AI Student Assistant" },
    org: "Engineering consultancy · Aarhus (NDA)",
    bullets: {
      da: [
        "Arbejder med AI-værktøjer, prompt-design og automatisering på tværs af afdelinger.",
        "Hjælper kolleger med at integrere generativ AI i daglige arbejdsprocesser — fra analyse til rapportering.",
      ],
      en: [
        "Working with AI tools, prompt design and automation across teams.",
        "Helping colleagues integrate generative AI into everyday workflows — from analysis to reporting.",
      ],
    },
  },
  {
    period: "Sep 2024 — Dec 2025",
    title: {
      da: "Kommunikations- og marketingmedarbejder",
      en: "Communications & marketing associate",
    },
    org: "Uniwelco, Viby J",
    bullets: {
      da: [
        "Projektledet teknisk og visuel opdatering af hjemmesiden — HTML, CSS, JS, HubSpot, UX og SEO via Search Console.",
        "Produceret videoindhold, produktvideoer, patentillustration og indhold til presseomtale (TV2 Østjylland, digitaliseringsministeren).",
        "Drevet organisk vækst på LinkedIn og MetalSupply; leveret case studies + materiale til SMV Digital-ansøgning der gav direkte kundeakkvisition.",
        "Implementeret automatiserede kundeflows i HubSpot og brugt AI til at effektivisere indholds- og dataopgaver.",
      ],
      en: [
        "Led the technical and visual rebuild of the company site — HTML, CSS, JS, HubSpot, UX and SEO via Search Console.",
        "Produced video and graphic material: product videos, patent illustration, and press content (TV2 Østjylland, Minister of Digitalization).",
        "Drove organic growth on LinkedIn and MetalSupply; delivered case studies and sales material for an SMV Digital grant that converted directly into new customers.",
        "Built automated customer flows in HubSpot and used AI to streamline content and data work.",
      ],
    },
  },
  {
    period: "Jun 2024 — Mar 2025",
    title: { da: "Mentor", en: "Mentor" },
    org: "SubUniversity, Aarhus Universitet",
    bullets: {
      da: [
        "Guidet gymnasieelever gennem universitetsintroduktion — fokus på klar formidling af komplekse områder.",
      ],
      en: [
        "Guided high-school students through the university intro programme — focus on clear communication of complex topics.",
      ],
    },
  },
  {
    period: "Dec 2022 — Sep 2024",
    title: { da: "Medstifter & webudvikler", en: "Co-founder & web developer" },
    org: "24skin + freelance, Aarhus",
    bullets: {
      da: [
        "Bygget og drevet komplet e-handelsløsning — Shopify, hjemmeside, produktsider, betalingsflow.",
        "Ansvarlig for hele den digitale stack: SEO, indhold, kundekommunikation, visuel identitet.",
        "Bygget WordPress-hjemmesider for privatkunder inkl. opsætning og overdragelse.",
      ],
      en: [
        "Built and ran a full e-commerce setup from scratch — Shopify store, site, product pages, checkout.",
        "Owned the full digital stack: SEO, content, customer comms, visual identity.",
        "Delivered WordPress sites for private clients, setup to handover.",
      ],
    },
  },
  {
    period: "Sep 2020 — Aug 2024",
    title: { da: "Gym Staff", en: "Gym Staff" },
    org: "Pure Gym (Aarhus) & Fitness World (Herning)",
    bullets: {
      da: [
        "Næsten fire års parallel ansættelse gennem gymnasium og bachelor — drift, kundeservice, oplæring.",
      ],
      en: [
        "Almost four years alongside high school and bachelor — operations, customer service, onboarding new staff.",
      ],
    },
  },
];

const SKILL_GROUPS: Record<Lang, Array<[string, string[]]>> = {
  da: [
    ["AI & automation", ["Prompt-design", "ChatGPT", "Claude", "Gemini", "Workflow-automation"]],
    ["Digital & web", ["HubSpot", "Shopify", "VS Code", "Figma", "Search Console", "WordPress"]],
    ["Discipliner", ["Digital projektledelse", "Webudvikling", "Indholdsstrategi", "Teknisk formidling"]],
    ["Kreativ produktion", ["Photoshop", "Illustrator", "Premiere Pro", "DaVinci Resolve"]],
  ],
  en: [
    ["AI & automation", ["Prompt design", "ChatGPT", "Claude", "Gemini", "Workflow automation"]],
    ["Digital & web", ["HubSpot", "Shopify", "VS Code", "Figma", "Search Console", "WordPress"]],
    ["Disciplines", ["Digital project management", "Web development", "Content strategy", "Technical communication"]],
    ["Creative production", ["Photoshop", "Illustrator", "Premiere Pro", "DaVinci Resolve"]],
  ],
};

/* ------------------------------------------------------------------ */
/* Components                                                          */
/* ------------------------------------------------------------------ */

function ImagePlaceholder({
  label,
  meta,
  tone = "bg-secondary",
  className = "",
  children,
}: {
  label: string;
  meta?: string;
  tone?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`relative ${tone} border border-ink/10 rounded-md overflow-hidden ${className}`}
    >
      {/* diagonal hatch */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hatch)" />
      </svg>
      {/* corner ticks */}
      <span className="absolute top-3 left-3 w-3 h-3 border-l border-t border-ink/30" />
      <span className="absolute top-3 right-3 w-3 h-3 border-r border-t border-ink/30" />
      <span className="absolute bottom-3 left-3 w-3 h-3 border-l border-b border-ink/30" />
      <span className="absolute bottom-3 right-3 w-3 h-3 border-r border-b border-ink/30" />

      <div className="absolute top-4 left-4 label">[ img ]</div>
      {meta && (
        <div className="absolute top-4 right-4 label">{meta}</div>
      )}
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
        <span className="font-mono text-[0.7rem] uppercase tracking-widest text-ink-soft">
          {label}
        </span>
        <span className="font-mono text-[0.7rem] uppercase tracking-widest text-ink-soft">
          drop image →
        </span>
      </div>
      {children}
    </div>
  );
}

function Resume() {
  const [lang, setLang] = useState<Lang>("da");
  const [time, setTime] = useState("");
  const t = T[lang];

  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat(lang === "da" ? "da-DK" : "en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Copenhagen",
        }).format(new Date()),
      );
    tick();
    const id = setInterval(tick, 1000 * 30);
    return () => clearInterval(id);
  }, [lang]);

  const skills = useMemo(() => SKILL_GROUPS[lang], [lang]);

  return (
    <main id="top" className="relative min-h-screen bg-paper text-ink">
      {/* NAV */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-paper/80 border-b border-rule/70">
        <div className="mx-auto max-w-[1480px] px-5 lg:px-10 h-14 flex items-center justify-between text-[0.78rem]">
          <a href="#top" className="font-mono tracking-widest uppercase font-medium">
            ◆ JMB / ’26
          </a>
          <nav className="hidden md:flex gap-6 font-mono uppercase tracking-[0.16em] text-ink-soft">
            {t.nav.map(([n, label, href]) => (
              <a
                key={href}
                href={`#${href}`}
                className="hover:text-ink transition-colors"
              >
                <span className="text-accent mr-1.5">{n}</span>
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline font-mono uppercase tracking-[0.16em] text-ink-soft">
              AAR · {time}
            </span>
            <div className="flex items-center rounded-full border border-ink/15 p-0.5 text-[0.7rem] font-mono uppercase tracking-wider">
              {(["da", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 rounded-full transition-colors ${
                    lang === l
                      ? "bg-ink text-paper"
                      : "text-ink-soft hover:text-ink"
                  }`}
                  aria-pressed={lang === l}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-[1480px] px-5 lg:px-10 pt-12 lg:pt-20 pb-16">
        <div className="animate-rise">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden border border-ink/15 bg-secondary">
              <svg className="absolute inset-0 w-full h-full opacity-[0.14] text-ink" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="hatch-sm" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hatch-sm)" />
              </svg>
              <span className="absolute inset-0 grid place-items-center font-mono text-[0.55rem] uppercase tracking-widest text-ink-soft">
                img
              </span>
            </div>
            <div className="label flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" />
              {t.statusDot}
            </div>
          </div>

          <h1 className="display-xxl text-[clamp(3.5rem,13vw,12rem)]">
            {t.name1}
            <br />
            {t.name2}
            <span className="caret" />
          </h1>
        </div>

        <div className="grid grid-cols-12 gap-5 mt-10 items-start">
          <p className="col-span-12 lg:col-span-7 display-xl text-[clamp(1.4rem,3vw,2.4rem)] text-ink-soft">
            {t.tagline}
          </p>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <p className="text-base leading-relaxed text-ink">
              {t.intro}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="chip"><span className="w-1.5 h-1.5 rounded-full bg-accent" />AI</span>
              <span className="chip">Web</span>
              <span className="chip">Content</span>
              <span className="chip">Automation</span>
            </div>
          </div>
        </div>

        {/* Meta strip */}
        <div className="rule mt-14 pt-5 grid grid-cols-2 md:grid-cols-4 gap-6 label">
          {[
            [t.metaBased, t.metaBasedV],
            [t.metaFocus, t.metaFocusV],
            [t.metaYears, t.metaYearsV],
            [t.metaStatus, t.metaStatusV],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="text-ink-soft">{k}</div>
              <div className="text-ink text-sm font-sans normal-case tracking-normal mt-1 font-medium">
                {v}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QUIET MARQUEE */}
      <div className="border-y border-rule/70 overflow-hidden py-4 bg-paper">
        <div className="flex whitespace-nowrap animate-marquee text-[1.4rem] md:text-[1.6rem] font-display font-medium tracking-tight text-ink-soft">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0">
              {t.marquee.map((w, j) => (
                <span key={j} className="px-6 flex items-center gap-6">
                  <span>{w}</span>
                  <span className="text-rule">/</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section
        id="about"
        className="mx-auto max-w-[1480px] px-5 lg:px-10 py-20 lg:py-28"
      >
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-3 label">
            {t.aboutLabel}
            <div className="mt-2 text-ink/70 font-sans text-xs normal-case tracking-normal">
              {t.aboutSub}
            </div>
          </div>
          <div className="col-span-12 md:col-span-7 md:col-start-5">
            <p className="display-xl text-[clamp(1.8rem,3.4vw,3rem)] tracking-tight text-ink">
              {t.aboutBody}
            </p>
            <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6">
              {t.aboutCards.map(([k, v]) => (
                <div key={k}>
                  <div className="label">{k}</div>
                  <p className="mt-1 text-sm text-ink font-medium">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WORK */}
      <section id="work" className="border-t border-rule/70">
        <div className="mx-auto max-w-[1480px] px-5 lg:px-10 py-20 lg:py-28">
          <div className="flex items-baseline justify-between mb-10 gap-6 flex-wrap">
            <h2 className="display-xxl text-5xl md:text-7xl">
              {t.workHeading1}
              <span className="font-italic font-normal text-accent">
                {t.workHeadingItalic}
              </span>
              .
            </h2>
            <span className="label">{t.workLabel}</span>
          </div>

          <ol className="divide-y divide-rule/70 border-y border-rule/70">
            {ROLES.map((r, i) => (
              <li
                key={i}
                className="group grid grid-cols-12 gap-4 py-7 lg:py-9 transition-colors hover:bg-secondary/70"
              >
                <div className="col-span-12 md:col-span-2 label pt-2 flex items-center gap-2">
                  {r.current && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  )}
                  {r.period}
                </div>
                <div className="col-span-12 md:col-span-4">
                  <h3 className="display-xl text-2xl md:text-3xl leading-tight">
                    {r.title[lang]}
                  </h3>
                  <p className="mt-1 text-ink-soft">{r.org}</p>
                </div>
                <ul className="col-span-12 md:col-span-5 text-sm leading-relaxed space-y-2 text-ink-soft">
                  {r.bullets[lang].map((b, j) => (
                    <li key={j} className="flex gap-3">
                      <span className="text-ink-soft/60 mt-1.5">—</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="col-span-12 md:col-span-1 flex md:justify-end items-start pt-2">
                  <span className="text-ink-soft text-xl transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5 group-hover:text-accent">
                    ↗
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* EDUCATION / PROJECTS */}
      <section
        id="projects"
        className="mx-auto max-w-[1480px] px-5 lg:px-10 py-20 lg:py-28"
      >
        <div className="grid grid-cols-12 gap-5 mb-12">
          <span className="col-span-12 md:col-span-3 label">{t.eduLabel}</span>
          <h2 className="col-span-12 md:col-span-9 display-xxl text-5xl md:text-7xl">
            {t.eduHeading1}
            <span className="font-italic font-normal text-accent">
              {t.eduHeadingItalic}
            </span>
            .
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-5 lg:gap-8">
          {/* UT Austin — hero card */}
          <article className="col-span-12 md:col-span-7 group">
            <ImagePlaceholder
              label="UT Austin · campus / semester abroad"
              meta="Spring 2026"
              tone="bg-secondary"
              className="h-[460px]"
            >
              <div className="absolute bottom-12 left-6 right-6 pointer-events-none">
                <div className="label">
                  {lang === "da" ? "Udveksling · 6. semester" : "Exchange · 6th semester"}
                </div>
                <h3 className="mt-2 display-xxl text-3xl md:text-5xl text-ink leading-[0.95]">
                  University of Texas
                  <br />
                  at <span className="font-italic text-accent">Austin</span>
                </h3>
              </div>
            </ImagePlaceholder>
            <p className="mt-4 text-sm text-ink-soft max-w-lg">
              {lang === "da"
                ? "Et semester ved UT Austin (Moody College of Communication / iSchool) — fag i HCI, data og digitale kulturer på tværs af amerikansk og europæisk perspektiv. Tilbage i Aarhus fra 12. maj 2026."
                : "A semester at UT Austin (Moody College of Communication / iSchool) — courses in HCI, data and digital cultures across a US/European lens. Back in Aarhus from May 12, 2026."}
            </p>
          </article>

          {/* MSc card */}
          <article className="col-span-12 md:col-span-5 group">
            <div className="relative h-[460px] bg-ink text-paper rounded-md overflow-hidden border border-ink/10 p-7 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="label text-paper/60">
                  {lang === "da" ? "Optaget · Kandidat" : "Admitted · MSc"}
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-paper/60">
                  2026 — 2028
                </span>
              </div>
              <div>
                <h3 className="display-xxl text-4xl md:text-5xl leading-[0.9]">
                  MSc Information Studies
                </h3>
                <p className="mt-3 text-paper/70">Aarhus Universitet</p>
                <p className="mt-4 text-sm text-paper/70 max-w-sm">
                  {lang === "da"
                    ? "Start september 2026. Fokus på AI, digitale systemer og brugernes hverdag."
                    : "Starts September 2026. Focus on AI, digital systems and everyday user practices."}
                </p>
              </div>
            </div>
          </article>

          {/* Austin street / second image */}
          <article className="col-span-12 md:col-span-5 group">
            <ImagePlaceholder
              label="Austin, TX · street view"
              meta="2026"
              tone="bg-accent/15"
              className="h-[360px]"
            >
              <div className="absolute bottom-12 left-6 right-6 pointer-events-none">
                <div className="label">
                  {lang === "da" ? "Snapshot" : "Snapshot"}
                </div>
                <h3 className="mt-2 display-xl text-2xl md:text-3xl text-ink">
                  {lang === "da"
                    ? "Et halvt år i Texas"
                    : "Half a year in Texas"}
                </h3>
              </div>
            </ImagePlaceholder>
            <p className="mt-4 text-sm text-ink-soft max-w-md">
              {lang === "da"
                ? "Bachelor 2023 – 2026 ved Aarhus Universitet. Sidste semester på udveksling — internationalt netværk, ny faglighed, ny kontekst."
                : "BSc 2023 – 2026 at Aarhus University. Last semester abroad — international network, new field, new context."}
            </p>
          </article>

          {/* Sol over Brabrand */}
          <article className="col-span-12 md:col-span-7 group">
            <ImagePlaceholder
              label="Sol over Brabrand · field study"
              meta={lang === "da" ? "4. sem. — Brugerdreven design" : "Sem. 4 — User-driven design"}
              tone="bg-secondary"
              className="h-[360px]"
            >
              <div className="absolute bottom-12 left-6 right-6 pointer-events-none">
                <div className="label">{lang === "da" ? "Udvalgt projekt" : "Selected project"}</div>
                <h3 className="mt-2 display-xl text-2xl md:text-3xl text-ink">
                  Sol over Brabrand — AI, hydroponi & energifællesskab
                </h3>
              </div>
            </ImagePlaceholder>
            <p className="mt-4 text-sm text-ink-soft max-w-md">
              {lang === "da"
                ? "Etnografisk feltstudie om AI-drevet hydroponisk drivhusteknologi i et lokalt energifællesskab — mikrofællesskaber, grøn omstilling og sociotekniske udfordringer."
                : "Ethnographic field study on AI-driven hydroponic greenhouse tech inside a local energy community — micro-communities, green transition and socio-technical tensions."}
            </p>
          </article>
        </div>
      </section>

      {/* SKILLS */}
      <section id="studio" className="border-t border-rule/70 bg-secondary/60">
        <div className="mx-auto max-w-[1480px] px-5 lg:px-10 py-20 lg:py-28 grid grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-5">
            <span className="label">{t.skillsLabel}</span>
            <h2 className="display-xxl text-5xl md:text-6xl mt-4">
              {t.skillsHeading1}
              <span className="font-italic font-normal text-accent">
                {t.skillsHeadingItalic}
              </span>
              .
            </h2>
            <p className="mt-6 text-ink-soft max-w-md">{t.skillsIntro}</p>
          </div>

          <div className="col-span-12 md:col-span-7 grid grid-cols-2 gap-x-8">
            {skills.map(([title, items]) => (
              <div key={title} className="py-6 border-t border-ink/15">
                <div className="label mb-4">{title}</div>
                <ul className="space-y-1.5">
                  {items.map((it) => (
                    <li
                      key={it}
                      className="display-xl text-lg md:text-xl leading-snug font-medium"
                    >
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="mx-auto max-w-[1480px] px-5 lg:px-10 py-24 lg:py-36"
      >
        <div className="grid grid-cols-12 gap-5 items-end">
          <div className="col-span-12 md:col-span-8">
            <span className="label">{t.contactLabel}</span>
            <h2 className="display-xxl text-[clamp(2.8rem,9vw,8rem)] mt-6">
              {t.contactHeading}
            </h2>
          </div>
          <div className="col-span-12 md:col-span-4 space-y-6">
            <a href="mailto:jakob.mb17@gmail.com" className="block group">
              <div className="label">{t.email}</div>
              <div className="display-xl text-xl md:text-2xl mt-1 group-hover:text-accent transition-colors break-all">
                jakob.mb17@gmail.com
              </div>
            </a>
            <a href="tel:+4553620051" className="block group">
              <div className="label">{t.phone}</div>
              <div className="display-xl text-xl md:text-2xl mt-1 group-hover:text-accent transition-colors">
                +45 53 62 00 51
              </div>
            </a>
            <div>
              <div className="label">{t.elsewhere}</div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 display-xl text-xl md:text-2xl">
                <a href="#" className="hover:text-accent transition-colors">
                  LinkedIn
                </a>
                <span className="text-ink-soft">·</span>
                <span>Aarhus C</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-rule/70">
        <div className="mx-auto max-w-[1480px] px-5 lg:px-10 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 label">
          <div>© 2026 — Jakob Munch-Brandt.</div>
          <div>{t.footer}</div>
          <a href="#top" className="hover:text-ink">
            {t.backTop}
          </a>
        </div>
      </footer>
    </main>
  );
}
