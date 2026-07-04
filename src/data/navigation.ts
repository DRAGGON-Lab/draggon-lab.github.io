export type MainNavItem = {
  href: string;
  label: string;
  description: string;
  cta?: boolean;
};

export const mainNav: MainNavItem[] = [
  { href: '/research', label: 'Research', description: 'Explore the DRAGGON Lab research vision.' },
  { href: '/tools', label: 'Tools', description: 'Browse the platform ecosystem.' },
  {
    href: '/publications',
    label: 'Publications',
    description: 'Read selected papers and scholarly outputs.',
  },
  {
    href: '/lab-notes',
    label: 'Lab Notes',
    description: 'Follow research logs, tutorials, and updates.',
  },
  { href: '/teaching', label: 'Teaching', description: 'Explore open teaching resources.' },
  { href: '/people', label: 'People', description: 'Meet the lab.' },
  {
    href: '/join-collaborate',
    label: 'Join / Collaborate',
    description: 'Find ways to work with DRAGGON Lab.',
    cta: true,
  },
];
