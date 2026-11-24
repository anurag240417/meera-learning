// Approved copy from the client's content and design specification. Keep wording in sync with it.

export const NAV_LINKS = [
  { href: '#programs', label: 'Programs' },
  { href: '#why-us', label: 'Why us' },
  { href: '#faq', label: 'FAQs' },
];

export const REGISTER_ANCHOR = '#register';

export const HERO = {
  eyebrow: 'Personal growth · Practical learning',
  headingLines: ['Small steps.', 'Remarkable growth.'],
  body: 'Guided learning journeys for curious students and early professionals ready to move forward.',
  cta: 'Reserve a free call',
  image: {
    src: '/assets/hero-learning.webp',
    width: 1080,
    height: 720,
    alt: 'Illustrated learning map listing four stages: explore your goal, build a weekly rhythm, practise with feedback and track your progress.',
  },
};

export const BENEFITS = {
  heading: 'A studio built for progress',
  intro: 'Clear goals. Helpful mentors. Real momentum.',
  items: [
    { title: 'Learn with direction', text: 'Set a specific goal and create a weekly plan.' },
    { title: 'Grow with guidance', text: 'Receive practical feedback from mentors.' },
    { title: 'Practice with purpose', text: 'Turn new ideas into confident action.' },
  ],
};

export const PROGRAMS = {
  heading: 'Choose your learning path',
  intro: 'Three focused programs. One clear next step.',
  items: [
    {
      id: 'foundations',
      title: 'Foundations Lab',
      meta: 'Four weeks · Beginners',
      text: 'Understand core study habits and build a practical learning plan.',
      image: {
        src: '/assets/mentor-circle.webp',
        alt: 'Illustration of three learners gathered together in a mentor circle.',
      },
    },
    {
      id: 'focus',
      title: 'Focus & Study Skills',
      meta: 'Three weeks · All levels',
      text: 'Plan, prioritize, and follow through on learning commitments.',
      image: {
        src: '/assets/learning-workspace.webp',
        alt: 'Illustration of a tidy study workspace with a planner and task list.',
      },
    },
    {
      id: 'career',
      title: 'Career Starter',
      meta: 'Six weeks · Early careers',
      text: 'Practice professional communication and career readiness.',
      image: {
        src: '/assets/career-path.webp',
        alt: 'Illustration of a rising bar chart representing career progress.',
      },
    },
  ],
};

export const REGISTRATION = {
  heading: 'Start with a conversation',
  intro: 'Tell us your learning goal and we will map a first step.',
  cta: 'Request a call',
  privacy: 'We use your details only to respond to this enquiry.',
  consentLabel: 'I agree to be contacted about programs.',
};

export const FAQ = {
  heading: 'Frequently asked questions',
  items: [
    { question: 'Who can join?', answer: 'Students and early-career learners can join.' },
    { question: 'Are sessions online?', answer: 'Remote learning sessions are available for all three programs.' },
    { question: 'What happens after I register?', answer: 'We will contact you to discuss your goals and suitable next steps.' },
  ],
};

export const FOOTER = {
  name: 'Meera Verma Learning Studio',
  tagline: 'Learn intentionally. Grow steadily.',
  year: 2026,
};
