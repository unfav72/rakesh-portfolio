/**
 * ---------------------------------------------------------------------------
 * SITE CONTENT
 * ---------------------------------------------------------------------------
 * Personal portfolio content for Rakesh.
 * ---------------------------------------------------------------------------
 */

export const site = {
  /** Shown letter-by-letter in the hero. */
  displayWord: 'PORTFOLIO',

  /** P-O-R-T-F-[O]-L-I-O */
  faceLetterIndex: 8,

  eyebrow: 'AI DEVELOPER / GRAPHIC DESIGNER /EDITOR',

  year: '2026',

  firstName: 'RAKESH',

  signatureName: 'RAKESH C',

  lastName: 'C',

  connect: {
    status: 'is available to talk',
    cta: "Let's connect",
    href: '#contact',
  },

  intro: {
    heading: 'HELLO',
    lede: "Hi, I'm RAKESH.",
    paragraphs: [
      'I am a B.Tech AI student who enjoys building intelligent digital experiences and creative visual content.',
      'I work across AI development, web development, graphic design, and video editing to turn ideas into practical and engaging projects.',
      'Right now, I am focused on building AI-powered products, exploring new technologies, and creating digital experiences that are simple, useful, and impactful.',
    ],
  },

  education: {
    heading: 'EDUCATION',

    items: [
      {
        degree: 'Bachelor of Technology in Artificial Intelligence',
        detail: 'SRM Institute of Science and Technology | 2024 – Present',
      },
    ],
  },

  skills: {
    heading: 'SKILLS',

    items: [
      {
        label: 'Photoshop',
        short: 'Ps',
        src: '/assets/skills/photoshop.png',
        scale: 1,
      },

      {
        label: 'Premiere Pro',
        short: 'Pr',
        src: '/assets/skills/premiere-pro.png',
        scale: 1,
      },

      {
        label: 'Python',
        short: 'Py',
        src: '/assets/skills/python.png',
        scale: 0.96,
      },

      {
        label: 'HTML',
        short: 'html',
        src: '/assets/skills/html.png',
        scale: 1,
      },

      {
        label: 'CSS',
        short: 'css',
        src: '/assets/skills/css.png',
        scale: 1,
      },

      {
        label: 'Adobe Illustrator',
        short: 'Ai',
        src: '/assets/skills/ai.png',
        scale: 1.06,
      },
    ] as {
      label: string
      short: string
      src: string | null
      scale: number
    }[],
  },

  studio: {
    heading: 'THE STU',

    items: [
      {
        quote: "You can't compete with someone who's having fun.",
        author: 'Tiago Forte',
        rotation: -5,
        drop: 0,
        shade: 0.2,
        skew: -0.9,
        indent: 1,
        objectPosition: '50% 50%',
        href: null as string | null,
      },

      {
        quote: 'He who is back again, never quit, quick to sail.',
        author: 'Lil Yachty',
        rotation: 1.2,
        drop: 11,
        shade: 0.6,
        skew: 0.7,
        indent: 0,
        objectPosition: '56% 38%',
        href: null as string | null,
      },

      {
        quote:
          'I know of no better life purpose than to perish in attempting the great and the impossible.',
        author: 'Friedrich Nietzsche',
        rotation: 4,
        drop: 3,
        shade: 0.35,
        skew: -0.5,
        indent: 2,
        objectPosition: '50% 50%',
        href: null as string | null,
      },
    ],
  },

  experience: {
    heading: 'INTERNSHIP',

    items: [
      {
        period: 'December 2025 - January 2026',
        role: 'Machine Learning Intern',
        company: 'Tech Volt Pvt Ltd , Coimbatore',
      },

      {
        period: '2025 – Present',
        role: 'Graphic Designer & Video Editor',
        company: 'Freelance',
      },
    ],
  },

  footer: {
    heading: "Let's connect",

    acknowledged: 'See you there',

    sub: 'Have an idea, a project, or simply want to say hello?',

    href: 'mailto:chinnarocky727@gmail.com.com',

    marquee: ['RAKESH', 'AI DEVELOPER', 'CREATIVE'],

    links: [
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/rakesh-chinnathurai-269933358/' as string | null,
      },
      {
        label: 'GitHub',
        href: 'https://github.com/unfav72' as string | null,
      },
      {
        label: 'Email',
        href: 'mailto:chinnarocky727@gmail.com' as string | null,
      },
      {
        label: 'Instagram',
        href: 'https://www.instagram.com/ft.rxcky' as string | null,
      },



    ],
  },
} as const

export type Site = typeof site